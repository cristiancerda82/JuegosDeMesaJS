import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';
import { iaBriscaBasica } from './brisca-basica';
import { iaBurroBasica } from './burro-basica';
import { iaButifarraBasica } from './butifarra-basica';
import { iaChinchonBasica } from './chinchon-basica';
import { iaCinquilloBasica } from './cinquillo-basica';
import { iaCorazonesBasica } from './corazones-basica';
import { iaEscobaBasica } from './escoba-basica';
import { iaGuinoteBasica } from './guinote-basica';
import { iaMusBasica } from './mus-basica';
import { conErrores, porSimulacion, type NivelIA, type Simulable } from './niveles';
import { iaPinacleBasica } from './pinacle-basica';
import { iaPochaBasica } from './pocha-basica';
import { SIMULABLE_BRISCA } from './reconstruir/brisca';
import { SIMULABLE_BUTIFARRA } from './reconstruir/butifarra';
import { SIMULABLE_CHINCHON } from './reconstruir/chinchon';
import { SIMULABLE_CINQUILLO } from './reconstruir/cinquillo';
import { SIMULABLE_CORAZONES } from './reconstruir/corazones';
import { SIMULABLE_ESCOBA } from './reconstruir/escoba';
import { SIMULABLE_GUINOTE } from './reconstruir/guinote';
import { SIMULABLE_PINACLE } from './reconstruir/pinacle';
import { SIMULABLE_POCHA } from './reconstruir/pocha';
import { SIMULABLE_SIETE_Y_MEDIA } from './reconstruir/siete-y-media';
import { SIMULABLE_JULEPE } from './reconstruir/julepe';
import { SIMULABLE_REMIGIO } from './reconstruir/remigio';
import { SIMULABLE_TUTE_SUBASTADO } from './reconstruir/tute-subastado';
import { SIMULABLE_CUATROLA } from './reconstruir/cuatrola';
import { SIMULABLE_OCHO_LOCO } from './reconstruir/ocho-loco';
import { SIMULABLE_PICAS } from './reconstruir/picas';
import { SIMULABLE_BLACKJACK } from './reconstruir/blackjack';
import { SIMULABLE_GIN_RUMMY } from './reconstruir/gin-rummy';
import { SIMULABLE_RUMMY_500 } from './reconstruir/rummy-500';
import { SIMULABLE_CULO } from './reconstruir/culo';
import { SIMULABLE_CANASTA } from './reconstruir/canasta';
import { SIMULABLE_WHIST } from './reconstruir/whist';
import { SIMULABLE_SEVENS } from './reconstruir/sevens';
import { SIMULABLE_CASINO } from './reconstruir/casino';
import { SIMULABLE_DURAK } from './reconstruir/durak';
import { SIMULABLE_EUCHRE } from './reconstruir/euchre';
import { SIMULABLE_BIG_TWO } from './reconstruir/big-two';
import { SIMULABLE_CRIBBAGE } from './reconstruir/cribbage';
import { SIMULABLE_BELOTE } from './reconstruir/belote';
import { SIMULABLE_SCHNAPSEN } from './reconstruir/schnapsen';
import { SIMULABLE_SKAT } from './reconstruir/skat';
import { SIMULABLE_OH_HELL } from './reconstruir/oh-hell';
import { SIMULABLE_SPITE_MALICE } from './reconstruir/spite-malice';
import { SIMULABLE_BRIDGE } from './reconstruir/bridge';
import { SIMULABLE_PESCA } from './reconstruir/pesca';
import { SIMULABLE_KINGS_CORNER } from './reconstruir/kings-corner';
import { SIMULABLE_BEZIQUE } from './reconstruir/bezique';
import { SIMULABLE_DOPPELKOPF } from './reconstruir/doppelkopf';
import { SIMULABLE_TAROT } from './reconstruir/tarot';
import { SIMULABLE_SUECA } from './reconstruir/sueca';
import { SIMULABLE_PIQUET } from './reconstruir/piquet';
import { SIMULABLE_TRUC } from './reconstruir/truc';
import { SIMULABLE_TUTE } from './reconstruir/tute';
import { iaSieteYMediaBasica } from './siete-y-media-basica';
import { iaJulepeBasica } from './julepe-basica';
import { iaRemigioBasica } from './remigio-basica';
import { iaTuteSubastadoBasica } from './tute-subastado-basica';
import { iaCuatrolaBasica } from './cuatrola-basica';
import { iaMentirosoBasica, iaMentirosoExperta } from './mentiroso-basica';
import { iaOchoLocoBasica, iaOchoLocoExperta } from './ocho-loco-basica';
import { iaPicasBasica } from './picas-basica';
import { iaBlackjackBasica, iaBlackjackExperta } from './blackjack-basica';
import { iaGinRummyBasica } from './gin-rummy-basica';
import { iaRummy500Basica } from './rummy-500-basica';
import { iaCuloBasica } from './culo-basica';
import { iaCanastaBasica } from './canasta-basica';
import { iaWhistBasica } from './whist-basica';
import { iaSevensBasica } from './sevens-basica';
import { iaCasinoBasica } from './casino-basica';
import { iaDurakBasica } from './durak-basica';
import { iaEuchreBasica } from './euchre-basica';
import { iaBigTwoBasica } from './big-two-basica';
import { iaCribbageBasica } from './cribbage-basica';
import { iaBeloteBasica } from './belote-basica';
import { iaSchnapsenBasica } from './schnapsen-basica';
import { iaSkatBasica } from './skat-basica';
import { iaOhHellBasica } from './oh-hell-basica';
import { iaSpiteMaliceBasica } from './spite-malice-basica';
import { iaBridgeBasica } from './bridge-basica';
import { iaPescaBasica } from './pesca-basica';
import { iaKingsCornerBasica } from './kings-corner-basica';
import { iaBeziqueBasica } from './bezique-basica';
import { iaDoppelkopfBasica } from './doppelkopf-basica';
import { iaTarotBasica } from './tarot-basica';
import { iaSuecaBasica } from './sueca-basica';
import { iaPiquetBasica } from './piquet-basica';
import { iaHoldemBasica, iaHoldemExperta } from './holdem-basica';
import { iaTrucBasica } from './truc-basica';
import { iaTuteBasica } from './tute-basica';

export type IasPorNivel<V, A> = Readonly<Record<NivelIA, Agente<V, A>>>;

/** Parte de las decisiones en las que la IA fácil elige al azar. */
export const ERRORES_FACIL = 0.3;

/** Los tres niveles de un juego con simulación: fácil con errores, la básica y la simulación. */
function niveles<C, E, A, V extends { readonly asiento: Asiento | null }>(
  normal: Agente<V, A>,
  simulable: Simulable<C, E, A, V>,
): IasPorNivel<V, A> {
  return {
    facil: conErrores(normal, ERRORES_FACIL),
    normal,
    dificil: porSimulacion(normal, simulable),
  };
}

/** Las IAs de cada juego por nivel (spec niveles-ia). */
export const IAS = {
  brisca: niveles(iaBriscaBasica, SIMULABLE_BRISCA),
  tute: niveles(iaTuteBasica, SIMULABLE_TUTE),
  guinote: niveles(iaGuinoteBasica, SIMULABLE_GUINOTE),
  escoba: niveles(iaEscobaBasica, SIMULABLE_ESCOBA),
  chinchon: niveles(iaChinchonBasica, SIMULABLE_CHINCHON),
  sieteYMedia: niveles(iaSieteYMediaBasica, SIMULABLE_SIETE_Y_MEDIA),
  cinquillo: niveles(iaCinquilloBasica, SIMULABLE_CINQUILLO),
  pocha: niveles(iaPochaBasica, SIMULABLE_POCHA),
  // En el Mus la simulación no gana a la normal: no ve que el rival envida o acepta justo cuando
  // lleva buena mano. Hasta tener una IA experta, el difícil juega como la normal.
  mus: { facil: conErrores(iaMusBasica, ERRORES_FACIL), normal: iaMusBasica, dificil: iaMusBasica },
  corazones: niveles(iaCorazonesBasica, SIMULABLE_CORAZONES),
  // En el Burro decide la reacción, que pone el cliente: el difícil pasa como el normal, y el
  // fácil se equivoca solo al pasar, en la mitad de los pases.
  burro: {
    facil: conErrores(iaBurroBasica, 0.5, (a) => a.tipo === 'pasar'),
    normal: iaBurroBasica,
    dificil: iaBurroBasica,
  },
  pinacle: niveles(iaPinacleBasica, SIMULABLE_PINACLE),
  butifarra: niveles(iaButifarraBasica, SIMULABLE_BUTIFARRA),
  // Las apuestas del Truc las decide la base también en el difícil: solo simula las cartas.
  truc: niveles(iaTrucBasica, SIMULABLE_TRUC),
  julepe: niveles(iaJulepeBasica, SIMULABLE_JULEPE),
  remigio: niveles(iaRemigioBasica, SIMULABLE_REMIGIO),
  tuteSubastado: niveles(iaTuteSubastadoBasica, SIMULABLE_TUTE_SUBASTADO),
  cuatrola: niveles(iaCuatrolaBasica, SIMULABLE_CUATROLA),
  // En el Mentiroso la simulación no ve los faroles: el difícil gana por memoria de cartas.
  mentiroso: {
    facil: conErrores(iaMentirosoBasica, ERRORES_FACIL),
    normal: iaMentirosoBasica,
    dificil: iaMentirosoExperta,
  },
  // En el Ocho loco lo que más pesa es guardar los ochos: la normal no los guarda, y el difícil
  // simula sobre la experta, que sí.
  ochoLoco: {
    facil: conErrores(iaOchoLocoBasica, ERRORES_FACIL),
    normal: iaOchoLocoBasica,
    dificil: porSimulacion(iaOchoLocoExperta, SIMULABLE_OCHO_LOCO),
  },
  // La apuesta de Picas la decide la base también en el difícil: solo simula las cartas.
  picas: niveles(iaPicasBasica, SIMULABLE_PICAS),
  // En el Blackjack la normal juega como la banca; el difícil simula sobre la estrategia básica.
  blackjack: {
    facil: conErrores(iaBlackjackBasica, ERRORES_FACIL),
    normal: iaBlackjackBasica,
    dificil: porSimulacion(iaBlackjackExperta, SIMULABLE_BLACKJACK),
  },
  // Como en el Remigio, el difícil simula el robo y el descarte; cierra como la normal.
  ginRummy: niveles(iaGinRummyBasica, SIMULABLE_GIN_RUMMY),
  // Como en el Remigio: el difícil simula el robo y el descarte; baja y añade como la normal.
  rummy500: niveles(iaRummy500Basica, SIMULABLE_RUMMY_500),
  // En el Hold'em no se simulan partidas: el difícil estima su probabilidad de ganar.
  holdem: {
    facil: conErrores(iaHoldemBasica, ERRORES_FACIL),
    normal: iaHoldemBasica,
    dificil: iaHoldemExperta,
  },
  // El difícil simula qué juega; lo que devuelve en el intercambio, como la normal.
  culo: niveles(iaCuloBasica, SIMULABLE_CULO),
  // Como en el Pinacle: el difícil simula robar o llevarse el pozo y el descarte.
  canasta: niveles(iaCanastaBasica, SIMULABLE_CANASTA),
  whist: niveles(iaWhistBasica, SIMULABLE_WHIST),
  sevens: niveles(iaSevensBasica, SIMULABLE_SEVENS),
  casino: niveles(iaCasinoBasica, SIMULABLE_CASINO),
  durak: niveles(iaDurakBasica, SIMULABLE_DURAK),
  euchre: niveles(iaEuchreBasica, SIMULABLE_EUCHRE),
  bigTwo: niveles(iaBigTwoBasica, SIMULABLE_BIG_TWO),
  cribbage: niveles(iaCribbageBasica, SIMULABLE_CRIBBAGE),
  belote: niveles(iaBeloteBasica, SIMULABLE_BELOTE),
  schnapsen: niveles(iaSchnapsenBasica, SIMULABLE_SCHNAPSEN),
  skat: niveles(iaSkatBasica, SIMULABLE_SKAT),
  ohHell: niveles(iaOhHellBasica, SIMULABLE_OH_HELL),
  spiteMalice: niveles(iaSpiteMaliceBasica, SIMULABLE_SPITE_MALICE),
  bridge: niveles(iaBridgeBasica, SIMULABLE_BRIDGE),
  pesca: niveles(iaPescaBasica, SIMULABLE_PESCA),
  kingsCorner: niveles(iaKingsCornerBasica, SIMULABLE_KINGS_CORNER),
  bezique: niveles(iaBeziqueBasica, SIMULABLE_BEZIQUE),
  doppelkopf: niveles(iaDoppelkopfBasica, SIMULABLE_DOPPELKOPF),
  tarot: niveles(iaTarotBasica, SIMULABLE_TAROT),
  sueca: niveles(iaSuecaBasica, SIMULABLE_SUECA),
  piquet: niveles(iaPiquetBasica, SIMULABLE_PIQUET),
} as const;
