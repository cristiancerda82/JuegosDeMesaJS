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

export interface ConfigCorazones {
  /** Pasar 3 cartas antes de cada mano (al siguiente, al anterior, al de enfrente, sin pase). */
  readonly pase: boolean;
  /** La partida termina al acabar la mano en la que alguien llega a estos puntos. */
  readonly fin: 100 | 50;
}

export const CONFIG_CORAZONES_POR_DEFECTO: ConfigCorazones = { pase: true, fin: 100 };

export interface ResultadoManoCorazones {
  /** Puntos que suma cada jugador en la mano, con la luna ya aplicada. */
  readonly puntos: readonly number[];
  /** Quién tiró la luna, si alguien lo hizo. */
  readonly luna: Asiento | null;
  readonly totalesTras: readonly number[];
}

export interface EstadoCorazones {
  readonly config: ConfigCorazones;
  readonly azar: EstadoAzar;
  /** Mano en curso, desde 0: decide la dirección del pase. */
  readonly numeroMano: number;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: 'pase' | 'juego';
  /** Cartas elegidas para pasar por cada jugador; `null` si aún no eligió. */
  readonly pases: readonly (readonly IdCarta[] | null)[];
  /** Cartas que recibió cada jugador en el pase de esta mano. */
  readonly recibidas: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazasJugadas: number;
  /** Ya se ha echado algún corazón en la mano. */
  readonly rotos: boolean;
  /** Puntos de las bazas que lleva cada jugador en la mano en curso. */
  readonly puntosMano: readonly number[];
  readonly resultadosManos: readonly ResultadoManoCorazones[];
  readonly totales: readonly number[];
}

export type AccionCorazones =
  | { readonly tipo: 'pasar'; readonly cartas: readonly IdCarta[] }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaCorazones {
  readonly config: ConfigCorazones;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly fase: EstadoCorazones['fase'];
  /** A cuántos asientos de distancia se pasa en esta mano (0: sin pase). */
  readonly direccionPase: number;
  /** Cartas que eligió el propio jugador para pasar, mientras dura el pase. */
  readonly miPase: readonly IdCarta[] | null;
  /** Quién ya eligió sus cartas para pasar. */
  readonly pasaron: readonly boolean[];
  /** Cartas que recibió el propio jugador, durante la primera baza. */
  readonly recibidas: readonly IdCarta[] | null;
  readonly turno: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoCorazones['ultimaBaza'];
  readonly bazasJugadas: number;
  /** Cartas ya jugadas en bazas de la mano, a la vista de todos cuando se jugaron. */
  readonly jugadas: readonly IdCarta[];
  readonly rotos: boolean;
  readonly puntosMano: readonly number[];
  readonly numeroMano: number;
  readonly resultadosManos: readonly ResultadoManoCorazones[];
  readonly totales: readonly number[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 13;
const DOS_DE_TREBOLES: IdCarta = 'treboles-2';
const REINA_DE_PICAS: IdCarta = 'picas-12';
const PUNTOS_TOTALES = 26;
/** Desplazamiento del pase en cada mano: al siguiente, al anterior, al de enfrente, sin pase. */
const DIRECCIONES = [1, 3, 2, 0] as const;

export const paloCorazones = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** Rango para ganar bazas: el As es la más alta (14). */
export const rangoCorazones = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
/** Puntos de una carta: 1 cada corazón y 13 la Q de picas. */
export const puntosCorazones = (c: IdCarta) =>
  c === REINA_DE_PICAS ? 13 : paloCorazones(c) === 'corazones' ? 1 : 0;

export const direccionPase = (config: ConfigCorazones, numeroMano: number) =>
  config.pase ? DIRECCIONES[numeroMano % DIRECCIONES.length]! : 0;

/** Carta que gana la baza: la más alta del palo de salida. */
export function ganadoraCorazones(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = paloCorazones(mesa[0]!.carta);
  return mesa.reduce((mejor, j) =>
    paloCorazones(j.carta) === salida && rangoCorazones(j.carta) > rangoCorazones(mejor.carta)
      ? j
      : mejor,
  );
}

const partidaTerminada = (e: EstadoCorazones) =>
  e.resultadosManos.length > 0 && Math.max(...e.totales) >= e.config.fin;

/** Cartas que el jugador puede jugar ahora. */
function cartasLegales(e: EstadoCorazones, asiento: Asiento): IdCarta[] {
  const mano = e.manos[asiento]!;
  if (mano.includes(DOS_DE_TREBOLES)) return [DOS_DE_TREBOLES];
  const primeraBaza = e.bazasJugadas === 0;
  const sinPuntos = (cs: IdCarta[]) => {
    const limpias = cs.filter((c) => puntosCorazones(c) === 0);
    return primeraBaza && limpias.length > 0 ? limpias : cs;
  };
  if (e.mesa.length > 0) {
    const salida = paloCorazones(e.mesa[0]!.carta);
    const delPalo = mano.filter((c) => paloCorazones(c) === salida);
    return delPalo.length > 0 ? delPalo : sinPuntos([...mano]);
  }
  if (!e.rotos) {
    const sinCorazones = mano.filter((c) => paloCorazones(c) !== 'corazones');
    if (sinCorazones.length > 0) return sinPuntos(sinCorazones);
  }
  return sinPuntos([...mano]);
}

/** Combinaciones de 3 cartas de la mano (las que se pasan), en orden. */
function combinaciones(mano: readonly IdCarta[]): IdCarta[][] {
  const resultado: IdCarta[][] = [];
  for (let i = 0; i < mano.length; i++) {
    for (let j = i + 1; j < mano.length; j++) {
      for (let k = j + 1; k < mano.length; k++) resultado.push([mano[i]!, mano[j]!, mano[k]!]);
    }
  }
  return resultado;
}

const quienTieneElDos = (manos: readonly (readonly IdCarta[])[]) =>
  manos.findIndex((m) => m.includes(DOS_DE_TREBOLES));

function nuevaMano(
  config: ConfigCorazones,
  azar: EstadoAzar,
  numeroMano: number,
  resultadosManos: readonly ResultadoManoCorazones[],
  totales: readonly number[],
  ultimaBaza: EstadoCorazones['ultimaBaza'],
): EstadoCorazones {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const reparto = repartir(cartas, new Array<number>(JUGADORES).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = reparto.valor.manos;
  const conPase = direccionPase(config, numeroMano) !== 0;
  return {
    config,
    azar: azarSiguiente,
    numeroMano,
    manos,
    fase: conPase ? 'pase' : 'juego',
    pases: new Array<IdCarta[] | null>(JUGADORES).fill(null),
    recibidas: Array.from({ length: JUGADORES }, () => []),
    turno: conPase ? 0 : quienTieneElDos(manos),
    mesa: [],
    ultimaBaza,
    bazasJugadas: 0,
    rotos: false,
    puntosMano: new Array<number>(JUGADORES).fill(0),
    resultadosManos,
    totales,
  };
}

function entregarPases(e: EstadoCorazones): EstadoCorazones {
  const d = direccionPase(e.config, e.numeroMano);
  const recibidas = Array.from(
    { length: JUGADORES },
    (_, a) => e.pases[(a - d + JUGADORES) % JUGADORES]!,
  );
  const manos = e.manos.map((m, a) => [
    ...m.filter((c) => !e.pases[a]!.includes(c)),
    ...recibidas[a]!,
  ]);
  return { ...e, manos, recibidas, fase: 'juego', turno: quienTieneElDos(manos) };
}

function cerrarMano(e: EstadoCorazones): EstadoCorazones {
  const luna = e.puntosMano.findIndex((p) => p === PUNTOS_TOTALES);
  const puntos =
    luna === -1 ? [...e.puntosMano] : e.puntosMano.map((_, a) => (a === luna ? 0 : PUNTOS_TOTALES));
  const totales = e.totales.map((t, a) => t + puntos[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    { puntos, luna: luna === -1 ? null : luna, totalesTras: totales },
  ];
  const cerrado: EstadoCorazones = { ...e, resultadosManos, totales };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, e.numeroMano + 1, resultadosManos, totales, e.ultimaBaza);
}

function resolverBaza(e: EstadoCorazones): EstadoCorazones {
  const ganador = ganadoraCorazones(e.mesa).asiento;
  const valor = e.mesa.reduce((s, j) => s + puntosCorazones(j.carta), 0);
  const resuelto: EstadoCorazones = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazasJugadas: e.bazasJugadas + 1,
    puntosMano: e.puntosMano.map((p, a) => (a === ganador ? p + valor : p)),
  };
  return resuelto.bazasJugadas === CARTAS_EN_MANO ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const corazones: Juego<ConfigCorazones, EstadoCorazones, AccionCorazones, VistaCorazones> = {
  id: 'corazones',

  crear(config, semilla) {
    if (typeof config.pase !== 'boolean') return error('Opción de pase inválida');
    if (config.fin !== 100 && config.fin !== 50) {
      return error('La partida termina a 100 o a 50 puntos');
    }
    const limpia: ConfigCorazones = { pase: config.pase, fin: config.fin };
    return ok(
      nuevaMano(limpia, crearAzar(semilla), 0, [], new Array<number>(JUGADORES).fill(0), null),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'pase') {
      return combinaciones(e.manos[asiento]!).map((cartas) => ({ tipo: 'pasar', cartas }));
    }
    return cartasLegales(e, asiento).map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'pasar') {
      const pases = e.pases.map((p, a) => (a === asiento ? accion.cartas : p));
      const elegido: EstadoCorazones = { ...e, pases, turno: (asiento + 1) % JUGADORES };
      return pases.every((p) => p !== null) ? entregarPases(elegido) : elegido;
    }
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const jugado: EstadoCorazones = {
      ...e,
      manos,
      mesa,
      rotos: e.rotos || paloCorazones(accion.carta) === 'corazones',
    };
    return mesa.length < JUGADORES
      ? { ...jugado, turno: (asiento + 1) % JUGADORES }
      : resolverBaza(jugado);
  },

  vistaDe(e, asiento) {
    const propio = asiento === null ? null : asiento;
    return {
      config: e.config,
      asiento,
      miMano: propio === null ? null : [...e.manos[propio]!],
      cartasEnMano: e.manos.map((m) => m.length),
      fase: e.fase,
      direccionPase: direccionPase(e.config, e.numeroMano),
      miPase: propio === null || e.fase !== 'pase' ? null : (e.pases[propio] ?? null),
      pasaron: e.pases.map((p) => p !== null),
      recibidas:
        propio === null || e.fase !== 'juego' || e.bazasJugadas > 0
          ? null
          : [...e.recibidas[propio]!],
      turno: partidaTerminada(e) ? null : e.turno,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazasJugadas: e.bazasJugadas,
      jugadas: cartasFuera(
        crearBaraja('francesa52'),
        ...e.manos,
        e.mesa.map((j) => j.carta),
      ),
      rotos: e.rotos,
      puntosMano: [...e.puntosMano],
      numeroMano: e.numeroMano,
      resultadosManos: [...e.resultadosManos],
      totales: [...e.totales],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const minimo = Math.min(...e.totales);
    const ganadores = e.totales.flatMap((t, a) => (t === minimo ? [a] : []));
    const puntos = [...e.totales];
    if (ganadores.length === JUGADORES) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
