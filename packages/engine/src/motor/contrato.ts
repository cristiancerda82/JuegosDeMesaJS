import type { Resultado } from '../resultado';

/** Posición de un jugador en la mesa, desde 0. */
export type Asiento = number;

/** Resultado de una partida terminada. */
export interface Fin {
  /** Asientos ganadores. Vacío cuando nadie gana (empate, o derrota/abandono en solitario). */
  readonly ganadores: readonly Asiento[];
  readonly empate: boolean;
  /** Puntuación por asiento, en los juegos que la tienen. */
  readonly puntos?: readonly number[];
}

/**
 * Contrato que cumple cada juego de la suite. Todas las funciones son puras y deterministas;
 * estado, acciones y vistas son JSON plano.
 *
 * La validación de legalidad no es responsabilidad de `transicion`: se hace una sola vez,
 * en `aplicar`, contra `accionesLegales`.
 */
export interface Juego<Config, Estado, Accion, Vista> {
  readonly id: string;
  crear(config: Config, semilla: string): Resultado<Estado>;
  /** Número de asientos de la partida. */
  asientos(estado: Estado): number;
  /** Lista completa de acciones legales del asiento; vacía si no le toca o si terminó. */
  accionesLegales(estado: Estado, asiento: Asiento): readonly Accion[];
  /** Estado siguiente tras una acción que ya se sabe legal. No debe modificar `estado`. */
  transicion(estado: Estado, asiento: Asiento, accion: Accion): Estado;
  /** Lo que puede saber un asiento; `null` es un espectador. */
  vistaDe(estado: Estado, asiento: Asiento | null): Vista;
  /** `null` mientras la partida sigue. */
  resultado(estado: Estado): Fin | null;
}

/** Acción registrada en el historial de una partida. */
export interface Jugada<Accion> {
  readonly asiento: Asiento;
  readonly accion: Accion;
}

/** Todo lo necesario para reconstruir una partida. */
export interface Registro<Config, Accion> {
  readonly config: Config;
  readonly semilla: string;
  readonly jugadas: readonly Jugada<Accion>[];
}
