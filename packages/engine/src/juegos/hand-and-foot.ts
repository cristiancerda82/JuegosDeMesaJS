import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { PALOS_FRANCESES } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  compararCanasta,
  esComodinCanasta,
  esDosCanasta,
  esJokerCanasta,
  esNaturalCanasta,
  esTresRojo,
  puntosCanasta,
  valorCanasta,
} from './canasta';
import { basePinacle, type CartaPinacle } from './pinacle-combinaciones';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Carta del Hand and Foot: las de la Canasta con 5 copias, p. ej. "picas-12#4". */
export type CartaHandAndFoot = CartaPinacle;

/** 4 jugadores en parejas (0 y 2 contra 1 y 3); las rondas van en la config para las pruebas. */
export interface ConfigHandAndFoot {
  readonly rondas: number;
}

export const CONFIG_HAND_AND_FOOT_POR_DEFECTO: ConfigHandAndFoot = { rondas: 4 };

export const BARAJAS_HAND_AND_FOOT = 5;
export const CARTAS_MANO_HAND_AND_FOOT = 11;
/** Cartas de un libro; una combinación no admite más. */
export const TAMANO_LIBRO = 7;
export const MAXIMO_COMODINES_HAND_AND_FOOT = 3;
/** Cartas que van a la mano al coger el descarte, además de la de arriba. */
export const CARTAS_DEL_DESCARTE = 6;
export const PREMIO_LIBRO_LIMPIO = 500;
export const PREMIO_LIBRO_SUCIO = 300;
export const PREMIO_LIBRO_COMODINES = 1500;
export const PREMIO_TRES_ROJO = 100;
export const PREMIO_CIERRE_HAND_AND_FOOT = 100;
/** Libros limpios y sucios que necesita una pareja para cerrar. */
export const LIBROS_PARA_CERRAR = 2;
const MINIMOS = [50, 90, 120, 150];

export interface CombinacionHandAndFoot {
  readonly id: number;
  readonly bando: number;
  /** Valor de las cartas (1 el As); 0 en la de comodines. */
  readonly valor: number;
  readonly cartas: readonly CartaHandAndFoot[];
}

export type AccionHandAndFoot =
  | { readonly tipo: 'robar' }
  | {
      readonly tipo: 'cogerDescarte';
      /** Los dos naturales de la mano que van con la de arriba. */
      readonly cartas: readonly CartaHandAndFoot[];
      /** La combinación sin terminar de la pareja a la que van; `null` si es nueva. */
      readonly combinacion: number | null;
    }
  | { readonly tipo: 'bajar'; readonly cartas: readonly CartaHandAndFoot[] }
  | {
      readonly tipo: 'anadir';
      readonly combinacion: number;
      readonly cartas: readonly CartaHandAndFoot[];
    }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'descartar'; readonly carta: CartaHandAndFoot }
  | { readonly tipo: 'acabar' };

/** La primera bajada en curso de una pareja, mientras no llega al mínimo. */
export interface AperturaHandAndFoot {
  /** Las combinaciones al empezar a bajar. */
  readonly combinaciones: readonly CombinacionHandAndFoot[];
  readonly siguienteId: number;
}

export interface DesgloseHandAndFoot {
  readonly cartas: number;
  readonly limpios: number;
  readonly sucios: number;
  readonly deComodines: number;
  /** Los premios de los libros. */
  readonly libros: number;
  readonly treses: number;
  readonly cierre: number;
  /** Lo que queda en las manos y en los pies sin coger, en negativo. */
  readonly mano: number;
  readonly total: number;
}

export interface ResultadoRondaHandAndFoot {
  readonly ronda: number;
  /** Quién cerró; `null` si se acabó el mazo. */
  readonly cierra: Asiento | null;
  readonly desglose: readonly DesgloseHandAndFoot[];
  readonly puntosTras: readonly number[];
}

export interface EstadoHandAndFoot {
  readonly config: ConfigHandAndFoot;
  readonly azar: EstadoAzar;
  readonly ronda: number;
  readonly repartidor: Asiento;
  readonly turno: Asiento;
  readonly fase: 'robar' | 'bajar';
  /** Lo que juega cada uno: su mano o, si ya lo cogió, su pie. */
  readonly manos: readonly (readonly CartaHandAndFoot[])[];
  /** El pie sin coger de cada uno; vacío si ya lo cogió. */
  readonly pies: readonly (readonly CartaHandAndFoot[])[];
  readonly enPie: readonly boolean[];
  /** Cartas que cada uno cogió del descarte y siguen en su mano. */
  readonly conocidas: readonly (readonly CartaHandAndFoot[])[];
  /** Boca abajo; se roba la última. */
  readonly mazo: readonly CartaHandAndFoot[];
  /** Boca arriba; la de arriba es la última. */
  readonly descarte: readonly CartaHandAndFoot[];
  readonly combinaciones: readonly CombinacionHandAndFoot[];
  readonly siguienteId: number;
  /** Treses rojos de cada pareja. */
  readonly treses: readonly (readonly CartaHandAndFoot[])[];
  /** Por pareja: ya ha hecho la primera bajada en la ronda. */
  readonly abierto: readonly boolean[];
  readonly apertura: AperturaHandAndFoot | null;
  readonly puntos: readonly number[];
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly accion: AccionHandAndFoot;
  } | null;
  readonly resultadosRondas: readonly ResultadoRondaHandAndFoot[];
  readonly terminada: boolean;
}

export interface VistaHandAndFoot {
  readonly config: ConfigHandAndFoot;
  readonly asiento: Asiento | null;
  readonly miMano: readonly CartaHandAndFoot[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas del pie sin coger de cada uno (0 si ya lo cogió). */
  readonly cartasEnPie: readonly number[];
  readonly enPie: readonly boolean[];
  readonly conocidas: readonly (readonly CartaHandAndFoot[])[];
  readonly cartasEnMazo: number;
  readonly descarte: readonly CartaHandAndFoot[];
  readonly combinaciones: readonly CombinacionHandAndFoot[];
  readonly siguienteId: number;
  readonly treses: readonly (readonly CartaHandAndFoot[])[];
  readonly abierto: readonly boolean[];
  readonly apertura: AperturaHandAndFoot | null;
  /** Mínimo de la primera bajada en esta ronda. */
  readonly minimo: number;
  /** Por pareja: tiene los libros para cerrar. */
  readonly puedeCerrar: readonly boolean[];
  readonly ronda: number;
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly fase: 'robar' | 'bajar';
  readonly puntos: readonly number[];
  readonly ultimaAccion: EstadoHandAndFoot['ultimaAccion'];
  readonly resultadosRondas: readonly ResultadoRondaHandAndFoot[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const bandoHandAndFoot = (a: Asiento) => a % 2;

/** Las 270 cartas: 5 barajas francesas con sus 2 comodines, en orden canónico. */
export function cartasHandAndFoot(): CartaHandAndFoot[] {
  const cartas: CartaHandAndFoot[] = [];
  for (let copia = 0; copia < BARAJAS_HAND_AND_FOOT; copia++) {
    for (const palo of PALOS_FRANCESES) {
      for (let v = 1; v <= 13; v++) cartas.push(`${palo}-${v}#${copia}`);
    }
    cartas.push(`comodin-1#${copia}`, `comodin-2#${copia}`);
  }
  return cartas;
}

export const puntosHandAndFoot = (c: CartaHandAndFoot) => puntosCanasta(c);
const sumaPuntos = (cartas: readonly CartaHandAndFoot[]) =>
  cartas.reduce((s, c) => s + puntosCanasta(c), 0);
const ordenar = (cartas: readonly CartaHandAndFoot[]) => [...cartas].sort(compararCanasta);
const quitar = (de: readonly CartaHandAndFoot[], cartas: readonly CartaHandAndFoot[]) =>
  de.filter((c) => !cartas.includes(c));

// ── Combinaciones ────────────────────────────────────────────────────────────

const comodinesDe = (cartas: readonly CartaHandAndFoot[]) => cartas.filter(esComodinCanasta).length;

/** Las cartas forman una combinación válida de valor `valor` (0 la de comodines). */
export function combinacionValidaHandAndFoot(
  valor: number,
  cartas: readonly CartaHandAndFoot[],
): boolean {
  if (cartas.length < 3 || cartas.length > TAMANO_LIBRO) return false;
  if (valor === 0) return cartas.every(esComodinCanasta);
  const comodines = comodinesDe(cartas);
  if (cartas.length - comodines < 2 || comodines > MAXIMO_COMODINES_HAND_AND_FOOT) return false;
  return cartas.every((c) => esComodinCanasta(c) || valorCanasta(c) === valor);
}

export const esLibro = (c: CombinacionHandAndFoot) => c.cartas.length >= TAMANO_LIBRO;

export type TipoLibro = 'limpio' | 'sucio' | 'comodines';

export function tipoLibro(c: CombinacionHandAndFoot): TipoLibro | null {
  if (!esLibro(c)) return null;
  if (c.valor === 0) return 'comodines';
  return comodinesDe(c.cartas) === 0 ? 'limpio' : 'sucio';
}

/** Libros de una pareja: los de comodines cuentan como limpios para cerrar. */
export function librosDe(
  combinaciones: readonly CombinacionHandAndFoot[],
  bando: number,
): { limpios: number; sucios: number; deComodines: number } {
  let limpios = 0;
  let sucios = 0;
  let deComodines = 0;
  for (const c of combinaciones) {
    if (c.bando !== bando) continue;
    const t = tipoLibro(c);
    if (t === 'limpio') limpios++;
    else if (t === 'sucio') sucios++;
    else if (t === 'comodines') deComodines++;
  }
  return { limpios, sucios, deComodines };
}

export function puedeCerrarHandAndFoot(
  combinaciones: readonly CombinacionHandAndFoot[],
  bando: number,
): boolean {
  const l = librosDe(combinaciones, bando);
  return l.limpios + l.deComodines >= LIBROS_PARA_CERRAR && l.sucios >= LIBROS_PARA_CERRAR;
}

/** Mínimo de la primera bajada en la ronda (de la 1 a la 4). */
export const minimoHandAndFoot = (ronda: number) => MINIMOS[Math.min(ronda, MINIMOS.length) - 1]!;

/** La combinación sin terminar de una pareja con ese valor, si la tiene. */
const abiertaDe = (
  combinaciones: readonly CombinacionHandAndFoot[],
  bando: number,
  valor: number,
) => combinaciones.find((c) => c.bando === bando && c.valor === valor && !esLibro(c)) ?? null;

function clasificar(mano: readonly CartaHandAndFoot[]) {
  const naturales = new Map<number, CartaHandAndFoot[]>();
  const jokers: CartaHandAndFoot[] = [];
  const doses: CartaHandAndFoot[] = [];
  for (const c of mano) {
    if (esJokerCanasta(c)) jokers.push(c);
    else if (esDosCanasta(c)) doses.push(c);
    else if (esNaturalCanasta(c))
      naturales.set(valorCanasta(c), [...(naturales.get(valorCanasta(c)) ?? []), c]);
  }
  return { naturales, jokers, doses };
}

/** Las formas de elegir `j` jokers y `d` doses, de `minimo` a `maximo` en total. */
function formasComodin(
  jokers: number,
  doses: number,
  maximo: number,
  minimo = 0,
): [number, number][] {
  const formas: [number, number][] = [];
  for (let j = 0; j <= Math.min(jokers, maximo); j++) {
    for (let d = 0; d <= Math.min(doses, maximo - j); d++) {
      if (j + d >= minimo) formas.push([j, d]);
    }
  }
  return formas;
}

// ── Reparto ──────────────────────────────────────────────────────────────────

/** Pone los treses rojos de la mano en la mesa de la pareja y roba otra por cada uno. */
function reponerTreses(
  mano: CartaHandAndFoot[],
  mazo: CartaHandAndFoot[],
  treses: CartaHandAndFoot[],
): void {
  for (;;) {
    const rojos = mano.filter(esTresRojo);
    if (rojos.length === 0) return;
    for (const r of rojos) {
      mano.splice(mano.indexOf(r), 1);
      treses.push(r);
      if (mazo.length > 0) mano.push(mazo.pop()!);
    }
  }
}

function nuevaRonda(
  base: Pick<EstadoHandAndFoot, 'config' | 'puntos' | 'resultadosRondas'>,
  azar: EstadoAzar,
  ronda: number,
  repartidor: Asiento,
): EstadoHandAndFoot {
  const { cartas, azar: azarSiguiente } = barajar(cartasHandAndFoot(), azar);
  const mazo = [...cartas];
  const manos: CartaHandAndFoot[][] = [[], [], [], []];
  const pies: CartaHandAndFoot[][] = [[], [], [], []];
  for (let k = 0; k < CARTAS_MANO_HAND_AND_FOOT; k++) {
    for (let i = 1; i <= 4; i++) manos[(repartidor + i) % 4]!.push(mazo.pop()!);
  }
  for (let k = 0; k < CARTAS_MANO_HAND_AND_FOOT; k++) {
    for (let i = 1; i <= 4; i++) pies[(repartidor + i) % 4]!.push(mazo.pop()!);
  }
  const treses: CartaHandAndFoot[][] = [[], []];
  for (let i = 1; i <= 4; i++) {
    const a = (repartidor + i) % 4;
    reponerTreses(manos[a]!, mazo, treses[bandoHandAndFoot(a)]!);
  }
  // El descarte empieza con una carta; si es un comodín o un 3 rojo, se tapa con otra.
  const descarte = [mazo.pop()!];
  while (esComodinCanasta(descarte.at(-1)!) || esTresRojo(descarte.at(-1)!)) {
    descarte.push(mazo.pop()!);
  }
  return {
    ...base,
    azar: azarSiguiente,
    ronda,
    repartidor,
    turno: (repartidor + 1) % 4,
    fase: 'robar',
    manos: manos.map(ordenar),
    pies,
    enPie: [false, false, false, false],
    conocidas: [[], [], [], []],
    mazo,
    descarte,
    combinaciones: [],
    siguienteId: 0,
    treses,
    abierto: [false, false],
    apertura: null,
    ultimaAccion: null,
    terminada: false,
  };
}

// ── Puntuación ───────────────────────────────────────────────────────────────

export function puntuarRondaHandAndFoot(
  e: Pick<EstadoHandAndFoot, 'combinaciones' | 'treses' | 'manos' | 'pies'>,
  cierra: Asiento | null,
): DesgloseHandAndFoot[] {
  return [0, 1].map((b) => {
    const propias = e.combinaciones.filter((c) => c.bando === b);
    const cartas = propias.reduce((s, c) => s + sumaPuntos(c.cartas), 0);
    const { limpios, sucios, deComodines } = librosDe(propias, b);
    const libros =
      limpios * PREMIO_LIBRO_LIMPIO +
      sucios * PREMIO_LIBRO_SUCIO +
      deComodines * PREMIO_LIBRO_COMODINES;
    const treses = e.treses[b]!.length * PREMIO_TRES_ROJO;
    const cierre =
      cierra !== null && bandoHandAndFoot(cierra) === b ? PREMIO_CIERRE_HAND_AND_FOOT : 0;
    const mano = -[0, 1, 2, 3]
      .filter((a) => bandoHandAndFoot(a) === b)
      .reduce((s, a) => s + sumaPuntos(e.manos[a]!) + sumaPuntos(e.pies[a]!), 0);
    return {
      cartas,
      limpios,
      sucios,
      deComodines,
      libros,
      treses,
      cierre,
      mano,
      total: cartas + libros + treses + cierre + mano,
    };
  });
}

function cerrarRonda(e: EstadoHandAndFoot, cierra: Asiento | null): EstadoHandAndFoot {
  const desglose = puntuarRondaHandAndFoot(e, cierra);
  const puntos = e.puntos.map((p, b) => p + desglose[b]!.total);
  const resultadosRondas = [
    ...e.resultadosRondas,
    { ronda: e.ronda, cierra, desglose, puntosTras: puntos },
  ];
  if (e.ronda >= e.config.rondas) return { ...e, puntos, resultadosRondas, terminada: true };
  return nuevaRonda(
    { config: e.config, puntos, resultadosRondas },
    e.azar,
    e.ronda + 1,
    (e.repartidor + 1) % 4,
  );
}

// ── Acciones legales ─────────────────────────────────────────────────────────

/** Cartas que tienen que quedarle al jugador tras bajar o coger el descarte. */
function cartasMinimas(
  e: EstadoHandAndFoot,
  asiento: Asiento,
  combinaciones: readonly CombinacionHandAndFoot[],
): number {
  if (!e.enPie[asiento]) return 0;
  return puedeCerrarHandAndFoot(combinaciones, bandoHandAndFoot(asiento)) ? 0 : 2;
}

/** Las combinaciones tras añadir `cartas` a la de `id`, o crear una nueva. */
function conCartas(
  combinaciones: readonly CombinacionHandAndFoot[],
  id: number | null,
  nueva: CombinacionHandAndFoot,
  cartas: readonly CartaHandAndFoot[],
): CombinacionHandAndFoot[] {
  if (id === null) return [...combinaciones, nueva];
  return combinaciones.map((c) => (c.id === id ? { ...c, cartas: [...c.cartas, ...cartas] } : c));
}

/** Coger el descarte, si se puede. */
function accionesDescarte(e: EstadoHandAndFoot, asiento: Asiento): AccionHandAndFoot[] {
  const bando = bandoHandAndFoot(asiento);
  const arriba = e.descarte.at(-1);
  if (!e.abierto[bando] || arriba === undefined || !esNaturalCanasta(arriba)) return [];
  const valor = valorCanasta(arriba);
  const mano = e.manos[asiento]!;
  const propios = clasificar(mano).naturales.get(valor) ?? [];
  if (propios.length < 2) return [];
  const cartas = propios.slice(0, 2);
  const existente = abiertaDe(e.combinaciones, bando, valor);
  if (existente && existente.cartas.length + 3 > TAMANO_LIBRO) return [];
  const combs = conCartas(
    e.combinaciones,
    existente?.id ?? null,
    { id: e.siguienteId, bando, valor, cartas: [arriba, ...cartas] },
    [arriba, ...cartas],
  );
  const recibe = Math.min(CARTAS_DEL_DESCARTE, e.descarte.length - 1);
  if (mano.length - 2 + recibe < cartasMinimas(e, asiento, combs)) return [];
  return [{ tipo: 'cogerDescarte', cartas, combinacion: existente?.id ?? null }];
}

/** Puntos de las combinaciones de la pareja (solo las de la primera bajada, si no ha abierto). */
const puntosBando = (combinaciones: readonly CombinacionHandAndFoot[], bando: number) =>
  combinaciones.filter((c) => c.bando === bando).reduce((s, c) => s + sumaPuntos(c.cartas), 0);

function accionesBajar(e: EstadoHandAndFoot, asiento: Asiento): AccionHandAndFoot[] {
  const bando = bandoHandAndFoot(asiento);
  const mano = e.manos[asiento]!;
  const { naturales, jokers, doses } = clasificar(mano);
  const acciones: AccionHandAndFoot[] = [];
  const minimo = minimoHandAndFoot(e.ronda);
  const admite = (
    cartas: readonly CartaHandAndFoot[],
    combs: readonly CombinacionHandAndFoot[],
  ) => {
    const quedan = mano.length - cartas.length;
    if (quedan < cartasMinimas(e, asiento, combs)) return false;
    // Sin la primera bajada hecha, no se coge el pie hasta llegar al mínimo.
    return quedan > 0 || e.abierto[bando]! || puntosBando(combs, bando) >= minimo;
  };
  const nueva = (valor: number, cartas: readonly CartaHandAndFoot[]) => {
    if (!combinacionValidaHandAndFoot(valor, cartas)) return;
    const combs = [...e.combinaciones, { id: e.siguienteId, bando, valor, cartas }];
    if (admite(cartas, combs)) acciones.push({ tipo: 'bajar', cartas });
  };

  // Combinaciones nuevas de naturales.
  for (const [valor, grupo] of naturales) {
    if (abiertaDe(e.combinaciones, bando, valor)) continue;
    for (let k = 2; k <= Math.min(grupo.length, TAMANO_LIBRO); k++) {
      const hueco = Math.min(MAXIMO_COMODINES_HAND_AND_FOOT, TAMANO_LIBRO - k);
      for (const [j, d] of formasComodin(jokers.length, doses.length, hueco)) {
        nueva(valor, [...grupo.slice(0, k), ...jokers.slice(0, j), ...doses.slice(0, d)]);
      }
    }
  }
  // La de comodines.
  if (!abiertaDe(e.combinaciones, bando, 0)) {
    for (const [j, d] of formasComodin(jokers.length, doses.length, TAMANO_LIBRO, 3)) {
      nueva(0, [...jokers.slice(0, j), ...doses.slice(0, d)]);
    }
  }
  // Añadir a las de la pareja sin terminar.
  for (const comb of e.combinaciones) {
    if (comb.bando !== bando || esLibro(comb)) continue;
    const libre = TAMANO_LIBRO - comb.cartas.length;
    const grupo = comb.valor === 0 ? [] : (naturales.get(comb.valor) ?? []);
    for (let k = 0; k <= Math.min(grupo.length, libre); k++) {
      const hueco =
        comb.valor === 0
          ? libre
          : Math.min(libre - k, MAXIMO_COMODINES_HAND_AND_FOOT - comodinesDe(comb.cartas));
      for (const [j, d] of formasComodin(jokers.length, doses.length, Math.max(0, hueco))) {
        if (k + j + d === 0) continue;
        const cartas = [...grupo.slice(0, k), ...jokers.slice(0, j), ...doses.slice(0, d)];
        const combs = conCartas(e.combinaciones, comb.id, comb, cartas);
        if (admite(cartas, combs)) acciones.push({ tipo: 'anadir', combinacion: comb.id, cartas });
      }
    }
  }
  return acciones;
}

/** Hay algo bajado en la primera bajada en curso que se pueda deshacer. */
const hayQueDeshacer = (e: EstadoHandAndFoot) => e.apertura !== null && e.combinaciones.length > 0;

function accionesLegales(e: EstadoHandAndFoot, asiento: Asiento): AccionHandAndFoot[] {
  if (e.terminada || asiento !== e.turno) return [];
  if (e.fase === 'robar') {
    const descarte = accionesDescarte(e, asiento);
    if (e.mazo.length < 2) return descarte.length > 0 ? [...descarte, { tipo: 'acabar' }] : [];
    return [{ tipo: 'robar' }, ...descarte];
  }
  const acciones = accionesBajar(e, asiento);
  if (hayQueDeshacer(e)) acciones.push({ tipo: 'deshacer' });
  if (e.apertura === null) {
    const vistas = new Set<string>();
    for (const carta of e.manos[asiento]!) {
      const base = basePinacle(carta);
      if (vistas.has(base)) continue;
      vistas.add(base);
      acciones.push({ tipo: 'descartar', carta });
    }
  }
  return acciones;
}

// ── Transiciones ─────────────────────────────────────────────────────────────

/** Si la pareja llegó al mínimo de la primera bajada, la cierra. */
function comprobarApertura(e: EstadoHandAndFoot, asiento: Asiento): EstadoHandAndFoot {
  const bando = bandoHandAndFoot(asiento);
  if (e.apertura === null) return e;
  if (puntosBando(e.combinaciones, bando) < minimoHandAndFoot(e.ronda)) return e;
  return { ...e, apertura: null, abierto: e.abierto.map((x, b) => x || b === bando) };
}

/** El jugador se ha quedado sin mano: coge su pie (y pone sus treses rojos). */
function cogerPie(e: EstadoHandAndFoot, asiento: Asiento): EstadoHandAndFoot {
  const mazo = [...e.mazo];
  const mano = [...e.pies[asiento]!];
  const treses = e.treses.map((t) => [...t]);
  reponerTreses(mano, mazo, treses[bandoHandAndFoot(asiento)]!);
  return {
    ...e,
    mazo,
    treses,
    manos: e.manos.map((m, a) => (a === asiento ? ordenar(mano) : m)),
    pies: e.pies.map((p, a) => (a === asiento ? [] : p)),
    enPie: e.enPie.map((x, a) => x || a === asiento),
    conocidas: e.conocidas.map((c, a) => (a === asiento ? [] : c)),
  };
}

/** Tras quedarse sin cartas: coge el pie o, si ya lo jugaba, cierra. */
function sinCartasEnMano(e: EstadoHandAndFoot, asiento: Asiento): EstadoHandAndFoot | 'cierra' {
  if (!e.enPie[asiento]) return cogerPie(e, asiento);
  return 'cierra';
}

/** Tras pasar el turno: si el siguiente no puede robar ni coger el descarte, acaba la ronda. */
function siguienteTurno(e: EstadoHandAndFoot, asiento: Asiento): EstadoHandAndFoot {
  const tras: EstadoHandAndFoot = { ...e, turno: (asiento + 1) % 4, fase: 'robar' };
  if (tras.mazo.length < 2 && accionesDescarte(tras, tras.turno).length === 0) {
    return cerrarRonda(tras, null);
  }
  return tras;
}

/** Cartas que se bajan de la mano: salen de ella y de las conocidas. */
function sinCartas(e: EstadoHandAndFoot, asiento: Asiento, cartas: readonly CartaHandAndFoot[]) {
  return {
    manos: e.manos.map((m, a) => (a === asiento ? quitar(m, cartas) : m)),
    conocidas: e.conocidas.map((m, a) => (a === asiento ? quitar(m, cartas) : m)),
  };
}

function transicion(
  e: EstadoHandAndFoot,
  asiento: Asiento,
  accion: AccionHandAndFoot,
): EstadoHandAndFoot {
  const bando = bandoHandAndFoot(asiento);
  const marcada = { ...e, ultimaAccion: { asiento, accion } };
  switch (accion.tipo) {
    case 'robar': {
      const mazo = [...e.mazo];
      const mano = [...e.manos[asiento]!, mazo.pop()!, mazo.pop()!];
      const treses = e.treses.map((t) => [...t]);
      reponerTreses(mano, mazo, treses[bando]!);
      return {
        ...marcada,
        mazo,
        treses,
        manos: e.manos.map((m, a) => (a === asiento ? ordenar(mano) : m)),
        fase: 'bajar',
      };
    }
    case 'cogerDescarte': {
      const arriba = e.descarte.at(-1)!;
      const desde = Math.max(0, e.descarte.length - 1 - CARTAS_DEL_DESCARTE);
      const cogidas = e.descarte.slice(desde, -1);
      const rojos = cogidas.filter(esTresRojo);
      const aMano = cogidas.filter((c) => !esTresRojo(c));
      const nuevas = [arriba, ...accion.cartas];
      const combinaciones = conCartas(
        e.combinaciones,
        accion.combinacion,
        { id: e.siguienteId, bando, valor: valorCanasta(arriba), cartas: nuevas },
        nuevas,
      );
      const quitadas = sinCartas(e, asiento, accion.cartas);
      const tras: EstadoHandAndFoot = {
        ...marcada,
        manos: quitadas.manos.map((m, a) => (a === asiento ? ordenar([...m, ...aMano]) : m)),
        conocidas: quitadas.conocidas.map((m, a) => (a === asiento ? [...m, ...aMano] : m)),
        descarte: e.descarte.slice(0, desde),
        combinaciones,
        siguienteId: accion.combinacion === null ? e.siguienteId + 1 : e.siguienteId,
        treses: e.treses.map((t, b) => (b === bando ? [...t, ...rojos] : t)),
        fase: 'bajar',
      };
      if (tras.manos[asiento]!.length > 0) return tras;
      const sin = sinCartasEnMano(tras, asiento);
      return sin === 'cierra' ? cerrarRonda(tras, asiento) : sin;
    }
    case 'bajar':
    case 'anadir': {
      const apertura =
        e.apertura ??
        (e.abierto[bando] ? null : { combinaciones: e.combinaciones, siguienteId: e.siguienteId });
      const combinaciones =
        accion.tipo === 'bajar'
          ? [
              ...e.combinaciones,
              {
                id: e.siguienteId,
                bando,
                valor: accion.cartas.every(esComodinCanasta)
                  ? 0
                  : valorCanasta(accion.cartas.find((c) => !esComodinCanasta(c))!),
                cartas: accion.cartas,
              },
            ]
          : conCartas(e.combinaciones, accion.combinacion, e.combinaciones[0]!, accion.cartas);
      const tras = comprobarApertura(
        {
          ...marcada,
          ...sinCartas(e, asiento, accion.cartas),
          combinaciones,
          siguienteId: accion.tipo === 'bajar' ? e.siguienteId + 1 : e.siguienteId,
          apertura,
        },
        asiento,
      );
      if (tras.manos[asiento]!.length > 0) return tras;
      const sin = sinCartasEnMano(tras, asiento);
      return sin === 'cierra' ? cerrarRonda(tras, asiento) : sin;
    }
    case 'deshacer': {
      const a = e.apertura!;
      const antes = new Set(a.combinaciones.flatMap((c) => c.cartas));
      const vuelven = e.combinaciones.flatMap((c) => c.cartas).filter((c) => !antes.has(c));
      return {
        ...marcada,
        manos: e.manos.map((m, i) => (i === asiento ? ordenar([...m, ...vuelven]) : m)),
        combinaciones: a.combinaciones,
        siguienteId: a.siguienteId,
        apertura: null,
      };
    }
    case 'descartar': {
      const tras: EstadoHandAndFoot = {
        ...marcada,
        ...sinCartas(e, asiento, [accion.carta]),
        descarte: [...e.descarte, accion.carta],
      };
      if (tras.manos[asiento]!.length === 0) {
        const sin = sinCartasEnMano(tras, asiento);
        if (sin === 'cierra') {
          // Sin los libros (solo si los treses rojos lo dejaron con una carta), no hay premio.
          return cerrarRonda(
            tras,
            puedeCerrarHandAndFoot(tras.combinaciones, bando) ? asiento : null,
          );
        }
        return siguienteTurno(sin, asiento);
      }
      return siguienteTurno(tras, asiento);
    }
    case 'acabar':
      return cerrarRonda(marcada, null);
  }
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const handAndFoot: Juego<
  ConfigHandAndFoot,
  EstadoHandAndFoot,
  AccionHandAndFoot,
  VistaHandAndFoot
> = {
  id: 'handAndFoot',

  crear(config, semilla) {
    if (!Number.isInteger(config.rondas) || config.rondas < 1) {
      return error('El número de rondas debe ser un entero positivo');
    }
    return ok(
      nuevaRonda(
        { config: { rondas: config.rondas }, puntos: [0, 0], resultadosRondas: [] },
        crearAzar(semilla),
        1,
        3,
      ),
    );
  },

  asientos: () => 4,

  accionesLegales,

  transicion,

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      cartasEnPie: e.pies.map((p) => p.length),
      enPie: [...e.enPie],
      conocidas: e.conocidas,
      cartasEnMazo: e.mazo.length,
      descarte: [...e.descarte],
      combinaciones: e.combinaciones,
      siguienteId: e.siguienteId,
      treses: e.treses,
      abierto: [...e.abierto],
      apertura: e.apertura,
      minimo: minimoHandAndFoot(e.ronda),
      puedeCerrar: [0, 1].map((b) => puedeCerrarHandAndFoot(e.combinaciones, b)),
      ronda: e.ronda,
      repartidor: e.repartidor,
      turno: e.terminada ? null : e.turno,
      fase: e.fase,
      puntos: [...e.puntos],
      ultimaAccion: e.ultimaAccion,
      resultadosRondas: [...e.resultadosRondas],
    };
  },

  resultado(e): Fin | null {
    if (!e.terminada) return null;
    const puntos = [0, 1, 2, 3].map((a) => e.puntos[bandoHandAndFoot(a)]!);
    if (e.puntos[0] === e.puntos[1]) return { ganadores: [], empate: true, puntos };
    const gana = e.puntos[0]! > e.puntos[1]! ? 0 : 1;
    return {
      ganadores: [0, 1, 2, 3].filter((a) => bandoHandAndFoot(a) === gana),
      empate: false,
      puntos,
    };
  },
};
