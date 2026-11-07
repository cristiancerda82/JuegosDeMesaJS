import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezarFiveHundred(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'fiveHundred');
  await page.getByTestId('empezar').click();
}

/** Las cartas de la mano se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const ids = (loc: ReturnType<typeof cartasMano>) =>
  loc.evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));

async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Subasta, viuda y bazas ───────────────────────────────────────────────────

test('pujar alto, quedarse la viuda, descartarse y salir', async ({ page }) => {
  test.setTimeout(120_000);
  await empezarFiveHundred(page, 'rapido&semilla=quinientos-e2e');
  await expect(cartasMano(page)).toHaveCount(10);
  await expect(page.getByTestId('subasta')).toBeVisible();
  await page.screenshot({ path: `test-results/500-subasta-${page.viewportSize()!.width}.png` });
  // 10 sin triunfo no lo supera nadie: el jugador gana la subasta.
  await page.getByTestId('nivel-10').click();
  await page.getByTestId('puja-10-sin').click();
  await expect(cartasMano(page)).toHaveCount(13, { timeout: 30_000 });
  for (let i = 0; i < 3; i++) await tocarPrimera(page);
  await expect(cartasMano(page)).toHaveCount(10);
  await expect(page.getByTestId('contrato-500')).toContainText('10 sin triunfo');
  // Sale el jugador: todas se pueden jugar (el comodín, nombrando palo).
  await expect(jugables(page)).toHaveCount(10);
  await page.screenshot({ path: `test-results/500-mesa-${page.viewportSize()!.width}.png` });
  const carta = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
  if (await page.getByTestId('palo-picas').isVisible())
    await page.getByTestId('palo-picas').click();
  await expect(cartasMano(page)).toHaveCount(9);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('partida de Five Hundred completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(900_000);
  await empezarFiveHundred(page, 'rapido&semilla=quinientos-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 6_000; paso++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="pasar"], [data-testid="palo-picas"], [data-testid="mano"] .carta-mano.jugable',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('panel-mano')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/500-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    // En la subasta, la primera puja que se pueda; si ya hay una, pasa.
    if (await page.getByTestId('pasar').isVisible()) {
      const hayPuja = await page.getByTestId('contrato-500').isVisible();
      const puja = page.locator('[data-testid="subasta"] .puja:not([disabled])').first();
      await (hayPuja ? page.getByTestId('pasar') : puja).click().catch(() => {});
      continue;
    }
    if (await page.getByTestId('palo-picas').isVisible()) {
      await page
        .getByTestId('palo-picas')
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
  await expect(fin.getByTestId('puntos-500')).toBeVisible();
  await page.screenshot({ path: `test-results/500-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Five Hundred se continúa con la misma mano', async ({ page }) => {
  await empezarFiveHundred(page, 'semilla=quinientos-retomar');
  await expect(page.getByTestId('subasta')).toBeVisible();
  const antes = await ids(cartasMano(page));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(10);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Five Hundred entra en 360 × 640 sin scroll horizontal, con la tabla de pujas', async ({
  page,
}) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarFiveHundred(page, 'semilla=pequena');
  await expect(page.getByTestId('subasta')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(page.getByTestId('nivel-10')).toBeInViewport();
  await expect(page.getByTestId('puja-6-sin')).toBeInViewport();
  await expect(page.getByTestId('pasar')).toBeInViewport();
  // La mano se ve entera, no solo asomando.
  await expect(cartasMano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(cartasMano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/500-360.png' });
});
