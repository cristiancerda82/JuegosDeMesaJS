import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'briscolaChiamata');
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

/** Responde a lo que pida la mesa: pasa, llama en oros o juega la primera carta. */
async function responder(page: Page) {
  for (const id of ['pasar', 'puja-0', 'llamar-oros']) {
    const b = page.getByTestId(id);
    if (await b.isVisible()) {
      await b.click();
      return;
    }
  }
  if (await jugables(page).first().isVisible()) await tocarPrimera(page).catch(() => {});
}

/** Sube la puja de puntos hasta `puntos` con el botón +. */
async function subirPuntos(page: Page, puntos: number) {
  const pujar = page.getByTestId('pujar-puntos');
  while (!((await pujar.textContent()) ?? '').includes(`${puntos}`)) {
    await page.getByTestId('puntos-mas').click();
  }
}

// ── Subasta y llamada ────────────────────────────────────────────────────────

test('pujar 2 con 120 y llamar una carta', async ({ page }) => {
  await empezar(page, 'semilla=chiamata-pujar');
  await expect(mano(page)).toHaveCount(8);
  await expect(page.getByTestId('puja-0')).toBeVisible();
  await page.screenshot({
    path: `test-results/chiamata-subasta-${page.viewportSize()!.width}.png`,
  });
  // Con 120 nadie puede pujar más.
  await subirPuntos(page, 120);
  await page.getByTestId('pujar-puntos').click();
  await page.getByTestId('llamar-oros').click({ timeout: 30_000 });
  await expect(page.getByTestId('llamada-chiamata')).toContainText('2 de oros');
  await expect(page.getByTestId('puja-chiamata')).toContainText('Tu puja: 2 con 120');
  await expect(page.getByTestId('companero-chiamata')).toBeVisible();
});

test('pasar y ver el resumen de la mano', async ({ page }) => {
  test.setTimeout(180_000);
  await empezar(page, 'rapido&semilla=chiamata-pasar');
  await page.getByTestId('pasar').click();
  for (let i = 0; i < 800; i++) {
    if (await page.getByTestId('panel-mano').isVisible()) break;
    await responder(page);
    await page.waitForTimeout(50);
  }
  await expect(page.getByTestId('panel-mano')).toBeVisible();
  await expect(page.getByTestId('resumen-chiamata')).toBeVisible();
  await expect(page.getByTestId('resumen-companero')).toBeVisible();
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Briscola Chiamata completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=chiamata-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 6_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="panel-chiamata"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-chiamata')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    await responder(page);
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBe(4);
  await expect(fin.getByTestId('puntos-chiamata')).toBeVisible();
  await page.screenshot({ path: `test-results/chiamata-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Briscola Chiamata se continúa con la misma mano', async ({
  page,
}) => {
  await empezar(page, 'semilla=chiamata-retomar');
  await expect(mano(page)).toHaveCount(8);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(8);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('la Briscola Chiamata entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=chiamata-pequena');
  await expect(page.getByTestId('puja-0')).toBeVisible();
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  for (const id of ['puja-0', 'puja-9', 'pujar-puntos', 'puntos-mas', 'pasar'])
    await expect(page.getByTestId(id)).toBeInViewport();
  for (const a of [1, 2, 3, 4]) await expect(page.getByTestId(`asiento-${a}`)).toBeInViewport();
  await page.screenshot({ path: 'test-results/chiamata-360.png' });
  await subirPuntos(page, 120);
  await page.getByTestId('pujar-puntos').click();
  await page.getByTestId('llamar-copas').click({ timeout: 30_000 });
  await sinScroll();
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/chiamata-360-bazas.png' });
});
