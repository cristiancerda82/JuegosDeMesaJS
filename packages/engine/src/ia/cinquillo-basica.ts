import { cartaDeId, type IdCarta } from '../baraja/cartas';
import {
  ORDEN_CINQUILLO,
  posicionCinquillo,
  type AccionCinquillo,
  type VistaCinquillo,
} from '../juegos/cinquillo';
import type { Agente } from './agente';

/**
 * IA básica del Cinquillo: entre sus cartas jugables prefiere la que le deja más cartas propias
 * por jugar en esa dirección y abre menos camino a los rivales; suelta pronto el As y el Rey.
 * Es determinista: no usa el azar que recibe.
 */
export const iaCinquilloBasica: Agente<VistaCinquillo, AccionCinquillo> = {
  id: 'cinquillo-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

const CINCO = (ORDEN_CINQUILLO as readonly number[]).indexOf(5);
const ULTIMA = ORDEN_CINQUILLO.length - 1;

function elegir(vista: VistaCinquillo, acciones: readonly AccionCinquillo[]): AccionCinquillo {
  return elegirEnEscaleras(vista.miMano ?? [], acciones, posicionCinquillo, CINCO, ULTIMA);
}

/**
 * La jugada que más vale según `valorarEnEscalera`, o la única acción si no hay ninguna jugada.
 * Común al Cinquillo y al Cuatro seises.
 */
export function elegirEnEscaleras<
  A extends { readonly tipo: 'jugar'; readonly carta: IdCarta } | { readonly tipo: 'pasar' },
>(
  mano: readonly IdCarta[],
  acciones: readonly A[],
  posicion: (c: IdCarta) => number,
  centro: number,
  ultima: number,
): A {
  let mejor: A | null = null;
  let mejorValor = -Infinity;
  for (const accion of acciones) {
    if (accion.tipo !== 'jugar') continue;
    const v = valorarEnEscalera(accion.carta, mano, posicion, centro, ultima);
    if (v > mejorValor) {
      mejor = accion;
      mejorValor = v;
    }
  }
  return mejor ?? acciones[0]!;
}

/**
 * Cartas propias que la jugada acerca, menos los huecos que abre a los rivales, en escaleras que
 * nacen de la posición `centro` y llegan hasta `ultima`.
 */
export function valorarEnEscalera(
  carta: IdCarta,
  mano: readonly IdCarta[],
  posicion: (c: IdCarta) => number,
  centro: number,
  ultima: number,
): number {
  const palo = cartaDeId(carta)!.palo;
  const pos = posicion(carta);
  const propias = mano.filter((c) => c !== carta && cartaDeId(c)!.palo === palo).map(posicion);
  const direcciones = pos === centro ? [1, -1] : [pos > centro ? 1 : -1];
  let valor = pos === 0 || pos === ultima ? 1 : 0;
  for (const d of direcciones) {
    valor += 2 * propias.filter((p) => (p - pos) * d > 0).length;
    const siguiente = pos + d;
    if (siguiente >= 0 && siguiente <= ultima && !propias.includes(siguiente)) valor -= 1;
  }
  return valor;
}
