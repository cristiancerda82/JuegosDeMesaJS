import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, jugadores = 4) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'polignac');
  if (jugadores !== 4) await page.getByTestId(`polignac-jugadores-${jugadores}`).check();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Toca la primera carta que se puede jugar. */
async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Juega hasta que sale el resumen de la mano (o el fin): pasa el general y echa cartas. */
async function hastaElResumen(page: Page) {
  for (let i = 0; i < 300; i++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="pasar-general"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) return;
    if (await page.getByTestId('fin').isVisible()) return;
    if (await page.getByTestId('pasar-general').isVisible()) {
      await page.getByTestId('pasar-general').click();
    } else await tocarPrimera(page).catch(() => {});
  }
}

// ── General, bazas y resumen ─────────────────────────────────────────────────

test('pasar el general, jugar las bazas y ver el resumen de la mano', async ({ page }) => {
  await empezar(page, 'rapido&semilla=polignac-pasar');
  await expect(mano(page)).toHaveCount(8);
  // Reparte el jugador (asiento 0): decide el último.
  await expect(page.getByTestId('anunciar-general')).toBeVisible();
  await page.screenshot({
    path: `test-results/polignac-general-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('pasar-general').click();
  await expect(page.getByTestId('panel-general')).toBeHidden();
  await hastaElResumen(page);
  await expect(page.getByTestId('resumen-polignac')).toBeVisible();
  await page.screenshot({
    path: `test-results/polignac-resumen-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('mano-polignac')).toContainText('Mano 2');
});

test('con 6 jugadores se reparten 5 cartas y se ven los cinco rivales', async ({ page }) => {
  await empezar(page, 'semilla=polignac-seis', 6);
  await expect(mano(page)).toHaveCount(5);
  for (const a of [1, 2, 3, 4, 5]) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
});

// ── Partidas completas ───────────────────────────────────────────────────────

for (const jugadores of [4, 6]) {
  test(`partida de Polignac completa con ${jugadores} jugadores contra la IA`, async ({ page }) => {
    test.setTimeout(600_000);
    await empezar(page, `rapido&semilla=polignac-completa-${jugadores}`, jugadores);
    let manos = 0;
    for (let i = 0; i < 200 && !(await page.getByTestId('fin').isVisible()); i++) {
      await hastaElResumen(page);
      if (await page.getByTestId('panel-mano').isVisible()) {
        manos++;
        await page.getByTestId('siguiente-mano').click();
      }
    }
    const fin = page.getByTestId('fin');
    await expect(fin).toBeVisible();
    expect(manos).toBeGreaterThan(0);
    await expect(fin.getByTestId('puntos-polignac')).toBeVisible();
    await expect(fin.locator('[data-testid^="puntos-fin-"]')).toHaveCount(jugadores);
    await page.screenshot({
      path: `test-results/polignac-fin-${jugadores}-${page.viewportSize()!.width}.png`,
    });
  });
}

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Polignac se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=polignac-retomar');
  await expect(mano(page)).toHaveCount(8);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(8);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

for (const jugadores of [4, 6]) {
  test(`el Polignac con ${jugadores} entra en 360 × 640 sin scroll horizontal`, async ({
    page,
  }) => {
    test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
    await empezar(page, `semilla=polignac-pequena-${jugadores}`, jugadores);
    // Antes que el jugador, que reparte, deciden todas las IA.
    await expect(page.getByTestId('anunciar-general')).toBeVisible({ timeout: 30_000 });
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    await expect(page.getByTestId('pasar-general')).toBeInViewport();
    await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
    await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
    await page.screenshot({ path: `test-results/polignac-360-${jugadores}.png` });
  });
}
