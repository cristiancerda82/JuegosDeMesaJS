import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  bandoDe,
  cartaGanadora,
  cartasObligadas,
  paloDe,
  puntosDe,
  siguiente,
  VALORES_BUTIFARRA,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export const OBJETIVOS_MANILLA = [20, 40] as const;

export interface ConfigManilla {
  /** Puntos con los que una pareja gana la partida. */
  readonly objetivo: (typeof OBJETIVOS_MANILLA)[number];
}

export const CONFIG_MANILLA_POR_DEFECTO: ConfigManilla = { objetivo: 40 };

/** El orden y los puntos de las cartas son los de la Butifarra: 9, As, Rey, Caballo, Sota… */
export const VALORES_MANILLA = VALORES_BUTIFARRA;

const JUGADORES = 4;
/** Cada pareja anota lo que pasa de 36: la mitad de los 72 puntos de cartas y bazas. */
export const MITAD_MANILLA = 36;

export interface BazaManilla {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export interface ResultadoManoManilla {
  readonly repartidor: Asiento;
  /** La carta vuelta que marcó el triunfo. */
  readonly pinte: IdCarta;
  /** Cartas y bazas de cada pareja en la mano. */
  readonly puntos: readonly [number, number];
  readonly bazas: readonly [number, number];
  /** Si la pareja del que reparte anotó el valor del pinte. */
  readonly pinteAnotado: boolean;
  /** Lo que anota cada pareja, con el pinte si lo anotó. */
  readonly anotados: readonly [number, number];
  readonly totalesTras: readonly [number, number];
}

export interface EstadoManilla {
  readonly config: ConfigManilla;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly pinte: IdCarta;
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaManilla[];
  readonly ultimaBaza: BazaManilla | null;
  readonly bazas: readonly number[];
  /** Cartas y bazas de cada pareja en la mano en curso. */
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoManilla[];
  readonly totales: readonly [number, number];
}

export type AccionManilla = { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaManilla {
  readonly config: ConfigManilla & { readonly jugadores: 4 };
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: 0;
  readonly muestra: null;
  readonly repartidor: Asiento;
  readonly pinte: IdCarta;
  readonly triunfo: PaloEspanol;
  /** El pinte sigue en la mano del que reparte: todos saben que lo tiene. */
  readonly pinteEnMano: boolean;
  readonly turno: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaManilla[];
  readonly ultimaBaza: BazaManilla | null;
  readonly bazas: readonly number[];
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoManilla[];
  readonly totales: readonly [number, number];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const V = VALORES_MANILLA;

/** Lo que vale el pinte para la pareja del que reparte: el valor de la carta vuelta. */
export const valorPinte = (pinte: IdCarta) => puntosDe(pinte, V);

/**
 * Lo que anota cada pareja al acabar la mano: lo que pasa de 36 y, la del que reparte, el pinte.
 * Si el pinte le daría la partida, solo lo anota si la pareja ha hecho al menos 36.
 */
export function anotarManilla(
  puntos: readonly [number, number],
  totales: readonly [number, number],
  repartidor: Asiento,
  pinte: IdCarta,
  objetivo: number,
): { anotados: [number, number]; pinteAnotado: boolean } {
  const anotados = puntos.map((p) => Math.max(0, p - MITAD_MANILLA)) as [number, number];
  const bando = bandoDe(repartidor);
  const valor = valorPinte(pinte);
  const sinPinte = totales[bando] + anotados[bando];
  const decisivo = sinPinte < objetivo && sinPinte + valor >= objetivo;
  const pinteAnotado = valor > 0 && (!decisivo || puntos[bando] >= MITAD_MANILLA);
  if (pinteAnotado) anotados[bando] += valor;
  return { anotados, pinteAnotado };
}

/**
 * Cartas que se pueden jugar: seguir el palo y montar, fallar y sobrefallar, pero solo si la baza
 * la va ganando un rival; si no se puede superar el fallo, cualquiera. Si la va ganando el
 * compañero, basta con seguir el palo.
 */
export const cartasLegalesManilla = (
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloEspanol,
  asiento: Asiento,
) =>
  cartasObligadas(mano, mesa, triunfo, {
    asiento,
    montarSobreCompanero: false,
    valores: V,
    sobrefalloLibre: true,
  });

const partidaTerminada = (e: Pick<EstadoManilla, 'totales' | 'config'>) =>
  Math.max(...e.totales) >= e.config.objetivo;

function nuevaMano(
  base: Pick<EstadoManilla, 'config' | 'resultadosManos' | 'totales' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoManilla {
  const { cartas, azar: sig } = barajar(crearBaraja('espanola48'), azar);
  const sale = siguiente(repartidor, JUGADORES);
  // De cuatro en cuatro desde el que sale: la última carta, la del pinte, es del que reparte.
  const manos = Array.from({ length: JUGADORES }, () => [] as IdCarta[]);
  for (let i = 0; i < cartas.length; i++) {
    const a = (sale + Math.floor(i / 4)) % JUGADORES;
    manos[a]!.push(cartas[i]!);
  }
  const pinte = cartas.at(-1)!;
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    pinte,
    turno: sale,
    mesa: [],
    bazasJugadas: [],
    bazas: new Array<number>(JUGADORES).fill(0),
    puntos: [0, 0],
  };
}

function cerrarMano(e: EstadoManilla): EstadoManilla {
  const { anotados, pinteAnotado } = anotarManilla(
    e.puntos,
    e.totales,
    e.repartidor,
    e.pinte,
    e.config.objetivo,
  );
  const totales: [number, number] = [e.totales[0] + anotados[0], e.totales[1] + anotados[1]];
  const bazas: [number, number] = [0, 0];
  e.bazas.forEach((b, a) => (bazas[bandoDe(a)] += b));
  const cerrado: EstadoManilla = {
    ...e,
    totales,
    resultadosManos: [
      ...e.resultadosManos,
      {
        repartidor: e.repartidor,
        pinte: e.pinte,
        puntos: e.puntos,
        bazas,
        pinteAnotado,
        anotados,
        totalesTras: totales,
      },
    ],
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, JUGADORES), e.azar);
}

function resolverBaza(e: EstadoManilla): EstadoManilla {
  const ganador = cartaGanadora(e.mesa, paloDe(e.pinte), V).asiento;
  const valor = 1 + e.mesa.reduce((s, j) => s + puntosDe(j.carta, V), 0);
  const puntos = [...e.puntos] as [number, number];
  puntos[bandoDe(ganador)] += valor;
  const baza = { cartas: e.mesa, ganador };
  const resuelto: EstadoManilla = {
    ...e,
    mesa: [],
    turno: ganador,
    bazasJugadas: [...e.bazasJugadas, baza],
    ultimaBaza: baza,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    puntos,
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const manilla: Juego<ConfigManilla, EstadoManilla, AccionManilla, VistaManilla> = {
  id: 'manilla',

  crear(config, semilla) {
    if (!(OBJETIVOS_MANILLA as readonly number[]).includes(config.objetivo)) {
      return error('La partida de Manilla se juega a 20 o 40 puntos');
    }
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(
      nuevaMano(
        {
          config: { objetivo: config.objetivo },
          resultadosManos: [],
          totales: [0, 0],
          ultimaBaza: null,
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    return cartasLegalesManilla(e.manos[asiento]!, e.mesa, paloDe(e.pinte), asiento).map(
      (carta) => ({ tipo: 'jugar' as const, carta }),
    );
  },

  transicion(e, asiento, accion) {
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const jugado: EstadoManilla = { ...e, manos, mesa };
    return mesa.length < JUGADORES
      ? { ...jugado, turno: siguiente(asiento, JUGADORES) }
      : resolverBaza(jugado);
  },

  vistaDe(e, asiento) {
    return {
      config: { ...e.config, jugadores: JUGADORES },
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: 0,
      muestra: null,
      repartidor: e.repartidor,
      pinte: e.pinte,
      triunfo: paloDe(e.pinte),
      pinteEnMano: e.manos[e.repartidor]!.includes(e.pinte),
      turno: partidaTerminada(e) ? null : e.turno,
      mesa: [...e.mesa],
      bazasJugadas: [...e.bazasJugadas],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
      totales: e.totales,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const bando = e.totales[0] > e.totales[1] ? 0 : 1;
    return {
      ganadores: [0, 1, 2, 3].filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: [0, 1, 2, 3].map((a) => e.totales[bandoDe(a)]),
    };
  },
};
