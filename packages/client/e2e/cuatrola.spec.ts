import { expect, test, type Page } from '@playwright/test';
import type { IdCarta } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarCuatrola(page: Page, query: string, manos?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-cuatrola').click();
  if (manos) await page.getByLabel(`${manos} manos`, { exact: true }).check();
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

const ESPERA = [
  '.carta-mano.jugable',
  '[data-testid="fin"]',
  '[data-testid="panel-mano"]',
  '[data-testid="panel-subasta"]',
  '[data-testid^="triunfo-"]',
  '[data-testid^="llamar-"]',
].join(', ');

/**
 * Juega desde la UI: pasa en la subasta, elige el primer palo y la primera carta si gana una,
 * juega la carta jugable menor y cierra el resumen de cada mano. Para cuando `parar` se cumple.
 */
async function jugarCuatrola(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let jugadas = 0; jugadas < 1500; jugadas++) {
    await page.locator(ESPERA).first().waitFor({ timeout: 30_000 });
    if ((await fin.isVisible()) || (await parar())) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-cuatrola')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await page.getByTestId('panel-subasta').isVisible()) {
      await page.getByTestId('pasar').click();
      continue;
    }
    const eleccion = page.locator('[data-testid^="triunfo-"], [data-testid^="llamar-"]').first();
    if (await eleccion.isVisible()) {
      await eleccion.click();
      continue;
    }
    await jugarCarta(page);
  }
  throw new Error('La partida de Cuatrola no terminó');
}

// ── Subasta, triunfo y rey ───────────────────────────────────────────────────

test('jugar solo: subasta, triunfo y bazas hasta el resumen', async ({ page }) => {
  await empezarCuatrola(page, 'rapido&semilla=cuatrola-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await expect(page.getByTestId('mano-cuatrola')).toHaveText('Mano 1 de 8');

  // El jugador es mano: habla el primero.
  const subasta = page.getByTestId('panel-subasta');
  await expect(subasta).toBeVisible();
  await expect(page.getByTestId('pujar-rey')).toBeVisible();
  await page.screenshot({ path: 'test-results/cuatrola-subasta.png' });
  await page.getByTestId('pujar-solo').click();
  await expect(subasta).toBeHidden();

  // «Solo» cierra la subasta: elige el triunfo y no llama a nadie.
  await page.getByTestId('triunfo-bastos').click();
  await expect(page.getByTestId('triunfo')).toContainText('bastos');
  await expect(page.getByTestId('modalidad')).toContainText('Juegas solo');
  await expect(page.getByTestId('llamada')).toHaveCount(0);

  const panel = page.getByTestId('panel-mano');
  await jugarCuatrola(page, () => panel.isVisible());
  await expect(panel.getByTestId('gana')).toContainText(/Ganas|Pierdes/);
  await page.screenshot({ path: 'test-results/cuatrola-resumen.png' });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('mano-cuatrola')).toHaveText('Mano 2 de 8');
});

test('jugar con rey: elegir el triunfo y llamar un rey', async ({ page }) => {
  await empezarCuatrola(page, 'semilla=cuatrola-rey');
  await page.getByTestId('pujar-rey').click();
  // Si nadie sube a solo, el jugador elige el triunfo y después el rey que llama.
  const triunfo = page.getByTestId('triunfo-oros');
  const otro = page.locator('.carta-mano.jugable, [data-testid="panel-subasta"]').first();
  await expect(triunfo.or(otro)).toBeVisible({ timeout: 30_000 });
  test.skip(!(await triunfo.isVisible()), 'la IA subió a solo con esta semilla');
  await triunfo.click();
  const llamadas = page.locator('[data-testid^="llamar-"]');
  await expect(llamadas.first()).toBeVisible();
  const id = (await llamadas.first().getAttribute('data-testid'))!.slice('llamar-'.length);
  await page.screenshot({ path: 'test-results/cuatrola-llamar.png' });
  await llamadas.first().click();
  await expect(page.getByTestId('triunfo')).toContainText('oros');
  await expect(page.getByTestId('llamada')).toContainText(/rey de/i);
  expect(id).toMatch(/-12$/);
});

// ── Partida, retomar y pantalla pequeña ──────────────────────────────────────

test('partida de Cuatrola completa de 4 manos', async ({ page }) => {
  test.setTimeout(240_000);
  await empezarCuatrola(page, 'rapido&semilla=cuatrola-completa', 4);
  await jugarCuatrola(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin.getByTestId('fichas-0')).toBeVisible();
});

test('al recargar una partida de Cuatrola se continúa en el mismo punto', async ({ page }) => {
  await empezarCuatrola(page, 'rapido&semilla=cuatrola-retomar');
  await page.getByTestId('panel-subasta').waitFor();
  const mano = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByTestId('panel-subasta').waitFor();
  expect(
    await page
      .locator('.carta-mano')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta'))),
  ).toEqual(mano);
});

test('la subasta y la mesa de la Cuatrola entran en 360 × 640', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarCuatrola(page, 'semilla=pequena');
  await page.getByTestId('panel-subasta').waitFor();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const ancho = await page.evaluate(() => window.innerWidth);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    ancho,
  );
  await page.screenshot({ path: 'test-results/cuatrola-360.png' });
  await page.getByTestId('pujar-solo').click();
  await page.getByTestId('triunfo-oros').click();
  await jugarCuatrola(page, async () => (await page.locator('.carta-mano.jugable').count()) > 0);
  await page.screenshot({ path: 'test-results/cuatrola-mesa-360.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    ancho,
  );
});
