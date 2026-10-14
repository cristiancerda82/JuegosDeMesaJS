import {
  brisca,
  chinchon,
  CONFIG_CHINCHON_POR_DEFECTO,
  iaChinchonBasica,
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
  iaCinquilloBasica,
  type AccionCinquillo,
  type ConfigCinquillo,
  type EstadoCinquillo,
  type VistaCinquillo,
  CONFIG_CORAZONES_POR_DEFECTO,
  corazones,
  iaCorazonesBasica,
  type AccionCorazones,
  type ConfigCorazones,
  type EstadoCorazones,
  type VistaCorazones,
  CONFIG_MUS_POR_DEFECTO,
  iaMusBasica,
  mus,
  type AccionMus,
  type ConfigMus,
  type EstadoMus,
  type VistaMus,
  CONFIG_POCHA_POR_DEFECTO,
  iaPochaBasica,
  pocha,
  type AccionPocha,
  type ConfigPocha,
  type EstadoPocha,
  type VistaPocha,
  CONFIG_SIETE_Y_MEDIA_POR_DEFECTO,
  iaSieteYMediaBasica,
  sieteYMedia,
  type AccionSieteYMedia,
  type ConfigSieteYMedia,
  type EstadoSieteYMedia,
  type VistaSieteYMedia,
  CONFIG_GUINOTE_POR_DEFECTO,
  guinote,
  iaGuinoteBasica,
  type AccionGuinote,
  type ConfigGuinote,
  type EstadoGuinote,
  type VistaGuinote,
  iaBriscaBasica,
  iaEscobaBasica,
  iaTuteBasica,
  klondike,
  tute,
  escoba,
  type AccionBrisca,
  type AccionKlondike,
  type AccionEscoba,
  type AccionTute,
  type Agente,
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
  /** Agente para los asientos que no ocupa el humano; `null` en los solitarios. */
  readonly ia: Agente<V, A> | null;
  /**
   * Pausa en milisegundos tras un cambio de la vista del humano, para que pueda seguirlo
   * (p. ej. ver la baza completa antes de que se recoja). Durante la pausa no se juega.
   */
  pausaTras(antes: V, despues: V): number;
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
  | 'corazones';

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
};

export type DefSpider = DefJuego<ConfigSpider, EstadoSpider, AccionSpider, VistaSpider>;

export const DEF_SPIDER: DefSpider = {
  id: 'spider',
  nombre: T.menu.spider,
  juego: spider,
  configPorDefecto: CONFIG_SPIDER_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
};

export const DEF_KLONDIKE: DefKlondike = {
  id: 'klondike',
  nombre: T.menu.klondike,
  juego: klondike,
  configPorDefecto: CONFIG_KLONDIKE_POR_DEFECTO,
  ia: null,
  pausaTras: () => 0,
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
  ia: iaBriscaBasica,
  pausaTras: pausaBazas,
};

export const DEF_TUTE: DefTute = {
  id: 'tute',
  nombre: T.menu.tute,
  juego: tute,
  configPorDefecto: CONFIG_TUTE_POR_DEFECTO,
  ia: iaTuteBasica,
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
  ia: iaGuinoteBasica,
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
  ia: iaEscobaBasica,
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
  ia: iaChinchonBasica,
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
  ia: iaSieteYMediaBasica,
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
  ia: iaCinquilloBasica,
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
  ia: iaPochaBasica,
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
  ia: iaMusBasica,
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
  ia: iaCorazonesBasica,
  // El cierre de la mano lo detiene la propia mesa con el resumen; aquí, cada baza.
  pausaTras(antes, despues) {
    if (despues.resultadosManos.length > antes.resultadosManos.length) return PAUSA_BAZA_MS;
    return despues.bazasJugadas > antes.bazasJugadas ? PAUSA_BAZA_MS : 0;
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
} as const;

/** Semilla nueva para una partida; el cliente sí puede usar azar del sistema. */
export function semillaNueva(): string {
  if (SEMILLA_FIJA !== null) return SEMILLA_FIJA;
  const n = crypto.getRandomValues(new Uint32Array(2));
  return Array.from(n, (x) => x.toString(16).padStart(8, '0')).join('');
}
