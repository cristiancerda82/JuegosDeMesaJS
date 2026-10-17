import { expect, test, type Page } from '@playwright/test';
import {
  esComodinPinacle,
  pinacle,
  planesParaBajar,
  rangoPinacle,
  VERSION_MOTOR,
  type AccionPinacle,
  type CartaPinacle,
  type EstadoPinacle,
  type Jugada,
} from '@juegos/engine';

async function empezar(page: Page, query: string, cuatro = false) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-pinacle').click();
  if (cuatro) await page.getByLabel('4 jugadores en parejas').check();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string, jugadores: 2 | 4 = 2): EstadoPinacle {
  const r = pinacle.crear({ jugadores }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Primera semilla cuyo estado inicial cumple la condición. */
function semillaDonde(prefijo: string, cumple: (e: EstadoPinacle) => boolean): string {
  for (let i = 0; i < 5_000; i++) {
    if (cumple(crear(`${prefijo}-${i}`))) return `${prefijo}-${i}`;
  }
  throw new Error('Ninguna semilla cumple la condición');
}

/** Cuatro cartas naturales del mismo número en la mano, o `null`. */
function cuatroIguales(mano: readonly CartaPinacle[]): CartaPinacle[] | null {
  const naturales = mano.filter((c) => !esComodinPinacle(c));
  for (const c of naturales) {
    const iguales = naturales.filter((x) => rangoPinacle(x) === rangoPinacle(c));
    if (iguales.length >= 4) return iguales.slice(0, 4);
  }
  return null;
}

const carta = (page: Page, c: CartaPinacle) => page.getByTestId(`mano-${c}`);

/** Elige una carta y la descarta. */
async function descartarPrimera(page: Page) {
  await page.locator('.carta-mano').first().click();
  await page.getByTestId('descartar').click();
}

/** Espera a que toque robar al humano, a un resumen de mano o al fin. */
async function esperarTurno(page: Page): Promise<'robar' | 'panel' | 'fin'> {
  await page
    .locator('[data-testid="mazo"].robable, [data-testid="panel-mano"], [data-testid="fin"]')
    .first()
    .waitFor({ timeout: 20_000 });
  if (await page.getByTestId('fin').isVisible()) return 'fin';
  if (await page.getByTestId('panel-mano').isVisible()) return 'panel';
  return 'robar';
}

// ── Partida de 2 ─────────────────────────────────────────────────────────────

test('robar, bajar un grupo, añadir y descartar, hasta el resumen de la mano', async ({ page }) => {
  test.setTimeout(240_000);
  const semilla = semillaDonde('grupo', (e) => cuatroIguales(e.manos[0]!) !== null);
  const [a, b, c, d] = cuatroIguales(crear(semilla).manos[0]!)!;
  await empezar(page, `rapido&semilla=${semilla}`);

  await page.getByTestId('mazo').click();
  for (const x of [a!, b!, c!]) await carta(page, x).click();
  await page.getByTestId('bajar').click();
  const propias = page.getByTestId('combis-propias');
  await expect(propias.locator('.combi')).toHaveCount(1);
  await expect(propias.locator('.mini')).toHaveCount(3);
  await expect(carta(page, a!)).toHaveCount(0);

  await carta(page, d!).click();
  await propias.locator('.combi').first().click();
  await expect(propias.locator('.mini')).toHaveCount(4);
  await page.screenshot({ path: `test-results/pinacle-${page.viewportSize()!.width}.png` });

  await descartarPrimera(page);
  // Se juega robando del mazo y descartando hasta que termina la mano.
  for (let turno = 0; turno < 80; turno++) {
    const toca = await esperarTurno(page);
    if (toca !== 'robar') break;
    await page.getByTestId('mazo').click();
    await descartarPrimera(page);
  }
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible();
  await expect(panel.getByTestId('resumen-pinacle')).toBeVisible();
  await expect(panel).toContainText('Total de la mano');
  await page.getByTestId('siguiente-mano').click();
  await expect(panel).toBeHidden();
});

test('llevarse el montón obliga a bajar su carta, y «Bajar» se desactiva si no combina', async ({
  page,
}) => {
  const semilla = semillaDonde('monton', (e) =>
    pinacle.accionesLegales(e, 0).some((a) => a.tipo === 'robar' && a.desde === 'monton'),
  );
  const e0 = crear(semilla);
  await empezar(page, `rapido&semilla=${semilla}`);

  await page.getByTestId('monton').click();
  const e1 = pinacle.transicion(e0, 0, { tipo: 'robar', desde: 'monton' });
  await expect(page.getByTestId('turno')).toContainText('Lo primero que bajes tiene que llevar');
  await expect(page.getByTestId('descartar')).toBeDisabled();

  // Tres cartas que no combinan: «Bajar» desactivado.
  const v1 = pinacle.vistaDe(e1, 0);
  const mano = e1.manos[0]!;
  let sueltas: CartaPinacle[] | null = null;
  for (let i = 0; i < mano.length && !sueltas; i++)
    for (let j = i + 1; j < mano.length && !sueltas; j++)
      for (let k = j + 1; k < mano.length && !sueltas; k++) {
        const prueba = [mano[i]!, mano[j]!, mano[k]!];
        if (planesParaBajar(v1, prueba).length === 0) sueltas = prueba;
      }
  for (const x of sueltas!) await carta(page, x).click();
  await expect(page.getByTestId('bajar')).toBeDisabled();
  await page.getByTestId('limpiar').click();

  // La primera bajada legal lleva la carta del montón.
  const bajada = pinacle
    .accionesLegales(e1, 0)
    .find((a): a is Extract<AccionPinacle, { tipo: 'bajar' }> => a.tipo === 'bajar');
  if (bajada) {
    const n = bajada.combinacion;
    for (const x of n.tipo === 'grupo' ? n.cartas : n.puestos) await carta(page, x).click();
    await page.getByTestId('bajar').click();
    if (await page.getByTestId('opciones-bajada').isVisible())
      await page.getByTestId('opcion-0').click();
  } else {
    // Solo se puede añadir a una combinación: no ocurre al empezar la mano.
    throw new Error('La semilla no deja bajar una combinación nueva');
  }
  await expect(page.getByTestId('combis-propias').locator('.combi')).toHaveCount(1);
  await page.locator('.carta-mano').first().click();
  await expect(page.getByTestId('descartar')).toBeEnabled();
});

// ── Parejas, retomar y móvil ─────────────────────────────────────────────────

test('partida de 4 por parejas: compañero enfrente y la IA juega', async ({ page }) => {
  await empezar(page, 'rapido&semilla=parejas', true);
  await expect(page.getByTestId('asiento-2')).toContainText('Compañero');
  await expect(page.getByTestId('asiento-1')).toBeVisible();
  await expect(page.getByTestId('asiento-3')).toBeVisible();
  await expect(page.getByTestId('puntos-bando-0')).toContainText('Tu pareja');
  await page.getByTestId('mazo').click();
  await descartarPrimera(page);
  // Juegan los otros tres y vuelve a tocar al humano.
  await expect(page.getByTestId('mazo')).toHaveClass(/robable/, { timeout: 20_000 });
  await expect(page.getByTestId('aviso')).toBeVisible();
});

test('al recargar una partida de Pinacle se continúa en el mismo punto', async ({ page }) => {
  await empezar(page, 'rapido&semilla=retomar');
  await page.getByTestId('mazo').click();
  await descartarPrimera(page);
  await expect(page.getByTestId('mazo')).toHaveClass(/robable/, { timeout: 20_000 });
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-testid')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  const despues = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-testid')));
  expect(despues).toEqual(antes);
});

/**
 * Una partida en la que los dos roban del mazo y descartan, sin bajar, hasta que el montón es
 * grande y el humano se lo puede llevar.
 */
function partidaConMontonGrande(): { semilla: string; jugadas: Jugada<AccionPinacle>[] } {
  for (let i = 0; i < 200; i++) {
    const semilla = `monton-grande-${i}`;
    let e = crear(semilla);
    const jugadas: Jugada<AccionPinacle>[] = [];
    const jugar = (asiento: number, accion: AccionPinacle) => {
      jugadas.push({ asiento, accion });
      e = pinacle.transicion(e, asiento, accion);
    };
    for (let turno = 0; turno < 60 && e.numeroMano === 1; turno++) {
      const a = e.turno;
      const legales = pinacle.accionesLegales(e, a);
      const llevarse = legales.some((x) => x.tipo === 'robar' && x.desde === 'monton');
      if (a === 0 && llevarse && e.monton.length >= 22) return { semilla, jugadas };
      jugar(a, { tipo: 'robar', desde: 'mazo' });
      const descarte = pinacle.accionesLegales(e, a).find((x) => x.tipo === 'descartar')!;
      jugar(a, descarte);
    }
  }
  throw new Error('Ninguna partida deja un montón grande');
}

test('con más de 30 cartas en la mano, en 360 × 640 se ve entera sin scroll horizontal', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const { semilla, jugadas } = partidaConMontonGrande();
  await page.goto('./?rapido');
  await page.evaluate((g) => localStorage.setItem('juegos-de-mesa/partida', JSON.stringify(g)), {
    version: 1,
    motor: VERSION_MOTOR,
    juego: 'pinacle',
    config: { jugadores: 2 },
    semilla,
    jugadas,
    tiempoMs: 0,
    nivel: 'normal',
  });
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByTestId('monton').click();
  const cartas = page.locator('.carta-mano');
  expect(await cartas.count()).toBeGreaterThan(30);
  await page.screenshot({ path: 'test-results/pinacle-mano-grande-360.png', fullPage: true });
  const anchoPagina = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(anchoPagina).toBeLessThanOrEqual(360);
  // El índice de cada carta (su esquina izquierda) queda dentro de la pantalla.
  for (const caja of await cartas.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect),
  )) {
    expect(caja.left).toBeGreaterThanOrEqual(0);
    expect(caja.left + caja.width).toBeLessThanOrEqual(360);
  }
});
