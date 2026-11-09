import type { Asiento, Asistencia, CodigoComentario, Fin, Motivo, NivelIA } from '@juegos/engine';
import type { InfoAsiento } from '@juegos/server/protocolo';
import type { Novedades } from '../estadisticas/estadisticas';
import type { DefJuego } from './juegos';

/** La jugada de un rival explicada por el asistente (con su vista, que no se enseña). */
export interface Lectura {
  readonly asiento: Asiento;
  /** Jugadores de la partida, para nombrar al rival desde el jugador. */
  readonly jugadores: number;
  readonly motivo: Motivo;
}

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
  /** Velocidad Pausada: la baza terminada espera en la mesa a que el jugador llame a `seguir`. */
  readonly retenida: boolean;
  readonly novedades: Novedades | null;
  readonly pistas: number;
  /** La sala, en las partidas en red; `null` en local. */
  readonly red: InfoRed | null;
  jugar(accion: A): boolean;
  pedirPista(): A | null;
  /** Recoge la baza retenida y sigue la partida. */
  seguir(): void;
  /** Modo asistido (spec modo-asistido): solo en las partidas locales contra la IA. */
  readonly puedeAsistir: boolean;
  readonly asistido: boolean;
  readonly asistencia: Asistencia<A> | null;
  readonly pensandoSugerencia: boolean;
  readonly comentario: Motivo<CodigoComentario> | null;
  /** Clave del consejo de fase que hay que enseñar, si hay uno. */
  readonly consejo: string | null;
  /** Por qué jugaron los rivales lo que jugaron desde la última jugada del jugador. */
  readonly lecturas: readonly Lectura[];
  alternarAsistido(): void;
  cerrarConsejo(): void;
  cerrarComentario(): void;
  tiempoMs(): number;
  pausar(): void;
  reanudar(): void;
  guardarAhora(): void;
  cerrar(): void;
}

/** El estado de la sesión que no depende de los tipos del juego. */
export type EstadoSesion = Pick<
  SesionMesa<unknown, unknown, unknown, unknown>,
  'bloqueada' | 'pensando' | 'fin' | 'asiento' | 'red' | 'retenida' | 'seguir'
>;

interface VistaConBazas {
  readonly bazas?: unknown;
  readonly mesa?: unknown;
  readonly ultimaBaza?: unknown;
}

const total = (bazas: unknown): number | null =>
  Array.isArray(bazas) && bazas.every((b) => typeof b === 'number')
    ? (bazas as number[]).reduce((s, b) => s + b, 0)
    : null;

/**
 * Se acaba de cerrar una baza sin acabar la mano. Según el juego, la vista cuenta las bazas
 * ganadas por asiento (`bazas`), guarda todas las bazas (Tarot, Doppelkopf) o vacía la mesa y
 * pone la baza en `ultimaBaza` (Corazones, Barbu…). Al cerrar la mano se ve su resumen.
 */
export function bazaCerrada(antes: unknown, despues: unknown): boolean {
  const a = antes as VistaConBazas | undefined;
  const d = despues as VistaConBazas | undefined;
  const ta = total(a?.bazas);
  const td = total(d?.bazas);
  if (ta !== null && td !== null) return td > ta;
  if (Array.isArray(a?.bazas) && Array.isArray(d?.bazas)) return d.bazas.length > a.bazas.length;
  return (
    Array.isArray(a?.mesa) &&
    a.mesa.length > 0 &&
    Array.isArray(d?.mesa) &&
    d.mesa.length === 0 &&
    d.ultimaBaza !== null &&
    d.ultimaBaza !== undefined
  );
}

/** Bando de un asiento en los juegos por parejas (0 y 2 contra 1 y 3) o de 2 jugadores. */
export const bandoDe = (asiento: Asiento) => asiento % 2;

/** Un par de valores por bando, con el del jugador primero. */
export function porBando<T>(valores: readonly T[], asiento: Asiento): [T, T] {
  const mio = bandoDe(asiento);
  return [valores[mio]!, valores[1 - mio]!];
}
