import {
  repetir,
  type AccionBrisca,
  type AccionKlondike,
  type ConfigBrisca,
  type ConfigKlondike,
  type EstadoBrisca,
  type EstadoKlondike,
  type Registro,
  type Resultado,
  type VistaBrisca,
  type VistaKlondike,
} from '@juegos/engine';
import type { Guardado } from './guardado';
import { DEF_BRISCA, DEF_KLONDIKE, semillaNueva, type DefJuego, type IdJuego } from './juegos';
import { Sesion } from './sesion.svelte';

export type SesionKlondike = Sesion<ConfigKlondike, EstadoKlondike, AccionKlondike, VistaKlondike>;
export type SesionBrisca = Sesion<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;

/** Partida en curso, etiquetada por juego para que cada mesa reciba su tipo de sesión. */
export type Partida =
  | { readonly id: 'klondike'; readonly sesion: SesionKlondike }
  | { readonly id: 'brisca'; readonly sesion: SesionBrisca };

export type ConfigDe<J extends IdJuego> = J extends 'klondike' ? ConfigKlondike : ConfigBrisca;

function etiquetar<T>(id: IdJuego, r: Resultado<T>): Resultado<Partida> {
  return r.ok ? { ok: true, valor: { id, sesion: r.valor } as Partida } : r;
}

export function nuevaPartida(
  id: IdJuego,
  config: ConfigKlondike | ConfigBrisca,
): Resultado<Partida> {
  const semilla = semillaNueva();
  return id === 'klondike'
    ? etiquetar(id, Sesion.nueva(DEF_KLONDIKE, config as ConfigKlondike, semilla))
    : etiquetar(id, Sesion.nueva(DEF_BRISCA, config as ConfigBrisca, semilla));
}

/** Comprueba sin crear sesión (ni turnos de la IA) que el guardado se repite y sigue en juego. */
export function guardadoRepetible(g: Guardado): boolean {
  const comprobar = <C, E, A, V>(def: DefJuego<C, E, A, V>) => {
    const r = repetir(def.juego, g as unknown as Registro<C, A>);
    return r.ok && def.juego.resultado(r.valor) === null;
  };
  return g.juego === 'klondike' ? comprobar(DEF_KLONDIKE) : comprobar(DEF_BRISCA);
}

export function partidaGuardada(g: Guardado): Resultado<Partida> {
  return g.juego === 'klondike'
    ? etiquetar(g.juego, Sesion.desdeGuardado(DEF_KLONDIKE, g))
    : etiquetar(g.juego, Sesion.desdeGuardado(DEF_BRISCA, g));
}
