import { cartaDeId, type IdCarta } from '../baraja/cartas';
import { SIETE, valorSevens, type AccionSevens, type VistaSevens } from '../juegos/sevens';
import type { Agente } from './agente';

/**
 * IA básica del Sevens, como la del Cinquillo: entre sus cartas jugables prefiere la que le deja
 * más cartas propias por jugar en esa dirección y abre menos camino a los rivales; suelta pronto
 * el As y la K. Es determinista: no usa el azar que recibe.
 */
export const iaSevensBasica: Agente<VistaSevens, AccionSevens> = {
  id: 'sevens-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirSevens(vista, acciones), azar };
  },
};

const AS = 1;
const REY = 13;

export function elegirSevens(vista: VistaSevens, acciones: readonly AccionSevens[]): AccionSevens {
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
  const v = valorSevens(carta);
  const propias = mano.filter((c) => c !== carta && cartaDeId(c)!.palo === palo).map(valorSevens);
  const direcciones = v === SIETE ? [1, -1] : [v > SIETE ? 1 : -1];
  let valor = v === AS || v === REY ? 1 : 0;
  for (const d of direcciones) {
    valor += 2 * propias.filter((p) => (p - v) * d > 0).length;
    const siguiente = v + d;
    if (siguiente >= AS && siguiente <= REY && !propias.includes(siguiente)) valor -= 1;
  }
  return valor;
}
