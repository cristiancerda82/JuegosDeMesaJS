import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  PALOS_FRANCESES,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** El Schieber: 4 jugadores en parejas; la meta es 1.000 (más baja solo en las pruebas). */
export interface ConfigJass {
  readonly jugadores: 4;
  readonly meta: number;
}

export const META_JASS = 1000;
export const CONFIG_JASS_POR_DEFECTO: ConfigJass = { jugadores: 4, meta: META_JASS };

export type ParejaJass = 0 | 1;
type DePareja<T> = readonly [T, T];

/** Un palo de triunfo, o sin triunfo con el As arriba (Obenabe) o con el 6 arriba (Undenufe). */
export type ModoJass = PaloFrances | 'obenabe' | 'undenufe';

export const MODOS_JASS: readonly ModoJass[] = [
  'diamantes',
  'treboles',
  'corazones',
  'picas',
  'obenabe',
  'undenufe',
];

export const MULTIPLICADOR_JASS: Readonly<Record<ModoJass, number>> = {
  diamantes: 1,
  treboles: 1,
  corazones: 2,
  picas: 2,
  obenabe: 3,
  undenufe: 3,
};

export const PUNTOS_ULTIMA_JASS = 5;
export const PUNTOS_MATCH_JASS = 100;
export const PUNTOS_STOCK_JASS = 20;

export type FaseJass = 'eleccion' | 'bazas';
export type ConceptoJass = 'bazas' | 'weis' | 'stock';

/** Una declaración: una escalera del mismo palo o cuatro iguales. */
export interface WeisJass {
  readonly tipo: 'escalera' | 'cuatro';
  readonly cartas: readonly IdCarta[];
  readonly puntos: number;
}

/** Las declaraciones que anota la pareja que tiene la mejor. */
export interface WeisGanadorJass {
  readonly pareja: ParejaJass;
  readonly declaraciones: readonly { readonly asiento: Asiento; readonly weis: WeisJass }[];
  /** Sin multiplicar. */
  readonly puntos: number;
}

export interface ResultadoManoJass {
  readonly modo: ModoJass;
  /** Quien eligió el modo (el compañero, si se pasó la elección). */
  readonly eligio: Asiento;
  /** Puntos de cada pareja por concepto, ya multiplicados. */
  readonly bazas: DePareja<number>;
  readonly weis: DePareja<number>;
  readonly stock: DePareja<number>;
  readonly match: ParejaJass | null;
  readonly total: DePareja<number>;
  readonly puntosTras: DePareja<number>;
  /** `false` si la partida terminó en mitad de la mano. */
  readonly completa: boolean;
}

export interface EstadoJass {
  readonly config: ConfigJass;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseJass;
  /** Quien tiene la elección (sale en la primera baza aunque pase). */
  readonly elige: Asiento;
  readonly pasado: boolean;
  readonly modo: ModoJass | null;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Las manos del reparto, para las declaraciones y el Stöck. */
  readonly manosIniciales: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazasGanadas: DePareja<number>;
  /** Las cartas que ha jugado cada uno en la mano. */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /**
   * Palos de los que cada uno no tiene: el de salida, si echó otra carta que no era triunfo; el
   * del triunfo, si no echó triunfo cuando salió triunfo (puede quedarle el Buur).
   */
  readonly fallos: readonly (readonly PaloFrances[])[];
  /** Las declaraciones ganadoras, al acabar la primera baza (`null` antes o si nadie declara). */
  readonly weis: WeisGanadorJass | null;
  /** Quién ha anotado el Stöck en la mano. */
  readonly stock: Asiento | null;
  readonly puntosMano: DePareja<number>;
  readonly porConcepto: Readonly<Record<ConceptoJass, DePareja<number>>>;
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoJass[];
}

export type AccionJass =
  | { readonly tipo: 'elegir'; readonly modo: ModoJass }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaJass {
  readonly config: ConfigJass;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly fase: FaseJass;
  readonly repartidor: Asiento;
  readonly elige: Asiento;
  readonly pasado: boolean;
  readonly modo: ModoJass | null;
  /** Las declaraciones propias de la mano del reparto. */
  readonly misWeis: readonly WeisJass[];
  readonly weis: WeisGanadorJass | null;
  readonly stock: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoJass['ultimaBaza'];
  readonly bazasGanadas: DePareja<number>;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly puntosMano: DePareja<number>;
  readonly porConcepto: EstadoJass['porConcepto'];
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoJass[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La francesa del 6 al As: 36 cartas. */
export const BARAJA_JASS: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || (v >= 6 && v <= 13);
});

export const paloJass = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const valorDe = (c: IdCarta) => cartaDeId(c)!.valor;

/** El orden natural: del 6 (6) al As (14). */
export const naturalJass = (c: IdCarta) => (valorDe(c) === 1 ? 14 : valorDe(c));

export const esPaloJass = (modo: ModoJass | null): modo is PaloFrances =>
  modo !== null && (PALOS_FRANCESES as readonly string[]).includes(modo);

export const esTriunfoJass = (c: IdCarta, modo: ModoJass | null) =>
  esPaloJass(modo) && paloJass(c) === modo;

const RANGO_TRIUNFO: Readonly<Record<number, number>> = {
  11: 20,
  9: 19,
  1: 18,
  13: 17,
  12: 16,
  10: 15,
  8: 14,
  7: 13,
  6: 12,
};

/** Rango para comparar dentro de un palo, según el modo. */
export function rangoJass(c: IdCarta, modo: ModoJass): number {
  if (esTriunfoJass(c, modo)) return RANGO_TRIUNFO[valorDe(c)]!;
  return modo === 'undenufe' ? 20 - naturalJass(c) : naturalJass(c);
}

const PUNTOS_TRIUNFO: Readonly<Record<number, number>> = {
  11: 20,
  9: 14,
  1: 11,
  13: 4,
  12: 3,
  10: 10,
};
const PUNTOS_COMUN: Readonly<Record<number, number>> = { 1: 11, 13: 4, 12: 3, 11: 2, 10: 10 };
const PUNTOS_OBENABE: Readonly<Record<number, number>> = { ...PUNTOS_COMUN, 8: 8 };
const PUNTOS_UNDENUFE: Readonly<Record<number, number>> = {
  6: 11,
  13: 4,
  12: 3,
  11: 2,
  10: 10,
  8: 8,
};

/** Puntos de una carta según el modo (spec juego-jass). */
export function puntosCartaJass(c: IdCarta, modo: ModoJass): number {
  const tabla = esTriunfoJass(c, modo)
    ? PUNTOS_TRIUNFO
    : modo === 'obenabe'
      ? PUNTOS_OBENABE
      : modo === 'undenufe'
        ? PUNTOS_UNDENUFE
        : PUNTOS_COMUN;
  return tabla[valorDe(c)] ?? 0;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 9;

export const parejaJass = (asiento: Asiento): ParejaJass => (asiento % 2) as ParejaJass;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraJass(mesa: readonly CartaJugada[], modo: ModoJass): CartaJugada {
  const salida = paloJass(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    esTriunfoJass(c, modo)
      ? 100 + rangoJass(c, modo)
      : paloJass(c) === salida
        ? rangoJass(c, modo)
        : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar (spec juego-jass: seguir o fallar, el Buur y no subfallar). */
export function cartasLegalesJass(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  modo: ModoJass,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloJass(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloJass(c) === salida);
  if (!esPaloJass(modo)) return delPalo.length > 0 ? delPalo : [...mano];
  const triunfos = mano.filter((c) => esTriunfoJass(c, modo));
  if (salida === modo) {
    const soloBuur = triunfos.length === 1 && valorDe(triunfos[0]!) === 11;
    return triunfos.length === 0 || soloBuur ? [...mano] : triunfos;
  }
  const candidatas = delPalo.length > 0 ? [...delPalo, ...triunfos] : [...mano];
  const triunfosMesa = mesa.filter((j) => esTriunfoJass(j.carta, modo));
  if (triunfosMesa.length === 0 || triunfos.length === mano.length) return candidatas;
  const alto = Math.max(...triunfosMesa.map((j) => rangoJass(j.carta, modo)));
  return candidatas.filter((c) => !esTriunfoJass(c, modo) || rangoJass(c, modo) > alto);
}

// ── Declaraciones ────────────────────────────────────────────────────────────

const PUNTOS_CUATRO: Readonly<Record<number, number>> = {
  11: 200,
  9: 150,
  1: 100,
  13: 100,
  12: 100,
  10: 100,
};

const puntosEscalera = (largo: number) =>
  largo === 3 ? 20 : largo === 4 ? 50 : 100 + 50 * (largo - 5);

/** Las declaraciones de una mano: escaleras de 3 o más del mismo palo y cuatro iguales. */
export function weisJass(mano: readonly IdCarta[]): WeisJass[] {
  const weis: WeisJass[] = [];
  for (const palo of PALOS_FRANCESES) {
    const delPalo = mano
      .filter((c) => paloJass(c) === palo)
      .sort((a, b) => naturalJass(a) - naturalJass(b));
    let tramo: IdCarta[] = [];
    const cerrar = () => {
      if (tramo.length >= 3)
        weis.push({ tipo: 'escalera', cartas: tramo, puntos: puntosEscalera(tramo.length) });
    };
    for (const c of delPalo) {
      if (tramo.length > 0 && naturalJass(c) !== naturalJass(tramo.at(-1)!) + 1) {
        cerrar();
        tramo = [];
      }
      tramo = [...tramo, c];
    }
    cerrar();
  }
  for (const [valor, puntos] of Object.entries(PUNTOS_CUATRO)) {
    const iguales = mano.filter((c) => valorDe(c) === Number(valor));
    if (iguales.length === 4) weis.push({ tipo: 'cuatro', cartas: iguales, puntos });
  }
  return weis;
}

/** Clave para comparar declaraciones: puntos, cartas, carta más alta y si es del triunfo. */
function claveWeis(w: WeisJass, modo: ModoJass): number[] {
  const alta = Math.max(...w.cartas.map(naturalJass));
  const delTriunfo = w.tipo === 'escalera' && esTriunfoJass(w.cartas[0]!, modo) ? 1 : 0;
  return [w.puntos, w.cartas.length, alta, delTriunfo];
}

function compararClaves(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i]! - b[i]!;
  return 0;
}

/**
 * La pareja que anota las declaraciones: la del jugador con la mejor; a igualdad, la del más
 * cercano a quien salió. `null` si nadie declara.
 */
export function mejorWeisJass(
  manos: readonly (readonly IdCarta[])[],
  salida: Asiento,
  modo: ModoJass,
): WeisGanadorJass | null {
  let mejor: { asiento: Asiento; clave: number[] } | null = null;
  for (let k = 0; k < JUGADORES; k++) {
    const asiento = (salida + k) % JUGADORES;
    for (const w of weisJass(manos[asiento]!)) {
      const clave = claveWeis(w, modo);
      if (!mejor || compararClaves(clave, mejor.clave) > 0) mejor = { asiento, clave };
    }
  }
  if (!mejor) return null;
  const pareja = parejaJass(mejor.asiento);
  const declaraciones = [pareja, pareja + 2].flatMap((asiento) =>
    weisJass(manos[asiento]!).map((weis) => ({ asiento, weis })),
  );
  return { pareja, declaraciones, puntos: declaraciones.reduce((s, d) => s + d.weis.puntos, 0) };
}

// ── Mano ─────────────────────────────────────────────────────────────────────

const terminada = (e: Pick<EstadoJass, 'puntos' | 'config'>) =>
  Math.max(...e.puntos) >= e.config.meta;

const CERO: DePareja<number> = [0, 0];
const sumar = (par: DePareja<number>, pareja: ParejaJass, n: number): DePareja<number> =>
  pareja === 0 ? [par[0] + n, par[1]] : [par[0], par[1] + n];

/** Quien eligió el modo de la mano. */
export const eligioJass = (e: Pick<EstadoJass, 'elige' | 'pasado'>) =>
  e.pasado ? (e.elige + 2) % JUGADORES : e.elige;

function resultadoDe(
  e: EstadoJass,
  completa: boolean,
  match: ParejaJass | null,
): ResultadoManoJass {
  return {
    modo: e.modo!,
    eligio: eligioJass(e),
    bazas: e.porConcepto.bazas,
    weis: e.porConcepto.weis,
    stock: e.porConcepto.stock,
    match,
    total: e.puntosMano,
    puntosTras: e.puntos,
    completa,
  };
}

/** Anota puntos (ya multiplicados) al momento; al llegar a la meta, la partida termina. */
function anotar(
  e: EstadoJass,
  pareja: ParejaJass,
  puntos: number,
  concepto: ConceptoJass,
): EstadoJass {
  if (puntos === 0) return e;
  const anotado: EstadoJass = {
    ...e,
    puntosMano: sumar(e.puntosMano, pareja, puntos),
    porConcepto: { ...e.porConcepto, [concepto]: sumar(e.porConcepto[concepto], pareja, puntos) },
    puntos: sumar(e.puntos, pareja, puntos),
  };
  if (!terminada(anotado)) return anotado;
  return { ...anotado, resultadosManos: [...e.resultadosManos, resultadoDe(anotado, false, null)] };
}

function nuevaMano(
  base: Pick<EstadoJass, 'config' | 'puntos' | 'resultadosManos' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoJass {
  const { cartas, azar: sig } = barajar(BARAJA_JASS, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_EN_MANO,
      (k + 1) * CARTAS_EN_MANO,
    );
  }
  const elige = siguiente(repartidor);
  return {
    ...base,
    azar: sig,
    repartidor,
    fase: 'eleccion',
    elige,
    pasado: false,
    modo: null,
    manos,
    manosIniciales: manos,
    turno: elige,
    mesa: [],
    bazasGanadas: CERO,
    jugadasPor: [[], [], [], []],
    fallos: [[], [], [], []],
    weis: null,
    stock: null,
    puntosMano: CERO,
    porConcepto: { bazas: CERO, weis: CERO, stock: CERO },
  };
}

function resolverBaza(e: EstadoJass): EstadoJass {
  const modo = e.modo!;
  const ganador = ganadoraJass(e.mesa, modo).asiento;
  const pareja = parejaJass(ganador);
  const primera = e.bazasGanadas[0] + e.bazasGanadas[1] === 0;
  const salida = e.mesa[0]!.asiento;
  const cartas = e.mesa.reduce((s, j) => s + puntosCartaJass(j.carta, modo), 0);
  const bazasGanadas = sumar(e.bazasGanadas, pareja, 1);
  let r: EstadoJass = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazasGanadas,
  };
  const mult = MULTIPLICADOR_JASS[modo];
  if (primera) {
    const weis = mejorWeisJass(e.manosIniciales, salida, modo);
    r = { ...r, weis };
    if (weis) r = anotar(r, weis.pareja, weis.puntos * mult, 'weis');
    if (terminada(r)) return r;
  }
  const ultima = r.manos.every((m) => m.length === 0);
  const match = ultima && bazasGanadas[pareja] === CARTAS_EN_MANO ? pareja : null;
  const extra = (ultima ? PUNTOS_ULTIMA_JASS : 0) + (match !== null ? PUNTOS_MATCH_JASS : 0);
  r = anotar(r, pareja, (cartas + extra) * mult, 'bazas');
  if (terminada(r) || !ultima) return r;
  const cerrado: EstadoJass = {
    ...r,
    resultadosManos: [...r.resultadosManos, resultadoDe(r, true, match)],
  };
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** Si al jugar esta carta completa el Stöck: el Rey y la Dama del triunfo del reparto. */
function completaStock(e: EstadoJass, asiento: Asiento, carta: IdCarta): boolean {
  if (!esTriunfoJass(carta, e.modo) || ![12, 13].includes(valorDe(carta))) return false;
  const otra = `${e.modo}-${valorDe(carta) === 12 ? 13 : 12}` as IdCarta;
  return e.manosIniciales[asiento]!.includes(otra) && e.jugadasPor[asiento]!.includes(otra);
}

function jugar(e: EstadoJass, asiento: Asiento, carta: IdCarta): EstadoJass {
  const modo = e.modo!;
  const mesa = [...e.mesa, { asiento, carta }];
  const salida = paloJass(mesa[0]!.carta);
  const palo = paloJass(carta);
  // Qué dice la carta de su mano: echar otra que no es triunfo deja sin el palo de salida.
  const sinPalo = palo !== salida && !esTriunfoJass(carta, modo) ? salida : null;
  let r: EstadoJass = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
    mesa,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
    fallos:
      sinPalo !== null && !e.fallos[asiento]!.includes(sinPalo)
        ? e.fallos.map((f, a) => (a === asiento ? [...f, sinPalo] : f))
        : e.fallos,
  };
  if (completaStock(e, asiento, carta)) {
    r = anotar(
      { ...r, stock: asiento },
      parejaJass(asiento),
      PUNTOS_STOCK_JASS * MULTIPLICADOR_JASS[modo],
      'stock',
    );
    if (terminada(r)) return r;
  }
  return mesa.length < JUGADORES ? { ...r, turno: siguiente(asiento) } : resolverBaza(r);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const jass: Juego<ConfigJass, EstadoJass, AccionJass, VistaJass> = {
  id: 'jass',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Jass se juega con 4 jugadores');
    if (!Number.isInteger(config.meta) || config.meta < 1)
      return error('La meta debe ser positiva');
    return ok(
      nuevaMano(
        {
          config: { jugadores: 4, meta: config.meta },
          puntos: CERO,
          resultadosManos: [],
          ultimaBaza: null,
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'eleccion') {
      const elegir = MODOS_JASS.map((modo): AccionJass => ({ tipo: 'elegir', modo }));
      return e.pasado ? elegir : [...elegir, { tipo: 'pasar' }];
    }
    return cartasLegalesJass(e.manos[asiento]!, e.mesa, e.modo!)
      .sort()
      .map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pasar':
        return { ...e, pasado: true, turno: (e.elige + 2) % JUGADORES };
      case 'elegir':
        // Sale quien tenía la elección, aunque la haya pasado.
        return { ...e, fase: 'bazas', modo: accion.modo, turno: e.elige };
      case 'jugar':
        return jugar(e, asiento, accion.carta);
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      turno: terminada(e) ? null : e.turno,
      fase: e.fase,
      repartidor: e.repartidor,
      elige: e.elige,
      pasado: e.pasado,
      modo: e.modo,
      misWeis: asiento === null ? [] : weisJass(e.manosIniciales[asiento]!),
      weis: e.weis,
      stock: e.stock,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazasGanadas: e.bazasGanadas,
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      fallos: e.fallos.map((f) => [...f]),
      puntosMano: e.puntosMano,
      porConcepto: e.porConcepto,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const gana = e.puntos[0] >= e.config.meta ? 0 : 1;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaJass(a)]),
    };
  },
};
