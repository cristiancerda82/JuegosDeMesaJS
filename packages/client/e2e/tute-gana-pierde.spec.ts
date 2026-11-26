import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, limite = 6) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'tuteGanaPierde');
  if (limite !== 6) await page.getByTestId(`tute-gana-pierde-limite-${limite}`).check();
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

test('empieza sin triunfo y el resumen dice quién se queda en medio', async ({ page }) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=gana-pierde-mano');
  await expect(mano(page)).toHaveCount(12);
  await expect(page.getByTestId('triunfo-gana-pierde')).toContainText('Sin triunfo');
  await expect(page.getByTestId('asiento-1')).toContainText('0 tantos');
  await page.screenshot({
    path: `test-results/gana-pierde-mesa-${page.viewportSize()!.width}.png`,
  });
  await hastaElResumen(page);
  await expect(page.getByTestId('resumen-tute-gana-pierde')).toBeVisible();
  await expect(page.getByTestId('resumen-medio')).toContainText('penalización');
  // Los tantos de los tres suman 130 con los cantes de 40 y 20 que haya habido.
  const tantos = await Promise.all(
    [0, 1, 2].map(async (i) => Number(await page.getByTestId(`tantos-${i}`).textContent())),
  );
  expect((tantos.reduce((s, t) => s + t, 0) - 130) % 20).toBe(0);
  await page.screenshot({
    path: `test-results/gana-pierde-resumen-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('panel-mano')).toBeHidden();
  await expect(mano(page)).toHaveCount(12);
  await expect(page.getByTestId('triunfo-gana-pierde')).toContainText('Sin triunfo');
});

test('partida de Tute gana-pierde completa a 3 penalizaciones contra la IA', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=gana-pierde-completa', 3);
  for (let i = 0; i < 60 && !(await page.getByTestId('fin').isVisible()); i++) {
    await hastaElResumen(page);
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('resumen-tute-gana-pierde')).toBeVisible();
  await expect(fin.getByTestId('penalizaciones-tute-gana-pierde')).toBeVisible();
  await expect(fin.getByTestId('penalizaciones-fin-2')).toHaveText('3');
  await expect(fin.getByTestId('fin-tute-gana-pierde')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  await page.screenshot({ path: `test-results/gana-pierde-fin-${page.viewportSize()!.width}.png` });
});

test('al recargar una partida de Tute gana-pierde se continúa con la misma mano', async ({
  page,
}) => {
  await empezar(page, 'semilla=gana-pierde-retomar');
  await expect(mano(page)).toHaveCount(12);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(12);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Tute gana-pierde entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=gana-pierde-pequena');
  await expect(mano(page)).toHaveCount(12);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/gana-pierde-360.png' });
});

test('la guía explica el triunfo, los cantes y la penalización', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'tuteGanaPierde');
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toContainText('El triunfo y los cantes');
  await expect(guia).toContainText('Quién se lleva la penalización');
});
