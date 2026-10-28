import {
  repetir,
  type NivelIA,
  type AccionBurro,
  type ConfigBurro,
  type EstadoBurro,
  type VistaBurro,
  type AccionChinchon,
  type AccionRemigio,
  type AccionTuteSubastado,
  type AccionCuatrola,
  type AccionMentiroso,
  type AccionOchoLoco,
  type AccionPicas,
  type AccionBlackjack,
  type AccionGinRummy,
  type AccionRummy500,
  type AccionHoldem,
  type AccionCulo,
  type AccionCanasta,
  type AccionWhist,
  type AccionSevens,
  type ConfigSevens,
  type EstadoSevens,
  type VistaSevens,
  type AccionCasino,
  type ConfigCasino,
  type EstadoCasino,
  type VistaCasino,
  type AccionDurak,
  type ConfigDurak,
  type EstadoDurak,
  type VistaDurak,
  type AccionEuchre,
  type ConfigEuchre,
  type EstadoEuchre,
  type VistaEuchre,
  type AccionBigTwo,
  type ConfigBigTwo,
  type EstadoBigTwo,
  type VistaBigTwo,
  type AccionCribbage,
  type ConfigCribbage,
  type EstadoCribbage,
  type VistaCribbage,
  type AccionBelote,
  type ConfigBelote,
  type EstadoBelote,
  type VistaBelote,
  type AccionSchnapsen,
  type ConfigSchnapsen,
  type EstadoSchnapsen,
  type VistaSchnapsen,
  type AccionSkat,
  type ConfigSkat,
  type EstadoSkat,
  type VistaSkat,
  type AccionOhHell,
  type ConfigOhHell,
  type EstadoOhHell,
  type VistaOhHell,
  type AccionSpiteMalice,
  type ConfigSpiteMalice,
  type EstadoSpiteMalice,
  type VistaSpiteMalice,
  type ConfigWhist,
  type EstadoWhist,
  type VistaWhist,
  type ConfigCanasta,
  type EstadoCanasta,
  type VistaCanasta,
  type ConfigCulo,
  type EstadoCulo,
  type VistaCulo,
  type ConfigHoldem,
  type EstadoHoldem,
  type VistaHoldem,
  type ConfigRummy500,
  type EstadoRummy500,
  type VistaRummy500,
  type ConfigGinRummy,
  type EstadoGinRummy,
  type VistaGinRummy,
  type ConfigBlackjack,
  type EstadoBlackjack,
  type VistaBlackjack,
  type ConfigPicas,
  type EstadoPicas,
  type VistaPicas,
  type ConfigOchoLoco,
  type EstadoOchoLoco,
  type VistaOchoLoco,
  type ConfigMentiroso,
  type EstadoMentiroso,
  type VistaMentiroso,
  type AccionPiramide,
  type AccionGolf,
  type AccionTriPeaks,
  type ConfigTriPeaks,
  type AccionYukon,
  type AccionCanfield,
  type AccionCuarentaLadrones,
  type AccionScorpion,
  type ConfigScorpion,
  type EstadoScorpion,
  type VistaScorpion,
  type ConfigCuarentaLadrones,
  type EstadoCuarentaLadrones,
  type VistaCuarentaLadrones,
  type ConfigCanfield,
  type EstadoCanfield,
  type VistaCanfield,
  type ConfigYukon,
  type EstadoYukon,
  type VistaYukon,
  type EstadoTriPeaks,
  type VistaTriPeaks,
  type ConfigGolf,
  type EstadoGolf,
  type VistaGolf,
  type ConfigPiramide,
  type EstadoPiramide,
  type VistaPiramide,
  type ConfigCuatrola,
  type EstadoCuatrola,
  type VistaCuatrola,
  type ConfigTuteSubastado,
  type EstadoTuteSubastado,
  type VistaTuteSubastado,
  type ConfigRemigio,
  type EstadoRemigio,
  type VistaRemigio,
  type AccionJulepe,
  type ConfigJulepe,
  type EstadoJulepe,
  type VistaJulepe,
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
  DEF_JULEPE,
  DEF_REMIGIO,
  DEF_TUTE_SUBASTADO,
  DEF_CUATROLA,
  DEF_MENTIROSO,
  DEF_OCHO_LOCO,
  DEF_PICAS,
  DEF_BLACKJACK,
  DEF_GIN_RUMMY,
  DEF_RUMMY_500,
  DEF_HOLDEM,
  DEF_CULO,
  DEF_CANASTA,
  DEF_WHIST,
  DEF_SEVENS,
  DEF_CASINO,
  DEF_DURAK,
  DEF_EUCHRE,
  DEF_BIG_TWO,
  DEF_CRIBBAGE,
  DEF_BELOTE,
  DEF_SCHNAPSEN,
  DEF_SKAT,
  DEF_OH_HELL,
  DEF_SPITE_MALICE,
  DEF_SPIDER,
  DEF_PIRAMIDE,
  DEF_GOLF,
  DEF_TRIPEAKS,
  DEF_YUKON,
  DEF_CANFIELD,
  DEF_CUARENTA_LADRONES,
  DEF_SCORPION,
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
export type SesionRemigio = SesionMesa<ConfigRemigio, EstadoRemigio, AccionRemigio, VistaRemigio>;
export type SesionTuteSubastado = SesionMesa<
  ConfigTuteSubastado,
  EstadoTuteSubastado,
  AccionTuteSubastado,
  VistaTuteSubastado
>;
export type SesionScorpion = SesionMesa<
  ConfigScorpion,
  EstadoScorpion,
  AccionScorpion,
  VistaScorpion
>;
export type SesionCuarentaLadrones = SesionMesa<
  ConfigCuarentaLadrones,
  EstadoCuarentaLadrones,
  AccionCuarentaLadrones,
  VistaCuarentaLadrones
>;
export type SesionCanfield = SesionMesa<
  ConfigCanfield,
  EstadoCanfield,
  AccionCanfield,
  VistaCanfield
>;
export type SesionYukon = SesionMesa<ConfigYukon, EstadoYukon, AccionYukon, VistaYukon>;
export type SesionTriPeaks = SesionMesa<
  ConfigTriPeaks,
  EstadoTriPeaks,
  AccionTriPeaks,
  VistaTriPeaks
>;
export type SesionGolf = SesionMesa<ConfigGolf, EstadoGolf, AccionGolf, VistaGolf>;
export type SesionPiramide = SesionMesa<
  ConfigPiramide,
  EstadoPiramide,
  AccionPiramide,
  VistaPiramide
>;
export type SesionSpiteMalice = SesionMesa<
  ConfigSpiteMalice,
  EstadoSpiteMalice,
  AccionSpiteMalice,
  VistaSpiteMalice
>;
export type SesionOhHell = SesionMesa<ConfigOhHell, EstadoOhHell, AccionOhHell, VistaOhHell>;
export type SesionSkat = SesionMesa<ConfigSkat, EstadoSkat, AccionSkat, VistaSkat>;
export type SesionSchnapsen = SesionMesa<
  ConfigSchnapsen,
  EstadoSchnapsen,
  AccionSchnapsen,
  VistaSchnapsen
>;
export type SesionBelote = SesionMesa<ConfigBelote, EstadoBelote, AccionBelote, VistaBelote>;
export type SesionCribbage = SesionMesa<
  ConfigCribbage,
  EstadoCribbage,
  AccionCribbage,
  VistaCribbage
>;
export type SesionBigTwo = SesionMesa<ConfigBigTwo, EstadoBigTwo, AccionBigTwo, VistaBigTwo>;
export type SesionEuchre = SesionMesa<ConfigEuchre, EstadoEuchre, AccionEuchre, VistaEuchre>;
export type SesionDurak = SesionMesa<ConfigDurak, EstadoDurak, AccionDurak, VistaDurak>;
export type SesionCasino = SesionMesa<ConfigCasino, EstadoCasino, AccionCasino, VistaCasino>;
export type SesionSevens = SesionMesa<ConfigSevens, EstadoSevens, AccionSevens, VistaSevens>;
export type SesionWhist = SesionMesa<ConfigWhist, EstadoWhist, AccionWhist, VistaWhist>;
export type SesionCanasta = SesionMesa<ConfigCanasta, EstadoCanasta, AccionCanasta, VistaCanasta>;
export type SesionCulo = SesionMesa<ConfigCulo, EstadoCulo, AccionCulo, VistaCulo>;
export type SesionHoldem = SesionMesa<ConfigHoldem, EstadoHoldem, AccionHoldem, VistaHoldem>;
export type SesionRummy500 = SesionMesa<
  ConfigRummy500,
  EstadoRummy500,
  AccionRummy500,
  VistaRummy500
>;
export type SesionGinRummy = SesionMesa<
  ConfigGinRummy,
  EstadoGinRummy,
  AccionGinRummy,
  VistaGinRummy
>;
export type SesionBlackjack = SesionMesa<
  ConfigBlackjack,
  EstadoBlackjack,
  AccionBlackjack,
  VistaBlackjack
>;
export type SesionPicas = SesionMesa<ConfigPicas, EstadoPicas, AccionPicas, VistaPicas>;
export type SesionOchoLoco = SesionMesa<
  ConfigOchoLoco,
  EstadoOchoLoco,
  AccionOchoLoco,
  VistaOchoLoco
>;
export type SesionMentiroso = SesionMesa<
  ConfigMentiroso,
  EstadoMentiroso,
  AccionMentiroso,
  VistaMentiroso
>;
export type SesionCuatrola = SesionMesa<
  ConfigCuatrola,
  EstadoCuatrola,
  AccionCuatrola,
  VistaCuatrola
>;
export type SesionJulepe = SesionMesa<ConfigJulepe, EstadoJulepe, AccionJulepe, VistaJulepe>;
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
  | { readonly id: 'piramide'; readonly sesion: SesionPiramide }
  | { readonly id: 'golf'; readonly sesion: SesionGolf }
  | { readonly id: 'tripeaks'; readonly sesion: SesionTriPeaks }
  | { readonly id: 'yukon'; readonly sesion: SesionYukon }
  | { readonly id: 'canfield'; readonly sesion: SesionCanfield }
  | { readonly id: 'cuarentaLadrones'; readonly sesion: SesionCuarentaLadrones }
  | { readonly id: 'scorpion'; readonly sesion: SesionScorpion }
  | { readonly id: 'corazones'; readonly sesion: SesionCorazones }
  | { readonly id: 'burro'; readonly sesion: SesionBurro }
  | { readonly id: 'pinacle'; readonly sesion: SesionPinacle }
  | { readonly id: 'butifarra'; readonly sesion: SesionButifarra }
  | { readonly id: 'truc'; readonly sesion: SesionTruc }
  | { readonly id: 'julepe'; readonly sesion: SesionJulepe }
  | { readonly id: 'remigio'; readonly sesion: SesionRemigio }
  | { readonly id: 'tuteSubastado'; readonly sesion: SesionTuteSubastado }
  | { readonly id: 'cuatrola'; readonly sesion: SesionCuatrola }
  | { readonly id: 'mentiroso'; readonly sesion: SesionMentiroso }
  | { readonly id: 'ochoLoco'; readonly sesion: SesionOchoLoco }
  | { readonly id: 'picas'; readonly sesion: SesionPicas }
  | { readonly id: 'blackjack'; readonly sesion: SesionBlackjack }
  | { readonly id: 'ginRummy'; readonly sesion: SesionGinRummy }
  | { readonly id: 'rummy500'; readonly sesion: SesionRummy500 }
  | { readonly id: 'holdem'; readonly sesion: SesionHoldem }
  | { readonly id: 'culo'; readonly sesion: SesionCulo }
  | { readonly id: 'canasta'; readonly sesion: SesionCanasta }
  | { readonly id: 'whist'; readonly sesion: SesionWhist }
  | { readonly id: 'sevens'; readonly sesion: SesionSevens }
  | { readonly id: 'casino'; readonly sesion: SesionCasino }
  | { readonly id: 'durak'; readonly sesion: SesionDurak }
  | { readonly id: 'euchre'; readonly sesion: SesionEuchre }
  | { readonly id: 'bigTwo'; readonly sesion: SesionBigTwo }
  | { readonly id: 'cribbage'; readonly sesion: SesionCribbage }
  | { readonly id: 'belote'; readonly sesion: SesionBelote }
  | { readonly id: 'schnapsen'; readonly sesion: SesionSchnapsen }
  | { readonly id: 'skat'; readonly sesion: SesionSkat }
  | { readonly id: 'ohHell'; readonly sesion: SesionOhHell }
  | { readonly id: 'spiteMalice'; readonly sesion: SesionSpiteMalice };

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
  | ConfigTruc
  | ConfigJulepe
  | ConfigRemigio
  | ConfigTuteSubastado
  | ConfigCuatrola
  | ConfigMentiroso
  | ConfigOchoLoco
  | ConfigPicas
  | ConfigBlackjack
  | ConfigGinRummy
  | ConfigRummy500
  | ConfigHoldem
  | ConfigCulo
  | ConfigCanasta
  | ConfigWhist
  | ConfigSevens
  | ConfigPiramide
  | ConfigGolf
  | ConfigTriPeaks
  | ConfigYukon
  | ConfigCanfield
  | ConfigCuarentaLadrones
  | ConfigScorpion
  | ConfigCasino
  | ConfigDurak
  | ConfigEuchre
  | ConfigBigTwo
  | ConfigCribbage
  | ConfigBelote
  | ConfigSchnapsen
  | ConfigSkat
  | ConfigOhHell
  | ConfigSpiteMalice;

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
    case 'piramide':
      return hacer(DEF_PIRAMIDE);
    case 'golf':
      return hacer(DEF_GOLF);
    case 'tripeaks':
      return hacer(DEF_TRIPEAKS);
    case 'yukon':
      return hacer(DEF_YUKON);
    case 'canfield':
      return hacer(DEF_CANFIELD);
    case 'cuarentaLadrones':
      return hacer(DEF_CUARENTA_LADRONES);
    case 'scorpion':
      return hacer(DEF_SCORPION);
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
    case 'julepe':
      return hacer(DEF_JULEPE);
    case 'remigio':
      return hacer(DEF_REMIGIO);
    case 'tuteSubastado':
      return hacer(DEF_TUTE_SUBASTADO);
    case 'cuatrola':
      return hacer(DEF_CUATROLA);
    case 'mentiroso':
      return hacer(DEF_MENTIROSO);
    case 'ochoLoco':
      return hacer(DEF_OCHO_LOCO);
    case 'picas':
      return hacer(DEF_PICAS);
    case 'blackjack':
      return hacer(DEF_BLACKJACK);
    case 'ginRummy':
      return hacer(DEF_GIN_RUMMY);
    case 'rummy500':
      return hacer(DEF_RUMMY_500);
    case 'holdem':
      return hacer(DEF_HOLDEM);
    case 'culo':
      return hacer(DEF_CULO);
    case 'canasta':
      return hacer(DEF_CANASTA);
    case 'whist':
      return hacer(DEF_WHIST);
    case 'sevens':
      return hacer(DEF_SEVENS);
    case 'casino':
      return hacer(DEF_CASINO);
    case 'durak':
      return hacer(DEF_DURAK);
    case 'euchre':
      return hacer(DEF_EUCHRE);
    case 'bigTwo':
      return hacer(DEF_BIG_TWO);
    case 'cribbage':
      return hacer(DEF_CRIBBAGE);
    case 'belote':
      return hacer(DEF_BELOTE);
    case 'schnapsen':
      return hacer(DEF_SCHNAPSEN);
    case 'skat':
      return hacer(DEF_SKAT);
    case 'ohHell':
      return hacer(DEF_OH_HELL);
    case 'spiteMalice':
      return hacer(DEF_SPITE_MALICE);
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
