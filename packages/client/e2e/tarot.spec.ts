import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-tarot').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Juega (o descarta) la primera carta que se puede. */
async function jugarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Subasta, descarte y bazas ────────────────────────────────────────────────

test('subasta, descarte y una baza', async ({ page }) => {
  test.setTimeout(120_000);
  await empezar(page, 'semilla=tarot-garde');
  await expect(mano(page)).toHaveCount(18);
  await expect(page.getByTestId('mano-ronda')).toHaveText('Mano 1 de 8');
  await page.screenshot({ path: `test-results/tarot-subasta-${page.viewportSize()!.width}.png` });
  // Habla primero: pide Garde.
  await page.getByTestId('contrato-garde').click();
  const contrato = page.getByTestId('contrato');
  await expect(contrato).not.toHaveText('Subasta', { timeout: 30_000 });
  if ((await contrato.textContent())!.includes('Tú')) {
    // Se queda el perro (se ve) y descarta 6.
    await expect(page.getByTestId('perro')).toBeVisible();
    await expect(mano(page)).toHaveCount(24);
    await page.screenshot({ path: `test-results/tarot-perro-${page.viewportSize()!.width}.png` });
    for (let i = 0; i < 6; i++) await jugarPrimera(page);
    await expect(mano(page)).toHaveCount(18);
  }
  await expect(jugables(page).first()).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: `test-results/tarot-mesa-${page.viewportSize()!.width}.png` });
  await jugarPrimera(page);
  await expect(mano(page)).toHaveCount(17);
});

// ── Partidas completas ───────────────────────────────────────────────────────

async function partidaCompleta(page: Page, nombre: string) {
  const fin = page.getByTestId('fin');
  let resumenes = 0;
  for (let paso = 0; paso < 3_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="pasar"], [data-testid^="llamar-"], [data-testid="mano"] .carta-mano.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-tarot')).toBeVisible();
      if (resumenes++ === 0) {
        await page.screenshot({
          path: `test-results/tarot-resumen-${nombre}-${page.viewportSize()!.width}.png`,
        });
      }
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    // En la subasta pide Petite si puede; si no, pasa.
    if (await page.getByTestId('pasar').isVisible()) {
      const petite = page.getByTestId('contrato-petite');
      await ((await petite.isVisible()) ? petite : page.getByTestId('pasar'))
        .click()
        .catch(() => {});
      continue;
    }
    const llamar = page.locator('[data-testid^="llamar-"]').first();
    if ((await llamar.count()) > 0 && (await llamar.isVisible())) {
      await llamar.click().catch(() => {});
      continue;
    }
    await jugarPrimera(page).catch(() => {});
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('puntos-tarot')).toBeVisible();
  expect(resumenes).toBeGreaterThan(0);
  await page.screenshot({
    path: `test-results/tarot-fin-${nombre}-${page.viewportSize()!.width}.png`,
  });
}

test('partida de Tarot completa con 4 contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=tarot-completa');
  await partidaCompleta(page, '4');
});

test('partida de Tarot completa con 5, con la llamada al Rey', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=tarot-cinco', 5);
  await expect(mano(page)).toHaveCount(15);
  await partidaCompleta(page, '5');
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Tarot se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=tarot-retomar');
  await expect(mano(page)).toHaveCount(18);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(18);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  expect(despues).toEqual(antes);
});

test('el Tarot con 3 jugadores (24 cartas) entra en 360 × 640 sin scroll horizontal', async ({
  page,
}) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena', 3);
  await expect(mano(page)).toHaveCount(24);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/tarot-360.png' });
  await expect(mano(page).last()).toBeInViewport();
  await expect(page.getByTestId('pasar')).toBeInViewport();
});
