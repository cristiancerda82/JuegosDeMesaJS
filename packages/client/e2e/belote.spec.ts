import { expect, test, type Page } from '@playwright/test';
import {
  belote,
  CONFIG_BELOTE_POR_DEFECTO,
  crearAzar,
  iaBeloteBasica,
  type AccionBelote,
  type EstadoBelote,
  type IdCarta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

const NOMBRE_PALO: Record<string, string> = {
  picas: 'picas',
  corazones: 'corazones',
  diamantes: 'diamantes',
  treboles: 'tréboles',
};

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-belote').click();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoBelote {
  const r = belote.crear(CONFIG_BELOTE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Juegan las IAs (la normal es la básica y determinista) hasta que le toca al asiento 0. */
function avanzar(e: EstadoBelote): EstadoBelote {
  while (e.turno !== 0 && belote.resultado(e) === null) {
    const { accion } = iaBeloteBasica.decidir(
      belote.vistaDe(e, e.turno),
      belote.accionesLegales(e, e.turno),
      crearAzar('x'),
    );
    e = belote.transicion(e, e.turno, accion);
  }
  return e;
}

/** La primera semilla en la que, haciendo el jugador `mias`, se llega a lo que pide `vale`. */
function semillaCon(
  prefijo: string,
  mias: (e: EstadoBelote) => readonly AccionBelote[],
  vale: (e: EstadoBelote) => boolean,
): { semilla: string; final: EstadoBelote } {
  const legal = (e: EstadoBelote, a: AccionBelote) =>
    belote.accionesLegales(e, 0).some((x) => JSON.stringify(x) === JSON.stringify(a));
  busca: for (let i = 0; i < 500; i++) {
    const inicio = avanzar(crear(`${prefijo}-${i}`));
    let e = inicio;
    for (const a of mias(inicio)) {
      if (!legal(e, a)) continue busca;
      e = avanzar(belote.transicion(e, 0, a));
    }
    if (vale(e)) return { semilla: `${prefijo}-${i}`, final: e };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

async function jugarCarta(page: Page, carta?: IdCarta) {
  const sel = carta ? `.carta-mano[data-carta="${carta}"]` : '.carta-mano.jugable';
  await page.locator(sel).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Elegir el triunfo y jugar ────────────────────────────────────────────────

test('tomar la carta vuelta y jugar la primera baza', async ({ page }) => {
  await empezar(page, 'semilla=belote-tomar');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await expect(page.getByTestId('triunfo')).toHaveText('Se elige el triunfo');
  await page.screenshot({ path: `test-results/belote-mesa-${page.viewportSize()!.width}.png` });
  const vuelta = crear('belote-tomar').cartaVuelta;
  await page.getByTestId('tomar').click();
  await expect(page.getByTestId('triunfo')).toContainText(NOMBRE_PALO[vuelta.split('-')[0]!]!);
  await expect(page.getByTestId('elige')).toHaveText('Eliges tú');
  await expect(page.locator('.carta-mano')).toHaveCount(8);
  await expect(page.locator(`.carta-mano[data-carta="${vuelta}"]`)).toBeVisible();
  // Sale el jugador, a la izquierda del repartidor.
  await expect(page.locator('.carta-mano.jugable')).toHaveCount(8);
  await jugarCarta(page);
  await expect(page.locator('.carta-mano')).toHaveCount(7);
});

test('nombrar un palo en la segunda vuelta', async ({ page }) => {
  const { semilla } = semillaCon(
    'segunda',
    () => [{ tipo: 'pasar' }],
    (e) => e.fase === 'segunda',
  );
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId('paso').click();
  const vuelta = crear(semilla).cartaVuelta.split('-')[0]!;
  const otro = ['picas', 'corazones', 'diamantes', 'treboles'].find((p) => p !== vuelta)!;
  await page.getByTestId(`nombrar-${otro}`).click({ timeout: 15_000 });
  await expect(page.getByTestId(`nombrar-${vuelta}`)).toHaveCount(0);
  await expect(page.getByTestId('triunfo')).toContainText(NOMBRE_PALO[otro]!);
  await expect(page.locator('.carta-mano')).toHaveCount(8);
});

test('solo se pueden jugar las cartas que permiten las reglas', async ({ page }) => {
  // Toma, sale con una carta y en la segunda baza tiene que seguir, montar o fallar.
  const { semilla, final } = semillaCon(
    'permitidas',
    (inicio) => {
      if (!belote.accionesLegales(inicio, 0).some((a) => a.tipo === 'tomar')) return [];
      const tomado = belote.transicion(inicio, 0, { tipo: 'tomar' });
      return [{ tipo: 'tomar' }, belote.accionesLegales(tomado, 0)[0]!];
    },
    (e) =>
      e.fase === 'bazas' &&
      e.turno === 0 &&
      e.mesa.length > 0 &&
      belote.accionesLegales(e, 0).length < e.manos[0]!.length,
  );
  const primera = belote.accionesLegales(
    belote.transicion(avanzar(crear(semilla)), 0, { tipo: 'tomar' }),
    0,
  )[0]!;
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId('tomar').click();
  await jugarCarta(page, primera.tipo === 'jugar' ? primera.carta : undefined);
  const legales = belote.accionesLegales(final, 0);
  await expect(page.locator('.carta-mano.jugable')).toHaveCount(legales.length, {
    timeout: 15_000,
  });
  for (const a of legales) {
    if (a.tipo === 'jugar') {
      await expect(page.locator(`.carta-mano[data-carta="${a.carta}"]`)).toHaveClass(/jugable/);
    }
  }
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Belote completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=belote-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-belote')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/belote-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('tomar').isVisible()) {
      await page
        .getByTestId('tomar')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else if (await page.getByTestId('paso').isVisible()) {
      await page
        .getByTestId('paso')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else {
      await jugarCarta(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos (a 501)');
  await expect(fin.getByTestId('resumen-belote')).toBeVisible();
  await page.screenshot({ path: `test-results/belote-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Belote se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=belote-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Belote entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await page.getByTestId('paso').waitFor({ timeout: 30_000 });
  await page.getByTestId('tomar').click();
  await expect(page.locator('.carta-mano')).toHaveCount(8);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/belote-360.png' });
});
