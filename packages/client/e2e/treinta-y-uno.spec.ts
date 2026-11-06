import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-treintaYUno').click();
  if (jugadores) await page.getByTestId(`treinta-jugadores-${jugadores}`).check();
  await page.getByTestId('empezar').click();
}

const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

// ── Robar, descartar y plantarse ─────────────────────────────────────────────

test('robar del mazo y descartar', async ({ page }) => {
  await empezar(page, 'semilla=treinta-robar');
  await expect(mano(page)).toHaveCount(3);
  await expect(page.getByTestId('valor')).toContainText('Tu mano:');
  await expect(page.getByTestId('vidas')).toContainText('3 vidas');
  for (const a of [1, 2, 3]) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: `test-results/treinta-inicio-${page.viewportSize()!.width}.png` });
  await page.getByTestId('mazo').click();
  await expect(mano(page)).toHaveCount(4);
  const carta = jugables(page).first();
  const id = await carta.getAttribute('data-carta');
  await carta.click();
  await expect(mano(page)).toHaveCount(3);
  await expect(page.getByTestId('descarte').locator(`[data-carta="${id}"]`)).toBeVisible();
});

test('plantarse y ver el resumen de la ronda', async ({ page }) => {
  await empezar(page, 'rapido&semilla=treinta-plantarse');
  await page.getByTestId('plantarse').click();
  await expect(page.getByTestId('plantarse')).toBeHidden();
  await expect(page.getByTestId('panel-mano')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('resumen-linea')).toContainText('Te plantaste');
  await expect(page.getByTestId('resumen-treinta')).toBeVisible();
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Treinta y uno completa contra la IA, con el resumen de cada ronda', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=treinta-completa');
  let rondas = 0;
  for (let pasos = 0; pasos < 5_000; pasos++) {
    await page
      .locator(
        '.pila.robable, .carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-treinta')).toBeVisible();
      rondas++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await jugables(page).first().isVisible()) {
      await jugables(page).first().click();
    } else {
      await page
        .getByTestId('mazo')
        .click()
        .catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(rondas).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-treinta')).toBeVisible();
  await page.screenshot({ path: `test-results/treinta-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Treinta y uno se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=treinta-retomar');
  await expect(mano(page)).toHaveCount(3);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(3);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Treinta y uno con 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=treinta-seis', 6);
  await expect(page.getByTestId('plantarse')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const a of [1, 2, 3, 4, 5]) await expect(page.getByTestId(`asiento-${a}`)).toBeInViewport();
  for (const id of ['mazo', 'descarte', 'plantarse']) {
    await expect(page.getByTestId(id)).toBeInViewport();
  }
  await expect(mano(page).last()).toBeInViewport();
  await page.screenshot({ path: 'test-results/treinta-360.png' });
});
