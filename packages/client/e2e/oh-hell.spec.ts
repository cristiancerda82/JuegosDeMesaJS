import { expect, test, type Page } from '@playwright/test';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-ohHell').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByTestId('empezar').click();
}

async function jugarCarta(page: Page) {
  await page.locator('.carta-mano.jugable').first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Apuesta lo primero que puede y juega cartas hasta que sale el resultado de la mano. */
async function terminarMano(page: Page) {
  for (let pasos = 0; pasos < 500; pasos++) {
    await page
      .locator('.carta-mano.jugable, [data-testid^="apostar-"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) return;
    const apuesta = page.locator('[data-testid^="apostar-"]').first();
    if (await apuesta.isVisible()) await apuesta.click({ timeout: 2_000 }).catch(() => {});
    else await jugarCarta(page).catch(() => {});
  }
}

// ── Apostar y jugar ──────────────────────────────────────────────────────────

test('apostar y jugar una baza', async ({ page }) => {
  await empezar(page, 'semilla=oh-hell-apostar');
  await expect(page.locator('.carta-mano')).toHaveCount(12);
  await expect(page.getByTestId('triunfo')).toContainText('Triunfo');
  await expect(page.getByTestId('mano-oh-hell')).toHaveText('Mano 1 de 23 · 12 cartas');
  await page.screenshot({ path: `test-results/oh-hell-mesa-${page.viewportSize()!.width}.png` });
  // Apuesta primero el jugador, a la izquierda del repartidor: de 0 a 12.
  await expect(page.locator('[data-testid^="apostar-"]')).toHaveCount(13);
  await page.getByTestId('apostar-2').click();
  await expect(page.getByTestId('detalle-propio')).toContainText('apuesta 2');
  // Cuando apuestan todos, sale el jugador.
  await expect(page.locator('.carta-mano.jugable')).not.toHaveCount(0, { timeout: 15_000 });
  await jugarCarta(page);
  await expect(page.locator('.carta-mano')).toHaveCount(11);
});

test('el resumen de la mano y la apuesta prohibida al repartidor', async ({ page }) => {
  test.setTimeout(180_000);
  await empezar(page, 'rapido&semilla=oh-hell-prohibida');
  await terminarMano(page);
  await expect(page.getByTestId('resumen-oh-hell')).toBeVisible();
  await page.screenshot({ path: `test-results/oh-hell-resumen-${page.viewportSize()!.width}.png` });
  await page.getByTestId('siguiente-mano').click();
  // En la segunda mano reparte el jugador: apuesta el último y tiene una prohibida.
  await expect(page.getByTestId('apuesta-prohibida')).toBeVisible({ timeout: 30_000 });
  const texto = (await page.getByTestId('apuesta-prohibida').innerText()).match(/\d+/)![0];
  await expect(page.getByTestId(`apostar-${texto}`)).toHaveCount(0);
  await expect(page.locator('[data-testid^="apostar-"]')).toHaveCount(11);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Oh Hell completa con 7 jugadores', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=oh-hell-completa', 7);
  let manos = 0;
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid^="apostar-"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.locator('[data-testid^="apostar-"]').first().isVisible()) {
      await page
        .locator('[data-testid^="apostar-"]')
        .first()
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else {
      await jugarCarta(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  // Con 7 jugadores: 7… 1… 7, 13 manos (la última sale en el fin).
  expect(manos).toBe(12);
  await expect(fin.getByTestId('resumen-oh-hell')).toBeVisible();
  await page.screenshot({ path: `test-results/oh-hell-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Oh Hell se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=oh-hell-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(12);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Oh Hell con 7 jugadores entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena', 7);
  await expect(page.locator('.carta-mano')).toHaveCount(7);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('apostar-0')).toBeInViewport();
  await page.screenshot({ path: 'test-results/oh-hell-360.png' });
});
