import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import {
  capturasCuarenta,
  CONFIG_CUARENTA_POR_DEFECTO,
  crearAzar,
  cuarenta,
  iaCuarentaBasica,
  type EstadoCuarenta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarCuarenta(page: Page, query: string, opciones: { cuatro?: boolean } = {}) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'cuarenta');
  if (opciones.cuatro) await page.getByTestId('cuarenta-cuatro').check();
  await page.getByTestId('empezar').click();
}

/** Toca el fondo de la mesa (el centro del borde superior, libre de cartas). */
async function tocarMesa(page: Page) {
  const mesa = page.getByTestId('mesa');
  const caja = (await mesa.boundingBox())!;
  await mesa.click({ position: { x: caja.width / 2, y: 4 } });
}

/**
 * Busca una semilla en la que el jugador deja su primera carta, la IA normal deja otra sin
 * capturar y entonces el jugador tiene una carta con la que puede capturar.
 */
function semillaCaptura() {
  for (let i = 0; i < 2_000; i++) {
    const semilla = `cuarenta-${i}`;
    const r = cuarenta.crear(CONFIG_CUARENTA_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    const primera = r.valor.manos[0]![0]!;
    let e: EstadoCuarenta = cuarenta.transicion(r.valor, 0, {
      tipo: 'jugar',
      carta: primera,
      captura: [],
    });
    const ia = iaCuarentaBasica.decidir(
      cuarenta.vistaDe(e, 1),
      cuarenta.accionesLegales(e, 1),
      crearAzar('x'),
    ).accion;
    if (ia.captura.length > 0) continue;
    e = cuarenta.transicion(e, 1, ia);
    const carta = e.manos[0]!.find((c) => capturasCuarenta(e.mesa, c).length > 0);
    if (carta) return { semilla, primera, carta, captura: capturasCuarenta(e.mesa, carta)[0]! };
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

/** Juega la partida entera: carta jugable → mesa, la primera captura (o dejarla) y cada mano. */
async function jugarCuarenta(page: Page) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  const selector = page.getByTestId('opciones-captura');
  let manos = 0;
  for (let jugadas = 0; jugadas < 1_500; jugadas++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) return manos;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-cuarenta')).toBeVisible();
      if (manos++ === 0)
        await page.screenshot({
          path: `test-results/cuarenta-panel-${page.viewportSize()!.width}.png`,
        });
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    await page
      .locator('.carta-mano.jugable')
      .first()
      .click(ESQUINA)
      .catch(() => {});
    await tocarMesa(page).catch(() => {});
    if (await selector.isVisible().catch(() => false)) {
      const captura = page.getByTestId('opcion-0');
      await (
        (await captura.isVisible().catch(() => false)) ? captura : page.getByTestId('opcion-dejar')
      )
        .click({ timeout: 5_000 })
        .catch(() => {});
    }
  }
  throw new Error('La partida de Cuarenta no terminó');
}

// ── Dejar y capturar ─────────────────────────────────────────────────────────

test('dejar una carta en la mesa y elegir después qué se lleva', async ({ page }) => {
  const caso = semillaCaptura();
  await empezarCuarenta(page, `rapido&semilla=${caso.semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  // Con la mesa vacía no hay nada que elegir: la carta se queda en la mesa.
  await page.locator(`[data-testid="mano"] [data-carta="${caso.primera}"]`).click(ESQUINA);
  await tocarMesa(page);
  await expect(page.getByTestId(`mesa-${caso.primera}`)).toBeVisible();
  // La IA deja otra; el jugador elige entre capturar o dejar.
  await expect(page.getByTestId('mesa').locator('.carta-mesa')).toHaveCount(2);
  await expect(page.locator('.carta-mano.jugable').first()).toBeVisible();
  await page.locator(`[data-testid="mano"] [data-carta="${caso.carta}"]`).click(ESQUINA);
  await tocarMesa(page);
  await expect(page.getByTestId('opciones-captura')).toBeVisible();
  await expect(page.getByTestId('opcion-dejar')).toBeVisible();
  await page.screenshot({
    path: `test-results/cuarenta-opciones-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('opcion-0').click();
  for (const c of caso.captura) await expect(page.getByTestId(`mesa-${c}`)).toHaveCount(0);
  await expect(page.locator('.carta-mano')).toHaveCount(3);
});

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Cuarenta completa contra la IA con 2 jugadores', async ({ page }) => {
  test.setTimeout(900_000);
  await empezarCuarenta(page, 'rapido&semilla=cuarenta-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await jugarCuarenta(page);
  const fin = page.getByTestId('fin');
  await expect(fin.getByTestId('resumen-cuarenta')).toBeVisible();
  const total = Math.max(
    Number(await fin.getByTestId('total-0').textContent()),
    Number(await fin.getByTestId('total-1').textContent()),
  );
  expect(total).toBeGreaterThanOrEqual(40);
  await page.screenshot({ path: `test-results/cuarenta-fin-${page.viewportSize()!.width}.png` });
});

test('partida de Cuarenta completa contra la IA con 4 jugadores', async ({ page }) => {
  test.setTimeout(900_000);
  await empezarCuarenta(page, 'rapido&semilla=cuarenta4-e2e', { cuatro: true });
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await page.screenshot({ path: `test-results/cuarenta-mesa4-${page.viewportSize()!.width}.png` });
  await jugarCuarenta(page);
  await expect(page.getByTestId('fin')).toBeVisible();
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Cuarenta se continúa con la misma mano', async ({ page }) => {
  await empezarCuarenta(page, 'semilla=cuarenta-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const antes = await page
    .locator('[data-testid="mano"] .carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

for (const cuatro of [false, true]) {
  test(`el Cuarenta entra en 360 × 640 sin scroll horizontal${cuatro ? ' (con 4)' : ''}`, async ({
    page,
  }) => {
    test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
    await empezarCuarenta(page, 'semilla=pequena', { cuatro });
    await expect(page.locator('.carta-mano').first()).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    if (cuatro)
      for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
    await expect(page.locator('.carta-mano').first()).toBeInViewport({ ratio: 0.9 });
    await expect(page.locator('.carta-mano').last()).toBeInViewport({ ratio: 0.9 });
    await page.screenshot({ path: `test-results/cuarenta-360${cuatro ? '-4' : ''}.png` });
  });
}
