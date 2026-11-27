import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  cartaDeCambio,
  cartaGanadora,
  cartasObligadas,
  paloDe,
  puntosDe,
  siguiente,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export const MANOS_CUARENTA_Y_TRES = [3, 6] as const;

export interface ConfigCuarentaYTres {
  /** Manos de la partida: un múltiplo de 3, para que todos repartan lo mismo. */
  readonly manos: (typeof MANOS_CUARENTA_Y_TRES)[number];
}

export const CONFIG_CUARENTA_Y_TRES_POR_DEFECTO: ConfigCuarentaYTres = { manos: 6 };

const JUGADORES = 3;
const CARTAS_EN_MANO = 13;
export const NUEVE_DE_ULTIMAS = 9;
/** El tercio de los 129 tantos de una mano: lo que hay que hacer para no pagar ni cobrar. */
export const TANTOS_CUARENTA_Y_TRES = 43;

/** Quién cambió la muestra, la carta que se llevó y cuántas cartas se habían jugado ya. */
export interface CambioMuestra {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
  readonly cartasJugadas: number;
}

export interface BazaCuarentaYTres {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export interface ResultadoManoCuarentaYTres {
  readonly repartidor: Asiento;
  /** Tantos de cada jugador: cartas y últimas. */
  readonly tantos: readonly number[];
  /** Quien ganó la última baza y sumó las 9 de últimas. */
  readonly ultimas: Asiento;
  /** La muestra que salió al repartir y, si se cambió, quién se la llevó. */
  readonly muestra: IdCarta;
  readonly cambio: CambioMuestra | null;
  readonly saldosTras: readonly number[];
}

export interface EstadoCuarentaYTres {
  readonly config: ConfigCuarentaYTres;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  /** La carta boca arriba en la mesa: la que salió o, tras el cambio, la entregada. */
  readonly muestra: IdCarta;
  readonly triunfo: PaloEspanol;
  readonly cambio: CambioMuestra | null;
  readonly bazasJugadas: readonly BazaCuarentaYTres[];
  readonly ultimaBaza: BazaCuarentaYTres | null;
  readonly bazas: readonly number[];
  /** Tantos de cada jugador en la mano en curso. */
  readonly tantos: readonly number[];
  /** Lo que lleva cada jugador por encima (o por debajo) de 43 en las manos jugadas. */
  readonly saldos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoCuarentaYTres[];
}

export type AccionCuarentaYTres =
  { readonly tipo: 'jugar'; readonly carta: IdCarta } | { readonly tipo: 'cambiarSiete' };

export interface VistaCuarentaYTres {
  readonly config: ConfigCuarentaYTres & { readonly jugadores: 3 };
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: 0;
  readonly muestra: IdCarta;
  readonly triunfo: PaloEspanol;
  readonly cambio: CambioMuestra | null;
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaCuarentaYTres[];
  readonly ultimaBaza: BazaCuarentaYTres | null;
  readonly bazas: readonly number[];
  readonly tantos: readonly number[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly saldos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoCuarentaYTres[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/**
 * Cartas que se pueden jugar: asistir y montar; sin el palo, fallar y montar el fallo, salvo que
 * no se pueda superar (entonces, cualquiera). Cada uno juega por su cuenta.
 */
export const cartasLegalesCuarentaYTres = (
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloEspanol,
  asiento: Asiento,
) =>
  cartasObligadas(mano, mesa, triunfo, {
    asiento,
    montarSobreCompanero: true,
    sobrefalloLibre: true,
  });

/** Lo que cobra (o paga, en negativo) quien hace estos tantos. */
export const liquidacion = (tantos: number) => tantos - TANTOS_CUARENTA_Y_TRES;

const terminada = (e: Pick<EstadoCuarentaYTres, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= e.config.manos;

/** Si el asiento puede cambiar la muestra: una vez por mano y antes de jugar su carta. */
function puedeCambiar(e: EstadoCuarentaYTres, asiento: Asiento): boolean {
  if (e.cambio !== null) return false;
  const cambio = cartaDeCambio(e.muestra);
  return cambio !== e.muestra && e.manos[asiento]!.includes(cambio);
}

function nuevaMano(
  base: Pick<EstadoCuarentaYTres, 'config' | 'saldos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoCuarentaYTres {
  const { cartas, azar: sig } = barajar(crearBaraja('espanola40'), azar);
  const sale = siguiente(repartidor, JUGADORES);
  // De una en una desde el que sale; la carta 40 es la muestra.
  const manos = Array.from({ length: JUGADORES }, () => [] as IdCarta[]);
  for (let i = 0; i < JUGADORES * CARTAS_EN_MANO; i++) {
    manos[(sale + i) % JUGADORES]!.push(cartas[i]!);
  }
  const muestra = cartas[JUGADORES * CARTAS_EN_MANO]!;
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    turno: sale,
    mesa: [],
    muestra,
    triunfo: paloDe(muestra),
    cambio: null,
    bazasJugadas: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    bazas: new Array<number>(JUGADORES).fill(0),
    tantos: new Array<number>(JUGADORES).fill(0),
  };
}

function cerrarMano(e: EstadoCuarentaYTres, ultimas: Asiento): EstadoCuarentaYTres {
  const tantos = e.tantos.map((t, a) => (a === ultimas ? t + NUEVE_DE_ULTIMAS : t));
  const saldos = e.saldos.map((s, a) => s + liquidacion(tantos[a]!));
  const cerrado: EstadoCuarentaYTres = {
    ...e,
    tantos,
    saldos,
    resultadosManos: [
      ...e.resultadosManos,
      {
        repartidor: e.repartidor,
        tantos,
        ultimas,
        muestra: e.cambio?.carta ?? e.muestra,
        cambio: e.cambio,
        saldosTras: saldos,
      },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, JUGADORES), e.azar);
}

function resolverBaza(e: EstadoCuarentaYTres): EstadoCuarentaYTres {
  const ganador = cartaGanadora(e.mesa, e.triunfo).asiento;
  const valor = e.mesa.reduce((s, j) => s + puntosDe(j.carta), 0);
  const baza: BazaCuarentaYTres = { cartas: e.mesa, ganador };
  const resuelto: EstadoCuarentaYTres = {
    ...e,
    mesa: [],
    turno: ganador,
    bazasJugadas: [...e.bazasJugadas, baza],
    ultimaBaza: baza,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    tantos: e.tantos.map((t, a) => (a === ganador ? t + valor : t)),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto, ganador) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cuarentaYTres: Juego<
  ConfigCuarentaYTres,
  EstadoCuarentaYTres,
  AccionCuarentaYTres,
  VistaCuarentaYTres
> = {
  id: 'cuarenta-y-tres',

  crear(config, semilla) {
    if (!(MANOS_CUARENTA_Y_TRES as readonly number[]).includes(config.manos)) {
      return error('La partida debe ser de 3 o 6 manos');
    }
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(
      nuevaMano(
        {
          config: { manos: config.manos },
          saldos: new Array<number>(JUGADORES).fill(0),
          resultadosManos: [],
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const acciones: AccionCuarentaYTres[] = [];
    if (puedeCambiar(e, asiento)) acciones.push({ tipo: 'cambiarSiete' });
    for (const carta of cartasLegalesCuarentaYTres(e.manos[asiento]!, e.mesa, e.triunfo, asiento)) {
      acciones.push({ tipo: 'jugar', carta });
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'cambiarSiete') {
      const entregada = cartaDeCambio(e.muestra);
      const manos = e.manos.map((m, a) =>
        a === asiento ? [...m.filter((c) => c !== entregada), e.muestra] : m,
      );
      const cartasJugadas = e.bazasJugadas.length * JUGADORES + e.mesa.length;
      return {
        ...e,
        manos,
        muestra: entregada,
        cambio: { asiento, carta: e.muestra, cartasJugadas },
      };
    }
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const jugado: EstadoCuarentaYTres = { ...e, manos, mesa };
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
      muestra: e.muestra,
      triunfo: e.triunfo,
      cambio: e.cambio,
      repartidor: e.repartidor,
      turno: terminada(e) ? null : e.turno,
      mesa: [...e.mesa],
      bazasJugadas: [...e.bazasJugadas],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      tantos: [...e.tantos],
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      saldos: [...e.saldos],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const maximo = Math.max(...e.saldos);
    const ganadores = e.saldos.flatMap((s, a) => (s === maximo ? [a] : []));
    return { ganadores, empate: false, puntos: [...e.saldos] };
  },
};
