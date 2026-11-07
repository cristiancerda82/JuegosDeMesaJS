import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezarBarbu(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'barbu');
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

// ── Contratos ────────────────────────────────────────────────────────────────

test('elegir un contrato de bazas y salir', async ({ page }) => {
  await empezarBarbu(page, 'rapido&semilla=barbu-e2e');
  await expect(cartasMano(page)).toHaveCount(13);
  // Reparte el jugador: los siete contratos.
  for (const c of ['bazas', 'corazones', 'damas', 'rey', 'ultimas', 'triunfo', 'domino'])
    await expect(page.getByTestId(`contrato-${c}`)).toBeVisible();
  await page.screenshot({ path: `test-results/barbu-contrato-${page.viewportSize()!.width}.png` });
  await page.getByTestId('contrato-damas').click();
  await expect(page.getByTestId('contrato-barbu')).toHaveText('Sin damas');
  await expect(jugables(page)).toHaveCount(13);
  const carta = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugarPrimera(page);
  await expect(cartasMano(page)).toHaveCount(12);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('el triunfo pide el palo', async ({ page }) => {
  await empezarBarbu(page, 'rapido&semilla=barbu-triunfo');
  await page.getByTestId('contrato-triunfo').click();
  await page.getByTestId('triunfo-corazones').click();
  await expect(page.getByTestId('contrato-barbu')).toContainText('Triunfo de ♥ corazones');
  await expect(jugables(page)).toHaveCount(13);
});

test('el dominó: filas, jugar las cartas que encajan o pasar', async ({ page }) => {
  test.setTimeout(120_000);
  await empezarBarbu(page, 'rapido&semilla=barbu-domino');
  await page.getByTestId('contrato-domino').click();
  for (const palo of ['picas', 'corazones', 'diamantes', 'treboles'])
    await expect(page.getByTestId(`fila-${palo}`)).toBeVisible();
  await page.screenshot({ path: `test-results/barbu-domino-${page.viewportSize()!.width}.png` });
  // Juega o pasa unas cuantas veces: las jugables son siempre Jotas o cartas que encajan.
  for (let i = 0; i < 6; i++) {
    const algo = page.locator(
      '[data-testid="paso"], [data-testid="mano"] .carta-mano.jugable, [data-testid="siguiente-mano"]',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await page.getByTestId('siguiente-mano').isVisible()) break;
    if (await page.getByTestId('paso').isVisible()) {
      await page.getByTestId('paso').click();
      continue;
    }
    const antes = await cartasMano(page).count();
    await jugarPrimera(page);
    await expect(cartasMano(page)).toHaveCount(antes - 1);
  }
  await expect(page.locator('[data-testid="mesa"] [data-carta]').first()).toBeVisible();
});

test('partida de Barbu completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(900_000);
  await empezarBarbu(page, 'rapido&semilla=barbu-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 5_000; paso++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid^="contrato-"]:not([data-testid="contrato-barbu"]), [data-testid^="triunfo-"], [data-testid="paso"], [data-testid="mano"] .carta-mano.jugable',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      const resumen = page.getByTestId('resumen-barbu');
      await expect(resumen).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/barbu-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    const eleccion = page.locator(
      '.decisiones [data-testid^="contrato-"], .decisiones [data-testid^="triunfo-"]',
    );
    if (await eleccion.first().isVisible()) {
      await eleccion
        .first()
        .click()
        .catch(() => {});
      continue;
    }
    if (await page.getByTestId('paso').isVisible()) {
      await page
        .getByTestId('paso')
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
  await expect(fin.getByTestId('puntos-barbu')).toBeVisible();
  await page.screenshot({ path: `test-results/barbu-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Barbu se continúa con la misma mano', async ({ page }) => {
  await empezarBarbu(page, 'semilla=barbu-retomar');
  await expect(page.getByTestId('contrato-damas')).toBeVisible();
  const antes = await ids(cartasMano(page));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(13);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Barbu entra en 360 × 640 sin scroll horizontal, también el dominó', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarBarbu(page, 'semilla=pequena');
  await expect(page.getByTestId('contrato-domino')).toBeVisible();
  for (const fase of ['contrato', 'domino']) {
    if (fase === 'domino') {
      await page.getByTestId('contrato-domino').click();
      await expect(page.getByTestId('fila-picas')).toBeVisible();
    }
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
    await expect(cartasMano(page).first()).toBeInViewport();
    await expect(cartasMano(page).last()).toBeInViewport();
    await page.screenshot({ path: `test-results/barbu-360-${fase}.png` });
  }
});
