import type { Asiento, CartaJugada, IdCarta } from '@juegos/engine';
import type { InfoRed } from '../../sesion/sesion-mesa';
import { T } from '../../textos';

export type { EstadoSesion } from '../../sesion/sesion-mesa';

/** Lado de la mesa donde se dibuja cada asiento. */
export type Lado = 'abajo' | 'derecha' | 'arriba' | 'izquierda';

/** Posición de un asiento contando desde el del jugador (0 es él). */
export const relativo = (asiento: Asiento, jugadores: number, yo: Asiento) =>
  (asiento - yo + jugadores) % jugadores;

/**
 * El jugador (`yo`) abajo; con 3 y 4, el turno avanza en sentido antihorario: derecha,
 * (arriba,) izquierda.
 */
export function lado(asiento: Asiento, jugadores: number, yo: Asiento = 0): Lado {
  const r = relativo(asiento, jugadores, yo);
  if (jugadores === 2) return r === 0 ? 'abajo' : 'arriba';
  if (jugadores === 3) return (['abajo', 'derecha', 'izquierda'] as const)[r]!;
  return (['abajo', 'derecha', 'arriba', 'izquierda'] as const)[r]!;
}

/**
 * Nombre de un asiento desde el del jugador: «Tú», el nombre de quien lo ocupa en una partida en
 * red, o «Rival», «Compañero», «Rival 1»… contando desde el jugador.
 */
export function nombreAsiento(
  asiento: Asiento,
  jugadores: number,
  yo: Asiento = 0,
  red: InfoRed | null = null,
): string {
  if (asiento === yo) return T.brisca.tu;
  const enRed = red?.asientos[asiento]?.nombre;
  if (enRed) return enRed;
  const r = relativo(asiento, jugadores, yo);
  if (jugadores === 2) return T.brisca.rival;
  if (jugadores === 4) return r === 2 ? T.brisca.companero : T.brisca.rivalN(r === 1 ? 1 : 2);
  return T.brisca.rivalN(r);
}

/**
 * Nombre de un rival en los juegos en que cada uno juega por su cuenta y se numeran todos
 * (`rivalN(posición)`), o su nombre en una partida en red.
 */
export function nombreNumerado(
  asiento: Asiento,
  jugadores: number,
  yo: Asiento,
  red: InfoRed | null,
  rivalN: (n: number) => string,
  rival?: string,
): string {
  if (asiento === yo) return T.brisca.tu;
  const enRed = red?.asientos[asiento]?.nombre;
  if (enRed) return enRed;
  if (jugadores === 2 && rival !== undefined) return rival;
  return rivalN(relativo(asiento, jugadores, yo));
}

/** Lo que la mesa de bazas necesita de la vista; lo cumplen la Brisca, el Tute y el Guiñote. */
export interface VistaBazas {
  readonly config: { readonly jugadores: number };
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly muestra: IdCarta | null;
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento | null;
  readonly bazas: readonly number[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly resultadosManos: readonly { readonly puntos: readonly [number, number] }[];
}
