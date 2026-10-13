import { cartaDeId, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import type { Asiento } from './contrato';

/**
 * Modelo común de los juegos de bazas con baraja española (Brisca, Tute): orden y puntos de
 * las cartas, quién gana la baza, el robo tras la baza y las obligaciones de juego.
 * Son funciones puras; cada juego decide cuándo y cómo usarlas.
 */

export interface CartaJugada {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
}

// ── Valores de las cartas ────────────────────────────────────────────────────

/** De mayor a menor: as, tres, rey, caballo, sota, 7, 6, 5, 4, 2. */
const ORDEN = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2];
const PUNTOS: Readonly<Record<number, number>> = { 1: 11, 3: 10, 12: 4, 11: 3, 10: 2 };

export const paloDe = (id: IdCarta) => cartaDeId(id)!.palo as PaloEspanol;
export const valorDe = (id: IdCarta) => cartaDeId(id)!.valor;
/** Fuerza para comparar cartas del mismo palo: mayor es mejor. */
export const fuerza = (id: IdCarta) => ORDEN.length - ORDEN.indexOf(valorDe(id));
export const puntosDe = (id: IdCarta) => PUNTOS[valorDe(id)] ?? 0;

/** Carta que gana la baza: el triunfo más alto, o la más alta del palo de salida. */
export function cartaGanadora(mesa: readonly CartaJugada[], triunfo: PaloEspanol): CartaJugada {
  let mejor = mesa[0]!;
  for (const jugada of mesa.slice(1)) {
    const mismoPalo = paloDe(jugada.carta) === paloDe(mejor.carta);
    if (mismoPalo ? fuerza(jugada.carta) > fuerza(mejor.carta) : paloDe(jugada.carta) === triunfo) {
      mejor = jugada;
    }
  }
  return mejor;
}

/** Carta de la mano con la que se cambia la muestra: el 7 de triunfo, o el 2 si la muestra es baja. */
export function cartaDeCambio(muestra: IdCarta): IdCarta {
  const baja = fuerza(muestra) <= fuerza(`${paloDe(muestra)}-7`);
  return `${paloDe(muestra)}-${baja ? 2 : 7}`;
}

// ── Asientos ─────────────────────────────────────────────────────────────────

/** Bando de un asiento: en 2 jugadores, el propio asiento; en parejas, 0-2 contra 1-3. */
export const bandoDe = (asiento: Asiento): 0 | 1 => (asiento % 2) as 0 | 1;

/** Asiento que juega después, en el orden de turno. */
export const siguiente = (asiento: Asiento, jugadores: number): Asiento =>
  (asiento + 1) % jugadores;

// ── Robo ─────────────────────────────────────────────────────────────────────

export interface Robo {
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mazo: readonly IdCarta[];
  readonly muestra: IdCarta | null;
}

/**
 * Cada jugador roba una carta en orden de turno empezando por `desde` (el ganador de la baza).
 * Se roba de arriba del mazo (su último elemento) y, agotado, la muestra. Si no queda nada,
 * los que faltan no roban.
 */
export function robar(
  manos: readonly (readonly IdCarta[])[],
  mazo: readonly IdCarta[],
  muestra: IdCarta | null,
  desde: Asiento,
): Robo {
  const nuevas = manos.map((m) => [...m]);
  const restante = [...mazo];
  let quedaMuestra = muestra;
  for (let i = 0, a = desde; i < manos.length; i++, a = siguiente(a, manos.length)) {
    let carta = restante.pop() ?? null;
    if (carta === null) {
      carta = quedaMuestra;
      quedaMuestra = null;
    }
    if (carta === null) break;
    nuevas[a]!.push(carta);
  }
  return { manos: nuevas, mazo: restante, muestra: quedaMuestra };
}

// ── Obligaciones ─────────────────────────────────────────────────────────────

export interface OpcionesObligadas {
  /** Asiento que va a jugar; hace falta para saber si la baza ya es de su compañero. */
  readonly asiento: Asiento;
  /** Si es `false` y la baza la va ganando el compañero, no hay que superarla ni fallar. */
  readonly montarSobreCompanero: boolean;
}

/**
 * Cartas que se pueden jugar cuando rigen las obligaciones: seguir el palo de salida y ganar
 * con él si se puede; sin ese palo, jugar triunfo y superar el triunfo más alto si se puede;
 * sin palo ni triunfo, cualquiera. Con la baza vacía, cualquier carta.
 */
export function cartasObligadas(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloEspanol,
  opciones: OpcionesObligadas,
): readonly IdCarta[] {
  if (mesa.length === 0) return mano;
  const salida = paloDe(mesa[0]!.carta);
  const ganadora = cartaGanadora(mesa, triunfo);
  const delCompanero =
    !opciones.montarSobreCompanero &&
    ganadora.asiento !== opciones.asiento &&
    bandoDe(ganadora.asiento) === bandoDe(opciones.asiento);
  const superanA = (cartas: readonly IdCarta[]) => {
    if (delCompanero) return cartas;
    const superan = cartas.filter(
      (c) => paloDe(c) === paloDe(ganadora.carta) && fuerza(c) > fuerza(ganadora.carta),
    );
    return superan.length > 0 ? superan : cartas;
  };

  const delPalo = mano.filter((c) => paloDe(c) === salida);
  if (delPalo.length > 0) return superanA(delPalo);
  if (delCompanero) return mano;
  const triunfos = mano.filter((c) => paloDe(c) === triunfo);
  if (triunfos.length > 0) return superanA(triunfos);
  return mano;
}
