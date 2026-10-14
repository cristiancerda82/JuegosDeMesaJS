import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_SPIDER_POR_DEFECTO,
  spider,
  type AccionSpider,
  type EstadoSpider,
} from '@juegos/engine';
import { jugarVoraz } from './spider-voraz';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 4, y: 6 } };

async function empezar(page: Page, semilla: string, palos?: 2 | 4) {
  await page.goto(`./?rapido&semilla=${semilla}`);
  await page.getByTestId('juego-spider').click();
  if (palos) await page.getByLabel(`${palos} palos`).check();
  await page.getByTestId('empezar').click();
}

function estadoInicial(semilla: string): EstadoSpider {
  const r = spider.crear(CONFIG_SPIDER_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Hace una acción en la mesa: mover tocando la carta y la columna, o repartir tocando el mazo. */
async function hacer(page: Page, e: EstadoSpider, accion: AccionSpider) {
  if (accion.tipo === 'repartir') {
    await page.getByTestId('mazo').click();
    return;
  }
  if (accion.tipo !== 'mover') throw new Error(`Acción no soportada: ${accion.tipo}`);
  const carta = e.columnas[accion.desde]!.visibles.at(-accion.cantidad)!;
  await page.getByTestId(`carta-${carta}`).click(ESQUINA);
  await page.getByTestId(`c${accion.hasta}`).click({ position: { x: 4, y: 4 } });
  // Si el movimiento completa una escalera, la carta se retira de la mesa.
  const despues = spider.transicion(e, 0, accion);
  const enDestino = page.getByTestId(`c${accion.hasta}`).getByTestId(`carta-${carta}`);
  if (despues.columnas[accion.hasta]!.visibles.includes(carta))
    await expect(enDestino).toBeVisible();
  else await expect(enDestino).toHaveCount(0);
}

// ── Mover, repartir, deshacer y abandonar ────────────────────────────────────

test('mover una carta, repartir, deshacer y abandonar', async ({ page }) => {
  const semilla = 'spider-e2e';
  const e = estadoInicial(semilla);
  const mover = spider
    .accionesLegales(e, 0)
    .find((a): a is Extract<AccionSpider, { tipo: 'mover' }> => a.tipo === 'mover');
  await empezar(page, semilla);
  await expect(page.locator('[data-testid^="carta-"]')).toHaveCount(10);
  await expect(page.getByTestId('mazo')).toBeEnabled();

  if (mover) {
    await hacer(page, e, mover);
    await expect(page.getByTestId('movimientos')).toHaveText('1');
    await page.getByTestId('deshacer').click();
    const carta = e.columnas[mover.desde]!.visibles.at(-1)!;
    await expect(page.getByTestId(`c${mover.desde}`).getByTestId(`carta-${carta}`)).toBeVisible();
  }

  await page.getByTestId('mazo').click();
  await expect(page.locator('[data-testid^="carta-"]')).toHaveCount(20);
  await expect(page.getByText('Quedan 4 repartos')).toBeVisible();
  await page.getByTestId('deshacer').click();
  await expect(page.locator('[data-testid^="carta-"]')).toHaveCount(10);
  await expect(page.getByText('Quedan 5 repartos')).toBeVisible();

  page.once('dialog', (d) => void d.accept());
  await page.getByRole('button', { name: 'Abandonar' }).click();
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('Partida abandonada');
  await expect(fin.getByTestId('resumen-spider')).toContainText('0 de 8 escaleras');
});

// ── Escaleras ────────────────────────────────────────────────────────────────

test('mover una escalera y completar otra, que se retira sola', async ({ page }) => {
  let semilla = '';
  let acciones: AccionSpider[] | null = null;
  for (let i = 0; i < 100 && acciones === null; i++) {
    semilla = `escalera-${i}`;
    acciones = jugarVoraz(semilla, (e) => e.completadas.length > 0, undefined, 60);
  }
  if (acciones === null) throw new Error('Ninguna semilla completa una escalera');

  await empezar(page, semilla);
  let e = estadoInicial(semilla);
  let escaleraMovida = false;
  for (const accion of acciones) {
    await hacer(page, e, accion);
    if (accion.tipo === 'mover' && accion.cantidad > 1) escaleraMovida = true;
    e = spider.transicion(e, 0, accion);
  }
  expect(escaleraMovida).toBe(true);
  await expect(page.getByTestId('completadas')).toContainText('1/8');
  await expect(page.locator('[data-testid^="carta-"]')).toHaveCount(
    e.columnas.reduce((s, c) => s + c.visibles.length, 0),
  );
});

test('el doble toque lleva la carta a un destino legal', async ({ page }) => {
  const semilla = 'doble-toque';
  const e = estadoInicial(semilla);
  const mover = spider
    .accionesLegales(e, 0)
    .find((a): a is Extract<AccionSpider, { tipo: 'mover' }> => a.tipo === 'mover');
  test.skip(mover === undefined, 'la semilla no tiene movimientos al empezar');
  await empezar(page, semilla);
  const carta = e.columnas[mover!.desde]!.visibles.at(-1)!;
  await page.getByTestId(`carta-${carta}`).dblclick(ESQUINA);
  await expect(page.getByTestId('movimientos')).toHaveText('1');
  await expect(page.getByTestId(`c${mover!.desde}`).getByTestId(`carta-${carta}`)).toHaveCount(0);
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa del Spider entra en 360 × 640', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'pequena', 4);
  for (let i = 0; i < 3; i++) await page.getByTestId('mazo').click();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  const ultima = await page.getByTestId('c9').boundingBox();
  expect(ultima!.x + ultima!.width).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/spider-360.png' });
});
