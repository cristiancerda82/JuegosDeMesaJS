import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  cartaGanadora,
  cartasObligadas,
  paloDe,
  puntosDe,
  siguiente,
  valorDe,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export const LIMITES_TUTE_GANA_PIERDE = [3, 6] as const;

export interface ConfigTuteGanaPierde {
  /** La partida acaba cuando alguien llega a estas penalizaciones. */
  readonly limite: (typeof LIMITES_TUTE_GANA_PIERDE)[number];
}

export const CONFIG_TUTE_GANA_PIERDE_POR_DEFECTO: ConfigTuteGanaPierde = { limite: 6 };

const JUGADORES = 3;
const REY = 12;
const CABALLO = 11;
export const DIEZ_DE_ULTIMAS_GANA_PIERDE = 10;

export interface CanteGanaPierde {
  readonly asiento: Asiento;
  readonly palo: PaloEspanol;
  readonly puntos: 20 | 40;
}

/** Una baza terminada, con el triunfo que regía al jugarla y el cante que provocó. */
export interface BazaGanaPierde {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
  readonly triunfo: PaloEspanol | null;
  readonly cante: CanteGanaPierde | null;
}

export interface ResultadoManoTuteGanaPierde {
  readonly repartidor: Asiento;
  /** Tantos de cada jugador: cartas, cantes y últimas. */
  readonly tantos: readonly number[];
  /** Tantos de los cantes de cada jugador. */
  readonly cantados: readonly number[];
  /** Quien ganó la última baza y sumó las 10 de últimas. */
  readonly ultimas: Asiento;
  readonly triunfo: PaloEspanol | null;
  /** Quienes se llevan la penalización (ninguno si empatan los tres). */
  readonly penalizados: readonly Asiento[];
  readonly penalizacionesTras: readonly number[];
}

export interface EstadoTuteGanaPierde {
  readonly config: ConfigTuteGanaPierde;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  /** `null` mientras no se han cantado las cuarenta. */
  readonly triunfo: PaloEspanol | null;
  readonly cantes: readonly CanteGanaPierde[];
  readonly bazasJugadas: readonly BazaGanaPierde[];
  readonly ultimaBaza: BazaGanaPierde | null;
  readonly bazas: readonly number[];
  /** Tantos de cada jugador en la mano en curso, con los cantes. */
  readonly tantos: readonly number[];
  readonly penalizaciones: readonly number[];
  readonly resultadosManos: readonly ResultadoManoTuteGanaPierde[];
}

export type AccionTuteGanaPierde = { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaTuteGanaPierde {
  readonly config: ConfigTuteGanaPierde & { readonly jugadores: 3 };
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: 0;
  readonly muestra: null;
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly triunfo: PaloEspanol | null;
  readonly cantes: readonly CanteGanaPierde[];
  readonly bazasJugadas: readonly BazaGanaPierde[];
  readonly ultimaBaza: BazaGanaPierde | null;
  readonly bazas: readonly number[];
  readonly tantos: readonly number[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly penalizaciones: readonly number[];
  readonly resultadosManos: readonly ResultadoManoTuteGanaPierde[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** La baraja de 40 sin los doses: 36 cartas. */
export const barajaTuteGanaPierde = (): IdCarta[] =>
  crearBaraja('espanola40').filter((c) => valorDe(c) !== 2);

/**
 * Quienes se llevan la penalización: el del medio; con empates, los que no tienen el mínimo
 * (con 15, 15 y 100, el de 100; con 10, 60 y 60, los dos de 60); si empatan los tres, nadie.
 */
export function penalizadosGanaPierde(tantos: readonly number[]): Asiento[] {
  const minimo = Math.min(...tantos);
  const maximo = Math.max(...tantos);
  const distintos = new Set(tantos).size;
  if (distintos === tantos.length) {
    return tantos.flatMap((t, a) => (t !== minimo && t !== maximo ? [a] : []));
  }
  return tantos.flatMap((t, a) => (t !== minimo ? [a] : []));
}

/** El palo del Rey y el Caballo que han caído juntos en la baza, si los hay. */
export function parejaEnBaza(cartas: readonly CartaJugada[]): PaloEspanol | null {
  const ids = cartas.map((j) => j.carta);
  const rey = ids.find((c) => valorDe(c) === REY && ids.includes(`${paloDe(c)}-${CABALLO}`));
  return rey === undefined ? null : paloDe(rey);
}

/**
 * Cartas que se pueden jugar: asistir y montar; sin el palo, fallar y montar el fallo, salvo que
 * no se pueda superar (entonces, cualquiera). Sin triunfo, sin el palo, cualquiera.
 */
export const cartasLegalesGanaPierde = (
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloEspanol | null,
  asiento: Asiento,
) =>
  cartasObligadas(mano, mesa, triunfo, {
    asiento,
    montarSobreCompanero: true,
    sobrefalloLibre: true,
  });

const terminada = (e: Pick<EstadoTuteGanaPierde, 'penalizaciones' | 'config'>) =>
  e.penalizaciones.some((p) => p >= e.config.limite);

function nuevaMano(
  base: Pick<EstadoTuteGanaPierde, 'config' | 'penalizaciones' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoTuteGanaPierde {
  const { cartas, azar: sig } = barajar(barajaTuteGanaPierde(), azar);
  const sale = siguiente(repartidor, JUGADORES);
  // De tres en tres desde el que sale.
  const manos = Array.from({ length: JUGADORES }, () => [] as IdCarta[]);
  for (let i = 0; i < cartas.length; i++) {
    manos[(sale + Math.floor(i / 3)) % JUGADORES]!.push(cartas[i]!);
  }
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    turno: sale,
    mesa: [],
    triunfo: null,
    cantes: [],
    bazasJugadas: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    bazas: new Array<number>(JUGADORES).fill(0),
    tantos: new Array<number>(JUGADORES).fill(0),
  };
}

function cerrarMano(e: EstadoTuteGanaPierde, ultimas: Asiento): EstadoTuteGanaPierde {
  const tantos = e.tantos.map((t, a) => (a === ultimas ? t + DIEZ_DE_ULTIMAS_GANA_PIERDE : t));
  const penalizados = penalizadosGanaPierde(tantos);
  const penalizaciones = e.penalizaciones.map((p, a) => (penalizados.includes(a) ? p + 1 : p));
  const cantados = e.tantos.map((_, a) =>
    e.cantes.filter((c) => c.asiento === a).reduce((s, c) => s + c.puntos, 0),
  );
  const cerrado: EstadoTuteGanaPierde = {
    ...e,
    tantos,
    penalizaciones,
    resultadosManos: [
      ...e.resultadosManos,
      {
        repartidor: e.repartidor,
        tantos,
        cantados,
        ultimas,
        triunfo: e.triunfo,
        penalizados,
        penalizacionesTras: penalizaciones,
      },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, JUGADORES), e.azar);
}

function resolverBaza(e: EstadoTuteGanaPierde): EstadoTuteGanaPierde {
  const ganador = cartaGanadora(e.mesa, e.triunfo).asiento;
  // El Rey y el Caballo de un palo en la misma baza obligan a cantar a quien la gana.
  const pareja = parejaEnBaza(e.mesa);
  const cante: CanteGanaPierde | null =
    pareja === null
      ? null
      : { asiento: ganador, palo: pareja, puntos: e.triunfo === null ? 40 : 20 };
  const valor = e.mesa.reduce((s, j) => s + puntosDe(j.carta), 0) + (cante?.puntos ?? 0);
  const baza: BazaGanaPierde = { cartas: e.mesa, ganador, triunfo: e.triunfo, cante };
  const resuelto: EstadoTuteGanaPierde = {
    ...e,
    mesa: [],
    turno: ganador,
    triunfo: e.triunfo ?? (cante ? cante.palo : null),
    cantes: cante ? [...e.cantes, cante] : e.cantes,
    bazasJugadas: [...e.bazasJugadas, baza],
    ultimaBaza: baza,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    tantos: e.tantos.map((t, a) => (a === ganador ? t + valor : t)),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto, ganador) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const tuteGanaPierde: Juego<
  ConfigTuteGanaPierde,
  EstadoTuteGanaPierde,
  AccionTuteGanaPierde,
  VistaTuteGanaPierde
> = {
  id: 'tute-gana-pierde',

  crear(config, semilla) {
    if (!(LIMITES_TUTE_GANA_PIERDE as readonly number[]).includes(config.limite)) {
      return error('El límite debe ser 3 o 6 penalizaciones');
    }
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(
      nuevaMano(
        {
          config: { limite: config.limite },
          penalizaciones: new Array<number>(JUGADORES).fill(0),
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
    return cartasLegalesGanaPierde(e.manos[asiento]!, e.mesa, e.triunfo, asiento).map((carta) => ({
      tipo: 'jugar' as const,
      carta,
    }));
  },

  transicion(e, asiento, accion) {
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const jugado: EstadoTuteGanaPierde = { ...e, manos, mesa };
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
      turno: terminada(e) ? null : e.turno,
      mesa: [...e.mesa],
      triunfo: e.triunfo,
      cantes: [...e.cantes],
      bazasJugadas: [...e.bazasJugadas],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      tantos: [...e.tantos],
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      penalizaciones: [...e.penalizaciones],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const minimo = Math.min(...e.penalizaciones);
    const ganadores = e.penalizaciones.flatMap((p, a) => (p === minimo ? [a] : []));
    return { ganadores, empate: false, puntos: e.penalizaciones.map((p) => 0 - p) };
  },
};
