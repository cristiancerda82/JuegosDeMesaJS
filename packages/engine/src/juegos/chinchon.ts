import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, esComodin, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import { siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  combinacionChinchon,
  esChinchon,
  mejorReparto,
  puntosCarta,
  type BarajaChinchon,
  type Reparto,
} from './chinchon-combinaciones';

export {
  combinacionChinchon,
  esChinchon,
  mejorReparto,
  puntosCarta,
  type BarajaChinchon,
  type Reparto,
} from './chinchon-combinaciones';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigChinchon {
  readonly jugadores: 2 | 3 | 4;
  readonly baraja: BarajaChinchon;
  /** Añade los 2 comodines. */
  readonly comodines: boolean;
  /** Quien pase de estos puntos queda eliminado. */
  readonly limite: 50 | 100;
  /** Valor máximo de la única carta suelta permitida al cerrar (0: cerrar con todo ligado). */
  readonly cierreMaximo: 0 | 3 | 5;
  /** Al cerrar, los demás colocan sus sueltas en las combinaciones a la vista (opcional). */
  readonly colocarSueltas?: boolean;
  /** Quien pasa del límite vuelve una vez con los puntos del más alto (opcional). */
  readonly reenganche?: boolean;
}

export const CONFIG_CHINCHON_POR_DEFECTO: ConfigChinchon = {
  jugadores: 2,
  baraja: 'espanola40',
  comodines: true,
  limite: 100,
  cierreMaximo: 3,
};

/** Última acción, visible para todos (la carta robada del mazo no se revela). */
export type AccionVisibleChinchon =
  | {
      readonly asiento: Asiento;
      readonly tipo: 'robar';
      readonly desde: 'mazo' | 'descarte';
      readonly carta: IdCarta | null;
    }
  | { readonly asiento: Asiento; readonly tipo: 'descartar' | 'cerrar'; readonly carta: IdCarta };

export interface ManoDestapada {
  readonly asiento: Asiento;
  readonly cartas: readonly IdCarta[];
  readonly combinaciones: readonly (readonly IdCarta[])[];
  readonly sueltas: readonly IdCarta[];
  /** Puntos de la mano para este jugador (−10 si cerró con todo ligado). */
  readonly puntos: number;
  /** Cartas sin ligar que colocó en las combinaciones de los demás (con colocar las sueltas). */
  readonly colocadas?: readonly IdCarta[];
}

export interface ResultadoManoChinchon {
  readonly cierra: Asiento;
  readonly chinchon: boolean;
  readonly manos: readonly ManoDestapada[];
  /** Puntos acumulados y eliminados después de esta mano. */
  readonly puntosTras: readonly number[];
  readonly eliminadosTras: readonly boolean[];
  /** Quienes pasaron del límite en esta mano y se reengancharon (con reenganche). */
  readonly reenganchesTras?: readonly Asiento[];
}

export interface EstadoChinchon {
  readonly config: ConfigChinchon;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Boca abajo; la siguiente que se roba es la última. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la de arriba es la última. */
  readonly descarte: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly fase: 'robar' | 'descartar';
  /** Carta robada del descarte en este turno, que no se puede devolver. */
  readonly robadaDelDescarte: IdCarta | null;
  readonly puntos: readonly number[];
  readonly eliminados: readonly boolean[];
  /** Quién se ha reenganchado ya en la partida (con reenganche). */
  readonly reenganchados?: readonly boolean[];
  readonly ultimaAccion: AccionVisibleChinchon | null;
  readonly resultadosManos: readonly ResultadoManoChinchon[];
}

export type AccionChinchon =
  | { readonly tipo: 'robar'; readonly desde: 'mazo' | 'descarte' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'cerrar'; readonly carta: IdCarta };

export interface VistaChinchon {
  readonly config: ConfigChinchon;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly descarteArriba: IdCarta | null;
  readonly cartasDescarte: number;
  readonly mazo: number;
  readonly turno: Asiento | null;
  readonly fase: 'robar' | 'descartar';
  readonly robadaDelDescarte: IdCarta | null;
  readonly puntos: readonly number[];
  readonly eliminados: readonly boolean[];
  readonly reenganchados?: readonly boolean[];
  readonly ultimaAccion: AccionVisibleChinchon | null;
  readonly resultadosManos: readonly ResultadoManoChinchon[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_EN_MANO = 7;
const BONO_TODO_LIGADO = -10;

const activos = (e: { eliminados: readonly boolean[] }) =>
  e.eliminados.flatMap((elim, a) => (elim ? [] : [a]));

/** El siguiente asiento sin eliminar. */
function siguienteActivo(eliminados: readonly boolean[], desde: Asiento): Asiento {
  let a = siguiente(desde, eliminados.length);
  while (eliminados[a]) a = siguiente(a, eliminados.length);
  return a;
}

function partidaTerminada(e: EstadoChinchon): boolean {
  return Boolean(e.resultadosManos.at(-1)?.chinchon) || activos(e).length <= 1;
}

/** Con estas 7 cartas se puede cerrar: todo ligado salvo, como mucho, una carta pequeña. */
export function puedeCerrarCon(
  cartas: readonly IdCarta[],
  config: Pick<ConfigChinchon, 'baraja' | 'cierreMaximo'>,
): boolean {
  const { sueltas } = mejorReparto(cartas, config.baraja);
  if (sueltas.length === 0) return true;
  const [suelta] = sueltas;
  return sueltas.length === 1 && !esComodin(suelta!) && puntosCarta(suelta!) <= config.cierreMaximo;
}

function nuevaMano(
  config: ConfigChinchon,
  azar: EstadoAzar,
  repartidor: Asiento,
  puntos: readonly number[],
  eliminados: readonly boolean[],
  resultadosManos: readonly ResultadoManoChinchon[],
): EstadoChinchon {
  const baraja = crearBaraja(config.baraja, { comodines: config.comodines });
  const { cartas, azar: azarSiguiente } = barajar(baraja, azar);
  const sale = siguienteActivo(eliminados, repartidor);
  const orden: Asiento[] = [];
  for (
    let a = sale;
    orden.length < activos({ eliminados }).length;
    a = siguienteActivo(eliminados, a)
  ) {
    orden.push(a);
  }
  const reparto = repartir(cartas, new Array<number>(orden.length).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos: IdCarta[][] = eliminados.map(() => []);
  orden.forEach((a, k) => (manos[a] = reparto.valor.manos[k]!));
  const [primera, ...mazo] = reparto.valor.mazo as [IdCarta, ...IdCarta[]];
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    mazo,
    descarte: [primera],
    manos,
    turno: sale,
    fase: 'robar',
    robadaDelDescarte: null,
    puntos,
    eliminados,
    ultimaAccion: null,
    resultadosManos,
  };
}

/**
 * Coloca las sueltas que encajen en las combinaciones de la mesa (que se amplían): primero la de
 * más puntos, y se repite hasta que no encaja ninguna. Devuelve las colocadas y las que quedan.
 */
export function colocarEnMesa(
  mesa: IdCarta[][],
  sueltas: readonly IdCarta[],
  baraja: BarajaChinchon,
): { colocadas: IdCarta[]; quedan: IdCarta[] } {
  const colocadas: IdCarta[] = [];
  let quedan = [...sueltas].sort((a, b) => puntosCarta(b) - puntosCarta(a));
  let cambio = true;
  while (cambio) {
    cambio = false;
    for (const carta of quedan) {
      const k = mesa.findIndex((c) => combinacionChinchon([...c, carta], baraja) !== null);
      if (k < 0) continue;
      mesa[k] = [...combinacionChinchon([...mesa[k]!, carta], baraja)!];
      colocadas.push(carta);
      quedan = quedan.filter((c) => c !== carta);
      cambio = true;
      break;
    }
  }
  return { colocadas, quedan };
}

/** Cierra la mano: puntúa, elimina y reparte otra mano o termina la partida. */
function cerrarMano(e: EstadoChinchon, cierra: Asiento): EstadoChinchon {
  const { baraja, limite } = e.config;
  const chinchon = esChinchon(e.manos[cierra]!, baraja);
  const repartos = new Map<Asiento, Reparto>(
    activos(e).map((a) => [a, mejorReparto(e.manos[a]!, baraja)]),
  );
  const todoLigadoCierra = repartos.get(cierra)!.sueltas.length === 0;

  // Con colocar las sueltas, cada uno en orden de turno coloca en lo que ya está a la vista.
  const colocadas = new Map<Asiento, IdCarta[]>();
  const quedan = new Map<Asiento, readonly IdCarta[]>();
  if (e.config.colocarSueltas === true && !chinchon && !todoLigadoCierra) {
    const mesa = repartos.get(cierra)!.combinaciones.map((c) => [...c]);
    for (
      let a = siguienteActivo(e.eliminados, cierra);
      a !== cierra;
      a = siguienteActivo(e.eliminados, a)
    ) {
      const reparto = repartos.get(a)!;
      const r = colocarEnMesa(mesa, reparto.sueltas, baraja);
      colocadas.set(a, r.colocadas);
      quedan.set(a, r.quedan);
      mesa.push(...reparto.combinaciones.map((c) => [...c]));
    }
  }

  const manos: ManoDestapada[] = activos(e).map((asiento) => {
    const reparto = repartos.get(asiento)!;
    const sueltas = quedan.get(asiento) ?? reparto.sueltas;
    const puestas = colocadas.get(asiento) ?? [];
    return {
      asiento,
      cartas: e.manos[asiento]!,
      combinaciones: reparto.combinaciones,
      sueltas,
      puntos:
        asiento === cierra && todoLigadoCierra
          ? BONO_TODO_LIGADO
          : sueltas.reduce((s, c) => s + puntosCarta(c), 0),
      ...(puestas.length > 0 ? { colocadas: puestas } : {}),
    };
  });
  const puntos = e.puntos.map((p, a) => p + (manos.find((m) => m.asiento === a)?.puntos ?? 0));

  // Con reenganche, quien pasa del límite por primera vez vuelve con los puntos del más alto.
  let reenganchados = e.reenganchados;
  const reenganchesTras: Asiento[] = [];
  if (e.config.reenganche === true) {
    const ya = [...(e.reenganchados ?? e.eliminados.map(() => false))];
    const siguen = activos(e).filter((a) => puntos[a]! <= limite);
    if (siguen.length > 0 && !chinchon) {
      const maximo = Math.max(...siguen.map((a) => puntos[a]!));
      for (const a of activos(e)) {
        if (puntos[a]! > limite && !ya[a]) {
          puntos[a] = maximo;
          ya[a] = true;
          reenganchesTras.push(a);
        }
      }
    }
    reenganchados = ya;
  }

  const eliminados = e.eliminados.map((elim, a) => elim || puntos[a]! > limite);
  const resultadosManos = [
    ...e.resultadosManos,
    {
      cierra,
      chinchon,
      manos,
      puntosTras: puntos,
      eliminadosTras: eliminados,
      ...(reenganchesTras.length > 0 ? { reenganchesTras } : {}),
    },
  ];
  const conReenganches = reenganchados === undefined ? {} : { reenganchados };
  const cerrado: EstadoChinchon = { ...e, puntos, eliminados, resultadosManos, ...conReenganches };
  if (partidaTerminada(cerrado)) return cerrado;
  return {
    ...nuevaMano(
      e.config,
      e.azar,
      siguienteActivo(eliminados, e.repartidor),
      puntos,
      eliminados,
      resultadosManos,
    ),
    ...conReenganches,
  };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const chinchon: Juego<ConfigChinchon, EstadoChinchon, AccionChinchon, VistaChinchon> = {
  id: 'chinchon',

  crear(config, semilla) {
    if (![2, 3, 4].includes(config.jugadores)) {
      return error('El Chinchón se juega de 2 a 4 jugadores');
    }
    if (config.baraja !== 'espanola40' && config.baraja !== 'espanola48') {
      return error('El Chinchón se juega con la baraja española de 40 o de 48 cartas');
    }
    if (typeof config.comodines !== 'boolean') return error('Opción de comodines inválida');
    if (config.limite !== 50 && config.limite !== 100) return error('El límite es 50 o 100');
    if (![0, 3, 5].includes(config.cierreMaximo)) {
      return error('El máximo para cerrar es 0, 3 o 5');
    }
    for (const opcion of ['colocarSueltas', 'reenganche'] as const) {
      if (config[opcion] !== undefined && typeof config[opcion] !== 'boolean') {
        return error('Opción de colocar las sueltas o de reenganche inválida');
      }
    }
    const limpia: ConfigChinchon = {
      jugadores: config.jugadores,
      baraja: config.baraja,
      comodines: config.comodines,
      limite: config.limite,
      cierreMaximo: config.cierreMaximo,
      colocarSueltas: config.colocarSueltas === true,
      reenganche: config.reenganche === true,
    };
    const n = limpia.jugadores;
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    const estado = nuevaMano(
      limpia,
      crearAzar(semilla),
      n - 1,
      new Array<number>(n).fill(0),
      new Array<boolean>(n).fill(false),
      [],
    );
    return ok(
      limpia.reenganche ? { ...estado, reenganchados: new Array<boolean>(n).fill(false) } : estado,
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno || e.eliminados[asiento]) return [];
    if (e.fase === 'robar') {
      const acciones: AccionChinchon[] = [];
      if (e.mazo.length > 0 || e.descarte.length > 1)
        acciones.push({ tipo: 'robar', desde: 'mazo' });
      if (e.descarte.length > 0) acciones.push({ tipo: 'robar', desde: 'descarte' });
      return acciones;
    }
    const mano = e.manos[asiento]!;
    const acciones: AccionChinchon[] = [];
    for (const carta of mano) {
      if (carta === e.robadaDelDescarte) continue;
      acciones.push({ tipo: 'descartar', carta });
      if (
        puedeCerrarCon(
          mano.filter((c) => c !== carta),
          e.config,
        )
      ) {
        acciones.push({ tipo: 'cerrar', carta });
      }
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'robar') {
      let mazo = [...e.mazo];
      let descarte = [...e.descarte];
      let azar = e.azar;
      let carta: IdCarta;
      if (accion.desde === 'descarte') {
        carta = descarte.pop()!;
      } else {
        if (mazo.length === 0) {
          // Mazo agotado: el descarte, salvo la carta de arriba, se baraja y pasa a ser el mazo.
          const arriba = descarte.pop()!;
          const barajado = barajar(descarte, azar);
          mazo = barajado.cartas;
          azar = barajado.azar;
          descarte = [arriba];
        }
        carta = mazo.pop()!;
      }
      return {
        ...e,
        azar,
        mazo,
        descarte,
        manos: e.manos.map((m, a) => (a === asiento ? [...m, carta] : m)),
        fase: 'descartar',
        robadaDelDescarte: accion.desde === 'descarte' ? carta : null,
        ultimaAccion: {
          asiento,
          tipo: 'robar',
          desde: accion.desde,
          carta: accion.desde === 'descarte' ? carta : null,
        },
      };
    }

    const jugado: EstadoChinchon = {
      ...e,
      manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
      descarte: [...e.descarte, accion.carta],
      robadaDelDescarte: null,
      ultimaAccion: { asiento, tipo: accion.tipo, carta: accion.carta },
    };
    if (accion.tipo === 'cerrar') return cerrarMano(jugado, asiento);
    return { ...jugado, fase: 'robar', turno: siguienteActivo(e.eliminados, asiento) };
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      descarteArriba: e.descarte.at(-1) ?? null,
      cartasDescarte: e.descarte.length,
      mazo: e.mazo.length,
      turno: partidaTerminada(e) ? null : e.turno,
      fase: e.fase,
      robadaDelDescarte: e.robadaDelDescarte,
      puntos: [...e.puntos],
      eliminados: [...e.eliminados],
      ...(e.reenganchados ? { reenganchados: [...e.reenganchados] } : {}),
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const ultima = e.resultadosManos.at(-1)!;
    let ganadores: Asiento[];
    if (ultima.chinchon) ganadores = [ultima.cierra];
    else if (activos(e).length === 1) ganadores = activos(e);
    else {
      // Todos eliminados en la misma mano: gana quien menos puntos tenga.
      const minimo = Math.min(...e.puntos);
      ganadores = asientos.filter((a) => e.puntos[a] === minimo);
    }
    return { ganadores, empate: ganadores.length > 1, puntos: [...e.puntos] };
  },
};
