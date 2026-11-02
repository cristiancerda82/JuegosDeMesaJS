import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  cartasFuera,
  crearBaraja,
  type IdCarta,
  type PaloEspanol,
} from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** 4 jugadores en parejas; la meta va en la config para que las pruebas usen partidas cortas. */
export interface ConfigTressette {
  readonly jugadores: 4;
  readonly meta: number;
}

export const CONFIG_TRESSETTE_POR_DEFECTO: ConfigTressette = { jugadores: 4, meta: 21 };

export type ParejaTressette = 0 | 1;
type DePareja<T> = readonly [T, T];

export interface ResultadoManoTressette {
  /** Tercios de punto de cada pareja, con los 3 de la última baza. */
  readonly tercios: DePareja<number>;
  /** La pareja que se llevó la última baza. */
  readonly ultima: ParejaTressette;
  /** Puntos enteros que anota cada pareja. */
  readonly puntos: DePareja<number>;
  readonly puntosTras: DePareja<number>;
}

export interface EstadoTressette {
  readonly config: ConfigTressette;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Bazas ganadas por cada jugador en la mano. */
  readonly bazas: readonly number[];
  /** Tercios de punto de cada pareja en la mano (sin la última baza hasta que se juega). */
  readonly tercios: DePareja<number>;
  /** Palos de salida que cada jugador no ha seguido en la mano. */
  readonly fallos: readonly (readonly PaloEspanol[])[];
  readonly resultadosManos: readonly ResultadoManoTressette[];
  readonly puntos: DePareja<number>;
}

export type AccionTressette = { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaTressette {
  readonly config: ConfigTressette;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoTressette['ultimaBaza'];
  readonly bazas: readonly number[];
  readonly tercios: DePareja<number>;
  /** Cartas ya jugadas en la mano (las que no están en ninguna mano ni en la mesa). */
  readonly jugadas: readonly IdCarta[];
  readonly fallos: readonly (readonly PaloEspanol[])[];
  readonly resultadosManos: readonly ResultadoManoTressette[];
  readonly puntos: DePareja<number>;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const BARAJA_TRESSETTE: readonly IdCarta[] = crearBaraja('espanola40');

export const paloTressette = (c: IdCarta) => cartaDeId(c)!.palo as PaloEspanol;

/** Rango para ganar bazas: 3 10, 2 9, As 8, rey 7, caballo 6, sota 5, y del 7 al 4, 4 a 1. */
export function rangoTressette(c: IdCarta): number {
  const v = cartaDeId(c)!.valor;
  return ({ 3: 10, 2: 9, 1: 8, 12: 7, 11: 6, 10: 5 } as Record<number, number>)[v] ?? v - 3;
}

/** Tercios de punto de una carta: el As 3; el 3, el 2 y las figuras 1; las demás 0. */
export function terciosCartaTressette(c: IdCarta): number {
  const r = rangoTressette(c);
  return r === 8 ? 3 : r >= 5 ? 1 : 0;
}

/** Tercios que vale la última baza. */
export const TERCIOS_ULTIMA_TRESSETTE = 3;

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 10;

export const parejaTressette = (asiento: Asiento): ParejaTressette =>
  (asiento % 2) as ParejaTressette;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: la más alta del palo de salida (no hay triunfo). */
export function ganadoraTressette(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = paloTressette(mesa[0]!.carta);
  const valor = (c: IdCarta) => (paloTressette(c) === salida ? rangoTressette(c) : 0);
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar: las del palo de salida si tiene. */
export function cartasLegalesTressette(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloTressette(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloTressette(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

/** Gana la pareja que llega a la meta con más puntos que la otra. */
const terminada = (e: Pick<EstadoTressette, 'config' | 'puntos'>) =>
  Math.max(...e.puntos) >= e.config.meta && e.puntos[0] !== e.puntos[1];

function nuevaMano(
  base: Pick<EstadoTressette, 'config' | 'resultadosManos' | 'puntos' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoTressette {
  const { cartas, azar: sig } = barajar(BARAJA_TRESSETTE, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_EN_MANO,
      (k + 1) * CARTAS_EN_MANO,
    );
  }
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    turno: siguiente(repartidor),
    mesa: [],
    bazas: [0, 0, 0, 0],
    tercios: [0, 0],
    fallos: Array.from({ length: JUGADORES }, () => []),
  };
}

/** Puntos que anota cada pareja con sus tercios: solo los enteros. */
export function puntosManoTressette(tercios: DePareja<number>): [number, number] {
  return [Math.floor(tercios[0] / 3), Math.floor(tercios[1] / 3)];
}

function cerrarMano(e: EstadoTressette, ultima: ParejaTressette): EstadoTressette {
  const tercios: [number, number] = [e.tercios[0], e.tercios[1]];
  tercios[ultima] += TERCIOS_ULTIMA_TRESSETTE;
  const puntos = puntosManoTressette(tercios);
  const puntosTras: [number, number] = [e.puntos[0] + puntos[0], e.puntos[1] + puntos[1]];
  const cerrado: EstadoTressette = {
    ...e,
    tercios,
    resultadosManos: [...e.resultadosManos, { tercios, ultima, puntos, puntosTras }],
    puntos: puntosTras,
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoTressette): EstadoTressette {
  const ganador = ganadoraTressette(e.mesa).asiento;
  const tercios = e.mesa.reduce((s, j) => s + terciosCartaTressette(j.carta), 0);
  const p = parejaTressette(ganador);
  const resuelto: EstadoTressette = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    tercios:
      p === 0 ? [e.tercios[0] + tercios, e.tercios[1]] : [e.tercios[0], e.tercios[1] + tercios],
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto, p) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const tressette: Juego<ConfigTressette, EstadoTressette, AccionTressette, VistaTressette> = {
  id: 'tressette',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Tressette se juega con 4 jugadores');
    if (!Number.isInteger(config.meta) || config.meta < 1) {
      return error('La meta del Tressette debe ser un entero positivo');
    }
    return ok(
      nuevaMano(
        {
          config: { jugadores: 4, meta: config.meta },
          resultadosManos: [],
          puntos: [0, 0],
          ultimaBaza: null,
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    return cartasLegalesTressette(e.manos[asiento]!, e.mesa)
      .sort()
      .map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const salida = paloTressette(mesa[0]!.carta);
    const falla = paloTressette(accion.carta) !== salida;
    const jugado: EstadoTressette = {
      ...e,
      manos,
      mesa,
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
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      tercios: e.tercios,
      jugadas: cartasFuera(
        BARAJA_TRESSETTE,
        ...e.manos,
        e.mesa.map((j) => j.carta),
      ),
      fallos: e.fallos.map((f) => [...f]),
      resultadosManos: [...e.resultadosManos],
      puntos: e.puntos,
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaTressette(a)]),
    };
  },
};
