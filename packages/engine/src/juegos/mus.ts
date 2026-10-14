import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  ganadorLance,
  pares,
  piedrasJugada,
  tieneJuego,
  type LanceMus,
  type Reyes,
} from './mus-jugadas';

export * from './mus-jugadas';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigMus {
  /** Con ocho reyes, los treses son reyes y los doses ases. */
  readonly reyes: Reyes;
  /** Piedras con las que se gana un juego. */
  readonly puntos: 30 | 40;
  /** La partida es al mejor de este número de juegos. */
  readonly juegos: 1 | 3 | 5;
}

export const CONFIG_MUS_POR_DEFECTO: ConfigMus = { reyes: 8, puntos: 40, juegos: 3 };

/** Pareja de un asiento: 0 (asientos 0 y 2) o 1 (asientos 1 y 3). */
export type ParejaMus = 0 | 1;
export const parejaDe = (asiento: Asiento): ParejaMus => (asiento % 2) as ParejaMus;

export interface EnviteMus {
  /** Pareja que envidó (o subió, o echó el órdago). */
  readonly pareja: ParejaMus;
  /** Piedras en juego si se quiere; en un órdago, las del envite al que responde. */
  readonly total: number;
  /** Lo aceptado antes de este envite: lo que cobra la pareja que envidó si no se quiere. */
  readonly previo: number;
  readonly ordago: boolean;
  /** Rivales que aún pueden contestar, en orden; contesta el primero. */
  readonly responde: readonly Asiento[];
}

export type EstadoLanceMus =
  | 'paso'
  | 'querido'
  | 'noQuerido'
  | 'ordago'
  /** Solo una pareja tiene la jugada: no se apuesta. */
  | 'sinApuesta'
  /** Nadie tiene la jugada. */
  | 'noSeJuega';

export interface RegistroLanceMus {
  readonly lance: LanceMus;
  readonly estado: EstadoLanceMus;
  /** Piedras aceptadas, o las que cobra la pareja que envidó si no se quiso. */
  readonly piedras: number;
  /** Pareja que envidó en un envite no querido. */
  readonly pareja: ParejaMus | null;
}

export interface ConteoLanceMus {
  readonly lance: LanceMus;
  readonly estado: EstadoLanceMus;
  /** Pareja con la mejor jugada del lance; `null` si no se jugó. */
  readonly ganador: ParejaMus | null;
  readonly apuesta: readonly [number, number];
  readonly jugadas: readonly [number, number];
}

export interface ResultadoManoMus {
  /** Las cartas de los cuatro al terminar la mano. */
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mano: Asiento;
  /** Lance en el que se quiso un órdago, si la mano terminó así. */
  readonly ordago: LanceMus | null;
  readonly lances: readonly ConteoLanceMus[];
  /** Piedras de cada pareja al terminar el conteo (antes de volver a 0 si se ganó el juego). */
  readonly piedrasTras: readonly [number, number];
  readonly juegoGanado: ParejaMus | null;
  readonly juegosTras: readonly [number, number];
}

export type AccionMus =
  | { readonly tipo: 'mus' }
  | { readonly tipo: 'cortar' }
  | { readonly tipo: 'descartar'; readonly cartas: readonly IdCarta[] }
  | { readonly tipo: 'paso' }
  | { readonly tipo: 'envidar'; readonly piedras: 2 | 5 }
  | { readonly tipo: 'subir'; readonly piedras: 2 | 5 }
  | { readonly tipo: 'ordago' }
  | { readonly tipo: 'quiero' }
  | { readonly tipo: 'noQuiero' };

/** Acción tal como la ven los demás: del descarte solo se sabe cuántas cartas fueron. */
export type AccionVisibleMus =
  | Exclude<AccionMus, { tipo: 'descartar' }>
  | { readonly tipo: 'descartar'; readonly cantidad: number };

export interface DeclaracionesMus {
  /** Quién tiene pares; `null` hasta llegar al lance de Pares. */
  readonly pares: readonly boolean[] | null;
  /** Quién tiene juego; `null` hasta llegar al lance de Juego. */
  readonly juego: readonly boolean[] | null;
}

export interface EstadoMus {
  readonly config: ConfigMus;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mazo: readonly IdCarta[];
  readonly descartes: readonly IdCarta[];
  readonly fase: 'mus' | 'descarte' | 'lance';
  /** Quién ha pedido mus en la ronda en curso. */
  readonly musPedido: readonly boolean[];
  /** Cartas que descartó cada uno en la última ronda de descartes. */
  readonly descartados: readonly (number | null)[];
  readonly turno: Asiento;
  readonly lance: LanceMus | null;
  /** Quién ya habló en el lance en curso sin que hubiera envite. */
  readonly hablados: readonly Asiento[];
  readonly envite: EnviteMus | null;
  readonly lances: readonly RegistroLanceMus[];
  readonly declaraciones: DeclaracionesMus;
  readonly piedras: readonly [number, number];
  readonly juegos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoMus[];
  readonly ultimaAccion: { readonly asiento: Asiento; readonly accion: AccionMus } | null;
}

export interface VistaMus {
  readonly config: ConfigMus;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  /** El jugador que es mano: habla primero y gana los empates. */
  readonly mano: Asiento;
  readonly fase: EstadoMus['fase'];
  readonly turno: Asiento | null;
  readonly musPedido: readonly boolean[];
  readonly descartados: readonly (number | null)[];
  readonly lance: LanceMus | null;
  readonly envite: EnviteMus | null;
  readonly lances: readonly RegistroLanceMus[];
  readonly declaraciones: DeclaracionesMus;
  readonly piedras: readonly [number, number];
  readonly juegos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoMus[];
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly accion: AccionVisibleMus;
  } | null;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 4;

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
const manoDe = (e: { repartidor: Asiento }) => siguiente(e.repartidor);
/** Los cuatro asientos en orden de habla, empezando por la mano. */
const ordenDesde = (inicio: Asiento) =>
  Array.from({ length: JUGADORES }, (_, i) => (inicio + i) % JUGADORES);

export const juegosParaGanar = (config: ConfigMus) => Math.ceil(config.juegos / 2);

const partidaTerminada = (e: EstadoMus) => Math.max(...e.juegos) >= juegosParaGanar(e.config);

/** Jugadores que apuestan en un lance. */
function participantes(e: EstadoMus, lance: LanceMus): Asiento[] {
  const orden = ordenDesde(manoDe(e));
  if (lance === 'pares') return orden.filter((a) => pares(e.manos[a]!, e.config.reyes) !== null);
  if (lance === 'juego') return orden.filter((a) => tieneJuego(e.manos[a]!, e.config.reyes));
  return orden;
}

/** Reparte una mano nueva: sale el siguiente al repartidor. */
function nuevaMano(
  config: ConfigMus,
  azar: EstadoAzar,
  repartidor: Asiento,
  piedras: readonly [number, number],
  juegos: readonly [number, number],
  resultadosManos: readonly ResultadoManoMus[],
): EstadoMus {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const mano = siguiente(repartidor);
  const reparto = repartir(cartas, new Array<number>(JUGADORES).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = Array.from(
    { length: JUGADORES },
    (_, a) => reparto.valor.manos[(a - mano + JUGADORES) % JUGADORES]!,
  );
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    mazo: reparto.valor.mazo,
    descartes: [],
    fase: 'mus',
    musPedido: new Array<boolean>(JUGADORES).fill(false),
    descartados: new Array<number | null>(JUGADORES).fill(null),
    turno: mano,
    lance: null,
    hablados: [],
    envite: null,
    lances: [],
    declaraciones: { pares: null, juego: null },
    piedras,
    juegos,
    resultadosManos,
    ultimaAccion: null,
  };
}

// ── Lances ───────────────────────────────────────────────────────────────────

const LANCE_SIGUIENTE: Partial<Record<LanceMus, LanceMus>> = {
  grande: 'chica',
  chica: 'pares',
  pares: 'juego',
};

/** Empieza un lance; los que no se apuestan se registran y se pasa al siguiente. */
function empezarLance(e: EstadoMus, lance: LanceMus | undefined): EstadoMus {
  if (lance === undefined) return contar(e, null);
  const reyes = e.config.reyes;
  let declaraciones = e.declaraciones;
  if (lance === 'pares') {
    declaraciones = { ...declaraciones, pares: e.manos.map((m) => pares(m, reyes) !== null) };
  }
  if (lance === 'juego') {
    const juego = e.manos.map((m) => tieneJuego(m, reyes));
    declaraciones = { ...declaraciones, juego };
    if (!juego.some(Boolean)) lance = 'punto';
  }
  const conDeclaraciones: EstadoMus = { ...e, declaraciones };
  const quienes = participantes(conDeclaraciones, lance);
  const parejas = new Set(quienes.map(parejaDe));
  if (parejas.size < 2) {
    const estado: EstadoLanceMus = parejas.size === 0 ? 'noSeJuega' : 'sinApuesta';
    return empezarLance(
      {
        ...conDeclaraciones,
        lances: [...e.lances, { lance, estado, piedras: 0, pareja: null }],
      },
      LANCE_SIGUIENTE[lance],
    );
  }
  return {
    ...conDeclaraciones,
    fase: 'lance',
    lance,
    hablados: [],
    envite: null,
    turno: quienes[0]!,
  };
}

/** Cierra el lance en curso y empieza el siguiente. */
function cerrarLance(e: EstadoMus, registro: Omit<RegistroLanceMus, 'lance'>): EstadoMus {
  const lance = e.lance!;
  const cerrado: EstadoMus = {
    ...e,
    lances: [...e.lances, { lance, ...registro }],
    envite: null,
    hablados: [],
  };
  return empezarLance(cerrado, LANCE_SIGUIENTE[lance]);
}

/** Rivales de `asiento` que participan en el lance, en orden de habla a partir de él. */
function rivalesQueResponden(e: EstadoMus, asiento: Asiento): Asiento[] {
  const quienes = participantes(e, e.lance!);
  return ordenDesde(siguiente(asiento)).filter(
    (a) => parejaDe(a) !== parejaDe(asiento) && quienes.includes(a),
  );
}

// ── Conteo ───────────────────────────────────────────────────────────────────

function sumar(p: readonly [number, number], pareja: ParejaMus, n: number): [number, number] {
  return pareja === 0 ? [p[0] + n, p[1]] : [p[0], p[1] + n];
}

/**
 * Cuenta los lances en orden y reparte la mano siguiente, o termina la partida. Con `ordago`,
 * la mano terminó por un órdago querido en ese lance: su ganador se lleva el juego.
 */
function contar(e: EstadoMus, ordago: LanceMus | null): EstadoMus {
  const { reyes, puntos } = e.config;
  const mano = manoDe(e);
  let piedras = e.piedras;
  let juegoGanado: ParejaMus | null = null;
  const lances: ConteoLanceMus[] = [];

  const ganadorDe = (lance: LanceMus): ParejaMus =>
    parejaDe(ganadorLance(lance, e.manos, mano, reyes, participantes(e, lance)));

  if (ordago !== null) {
    const ganador = ganadorDe(ordago);
    lances.push(
      ...e.lances.map((r) => ({
        lance: r.lance,
        estado: r.estado,
        ganador: null,
        apuesta: [0, 0] as const,
        jugadas: [0, 0] as const,
      })),
      { lance: ordago, estado: 'ordago', ganador, apuesta: [0, 0], jugadas: [0, 0] },
    );
    juegoGanado = ganador;
    piedras = ganador === 0 ? [puntos, piedras[1]] : [piedras[0], puntos];
  } else {
    for (const r of e.lances) {
      if (r.estado === 'noSeJuega') {
        lances.push({ ...r, ganador: null, apuesta: [0, 0], jugadas: [0, 0] });
        continue;
      }
      const ganador = ganadorDe(r.lance);
      let apuesta: [number, number] = [0, 0];
      if (r.estado === 'querido') apuesta = sumar(apuesta, ganador, r.piedras);
      if (r.estado === 'noQuerido') apuesta = sumar(apuesta, r.pareja!, r.piedras);
      if (r.estado === 'paso' && (r.lance === 'grande' || r.lance === 'chica')) {
        apuesta = sumar(apuesta, ganador, 1);
      }
      let jugadas: [number, number] = [0, 0];
      if (r.lance === 'punto') jugadas = sumar(jugadas, ganador, 1);
      else {
        for (const a of [ganador, ganador + 2] as Asiento[]) {
          jugadas = sumar(jugadas, ganador, piedrasJugada(r.lance, e.manos[a]!, reyes));
        }
      }
      if (juegoGanado === null) {
        // Se apunta primero la apuesta y luego las jugadas; al llegar a los puntos se para.
        for (const parte of [apuesta, jugadas]) {
          if (juegoGanado !== null) break;
          piedras = [piedras[0] + parte[0], piedras[1] + parte[1]];
          const llega = ([0, 1] as const).find((p) => piedras[p] >= puntos);
          if (llega !== undefined) {
            juegoGanado = llega;
            piedras =
              llega === 0
                ? [puntos, Math.min(piedras[1], puntos)]
                : [Math.min(piedras[0], puntos), puntos];
          }
        }
      }
      lances.push({ lance: r.lance, estado: r.estado, ganador, apuesta, jugadas });
    }
  }

  const juegos = juegoGanado === null ? e.juegos : sumar(e.juegos, juegoGanado, 1);
  const resultadosManos = [
    ...e.resultadosManos,
    {
      manos: e.manos,
      mano,
      ordago,
      lances,
      piedrasTras: piedras,
      juegoGanado,
      juegosTras: juegos,
    },
  ];
  const final: EstadoMus = {
    ...e,
    juegos,
    piedras: juegoGanado === null ? piedras : [0, 0],
    resultadosManos,
  };
  if (partidaTerminada(final)) return { ...final, envite: null };
  return {
    ...nuevaMano(e.config, e.azar, siguiente(e.repartidor), final.piedras, juegos, resultadosManos),
    ultimaAccion: e.ultimaAccion,
  };
}

// ── Acciones ─────────────────────────────────────────────────────────────────

/** Subconjuntos no vacíos de la mano, en un orden fijo. */
function descartesPosibles(mano: readonly IdCarta[]): IdCarta[][] {
  const resultado: IdCarta[][] = [];
  for (let mascara = 1; mascara < 1 << mano.length; mascara++) {
    resultado.push(mano.filter((_, i) => mascara & (1 << i)));
  }
  return resultado;
}

function accionesDeLance(e: EstadoMus): AccionMus[] {
  if (e.envite === null) {
    return [
      { tipo: 'paso' },
      { tipo: 'envidar', piedras: 2 },
      { tipo: 'envidar', piedras: 5 },
      { tipo: 'ordago' },
    ];
  }
  if (e.envite.ordago) return [{ tipo: 'quiero' }, { tipo: 'noQuiero' }];
  return [
    { tipo: 'quiero' },
    { tipo: 'noQuiero' },
    { tipo: 'subir', piedras: 2 },
    { tipo: 'subir', piedras: 5 },
    { tipo: 'ordago' },
  ];
}

function descartar(e: EstadoMus, asiento: Asiento, cartas: readonly IdCarta[]): EstadoMus {
  let mazo = [...e.mazo];
  let descartes = [...e.descartes];
  let azar = e.azar;
  if (mazo.length < cartas.length) {
    // Se acabó el mazo: se barajan los descartes de las rondas anteriores.
    const barajado = barajar(descartes, azar);
    mazo = [...barajado.cartas, ...mazo];
    descartes = [];
    azar = barajado.azar;
  }
  const nuevas = mazo.splice(mazo.length - cartas.length, cartas.length);
  const manos = e.manos.map((m, a) =>
    a === asiento ? [...m.filter((c) => !cartas.includes(c)), ...nuevas] : m,
  );
  const descartados = e.descartados.map((d, a) => (a === asiento ? cartas.length : d));
  const despues: EstadoMus = {
    ...e,
    azar,
    manos,
    mazo,
    descartes: [...descartes, ...cartas],
    descartados,
  };
  const sigue = siguiente(asiento);
  if (sigue !== manoDe(e)) return { ...despues, turno: sigue };
  // Descartaron los cuatro: se vuelve a preguntar el mus.
  return {
    ...despues,
    fase: 'mus',
    musPedido: new Array<boolean>(JUGADORES).fill(false),
    turno: manoDe(e),
  };
}

function hablarEnLance(e: EstadoMus, asiento: Asiento, accion: AccionMus): EstadoMus {
  const envite = e.envite;
  switch (accion.tipo) {
    case 'paso': {
      const hablados = [...e.hablados, asiento];
      const quedan = participantes(e, e.lance!).filter((a) => !hablados.includes(a));
      if (quedan.length === 0) return cerrarLance(e, { estado: 'paso', piedras: 0, pareja: null });
      return { ...e, hablados, turno: quedan[0]! };
    }
    case 'envidar':
    case 'subir':
    case 'ordago': {
      const responde = rivalesQueResponden(e, asiento);
      const total =
        accion.tipo === 'ordago' ? (envite?.total ?? 0) : (envite?.total ?? 0) + accion.piedras;
      return {
        ...e,
        envite: {
          pareja: parejaDe(asiento),
          total,
          previo: envite?.total ?? 0,
          ordago: accion.tipo === 'ordago',
          responde,
        },
        turno: responde[0]!,
      };
    }
    case 'quiero': {
      if (envite!.ordago) return contar(cerrarLanceSinSeguir(e), e.lance!);
      return cerrarLance(e, { estado: 'querido', piedras: envite!.total, pareja: null });
    }
    case 'noQuiero': {
      const responde = envite!.responde.slice(1);
      if (responde.length > 0)
        return { ...e, envite: { ...envite!, responde }, turno: responde[0]! };
      return cerrarLance(e, {
        estado: 'noQuerido',
        piedras: Math.max(1, envite!.previo),
        pareja: envite!.pareja,
      });
    }
    default:
      return e;
  }
}

/** Quita el envite del órdago antes de contar la mano. */
const cerrarLanceSinSeguir = (e: EstadoMus): EstadoMus => ({ ...e, envite: null, hablados: [] });

// ── Juego ────────────────────────────────────────────────────────────────────

export const mus: Juego<ConfigMus, EstadoMus, AccionMus, VistaMus> = {
  id: 'mus',

  crear(config, semilla) {
    if (config.reyes !== 8 && config.reyes !== 4) return error('Opción de reyes inválida');
    if (config.puntos !== 30 && config.puntos !== 40) {
      return error('Los juegos son a 30 o a 40 piedras');
    }
    if (![1, 3, 5].includes(config.juegos)) {
      return error('La partida es a 1 juego o al mejor de 3 o de 5');
    }
    const limpia: ConfigMus = { reyes: config.reyes, puntos: config.puntos, juegos: config.juegos };
    // Empieza repartiendo el asiento 3, así es mano el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), JUGADORES - 1, [0, 0], [0, 0], []));
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'mus':
        return [{ tipo: 'mus' }, { tipo: 'cortar' }];
      case 'descarte':
        return descartesPosibles(e.manos[asiento]!).map((cartas) => ({
          tipo: 'descartar',
          cartas,
        }));
      case 'lance':
        return accionesDeLance(e);
    }
  },

  transicion(e, asiento, accion) {
    const conAccion: EstadoMus = { ...e, ultimaAccion: { asiento, accion } };
    switch (accion.tipo) {
      case 'mus': {
        const musPedido = e.musPedido.map((m, a) => (a === asiento ? true : m));
        if (musPedido.every(Boolean)) {
          return {
            ...conAccion,
            musPedido,
            fase: 'descarte',
            descartados: new Array<number | null>(JUGADORES).fill(null),
            turno: manoDe(e),
          };
        }
        return { ...conAccion, musPedido, turno: siguiente(asiento) };
      }
      case 'cortar':
        return empezarLance(conAccion, 'grande');
      case 'descartar':
        return descartar(conAccion, asiento, accion.cartas);
      default:
        return hablarEnLance(conAccion, asiento, accion);
    }
  },

  vistaDe(e, asiento) {
    const ultima = e.ultimaAccion;
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      mano: manoDe(e),
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      musPedido: [...e.musPedido],
      descartados: [...e.descartados],
      lance: e.lance,
      envite: e.envite,
      lances: [...e.lances],
      declaraciones: e.declaraciones,
      piedras: e.piedras,
      juegos: e.juegos,
      resultadosManos: [...e.resultadosManos],
      ultimaAccion:
        ultima === null
          ? null
          : {
              asiento: ultima.asiento,
              accion:
                ultima.accion.tipo === 'descartar'
                  ? { tipo: 'descartar', cantidad: ultima.accion.cartas.length }
                  : ultima.accion,
            },
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const pareja: ParejaMus = e.juegos[0] > e.juegos[1] ? 0 : 1;
    const puntos = Array.from({ length: JUGADORES }, (_, a) => e.juegos[parejaDe(a)]);
    return {
      ganadores: [0, 1, 2, 3].filter((a) => parejaDe(a) === pareja),
      empate: false,
      puntos,
    };
  },
};
