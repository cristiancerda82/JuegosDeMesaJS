import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigPolignac {
  readonly jugadores: 3 | 4 | 5 | 6;
  /** La partida acaba al llegar a −limite. */
  readonly limite: 10 | 20 | 30;
  /** Si se puede anunciar el general. */
  readonly general: boolean;
}

export const CONFIG_POLIGNAC_POR_DEFECTO: ConfigPolignac = {
  jugadores: 4,
  limite: 10,
  general: true,
};

export const LIMITES_POLIGNAC = [10, 20, 30] as const;

/** Lo que resta a cada uno de los demás el general cumplido, o a quien lo falla. */
export const PUNTOS_GENERAL_POLIGNAC = 5;

export type FasePolignac = 'general' | 'bazas';

export interface ResultadoManoPolignac {
  /** Quien jugó el general, si alguien lo anunció. */
  readonly general: Asiento | null;
  /** Si el general se cumplió; `null` sin general. */
  readonly cumplido: boolean | null;
  readonly puntos: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoPolignac {
  readonly config: ConfigPolignac;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FasePolignac;
  /** Quien juega el general en esta mano. */
  readonly general: Asiento | null;
  /** Cuántos han pasado ya el general en esta mano. */
  readonly pasados: number;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazasJugadas: number;
  /** Bazas ganadas por cada uno en la mano. */
  readonly bazas: readonly number[];
  readonly puntosMano: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos de salida que cada uno no siguió. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoPolignac[];
}

export type AccionPolignac =
  | { readonly tipo: 'general' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaPolignac {
  readonly config: ConfigPolignac;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly fase: FasePolignac;
  readonly general: Asiento | null;
  readonly pasados: number;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoPolignac['ultimaBaza'];
  readonly bazasJugadas: number;
  readonly bazas: readonly number[];
  readonly puntosMano: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoPolignac[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** Los dos sietes que se quitan con 3, 5 o 6 jugadores. */
export const SIETES_QUITADOS_POLIGNAC: readonly IdCarta[] = ['picas-7', 'treboles-7'];

/** Del 7 al As: 32 cartas con 4 jugadores; 30 (sin el 7 de picas ni el de tréboles) si no. */
export function barajaPolignac(jugadores: number): IdCarta[] {
  return crearBaraja('francesa52').filter((c) => {
    const v = cartaDeId(c)!.valor;
    if (v !== 1 && v < 7) return false;
    return jugadores === 4 || !SIETES_QUITADOS_POLIGNAC.includes(c);
  });
}

/** Cartas que recibe cada uno: 10 con 3, 8 con 4, 6 con 5 y 5 con 6. */
export const cartasPorJugadorPolignac = (jugadores: number) =>
  barajaPolignac(jugadores).length / jugadores;

export const paloPolignac = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** El orden: del 7 (7) al As (14). */
export const rangoPolignac = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};

/** La J de picas, el «Polignac». */
export const JOTA_PICAS_POLIGNAC: IdCarta = 'picas-11';

/** Lo que resta una carta ganada: 2 la J de picas, 1 las otras J, 0 el resto. */
export function penalizaPolignac(c: IdCarta): number {
  if (c === JOTA_PICAS_POLIGNAC) return 2;
  return rangoPolignac(c) === 11 ? 1 : 0;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** Carta que gana la baza: la más alta del palo de salida (no hay triunfo). */
export function ganadoraPolignac(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = paloPolignac(mesa[0]!.carta);
  const valor = (c: IdCarta) => (paloPolignac(c) === salida ? rangoPolignac(c) : 0);
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar en una baza: el palo de salida si se tiene; si no, todas. */
export function cartasLegalesPolignac(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloPolignac(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloPolignac(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

// ── Mano ─────────────────────────────────────────────────────────────────────

const siguiente = (a: Asiento, n: number) => (a + 1) % n;

const terminada = (e: Pick<EstadoPolignac, 'totales' | 'config'>) =>
  e.totales.some((t) => t <= -e.config.limite);

function nuevaMano(
  base: Pick<EstadoPolignac, 'config' | 'totales' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoPolignac {
  const n = base.config.jugadores;
  const porJugador = cartasPorJugadorPolignac(n);
  const { cartas, azar: sig } = barajar(barajaPolignac(n), azar);
  const ceros = Array.from({ length: n }, () => 0);
  return {
    ...base,
    azar: sig,
    repartidor,
    fase: base.config.general ? 'general' : 'bazas',
    general: null,
    pasados: 0,
    manos: Array.from({ length: n }, (_, k) => cartas.slice(k * porJugador, (k + 1) * porJugador)),
    turno: siguiente(repartidor, n),
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    bazasJugadas: 0,
    bazas: ceros,
    puntosMano: ceros,
    jugadasPor: Array.from({ length: n }, () => []),
    fallos: Array.from({ length: n }, () => []),
  };
}

function cerrarMano(e: EstadoPolignac, cumplido: boolean | null): EstadoPolignac {
  const totales = e.totales.map((t, a) => t + e.puntosMano[a]!);
  const cerrado: EstadoPolignac = {
    ...e,
    totales,
    resultadosManos: [
      ...e.resultadosManos,
      { general: e.general, cumplido, puntos: e.puntosMano, totalesTras: totales },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, e.config.jugadores), e.azar);
}

function resolverBaza(e: EstadoPolignac): EstadoPolignac {
  const ganador = ganadoraPolignac(e.mesa).asiento;
  const resuelto: EstadoPolignac = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazasJugadas: e.bazasJugadas + 1,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  const sinCartas = resuelto.manos.every((m) => m.length === 0);

  if (e.general !== null) {
    // El general se pierde con la primera baza que no gana quien lo juega.
    if (ganador !== e.general) {
      return cerrarMano(
        {
          ...resuelto,
          puntosMano: e.puntosMano.map((_, a) => (a === e.general ? -PUNTOS_GENERAL_POLIGNAC : 0)),
        },
        false,
      );
    }
    if (!sinCartas) return resuelto;
    return cerrarMano(
      {
        ...resuelto,
        puntosMano: e.puntosMano.map((_, a) => (a === e.general ? 0 : -PUNTOS_GENERAL_POLIGNAC)),
      },
      true,
    );
  }

  const pena = e.mesa.reduce((s, j) => s + penalizaPolignac(j.carta), 0);
  const conPuntos: EstadoPolignac = {
    ...resuelto,
    puntosMano: e.puntosMano.map((p, a) => (a === ganador ? p - pena : p)),
  };
  // Se acaba en cuanto se han ganado todas las J.
  const quedanJotas = conPuntos.manos.some((m) => m.some((c) => penalizaPolignac(c) > 0));
  return sinCartas || !quedanJotas ? cerrarMano(conPuntos, null) : conPuntos;
}

function jugarBaza(e: EstadoPolignac, asiento: Asiento, carta: IdCarta): EstadoPolignac {
  const mesa = [...e.mesa, { asiento, carta }];
  const salida = paloPolignac(mesa[0]!.carta);
  const nuevo = paloPolignac(carta) !== salida && !e.fallos[asiento]!.includes(salida);
  const jugado: EstadoPolignac = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
    mesa,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
    fallos: nuevo ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f)) : e.fallos,
  };
  return mesa.length < e.config.jugadores
    ? { ...jugado, turno: siguiente(asiento, e.config.jugadores) }
    : resolverBaza(jugado);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const polignac: Juego<ConfigPolignac, EstadoPolignac, AccionPolignac, VistaPolignac> = {
  id: 'polignac',

  crear(config, semilla) {
    if (![3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Polignac se juega de 3 a 6 jugadores');
    }
    if (!LIMITES_POLIGNAC.includes(config.limite)) {
      return error('El límite debe ser 10, 20 o 30');
    }
    const n = config.jugadores;
    return ok(
      nuevaMano(
        {
          config: { jugadores: n, limite: config.limite, general: config.general === true },
          totales: Array.from({ length: n }, () => 0),
          resultadosManos: [],
        },
        0,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'general') return [{ tipo: 'general' }, { tipo: 'pasar' }];
    return cartasLegalesPolignac(e.manos[asiento]!, e.mesa)
      .sort()
      .map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    switch (accion.tipo) {
      case 'general':
        return { ...e, general: asiento, fase: 'bazas', turno: asiento };
      case 'pasar': {
        const pasados = e.pasados + 1;
        if (pasados < n) return { ...e, pasados, turno: siguiente(asiento, n) };
        return { ...e, pasados, fase: 'bazas', turno: siguiente(e.repartidor, n) };
      }
      case 'jugar':
        return jugarBaza(e, asiento, accion.carta);
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      fase: e.fase,
      general: e.general,
      pasados: e.pasados,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazasJugadas: e.bazasJugadas,
      bazas: [...e.bazas],
      puntosMano: [...e.puntosMano],
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      fallos: e.fallos.map((f) => [...f]),
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      totales: [...e.totales],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const maximo = Math.max(...e.totales);
    const ganadores = e.totales.flatMap((t, a) => (t === maximo ? [a] : []));
    if (ganadores.length === e.config.jugadores) {
      return { ganadores: [], empate: true, puntos: [...e.totales] };
    }
    return { ganadores, empate: false, puntos: [...e.totales] };
  },
};
