import {
  aplicar,
  belleLucie,
  subeBelleLucie,
  type AccionBelleLucie,
  type EstadoBelleLucie,
} from '@juegos/engine';

/**
 * Busca, con el motor, una secuencia de acciones que gane La Belle Lucie con la semilla dada.
 * Búsqueda en profundidad con poda por estados ya vistos, como la del Scorpion. Los rebarajes
 * y la merci son deterministas (el azar está en el estado), así que también se prueban.
 */
export function solucionarBelleLucie(
  semilla: string,
  limiteNodos = 100_000,
): AccionBelleLucie[] | null {
  const inicio = belleLucie.crear({}, semilla);
  if (!inicio.ok) return null;
  const vistos = new Set<string>();
  const camino: AccionBelleLucie[] = [];
  let nodos = 0;

  const clave = (e: EstadoBelleLucie) =>
    JSON.stringify([e.rebarajes, e.merci, e.abanicos.map((a) => a.join(',')).sort()]);

  // Primero subir, después mover dejando libre una carta que sube, el resto de movimientos, la
  // merci con una carta que sube y rebarajar al final.
  const prioridad = (e: EstadoBelleLucie, a: AccionBelleLucie) => {
    if (a.tipo === 'fundacion') return 0;
    if (a.tipo === 'mover') {
      const queda = e.abanicos[a.desde]!.at(-2);
      return queda !== undefined && subeBelleLucie(e.fundaciones, queda) ? 1 : 2;
    }
    if (a.tipo === 'merci') {
      return subeBelleLucie(e.fundaciones, e.abanicos[a.abanico]![a.indice]!) ? 3 : 9;
    }
    return a.tipo === 'rebarajar' ? 4 : 10;
  };

  const candidatas = (e: EstadoBelleLucie) =>
    belleLucie
      .accionesLegales(e, 0)
      .filter((a) => prioridad(e, a) < 9)
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
    const r = aplicar(belleLucie, tope.estado, 0, accion);
    if (!r.ok) continue;
    if (belleLucie.resultado(r.valor)?.ganadores.length) return [...camino, accion];
    if (++nodos > limiteNodos) return null;
    const k = clave(r.valor);
    if (vistos.has(k)) continue;
    vistos.add(k);
    camino.push(accion);
    pila.push({ acciones: candidatas(r.valor), i: 0, estado: r.valor });
  }
  return null;
}

/** Repite las acciones y devuelve los estados intermedios (para saber qué carta tocar). */
export function estadosBelleLucie(
  semilla: string,
  acciones: readonly AccionBelleLucie[],
): EstadoBelleLucie[] {
  const r = belleLucie.crear({}, semilla);
  if (!r.ok) throw new Error(r.error);
  const estados = [r.valor];
  for (const a of acciones) {
    const s = aplicar(belleLucie, estados.at(-1)!, 0, a);
    if (!s.ok) throw new Error(s.error);
    estados.push(s.valor);
  }
  return estados;
}
