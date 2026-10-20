import {
  brisca,
  burro,
  butifarra,
  CONFIG_BUTIFARRA_POR_DEFECTO,
  CONFIG_TRUC_POR_DEFECTO,
  truc,
  CONFIG_JULEPE_POR_DEFECTO,
  julepe,
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
  | 'corazones'
  | 'burro'
  | 'pinacle'
  | 'butifarra'
  | 'truc'
  | 'julepe';

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
  'corazones',
  'burro',
  'pinacle',
  'butifarra',
  'truc',
  'julepe',
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
  corazones: DEF_CORAZONES,
  burro: DEF_BURRO,
  pinacle: DEF_PINACLE,
  butifarra: DEF_BUTIFARRA,
  truc: DEF_TRUC,
  julepe: DEF_JULEPE,
} as const;

/** Semilla nueva para una partida; el cliente sí puede usar azar del sistema. */
export function semillaNueva(): string {
  if (SEMILLA_FIJA !== null) return SEMILLA_FIJA;
  const n = crypto.getRandomValues(new Uint32Array(2));
  return Array.from(n, (x) => x.toString(16).padStart(8, '0')).join('');
}
