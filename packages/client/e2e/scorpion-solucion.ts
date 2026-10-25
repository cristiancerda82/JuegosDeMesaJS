import { aplicar, scorpion, type AccionScorpion, type EstadoScorpion } from '@juegos/engine';

/**
 * Busca, con el motor, una secuencia de acciones que gane un Scorpion con la semilla dada.
 * Búsqueda en profundidad con poda por estados ya vistos, como la de Cuarenta ladrones.
 */
export function solucionarScorpion(
  semilla: string,
  limiteNodos = 200_000,
): AccionScorpion[] | null {
  const inicio = scorpion.crear({}, semilla);
  if (!inicio.ok) return null;
  const vistos = new Set<string>();
  const camino: AccionScorpion[] = [];
  let nodos = 0;

  const clave = (e: EstadoScorpion) =>
    JSON.stringify([
      e.reserva.length,
      e.columnas.map((c) => `${c.ocultas.length}:${c.visibles.join(',')}`).sort(),
    ]);

  // Primero lo que descubre cartas tapadas, después lo que une cartas a su escalera, y repartir
  // la reserva al final.
  const prioridad = (e: EstadoScorpion, a: AccionScorpion) => {
    if (a.tipo === 'repartir') return 6;
    if (a.tipo !== 'mover') return 9;
    const origen = e.columnas[a.desde]!;
    const quedan = origen.visibles.length - a.cantidad;
    if (quedan === 0 && origen.ocultas.length > 0) return 1;
    return e.columnas[a.hasta]!.visibles.length > 0 ? 2 : 4;
  };

  const candidatas = (e: EstadoScorpion) =>
    scorpion
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
    const r = aplicar(scorpion, tope.estado, 0, accion);
    if (!r.ok) continue;
    if (scorpion.resultado(r.valor)?.ganadores.length) return [...camino, accion];
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
export function estadosScorpion(
  semilla: string,
  acciones: readonly AccionScorpion[],
): EstadoScorpion[] {
  const r = scorpion.crear({}, semilla);
  if (!r.ok) throw new Error(r.error);
  const estados = [r.valor];
  for (const a of acciones) {
    const s = aplicar(scorpion, estados.at(-1)!, 0, a);
    if (!s.ok) throw new Error(s.error);
    estados.push(s.valor);
  }
  return estados;
}

/** Carta que se toca para hacer un movimiento (la que se mueve con las de encima). */
export function cartaOrigenScorpion(
  e: EstadoScorpion,
  a: Extract<AccionScorpion, { tipo: 'mover' }>,
): string {
  const col = e.columnas[a.desde]!.visibles;
  return col[col.length - a.cantidad]!;
}
