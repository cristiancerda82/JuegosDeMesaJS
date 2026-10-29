import type { IdCarta } from '../baraja/cartas';
import {
  cantesPosiblesBezique,
  esBrisque,
  ganaSegundaBezique,
  paloBezique,
  puntosCanteBezique,
  rangoBezique,
  valorBezique,
  type AccionBezique,
  type VistaBezique,
} from '../juegos/bezique';
import type { Agente } from './agente';

/** Cartas que conviene guardar para cantar: las de alguna combinación que ya se puede formar. */
function protegidas(vista: VistaBezique): Set<IdCarta> {
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];
  const manos = [mano, mano];
  const r = new Set<IdCarta>();
  if (vista.fase !== 'bazas') return r;
  for (const p of cantesPosiblesBezique({ ...vista, manos }, yo)) {
    for (const c of p.cartas) r.add(c);
  }
  // Las parejas a medias: el K y la Q del mismo palo, y la Q de picas y la J de diamantes.
  for (const c of mano) {
    const v = valorBezique(c);
    if (v === 13 || v === 12) r.add(c);
    if (c === 'picas-12' || c === 'diamantes-11') r.add(c);
  }
  return r;
}

/** Coste de soltar una carta: los triunfos y las brisques valen más. */
function coste(vista: VistaBezique, c: IdCarta): number {
  return (paloBezique(c) === vista.triunfo ? 100 : 0) + (esBrisque(c) ? 50 : 0) + rangoBezique(c);
}

export function cartaBezique(vista: VistaBezique, cartas: readonly IdCarta[]): IdCarta {
  const porCoste = [...cartas].sort((a, b) => coste(vista, a) - coste(vista, b));
  const masBaja = porCoste[0]!;
  const mesa = vista.mesa;

  if (vista.fase === 'final') {
    if (mesa.length === 0) {
      // Al salir, la más alta que no sea triunfo; si no, la más alta.
      const noTriunfo = porCoste.filter((c) => paloBezique(c) !== vista.triunfo);
      return (noTriunfo.length > 0 ? noTriunfo : porCoste).reduce((a, b) =>
        rangoBezique(b) > rangoBezique(a) ? b : a,
      );
    }
    const gana = porCoste.filter((c) => ganaSegundaBezique(mesa[0]!.carta, c, vista.triunfo));
    return gana[0] ?? masBaja;
  }

  const guardar = protegidas(vista);
  const sueltas = porCoste.filter(
    (c) => paloBezique(c) !== vista.triunfo && !esBrisque(c) && !guardar.has(c),
  );
  if (mesa.length === 0) return sueltas[0] ?? masBaja;
  const salida = mesa[0]!.carta;
  if (esBrisque(salida)) {
    const gana = porCoste.filter((c) => ganaSegundaBezique(salida, c, vista.triunfo));
    if (gana.length > 0) return gana[0]!;
  }
  return sueltas[0] ?? masBaja;
}

/** Lo que haría la IA básica. */
export function decisionBezique(
  vista: VistaBezique,
  acciones: readonly AccionBezique[],
): AccionBezique {
  if (vista.fase === 'declarar') {
    let mejor: AccionBezique = { tipo: 'pasar' };
    let puntos = 0;
    for (const a of acciones) {
      const p =
        a.tipo === 'cantar'
          ? puntosCanteBezique(a.cante, a.cartas, vista.triunfo)
          : a.tipo === 'cambiar'
            ? 10
            : 0;
      if (p > puntos) {
        mejor = a;
        puntos = p;
      }
    }
    return mejor;
  }
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  return { tipo: 'jugar', carta: cartaBezique(vista, cartas) };
}

/**
 * IA básica del Bezique (spec ia-jugadores): canta lo que más vale, juega sus cartas más bajas,
 * gana las brisques con la carta justa y, en las últimas bazas, gana con lo mínimo. Es
 * determinista: no usa el azar que recibe.
 */
export const iaBeziqueBasica: Agente<VistaBezique, AccionBezique> = {
  id: 'bezique-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionBezique(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
