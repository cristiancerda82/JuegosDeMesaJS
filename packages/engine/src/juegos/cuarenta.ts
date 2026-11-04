import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import { bandoDe, siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { combinaciones } from './escoba';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigCuarenta {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Puntos para ganar: 40 (más bajo solo en las pruebas). */
  readonly meta: number;
}

export const META_CUARENTA = 40;
export const CONFIG_CUARENTA_POR_DEFECTO: ConfigCuarenta = { jugadores: 2, meta: META_CUARENTA };

/** La baraja francesa sin los 8, 9 y 10. */
export const BARAJA_CUARENTA: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v < 8 || v > 10;
});

export interface JugadaCuarenta {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
  /** Cartas de la mesa que se llevó, con la escalera; vacío si la carta se quedó en la mesa. */
  readonly captura: readonly IdCarta[];
  readonly caida: boolean;
  readonly limpia: boolean;
}

/** Una ronda anunciada al repartir: tres o cuatro cartas del mismo rango. */
export interface RondaCuarenta {
  readonly asiento: Asiento;
  readonly rango: number;
  readonly cartas: 3 | 4;
}

/** Lo que lleva anotado un bando en la mano durante el juego. */
export interface TantosCuarenta {
  readonly rondas: number;
  readonly caidas: number;
  readonly limpias: number;
}

/** Puntos de un bando en la mano, concepto por concepto. */
export interface PuntosManoCuarenta {
  readonly rondas: number;
  readonly caidas: number;
  readonly limpias: number;
  readonly cartones: number;
  readonly total: number;
}

export interface ResultadoManoCuarenta {
  /** `false` si la partida terminó a mitad de la mano (sin contar los cartones). */
  readonly completa: boolean;
  readonly cartas: readonly [number, number];
  readonly puntos: readonly [PuntosManoCuarenta, PuntosManoCuarenta];
  readonly puntosTras: readonly [number, number];
}

export interface EstadoCuarenta {
  readonly config: ConfigCuarenta;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas por repartir; las siguientes son las primeras. */
  readonly mazo: readonly IdCarta[];
  readonly mesa: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  /** Cartas recogidas por cada bando en la mano, boca abajo. */
  readonly recogidas: readonly [readonly IdCarta[], readonly IdCarta[]];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaCuarenta | null;
  /** La carta que el jugador anterior acaba de dejar en la mesa: llevársela por rango es caída. */
  readonly caible: IdCarta | null;
  /** Las rondas anunciadas en el reparto. */
  readonly rondas: readonly RondaCuarenta[];
  /** Las cartas que ha jugado cada asiento desde el último reparto (públicas). */
  readonly jugadasReparto: readonly (readonly IdCarta[])[];
  readonly tantos: readonly [TantosCuarenta, TantosCuarenta];
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoCuarenta[];
}

export interface AccionCuarenta {
  readonly tipo: 'jugar';
  readonly carta: IdCarta;
  /**
   * Cartas de la mesa que se lleva (por rango o por suma), sin la escalera, que se añade sola;
   * vacío para dejarla en la mesa.
   */
  readonly captura: readonly IdCarta[];
}

export interface VistaCuarenta {
  readonly config: ConfigCuarenta;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly mesa: readonly IdCarta[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly cartasRecogidas: readonly [number, number];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaCuarenta | null;
  readonly caible: IdCarta | null;
  readonly rondas: readonly RondaCuarenta[];
  readonly jugadasReparto: readonly (readonly IdCarta[])[];
  readonly tantos: readonly [TantosCuarenta, TantosCuarenta];
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoCuarenta[];
}

// ── Cartas y capturas ────────────────────────────────────────────────────────

/** El orden de la escalera: del As (1) al 7, la J 8, la Q 9 y la K 10. */
export function rangoCuarenta(carta: IdCarta): number {
  const v = cartaDeId(carta)!.valor;
  return v <= 7 ? v : v - 3;
}

/** El valor para sumar: del As al 7 su número; las figuras no suman (`null`). */
export function valorCuarenta(carta: IdCarta): number | null {
  const v = cartaDeId(carta)!.valor;
  return v <= 7 ? v : null;
}

/** El rango más alto de la escalera: la K. */
const RANGO_MAXIMO = 10;

/**
 * Las capturas de una carta sin la escalera: cada carta de la mesa de su rango, por separado, y,
 * si la carta suma, las combinaciones de dos o más cartas del As al 7 que suman su valor.
 */
export function capturasCuarenta(mesa: readonly IdCarta[], carta: IdCarta): IdCarta[][] {
  const rango = rangoCuarenta(carta);
  const iguales = mesa.filter((c) => rangoCuarenta(c) === rango).map((c) => [c]);
  const valor = valorCuarenta(carta);
  if (valor === null) return iguales;
  const numeros = mesa.filter((c) => valorCuarenta(c) !== null);
  return [...iguales, ...combinaciones(numeros, valor).filter((s) => s.length >= 2)];
}

/** La escalera: una carta de cada rango seguido al de la carta jugada, mientras las haya. */
export function escaleraCuarenta(mesa: readonly IdCarta[], carta: IdCarta): IdCarta[] {
  const escalera: IdCarta[] = [];
  for (let r = rangoCuarenta(carta) + 1; r <= RANGO_MAXIMO; r++) {
    const c = mesa.find((x) => rangoCuarenta(x) === r);
    if (c === undefined) break;
    escalera.push(c);
  }
  return escalera;
}

/** El rango del que hay tres o cuatro cartas en la mano, con cuántas; `null` si no hay ronda. */
export function rondaCuarenta(mano: readonly IdCarta[]): { rango: number; cartas: 3 | 4 } | null {
  for (let r = 1; r <= RANGO_MAXIMO; r++) {
    const n = mano.filter((c) => rangoCuarenta(c) === r).length;
    if (n >= 3) return { rango: r, cartas: n as 3 | 4 };
  }
  return null;
}

export const PUNTOS_RONDA = 4;
export const PUNTOS_CAIDA = 2;
export const PUNTOS_LIMPIA = 2;
const CARTONES_MINIMOS = 20;

/**
 * Los cartones de un bando: con 20 cartas o más, 6 puntos y 1 más por cada carta pasada de 20,
 * redondeando al par de arriba; con menos de 20, o con 20 y 20, nada.
 */
export function cartonesCuarenta(cartas: number, otro: number): number {
  if (cartas < CARTONES_MINIMOS) return 0;
  if (cartas === CARTONES_MINIMOS && otro === CARTONES_MINIMOS) return 0;
  return 6 + 2 * Math.ceil((cartas - CARTONES_MINIMOS) / 2);
}

/** Puntos de los tantos de la mano y, si se dan, de los cartones. */
export function puntosManoCuarenta(
  tantos: readonly [TantosCuarenta, TantosCuarenta],
  cartas: readonly [number, number] | null,
): [PuntosManoCuarenta, PuntosManoCuarenta] {
  return ([0, 1] as const).map((b) => {
    const t = tantos[b];
    const p = {
      rondas: t.rondas * PUNTOS_RONDA,
      caidas: t.caidas * PUNTOS_CAIDA,
      limpias: t.limpias * PUNTOS_LIMPIA,
      cartones: cartas === null ? 0 : cartonesCuarenta(cartas[b], cartas[1 - b]!),
    };
    return { ...p, total: p.rondas + p.caidas + p.limpias + p.cartones };
  }) as [PuntosManoCuarenta, PuntosManoCuarenta];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_POR_REPARTO = 5;
const SIN_TANTOS: TantosCuarenta = { rondas: 0, caidas: 0, limpias: 0 };

const terminada = (e: Pick<EstadoCuarenta, 'puntos' | 'config'>) =>
  e.puntos.some((p) => p >= e.config.meta);

/** Suma puntos a un bando; si llega a la meta, cierra la mano a medias (sin cartones). */
function anotar(
  e: EstadoCuarenta,
  bando: 0 | 1,
  puntos: number,
  tanto: keyof TantosCuarenta,
  veces = 1,
): EstadoCuarenta {
  const tantos: [TantosCuarenta, TantosCuarenta] = [e.tantos[0], e.tantos[1]];
  tantos[bando] = { ...tantos[bando], [tanto]: tantos[bando][tanto] + veces };
  const total: [number, number] = [e.puntos[0], e.puntos[1]];
  total[bando] += puntos;
  const anotado: EstadoCuarenta = { ...e, tantos, puntos: total };
  if (!terminada(anotado)) return anotado;
  return {
    ...anotado,
    resultadosManos: [
      ...e.resultadosManos,
      {
        completa: false,
        cartas: [anotado.recogidas[0].length, anotado.recogidas[1].length],
        puntos: puntosManoCuarenta(tantos, null),
        puntosTras: total,
      },
    ],
  };
}

/** Reparte 5 cartas a cada uno desde `desde` y anota las rondas, por orden de juego. */
function repartir(e: EstadoCuarenta, desde: Asiento): EstadoCuarenta {
  const n = e.config.jugadores;
  const manos: IdCarta[][] = Array.from({ length: n }, () => []);
  for (let k = 0; k < n; k++) {
    manos[(desde + k) % n] = e.mazo.slice(k * CARTAS_POR_REPARTO, (k + 1) * CARTAS_POR_REPARTO);
  }
  const rondas: RondaCuarenta[] = [];
  for (let k = 0; k < n; k++) {
    const a = (desde + k) % n;
    const r = rondaCuarenta(manos[a]!);
    if (r) rondas.push({ asiento: a, ...r });
  }
  let r: EstadoCuarenta = {
    ...e,
    mazo: e.mazo.slice(n * CARTAS_POR_REPARTO),
    manos,
    turno: desde,
    caible: null,
    rondas,
    jugadasReparto: manos.map(() => []),
  };
  for (const ronda of rondas) {
    r = anotar(r, bandoDe(ronda.asiento), PUNTOS_RONDA, 'rondas');
    if (terminada(r)) break;
  }
  return r;
}

function nuevaMano(
  base: Pick<EstadoCuarenta, 'config' | 'puntos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoCuarenta {
  const { cartas, azar: sig } = barajar(BARAJA_CUARENTA, azar);
  const n = base.config.jugadores;
  return repartir(
    {
      ...base,
      azar: sig,
      repartidor,
      mazo: cartas,
      mesa: [],
      manos: [],
      turno: 0,
      recogidas: [[], []],
      ultimoEnRecoger: null,
      ultimaJugada: null,
      caible: null,
      rondas: [],
      jugadasReparto: [],
      tantos: [SIN_TANTOS, SIN_TANTOS],
    },
    siguiente(repartidor, n),
  );
}

/** Las cartas de la mesa van al último que capturó; se cuentan los cartones y sigue o termina. */
function cerrarMano(e: EstadoCuarenta): EstadoCuarenta {
  const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
  if (e.ultimoEnRecoger !== null) recogidas[bandoDe(e.ultimoEnRecoger)].push(...e.mesa);
  const cartas: [number, number] = [recogidas[0].length, recogidas[1].length];
  const puntosMano = puntosManoCuarenta(e.tantos, cartas);
  const puntos: [number, number] = [
    e.puntos[0] + puntosMano[0].cartones,
    e.puntos[1] + puntosMano[1].cartones,
  ];
  const cerrado: EstadoCuarenta = {
    ...e,
    mesa: e.ultimoEnRecoger === null ? e.mesa : [],
    recogidas,
    puntos,
    resultadosManos: [
      ...e.resultadosManos,
      { completa: true, cartas, puntos: puntosMano, puntosTras: puntos },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, e.config.jugadores), e.azar);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cuarenta: Juego<ConfigCuarenta, EstadoCuarenta, AccionCuarenta, VistaCuarenta> = {
  id: 'cuarenta',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('El Cuarenta se juega con 2 jugadores o con 4 en parejas');
    }
    if (!Number.isInteger(config.meta) || config.meta < 1)
      return error('La meta debe ser positiva');
    const limpia: ConfigCuarenta = { jugadores: config.jugadores, meta: config.meta };
    // Reparte el último asiento, así sale el asiento 0.
    return ok(
      nuevaMano(
        { config: limpia, puntos: [0, 0], resultadosManos: [] },
        limpia.jugadores - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    return e.manos[asiento]!.flatMap((carta): AccionCuarenta[] => [
      ...capturasCuarenta(e.mesa, carta).map((captura): AccionCuarenta => ({
        tipo: 'jugar',
        carta,
        captura,
      })),
      { tipo: 'jugar', carta, captura: [] },
    ]);
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    const bando = bandoDe(asiento);
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const jugadasReparto = e.jugadasReparto.map((js, a) =>
      a === asiento ? [...js, accion.carta] : js,
    );
    const recoge = accion.captura.length > 0;
    let mesa: IdCarta[];
    let captura: IdCarta[] = [];
    let caida = false;
    let limpia = false;
    const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
    if (recoge) {
      const resto = e.mesa.filter((c) => !accion.captura.includes(c));
      const escalera = escaleraCuarenta(resto, accion.carta);
      captura = [...accion.captura, ...escalera];
      mesa = resto.filter((c) => !escalera.includes(c));
      caida = accion.captura.length === 1 && accion.captura[0] === e.caible;
      limpia = mesa.length === 0;
      recogidas[bando].push(accion.carta, ...captura);
    } else {
      mesa = [...e.mesa, accion.carta];
    }
    let r: EstadoCuarenta = {
      ...e,
      manos,
      mesa,
      turno: siguiente(asiento, n),
      recogidas,
      ultimoEnRecoger: recoge ? asiento : e.ultimoEnRecoger,
      ultimaJugada: { asiento, carta: accion.carta, captura, caida, limpia },
      caible: recoge ? null : accion.carta,
      jugadasReparto,
    };
    if (caida) r = anotar(r, bando, PUNTOS_CAIDA, 'caidas');
    if (limpia && !terminada(r)) r = anotar(r, bando, PUNTOS_LIMPIA, 'limpias');
    if (terminada(r)) return r;
    if (manos.every((m) => m.length === 0)) {
      return r.mazo.length > 0 ? repartir(r, r.turno) : cerrarMano(r);
    }
    return r;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      mesa: [...e.mesa],
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      cartasRecogidas: [e.recogidas[0].length, e.recogidas[1].length],
      ultimoEnRecoger: e.ultimoEnRecoger,
      ultimaJugada: e.ultimaJugada,
      caible: e.caible,
      rondas: [...e.rondas],
      jugadasReparto: e.jugadasReparto.map((js) => [...js]),
      tantos: e.tantos,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const bando = e.puntos[0] >= e.config.meta ? 0 : 1;
    return {
      ganadores: asientos.filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: asientos.map((a) => e.puntos[bandoDe(a)]),
    };
  },
};
