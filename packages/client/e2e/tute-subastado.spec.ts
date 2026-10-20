import { expect, test, type Page } from '@playwright/test';
import type { IdCarta } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarSubastado(page: Page, query: string, manos?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-tuteSubastado').click();
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
].join(', ');

/**
 * Juega desde la UI: pasa en la subasta, elige el primer palo si gana una, juega la carta
 * jugable menor y cierra el resumen de cada mano. Para cuando `parar` se cumple.
 */
async function jugarSubastado(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let jugadas = 0; jugadas < 1500; jugadas++) {
    await page.locator(ESPERA).first().waitFor({ timeout: 30_000 });
    if ((await fin.isVisible()) || (await parar())) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-tute-subastado')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await page.getByTestId('panel-subasta').isVisible()) {
      await page.getByTestId('pasar').click();
      continue;
    }
    const palo = page.locator('[data-testid^="triunfo-"]').first();
    if (await palo.isVisible()) {
      await palo.click();
      continue;
    }
    await jugarCarta(page);
  }
  throw new Error('La partida de Tute subastado no terminó');
}

// ── Subasta y triunfo ────────────────────────────────────────────────────────

test('pujar, ganar la subasta, elegir el triunfo y jugar hasta el resumen', async ({ page }) => {
  await empezarSubastado(page, 'rapido&semilla=subastado-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await expect(page.getByTestId('mano-subastado')).toHaveText('Mano 1 de 8');

  // El jugador es mano: habla el primero, con pujas de 60 a 230.
  const subasta = page.getByTestId('panel-subasta');
  await expect(subasta).toBeVisible();
  await expect(subasta.locator('[data-testid^="puja-"]')).toHaveCount(18);
  await page.screenshot({ path: 'test-results/subastado-subasta.png' });
  await page.getByTestId('puja-230').click();
  await expect(subasta).toBeHidden();

  // Con la puja máxima nadie puede subir: gana la subasta y elige el triunfo.
  await page.getByTestId('triunfo-copas').click({ timeout: 30_000 });
  await expect(page.getByTestId('triunfo')).toContainText('copas');
  await expect(page.getByTestId('lleva')).toContainText('de 230');
  await expect(page.getByTestId('detalle-propio')).toContainText('pujador');

  const panel = page.getByTestId('panel-mano');
  await jugarSubastado(page, () => panel.isVisible());
  await expect(panel.getByTestId('cumple')).toContainText('No llegas a tus 230');
  await expect(panel.getByTestId('cambio-0')).toHaveText('−69');
  await page.screenshot({ path: 'test-results/subastado-resumen.png' });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('mano-subastado')).toHaveText('Mano 2 de 8');
});

test('pujar 60 deja la puja vigente a nombre del jugador', async ({ page }) => {
  await empezarSubastado(page, 'semilla=subastado-60');
  await page.getByTestId('puja-60').click();
  await expect(page.getByTestId('puja-vigente').or(page.getByTestId('lleva'))).toBeVisible();
  await expect(page.getByTestId('detalle-propio')).toContainText(/puja 60|pujador/);
});

// ── Partida, retomar y pantalla pequeña ──────────────────────────────────────

test('partida de Tute subastado completa de 4 manos', async ({ page }) => {
  test.setTimeout(240_000);
  await empezarSubastado(page, 'rapido&semilla=subastado-completa', 4);
  await jugarSubastado(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin.getByTestId('fichas-0')).toBeVisible();
});

test('al recargar una partida de Tute subastado se continúa en el mismo punto', async ({
  page,
}) => {
  await empezarSubastado(page, 'rapido&semilla=subastado-retomar');
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

test('la subasta y la mesa del Tute subastado entran en 360 × 640', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarSubastado(page, 'semilla=pequena');
  const subasta = page.getByTestId('panel-subasta');
  await subasta.waitFor();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const ancho = await page.evaluate(() => window.innerWidth);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    ancho,
  );
  for (const id of ['pasar', 'puja-60', 'puja-230']) {
    const caja = (await page.getByTestId(id).boundingBox())!;
    expect(caja.x).toBeGreaterThanOrEqual(0);
    expect(caja.x + caja.width).toBeLessThanOrEqual(ancho);
    expect(caja.y + caja.height).toBeLessThanOrEqual(640);
  }
  await page.screenshot({ path: 'test-results/subastado-360.png' });
  await page.getByTestId('pasar').click();
  await jugarSubastado(page, async () => (await page.locator('.carta-mano.jugable').count()) > 0);
  await page.screenshot({ path: 'test-results/subastado-mesa-360.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    ancho,
  );
});
