import { expect, test, type Page } from '@playwright/test';
import { canfield, CONFIG_CANFIELD_POR_DEFECTO, type EstadoCanfield } from '@juegos/engine';
import { CONFIG_SOLUCION, jugarCanfield, solucionarCanfield } from './canfield-solucion';

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarCanfield(page: Page, query: string, roboDeUno = false) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-canfield').click();
  if (roboDeUno) await page.getByLabel('De 1 en 1').check();
  await page.getByTestId('empezar').click();
}

function enMotor(semilla: string, config = CONFIG_CANFIELD_POR_DEFECTO): EstadoCanfield {
  const r = canfield.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** La primera semilla en la que se cumple la condición al empezar. */
function semillaCon(prefijo: string, condicion: (e: EstadoCanfield) => boolean): string {
  for (let i = 0; i < 2000; i++)
    if (condicion(enMotor(`${prefijo}-${i}`))) return `${prefijo}-${i}`;
  throw new Error('Ninguna semilla de prueba sirve');
}

const legales = (e: EstadoCanfield) => canfield.accionesLegales(e, 0);

// ── Reserva, huecos, mazo, rechazo, deshacer y abandonar ─────────────────────

test('jugar la carta de la reserva descubre la siguiente', async ({ page }) => {
  const semilla = semillaCon('reserva', (e) =>
    legales(e).some((a) => a.tipo === 'mover' && a.desde === 'reserva' && a.hasta.startsWith('c')),
  );
  const e = enMotor(semilla);
  const a = legales(e).find(
    (x) => x.tipo === 'mover' && x.desde === 'reserva' && x.hasta.startsWith('c'),
  )!;
  if (a.tipo !== 'mover') throw new Error();
  await empezarCanfield(page, `rapido&semilla=${semilla}`);
  await page.screenshot({ path: `test-results/canfield-mesa-${page.viewportSize()!.width}.png` });
  const arriba = e.reserva.at(-1)!;
  await page.getByTestId('reserva').locator(`[data-carta="${arriba}"]`).click(ESQUINA);
  await page.getByTestId(a.hasta).click(ESQUINA);
  await expect(page.getByTestId(a.hasta).locator(`[data-carta="${arriba}"]`)).toBeVisible();
  await expect(
    page.getByTestId('reserva').locator(`[data-carta="${e.reserva.at(-2)}"]`),
  ).toBeVisible();
  await expect(page.getByTestId('reserva')).toContainText('12');
});

test('doble toque sube la base y el hueco se llena con la reserva', async ({ page }) => {
  const semilla = semillaCon('hueco', (e) =>
    e.columnas.some((c) => Number(c[0]!.split('-')[1]) === e.base),
  );
  const e = enMotor(semilla);
  const i = e.columnas.findIndex((c) => Number(c[0]!.split('-')[1]) === e.base);
  await empezarCanfield(page, `rapido&semilla=${semilla}`);
  await page.getByTestId(`c${i}`).locator('[data-carta]').dblclick(ESQUINA);
  await expect(
    page.locator(`[data-testid^="f"] [data-carta="${e.columnas[i]![0]}"]`),
  ).toBeVisible();
  await expect(
    page.getByTestId(`c${i}`).locator(`[data-carta="${e.reserva.at(-1)}"]`),
  ).toBeVisible();
  await expect(page.getByTestId('movimientos')).toHaveText('1');

  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(
    page.getByTestId(`c${i}`).locator(`[data-carta="${e.columnas[i]![0]}"]`),
  ).toBeVisible();
  await expect(
    page.getByTestId('reserva').locator(`[data-carta="${e.reserva.at(-1)}"]`),
  ).toBeVisible();
  await expect(page.getByTestId('movimientos')).toHaveText('2');
});

test('robar pasa 3 cartas al descarte', async ({ page }) => {
  await empezarCanfield(page, 'rapido&semilla=robar');
  await page.getByTestId('mazo').click();
  await expect(page.getByTestId('descarte').locator('[data-carta]')).toHaveCount(3);
  await expect(page.getByTestId('mazo')).toContainText('31');
});

test('un movimiento que no encaja no cambia nada', async ({ page }) => {
  const semilla = semillaCon(
    'rechazo',
    (e) => !legales(e).some((a) => a.tipo === 'mover' && a.desde === 'c1' && a.hasta === 'c0'),
  );
  const e = enMotor(semilla);
  await empezarCanfield(page, `rapido&semilla=${semilla}`);
  await page.getByTestId('c1').locator('[data-carta]').click(ESQUINA);
  await page.getByTestId('c0').click(ESQUINA);
  await expect(page.getByTestId('movimientos')).toHaveText('0');
  await expect(page.getByTestId('c1').locator(`[data-carta="${e.columnas[1]![0]}"]`)).toBeVisible();
});

test('abandonar el Canfield', async ({ page }) => {
  await empezarCanfield(page, 'rapido&semilla=abandono');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
});

// ── Ganar ────────────────────────────────────────────────────────────────────

test('ganar un Canfield robando de 1, jugando desde la mesa', async ({ page }) => {
  test.setTimeout(300_000);
  const semilla = 'canfield-7';
  const solucion = solucionarCanfield(semilla, CONFIG_SOLUCION);
  if (!solucion) throw new Error('Sin solución para la semilla de prueba');
  await empezarCanfield(page, `rapido&semilla=${semilla}`, true);
  await jugarCanfield(page, semilla, solucion);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await page.screenshot({
    path: `test-results/canfield-victoria-${page.viewportSize()!.width}.png`,
  });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Canfield se continúa en el mismo punto', async ({ page }) => {
  await empezarCanfield(page, 'rapido&semilla=retomar');
  await page.getByTestId('mazo').click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await expect(page.getByTestId('descarte').locator('[data-carta]')).toHaveCount(3);
});

test('la mesa del Canfield entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarCanfield(page, 'semilla=pequena');
  await page.getByTestId('mazo').click();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (const zona of ['f3', 'c3', 'reserva']) {
    const caja = (await page.getByTestId(zona).boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  }
  // El abanico del descarte no tapa la primera fundación.
  const ultima = (await page.getByTestId('descarte').locator('[data-carta]').last().boundingBox())!;
  const f0 = (await page.getByTestId('f0').boundingBox())!;
  expect(ultima.x + ultima.width).toBeLessThanOrEqual(f0.x + 1);
  await page.screenshot({ path: 'test-results/canfield-360.png' });
});
