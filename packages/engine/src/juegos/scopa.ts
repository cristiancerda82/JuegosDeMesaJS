import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import { bandoDe, siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { combinaciones, valorEscoba } from './escoba';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigScopa {
  /** 2 jugadores, o 4 en parejas (Scopone: asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Puntos para ganar: 11 (más bajo solo en las pruebas). */
  readonly meta: number;
}

export const META_SCOPA = 11;
export const CONFIG_SCOPA_POR_DEFECTO: ConfigScopa = { jugadores: 2, meta: META_SCOPA };

export interface JugadaScopa {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
  /** Cartas de la mesa que se llevó; vacío si la carta se quedó en la mesa. */
  readonly captura: readonly IdCarta[];
  readonly scopa: boolean;
}

/** Lo que reunió un bando en la mano. */
export interface RecuentoScopa {
  readonly cartas: number;
  readonly oros: number;
  readonly settebello: boolean;
  readonly primiera: number;
  readonly scopas: number;
}

/** Puntos de un bando en la mano, concepto por concepto. */
export interface PuntosScopa {
  readonly cartas: 0 | 1;
  readonly oros: 0 | 1;
  readonly settebello: 0 | 1;
  readonly primiera: 0 | 1;
  readonly scopas: number;
  readonly total: number;
}

export interface ResultadoManoScopa {
  readonly recuento: readonly [RecuentoScopa, RecuentoScopa];
  readonly puntos: readonly [PuntosScopa, PuntosScopa];
  readonly puntosTras: readonly [number, number];
}

export interface EstadoScopa {
  readonly config: ConfigScopa;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas por repartir; las siguientes son las primeras. */
  readonly mazo: readonly IdCarta[];
  readonly mesa: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  /** Cartas recogidas por cada bando en la mano, boca abajo. */
  readonly recogidas: readonly [readonly IdCarta[], readonly IdCarta[]];
  readonly scopas: readonly [number, number];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaScopa | null;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoScopa[];
}

export interface AccionScopa {
  readonly tipo: 'jugar';
  readonly carta: IdCarta;
  /** Cartas de la mesa que se lleva, en el orden de la mesa; vacío para dejarla en la mesa. */
  readonly captura: readonly IdCarta[];
}

export interface VistaScopa {
  readonly config: ConfigScopa;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly mesa: readonly IdCarta[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly cartasRecogidas: readonly [number, number];
  readonly scopas: readonly [number, number];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaScopa | null;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoScopa[];
}

// ── Capturas y puntos ────────────────────────────────────────────────────────

/** El valor de una carta: As 1, del 2 al 7 su número, sota 8, caballo 9 y rey 10. */
export const valorScopa = valorEscoba;

/**
 * Las capturas legales de una carta: cada carta de la mesa de su mismo valor, por separado; si no
 * hay ninguna, las combinaciones que suman su valor. Vacío si no puede capturar.
 */
export function capturasScopa(mesa: readonly IdCarta[], carta: IdCarta): IdCarta[][] {
  const valor = valorScopa(carta);
  const iguales = mesa.filter((c) => valorScopa(c) === valor);
  if (iguales.length > 0) return iguales.map((c) => [c]);
  return combinaciones(mesa, valor);
}

const PRIMIERA: Readonly<Record<number, number>> = {
  7: 21,
  6: 18,
  1: 16,
  5: 15,
  4: 14,
  3: 13,
  2: 12,
};
const PALOS = ['oros', 'copas', 'espadas', 'bastos'] as const;

/** Valor de una carta para la primiera: 7 21, 6 18, As 16, 5 15, 4 14, 3 13, 2 12, figuras 10. */
export const valorPrimiera = (c: IdCarta) => PRIMIERA[cartaDeId(c)!.valor] ?? 10;

/** La primiera: la suma de la mejor carta de cada palo (0 si falta el palo). */
export function primieraScopa(cartas: readonly IdCarta[]): number {
  return PALOS.reduce(
    (s, palo) =>
      s + Math.max(0, ...cartas.filter((c) => c.startsWith(`${palo}-`)).map(valorPrimiera)),
    0,
  );
}

export const SETTEBELLO: IdCarta = 'oros-7';

/** Puntos de la mano a partir de lo que recogió cada bando y sus scopas. */
export function puntuarManoScopa(
  recogidas: readonly [readonly IdCarta[], readonly IdCarta[]],
  scopas: readonly [number, number],
): Pick<ResultadoManoScopa, 'recuento' | 'puntos'> {
  const recuento = ([0, 1] as const).map((b) => ({
    cartas: recogidas[b].length,
    oros: recogidas[b].filter((c) => c.startsWith('oros-')).length,
    settebello: recogidas[b].includes(SETTEBELLO),
    primiera: primieraScopa(recogidas[b]),
    scopas: scopas[b],
  })) as [RecuentoScopa, RecuentoScopa];
  const mas = (b: 0 | 1, campo: 'cartas' | 'oros' | 'primiera'): 0 | 1 =>
    recuento[b][campo] > recuento[1 - b]![campo] ? 1 : 0;
  const puntos = ([0, 1] as const).map((b) => {
    const p = {
      cartas: mas(b, 'cartas'),
      oros: mas(b, 'oros'),
      settebello: recuento[b].settebello ? 1 : 0,
      primiera: mas(b, 'primiera'),
      scopas: scopas[b],
    } as const;
    return { ...p, total: p.cartas + p.oros + p.settebello + p.primiera + p.scopas };
  }) as [PuntosScopa, PuntosScopa];
  return { recuento, puntos };
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_POR_RONDA = 3;
const CARTAS_EN_MESA = 4;
const CARTAS_SCOPONE = 10;

const terminada = (e: Pick<EstadoScopa, 'puntos' | 'config'>) =>
  Math.max(...e.puntos) >= e.config.meta && e.puntos[0] !== e.puntos[1];

/** Reparte `n` cartas a cada uno desde el siguiente al repartidor. */
function repartirDesde(
  mazo: readonly IdCarta[],
  jugadores: number,
  desde: Asiento,
  n: number,
): { manos: IdCarta[][]; mazo: IdCarta[] } {
  const manos: IdCarta[][] = Array.from({ length: jugadores }, () => []);
  for (let k = 0; k < jugadores; k++) {
    manos[(desde + k) % jugadores] = mazo.slice(k * n, (k + 1) * n);
  }
  return { manos, mazo: mazo.slice(jugadores * n) };
}

function nuevaMano(
  base: Pick<EstadoScopa, 'config' | 'puntos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoScopa {
  const { cartas, azar: sig } = barajar(crearBaraja('espanola40'), azar);
  const n = base.config.jugadores;
  const sale = siguiente(repartidor, n);
  let mesa: IdCarta[] = [];
  let resto: readonly IdCarta[] = cartas;
  if (n === 2) {
    mesa = cartas.slice(0, CARTAS_EN_MESA);
    resto = cartas.slice(CARTAS_EN_MESA);
  }
  const reparto = repartirDesde(resto, n, sale, n === 2 ? CARTAS_POR_RONDA : CARTAS_SCOPONE);
  return {
    ...base,
    azar: sig,
    repartidor,
    mazo: reparto.mazo,
    mesa,
    manos: reparto.manos,
    turno: sale,
    recogidas: [[], []],
    scopas: [0, 0],
    ultimoEnRecoger: null,
    ultimaJugada: null,
  };
}

/** Las cartas de la mesa van al último que capturó; se puntúa y se reparte otra o termina. */
function cerrarMano(e: EstadoScopa): EstadoScopa {
  const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
  if (e.ultimoEnRecoger !== null) recogidas[bandoDe(e.ultimoEnRecoger)].push(...e.mesa);
  const { recuento, puntos: puntosMano } = puntuarManoScopa(recogidas, e.scopas);
  const puntos: [number, number] = [
    e.puntos[0] + puntosMano[0].total,
    e.puntos[1] + puntosMano[1].total,
  ];
  const cerrado: EstadoScopa = {
    ...e,
    mesa: e.ultimoEnRecoger === null ? e.mesa : [],
    recogidas,
    puntos,
    resultadosManos: [...e.resultadosManos, { recuento, puntos: puntosMano, puntosTras: puntos }],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, e.config.jugadores), e.azar);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const scopa: Juego<ConfigScopa, EstadoScopa, AccionScopa, VistaScopa> = {
  id: 'scopa',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('La Scopa se juega con 2 jugadores o con 4 en parejas');
    }
    if (!Number.isInteger(config.meta) || config.meta < 1)
      return error('La meta debe ser positiva');
    const limpia: ConfigScopa = { jugadores: config.jugadores, meta: config.meta };
    // Reparte el último asiento, así sale el asiento 0.
    return ok(
      nuevaMano(
        { config: limpia, puntos: [0, 0], resultadosManos: [] },
        limpia.jugadores - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    return e.manos[asiento]!.flatMap((carta): AccionScopa[] => {
      const capturas = capturasScopa(e.mesa, carta);
      return capturas.length > 0
        ? capturas.map((captura) => ({ tipo: 'jugar', carta, captura }))
        : [{ tipo: 'jugar', carta, captura: [] }];
    });
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    let manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    let mazo = e.mazo;
    const bando = bandoDe(asiento);
    const recoge = accion.captura.length > 0;
    const mesa = recoge
      ? e.mesa.filter((c) => !accion.captura.includes(c))
      : [...e.mesa, accion.carta];
    const ultimaDeLaMano = mazo.length === 0 && manos.every((m) => m.length === 0);
    const hizoScopa = recoge && mesa.length === 0 && !ultimaDeLaMano;
    const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
    const scopas: [number, number] = [e.scopas[0], e.scopas[1]];
    if (recoge) recogidas[bando].push(accion.carta, ...accion.captura);
    if (hizoScopa) scopas[bando]++;
    const turno = siguiente(asiento, n);

    if (manos.every((m) => m.length === 0) && mazo.length > 0) {
      // Con 2: otras 3 a cada uno, empezando por el que juega ahora.
      ({ manos, mazo } = repartirDesde(mazo, n, turno, CARTAS_POR_RONDA));
    }

    const jugado: EstadoScopa = {
      ...e,
      manos,
      mazo,
      mesa,
      turno,
      recogidas,
      scopas,
      ultimoEnRecoger: recoge ? asiento : e.ultimoEnRecoger,
      ultimaJugada: { asiento, carta: accion.carta, captura: accion.captura, scopa: hizoScopa },
    };
    return ultimaDeLaMano ? cerrarMano(jugado) : jugado;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      mesa: [...e.mesa],
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      cartasRecogidas: [e.recogidas[0].length, e.recogidas[1].length],
      scopas: [e.scopas[0], e.scopas[1]],
      ultimoEnRecoger: e.ultimoEnRecoger,
      ultimaJugada: e.ultimaJugada,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const bando = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return {
      ganadores: asientos.filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: asientos.map((a) => e.puntos[bandoDe(a)]),
    };
  },
};
