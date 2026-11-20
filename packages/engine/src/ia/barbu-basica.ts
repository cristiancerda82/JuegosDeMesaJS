import { PALOS_FRANCESES, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  CONTRATOS_BARBU,
  ganadoraBarbu,
  INICIO_DOMINO_BARBU,
  INICIOS_BARBU,
  paloBarbu,
  penalizaBarbu,
  rangoBarbu,
  type AccionBarbu,
  type ContratoBarbu,
  type VistaBarbu,
} from '../juegos/barbu';
import type { Agente } from './agente';

const JOTA = 11;
/** El número de en medio: a igualdad, se prefiere empezar el dominó cerca de él. */
const CENTRO = 8;
const delPalo = (mano: readonly IdCarta[], palo: PaloFrances) =>
  mano.filter((c) => paloBarbu(c) === palo);

/** El palo más largo; a igualdad, el de cartas más altas. */
function paloMasLargo(mano: readonly IdCarta[]): PaloFrances {
  const valor = (p: PaloFrances) =>
    delPalo(mano, p).length * 100 + delPalo(mano, p).reduce((s, c) => s + rangoBarbu(c), 0);
  return [...PALOS_FRANCESES].sort((a, b) => valor(b) - valor(a))[0]!;
}

/**
 * Lo que vale empezar el dominó por `inicio` con esta mano: las cartas de ese número más las
 * seguidas a ellas en su palo, hacia arriba y hacia abajo.
 */
export function valorInicioBarbu(mano: readonly IdCarta[], inicio: number): number {
  let n = 0;
  for (const palo of PALOS_FRANCESES) {
    const rangos = new Set(delPalo(mano, palo).map(rangoBarbu));
    if (!rangos.has(inicio)) continue;
    n++;
    for (let r = inicio + 1; rangos.has(r); r++) n++;
    for (let r = inicio - 1; rangos.has(r); r--) n++;
  }
  return n;
}

/** El número de salida que elige: el de más valor; a igualdad, el más cercano al 8 y el más bajo. */
export function inicioBarbu(mano: readonly IdCarta[]): number {
  return [...INICIOS_BARBU].sort(
    (a, b) =>
      valorInicioBarbu(mano, b) - valorInicioBarbu(mano, a) ||
      Math.abs(a - CENTRO) - Math.abs(b - CENTRO) ||
      a - b,
  )[0]!;
}

/**
 * Lo que estima anotar con su mano en un contrato (spec ia-jugadores). Con `dominoElegido`, el
 * dominó se valora con el mejor número de salida.
 */
export function estimacionBarbu(
  mano: readonly IdCarta[],
  contrato: ContratoBarbu,
  dominoElegido = false,
): number {
  const altas = (cs: readonly IdCarta[]) => cs.filter((c) => rangoBarbu(c) >= JOTA).length;
  const corazones = delPalo(mano, 'corazones');
  switch (contrato) {
    case 'bazas':
      return -2 * altas(mano);
    case 'corazones':
      return -2 * altas(corazones) - (corazones.includes('corazones-1') ? 6 : 0);
    case 'damas':
      return (
        -6 *
        mano.filter((c) => rangoBarbu(c) === 12 && delPalo(mano, paloBarbu(c)).length - 1 < 3)
          .length
      );
    case 'rey':
      return corazones.includes('corazones-13') && corazones.length - 1 < 3 ? -20 : 0;
    case 'ultimas':
      return -3 * mano.filter((c) => rangoBarbu(c) >= 13).length;
    case 'triunfo': {
      const largo = delPalo(mano, paloMasLargo(mano)).length;
      return 5 * (largo + mano.filter((c) => rangoBarbu(c) === 14).length - 4);
    }
    case 'domino':
      return (
        5 * valorInicioBarbu(mano, dominoElegido ? inicioBarbu(mano) : INICIO_DOMINO_BARBU) - 10
      );
  }
}

function eleccionBarbu(vista: VistaBarbu): AccionBarbu {
  const mano = vista.miMano ?? [];
  if (vista.fase === 'triunfo') return { tipo: 'triunfo', palo: paloMasLargo(mano) };
  if (vista.fase === 'inicio') return { tipo: 'inicio', rango: inicioBarbu(mano) };
  const quedan = CONTRATOS_BARBU.filter((c) => !vista.jugados.includes(c));
  const elegido = vista.config.dominoElegido === true;
  const contrato = [...quedan].sort(
    (a, b) => estimacionBarbu(mano, b, elegido) - estimacionBarbu(mano, a, elegido),
  )[0]!;
  return { tipo: 'contrato', contrato };
}

const masBaja = (cs: readonly IdCarta[]) =>
  [...cs].sort((a, b) => rangoBarbu(a) - rangoBarbu(b) || a.localeCompare(b))[0]!;
const masAlta = (cs: readonly IdCarta[]) =>
  [...cs].sort((a, b) => rangoBarbu(b) - rangoBarbu(a) || a.localeCompare(b))[0]!;

/** La carta en una baza (spec ia-jugadores). */
export function cartaBazaBarbu(vista: VistaBarbu, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const contrato = vista.contrato!;
  const mesa = vista.mesa;
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];

  if (contrato === 'triunfo') {
    if (mesa.length === 0) {
      const ases = cartas.filter((c) => rangoBarbu(c) === 14);
      return ases.length > 0 ? ases[0]! : masBaja(cartas);
    }
    const ganadoras = cartas.filter(
      (c) => ganadoraBarbu([...mesa, { asiento: yo, carta: c }], vista.triunfo).asiento === yo,
    );
    const valor = (c: IdCarta) => (paloBarbu(c) === vista.triunfo ? 100 : 0) + rangoBarbu(c);
    if (ganadoras.length > 0) return [...ganadoras].sort((a, b) => valor(a) - valor(b))[0]!;
    return [...cartas].sort((a, b) => valor(a) - valor(b))[0]!;
  }

  // Contratos de evitar.
  if (mesa.length === 0) {
    const largo = (c: IdCarta) => delPalo(mano, paloBarbu(c)).length;
    const minimo = Math.min(...cartas.map(largo));
    return masBaja(cartas.filter((c) => largo(c) === minimo));
  }
  const salida = paloBarbu(mesa[0]!.carta);
  if (cartas.every((c) => paloBarbu(c) === salida)) {
    const gana = rangoBarbu(ganadoraBarbu(mesa, null).carta);
    const debajo = cartas.filter((c) => rangoBarbu(c) < gana);
    return debajo.length > 0 ? masAlta(debajo) : masAlta(cartas);
  }
  // Sin el palo: se descarta de lo que más penaliza y, si no, de la más alta.
  const pena = (c: IdCarta) => penalizaBarbu(c, contrato);
  const peor = [...cartas].sort((a, b) => pena(b) - pena(a))[0]!;
  return pena(peor) > 0 ? peor : masAlta(cartas);
}

/** La carta en el dominó: la que le deja más cartas suyas por jugar en esa fila. */
export function cartaDominoBarbu(vista: VistaBarbu, cartas: readonly IdCarta[]): IdCarta {
  const mano = vista.miMano ?? [];
  // Las filas se abren con el número de salida (la Jota si no se eligió otro).
  const inicio = vista.inicio;
  const abre = (c: IdCarta) => {
    const r = rangoBarbu(c);
    const palo = delPalo(mano, paloBarbu(c)).filter((x) => x !== c);
    if (r === inicio && vista.filas[paloBarbu(c)] === null) return palo.length;
    return palo.filter((x) => (r < inicio ? rangoBarbu(x) < r : rangoBarbu(x) > r)).length;
  };
  return [...cartas].sort(
    (a, b) =>
      abre(b) - abre(a) ||
      Math.abs(rangoBarbu(b) - inicio) - Math.abs(rangoBarbu(a) - inicio) ||
      a.localeCompare(b),
  )[0]!;
}

export const iaBarbuBasica: Agente<VistaBarbu, AccionBarbu> = {
  id: 'barbu-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'contrato' || vista.fase === 'triunfo' || vista.fase === 'inicio') {
      return { accion: eleccionBarbu(vista), azar };
    }
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    if (cartas.length === 0) return { accion: { tipo: 'pasar' }, azar };
    const carta =
      vista.fase === 'domino' ? cartaDominoBarbu(vista, cartas) : cartaBazaBarbu(vista, cartas);
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
