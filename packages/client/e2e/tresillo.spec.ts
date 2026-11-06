import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-tresillo').click();
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

// ── Pujar, elegir el triunfo y cambiar ───────────────────────────────────────

test('pujar la entrada, elegir oros y cambiar tres cartas', async ({ page }) => {
  // Con esta semilla, los dos rivales pasan tras la entrada.
  await empezar(page, 'semilla=tresillo-cambio-0');
  await expect(mano(page)).toHaveCount(9);
  await expect(page.getByTestId('bote')).toContainText('3');
  await expect(page.getByTestId('fichas')).toContainText('99');
  await expect(page.getByTestId('monte')).toContainText('13');
  await page.screenshot({
    path: `test-results/tresillo-subasta-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('pujar-entrada').click();
  await page.getByTestId('triunfo-oros').click({ timeout: 30_000 });
  await expect(page.getByTestId('contrato-tresillo')).toContainText('Entrada en oros');
  await expect(page.getByTestId('robar')).toHaveText('No cambiar');
  const antes = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  for (let i = 0; i < 3; i++) await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(6);
  await expect(page.getByTestId('robar')).toHaveText('Cambiar 3');
  await page.getByTestId('robar').click();
  await expect(mano(page)).toHaveCount(9);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')!),
  );
  expect(despues.filter((c) => !antes.includes(c))).toHaveLength(3);
});

test('pasar y ver el resumen de la mano', async ({ page }) => {
  await empezar(page, 'rapido&semilla=tresillo-pasar');
  await page.getByTestId('pasar').click();
  await expect(page.getByTestId('panel-mano')).toBeVisible({ timeout: 90_000 });
  await expect(page.getByTestId('resumen-linea')).toContainText(/Sacada|Puesta|Codillo|Pasan/);
  await expect(page.getByTestId('resumen-tresillo')).toBeVisible();
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Tresillo completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=tresillo-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 5_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="panel-subasta"], [data-testid="panel-triunfo"], [data-testid="robar"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-tresillo')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('panel-subasta').isVisible()) {
      // Puja la entrada si puede; si no, pasa.
      const entrada = page.getByTestId('pujar-entrada');
      if (await entrada.isVisible()) await entrada.click();
      else await page.getByTestId('pasar').click();
    } else if (await page.getByTestId('panel-triunfo').isVisible()) {
      await page.getByTestId('triunfo-oros').click();
    } else if (await page.getByTestId('robar').isVisible()) {
      await page.getByTestId('robar').click();
    } else {
      await tocarPrimera(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-tresillo')).toBeVisible();
  await page.screenshot({ path: `test-results/tresillo-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Tresillo se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=tresillo-retomar');
  await expect(mano(page)).toHaveCount(9);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(9);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Tresillo entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=tresillo-cambio-0');
  await expect(page.getByTestId('pujar-solo')).toBeVisible();
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  for (const id of ['pujar-entrada', 'pujar-vuelta', 'pujar-solo', 'pasar']) {
    await expect(page.getByTestId(id)).toBeInViewport();
  }
  for (const a of [1, 2]) await expect(page.getByTestId(`asiento-${a}`)).toBeInViewport();
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/tresillo-360.png' });
  await page.getByTestId('pujar-entrada').click();
  await page.getByTestId('triunfo-oros').click({ timeout: 30_000 });
  await expect(page.getByTestId('robar')).toBeVisible();
  await sinScroll();
  await expect(page.getByTestId('robar')).toBeInViewport();
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/tresillo-360-cambio.png' });
});
