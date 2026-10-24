import {
  brisca,
  burro,
  butifarra,
  CONFIG_BUTIFARRA_POR_DEFECTO,
  CONFIG_TRUC_POR_DEFECTO,
  truc,
  CONFIG_JULEPE_POR_DEFECTO,
  julepe,
  CONFIG_REMIGIO_POR_DEFECTO,
  remigio,
  CONFIG_TUTE_SUBASTADO_POR_DEFECTO,
  tuteSubastado,
  CONFIG_CUATROLA_POR_DEFECTO,
  cuatrola,
  CONFIG_MENTIROSO_POR_DEFECTO,
  mentiroso,
  CONFIG_OCHO_LOCO_POR_DEFECTO,
  ochoLoco,
  CONFIG_PICAS_POR_DEFECTO,
  picas,
  CONFIG_BLACKJACK_POR_DEFECTO,
  blackjack,
  type AccionBlackjack,
  CONFIG_GIN_RUMMY_POR_DEFECTO,
  ginRummy,
  CONFIG_RUMMY_500_POR_DEFECTO,
  rummy500,
  CONFIG_HOLDEM_POR_DEFECTO,
  holdem,
  type AccionHoldem,
  type ConfigHoldem,
  type EstadoHoldem,
  type VistaHoldem,
  type AccionRummy500,
  type ConfigRummy500,
  type EstadoRummy500,
  type VistaRummy500,
  type AccionGinRummy,
  type ConfigGinRummy,
  type EstadoGinRummy,
  type VistaGinRummy,
  type ConfigBlackjack,
  type EstadoBlackjack,
  type VistaBlackjack,
  type AccionPicas,
  type ConfigPicas,
  type EstadoPicas,
  type VistaPicas,
  type AccionOchoLoco,
  type ConfigOchoLoco,
  type EstadoOchoLoco,
  type VistaOchoLoco,
  type AccionMentiroso,
  type ConfigMentiroso,
  type EstadoMentiroso,
  type VistaMentiroso,
  type AccionCuatrola,
  type ConfigCuatrola,
  type EstadoCuatrola,
  type VistaCuatrola,
  type AccionTuteSubastado,
  type ConfigTuteSubastado,
  type EstadoTuteSubastado,
  type VistaTuteSubastado,
  type AccionRemigio,
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
  CONFIG_BURRO_POR_DEFECTO,
  type AccionBurro,
  type ConfigBurro,
  type EstadoBurro,
  type VistaBurro,
  chinchon,
  CONFIG_CHINCHON_POR_DEFECTO,
  type AccionChinchon,
  type ConfigChinchon,
  type EstadoChinchon,
  type VistaChinchon,
  CONFIG_BRISCA_POR_DEFECTO,
  CONFIG_KLONDIKE_POR_DEFECTO,
  CONFIG_FREECELL_POR_DEFECTO,
  CONFIG_SPIDER_POR_DEFECTO,
  spider,
  piramide,
  CONFIG_PIRAMIDE_POR_DEFECTO,
  pistaPiramide,
  golf,
  CONFIG_GOLF_POR_DEFECTO,
  pistaGolf,
  CONFIG_TRIPEAKS_POR_DEFECTO,
  CONFIG_YUKON_POR_DEFECTO,
  CONFIG_CANFIELD_POR_DEFECTO,
  canfield,
  pistaCanfield,
  type AccionCanfield,
  type ConfigCanfield,
  type EstadoCanfield,
  type VistaCanfield,
  yukon,
  pistaYukon,
  type AccionYukon,
  type ConfigYukon,
  type EstadoYukon,
  type VistaYukon,
  tripeaks,
  pistaTriPeaks,
  type AccionTriPeaks,
  type ConfigTriPeaks,
  type EstadoTriPeaks,
  type VistaTriPeaks,
  type AccionGolf,
  type ConfigGolf,
  type EstadoGolf,
  type VistaGolf,
  type AccionPiramide,
  type ConfigPiramide,
  type EstadoPiramide,
  type VistaPiramide,
  type AccionSpider,
  type ConfigSpider,
  type EstadoSpider,
  type VistaSpider,
  freecell,
  type AccionFreeCell,
  type ConfigFreeCell,
  type EstadoFreeCell,
  type VistaFreeCell,
  CONFIG_ESCOBA_POR_DEFECTO,
  CONFIG_TUTE_POR_DEFECTO,
  CONFIG_CINQUILLO_POR_DEFECTO,
  cinquillo,
  type AccionCinquillo,
  type ConfigCinquillo,
  type EstadoCinquillo,
  type VistaCinquillo,
  CONFIG_CORAZONES_POR_DEFECTO,
  corazones,
  type AccionCorazones,
  type ConfigCorazones,
  type EstadoCorazones,
  type VistaCorazones,
  CONFIG_MUS_POR_DEFECTO,
  mus,
  type AccionMus,
  type ConfigMus,
  type EstadoMus,
  type VistaMus,
  CONFIG_PINACLE_POR_DEFECTO,
  pinacle,
  type AccionPinacle,
  type ConfigPinacle,
  type EstadoPinacle,
  type VistaPinacle,
  CONFIG_POCHA_POR_DEFECTO,
  pocha,
  type AccionPocha,
  type ConfigPocha,
  type EstadoPocha,
  type VistaPocha,
  CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
  sieteYMedia,
  type AccionSieteYMedia,
  type ConfigSieteYMedia,
  type EstadoSieteYMedia,
  type VistaSieteYMedia,
  CONFIG_GUINOTE_POR_DEFECTO,
  guinote,
  type AccionGuinote,
  type ConfigGuinote,
  type EstadoGuinote,
  type VistaGuinote,
  klondike,
  tute,
  escoba,
  type AccionBrisca,
  type AccionKlondike,
  type AccionEscoba,
  type AccionTute,
  IAS,
  retrasoBurro,
  pistaFreeCell,
  pistaKlondike,
  pistaSpider,
  type Agente,
  type Generador,
  type NivelIA,
  type ConfigBrisca,
  type ConfigKlondike,
  type ConfigEscoba,
  type ConfigTute,
  type EstadoBrisca,
  type EstadoKlondike,
  type EstadoEscoba,
  type EstadoTute,
  type Juego,
  type VistaBrisca,
  type VistaKlondike,
  type VistaEscoba,
  type VistaTute,
} from '@juegos/engine';
import { SEMILLA_FIJA } from '../ajustes';
import { T } from '../textos';

/** Cómo juega el cliente cada juego del motor. */
export interface DefJuego<C, E, A, V> {
  readonly id: IdJuego;
  readonly nombre: string;
  readonly juego: Juego<C, E, A, V>;
  readonly configPorDefecto: C;
  /** Agentes por nivel para los asientos que no ocupa el humano; `null` en los solitarios. */
  readonly ia: Readonly<Record<NivelIA, Agente<V, A>>> | null;
  /**
   * Pausa en milisegundos tras un cambio de la vista del humano, para que pueda seguirlo
   * (p. ej. ver la baza completa antes de que se recoja). Durante la pausa no se juega.
   */
  pausaTras(antes: V, despues: V): number;
  /**
   * Juegos en los que varios jugadores actúan a la vez en tiempo real: el humano no espera a la
   * IA y cada IA actúa tras el retraso en milisegundos que devuelve `esperaIA` para la acción
   * que va a hacer (antes de aplicar `FACTOR_PAUSAS`).
   */
  /** Solitarios: un movimiento útil para la vista del jugador, o `null` si no hay. */
  pista?(vista: V, acciones: readonly A[]): A | null;
  readonly simultaneo?: {
    esperaIA(vista: V, accion: A, g: Generador, nivel: NivelIA): number;
  };
}

export type IdJuego =
  | 'klondike'
  | 'brisca'
  | 'tute'
  | 'escoba'
  | 'chinchon'
  | 'guinote'
  | 'sieteYMedia'
  | 'freecell'
  | 'cinquillo'
  | 'pocha'
  | 'mus'
  | 'spider'
  | 'piramide'
  | 'golf'
  | 'tripeaks'
  | 'yukon'
  | 'canfield'
  | 'corazones'
  | 'burro'
  | 'pinacle'
  | 'butifarra'
  | 'truc'
  | 'julepe'
  | 'remigio'
  | 'tuteSubastado'
  | 'cuatrola'
  | 'mentiroso'
  | 'ochoLoco'
  | 'picas'
  | 'blackjack'
  | 'ginRummy'
  | 'rummy500'
  | 'holdem';

export const ID_JUEGOS: readonly IdJuego[] = [
  'klondike',
  'brisca',
  'tute',
  'escoba',
  'chinchon',
  'guinote',
  'sieteYMedia',
  'freecell',
  'cinquillo',
  'pocha',
  'mus',
  'spider',
  'piramide',
  'golf',
  'tripeaks',
  'yukon',
  'canfield',
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
];

export type DefKlondike = DefJuego<ConfigKlondike, EstadoKlondike, AccionKlondike, VistaKlondike>;
export type DefBrisca = DefJuego<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca>;
export type DefTute = DefJuego<ConfigTute, EstadoTute, AccionTute, VistaTute>;
export type DefEscoba = DefJuego<ConfigEscoba, EstadoEscoba, AccionEscoba, VistaEscoba>;
export type DefChinchon = DefJuego<ConfigChinchon, EstadoChinchon, AccionChinchon, VistaChinchon>;
export type DefGuinote = DefJuego<ConfigGuinote, EstadoGuinote, AccionGuinote, VistaGuinote>;
export type DefSieteYMedia = DefJuego<
  ConfigSieteYMedia,
  EstadoSieteYMedia,
  AccionSieteYMedia,
  VistaSieteYMedia
>;

export type DefFreeCell = DefJuego<ConfigFreeCell, EstadoFreeCell, AccionFreeCell, VistaFreeCell>;

export const DEF_FREECELL: DefFreeCell = {
  id: 'freecell',
  nombre: T.menu.freecell,
  juego: freecell,
  configPorDefecto: CONFIG_FREECELL_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaFreeCell,
};

export type DefSpider = DefJuego<ConfigSpider, EstadoSpider, AccionSpider, VistaSpider>;

export const DEF_SPIDER: DefSpider = {
  id: 'spider',
  nombre: T.menu.spider,
  juego: spider,
  configPorDefecto: CONFIG_SPIDER_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaSpider,
};

export type DefPiramide = DefJuego<ConfigPiramide, EstadoPiramide, AccionPiramide, VistaPiramide>;

export const DEF_PIRAMIDE: DefPiramide = {
  id: 'piramide',
  nombre: T.menu.piramide,
  juego: piramide,
  configPorDefecto: CONFIG_PIRAMIDE_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaPiramide,
};

export type DefGolf = DefJuego<ConfigGolf, EstadoGolf, AccionGolf, VistaGolf>;

export const DEF_GOLF: DefGolf = {
  id: 'golf',
  nombre: T.menu.golf,
  juego: golf,
  configPorDefecto: CONFIG_GOLF_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaGolf,
};

export type DefCanfield = DefJuego<ConfigCanfield, EstadoCanfield, AccionCanfield, VistaCanfield>;

export const DEF_CANFIELD: DefCanfield = {
  id: 'canfield',
  nombre: T.menu.canfield,
  juego: canfield,
  configPorDefecto: CONFIG_CANFIELD_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaCanfield,
};

export type DefYukon = DefJuego<ConfigYukon, EstadoYukon, AccionYukon, VistaYukon>;

export const DEF_YUKON: DefYukon = {
  id: 'yukon',
  nombre: T.menu.yukon,
  juego: yukon,
  configPorDefecto: CONFIG_YUKON_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaYukon,
};

export type DefTriPeaks = DefJuego<ConfigTriPeaks, EstadoTriPeaks, AccionTriPeaks, VistaTriPeaks>;

export const DEF_TRIPEAKS: DefTriPeaks = {
  id: 'tripeaks',
  nombre: T.menu.tripeaks,
  juego: tripeaks,
  configPorDefecto: CONFIG_TRIPEAKS_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaTriPeaks,
};

export const DEF_KLONDIKE: DefKlondike = {
  id: 'klondike',
  nombre: T.menu.klondike,
  juego: klondike,
  configPorDefecto: CONFIG_KLONDIKE_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
  pista: pistaKlondike,
};

/** Tiempo para ver la baza completa antes de recogerla. */
const PAUSA_BAZA_MS = 1100;
/** Tiempo para leer el resultado de una mano antes de repartir la siguiente. */
const PAUSA_MANO_MS = 2600;
/** Tiempo para leer un cante y ver sus cartas. */
const PAUSA_CANTE_MS = 1800;

interface VistaConBazas {
  readonly bazas: readonly number[];
  readonly resultadosManos: readonly unknown[];
}

/** Pausa común de los juegos de bazas: al cerrar una mano o una baza. */
function pausaBazas(antes: VistaConBazas, despues: VistaConBazas): number {
  if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_MANO_MS;
  const bazasAntes = antes.bazas.reduce((s, b) => s + b, 0);
  const bazasDespues = despues.bazas.reduce((s, b) => s + b, 0);
  return bazasDespues > bazasAntes ? PAUSA_BAZA_MS : 0;
}

export const DEF_BRISCA: DefBrisca = {
  id: 'brisca',
  nombre: T.menu.brisca,
  juego: brisca,
  configPorDefecto: CONFIG_BRISCA_POR_DEFECTO,
  ia: IAS.brisca,
  pausaTras: pausaBazas,
};

export const DEF_TUTE: DefTute = {
  id: 'tute',
  nombre: T.menu.tute,
  juego: tute,
  configPorDefecto: CONFIG_TUTE_POR_DEFECTO,
  ia: IAS.tute,
  pausaTras(antes, despues) {
    const cante = despues.cantes.length > antes.cantes.length ? PAUSA_CANTE_MS : 0;
    return Math.max(cante, pausaBazas(antes, despues));
  },
};

export const DEF_GUINOTE: DefGuinote = {
  id: 'guinote',
  nombre: T.menu.guinote,
  juego: guinote,
  configPorDefecto: CONFIG_GUINOTE_POR_DEFECTO,
  ia: IAS.guinote,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, la última baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    const cante = despues.cantes.length > antes.cantes.length ? PAUSA_CANTE_MS : 0;
    return Math.max(cante, pausaBazas(antes, despues));
  },
};

/** Tiempo para ver qué se jugó y qué se recogió; algo más si fue escoba. */
const PAUSA_JUGADA_MS = 900;
const PAUSA_ESCOBA_MS = 1600;

export const DEF_ESCOBA: DefEscoba = {
  id: 'escoba',
  nombre: T.menu.escoba,
  juego: escoba,
  configPorDefecto: CONFIG_ESCOBA_POR_DEFECTO,
  ia: IAS.escoba,
  // El cierre de la mano lo detiene la propia mesa con el panel de desglose.
  pausaTras(antes, despues) {
    const jugada = despues.ultimaJugada;
    if (jugada === null || jugada === antes.ultimaJugada) return 0;
    if (jugada.escoba) return PAUSA_ESCOBA_MS;
    return jugada.captura.length > 0 ? PAUSA_JUGADA_MS : 0;
  },
};

/** Tiempo para ver qué roba o descarta un rival. */
const PAUSA_RIVAL_MS = 600;

export const DEF_CHINCHON: DefChinchon = {
  id: 'chinchon',
  nombre: T.menu.chinchon,
  juego: chinchon,
  configPorDefecto: CONFIG_CHINCHON_POR_DEFECTO,
  ia: IAS.chinchon,
  // El cierre de la mano lo detiene la propia mesa con el panel de resultados.
  pausaTras(antes, despues) {
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_RIVAL_MS : 0;
  },
};

/** Tiempo para ver qué pide, si se planta o si se pasa cada jugador; algo más al pasarse. */
const PAUSA_SYM_MS = 700;
const PAUSA_PASADO_MS = 1300;

export const DEF_SIETE_Y_MEDIA: DefSieteYMedia = {
  id: 'sieteYMedia',
  nombre: T.menu.sieteYMedia,
  juego: sieteYMedia,
  configPorDefecto: CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
  ia: IAS.sieteYMedia,
  // El cierre de la mano lo detiene la propia mesa con el panel de resultado.
  pausaTras(antes, despues) {
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    if (accion.tipo === 'pedir' && accion.pasado) return PAUSA_PASADO_MS;
    return accion.asiento !== despues.asiento ? PAUSA_SYM_MS : 0;
  },
};

export type DefCinquillo = DefJuego<
  ConfigCinquillo,
  EstadoCinquillo,
  AccionCinquillo,
  VistaCinquillo
>;

/** Tiempo para ver qué juega o si pasa cada rival. */
const PAUSA_CINQUILLO_MS = 650;

export const DEF_CINQUILLO: DefCinquillo = {
  id: 'cinquillo',
  nombre: T.menu.cinquillo,
  juego: cinquillo,
  configPorDefecto: CONFIG_CINQUILLO_POR_DEFECTO,
  ia: IAS.cinquillo,
  // El cierre de la mano lo detiene la propia mesa con el panel de resultado.
  pausaTras(antes, despues) {
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_CINQUILLO_MS : 0;
  },
};

export type DefPocha = DefJuego<ConfigPocha, EstadoPocha, AccionPocha, VistaPocha>;

/** Tiempo para ver la apuesta de cada rival. */
const PAUSA_APUESTA_MS = 700;

export const DEF_POCHA: DefPocha = {
  id: 'pocha',
  nombre: T.menu.pocha,
  juego: pocha,
  configPorDefecto: CONFIG_POCHA_POR_DEFECTO,
  ia: IAS.pocha,
  // El cierre de la mano lo detiene la propia mesa con el resultado; aquí, la última baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    const apostador = despues.apuestas.findIndex(
      (a, i) => a !== null && antes.apuestas[i] === null,
    );
    if (apostador !== -1 && apostador !== despues.asiento) return PAUSA_APUESTA_MS;
    return pausaBazas(antes, despues);
  },
};

export type DefMus = DefJuego<ConfigMus, EstadoMus, AccionMus, VistaMus>;

/** Tiempo para leer lo que dice cada jugador de la IA. */
const PAUSA_MUS_MS = 900;

export const DEF_MUS: DefMus = {
  id: 'mus',
  nombre: T.menu.mus,
  juego: mus,
  configPorDefecto: CONFIG_MUS_POR_DEFECTO,
  ia: IAS.mus,
  // El cierre de la mano lo detiene la propia mesa con el panel de conteo.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return 0;
    const accion = despues.ultimaAccion;
    if (accion === null || JSON.stringify(accion) === JSON.stringify(antes.ultimaAccion)) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_MUS_MS : 0;
  },
};

export type DefCorazones = DefJuego<
  ConfigCorazones,
  EstadoCorazones,
  AccionCorazones,
  VistaCorazones
>;

export const DEF_CORAZONES: DefCorazones = {
  id: 'corazones',
  nombre: T.menu.corazones,
  juego: corazones,
  configPorDefecto: CONFIG_CORAZONES_POR_DEFECTO,
  ia: IAS.corazones,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, cada baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    return despues.bazasJugadas > antes.bazasJugadas ? PAUSA_BAZA_MS : 0;
  },
};

export type DefBurro = DefJuego<ConfigBurro, EstadoBurro, AccionBurro, VistaBurro>;

/** Pausa tras cada intercambio del Burro, para ver llegar la carta recibida. */
const PAUSA_INTERCAMBIO_MS = 450;
/** Pausa al terminar una mano del Burro, mientras la mesa abre el resumen. */
const PAUSA_FIN_MANO_BURRO_MS = 600;

export const DEF_BURRO: DefBurro = {
  id: 'burro',
  nombre: T.menu.burro,
  juego: burro,
  configPorDefecto: CONFIG_BURRO_POR_DEFECTO,
  ia: IAS.burro,
  pausaTras(antes, despues) {
    if (despues.numeroMano > antes.numeroMano) return PAUSA_FIN_MANO_BURRO_MS;
    return despues.intercambios > antes.intercambios ? PAUSA_INTERCAMBIO_MS : 0;
  },
  // Pasar es rápido; plantarse lleva el tiempo de darse cuenta, como una persona, y depende
  // del nivel (spec mesa-cliente).
  simultaneo: { esperaIA: retrasoBurro },
};

export type DefPinacle = DefJuego<ConfigPinacle, EstadoPinacle, AccionPinacle, VistaPinacle>;

/** Tiempo para ver qué roba, baja o descarta un rival. */
const PAUSA_PINACLE_MS = 650;

export const DEF_PINACLE: DefPinacle = {
  id: 'pinacle',
  nombre: T.menu.pinacle,
  juego: pinacle,
  configPorDefecto: CONFIG_PINACLE_POR_DEFECTO,
  ia: IAS.pinacle,
  // El cierre de la mano lo detiene la propia mesa con el resumen.
  pausaTras(antes, despues) {
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    if (despues.numeroMano > antes.numeroMano) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_PINACLE_MS : 0;
  },
};

export type DefButifarra = DefJuego<
  ConfigButifarra,
  EstadoButifarra,
  AccionButifarra,
  VistaButifarra
>;

/** Tiempo para leer lo que elige o dice cada jugador de la IA antes de jugar. */
const PAUSA_DECISION_BUTIFARRA_MS = 1000;

export const DEF_BUTIFARRA: DefButifarra = {
  id: 'butifarra',
  nombre: T.menu.butifarra,
  juego: butifarra,
  configPorDefecto: CONFIG_BUTIFARRA_POR_DEFECTO,
  ia: IAS.butifarra,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, la última baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    if (antes.fase !== 'jugar' && antes.turno !== despues.asiento) {
      return PAUSA_DECISION_BUTIFARRA_MS;
    }
    return pausaBazas(antes, despues);
  },
};

export type DefTruc = DefJuego<ConfigTruc, EstadoTruc, AccionTruc, VistaTruc>;

/** Tiempo para leer lo que apuesta o responde cada jugador de la IA. */
const PAUSA_APUESTA_TRUC_MS = 1000;

export const DEF_TRUC: DefTruc = {
  id: 'truc',
  nombre: T.menu.truc,
  juego: truc,
  configPorDefecto: CONFIG_TRUC_POR_DEFECTO,
  ia: IAS.truc,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, la última baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    const apuesta =
      antes.envit.estado !== despues.envit.estado ||
      antes.envit.nivel !== despues.envit.nivel ||
      antes.truc.nivel !== despues.truc.nivel ||
      antes.truc.pendiente !== despues.truc.pendiente;
    if (apuesta && antes.turno !== despues.asiento) return PAUSA_APUESTA_TRUC_MS;
    if (despues.bazasJugadas.length > antes.bazasJugadas.length) return PAUSA_BAZA_MS;
    return 0;
  },
};

export type DefJulepe = DefJuego<ConfigJulepe, EstadoJulepe, AccionJulepe, VistaJulepe>;

/** Tiempo para leer lo que decide o descarta cada jugador de la IA. */
const PAUSA_DECISION_JULEPE_MS = 800;

export const DEF_JULEPE: DefJulepe = {
  id: 'julepe',
  nombre: T.menu.julepe,
  juego: julepe,
  configPorDefecto: CONFIG_JULEPE_POR_DEFECTO,
  ia: IAS.julepe,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, la última baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    if (antes.fase !== 'jugar' && antes.turno !== despues.asiento) return PAUSA_DECISION_JULEPE_MS;
    return pausaBazas(antes, despues);
  },
};

export type DefRemigio = DefJuego<ConfigRemigio, EstadoRemigio, AccionRemigio, VistaRemigio>;

/** Tiempo para ver qué roba, baja o descarta un rival. */
const PAUSA_REMIGIO_MS = 650;

export const DEF_REMIGIO: DefRemigio = {
  id: 'remigio',
  nombre: T.menu.remigio,
  juego: remigio,
  configPorDefecto: CONFIG_REMIGIO_POR_DEFECTO,
  ia: IAS.remigio,
  // El cierre de la mano lo detiene la propia mesa con el resumen.
  pausaTras(antes, despues) {
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    if (despues.resultadosManos.length > antes.resultadosManos.length) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_REMIGIO_MS : 0;
  },
};

export type DefTuteSubastado = DefJuego<
  ConfigTuteSubastado,
  EstadoTuteSubastado,
  AccionTuteSubastado,
  VistaTuteSubastado
>;

/** Tiempo para leer lo que puja o elige cada jugador de la IA. */
const PAUSA_SUBASTA_MS = 800;

export const DEF_TUTE_SUBASTADO: DefTuteSubastado = {
  id: 'tuteSubastado',
  nombre: T.menu.tuteSubastado,
  juego: tuteSubastado,
  configPorDefecto: CONFIG_TUTE_SUBASTADO_POR_DEFECTO,
  ia: IAS.tuteSubastado,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, la última baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    if (antes.fase !== 'bazas' && antes.turno !== despues.asiento) return PAUSA_SUBASTA_MS;
    const cante = despues.cantes.length > antes.cantes.length ? PAUSA_CANTE_MS : 0;
    return Math.max(cante, pausaBazas(antes, despues));
  },
};

export type DefCuatrola = DefJuego<ConfigCuatrola, EstadoCuatrola, AccionCuatrola, VistaCuatrola>;

export const DEF_CUATROLA: DefCuatrola = {
  id: 'cuatrola',
  nombre: T.menu.cuatrola,
  juego: cuatrola,
  configPorDefecto: CONFIG_CUATROLA_POR_DEFECTO,
  ia: IAS.cuatrola,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, la última baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    if (antes.fase !== 'bazas' && antes.turno !== despues.asiento) return PAUSA_SUBASTA_MS;
    // Al descubrirse el compañero, un momento para leerlo.
    if (antes.companero === null && despues.companero !== null) return PAUSA_CANTE_MS;
    return pausaBazas(antes, despues);
  },
};

export type DefMentiroso = DefJuego<
  ConfigMentiroso,
  EstadoMentiroso,
  AccionMentiroso,
  VistaMentiroso
>;

/** Tiempo para ver una bajada de la IA, y para leer lo descubierto en un «¡Mentiroso!». */
const PAUSA_BAJADA_MS = 700;
const PAUSA_REVELACION_MS = 1800;

export const DEF_MENTIROSO: DefMentiroso = {
  id: 'mentiroso',
  nombre: T.menu.mentiroso,
  juego: mentiroso,
  configPorDefecto: CONFIG_MENTIROSO_POR_DEFECTO,
  ia: IAS.mentiroso,
  // Marcar cartas no se pausa: solo bajar y desconfiar.
  pausaTras(antes, despues) {
    if (despues.revelaciones.length > antes.revelaciones.length) return PAUSA_REVELACION_MS;
    if (despues.bajadas.length > antes.bajadas.length) return PAUSA_BAJADA_MS;
    return 0;
  },
};

export type DefOchoLoco = DefJuego<ConfigOchoLoco, EstadoOchoLoco, AccionOchoLoco, VistaOchoLoco>;

/** Tiempo para ver la carta que juega la IA, y para ver que roba o pasa. */
const PAUSA_CARTA_OCHO_MS = 600;
const PAUSA_ROBAR_OCHO_MS = 400;

export const DEF_OCHO_LOCO: DefOchoLoco = {
  id: 'ochoLoco',
  nombre: T.menu.ochoLoco,
  juego: ochoLoco,
  configPorDefecto: CONFIG_OCHO_LOCO_POR_DEFECTO,
  ia: IAS.ochoLoco,
  // El cierre de la mano lo detiene la propia mesa con el resumen.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_CARTA_OCHO_MS;
    if (despues.descarte.length > antes.descarte.length) return PAUSA_CARTA_OCHO_MS;
    const cambia = despues.ultimas.some(
      (u, a) => JSON.stringify(u) !== JSON.stringify(antes.ultimas[a]),
    );
    return cambia ? PAUSA_ROBAR_OCHO_MS : 0;
  },
};

export type DefPicas = DefJuego<ConfigPicas, EstadoPicas, AccionPicas, VistaPicas>;

export const DEF_PICAS: DefPicas = {
  id: 'picas',
  nombre: T.menu.picas,
  juego: picas,
  configPorDefecto: CONFIG_PICAS_POR_DEFECTO,
  ia: IAS.picas,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, cada baza y apuesta.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    if (antes.fase === 'apuesta' && antes.turno !== despues.asiento) return PAUSA_SUBASTA_MS;
    return pausaBazas(antes, despues);
  },
};

export type DefBlackjack = DefJuego<
  ConfigBlackjack,
  EstadoBlackjack,
  AccionBlackjack,
  VistaBlackjack
>;

/** Tiempo para ver cada carta o apuesta de la IA en el Blackjack. */
const PAUSA_BLACKJACK_MS = 600;

const cartasEnMesa = (v: VistaBlackjack) =>
  v.manos.reduce((s, ms) => s + ms.reduce((t, m) => t + m.cartas.length, 0), 0);

export const DEF_BLACKJACK: DefBlackjack = {
  id: 'blackjack',
  nombre: T.menu.blackjack,
  juego: blackjack,
  configPorDefecto: CONFIG_BLACKJACK_POR_DEFECTO,
  ia: IAS.blackjack,
  // El cierre de la mano lo detiene la propia mesa con el resumen.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return 0;
    if (antes.turno === despues.asiento) return 0;
    const apuesta = despues.apuestas.filter((a) => a !== null).length;
    if (apuesta > antes.apuestas.filter((a) => a !== null).length) return PAUSA_BLACKJACK_MS;
    return cartasEnMesa(despues) > cartasEnMesa(antes) ? PAUSA_BLACKJACK_MS : 0;
  },
};

export type DefGinRummy = DefJuego<ConfigGinRummy, EstadoGinRummy, AccionGinRummy, VistaGinRummy>;

export const DEF_GIN_RUMMY: DefGinRummy = {
  id: 'ginRummy',
  nombre: T.menu.ginRummy,
  juego: ginRummy,
  configPorDefecto: CONFIG_GIN_RUMMY_POR_DEFECTO,
  ia: IAS.ginRummy,
  // Como en el Chinchón: el cierre de la mano lo detiene la propia mesa con el resumen.
  pausaTras(antes, despues) {
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_RIVAL_MS : 0;
  },
};

export type DefRummy500 = DefJuego<ConfigRummy500, EstadoRummy500, AccionRummy500, VistaRummy500>;

export const DEF_RUMMY_500: DefRummy500 = {
  id: 'rummy500',
  nombre: T.menu.rummy500,
  juego: rummy500,
  configPorDefecto: CONFIG_RUMMY_500_POR_DEFECTO,
  ia: IAS.rummy500,
  // Como en el Remigio: el cierre de la mano lo detiene la propia mesa con el resumen.
  pausaTras(antes, despues) {
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_RIVAL_MS : 0;
  },
};

export type DefHoldem = DefJuego<ConfigHoldem, EstadoHoldem, AccionHoldem, VistaHoldem>;

/** Tiempo para ver cada acción de la IA en el Texas Hold'em. */
const PAUSA_HOLDEM_MS = 700;

export const DEF_HOLDEM: DefHoldem = {
  id: 'holdem',
  nombre: T.menu.holdem,
  juego: holdem,
  configPorDefecto: CONFIG_HOLDEM_POR_DEFECTO,
  ia: IAS.holdem,
  // El cierre de la mano lo detiene la propia mesa con el resumen.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return 0;
    const accion = despues.ultimaAccion;
    if (accion === null || accion === antes.ultimaAccion) return 0;
    return accion.asiento !== despues.asiento ? PAUSA_HOLDEM_MS : 0;
  },
};

export const JUEGOS = {
  klondike: DEF_KLONDIKE,
  brisca: DEF_BRISCA,
  tute: DEF_TUTE,
  escoba: DEF_ESCOBA,
  chinchon: DEF_CHINCHON,
  guinote: DEF_GUINOTE,
  sieteYMedia: DEF_SIETE_Y_MEDIA,
  freecell: DEF_FREECELL,
  cinquillo: DEF_CINQUILLO,
  pocha: DEF_POCHA,
  mus: DEF_MUS,
  spider: DEF_SPIDER,
  piramide: DEF_PIRAMIDE,
  golf: DEF_GOLF,
  tripeaks: DEF_TRIPEAKS,
  yukon: DEF_YUKON,
  canfield: DEF_CANFIELD,
  corazones: DEF_CORAZONES,
  burro: DEF_BURRO,
  pinacle: DEF_PINACLE,
  butifarra: DEF_BUTIFARRA,
  truc: DEF_TRUC,
  julepe: DEF_JULEPE,
  remigio: DEF_REMIGIO,
  tuteSubastado: DEF_TUTE_SUBASTADO,
  cuatrola: DEF_CUATROLA,
  mentiroso: DEF_MENTIROSO,
  ochoLoco: DEF_OCHO_LOCO,
  picas: DEF_PICAS,
  blackjack: DEF_BLACKJACK,
  ginRummy: DEF_GIN_RUMMY,
  rummy500: DEF_RUMMY_500,
  holdem: DEF_HOLDEM,
} as const;

/** Semilla nueva para una partida; el cliente sí puede usar azar del sistema. */
export function semillaNueva(): string {
  if (SEMILLA_FIJA !== null) return SEMILLA_FIJA;
  const n = crypto.getRandomValues(new Uint32Array(2));
  return Array.from(n, (x) => x.toString(16).padStart(8, '0')).join('');
}
