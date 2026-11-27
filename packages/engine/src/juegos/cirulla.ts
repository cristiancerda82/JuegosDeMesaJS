import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import { bandoDe, siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { combinaciones } from './escoba';
import {
  capturasScopa,
  puntuarManoScopa,
  valorScopa,
  type JugadaScopa,
  type PuntosScopa,
  type RecuentoScopa,
} from './scopa';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigCirulla {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Puntos para ganar: 51 (más bajo solo en las pruebas). */
  readonly meta: number;
}

export const META_CIRULLA = 51;
export const CONFIG_CIRULLA_POR_DEFECTO: ConfigCirulla = { jugadores: 2, meta: META_CIRULLA };

/** El comodín de los acuses y de la mesa inicial: el 7 de copas (el de corazones, en francesa). */
export const MATTA: IdCarta = 'copas-7';

/** Un acuse: las tres cartas que un jugador enseña al recibirlas, y las escobas que vale. */
export interface AcuseCirulla {
  readonly asiento: Asiento;
  readonly tipo: 'iguales' | 'menosDeDiez';
  readonly cartas: readonly IdCarta[];
  readonly escobas: 3 | 10;
}

/** La mesa inicial que se llevó el que reparte, por sumar 15 o 30. */
export interface MesaInicialCirulla {
  readonly asiento: Asiento;
  readonly cartas: readonly IdCarta[];
  readonly suma: 15 | 30;
  readonly escobas: 1 | 2;
}

/** Puntos de un bando en la mano: los de la Scopa, la cirulla grande y la pequeña. */
export interface PuntosCirulla extends PuntosScopa {
  readonly grande: 0 | 5;
  readonly pequena: number;
}

export interface ResultadoManoCirulla {
  readonly recuento: readonly [RecuentoScopa, RecuentoScopa];
  readonly puntos: readonly [PuntosCirulla, PuntosCirulla];
  readonly puntosTras: readonly [number, number];
  /** El bando que se llevó los diez oros y gana la partida, si lo hubo. */
  readonly todosLosOros: 0 | 1 | null;
}

export interface EstadoCirulla {
  readonly config: ConfigCirulla;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas por repartir; las siguientes son las primeras. */
  readonly mazo: readonly IdCarta[];
  readonly mesa: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  /** Cartas recogidas por cada bando en la mano, boca abajo. */
  readonly recogidas: readonly [readonly IdCarta[], readonly IdCarta[]];
  /** Escobas de cada bando en la mano, con las de los acuses y la mesa inicial. */
  readonly scopas: readonly [number, number];
  /** Cartas acusadas que cada jugador aún tiene en la mano, a la vista de todos. */
  readonly acusadas: readonly (readonly IdCarta[])[];
  /** Los acuses de la última ronda repartida. */
  readonly acuses: readonly AcuseCirulla[];
  readonly mesaInicial: MesaInicialCirulla | null;
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaScopa | null;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoCirulla[];
}

export interface AccionCirulla {
  readonly tipo: 'jugar';
  readonly carta: IdCarta;
  /** Cartas de la mesa que se lleva, en el orden de la mesa; vacío para dejarla en la mesa. */
  readonly captura: readonly IdCarta[];
}

export interface VistaCirulla {
  readonly config: ConfigCirulla;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly mesa: readonly IdCarta[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly cartasRecogidas: readonly [number, number];
  readonly scopas: readonly [number, number];
  readonly acusadas: readonly (readonly IdCarta[])[];
  readonly acuses: readonly AcuseCirulla[];
  readonly mesaInicial: MesaInicialCirulla | null;
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaScopa | null;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoCirulla[];
}

// ── Capturas, acuses y puntos ────────────────────────────────────────────────

const AS = 1;
const QUINCE = 15;

/**
 * Las capturas legales de una carta: el As, con una mesa sin Ases, se la lleva entera; si no,
 * las de la Scopa y las combinaciones que suman 15 con la carta jugada. Vacío si no captura.
 */
export function capturasCirulla(mesa: readonly IdCarta[], carta: IdCarta): IdCarta[][] {
  const valor = valorScopa(carta);
  if (valor === AS && mesa.length > 0 && !mesa.some((c) => valorScopa(c) === AS)) {
    return [[...mesa]];
  }
  const todas = [...capturasScopa(mesa, carta), ...combinaciones(mesa, QUINCE - valor)];
  const vistas = new Set<string>();
  return todas.filter((captura) => {
    const clave = captura.join(',');
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
}

/** El acuse de tres cartas, si lo hay: tres iguales (10 escobas) o menos de 10 (3). */
export function acuseCirulla(cartas: readonly IdCarta[]): Omit<AcuseCirulla, 'asiento'> | null {
  if (cartas.length !== 3) return null;
  // El 7 de copas vale lo que haga falta: igual que las otras, o 1 para sumar lo menos posible.
  const resto = cartas.filter((c) => c !== MATTA).map(valorScopa);
  if (resto.every((v) => v === resto[0])) {
    return { tipo: 'iguales', cartas: [...cartas], escobas: 10 };
  }
  const suma = resto.reduce((s, v) => s + v, 0) + (resto.length < 3 ? AS : 0);
  if (suma < 10) return { tipo: 'menosDeDiez', cartas: [...cartas], escobas: 3 };
  return null;
}

/** La suma de la mesa inicial si llega a 30 o 15 (el 7 de copas vale lo que haga falta). */
export function sumaMesaInicial(mesa: readonly IdCarta[]): 15 | 30 | null {
  const base = mesa.filter((c) => c !== MATTA).reduce((s, c) => s + valorScopa(c), 0);
  if (!mesa.includes(MATTA)) return base === 30 ? 30 : base === QUINCE ? 15 : null;
  for (const objetivo of [30, QUINCE] as const) {
    const falta = objetivo - base;
    if (falta >= 1 && falta <= 10) return objetivo;
  }
  return null;
}

/** La cirulla grande: la Sota, el Caballo y el Rey de oros, 5 puntos. */
export const grandeCirulla = (cartas: readonly IdCarta[]): 0 | 5 =>
  ['oros-10', 'oros-11', 'oros-12'].every((c) => cartas.includes(c as IdCarta)) ? 5 : 0;

/** La cirulla pequeña: el As, el 2 y el 3 de oros, 3 puntos, y 1 más por cada seguida hasta el 6. */
export function pequenaCirulla(cartas: readonly IdCarta[]): number {
  if (![1, 2, 3].every((v) => cartas.includes(`oros-${v}`))) return 0;
  let puntos = 3;
  for (let v = 4; v <= 6 && cartas.includes(`oros-${v}`); v++) puntos++;
  return puntos;
}

/** Puntos de la mano a partir de lo que recogió cada bando y sus escobas. */
export function puntuarManoCirulla(
  recogidas: readonly [readonly IdCarta[], readonly IdCarta[]],
  scopas: readonly [number, number],
): Pick<ResultadoManoCirulla, 'recuento' | 'puntos' | 'todosLosOros'> {
  const { recuento, puntos: scopa } = puntuarManoScopa(recogidas, scopas);
  const puntos = ([0, 1] as const).map((b) => {
    const grande = grandeCirulla(recogidas[b]);
    const pequena = pequenaCirulla(recogidas[b]);
    return { ...scopa[b], grande, pequena, total: scopa[b].total + grande + pequena };
  }) as [PuntosCirulla, PuntosCirulla];
  const todosLosOros = recuento[0].oros === 10 ? 0 : recuento[1].oros === 10 ? 1 : null;
  return { recuento, puntos, todosLosOros };
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_POR_RONDA = 3;
const CARTAS_EN_MESA = 4;

const terminada = (e: Pick<EstadoCirulla, 'puntos' | 'config' | 'resultadosManos'>) =>
  e.resultadosManos.at(-1)?.todosLosOros != null ||
  (Math.max(...e.puntos) >= e.config.meta && e.puntos[0] !== e.puntos[1]);

/** Reparte 3 cartas a cada uno desde `desde`, con los acuses de esa ronda. */
function repartirRonda(
  mazo: readonly IdCarta[],
  jugadores: number,
  desde: Asiento,
): Pick<EstadoCirulla, 'manos' | 'mazo' | 'acusadas' | 'acuses'> {
  const manos: IdCarta[][] = Array.from({ length: jugadores }, () => []);
  for (let k = 0; k < jugadores; k++) {
    manos[(desde + k) % jugadores] = mazo.slice(k * CARTAS_POR_RONDA, (k + 1) * CARTAS_POR_RONDA);
  }
  const acuses = manos.flatMap((m, asiento): AcuseCirulla[] => {
    const acuse = acuseCirulla(m);
    return acuse === null ? [] : [{ asiento, ...acuse }];
  });
  return {
    manos,
    mazo: mazo.slice(jugadores * CARTAS_POR_RONDA),
    acusadas: manos.map((m, a) => (acuses.some((x) => x.asiento === a) ? [...m] : [])),
    acuses,
  };
}

/** Suma las escobas de los acuses al bando de cada uno. */
function conAcuses(
  scopas: readonly [number, number],
  acuses: readonly AcuseCirulla[],
): [number, number] {
  const total: [number, number] = [scopas[0], scopas[1]];
  for (const a of acuses) total[bandoDe(a.asiento)] += a.escobas;
  return total;
}

function nuevaMano(
  base: Pick<EstadoCirulla, 'config' | 'puntos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoCirulla {
  // Con dos Ases o más en la mesa se vuelve a repartir.
  let { cartas, azar: sig } = barajar(crearBaraja('espanola40'), azar);
  while (cartas.slice(0, CARTAS_EN_MESA).filter((c) => valorScopa(c) === AS).length >= 2) {
    ({ cartas, azar: sig } = barajar(crearBaraja('espanola40'), sig));
  }
  const n = base.config.jugadores;
  const sale = siguiente(repartidor, n);
  const inicial = cartas.slice(0, CARTAS_EN_MESA);
  const ronda = repartirRonda(cartas.slice(CARTAS_EN_MESA), n, sale);
  const suma = sumaMesaInicial(inicial);
  const mesaInicial: MesaInicialCirulla | null =
    suma === null
      ? null
      : { asiento: repartidor, cartas: inicial, suma, escobas: suma === 30 ? 2 : 1 };
  const recogidas: [IdCarta[], IdCarta[]] = [[], []];
  const scopas: [number, number] = [0, 0];
  if (mesaInicial !== null) {
    recogidas[bandoDe(repartidor)].push(...inicial);
    scopas[bandoDe(repartidor)] += mesaInicial.escobas;
  }
  return {
    ...base,
    azar: sig,
    repartidor,
    ...ronda,
    mesa: mesaInicial === null ? inicial : [],
    turno: sale,
    recogidas,
    scopas: conAcuses(scopas, ronda.acuses),
    mesaInicial,
    ultimoEnRecoger: mesaInicial === null ? null : repartidor,
    ultimaJugada: null,
  };
}

/** Las cartas de la mesa van al último que capturó; se puntúa y se reparte otra o termina. */
function cerrarMano(e: EstadoCirulla): EstadoCirulla {
  const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
  if (e.ultimoEnRecoger !== null) recogidas[bandoDe(e.ultimoEnRecoger)].push(...e.mesa);
  const mano = puntuarManoCirulla(recogidas, e.scopas);
  const puntos: [number, number] = [
    e.puntos[0] + mano.puntos[0].total,
    e.puntos[1] + mano.puntos[1].total,
  ];
  const cerrado: EstadoCirulla = {
    ...e,
    mesa: e.ultimoEnRecoger === null ? e.mesa : [],
    recogidas,
    puntos,
    resultadosManos: [...e.resultadosManos, { ...mano, puntosTras: puntos }],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, e.config.jugadores), e.azar);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cirulla: Juego<ConfigCirulla, EstadoCirulla, AccionCirulla, VistaCirulla> = {
  id: 'cirulla',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('La Cirulla se juega con 2 jugadores o con 4 en parejas');
    }
    if (!Number.isInteger(config.meta) || config.meta < 1) {
      return error('La meta debe ser positiva');
    }
    const limpia: ConfigCirulla = { jugadores: config.jugadores, meta: config.meta };
    // Reparte el último asiento, así sale el asiento 0.
    return ok(
      nuevaMano(
        { config: limpia, puntos: [0, 0], resultadosManos: [] },
        limpia.jugadores - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    return e.manos[asiento]!.flatMap((carta): AccionCirulla[] => {
      const capturas = capturasCirulla(e.mesa, carta);
      return capturas.length > 0
        ? capturas.map((captura) => ({ tipo: 'jugar', carta, captura }))
        : [{ tipo: 'jugar', carta, captura: [] }];
    });
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    let manos: readonly (readonly IdCarta[])[] = e.manos.map((m, a) =>
      a === asiento ? m.filter((c) => c !== accion.carta) : m,
    );
    let mazo = e.mazo;
    let acusadas: readonly (readonly IdCarta[])[] = e.acusadas.map((m, a) =>
      a === asiento ? m.filter((c) => c !== accion.carta) : m,
    );
    let acuses = e.acuses;
    const bando = bandoDe(asiento);
    const recoge = accion.captura.length > 0;
    const mesa = recoge
      ? e.mesa.filter((c) => !accion.captura.includes(c))
      : [...e.mesa, accion.carta];
    const ultimaDeLaMano = mazo.length === 0 && manos.every((m) => m.length === 0);
    const hizoScopa = recoge && mesa.length === 0 && !ultimaDeLaMano;
    const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
    let scopas: [number, number] = [e.scopas[0], e.scopas[1]];
    if (recoge) recogidas[bando].push(accion.carta, ...accion.captura);
    if (hizoScopa) scopas[bando]++;
    const turno = siguiente(asiento, n);

    if (manos.every((m) => m.length === 0) && mazo.length > 0) {
      // Otras 3 a cada uno, empezando por el que juega ahora, con sus acuses.
      const ronda = repartirRonda(mazo, n, turno);
      ({ manos, mazo, acusadas, acuses } = ronda);
      scopas = conAcuses(scopas, acuses);
    }

    const jugado: EstadoCirulla = {
      ...e,
      manos,
      mazo,
      mesa,
      turno,
      recogidas,
      scopas,
      acusadas,
      acuses,
      ultimoEnRecoger: recoge ? asiento : e.ultimoEnRecoger,
      ultimaJugada: { asiento, carta: accion.carta, captura: accion.captura, scopa: hizoScopa },
    };
    return ultimaDeLaMano ? cerrarMano(jugado) : jugado;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      mesa: [...e.mesa],
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      cartasRecogidas: [e.recogidas[0].length, e.recogidas[1].length],
      scopas: [e.scopas[0], e.scopas[1]],
      acusadas: e.acusadas.map((m) => [...m]),
      acuses: [...e.acuses],
      mesaInicial: e.mesaInicial,
      ultimoEnRecoger: e.ultimoEnRecoger,
      ultimaJugada: e.ultimaJugada,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const oros = e.resultadosManos.at(-1)?.todosLosOros ?? null;
    const bando = oros ?? (e.puntos[0] > e.puntos[1] ? 0 : 1);
    return {
      ganadores: asientos.filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: asientos.map((a) => e.puntos[bandoDe(a)]),
    };
  },
};
