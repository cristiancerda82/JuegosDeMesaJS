import { expect, test, type Page } from '@playwright/test';
import type { IdCarta } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarTruc(
  page: Page,
  query: string,
  opciones: { cuatro?: boolean; unaCame?: boolean } = {},
) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-truc').click();
  if (opciones.cuatro) await page.getByLabel('4 jugadores en parejas').check();
  if (opciones.unaCame) await page.getByLabel('Una came de 12').check();
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
  '.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"], [data-testid="truc-vull"]';

/**
 * Juega desde la UI: quiere toda apuesta, juega la carta jugable menor y cierra el resumen de
 * cada mano. Para cuando `parar` se cumple.
 */
async function jugarTruc(page: Page, parar: () => Promise<boolean> = async () => false) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let jugadas = 0; jugadas < 1500; jugadas++) {
    await page.locator(ESPERA).first().waitFor();
    if ((await fin.isVisible()) || (await parar())) return;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-truc-tabla')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    const vull = page.getByTestId('truc-vull');
    if (await vull.isVisible()) {
      await vull.click();
      continue;
    }
    await jugarCarta(page);
  }
  throw new Error('La partida de Truc no terminó');
}

// ── Apuestas ─────────────────────────────────────────────────────────────────

test('envidar y trucar contra la IA, hasta el resumen de la mano', async ({ page }) => {
  await empezarTruc(page, 'rapido&semilla=truc-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await expect(page.getByTestId('valor-mano')).toHaveText('La mano vale 1');
  await expect(page.getByTestId('marcador')).toContainText('0 – 0 (a 12)');

  // El jugador es mano: puede envidar, trucar o irse.
  for (const id of ['truc-envidar', 'truc-trucar', 'truc-meVoy']) {
    await expect(page.getByTestId(id)).toBeVisible();
  }
  await expect(page.getByTestId('truc-trucar')).toHaveText('Truc');
  await page.getByTestId('truc-envidar').click();
  // La IA responde: quiere, no quiere o sube (y entonces responde el jugador).
  await expect(
    page
      .locator(
        '[data-testid="envit-querido"], [data-testid="envit-no-querido"], [data-testid="truc-vull"]',
      )
      .first(),
  ).toBeVisible();
  if (await page.getByTestId('truc-vull').isVisible()) await page.getByTestId('truc-vull').click();
  await expect(
    page.locator('[data-testid="envit-querido"], [data-testid="envit-no-querido"]').first(),
  ).toBeVisible();
  await expect(page.getByTestId('truc-envidar')).toHaveCount(0);

  // Truca: la IA quiere (la mano vale 2), no quiere (se cierra la mano) o retruca.
  await page.getByTestId('truc-trucar').click();
  await page.screenshot({ path: 'test-results/truc-apuestas.png' });
  const panel = page.getByTestId('panel-mano');
  await jugarTruc(page, () => panel.isVisible());
  await expect(panel.getByTestId('resumen-envit')).not.toHaveText('Nadie envidó.');
  await expect(panel.getByTestId('resumen-truc')).toBeVisible();
  await page.screenshot({ path: 'test-results/truc-resumen.png' });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.locator('.carta-mano')).toHaveCount(3);
});

test('responder a un truc de la IA: vull sube lo que vale la mano', async ({ page }) => {
  // Se juega hasta que la IA truca y el jugador puede responder.
  await empezarTruc(page, 'rapido&semilla=truc-respuesta');
  const vull = page.getByTestId('truc-vull');
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  for (let i = 0; i < 600 && !(await vull.isVisible()); i++) {
    await page.locator(ESPERA).first().waitFor();
    if (await fin.isVisible()) throw new Error('La IA no trucó en toda la partida');
    if (await panel.isVisible()) await page.getByTestId('siguiente-mano').click();
    else if (!(await vull.isVisible())) await jugarCarta(page);
  }
  await expect(page.getByTestId('truc-noVull')).toBeVisible();
  await expect(page.getByTestId('truc-meVoy')).toBeVisible();
  const pendiente = await page
    .locator('[data-testid="truc-pendiente"], [data-testid="envit-pendiente"]')
    .first()
    .innerText();
  const antes = await page.getByTestId('valor-mano').innerText();
  await vull.click();
  if (pendiente.startsWith('Truc')) {
    await expect(page.getByTestId('valor-mano')).not.toHaveText(antes);
  }
});

// ── Partidas ─────────────────────────────────────────────────────────────────

test('partida de Truc completa a una came contra la IA', async ({ page }) => {
  test.setTimeout(240_000);
  await empezarTruc(page, 'rapido&semilla=truc-completa', { unaCame: true });
  await jugarTruc(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido/);
  await expect(fin.getByTestId('cames-0')).toBeVisible();
});

test('partida de Truc de 4 por parejas', async ({ page }) => {
  await empezarTruc(page, 'rapido&semilla=truc-parejas', { cuatro: true });
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await expect(page.getByTestId('asiento-2')).toContainText('Compañero');
  const panel = page.getByTestId('panel-mano');
  await jugarTruc(page, () => panel.isVisible());
  await expect(panel.getByTestId('resumen-truc-tabla')).toContainText('Tu pareja');
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Truc se continúa en el mismo punto', async ({ page }) => {
  await empezarTruc(page, 'rapido&semilla=truc-retomar');
  await page.getByTestId('truc-trucar').click();
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

test('la mesa del Truc entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const cuatro of [false, true]) {
    await empezarTruc(page, 'semilla=pequena', { cuatro });
    await page.getByTestId('truc-trucar').waitFor();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    const botones = page.locator('[data-testid^="truc-"]');
    for (let i = 0; i < (await botones.count()); i++) {
      const caja = (await botones.nth(i).boundingBox())!;
      expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
    }
    await page.screenshot({ path: `test-results/truc${cuatro ? 4 : 2}-360.png` });
  }
});
