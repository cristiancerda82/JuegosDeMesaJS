import type { Asiento, CartaJugada, IdCarta } from '@juegos/engine';
import { HUMANO } from '../../sesion/sesion.svelte';
import { T } from '../../textos';

/** Lado de la mesa donde se dibuja cada asiento. */
export type Lado = 'abajo' | 'derecha' | 'arriba' | 'izquierda';

/** El humano abajo; con 4, el turno avanza en sentido antihorario: derecha, arriba, izquierda. */
export function lado(asiento: Asiento, jugadores: number): Lado {
  if (jugadores === 2) return asiento === HUMANO ? 'abajo' : 'arriba';
  return (['abajo', 'derecha', 'arriba', 'izquierda'] as const)[asiento]!;
}

export function nombreAsiento(asiento: Asiento, jugadores: number): string {
  if (asiento === HUMANO) return T.brisca.tu;
  if (jugadores === 2) return T.brisca.rival;
  return asiento === 2 ? T.brisca.companero : T.brisca.rivalN(asiento === 1 ? 1 : 2);
}

/** Lo que la mesa de bazas necesita de la vista; lo cumplen la Brisca, el Tute y el Guiñote. */
export interface VistaBazas {
  readonly config: { readonly jugadores: 2 | 4 };
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

/** Lo que la mesa de bazas necesita de la sesión. */
export interface EstadoSesion {
  readonly bloqueada: boolean;
  readonly pensando: Asiento | null;
  readonly fin: unknown;
}
