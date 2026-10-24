import { expect, test, type Page } from '@playwright/test';
import {
  cartaDeId,
  crearAzar,
  iaRummy500Basica,
  PALOS_FRANCESES,
  rummy500,
  type AccionRummy500,
  type EstadoRummy500,
  type IdCarta,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 6 } };

async function empezarRummy(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-rummy500').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

/** La primera carta de la mano ordenada por palo, como la muestra la mesa. */
function primeraOrdenada(mano: readonly IdCarta[]): IdCarta {
  const palo = (c: IdCarta) =>
    PALOS_FRANCESES.indexOf(cartaDeId(c)!.palo as (typeof PALOS_FRANCESES)[number]);
  return [...mano].sort(
    (a, b) => palo(a) - palo(b) || cartaDeId(a)!.valor - cartaDeId(b)!.valor,
  )[0]!;
}

/**
 * Juega en el motor como lo harán el test (el humano roba del mazo y descarta su primera carta) y
 * la IA normal, hasta que en el turno del humano se cumple la condición. Devuelve la semilla, cuántos
 * turnos completos juega antes el humano y el estado en ese momento.
 */
function buscar(
  prefijo: string,
  condicion: (e: EstadoRummy500) => boolean,
  fase: 'robar' | 'bajar',
): { semilla: string; turnos: number; e: EstadoRummy500 } {
  for (let i = 0; i < 400; i++) {
    const semilla = `${prefijo}-${i}`;
    const r = rummy500.crear({ jugadores: 2 }, semilla);
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    let turnos = 0;
    for (let paso = 0; paso < 200 && e.resultadosManos.length === 0; paso++) {
      if (e.turno !== 0) {
        const legales = rummy500.accionesLegales(e, e.turno);
        const d = iaRummy500Basica.decidir(rummy500.vistaDe(e, e.turno), legales, crearAzar('x'));
        e = rummy500.transicion(e, e.turno, d.accion);
        continue;
      }
      if (e.fase === fase && condicion(e)) return { semilla, turnos, e };
      if (e.fase === 'robar') e = rummy500.transicion(e, 0, { tipo: 'robarMazo' });
      else {
        e = rummy500.transicion(e, 0, { tipo: 'descartar', carta: primeraOrdenada(e.manos[0]!) });
        turnos++;
      }
    }
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/** Juega en la mesa los turnos del humano: robar del mazo y descartar la primera carta. */
async function jugarTurnos(page: Page, turnos: number) {
  for (let t = 0; t < turnos; t++) {
    await expect(page.getByTestId('mazo')).toHaveClass(/robable/, { timeout: 30_000 });
    await page.getByTestId('mazo').click();
    await page.locator('[data-testid="mano"] .carta-mano').first().click(ESQUINA);
    await page.getByTestId('descartar').click();
  }
  await expect(page.getByTestId('mazo')).toHaveClass(/robable/, { timeout: 30_000 });
}

// ── Robar, coger del descarte, bajar, añadir y descartar ─────────────────────

test('robar del mazo y descartar', async ({ page }) => {
  await empezarRummy(page, 'rapido&semilla=rummy-robar');
  const mano = page.locator('[data-testid="mano"] .carta-mano');
  await expect(mano).toHaveCount(13);
  await page.screenshot({ path: `test-results/rummy-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('mazo').click();
  await expect(mano).toHaveCount(14);
  const carta = await mano.first().getAttribute('data-carta');
  await mano.first().click(ESQUINA);
  await page.getByTestId('descartar').click();
  await expect(mano).toHaveCount(13);
  await expect(page.getByTestId('descarte').locator(`[data-carta="${carta}"]`)).toBeVisible();
});

test('coger varias del descarte y bajar la obligada', async ({ page }) => {
  const { semilla, turnos, e } = buscar(
    'rummy-obligada',
    (x) =>
      rummy500
        .accionesLegales(x, 0)
        .some((a) => a.tipo === 'robarDescarte' && a.desde < x.descarte.length - 1),
    'robar',
  );
  const robo = rummy500
    .accionesLegales(e, 0)
    .find(
      (a): a is Extract<AccionRummy500, { tipo: 'robarDescarte' }> =>
        a.tipo === 'robarDescarte' && a.desde < e.descarte.length - 1,
    )!;
  const tras = rummy500.transicion(e, 0, robo);
  const bajada = rummy500.accionesLegales(tras, 0).find((a) => a.tipo === 'bajar');

  await empezarRummy(page, `rapido&semilla=${semilla}`);
  await jugarTurnos(page, turnos);
  await page.getByTestId(`descarte-${robo.desde}`).click();
  const mano = page.locator('[data-testid="mano"] .carta-mano');
  await expect(mano).toHaveCount(tras.manos[0]!.length);
  await expect(page.getByTestId('turno')).toContainText('Tienes que bajar o añadir');
  await expect(page.getByTestId(`mano-${tras.obligada}`)).toHaveClass(/obligada/);
  await expect(page.getByTestId('descartar')).toBeDisabled();
  await page.screenshot({ path: `test-results/rummy-obligada-${page.viewportSize()!.width}.png` });
  if (bajada && bajada.tipo === 'bajar') {
    for (const c of bajada.cartas) await page.getByTestId(`mano-${c}`).click(ESQUINA);
    await page.getByTestId('bajar').click();
    for (const c of bajada.cartas) {
      await expect(page.getByTestId('mesa-combis').locator(`[data-carta="${c}"]`)).toBeVisible();
    }
  } else {
    const anadido = rummy500.accionesLegales(tras, 0).find((a) => a.tipo === 'anadir')!;
    if (anadido.tipo !== 'anadir') throw new Error('sin añadido');
    await page.getByTestId(`mano-${anadido.carta}`).click(ESQUINA);
    await page.getByTestId(`combi-${anadido.combinacion}`).click();
  }
  await expect(page.getByTestId('turno')).toHaveText('Baja, añade o descarta');
});

test('añadir una carta a la combinación de un rival', async ({ page }) => {
  const { semilla, turnos, e } = buscar(
    'rummy-anadir',
    (x) =>
      rummy500
        .accionesLegales(x, 0)
        .some(
          (a) =>
            a.tipo === 'anadir' &&
            x.combinaciones.find((c) => c.id === a.combinacion)!.cartas[0]!.de !== 0,
        ),
    'bajar',
  );
  const anadido = rummy500
    .accionesLegales(e, 0)
    .find(
      (a): a is Extract<AccionRummy500, { tipo: 'anadir' }> =>
        a.tipo === 'anadir' &&
        e.combinaciones.find((c) => c.id === a.combinacion)!.cartas[0]!.de !== 0,
    )!;
  await empezarRummy(page, `rapido&semilla=${semilla}`);
  await jugarTurnos(page, turnos);
  await page.getByTestId('mazo').click();
  await page.getByTestId(`mano-${anadido.carta}`).click(ESQUINA);
  await page.getByTestId(`combi-${anadido.combinacion}`).click();
  if (await page.getByTestId('opciones-as').isVisible()) await page.getByTestId('opcion-0').click();
  await expect(
    page.getByTestId(`combi-${anadido.combinacion}`).locator(`[data-carta="${anadido.carta}"]`),
  ).toHaveAttribute('data-de', '0');
});

test('partida de Rummy 500 completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezarRummy(page, 'rapido&semilla=rummy-completa');
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 3_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="mazo"].robable, [data-testid="descartar"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-rummy')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
    } else if ((await page.locator('[data-testid="mazo"].robable').count()) > 0) {
      await page.getByTestId('mazo').click();
    } else {
      await page.locator('[data-testid="mano"] .carta-mano').first().click(ESQUINA);
      await page.getByTestId('descartar').click();
    }
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('puntos-fin-0')).toBeVisible();
  await page.screenshot({ path: `test-results/rummy-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Rummy 500 se continúa con la misma mano', async ({ page }) => {
  await empezarRummy(page, 'semilla=rummy-retomar');
  const antes = await page
    .locator('[data-testid="mano"] .carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.getByTestId(`mano-${c}`)).toBeVisible();
});

test('el Rummy 500 de 4 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarRummy(page, 'semilla=pequena', 4);
  await expect(page.locator('[data-testid="mano"] .carta-mano')).toHaveCount(7);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/rummy4-360.png' });
});
