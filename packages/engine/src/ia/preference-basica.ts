import type { IdCarta, PaloFrances } from '../baraja/cartas';
import {
  BAZAS_WHIST_PREFERENCE,
  ganadoraPreference,
  mismaPujaPreference,
  ordenPujaPreference,
  PALOS_PUJA_PREFERENCE,
  paloPreference,
  rangoPreference,
  triunfoPreference,
  type AccionPreference,
  type PaloPujaPreference,
  type PujaPreference,
  type VistaPreference,
} from '../juegos/preference';
import type { Agente } from './agente';

const PALOS: readonly PaloFrances[] = ['picas', 'treboles', 'diamantes', 'corazones'];
const AS = 8;
const REY = 7;
const DAMA = 6;
/** Lo que se espera mejorar con la viuda y el descarte, al pujar. */
const VIUDA = 1;

/**
 * Bazas que espera ganar con `mano` y este triunfo (spec ia-jugadores): 1 por cada As; 1 por cada
 * rey con el As o con otra carta (medio si va solo); medio por cada dama con el As o el rey o con
 * dos cartas más; y, en el triunfo, 1 por carta pasada de la segunda.
 */
export function bazasEsperadasPreference(
  mano: readonly IdCarta[],
  triunfo: PaloFrances | null,
): number {
  let total = 0;
  for (const palo of PALOS) {
    const cartas = mano.filter((c) => paloPreference(c) === palo).map(rangoPreference);
    const as = cartas.includes(AS);
    if (as) total += 1;
    const rey = cartas.includes(REY);
    if (rey) total += as || cartas.length >= 2 ? 1 : 0.5;
    if (cartas.includes(DAMA) && (as || rey || cartas.length >= 3)) total += 0.5;
    if (palo === triunfo) total += Math.max(0, cartas.length - 2);
  }
  return total;
}

const triunfoDe = (palo: PaloPujaPreference) => (palo === 'sin' ? null : palo);

/** La puja de la IA, o `null` si pasa. */
function puja(
  mano: readonly IdCarta[],
  posibles: readonly PujaPreference[],
): PujaPreference | null {
  const miseria = posibles.find((p) => p.tipo === 'miseria');
  if (miseria && mano.every((c) => rangoPreference(c) <= 3)) return miseria;
  // El palo con más bazas esperadas; a igualdad, el más alto.
  const mejores = PALOS_PUJA_PREFERENCE.map((palo) => ({
    palo,
    bazas: Math.floor(bazasEsperadasPreference(mano, triunfoDe(palo)) + VIUDA),
  })).sort(
    (a, b) =>
      b.bazas - a.bazas ||
      PALOS_PUJA_PREFERENCE.indexOf(b.palo) - PALOS_PUJA_PREFERENCE.indexOf(a.palo),
  );
  const { palo, bazas } = mejores[0]!;
  if (bazas < 6) return null;
  return (
    [...posibles]
      .filter((p) => p.tipo === 'bazas' && p.palo === palo && p.bazas <= bazas)
      .sort((a, b) => ordenPujaPreference(a) - ordenPujaPreference(b))[0] ?? null
  );
}

/** La carta que descarta (de las 2) con el contrato que va a jugar. */
function descarte(mano: readonly IdCarta[], contrato: PujaPreference): IdCarta {
  let orden: IdCarta[];
  if (contrato.tipo === 'miseria') {
    orden = [...mano].sort((a, b) => rangoPreference(b) - rangoPreference(a));
  } else {
    const triunfo = triunfoDe(contrato.palo);
    const largo = (c: IdCarta) =>
      mano.filter((x) => paloPreference(x) === paloPreference(c)).length;
    orden = [...mano].sort(
      (a, b) =>
        Number(paloPreference(a) === triunfo) - Number(paloPreference(b) === triunfo) ||
        largo(a) - largo(b) ||
        rangoPreference(a) - rangoPreference(b),
    );
  }
  return orden[0]!;
}

/** La carta que juega entre las legales. */
export function cartaPreference(vista: VistaPreference, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const triunfo = triunfoPreference(vista.contrato);
  const fuerza = (c: IdCarta) => (paloPreference(c) === triunfo ? 100 : 0) + rangoPreference(c);
  const masBaja = [...cartas].sort((a, b) => fuerza(a) - fuerza(b))[0]!;
  const gana = (c: IdCarta) =>
    ganadoraPreference([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento === yo;
  const perder =
    vista.contrato === null || (vista.contrato.tipo === 'miseria' && vista.juega === yo);

  if (perder) {
    if (vista.mesa.length === 0) return masBaja;
    const pierden = cartas.filter((c) => !gana(c)).sort((a, b) => fuerza(b) - fuerza(a));
    return pierden[0] ?? masBaja;
  }
  if (vista.mesa.length === 0) {
    const largo = (c: IdCarta) =>
      cartas.filter((x) => paloPreference(x) === paloPreference(c)).length;
    return [...cartas].sort((a, b) => largo(b) - largo(a) || fuerza(b) - fuerza(a))[0]!;
  }
  const ganadoras = cartas.filter(gana).sort((a, b) => fuerza(a) - fuerza(b));
  return ganadoras[0] ?? masBaja;
}

export function decisionPreference(
  vista: VistaPreference,
  acciones: readonly AccionPreference[],
): AccionPreference {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'subasta': {
      const posibles = acciones.flatMap((a) => (a.tipo === 'pujar' ? [a.puja] : []));
      const p = puja(mano, posibles);
      return p ? { tipo: 'pujar', puja: p } : { tipo: 'pasar' };
    }
    case 'descarte':
      return { tipo: 'descartar', carta: descarte(mano, vista.mejor!.puja) };
    case 'contrato':
      return { tipo: 'declarar', puja: vista.mejor!.puja };
    case 'whist': {
      const contrato = vista.contrato!;
      if (contrato.tipo !== 'bazas') return { tipo: 'pasarWhist' };
      const necesita = Math.ceil(BAZAS_WHIST_PREFERENCE[contrato.bazas]! / 2);
      const espera = bazasEsperadasPreference(mano, triunfoPreference(contrato));
      return espera >= necesita ? { tipo: 'whist' } : { tipo: 'pasarWhist' };
    }
    case 'bazas': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
      return { tipo: 'jugar', carta: cartaPreference(vista, cartas) };
    }
  }
}

export const iaPreferenceBasica: Agente<VistaPreference, AccionPreference> = {
  id: 'preference-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionPreference(vista, acciones);
    const legal = acciones.find(
      (a) =>
        JSON.stringify(a) === JSON.stringify(accion) ||
        (a.tipo === 'declarar' &&
          accion.tipo === 'declarar' &&
          mismaPujaPreference(a.puja, accion.puja)),
    );
    return { accion: legal ?? acciones[0]!, azar };
  },
};
