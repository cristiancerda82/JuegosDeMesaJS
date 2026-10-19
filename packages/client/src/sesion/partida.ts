import {
  repetir,
  type NivelIA,
  type AccionBurro,
  type ConfigBurro,
  type EstadoBurro,
  type VistaBurro,
  type AccionChinchon,
  type AccionTruc,
  type ConfigTruc,
  type EstadoTruc,
  type VistaTruc,
  type AccionButifarra,
  type ConfigButifarra,
  type EstadoButifarra,
  type VistaButifarra,
  type AccionPinacle,
  type ConfigPinacle,
  type EstadoPinacle,
  type VistaPinacle,
  type AccionGuinote,
  type AccionSieteYMedia,
  type ConfigSieteYMedia,
  type AccionFreeCell,
  type AccionCinquillo,
  type AccionPocha,
  type AccionMus,
  type AccionCorazones,
  type ConfigCorazones,
  type EstadoCorazones,
  type VistaCorazones,
  type AccionSpider,
  type ConfigSpider,
  type EstadoSpider,
  type VistaSpider,
  type ConfigMus,
  type EstadoMus,
  type VistaMus,
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
  DEF_MUS,
  DEF_CORAZONES,
  DEF_BURRO,
  DEF_PINACLE,
  DEF_BUTIFARRA,
  DEF_TRUC,
  DEF_SPIDER,
  DEF_KLONDIKE,
  DEF_ESCOBA,
  DEF_TUTE,
  semillaNueva,
  type DefJuego,
  type IdJuego,
} from './juegos';
import type { SesionMesa } from './sesion-mesa';
import type { ClienteRed, MensajePartida } from './red.svelte';
import { SesionRed } from './sesion-red.svelte';
import { Sesion } from './sesion.svelte';

export type SesionKlondike = SesionMesa<
  ConfigKlondike,
  EstadoKlondike,
  AccionKlondike,
  VistaKlondike
>;
export type SesionBrisca = SesionMesa<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;
export type SesionTute = SesionMesa<ConfigTute, EstadoTute, AccionTute, VistaTute>;
export type SesionEscoba = SesionMesa<ConfigEscoba, EstadoEscoba, AccionEscoba, VistaEscoba>;
export type SesionChinchon = SesionMesa<
  ConfigChinchon,
  EstadoChinchon,
  AccionChinchon,
  VistaChinchon
>;
export type SesionGuinote = SesionMesa<ConfigGuinote, EstadoGuinote, AccionGuinote, VistaGuinote>;
export type SesionCinquillo = SesionMesa<
  ConfigCinquillo,
  EstadoCinquillo,
  AccionCinquillo,
  VistaCinquillo
>;
export type SesionPocha = SesionMesa<ConfigPocha, EstadoPocha, AccionPocha, VistaPocha>;
export type SesionMus = SesionMesa<ConfigMus, EstadoMus, AccionMus, VistaMus>;
export type SesionSpider = SesionMesa<ConfigSpider, EstadoSpider, AccionSpider, VistaSpider>;
export type SesionCorazones = SesionMesa<
  ConfigCorazones,
  EstadoCorazones,
  AccionCorazones,
  VistaCorazones
>;
export type SesionBurro = SesionMesa<ConfigBurro, EstadoBurro, AccionBurro, VistaBurro>;
export type SesionPinacle = SesionMesa<ConfigPinacle, EstadoPinacle, AccionPinacle, VistaPinacle>;
export type SesionButifarra = SesionMesa<
  ConfigButifarra,
  EstadoButifarra,
  AccionButifarra,
  VistaButifarra
>;
export type SesionTruc = SesionMesa<ConfigTruc, EstadoTruc, AccionTruc, VistaTruc>;
export type SesionFreeCell = SesionMesa<
  ConfigFreeCell,
  EstadoFreeCell,
  AccionFreeCell,
  VistaFreeCell
>;
export type SesionSieteYMedia = SesionMesa<
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
  | { readonly id: 'pocha'; readonly sesion: SesionPocha }
  | { readonly id: 'mus'; readonly sesion: SesionMus }
  | { readonly id: 'spider'; readonly sesion: SesionSpider }
  | { readonly id: 'corazones'; readonly sesion: SesionCorazones }
  | { readonly id: 'burro'; readonly sesion: SesionBurro }
  | { readonly id: 'pinacle'; readonly sesion: SesionPinacle }
  | { readonly id: 'butifarra'; readonly sesion: SesionButifarra }
  | { readonly id: 'truc'; readonly sesion: SesionTruc };

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
  | ConfigPocha
  | ConfigMus
  | ConfigSpider
  | ConfigCorazones
  | ConfigBurro
  | ConfigPinacle
  | ConfigButifarra
  | ConfigTruc;

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
    case 'mus':
      return hacer(DEF_MUS);
    case 'spider':
      return hacer(DEF_SPIDER);
    case 'corazones':
      return hacer(DEF_CORAZONES);
    case 'burro':
      return hacer(DEF_BURRO);
    case 'pinacle':
      return hacer(DEF_PINACLE);
    case 'butifarra':
      return hacer(DEF_BUTIFARRA);
    case 'truc':
      return hacer(DEF_TRUC);
  }
}

export function nuevaPartida(
  id: IdJuego,
  config: ConfigJuego,
  nivel: NivelIA = 'normal',
): Resultado<Partida> {
  const semilla = semillaNueva();
  return conDef(id, (def) => etiquetar(id, Sesion.nueva(def, config as never, semilla, nivel)));
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

/** La partida de una sala en red, con la primera vista que ha enviado el servidor. */
export function partidaEnRed(cliente: ClienteRed, primera: MensajePartida): Partida {
  const id = cliente.sala!.juego;
  return conDef(id, (def) => ({ id, sesion: new SesionRed(def, cliente, primera) }) as Partida);
}
