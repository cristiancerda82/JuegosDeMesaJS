import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'twentyNine');
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Responde a lo que pida la mesa: pasa, no dobla, elige picas, pide el triunfo o juega. */
async function responder(page: Page) {
  for (const id of [
    'pasar',
    'noDoblar',
    'noRedoblar',
    'triunfo-picas',
    'pedirTriunfo',
    'cantarPareja',
  ]) {
    const b = page.getByTestId(id);
    if (await b.isVisible()) {
      await b.click();
      return;
    }
  }
  if (await jugables(page).first().isVisible()) await tocarPrimera(page).catch(() => {});
}

// ── Subasta y triunfo ────────────────────────────────────────────────────────

test('pujar 28, elegir el triunfo en secreto y recibir las otras 4 cartas', async ({ page }) => {
  await empezar(page, 'semilla=twenty-pujar');
  await expect(mano(page)).toHaveCount(4);
  await expect(page.getByTestId('puja-16')).toBeVisible();
  await page.screenshot({ path: `test-results/twenty-subasta-${page.viewportSize()!.width}.png` });
  // Con 28 nadie puede pujar más.
  await page.getByTestId('puja-28').click();
  await page.getByTestId('triunfo-corazones').click({ timeout: 30_000 });
  await expect(page.getByTestId('triunfo-twenty')).toContainText('Corazones (secreto)');
  await expect(mano(page)).toHaveCount(8, { timeout: 30_000 });
  await expect(page.getByTestId('puja-twenty')).toContainText('Tu puja: 28');
});

test('pasar y ver el resumen de la mano', async ({ page }) => {
  test.setTimeout(180_000);
  await empezar(page, 'rapido&semilla=twenty-pasar');
  await page.getByTestId('pasar').click();
  for (let i = 0; i < 600; i++) {
    if (await page.getByTestId('panel-mano').isVisible()) break;
    await responder(page);
    await page.waitForTimeout(50);
  }
  await expect(page.getByTestId('panel-mano')).toBeVisible();
  await expect(page.getByTestId('resumen-twenty')).toBeVisible();
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Twenty-Nine completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=twenty-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 6_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="panel-twenty"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-twenty')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    await responder(page);
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-twenty')).toBeVisible();
  await page.screenshot({ path: `test-results/twenty-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Twenty-Nine se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=twenty-retomar');
  await expect(mano(page)).toHaveCount(4);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(4);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Twenty-Nine entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=twenty-pequena');
  await expect(page.getByTestId('puja-16')).toBeVisible();
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  for (const id of ['puja-16', 'puja-28', 'pasar'])
    await expect(page.getByTestId(id)).toBeInViewport();
  for (const a of [1, 2, 3]) await expect(page.getByTestId(`asiento-${a}`)).toBeInViewport();
  await page.screenshot({ path: 'test-results/twenty-360.png' });
  await page.getByTestId('puja-28').click();
  await page.getByTestId('triunfo-sin').click({ timeout: 30_000 });
  await expect(mano(page)).toHaveCount(8, { timeout: 30_000 });
  await sinScroll();
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/twenty-360-bazas.png' });
});
