import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, PALOS_ESPANOLES, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigBurro {
  readonly jugadores: 3 | 4 | 5;
}

export const CONFIG_BURRO_POR_DEFECTO: ConfigBurro = { jugadores: 4 };

export type ResultadoManoBurro =
  | { readonly nula: true }
  | {
      readonly nula: false;
      /** Quién se plantó primero y las 4 cartas iguales con las que lo hizo. */
      readonly primero: Asiento;
      readonly cuatro: readonly IdCarta[];
      /** Todos los que se plantaron, en orden de llegada (el primero incluido). */
      readonly orden: readonly Asiento[];
      /** El último en plantarse, que suma una letra. */
      readonly burro: Asiento;
    };

export interface EstadoBurro {
  readonly config: ConfigBurro;
  readonly azar: EstadoAzar;
  /** Mano en curso, desde 0. */
  readonly numeroMano: number;
  readonly manos: readonly (readonly IdCarta[])[];
  /** `pase` mientras nadie se ha plantado; `plantando` desde que alguien lo hace. */
  readonly fase: 'pase' | 'plantando';
  /** Carta elegida por cada jugador para el próximo intercambio; `null` si aún no eligió. */
  readonly pases: readonly (IdCarta | null)[];
  /** Lo que dio y lo que recibió cada jugador en el último intercambio de la mano. */
  readonly pasadas: readonly (IdCarta | null)[];
  readonly recibidas: readonly (IdCarta | null)[];
  /** Intercambios completados en la mano. */
  readonly intercambios: number;
  /** Quién se ha plantado, en orden de llegada. */
  readonly plantados: readonly Asiento[];
  /** Cartas del primero que se plantó, en el momento de hacerlo. */
  readonly cuatro: readonly IdCarta[];
  /** Letras de B-U-R-R-O de cada jugador. */
  readonly letras: readonly number[];
  readonly ultimaMano: ResultadoManoBurro | null;
}

export type AccionBurro =
  { readonly tipo: 'pasar'; readonly carta: IdCarta } | { readonly tipo: 'plantarse' };

export interface VistaBurro {
  readonly config: ConfigBurro;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  /** Carta que eligió el propio jugador para el próximo intercambio. */
  readonly miPase: IdCarta | null;
  /** Lo que dio y lo que recibió el propio jugador en el último intercambio. */
  readonly pasada: IdCarta | null;
  readonly recibida: IdCarta | null;
  /** Quién ya eligió su carta para el próximo intercambio (sin cuál). */
  readonly eligieron: readonly boolean[];
  readonly cartasEnMano: readonly number[];
  readonly fase: EstadoBurro['fase'];
  readonly plantados: readonly Asiento[];
  readonly letras: readonly number[];
  readonly numeroMano: number;
  readonly intercambios: number;
  readonly ultimaMano: ResultadoManoBurro | null;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const CARTAS_POR_JUGADOR = 4;
/** Letras de B-U-R-R-O: quien las completa pierde. */
export const LETRAS_BURRO = 5;
/** Intercambios sin que nadie se plante tras los que la mano se anula. */
export const MAX_INTERCAMBIOS = 50;
const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;

export const numeroBurro = (c: IdCarta) => cartaDeId(c)!.valor;

/** Las 4 cartas son del mismo número. */
export const sonCuatroIguales = (mano: readonly IdCarta[]) =>
  mano.length === CARTAS_POR_JUGADOR && mano.every((c) => numeroBurro(c) === numeroBurro(mano[0]!));

const partidaTerminada = (e: EstadoBurro) => e.letras.some((l) => l >= LETRAS_BURRO);

function nuevaMano(
  config: ConfigBurro,
  azar: EstadoAzar,
  numeroMano: number,
  letras: readonly number[],
  ultimaMano: ResultadoManoBurro | null,
): EstadoBurro {
  const n = config.jugadores;
  const numeros = barajar([...NUMEROS], azar);
  const cartas = numeros.cartas
    .slice(0, n)
    .flatMap((valor) => PALOS_ESPANOLES.map((palo): IdCarta => `${palo}-${valor}`));
  const barajadas = barajar(cartas, numeros.azar);
  const manos = Array.from({ length: n }, (_, a) =>
    barajadas.cartas.slice(a * CARTAS_POR_JUGADOR, (a + 1) * CARTAS_POR_JUGADOR),
  );
  const vacias = () => new Array<IdCarta | null>(n).fill(null);
  return {
    config,
    azar: barajadas.azar,
    numeroMano,
    manos,
    fase: 'pase',
    pases: vacias(),
    pasadas: vacias(),
    recibidas: vacias(),
    intercambios: 0,
    plantados: [],
    cuatro: [],
    letras,
    ultimaMano,
  };
}

/** Cada uno da su carta al siguiente y recibe la del anterior, todos a la vez. */
function intercambiar(e: EstadoBurro): EstadoBurro {
  const n = e.config.jugadores;
  const pasadas = e.pases;
  const recibidas = pasadas.map((_, a) => pasadas[(a - 1 + n) % n]!);
  const manos = e.manos.map((m, a) => [...m.filter((c) => c !== pasadas[a]), recibidas[a]!]);
  const intercambios = e.intercambios + 1;
  if (intercambios >= MAX_INTERCAMBIOS) {
    return nuevaMano(e.config, e.azar, e.numeroMano + 1, e.letras, { nula: true });
  }
  return {
    ...e,
    manos,
    pases: new Array<IdCarta | null>(n).fill(null),
    pasadas,
    recibidas,
    intercambios,
  };
}

function cerrarMano(e: EstadoBurro): EstadoBurro {
  const burro = e.manos.findIndex((_, a) => !e.plantados.includes(a));
  const letras = e.letras.map((l, a) => (a === burro ? l + 1 : l));
  const ultimaMano: ResultadoManoBurro = {
    nula: false,
    primero: e.plantados[0]!,
    cuatro: e.cuatro,
    orden: e.plantados,
    burro,
  };
  const cerrado: EstadoBurro = { ...e, letras, ultimaMano };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, e.numeroMano + 1, letras, ultimaMano);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const burro: Juego<ConfigBurro, EstadoBurro, AccionBurro, VistaBurro> = {
  id: 'burro',

  crear(config, semilla) {
    if (config.jugadores !== 3 && config.jugadores !== 4 && config.jugadores !== 5) {
      return error('El Burro se juega con 3, 4 o 5 jugadores');
    }
    const limpia: ConfigBurro = { jugadores: config.jugadores };
    return ok(
      nuevaMano(limpia, crearAzar(semilla), 0, new Array<number>(limpia.jugadores).fill(0), null),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento < 0 || asiento >= e.config.jugadores) return [];
    if (e.fase === 'plantando') {
      return e.plantados.includes(asiento) ? [] : [{ tipo: 'plantarse' }];
    }
    if (e.pases[asiento] !== null) return [];
    const mano = e.manos[asiento]!;
    const pasar = mano.map((carta): AccionBurro => ({ tipo: 'pasar', carta }));
    return sonCuatroIguales(mano) ? [...pasar, { tipo: 'plantarse' }] : pasar;
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'pasar') {
      const pases = e.pases.map((p, a) => (a === asiento ? accion.carta : p));
      const elegido: EstadoBurro = { ...e, pases };
      return pases.every((p) => p !== null) ? intercambiar(elegido) : elegido;
    }
    const primero = e.plantados.length === 0;
    const plantado: EstadoBurro = {
      ...e,
      fase: 'plantando',
      pases: primero ? e.pases.map(() => null) : e.pases,
      plantados: [...e.plantados, asiento],
      cuatro: primero ? [...e.manos[asiento]!] : e.cuatro,
    };
    return plantado.plantados.length === e.config.jugadores - 1 ? cerrarMano(plantado) : plantado;
  },

  vistaDe(e, asiento) {
    const propio = asiento === null ? null : asiento;
    return {
      config: e.config,
      asiento,
      miMano: propio === null ? null : [...e.manos[propio]!],
      miPase: propio === null ? null : e.pases[propio]!,
      pasada: propio === null ? null : e.pasadas[propio]!,
      recibida: propio === null ? null : e.recibidas[propio]!,
      eligieron: e.pases.map((p) => p !== null),
      cartasEnMano: e.manos.map((m) => m.length),
      fase: e.fase,
      plantados: [...e.plantados],
      letras: [...e.letras],
      numeroMano: e.numeroMano,
      intercambios: e.intercambios,
      ultimaMano: e.ultimaMano,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const ganadores = e.letras.flatMap((l, a) => (l >= LETRAS_BURRO ? [] : [a]));
    return { ganadores, empate: false };
  },
};
