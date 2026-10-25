import {
  aplicar,
  cuarentaLadrones,
  type AccionCuarentaLadrones,
  type EstadoCuarentaLadrones,
} from '@juegos/engine';

/**
 * Busca, con el motor, una secuencia de acciones que gane un Cuarenta ladrones con la semilla
 * dada. Búsqueda en profundidad con poda por estados ya vistos, como la del Canfield.
 */
export function solucionarCuarentaLadrones(
  semilla: string,
  limiteNodos = 200_000,
): AccionCuarentaLadrones[] | null {
  const inicio = cuarentaLadrones.crear({}, semilla);
  if (!inicio.ok) return null;
  const vistos = new Set<string>();
  const camino: AccionCuarentaLadrones[] = [];
  let nodos = 0;

  // Las dos copias de una carta son iguales: la clave no las distingue.
  const sinCopia = (c: string) => c.slice(0, c.indexOf('#'));
  const clave = (e: EstadoCuarentaLadrones) =>
    JSON.stringify([
      e.mazo.length,
      e.columnas.map((c) => c.map(sinCopia).join(',')).sort(),
      e.fundaciones.map((f) => f.length).join(','),
    ]);

  // Primero lo que más avanza: autocompletar, fundaciones, el descarte, vaciar columnas, y
  // robar al final.
  const prioridad = (e: EstadoCuarentaLadrones, a: AccionCuarentaLadrones) => {
    if (a.tipo === 'autocompletar') return 0;
    if (a.tipo === 'robar') return 6;
    if (a.tipo !== 'mover') return 9;
    if (a.hasta.startsWith('f')) return 1;
    if (a.desde === 'descarte') return e.columnas[Number(a.hasta.slice(1))]!.length > 0 ? 2 : 5;
    const col = e.columnas[Number(a.desde.slice(1))]!;
    if (a.cantidad === col.length) return 3;
    return e.columnas[Number(a.hasta.slice(1))]!.length > 0 ? 4 : 5;
  };

  const candidatas = (e: EstadoCuarentaLadrones) =>
    cuarentaLadrones
      .accionesLegales(e, 0)
      .filter((a) => a.tipo !== 'deshacer' && a.tipo !== 'abandonar')
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
    const r = aplicar(cuarentaLadrones, tope.estado, 0, accion);
    if (!r.ok) continue;
    if (cuarentaLadrones.resultado(r.valor)?.ganadores.length) return [...camino, accion];
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
export function estadosCuarentaLadrones(
  semilla: string,
  acciones: readonly AccionCuarentaLadrones[],
): EstadoCuarentaLadrones[] {
  const r = cuarentaLadrones.crear({}, semilla);
  if (!r.ok) throw new Error(r.error);
  const estados = [r.valor];
  for (const a of acciones) {
    const s = aplicar(cuarentaLadrones, estados.at(-1)!, 0, a);
    if (!s.ok) throw new Error(s.error);
    estados.push(s.valor);
  }
  return estados;
}

/** Carta que se toca para hacer un movimiento (la base del tramo que se mueve). */
export function cartaOrigenLadrones(
  e: EstadoCuarentaLadrones,
  a: Extract<AccionCuarentaLadrones, { tipo: 'mover' }>,
): string {
  if (a.desde === 'descarte') return e.descarte.at(-1)!;
  const col = e.columnas[Number(a.desde.slice(1))]!;
  return col[col.length - a.cantidad]!;
}
