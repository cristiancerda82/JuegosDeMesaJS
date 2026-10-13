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
  const jugadas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  if (jugadas.length === 0) return acciones[0]!;
  const mano = vista.miMano ?? [];
  let mejor = jugadas[0]!;
  let mejorValor = -Infinity;
  for (const carta of jugadas) {
    const v = valorar(carta, mano);
    if (v > mejorValor) {
      mejor = carta;
      mejorValor = v;
    }
  }
  return { tipo: 'jugar', carta: mejor };
}

/** Cartas propias que la jugada acerca, menos los huecos que abre a los rivales. */
function valorar(carta: IdCarta, mano: readonly IdCarta[]): number {
  const palo = cartaDeId(carta)!.palo;
  const pos = posicionCinquillo(carta);
  const propias = mano
    .filter((c) => c !== carta && cartaDeId(c)!.palo === palo)
    .map(posicionCinquillo);
  const direcciones = pos === CINCO ? [1, -1] : [pos > CINCO ? 1 : -1];
  let valor = pos === 0 || pos === ULTIMA ? 1 : 0;
  for (const d of direcciones) {
    valor += 2 * propias.filter((p) => (p - pos) * d > 0).length;
    const siguiente = pos + d;
    if (siguiente >= 0 && siguiente <= ULTIMA && !propias.includes(siguiente)) valor -= 1;
  }
  return valor;
}
