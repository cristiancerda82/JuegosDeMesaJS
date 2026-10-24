import { expect, type Page } from '@playwright/test';
import {
  aplicar,
  CONFIG_YUKON_POR_DEFECTO,
  yukon,
  type AccionYukon,
  type ConfigYukon,
  type EstadoYukon,
} from '@juegos/engine';

/**
 * Busca, con el motor, una secuencia de acciones que gane un Yukon con la semilla dada.
 * Búsqueda en profundidad con poda por estados ya vistos, como la del Klondike.
 */
export function solucionarYukon(
  semilla: string,
  config: ConfigYukon = CONFIG_YUKON_POR_DEFECTO,
  limiteNodos = 100_000,
): AccionYukon[] | null {
  const inicio = yukon.crear(config, semilla);
  if (!inicio.ok) return null;
  const vistos = new Set<string>();
  const camino: AccionYukon[] = [];
  let nodos = 0;

  const clave = (e: EstadoYukon) =>
    JSON.stringify([e.columnas.map((c) => c.visibles), e.fundaciones.map((f) => f.length)]);

  // Primero lo que más avanza: autocompletar, fundaciones, descubrir cartas, y el resto al final.
  const prioridad = (e: EstadoYukon, a: AccionYukon) => {
    if (a.tipo === 'autocompletar') return 0;
    if (a.tipo !== 'mover') return 9;
    if (a.hasta.startsWith('f')) return 1;
    const col = e.columnas[Number(a.desde.slice(1))]!;
    if (a.cantidad === col.visibles.length && col.ocultas.length > 0) return 2;
    return 3;
  };

  const candidatas = (e: EstadoYukon) =>
    yukon
      .accionesLegales(e, 0)
      .filter((a) => a.tipo !== 'deshacer' && a.tipo !== 'abandonar')
      // Sacar de una fundación rara vez ayuda y multiplica la búsqueda.
      .filter((a) => !(a.tipo === 'mover' && a.desde.startsWith('f')))
      // Pasar una columna entera a una vacía no cambia nada.
      .filter((a) => {
        if (a.tipo !== 'mover' || !a.hasta.startsWith('c')) return true;
        const col = e.columnas[Number(a.desde.slice(1))]!;
        const destino = e.columnas[Number(a.hasta.slice(1))]!;
        const entera = a.cantidad === col.visibles.length && col.ocultas.length === 0;
        return !(entera && destino.visibles.length === 0);
      })
      .sort((a, b) => prioridad(e, a) - prioridad(e, b));

  vistos.add(clave(inicio.valor));
  const pila = [{ acciones: candidatas(inicio.valor), i: 0, estado: inicio.valor }];
  while (pila.length > 0) {
    const tope = pila.at(-1)!;
    if (tope.i >= tope.acciones.length) {
      pila.pop();
      if (pila.length > 0) camino.pop();
      continue;
    }
    const accion = tope.acciones[tope.i++]!;
    const r = aplicar(yukon, tope.estado, 0, accion);
    if (!r.ok) continue;
    if (yukon.resultado(r.valor)?.ganadores.length) return [...camino, accion];
    if (++nodos > limiteNodos) return null;
    const k = clave(r.valor);
    if (vistos.has(k)) continue;
    vistos.add(k);
    camino.push(accion);
    pila.push({ acciones: candidatas(r.valor), i: 0, estado: r.valor });
  }
  return null;
}

/** Repite las acciones y devuelve los estados intermedios (para saber qué carta mover). */
export function estadosYukon(semilla: string, acciones: readonly AccionYukon[]): EstadoYukon[] {
  const r = yukon.crear(CONFIG_YUKON_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  const estados = [r.valor];
  for (const a of acciones) {
    const s = aplicar(yukon, estados.at(-1)!, 0, a);
    if (!s.ok) throw new Error(s.error);
    estados.push(s.valor);
  }
  return estados;
}

/** Carta que se toca para hacer un movimiento (la base del grupo que se mueve). */
export function cartaOrigenYukon(
  e: EstadoYukon,
  a: Extract<AccionYukon, { tipo: 'mover' }>,
): string {
  const i = Number(a.desde.slice(1));
  if (a.desde.startsWith('f')) return e.fundaciones[i]!.at(-1)!;
  const visibles = e.columnas[i]!.visibles;
  return visibles[visibles.length - a.cantidad]!;
}

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 8, y: 8 } };

/** Juega por la UI las acciones de una solución, comprobando el contador de movimientos. */
export async function jugarYukon(page: Page, semilla: string, acciones: readonly AccionYukon[]) {
  const estados = estadosYukon(semilla, acciones);
  for (const [i, a] of acciones.entries()) {
    const e = estados[i]!;
    await page.waitForFunction(() => document.getAnimations().length === 0);
    if (a.tipo === 'autocompletar') {
      await page.getByRole('button', { name: 'Autocompletar' }).click();
    } else if (a.tipo === 'mover') {
      await page.locator(`[data-carta="${cartaOrigenYukon(e, a)}"]`).click(ESQUINA);
      await page.getByTestId(a.hasta).click(ESQUINA);
      await expect(page.getByTestId('movimientos')).toHaveText(String(estados[i + 1]!.movimientos));
    }
  }
}
