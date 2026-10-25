import { expect, test, type Page } from '@playwright/test';
import {
  canasta,
  esComodinCanasta,
  valorCanasta,
  type AccionCanasta,
  type CartaCanasta,
  type EstadoCanasta,
} from '@juegos/engine';

async function empezarCanasta(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-canasta').click();
  await page.getByTestId('empezar').click();
}

const crear = (semilla: string): EstadoCanasta => {
  const r = canasta.crear({ jugadores: 4 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};

/** Una semilla en la que el asiento 0 empieza con tres naturales del 4 al 7 (no llegan a 50). */
function semillaConTrio(): { semilla: string; cartas: CartaCanasta[] } {
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

/**
 * Una semilla en la que el asiento 0 puede llevarse el pozo al empezar con dos naturales de su
 * mano y le queda otro del mismo valor para añadir.
 */
function semillaConPozo(): {
  semilla: string;
  accion: Extract<AccionCanasta, { tipo: 'tomarPozo' }>;
  otra: CartaCanasta;
} {
  for (let i = 0; i < 5000; i++) {
    const semilla = `pozo-${i}`;
    const e = crear(semilla);
    const accion = canasta
      .accionesLegales(e, 0)
      .find(
        (a): a is Extract<AccionCanasta, { tipo: 'tomarPozo' }> =>
          a.tipo === 'tomarPozo' && a.cartas.length === 2 && !a.cartas.some(esComodinCanasta),
      );
    if (!accion) continue;
    const v = valorCanasta(accion.cartas[0]!);
    const otra = e.manos[0]!.find(
      (c) => !esComodinCanasta(c) && valorCanasta(c) === v && !accion.cartas.includes(c),
    );
    if (otra) return { semilla, accion, otra };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

const enMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');

// ── Robar, primera bajada, pozo y añadir ─────────────────────────────────────

test('robar del mazo y descartar', async ({ page }) => {
  await empezarCanasta(page, 'rapido&semilla=canasta-robar');
  await expect(enMano(page)).toHaveCount(11);
  await expect(page.getByTestId('minimo')).toHaveText('Primera bajada: 50');
  await page.screenshot({ path: `test-results/canasta-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('robar').click();
  await expect(enMano(page)).toHaveCount(12);
  const primera = enMano(page).first();
  const carta = await primera.getAttribute('data-carta');
  await primera.click({ position: { x: 6, y: 6 } });
  await page.getByTestId('descartar').click();
  await expect(enMano(page)).toHaveCount(11);
  // La carta descartada queda en el pozo: arriba, o ya debajo si la IA ha descartado otra.
  await expect(page.getByTestId('aviso')).toBeVisible();
  expect(carta).not.toBeNull();
});

test('la primera bajada sin llegar al mínimo se puede deshacer', async ({ page }) => {
  const { semilla, cartas } = semillaConTrio();
  await empezarCanasta(page, `rapido&semilla=${semilla}`);
  await page.getByTestId('robar').click();
  for (const c of cartas) await page.getByTestId(`mano-${c}`).click({ position: { x: 6, y: 6 } });
  await page.getByTestId('bajar').click();
  await expect(page.getByTestId('combis-propias').locator('.combi')).toHaveCount(1);
  await expect(page.getByTestId('turno')).toContainText('Te faltan');
  await page
    .locator('[data-testid="mano"] .carta-mano')
    .first()
    .click({ position: { x: 6, y: 6 } });
  await expect(page.getByTestId('descartar')).toBeDisabled();
  await page.getByTestId('deshacer').click();
  await expect(page.getByTestId('combis-propias').locator('.combi')).toHaveCount(0);
  await expect(enMano(page)).toHaveCount(12);
});

test('llevarse el pozo con dos naturales y añadir otro a la combinación', async ({ page }) => {
  const { semilla, accion, otra } = semillaConPozo();
  await empezarCanasta(page, `rapido&semilla=${semilla}`);
  const pozo = Number(await page.getByTestId('cartas-pozo').innerText());
  for (const c of accion.cartas)
    await page.getByTestId(`mano-${c}`).click({ position: { x: 6, y: 6 } });
  await page.getByTestId('coger-pozo').click();
  const combi = page.getByTestId('combis-propias').locator('.combi').first();
  await expect(combi).toBeVisible();
  await expect(enMano(page)).toHaveCount(11 - 2 + pozo - 1);
  await page.getByTestId(`mano-${otra}`).click({ position: { x: 6, y: 6 } });
  await combi.click();
  await expect(combi).toContainText('4');
  await expect(page.getByTestId(`mano-${otra}`)).toHaveCount(0);
  await page.screenshot({ path: `test-results/canasta-pozo-${page.viewportSize()!.width}.png` });
});

test('partida de Canasta completa contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezarCanasta(page, 'rapido&semilla=canasta-completa');
  const fin = page.getByTestId('fin');
  let resumenVisto = false;
  for (let paso = 0; paso < 3_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="robar"], [data-testid="descartar"], [data-testid="acabar"]',
      )
      .first()
      .waitFor({ timeout: 60_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      if (!resumenVisto) {
        await expect(page.getByTestId('resumen-canasta')).toBeVisible();
        await page.screenshot({
          path: `test-results/canasta-resumen-${page.viewportSize()!.width}.png`,
        });
        resumenVisto = true;
      }
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
  expect(resumenVisto).toBe(true);
  await expect(fin.getByTestId('resumen-canasta')).toBeVisible();
  await page.screenshot({ path: `test-results/canasta-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Canasta se continúa con la misma mano', async ({ page }) => {
  await empezarCanasta(page, 'semilla=canasta-retomar');
  const antes = await enMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.getByTestId(`mano-${c}`)).toBeVisible();
});

test('la Canasta entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  const { semilla, accion } = semillaConPozo();
  await empezarCanasta(page, `rapido&semilla=${semilla}`);
  for (const c of accion.cartas)
    await page.getByTestId(`mano-${c}`).click({ position: { x: 6, y: 6 } });
  await page.getByTestId('coger-pozo').click();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const a of [1, 2, 3]) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/canasta-360.png' });
});
