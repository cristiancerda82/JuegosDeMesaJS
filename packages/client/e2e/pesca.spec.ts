import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-pesca').click();
  if (jugadores !== undefined) {
    await page.getByRole('radio', { name: `${jugadores} jugadores` }).check();
  }
  await page.getByTestId('empezar').click();
}

const valores = (page: Page) => page.locator('[data-testid^="valor-"]:not([disabled])');

/** Pide el primer valor de la mano al primer rival con cartas. */
async function pedirPrimero(page: Page) {
  await valores(page).first().click();
  await page.locator('.rival.pedible').first().click();
}

// ── Pedir ────────────────────────────────────────────────────────────────────

test('pedir a un rival: se ve la petición y lo que pasa', async ({ page }) => {
  await empezar(page, 'semilla=pesca-pedir');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await expect(page.getByTestId('mar')).toContainText('Mar: 32');
  await page.screenshot({ path: `test-results/pesca-mesa-${page.viewportSize()!.width}.png` });
  await valores(page).first().click();
  await expect(page.getByTestId('turno')).toContainText('¿A quién le pides');
  await page.getByTestId('asiento-1').click();
  const aviso = page.getByTestId('aviso');
  await expect(aviso).toContainText('Pides');
  await expect(aviso).toContainText(/ da |¡A pescar!/);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Pesca completa contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=pesca-completa');
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 2_000; paso++) {
    await page
      .locator('[data-testid="fin"], [data-testid^="valor-"]:not([disabled])')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    await pedirPrimero(page).catch(() => {});
  }
  await expect(fin).toBeVisible();
  const tabla = fin.getByTestId('cuartetos-fin');
  await expect(tabla).toBeVisible();
  const total = await tabla
    .locator('td')
    .evaluateAll((tds) => tds.reduce((s, td) => s + Number(td.textContent), 0));
  expect(total).toBe(13);
  await page.screenshot({ path: `test-results/pesca-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Pesca se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=pesca-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const despues = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  expect(despues).toEqual(antes);
});

test('la Pesca con 6 jugadores entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena', 6);
  await expect(page.locator('.rival')).toHaveCount(5);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/pesca-360.png' });
  await expect(valores(page).last()).toBeInViewport();
});
