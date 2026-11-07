import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezarJass(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'jass');
  await page.getByTestId('empezar').click();
}

/** Las cartas de la mano se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const ids = (loc: ReturnType<typeof cartasMano>) =>
  loc.evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));

async function jugarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Elegir el modo y jugar ───────────────────────────────────────────────────

test('elegir el modo y salir con una carta', async ({ page }) => {
  await empezarJass(page, 'rapido&semilla=jass-e2e');
  await expect(cartasMano(page)).toHaveCount(9);
  // Elige el asiento 0: los seis modos y Schieben.
  for (const m of ['diamantes', 'treboles', 'corazones', 'picas', 'obenabe', 'undenufe'])
    await expect(page.getByTestId(`modo-${m}`)).toBeVisible();
  await expect(page.getByTestId('pasar')).toBeVisible();
  await page.screenshot({ path: `test-results/jass-eleccion-${page.viewportSize()!.width}.png` });
  await page.getByTestId('modo-obenabe').click();
  await expect(page.getByTestId('modo-jass')).toContainText('Obenabe ×3');
  // Sale quien eligió: todas las cartas se pueden jugar.
  await expect(jugables(page)).toHaveCount(9);
  await page.screenshot({ path: `test-results/jass-mesa-${page.viewportSize()!.width}.png` });
  const carta = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugarPrimera(page);
  await expect(cartasMano(page)).toHaveCount(8);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('Schieben: elige el compañero y sale quien pasó', async ({ page }) => {
  await empezarJass(page, 'rapido&semilla=jass-pasar');
  await page.getByTestId('pasar').click();
  await expect(page.getByTestId('modo-jass')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('pasar')).toHaveCount(0);
  // Sale el jugador, aunque haya pasado.
  await expect(jugables(page)).toHaveCount(9);
});

test('partida de Jass completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(900_000);
  await empezarJass(page, 'rapido&semilla=jass-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 4_000; paso++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="modo-picas"], [data-testid="mano"] .carta-mano.jugable',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-jass')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/jass-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await page.getByTestId('modo-picas').isVisible()) {
      await page
        .getByTestId('modo-picas')
        .click()
        .catch(() => {});
      continue;
    }
    await jugables(page)
      .first()
      .click({ ...ESQUINA, timeout: 5_000 })
      .then(() => page.getByTestId('mesa').click({ timeout: 5_000 }))
      .catch(() => {});
  }
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-jass')).toBeVisible();
  await page.screenshot({ path: `test-results/jass-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Jass se continúa con la misma mano', async ({ page }) => {
  await empezarJass(page, 'semilla=jass-retomar');
  await expect(page.getByTestId('modo-picas')).toBeVisible();
  const antes = await ids(cartasMano(page));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(9);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Jass entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarJass(page, 'semilla=pequena');
  await expect(page.getByTestId('modo-picas')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(page.getByTestId('modo-undenufe')).toBeInViewport();
  await expect(cartasMano(page).first()).toBeInViewport();
  await expect(cartasMano(page).last()).toBeInViewport();
  await page.screenshot({ path: 'test-results/jass-360.png' });
});
