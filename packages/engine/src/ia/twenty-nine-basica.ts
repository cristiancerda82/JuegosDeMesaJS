import type { IdCarta, PaloFrances } from '../baraja/cartas';
import {
  ganadoraTwentyNine,
  ladoTwentyNine,
  paloTwentyNine,
  PUJA_MAXIMA_TWENTY_NINE,
  PUJA_MINIMA_TWENTY_NINE,
  puntosTwentyNine,
  rangoTwentyNine,
  type AccionTwentyNine,
  type VistaTwentyNine,
} from '../juegos/twenty-nine';
import type { Agente } from './agente';

const PALOS: readonly PaloFrances[] = ['picas', 'corazones', 'treboles', 'diamantes'];
const JOTA = 11;

const puntosDe = (cartas: readonly IdCarta[]) =>
  cartas.reduce((s, c) => s + puntosTwentyNine(c), 0);
const delPalo = (mano: readonly IdCarta[], p: PaloFrances) =>
  mano.filter((c) => paloTwentyNine(c) === p);

/** Su palo más largo (si empatan, el de más puntos). */
function paloLargo(mano: readonly IdCarta[]): PaloFrances {
  return PALOS.reduce((mejor, p) => {
    const a = delPalo(mano, p);
    const b = delPalo(mano, mejor);
    return a.length > b.length || (a.length === b.length && puntosDe(a) > puntosDe(b)) ? p : mejor;
  });
}

/** 13 más sus puntos más las cartas de su palo más largo menos una, como mucho 28. */
export function pujaMaximaTwentyNine(mano: readonly IdCarta[]): number {
  const largo = delPalo(mano, paloLargo(mano)).length;
  return Math.min(PUJA_MAXIMA_TWENTY_NINE, 13 + puntosDe(mano) + largo - 1);
}

/** El palo más largo, o sin triunfo (`null`) si no repite palo y tiene al menos 6 puntos. */
export function triunfoTwentyNine(mano: readonly IdCarta[]): PaloFrances | null {
  const repite = PALOS.some((p) => delPalo(mano, p).length > 1);
  if (!repite && puntosDe(mano) >= 6) return null;
  return paloLargo(mano);
}

/** La carta que juega entre las legales. */
export function cartaTwentyNine(vista: VistaTwentyNine, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const triunfo = vista.descubierto && !vista.sinTriunfo ? vista.triunfo : null;
  const fuerza = (c: IdCarta) => (paloTwentyNine(c) === triunfo ? 100 : 0) + rangoTwentyNine(c);
  const porFuerza = [...cartas].sort((a, b) => fuerza(a) - fuerza(b));
  const menosPuntos = [...cartas].sort(
    (a, b) => puntosTwentyNine(a) - puntosTwentyNine(b) || fuerza(a) - fuerza(b),
  )[0]!;
  if (vista.mesa.length === 0) {
    const jotas = porFuerza.filter((c) => Number(c.split('-')[1]) === JOTA);
    return jotas.at(-1) ?? porFuerza[0]!;
  }
  const ganando = ganadoraTwentyNine(vista.mesa, triunfo).asiento;
  if (ladoTwentyNine(ganando) === ladoTwentyNine(yo)) {
    // La baza es del compañero: se cargan puntos.
    return [...cartas].sort(
      (a, b) => puntosTwentyNine(b) - puntosTwentyNine(a) || fuerza(a) - fuerza(b),
    )[0]!;
  }
  const ganadoras = porFuerza.filter(
    (c) => ganadoraTwentyNine([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  return ganadoras[0] ?? menosPuntos;
}

export function decisionTwentyNine(
  vista: VistaTwentyNine,
  acciones: readonly AccionTwentyNine[],
): AccionTwentyNine {
  const mano = vista.miMano ?? [];
  const yo = vista.asiento!;
  switch (vista.fase) {
    case 'subasta': {
      const siguiente = Math.max(PUJA_MINIMA_TWENTY_NINE, (vista.pujaMayor ?? 0) + 1);
      return siguiente <= pujaMaximaTwentyNine(mano)
        ? { tipo: 'pujar', valor: siguiente }
        : { tipo: 'pasar' };
    }
    case 'triunfo':
      return { tipo: 'elegirTriunfo', palo: triunfoTwentyNine(mano) };
    case 'doblar':
      return puntosDe(mano) >= 7 ? { tipo: 'doblar' } : { tipo: 'noDoblar' };
    case 'redoblar':
      return puntosDe(mano) >= 8 ? { tipo: 'redoblar' } : { tipo: 'noRedoblar' };
    case 'bazas': {
      if (acciones.some((a) => a.tipo === 'cantarPareja')) return { tipo: 'cantarPareja' };
      if (acciones.some((a) => a.tipo === 'pedirTriunfo')) {
        const enJuego = vista.mesa.reduce((s, j) => s + puntosTwentyNine(j.carta), 0);
        const ganando = ganadoraTwentyNine(vista.mesa, null).asiento;
        if (enJuego > 0 && ladoTwentyNine(ganando) !== ladoTwentyNine(yo)) {
          return { tipo: 'pedirTriunfo' };
        }
      }
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugarCarta' ? [a.carta] : []));
      return { tipo: 'jugarCarta', carta: cartaTwentyNine(vista, cartas) };
    }
  }
}

export const iaTwentyNineBasica: Agente<VistaTwentyNine, AccionTwentyNine> = {
  id: 'twenty-nine-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionTwentyNine(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
