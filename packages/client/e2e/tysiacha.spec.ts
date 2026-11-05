import { expect, test, type Page } from '@playwright/test';
import {
  BONO_PRIKUP_TYSIACHA,
  CONFIG_TYSIACHA_POR_DEFECTO,
  topeTysiacha,
  tysiacha,
  valorManoTysiacha,
} from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-tysiacha').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Toca la primera carta que se puede jugar o dar. */
async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Lo más alto que puja la IA normal con esta mano. */
const hastaDondePuja = (m: readonly string[]) =>
  Math.min(valorManoTysiacha(m as never) + BONO_PRIKUP_TYSIACHA, topeTysiacha(m as never));

/**
 * Una semilla en la que el asiento 1 pasa y el 2 puja 105 pero no 110: así el jugador sube a 110
 * y gana la subasta.
 */
function semillaSubasta() {
  for (let i = 0; i < 2000; i++) {
    const semilla = `tysiacha-subasta-${i}`;
    const r = tysiacha.crear(CONFIG_TYSIACHA_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    const [, m1, m2] = r.valor.manos;
    const p1 = hastaDondePuja(m1!);
    const p2 = hastaDondePuja(m2!);
    if (p1 < 105 && p2 >= 105 && p2 < 115) return semilla;
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

// ── Subasta, dar y contrato ──────────────────────────────────────────────────

test('pujar, ganar la subasta, dar las cartas y fijar el contrato', async ({ page }) => {
  await empezar(page, `semilla=${semillaSubasta()}`);
  await expect(mano(page)).toHaveCount(7);
  await expect(page.locator('[data-prikup="oculta"]')).toHaveCount(3);
  // Abre el jugador con 100; el 1 pasa, el 2 sube a 105 y le toca al jugador.
  await expect(page.getByTestId('pujar')).toHaveText('Pujar 110', { timeout: 30_000 });
  await page.screenshot({
    path: `test-results/tysiacha-subasta-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('pujar').click();
  // El 2 pasa: el prikup se enseña y pasa a la mano del jugador.
  await expect(mano(page)).toHaveCount(10, { timeout: 30_000 });
  await expect(page.locator('[data-prikup]:not([data-prikup="oculta"])')).toHaveCount(3);
  await expect(page.getByTestId('contrato-tysiacha')).toContainText('110');
  await tocarPrimera(page);
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(8);
  await expect(page.getByTestId('fijar')).toHaveText('Fijar 110');
  await page.screenshot({
    path: `test-results/tysiacha-contrato-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('fijar').click();
  // Sale el jugador.
  await expect(jugables(page)).toHaveCount(8);
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(7);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Tysiącha completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=tysiacha-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 20_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="pasar"], [data-testid="fijar"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-tysiacha')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('pasar').isVisible()) {
      await page.getByTestId('pasar').click();
    } else if (await page.getByTestId('fijar').isVisible()) {
      await page.getByTestId('fijar').click();
    } else {
      await tocarPrimera(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-tysiacha')).toBeVisible();
  await page.screenshot({ path: `test-results/tysiacha-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Tysiącha se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=tysiacha-retomar');
  await expect(mano(page)).toHaveCount(7);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(7);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Tysiącha entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, `semilla=${semillaSubasta()}`);
  await expect(page.getByTestId('pujar')).toBeVisible({ timeout: 30_000 });
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  await expect(page.getByTestId('pujar')).toBeInViewport();
  await expect(page.getByTestId('pasar')).toBeInViewport();
  await page.screenshot({ path: 'test-results/tysiacha-360-subasta.png' });
  await page.getByTestId('pujar').click();
  await expect(mano(page)).toHaveCount(10, { timeout: 30_000 });
  await sinScroll();
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await tocarPrimera(page);
  await tocarPrimera(page);
  await expect(page.getByTestId('fijar')).toBeVisible();
  await sinScroll();
  await expect(page.getByTestId('fijar')).toBeInViewport();
  await expect(page.getByTestId('contrato-mas')).toBeInViewport();
  await page.screenshot({ path: 'test-results/tysiacha-360-contrato.png' });
});
