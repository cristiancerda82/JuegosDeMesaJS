import type { IdCarta } from '../baraja/cartas';
import { valorEscoba, type AccionEscoba, type VistaEscoba } from '../juegos/escoba';
import type { Agente } from './agente';

/**
 * IA básica de la Escoba: puntúa cada jugada legal y elige la mejor (la primera, si empatan).
 * Es determinista y solo usa su vista: la mesa, su mano y los contadores públicos.
 */
export const iaEscobaBasica: Agente<VistaEscoba, AccionEscoba> = {
  id: 'escoba-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    let mejor = acciones[0]!;
    let mejorValor = -Infinity;
    for (const accion of acciones) {
      const valor = valorar(vista, accion);
      if (valor > mejorValor) {
        mejor = accion;
        mejorValor = valor;
      }
    }
    return { accion: mejor, azar };
  },
};

const ESCOBA = 1000;
const SIETE_DE_OROS = 100;
const SIETE = 30;
const ORO = 10;
const CARTA = 3;
/** Penalización por dejar la mesa a tiro de escoba del rival. */
const RIESGO = 80;

/** Lo que vale tener una carta al final de la mano (para recogerla o no soltarla). */
function valorCarta(carta: IdCarta): number {
  if (carta === 'oros-7') return SIETE_DE_OROS;
  return (carta.endsWith('-7') ? SIETE : 0) + (carta.startsWith('oros-') ? ORO : 0);
}

export function valorar(vista: VistaEscoba, accion: AccionEscoba): number {
  const recoge = accion.captura.length > 0;
  const mesa = recoge
    ? vista.mesa.filter((c) => !accion.captura.includes(c))
    : [...vista.mesa, accion.carta];

  let valor = 0;
  if (recoge) {
    if (mesa.length === 0) valor += ESCOBA;
    for (const c of [accion.carta, ...accion.captura]) valor += valorCarta(c) + CARTA;
  } else {
    valor -= valorCarta(accion.carta);
  }

  // Con la mesa entre 5 y 14, al rival le basta una carta (de 1 a 10) para hacer escoba.
  const suma = mesa.reduce((s, c) => s + valorEscoba(c), 0);
  if (mesa.length > 0 && suma >= 5 && suma <= 14) valor -= RIESGO;
  return valor;
}
