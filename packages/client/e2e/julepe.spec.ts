import { expect, test, type Page } from '@playwright/test';
import type { IdCarta } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarJulepe(
  page: Page,
  query: string,
  opciones: { jugadores?: number; manos?: number } = {},
) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-julepe').click();
  if (opciones.jugadores)
    await page.getByLabel(`${opciones.jugadores} jugadores`, { exact: true }).check();
  if (opciones.manos) await page.getByLabel(`${opciones.manos} manos`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

/** Juega la carta jugable menor de la mano. */
async function jugarCarta(page: Page) {
  const jugables = (await page
    .locator('.carta-mano.jugable')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')!))) as IdCarta[];
  if (jugables.length === 0) return;
  const carta = [...jugables].sort()[0]!;
  await page.locator(`[data-testid="mano-${carta}"]`).click(ESQUINA);
  await page.getByTestId('mesa').click();
}

const ESPERA =
  '.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"], [data-testid="julepe-jugar"], [data-testid="panel-descarte"]';

/**
 * Juega desde la UI: entra en todas las manos, no cambia cartas, juega la carta jugable menor y
 * cierra el resumen de cada mano. Para cuando `parar` se cumple.
 */
async function jugarJulepe(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let jugadas = 0; jugadas < 1500; jugadas++) {
    await page.locator(ESPERA).first().waitFor();
    if ((await fin.isVisible()) || (await parar())) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-julepe')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await page.getByTestId('panel-descarte').isVisible()) {
      await page.getByTestId('descartar').click();
      continue;
    }
    const juego = page.getByTestId('julepe-jugar');
    if (await juego.isVisible()) {
      await juego.click();
      continue;
    }
    await jugarCarta(page);
  }
  throw new Error('La partida de Julepe no terminó');
}

// ── Una mano ─────────────────────────────────────────────────────────────────

test('jugar la mano, cambiar dos cartas y llegar al resumen', async ({ page }) => {
  await empezarJulepe(page, 'rapido&semilla=julepe-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await expect(page.getByTestId('bote')).toHaveText('Bote: 10');
  await expect(page.getByTestId('mano-julepe')).toHaveText('Mano 1 de 12');
  // La carta de triunfo del repartidor (el asiento 3) está a la vista.
  await expect(page.getByTestId('asiento-3').locator('[data-carta]')).toHaveCount(1);

  // El jugador es mano: decide el primero.
  await expect(page.getByTestId('julepe-pasar')).toBeVisible();
  await page.getByTestId('julepe-jugar').click();
  await expect(page.getByTestId('detalle-propio')).toContainText('juega');

  // Descarta dos cartas cuando le toca.
  const panelDescarte = page.getByTestId('panel-descarte');
  await panelDescarte.waitFor();
  const mano = await page
    .locator('[data-testid^="descarte-"]')
    .evaluateAll((els) =>
      els.map((el) => el.getAttribute('data-testid')!.slice('descarte-'.length)),
    );
  await page.getByTestId(`descarte-${mano[0]}`).click();
  await page.getByTestId(`descarte-${mano[1]}`).click();
  await expect(page.getByTestId('descartar')).toHaveText('Cambiar 2');
  await page.screenshot({ path: 'test-results/julepe-descarte.png' });
  await page.getByTestId('descartar').click();
  await expect(panelDescarte).toBeHidden();
  const nuevas = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')));
  expect(nuevas).toHaveLength(5);
  expect(nuevas).not.toContain(mano[0]);
  expect(nuevas).not.toContain(mano[1]);

  const panel = page.getByTestId('panel-mano');
  await jugarJulepe(page, () => panel.isVisible());
  await expect(panel.getByTestId('resumen-julepe')).toBeVisible();
  await page.screenshot({ path: 'test-results/julepe-resumen.png' });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('mano-julepe')).toHaveText('Mano 2 de 12');
});

test('pasar la mano: el jugador no juega cartas', async ({ page }) => {
  await empezarJulepe(page, 'rapido&semilla=julepe-paso');
  await page.getByTestId('julepe-pasar').click();
  await expect(page.getByTestId('detalle-propio')).toContainText('pasa');
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible({ timeout: 30_000 });
  await expect(panel.getByTestId('fila-0')).toContainText('pasó');
});

// ── Partidas ─────────────────────────────────────────────────────────────────

test('partida de Julepe completa de 6 manos', async ({ page }) => {
  test.setTimeout(240_000);
  await empezarJulepe(page, 'rapido&semilla=julepe-completa', { manos: 6 });
  await jugarJulepe(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin.getByTestId('fichas-0')).toBeVisible();
});

test('Julepe de 5 jugadores', async ({ page }) => {
  await empezarJulepe(page, 'rapido&semilla=julepe-5', { jugadores: 5 });
  for (let a = 1; a <= 4; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  const panel = page.getByTestId('panel-mano');
  await jugarJulepe(page, () => panel.isVisible());
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Julepe se continúa en el mismo punto', async ({ page }) => {
  await empezarJulepe(page, 'rapido&semilla=julepe-retomar');
  await page.getByTestId('julepe-jugar').click();
  await page.getByTestId('panel-descarte').waitFor();
  const mano = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByTestId('panel-descarte').waitFor();
  expect(
    await page
      .locator('.carta-mano')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta'))),
  ).toEqual(mano);
});

test('la mesa del Julepe de 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarJulepe(page, 'semilla=pequena', { jugadores: 6 });
  await page.getByTestId('julepe-jugar').waitFor();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 5; a++) {
    const caja = (await page.getByTestId(`asiento-${a}`).boundingBox())!;
    expect(caja.x).toBeGreaterThanOrEqual(0);
    expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  }
  const cartas = page.locator('.carta-mano');
  await expect(cartas).toHaveCount(5);
  await page.screenshot({ path: 'test-results/julepe6-360.png' });
  // Una baza de 6 en la mesa también cabe.
  const panel = page.getByTestId('panel-mano');
  await page.getByTestId('julepe-jugar').click();
  await jugarJulepe(
    page,
    async () =>
      (await page.locator('[data-testid="mesa"] .jugada').count()) >= 4 || panel.isVisible(),
  );
  await page.screenshot({ path: 'test-results/julepe6-baza-360.png' });
  const tras = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(tras).toBeLessThanOrEqual(anchos.ventana);
});
