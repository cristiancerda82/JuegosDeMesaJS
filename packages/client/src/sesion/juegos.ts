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
  CONFIG_ESCOBA_POR_DEFECTO,
  CONFIG_TUTE_POR_DEFECTO,
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
  'klondike' | 'brisca' | 'tute' | 'escoba' | 'chinchon' | 'guinote' | 'sieteYMedia';

export const ID_JUEGOS: readonly IdJuego[] = [
  'klondike',
  'brisca',
  'tute',
  'escoba',
  'chinchon',
  'guinote',
  'sieteYMedia',
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

export const JUEGOS = {
  klondike: DEF_KLONDIKE,
  brisca: DEF_BRISCA,
  tute: DEF_TUTE,
  escoba: DEF_ESCOBA,
  chinchon: DEF_CHINCHON,
  guinote: DEF_GUINOTE,
  sieteYMedia: DEF_SIETE_Y_MEDIA,
} as const;

/** Semilla nueva para una partida; el cliente sí puede usar azar del sistema. */
export function semillaNueva(): string {
  if (SEMILLA_FIJA !== null) return SEMILLA_FIJA;
  const n = crypto.getRandomValues(new Uint32Array(2));
  return Array.from(n, (x) => x.toString(16).padStart(8, '0')).join('');
}
