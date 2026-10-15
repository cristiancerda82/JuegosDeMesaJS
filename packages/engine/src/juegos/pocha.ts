import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import {
  cartaGanadora,
  cartasObligadas,
  paloDe,
  siguiente,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigPocha {
  /** Cada uno juega por su cuenta. */
  readonly jugadores: 3 | 4;
  /** Corta: manos de 1 a 5 cartas y vuelta a 1. Completa: hasta repartir toda la baraja. */
  readonly duracion: 'corta' | 'completa';
  /** El repartidor no puede apostar lo que haría que la suma de apuestas iguale las cartas. */
  readonly restriccionRepartidor: boolean;
}

export const CONFIG_POCHA_POR_DEFECTO: ConfigPocha = {
  jugadores: 4,
  duracion: 'corta',
  restriccionRepartidor: true,
};

export interface ResultadoManoPocha {
  /** Cartas que recibió cada jugador en la mano. */
  readonly cartas: number;
  readonly apuestas: readonly number[];
  readonly bazas: readonly number[];
  readonly puntos: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoPocha {
  readonly config: ConfigPocha;
  readonly azar: EstadoAzar;
  /** Cartas que recibe cada jugador en cada mano de la partida. */
  readonly secuencia: readonly number[];
  readonly indiceMano: number;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Cartas que no se repartieron (ocultas). */
  readonly mazo: readonly IdCarta[];
  /** Carta boca arriba que marca el triunfo; `null` si se repartió toda la baraja. */
  readonly muestra: IdCarta | null;
  /** Última carta del repartidor, visible mientras siga en su mano, si no hay muestra. */
  readonly cartaTriunfo: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly fase: 'apostar' | 'jugar';
  readonly apuestas: readonly (number | null)[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly bazas: readonly number[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly resultadosManos: readonly ResultadoManoPocha[];
  readonly totales: readonly number[];
}

export type AccionPocha =
  | { readonly tipo: 'apostar'; readonly bazas: number }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaPocha {
  readonly config: ConfigPocha;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly muestra: IdCarta | null;
  readonly cartaTriunfo: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly fase: 'apostar' | 'jugar';
  readonly apuestas: readonly (number | null)[];
  /** Apuesta que el repartidor no puede hacer, si la hay y le toca apostar. */
  readonly apuestaProhibida: number | null;
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly bazas: readonly number[];
  readonly ultimaBaza: EstadoPocha['ultimaBaza'];
  /** Cartas ya jugadas en bazas de la mano, a la vista de todos cuando se jugaron. */
  readonly jugadas: readonly IdCarta[];
  /** Cartas de cada jugador en la mano en curso. */
  readonly cartasMano: number;
  /** Posición de la mano en curso (desde 0) y número total de manos. */
  readonly indiceMano: number;
  readonly totalManos: number;
  readonly resultadosManos: readonly ResultadoManoPocha[];
  readonly totales: readonly number[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_BARAJA = 40;
const MAXIMO_CORTA = 5;
const BONO_ACIERTO = 10;
const PUNTOS_POR_BAZA = 5;

/** Cartas de cada mano: sube de 1 al máximo y baja hasta 1, jugando el máximo una vez. */
export function secuenciaPocha(config: ConfigPocha): number[] {
  const maximo =
    config.duracion === 'corta' ? MAXIMO_CORTA : Math.floor(CARTAS_BARAJA / config.jugadores);
  const subida = Array.from({ length: maximo }, (_, i) => i + 1);
  return [...subida, ...subida.slice(0, -1).reverse()];
}

/** Puntos de una mano: 10 más 5 por baza apostada si se acierta; −5 por baza de diferencia si no. */
export function puntosPocha(apuesta: number, bazas: number): number {
  return apuesta === bazas
    ? BONO_ACIERTO + PUNTOS_POR_BAZA * apuesta
    : -PUNTOS_POR_BAZA * Math.abs(bazas - apuesta);
}

const partidaTerminada = (e: EstadoPocha) => e.resultadosManos.length === e.secuencia.length;

/** Apuesta prohibida para el repartidor, o `null` si no rige o no le toca. */
function apuestaProhibida(e: EstadoPocha): number | null {
  if (!e.config.restriccionRepartidor || e.fase !== 'apostar' || e.turno !== e.repartidor) {
    return null;
  }
  const cartas = e.secuencia[e.indiceMano]!;
  const suma = e.apuestas.reduce<number>((s, a) => s + (a ?? 0), 0);
  const prohibida = cartas - suma;
  return prohibida >= 0 && prohibida <= cartas ? prohibida : null;
}

/**
 * Reparte la mano `indiceMano` de la secuencia; sale (y apuesta primero) el siguiente al
 * repartidor. Se conserva la última baza de la mano anterior para poder verla.
 */
function nuevaMano(
  config: ConfigPocha,
  azar: EstadoAzar,
  secuencia: readonly number[],
  indiceMano: number,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoPocha[],
  totales: readonly number[],
  ultimaBaza: EstadoPocha['ultimaBaza'] = null,
): EstadoPocha {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const n = config.jugadores;
  const enMano = secuencia[indiceMano]!;
  const sale = siguiente(repartidor, n);
  const reparto = repartir(cartas, new Array<number>(n).fill(enMano));
  if (!reparto.ok) throw new Error(reparto.error);
  // El reparto empieza por el que sale, así que la última carta repartida es del repartidor.
  const manos = Array.from(
    { length: n },
    (_, asiento) => reparto.valor.manos[(asiento - sale + n) % n]!,
  );
  const [muestra = null, ...mazo] = reparto.valor.mazo;
  const cartaTriunfo = muestra === null ? manos[repartidor]!.at(-1)! : null;
  return {
    config,
    azar: azarSiguiente,
    secuencia,
    indiceMano,
    repartidor,
    manos,
    mazo,
    muestra,
    cartaTriunfo,
    triunfo: paloDe((muestra ?? cartaTriunfo)!),
    fase: 'apostar',
    apuestas: new Array<number | null>(n).fill(null),
    turno: sale,
    mesa: [],
    bazas: new Array<number>(n).fill(0),
    ultimaBaza,
    resultadosManos,
    totales,
  };
}

function cerrarMano(e: EstadoPocha): EstadoPocha {
  const apuestas = e.apuestas.map((a) => a ?? 0);
  const puntos = apuestas.map((a, asiento) => puntosPocha(a, e.bazas[asiento]!));
  const totales = e.totales.map((t, asiento) => t + puntos[asiento]!);
  const resultadosManos = [
    ...e.resultadosManos,
    {
      cartas: e.secuencia[e.indiceMano]!,
      apuestas,
      bazas: [...e.bazas],
      puntos,
      totalesTras: totales,
    },
  ];
  const cerrado: EstadoPocha = { ...e, resultadosManos, totales };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    e.secuencia,
    e.indiceMano + 1,
    siguiente(e.repartidor, e.config.jugadores),
    resultadosManos,
    totales,
    e.ultimaBaza,
  );
}

function resolverBaza(e: EstadoPocha): EstadoPocha {
  const ganador = cartaGanadora(e.mesa, e.triunfo).asiento;
  const resuelto: EstadoPocha = {
    ...e,
    mesa: [],
    turno: ganador,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    ultimaBaza: { cartas: e.mesa, ganador },
  };
  return e.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const pocha: Juego<ConfigPocha, EstadoPocha, AccionPocha, VistaPocha> = {
  id: 'pocha',

  crear(config, semilla) {
    if (config.jugadores !== 3 && config.jugadores !== 4) {
      return error('La Pocha se juega con 3 o 4 jugadores');
    }
    if (config.duracion !== 'corta' && config.duracion !== 'completa') {
      return error('Duración de la partida inválida');
    }
    if (typeof config.restriccionRepartidor !== 'boolean') {
      return error('Opción de restricción del repartidor inválida');
    }
    const limpia: ConfigPocha = {
      jugadores: config.jugadores,
      duracion: config.duracion,
      restriccionRepartidor: config.restriccionRepartidor,
    };
    // Empieza repartiendo el último asiento, así apuesta y sale primero el asiento 0.
    const totales = new Array<number>(limpia.jugadores).fill(0);
    return ok(
      nuevaMano(
        limpia,
        crearAzar(semilla),
        secuenciaPocha(limpia),
        0,
        limpia.jugadores - 1,
        [],
        totales,
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'apostar') {
      const prohibida = apuestaProhibida(e);
      const cartas = e.secuencia[e.indiceMano]!;
      return Array.from({ length: cartas + 1 }, (_, bazas) => bazas)
        .filter((bazas) => bazas !== prohibida)
        .map((bazas) => ({ tipo: 'apostar', bazas }));
    }
    return cartasObligadas(e.manos[asiento]!, e.mesa, e.triunfo, {
      asiento,
      montarSobreCompanero: true,
    }).map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    switch (accion.tipo) {
      case 'apostar': {
        const apuestas = e.apuestas.map((a, i) => (i === asiento ? accion.bazas : a));
        // El repartidor apuesta el último; tras él sale el siguiente al repartidor.
        return asiento === e.repartidor
          ? { ...e, apuestas, fase: 'jugar', turno: siguiente(e.repartidor, n) }
          : { ...e, apuestas, turno: siguiente(asiento, n) };
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const cartaTriunfo = accion.carta === e.cartaTriunfo ? null : e.cartaTriunfo;
        const jugado: EstadoPocha = { ...e, manos, mesa, cartaTriunfo };
        return mesa.length < n ? { ...jugado, turno: siguiente(asiento, n) } : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    const terminada = partidaTerminada(e);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      muestra: e.muestra,
      cartaTriunfo: e.cartaTriunfo,
      triunfo: e.triunfo,
      fase: e.fase,
      apuestas: [...e.apuestas],
      apuestaProhibida: terminada ? null : apuestaProhibida(e),
      mesa: [...e.mesa],
      turno: terminada ? null : e.turno,
      repartidor: e.repartidor,
      bazas: [...e.bazas],
      ultimaBaza: e.ultimaBaza,
      jugadas: cartasFuera(
        crearBaraja('espanola40'),
        ...e.manos,
        e.mazo,
        e.muestra === null ? [] : [e.muestra],
        e.mesa.map((j) => j.carta),
      ),
      cartasMano: e.secuencia[e.indiceMano]!,
      indiceMano: e.indiceMano,
      totalManos: e.secuencia.length,
      resultadosManos: [...e.resultadosManos],
      totales: [...e.totales],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const maximo = Math.max(...e.totales);
    const ganadores = e.totales.flatMap((t, a) => (t === maximo ? [a] : []));
    const puntos = [...e.totales];
    if (ganadores.length === e.totales.length) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
