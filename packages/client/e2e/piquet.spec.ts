import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-piquet').click();
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

// ── Cambio, declaraciones y bazas ────────────────────────────────────────────

test('cambiar, ver las declaraciones y jugar una baza', async ({ page }) => {
  test.setTimeout(120_000);
  await empezar(page, 'semilla=piquet-cambio');
  await expect(mano(page)).toHaveCount(12);
  await expect(page.getByTestId('cartas-mazo')).toContainText('8');
  await expect(page.getByTestId('mano-ronda')).toHaveText('Mano 1 de 6');
  // Es mayor: descarta tres y roba.
  for (let i = 0; i < 3; i++) await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(9);
  await page.screenshot({ path: `test-results/piquet-cambio-${page.viewportSize()!.width}.png` });
  await page.getByTestId('robar').click();
  await expect(mano(page)).toHaveCount(12);
  // Cambia el rival y salen las declaraciones.
  await expect(page.getByTestId('declaracion-punto')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('declaracion-secuencia')).toBeVisible();
  await expect(page.getByTestId('declaracion-conjunto')).toBeVisible();
  await expect(jugables(page).first()).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: `test-results/piquet-mesa-${page.viewportSize()!.width}.png` });
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(11);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Piquet completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=piquet-completa');
  const fin = page.getByTestId('fin');
  let resumenes = 0;
  for (let paso = 0; paso < 3_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="robar"], [data-testid="mano"] .carta-mano.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-piquet')).toBeVisible();
      if (resumenes++ === 0) {
        await page.screenshot({
          path: `test-results/piquet-resumen-${page.viewportSize()!.width}.png`,
        });
      }
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    // En el cambio: el mayor descarta una carta y roba; el menor no cambia.
    const robar = page.getByTestId('robar');
    if (await robar.isVisible()) {
      await robar.click().catch(() => {});
      continue;
    }
    await tocarPrimera(page).catch(() => {});
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('puntos-piquet')).toBeVisible();
  expect(resumenes).toBeGreaterThan(0);
  await page.screenshot({ path: `test-results/piquet-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Piquet se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=piquet-retomar');
  await expect(mano(page)).toHaveCount(12);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(12);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  expect(despues).toEqual(antes);
});

test('el Piquet entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await expect(mano(page)).toHaveCount(12);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/piquet-360.png' });
  await expect(mano(page).first()).toBeInViewport();
  await expect(mano(page).last()).toBeInViewport();
});
