import { expect, test, type Page } from '@playwright/test';

async function empezarBlackjack(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-blackjack').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

const cartasMano = (page: Page, mano = 0) => page.locator(`[data-testid="mano-0-${mano}"] .naipe`);

/** Apuesta 10 y espera a que le toque jugar (o a que la mano termine sin jugar). */
async function apostarYEsperar(page: Page) {
  await page.getByTestId('apostar-10').click();
  await page
    .locator('[data-testid="pedir"], [data-testid="siguiente-mano"]')
    .first()
    .waitFor({ timeout: 30_000 });
}

// ── Apostar, pedir, doblar y separar ─────────────────────────────────────────

test('apostar, pedir y plantarse', async ({ page }) => {
  await empezarBlackjack(page, 'rapido&semilla=jugar-0');
  await expect(page.getByTestId('turno')).toContainText('apuestas');
  await expect(page.getByTestId('apostar-20')).toBeVisible();
  await page.screenshot({ path: 'test-results/blackjack-apuesta.png' });
  await apostarYEsperar(page);
  await expect(page.getByTestId('apuesta-0')).toHaveText('apuesta 10');
  await expect(cartasMano(page)).toHaveCount(2);
  await expect(page.locator('[data-testid="banca"] .naipe')).toHaveCount(2);
  await page.screenshot({ path: 'test-results/blackjack-mesa.png' });
  await page.getByTestId('pedir').click();
  await expect(cartasMano(page)).toHaveCount(3);
  // Si no se ha pasado ni llegado a 21, se planta.
  if (await page.getByTestId('plantarse').isVisible()) await page.getByTestId('plantarse').click();
  await expect(page.getByTestId('siguiente-mano')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('resumen-blackjack')).toBeVisible();
  await page.screenshot({ path: 'test-results/blackjack-resumen.png' });
});

test('doblar recibe una sola carta y dobla la apuesta', async ({ page }) => {
  await empezarBlackjack(page, 'rapido&semilla=jugar-0');
  await apostarYEsperar(page);
  await page.getByTestId('doblar').click();
  await expect(page.getByTestId('siguiente-mano')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('resultado-0-0')).toBeVisible();
  const ganancia = await page.getByTestId('ganancia-0').textContent();
  expect(['+20', '-20', '0', '+30']).toContain(ganancia?.trim());
});

test('separar una pareja en dos manos', async ({ page }) => {
  await empezarBlackjack(page, 'rapido&semilla=separar-0');
  await apostarYEsperar(page);
  await page.getByTestId('separar').click();
  await expect(page.getByTestId('mano-0-1')).toBeVisible();
  await expect(page.getByTestId('mano-0-0')).toHaveClass(/jugando/);
  await page.screenshot({ path: 'test-results/blackjack-separar.png' });
  await page.getByTestId('plantarse').click();
  if (await page.getByTestId('plantarse').isVisible()) {
    await expect(page.getByTestId('mano-0-1')).toHaveClass(/jugando/);
    await page.getByTestId('plantarse').click();
  }
  await expect(page.getByTestId('siguiente-mano')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('resultado-0-1')).toBeVisible();
});

test('partida de Blackjack completa contra la IA', async ({ page }) => {
  test.setTimeout(240_000);
  await empezarBlackjack(page, 'rapido&semilla=blackjack-completa');
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 500; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="apostar-2"], [data-testid="pedir"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('apostar-2').isVisible()) {
      await page.getByTestId('apostar-2').click();
    } else {
      await page.getByTestId('plantarse').click();
    }
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('fichas-fin-0')).toBeVisible();
  await page.screenshot({ path: 'test-results/blackjack-fin.png' });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Blackjack se continúa con la misma mano', async ({ page }) => {
  await empezarBlackjack(page, 'rapido&semilla=jugar-0');
  await apostarYEsperar(page);
  const antes = await cartasMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(antes.length);
  for (const c of antes) {
    await expect(page.locator(`[data-testid="mano-0-0"] [data-carta="${c}"]`)).toBeVisible();
  }
});

test('el Blackjack de 4 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarBlackjack(page, 'rapido&semilla=pequena', 4);
  await apostarYEsperar(page);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`puesto-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/blackjack4-360.png' });
});
