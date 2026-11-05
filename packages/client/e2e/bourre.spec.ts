import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-bourre').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Toca la primera carta que se puede jugar o descartar. */
async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Jugar, cambiar y pasar ───────────────────────────────────────────────────

test('jugar la mano y cambiar dos cartas', async ({ page }) => {
  await empezar(page, 'semilla=bourre-cambio');
  await expect(mano(page)).toHaveCount(5);
  await expect(page.getByTestId('bote')).toContainText('5');
  await expect(page.getByTestId('fichas')).toContainText('99');
  await page.screenshot({ path: `test-results/bourre-decidir-${page.viewportSize()!.width}.png` });
  await page.getByTestId('jugar').click();
  // Cuando le toca cambiar (tras decidir todos), puede descartarse.
  await expect(page.getByTestId('robar')).toHaveText('No cambiar', { timeout: 30_000 });
  const antes = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  await tocarPrimera(page);
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(3);
  await expect(page.getByTestId('robar')).toHaveText('Cambiar 2');
  await page.getByTestId('robar').click();
  await expect(mano(page)).toHaveCount(5);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  expect(despues.filter((c) => !antes.includes(c))).toHaveLength(2);
});

test('pasar y ver el resumen de la mano', async ({ page }) => {
  await empezar(page, 'rapido&semilla=bourre-pasar');
  await page.getByTestId('pasar').click();
  await expect(mano(page)).toHaveCount(0);
  await expect(page.getByTestId('panel-mano')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId('resumen-bourre')).toContainText('Pasa');
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Bourré completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=bourre-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 5_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="jugar"], [data-testid="robar"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-bourre')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('jugar').isVisible()) {
      await page.getByTestId('jugar').click();
    } else if (await page.getByTestId('robar').isVisible()) {
      await page.getByTestId('robar').click();
    } else {
      await tocarPrimera(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-bourre')).toBeVisible();
  await page.screenshot({ path: `test-results/bourre-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Bourré se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=bourre-retomar');
  await expect(mano(page)).toHaveCount(5);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(5);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Bourré entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=bourre-pequena');
  await expect(page.getByTestId('jugar')).toBeVisible();
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  await expect(page.getByTestId('jugar')).toBeInViewport();
  await expect(page.getByTestId('pasar')).toBeInViewport();
  for (const a of [1, 2, 3, 4]) await expect(page.getByTestId(`asiento-${a}`)).toBeInViewport();
  await page.screenshot({ path: 'test-results/bourre-360.png' });
  await page.getByTestId('jugar').click();
  await expect(page.getByTestId('robar')).toBeVisible({ timeout: 30_000 });
  await sinScroll();
  await expect(page.getByTestId('robar')).toBeInViewport();
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/bourre-360-cambio.png' });
});
