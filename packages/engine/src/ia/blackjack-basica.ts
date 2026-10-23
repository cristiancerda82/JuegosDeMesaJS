import {
  puntosCartaBlackjack,
  valorBlackjack,
  type AccionBlackjack,
  type VistaBlackjack,
} from '../juegos/blackjack';
import type { Agente } from './agente';

/** Apuesta de las IAs: 10 fichas, o la mayor legal si no llega. */
const APUESTA_IA = 10;

function apuesta(acciones: readonly AccionBlackjack[]): AccionBlackjack {
  const apuestas = acciones.flatMap((a) => (a.tipo === 'apostar' ? [a.fichas] : []));
  const fichas = apuestas.includes(APUESTA_IA) ? APUESTA_IA : Math.max(...apuestas);
  return { tipo: 'apostar', fichas };
}

/** Lo que la IA sabe de su mano en juego y de la banca. */
function situacion(vista: VistaBlackjack) {
  const mano = vista.manos[vista.asiento!]![vista.manoActiva]!;
  const { total, blanda } = valorBlackjack(mano.cartas);
  const visible = vista.banca[0]!;
  // La carta visible de la banca, con el As como 11.
  const banca = puntosCartaBlackjack(visible) === 1 ? 11 : puntosCartaBlackjack(visible);
  const par = mano.cartas.length === 2 ? puntosCartaBlackjack(mano.cartas[0]!) : null;
  return { total, blanda, banca, par };
}

function elegir(
  acciones: readonly AccionBlackjack[],
  preferidas: readonly AccionBlackjack['tipo'][],
): AccionBlackjack {
  for (const tipo of preferidas) {
    const a = acciones.find((x) => x.tipo === tipo);
    if (a) return a;
  }
  return acciones[0]!;
}

/**
 * IA básica del Blackjack: juega como la banca (pide con 16 o menos), dobla con 10 u 11 y
 * separa ases y ochos. Apuesta siempre 10. Es determinista: no usa el azar que recibe.
 */
export const iaBlackjackBasica: Agente<VistaBlackjack, AccionBlackjack> = {
  id: 'blackjack-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'apuesta') return { accion: apuesta(acciones), azar };
    const { total, par } = situacion(vista);
    const pareja = acciones.some((a) => a.tipo === 'separar');
    if (pareja && (par === 1 || par === 8)) return { accion: elegir(acciones, ['separar']), azar };
    if (total === 10 || total === 11) {
      return { accion: elegir(acciones, ['doblar', 'pedir']), azar };
    }
    return { accion: elegir(acciones, [total <= 16 ? 'pedir' : 'plantarse']), azar };
  },
};

/** Decisión de la estrategia básica (una baraja, la banca se planta con 17 blando). */
export function estrategiaBasica(
  total: number,
  blanda: boolean,
  banca: number,
  par: number | null,
): 'separar' | 'doblar' | 'pedir' | 'plantarse' {
  const contra = (...cartas: number[]) => cartas.includes(banca);
  const entre = (a: number, b: number) => banca >= a && banca <= b;
  if (par !== null) {
    if (par === 1 || par === 8) return 'separar';
    if ((par === 2 || par === 3 || par === 7) && entre(2, 7)) return 'separar';
    if (par === 6 && entre(2, 6)) return 'separar';
    if (par === 9 && (entre(2, 6) || contra(8, 9))) return 'separar';
  }
  if (blanda) {
    if (total >= 13 && total <= 18 && entre(4, 6)) return 'doblar';
    if ((total === 17 || total === 18) && contra(3)) return 'doblar';
    if (total >= 19) return 'plantarse';
    if (total === 18) return entre(2, 8) ? 'plantarse' : 'pedir';
    return 'pedir';
  }
  if (total === 11) return 'doblar';
  if (total === 10 && entre(2, 9)) return 'doblar';
  if (total === 9 && entre(3, 6)) return 'doblar';
  if (total >= 17) return 'plantarse';
  if (total >= 13) return entre(2, 6) ? 'plantarse' : 'pedir';
  if (total === 12) return entre(4, 6) ? 'plantarse' : 'pedir';
  return 'pedir';
}

/**
 * IA experta del Blackjack, la base del nivel difícil: la estrategia básica completa. Si no
 * puede doblar o separar, pide o se planta como diga la estrategia sin esa jugada.
 */
export const iaBlackjackExperta: Agente<VistaBlackjack, AccionBlackjack> = {
  id: 'blackjack-experta',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'apuesta') return { accion: apuesta(acciones), azar };
    const { total, blanda, banca, par } = situacion(vista);
    const puedeSeparar = acciones.some((a) => a.tipo === 'separar');
    let jugada = estrategiaBasica(total, blanda, banca, puedeSeparar ? par : null);
    if (jugada === 'doblar' && !acciones.some((a) => a.tipo === 'doblar')) {
      // Sin poder doblar: un 18 blando se planta; el resto pide.
      jugada = blanda && total >= 18 ? 'plantarse' : 'pedir';
    }
    return { accion: elegir(acciones, [jugada]), azar };
  },
};
