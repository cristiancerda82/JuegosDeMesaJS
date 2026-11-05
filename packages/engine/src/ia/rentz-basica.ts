import { PALOS_FRANCESES, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  CONTRATOS_RENTZ,
  ganadoraRentz,
  paloRentz,
  penalizaRentz,
  rangoRentz,
  REY_CORAZONES_RENTZ,
  type AccionRentz,
  type ContratoRentz,
  type VistaRentz,
} from '../juegos/rentz';
import type { Agente } from './agente';

const JOTA = 11;
const DAMA = 12;
const REY = 13;
const AS = 14;
const delPalo = (mano: readonly IdCarta[], palo: PaloFrances) =>
  mano.filter((c) => paloRentz(c) === palo);

/** Cartas seguidas a las J que tiene, hacia arriba y hacia abajo. */
function seguidasAJotas(mano: readonly IdCarta[]): number {
  let n = 0;
  for (const palo of PALOS_FRANCESES) {
    const rangos = new Set(delPalo(mano, palo).map(rangoRentz));
    if (!rangos.has(JOTA)) continue;
    for (let r = JOTA + 1; rangos.has(r); r++) n++;
    for (let r = JOTA - 1; rangos.has(r); r--) n++;
  }
  return n;
}

/** Lo que estima anotar con su mano en un contrato (spec ia-jugadores). */
export function estimacionRentz(mano: readonly IdCarta[], contrato: ContratoRentz): number {
  const altas = (cs: readonly IdCarta[]) => cs.filter((c) => rangoRentz(c) >= JOTA).length;
  const corazones = delPalo(mano, 'corazones');
  switch (contrato) {
    case 'bazas':
      return -5 * altas(mano);
    case 'corazones':
      return -5 * altas(corazones);
    case 'damas':
      return (
        -10 *
        mano.filter((c) => rangoRentz(c) === DAMA && delPalo(mano, paloRentz(c)).length - 1 < 3)
          .length
      );
    case 'rey':
      return corazones.includes(REY_CORAZONES_RENTZ) && corazones.length - 1 < 3 ? -40 : 0;
    case 'ultima':
      return -10 * mano.filter((c) => rangoRentz(c) === AS).length;
    case 'positivo':
      return 5 * (mano.filter((c) => rangoRentz(c) >= REY).length - 2);
    case 'domino':
      return 5 * (mano.filter((c) => rangoRentz(c) === JOTA).length + seguidasAJotas(mano) - 1);
  }
}

function eleccionRentz(vista: VistaRentz): AccionRentz {
  const mano = vista.miMano ?? [];
  const quedan = CONTRATOS_RENTZ.filter((c) => !vista.jugados[vista.asiento!]!.includes(c));
  const contrato = [...quedan].sort(
    (a, b) => estimacionRentz(mano, b) - estimacionRentz(mano, a),
  )[0]!;
  return { tipo: 'contrato', contrato };
}

const masBaja = (cs: readonly IdCarta[]) =>
  [...cs].sort((a, b) => rangoRentz(a) - rangoRentz(b) || a.localeCompare(b))[0]!;
const masAlta = (cs: readonly IdCarta[]) =>
  [...cs].sort((a, b) => rangoRentz(b) - rangoRentz(a) || a.localeCompare(b))[0]!;

/** La carta en una baza (spec ia-jugadores). */
export function cartaBazaRentz(vista: VistaRentz, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const contrato = vista.contrato!;
  const mesa = vista.mesa;
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];

  if (contrato === 'positivo') {
    if (mesa.length === 0) {
      const ases = cartas.filter((c) => rangoRentz(c) === AS);
      return ases.length > 0 ? ases[0]! : masBaja(cartas);
    }
    const ganadoras = cartas.filter(
      (c) => ganadoraRentz([...mesa, { asiento: yo, carta: c }]).asiento === yo,
    );
    return masBaja(ganadoras.length > 0 ? ganadoras : cartas);
  }

  // Contratos de evitar.
  if (mesa.length === 0) {
    const largo = (c: IdCarta) => delPalo(mano, paloRentz(c)).length;
    const minimo = Math.min(...cartas.map(largo));
    return masBaja(cartas.filter((c) => largo(c) === minimo));
  }
  const salida = paloRentz(mesa[0]!.carta);
  if (cartas.every((c) => paloRentz(c) === salida)) {
    const gana = rangoRentz(ganadoraRentz(mesa).carta);
    const debajo = cartas.filter((c) => rangoRentz(c) < gana);
    return debajo.length > 0 ? masAlta(debajo) : masAlta(cartas);
  }
  // Sin el palo: se descarta de lo que más resta y, si no, de la más alta.
  const pena = (c: IdCarta) => penalizaRentz(c, contrato);
  const peor = [...cartas].sort((a, b) => pena(b) - pena(a) || rangoRentz(b) - rangoRentz(a))[0]!;
  return pena(peor) > 0 ? peor : masAlta(cartas);
}

/** La carta en el dominó: la que le deja más cartas suyas por poner en esa fila. */
export function cartaDominoRentz(vista: VistaRentz, cartas: readonly IdCarta[]): IdCarta {
  const mano = vista.miMano ?? [];
  const abre = (c: IdCarta) => {
    const r = rangoRentz(c);
    const palo = delPalo(mano, paloRentz(c)).filter((x) => x !== c);
    if (r === JOTA && vista.filas[paloRentz(c)] === null) return palo.length;
    return palo.filter((x) => (r < JOTA ? rangoRentz(x) < r : rangoRentz(x) > r)).length;
  };
  return [...cartas].sort(
    (a, b) =>
      abre(b) - abre(a) ||
      Math.abs(rangoRentz(b) - JOTA) - Math.abs(rangoRentz(a) - JOTA) ||
      a.localeCompare(b),
  )[0]!;
}

export const iaRentzBasica: Agente<VistaRentz, AccionRentz> = {
  id: 'rentz-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'contrato') return { accion: eleccionRentz(vista), azar };
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    if (cartas.length === 0) return { accion: { tipo: 'pasar' }, azar };
    const carta =
      vista.fase === 'domino' ? cartaDominoRentz(vista, cartas) : cartaBazaRentz(vista, cartas);
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
