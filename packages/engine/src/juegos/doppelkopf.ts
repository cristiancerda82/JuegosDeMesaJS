import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { quitarUna } from './spite-malice';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Doppelkopf para cuatro: una ronda de `manos` manos. */
export interface ConfigDoppelkopf {
  readonly manos: number;
}

export const CONFIG_DOPPELKOPF_POR_DEFECTO: ConfigDoppelkopf = { manos: 8 };

export const RESERVAS_DOPPELKOPF = ['sano', 'boda', 'damas', 'jotas', 'triunfo'] as const;
export type ReservaDoppelkopf = (typeof RESERVAS_DOPPELKOPF)[number];
/** El tipo de juego de la mano: los solos se llaman como su reserva. */
export type TipoJuegoDoppelkopf = 'normal' | 'boda' | 'damas' | 'jotas' | 'triunfo';
export type BandoDoppelkopf = 're' | 'contra';

export type AccionDoppelkopf =
  | { readonly tipo: 'reservar'; readonly reserva: ReservaDoppelkopf }
  | { readonly tipo: 'anunciar' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

/** Niveles de anuncio: 1 Re/Contra, 2 no 90, 3 no 60, 4 no 30 y 5 negro. */
export const NIVEL_MAXIMO_DOPPELKOPF = 5;

export interface AnuncioDoppelkopf {
  readonly asiento: Asiento;
  readonly bando: BandoDoppelkopf;
  readonly nivel: number;
}

export interface BazaDoppelkopf {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export type TipoConceptoDoppelkopf =
  | 'ganado'
  | 'menos90'
  | 'menos60'
  | 'menos30'
  | 'sinBazas'
  | 're'
  | 'contra'
  | 'anunciadoNo90'
  | 'anunciadoNo60'
  | 'anunciadoNo30'
  | 'anunciadoNegro'
  | 'contraNo90'
  | 'contraNo60'
  | 'contraNo30'
  | 'contraNegro'
  | 'contraLosViejos'
  | 'zorro'
  | 'doppelkopf'
  | 'carlitos';

export interface ConceptoDoppelkopf {
  readonly bando: BandoDoppelkopf;
  readonly tipo: TipoConceptoDoppelkopf;
  readonly puntos: number;
}

export interface ResultadoManoDoppelkopf {
  readonly juego: TipoJuegoDoppelkopf;
  readonly solista: Asiento | null;
  readonly re: readonly Asiento[];
  readonly cartasRe: number;
  readonly cartasContra: number;
  readonly ganador: BandoDoppelkopf | null;
  readonly conceptos: readonly ConceptoDoppelkopf[];
  /** Valor de la mano para cada jugador de Re (sin multiplicar por el solo). */
  readonly valor: number;
  /** Lo que suma cada jugador en la mano. */
  readonly cambio: readonly number[];
  readonly puntosTras: readonly number[];
}

export interface EstadoDoppelkopf {
  readonly config: ConfigDoppelkopf;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly salida: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: 'reservas' | 'bazas';
  readonly turno: Asiento;
  readonly reservas: readonly (ReservaDoppelkopf | null)[];
  readonly juego: TipoJuegoDoppelkopf;
  /** El del solo o el de la boda. */
  readonly solista: Asiento | null;
  /** En la boda, la pareja del solista cuando se sabe. */
  readonly pareja: Asiento | null;
  /** En la boda, cuántas bazas se habían jugado al saberse la pareja (o 3 si juega solo). */
  readonly bazaPareja: number | null;
  /** Los asientos del bando Re (en la boda sin resolver, solo el solista). */
  readonly re: readonly Asiento[];
  readonly mesa: readonly CartaJugada[];
  readonly bazas: readonly BazaDoppelkopf[];
  readonly anuncios: readonly AnuncioDoppelkopf[];
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoDoppelkopf[];
}

export interface VistaDoppelkopf {
  readonly config: ConfigDoppelkopf;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  readonly salida: Asiento;
  readonly fase: EstadoDoppelkopf['fase'];
  readonly turno: Asiento | null;
  readonly reservas: readonly (ReservaDoppelkopf | null)[];
  readonly juego: TipoJuegoDoppelkopf;
  readonly solista: Asiento | null;
  readonly pareja: Asiento | null;
  readonly bazaPareja: number | null;
  readonly mesa: readonly CartaJugada[];
  readonly bazas: readonly BazaDoppelkopf[];
  readonly anuncios: readonly AnuncioDoppelkopf[];
  /** El bando de cada asiento si se sabe (desde este asiento), o `null`. */
  readonly bandos: readonly (BandoDoppelkopf | null)[];
  /** El número de la mano en la ronda, desde 1. */
  readonly manoNumero: number;
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoDoppelkopf[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

const VALORES = [1, 10, 13, 12, 11, 9];

/** Dos veces A, 10, K, Q, J y 9 de cada palo: 48 cartas. */
export const BARAJA_DOPPELKOPF: readonly IdCarta[] = (() => {
  const una = crearBaraja('francesa52').filter((c) => VALORES.includes(cartaDeId(c)!.valor));
  return [...una, ...una];
})();

export const paloDoppelkopf = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
export const valorDoppelkopf = (c: IdCarta) => cartaDeId(c)!.valor;

const PUNTOS: Readonly<Record<number, number>> = { 1: 11, 10: 10, 13: 4, 12: 3, 11: 2, 9: 0 };
export const puntosCartaDoppelkopf = (c: IdCarta) => PUNTOS[valorDoppelkopf(c)]!;
export const puntosCartasDoppelkopf = (cs: readonly IdCarta[]) =>
  cs.reduce((s, c) => s + puntosCartaDoppelkopf(c), 0);

export const DAMA_TREBOLES = 'treboles-12' as IdCarta;
export const AS_DIAMANTES = 'diamantes-1' as IdCarta;
export const JOTA_TREBOLES = 'treboles-11' as IdCarta;

const ORDEN_PALOS: readonly PaloFrances[] = ['treboles', 'picas', 'corazones', 'diamantes'];
const id = (palo: PaloFrances, valor: number) => `${palo}-${valor}` as IdCarta;

/** Triunfos de mayor a menor en cada tipo de juego. */
const TRIUNFOS: Record<TipoJuegoDoppelkopf, readonly IdCarta[]> = (() => {
  const normales = [
    id('corazones', 10),
    ...ORDEN_PALOS.map((p) => id(p, 12)),
    ...ORDEN_PALOS.map((p) => id(p, 11)),
    ...[1, 10, 13, 9].map((v) => id('diamantes', v)),
  ];
  return {
    normal: normales,
    boda: normales,
    triunfo: normales,
    damas: ORDEN_PALOS.map((p) => id(p, 12)),
    jotas: ORDEN_PALOS.map((p) => id(p, 11)),
  };
})();

export const esTriunfoDoppelkopf = (c: IdCarta, juego: TipoJuegoDoppelkopf) =>
  TRIUNFOS[juego].includes(c);

/** El «palo» para seguir: `'triunfo'` o el palo francés. */
export const paloJuegoDoppelkopf = (c: IdCarta, juego: TipoJuegoDoppelkopf) =>
  esTriunfoDoppelkopf(c, juego) ? 'triunfo' : paloDoppelkopf(c);

/** Fuerza de una carta: los triunfos por encima de todo; dentro del palo, A, 10, K, Q, J y 9. */
export function fuerzaDoppelkopf(c: IdCarta, juego: TipoJuegoDoppelkopf): number {
  const t = TRIUNFOS[juego].indexOf(c);
  if (t >= 0) return 100 - t;
  return VALORES.length - VALORES.indexOf(valorDoppelkopf(c));
}

/** La carta que gana la baza: la primera de las más fuertes que siguen o fallan. */
export function ganadoraDoppelkopf(
  mesa: readonly CartaJugada[],
  juego: TipoJuegoDoppelkopf,
): CartaJugada {
  let mejor = mesa[0]!;
  for (const j of mesa.slice(1)) {
    const pj = paloJuegoDoppelkopf(j.carta, juego);
    const pm = paloJuegoDoppelkopf(mejor.carta, juego);
    if (
      pj === pm
        ? fuerzaDoppelkopf(j.carta, juego) > fuerzaDoppelkopf(mejor.carta, juego)
        : pj === 'triunfo'
    ) {
      mejor = j;
    }
  }
  return mejor;
}

export function cartasLegalesDoppelkopf(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  juego: TipoJuegoDoppelkopf,
): IdCarta[] {
  const distintas = [...new Set(mano)];
  if (mesa.length === 0) return distintas;
  const palo = paloJuegoDoppelkopf(mesa[0]!.carta, juego);
  const siguen = distintas.filter((c) => paloJuegoDoppelkopf(c, juego) === palo);
  return siguen.length > 0 ? siguen : distintas;
}

// ── Bandos y anuncios ────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 12;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
const cuenta = (cs: readonly IdCarta[], c: IdCarta) => cs.filter((x) => x === c).length;

export const esSoloDoppelkopf = (
  e: Pick<EstadoDoppelkopf, 'juego' | 'pareja' | 'bazaPareja'>,
): boolean =>
  e.juego === 'damas' ||
  e.juego === 'jotas' ||
  e.juego === 'triunfo' ||
  (e.juego === 'boda' && e.bazaPareja !== null && e.pareja === null);

/** El bando de un asiento según el estado, o `null` si aún no está decidido (boda sin resolver). */
export function bandoDoppelkopf(
  e: Pick<EstadoDoppelkopf, 'fase' | 'juego' | 'solista' | 'bazaPareja' | 're'>,
  a: Asiento,
): BandoDoppelkopf | null {
  if (e.fase === 'reservas') return null;
  if (e.juego === 'boda' && e.bazaPareja === null) return a === e.solista ? 're' : null;
  return e.re.includes(a) ? 're' : 'contra';
}

/** El nivel de anuncio de un bando (0 si no ha anunciado). */
export function nivelAnuncioDoppelkopf(
  anuncios: readonly AnuncioDoppelkopf[],
  bando: BandoDoppelkopf,
): number {
  return Math.max(0, ...anuncios.filter((x) => x.bando === bando).map((x) => x.nivel));
}

/** Si `asiento` puede hacer el siguiente anuncio de su bando ahora. */
function puedeAnunciar(e: EstadoDoppelkopf, asiento: Asiento): boolean {
  if (e.fase !== 'bazas' || asiento !== e.turno) return false;
  const bando = bandoDoppelkopf(e, asiento);
  if (bando === null) return false;
  const nivel = nivelAnuncioDoppelkopf(e.anuncios, bando) + 1;
  if (nivel > NIVEL_MAXIMO_DOPPELKOPF) return false;
  const retraso = e.juego === 'boda' ? (e.bazaPareja ?? 0) : 0;
  return e.manos[asiento]!.length >= CARTAS_EN_MANO - nivel - retraso;
}

/** Los bandos que se saben desde `asiento` (o desde fuera, con `null`). */
export function bandosConocidosDoppelkopf(
  e: EstadoDoppelkopf,
  asiento: Asiento | null,
): (BandoDoppelkopf | null)[] {
  const todos = Array.from({ length: JUGADORES }, (_, a) => a);
  if (e.fase === 'reservas') return todos.map(() => null);
  if (e.juego !== 'normal') return todos.map((a) => bandoDoppelkopf(e, a));
  const re = new Set<Asiento>();
  const contra = new Set<Asiento>();
  const jugadas = [...e.bazas.flatMap((b) => b.cartas), ...e.mesa];
  for (const j of jugadas) if (j.carta === DAMA_TREBOLES) re.add(j.asiento);
  for (const x of e.anuncios) (x.bando === 're' ? re : contra).add(x.asiento);
  if (asiento !== null) (e.re.includes(asiento) ? re : contra).add(asiento);
  if (re.size === 2) for (const a of todos) if (!re.has(a)) contra.add(a);
  if (contra.size === 2) for (const a of todos) if (!contra.has(a)) re.add(a);
  return todos.map((a) => (re.has(a) ? 're' : contra.has(a) ? 'contra' : null));
}

// ── Puntos de la mano ────────────────────────────────────────────────────────

const ANUNCIADO: readonly TipoConceptoDoppelkopf[] = [
  'anunciadoNo90',
  'anunciadoNo60',
  'anunciadoNo30',
  'anunciadoNegro',
];
const CONTRA_BAJADA: readonly TipoConceptoDoppelkopf[] = [
  'contraNo90',
  'contraNo60',
  'contraNo30',
  'contraNegro',
];
/** Lo que necesita el rival para tumbar cada bajada (no 90, no 60, no 30, negro). */
const TUMBA_BAJADA = [120, 90, 60, 30];

export function puntuarManoDoppelkopf(e: EstadoDoppelkopf): ResultadoManoDoppelkopf {
  const re = e.re;
  const bandoDe = (a: Asiento): BandoDoppelkopf => (re.includes(a) ? 're' : 'contra');
  const cartas = { re: 0, contra: 0 };
  const bazas = { re: 0, contra: 0 };
  for (const b of e.bazas) {
    const bando = bandoDe(b.ganador);
    cartas[bando] += puntosCartasDoppelkopf(b.cartas.map((j) => j.carta));
    bazas[bando]++;
  }
  const nivel = {
    re: nivelAnuncioDoppelkopf(e.anuncios, 're'),
    contra: nivelAnuncioDoppelkopf(e.anuncios, 'contra'),
  };
  const rival = (b: BandoDoppelkopf): BandoDoppelkopf => (b === 're' ? 'contra' : 're');
  /** El rival de `b` queda por debajo de la bajada de nivel `n` (2 no 90… 5 negro). */
  const cumpleBajada = (b: BandoDoppelkopf, n: number) => {
    const r = rival(b);
    if (n === 5) return bazas[r] === 0;
    return cartas[r] < [90, 60, 30][n - 2]!;
  };
  const cumpleBajadas = (b: BandoDoppelkopf) => {
    for (let n = 2; n <= nivel[b]; n++) if (!cumpleBajada(b, n)) return false;
    return true;
  };
  const minimoRe = nivel.contra > 0 && nivel.re === 0 ? 120 : 121;
  const reGana = cartas.re >= minimoRe && cumpleBajadas('re');
  const ganador: BandoDoppelkopf | null = reGana ? 're' : cumpleBajadas('contra') ? 'contra' : null;

  const conceptos: ConceptoDoppelkopf[] = [];
  const solo = esSoloDoppelkopf(e);
  if (ganador !== null) {
    const perdedor = rival(ganador);
    const suma = (tipo: TipoConceptoDoppelkopf, puntos = 1) =>
      conceptos.push({ bando: ganador, tipo, puntos });
    suma('ganado');
    if (cartas[perdedor] < 90) suma('menos90');
    if (cartas[perdedor] < 60) suma('menos60');
    if (cartas[perdedor] < 30) suma('menos30');
    if (bazas[perdedor] === 0) suma('sinBazas');
    if (nivel.re > 0) suma('re', 2);
    if (nivel.contra > 0) suma('contra', 2);
    for (const b of ['re', 'contra'] as const) {
      for (let n = 2; n <= nivel[b]; n++) suma(ANUNCIADO[n - 2]!);
    }
    for (let n = 2; n <= nivel[perdedor]; n++) {
      if (cartas[ganador] >= TUMBA_BAJADA[n - 2]!) suma(CONTRA_BAJADA[n - 2]!);
    }
    if (ganador === 'contra' && !solo) suma('contraLosViejos');
  }
  if (!solo) {
    e.bazas.forEach((b, i) => {
      const bando = bandoDe(b.ganador);
      const suma = (tipo: TipoConceptoDoppelkopf) => conceptos.push({ bando, tipo, puntos: 1 });
      for (const j of b.cartas) {
        if (j.carta === AS_DIAMANTES && bandoDe(j.asiento) !== bando) suma('zorro');
      }
      if (puntosCartasDoppelkopf(b.cartas.map((j) => j.carta)) >= 40) suma('doppelkopf');
      if (
        i === e.bazas.length - 1 &&
        ganadoraDoppelkopf(b.cartas, e.juego).carta === JOTA_TREBOLES
      ) {
        suma('carlitos');
      }
    });
  }
  const valor = conceptos.reduce((s, c) => s + (c.bando === 're' ? c.puntos : -c.puntos), 0);
  const factor = re.length === 1 ? 3 : 1;
  const cambio = Array.from({ length: JUGADORES }, (_, a) =>
    re.includes(a) ? valor * factor : -valor,
  );
  return {
    juego: e.juego,
    solista: e.solista,
    re: [...re],
    cartasRe: cartas.re,
    cartasContra: cartas.contra,
    ganador,
    conceptos,
    valor,
    cambio,
    puntosTras: e.puntos.map((p, a) => p + cambio[a]!),
  };
}

// ── Reglas ───────────────────────────────────────────────────────────────────

function nuevaMano(
  base: Pick<EstadoDoppelkopf, 'config' | 'puntos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoDoppelkopf {
  const { cartas, azar: sig } = barajar(BARAJA_DOPPELKOPF, azar);
  const salida = siguiente(repartidor);
  const manos = Array.from({ length: JUGADORES }, (_, a) =>
    cartas.slice(a * CARTAS_EN_MANO, (a + 1) * CARTAS_EN_MANO),
  );
  return {
    ...base,
    azar: sig,
    repartidor,
    salida,
    manos,
    fase: 'reservas',
    turno: salida,
    reservas: [null, null, null, null],
    juego: 'normal',
    solista: null,
    pareja: null,
    bazaPareja: null,
    re: [],
    mesa: [],
    bazas: [],
    anuncios: [],
  };
}

const terminada = (e: Pick<EstadoDoppelkopf, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= e.config.manos;

/** Fija el juego cuando han hablado los cuatro. */
function cerrarReservas(e: EstadoDoppelkopf): EstadoDoppelkopf {
  const orden = Array.from({ length: JUGADORES }, (_, i) => (e.salida + i) % JUGADORES);
  const solo = orden.find((a) => {
    const r = e.reservas[a];
    return r === 'damas' || r === 'jotas' || r === 'triunfo';
  });
  const boda = orden.find((a) => e.reservas[a] === 'boda');
  let juego: TipoJuegoDoppelkopf = 'normal';
  let solista: Asiento | null = null;
  let re: Asiento[];
  if (solo !== undefined) {
    juego = e.reservas[solo] as TipoJuegoDoppelkopf;
    solista = solo;
    re = [solo];
  } else if (boda !== undefined) {
    juego = 'boda';
    solista = boda;
    re = [boda];
  } else {
    re = orden.filter((a) => e.manos[a]!.includes(DAMA_TREBOLES)).sort();
  }
  return { ...e, fase: 'bazas', turno: e.salida, juego, solista, re };
}

function cerrarMano(e: EstadoDoppelkopf): EstadoDoppelkopf {
  const r = puntuarManoDoppelkopf(e);
  const cerrado: EstadoDoppelkopf = {
    ...e,
    puntos: r.puntosTras,
    resultadosManos: [...e.resultadosManos, r],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoDoppelkopf): EstadoDoppelkopf {
  const ganador = ganadoraDoppelkopf(e.mesa, e.juego).asiento;
  const bazas = [...e.bazas, { cartas: e.mesa, ganador }];
  let r: EstadoDoppelkopf = { ...e, mesa: [], bazas, turno: ganador };
  if (e.juego === 'boda' && e.bazaPareja === null) {
    if (ganador !== e.solista) {
      r = { ...r, pareja: ganador, bazaPareja: bazas.length, re: [e.solista!, ganador].sort() };
    } else if (bazas.length === 3) {
      r = { ...r, bazaPareja: 3 };
    }
  }
  return bazas.length === CARTAS_EN_MANO ? cerrarMano(r) : r;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const doppelkopf: Juego<
  ConfigDoppelkopf,
  EstadoDoppelkopf,
  AccionDoppelkopf,
  VistaDoppelkopf
> = {
  id: 'doppelkopf',

  crear(config, semilla) {
    if (!Number.isInteger(config.manos) || config.manos <= 0) {
      return error('El número de manos del Doppelkopf tiene que ser un entero positivo');
    }
    return ok(
      nuevaMano(
        { config: { manos: config.manos }, puntos: [0, 0, 0, 0], resultadosManos: [] },
        3,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    if (e.fase === 'reservas') {
      const boda = cuenta(mano, DAMA_TREBOLES) === 2;
      return RESERVAS_DOPPELKOPF.filter((r) =>
        r === 'sano' ? !boda : r === 'boda' ? boda : true,
      ).map((reserva): AccionDoppelkopf => ({ tipo: 'reservar', reserva }));
    }
    const r: AccionDoppelkopf[] = puedeAnunciar(e, asiento) ? [{ tipo: 'anunciar' }] : [];
    for (const carta of cartasLegalesDoppelkopf(mano, e.mesa, e.juego).sort()) {
      r.push({ tipo: 'jugar', carta });
    }
    return r;
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'reservar': {
        const reservas = e.reservas.map((x, a) => (a === asiento ? accion.reserva : x));
        const r = { ...e, reservas, turno: siguiente(asiento) };
        return reservas.every((x) => x !== null) ? cerrarReservas(r) : r;
      }
      case 'anunciar': {
        const bando = bandoDoppelkopf(e, asiento)!;
        const nivel = nivelAnuncioDoppelkopf(e.anuncios, bando) + 1;
        return { ...e, anuncios: [...e.anuncios, { asiento, bando, nivel }] };
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) => (a === asiento ? quitarUna(m, accion.carta) : m));
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const r = { ...e, manos, mesa };
        if (mesa.length < JUGADORES) return { ...r, turno: siguiente(asiento) };
        return resolverBaza(r);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      salida: e.salida,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      reservas: [...e.reservas],
      juego: e.juego,
      solista: e.solista,
      pareja: e.pareja,
      bazaPareja: e.bazaPareja,
      mesa: [...e.mesa],
      bazas: [...e.bazas],
      anuncios: [...e.anuncios],
      bandos: bandosConocidosDoppelkopf(e, asiento),
      manoNumero: Math.min(e.resultadosManos.length + 1, e.config.manos),
      puntos: [...e.puntos],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const max = Math.max(...e.puntos);
    const ganadores = e.puntos.flatMap((p, a) => (p === max ? [a] : []));
    return { ganadores, empate: ganadores.length > 1, puntos: [...e.puntos] };
  },
};
