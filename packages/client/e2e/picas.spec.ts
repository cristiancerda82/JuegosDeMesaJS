import { expect, test, type Page } from '@playwright/test';

async function empezarPicas(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-picas').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas de la mano se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

// ── Apostar y jugar ──────────────────────────────────────────────────────────

test('apostar y salir a la primera baza sin poder salir de picas', async ({ page }) => {
  await empezarPicas(page, 'rapido&semilla=picas-e2e');
  await expect(cartasMano(page)).toHaveCount(13);
  const panel = page.getByTestId('panel-apuesta');
  await expect(panel).toBeVisible();
  await page.screenshot({ path: 'test-results/picas-apuesta.png' });
  await page.getByTestId('apostar-4').click();
  await expect(panel).toBeHidden();

  // Tras las apuestas de la IA, el jugador sale: sus picas no se pueden tocar.
  await expect(jugables(page).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('contrato-0')).toContainText('0 de');
  const picas = await cartasMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')).filter((c) => c?.startsWith('picas-')),
  );
  const conPicas = await jugables(page).evaluateAll((els) =>
    els.some((e) => e.getAttribute('data-carta')?.startsWith('picas-')),
  );
  if (picas.length > 0 && picas.length < 13) expect(conPicas).toBe(false);
  await page.screenshot({ path: 'test-results/picas-mesa.png' });

  const carta = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
  await expect(cartasMano(page)).toHaveCount(12);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('partida de Picas completa contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezarPicas(page, 'rapido&semilla=picas-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 2_000; paso++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="panel-apuesta"], [data-testid="mano"] .carta-mano.jugable',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      if (manos === 0) await page.screenshot({ path: 'test-results/picas-resumen.png' });
      manos++;
      await expect(page.getByTestId('resumen-picas')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    if (await page.getByTestId('panel-apuesta').isVisible()) {
      await page.getByTestId('apostar-3').click();
      continue;
    }
    // Se elige la carta y se toca la mesa para jugarla.
    await jugables(page)
      .first()
      .click({ ...ESQUINA, timeout: 5_000 })
      .then(() => page.getByTestId('mesa').click({ timeout: 5_000 }))
      .catch(() => {});
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('puntos-0')).toBeVisible();
  await page.screenshot({ path: 'test-results/picas-fin.png' });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Picas se continúa con la misma mano', async ({ page }) => {
  await empezarPicas(page, 'rapido&semilla=picas-retomar');
  await page.getByTestId('apostar-2').click();
  await expect(jugables(page).first()).toBeVisible({ timeout: 30_000 });
  const antes = await cartasMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(13);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
  await expect(page.getByTestId('contrato-0')).toContainText('de');
});

test('Picas entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarPicas(page, 'semilla=pequena');
  await expect(page.getByTestId('panel-apuesta')).toBeVisible();
  await page.screenshot({ path: 'test-results/picas-apuesta-360.png' });
  await page.getByTestId('apostar-3').click();
  await expect(jugables(page).first()).toBeVisible({ timeout: 30_000 });
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/picas-360.png' });
});
