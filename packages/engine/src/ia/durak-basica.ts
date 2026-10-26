import type { IdCarta, PaloFrances } from '../baraja/cartas';
import { paloDurak, rangoDurak, type AccionDurak, type VistaDurak } from '../juegos/durak';
import type { Agente } from './agente';

/** Lo que cuesta soltar una carta: su rango, y mucho más si es triunfo. */
export function costeDurak(carta: IdCarta, triunfo: PaloFrances): number {
  return rangoDurak(carta) + (paloDurak(carta) === triunfo ? 20 : 0);
}

/** Por encima de este coste no se echa mientras quede mazo: solo cartas bajas sin triunfo. */
const COSTE_ECHAR = 10;
/** Defender con un triunfo de este rango o más (Q, K, A) cuesta demasiado con mazo. */
const TRIUNFO_ALTO = 12;
/** Mazo a partir del cual merece la pena guardar los triunfos altos. */
const MAZO_LARGO = 6;

function masBarata(cartas: readonly IdCarta[], coste: (c: IdCarta) => number): IdCarta | null {
  let mejor: IdCarta | null = null;
  for (const c of cartas) if (mejor === null || coste(c) < coste(mejor)) mejor = c;
  return mejor;
}

/**
 * IA básica del Durak: ataca y echa cartas bajas que no son triunfo, defiende con lo justo y se
 * lleva las cartas antes que gastar un triunfo alto con mucho mazo. Es determinista.
 */
export const iaDurakBasica: Agente<VistaDurak, AccionDurak> = {
  id: 'durak-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const coste = (c: IdCarta) => costeDurak(c, vista.triunfo);
    const cartasDe = (tipo: AccionDurak['tipo']) =>
      acciones.flatMap((a) => (a.tipo === tipo && 'carta' in a ? [a.carta] : []));
    const elegir = (accion: AccionDurak) => ({ accion, azar });

    // Defender o llevárselas.
    if (acciones.some((a) => a.tipo === 'tomar')) {
      const carta = masBarata(cartasDe('defender'), coste);
      const caro =
        carta !== null &&
        paloDurak(carta) === vista.triunfo &&
        rangoDurak(carta) >= TRIUNFO_ALTO &&
        vista.mazo > MAZO_LARGO;
      return elegir(carta === null || caro ? { tipo: 'tomar' } : { tipo: 'defender', carta });
    }

    const ataques = cartasDe('atacar');
    // Echar o pasar.
    if (acciones.some((a) => a.tipo === 'pasar')) {
      const carta = masBarata(ataques, coste);
      if (carta !== null && (vista.mazo === 0 || coste(carta) <= COSTE_ECHAR)) {
        return elegir({ tipo: 'atacar', carta });
      }
      return elegir({ tipo: 'pasar' });
    }

    // Primer ataque: la más barata, mejor si tiene más del mismo número para echarlas después.
    const mano = vista.miMano ?? [];
    const repetidas = (c: IdCarta) => mano.filter((x) => rangoDurak(x) === rangoDurak(c)).length;
    const carta = masBarata(ataques, (c) => coste(c) - 3 * (repetidas(c) - 1))!;
    return elegir({ tipo: 'atacar', carta });
  },
};
