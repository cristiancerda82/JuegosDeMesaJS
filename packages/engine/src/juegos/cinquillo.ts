import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  PALOS_ESPANOLES,
  type IdCarta,
  type PaloEspanol,
} from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigCinquillo {
  readonly jugadores: 2 | 3 | 4;
  /** Número de manos de la partida. */
  readonly manos: 1 | 3 | 5;
}

export const CONFIG_CINQUILLO_POR_DEFECTO: ConfigCinquillo = { jugadores: 4, manos: 3 };

/** Extremos de la escalera de un palo, como índices en `ORDEN_CINQUILLO`. */
export interface EscaleraCinquillo {
  readonly bajo: number;
  readonly alto: number;
}

export type MesaCinquillo = Readonly<Record<PaloEspanol, EscaleraCinquillo | null>>;

export type UltimaAccionCinquillo =
  | { readonly asiento: Asiento; readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly asiento: Asiento; readonly tipo: 'pasar' };

export interface ResultadoManoCinquillo {
  readonly ganador: Asiento;
  readonly cartasRestantes: readonly number[];
  /** Puntos de penalización de la mano: las cartas que le quedaron a cada uno. */
  readonly puntos: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoCinquillo {
  readonly config: ConfigCinquillo;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mesa: MesaCinquillo;
  readonly turno: Asiento;
  readonly ultimaAccion: UltimaAccionCinquillo | null;
  readonly resultadosManos: readonly ResultadoManoCinquillo[];
  readonly totales: readonly number[];
}

export type AccionCinquillo =
  { readonly tipo: 'jugar'; readonly carta: IdCarta } | { readonly tipo: 'pasar' };

export interface VistaCinquillo {
  readonly config: ConfigCinquillo;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mesa: MesaCinquillo;
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly ultimaAccion: UltimaAccionCinquillo | null;
  readonly resultadosManos: readonly ResultadoManoCinquillo[];
  readonly totales: readonly number[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** Orden de las cartas de cada palo en la escalera: As, 2… 7, Sota, Caballo, Rey. */
export const ORDEN_CINQUILLO = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
const CINCO = ORDEN_CINQUILLO.indexOf(5);

const paloDe = (id: IdCarta) => cartaDeId(id)!.palo as PaloEspanol;
/** Posición de la carta en la escalera de su palo. */
export const posicionCinquillo = (id: IdCarta) =>
  (ORDEN_CINQUILLO as readonly number[]).indexOf(cartaDeId(id)!.valor);

const siguiente = (a: Asiento, n: number) => (a + 1) % n;

const MESA_VACIA: MesaCinquillo = { oros: null, copas: null, espadas: null, bastos: null };

/** La carta se puede poner en la mesa: abre su palo con el 5 o alarga un extremo. */
export function encajaEnMesa(mesa: MesaCinquillo, carta: IdCarta): boolean {
  const escalera = mesa[paloDe(carta)];
  const pos = posicionCinquillo(carta);
  if (escalera === null) return pos === CINCO;
  return pos === escalera.bajo - 1 || pos === escalera.alto + 1;
}

const mesaVacia = (mesa: MesaCinquillo) => PALOS_ESPANOLES.every((p) => mesa[p] === null);

function cartasJugables(e: EstadoCinquillo, asiento: Asiento): IdCarta[] {
  const mano = e.manos[asiento]!;
  // La mano la abre el 5 de oros.
  if (mesaVacia(e.mesa)) return mano.filter((c) => c === 'oros-5');
  return mano.filter((c) => encajaEnMesa(e.mesa, c));
}

function partidaTerminada(e: EstadoCinquillo): boolean {
  return e.resultadosManos.length >= e.config.manos;
}

function nuevaMano(
  config: ConfigCinquillo,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoCinquillo[],
  totales: readonly number[],
  ultimaAccion: UltimaAccionCinquillo | null,
): EstadoCinquillo {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const sale = siguiente(repartidor, n);
  const cuantas = Array.from({ length: n }, (_, i) => Math.floor(40 / n) + (i < 40 % n ? 1 : 0));
  const reparto = repartir(cartas, cuantas);
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = Array.from(
    { length: n },
    (_, asiento) => reparto.valor.manos[(asiento - sale + n) % n]!,
  );
  const turno = manos.findIndex((m) => m.includes('oros-5'));
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    mesa: MESA_VACIA,
    turno,
    ultimaAccion,
    resultadosManos,
    totales,
  };
}

function cerrarMano(e: EstadoCinquillo, ganador: Asiento): EstadoCinquillo {
  const cartasRestantes = e.manos.map((m) => m.length);
  const totales = e.totales.map((t, a) => t + cartasRestantes[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    { ganador, cartasRestantes, puntos: cartasRestantes, totalesTras: totales },
  ];
  const cerrado: EstadoCinquillo = { ...e, resultadosManos, totales };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, e.config.jugadores),
    resultadosManos,
    totales,
    e.ultimaAccion,
  );
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cinquillo: Juego<ConfigCinquillo, EstadoCinquillo, AccionCinquillo, VistaCinquillo> = {
  id: 'cinquillo',

  crear(config, semilla) {
    if (![2, 3, 4].includes(config.jugadores)) {
      return error('El Cinquillo se juega de 2 a 4 jugadores');
    }
    if (![1, 3, 5].includes(config.manos)) return error('La partida debe ser a 1, 3 o 5 manos');
    const limpia: ConfigCinquillo = { jugadores: config.jugadores, manos: config.manos };
    const n = limpia.jugadores;
    return ok(nuevaMano(limpia, crearAzar(semilla), n - 1, [], new Array<number>(n).fill(0), null));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const jugables = cartasJugables(e, asiento);
    if (jugables.length === 0) return [{ tipo: 'pasar' }];
    return jugables.map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    if (accion.tipo === 'pasar') {
      return { ...e, turno: siguiente(asiento, n), ultimaAccion: { asiento, tipo: 'pasar' } };
    }
    const palo = paloDe(accion.carta);
    const pos = posicionCinquillo(accion.carta);
    const actual = e.mesa[palo];
    const escalera: EscaleraCinquillo =
      actual === null
        ? { bajo: pos, alto: pos }
        : { bajo: Math.min(actual.bajo, pos), alto: Math.max(actual.alto, pos) };
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const jugado: EstadoCinquillo = {
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
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
      totales: [...e.totales],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const minimo = Math.min(...e.totales);
    const ganadores = e.totales.flatMap((t, a) => (t === minimo ? [a] : []));
    const puntos = [...e.totales];
    if (ganadores.length === e.totales.length) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
