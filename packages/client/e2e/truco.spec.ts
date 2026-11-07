import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import type { IdCarta } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarTruco(page: Page, query: string, opciones: { cuatro?: boolean } = {}) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'truco');
  if (opciones.cuatro) await page.getByTestId('truco-cuatro').check();
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
  '.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"], [data-testid="truco-quiero"]';

/**
 * Juega desde la UI: quiere todo canto, juega la carta jugable menor y cierra el resumen de cada
 * mano, comprobando que los puntos de la partida suben con lo de la mano. Para cuando `parar` se
 * cumple.
 */
async function jugarTruco(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let jugadas = 0; jugadas < 1500; jugadas++) {
    await page.locator(ESPERA).first().waitFor();
    if ((await fin.isVisible()) || (await parar())) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-truco-tabla')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    const quiero = page.getByTestId('truco-quiero');
    if (await quiero.isVisible()) {
      await quiero.click();
      continue;
    }
    await jugarCarta(page);
  }
  throw new Error('La partida de Truco no terminó');
}

// ── Cantos ───────────────────────────────────────────────────────────────────

test('cantar envido y truco contra la IA, hasta el resumen de la mano', async ({ page }) => {
  await empezarTruco(page, 'rapido&semilla=truco-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await expect(page.getByTestId('valor-mano')).toHaveText('La mano vale 1');
  await expect(page.getByTestId('marcador')).toContainText('0 malas – 0 malas');

  // El jugador es mano: puede cantar envido, real envido, falta envido, truco o irse.
  for (const id of [
    'truco-envido',
    'truco-realEnvido',
    'truco-faltaEnvido',
    'truco-truco',
    'truco-meVoy',
  ]) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
  await expect(page.getByTestId('truco-truco')).toHaveText('Truco');
  await page.screenshot({ path: `test-results/truco-cantos-${page.viewportSize()!.width}.png` });
  await page.getByTestId('truco-envido').click();
  // La IA responde: quiere, no quiere o sube (y entonces responde el jugador).
  await expect(
    page
      .locator(
        '[data-testid="envido-querido"], [data-testid="envido-no-querido"], [data-testid="truco-quiero"]',
      )
      .first(),
  ).toBeVisible();
  if (await page.getByTestId('truco-quiero').isVisible())
    await page.getByTestId('truco-quiero').click();
  await expect(
    page.locator('[data-testid="envido-querido"], [data-testid="envido-no-querido"]').first(),
  ).toBeVisible();
  await expect(page.getByTestId('truco-envido')).toHaveCount(0);

  // Canta truco: la IA quiere (la mano vale 2), no quiere (se cierra la mano) o retruca.
  await page.getByTestId('truco-truco').click();
  const panel = page.getByTestId('panel-mano');
  await jugarTruco(page, () => panel.isVisible());
  await expect(panel.getByTestId('resumen-envido')).not.toHaveText('Nadie cantó envido.');
  await expect(panel.getByTestId('resumen-truco')).toBeVisible();
  await expect(panel.getByTestId('malas-0')).toContainText(/malas|buenas/);
  await page.screenshot({ path: `test-results/truco-resumen-${page.viewportSize()!.width}.png` });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.locator('.carta-mano')).toHaveCount(3);
});

test('responder a un truco de la IA: quiero sube lo que vale la mano', async ({ page }) => {
  // Se juega hasta que la IA canta y el jugador puede responder.
  await empezarTruco(page, 'rapido&semilla=truco-respuesta');
  const quiero = page.getByTestId('truco-quiero');
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let i = 0; i < 600; i++) {
    await page.locator(ESPERA).first().waitFor();
    if (await fin.isVisible()) throw new Error('La IA no cantó truco en toda la partida');
    if (await panel.isVisible()) {
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await quiero.isVisible()) {
      // Solo interesa un truco; un envido se quiere y se sigue.
      if (await page.getByTestId('truco-pendiente').isVisible()) break;
      await quiero.click();
      continue;
    }
    await jugarCarta(page);
  }
  await expect(page.getByTestId('truco-noQuiero')).toBeVisible();
  await expect(page.getByTestId('truco-meVoy')).toBeVisible();
  const antes = await page.getByTestId('valor-mano').innerText();
  await page.screenshot({ path: `test-results/truco-respuesta-${page.viewportSize()!.width}.png` });
  await quiero.click();
  // Si había un envido delante, se resuelve primero.
  if (await page.getByTestId('truco-pendiente').isVisible()) await quiero.click();
  await expect(page.getByTestId('valor-mano')).not.toHaveText(antes);
});

// ── Partidas ─────────────────────────────────────────────────────────────────

test('partida de Truco completa a 30 contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezarTruco(page, 'rapido&semilla=truco-completa');
  await jugarTruco(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido/);
  const puntos = await Promise.all(
    [0, 1].map((i) => fin.getByTestId(`puntos-${i}`).innerText().then(Number)),
  );
  expect(Math.max(...puntos)).toBeGreaterThanOrEqual(30);
  await page.screenshot({ path: `test-results/truco-fin-${page.viewportSize()!.width}.png` });
});

test('partida de Truco de 4 por parejas', async ({ page }) => {
  await empezarTruco(page, 'rapido&semilla=truco-parejas', { cuatro: true });
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await expect(page.getByTestId('asiento-2')).toContainText('Compañero');
  const panel = page.getByTestId('panel-mano');
  await jugarTruco(page, () => panel.isVisible());
  await expect(panel.getByTestId('resumen-truco-tabla')).toContainText('Tu pareja');
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Truco se continúa en el mismo punto', async ({ page }) => {
  await empezarTruco(page, 'rapido&semilla=truco-retomar');
  await page.getByTestId('truco-truco').click();
  await page.locator(ESPERA).first().waitFor();
  const valor = await page.getByTestId('valor-mano').innerText();
  const mano = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator(ESPERA).first().waitFor();
  await expect(page.getByTestId('valor-mano')).toHaveText(valor);
  expect(
    await page
      .locator('.carta-mano')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-carta'))),
  ).toEqual(mano);
});

test('la mesa del Truco entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const cuatro of [false, true]) {
    await empezarTruco(page, 'semilla=pequena', { cuatro });
    await page.getByTestId('truco-truco').waitFor();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    const botones = page.locator('.apuestas button');
    for (let i = 0; i < (await botones.count()); i++) {
      await expect(botones.nth(i)).toBeInViewport({ ratio: 0.9 });
    }
    await expect(page.locator('.carta-mano').first()).toBeInViewport({ ratio: 0.9 });
    await expect(page.locator('.carta-mano').last()).toBeInViewport({ ratio: 0.9 });
    await page.screenshot({ path: `test-results/truco${cuatro ? 4 : 2}-360.png` });
  }
});
