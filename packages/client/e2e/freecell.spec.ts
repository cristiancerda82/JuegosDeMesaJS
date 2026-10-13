import { expect, test, type Page } from '@playwright/test';
import {
  aplicar,
  CONFIG_FREECELL_POR_DEFECTO,
  freecell,
  type AccionFreeCell,
  type ConfigFreeCell,
  type EstadoFreeCell,
  type IdCarta,
} from '@juegos/engine';
import { resolverFreeCell } from './freecell-solucion';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 6 } };

async function empezar(page: Page, numero: number, query = 'rapido') {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-freecell').click();
  await page.getByLabel('Por número').check();
  await page.getByTestId('numero-partida').fill(String(numero));
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('numero')).toHaveText(String(numero));
}

/** Carta que se toca para hacer el movimiento: la de más abajo de la secuencia que se mueve. */
function cartaOrigen(e: EstadoFreeCell, a: Extract<AccionFreeCell, { tipo: 'mover' }>): IdCarta {
  const i = Number(a.desde.slice(1));
  if (a.desde.startsWith('l')) return e.celdas[i]!;
  const col = e.columnas[i]!;
  return col[col.length - a.cantidad]!;
}

/** Reproduce en la mesa una lista de acciones, siguiendo el estado con el motor. */
async function reproducir(page: Page, config: ConfigFreeCell, acciones: readonly AccionFreeCell[]) {
  const creado = freecell.crear(config, 'e2e');
  if (!creado.ok) throw new Error(creado.error);
  let e = creado.valor;
  for (const a of acciones) {
    if (a.tipo === 'autocompletar') {
      await page.getByTestId('autocompletar').click();
    } else if (a.tipo === 'mover') {
      await page
        .locator(
          `.columnas [data-carta="${cartaOrigen(e, a)}"], .celda [data-carta="${cartaOrigen(e, a)}"]`,
        )
        .click(ESQUINA);
      await page.getByTestId(a.hasta).click(ESQUINA);
    }
    e = (aplicar(freecell, e, 0, a) as { valor: EstadoFreeCell }).valor;
    await expect(page.getByTestId('movimientos')).toHaveText(String(e.movimientos));
  }
}

// ── Partida completa ─────────────────────────────────────────────────────────

test('gana la partida 1 de FreeCell desde la mesa', async ({ page }) => {
  test.setTimeout(240_000);
  const config: ConfigFreeCell = { ...CONFIG_FREECELL_POR_DEFECTO, partida: 1 };
  const solucion = resolverFreeCell(config);
  await empezar(page, 1);
  await reproducir(page, config, solucion);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText('¡Solitario completado!');
  await expect(fin.getByTestId('resumen-freecell')).toContainText('Partida nº 1');
});

// ── Secuencias y deshacer ────────────────────────────────────────────────────

test('arrastrar una secuencia la mueve entera y deshacer la devuelve', async ({ page }) => {
  // Se juega la solución de la partida 1 hasta su primer movimiento de varias cartas,
  // y ese se hace arrastrando.
  const config: ConfigFreeCell = { ...CONFIG_FREECELL_POR_DEFECTO, partida: 1 };
  const solucion = resolverFreeCell(config);
  const i = solucion.findIndex(
    (a) => a.tipo === 'mover' && a.cantidad >= 2 && a.hasta.startsWith('c'),
  );
  if (i < 0) throw new Error('La solución de la partida 1 no mueve ninguna secuencia');
  const secuencia = solucion[i] as Extract<AccionFreeCell, { tipo: 'mover' }>;
  await empezar(page, 1);
  await reproducir(page, config, solucion.slice(0, i));

  let e = (freecell.crear(config, 'e2e') as { valor: EstadoFreeCell }).valor;
  for (const a of solucion.slice(0, i))
    e = (aplicar(freecell, e, 0, a) as { valor: EstadoFreeCell }).valor;
  const movidas = e.columnas[Number(secuencia.desde.slice(1))]!.slice(-secuencia.cantidad);
  const carta = page.locator(`.columnas [data-carta="${movidas[0]}"]`);
  const destino = page.getByTestId(secuencia.hasta);
  const caja = (await carta.boundingBox())!;
  const objetivo = (await destino.boundingBox())!;
  await page.mouse.move(caja.x + 6, caja.y + 6);
  await page.mouse.down();
  await page.mouse.move(objetivo.x + objetivo.width / 2, objetivo.y + objetivo.height - 10, {
    steps: 12,
  });
  await page.mouse.up();
  for (const id of movidas) await expect(destino.locator(`[data-carta="${id}"]`)).toBeVisible();

  await page.getByTestId('deshacer').click();
  const origen = page.getByTestId(secuencia.desde);
  for (const id of movidas) await expect(origen.locator(`[data-carta="${id}"]`)).toBeVisible();
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa del FreeCell entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 1);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
    alto: window.innerHeight,
    documento: document.documentElement.scrollHeight,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  expect(anchos.documento).toBeLessThanOrEqual(anchos.alto);
  await page.screenshot({ path: 'test-results/freecell-360.png' });
});
