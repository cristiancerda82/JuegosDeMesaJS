import type { IdCarta } from '@juegos/engine';
import type { IdJuego } from '../sesion/juegos';
import { T } from '../textos';

/**
 * Lo que el menú sabe de cada juego (spec menu-juegos; design, decisión 1): su familia, la
 * baraja con la que se juega, la descripción y las tres cartas del abanico. Al ser un
 * `Record<IdJuego, …>`, un juego nuevo sin clasificar no compila.
 */

export type IdFamilia =
  | 'solitarios'
  | 'bazasPuntos'
  | 'bazasContrato'
  | 'bazasEvitar'
  | 'combinaciones'
  | 'captura'
  | 'descarte'
  | 'envite';

export type Baraja = 'espanola' | 'francesa';

export interface Familia {
  readonly id: IdFamilia;
  readonly nombre: string;
}

export interface EntradaCatalogo {
  readonly familia: IdFamilia;
  /** Barajas con las que se juega; el Tarot cuenta como francesa. */
  readonly barajas: readonly Baraja[];
  readonly desc: string;
  readonly cartas: readonly [IdCarta, IdCarta, IdCarta];
}

export const FAMILIAS: readonly Familia[] = (
  [
    'solitarios',
    'bazasPuntos',
    'bazasContrato',
    'bazasEvitar',
    'combinaciones',
    'captura',
    'descarte',
    'envite',
  ] as const
).map((id) => ({ id, nombre: T.menu.familias[id] }));

const E: readonly Baraja[] = ['espanola'];
const F: readonly Baraja[] = ['francesa'];

const entrada = (
  familia: IdFamilia,
  barajas: readonly Baraja[],
  desc: string,
  cartas: readonly [IdCarta, IdCarta, IdCarta],
): EntradaCatalogo => ({ familia, barajas, desc, cartas });

// El orden de las claves es el orden de los juegos dentro de cada familia.
export const CATALOGO: Readonly<Record<IdJuego, EntradaCatalogo>> = {
  // ── Solitarios ──
  klondike: entrada('solitarios', F, T.menu.klondikeDesc, [
    'picas-1',
    'corazones-13',
    'diamantes-12',
  ]),
  freecell: entrada('solitarios', F, T.menu.freecellDesc, [
    'treboles-1',
    'corazones-2',
    'picas-13',
  ]),
  spider: entrada('solitarios', F, T.menu.spiderDesc, ['picas-13', 'picas-12', 'picas-11']),
  belleLucie: entrada('solitarios', F, T.menu.belleLucieDesc, [
    'corazones-1',
    'corazones-2',
    'corazones-3',
  ]),
  scorpion: entrada('solitarios', F, T.menu.scorpionDesc, ['picas-13', 'corazones-2', 'picas-12']),
  cuarentaLadrones: entrada('solitarios', F, T.menu.cuarentaLadronesDesc, [
    'picas-7',
    'picas-6',
    'picas-5',
  ]),
  canfield: entrada('solitarios', F, T.menu.canfieldDesc, ['picas-9', 'corazones-8', 'treboles-7']),
  yukon: entrada('solitarios', F, T.menu.yukonDesc, ['treboles-13', 'corazones-4', 'picas-9']),
  tripeaks: entrada('solitarios', F, T.menu.tripeaksDesc, [
    'corazones-9',
    'picas-10',
    'diamantes-11',
  ]),
  golf: entrada('solitarios', F, T.menu.golfDesc, ['treboles-7', 'corazones-8', 'picas-9']),
  piramide: entrada('solitarios', F, T.menu.piramideDesc, [
    'corazones-6',
    'picas-7',
    'diamantes-13',
  ]),

  // ── Bazas por puntos ──
  brisca: entrada('bazasPuntos', E, T.menu.briscaDesc, ['oros-1', 'copas-3', 'espadas-12']),
  tute: entrada('bazasPuntos', E, T.menu.tuteDesc, ['bastos-12', 'oros-11', 'copas-12']),
  guinote: entrada('bazasPuntos', E, T.menu.guinoteDesc, ['espadas-12', 'espadas-10', 'oros-7']),
  tressette: entrada('bazasPuntos', E, T.menu.tressetteDesc, ['oros-3', 'oros-2', 'oros-1']),
  schnapsen: entrada('bazasPuntos', F, T.menu.schnapsenDesc, [
    'corazones-13',
    'corazones-12',
    'corazones-1',
  ]),
  sixtySix: entrada('bazasPuntos', F, T.menu.sixtySixDesc, ['picas-9', 'picas-13', 'picas-12']),
  belote: entrada('bazasPuntos', F, T.menu.beloteDesc, [
    'corazones-11',
    'corazones-9',
    'corazones-13',
  ]),
  klaverjas: entrada('bazasPuntos', F, T.menu.klaverjasDesc, [
    'picas-11',
    'picas-9',
    'corazones-10',
  ]),
  jass: entrada('bazasPuntos', F, T.menu.jassDesc, ['treboles-11', 'treboles-9', 'treboles-1']),
  sueca: entrada('bazasPuntos', F, T.menu.suecaDesc, ['picas-1', 'picas-7', 'corazones-13']),
  bezique: entrada('bazasPuntos', F, T.menu.beziqueDesc, [
    'picas-12',
    'diamantes-11',
    'corazones-1',
  ]),
  skat: entrada('bazasPuntos', F, T.menu.skatDesc, ['treboles-11', 'picas-11', 'corazones-1']),
  doppelkopf: entrada('bazasPuntos', F, T.menu.doppelkopfDesc, [
    'treboles-12',
    'corazones-10',
    'diamantes-1',
  ]),
  schafkopf: entrada('bazasPuntos', F, T.menu.schafkopfDesc, [
    'treboles-12',
    'picas-12',
    'corazones-1',
  ]),
  sheepshead: entrada('bazasPuntos', F, T.menu.sheepsheadDesc, [
    'treboles-12',
    'diamantes-11',
    'diamantes-1',
  ]),
  tysiacha: entrada('bazasPuntos', F, T.menu.tysiachaDesc, [
    'corazones-12',
    'corazones-13',
    'corazones-1',
  ]),
  piquet: entrada('bazasPuntos', F, T.menu.piquetDesc, [
    'corazones-1',
    'corazones-13',
    'corazones-12',
  ]),
  ecarte: entrada('bazasPuntos', F, T.menu.ecarteDesc, [
    'corazones-13',
    'corazones-12',
    'picas-11',
  ]),
  butifarra: entrada('bazasPuntos', E, T.menu.butifarraDesc, ['oros-9', 'oros-1', 'copas-9']),

  // ── Bazas con contrato o subasta ──
  bridge: entrada('bazasContrato', F, T.menu.bridgeDesc, [
    'picas-1',
    'corazones-13',
    'treboles-12',
  ]),
  whist: entrada('bazasContrato', F, T.menu.whistDesc, ['picas-1', 'corazones-13', 'treboles-12']),
  picas: entrada('bazasContrato', F, T.menu.picasDesc, ['picas-1', 'picas-13', 'corazones-1']),
  ohHell: entrada('bazasContrato', F, T.menu.ohHellDesc, [
    'picas-1',
    'corazones-13',
    'diamantes-2',
  ]),
  pocha: entrada('bazasContrato', E, T.menu.pochaDesc, ['copas-1', 'oros-3', 'bastos-12']),
  fiveHundred: entrada('bazasContrato', F, T.menu.fiveHundredDesc, [
    'comodin-1',
    'corazones-11',
    'diamantes-11',
  ]),
  tresillo: entrada('bazasContrato', E, T.menu.tresilloDesc, ['espadas-1', 'oros-7', 'bastos-1']),
  preference: entrada('bazasContrato', F, T.menu.preferenceDesc, [
    'corazones-1',
    'corazones-13',
    'picas-1',
  ]),
  tuteSubastado: entrada('bazasContrato', E, T.menu.tuteSubastadoDesc, [
    'oros-1',
    'oros-12',
    'oros-11',
  ]),
  cuatrola: entrada('bazasContrato', E, T.menu.cuatrolaDesc, ['espadas-1', 'oros-7', 'bastos-1']),
  julepe: entrada('bazasContrato', E, T.menu.julepeDesc, ['copas-1', 'copas-3', 'oros-12']),
  euchre: entrada('bazasContrato', F, T.menu.euchreDesc, [
    'corazones-11',
    'diamantes-11',
    'corazones-1',
  ]),
  bourre: entrada('bazasContrato', F, T.menu.bourreDesc, [
    'diamantes-1',
    'diamantes-13',
    'picas-1',
  ]),
  tarot: entrada('bazasContrato', F, T.menu.tarotDesc, ['triunfo-21', 'excusa', 'picas-14']),

  // ── Bazas para evitar ──
  corazones: entrada('bazasEvitar', F, T.menu.corazonesDesc, [
    'corazones-1',
    'picas-12',
    'treboles-2',
  ]),
  barbu: entrada('bazasEvitar', F, T.menu.barbuDesc, ['corazones-13', 'picas-12', 'treboles-11']),
  rentz: entrada('bazasEvitar', F, T.menu.rentzDesc, ['corazones-13', 'picas-12', 'treboles-11']),

  // ── Combinaciones ──
  chinchon: entrada('combinaciones', E, T.menu.chinchonDesc, ['copas-5', 'copas-6', 'comodin-1']),
  remigio: entrada('combinaciones', E, T.menu.remigioDesc, ['copas-5', 'copas-6', 'comodin-1']),
  ginRummy: entrada('combinaciones', F, T.menu.ginRummyDesc, ['picas-5', 'picas-6', 'picas-7']),
  rummy500: entrada('combinaciones', F, T.menu.rummy500Desc, [
    'diamantes-4',
    'diamantes-5',
    'diamantes-6',
  ]),
  canasta: entrada('combinaciones', F, T.menu.canastaDesc, ['comodin-1', 'corazones-3', 'picas-1']),
  conquian: entrada('combinaciones', E, T.menu.conquianDesc, ['copas-6', 'copas-7', 'copas-10']),
  pinacle: entrada('combinaciones', F, T.menu.pinacleDesc, [
    'corazones-13',
    'corazones-12',
    'comodin-1',
  ]),
  cribbage: entrada('combinaciones', F, T.menu.cribbageDesc, [
    'treboles-5',
    'corazones-5',
    'picas-11',
  ]),

  // ── Captura ──
  escoba: entrada('captura', E, T.menu.escobaDesc, ['oros-7', 'copas-11', 'espadas-6']),
  scopa: entrada('captura', E, T.menu.scopaDesc, ['oros-7', 'copas-7', 'bastos-1']),
  casino: entrada('captura', F, T.menu.casinoDesc, ['diamantes-10', 'picas-2', 'corazones-1']),
  cuarenta: entrada('captura', F, T.menu.cuarentaDesc, ['corazones-5', 'picas-5', 'diamantes-6']),
  pishti: entrada('captura', F, T.menu.pishtiDesc, ['treboles-11', 'diamantes-10', 'treboles-2']),
  pesca: entrada('captura', F, T.menu.pescaDesc, ['corazones-7', 'picas-7', 'treboles-7']),

  // ── Descarte ──
  ochoLoco: entrada('descarte', F, T.menu.ochoLocoDesc, ['picas-8', 'corazones-8', 'corazones-4']),
  culo: entrada('descarte', E, T.menu.culoDesc, ['oros-2', 'copas-1', 'espadas-3']),
  bigTwo: entrada('descarte', F, T.menu.bigTwoDesc, ['picas-2', 'corazones-2', 'diamantes-3']),
  durak: entrada('descarte', F, T.menu.durakDesc, ['picas-6', 'picas-1', 'corazones-13']),
  cinquillo: entrada('descarte', E, T.menu.cinquilloDesc, ['oros-5', 'oros-6', 'copas-5']),
  sevens: entrada('descarte', F, T.menu.sevensDesc, ['diamantes-7', 'diamantes-8', 'diamantes-6']),
  mentiroso: entrada('descarte', F, T.menu.mentirosoDesc, [
    'picas-13',
    'corazones-13',
    'treboles-5',
  ]),
  burro: entrada('descarte', E, T.menu.burroDesc, ['oros-12', 'copas-12', 'espadas-12']),
  kingsCorner: entrada('descarte', F, T.menu.kingsCornerDesc, [
    'picas-13',
    'corazones-12',
    'treboles-11',
  ]),
  spiteMalice: entrada('descarte', F, T.menu.spiteMaliceDesc, [
    'picas-1',
    'corazones-2',
    'treboles-13',
  ]),

  // ── Envite y apuestas ──
  mus: entrada('envite', E, T.menu.musDesc, ['oros-12', 'copas-3', 'espadas-1']),
  truco: entrada('envite', E, T.menu.trucoDesc, ['espadas-1', 'espadas-7', 'oros-7']),
  truc: entrada('envite', E, T.menu.trucDesc, ['espadas-1', 'bastos-1', 'oros-7']),
  holdem: entrada('envite', F, T.menu.holdemDesc, ['picas-1', 'corazones-1', 'diamantes-13']),
  blackjack: entrada('envite', F, T.menu.blackjackDesc, ['picas-1', 'corazones-13', 'treboles-10']),
  sieteYMedia: entrada('envite', E, T.menu.sieteYMediaDesc, ['oros-7', 'bastos-12', 'copas-1']),
  treintaYUno: entrada('envite', F, T.menu.treintaYUnoDesc, [
    'treboles-1',
    'treboles-13',
    'treboles-10',
  ]),
};

/** Juegos de una familia, en el orden del catálogo. */
export function juegosDeFamilia(familia: IdFamilia): IdJuego[] {
  return (Object.keys(CATALOGO) as IdJuego[]).filter((id) => CATALOGO[id].familia === familia);
}

/** Todos los juegos en el orden del menú: por familias y, dentro, en el orden del catálogo. */
export function juegosEnOrden(): IdJuego[] {
  return FAMILIAS.flatMap((f) => juegosDeFamilia(f.id));
}

/** ¿Se juega `id` con la baraja del filtro? `'todas'` deja pasar cualquier juego. */
export function pasaFiltro(id: IdJuego, filtro: Baraja | 'todas'): boolean {
  return filtro === 'todas' || CATALOGO[id].barajas.includes(filtro);
}

/** Texto sin mayúsculas ni tildes, para buscar «guinote» y encontrar «Guiñote». */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
