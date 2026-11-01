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

/** Five Hundred para 4 en parejas, a 500 (más bajo solo en las pruebas). */
export interface ConfigFiveHundred {
  readonly jugadores: 4;
  readonly meta: number;
}

export const META_FIVE_HUNDRED = 500;
export const CONFIG_FIVE_HUNDRED_POR_DEFECTO: ConfigFiveHundred = {
  jugadores: 4,
  meta: META_FIVE_HUNDRED,
};

export type ParejaFiveHundred = 0 | 1;
type DePareja<T> = readonly [T, T];

/** El palo de una puja de bazas, o sin triunfo. */
export type PaloPujaFiveHundred = PaloFrances | 'sin';

export type PujaFiveHundred =
  | { readonly tipo: 'bazas'; readonly bazas: number; readonly palo: PaloPujaFiveHundred }
  | { readonly tipo: 'misere' }
  | { readonly tipo: 'misereAbierto' };

/** Los palos de las pujas, de menos a más valor. */
export const PALOS_PUJA_FIVE_HUNDRED: readonly PaloPujaFiveHundred[] = [
  'picas',
  'treboles',
  'diamantes',
  'corazones',
  'sin',
];

export const COMODIN_FIVE_HUNDRED: IdCarta = 'comodin-1';

export type FaseFiveHundred = 'subasta' | 'descarte' | 'bazas';

export interface ResultadoManoFiveHundred {
  /** El contrato, o `null` si pasaron los cuatro. */
  readonly contrato: PujaFiveHundred | null;
  readonly juega: Asiento | null;
  readonly bazas: DePareja<number>;
  readonly cumple: boolean;
  readonly suma: DePareja<number>;
  readonly puntosTras: DePareja<number>;
}

export interface EstadoFiveHundred {
  readonly config: ConfigFiveHundred;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseFiveHundred;
  readonly turno: Asiento;
  /** La última puja de cada uno (`'paso'` si pasó, `null` si aún no ha dicho). */
  readonly pujas: readonly (PujaFiveHundred | 'paso' | null)[];
  readonly mejor: { readonly asiento: Asiento; readonly puja: PujaFiveHundred } | null;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly viuda: readonly IdCarta[];
  readonly descartes: readonly IdCarta[];
  readonly mesa: readonly CartaJugada[];
  /** El palo que nombra quien sale con el comodín sin triunfo. */
  readonly paloNombrado: PaloFrances | null;
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazasGanadas: DePareja<number>;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos (efectivos) de los que se sabe que cada uno no tiene. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly puntos: DePareja<number>;
  readonly ganadora: ParejaFiveHundred | null;
  readonly resultadosManos: readonly ResultadoManoFiveHundred[];
}

export type AccionFiveHundred =
  | { readonly tipo: 'pujar'; readonly puja: PujaFiveHundred }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta; readonly palo?: PaloFrances };

export interface VistaFiveHundred {
  readonly config: ConfigFiveHundred;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly misDescartes: readonly IdCarta[];
  readonly cartasEnMano: readonly number[];
  readonly enViuda: number;
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly fase: FaseFiveHundred;
  readonly pujas: EstadoFiveHundred['pujas'];
  readonly mejor: EstadoFiveHundred['mejor'];
  /** En el misère abierto, la mano de quien juega desde la primera carta. */
  readonly abiertas: readonly IdCarta[] | null;
  readonly mesa: readonly CartaJugada[];
  readonly paloNombrado: PaloFrances | null;
  readonly ultimaBaza: EstadoFiveHundred['ultimaBaza'];
  readonly bazasGanadas: DePareja<number>;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoFiveHundred[];
}

// ── Pujas ────────────────────────────────────────────────────────────────────

/** Valor de una puja en la tabla de Avondale. */
export function valorPujaFiveHundred(p: PujaFiveHundred): number {
  if (p.tipo === 'misere') return 250;
  if (p.tipo === 'misereAbierto') return 500;
  return 40 + 100 * (p.bazas - 6) + 20 * PALOS_PUJA_FIVE_HUNDRED.indexOf(p.palo);
}

/** Para comparar pujas: el misère va tras 8 picas y el abierto tras 10 diamantes. */
export function ordenPujaFiveHundred(p: PujaFiveHundred): number {
  if (p.tipo === 'misere') return 2405;
  if (p.tipo === 'misereAbierto') return 4805;
  return valorPujaFiveHundred(p) * 10;
}

export const TODAS_LAS_PUJAS_FIVE_HUNDRED: readonly PujaFiveHundred[] = [
  ...[6, 7, 8, 9, 10].flatMap((bazas) =>
    PALOS_PUJA_FIVE_HUNDRED.map((palo): PujaFiveHundred => ({ tipo: 'bazas', bazas, palo })),
  ),
  { tipo: 'misere' } as const,
  { tipo: 'misereAbierto' } as const,
].sort((a, b) => ordenPujaFiveHundred(a) - ordenPujaFiveHundred(b));

export const esMisere = (p: PujaFiveHundred | null) =>
  p !== null && (p.tipo === 'misere' || p.tipo === 'misereAbierto');

/** El palo de triunfo de un contrato, o `null` sin triunfo y en el misère. */
export const triunfoDe = (p: PujaFiveHundred | null): PaloFrances | null =>
  p !== null && p.tipo === 'bazas' && p.palo !== 'sin' ? p.palo : null;

// ── Cartas ───────────────────────────────────────────────────────────────────

/** 43 cartas: del 5 al As de cada palo, los cuatros rojos y el comodín. */
export const BARAJA_FIVE_HUNDRED: readonly IdCarta[] = [
  ...crearBaraja('francesa52').filter((c) => {
    const { palo, valor } = cartaDeId(c)!;
    return (
      valor === 1 || valor >= 5 || (valor === 4 && (palo === 'corazones' || palo === 'diamantes'))
    );
  }),
  COMODIN_FIVE_HUNDRED,
];

const MISMO_COLOR: Readonly<Record<PaloFrances, PaloFrances>> = {
  picas: 'treboles',
  treboles: 'picas',
  corazones: 'diamantes',
  diamantes: 'corazones',
};

const esComodin = (c: IdCarta) => c === COMODIN_FIVE_HUNDRED;
const natural = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};

/** El palo de una carta en un contrato: la otra Jota del color es del triunfo; el comodín, también. */
export function paloEfectivo(c: IdCarta, triunfo: PaloFrances | null): PaloFrances | null {
  if (esComodin(c)) return triunfo;
  const { palo, valor } = cartaDeId(c)!;
  if (triunfo !== null && valor === 11 && palo === MISMO_COLOR[triunfo]) return triunfo;
  return palo as PaloFrances;
}

/** Rango dentro de su palo efectivo: comodín 100, Jota del triunfo 90, la otra Jota 80. */
export function rangoFiveHundred(c: IdCarta, triunfo: PaloFrances | null): number {
  if (esComodin(c)) return 100;
  const { palo, valor } = cartaDeId(c)!;
  if (triunfo !== null && valor === 11) {
    if (palo === triunfo) return 90;
    if (palo === MISMO_COLOR[triunfo]) return 80;
  }
  return natural(c);
}

/** El palo de salida de la baza en curso. */
function salidaDe(
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
  nombrado: PaloFrances | null,
): PaloFrances | null {
  if (mesa.length === 0) return null;
  const primera = mesa[0]!.carta;
  return esComodin(primera) && triunfo === null ? nombrado : paloEfectivo(primera, triunfo);
}

/** La carta que gana la baza: el comodín, el triunfo más alto o la más alta del palo de salida. */
export function ganadoraFiveHundred(
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
  nombrado: PaloFrances | null,
): CartaJugada {
  const salida = salidaDe(mesa, triunfo, nombrado);
  const valor = (c: IdCarta) => {
    if (esComodin(c)) return 1000;
    const p = paloEfectivo(c, triunfo);
    if (triunfo !== null && p === triunfo) return 500 + rangoFiveHundred(c, triunfo);
    return p === salida ? rangoFiveHundred(c, triunfo) : 0;
  };
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar: las del palo de salida (efectivo) si tiene. */
export function cartasLegalesFiveHundred(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
  nombrado: PaloFrances | null,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = salidaDe(mesa, triunfo, nombrado);
  const delPalo = mano.filter((c) => paloEfectivo(c, triunfo) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

// ── Mano ─────────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 10;
const BAZAS = 10;

export const parejaFiveHundred = (a: Asiento): ParejaFiveHundred => (a % 2) as ParejaFiveHundred;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
const CERO: DePareja<number> = [0, 0];

const terminada = (e: Pick<EstadoFiveHundred, 'ganadora'>) => e.ganadora !== null;

function nuevaMano(
  base: Pick<
    EstadoFiveHundred,
    'config' | 'puntos' | 'resultadosManos' | 'ultimaBaza' | 'ganadora'
  >,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoFiveHundred {
  const { cartas, azar: sig } = barajar(BARAJA_FIVE_HUNDRED, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_EN_MANO,
      (k + 1) * CARTAS_EN_MANO,
    );
  }
  return {
    ...base,
    azar: sig,
    repartidor,
    fase: 'subasta',
    turno: siguiente(repartidor),
    pujas: [null, null, null, null],
    mejor: null,
    manos,
    viuda: cartas.slice(JUGADORES * CARTAS_EN_MANO),
    descartes: [],
    mesa: [],
    paloNombrado: null,
    bazasGanadas: CERO,
    jugadasPor: [[], [], [], []],
    fallos: [[], [], [], []],
  };
}

/** Quién juega en las bazas: en el misère, el compañero de quien juega no juega. */
const juegaEnBazas = (e: EstadoFiveHundred, a: Asiento) =>
  !(esMisere(e.mejor?.puja ?? null) && a === (e.mejor!.asiento + 2) % JUGADORES);

function siguienteEnBazas(e: EstadoFiveHundred, a: Asiento): Asiento {
  let s = siguiente(a);
  while (!juegaEnBazas(e, s)) s = siguiente(s);
  return s;
}

function cerrarMano(e: EstadoFiveHundred): EstadoFiveHundred {
  const { asiento, puja } = e.mejor!;
  const p = parejaFiveHundred(asiento);
  const o = (1 - p) as ParejaFiveHundred;
  const valor = valorPujaFiveHundred(puja);
  const hechas = e.bazasGanadas[p];
  let cumple: boolean;
  let sumaP: number;
  let sumaO = 0;
  if (puja.tipo === 'bazas') {
    cumple = hechas >= puja.bazas;
    sumaP = cumple ? (hechas === BAZAS && valor < 250 ? 250 : valor) : -valor;
    // Los rivales no pasan de 490 (meta − 10) con sus bazas.
    const tope = Math.max(e.puntos[o], e.config.meta - 10);
    sumaO = Math.min(e.puntos[o] + 10 * e.bazasGanadas[o], tope) - e.puntos[o];
  } else {
    cumple = hechas === 0;
    sumaP = cumple ? valor : -valor;
  }
  const suma: [number, number] = p === 0 ? [sumaP, sumaO] : [sumaO, sumaP];
  const puntos: DePareja<number> = [e.puntos[0] + suma[0], e.puntos[1] + suma[1]];
  const ganadora: ParejaFiveHundred | null =
    puntos[p] <= -e.config.meta
      ? o
      : puntos[o] <= -e.config.meta
        ? p
        : cumple && puntos[p] >= e.config.meta
          ? p
          : null;
  const cerrado: EstadoFiveHundred = {
    ...e,
    puntos,
    ganadora,
    resultadosManos: [
      ...e.resultadosManos,
      { contrato: puja, juega: asiento, bazas: e.bazasGanadas, cumple, suma, puntosTras: puntos },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

function pujar(
  e: EstadoFiveHundred,
  asiento: Asiento,
  puja: PujaFiveHundred | 'paso',
): EstadoFiveHundred {
  const pujas = e.pujas.map((p, a) => (a === asiento ? puja : p));
  const mejor = puja === 'paso' ? e.mejor : { asiento, puja };
  const pasados = pujas.filter((p) => p === 'paso').length;
  if (pasados === JUGADORES) {
    // Nadie puja: otra mano sin anotar nada.
    const sinContrato: EstadoFiveHundred = {
      ...e,
      pujas,
      resultadosManos: [
        ...e.resultadosManos,
        {
          contrato: null,
          juega: null,
          bazas: CERO,
          cumple: false,
          suma: CERO,
          puntosTras: e.puntos,
        },
      ],
    };
    return nuevaMano(sinContrato, siguiente(e.repartidor), e.azar);
  }
  if (mejor !== null && pasados === JUGADORES - 1) {
    const manos = e.manos.map((m, a) => (a === mejor.asiento ? [...m, ...e.viuda] : m));
    return { ...e, pujas, mejor, manos, viuda: [], fase: 'descarte', turno: mejor.asiento };
  }
  let turno = siguiente(asiento);
  while (pujas[turno] === 'paso') turno = siguiente(turno);
  return { ...e, pujas, mejor, turno };
}

function resolverBaza(e: EstadoFiveHundred): EstadoFiveHundred {
  const triunfo = triunfoDe(e.mejor!.puja);
  const ganador = ganadoraFiveHundred(e.mesa, triunfo, e.paloNombrado).asiento;
  const pareja = parejaFiveHundred(ganador);
  const bazasGanadas: DePareja<number> =
    pareja === 0
      ? [e.bazasGanadas[0] + 1, e.bazasGanadas[1]]
      : [e.bazasGanadas[0], e.bazasGanadas[1] + 1];
  const resuelto: EstadoFiveHundred = {
    ...e,
    mesa: [],
    paloNombrado: null,
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazasGanadas,
  };
  const pierdeMisere = esMisere(e.mejor!.puja) && ganador === e.mejor!.asiento;
  const sinCartas = resuelto.manos.every((m, a) => !juegaEnBazas(e, a) || m.length === 0);
  return pierdeMisere || sinCartas ? cerrarMano(resuelto) : resuelto;
}

function jugar(
  e: EstadoFiveHundred,
  asiento: Asiento,
  carta: IdCarta,
  palo: PaloFrances | undefined,
): EstadoFiveHundred {
  const triunfo = triunfoDe(e.mejor!.puja);
  const nombrado = e.mesa.length === 0 ? (palo ?? null) : e.paloNombrado;
  const mesa = [...e.mesa, { asiento, carta }];
  const salida = salidaDe(mesa, triunfo, nombrado);
  const sinPalo = mesa.length > 1 && salida !== null && paloEfectivo(carta, triunfo) !== salida;
  const jugado: EstadoFiveHundred = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
    mesa,
    paloNombrado: nombrado,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
    fallos:
      sinPalo && !e.fallos[asiento]!.includes(salida)
        ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f))
        : e.fallos,
  };
  const enBaza = esMisere(e.mejor!.puja) ? JUGADORES - 1 : JUGADORES;
  return mesa.length < enBaza
    ? { ...jugado, turno: siguienteEnBazas(e, asiento) }
    : resolverBaza(jugado);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const fiveHundred: Juego<
  ConfigFiveHundred,
  EstadoFiveHundred,
  AccionFiveHundred,
  VistaFiveHundred
> = {
  id: 'fiveHundred',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Five Hundred se juega con 4 jugadores');
    if (!Number.isInteger(config.meta) || config.meta < 20)
      return error('La meta debe ser de 20 o más');
    return ok(
      nuevaMano(
        {
          config: { jugadores: 4, meta: config.meta },
          puntos: CERO,
          resultadosManos: [],
          ultimaBaza: null,
          ganadora: null,
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'subasta': {
        const minimo = e.mejor === null ? -1 : ordenPujaFiveHundred(e.mejor.puja);
        return [
          ...TODAS_LAS_PUJAS_FIVE_HUNDRED.filter((p) => ordenPujaFiveHundred(p) > minimo).map(
            (puja): AccionFiveHundred => ({ tipo: 'pujar', puja }),
          ),
          { tipo: 'pasar' },
        ];
      }
      case 'descarte':
        return [...e.manos[asiento]!].sort().map((carta) => ({ tipo: 'descartar', carta }));
      case 'bazas': {
        const triunfo = triunfoDe(e.mejor!.puja);
        const cartas = cartasLegalesFiveHundred(
          e.manos[asiento]!,
          e.mesa,
          triunfo,
          e.paloNombrado,
        ).sort();
        return cartas.flatMap((carta): AccionFiveHundred[] =>
          esComodin(carta) && e.mesa.length === 0 && triunfo === null
            ? PALOS_FRANCESES.map((palo) => ({ tipo: 'jugar', carta, palo }))
            : [{ tipo: 'jugar', carta }],
        );
      }
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pujar':
        return pujar(e, asiento, accion.puja);
      case 'pasar':
        return pujar(e, asiento, 'paso');
      case 'descartar': {
        const descartes = [...e.descartes, accion.carta];
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        return descartes.length < 3
          ? { ...e, manos, descartes }
          : { ...e, manos, descartes, fase: 'bazas', turno: asiento };
      }
      case 'jugar':
        return jugar(e, asiento, accion.carta, accion.palo);
    }
  },

  vistaDe(e, asiento) {
    const juega = e.mejor?.asiento ?? null;
    const abierto =
      e.fase === 'bazas' &&
      e.mejor?.puja.tipo === 'misereAbierto' &&
      e.jugadasPor.some((j) => j.length > 0);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      misDescartes: asiento !== null && asiento === juega ? [...e.descartes] : [],
      cartasEnMano: e.manos.map((m) => m.length),
      enViuda: e.viuda.length,
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      fase: e.fase,
      pujas: [...e.pujas],
      mejor: e.mejor,
      abiertas: abierto ? [...e.manos[juega!]!] : null,
      mesa: [...e.mesa],
      paloNombrado: e.paloNombrado,
      ultimaBaza: e.ultimaBaza,
      bazasGanadas: e.bazasGanadas,
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      fallos: e.fallos.map((f) => [...f]),
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const gana = e.ganadora!;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaFiveHundred(a)]),
    };
  },
};
