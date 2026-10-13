import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import { bandoDe, siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigEscoba {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Puntos que hay que alcanzar para ganar la partida. */
  readonly puntosPartida: 15 | 21 | 31;
  /** Si la carta jugada puede recoger, hay que recoger. */
  readonly capturaObligatoria: boolean;
  /** Si las 4 cartas iniciales de la mesa suman 15 (o 30), son escoba del repartidor. */
  readonly escobaInicial: boolean;
}

export const CONFIG_ESCOBA_POR_DEFECTO: ConfigEscoba = {
  jugadores: 2,
  puntosPartida: 21,
  capturaObligatoria: false,
  escobaInicial: true,
};

export interface JugadaEscoba {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
  /** Cartas recogidas de la mesa; vacío si la carta se quedó en la mesa. */
  readonly captura: readonly IdCarta[];
  readonly escoba: boolean;
}

/** Puntos que gana un bando en una mano, concepto por concepto. */
export interface PuntosBando {
  readonly escobas: number;
  readonly cartas: 0 | 1;
  readonly oros: 0 | 1;
  readonly sieteOros: 0 | 1;
  readonly sietes: 0 | 1;
  readonly total: number;
}

/** Lo que reunió un bando en la mano, para mostrar el desglose. */
export interface RecuentoBando {
  readonly cartas: number;
  readonly oros: number;
  readonly sietes: number;
  readonly sieteOros: boolean;
  readonly escobas: number;
}

export interface ResultadoManoEscoba {
  readonly puntos: readonly [PuntosBando, PuntosBando];
  readonly recuento: readonly [RecuentoBando, RecuentoBando];
}

export interface EstadoEscoba {
  readonly config: ConfigEscoba;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas por repartir; las siguientes son las primeras. */
  readonly mazo: readonly IdCarta[];
  /** Cartas boca arriba en la mesa, en orden de llegada. */
  readonly mesa: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  /** Cartas recogidas por cada bando en la mano en curso. */
  readonly recogidas: readonly [readonly IdCarta[], readonly IdCarta[]];
  readonly escobas: readonly [number, number];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaEscoba | null;
  readonly resultadosManos: readonly ResultadoManoEscoba[];
}

export interface AccionEscoba {
  readonly tipo: 'jugar';
  readonly carta: IdCarta;
  /** Cartas de la mesa que se recogen, en el orden de la mesa; vacío para no recoger. */
  readonly captura: readonly IdCarta[];
}

export interface VistaEscoba {
  readonly config: ConfigEscoba;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly mesa: readonly IdCarta[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  /** Cuántas cartas lleva recogidas cada bando en la mano en curso. */
  readonly cartasRecogidas: readonly [number, number];
  readonly escobas: readonly [number, number];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaEscoba | null;
  /** Puntos acumulados de la partida por bando. */
  readonly puntosPartida: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoEscoba[];
}

// ── Valores y capturas ───────────────────────────────────────────────────────

const OBJETIVO = 15;
const CARTAS_POR_REPARTO = 3;
const CARTAS_EN_MESA = 4;

/** Valor para sumar: as 1, del 2 al 7 su número, sota 8, caballo 9 y rey 10. */
export function valorEscoba(id: IdCarta): number {
  const valor = cartaDeId(id)!.valor;
  return valor <= 7 ? valor : valor - 2;
}

const esOro = (id: IdCarta) => id.startsWith('oros-');
const esSiete = (id: IdCarta) => id.endsWith('-7');
const SIETE_DE_OROS: IdCarta = 'oros-7';

/**
 * Todas las combinaciones de cartas de la mesa (al menos una) cuyo valor suma `objetivo`,
 * cada una en el orden de la mesa. Recorrido en profundidad con poda: los valores son positivos.
 */
export function combinaciones(mesa: readonly IdCarta[], objetivo: number): IdCarta[][] {
  const resultado: IdCarta[][] = [];
  const elegidas: IdCarta[] = [];
  const buscar = (desde: number, resto: number) => {
    if (resto === 0 && elegidas.length > 0) {
      resultado.push([...elegidas]);
      return;
    }
    for (let i = desde; i < mesa.length; i++) {
      const v = valorEscoba(mesa[i]!);
      if (v > resto) continue;
      elegidas.push(mesa[i]!);
      buscar(i + 1, resto - v);
      elegidas.pop();
    }
  };
  buscar(0, objetivo);
  return resultado;
}

/** Puntos de una mano a partir de lo que recogió cada bando y sus escobas. */
export function puntuarMano(
  recogidas: readonly [readonly IdCarta[], readonly IdCarta[]],
  escobas: readonly [number, number],
): ResultadoManoEscoba {
  const recuento = ([0, 1] as const).map((b) => ({
    cartas: recogidas[b].length,
    oros: recogidas[b].filter(esOro).length,
    sietes: recogidas[b].filter(esSiete).length,
    sieteOros: recogidas[b].includes(SIETE_DE_OROS),
    escobas: escobas[b],
  })) as [RecuentoBando, RecuentoBando];
  /** 1 punto para quien tenga más; con empate, para nadie. */
  const mas = (b: 0 | 1, campo: 'cartas' | 'oros' | 'sietes'): 0 | 1 =>
    recuento[b][campo] > recuento[1 - b]![campo] ? 1 : 0;
  const puntos = ([0, 1] as const).map((b) => {
    const p = {
      escobas: escobas[b],
      cartas: mas(b, 'cartas'),
      oros: mas(b, 'oros'),
      sieteOros: recuento[b].sieteOros ? 1 : 0,
      sietes: mas(b, 'sietes'),
    } as const;
    return { ...p, total: p.escobas + p.cartas + p.oros + p.sieteOros + p.sietes };
  }) as [PuntosBando, PuntosBando];
  return { puntos, recuento };
}

// ── Reglas ───────────────────────────────────────────────────────────────────

function puntosPartida(resultados: readonly ResultadoManoEscoba[]): [number, number] {
  const total: [number, number] = [0, 0];
  for (const r of resultados) {
    total[0] += r.puntos[0].total;
    total[1] += r.puntos[1].total;
  }
  return total;
}

function partidaTerminada(e: EstadoEscoba): boolean {
  const [a, b] = puntosPartida(e.resultadosManos);
  return Math.max(a, b) >= e.config.puntosPartida && a !== b;
}

/** Reparte 3 cartas a cada uno empezando por `desde`; devuelve las manos y el mazo restante. */
function repartirTres(
  mazo: readonly IdCarta[],
  jugadores: number,
  desde: Asiento,
): { manos: IdCarta[][]; mazo: IdCarta[] } {
  const r = repartir(mazo, new Array<number>(jugadores).fill(CARTAS_POR_REPARTO));
  if (!r.ok) throw new Error(r.error);
  const manos = Array.from(
    { length: jugadores },
    (_, asiento) => r.valor.manos[(asiento - desde + jugadores) % jugadores]!,
  );
  return { manos, mazo: r.valor.mazo };
}

function nuevaMano(
  config: ConfigEscoba,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoEscoba[],
): EstadoEscoba {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const n = config.jugadores;
  const sale = siguiente(repartidor, n);
  const reparto = repartirTres(cartas, n, sale);
  let mesa: IdCarta[] = reparto.mazo.slice(0, CARTAS_EN_MESA);
  const mazo = reparto.mazo.slice(CARTAS_EN_MESA);

  const recogidas: [IdCarta[], IdCarta[]] = [[], []];
  const escobas: [number, number] = [0, 0];
  let ultimoEnRecoger: Asiento | null = null;
  const suma = mesa.reduce((s, c) => s + valorEscoba(c), 0);
  if (config.escobaInicial && (suma === OBJETIVO || suma === 2 * OBJETIVO)) {
    // La mesa inicial que suma 15 (o 30) es escoba (o dos) del repartidor.
    recogidas[bandoDe(repartidor)] = mesa;
    escobas[bandoDe(repartidor)] = suma / OBJETIVO;
    ultimoEnRecoger = repartidor;
    mesa = [];
  }

  return {
    config,
    azar: azarSiguiente,
    repartidor,
    mazo,
    mesa,
    manos: reparto.manos,
    turno: sale,
    recogidas,
    escobas,
    ultimoEnRecoger,
    ultimaJugada: null,
    resultadosManos,
  };
}

/** Las cartas de la mesa van al último que recogió; se puntúa y se reparte otra mano o termina. */
function cerrarMano(e: EstadoEscoba): EstadoEscoba {
  const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
  if (e.ultimoEnRecoger !== null) recogidas[bandoDe(e.ultimoEnRecoger)].push(...e.mesa);
  const resultadosManos = [...e.resultadosManos, puntuarMano(recogidas, e.escobas)];
  const cerrado: EstadoEscoba = {
    ...e,
    mesa: e.ultimoEnRecoger === null ? e.mesa : [],
    recogidas,
    resultadosManos,
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, siguiente(e.repartidor, e.config.jugadores), resultadosManos);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const escoba: Juego<ConfigEscoba, EstadoEscoba, AccionEscoba, VistaEscoba> = {
  id: 'escoba',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('La Escoba se juega con 2 jugadores o con 4 en parejas');
    }
    if (![15, 21, 31].includes(config.puntosPartida)) {
      return error('La partida es a 15, 21 o 31 puntos');
    }
    if (typeof config.capturaObligatoria !== 'boolean') {
      return error('Opción de captura obligatoria inválida');
    }
    if (typeof config.escobaInicial !== 'boolean') {
      return error('Opción de escoba de la mesa inicial inválida');
    }
    const limpia: ConfigEscoba = {
      jugadores: config.jugadores,
      puntosPartida: config.puntosPartida,
      capturaObligatoria: config.capturaObligatoria,
      escobaInicial: config.escobaInicial,
    };
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, []));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const acciones: AccionEscoba[] = [];
    for (const carta of e.manos[asiento]!) {
      const capturas = combinaciones(e.mesa, OBJETIVO - valorEscoba(carta));
      for (const captura of capturas) acciones.push({ tipo: 'jugar', carta, captura });
      if (!e.config.capturaObligatoria || capturas.length === 0) {
        acciones.push({ tipo: 'jugar', carta, captura: [] });
      }
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    let manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    let mazo = e.mazo;
    const bando = bandoDe(asiento);
    const recoge = accion.captura.length > 0;
    const mesa = recoge
      ? e.mesa.filter((c) => !accion.captura.includes(c))
      : [...e.mesa, accion.carta];
    const hizoEscoba = recoge && mesa.length === 0;
    const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
    const escobas: [number, number] = [e.escobas[0], e.escobas[1]];
    if (recoge) recogidas[bando].push(accion.carta, ...accion.captura);
    if (hizoEscoba) escobas[bando]++;
    const turno = siguiente(asiento, n);

    if (manos.every((m) => m.length === 0) && mazo.length > 0) {
      // Todos sin cartas: otras 3 a cada uno, empezando por el que juega ahora.
      ({ manos, mazo } = repartirTres(mazo, n, turno));
    }

    const jugado: EstadoEscoba = {
      ...e,
      manos,
      mazo,
      mesa,
      turno,
      recogidas,
      escobas,
      ultimoEnRecoger: recoge ? asiento : e.ultimoEnRecoger,
      ultimaJugada: { asiento, carta: accion.carta, captura: accion.captura, escoba: hizoEscoba },
    };
    return manos.every((m) => m.length === 0) ? cerrarMano(jugado) : jugado;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      mesa: [...e.mesa],
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      cartasRecogidas: [e.recogidas[0].length, e.recogidas[1].length],
      escobas: [e.escobas[0], e.escobas[1]],
      ultimoEnRecoger: e.ultimoEnRecoger,
      ultimaJugada: e.ultimaJugada,
      puntosPartida: puntosPartida(e.resultadosManos),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const total = puntosPartida(e.resultadosManos);
    const puntos = asientos.map((a) => total[bandoDe(a)]);
    const bando = total[0] > total[1] ? 0 : 1;
    return { ganadores: asientos.filter((a) => bandoDe(a) === bando), empate: false, puntos };
  },
};
