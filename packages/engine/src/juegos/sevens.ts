import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  PALOS_FRANCESES,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigSevens {
  /** De 3 a 6 jugadores, cada uno por su cuenta. */
  readonly jugadores: 3 | 4 | 5 | 6;
}

export const CONFIG_SEVENS_POR_DEFECTO: ConfigSevens = { jugadores: 4 };

/** Puntos con los que termina la partida. */
export const OBJETIVO_SEVENS = 50;

/** Extremos de la escalera de un palo, como valores de carta (1 el As, 13 la K). */
export interface EscaleraSevens {
  readonly bajo: number;
  readonly alto: number;
}

export type MesaSevens = Readonly<Record<PaloFrances, EscaleraSevens | null>>;

export type UltimaAccionSevens =
  | { readonly asiento: Asiento; readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly asiento: Asiento; readonly tipo: 'pasar' };

export interface ResultadoManoSevens {
  /** Quien se quedó sin cartas. */
  readonly ganador: Asiento;
  readonly cartasRestantes: readonly number[];
  /** Puntos de la mano: las cartas que le quedaron a cada uno. */
  readonly puntos: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoSevens {
  readonly config: ConfigSevens;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mesa: MesaSevens;
  readonly turno: Asiento;
  readonly ultimaAccion: UltimaAccionSevens | null;
  readonly resultadosManos: readonly ResultadoManoSevens[];
  readonly totales: readonly number[];
}

export type AccionSevens =
  { readonly tipo: 'jugar'; readonly carta: IdCarta } | { readonly tipo: 'pasar' };

export interface VistaSevens {
  readonly config: ConfigSevens;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mesa: MesaSevens;
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly ultimaAccion: UltimaAccionSevens | null;
  readonly resultadosManos: readonly ResultadoManoSevens[];
  readonly totales: readonly number[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** Las escaleras salen del 7. */
export const SIETE = 7;
const AS = 1;
const REY = 13;
/** La carta que abre cada mano. */
export const SALIDA_SEVENS: IdCarta = 'diamantes-7';

const paloDe = (id: IdCarta) => cartaDeId(id)!.palo as PaloFrances;
export const valorSevens = (id: IdCarta) => cartaDeId(id)!.valor;

const siguiente = (a: Asiento, n: number) => (a + 1) % n;

const MESA_VACIA: MesaSevens = { picas: null, corazones: null, diamantes: null, treboles: null };

/** La carta se puede poner en la mesa: abre su palo con el 7 o alarga un extremo. */
export function encajaSevens(mesa: MesaSevens, carta: IdCarta): boolean {
  const escalera = mesa[paloDe(carta)];
  const v = valorSevens(carta);
  if (escalera === null) return v === SIETE;
  return (v === escalera.bajo - 1 && v >= AS) || (v === escalera.alto + 1 && v <= REY);
}

const mesaVacia = (mesa: MesaSevens) => PALOS_FRANCESES.every((p) => mesa[p] === null);

function cartasJugables(e: EstadoSevens, asiento: Asiento): IdCarta[] {
  const mano = e.manos[asiento]!;
  // La mano la abre el 7 de diamantes.
  if (mesaVacia(e.mesa)) return mano.filter((c) => c === SALIDA_SEVENS);
  return mano.filter((c) => encajaSevens(e.mesa, c));
}

const partidaTerminada = (e: Pick<EstadoSevens, 'resultadosManos' | 'totales'>) =>
  e.resultadosManos.length > 0 && Math.max(...e.totales) >= OBJETIVO_SEVENS;

function nuevaMano(
  config: ConfigSevens,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoSevens[],
  totales: readonly number[],
  ultimaAccion: UltimaAccionSevens | null,
): EstadoSevens {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const sale = siguiente(repartidor, n);
  const cuantas = Array.from({ length: n }, (_, i) => Math.floor(52 / n) + (i < 52 % n ? 1 : 0));
  const reparto = repartir(cartas, cuantas);
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = Array.from(
    { length: n },
    (_, asiento) => reparto.valor.manos[(asiento - sale + n) % n]!,
  );
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    mesa: MESA_VACIA,
    turno: manos.findIndex((m) => m.includes(SALIDA_SEVENS)),
    ultimaAccion,
    resultadosManos,
    totales,
  };
}

function cerrarMano(e: EstadoSevens, ganador: Asiento): EstadoSevens {
  const cartasRestantes = e.manos.map((m) => m.length);
  const totales = e.totales.map((t, a) => t + cartasRestantes[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    { ganador, cartasRestantes, puntos: cartasRestantes, totalesTras: totales },
  ];
  const cerrado: EstadoSevens = { ...e, resultadosManos, totales };
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

export const sevens: Juego<ConfigSevens, EstadoSevens, AccionSevens, VistaSevens> = {
  id: 'sevens',

  crear(config, semilla) {
    if (![3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Sevens se juega de 3 a 6 jugadores');
    }
    const limpia: ConfigSevens = { jugadores: config.jugadores };
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
    const v = valorSevens(accion.carta);
    const actual = e.mesa[palo];
    const escalera: EscaleraSevens =
      actual === null
        ? { bajo: v, alto: v }
        : { bajo: Math.min(actual.bajo, v), alto: Math.max(actual.alto, v) };
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const jugado: EstadoSevens = {
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
    return { ganadores, empate: false, puntos: [...e.totales] };
  },
};
