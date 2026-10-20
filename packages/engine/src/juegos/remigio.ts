import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  anadidosRemigio,
  aplicarJugadaRemigio,
  bajadasRemigio,
  cambiosRemigio,
  cartasRemigio,
  claveRemigio,
  puntosCartaRemigio,
  type CartaRemigio,
  type CombinacionRemigio,
  type JugadaRemigio,
  type NuevaCombinacionRemigio,
} from './remigio-combinaciones';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigRemigio {
  /** De 2 a 5 jugadores, cada uno por su cuenta. */
  readonly jugadores: 2 | 3 | 4 | 5;
}

export const CONFIG_REMIGIO_POR_DEFECTO: ConfigRemigio = { jugadores: 2 };

/** Cartas que recibe cada jugador. */
export const CARTAS_MANO_REMIGIO = 7;
/** Quien pasa de estos puntos queda eliminado. */
export const LIMITE_REMIGIO = 100;

/** Veces que se puede rehacer el mazo en una mano; a la siguiente, la mano se anula. */
export const REHECHOS_MAXIMOS = 2;

export type FaseRemigio = 'robar' | 'bajar';

export type AccionRemigio =
  | { readonly tipo: 'robarMazo' }
  | { readonly tipo: 'robarMonton' }
  | { readonly tipo: 'bajar'; readonly combinacion: NuevaCombinacionRemigio }
  | {
      readonly tipo: 'anadir';
      readonly combinacion: number;
      readonly carta: CartaRemigio;
      readonly puesto?: number;
    }
  | { readonly tipo: 'cambiar'; readonly combinacion: number; readonly carta: CartaRemigio }
  | { readonly tipo: 'descartar'; readonly carta: CartaRemigio };

export interface ResultadoManoRemigio {
  readonly repartidor: Asiento;
  /** Quien cerró; `null` si la mano se anuló sin cierre (mazo rehecho demasiadas veces). */
  readonly cerro: Asiento | null;
  readonly remigio: boolean;
  /** Cartas que le quedaron a cada uno (vacía para quien cerró y los eliminados). */
  readonly manos: readonly (readonly CartaRemigio[])[];
  readonly puntosMano: readonly number[];
  readonly totalesTras: readonly number[];
  readonly eliminadosTras: readonly boolean[];
}

export interface EstadoRemigio {
  readonly config: ConfigRemigio;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly numeroMano: number;
  readonly manos: readonly (readonly CartaRemigio[])[];
  /** Cartas boca abajo; se roba la primera. */
  readonly mazo: readonly CartaRemigio[];
  /** Descartes; la de arriba es la última. */
  readonly monton: readonly CartaRemigio[];
  readonly combinaciones: readonly CombinacionRemigio[];
  readonly siguienteId: number;
  readonly turno: Asiento;
  readonly fase: FaseRemigio;
  /** Quién ha bajado alguna combinación en la mano. */
  readonly bajado: readonly boolean[];
  /** Si el jugador del turno ya había bajado al empezar su turno (para el remigio). */
  readonly bajadoAntesDelTurno: boolean;
  /** Veces que se ha rehecho el mazo con el montón en esta mano. */
  readonly rehechos: number;
  readonly puntos: readonly number[];
  readonly eliminados: readonly boolean[];
  readonly resultadosManos: readonly ResultadoManoRemigio[];
  /** Lo último que hizo un jugador, para los avisos de la mesa. */
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly tipo: AccionRemigio['tipo'];
    readonly carta: CartaRemigio | null;
  } | null;
}

export interface VistaRemigio {
  readonly config: ConfigRemigio;
  readonly asiento: Asiento | null;
  readonly miMano: readonly CartaRemigio[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly monton: readonly CartaRemigio[];
  readonly combinaciones: readonly CombinacionRemigio[];
  readonly siguienteId: number;
  readonly repartidor: Asiento;
  readonly numeroMano: number;
  readonly turno: Asiento | null;
  readonly fase: FaseRemigio;
  readonly bajado: readonly boolean[];
  readonly bajadoAntesDelTurno: boolean;
  readonly rehechos: number;
  readonly puntos: readonly number[];
  readonly eliminados: readonly boolean[];
  readonly resultadosManos: readonly ResultadoManoRemigio[];
  readonly ultimaAccion: EstadoRemigio['ultimaAccion'];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

function siguienteActivo(e: Pick<EstadoRemigio, 'eliminados'>, asiento: Asiento): Asiento {
  const n = e.eliminados.length;
  for (let i = 1; i <= n; i++) {
    const a = (asiento + i) % n;
    if (!e.eliminados[a]) return a;
  }
  return asiento;
}

const activos = (e: Pick<EstadoRemigio, 'eliminados'>) => e.eliminados.filter((x) => !x).length;

function partidaTerminada(e: EstadoRemigio): boolean {
  return activos(e) <= 1;
}

/** Reparte una mano: 7 cartas a cada uno que sigue, y la primera del mazo al montón. */
function nuevaMano(
  base: Pick<
    EstadoRemigio,
    'config' | 'azar' | 'repartidor' | 'numeroMano' | 'puntos' | 'eliminados' | 'resultadosManos'
  >,
): EstadoRemigio {
  const n = base.config.jugadores;
  const { cartas, azar } = barajar(cartasRemigio(), base.azar);
  const mano = siguienteActivo(base, base.repartidor);
  const orden: Asiento[] = [];
  for (let a = mano; ; a = siguienteActivo(base, a)) {
    orden.push(a);
    if (a === base.repartidor) break;
  }
  const reparto = repartir(
    cartas,
    orden.map(() => CARTAS_MANO_REMIGIO),
  );
  if (!reparto.ok) throw new Error(reparto.error);
  const manos: CartaRemigio[][] = Array.from({ length: n }, () => []);
  orden.forEach((a, i) => (manos[a] = reparto.valor.manos[i]!));
  const [primera, ...mazo] = reparto.valor.mazo as [CartaRemigio, ...CartaRemigio[]];
  return {
    ...base,
    azar,
    manos,
    mazo,
    monton: [primera],
    combinaciones: [],
    siguienteId: 0,
    turno: mano,
    fase: 'robar',
    bajado: new Array<boolean>(n).fill(false),
    bajadoAntesDelTurno: false,
    rehechos: 0,
    ultimaAccion: null,
  };
}

/**
 * Cierra la mano: los demás suman su mano (doble con remigio), eliminados y mano siguiente. Con
 * `cerro` a `null` la mano se anula y nadie suma.
 */
function cerrarMano(e: EstadoRemigio, cerro: Asiento | null): EstadoRemigio {
  const remigio = cerro !== null && !e.bajadoAntesDelTurno;
  const multiplicador = remigio ? 2 : 1;
  const puntosMano = e.manos.map((m, a) =>
    cerro === null || a === cerro || e.eliminados[a]
      ? 0
      : m.reduce((s, c) => s + puntosCartaRemigio(c), 0) * multiplicador,
  );
  const puntos = e.puntos.map((p, a) => p + puntosMano[a]!);
  const eliminados = e.eliminados.map((x, a) => x || puntos[a]! > LIMITE_REMIGIO);
  const resultadosManos = [
    ...e.resultadosManos,
    {
      repartidor: e.repartidor,
      cerro,
      remigio,
      manos: e.manos.map((m, a) => (a === cerro ? [] : [...m])),
      puntosMano,
      totalesTras: puntos,
      eliminadosTras: eliminados,
    },
  ];
  const cerrado: EstadoRemigio = { ...e, puntos, eliminados, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano({
    ...cerrado,
    numeroMano: e.numeroMano + 1,
    repartidor: siguienteActivo(cerrado, e.repartidor),
  });
}

/** Pasa el turno al siguiente que sigue en la partida. */
function pasarTurno(e: EstadoRemigio): EstadoRemigio {
  const turno = siguienteActivo(e, e.turno);
  return { ...e, turno, fase: 'robar', bajadoAntesDelTurno: e.bajado[turno]! };
}

/** Si el mazo está vacío, se rehace con el montón menos su carta de arriba. */
function conMazo(e: EstadoRemigio): EstadoRemigio {
  if (e.mazo.length > 0 || e.monton.length <= 1) return e;
  const { cartas, azar } = barajar(e.monton.slice(0, -1), e.azar);
  return { ...e, azar, mazo: cartas, monton: e.monton.slice(-1), rehechos: e.rehechos + 1 };
}

/** Una carta de cada clase de la mano (las copias son iguales). */
function unaPorClase(mano: readonly CartaRemigio[]): CartaRemigio[] {
  const vistas = new Set<string>();
  return mano.filter((c) => {
    if (vistas.has(claveRemigio(c))) return false;
    vistas.add(claveRemigio(c));
    return true;
  });
}

const comoJugada = (a: AccionRemigio): JugadaRemigio => a as JugadaRemigio;

// ── Juego ────────────────────────────────────────────────────────────────────

export const remigio: Juego<ConfigRemigio, EstadoRemigio, AccionRemigio, VistaRemigio> = {
  id: 'remigio',

  crear(config, semilla) {
    if (![2, 3, 4, 5].includes(config.jugadores)) {
      return error('El Remigio se juega de 2 a 5 jugadores');
    }
    const limpia: ConfigRemigio = { jugadores: config.jugadores };
    const n = limpia.jugadores;
    // Empieza repartiendo el último asiento, así empieza el asiento 0.
    return ok(
      nuevaMano({
        config: limpia,
        azar: crearAzar(semilla),
        repartidor: n - 1,
        numeroMano: 0,
        puntos: new Array<number>(n).fill(0),
        eliminados: new Array<boolean>(n).fill(false),
        resultadosManos: [],
      }),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'robar') {
      const acciones: AccionRemigio[] = [];
      if (e.mazo.length > 0 || e.monton.length > 1) acciones.push({ tipo: 'robarMazo' });
      if (e.monton.length > 0) acciones.push({ tipo: 'robarMonton' });
      return acciones;
    }
    const mano = e.manos[asiento]!;
    const acciones: AccionRemigio[] = bajadasRemigio(mano).map((combinacion) => ({
      tipo: 'bajar' as const,
      combinacion,
    }));
    if (e.bajado[asiento]) {
      acciones.push(
        ...anadidosRemigio(mano, e.combinaciones),
        ...cambiosRemigio(mano, e.combinaciones),
      );
    }
    for (const carta of unaPorClase(mano)) acciones.push({ tipo: 'descartar', carta });
    return acciones;
  },

  transicion(e, asiento, accion) {
    const hecho = (s: EstadoRemigio, carta: CartaRemigio | null = null): EstadoRemigio => ({
      ...s,
      ultimaAccion: { asiento, tipo: accion.tipo, carta },
    });
    switch (accion.tipo) {
      case 'robarMazo': {
        // Una mano en la que nadie puede cerrar no termina nunca: a la tercera, se anula.
        if (e.mazo.length === 0 && e.rehechos >= REHECHOS_MAXIMOS) return cerrarMano(e, null);
        const s = conMazo(e);
        const [carta, ...mazo] = s.mazo as [CartaRemigio, ...CartaRemigio[]];
        const manos = s.manos.map((m, a) => (a === asiento ? [...m, carta] : m));
        return hecho({ ...s, mazo, manos, fase: 'bajar' });
      }
      case 'robarMonton': {
        const carta = e.monton.at(-1)!;
        const manos = e.manos.map((m, a) => (a === asiento ? [...m, carta] : m));
        return hecho({ ...e, monton: e.monton.slice(0, -1), manos, fase: 'bajar' }, carta);
      }
      case 'bajar':
      case 'anadir':
      case 'cambiar': {
        const tras = aplicarJugadaRemigio(e.manos[asiento]!, e.combinaciones, comoJugada(accion), {
          id: e.siguienteId,
          duenio: asiento,
        });
        const s = hecho(
          {
            ...e,
            manos: e.manos.map((m, a) => (a === asiento ? tras.mano : m)),
            combinaciones: tras.combinaciones,
            siguienteId: accion.tipo === 'bajar' ? e.siguienteId + 1 : e.siguienteId,
            bajado: e.bajado.map((b, a) => (a === asiento && accion.tipo === 'bajar' ? true : b)),
          },
          accion.tipo === 'bajar' ? null : accion.carta,
        );
        return tras.mano.length === 0 ? cerrarMano(s, asiento) : s;
      }
      case 'descartar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const s = hecho({ ...e, manos, monton: [...e.monton, accion.carta] }, accion.carta);
        if (manos[asiento]!.length === 0) return cerrarMano(s, asiento);
        // Tras descartar el montón tiene carta: el siguiente siempre puede robar.
        return pasarTurno(s);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      monton: [...e.monton],
      combinaciones: [...e.combinaciones],
      siguienteId: e.siguienteId,
      repartidor: e.repartidor,
      numeroMano: e.numeroMano,
      turno: partidaTerminada(e) ? null : e.turno,
      fase: e.fase,
      bajado: [...e.bajado],
      bajadoAntesDelTurno: e.bajadoAntesDelTurno,
      rehechos: e.rehechos,
      puntos: [...e.puntos],
      eliminados: [...e.eliminados],
      resultadosManos: [...e.resultadosManos],
      ultimaAccion: e.ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const ganadores = e.eliminados.flatMap((x, a) => (x ? [] : [a]));
    return { ganadores, empate: false, puntos: [...e.puntos] };
  },
};
