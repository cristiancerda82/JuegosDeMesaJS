import type { IdCarta } from '../baraja/cartas';
import { SETTEBELLO, valorScopa, type AccionScopa, type VistaScopa } from '../juegos/scopa';
import type { Agente } from './agente';

/**
 * IA básica de la Scopa: puntúa cada jugada legal y elige la mejor (la primera, si empatan).
 * Es determinista y solo usa su vista: la mesa, su mano y los contadores públicos.
 */
export const iaScopaBasica: Agente<VistaScopa, AccionScopa> = {
  id: 'scopa-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    let mejor = acciones[0]!;
    let mejorValor = -Infinity;
    for (const accion of acciones) {
      const valor = valorarScopa(vista, accion);
      if (valor > mejorValor) {
        mejor = accion;
        mejorValor = valor;
      }
    }
    return { accion: mejor, azar };
  },
};

const SCOPA = 1000;
const SIETE_DE_OROS = 100;
const SIETE = 30;
const ORO = 10;
const CARTA = 3;
/** Penalización por dejar la mesa a tiro de scopa del rival. */
const RIESGO = 80;
/** El valor más alto de una carta: con la mesa en 10 o menos, una sola carta podría barrerla. */
const MAXIMO = 10;

/** Lo que vale tener una carta al final de la mano (para capturarla o no soltarla). */
function valorCarta(carta: IdCarta): number {
  if (carta === SETTEBELLO) return SIETE_DE_OROS;
  return (carta.endsWith('-7') ? SIETE : 0) + (carta.startsWith('oros-') ? ORO : 0);
}

/** La valoración de una jugada (spec ia-jugadores). */
export function valorarScopa(vista: VistaScopa, accion: AccionScopa): number {
  const recoge = accion.captura.length > 0;
  const mesa = recoge
    ? vista.mesa.filter((c) => !accion.captura.includes(c))
    : [...vista.mesa, accion.carta];

  let valor = 0;
  if (recoge) {
    if (mesa.length === 0) valor += SCOPA;
    for (const c of [accion.carta, ...accion.captura]) valor += valorCarta(c) + CARTA;
  } else {
    valor -= valorCarta(accion.carta);
  }
  const suma = mesa.reduce((s, c) => s + valorScopa(c), 0);
  if (mesa.length > 0 && suma <= MAXIMO) valor -= RIESGO;
  return valor;
}
