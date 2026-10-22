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

/** Picas no tiene opciones de reglas: 4 jugadores en parejas, con Nil y partida a 500. */
export interface ConfigPicas {
  readonly jugadores: 4;
}

export const CONFIG_PICAS_POR_DEFECTO: ConfigPicas = { jugadores: 4 };

/** Puntos con los que se gana la partida. */
export const OBJETIVO_PICAS = 500;
/** Apuesta de Nil: ninguna baza. */
export const NIL = 0;

export type Pareja = 0 | 1;
export type DePareja<T> = readonly [T, T];

export interface ResultadoManoPicas {
  readonly apuestas: readonly number[];
  readonly bazas: readonly number[];
  readonly contratos: DePareja<number>;
  /** Bazas de la pareja que cuentan para el contrato (sin las del que dijo Nil). */
  readonly bazasContrato: DePareja<number>;
  readonly puntosMano: DePareja<number>;
  /** Sacos que suma cada pareja en esta mano. */
  readonly sacosMano: DePareja<number>;
  /** La pareja llegó a 10 sacos y perdió 100 puntos. */
  readonly penalizacion: DePareja<boolean>;
  readonly puntosTras: DePareja<number>;
  readonly sacosTras: DePareja<number>;
}

export interface EstadoPicas {
  readonly config: ConfigPicas;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: 'apuesta' | 'bazas';
  readonly turno: Asiento;
  /** Bazas que apostó cada uno (0 es Nil); `null` si aún no ha apostado. */
  readonly apuestas: readonly (number | null)[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Bazas que lleva cada jugador en la mano. */
  readonly bazas: readonly number[];
  /** Ya se ha echado una pica en una baza que no salió de picas. */
  readonly rotas: boolean;
  /** Palos de salida que cada jugador no siguió en esta mano: no le quedan. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoPicas[];
  readonly puntos: DePareja<number>;
  readonly sacos: DePareja<number>;
}

export type AccionPicas =
  | { readonly tipo: 'apostar'; readonly bazas: number }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaPicas {
  readonly config: ConfigPicas;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly fase: EstadoPicas['fase'];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly apuestas: readonly (number | null)[];
  /** Contrato de cada pareja: la suma de las apuestas de sus jugadores, sin los Nil. */
  readonly contratos: DePareja<number>;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoPicas['ultimaBaza'];
  readonly bazas: readonly number[];
  /** Cartas ya jugadas en bazas de la mano, a la vista de todos cuando se jugaron. */
  readonly jugadas: readonly IdCarta[];
  readonly rotas: boolean;
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoPicas[];
  readonly puntos: DePareja<number>;
  readonly sacos: DePareja<number>;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 13;
const SACOS_PARA_PENALIZAR = 10;
const PENALIZACION_SACOS = 100;
const PUNTOS_NIL = 100;

export const paloPicas = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** Rango para ganar bazas: el As es la más alta (14). */
export const rangoPicas = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
export const esPica = (c: IdCarta) => paloPicas(c) === 'picas';
export const parejaPicas = (asiento: Asiento): Pareja => (asiento % 2) as Pareja;

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: la pica más alta o, sin picas, la más alta del palo de salida. */
export function ganadoraPicas(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = paloPicas(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    esPica(c) ? 100 + rangoPicas(c) : paloPicas(c) === salida ? rangoPicas(c) : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Contrato de cada pareja con estas apuestas (las que falten cuentan 0). */
export function contratosPicas(apuestas: readonly (number | null)[]): [number, number] {
  const c: [number, number] = [0, 0];
  apuestas.forEach((b, a) => (c[parejaPicas(a)] += b ?? 0));
  return c;
}

/** Cartas que el jugador puede jugar ahora. */
export function cartasLegalesPicas(
  e: Pick<EstadoPicas, 'manos' | 'mesa' | 'rotas'>,
  asiento: Asiento,
): IdCarta[] {
  const mano = e.manos[asiento]!;
  if (e.mesa.length > 0) {
    const salida = paloPicas(e.mesa[0]!.carta);
    const delPalo = mano.filter((c) => paloPicas(c) === salida);
    return delPalo.length > 0 ? delPalo : [...mano];
  }
  if (!e.rotas) {
    const sinPicas = mano.filter((c) => !esPica(c));
    if (sinPicas.length > 0) return sinPicas;
  }
  return [...mano];
}

const partidaTerminada = (e: Pick<EstadoPicas, 'puntos'>) =>
  Math.max(...e.puntos) >= OBJETIVO_PICAS && e.puntos[0] !== e.puntos[1];

function nuevaMano(
  config: ConfigPicas,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoPicas[],
  puntos: DePareja<number>,
  sacos: DePareja<number>,
  ultimaBaza: EstadoPicas['ultimaBaza'],
): EstadoPicas {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const reparto = repartir(cartas, new Array<number>(JUGADORES).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos: reparto.valor.manos,
    fase: 'apuesta',
    turno: siguiente(repartidor),
    apuestas: new Array<number | null>(JUGADORES).fill(null),
    mesa: [],
    ultimaBaza,
    bazas: new Array<number>(JUGADORES).fill(0),
    rotas: false,
    fallos: Array.from({ length: JUGADORES }, () => []),
    resultadosManos,
    puntos,
    sacos,
  };
}

/** Puntos y sacos de cada pareja al acabar la mano (spec juego-picas). */
export function puntuarManoPicas(
  apuestas: readonly number[],
  bazas: readonly number[],
  sacosAntes: DePareja<number>,
): Omit<ResultadoManoPicas, 'apuestas' | 'bazas' | 'puntosTras'> {
  const contratos = contratosPicas(apuestas);
  const bazasContrato: [number, number] = [0, 0];
  const puntosMano: [number, number] = [0, 0];
  const sacosMano: [number, number] = [0, 0];
  apuestas.forEach((b, a) => {
    const p = parejaPicas(a);
    if (b === NIL) {
      puntosMano[p] += bazas[a] === 0 ? PUNTOS_NIL : -PUNTOS_NIL;
      sacosMano[p] += bazas[a]!;
    } else {
      bazasContrato[p] += bazas[a]!;
    }
  });
  for (const p of [0, 1] as const) {
    const contrato = contratos[p];
    if (contrato === 0) {
      sacosMano[p] += bazasContrato[p];
      puntosMano[p] += bazasContrato[p];
    } else if (bazasContrato[p] >= contrato) {
      const deMas = bazasContrato[p] - contrato;
      puntosMano[p] += 10 * contrato + deMas;
      sacosMano[p] += deMas;
    } else {
      puntosMano[p] -= 10 * contrato;
    }
  }
  const penalizacion: [boolean, boolean] = [false, false];
  const sacosTras: [number, number] = [0, 0];
  for (const p of [0, 1] as const) {
    let s = sacosAntes[p] + sacosMano[p];
    if (s >= SACOS_PARA_PENALIZAR) {
      penalizacion[p] = true;
      puntosMano[p] -= PENALIZACION_SACOS;
      s -= SACOS_PARA_PENALIZAR;
    }
    sacosTras[p] = s;
  }
  return { contratos, bazasContrato, puntosMano, sacosMano, penalizacion, sacosTras };
}

function cerrarMano(e: EstadoPicas): EstadoPicas {
  const apuestas = e.apuestas.map((b) => b ?? 0);
  const r = puntuarManoPicas(apuestas, e.bazas, e.sacos);
  const puntos: DePareja<number> = [e.puntos[0] + r.puntosMano[0], e.puntos[1] + r.puntosMano[1]];
  const resultadosManos = [
    ...e.resultadosManos,
    { apuestas, bazas: [...e.bazas], ...r, puntosTras: puntos },
  ];
  const cerrado: EstadoPicas = { ...e, resultadosManos, puntos, sacos: r.sacosTras };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor),
    resultadosManos,
    puntos,
    r.sacosTras,
    e.ultimaBaza,
  );
}

function resolverBaza(e: EstadoPicas): EstadoPicas {
  const ganador = ganadoraPicas(e.mesa).asiento;
  const resuelto: EstadoPicas = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const picas: Juego<ConfigPicas, EstadoPicas, AccionPicas, VistaPicas> = {
  id: 'picas',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('Picas se juega con 4 jugadores');
    return ok(
      nuevaMano({ jugadores: 4 }, crearAzar(semilla), JUGADORES - 1, [], [0, 0], [0, 0], null),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'apuesta') {
      return Array.from({ length: CARTAS_EN_MANO + 1 }, (_, bazas) => ({ tipo: 'apostar', bazas }));
    }
    return cartasLegalesPicas(e, asiento).map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'apostar') {
      const apuestas = e.apuestas.map((b, a) => (a === asiento ? accion.bazas : b));
      const todas = apuestas.every((b) => b !== null);
      return {
        ...e,
        apuestas,
        fase: todas ? 'bazas' : 'apuesta',
        turno: todas ? siguiente(e.repartidor) : siguiente(asiento),
      };
    }
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const salida = paloPicas(mesa[0]!.carta);
    const palo = paloPicas(accion.carta);
    const falla = palo !== salida;
    const jugado: EstadoPicas = {
      ...e,
      manos,
      mesa,
      rotas: e.rotas || (palo === 'picas' && salida !== 'picas'),
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
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      apuestas: [...e.apuestas],
      contratos: contratosPicas(e.apuestas),
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      jugadas: cartasFuera(
        crearBaraja('francesa52'),
        ...e.manos,
        e.mesa.map((j) => j.carta),
      ),
      rotas: e.rotas,
      fallos: e.fallos.map((f) => [...f]),
      resultadosManos: [...e.resultadosManos],
      puntos: e.puntos,
      sacos: e.sacos,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaPicas(a)]),
    };
  },
};
