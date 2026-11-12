import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import {
  esComodinCanasta,
  handAndFoot,
  valorCanasta,
  type CartaHandAndFoot,
  type EstadoHandAndFoot,
} from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'handAndFoot');
  await page.getByTestId('empezar').click();
}

const crear = (semilla: string): EstadoHandAndFoot => {
  const r = handAndFoot.crear({ rondas: 4 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};

/** Una semilla en la que el asiento 0 empieza con tres naturales del 4 al 7 (no llegan a 50). */
function semillaConTrio(): { semilla: string; cartas: CartaHandAndFoot[] } {
  for (let i = 0; i < 500; i++) {
    const semilla = `trio-${i}`;
    const mano = crear(semilla).manos[0]!;
    for (const v of [4, 5, 6, 7]) {
      const del = mano.filter((c) => !esComodinCanasta(c) && valorCanasta(c) === v);
      if (del.length === 3) return { semilla, cartas: del };
    }
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

const enMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');

// ── Robar, primera bajada ────────────────────────────────────────────────────

test('robar 2 del mazo y descartar', async ({ page }) => {
  await empezar(page, 'rapido&semilla=hf-robar');
  await expect(enMano(page)).toHaveCount(11);
  await expect(page.getByTestId('minimo')).toHaveText('Primera bajada: 50');
  await expect(page.getByTestId('mi-pie')).toContainText('pie de 11');
  await expect(page.getByTestId('libros')).toContainText('2 libros limpios y 2 libros sucios');
  await page.screenshot({ path: `test-results/hf-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('robar').click();
  await expect(enMano(page)).toHaveCount(13);
  await enMano(page)
    .first()
    .click({ position: { x: 6, y: 6 } });
  await page.getByTestId('descartar').click();
  await expect(enMano(page)).toHaveCount(12);
  await expect(page.getByTestId('aviso')).toBeVisible();
});

test('la primera bajada sin llegar al mínimo se puede deshacer', async ({ page }) => {
  const { semilla, cartas } = semillaConTrio();
  await empezar(page, `rapido&semilla=${semilla}`);
  await page.getByTestId('robar').click();
  for (const c of cartas) await page.getByTestId(`mano-${c}`).click({ position: { x: 6, y: 6 } });
  await page.getByTestId('bajar').click();
  await expect(page.getByTestId('combis-propias').locator('.combi')).toHaveCount(1);
  await expect(page.getByTestId('turno')).toContainText('Te faltan');
  await enMano(page)
    .first()
    .click({ position: { x: 6, y: 6 } });
  await expect(page.getByTestId('descartar')).toBeDisabled();
  await page.getByTestId('deshacer').click();
  await expect(page.getByTestId('combis-propias').locator('.combi')).toHaveCount(0);
  await expect(enMano(page)).toHaveCount(13);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Hand and Foot completa contra la IA', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=hf-completa');
  const fin = page.getByTestId('fin');
  let resumenes = 0;
  let pieVisto = false;
  for (let paso = 0; paso < 6_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="robar"], [data-testid="descartar"], [data-testid="acabar"]',
      )
      .first()
      .waitFor({ timeout: 60_000 });
    if (await fin.isVisible()) break;
    if (!pieVisto) pieVisto = (await page.getByText('juega el pie').count()) > 0;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-hand-and-foot')).toBeVisible();
      if (resumenes === 0) {
        await page.screenshot({
          path: `test-results/hf-resumen-${page.viewportSize()!.width}.png`,
        });
      }
      resumenes++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('robar').isVisible()) {
      await page.getByTestId('robar').click();
    } else if (await page.getByTestId('acabar').isVisible()) {
      await page.getByTestId('acabar').click();
    } else if (await page.getByTestId('descartar').isVisible()) {
      await enMano(page)
        .first()
        .click({ position: { x: 6, y: 6 } });
      await page.getByTestId('descartar').click();
    }
  }
  await expect(fin).toBeVisible();
  // Cuatro rondas: tres resúmenes en la mesa y el último en la pantalla de fin.
  expect(resumenes).toBe(3);
  expect(pieVisto).toBe(true);
  await expect(fin.getByTestId('resumen-hand-and-foot')).toBeVisible();
  await expect(fin.getByTestId('puntos-hand-and-foot')).toBeVisible();
  await page.screenshot({ path: `test-results/hf-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Hand and Foot se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=hf-retomar');
  const antes = await enMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.getByTestId(`mano-${c}`)).toBeVisible();
});

test('el Hand and Foot entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'rapido&semilla=hf-pequena');
  await page.getByTestId('robar').click();
  await expect(enMano(page)).toHaveCount(13);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const a of [1, 2, 3]) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(page.getByTestId('descartar')).toBeInViewport();
  await page.screenshot({ path: 'test-results/hf-360.png' });
});
