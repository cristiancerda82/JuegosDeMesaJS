import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, manos = 6) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'cuarentaYTres');
  if (manos !== 6) await page.getByTestId(`cuarenta-y-tres-manos-${manos}`).check();
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

test('se cambia la muestra y el resumen dice lo que cobra o paga cada uno', async ({ page }) => {
  test.setTimeout(300_000);
  // La muestra es el As de copas y el jugador tiene el 7 de copas.
  await empezar(page, 'rapido&semilla=cuarenta-y-tres-cambio-27');
  await expect(mano(page)).toHaveCount(13);
  await expect(page.getByTestId('triunfo-cuarenta-y-tres')).toContainText('Copas');
  await expect(page.getByTestId('mano-cuarenta-y-tres')).toContainText('Mano 1 de 6');
  await expect(page.getByTestId('muestra')).toHaveAttribute('data-carta', 'copas-1');
  const cambiar = page.getByTestId('cambiar-muestra');
  await expect(cambiar).toHaveText('Cambiar la muestra por tu 7 de copas');
  await page.screenshot({
    path: `test-results/cuarenta-y-tres-mesa-${page.viewportSize()!.width}.png`,
  });
  await cambiar.click();
  await expect(page.locator('.carta-mano[data-carta="copas-1"]')).toBeVisible();
  await expect(page.locator('.carta-mano[data-carta="copas-7"]')).toHaveCount(0);
  await expect(page.getByTestId('muestra')).toHaveAttribute('data-carta', 'copas-7');
  await expect(page.getByTestId('aviso')).toContainText('Cambias la muestra');
  await expect(cambiar).toBeHidden();

  await hastaElResumen(page);
  await expect(page.getByTestId('resumen-cuarenta-y-tres')).toBeVisible();
  await expect(page.getByTestId('resumen-muestra')).toContainText('Cambiaste la muestra');
  // Con la muestra cambiada por el 7, se reparten los 129 tantos y la cuenta cuadra.
  const tantos = await Promise.all(
    [0, 1, 2].map(async (i) => Number(await page.getByTestId(`tantos-${i}`).textContent())),
  );
  expect(tantos.reduce((s, t) => s + t, 0)).toBe(129);
  const cobra = (t: number) => (t > 43 ? `+${t - 43}` : t < 43 ? `−${43 - t}` : '0');
  for (const i of [0, 1, 2]) {
    await expect(page.getByTestId(`cobra-${i}`)).toHaveText(cobra(tantos[i]!));
  }
  await page.screenshot({
    path: `test-results/cuarenta-y-tres-resumen-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('panel-mano')).toBeHidden();
  await expect(mano(page)).toHaveCount(13);
  await expect(page.getByTestId('mano-cuarenta-y-tres')).toContainText('Mano 2 de 6');
});

test('partida de Cuarenta y tres completa a 3 manos contra la IA', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=cuarenta-y-tres-completa', 3);
  for (let i = 0; i < 10 && !(await page.getByTestId('fin').isVisible()); i++) {
    await hastaElResumen(page);
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('resumen-cuarenta-y-tres')).toBeVisible();
  await expect(fin.getByTestId('saldos-cuarenta-y-tres')).toBeVisible();
  await expect(fin.getByTestId('fin-cuarenta-y-tres')).toBeVisible();
  // La clasificación va del saldo más alto al más bajo.
  const valor = (t: string | null) => Number(t!.replace('−', '-').replace('+', ''));
  const saldos = await Promise.all(
    [0, 1, 2].map(async (i) => valor(await fin.getByTestId(`saldo-fin-${i}`).textContent())),
  );
  expect([...saldos].sort((a, b) => b - a)).toEqual(saldos);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  await page.screenshot({
    path: `test-results/cuarenta-y-tres-fin-${page.viewportSize()!.width}.png`,
  });
});

test('al recargar una partida de Cuarenta y tres se continúa con la misma mano', async ({
  page,
}) => {
  await empezar(page, 'semilla=cuarenta-y-tres-retomar');
  await expect(mano(page)).toHaveCount(13);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(13);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Cuarenta y tres entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=cuarenta-y-tres-cambio-27');
  await expect(mano(page)).toHaveCount(13);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await expect(page.getByTestId('cambiar-muestra')).toBeInViewport();
  await page.screenshot({ path: 'test-results/cuarenta-y-tres-360.png' });
});

test('la guía explica la muestra y la cuenta de los 43', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'cuarentaYTres');
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toContainText('El cambio de la muestra');
  await expect(guia).toContainText('La cuenta de cada mano');
});
