import { PALOS_FRANCESES, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  ganadoraBelote,
  paloBelote,
  parejaBelote,
  rangoBelote,
  valorBelote,
  type AccionBelote,
  type VistaBelote,
} from '../juegos/belote';
import type { Agente } from './agente';

/** Con esta fuerza se toma la carta vuelta. */
const PARA_TOMAR = 7;
/** Con esta fuerza se nombra otro palo en la segunda vuelta. */
const PARA_NOMBRAR = 8;
/** Triunfos que hacen falta para elegir un palo. */
const TRIUNFOS_MINIMOS = 3;

/** Lo que vale una carta para elegir `triunfo`: J 4, 9 3, As 2, otros triunfos 1, Ases 1,5. */
export function valorParaTriunfoBelote(c: IdCarta, triunfo: PaloFrances): number {
  const rango = rangoBelote(c, triunfo);
  if (paloBelote(c) === triunfo) return rango === 8 ? 4 : rango === 7 ? 3 : rango === 6 ? 2 : 1;
  return rango === 8 ? 1.5 : 0;
}

/** La fuerza de una mano con `triunfo` de triunfo, y cuántos triunfos tiene. */
export function fuerzaBelote(
  mano: readonly IdCarta[],
  triunfo: PaloFrances,
): { fuerza: number; triunfos: number } {
  return {
    fuerza: mano.reduce((s, c) => s + valorParaTriunfoBelote(c, triunfo), 0),
    triunfos: mano.filter((c) => paloBelote(c) === triunfo).length,
  };
}

/** Coste de soltar una carta: lo que vale, y los triunfos más. */
const costeEn = (triunfo: PaloFrances) => (c: IdCarta) =>
  valorBelote(c, triunfo) * 10 + rangoBelote(c, triunfo) + (paloBelote(c) === triunfo ? 100 : 0);

/** La carta de una baza, entre las legales. */
export function cartaBelote(vista: VistaBelote, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const triunfo = vista.triunfo!;
  const coste = costeEn(triunfo);
  const barata = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => coste(a) - coste(b))[0]!;
  const yo = vista.asiento!;
  const mesa = vista.mesa;
  const sinTriunfo = cartas.filter((c) => paloBelote(c) !== triunfo);

  if (mesa.length === 0) {
    const ases = sinTriunfo.filter((c) => rangoBelote(c, triunfo) === 8);
    if (ases.length > 0) return ases[0]!;
    const jota = cartas.find((c) => paloBelote(c) === triunfo && rangoBelote(c, triunfo) === 8);
    if (jota) return jota;
    return barata(sinTriunfo.length > 0 ? sinTriunfo : cartas);
  }

  const ganaAhora = ganadoraBelote(mesa, triunfo).asiento;
  if (parejaBelote(ganaAhora) === parejaBelote(yo)) {
    // Si juega el último, carga la baza de su compañero con lo que más vale sin ser triunfo.
    if (mesa.length === 3 && sinTriunfo.length > 0) {
      return [...sinTriunfo].sort((a, b) => coste(b) - coste(a))[0]!;
    }
    return barata(sinTriunfo.length > 0 ? sinTriunfo : cartas);
  }
  const ganadoras = cartas.filter(
    (c) => ganadoraBelote([...mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  if (ganadoras.length > 0) return barata(ganadoras);
  return barata(sinTriunfo.length > 0 ? sinTriunfo : cartas);
}

/**
 * IA básica del Belote (spec ia-jugadores): elige el triunfo por la fuerza de su mano y juega las
 * bazas ganándolas con lo más barato, cargando las de su compañero cuando juega el último. Es
 * determinista: no usa el azar que recibe.
 */
export const iaBeloteBasica: Agente<VistaBelote, AccionBelote> = {
  id: 'belote-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const elegir = (accion: AccionBelote) => ({ accion, azar });
    const mano = vista.miMano ?? [];
    switch (vista.fase) {
      case 'primera': {
        // Quien toma se lleva la carta vuelta: cuenta como suya.
        const { fuerza, triunfos } = fuerzaBelote(
          [...mano, vista.cartaVuelta],
          paloBelote(vista.cartaVuelta),
        );
        return elegir(
          fuerza >= PARA_TOMAR && triunfos >= TRIUNFOS_MINIMOS
            ? { tipo: 'tomar' }
            : { tipo: 'pasar' },
        );
      }
      case 'segunda': {
        const vuelta = paloBelote(vista.cartaVuelta);
        const palos = PALOS_FRANCESES.filter((p) => p !== vuelta);
        const palo = [...palos].sort(
          (a, b) => fuerzaBelote(mano, b).fuerza - fuerzaBelote(mano, a).fuerza,
        )[0]!;
        const { fuerza, triunfos } = fuerzaBelote(mano, palo);
        return elegir(
          fuerza >= PARA_NOMBRAR && triunfos >= TRIUNFOS_MINIMOS
            ? { tipo: 'nombrar', palo }
            : { tipo: 'pasar' },
        );
      }
      case 'bazas': {
        const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
        return elegir({ tipo: 'jugar', carta: cartaBelote(vista, cartas) });
      }
    }
  },
};
