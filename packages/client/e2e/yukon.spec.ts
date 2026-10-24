import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_YUKON_POR_DEFECTO,
  yukon,
  type AccionYukon,
  type EstadoYukon,
} from '@juegos/engine';
import { cartaOrigenYukon, jugarYukon, solucionarYukon } from './yukon-solucion';

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarYukon(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-yukon').click();
  await page.getByTestId('empezar').click();
}

function enMotor(semilla: string): EstadoYukon {
  const r = yukon.crear(CONFIG_YUKON_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Mover = Extract<AccionYukon, { tipo: 'mover' }>;

/** Un movimiento entre columnas de un grupo de varias cartas en la partida de esa semilla. */
function grupoQueSeMueve(prefijo: string): { semilla: string; e: EstadoYukon; a: Mover } {
  for (let i = 0; i < 200; i++) {
    const semilla = `${prefijo}-${i}`;
    const e = enMotor(semilla);
    const a = yukon
      .accionesLegales(e, 0)
      .find((x): x is Mover => x.tipo === 'mover' && x.hasta.startsWith('c') && x.cantidad >= 2);
    if (a) return { semilla, e, a };
  }
  throw new Error('Ninguna semilla con un grupo que mover');
}

/** Una semilla en la que un as es la última carta de una columna al empezar. */
function semillaConAs(): { semilla: string; carta: string } {
  for (let i = 0; i < 500; i++) {
    const semilla = `as-${i}`;
    const e = enMotor(semilla);
    const carta = e.columnas.map((c) => c.visibles.at(-1)!).find((c) => c.endsWith('-1'));
    if (carta) return { semilla, carta };
  }
  throw new Error('Ninguna semilla con un as arriba');
}

// ── Mover, rechazar, fundación, deshacer y abandonar ─────────────────────────

test('mover un grupo desordenado y deshacerlo', async ({ page }) => {
  const { semilla, e, a } = grupoQueSeMueve('grupo');
  await empezarYukon(page, `rapido&semilla=${semilla}`);
  const columnaDe = (i: string) => e.columnas[Number(i.slice(1))]!;
  const grupo = columnaDe(a.desde).visibles.slice(-a.cantidad);
  await page.locator(`[data-carta="${cartaOrigenYukon(e, a)}"]`).click(ESQUINA);
  await page.getByTestId(a.hasta).click(ESQUINA);
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  for (const c of grupo) {
    await expect(page.getByTestId(a.hasta).locator(`[data-carta="${c}"]`)).toBeVisible();
  }
  await page.screenshot({ path: `test-results/yukon-grupo-${page.viewportSize()!.width}.png` });

  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(page.getByTestId('movimientos')).toHaveText('2');
  for (const c of grupo) {
    await expect(page.getByTestId(a.desde).locator(`[data-carta="${c}"]`)).toBeVisible();
  }
});

test('un movimiento que no encaja no cambia nada', async ({ page }) => {
  await empezarYukon(page, 'rapido&semilla=rechazo');
  const e = enMotor('rechazo');
  const legales = yukon.accionesLegales(e, 0);
  // Una carta de arriba de una columna que no puede ir a la columna 0 (con su carta encima).
  for (const [i, col] of e.columnas.entries()) {
    if (i === 0) continue;
    const carta = col.visibles.at(-1)!;
    const encaja = legales.some(
      (x) => x.tipo === 'mover' && x.desde === `c${i}` && x.hasta === 'c0',
    );
    if (encaja) continue;
    await page.locator(`[data-carta="${carta}"]`).click(ESQUINA);
    await page.getByTestId('c0').click(ESQUINA);
    await expect(page.getByTestId('movimientos')).toHaveText('0');
    await expect(page.getByTestId(`c${i}`).locator(`[data-carta="${carta}"]`)).toBeVisible();
    return;
  }
  throw new Error('Ninguna carta que no encaje');
});

test('doble toque sube un as a la fundación', async ({ page }) => {
  const { semilla, carta } = semillaConAs();
  await empezarYukon(page, `rapido&semilla=${semilla}`);
  await page.locator(`[data-carta="${carta}"]`).dblclick(ESQUINA);
  await expect(page.locator(`[data-testid^="f"] [data-carta="${carta}"]`)).toBeVisible();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
});

test('abandonar el Yukon', async ({ page }) => {
  await empezarYukon(page, 'rapido&semilla=abandono');
  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('fin')).toContainText('Partida abandonada');
});

// ── Ganar ────────────────────────────────────────────────────────────────────

test('ganar un Yukon jugando desde la mesa', async ({ page }) => {
  test.setTimeout(240_000);
  const semilla = 'yukon-4';
  const solucion = solucionarYukon(semilla);
  if (!solucion) throw new Error('Sin solución para la semilla de prueba');
  await empezarYukon(page, `rapido&semilla=${semilla}`);
  await jugarYukon(page, semilla, solucion);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await expect(fin).toContainText('movimientos');
  await page.screenshot({ path: `test-results/yukon-victoria-${page.viewportSize()!.width}.png` });
});

// ── Opciones, retomar y pantalla pequeña ─────────────────────────────────────

test('el Solitario ruso se elige en las opciones', async ({ page }) => {
  await page.goto('./?rapido&semilla=ruso');
  await page.getByTestId('juego-yukon').click();
  await page.getByLabel('Mismo palo (Solitario ruso)').check();
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('construccion')).toHaveText('Mismo palo');
});

test('al recargar una partida de Yukon se continúa en el mismo punto', async ({ page }) => {
  const { semilla, e, a } = grupoQueSeMueve('retomar');
  await empezarYukon(page, `rapido&semilla=${semilla}`);
  await page.locator(`[data-carta="${cartaOrigenYukon(e, a)}"]`).click(ESQUINA);
  await page.getByTestId(a.hasta).click(ESQUINA);
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await expect(
    page.getByTestId(a.hasta).locator(`[data-carta="${cartaOrigenYukon(e, a)}"]`),
  ).toBeVisible();
});

test('la mesa del Yukon entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarYukon(page, 'semilla=pequena');
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  // Las fundaciones y las columnas caben a lo ancho.
  for (const zona of ['f3', 'c6']) {
    const caja = (await page.getByTestId(zona).boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(anchos.ventana);
  }
  await expect(page.getByTestId('c6').locator('[data-carta]')).toHaveCount(5);
  await page.screenshot({ path: 'test-results/yukon-360.png' });
});
