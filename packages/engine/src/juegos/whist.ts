import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  cartasFuera,
  crearBaraja,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** El Whist clásico no tiene opciones: 4 jugadores en parejas, juegos a 5 y al mejor de tres. */
export interface ConfigWhist {
  readonly jugadores: 4;
}

export const CONFIG_WHIST_POR_DEFECTO: ConfigWhist = { jugadores: 4 };

/** Puntos con los que se gana un juego. */
export const PUNTOS_JUEGO_WHIST = 5;
/** Juegos con los que se gana la partida. */
export const JUEGOS_PARTIDA_WHIST = 2;
/** Bazas que hay que pasar para sumar puntos. */
export const BAZAS_LIBRES_WHIST = 6;

export type ParejaWhist = 0 | 1;
type DePareja<T> = readonly [T, T];

export interface ResultadoManoWhist {
  readonly triunfo: PaloFrances;
  readonly bazas: DePareja<number>;
  readonly puntosMano: DePareja<number>;
  /** Puntos del juego tras la mano (antes de volver a 0 si alguien lo gana). */
  readonly puntosTras: DePareja<number>;
  /** La pareja que gana el juego con esta mano; `null` si no lo gana nadie. */
  readonly ganaJuego: ParejaWhist | null;
  readonly juegosTras: DePareja<number>;
}

export interface EstadoWhist {
  readonly config: ConfigWhist;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly triunfo: PaloFrances;
  /** La carta descubierta del triunfo, mientras siga en la mano del repartidor. */
  readonly cartaTriunfo: IdCarta | null;
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Bazas que lleva cada jugador en la mano. */
  readonly bazas: readonly number[];
  /** Palos de salida que cada jugador no siguió en esta mano: no le quedan. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoWhist[];
  /** Puntos del juego en curso. */
  readonly puntos: DePareja<number>;
  readonly juegos: DePareja<number>;
}

export type AccionWhist = { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaWhist {
  readonly config: ConfigWhist;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly triunfo: PaloFrances;
  readonly cartaTriunfo: IdCarta | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoWhist['ultimaBaza'];
  readonly bazas: readonly number[];
  /** Cartas ya jugadas en bazas de la mano, a la vista de todos cuando se jugaron. */
  readonly jugadas: readonly IdCarta[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoWhist[];
  readonly puntos: DePareja<number>;
  readonly juegos: DePareja<number>;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 13;

export const paloWhist = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** Rango para ganar bazas: el As es la más alta (14). */
export const rangoWhist = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
export const parejaWhist = (asiento: Asiento): ParejaWhist => (asiento % 2) as ParejaWhist;

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: el triunfo más alto o, sin triunfos, la más alta del palo de salida. */
export function ganadoraWhist(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloWhist(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    paloWhist(c) === triunfo ? 100 + rangoWhist(c) : paloWhist(c) === salida ? rangoWhist(c) : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que el jugador puede jugar ahora: las del palo de salida si tiene. */
export function cartasLegalesWhist(
  e: Pick<EstadoWhist, 'manos' | 'mesa'>,
  asiento: Asiento,
): IdCarta[] {
  const mano = e.manos[asiento]!;
  if (e.mesa.length === 0) return [...mano];
  const salida = paloWhist(e.mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloWhist(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

const partidaTerminada = (e: Pick<EstadoWhist, 'juegos'>) =>
  Math.max(...e.juegos) >= JUEGOS_PARTIDA_WHIST;

function nuevaMano(
  config: ConfigWhist,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoWhist[],
  puntos: DePareja<number>,
  juegos: DePareja<number>,
  ultimaBaza: EstadoWhist['ultimaBaza'],
): EstadoWhist {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const reparto = repartir(cartas, new Array<number>(JUGADORES).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  // Una a una desde la izquierda del repartidor: la última carta es la suya.
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++)
    manos[(repartidor + 1 + k) % JUGADORES] = reparto.valor.manos[k]!;
  const cartaTriunfo = cartas[JUGADORES * CARTAS_EN_MANO - 1]!;
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    triunfo: paloWhist(cartaTriunfo),
    cartaTriunfo,
    turno: siguiente(repartidor),
    mesa: [],
    ultimaBaza,
    bazas: new Array<number>(JUGADORES).fill(0),
    fallos: Array.from({ length: JUGADORES }, () => []),
    resultadosManos,
    puntos,
    juegos,
  };
}

function cerrarMano(e: EstadoWhist): EstadoWhist {
  const bazas: [number, number] = [0, 0];
  e.bazas.forEach((b, a) => (bazas[parejaWhist(a)] += b));
  const puntosMano: [number, number] = [
    Math.max(0, bazas[0] - BAZAS_LIBRES_WHIST),
    Math.max(0, bazas[1] - BAZAS_LIBRES_WHIST),
  ];
  const puntosTras: [number, number] = [e.puntos[0] + puntosMano[0], e.puntos[1] + puntosMano[1]];
  const gana = ([0, 1] as const).find((p) => puntosTras[p] >= PUNTOS_JUEGO_WHIST) ?? null;
  const juegos: [number, number] = [e.juegos[0], e.juegos[1]];
  if (gana !== null) juegos[gana]++;
  const resultadosManos = [
    ...e.resultadosManos,
    { triunfo: e.triunfo, bazas, puntosMano, puntosTras, ganaJuego: gana, juegosTras: juegos },
  ];
  const puntos: DePareja<number> = gana !== null ? [0, 0] : puntosTras;
  const cerrado: EstadoWhist = { ...e, resultadosManos, puntos, juegos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor),
    resultadosManos,
    puntos,
    juegos,
    e.ultimaBaza,
  );
}

function resolverBaza(e: EstadoWhist): EstadoWhist {
  const ganador = ganadoraWhist(e.mesa, e.triunfo).asiento;
  const resuelto: EstadoWhist = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const whist: Juego<ConfigWhist, EstadoWhist, AccionWhist, VistaWhist> = {
  id: 'whist',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Whist se juega con 4 jugadores');
    return ok(
      nuevaMano({ jugadores: 4 }, crearAzar(semilla), JUGADORES - 1, [], [0, 0], [0, 0], null),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    return cartasLegalesWhist(e, asiento).map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const salida = paloWhist(mesa[0]!.carta);
    const falla = paloWhist(accion.carta) !== salida;
    const jugado: EstadoWhist = {
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
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      triunfo: e.triunfo,
      cartaTriunfo: e.cartaTriunfo,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      jugadas: cartasFuera(
        crearBaraja('francesa52'),
        ...e.manos,
        e.mesa.map((j) => j.carta),
      ),
      fallos: e.fallos.map((f) => [...f]),
      resultadosManos: [...e.resultadosManos],
      puntos: e.puntos,
      juegos: e.juegos,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const gana = e.juegos[0] > e.juegos[1] ? 0 : 1;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.juegos[parejaWhist(a)]),
    };
  },
};
