import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'rentz');
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Toca la primera carta que se puede jugar. */
async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/** Juega la mano hasta que sale su resumen: cartas, o pasar en el dominó. */
async function hastaElResumen(page: Page) {
  for (let i = 0; i < 300; i++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) return;
    if (await page.getByTestId('paso').isVisible()) await page.getByTestId('paso').click();
    else await tocarPrimera(page).catch(() => {});
  }
}

// ── Elegir contrato, bazas y dominó ──────────────────────────────────────────

test('elegir sin damas, jugar una baza y ver el resumen de la mano', async ({ page }) => {
  await empezar(page, 'rapido&semilla=rentz-damas');
  await expect(mano(page)).toHaveCount(8);
  await expect(page.getByTestId('contrato-positivo')).toBeVisible();
  await page.screenshot({ path: `test-results/rentz-elegir-${page.viewportSize()!.width}.png` });
  await page.getByTestId('contrato-damas').click();
  await expect(page.getByTestId('contrato-rentz')).toContainText('Sin damas');
  // Sale el jugador, que eligió.
  await expect(jugables(page)).toHaveCount(8);
  await tocarPrimera(page);
  await expect(mano(page)).toHaveCount(7);
  await hastaElResumen(page);
  await expect(page.getByTestId('resumen-contrato')).toContainText('Sin damas');
  await expect(page.getByTestId('resumen-rentz')).toBeVisible();
});

test('el dominó: filas desde la J, pasar y resumen', async ({ page }) => {
  await empezar(page, 'rapido&semilla=rentz-domino');
  await page.getByTestId('contrato-domino').click();
  await expect(page.getByTestId('fila-picas')).toBeVisible();
  await page.screenshot({ path: `test-results/rentz-domino-${page.viewportSize()!.width}.png` });
  await hastaElResumen(page);
  await expect(page.getByTestId('resumen-contrato')).toContainText('Dominó');
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Rentz completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=rentz-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 20_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid^="contrato-"]:not([data-testid="contrato-rentz"]), [data-testid="paso"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-rentz')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    const contratos = page.locator(
      '[data-testid^="contrato-"]:not([data-testid="contrato-rentz"])',
    );
    if ((await contratos.count()) > 0 && (await contratos.first().isVisible())) {
      await contratos.first().click();
    } else if (await page.getByTestId('paso').isVisible()) {
      await page.getByTestId('paso').click();
    } else {
      await tocarPrimera(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(20);
  await expect(fin.getByTestId('puntos-rentz')).toBeVisible();
  await page.screenshot({ path: `test-results/rentz-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Rentz se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=rentz-retomar');
  await expect(mano(page)).toHaveCount(8);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(8);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Rentz entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=rentz-pequena');
  await expect(page.getByTestId('contrato-positivo')).toBeVisible();
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  for (const c of ['bazas', 'corazones', 'damas', 'rey', 'ultima', 'domino', 'positivo']) {
    await expect(page.getByTestId(`contrato-${c}`)).toBeInViewport();
  }
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/rentz-360.png' });
  await page.getByTestId('contrato-domino').click();
  await expect(page.getByTestId('fila-picas')).toBeVisible();
  await sinScroll();
  await expect(page.getByTestId('fila-treboles')).toBeInViewport();
  await page.screenshot({ path: 'test-results/rentz-360-domino.png' });
});
