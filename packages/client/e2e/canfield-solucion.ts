import { expect, type Page } from '@playwright/test';
import {
  aplicar,
  canfield,
  type AccionCanfield,
  type ConfigCanfield,
  type EstadoCanfield,
} from '@juegos/engine';

/** Robo de 1: con él se gana una buena parte de las partidas. */
export const CONFIG_SOLUCION: ConfigCanfield = { robo: 1 };

/**
 * Busca, con el motor, una secuencia de acciones que gane un Canfield con la semilla dada.
 * Búsqueda en profundidad con poda por estados ya vistos, como la del Klondike.
 */
export function solucionarCanfield(
  semilla: string,
  config: ConfigCanfield = CONFIG_SOLUCION,
  limiteNodos = 100_000,
): AccionCanfield[] | null {
  const inicio = canfield.crear(config, semilla);
  if (!inicio.ok) return null;
  const vistos = new Set<string>();
  const camino: AccionCanfield[] = [];
  let nodos = 0;

  const clave = (e: EstadoCanfield) =>
    JSON.stringify([
      e.reserva.length,
      e.mazo.length,
      e.descarte.length,
      e.columnas,
      e.fundaciones.map((f) => f.length),
    ]);

  // Primero lo que más avanza: autocompletar, fundaciones, la reserva, el descarte, vaciar
  // columnas, y robar o reciclar al final.
  const prioridad = (e: EstadoCanfield, a: AccionCanfield) => {
    if (a.tipo === 'autocompletar') return 0;
    if (a.tipo === 'robar' || a.tipo === 'reciclar') return 6;
    if (a.tipo !== 'mover') return 9;
    if (a.hasta.startsWith('f')) return 1;
    if (a.desde === 'reserva') return 2;
    if (a.desde === 'descarte') return 3;
    const col = e.columnas[Number(a.desde.slice(1))]!;
    return a.cantidad === col.length ? 4 : 5;
  };

  const candidatas = (e: EstadoCanfield) =>
    canfield
      .accionesLegales(e, 0)
      .filter((a) => a.tipo !== 'deshacer' && a.tipo !== 'abandonar')
      // Sacar de una fundación rara vez ayuda y multiplica la búsqueda.
      .filter((a) => !(a.tipo === 'mover' && a.desde.startsWith('f')))
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
    const r = aplicar(canfield, tope.estado, 0, accion);
    if (!r.ok) continue;
    if (canfield.resultado(r.valor)?.ganadores.length) return [...camino, accion];
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
export function estadosCanfield(
  semilla: string,
  acciones: readonly AccionCanfield[],
  config: ConfigCanfield = CONFIG_SOLUCION,
): EstadoCanfield[] {
  const r = canfield.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  const estados = [r.valor];
  for (const a of acciones) {
    const s = aplicar(canfield, estados.at(-1)!, 0, a);
    if (!s.ok) throw new Error(s.error);
    estados.push(s.valor);
  }
  return estados;
}

/** Carta que se toca para hacer un movimiento (la base del tramo que se mueve). */
export function cartaOrigenCanfield(
  e: EstadoCanfield,
  a: Extract<AccionCanfield, { tipo: 'mover' }>,
): string {
  if (a.desde === 'descarte') return e.descarte.at(-1)!;
  if (a.desde === 'reserva') return e.reserva.at(-1)!;
  const i = Number(a.desde.slice(1));
  if (a.desde.startsWith('f')) return e.fundaciones[i]!.at(-1)!;
  const col = e.columnas[i]!;
  return col[col.length - a.cantidad]!;
}

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 8, y: 8 } };

/** Juega por la UI las acciones de una solución, comprobando el contador de movimientos. */
export async function jugarCanfield(
  page: Page,
  semilla: string,
  acciones: readonly AccionCanfield[],
) {
  const estados = estadosCanfield(semilla, acciones);
  for (const [i, a] of acciones.entries()) {
    const e = estados[i]!;
    await page.waitForFunction(() => document.getAnimations().length === 0);
    if (a.tipo === 'robar' || a.tipo === 'reciclar') {
      await page.getByTestId('mazo').click();
    } else if (a.tipo === 'autocompletar') {
      await page.getByRole('button', { name: 'Autocompletar' }).click();
    } else if (a.tipo === 'mover') {
      await page.locator(`[data-carta="${cartaOrigenCanfield(e, a)}"]`).click(ESQUINA);
      await page.getByTestId(a.hasta).click(ESQUINA);
    }
    if (a.tipo !== 'autocompletar') {
      await expect(page.getByTestId('movimientos')).toHaveText(String(estados[i + 1]!.movimientos));
    }
  }
}
