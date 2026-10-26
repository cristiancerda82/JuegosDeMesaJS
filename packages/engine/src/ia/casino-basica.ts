import type { IdCarta } from '../baraja/cartas';
import {
  BIG_CASINO,
  cartasRecogidas,
  LITTLE_CASINO,
  recogidaCasino,
  valorCasino,
  type AccionCasino,
  type ElementoMesaCasino,
  type VistaCasino,
} from '../juegos/casino';
import type { Agente } from './agente';

/**
 * IA básica del Casino: puntúa cada jugada legal y elige la mejor (la primera, si empatan).
 * Recoger va antes que construir, y construir antes que dejar. Es determinista y solo usa su vista.
 */
export const iaCasinoBasica: Agente<VistaCasino, AccionCasino> = {
  id: 'casino-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    let mejor = acciones[0]!;
    let mejorValor = -Infinity;
    for (const accion of acciones) {
      const valor = valorarCasino(vista, accion);
      if (valor > mejorValor) {
        mejor = accion;
        mejorValor = valor;
      }
    }
    return { accion: mejor, azar };
  },
};

const RECOGER = 100;
const CONSTRUIR = 50;
const BARRIDA = 5;

/** Lo que vale llevarse una carta: 1, más sus extras de puntuación. */
export function valorCartaCasino(carta: IdCarta): number {
  if (carta === BIG_CASINO) return 7;
  if (carta === LITTLE_CASINO) return 4;
  if (carta.endsWith('-1')) return 4;
  return carta.startsWith('picas-') ? 2 : 1;
}

const valorDe = (cartas: readonly IdCarta[]) => cartas.reduce((s, c) => s + valorCartaCasino(c), 0);

function cartasDe(mesa: readonly ElementoMesaCasino[], id: number | null): readonly IdCarta[] {
  const el = mesa.find((e) => e.tipo === 'construccion' && e.id === id);
  return el?.tipo === 'construccion' ? el.cartas : [];
}

export function valorarCasino(vista: VistaCasino, accion: AccionCasino): number {
  if (accion.tipo === 'recoger') {
    const recogida = recogidaCasino(vista.mesa, accion.carta)!;
    const tomadas = cartasRecogidas(vista.mesa, recogida);
    const quedan = vista.mesa.length - recogida.sueltas.length - recogida.construcciones.length;
    const ultima = vista.mazo === 0 && vista.cartasEnMano.reduce((s, n) => s + n, 0) === 1;
    return RECOGER + valorDe([accion.carta, ...tomadas]) + (quedan === 0 && !ultima ? BARRIDA : 0);
  }
  if (accion.tipo === 'construir') {
    // La mitad de lo que valdrá recogerla después.
    const cartas = [...cartasDe(vista.mesa, accion.construccion), ...accion.cartas, accion.carta];
    return CONSTRUIR + valorDe(cartas) / 2;
  }
  // Dejar: cuanto menos valga la carta, mejor; las figuras, que solo se recogen por pareja, antes.
  const v = valorCasino(accion.carta);
  return -valorCartaCasino(accion.carta) - (v === null ? 0 : v / 20);
}
