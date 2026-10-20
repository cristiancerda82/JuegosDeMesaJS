import type { IdCarta, PaloEspanol } from '../baraja/cartas';
import {
  bandoDe,
  cartaGanadora,
  fuerza,
  paloDe,
  puntosDe,
  VALORES_BRISCA,
  type CartaJugada,
  type ValoresBazas,
} from '../motor/bazas';
import type { Asiento } from '../motor/contrato';

/**
 * Reglas de elección de carta comunes a las IAs básicas de los juegos de bazas (Brisca, Tute,
 * Guiñote): sin búsqueda, solo con lo que muestra la vista del jugador.
 */

/** Lo que la heurística necesita saber de la baza en curso. */
export interface SituacionBaza {
  readonly asiento: Asiento;
  readonly jugadores: number;
  /** `null`: sin triunfo (la butifarra). */
  readonly triunfo: PaloEspanol | null;
  readonly mesa: readonly CartaJugada[];
  /** Orden y puntos de las cartas; por defecto, los de la Brisca y el Tute. */
  readonly valores?: ValoresBazas;
  /**
   * Si `otro` es compañero de `asiento`. Por defecto, en parejas fijas de 4 (pares contra
   * impares); los juegos con bandos que cambian en cada mano dan el suyo.
   */
  readonly companero?: (otro: Asiento) => boolean;
}

/** Puntos en la mesa a partir de los cuales vale la pena gastar un triunfo de puntos. */
const PUNTOS_PARA_TRIUNFO_ALTO = 10;

/** Coste de entregar una carta: primero sus puntos, luego si es triunfo y luego su fuerza. */
export function coste(
  triunfo: PaloEspanol | null,
  carta: IdCarta,
  valores: ValoresBazas = VALORES_BRISCA,
): number {
  return (
    puntosDe(carta, valores) * 100 + (paloDe(carta) === triunfo ? 50 : 0) + fuerza(carta, valores)
  );
}

export const masBarata = (
  triunfo: PaloEspanol | null,
  cartas: readonly IdCarta[],
  valores: ValoresBazas = VALORES_BRISCA,
) => [...cartas].sort((a, b) => coste(triunfo, a, valores) - coste(triunfo, b, valores))[0]!;

/** Al salir, la carta más baja que no sea triunfo ni dé puntos. */
export function cartaParaSalir(
  triunfo: PaloEspanol | null,
  cartas: readonly IdCarta[],
  valores: ValoresBazas = VALORES_BRISCA,
): IdCarta {
  const bajas = cartas.filter((c) => paloDe(c) !== triunfo && puntosDe(c, valores) === 0);
  return masBarata(triunfo, bajas.length > 0 ? bajas : cartas, valores);
}

/** Al responder a una baza: ganarla si conviene y, si no, entregar la carta de menor valor. */
export function cartaParaResponder(b: SituacionBaza, cartas: readonly IdCarta[]): IdCarta {
  const v = b.valores ?? VALORES_BRISCA;
  const puntos = (c: IdCarta) => puntosDe(c, v);
  const barata = (cs: readonly IdCarta[]) => masBarata(b.triunfo, cs, v);
  const ultimo = b.mesa.length === b.jugadores - 1;
  const enMesa = b.mesa.reduce((s, j) => s + puntos(j.carta), 0);
  const ganaAhora = cartaGanadora(b.mesa, b.triunfo, v).asiento;

  // En parejas, si la baza ya es del compañero y nadie puede quitársela, se le cargan puntos.
  const companero =
    b.companero ?? ((otro) => b.jugadores === 4 && bandoDe(otro) === bandoDe(b.asiento));
  if (companero(ganaAhora)) {
    if (!ultimo) return barata(cartas);
    const sinTriunfo = cartas.filter((c) => paloDe(c) !== b.triunfo);
    const cargas = sinTriunfo.length > 0 ? sinTriunfo : cartas;
    return [...cargas].sort(
      (x, y) => puntos(y) - puntos(x) || coste(b.triunfo, x, v) - coste(b.triunfo, y, v),
    )[0]!;
  }

  const gana = (c: IdCarta) =>
    cartaGanadora([...b.mesa, { asiento: b.asiento, carta: c }], b.triunfo, v).asiento ===
    b.asiento;
  const ganadoras = cartas.filter(gana);
  const deSalida = ganadoras.filter((c) => paloDe(c) !== b.triunfo);
  const triunfos = ganadoras.filter((c) => paloDe(c) === b.triunfo);

  // Ganar sin gastar triunfo cuando hay puntos en juego (los de la mesa o los de la propia
  // carta). Siendo el último, la baza es segura: se gana con la carta que más puntos suma.
  if (deSalida.length > 0) {
    const mejor = ultimo
      ? [...deSalida].sort((x, y) => puntos(y) - puntos(x))[0]!
      : barata(deSalida);
    if (enMesa + puntos(mejor) > 0) return mejor;
  }

  // Fallar con triunfo solo si la baza tiene puntos, y un triunfo de puntos solo si son muchos.
  if (enMesa > 0 && triunfos.length > 0) {
    const triunfo = barata(triunfos);
    if (puntos(triunfo) === 0 || enMesa >= PUNTOS_PARA_TRIUNFO_ALTO) return triunfo;
  }

  // Si no conviene ganar, la carta de menor valor.
  return barata(cartas);
}
