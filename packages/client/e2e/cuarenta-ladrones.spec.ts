import { expect, test, type Page } from '@playwright/test';
import {
  cuarentaLadrones,
  type AccionCuarentaLadrones,
  type EstadoCuarentaLadrones,
} from '@juegos/engine';
import {
  cartaOrigenLadrones,
  estadosCuarentaLadrones,
  solucionarCuarentaLadrones,
} from './cuarenta-ladrones-solucion';

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 5, y: 5 } };

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-cuarentaLadrones').click();
  await page.getByTestId('empezar').click();
}

function enMotor(semilla: string): EstadoCuarentaLadrones {
  const r = cuarentaLadrones.crear({}, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Mover = Extract<AccionCuarentaLadrones, { tipo: 'mover' }>;
const legales = (e: EstadoCuarentaLadrones) => cuarentaLadrones.accionesLegales(e, 0);

/** La primera semilla con un movimiento que cumple la condición al empezar. */
function semillaCon(prefijo: string, condicion: (a: Mover, e: EstadoCuarentaLadrones) => boolean) {
  for (let i = 0; i < 3000; i++) {
    const e = enMotor(`${prefijo}-${i}`);
    const a = legales(e).find((x): x is Mover => x.tipo === 'mover' && condicion(x, e));
    if (a) return { semilla: `${prefijo}-${i}`, e, a };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/** Juega por la UI las acciones de una solución, comprobando el contador de movimientos. */
async function jugar(page: Page, semilla: string, acciones: readonly AccionCuarentaLadrones[]) {
  const estados = estadosCuarentaLadrones(semilla, acciones);
  for (const [i, a] of acciones.entries()) {
    const e = estados[i]!;
    await page.waitForFunction(() => document.getAnimations().length === 0);
    if (a.tipo === 'robar') {
      await page.getByTestId('mazo').click();
    } else if (a.tipo === 'autocompletar') {
      await page.getByRole('button', { name: 'Autocompletar' }).click();
    } else if (a.tipo === 'mover') {
      await page.locator(`[data-carta="${cartaOrigenLadrones(e, a)}"]`).click(ESQUINA);
      await page.getByTestId(a.hasta).click(ESQUINA);
    }
    if (a.tipo !== 'autocompletar') {
      await expect(page.getByTestId('movimientos')).toHaveText(String(estados[i + 1]!.movimientos));
    }
  }
}

// ── Robar, mover, rechazo, tramos, fundación, deshacer y abandonar ───────────

test('robar pasa una carta al descarte', async ({ page }) => {
  const e = enMotor('robar');
  await empezar(page, 'rapido&semilla=robar');
  await expect(page.getByTestId('mazo')).toContainText('64');
  await page.screenshot({ path: `test-results/ladrones-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('mazo').click();
  await expect(page.getByTestId('mazo')).toContainText('63');
  await expect(
    page.getByTestId('descarte').locator(`[data-carta="${e.mazo.at(-1)}"]`),
  ).toBeVisible();
});

test('mover una carta a otra columna, y deshacer', async ({ page }) => {
  const { semilla, e, a } = semillaCon(
    'mover',
    (x, s) =>
      x.desde.startsWith('c') &&
      x.hasta.startsWith('c') &&
      x.cantidad === 1 &&
      s.columnas[Number(x.hasta.slice(1))]!.length > 0,
  );
  await empezar(page, `rapido&semilla=${semilla}`);
  const carta = cartaOrigenLadrones(e, a);
  await page.locator(`[data-carta="${carta}"]`).click(ESQUINA);
  await page.getByTestId(a.hasta).click(ESQUINA);
  await expect(page.getByTestId(a.hasta).locator(`[data-carta="${carta}"]`)).toBeVisible();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByTestId(a.desde).locator(`[data-carta="${carta}"]`)).toBeVisible();
  await expect(page.getByTestId('movimientos')).toHaveText('2');
});

test('un movimiento que no encaja no cambia nada', async ({ page }) => {
  const e = enMotor('rechazo');
  const ilegal = !legales(e).some(
    (x) => x.tipo === 'mover' && x.desde === 'c1' && x.hasta === 'c0',
  );
  expect(ilegal).toBe(true);
  await empezar(page, 'rapido&semilla=rechazo');
  await page.locator(`[data-carta="${e.columnas[1]!.at(-1)}"]`).click(ESQUINA);
  await page.getByTestId('c0').click(ESQUINA);
  await expect(page.getByTestId('movimientos')).toHaveText('0');
  await expect(
    page.getByTestId('c1').locator(`[data-carta="${e.columnas[1]!.at(-1)}"]`),
  ).toBeVisible();
});

test('doble toque sube un As a una fundación', async ({ page }) => {
  const { semilla, e, a } = semillaCon(
    'as',
    (x) => x.hasta.startsWith('f') && x.desde.startsWith('c'),
  );
  const carta = cartaOrigenLadrones(e, a);
  await empezar(page, `rapido&semilla=${semilla}`);
  await page.locator(`[data-carta="${carta}"]`).dblclick(ESQUINA);
  await expect(page.locator(`[data-testid^="f"] [data-carta="${carta}"]`)).toBeVisible();
});

test('un tramo de dos cartas se mueve con una columna vacía', async ({ page }) => {
  test.setTimeout(120_000);
  // Se juega la solución de una partida ganable hasta el primer tramo de 2 a otra columna.
  const semilla = 'ladrones-13';
  const solucion = solucionarCuarentaLadrones(semilla)!;
  const i = solucion.findIndex(
    (x) => x.tipo === 'mover' && x.cantidad === 2 && x.hasta.startsWith('c'),
  );
  expect(i).toBeGreaterThan(0);
  await empezar(page, `rapido&semilla=${semilla}`);
  await jugar(page, semilla, solucion.slice(0, i + 1));
  const tras = estadosCuarentaLadrones(semilla, solucion.slice(0, i + 1)).at(-1)!;
  const a = solucion[i] as Mover;
  for (const carta of tras.columnas[Number(a.hasta.slice(1))]!.slice(-2)) {
    await expect(page.getByTestId(a.hasta).locator(`[data-carta="${carta}"]`)).toBeVisible();
  }
});

test('abandonar Cuarenta ladrones', async ({ page }) => {
  await empezar(page, 'rapido&semilla=abandono');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
});

// ── Ganar ────────────────────────────────────────────────────────────────────

test('ganar un Cuarenta ladrones jugando desde la mesa', async ({ page }) => {
  test.setTimeout(600_000);
  const semilla = 'ladrones-13';
  const solucion = solucionarCuarentaLadrones(semilla);
  if (!solucion) throw new Error('Sin solución para la semilla de prueba');
  await empezar(page, `rapido&semilla=${semilla}`);
  await jugar(page, semilla, solucion);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await page.screenshot({
    path: `test-results/ladrones-victoria-${page.viewportSize()!.width}.png`,
  });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Cuarenta ladrones se continúa en el mismo punto', async ({
  page,
}) => {
  await empezar(page, 'rapido&semilla=retomar');
  await page.getByTestId('mazo').click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await expect(page.getByTestId('mazo')).toContainText('63');
});

test('la mesa de Cuarenta ladrones entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await page.getByTestId('mazo').click();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const zona of ['f7', 'c9']) {
    const caja = (await page.getByTestId(zona).boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  }
  await page.screenshot({ path: 'test-results/ladrones-360.png' });
});
