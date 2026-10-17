import type { Asiento, Fin, NivelIA } from '@juegos/engine';
import type { InfoAsiento } from '@juegos/server/protocolo';
import type { Novedades } from '../estadisticas/estadisticas';
import type { DefJuego } from './juegos';

/** Lo que una partida en red añade: la sala y quién ocupa cada asiento. */
export interface InfoRed {
  readonly codigo: string;
  /** `null`: asiento de la IA. */
  readonly asientos: readonly (InfoAsiento | null)[];
  readonly anfitrion: Asiento;
}

/**
 * Lo que las mesas usan de una sesión (design, decisión 5). La cumplen la `Sesion` local, con el
 * jugador en el asiento 0, y la `SesionRed`, con el asiento que le haya tocado.
 */
export interface SesionMesa<C, E, A, V> {
  readonly def: DefJuego<C, E, A, V>;
  readonly config: C;
  readonly nivel: NivelIA;
  /** Asiento del jugador: la mesa se dibuja desde él. */
  readonly asiento: Asiento;
  readonly vista: V;
  readonly legales: readonly A[];
  readonly fin: Fin | null;
  /** No se puede jugar ahora (pausa para seguir una jugada, o turno de la IA). */
  readonly bloqueada: boolean;
  /** Asiento de la IA que está por jugar, si hay alguno. */
  readonly pensando: Asiento | null;
  readonly novedades: Novedades | null;
  readonly pistas: number;
  /** La sala, en las partidas en red; `null` en local. */
  readonly red: InfoRed | null;
  jugar(accion: A): boolean;
  pedirPista(): A | null;
  tiempoMs(): number;
  pausar(): void;
  reanudar(): void;
  guardarAhora(): void;
  cerrar(): void;
}

/** El estado de la sesión que no depende de los tipos del juego. */
export type EstadoSesion = Pick<
  SesionMesa<unknown, unknown, unknown, unknown>,
  'bloqueada' | 'pensando' | 'fin' | 'asiento' | 'red'
>;

/** Bando de un asiento en los juegos por parejas (0 y 2 contra 1 y 3) o de 2 jugadores. */
export const bandoDe = (asiento: Asiento) => asiento % 2;

/** Un par de valores por bando, con el del jugador primero. */
export function porBando<T>(valores: readonly T[], asiento: Asiento): [T, T] {
  const mio = bandoDe(asiento);
  return [valores[mio]!, valores[1 - mio]!];
}
