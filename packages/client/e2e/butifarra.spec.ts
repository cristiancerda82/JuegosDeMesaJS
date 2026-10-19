import { expect, test, type Page } from '@playwright/test';
import type { IdCarta } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarButifarra(page: Page, query: string, objetivo?: 51 | 151) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-butifarra').click();
  if (objetivo) await page.getByLabel(`A ${objetivo} puntos`).check();
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
  '.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"], [data-testid^="elegir-"], [data-testid="contro"]';

/**
 * Juega desde la UI: elige oros cuando le toca, pasa en los contros, la carta jugable menor y
 * cierra el resumen de cada mano. Para cuando `parar` se cumple.
 */
async function jugarButifarra(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let jugadas = 0; jugadas < 1500; jugadas++) {
    await page.locator(ESPERA).first().waitFor();
    if ((await fin.isVisible()) || (await parar())) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-butifarra')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    const elegir = page.getByTestId('elegir-oros');
    if (await elegir.isVisible()) {
      await elegir.click();
      continue;
    }
    const pasar = page.getByTestId('pasar');
    if (await pasar.isVisible()) {
      await pasar.click();
      continue;
    }
    await jugarCarta(page);
  }
  throw new Error('La partida de Butifarra no terminó');
}

// ── Elegir, delegar y contro ─────────────────────────────────────────────────

test('contro en la primera mano, resumen, y delegar al repartir', async ({ page }) => {
  await empezarButifarra(page, 'rapido&semilla=butifarra-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(12);
  await expect(page.getByTestId('marcador')).toContainText('0 – 0 (a 101)');

  // Reparte el asiento 3: elige él (o su compañero) y al jugador le toca el contro el primero.
  const contro = page.getByTestId('contro');
  await expect(contro).toHaveText('Contro');
  await expect(page.getByTestId('triunfo-butifarra')).toBeVisible();
  const antes = Number((await page.getByTestId('multiplicador').innerText()).slice(1));
  await contro.click();
  await expect(page.getByTestId('multiplicador')).not.toHaveText(`×${antes}`);
  await page.screenshot({ path: 'test-results/butifarra-contro.png' });

  // Se juega la mano hasta el resumen.
  const panel = page.getByTestId('panel-mano');
  await jugarButifarra(page, () => panel.isVisible());
  await expect(panel.getByTestId('resumen-eleccion')).toContainText('×');
  const mano = await Promise.all(
    [0, 1].map(async (i) => Number(await panel.getByTestId(`mano-${i}`).innerText())),
  );
  expect(mano[0]! + mano[1]!).toBe(72);
  await page.screenshot({ path: 'test-results/butifarra-resumen.png' });
  await page.getByTestId('siguiente-mano').click();

  // En la segunda mano reparte el jugador: puede elegir los palos, butifarra o delegar.
  for (const id of [
    'elegir-oros',
    'elegir-copas',
    'elegir-espadas',
    'elegir-bastos',
    'elegir-butifarra',
  ]) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
  await page.getByTestId('delegar').click();
  await expect(page.getByTestId('triunfo-butifarra')).toContainText('Compañero (delegada)');
});

test('jugar butifarra: sin triunfo y la mano a ×2', async ({ page }) => {
  await empezarButifarra(page, 'rapido&semilla=butifarra-sin-triunfo');
  const panel = page.getByTestId('panel-mano');
  await jugarButifarra(page, () => panel.isVisible());
  await page.getByTestId('siguiente-mano').click();
  await page.getByTestId('elegir-butifarra').click();
  await expect(page.getByTestId('triunfo-butifarra')).toContainText('Butifarra');
  await expect(page.getByTestId('multiplicador')).toHaveText(/×(2|4|8|16)/);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Butifarra completa a 51 contra la IA', async ({ page }) => {
  test.setTimeout(240_000);
  await empezarButifarra(page, 'rapido&semilla=butifarra-completa', 51);
  await expect(page.getByTestId('marcador')).toContainText('(a 51)');
  await jugarButifarra(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido/);
  await expect(fin).toContainText('Tu pareja');
  await expect(fin.getByTestId('resumen-butifarra')).toBeVisible();
  await expect(fin.getByTestId('fin-butifarra')).toBeVisible();
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Butifarra se continúa en el mismo punto', async ({ page }) => {
  await empezarButifarra(page, 'rapido&semilla=butifarra-retomar');
  await page.getByTestId('pasar').click();
  await jugarButifarra(page, async () => (await page.locator('.carta-mano').count()) <= 10);
  await page.locator('.carta-mano.jugable').first().waitFor();
  const mano = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')));
  const marcador = await page.getByTestId('triunfo-butifarra').innerText();
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('.carta-mano.jugable').first().waitFor();
  await expect(page.getByTestId('triunfo-butifarra')).toHaveText(marcador);
  expect(
    await page
      .locator('.carta-mano')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta'))),
  ).toEqual(mano);
});

test('la mesa de la Butifarra entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarButifarra(page, 'semilla=pequena');
  await page.getByTestId('contro').waitFor();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  const cartas = page.locator('.carta-mano');
  await expect(cartas).toHaveCount(12);
  for (let i = 0; i < 12; i++) {
    const caja = (await cartas.nth(i).boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  }
  const botones = page.locator('[data-testid="contro"], [data-testid="pasar"]');
  for (let i = 0; i < 2; i++) {
    const caja = (await botones.nth(i).boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  }
  await page.screenshot({ path: 'test-results/butifarra-360.png' });
});
