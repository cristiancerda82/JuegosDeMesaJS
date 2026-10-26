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
};

export const esJuegoEnRed = (id: unknown): id is IdJuegoRed =>
  (IDS_JUEGOS_EN_RED as readonly unknown[]).includes(id);
