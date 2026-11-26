import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, objetivo = 40) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'manilla');
  if (objetivo !== 40) await page.getByTestId(`manilla-objetivo-${objetivo}`).check();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Juega la primera carta permitida hasta que sale el resumen de la mano (o el fin). */
async function hastaElResumen(page: Page) {
  for (let i = 0; i < 200; i++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) return;
    if (await page.getByTestId('fin').isVisible()) return;
    await jugables(page)
      .first()
      .click(ESQUINA)
      .then(() => page.getByTestId('mesa').click())
      .catch(() => {});
  }
}

test('el pinte marca el triunfo, se ve en la mano del que reparte y cuenta en el resumen', async ({
  page,
}) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=manilla-mano');
  await expect(mano(page)).toHaveCount(12);
  const triunfo = page.getByTestId('triunfo-manilla');
  await expect(triunfo).toContainText('Triunfo');
  await expect(triunfo).toContainText('pinte');
  // Reparte el de la izquierda (asiento 3): su pinte se ve en su mano.
  await expect(page.getByTestId('asiento-3').locator('[data-carta]')).toHaveCount(1);
  await page.screenshot({ path: `test-results/manilla-mesa-${page.viewportSize()!.width}.png` });
  await hastaElResumen(page);
  await expect(page.getByTestId('resumen-manilla')).toBeVisible();
  await expect(page.getByTestId('resumen-pinte')).toContainText('El pinte');
  await page.screenshot({ path: `test-results/manilla-resumen-${page.viewportSize()!.width}.png` });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('panel-mano')).toBeHidden();
  // En la segunda mano reparte el jugador: su pinte está en su propia mano.
  await expect(mano(page)).toHaveCount(12);
});

test('partida de Manilla completa a 20 contra la IA', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=manilla-completa', 20);
  for (let i = 0; i < 60 && !(await page.getByTestId('fin').isVisible()); i++) {
    await hastaElResumen(page);
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('resumen-manilla')).toBeVisible();
  await expect(fin.getByTestId('fin-manilla')).toBeVisible();
  await page.screenshot({ path: `test-results/manilla-fin-${page.viewportSize()!.width}.png` });
});

test('al recargar una partida de Manilla se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=manilla-retomar');
  await expect(mano(page)).toHaveCount(12);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(12);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('la Manilla entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=manilla-pequena');
  await expect(mano(page)).toHaveCount(12);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/manilla-360.png' });
});

test('la guía explica el pinte y la puntuación', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'manilla');
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toContainText('El triunfo: el pinte');
  await expect(guia).toContainText('lo que pasa de 36');
});
