import type { IdCarta, PaloEspanol } from '../baraja/cartas';
import { bandoDe, cartaGanadora, fuerza, paloDe, puntosDe, type CartaJugada } from '../motor/bazas';
import type { Asiento } from '../motor/contrato';

/**
 * Reglas de elección de carta comunes a las IAs básicas de los juegos de bazas (Brisca, Tute):
 * sin búsqueda, solo con lo que muestra la vista del jugador.
 */

/** Lo que la heurística necesita saber de la baza en curso. */
export interface SituacionBaza {
  readonly asiento: Asiento;
  readonly jugadores: number;
  readonly triunfo: PaloEspanol;
  readonly mesa: readonly CartaJugada[];
}

/** Puntos en la mesa a partir de los cuales vale la pena gastar un triunfo de puntos. */
const PUNTOS_PARA_TRIUNFO_ALTO = 10;

/** Coste de entregar una carta: primero sus puntos, luego si es triunfo y luego su fuerza. */
export function coste(triunfo: PaloEspanol, carta: IdCarta): number {
  return puntosDe(carta) * 100 + (paloDe(carta) === triunfo ? 50 : 0) + fuerza(carta);
}

export const masBarata = (triunfo: PaloEspanol, cartas: readonly IdCarta[]) =>
  [...cartas].sort((a, b) => coste(triunfo, a) - coste(triunfo, b))[0]!;

/** Al salir, la carta más baja que no sea triunfo ni dé puntos. */
export function cartaParaSalir(triunfo: PaloEspanol, cartas: readonly IdCarta[]): IdCarta {
  const bajas = cartas.filter((c) => paloDe(c) !== triunfo && puntosDe(c) === 0);
  return masBarata(triunfo, bajas.length > 0 ? bajas : cartas);
}

/** Al responder a una baza: ganarla si conviene y, si no, entregar la carta de menor valor. */
export function cartaParaResponder(b: SituacionBaza, cartas: readonly IdCarta[]): IdCarta {
  const ultimo = b.mesa.length === b.jugadores - 1;
  const enMesa = b.mesa.reduce((s, j) => s + puntosDe(j.carta), 0);
  const ganaAhora = cartaGanadora(b.mesa, b.triunfo).asiento;

  // En parejas, si la baza ya es del compañero y nadie puede quitársela, se le cargan puntos.
  if (b.jugadores === 4 && bandoDe(ganaAhora) === bandoDe(b.asiento)) {
    if (!ultimo) return masBarata(b.triunfo, cartas);
    const sinTriunfo = cartas.filter((c) => paloDe(c) !== b.triunfo);
    const cargas = sinTriunfo.length > 0 ? sinTriunfo : cartas;
    return [...cargas].sort(
      (x, y) => puntosDe(y) - puntosDe(x) || coste(b.triunfo, x) - coste(b.triunfo, y),
    )[0]!;
  }

  const gana = (c: IdCarta) =>
    cartaGanadora([...b.mesa, { asiento: b.asiento, carta: c }], b.triunfo).asiento === b.asiento;
  const ganadoras = cartas.filter(gana);
  const deSalida = ganadoras.filter((c) => paloDe(c) !== b.triunfo);
  const triunfos = ganadoras.filter((c) => paloDe(c) === b.triunfo);

  // Ganar sin gastar triunfo cuando hay puntos en juego (los de la mesa o los de la propia
  // carta). Siendo el último, la baza es segura: se gana con la carta que más puntos suma.
  if (deSalida.length > 0) {
    const mejor = ultimo
      ? [...deSalida].sort((x, y) => puntosDe(y) - puntosDe(x))[0]!
      : masBarata(b.triunfo, deSalida);
    if (enMesa + puntosDe(mejor) > 0) return mejor;
  }

  // Fallar con triunfo solo si la baza tiene puntos, y un triunfo de puntos solo si son muchos.
  if (enMesa > 0 && triunfos.length > 0) {
    const triunfo = masBarata(b.triunfo, triunfos);
    if (puntosDe(triunfo) === 0 || enMesa >= PUNTOS_PARA_TRIUNFO_ALTO) return triunfo;
  }

  // Si no conviene ganar, la carta de menor valor.
  return masBarata(b.triunfo, cartas);
}
