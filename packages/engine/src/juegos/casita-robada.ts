import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

/**
 * Casita robada (design, decisión 1): una pasada del mazo español de 40 cartas. Cada carta se
 * lleva las de la mesa de su número y puede robar la casita de un rival con ese número arriba.
 */

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigCasitaRobada {
  /** De 2 a 4 jugadores, cada uno por su cuenta. */
  readonly jugadores: 2 | 3 | 4;
}

export const CONFIG_CASITA_ROBADA_POR_DEFECTO: ConfigCasitaRobada = { jugadores: 2 };

export const CARTAS_MESA_CASITA = 4;
export const CARTAS_REPARTO_CASITA = 3;

export interface JugadaCasitaRobada {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
  /** Las cartas que se llevó de la mesa. */
  readonly deLaMesa: readonly IdCarta[];
  /** A quién robó la casita, y cuántas cartas tenía. */
  readonly robo: { readonly a: Asiento; readonly cartas: number } | null;
}

export interface EstadoCasitaRobada {
  readonly config: ConfigCasitaRobada;
  readonly azar: EstadoAzar;
  readonly mesa: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  /** Boca abajo; se reparte la primera. */
  readonly mazo: readonly IdCarta[];
  /** La casita de cada uno, de abajo arriba. */
  readonly casitas: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  /** El último que se llevó cartas, para quien son las que queden en la mesa. */
  readonly ultimoEnLlevarse: Asiento | null;
  readonly ultimaJugada: JugadaCasitaRobada | null;
  /** Al terminar: quién se llevó las cartas que quedaban en la mesa, y cuántas. */
  readonly final: { readonly para: Asiento | null; readonly cartas: number } | null;
}

export type AccionCasitaRobada = {
  readonly tipo: 'jugar';
  readonly carta: IdCarta;
  /** El rival al que roba la casita, o `null` si no roba. */
  readonly robar: Asiento | null;
};

export interface VistaCasitaRobada {
  readonly config: ConfigCasitaRobada;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly mesa: readonly IdCarta[];
  readonly casitas: readonly (readonly IdCarta[])[];
  readonly turno: Asiento | null;
  readonly ultimoEnLlevarse: Asiento | null;
  readonly ultimaJugada: JugadaCasitaRobada | null;
  readonly final: EstadoCasitaRobada['final'];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** El número de una carta (del As al Rey, 1 a 12). */
export const numeroCasita = (c: IdCarta) => cartaDeId(c)!.valor;

/** La carta de arriba de una casita, o `null` si está vacía. */
export const arribaCasita = (casita: readonly IdCarta[]) => casita.at(-1) ?? null;

/** A quiénes se puede robar con esa carta: los rivales con una carta de su número arriba. */
export function robablesCasita(
  casitas: readonly (readonly IdCarta[])[],
  asiento: Asiento,
  carta: IdCarta,
): Asiento[] {
  return casitas.flatMap((casita, a) => {
    const arriba = arribaCasita(casita);
    return a !== asiento && arriba !== null && numeroCasita(arriba) === numeroCasita(carta)
      ? [a]
      : [];
  });
}

const terminada = (e: Pick<EstadoCasitaRobada, 'final'>) => e.final !== null;

/** Si todos se han quedado sin cartas, reparte otras 3 o, sin mazo, termina la partida. */
function repartirOTerminar(e: EstadoCasitaRobada): EstadoCasitaRobada {
  if (e.manos.some((m) => m.length > 0)) return e;
  const n = e.config.jugadores;
  if (e.mazo.length > 0) {
    const mazo = [...e.mazo];
    const manos = Array.from({ length: n }, () => mazo.splice(0, CARTAS_REPARTO_CASITA));
    return { ...e, manos, mazo };
  }
  // Las de la mesa, para el último que se llevó cartas.
  const para = e.ultimoEnLlevarse;
  return {
    ...e,
    casitas:
      para === null ? e.casitas : e.casitas.map((c, a) => (a === para ? [...e.mesa, ...c] : c)),
    mesa: para === null ? e.mesa : [],
    final: { para, cartas: para === null ? 0 : e.mesa.length },
  };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const casitaRobada: Juego<
  ConfigCasitaRobada,
  EstadoCasitaRobada,
  AccionCasitaRobada,
  VistaCasitaRobada
> = {
  id: 'casitaRobada',

  crear(config, semilla) {
    if (![2, 3, 4].includes(config.jugadores)) {
      return error('La Casita robada se juega de 2 a 4 jugadores');
    }
    const n = config.jugadores;
    const { cartas, azar } = barajar(crearBaraja('espanola40'), crearAzar(semilla));
    const mazo = [...cartas];
    const mesa = mazo.splice(0, CARTAS_MESA_CASITA);
    const manos = Array.from({ length: n }, () => mazo.splice(0, CARTAS_REPARTO_CASITA));
    return ok({
      config: { jugadores: n },
      azar,
      mesa,
      manos,
      mazo,
      casitas: Array.from({ length: n }, () => []),
      turno: 0,
      ultimoEnLlevarse: null,
      ultimaJugada: null,
      final: null,
    });
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    return [...e.manos[asiento]!].sort().flatMap((carta) => [
      { tipo: 'jugar' as const, carta, robar: null },
      ...robablesCasita(e.casitas, asiento, carta).map((robar) => ({
        tipo: 'jugar' as const,
        carta,
        robar,
      })),
    ]);
  },

  transicion(e, asiento, accion) {
    const { carta, robar } = accion;
    const numero = numeroCasita(carta);
    const deLaMesa = e.mesa.filter((c) => numeroCasita(c) === numero);
    const robadas = robar === null ? [] : e.casitas[robar]!;
    const seLleva = deLaMesa.length > 0 || robar !== null;
    const casitas = e.casitas.map((c, a) => {
      if (a === robar) return [];
      if (a === asiento && seLleva) return [...c, ...robadas, ...deLaMesa, carta];
      return c;
    });
    const jugado: EstadoCasitaRobada = {
      ...e,
      mesa: seLleva ? e.mesa.filter((c) => !deLaMesa.includes(c)) : [...e.mesa, carta],
      manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
      casitas,
      turno: (asiento + 1) % e.config.jugadores,
      ultimoEnLlevarse: seLleva ? asiento : e.ultimoEnLlevarse,
      ultimaJugada: {
        asiento,
        carta,
        deLaMesa,
        robo: robar === null ? null : { a: robar, cartas: robadas.length },
      },
    };
    return repartirOTerminar(jugado);
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      mesa: [...e.mesa],
      casitas: e.casitas.map((c) => [...c]),
      turno: terminada(e) ? null : e.turno,
      ultimoEnLlevarse: e.ultimoEnLlevarse,
      ultimaJugada: e.ultimaJugada,
      final: e.final,
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = e.casitas.map((c) => c.length);
    const maximo = Math.max(...puntos);
    const ganadores = puntos.flatMap((p, a) => (p === maximo ? [a] : []));
    if (ganadores.length === puntos.length) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
