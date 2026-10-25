import { expect, test, type Page } from '@playwright/test';
import { scorpion, type AccionScorpion, type EstadoScorpion } from '@juegos/engine';
import { cartaOrigenScorpion, estadosScorpion, solucionarScorpion } from './scorpion-solucion';

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 6, y: 6 } };
const SEMILLA_GANABLE = 'scorpion-10';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-scorpion').click();
  await page.getByTestId('empezar').click();
}

function enMotor(semilla: string): EstadoScorpion {
  const r = scorpion.crear({}, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Mover = Extract<AccionScorpion, { tipo: 'mover' }>;
const legales = (e: EstadoScorpion) => scorpion.accionesLegales(e, 0);

/** La primera semilla con un movimiento que cumple la condición al empezar. */
function semillaCon(prefijo: string, condicion: (a: Mover, e: EstadoScorpion) => boolean) {
  for (let i = 0; i < 3000; i++) {
    const e = enMotor(`${prefijo}-${i}`);
    const a = legales(e).find((x): x is Mover => x.tipo === 'mover' && condicion(x, e));
    if (a) return { semilla: `${prefijo}-${i}`, e, a };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/** Juega por la UI las acciones de una solución, comprobando el contador de movimientos. */
async function jugar(page: Page, semilla: string, acciones: readonly AccionScorpion[]) {
  const estados = estadosScorpion(semilla, acciones);
  for (const [i, a] of acciones.entries()) {
    const e = estados[i]!;
    await page.waitForFunction(() => document.getAnimations().length === 0);
    if (a.tipo === 'repartir') {
      await page.getByTestId('reserva').click();
    } else if (a.tipo === 'mover') {
      await page.getByTestId(`carta-${cartaOrigenScorpion(e, a)}`).click(ESQUINA);
      await page.getByTestId(`c${a.hasta}`).click(ESQUINA);
    }
    await expect(page.getByTestId('movimientos')).toHaveText(String(estados[i + 1]!.movimientos));
  }
}

// ── Mover, rechazo, K a una columna vacía, reserva, deshacer y abandonar ─────

test('mover una carta con las que tiene encima, y deshacer', async ({ page }) => {
  const { semilla, e, a } = semillaCon(
    'mover',
    (x, s) => x.cantidad > 1 && s.columnas[x.hasta]!.visibles.length > 0,
  );
  await empezar(page, `rapido&semilla=${semilla}`);
  await page.screenshot({ path: `test-results/scorpion-mesa-${page.viewportSize()!.width}.png` });
  const movidas = e.columnas[a.desde]!.visibles.slice(-a.cantidad);
  await page.getByTestId(`carta-${movidas[0]}`).click(ESQUINA);
  await page.getByTestId(`c${a.hasta}`).click(ESQUINA);
  for (const c of movidas)
    await expect(page.getByTestId(`c${a.hasta}`).getByTestId(`carta-${c}`)).toBeVisible();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await page.getByTestId('deshacer').click();
  for (const c of movidas)
    await expect(page.getByTestId(`c${a.desde}`).getByTestId(`carta-${c}`)).toBeVisible();
});

test('un movimiento que no encaja no cambia nada', async ({ page }) => {
  const e = enMotor('rechazo');
  const carta = e.columnas[4]!.visibles.at(-1)!;
  const ilegal = !legales(e).some(
    (x) => x.tipo === 'mover' && x.desde === 4 && x.hasta === 5 && x.cantidad === 1,
  );
  expect(ilegal).toBe(true);
  await empezar(page, 'rapido&semilla=rechazo');
  await page.getByTestId(`carta-${carta}`).click(ESQUINA);
  await page.getByTestId('c5').click(ESQUINA);
  await expect(page.getByTestId('movimientos')).toHaveText('0');
  await expect(page.getByTestId('c4').getByTestId(`carta-${carta}`)).toBeVisible();
});

test('repartir la reserva pone una carta en cada una de las 3 primeras columnas', async ({
  page,
}) => {
  const e = enMotor('reserva');
  await empezar(page, 'rapido&semilla=reserva');
  await expect(page.getByTestId('reserva')).toBeEnabled();
  await page.getByTestId('reserva').click();
  for (let i = 0; i < 3; i++) {
    await expect(page.getByTestId(`c${i}`).getByTestId(`carta-${e.reserva[i]}`)).toBeVisible();
  }
  await expect(page.getByTestId('reserva')).toBeDisabled();
});

test('una K se mueve a una columna vacía, y ganar una partida desde la mesa', async ({ page }) => {
  test.setTimeout(300_000);
  const solucion = solucionarScorpion(SEMILLA_GANABLE);
  if (!solucion) throw new Error('Sin solución para la semilla de prueba');
  const estados = estadosScorpion(SEMILLA_GANABLE, solucion);
  // En la solución hay algún movimiento de una K a una columna vacía.
  const conK = solucion.findIndex(
    (a, i) =>
      a.tipo === 'mover' &&
      estados[i]!.columnas[a.hasta]!.visibles.length === 0 &&
      estados[i]!.columnas[a.hasta]!.ocultas.length === 0,
  );
  expect(conK).toBeGreaterThanOrEqual(0);
  await empezar(page, `rapido&semilla=${SEMILLA_GANABLE}`);
  await jugar(page, SEMILLA_GANABLE, solucion);
  await expect(page.getByTestId('fin')).toContainText('¡Solitario completado!');
  await page.screenshot({
    path: `test-results/scorpion-victoria-${page.viewportSize()!.width}.png`,
  });
});

test('abandonar el Scorpion', async ({ page }) => {
  await empezar(page, 'rapido&semilla=abandono');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Scorpion se continúa en el mismo punto', async ({ page }) => {
  await empezar(page, 'rapido&semilla=retomar');
  await page.getByTestId('reserva').click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await expect(page.getByTestId('reserva')).toBeDisabled();
});

test('la mesa del Scorpion entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  const caja = (await page.getByTestId('c6').boundingBox())!;
  expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/scorpion-360.png' });
});
