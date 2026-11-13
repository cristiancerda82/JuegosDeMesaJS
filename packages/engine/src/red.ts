import type { Generador } from './baraja/azar';
import type { Agente } from './ia/agente';
import { IAS } from './ia/ias';
import type { NivelIA } from './ia/niveles';
import { retrasoBurro } from './ia/reaccion';
import { brisca, CONFIG_BRISCA_POR_DEFECTO } from './juegos/brisca';
import { burro, CONFIG_BURRO_POR_DEFECTO } from './juegos/burro';
import { butifarra, CONFIG_BUTIFARRA_POR_DEFECTO } from './juegos/butifarra';
import { chinchon, CONFIG_CHINCHON_POR_DEFECTO } from './juegos/chinchon';
import { cinquillo, CONFIG_CINQUILLO_POR_DEFECTO } from './juegos/cinquillo';
import { CONFIG_CORAZONES_POR_DEFECTO, corazones } from './juegos/corazones';
import { CONFIG_ESCOBA_POR_DEFECTO, escoba } from './juegos/escoba';
import { CONFIG_GUINOTE_POR_DEFECTO, guinote } from './juegos/guinote';
import { CONFIG_MUS_POR_DEFECTO, mus } from './juegos/mus';
import { CONFIG_PINACLE_POR_DEFECTO, pinacle } from './juegos/pinacle';
import { CONFIG_POCHA_POR_DEFECTO, pocha } from './juegos/pocha';
import { CONFIG_SIETE_Y_MEDIA_POR_DEFECTO, sieteYMedia } from './juegos/siete-y-media';
import { CONFIG_JULEPE_POR_DEFECTO, julepe } from './juegos/julepe';
import { CONFIG_REMIGIO_POR_DEFECTO, remigio } from './juegos/remigio';
import { CONFIG_TRUC_POR_DEFECTO, truc } from './juegos/truc';
import { CONFIG_TUTE_POR_DEFECTO, tute } from './juegos/tute';
import { CONFIG_TUTE_SUBASTADO_POR_DEFECTO, tuteSubastado } from './juegos/tute-subastado';
import { CONFIG_CUATROLA_POR_DEFECTO, cuatrola } from './juegos/cuatrola';
import { CONFIG_MENTIROSO_POR_DEFECTO, mentiroso } from './juegos/mentiroso';
import { CONFIG_OCHO_LOCO_POR_DEFECTO, ochoLoco } from './juegos/ocho-loco';
import { CONFIG_PICAS_POR_DEFECTO, picas } from './juegos/picas';
import { blackjack, CONFIG_BLACKJACK_POR_DEFECTO } from './juegos/blackjack';
import { CONFIG_GIN_RUMMY_POR_DEFECTO, ginRummy } from './juegos/gin-rummy';
import { CONFIG_RUMMY_500_POR_DEFECTO, rummy500 } from './juegos/rummy-500';
import { CONFIG_HOLDEM_POR_DEFECTO, holdem } from './juegos/holdem';
import { CONFIG_CULO_POR_DEFECTO, culo } from './juegos/culo';
import { canasta, CONFIG_CANASTA_POR_DEFECTO } from './juegos/canasta';
import { CONFIG_WHIST_POR_DEFECTO, whist } from './juegos/whist';
import { CONFIG_SEVENS_POR_DEFECTO, sevens } from './juegos/sevens';
import { casino, CONFIG_CASINO_POR_DEFECTO } from './juegos/casino';
import { CONFIG_DURAK_POR_DEFECTO, durak } from './juegos/durak';
import { CONFIG_EUCHRE_POR_DEFECTO, euchre } from './juegos/euchre';
import { bigTwo, CONFIG_BIG_TWO_POR_DEFECTO } from './juegos/big-two';
import { CONFIG_CRIBBAGE_POR_DEFECTO, cribbage } from './juegos/cribbage';
import { belote, CONFIG_BELOTE_POR_DEFECTO } from './juegos/belote';
import { CONFIG_SCHNAPSEN_POR_DEFECTO, CONFIG_SIXTY_SIX, schnapsen } from './juegos/schnapsen';
import { CONFIG_SKAT_POR_DEFECTO, skat } from './juegos/skat';
import { CONFIG_OH_HELL_POR_DEFECTO, ohHell } from './juegos/oh-hell';
import { CONFIG_SPITE_MALICE_POR_DEFECTO, spiteMalice } from './juegos/spite-malice';
import { bridge, CONFIG_BRIDGE_POR_DEFECTO } from './juegos/bridge';
import { CONFIG_PESCA_POR_DEFECTO, pesca } from './juegos/pesca';
import { CONFIG_KINGS_CORNER_POR_DEFECTO, kingsCorner } from './juegos/kings-corner';
import { bezique, CONFIG_BEZIQUE_POR_DEFECTO } from './juegos/bezique';
import { CONFIG_DOPPELKOPF_POR_DEFECTO, doppelkopf } from './juegos/doppelkopf';
import { CONFIG_TAROT_POR_DEFECTO, tarot } from './juegos/tarot';
import { CONFIG_SUECA_POR_DEFECTO, sueca } from './juegos/sueca';
import { CONFIG_PIQUET_POR_DEFECTO, piquet } from './juegos/piquet';
import { CONFIG_JASS_POR_DEFECTO, jass } from './juegos/jass';
import { CONFIG_KLAVERJAS_POR_DEFECTO, klaverjas } from './juegos/klaverjas';
import { barbu, CONFIG_BARBU_POR_DEFECTO } from './juegos/barbu';
import { CONFIG_FIVE_HUNDRED_POR_DEFECTO, fiveHundred } from './juegos/five-hundred';
import { CONFIG_SCOPA_POR_DEFECTO, scopa } from './juegos/scopa';
import { CONFIG_TRESSETTE_POR_DEFECTO, tressette } from './juegos/tressette';
import { CONFIG_SCHAFKOPF_POR_DEFECTO, schafkopf } from './juegos/schafkopf';
import { CONFIG_TRUCO_POR_DEFECTO, truco } from './juegos/truco';
import { CONFIG_PREFERENCE_POR_DEFECTO, preference } from './juegos/preference';
import { CONFIG_CUARENTA_POR_DEFECTO, cuarenta } from './juegos/cuarenta';
import { CONFIG_PISHTI_POR_DEFECTO, pishti } from './juegos/pishti';
import { CONFIG_ECARTE_POR_DEFECTO, ecarte } from './juegos/ecarte';
import { CONFIG_TYSIACHA_POR_DEFECTO, tysiacha } from './juegos/tysiacha';
import { CONFIG_SHEEPSHEAD_POR_DEFECTO, sheepshead } from './juegos/sheepshead';
import { CONFIG_RENTZ_POR_DEFECTO, rentz } from './juegos/rentz';
import { bourre, CONFIG_BOURRE_POR_DEFECTO } from './juegos/bourre';
import { CONFIG_TRESILLO_POR_DEFECTO, tresillo } from './juegos/tresillo';
import { CONFIG_CONQUIAN_POR_DEFECTO, conquian } from './juegos/conquian';
import { CONFIG_TREINTA_Y_UNO_POR_DEFECTO, treintaYUno } from './juegos/treinta-y-uno';
import { CONFIG_TWENTY_NINE_POR_DEFECTO, twentyNine } from './juegos/twenty-nine';
import { briscolaChiamata, CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO } from './juegos/briscola-chiamata';
import { CONFIG_HAND_AND_FOOT_POR_DEFECTO, handAndFoot } from './juegos/hand-and-foot';
import { CONFIG_POLIGNAC_POR_DEFECTO, polignac } from './juegos/polignac';
import type { Juego } from './motor/contrato';

/**
 * Los juegos que se pueden jugar en red (spec partidas-en-red): todos los que tienen IA. Los
 * ids son los mismos que usa el cliente.
 */
export const IDS_JUEGOS_EN_RED = [
  'brisca',
  'tute',
  'guinote',
  'escoba',
  'chinchon',
  'sieteYMedia',
  'cinquillo',
  'pocha',
  'mus',
  'corazones',
  'burro',
  'pinacle',
  'butifarra',
  'truc',
  'julepe',
  'remigio',
  'tuteSubastado',
  'cuatrola',
  'mentiroso',
  'ochoLoco',
  'picas',
  'blackjack',
  'ginRummy',
  'rummy500',
  'holdem',
  'culo',
  'canasta',
  'whist',
  'sevens',
  'casino',
  'durak',
  'euchre',
  'bigTwo',
  'cribbage',
  'belote',
  'schnapsen',
  'skat',
  'ohHell',
  'spiteMalice',
  'bridge',
  'pesca',
  'kingsCorner',
  'bezique',
  'doppelkopf',
  'tarot',
  'sueca',
  'piquet',
  'jass',
  'klaverjas',
  'barbu',
  'fiveHundred',
  'scopa',
  'tressette',
  'schafkopf',
  'truco',
  'preference',
  'cuarenta',
  'pishti',
  'ecarte',
  'sixtySix',
  'tysiacha',
  'sheepshead',
  'rentz',
  'bourre',
  'tresillo',
  'conquian',
  'treintaYUno',
  'twentyNine',
  'briscolaChiamata',
  'handAndFoot',
  'polignac',
] as const;

export type IdJuegoRed = (typeof IDS_JUEGOS_EN_RED)[number];

/** Lo que el servidor necesita de un juego, sin sus tipos concretos. */
export interface JuegoEnRed {
  readonly juego: Juego<unknown, unknown, unknown, unknown>;
  readonly ias: Readonly<Record<NivelIA, Agente<unknown, unknown>>>;
  readonly configPorDefecto: unknown;
  /**
   * En los juegos en tiempo real (el Burro), cuánto tarda la IA en hacer una acción; en los
   * demás, `null` y la IA juega por turnos con una pausa fija.
   */
  readonly retrasoIA:
    ((vista: unknown, accion: unknown, g: Generador, nivel: NivelIA) => number) | null;
}

function entrada<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  ias: Readonly<Record<NivelIA, Agente<V, A>>>,
  configPorDefecto: C,
  retrasoIA: ((vista: V, accion: A, g: Generador, nivel: NivelIA) => number) | null = null,
): JuegoEnRed {
  return {
    juego: juego as unknown as JuegoEnRed['juego'],
    ias: ias as unknown as JuegoEnRed['ias'],
    configPorDefecto,
    retrasoIA: retrasoIA as JuegoEnRed['retrasoIA'],
  };
}

export const JUEGOS_EN_RED: Readonly<Record<IdJuegoRed, JuegoEnRed>> = {
  brisca: entrada(brisca, IAS.brisca, CONFIG_BRISCA_POR_DEFECTO),
  tute: entrada(tute, IAS.tute, CONFIG_TUTE_POR_DEFECTO),
  guinote: entrada(guinote, IAS.guinote, CONFIG_GUINOTE_POR_DEFECTO),
  escoba: entrada(escoba, IAS.escoba, CONFIG_ESCOBA_POR_DEFECTO),
  chinchon: entrada(chinchon, IAS.chinchon, CONFIG_CHINCHON_POR_DEFECTO),
  sieteYMedia: entrada(sieteYMedia, IAS.sieteYMedia, CONFIG_SIETE_Y_MEDIA_POR_DEFECTO),
  cinquillo: entrada(cinquillo, IAS.cinquillo, CONFIG_CINQUILLO_POR_DEFECTO),
  pocha: entrada(pocha, IAS.pocha, CONFIG_POCHA_POR_DEFECTO),
  mus: entrada(mus, IAS.mus, CONFIG_MUS_POR_DEFECTO),
  corazones: entrada(corazones, IAS.corazones, CONFIG_CORAZONES_POR_DEFECTO),
  burro: entrada(burro, IAS.burro, CONFIG_BURRO_POR_DEFECTO, retrasoBurro),
  pinacle: entrada(pinacle, IAS.pinacle, CONFIG_PINACLE_POR_DEFECTO),
  butifarra: entrada(butifarra, IAS.butifarra, CONFIG_BUTIFARRA_POR_DEFECTO),
  truc: entrada(truc, IAS.truc, CONFIG_TRUC_POR_DEFECTO),
  julepe: entrada(julepe, IAS.julepe, CONFIG_JULEPE_POR_DEFECTO),
  remigio: entrada(remigio, IAS.remigio, CONFIG_REMIGIO_POR_DEFECTO),
  tuteSubastado: entrada(tuteSubastado, IAS.tuteSubastado, CONFIG_TUTE_SUBASTADO_POR_DEFECTO),
  cuatrola: entrada(cuatrola, IAS.cuatrola, CONFIG_CUATROLA_POR_DEFECTO),
  mentiroso: entrada(mentiroso, IAS.mentiroso, CONFIG_MENTIROSO_POR_DEFECTO),
  ochoLoco: entrada(ochoLoco, IAS.ochoLoco, CONFIG_OCHO_LOCO_POR_DEFECTO),
  picas: entrada(picas, IAS.picas, CONFIG_PICAS_POR_DEFECTO),
  blackjack: entrada(blackjack, IAS.blackjack, CONFIG_BLACKJACK_POR_DEFECTO),
  ginRummy: entrada(ginRummy, IAS.ginRummy, CONFIG_GIN_RUMMY_POR_DEFECTO),
  rummy500: entrada(rummy500, IAS.rummy500, CONFIG_RUMMY_500_POR_DEFECTO),
  holdem: entrada(holdem, IAS.holdem, CONFIG_HOLDEM_POR_DEFECTO),
  culo: entrada(culo, IAS.culo, CONFIG_CULO_POR_DEFECTO),
  canasta: entrada(canasta, IAS.canasta, CONFIG_CANASTA_POR_DEFECTO),
  whist: entrada(whist, IAS.whist, CONFIG_WHIST_POR_DEFECTO),
  sevens: entrada(sevens, IAS.sevens, CONFIG_SEVENS_POR_DEFECTO),
  casino: entrada(casino, IAS.casino, CONFIG_CASINO_POR_DEFECTO),
  durak: entrada(durak, IAS.durak, CONFIG_DURAK_POR_DEFECTO),
  euchre: entrada(euchre, IAS.euchre, CONFIG_EUCHRE_POR_DEFECTO),
  bigTwo: entrada(bigTwo, IAS.bigTwo, CONFIG_BIG_TWO_POR_DEFECTO),
  cribbage: entrada(cribbage, IAS.cribbage, CONFIG_CRIBBAGE_POR_DEFECTO),
  belote: entrada(belote, IAS.belote, CONFIG_BELOTE_POR_DEFECTO),
  schnapsen: entrada(schnapsen, IAS.schnapsen, CONFIG_SCHNAPSEN_POR_DEFECTO),
  sixtySix: entrada(schnapsen, IAS.schnapsen, CONFIG_SIXTY_SIX),
  skat: entrada(skat, IAS.skat, CONFIG_SKAT_POR_DEFECTO),
  ohHell: entrada(ohHell, IAS.ohHell, CONFIG_OH_HELL_POR_DEFECTO),
  spiteMalice: entrada(spiteMalice, IAS.spiteMalice, CONFIG_SPITE_MALICE_POR_DEFECTO),
  bridge: entrada(bridge, IAS.bridge, CONFIG_BRIDGE_POR_DEFECTO),
  pesca: entrada(pesca, IAS.pesca, CONFIG_PESCA_POR_DEFECTO),
  kingsCorner: entrada(kingsCorner, IAS.kingsCorner, CONFIG_KINGS_CORNER_POR_DEFECTO),
  bezique: entrada(bezique, IAS.bezique, CONFIG_BEZIQUE_POR_DEFECTO),
  doppelkopf: entrada(doppelkopf, IAS.doppelkopf, CONFIG_DOPPELKOPF_POR_DEFECTO),
  tarot: entrada(tarot, IAS.tarot, CONFIG_TAROT_POR_DEFECTO),
  sueca: entrada(sueca, IAS.sueca, CONFIG_SUECA_POR_DEFECTO),
  piquet: entrada(piquet, IAS.piquet, CONFIG_PIQUET_POR_DEFECTO),
  jass: entrada(jass, IAS.jass, CONFIG_JASS_POR_DEFECTO),
  klaverjas: entrada(klaverjas, IAS.klaverjas, CONFIG_KLAVERJAS_POR_DEFECTO),
  barbu: entrada(barbu, IAS.barbu, CONFIG_BARBU_POR_DEFECTO),
  fiveHundred: entrada(fiveHundred, IAS.fiveHundred, CONFIG_FIVE_HUNDRED_POR_DEFECTO),
  scopa: entrada(scopa, IAS.scopa, CONFIG_SCOPA_POR_DEFECTO),
  tressette: entrada(tressette, IAS.tressette, CONFIG_TRESSETTE_POR_DEFECTO),
  schafkopf: entrada(schafkopf, IAS.schafkopf, CONFIG_SCHAFKOPF_POR_DEFECTO),
  truco: entrada(truco, IAS.truco, CONFIG_TRUCO_POR_DEFECTO),
  preference: entrada(preference, IAS.preference, CONFIG_PREFERENCE_POR_DEFECTO),
  cuarenta: entrada(cuarenta, IAS.cuarenta, CONFIG_CUARENTA_POR_DEFECTO),
  pishti: entrada(pishti, IAS.pishti, CONFIG_PISHTI_POR_DEFECTO),
  ecarte: entrada(ecarte, IAS.ecarte, CONFIG_ECARTE_POR_DEFECTO),
  tysiacha: entrada(tysiacha, IAS.tysiacha, CONFIG_TYSIACHA_POR_DEFECTO),
  sheepshead: entrada(sheepshead, IAS.sheepshead, CONFIG_SHEEPSHEAD_POR_DEFECTO),
  rentz: entrada(rentz, IAS.rentz, CONFIG_RENTZ_POR_DEFECTO),
  bourre: entrada(bourre, IAS.bourre, CONFIG_BOURRE_POR_DEFECTO),
  tresillo: entrada(tresillo, IAS.tresillo, CONFIG_TRESILLO_POR_DEFECTO),
  conquian: entrada(conquian, IAS.conquian, CONFIG_CONQUIAN_POR_DEFECTO),
  treintaYUno: entrada(treintaYUno, IAS.treintaYUno, CONFIG_TREINTA_Y_UNO_POR_DEFECTO),
  twentyNine: entrada(twentyNine, IAS.twentyNine, CONFIG_TWENTY_NINE_POR_DEFECTO),
  briscolaChiamata: entrada(
    briscolaChiamata,
    IAS.briscolaChiamata,
    CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO,
  ),
  handAndFoot: entrada(handAndFoot, IAS.handAndFoot, CONFIG_HAND_AND_FOOT_POR_DEFECTO),
  polignac: entrada(polignac, IAS.polignac, CONFIG_POLIGNAC_POR_DEFECTO),
};

export const esJuegoEnRed = (id: unknown): id is IdJuegoRed =>
  (IDS_JUEGOS_EN_RED as readonly unknown[]).includes(id);
