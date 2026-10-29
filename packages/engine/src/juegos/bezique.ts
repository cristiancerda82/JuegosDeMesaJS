import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { quitarUna } from './spite-malice';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Bezique para dos, a un número de puntos. */
export interface ConfigBezique {
  readonly objetivo: number;
}

export const CONFIG_BEZIQUE_POR_DEFECTO: ConfigBezique = { objetivo: 1000 };

export const TIPOS_CANTE_BEZIQUE = [
  'matrimonio',
  'bezique',
  'dobleBezique',
  'cuatroJ',
  'cuatroQ',
  'cuatroK',
  'cuatroA',
  'escalera',
  'siete',
] as const;
export type TipoCanteBezique = (typeof TIPOS_CANTE_BEZIQUE)[number];

type DeDos<T> = readonly [T, T];

export type AccionBezique =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | {
      readonly tipo: 'cantar';
      readonly cante: TipoCanteBezique;
      readonly cartas: readonly IdCarta[];
    }
  | { readonly tipo: 'cambiar' }
  | { readonly tipo: 'pasar' };

export interface CanteBezique {
  readonly asiento: Asiento;
  /** `'cambio'` es el cambio del 7 de triunfo por la carta vuelta. */
  readonly cante: TipoCanteBezique | 'cambio';
  readonly cartas: readonly IdCarta[];
  readonly puntos: number;
}

export interface ResultadoManoBezique {
  readonly triunfo: PaloFrances;
  /** Puntos de cantes (y del 7) de cada jugador. */
  readonly cantes: DeDos<number>;
  readonly brisques: DeDos<number>;
  readonly ultimaBaza: Asiento;
  readonly puntosMano: DeDos<number>;
  readonly puntosTras: DeDos<number>;
}

/** Cartas ya usadas por un jugador en cada tipo de combinación. */
export type UsadasBezique = Readonly<Record<TipoCanteBezique, readonly IdCarta[]>>;

export interface EstadoBezique {
  readonly config: ConfigBezique;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly triunfo: PaloFrances;
  /** La carta vuelta, mientras siga en la mesa. */
  readonly vuelta: IdCarta | null;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Cartas de cada mano que están cantadas, boca arriba. */
  readonly cantadas: readonly (readonly IdCarta[])[];
  /** El siguiente que se roba es el último. */
  readonly mazo: readonly IdCarta[];
  readonly fase: 'bazas' | 'declarar' | 'final';
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly usadas: readonly UsadasBezique[];
  readonly cantes: readonly CanteBezique[];
  /** Cartas ganadas en bazas por cada jugador en la mano. */
  readonly ganadas: readonly (readonly IdCarta[])[];
  readonly puntosMano: DeDos<number>;
  readonly puntos: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoBezique[];
}

export interface VistaBezique {
  readonly config: ConfigBezique;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cantadas: readonly (readonly IdCarta[])[];
  readonly cartasEnMano: readonly number[];
  readonly enMazo: number;
  readonly vuelta: IdCarta | null;
  readonly triunfo: PaloFrances;
  readonly repartidor: Asiento;
  readonly fase: EstadoBezique['fase'];
  readonly turno: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoBezique['ultimaBaza'];
  readonly usadas: readonly UsadasBezique[];
  readonly cantes: readonly CanteBezique[];
  readonly ganadas: readonly (readonly IdCarta[])[];
  /** Cartas jugadas en las bazas de la mano (con la mesa). */
  readonly jugadas: readonly IdCarta[];
  readonly puntosMano: DeDos<number>;
  readonly puntos: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoBezique[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** Las 32 cartas de una baraja de piquet: del 7 al As de cada palo. */
const PIQUET = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

/** Dos barajas de piquet: 64 cartas, dos copias de cada una. */
export const BARAJA_BEZIQUE: readonly IdCarta[] = [...PIQUET, ...PIQUET];

export const paloBezique = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
export const valorBezique = (c: IdCarta) => cartaDeId(c)!.valor;

/** Rango para ganar bazas: A, 10, K, Q, J, 9, 8 y 7. */
export function rangoBezique(c: IdCarta): number {
  const v = valorBezique(c);
  if (v === 1) return 8;
  if (v === 10) return 7;
  if (v >= 11) return v - 7; // J 4, Q 5, K 6
  return v - 6; // 7 1, 8 2, 9 3
}

export const esBrisque = (c: IdCarta) => valorBezique(c) === 1 || valorBezique(c) === 10;

const id = (palo: PaloFrances, valor: number) => `${palo}-${valor}` as IdCarta;
const PALOS: readonly PaloFrances[] = ['picas', 'corazones', 'diamantes', 'treboles'];
const cuenta = (cs: readonly IdCarta[], c: IdCarta) => cs.filter((x) => x === c).length;

const PUNTOS_FIJOS: Record<Exclude<TipoCanteBezique, 'matrimonio'>, number> = {
  bezique: 40,
  dobleBezique: 500,
  cuatroJ: 40,
  cuatroQ: 60,
  cuatroK: 80,
  cuatroA: 100,
  escalera: 250,
  siete: 10,
};

export function puntosCanteBezique(
  cante: TipoCanteBezique,
  cartas: readonly IdCarta[],
  triunfo: PaloFrances,
): number {
  if (cante !== 'matrimonio') return PUNTOS_FIJOS[cante];
  return paloBezique(cartas[0]!) === triunfo ? 40 : 20;
}

/** Las cartas candidatas de cada combinación (una por tipo y palo). */
function candidatas(triunfo: PaloFrances): [TipoCanteBezique, IdCarta[]][] {
  const cuatro = (v: number) => PALOS.map((p) => id(p, v));
  const q = id('picas', 12);
  const j = id('diamantes', 11);
  return [
    ...PALOS.map((p): [TipoCanteBezique, IdCarta[]] => ['matrimonio', [id(p, 13), id(p, 12)]]),
    ['bezique', [q, j]],
    ['dobleBezique', [q, q, j, j]],
    ['cuatroJ', cuatro(11)],
    ['cuatroQ', cuatro(12)],
    ['cuatroK', cuatro(13)],
    ['cuatroA', cuatro(1)],
    ['escalera', [1, 10, 13, 12, 11].map((v) => id(triunfo, v))],
    ['siete', [id(triunfo, 7)]],
  ];
}

/** Las combinaciones que puede cantar `asiento` con su mano. */
export function cantesPosiblesBezique(
  e: Pick<EstadoBezique, 'manos' | 'cantadas' | 'usadas' | 'triunfo'>,
  asiento: Asiento,
): { cante: TipoCanteBezique; cartas: IdCarta[] }[] {
  const mano = e.manos[asiento]!;
  const expuestas = e.cantadas[asiento]!;
  const usadas = e.usadas[asiento]!;
  const reyT = id(e.triunfo, 13);
  const damaT = id(e.triunfo, 12);
  return candidatas(e.triunfo)
    .filter(([tipo, cartas]) => {
      const distintas = [...new Set(cartas)];
      const u = usadas[tipo];
      // Las copias están en la mano y no se han usado ya en ese tipo.
      if (distintas.some((c) => cuenta(u, c) + cuenta(cartas, c) > cuenta(mano, c))) return false;
      // Al menos una carta nueva: alguna copia más de las que ya estaban boca arriba.
      if (!distintas.some((c) => cuenta(u, c) + cuenta(cartas, c) > cuenta(expuestas, c))) {
        return false;
      }
      // El K y la Q de triunfo de una escalera no se casan después.
      if (tipo === 'matrimonio' && paloBezique(cartas[0]!) === e.triunfo) {
        const libres = (c: IdCarta) =>
          cuenta(mano, c) - cuenta(usadas.escalera, c) - cuenta(usadas.matrimonio, c);
        if (libres(reyT) < 1 || libres(damaT) < 1) return false;
      }
      return true;
    })
    .map(([cante, cartas]) => ({ cante, cartas: [...cartas].sort() }));
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const otro = (a: Asiento): Asiento => (a === 0 ? 1 : 0);
const CARTAS_EN_MANO = 8;
const sinUsadas = (): UsadasBezique => ({
  matrimonio: [],
  bezique: [],
  dobleBezique: [],
  cuatroJ: [],
  cuatroQ: [],
  cuatroK: [],
  cuatroA: [],
  escalera: [],
  siete: [],
});

/** La segunda carta gana: del palo de salida y más alta, o triunfo sobre otro palo. */
export function ganaSegundaBezique(
  primera: IdCarta,
  segunda: IdCarta,
  triunfo: PaloFrances,
): boolean {
  if (paloBezique(segunda) === paloBezique(primera)) {
    return rangoBezique(segunda) > rangoBezique(primera);
  }
  return paloBezique(segunda) === triunfo;
}

/** Cartas legales en las últimas bazas: seguir y superar, o fallar con triunfo. */
export function cartasLegalesFinalBezique(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
): IdCarta[] {
  const distintas = [...new Set(mano)];
  if (mesa.length === 0) return distintas;
  const salida = mesa[0]!.carta;
  const delPalo = distintas.filter((c) => paloBezique(c) === paloBezique(salida));
  if (delPalo.length > 0) {
    const superan = delPalo.filter((c) => rangoBezique(c) > rangoBezique(salida));
    return superan.length > 0 ? superan : delPalo;
  }
  const triunfos = distintas.filter((c) => paloBezique(c) === triunfo);
  return triunfos.length > 0 ? triunfos : distintas;
}

function nuevaMano(
  base: Pick<EstadoBezique, 'config' | 'puntos' | 'resultadosManos' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoBezique {
  const { cartas, azar: siguiente } = barajar(BARAJA_BEZIQUE, azar);
  const mano = otro(repartidor);
  const manos: IdCarta[][] = [[], []];
  manos[mano] = cartas.slice(0, CARTAS_EN_MANO);
  manos[repartidor] = cartas.slice(CARTAS_EN_MANO, 2 * CARTAS_EN_MANO);
  const vuelta = cartas[2 * CARTAS_EN_MANO]!;
  const puntosMano: [number, number] = [0, 0];
  if (valorBezique(vuelta) === 7) puntosMano[repartidor] = 10;
  return {
    ...base,
    azar: siguiente,
    repartidor,
    triunfo: paloBezique(vuelta),
    vuelta,
    manos,
    cantadas: [[], []],
    mazo: cartas.slice(2 * CARTAS_EN_MANO + 1),
    fase: 'bazas',
    turno: mano,
    mesa: [],
    usadas: [sinUsadas(), sinUsadas()],
    cantes: [],
    ganadas: [[], []],
    puntosMano,
  };
}

const terminada = (e: Pick<EstadoBezique, 'puntos' | 'config'>) =>
  Math.max(...e.puntos) >= e.config.objetivo && e.puntos[0] !== e.puntos[1];

/**
 * Quita una copia de `carta` de la mano de `asiento`. Si solo quedan copias cantadas, sale una
 * de ellas, y deja de contar como usada en las combinaciones que la tenían.
 */
function quitarDeMano(e: EstadoBezique, asiento: Asiento, carta: IdCarta): EstadoBezique {
  const mano = e.manos[asiento]!;
  const expuestas = e.cantadas[asiento]!;
  const oculta = cuenta(mano, carta) > cuenta(expuestas, carta);
  const nuevasExpuestas = oculta ? expuestas : quitarUna(expuestas, carta);
  const usadas = e.usadas[asiento]!;
  const ajustadas = Object.fromEntries(
    TIPOS_CANTE_BEZIQUE.map((t) => {
      const u = usadas[t];
      return [t, cuenta(u, carta) > cuenta(nuevasExpuestas, carta) ? quitarUna(u, carta) : u];
    }),
  ) as unknown as UsadasBezique;
  return {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? quitarUna(m, carta) : m)),
    cantadas: e.cantadas.map((x, a) => (a === asiento ? nuevasExpuestas : x)),
    usadas: e.usadas.map((u, a) => (a === asiento ? ajustadas : u)),
  };
}

/** Roban el ganador y después el otro; al acabarse el mazo, empiezan las últimas bazas. */
function robar(e: EstadoBezique): EstadoBezique {
  const ganador = e.turno;
  let mazo = e.mazo;
  let vuelta = e.vuelta;
  const manos = e.manos.map((m) => [...m]);
  for (const a of [ganador, otro(ganador)]) {
    if (mazo.length > 0) {
      manos[a]!.push(mazo.at(-1)!);
      mazo = mazo.slice(0, -1);
    } else if (vuelta !== null) {
      manos[a]!.push(vuelta);
      vuelta = null;
    }
  }
  const sinMazo = mazo.length === 0 && vuelta === null;
  return {
    ...e,
    manos,
    mazo,
    vuelta,
    fase: sinMazo ? 'final' : 'bazas',
    // En las últimas bazas, las cartas cantadas vuelven a la mano.
    cantadas: sinMazo ? [[], []] : e.cantadas,
  };
}

function cerrarMano(e: EstadoBezique): EstadoBezique {
  const ultima = e.ultimaBaza!.ganador;
  const brisques = e.ganadas.map((g) => 10 * g.filter(esBrisque).length) as [number, number];
  const cantes: [number, number] = [0, 0];
  for (const c of e.cantes) cantes[c.asiento as 0 | 1] += c.puntos;
  const puntosMano: [number, number] = [
    e.puntosMano[0] + brisques[0] + (ultima === 0 ? 10 : 0),
    e.puntosMano[1] + brisques[1] + (ultima === 1 ? 10 : 0),
  ];
  const puntos: DeDos<number> = [e.puntos[0] + puntosMano[0], e.puntos[1] + puntosMano[1]];
  const resultadosManos = [
    ...e.resultadosManos,
    { triunfo: e.triunfo, cantes, brisques, ultimaBaza: ultima, puntosMano, puntosTras: puntos },
  ];
  const cerrado: EstadoBezique = { ...e, puntosMano, puntos, resultadosManos };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, otro(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoBezique): EstadoBezique {
  const [primera, segunda] = e.mesa as [CartaJugada, CartaJugada];
  const ganador = ganaSegundaBezique(primera.carta, segunda.carta, e.triunfo)
    ? segunda.asiento
    : primera.asiento;
  const resuelto: EstadoBezique = {
    ...e,
    mesa: [],
    ultimaBaza: { cartas: e.mesa, ganador },
    turno: ganador,
    ganadas: e.ganadas.map((g, a) => (a === ganador ? [...g, primera.carta, segunda.carta] : g)),
  };
  if (e.fase === 'final') {
    return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
  }
  return { ...resuelto, fase: 'declarar' };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const bezique: Juego<ConfigBezique, EstadoBezique, AccionBezique, VistaBezique> = {
  id: 'bezique',

  crear(config, semilla) {
    if (!Number.isInteger(config.objetivo) || config.objetivo <= 0) {
      return error('El objetivo del Bezique tiene que ser un número de puntos');
    }
    return ok(
      nuevaMano(
        {
          config: { objetivo: config.objetivo },
          puntos: [0, 0],
          resultadosManos: [],
          ultimaBaza: null,
        },
        1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => 2,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    if (e.fase === 'declarar') {
      const r: AccionBezique[] = cantesPosiblesBezique(e, asiento).map(({ cante, cartas }) => ({
        tipo: 'cantar',
        cante,
        cartas,
      }));
      const siete = id(e.triunfo, 7);
      if (e.vuelta !== null && valorBezique(e.vuelta) !== 7 && mano.includes(siete)) {
        r.push({ tipo: 'cambiar' });
      }
      r.push({ tipo: 'pasar' });
      return r;
    }
    const cartas =
      e.fase === 'final' ? cartasLegalesFinalBezique(mano, e.mesa, e.triunfo) : [...new Set(mano)];
    return cartas.sort().map((carta): AccionBezique => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'jugar': {
        const quitado = quitarDeMano(e, asiento, accion.carta);
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        if (mesa.length < 2) return { ...quitado, mesa, turno: otro(asiento) };
        return resolverBaza({ ...quitado, mesa });
      }
      case 'cantar': {
        const puntos = puntosCanteBezique(accion.cante, accion.cartas, e.triunfo);
        const usadas = e.usadas[asiento]!;
        const u = [...usadas[accion.cante], ...accion.cartas];
        const expuestas = [...e.cantadas[asiento]!];
        for (const c of new Set(accion.cartas)) {
          for (let k = cuenta(expuestas, c); k < cuenta(u, c); k++) expuestas.push(c);
        }
        const puntosMano: [number, number] = [e.puntosMano[0], e.puntosMano[1]];
        puntosMano[asiento as 0 | 1] += puntos;
        return robar({
          ...e,
          usadas: e.usadas.map((x, a) => (a === asiento ? { ...usadas, [accion.cante]: u } : x)),
          cantadas: e.cantadas.map((x, a) => (a === asiento ? expuestas : x)),
          cantes: [...e.cantes, { asiento, cante: accion.cante, cartas: accion.cartas, puntos }],
          puntosMano,
        });
      }
      case 'cambiar': {
        const siete = id(e.triunfo, 7);
        const quitado = quitarDeMano(e, asiento, siete);
        const puntosMano: [number, number] = [e.puntosMano[0], e.puntosMano[1]];
        puntosMano[asiento as 0 | 1] += 10;
        return robar({
          ...quitado,
          manos: quitado.manos.map((m, a) => (a === asiento ? [...m, e.vuelta!] : m)),
          vuelta: siete,
          cantes: [...e.cantes, { asiento, cante: 'cambio', cartas: [siete], puntos: 10 }],
          puntosMano,
        });
      }
      case 'pasar':
        return robar(e);
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cantadas: e.cantadas.map((x) => [...x]),
      cartasEnMano: e.manos.map((m) => m.length),
      enMazo: e.mazo.length,
      vuelta: e.vuelta,
      triunfo: e.triunfo,
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      usadas: e.usadas,
      cantes: [...e.cantes],
      ganadas: e.ganadas.map((g) => [...g]),
      jugadas: [...e.ganadas.flat(), ...e.mesa.map((j) => j.carta)],
      puntosMano: e.puntosMano,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return { ganadores: [gana], empate: false, puntos: [...e.puntos] };
  },
};
