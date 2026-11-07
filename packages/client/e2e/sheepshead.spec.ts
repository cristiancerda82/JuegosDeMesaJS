import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import { cogeSheepshead, CONFIG_SHEEPSHEAD_POR_DEFECTO, sheepshead } from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'sheepshead');
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Toca la primera carta que se puede jugar o enterrar. */
async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Una semilla en la que ninguna IA coge el blind: si el jugador pasa, hay leaster. */
function semillaLeaster() {
  for (let i = 0; i < 2000; i++) {
    const semilla = `sheepshead-leaster-${i}`;
    const r = sheepshead.crear(CONFIG_SHEEPSHEAD_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    if (r.valor.manos.slice(1).every((m) => !cogeSheepshead(m))) return semilla;
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

// ── Coger, enterrar y leaster ────────────────────────────────────────────────

test('coger el blind, enterrar 2 cartas y salir', async ({ page }) => {
  await empezar(page, 'semilla=sheepshead-coger');
  await expect(mano(page)).toHaveCount(6);
  await expect(page.getByTestId('blind')).toBeVisible();
  await page.screenshot({
    path: `test-results/sheepshead-coger-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('coger').click();
  await expect(mano(page)).toHaveCount(8);
  await expect(page.getByTestId('bando')).toContainText('Picker: Tú');
  await tocarPrimera(page);
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(6);
  // Sale el jugador, el siguiente al que reparte.
  await expect(jugables(page)).toHaveCount(6);
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(5);
});

test('si nadie coge se juega el leaster, con su resumen', async ({ page }) => {
  await empezar(page, `rapido&semilla=${semillaLeaster()}`);
  await page.getByTestId('pasar').click();
  await expect(page.getByTestId('bando')).toContainText('Leaster', { timeout: 30_000 });
  for (let i = 0; i < 200; i++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) break;
    await tocarPrimera(page).catch(() => {});
  }
  await expect(page.getByTestId('resumen-linea')).toContainText('Leaster');
  await expect(page.getByTestId('resumen-sheepshead')).toBeVisible();
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Sheepshead completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=sheepshead-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 5_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="pasar"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-sheepshead')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('pasar').isVisible()) {
      await page.getByTestId('pasar').click();
    } else {
      await tocarPrimera(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-sheepshead')).toBeVisible();
  await page.screenshot({ path: `test-results/sheepshead-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Sheepshead se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=sheepshead-retomar');
  await expect(mano(page)).toHaveCount(6);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(6);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Sheepshead entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=sheepshead-pequena');
  await expect(page.getByTestId('coger')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('coger')).toBeInViewport();
  await expect(page.getByTestId('pasar')).toBeInViewport();
  for (const a of [1, 2, 3, 4]) await expect(page.getByTestId(`asiento-${a}`)).toBeInViewport();
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/sheepshead-360.png' });
});
