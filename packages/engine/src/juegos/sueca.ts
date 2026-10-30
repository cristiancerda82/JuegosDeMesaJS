import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  cartasFuera,
  crearBaraja,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** La Sueca no tiene opciones: 4 jugadores en parejas, a 4 juegos. */
export interface ConfigSueca {
  readonly jugadores: 4;
}

export const CONFIG_SUECA_POR_DEFECTO: ConfigSueca = { jugadores: 4 };

/** Juegos para ganar la partida. */
export const JUEGOS_PARTIDA_SUECA = 4;

export type ParejaSueca = 0 | 1;
type DePareja<T> = readonly [T, T];

export interface ResultadoManoSueca {
  readonly triunfo: PaloFrances;
  /** Puntos de cartas de cada pareja. */
  readonly puntos: DePareja<number>;
  /** La pareja que gana juegos en la mano (`null` con 60 a 60). */
  readonly gana: ParejaSueca | null;
  readonly juegosGanados: number;
  readonly juegosTras: DePareja<number>;
}

export interface EstadoSueca {
  readonly config: ConfigSueca;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly triunfo: PaloFrances;
  /** La carta del triunfo del repartidor, a la vista hasta que la juega. */
  readonly cartaTriunfo: IdCarta | null;
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Bazas ganadas por cada jugador en la mano. */
  readonly bazas: readonly number[];
  /** Puntos de cartas de cada pareja en la mano. */
  readonly puntosMano: DePareja<number>;
  /** Palos de salida que cada jugador no ha seguido en la mano. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoSueca[];
  readonly juegos: DePareja<number>;
}

export type AccionSueca = { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaSueca {
  readonly config: ConfigSueca;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly triunfo: PaloFrances;
  readonly cartaTriunfo: IdCarta | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoSueca['ultimaBaza'];
  readonly bazas: readonly number[];
  readonly puntosMano: DePareja<number>;
  /** Cartas ya jugadas en la mano (las que no están en ninguna mano ni en la mesa). */
  readonly jugadas: readonly IdCarta[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoSueca[];
  readonly juegos: DePareja<number>;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La francesa sin ochos, nueves ni dieces: 40 cartas. */
export const BARAJA_SUECA: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v < 8 || v > 10;
});

export const paloSueca = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;

/** Rango para ganar bazas: A 10, 7 9, K 8, J 7, Q 6, y del 6 al 2, 5 a 1. */
export function rangoSueca(c: IdCarta): number {
  const v = cartaDeId(c)!.valor;
  return ({ 1: 10, 7: 9, 13: 8, 11: 7, 12: 6 } as Record<number, number>)[v] ?? v - 1;
}

/** Puntos de una carta: A 11, 7 10, K 4, J 3 y Q 2. */
export function puntosCartaSueca(c: IdCarta): number {
  return (
    ({ 1: 11, 7: 10, 13: 4, 11: 3, 12: 2 } as Record<number, number>)[cartaDeId(c)!.valor] ?? 0
  );
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 10;

export const parejaSueca = (asiento: Asiento): ParejaSueca => (asiento % 2) as ParejaSueca;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: el triunfo más alto o, sin triunfos, la más alta del palo de salida. */
export function ganadoraSueca(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloSueca(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    paloSueca(c) === triunfo ? 100 + rangoSueca(c) : paloSueca(c) === salida ? rangoSueca(c) : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar: las del palo de salida si tiene. */
export function cartasLegalesSueca(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloSueca(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloSueca(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

/** Juegos que gana la pareja que hace estos puntos: 1, 2 o 4. */
export function juegosPorPuntosSueca(puntos: number): number {
  if (puntos >= 120) return 4;
  if (puntos > 90) return 2;
  if (puntos > 60) return 1;
  return 0;
}

const terminada = (e: Pick<EstadoSueca, 'juegos'>) => Math.max(...e.juegos) >= JUEGOS_PARTIDA_SUECA;

function nuevaMano(
  base: Pick<EstadoSueca, 'config' | 'resultadosManos' | 'juegos' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoSueca {
  const { cartas, azar: sig } = barajar(BARAJA_SUECA, azar);
  // Desde el siguiente al repartidor: la última carta es la suya.
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_EN_MANO,
      (k + 1) * CARTAS_EN_MANO,
    );
  }
  const cartaTriunfo = cartas[JUGADORES * CARTAS_EN_MANO - 1]!;
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    triunfo: paloSueca(cartaTriunfo),
    cartaTriunfo,
    turno: siguiente(repartidor),
    mesa: [],
    bazas: [0, 0, 0, 0],
    puntosMano: [0, 0],
    fallos: Array.from({ length: JUGADORES }, () => []),
  };
}

function cerrarMano(e: EstadoSueca): EstadoSueca {
  const [p0, p1] = e.puntosMano;
  const gana: ParejaSueca | null = p0 > p1 ? 0 : p1 > p0 ? 1 : null;
  const juegosGanados = gana === null ? 0 : juegosPorPuntosSueca(e.puntosMano[gana]);
  const juegos: [number, number] = [e.juegos[0], e.juegos[1]];
  if (gana !== null) juegos[gana] += juegosGanados;
  const resultadosManos = [
    ...e.resultadosManos,
    { triunfo: e.triunfo, puntos: e.puntosMano, gana, juegosGanados, juegosTras: juegos },
  ];
  const cerrado: EstadoSueca = { ...e, resultadosManos, juegos };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoSueca): EstadoSueca {
  const ganador = ganadoraSueca(e.mesa, e.triunfo).asiento;
  const puntos = e.mesa.reduce((s, j) => s + puntosCartaSueca(j.carta), 0);
  const p = parejaSueca(ganador);
  const resuelto: EstadoSueca = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    puntosMano:
      p === 0
        ? [e.puntosMano[0] + puntos, e.puntosMano[1]]
        : [e.puntosMano[0], e.puntosMano[1] + puntos],
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const sueca: Juego<ConfigSueca, EstadoSueca, AccionSueca, VistaSueca> = {
  id: 'sueca',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('La Sueca se juega con 4 jugadores');
    return ok(
      nuevaMano(
        { config: { jugadores: 4 }, resultadosManos: [], juegos: [0, 0], ultimaBaza: null },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    return cartasLegalesSueca(e.manos[asiento]!, e.mesa)
      .sort()
      .map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const salida = paloSueca(mesa[0]!.carta);
    const falla = paloSueca(accion.carta) !== salida;
    const jugado: EstadoSueca = {
      ...e,
      manos,
      mesa,
      cartaTriunfo: accion.carta === e.cartaTriunfo ? null : e.cartaTriunfo,
      fallos:
        falla && !e.fallos[asiento]!.includes(salida)
          ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f))
          : e.fallos,
    };
    return mesa.length < JUGADORES
      ? { ...jugado, turno: siguiente(asiento) }
      : resolverBaza(jugado);
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      triunfo: e.triunfo,
      cartaTriunfo: e.cartaTriunfo,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      puntosMano: e.puntosMano,
      jugadas: cartasFuera(
        BARAJA_SUECA,
        ...e.manos,
        e.mesa.map((j) => j.carta),
      ),
      fallos: e.fallos.map((f) => [...f]),
      resultadosManos: [...e.resultadosManos],
      juegos: e.juegos,
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const gana = e.juegos[0] > e.juegos[1] ? 0 : 1;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.juegos[parejaSueca(a)]),
    };
  },
};
