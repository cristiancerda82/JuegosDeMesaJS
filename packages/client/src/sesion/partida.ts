import {
  repetir,
  type AccionChinchon,
  type AccionGuinote,
  type AccionSieteYMedia,
  type ConfigSieteYMedia,
  type AccionFreeCell,
  type AccionCinquillo,
  type AccionPocha,
  type ConfigPocha,
  type EstadoPocha,
  type VistaPocha,
  type ConfigCinquillo,
  type EstadoCinquillo,
  type VistaCinquillo,
  type ConfigFreeCell,
  type EstadoFreeCell,
  type VistaFreeCell,
  type EstadoSieteYMedia,
  type VistaSieteYMedia,
  type ConfigGuinote,
  type EstadoGuinote,
  type VistaGuinote,
  type ConfigChinchon,
  type EstadoChinchon,
  type VistaChinchon,
  type AccionBrisca,
  type AccionKlondike,
  type AccionEscoba,
  type AccionTute,
  type ConfigBrisca,
  type ConfigKlondike,
  type ConfigEscoba,
  type ConfigTute,
  type EstadoBrisca,
  type EstadoKlondike,
  type EstadoEscoba,
  type EstadoTute,
  type Registro,
  type Resultado,
  type VistaBrisca,
  type VistaKlondike,
  type VistaEscoba,
  type VistaTute,
} from '@juegos/engine';
import type { Guardado } from './guardado';
import {
  DEF_BRISCA,
  DEF_CHINCHON,
  DEF_GUINOTE,
  DEF_SIETE_Y_MEDIA,
  DEF_FREECELL,
  DEF_CINQUILLO,
  DEF_POCHA,
  DEF_KLONDIKE,
  DEF_ESCOBA,
  DEF_TUTE,
  semillaNueva,
  type DefJuego,
  type IdJuego,
} from './juegos';
import { Sesion } from './sesion.svelte';

export type SesionKlondike = Sesion<ConfigKlondike, EstadoKlondike, AccionKlondike, VistaKlondike>;
export type SesionBrisca = Sesion<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;
export type SesionTute = Sesion<ConfigTute, EstadoTute, AccionTute, VistaTute>;
export type SesionEscoba = Sesion<ConfigEscoba, EstadoEscoba, AccionEscoba, VistaEscoba>;
export type SesionChinchon = Sesion<ConfigChinchon, EstadoChinchon, AccionChinchon, VistaChinchon>;
export type SesionGuinote = Sesion<ConfigGuinote, EstadoGuinote, AccionGuinote, VistaGuinote>;
export type SesionCinquillo = Sesion<
  ConfigCinquillo,
  EstadoCinquillo,
  AccionCinquillo,
  VistaCinquillo
>;
export type SesionPocha = Sesion<ConfigPocha, EstadoPocha, AccionPocha, VistaPocha>;
export type SesionFreeCell = Sesion<ConfigFreeCell, EstadoFreeCell, AccionFreeCell, VistaFreeCell>;
export type SesionSieteYMedia = Sesion<
  ConfigSieteYMedia,
  EstadoSieteYMedia,
  AccionSieteYMedia,
  VistaSieteYMedia
>;

/** Partida en curso, etiquetada por juego para que cada mesa reciba su tipo de sesión. */
export type Partida =
  | { readonly id: 'klondike'; readonly sesion: SesionKlondike }
  | { readonly id: 'brisca'; readonly sesion: SesionBrisca }
  | { readonly id: 'tute'; readonly sesion: SesionTute }
  | { readonly id: 'escoba'; readonly sesion: SesionEscoba }
  | { readonly id: 'chinchon'; readonly sesion: SesionChinchon }
  | { readonly id: 'guinote'; readonly sesion: SesionGuinote }
  | { readonly id: 'sieteYMedia'; readonly sesion: SesionSieteYMedia }
  | { readonly id: 'freecell'; readonly sesion: SesionFreeCell }
  | { readonly id: 'cinquillo'; readonly sesion: SesionCinquillo }
  | { readonly id: 'pocha'; readonly sesion: SesionPocha };

export type ConfigJuego =
  | ConfigKlondike
  | ConfigBrisca
  | ConfigTute
  | ConfigEscoba
  | ConfigChinchon
  | ConfigGuinote
  | ConfigSieteYMedia
  | ConfigFreeCell
  | ConfigCinquillo
  | ConfigPocha;

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
    case 'escoba':
      return hacer(DEF_ESCOBA);
    case 'chinchon':
      return hacer(DEF_CHINCHON);
    case 'guinote':
      return hacer(DEF_GUINOTE);
    case 'sieteYMedia':
      return hacer(DEF_SIETE_Y_MEDIA);
    case 'freecell':
      return hacer(DEF_FREECELL);
    case 'cinquillo':
      return hacer(DEF_CINQUILLO);
    case 'pocha':
      return hacer(DEF_POCHA);
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
