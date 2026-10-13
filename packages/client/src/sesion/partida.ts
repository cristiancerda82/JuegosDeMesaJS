import {
  repetir,
  type AccionBrisca,
  type AccionKlondike,
  type AccionTute,
  type ConfigBrisca,
  type ConfigKlondike,
  type ConfigTute,
  type EstadoBrisca,
  type EstadoKlondike,
  type EstadoTute,
  type Registro,
  type Resultado,
  type VistaBrisca,
  type VistaKlondike,
  type VistaTute,
} from '@juegos/engine';
import type { Guardado } from './guardado';
import {
  DEF_BRISCA,
  DEF_KLONDIKE,
  DEF_TUTE,
  semillaNueva,
  type DefJuego,
  type IdJuego,
} from './juegos';
import { Sesion } from './sesion.svelte';

export type SesionKlondike = Sesion<ConfigKlondike, EstadoKlondike, AccionKlondike, VistaKlondike>;
export type SesionBrisca = Sesion<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;
export type SesionTute = Sesion<ConfigTute, EstadoTute, AccionTute, VistaTute>;

/** Partida en curso, etiquetada por juego para que cada mesa reciba su tipo de sesión. */
export type Partida =
  | { readonly id: 'klondike'; readonly sesion: SesionKlondike }
  | { readonly id: 'brisca'; readonly sesion: SesionBrisca }
  | { readonly id: 'tute'; readonly sesion: SesionTute };

export type ConfigJuego = ConfigKlondike | ConfigBrisca | ConfigTute;

function etiquetar<T>(id: IdJuego, r: Resultado<T>): Resultado<Partida> {
  return r.ok ? { ok: true, valor: { id, sesion: r.valor } as Partida } : r;
}

/** Aplica una operación con la definición del juego, conservando sus tipos. */
function conDef<R>(id: IdJuego, hacer: <C, E, A, V>(def: DefJuego<C, E, A, V>) => R): R {
  switch (id) {
    case 'klondike':
      return hacer(DEF_KLONDIKE);
    case 'brisca':
      return hacer(DEF_BRISCA);
    case 'tute':
      return hacer(DEF_TUTE);
  }
}

export function nuevaPartida(id: IdJuego, config: ConfigJuego): Resultado<Partida> {
  const semilla = semillaNueva();
  return conDef(id, (def) => etiquetar(id, Sesion.nueva(def, config as never, semilla)));
}

/** Comprueba sin crear sesión (ni turnos de la IA) que el guardado se repite y sigue en juego. */
export function guardadoRepetible(g: Guardado): boolean {
  return conDef(g.juego, <C, E, A, V>(def: DefJuego<C, E, A, V>) => {
    const r = repetir(def.juego, g as unknown as Registro<C, A>);
    return r.ok && def.juego.resultado(r.valor) === null;
  });
}

export function partidaGuardada(g: Guardado): Resultado<Partida> {
  return conDef(g.juego, (def) => etiquetar(g.juego, Sesion.desdeGuardado(def, g)));
}
