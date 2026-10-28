import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Bridge Chicago: 4 jugadores en parejas; la partida dura uno o más ciclos de 4 manos. */
export interface ConfigBridge {
  readonly ciclos: 1 | 2 | 3;
}

export const CONFIG_BRIDGE_POR_DEFECTO: ConfigBridge = { ciclos: 1 };

/** Denominaciones de menor a mayor. */
export const DENOMINACIONES_BRIDGE = [
  'treboles',
  'diamantes',
  'corazones',
  'picas',
  'sinTriunfo',
] as const;
export type DenominacionBridge = (typeof DENOMINACIONES_BRIDGE)[number];

/** Manos de cada ciclo de Chicago. */
export const MANOS_CICLO_BRIDGE = 4;

export type ParejaBridge = 0 | 1;
type DePareja<T> = readonly [T, T];

export type DeclaracionBridge =
  | {
      readonly tipo: 'pujar';
      readonly nivel: number;
      readonly denominacion: DenominacionBridge;
    }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'doblar' }
  | { readonly tipo: 'redoblar' };

export type AccionBridge = DeclaracionBridge | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface DeclaracionHecha {
  readonly asiento: Asiento;
  readonly declaracion: DeclaracionBridge;
}

export interface ContratoBridge {
  readonly nivel: number;
  readonly denominacion: DenominacionBridge;
  readonly declarante: Asiento;
  /** 0 sin doblar, 1 doblado y 2 redoblado. */
  readonly doblado: 0 | 1 | 2;
}

export interface ResultadoManoBridge {
  readonly contrato: ContratoBridge;
  /** Si la pareja del declarante era vulnerable. */
  readonly vulnerable: boolean;
  readonly bazas: DePareja<number>;
  /** Bazas de más (positivo) o de menos (negativo) del declarante sobre su contrato. */
  readonly diferencia: number;
  readonly puntosMano: DePareja<number>;
  readonly puntosTras: DePareja<number>;
}

export interface EstadoBridge {
  readonly config: ConfigBridge;
  readonly azar: EstadoAzar;
  readonly fase: 'subasta' | 'carteo';
  readonly repartidor: Asiento;
  /** Mano del ciclo de Chicago (0 a 3), que fija la vulnerabilidad. */
  readonly manoDelCiclo: number;
  readonly manosJugadas: number;
  /** La mano se ha vuelto a repartir porque pasaron los cuatro. */
  readonly repartoRepetido: boolean;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly subasta: readonly DeclaracionHecha[];
  readonly contrato: ContratoBridge | null;
  /** A quién le toca: en el carteo puede ser el muerto, y entonces actúa el declarante. */
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazas: DePareja<number>;
  /** Cartas jugadas en la mano por cada asiento, en orden. */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos de salida que cada jugador no siguió en esta mano: no le quedan. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoBridge[];
  readonly puntos: DePareja<number>;
}

export interface VistaBridge {
  readonly config: ConfigBridge;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly fase: EstadoBridge['fase'];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly manoDelCiclo: number;
  readonly manosJugadas: number;
  readonly repartoRepetido: boolean;
  readonly vulnerable: DePareja<boolean>;
  readonly subasta: readonly DeclaracionHecha[];
  readonly contrato: ContratoBridge | null;
  /** El asiento del muerto, en cuanto hay contrato. */
  readonly muerto: Asiento | null;
  /** Las cartas del muerto, desde que se juega la primera carta. */
  readonly manoMuerto: readonly IdCarta[] | null;
  /** Le toca al muerto y este asiento es el declarante: juega por él. */
  readonly juegaPorElMuerto: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoBridge['ultimaBaza'];
  readonly bazas: DePareja<number>;
  readonly jugadas: readonly IdCarta[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly resultadosManos: readonly ResultadoManoBridge[];
  readonly puntos: DePareja<number>;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 13;
/** Bazas que no cuentan para el contrato. */
export const BAZAS_LIBRES_BRIDGE = 6;

export const paloBridge = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** Rango para ganar bazas: el As es la más alta (14). */
export const rangoBridge = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
export const parejaBridge = (asiento: Asiento): ParejaBridge => (asiento % 2) as ParejaBridge;
export const companeroBridge = (asiento: Asiento): Asiento => (asiento + 2) % JUGADORES;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** El triunfo del contrato, o `null` sin triunfo. */
export const triunfoBridge = (d: DenominacionBridge): PaloFrances | null =>
  d === 'sinTriunfo' ? null : d;

/** Vulnerabilidad de cada pareja en el Chicago: nadie, el repartidor, el repartidor y todos. */
export function vulnerabilidadBridge(manoDelCiclo: number, repartidor: Asiento): DePareja<boolean> {
  const m = manoDelCiclo % MANOS_CICLO_BRIDGE;
  if (m === 0) return [false, false];
  if (m === 3) return [true, true];
  const p = parejaBridge(repartidor);
  return [p === 0, p === 1];
}

/** Carta que gana la baza: el triunfo más alto o, sin triunfos, la más alta del palo de salida. */
export function ganadoraBridge(
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
): CartaJugada {
  const salida = paloBridge(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    paloBridge(c) === triunfo
      ? 100 + rangoBridge(c)
      : paloBridge(c) === salida
        ? rangoBridge(c)
        : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar desde `mano`: las del palo de salida si tiene. */
export function cartasLegalesBridge(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloBridge(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloBridge(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

/** La última puja de la subasta y cómo está doblada. */
export function ultimaPujaBridge(subasta: readonly DeclaracionHecha[]): {
  readonly asiento: Asiento;
  readonly nivel: number;
  readonly denominacion: DenominacionBridge;
  readonly doblado: 0 | 1 | 2;
} | null {
  let doblado: 0 | 1 | 2 = 0;
  for (let i = subasta.length - 1; i >= 0; i--) {
    const { asiento, declaracion: d } = subasta[i]!;
    if (d.tipo === 'doblar' && doblado === 0) doblado = 1;
    if (d.tipo === 'redoblar') doblado = 2;
    if (d.tipo === 'pujar') {
      return { asiento, nivel: d.nivel, denominacion: d.denominacion, doblado };
    }
  }
  return null;
}

/** Orden de una puja: más alta cuanto mayor. */
export const ordenPujaBridge = (nivel: number, d: DenominacionBridge) =>
  (nivel - 1) * DENOMINACIONES_BRIDGE.length + DENOMINACIONES_BRIDGE.indexOf(d);

/** Declaraciones legales para `asiento` con esta subasta. */
export function declaracionesLegalesBridge(
  subasta: readonly DeclaracionHecha[],
  asiento: Asiento,
): DeclaracionBridge[] {
  const ultima = ultimaPujaBridge(subasta);
  const minimo = ultima ? ordenPujaBridge(ultima.nivel, ultima.denominacion) + 1 : 0;
  const r: DeclaracionBridge[] = [{ tipo: 'pasar' }];
  if (ultima && ultima.doblado === 0 && parejaBridge(ultima.asiento) !== parejaBridge(asiento)) {
    r.push({ tipo: 'doblar' });
  }
  if (ultima && ultima.doblado === 1 && parejaBridge(ultima.asiento) === parejaBridge(asiento)) {
    r.push({ tipo: 'redoblar' });
  }
  for (let nivel = 1; nivel <= 7; nivel++) {
    for (const denominacion of DENOMINACIONES_BRIDGE) {
      if (ordenPujaBridge(nivel, denominacion) >= minimo) {
        r.push({ tipo: 'pujar', nivel, denominacion });
      }
    }
  }
  return r;
}

/** Puntos de una baza del contrato (sin doblar): la primera sin triunfo vale 40. */
const valorBaza = (d: DenominacionBridge) => (d === 'treboles' || d === 'diamantes' ? 20 : 30);

/**
 * Puntos de la mano (tabla de duplicado): los de la pareja del declarante si cumple, o los de
 * la defensa si no.
 */
export function puntuarManoBridge(
  contrato: Pick<ContratoBridge, 'nivel' | 'denominacion' | 'doblado'>,
  bazasDeclarante: number,
  vulnerable: boolean,
): { readonly declarante: number; readonly defensa: number } {
  const { nivel, denominacion, doblado } = contrato;
  const diferencia = bazasDeclarante - BAZAS_LIBRES_BRIDGE - nivel;
  if (diferencia >= 0) {
    const base =
      (valorBaza(denominacion) * nivel + (denominacion === 'sinTriunfo' ? 10 : 0)) *
      (doblado === 0 ? 1 : doblado === 1 ? 2 : 4);
    const manga = base >= 100 ? (vulnerable ? 500 : 300) : 50;
    const slam =
      nivel === 6 ? (vulnerable ? 750 : 500) : nivel === 7 ? (vulnerable ? 1500 : 1000) : 0;
    const porSobrebaza =
      doblado === 0 ? valorBaza(denominacion) : (vulnerable ? 200 : 100) * doblado;
    return {
      declarante: base + manga + slam + 50 * doblado + diferencia * porSobrebaza,
      defensa: 0,
    };
  }
  const multa = (k: number) => {
    if (doblado === 0) return vulnerable ? 100 : 50;
    const doblada = vulnerable ? (k === 1 ? 200 : 300) : k === 1 ? 100 : k <= 3 ? 200 : 300;
    return doblada * doblado;
  };
  let defensa = 0;
  for (let k = 1; k <= -diferencia; k++) defensa += multa(k);
  return { declarante: 0, defensa };
}

const partidaTerminada = (e: Pick<EstadoBridge, 'manosJugadas' | 'config'>) =>
  e.manosJugadas >= MANOS_CICLO_BRIDGE * e.config.ciclos;

/** El asiento que elige la acción ahora: el declarante cuando le toca al muerto. */
export function actorBridge(e: Pick<EstadoBridge, 'fase' | 'turno' | 'contrato'>): Asiento {
  if (e.fase === 'carteo' && e.contrato && e.turno === companeroBridge(e.contrato.declarante)) {
    return e.contrato.declarante;
  }
  return e.turno;
}

function repartirMano(
  base: Omit<
    EstadoBridge,
    | 'manos'
    | 'azar'
    | 'fase'
    | 'subasta'
    | 'contrato'
    | 'turno'
    | 'mesa'
    | 'bazas'
    | 'jugadasPor'
    | 'fallos'
  >,
  azar: EstadoAzar,
): EstadoBridge {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const reparto = repartir(cartas, new Array<number>(JUGADORES).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(base.repartidor + 1 + k) % JUGADORES] = reparto.valor.manos[k]!;
  }
  return {
    ...base,
    azar: azarSiguiente,
    fase: 'subasta',
    manos,
    subasta: [],
    contrato: null,
    turno: base.repartidor,
    mesa: [],
    bazas: [0, 0],
    jugadasPor: Array.from({ length: JUGADORES }, () => []),
    fallos: Array.from({ length: JUGADORES }, () => []),
  };
}

/** Cierra la subasta tras una declaración: contrato, reparto de nuevo o nada. */
function cerrarSubasta(e: EstadoBridge): EstadoBridge {
  const s = e.subasta;
  const ultima = ultimaPujaBridge(s);
  const pases = s.length >= 3 && s.slice(-3).every((d) => d.declaracion.tipo === 'pasar');
  if (ultima === null) {
    if (s.length < JUGADORES) return e;
    // Pasan los cuatro: se reparte de nuevo con el mismo repartidor.
    return { ...repartirMano(e, e.azar), repartoRepetido: true };
  }
  if (!pases) return e;
  const pareja = parejaBridge(ultima.asiento);
  const declarante = s.find(
    (d) =>
      parejaBridge(d.asiento) === pareja &&
      d.declaracion.tipo === 'pujar' &&
      d.declaracion.denominacion === ultima.denominacion,
  )!.asiento;
  return {
    ...e,
    fase: 'carteo',
    contrato: {
      nivel: ultima.nivel,
      denominacion: ultima.denominacion,
      declarante,
      doblado: ultima.doblado,
    },
    turno: siguiente(declarante),
  };
}

function cerrarMano(e: EstadoBridge): EstadoBridge {
  const contrato = e.contrato!;
  const pareja = parejaBridge(contrato.declarante);
  const vulnerable = vulnerabilidadBridge(e.manoDelCiclo, e.repartidor)[pareja];
  const { declarante, defensa } = puntuarManoBridge(contrato, e.bazas[pareja], vulnerable);
  const puntosMano: [number, number] = [0, 0];
  puntosMano[pareja] = declarante;
  puntosMano[1 - pareja] = defensa;
  const puntos: DePareja<number> = [e.puntos[0] + puntosMano[0], e.puntos[1] + puntosMano[1]];
  const resultadosManos = [
    ...e.resultadosManos,
    {
      contrato,
      vulnerable,
      bazas: e.bazas,
      diferencia: e.bazas[pareja] - BAZAS_LIBRES_BRIDGE - contrato.nivel,
      puntosMano,
      puntosTras: puntos,
    },
  ];
  const manosJugadas = e.manosJugadas + 1;
  const cerrado: EstadoBridge = { ...e, resultadosManos, puntos, manosJugadas };
  if (partidaTerminada(cerrado)) return cerrado;
  return repartirMano(
    {
      ...cerrado,
      repartidor: siguiente(e.repartidor),
      manoDelCiclo: manosJugadas % MANOS_CICLO_BRIDGE,
      repartoRepetido: false,
    },
    e.azar,
  );
}

function resolverBaza(e: EstadoBridge): EstadoBridge {
  const ganador = ganadoraBridge(e.mesa, triunfoBridge(e.contrato!.denominacion)).asiento;
  const bazas: [number, number] = [e.bazas[0], e.bazas[1]];
  bazas[parejaBridge(ganador)]++;
  const resuelto: EstadoBridge = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas,
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

/** El muerto ya está boca arriba: se ha jugado la primera carta. */
const muertoDescubierto = (e: EstadoBridge) =>
  e.fase === 'carteo' && (e.mesa.length > 0 || e.jugadasPor.some((j) => j.length > 0));

// ── Juego ────────────────────────────────────────────────────────────────────

export const bridge: Juego<ConfigBridge, EstadoBridge, AccionBridge, VistaBridge> = {
  id: 'bridge',

  crear(config, semilla) {
    if (![1, 2, 3].includes(config.ciclos)) return error('El Bridge se juega a 1, 2 o 3 ciclos');
    return ok(
      repartirMano(
        {
          config: { ciclos: config.ciclos },
          repartidor: 0,
          manoDelCiclo: 0,
          manosJugadas: 0,
          repartoRepetido: false,
          ultimaBaza: null,
          resultadosManos: [],
          puntos: [0, 0],
        },
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== actorBridge(e)) return [];
    if (e.fase === 'subasta') return declaracionesLegalesBridge(e.subasta, asiento);
    return cartasLegalesBridge(e.manos[e.turno]!, e.mesa).map((carta) => ({
      tipo: 'jugar',
      carta,
    }));
  },

  transicion(e, asiento, accion) {
    if (accion.tipo !== 'jugar') {
      return cerrarSubasta({
        ...e,
        repartoRepetido: false,
        subasta: [...e.subasta, { asiento, declaracion: accion }],
        turno: siguiente(asiento),
      });
    }
    const quien = e.turno;
    const manos = e.manos.map((m, a) => (a === quien ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento: quien, carta: accion.carta }];
    const salida = paloBridge(mesa[0]!.carta);
    const falla = paloBridge(accion.carta) !== salida;
    const jugado: EstadoBridge = {
      ...e,
      manos,
      mesa,
      jugadasPor: e.jugadasPor.map((j, a) => (a === quien ? [...j, accion.carta] : j)),
      fallos:
        falla && !e.fallos[quien]!.includes(salida)
          ? e.fallos.map((f, a) => (a === quien ? [...f, salida] : f))
          : e.fallos,
    };
    return mesa.length < JUGADORES ? { ...jugado, turno: siguiente(quien) } : resolverBaza(jugado);
  },

  vistaDe(e, asiento) {
    const terminada = partidaTerminada(e);
    const muerto = e.contrato ? companeroBridge(e.contrato.declarante) : null;
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      fase: e.fase,
      turno: terminada ? null : e.turno,
      repartidor: e.repartidor,
      manoDelCiclo: e.manoDelCiclo,
      manosJugadas: e.manosJugadas,
      repartoRepetido: e.repartoRepetido,
      vulnerable: vulnerabilidadBridge(e.manoDelCiclo, e.repartidor),
      subasta: [...e.subasta],
      contrato: e.contrato,
      muerto,
      manoMuerto: muerto !== null && muertoDescubierto(e) ? [...e.manos[muerto]!] : null,
      juegaPorElMuerto:
        !terminada &&
        e.fase === 'carteo' &&
        muerto !== null &&
        e.turno === muerto &&
        asiento === e.contrato!.declarante,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: e.bazas,
      jugadas: e.jugadasPor.flat(),
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      fallos: e.fallos.map((f) => [...f]),
      resultadosManos: [...e.resultadosManos],
      puntos: e.puntos,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const puntos = Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaBridge(a)]);
    if (e.puntos[0] === e.puntos[1]) return { ganadores: [], empate: true, puntos };
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return { ganadores: [gana, gana + 2], empate: false, puntos };
  },
};
