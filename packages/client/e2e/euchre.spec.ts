import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_EUCHRE_POR_DEFECTO,
  crearAzar,
  euchre,
  iaEuchreBasica,
  type AccionEuchre,
  type EstadoEuchre,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-euchre').click();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoEuchre {
  const r = euchre.crear(CONFIG_EUCHRE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Juegan las IAs (la normal es la básica y determinista) hasta que le toca al asiento 0. */
function avanzar(e: EstadoEuchre): EstadoEuchre {
  while (e.turno !== 0 && euchre.resultado(e) === null) {
    const v = euchre.vistaDe(e, e.turno);
    const { accion } = iaEuchreBasica.decidir(
      v,
      euchre.accionesLegales(e, e.turno),
      crearAzar('x'),
    );
    e = euchre.transicion(e, e.turno, accion);
  }
  return e;
}

/** La primera semilla en la que, haciendo el jugador `mias`, se llega a lo que pide `vale`. */
function semillaCon(
  prefijo: string,
  mias: readonly AccionEuchre[],
  vale: (e: EstadoEuchre) => boolean,
): string {
  const legal = (e: EstadoEuchre, a: AccionEuchre) =>
    euchre.accionesLegales(e, 0).some((x) => JSON.stringify(x) === JSON.stringify(a));
  busca: for (let i = 0; i < 500; i++) {
    let e = avanzar(crear(`${prefijo}-${i}`));
    for (const a of mias) {
      if (!legal(e, a)) continue busca;
      e = avanzar(euchre.transicion(e, 0, a));
    }
    if (vale(e)) return `${prefijo}-${i}`;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

async function jugarCarta(page: Page) {
  await page.locator('.carta-mano.jugable').first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Elegir el triunfo, descartarse y jugar ───────────────────────────────────

test('pedir la carta vuelta y jugar la primera baza', async ({ page }) => {
  await empezar(page, 'semilla=euchre-pedir');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await expect(page.getByTestId('triunfo')).toHaveText('Se elige el triunfo');
  await page.screenshot({ path: `test-results/euchre-mesa-${page.viewportSize()!.width}.png` });
  const vuelta = crear('euchre-pedir').cartaVuelta.split('-')[0]!;
  await page.getByTestId('pedir').click();
  await expect(page.getByTestId('triunfo')).toContainText(
    { picas: 'picas', corazones: 'corazones', diamantes: 'diamantes', treboles: 'tréboles' }[
      vuelta
    ]!,
  );
  await expect(page.getByTestId('elige')).toHaveText('Eliges tú');
  // El repartidor (un rival) se descarta y sale el jugador.
  await expect(page.locator('.carta-mano.jugable')).not.toHaveCount(0, { timeout: 15_000 });
  await jugarCarta(page);
  await expect(page.locator('.carta-mano')).toHaveCount(4);
});

test('nombrar un palo en la segunda vuelta', async ({ page }) => {
  const semilla = semillaCon('segunda', [{ tipo: 'pasar' }], (e) => e.fase === 'segunda');
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId('paso').click();
  const vuelta = crear(semilla).cartaVuelta.split('-')[0]!;
  const otro = ['picas', 'corazones', 'diamantes', 'treboles'].find((p) => p !== vuelta)!;
  await expect(page.getByTestId(`nombrar-${vuelta}`)).toHaveCount(0, { timeout: 15_000 });
  await page.getByTestId(`nombrar-${otro}`).click();
  await expect(page.getByTestId('triunfo')).toContainText(
    { picas: 'picas', corazones: 'corazones', diamantes: 'diamantes', treboles: 'tréboles' }[otro]!,
  );
});

test('descartarse como repartidor', async ({ page }) => {
  // El jugador pasa dos veces, la mano se anula, reparte él y alguien pide el triunfo.
  const semilla = semillaCon(
    'descarte',
    [{ tipo: 'pasar' }, { tipo: 'pasar' }],
    (e) => e.repartidor === 0 && e.fase === 'descarte' && e.turno === 0,
  );
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId('paso').click();
  await page.getByTestId('paso').click({ timeout: 15_000 });
  await expect(page.locator('.carta-mano')).toHaveCount(6, { timeout: 15_000 });
  await jugarCarta(page);
  await expect(page.locator('.carta-mano')).toHaveCount(5);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Euchre completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=euchre-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 2_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-euchre')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/euchre-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('pedir').isVisible()) {
      await page
        .getByTestId('pedir')
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
  await expect(fin).toContainText('Puntos (a 10)');
  await expect(fin.getByTestId('resumen-euchre')).toBeVisible();
  await page.screenshot({ path: `test-results/euchre-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Euchre se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=euchre-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Euchre entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await page.getByTestId('paso').waitFor({ timeout: 30_000 });
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/euchre-360.png' });
});
