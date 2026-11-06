import type { IdCarta } from '../baraja/cartas';
import {
  anadidosConquian,
  paloConquian,
  posicionConquian,
  valorConquian,
  type AccionConquian,
  type VistaConquian,
} from '../juegos/conquian';
import type { Agente } from './agente';

/** Las otras cartas de la mano del mismo número o del mismo palo a una o dos posiciones. */
export function relacionConquian(carta: IdCarta, mano: readonly IdCarta[]): number {
  return mano.filter(
    (c) =>
      c !== carta &&
      (valorConquian(c) === valorConquian(carta) ||
        (paloConquian(c) === paloConquian(carta) &&
          Math.abs(posicionConquian(c) - posicionConquian(carta)) <= 2)),
  ).length;
}

/** La carta que descarta: evita dársela al rival, luego la de menos relación y la más alta. */
export function descarteConquian(
  mano: readonly IdCarta[],
  combinacionesRival: readonly (readonly IdCarta[])[],
): IdCarta {
  const leSirve = (c: IdCarta) => (anadidosConquian([], c, combinacionesRival).length > 0 ? 1 : 0);
  return [...mano].sort(
    (a, b) =>
      leSirve(a) - leSirve(b) ||
      relacionConquian(a, mano) - relacionConquian(b, mano) ||
      posicionConquian(b) - posicionConquian(a) ||
      (a < b ? -1 : 1),
  )[0]!;
}

export function decisionConquian(
  vista: VistaConquian,
  acciones: readonly AccionConquian[],
): AccionConquian {
  const yo = vista.asiento!;
  if (vista.fase === 'descartar') {
    return {
      tipo: 'descartar',
      carta: descarteConquian(vista.miMano ?? [], vista.combinaciones[1 - yo]!),
    };
  }
  // La jugada que baja más cartas de la mano; si empatan, añadir.
  const usos = acciones.filter((a) => a.tipo === 'bajar' || a.tipo === 'anadir');
  const mejor = [...usos].sort((a, b) => {
    const n = (x: AccionConquian) => ('cartas' in x ? x.cartas.length : 0);
    return n(b) - n(a) || (a.tipo === 'anadir' ? -1 : 0) - (b.tipo === 'anadir' ? -1 : 0);
  })[0];
  return mejor ?? { tipo: 'pasar' };
}

export const iaConquianBasica: Agente<VistaConquian, AccionConquian> = {
  id: 'conquian-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionConquian(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
