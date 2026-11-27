import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  PALOS_ESPANOLES,
  type IdCarta,
  type PaloEspanol,
} from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  encajaEnEscaleras,
  type EscaleraCinquillo,
  type MesaCinquillo,
  type UltimaAccionCinquillo,
} from './cinquillo';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Jugadores posibles con cada baraja: los que la dividen, como pide el libro. */
export const JUGADORES_CUATRO_SEISES = { 40: [4, 5, 8], 48: [4, 6, 8] } as const;

export interface ConfigCuatroSeises {
  readonly baraja: 40 | 48;
  readonly jugadores: 4 | 5 | 6 | 8;
  /** Número de manos de la partida. */
  readonly manos: 1 | 3 | 5;
}

export const CONFIG_CUATRO_SEISES_POR_DEFECTO: ConfigCuatroSeises = {
  baraja: 40,
  jugadores: 4,
  manos: 3,
};

/** Lo que pone cada jugador en el fondo al empezar la mano, y cada vez que pasa. */
export const FICHAS_FONDO = 1;

export interface ResultadoManoCuatroSeises {
  readonly ganador: Asiento;
  /** Fichas que se llevó el ganador. */
  readonly fondo: number;
  readonly pases: readonly number[];
  /** Lo que ganó (o pagó, en negativo) cada uno en la mano. */
  readonly fichas: readonly number[];
  readonly saldosTras: readonly number[];
}

export interface EstadoCuatroSeises {
  readonly config: ConfigCuatroSeises;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mesa: MesaCinquillo;
  readonly turno: Asiento;
  readonly fondo: number;
  /** Veces que ha pasado cada uno en la mano. */
  readonly pases: readonly number[];
  /** Cartas que se sabe que no tiene cada uno: las que encajaban cuando pasó. */
  readonly noTiene: readonly (readonly IdCarta[])[];
  readonly ultimaAccion: UltimaAccionCinquillo | null;
  readonly saldos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoCuatroSeises[];
}

export type AccionCuatroSeises =
  { readonly tipo: 'jugar'; readonly carta: IdCarta } | { readonly tipo: 'pasar' };

export interface VistaCuatroSeises {
  readonly config: ConfigCuatroSeises;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mesa: MesaCinquillo;
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly fondo: number;
  readonly pases: readonly number[];
  readonly noTiene: readonly (readonly IdCarta[])[];
  readonly ultimaAccion: UltimaAccionCinquillo | null;
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly saldos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoCuatroSeises[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const ORDEN_40 = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
const ORDEN_48 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Orden de las cartas de cada palo en la escalera: con la de 48, el 8 y el 9 tras el 7. */
export const ordenCuatroSeises = (baraja: 40 | 48): readonly number[] =>
  baraja === 40 ? ORDEN_40 : ORDEN_48;

/** Posición de la carta en la escalera de su palo. */
export const posicionCuatroSeises = (id: IdCarta, baraja: 40 | 48) =>
  ordenCuatroSeises(baraja).indexOf(cartaDeId(id)!.valor);

/** La carta se puede poner: abre su palo con el 6 o alarga un extremo de su escalera. */
export const encajaCuatroSeises = (mesa: MesaCinquillo, carta: IdCarta, baraja: 40 | 48) =>
  encajaEnEscaleras(mesa, carta, ordenCuatroSeises(baraja), 6);

const paloDe = (id: IdCarta) => cartaDeId(id)!.palo as PaloEspanol;
const siguiente = (a: Asiento, n: number) => (a + 1) % n;

/** Las cartas que se pueden poner en la mesa: el 6 de cada palo sin abrir y las de los extremos. */
export function huecosCuatroSeises(mesa: MesaCinquillo, baraja: 40 | 48): IdCarta[] {
  const orden = ordenCuatroSeises(baraja);
  return PALOS_ESPANOLES.flatMap((palo) => {
    const e = mesa[palo];
    const posiciones = e === null ? [orden.indexOf(6)] : [e.bajo - 1, e.alto + 1];
    return posiciones
      .filter((p) => p >= 0 && p < orden.length)
      .map((p): IdCarta => `${palo}-${orden[p]!}`);
  });
}

const MESA_VACIA: MesaCinquillo = { oros: null, copas: null, espadas: null, bastos: null };

function cartasJugables(e: EstadoCuatroSeises, asiento: Asiento): IdCarta[] {
  const mano = e.manos[asiento]!;
  // La mano la abre el 6 de oros.
  if (e.mesa.oros === null) return mano.filter((c) => c === 'oros-6');
  return mano.filter((c) => encajaCuatroSeises(e.mesa, c, e.config.baraja));
}

const terminada = (e: Pick<EstadoCuatroSeises, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= e.config.manos;

function nuevaMano(
  base: Pick<EstadoCuatroSeises, 'config' | 'saldos' | 'resultadosManos' | 'ultimaAccion'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoCuatroSeises {
  const { baraja, jugadores: n } = base.config;
  const { cartas, azar: sig } = barajar(
    crearBaraja(baraja === 40 ? 'espanola40' : 'espanola48'),
    azar,
  );
  const sale = siguiente(repartidor, n);
  // De una en una desde el siguiente al que reparte, hasta acabar la baraja.
  const manos = Array.from({ length: n }, () => [] as IdCarta[]);
  cartas.forEach((c, i) => manos[(sale + i) % n]!.push(c));
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    mesa: MESA_VACIA,
    turno: manos.findIndex((m) => m.includes('oros-6')),
    fondo: n * FICHAS_FONDO,
    pases: new Array<number>(n).fill(0),
    noTiene: Array.from({ length: n }, () => []),
  };
}

function cerrarMano(e: EstadoCuatroSeises, ganador: Asiento): EstadoCuatroSeises {
  const fichas = e.pases.map(
    (p, a) => (a === ganador ? e.fondo : 0) - FICHAS_FONDO - p * FICHAS_FONDO,
  );
  const saldos = e.saldos.map((s, a) => s + fichas[a]!);
  const cerrado: EstadoCuatroSeises = {
    ...e,
    saldos,
    resultadosManos: [
      ...e.resultadosManos,
      { ganador, fondo: e.fondo, pases: e.pases, fichas, saldosTras: saldos },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, e.config.jugadores), e.azar);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cuatroSeises: Juego<
  ConfigCuatroSeises,
  EstadoCuatroSeises,
  AccionCuatroSeises,
  VistaCuatroSeises
> = {
  id: 'cuatro-seises',

  crear(config, semilla) {
    if (config.baraja !== 40 && config.baraja !== 48) {
      return error('La baraja debe ser de 40 o 48 cartas');
    }
    if (!(JUGADORES_CUATRO_SEISES[config.baraja] as readonly number[]).includes(config.jugadores)) {
      return error(
        config.baraja === 40
          ? 'Con la baraja de 40 se juega entre 4, 5 u 8'
          : 'Con la baraja de 48 se juega entre 4, 6 u 8',
      );
    }
    if (![1, 3, 5].includes(config.manos)) return error('La partida debe ser a 1, 3 o 5 manos');
    const limpia: ConfigCuatroSeises = {
      baraja: config.baraja,
      jugadores: config.jugadores,
      manos: config.manos,
    };
    const n = limpia.jugadores;
    return ok(
      nuevaMano(
        {
          config: limpia,
          saldos: new Array<number>(n).fill(0),
          resultadosManos: [],
          ultimaAccion: null,
        },
        n - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const jugables = cartasJugables(e, asiento);
    if (jugables.length === 0) return [{ tipo: 'pasar' }];
    return jugables.map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    if (accion.tipo === 'pasar') {
      return {
        ...e,
        turno: siguiente(asiento, n),
        fondo: e.fondo + FICHAS_FONDO,
        pases: e.pases.map((p, a) => (a === asiento ? p + 1 : p)),
        noTiene: e.noTiene.map((nt, a) =>
          a === asiento
            ? [...new Set([...nt, ...huecosCuatroSeises(e.mesa, e.config.baraja)])]
            : nt,
        ),
        ultimaAccion: { asiento, tipo: 'pasar' },
      };
    }
    const palo = paloDe(accion.carta);
    const pos = posicionCuatroSeises(accion.carta, e.config.baraja);
    const actual = e.mesa[palo];
    const escalera: EscaleraCinquillo =
      actual === null
        ? { bajo: pos, alto: pos }
        : { bajo: Math.min(actual.bajo, pos), alto: Math.max(actual.alto, pos) };
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const jugado: EstadoCuatroSeises = {
      ...e,
      manos,
      mesa: { ...e.mesa, [palo]: escalera },
      turno: siguiente(asiento, n),
      ultimaAccion: { asiento, tipo: 'jugar', carta: accion.carta },
    };
    return manos[asiento]!.length === 0 ? cerrarMano(jugado, asiento) : jugado;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mesa: e.mesa,
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      fondo: e.fondo,
      pases: [...e.pases],
      noTiene: e.noTiene.map((nt) => [...nt]),
      ultimaAccion: e.ultimaAccion,
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      saldos: [...e.saldos],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const maximo = Math.max(...e.saldos);
    const ganadores = e.saldos.flatMap((s, a) => (s === maximo ? [a] : []));
    const puntos = [...e.saldos];
    if (ganadores.length === e.saldos.length) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
