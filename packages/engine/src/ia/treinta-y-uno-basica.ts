import type { IdCarta } from '../baraja/cartas';
import {
  puntosCartaTreinta,
  valorManoTreinta,
  type AccionTreintaYUno,
  type VistaTreintaYUno,
} from '../juegos/treinta-y-uno';
import type { Agente } from './agente';

/** Con este valor o más, se planta. */
export const PLANTARSE_TREINTA = 27;
/** Lo que tiene que subir la mano para coger la carta del descarte. */
export const MEJORA_DESCARTE_TREINTA = 4;

/** La carta cuyo descarte deja la mano de más valor; si empatan, la de menos puntos. */
export function mejorDescarteTreinta(
  mano: readonly IdCarta[],
  descartables: readonly IdCarta[],
): IdCarta {
  const queda = (c: IdCarta) => valorManoTreinta(mano.filter((x) => x !== c));
  return [...descartables].sort(
    (a, b) =>
      queda(b) - queda(a) || puntosCartaTreinta(a) - puntosCartaTreinta(b) || (a < b ? -1 : 1),
  )[0]!;
}

/**
 * Con viuda (spec ia-jugadores): con 27 o más se planta; si no, el cambio que más sube la mano
 * (una carta o las tres, y a igualdad una); si ninguno la sube, pasa.
 */
export function decisionViudaTreinta(
  vista: VistaTreintaYUno,
  acciones: readonly AccionTreintaYUno[],
): AccionTreintaYUno {
  const mano = vista.miMano ?? [];
  const valor = valorManoTreinta(mano);
  if (valor >= PLANTARSE_TREINTA && acciones.some((a) => a.tipo === 'plantarse')) {
    return { tipo: 'plantarse' };
  }
  let mejor: AccionTreintaYUno = { tipo: 'pasar' };
  let mejorValor = valor;
  for (const a of acciones) {
    if (a.tipo !== 'cambiar') continue;
    const v = valorManoTreinta(mano.map((c) => (c === a.mia ? a.mesa : c)));
    if (v > mejorValor) {
      mejor = a;
      mejorValor = v;
    }
  }
  if (valorManoTreinta(vista.viuda) > mejorValor) return { tipo: 'cambiarTodas' };
  return mejor;
}

export function decisionTreintaYUno(
  vista: VistaTreintaYUno,
  acciones: readonly AccionTreintaYUno[],
): AccionTreintaYUno {
  if (vista.config.viuda) return decisionViudaTreinta(vista, acciones);
  const mano = vista.miMano ?? [];
  if (vista.fase === 'descartar') {
    const descartables = acciones.flatMap((a) => (a.tipo === 'descartar' ? [a.carta] : []));
    return { tipo: 'descartar', carta: mejorDescarteTreinta(mano, descartables) };
  }
  const valor = valorManoTreinta(mano);
  if (valor >= PLANTARSE_TREINTA && acciones.some((a) => a.tipo === 'plantarse')) {
    return { tipo: 'plantarse' };
  }
  const arriba = vista.descarte.at(-1);
  if (arriba !== undefined) {
    const con = [...mano, arriba];
    const tras = valorManoTreinta(con.filter((c) => c !== mejorDescarteTreinta(con, mano)));
    if (tras - valor >= MEJORA_DESCARTE_TREINTA) return { tipo: 'robar', desde: 'descarte' };
  }
  return { tipo: 'robar', desde: 'mazo' };
}

export const iaTreintaYUnoBasica: Agente<VistaTreintaYUno, AccionTreintaYUno> = {
  id: 'treinta-y-uno-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionTreintaYUno(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
