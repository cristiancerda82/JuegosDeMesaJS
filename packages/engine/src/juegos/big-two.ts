import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** El Big Two clásico no tiene opciones: 4 jugadores y partida a 50. */
export interface ConfigBigTwo {
  readonly jugadores: 4;
}

export const CONFIG_BIG_TWO_POR_DEFECTO: ConfigBigTwo = { jugadores: 4 };

export const PUNTOS_PARTIDA_BIG_TWO = 50;
const JUGADORES = 4;
const CARTAS_MANO = 13;
export const TRES_DE_DIAMANTES: IdCarta = 'diamantes-3';

export type TipoJugadaBigTwo =
  'suelta' | 'pareja' | 'trio' | 'escalera' | 'color' | 'full' | 'poker' | 'escaleraColor';

export interface JugadaBigTwo {
  readonly tipo: TipoJugadaBigTwo;
  /** Comparable entre jugadas del mismo número de cartas. */
  readonly fuerza: number;
}

export interface MesaBigTwo extends JugadaBigTwo {
  readonly asiento: Asiento;
  readonly cartas: readonly IdCarta[];
}

export type AccionBigTwo =
  /** Las cartas, en el orden del juego (de menor a mayor). */
  { readonly tipo: 'jugar'; readonly cartas: readonly IdCarta[] } | { readonly tipo: 'pasar' };

export interface AccionBigTwoHecha {
  readonly asiento: Asiento;
  readonly accion: AccionBigTwo;
}

export interface ResultadoManoBigTwo {
  readonly ganador: Asiento;
  readonly cartasRestantes: readonly number[];
  readonly puntos: readonly number[];
  /** Totales de la partida tras la mano. */
  readonly totales: readonly number[];
}

export interface EstadoBigTwo {
  readonly config: ConfigBigTwo;
  readonly azar: EstadoAzar;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  /** La última jugada de la ronda; `null` al salir. */
  readonly mesa: MesaBigTwo | null;
  /** Pases seguidos desde la última jugada. */
  readonly pasesSeguidos: number;
  /** La próxima jugada es la primera de la mano: tiene que llevar el 3 de diamantes. */
  readonly primera: boolean;
  /** Cartas jugadas en la mano. */
  readonly jugadas: readonly IdCarta[];
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoBigTwo[];
  readonly ultimaAccion: AccionBigTwoHecha | null;
}

export interface VistaBigTwo {
  readonly config: ConfigBigTwo;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly mesa: MesaBigTwo | null;
  readonly pasesSeguidos: number;
  readonly primera: boolean;
  readonly jugadas: readonly IdCarta[];
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoBigTwo[];
  readonly ultimaAccion: AccionBigTwoHecha | null;
}

// ── Cartas y jugadas ─────────────────────────────────────────────────────────

const ORDEN_PALOS: readonly PaloFrances[] = ['diamantes', 'treboles', 'corazones', 'picas'];

/** El número en el orden del juego: del 3 (0) al 2 (12). */
export function numeroBigTwo(c: IdCarta): number {
  const v = cartaDeId(c)!.valor;
  return v >= 3 ? v - 3 : v + 10;
}

const paloDe = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;

/** Orden total de las 52 cartas: por número y, a igual número, por palo. */
export const valorBigTwo = (c: IdCarta) => numeroBigTwo(c) * 4 + ORDEN_PALOS.indexOf(paloDe(c));

export const ordenarBigTwo = (cartas: readonly IdCarta[]) =>
  [...cartas].sort((a, b) => valorBigTwo(a) - valorBigTwo(b));

const RANGO_CINCO: Record<string, number> = {
  escalera: 0,
  color: 1,
  full: 2,
  poker: 3,
  escaleraColor: 4,
};

/** Qué jugada forman las cartas, o `null` si no forman ninguna. */
export function jugadaBigTwo(cartas: readonly IdCarta[]): JugadaBigTwo | null {
  const orden = ordenarBigTwo(cartas);
  const numeros = orden.map(numeroBigTwo);
  const alta = valorBigTwo(orden.at(-1)!);
  const iguales = numeros.every((n) => n === numeros[0]);
  if (orden.length === 1) return { tipo: 'suelta', fuerza: alta };
  if (orden.length === 2) return iguales ? { tipo: 'pareja', fuerza: alta } : null;
  if (orden.length === 3) return iguales ? { tipo: 'trio', fuerza: numeros[0]! } : null;
  if (orden.length !== 5) return null;

  const cuenta = new Map<number, number>();
  for (const n of numeros) cuenta.set(n, (cuenta.get(n) ?? 0) + 1);
  const veces = [...cuenta.values()].sort((a, b) => b - a);
  const conVeces = (k: number) => [...cuenta.entries()].find(([, v]) => v === k)![0];
  const escalera = veces.length === 5 && numeros[4]! - numeros[0]! === 4;
  const color = orden.every((c) => paloDe(c) === paloDe(orden[0]!));
  const de = (tipo: TipoJugadaBigTwo, decisiva: number): JugadaBigTwo => ({
    tipo,
    fuerza: RANGO_CINCO[tipo]! * 1000 + decisiva,
  });
  if (escalera && color) return de('escaleraColor', alta);
  if (veces[0] === 4) return de('poker', conVeces(4));
  if (veces[0] === 3 && veces[1] === 2) return de('full', conVeces(3));
  if (color) return de('color', alta);
  if (escalera) return de('escalera', alta);
  return null;
}

/** `a` supera a `b`: mismo número de cartas y más fuerza. */
export function superaBigTwo(
  a: { readonly cartas: readonly IdCarta[]; readonly fuerza: number },
  b: { readonly cartas: readonly IdCarta[]; readonly fuerza: number },
): boolean {
  return a.cartas.length === b.cartas.length && a.fuerza > b.fuerza;
}

function combinaciones<T>(items: readonly T[], k: number): T[][] {
  const res: T[][] = [];
  const elegidas: T[] = [];
  const ir = (desde: number) => {
    if (elegidas.length === k) {
      res.push([...elegidas]);
      return;
    }
    for (let i = desde; i <= items.length - (k - elegidas.length); i++) {
      elegidas.push(items[i]!);
      ir(i + 1);
      elegidas.pop();
    }
  };
  ir(0);
  return res;
}

/** Todas las jugadas que se pueden formar con la mano, cada una en orden y sin repetir. */
export function jugadasPosiblesBigTwo(mano: readonly IdCarta[]): IdCarta[][] {
  const porNumero = new Map<number, IdCarta[]>();
  for (const c of ordenarBigTwo(mano)) {
    const n = numeroBigTwo(c);
    porNumero.set(n, [...(porNumero.get(n) ?? []), c]);
  }
  const grupos = [...porNumero.entries()];
  const salida = new Map<string, IdCarta[]>();
  const anadir = (cartas: readonly IdCarta[]) => {
    const orden = ordenarBigTwo(cartas);
    salida.set(orden.join(','), orden);
  };

  for (const [, g] of grupos) {
    for (const k of [1, 2, 3]) for (const comb of combinaciones(g, k)) anadir(comb);
  }
  // Escaleras (y de color): por número inicial, una carta de cada número.
  for (let inicio = 0; inicio + 4 <= 12; inicio++) {
    const tramo = [0, 1, 2, 3, 4].map((i) => porNumero.get(inicio + i));
    if (tramo.some((g) => !g)) continue;
    let parciales: IdCarta[][] = [[]];
    for (const g of tramo) parciales = parciales.flatMap((p) => g!.map((c) => [...p, c]));
    for (const p of parciales) anadir(p);
  }
  // Colores.
  for (const palo of ORDEN_PALOS) {
    const delPalo = mano.filter((c) => paloDe(c) === palo);
    for (const comb of combinaciones(delPalo, 5)) anadir(comb);
  }
  // Full y póker.
  for (const [n, g] of grupos) {
    for (const trio of combinaciones(g, 3)) {
      for (const [m, h] of grupos) {
        if (m !== n) for (const pareja of combinaciones(h, 2)) anadir([...trio, ...pareja]);
      }
    }
    if (g.length === 4) for (const c of mano) if (numeroBigTwo(c) !== n) anadir([...g, c]);
  }
  return [...salida.values()];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

const partidaTerminada = (e: Pick<EstadoBigTwo, 'totales'>) =>
  Math.max(...e.totales) >= PUNTOS_PARTIDA_BIG_TWO;

/** Puntos por las cartas que le quedan a un jugador: el doble con 10 o más, el triple con 13. */
export function puntosBigTwo(cartas: number): number {
  if (cartas === CARTAS_MANO) return 3 * cartas;
  return cartas >= 10 ? 2 * cartas : cartas;
}

function nuevaMano(
  config: ConfigBigTwo,
  azar: EstadoAzar,
  previo: Pick<EstadoBigTwo, 'totales' | 'resultadosManos' | 'ultimaAccion'>,
): EstadoBigTwo {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const manos = Array.from({ length: JUGADORES }, (_, a) =>
    ordenarBigTwo(cartas.slice(a * CARTAS_MANO, (a + 1) * CARTAS_MANO)),
  );
  return {
    config,
    azar: azarSiguiente,
    manos,
    turno: manos.findIndex((m) => m.includes(TRES_DE_DIAMANTES)),
    mesa: null,
    pasesSeguidos: 0,
    primera: true,
    jugadas: [],
    totales: previo.totales,
    resultadosManos: previo.resultadosManos,
    ultimaAccion: previo.ultimaAccion,
  };
}

function cerrarMano(e: EstadoBigTwo, ganador: Asiento): EstadoBigTwo {
  const cartasRestantes = e.manos.map((m) => m.length);
  const puntos = cartasRestantes.map(puntosBigTwo);
  const totales = e.totales.map((t, a) => t + puntos[a]!);
  const resultadosManos = [...e.resultadosManos, { ganador, cartasRestantes, puntos, totales }];
  const cerrado: EstadoBigTwo = { ...e, totales, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, cerrado);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const bigTwo: Juego<ConfigBigTwo, EstadoBigTwo, AccionBigTwo, VistaBigTwo> = {
  id: 'big-two',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Big Two se juega con 4 jugadores');
    return ok(
      nuevaMano({ jugadores: 4 }, crearAzar(semilla), {
        totales: [0, 0, 0, 0],
        resultadosManos: [],
        ultimaAccion: null,
      }),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    let jugadas = jugadasPosiblesBigTwo(e.manos[asiento]!);
    if (e.primera) jugadas = jugadas.filter((j) => j.includes(TRES_DE_DIAMANTES));
    const mesa = e.mesa;
    if (mesa !== null) {
      jugadas = jugadas.filter((cartas) => {
        const j = jugadaBigTwo(cartas);
        return j !== null && superaBigTwo({ cartas, fuerza: j.fuerza }, mesa);
      });
    }
    const acciones: AccionBigTwo[] = jugadas.map((cartas) => ({ tipo: 'jugar', cartas }));
    return mesa === null ? acciones : [...acciones, { tipo: 'pasar' }];
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoBigTwo = { ...e, ultimaAccion: { asiento, accion } };
    if (accion.tipo === 'pasar') {
      const pasesSeguidos = e.pasesSeguidos + 1;
      if (pasesSeguidos < JUGADORES - 1) {
        return { ...hecha, pasesSeguidos, turno: siguiente(asiento) };
      }
      // Todos pasaron: sale quien hizo la última jugada.
      return { ...hecha, pasesSeguidos: 0, mesa: null, turno: e.mesa!.asiento };
    }
    const jugada = jugadaBigTwo(accion.cartas)!;
    const manos = e.manos.map((m, a) =>
      a === asiento ? m.filter((c) => !accion.cartas.includes(c)) : m,
    );
    const jugado: EstadoBigTwo = {
      ...hecha,
      manos,
      mesa: { asiento, cartas: accion.cartas, ...jugada },
      pasesSeguidos: 0,
      primera: false,
      jugadas: [...e.jugadas, ...accion.cartas],
      turno: siguiente(asiento),
    };
    return manos[asiento]!.length === 0 ? cerrarMano(jugado, asiento) : jugado;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      turno: partidaTerminada(e) ? null : e.turno,
      mesa: e.mesa,
      pasesSeguidos: e.pasesSeguidos,
      primera: e.primera,
      jugadas: [...e.jugadas],
      totales: [...e.totales],
      resultadosManos: [...e.resultadosManos],
      ultimaAccion: e.ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const menos = Math.min(...e.totales);
    return {
      ganadores: e.totales.flatMap((t, a) => (t === menos ? [a] : [])),
      empate: false,
      puntos: [...e.totales],
    };
  },
};
