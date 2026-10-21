import { PALOS_FRANCESES, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  esOcho,
  paloOchoLoco,
  puntosOchoLoco,
  type AccionOchoLoco,
  type VistaOchoLoco,
} from '../juegos/ocho-loco';
import type { Agente } from './agente';

/**
 * IA básica del Ocho loco: juega la carta que la deja con más cartas del palo que tocará, y a
 * igualdad la de más puntos. Los ochos los trata como cualquier otra carta, con el palo del que
 * más cartas le quedan. La carta robada, si casa, la juega. Es determinista: no usa el azar.
 */
export const iaOchoLocoBasica: Agente<VistaOchoLoco, AccionOchoLoco> = {
  id: 'ocho-loco-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirOchoLoco(vista, acciones, false), azar };
  },
};

/**
 * IA experta del Ocho loco, la base del nivel difícil: como la básica, pero guarda los ochos
 * mientras tenga otra carta que case. Es lo que más pesa en el juego: guardándolos gana unas
 * 7 de cada 10 partidas a 2 jugadores contra la básica.
 */
export const iaOchoLocoExperta: Agente<VistaOchoLoco, AccionOchoLoco> = {
  id: 'ocho-loco-experta',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirOchoLoco(vista, acciones, true), azar };
  },
};

/** El palo del que más cartas hay en `mano`, sin contar los ochos (a igualdad, el primero). */
export function paloPreferido(mano: readonly IdCarta[]): PaloFrances {
  let mejor: PaloFrances = PALOS_FRANCESES[0];
  let cuantas = -1;
  for (const palo of PALOS_FRANCESES) {
    const n = mano.filter((c) => !esOcho(c) && paloOchoLoco(c) === palo).length;
    if (n > cuantas) {
      mejor = palo;
      cuantas = n;
    }
  }
  return mejor;
}

export function elegirOchoLoco(
  vista: VistaOchoLoco,
  acciones: readonly AccionOchoLoco[],
  guardaOchos: boolean,
): AccionOchoLoco {
  const jugadas = acciones.filter((a) => a.tipo === 'jugar');
  if (jugadas.length === 0) return acciones[0]!;
  const mano = vista.miMano ?? [];
  const normales = jugadas.filter((a) => !esOcho(a.carta));
  const candidatas = guardaOchos && normales.length > 0 ? normales : jugadas;
  let mejor = candidatas[0]!;
  let mejorValor = -Infinity;
  for (const jugada of candidatas) {
    const resto = mano.filter((c) => c !== jugada.carta);
    // Con un 8, el palo del que más cartas le quedan; con otra carta, el suyo.
    const palo = esOcho(jugada.carta) ? paloPreferido(resto) : paloOchoLoco(jugada.carta);
    if (jugada.palo !== undefined && jugada.palo !== palo) continue;
    const quedan = resto.filter((c) => !esOcho(c) && paloOchoLoco(c) === palo).length;
    const valor = quedan + puntosOchoLoco(jugada.carta) / 100;
    if (valor > mejorValor) {
      mejor = jugada;
      mejorValor = valor;
    }
  }
  return mejor;
}
