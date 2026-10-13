import type { IdCarta } from '../baraja/cartas';
import {
  bandoDe,
  cartaGanadora,
  fuerza,
  paloDe,
  puntosDe,
  type AccionBrisca,
  type VistaBrisca,
} from '../juegos/brisca';
import type { Agente } from './agente';

/** Puntos en la mesa a partir de los cuales vale la pena gastar un triunfo de puntos. */
const PUNTOS_PARA_TRIUNFO_ALTO = 10;

/**
 * IA básica de la Brisca: reglas en orden de prioridad, sin búsqueda (design, decisión 8).
 * Es determinista: no usa el azar que recibe.
 */
export const iaBriscaBasica: Agente<VistaBrisca, AccionBrisca> = {
  id: 'brisca-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

function elegir(vista: VistaBrisca, acciones: readonly AccionBrisca[]): AccionBrisca {
  // 1. La muestra que se recibe siempre vale más que la carta que se entrega.
  const cambio = acciones.find((a) => a.tipo === 'cambiarMuestra');
  if (cambio) return cambio;

  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  const carta = vista.mesa.length === 0 ? salir(vista, cartas) : responder(vista, cartas);
  return { tipo: 'jugar', carta };
}

/** Coste de entregar una carta: primero sus puntos, luego si es triunfo y luego su fuerza. */
function coste(vista: VistaBrisca, carta: IdCarta): number {
  return puntosDe(carta) * 100 + (paloDe(carta) === vista.triunfo ? 50 : 0) + fuerza(carta);
}

const masBarata = (vista: VistaBrisca, cartas: readonly IdCarta[]) =>
  [...cartas].sort((a, b) => coste(vista, a) - coste(vista, b))[0]!;

/** 5. Al salir, la carta más baja que no sea triunfo. */
function salir(vista: VistaBrisca, cartas: readonly IdCarta[]): IdCarta {
  const bajas = cartas.filter((c) => paloDe(c) !== vista.triunfo && puntosDe(c) === 0);
  return masBarata(vista, bajas.length > 0 ? bajas : cartas);
}

function responder(vista: VistaBrisca, cartas: readonly IdCarta[]): IdCarta {
  const yo = vista.asiento!;
  const ultimo = vista.mesa.length === vista.config.jugadores - 1;
  const enMesa = vista.mesa.reduce((s, j) => s + puntosDe(j.carta), 0);
  const ganaAhora = cartaGanadora(vista.mesa, vista.triunfo).asiento;

  // En parejas, si la baza ya es del compañero y nadie puede quitársela, se le cargan puntos.
  if (vista.config.jugadores === 4 && bandoDe(ganaAhora) === bandoDe(yo)) {
    if (!ultimo) return masBarata(vista, cartas);
    const sinTriunfo = cartas.filter((c) => paloDe(c) !== vista.triunfo);
    const cargas = sinTriunfo.length > 0 ? sinTriunfo : cartas;
    return [...cargas].sort(
      (a, b) => puntosDe(b) - puntosDe(a) || coste(vista, a) - coste(vista, b),
    )[0]!;
  }

  const gana = (c: IdCarta) =>
    cartaGanadora([...vista.mesa, { asiento: yo, carta: c }], vista.triunfo).asiento === yo;
  const ganadoras = cartas.filter(gana);
  const deSalida = ganadoras.filter((c) => paloDe(c) !== vista.triunfo);
  const triunfos = ganadoras.filter((c) => paloDe(c) === vista.triunfo);

  // 2. Ganar sin gastar triunfo cuando hay puntos en juego (los de la mesa o los de la propia
  //    carta). Siendo el último, la baza es segura: se gana con la carta que más puntos suma.
  if (deSalida.length > 0) {
    const mejor = ultimo
      ? [...deSalida].sort((a, b) => puntosDe(b) - puntosDe(a))[0]!
      : masBarata(vista, deSalida);
    if (enMesa + puntosDe(mejor) > 0) return mejor;
  }

  // 3. Fallar con triunfo solo si la baza tiene puntos, y un triunfo de puntos solo si son muchos.
  if (enMesa > 0 && triunfos.length > 0) {
    const triunfo = masBarata(vista, triunfos);
    if (puntosDe(triunfo) === 0 || enMesa >= PUNTOS_PARA_TRIUNFO_ALTO) return triunfo;
  }

  // 4. Si no conviene ganar, la carta de menor valor.
  return masBarata(vista, cartas);
}
