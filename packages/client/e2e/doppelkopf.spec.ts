import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-doppelkopf').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const reservas = (page: Page) => page.locator('[data-testid^="reserva-"]');

async function jugarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Dice «sano» si puede (si no, la primera reserva) y espera a que empiecen las bazas. */
async function reservar(page: Page) {
  await expect(reservas(page).first()).toBeVisible({ timeout: 30_000 });
  const sano = page.getByTestId('reserva-sano');
  await ((await sano.isVisible()) ? sano : reservas(page).first()).click();
  await expect(page.getByTestId('tipo-juego')).not.toHaveText('Reservas', { timeout: 30_000 });
}

// ── Reservas, bazas y anuncios ───────────────────────────────────────────────

test('las reservas y una baza', async ({ page }) => {
  test.setTimeout(120_000);
  await empezar(page, 'semilla=doppelkopf-baza');
  await expect(mano(page)).toHaveCount(12);
  await expect(page.getByTestId('mano-ronda')).toHaveText('Mano 1 de 8');
  await page.screenshot({
    path: `test-results/doppelkopf-reservas-${page.viewportSize()!.width}.png`,
  });
  await reservar(page);
  await expect(jugables(page).first()).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: `test-results/doppelkopf-mesa-${page.viewportSize()!.width}.png` });
  await jugarPrimera(page);
  await expect(mano(page)).toHaveCount(11);
});

test('anunciar Re o Contra', async ({ page }) => {
  test.setTimeout(120_000);
  await empezar(page, 'semilla=doppelkopf-anuncio');
  await reservar(page);
  const anunciar = page.getByTestId('anunciar');
  await expect(anunciar).toBeVisible({ timeout: 30_000 });
  await expect(anunciar).toHaveText(/«(Re|Contra)»/);
  await anunciar.click();
  // Hecho el anuncio del bando, el siguiente es la primera bajada.
  await expect(anunciar).toHaveText('Anunciar «No 90»');
});

// ── Resumen y partida completa ───────────────────────────────────────────────

test('partida de Doppelkopf completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=doppelkopf-completa');
  const fin = page.getByTestId('fin');
  let resumenes = 0;
  for (let paso = 0; paso < 3_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid^="reserva-"], [data-testid="mano"] .carta-mano.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-doppelkopf')).toBeVisible();
      if (resumenes++ === 0) {
        await page.screenshot({
          path: `test-results/doppelkopf-resumen-${page.viewportSize()!.width}.png`,
        });
      }
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    const reserva = reservas(page).first();
    if ((await reserva.count()) > 0 && (await reserva.isVisible())) {
      const sano = page.getByTestId('reserva-sano');
      await ((await sano.isVisible()) ? sano : reserva).click().catch(() => {});
      continue;
    }
    await jugarPrimera(page).catch(() => {});
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('puntos-doppelkopf')).toBeVisible();
  expect(resumenes).toBeGreaterThan(0);
  await page.screenshot({ path: `test-results/doppelkopf-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Doppelkopf se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=doppelkopf-retomar');
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

test('el Doppelkopf entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await expect(mano(page)).toHaveCount(12);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/doppelkopf-360.png' });
  await expect(mano(page).last()).toBeInViewport();
  await expect(reservas(page).last()).toBeInViewport();
});
