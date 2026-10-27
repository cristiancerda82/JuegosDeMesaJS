import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_SKAT_POR_DEFECTO,
  crearAzar,
  iaSkatBasica,
  skat,
  type AccionSkat,
  type EstadoSkat,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-skat').click();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoSkat {
  const r = skat.crear(CONFIG_SKAT_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Juegan las IAs (la normal es la básica y determinista) hasta que le toca al asiento 0. */
function avanzar(e: EstadoSkat): EstadoSkat {
  while (e.turno !== 0 && skat.resultado(e) === null) {
    const { accion } = iaSkatBasica.decidir(
      skat.vistaDe(e, e.turno),
      skat.accionesLegales(e, e.turno),
      crearAzar('x'),
    );
    e = skat.transicion(e, e.turno, accion);
  }
  return e;
}

/**
 * Una semilla en la que el jugador gana la subasta aceptando y pujando siempre que puede, y las
 * acciones de la subasta que hace hasta entonces.
 */
function semillaSolista(): { semilla: string; mias: AccionSkat['tipo'][] } {
  for (let i = 0; i < 500; i++) {
    const semilla = `solista-${i}`;
    let e = avanzar(crear(semilla));
    const mias: AccionSkat['tipo'][] = [];
    while (e.fase === 'subasta' && e.repartidor === 2 && e.resultadosManos.length === 0) {
      const legales = skat.accionesLegales(e, 0).map((a) => a.tipo);
      const tipo = legales.includes('aceptar')
        ? 'aceptar'
        : legales.includes('pujar')
          ? 'pujar'
          : 'pasar';
      mias.push(tipo);
      e = avanzar(skat.transicion(e, 0, { tipo } as AccionSkat));
    }
    if (e.fase === 'skat' && e.solista === 0 && e.repartidor === 2) return { semilla, mias };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

async function subastar(page: Page, mias: readonly AccionSkat['tipo'][]) {
  const ids: Record<string, string> = { aceptar: 'aceptar', pujar: 'pujar', pasar: 'paso' };
  for (const tipo of mias) await page.getByTestId(ids[tipo]!).click({ timeout: 15_000 });
}

async function tocar(page: Page) {
  await page.locator('.carta-mano.jugable').first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Subasta, Skat y declaración ──────────────────────────────────────────────

test('pasar en la subasta', async ({ page }) => {
  await empezar(page, 'semilla=skat-subasta');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await page.getByTestId('paso').waitFor({ timeout: 15_000 });
  await page.screenshot({ path: `test-results/skat-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('paso').click();
  await expect(page.getByTestId('paso')).toHaveCount(0);
});

test('ganar la subasta, coger el Skat, descartarse, declarar y jugar', async ({ page }) => {
  const { semilla, mias } = semillaSolista();
  await empezar(page, `semilla=${semilla}`);
  await subastar(page, mias);
  await page.getByTestId('coger-skat').click({ timeout: 15_000 });
  await expect(page.locator('.carta-mano')).toHaveCount(12);
  await expect(page.getByTestId('aviso')).toContainText('Descártate');
  await tocar(page);
  await expect(page.locator('.carta-mano')).toHaveCount(11);
  await tocar(page);
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await expect(page.getByTestId('mi-skat')).toBeVisible();
  await page.screenshot({ path: `test-results/skat-declarar-${page.viewportSize()!.width}.png` });
  await page.getByTestId('declarar-grand').click();
  await expect(page.getByTestId('juego')).toContainText('Juegas Grand');
  // Sale Vorhand, que es el jugador.
  await tocar(page);
  await expect(page.locator('.carta-mano')).toHaveCount(9);
});

test('jugar de mano con un anuncio', async ({ page }) => {
  const { semilla, mias } = semillaSolista();
  await empezar(page, `semilla=${semilla}`);
  await subastar(page, mias);
  await page.getByTestId('de-mano').click({ timeout: 15_000 });
  await page.getByTestId('anuncio-schneider').click();
  // Con schneider no se puede jugar Nulo.
  await expect(page.getByTestId('declarar-nulo')).toBeDisabled();
  await page.getByTestId('declarar-treboles').click();
  await expect(page.getByTestId('juego')).toContainText('de mano, schneider anunciado');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Skat completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=skat-completa');
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
      await expect(page.getByTestId('resumen-skat')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/skat-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('paso').isVisible()) {
      await page
        .getByTestId('paso')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else {
      await tocar(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos de la partida');
  await expect(fin.getByTestId('resumen-skat')).toBeVisible();
  await page.screenshot({ path: `test-results/skat-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Skat se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=skat-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Skat entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  const { semilla, mias } = semillaSolista();
  await empezar(page, `semilla=${semilla}`);
  await subastar(page, mias);
  await page.getByTestId('de-mano').click({ timeout: 15_000 });
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/skat-360.png' });
});
