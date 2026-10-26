import { PALOS_FRANCESES, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  esBowerDerecho,
  esBowerIzquierdo,
  ganadoraEuchre,
  paloEuchre,
  parejaEuchre,
  rangoEuchre,
  type AccionEuchre,
  type VistaEuchre,
} from '../juegos/euchre';
import type { Agente } from './agente';

/** Con esta fuerza se pide o se nombra el triunfo. */
const PARA_PEDIR = 6;
/** Con esta fuerza se juega solo. */
const PARA_SOLO = 10;

/** Lo que vale una carta si `triunfo` es el triunfo. */
export function valorParaTriunfo(c: IdCarta, triunfo: PaloFrances): number {
  if (esBowerDerecho(c, triunfo)) return 3;
  if (esBowerIzquierdo(c, triunfo)) return 2.5;
  const rango = rangoEuchre(c, triunfo);
  if (paloEuchre(c, triunfo) === triunfo) return rango === 14 ? 2 : rango >= 12 ? 1.5 : 1;
  return rango === 14 ? 1 : 0;
}

/** La fuerza de una mano con `triunfo` de triunfo. */
export function fuerzaEuchre(mano: readonly IdCarta[], triunfo: PaloFrances): number {
  return mano.reduce((s, c) => s + valorParaTriunfo(c, triunfo), 0);
}

const paloDe = (c: IdCarta) => c.split('-')[0] as PaloFrances;

/** La fuerza para pedir la carta vuelta: cuenta si la recoge su pareja y resta si un rival. */
function fuerzaParaPedir(vista: VistaEuchre): number {
  const yo = vista.asiento!;
  const triunfo = paloDe(vista.cartaVuelta);
  const mano = vista.miMano ?? [];
  if (vista.repartidor === yo) {
    // Recogerá la carta vuelta y se descartará de su peor carta.
    const con = [...mano, vista.cartaVuelta].map((c) => valorParaTriunfo(c, triunfo));
    return con.reduce((s, v) => s + v, 0) - Math.min(...con);
  }
  const vuelta = valorParaTriunfo(vista.cartaVuelta, triunfo);
  const amiga = parejaEuchre(vista.repartidor) === parejaEuchre(yo);
  return fuerzaEuchre(mano, triunfo) + (amiga ? vuelta : -vuelta);
}

/** El descarte del repartidor: la más baja que no es triunfo, mejor si deja un palo vacío. */
export function descarteEuchre(mano: readonly IdCarta[], triunfo: PaloFrances): IdCarta {
  const coste = (c: IdCarta) => {
    const palo = paloEuchre(c, triunfo);
    const esTriunfo = palo === triunfo ? 100 : 0;
    const sola = mano.filter((x) => paloEuchre(x, triunfo) === palo).length === 1 ? -5 : 0;
    return esTriunfo + rangoEuchre(c, triunfo) + sola;
  };
  return [...mano].sort((a, b) => coste(a) - coste(b))[0]!;
}

/** Peso de soltar una carta: los triunfos valen más, y dentro, el rango. */
const pesoEn = (triunfo: PaloFrances) => (c: IdCarta) =>
  (paloEuchre(c, triunfo) === triunfo ? 100 : 0) + rangoEuchre(c, triunfo);

/** La carta de una baza: como en el Whist, con el palo y el rango efectivos. */
export function cartaEuchre(vista: VistaEuchre, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const triunfo = vista.triunfo!;
  const peso = pesoEn(triunfo);
  const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;
  const masAlta = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(b) - peso(a))[0]!;
  const yo = vista.asiento!;
  const mesa = vista.mesa;
  const triunfos = cartas.filter((c) => paloEuchre(c, triunfo) === triunfo);
  const sinTriunfo = cartas.filter((c) => paloEuchre(c, triunfo) !== triunfo);

  if (mesa.length === 0) {
    // Si su pareja eligió y tiene el bower derecho, arrastra; si no, un As que no sea triunfo.
    const elegimos = vista.elige !== null && parejaEuchre(vista.elige) === parejaEuchre(yo);
    if (elegimos && triunfos.some((c) => esBowerDerecho(c, triunfo))) return masAlta(triunfos);
    const ases = sinTriunfo.filter((c) => rangoEuchre(c, triunfo) === 14);
    if (ases.length > 0) return ases[0]!;
    return masBaja(sinTriunfo.length > 0 ? sinTriunfo : cartas);
  }

  const ganaAhora = ganadoraEuchre(mesa, triunfo).asiento;
  if (parejaEuchre(ganaAhora) === parejaEuchre(yo)) {
    return masBaja(sinTriunfo.length > 0 ? sinTriunfo : cartas);
  }
  const ganadoras = cartas.filter(
    (c) => ganadoraEuchre([...mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  if (ganadoras.length > 0) return masBaja(ganadoras);
  return masBaja(sinTriunfo.length > 0 ? sinTriunfo : cartas);
}

/**
 * IA básica del Euchre (spec ia-jugadores): elige el triunfo por la fuerza de su mano, juega solo
 * con una mano muy fuerte, se descarta de lo más bajo y juega las bazas como en el Whist. Es
 * determinista: no usa el azar que recibe.
 */
export const iaEuchreBasica: Agente<VistaEuchre, AccionEuchre> = {
  id: 'euchre-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const elegir = (accion: AccionEuchre) => ({ accion, azar });
    const mano = vista.miMano ?? [];
    switch (vista.fase) {
      case 'primera': {
        const fuerza = fuerzaParaPedir(vista);
        if (fuerza < PARA_PEDIR) return elegir({ tipo: 'pasar' });
        return elegir({ tipo: 'pedir', solo: fuerza >= PARA_SOLO });
      }
      case 'segunda': {
        const vuelta = paloDe(vista.cartaVuelta);
        const palos = PALOS_FRANCESES.filter((p) => p !== vuelta);
        const palo = [...palos].sort((a, b) => fuerzaEuchre(mano, b) - fuerzaEuchre(mano, a))[0]!;
        const fuerza = fuerzaEuchre(mano, palo);
        if (fuerza < PARA_PEDIR) return elegir({ tipo: 'pasar' });
        return elegir({ tipo: 'nombrar', palo, solo: fuerza >= PARA_SOLO });
      }
      case 'descarte':
        return elegir({ tipo: 'descartar', carta: descarteEuchre(mano, vista.triunfo!) });
      case 'bazas': {
        const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
        return elegir({ tipo: 'jugar', carta: cartaEuchre(vista, cartas) });
      }
    }
  },
};
