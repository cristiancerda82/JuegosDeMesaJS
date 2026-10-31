import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Piquet para dos: un rubber de `manos` manos. */
export interface ConfigPiquet {
  readonly manos: number;
}

export const CONFIG_PIQUET_POR_DEFECTO: ConfigPiquet = { manos: 6 };

type DeDos<T> = readonly [T, T];

export type AccionPiquet =
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export type TipoDeclaracionPiquet = 'punto' | 'secuencia' | 'conjunto';

/** Lo que anota quien gana una declaración (o `ganador` `null` si nadie la gana). */
export interface DeclaracionPiquet {
  readonly ganador: Asiento | null;
  /** Las cartas que se enseñan: el palo del punto, las secuencias o los conjuntos. */
  readonly cartas: readonly IdCarta[];
  readonly puntos: number;
  /** El largo del punto o de la mejor secuencia, o el tamaño del mejor conjunto. */
  readonly largo: number;
}

export type DeclaracionesPiquet = Readonly<Record<TipoDeclaracionPiquet, DeclaracionPiquet>>;

export interface ResultadoManoPiquet {
  readonly mayor: Asiento;
  readonly declaraciones: DeclaracionesPiquet;
  /** Puntos de declaraciones de cada uno. */
  readonly porDeclaraciones: DeDos<number>;
  readonly repique: Asiento | null;
  readonly pique: Asiento | null;
  readonly bazas: DeDos<number>;
  /** Quien gana las cartas (más bazas), o `null` con 6 y 6. */
  readonly cartas: Asiento | null;
  readonly capote: boolean;
  readonly puntosMano: DeDos<number>;
  readonly puntosTras: DeDos<number>;
}

export interface EstadoPiquet {
  readonly config: ConfigPiquet;
  readonly azar: EstadoAzar;
  readonly mayor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** El siguiente que se roba es el primero. */
  readonly monton: readonly IdCarta[];
  readonly descartes: readonly (readonly IdCarta[])[];
  /** Cuántas cartas ha cambiado cada uno (`null` mientras no ha robado). */
  readonly cambiadas: readonly (number | null)[];
  readonly fase: 'cambio' | 'bazas';
  readonly turno: Asiento;
  readonly declaraciones: DeclaracionesPiquet | null;
  readonly porDeclaraciones: DeDos<number>;
  readonly repique: Asiento | null;
  readonly pique: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Cartas jugadas en las bazas de la mano. */
  readonly jugadas: readonly CartaJugada[];
  readonly bazas: DeDos<number>;
  readonly puntosMano: DeDos<number>;
  readonly puntos: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoPiquet[];
}

export interface VistaPiquet {
  readonly config: ConfigPiquet;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly misDescartes: readonly IdCarta[];
  readonly cartasEnMano: readonly number[];
  readonly enDescarte: readonly number[];
  readonly enMonton: number;
  readonly cambiadas: readonly (number | null)[];
  readonly mayor: Asiento;
  readonly fase: EstadoPiquet['fase'];
  readonly turno: Asiento | null;
  readonly declaraciones: DeclaracionesPiquet | null;
  readonly porDeclaraciones: DeDos<number>;
  readonly repique: Asiento | null;
  readonly pique: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoPiquet['ultimaBaza'];
  readonly jugadas: readonly CartaJugada[];
  readonly bazas: DeDos<number>;
  readonly puntosMano: DeDos<number>;
  readonly puntos: DeDos<number>;
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoPiquet[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** 32 cartas francesas, del 7 al As. */
export const BARAJA_PIQUET: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

export const paloPiquet = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** Rango: A 14, K 13, Q 12, J 11 y el resto su número. */
export const rangoPiquet = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
/** Valor para el punto: el As 11, las figuras 10 y el resto su número. */
export const valorPuntoPiquet = (c: IdCarta) => {
  const r = rangoPiquet(c);
  return r === 14 ? 11 : Math.min(r, 10);
};

const PALOS: readonly PaloFrances[] = ['picas', 'corazones', 'diamantes', 'treboles'];

// ── Declaraciones ────────────────────────────────────────────────────────────

/** El mejor punto de una mano: [largo, valor, cartas]. */
function puntoDe(mano: readonly IdCarta[]): [number, number, IdCarta[]] {
  let mejor: [number, number, IdCarta[]] = [0, 0, []];
  for (const p of PALOS) {
    const cs = mano.filter((c) => paloPiquet(c) === p);
    const v = cs.reduce((s, c) => s + valorPuntoPiquet(c), 0);
    if (cs.length > mejor[0] || (cs.length === mejor[0] && v > mejor[1]))
      mejor = [cs.length, v, cs];
  }
  return mejor;
}

/** Todas las secuencias (tramos máximos de 3 o más) de una mano, de mejor a peor. */
export function secuenciasPiquet(mano: readonly IdCarta[]): IdCarta[][] {
  const r: IdCarta[][] = [];
  for (const p of PALOS) {
    const cs = mano
      .filter((c) => paloPiquet(c) === p)
      .sort((a, b) => rangoPiquet(a) - rangoPiquet(b));
    let tramo: IdCarta[] = [];
    for (const c of cs) {
      if (tramo.length > 0 && rangoPiquet(c) === rangoPiquet(tramo.at(-1)!) + 1) tramo.push(c);
      else {
        if (tramo.length >= 3) r.push(tramo);
        tramo = [c];
      }
    }
    if (tramo.length >= 3) r.push(tramo);
  }
  const alta = (s: readonly IdCarta[]) => rangoPiquet(s.at(-1)!);
  return r.sort((a, b) => b.length - a.length || alta(b) - alta(a));
}

/** Todos los conjuntos (3 o 4 iguales del 10 al As) de una mano, de mejor a peor. */
export function conjuntosPiquet(mano: readonly IdCarta[]): IdCarta[][] {
  const r: IdCarta[][] = [];
  for (let rango = 10; rango <= 14; rango++) {
    const cs = mano.filter((c) => rangoPiquet(c) === rango);
    if (cs.length >= 3) r.push(cs);
  }
  return r.sort((a, b) => b.length - a.length || rangoPiquet(b[0]!) - rangoPiquet(a[0]!));
}

export const puntosSecuenciaPiquet = (largo: number) => (largo >= 5 ? largo + 10 : largo);
export const puntosConjuntoPiquet = (largo: number) => (largo === 4 ? 14 : 3);

/** Quién gana de los dos según su clave (mayor es mejor); `null` con empate. */
function comparar(a: readonly number[], b: readonly number[]): 0 | 1 | null {
  for (let i = 0; i < a.length; i++) {
    if (a[i]! > b[i]!) return 0;
    if (a[i]! < b[i]!) return 1;
  }
  return null;
}

/** Compara las dos manos en las tres declaraciones. */
export function declararPiquet(manos: readonly (readonly IdCarta[])[]): DeclaracionesPiquet {
  const nadie: DeclaracionPiquet = { ganador: null, cartas: [], puntos: 0, largo: 0 };
  const puntos = manos.map(puntoDe);
  const gPunto = comparar(puntos[0]!.slice(0, 2) as number[], puntos[1]!.slice(0, 2) as number[]);
  const punto: DeclaracionPiquet =
    gPunto === null || puntos[gPunto]![0] === 0
      ? nadie
      : {
          ganador: gPunto,
          cartas: puntos[gPunto]![2],
          puntos: puntos[gPunto]![0],
          largo: puntos[gPunto]![0],
        };

  const secuencias = manos.map(secuenciasPiquet);
  const claveSec = (s: IdCarta[][]) =>
    s.length === 0 ? [0, 0] : [s[0]!.length, rangoPiquet(s[0]!.at(-1)!)];
  const gSec = comparar(claveSec(secuencias[0]!), claveSec(secuencias[1]!));
  const secuencia: DeclaracionPiquet =
    gSec === null || secuencias[gSec]!.length === 0
      ? nadie
      : {
          ganador: gSec,
          cartas: secuencias[gSec]!.flat(),
          puntos: secuencias[gSec]!.reduce((s, x) => s + puntosSecuenciaPiquet(x.length), 0),
          largo: secuencias[gSec]![0]!.length,
        };

  const conjuntos = manos.map(conjuntosPiquet);
  const claveCon = (s: IdCarta[][]) =>
    s.length === 0 ? [0, 0] : [s[0]!.length, rangoPiquet(s[0]![0]!)];
  const gCon = comparar(claveCon(conjuntos[0]!), claveCon(conjuntos[1]!));
  const conjunto: DeclaracionPiquet =
    gCon === null || conjuntos[gCon]!.length === 0
      ? nadie
      : {
          ganador: gCon,
          cartas: conjuntos[gCon]!.flat(),
          puntos: conjuntos[gCon]!.reduce((s, x) => s + puntosConjuntoPiquet(x.length), 0),
          largo: conjuntos[gCon]![0]!.length,
        };
  return { punto, secuencia, conjunto };
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const otro = (a: Asiento): Asiento => (a === 0 ? 1 : 0);
const CARTAS_EN_MANO = 12;
const MAXIMO_MAYOR = 5;

const terminada = (e: Pick<EstadoPiquet, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= e.config.manos;

/** Lo que vale la partida para el ganador: 100 más la diferencia, o más la suma si no llega a 100. */
export function valorPartidaPiquet(puntos: DeDos<number>): number {
  const [ganador, perdedor] = puntos[0] >= puntos[1] ? puntos : [puntos[1], puntos[0]];
  return perdedor >= 100 ? 100 + ganador - perdedor : 100 + ganador + perdedor;
}

/** Cartas que se pueden jugar: las del palo de salida si tiene. */
export function cartasLegalesPiquet(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const palo = paloPiquet(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloPiquet(c) === palo);
  return delPalo.length > 0 ? delPalo : [...mano];
}

/** Gana la segunda carta si es del palo de salida y más alta. */
export const ganaSegundaPiquet = (primera: IdCarta, segunda: IdCarta) =>
  paloPiquet(segunda) === paloPiquet(primera) && rangoPiquet(segunda) > rangoPiquet(primera);

function nuevaMano(
  base: Pick<EstadoPiquet, 'config' | 'puntos' | 'resultadosManos' | 'ultimaBaza'>,
  mayor: Asiento,
  azar: EstadoAzar,
): EstadoPiquet {
  const { cartas, azar: sig } = barajar(BARAJA_PIQUET, azar);
  return {
    ...base,
    azar: sig,
    mayor,
    manos: [cartas.slice(0, CARTAS_EN_MANO), cartas.slice(CARTAS_EN_MANO, 2 * CARTAS_EN_MANO)],
    monton: cartas.slice(2 * CARTAS_EN_MANO),
    descartes: [[], []],
    cambiadas: [null, null],
    fase: 'cambio',
    turno: mayor,
    declaraciones: null,
    porDeclaraciones: [0, 0],
    repique: null,
    pique: null,
    mesa: [],
    jugadas: [],
    bazas: [0, 0],
    puntosMano: [0, 0],
  };
}

/** Suma puntos a un jugador en la mano, con el pique si toca. */
function anotar(e: EstadoPiquet, a: Asiento, n: number): EstadoPiquet {
  if (n === 0) return e;
  const p: [number, number] = [e.puntosMano[0], e.puntosMano[1]];
  p[a as 0 | 1] += n;
  let pique = e.pique;
  const menor = otro(e.mayor);
  if (
    pique === null &&
    e.repique === null &&
    a === e.mayor &&
    p[menor as 0 | 1] === 0 &&
    p[a as 0 | 1] >= 30
  ) {
    pique = a;
    p[a as 0 | 1] += 30;
  }
  return { ...e, puntosMano: p, pique };
}

/** Tras el cambio: las declaraciones (primero el mayor) y el repique. */
function declarar(e: EstadoPiquet): EstadoPiquet {
  const declaraciones = declararPiquet(e.manos);
  const porDecl: [number, number] = [0, 0];
  for (const d of Object.values(declaraciones)) {
    if (d.ganador !== null) porDecl[d.ganador as 0 | 1] += d.puntos;
  }
  const repique = ([e.mayor, otro(e.mayor)] as const).find(
    (a) => porDecl[a as 0 | 1] >= 30 && porDecl[otro(a) as 0 | 1] === 0,
  );
  const puntosMano: [number, number] = [porDecl[0], porDecl[1]];
  if (repique !== undefined) puntosMano[repique as 0 | 1] += 60;
  return {
    ...e,
    fase: 'bazas',
    turno: e.mayor,
    declaraciones,
    porDeclaraciones: porDecl,
    repique: repique ?? null,
    puntosMano,
  };
}

function cerrarMano(e: EstadoPiquet): EstadoPiquet {
  const [b0, b1] = e.bazas;
  const cartas: Asiento | null = b0 > b1 ? 0 : b1 > b0 ? 1 : null;
  const capote = b0 === CARTAS_EN_MANO || b1 === CARTAS_EN_MANO;
  const conCartas = cartas === null ? e : anotar(e, cartas, capote ? 40 : 10);
  const puntosMano = conCartas.puntosMano;
  const puntos: DeDos<number> = [e.puntos[0] + puntosMano[0], e.puntos[1] + puntosMano[1]];
  const resultado: ResultadoManoPiquet = {
    mayor: e.mayor,
    declaraciones: e.declaraciones!,
    porDeclaraciones: e.porDeclaraciones,
    repique: e.repique,
    pique: conCartas.pique,
    bazas: e.bazas,
    cartas,
    capote,
    puntosMano,
    puntosTras: puntos,
  };
  const cerrado: EstadoPiquet = {
    ...conCartas,
    puntos,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, otro(e.mayor), e.azar);
}

function resolverBaza(e: EstadoPiquet): EstadoPiquet {
  const [primera, segunda] = e.mesa as [CartaJugada, CartaJugada];
  const ganador = ganaSegundaPiquet(primera.carta, segunda.carta)
    ? segunda.asiento
    : primera.asiento;
  const bazas: [number, number] = [e.bazas[0], e.bazas[1]];
  bazas[ganador as 0 | 1]++;
  let r: EstadoPiquet = {
    ...e,
    mesa: [],
    ultimaBaza: { cartas: e.mesa, ganador },
    jugadas: [...e.jugadas, ...e.mesa],
    bazas,
    turno: ganador,
  };
  const ultima = r.manos.every((m) => m.length === 0);
  // 1 por ganar la salida del otro; 1 más por la última baza.
  r = anotar(r, ganador, (ganador !== primera.asiento ? 1 : 0) + (ultima ? 1 : 0));
  return ultima ? cerrarMano(r) : r;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const piquet: Juego<ConfigPiquet, EstadoPiquet, AccionPiquet, VistaPiquet> = {
  id: 'piquet',

  crear(config, semilla) {
    if (!Number.isInteger(config.manos) || config.manos <= 0) {
      return error('El número de manos del Piquet tiene que ser un entero positivo');
    }
    return ok(
      nuevaMano(
        { config: { manos: config.manos }, puntos: [0, 0], resultadosManos: [], ultimaBaza: null },
        0,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => 2,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    if (e.fase === 'cambio') {
      const descartadas = e.descartes[asiento]!.length;
      const esMayor = asiento === e.mayor;
      const maximo = esMayor ? MAXIMO_MAYOR : e.monton.length;
      const r: AccionPiquet[] = [];
      if (!esMayor || descartadas > 0) r.push({ tipo: 'robar' });
      if (descartadas < maximo) {
        for (const carta of [...mano].sort()) r.push({ tipo: 'descartar', carta });
      }
      return r;
    }
    return cartasLegalesPiquet(mano, e.mesa)
      .sort()
      .map((carta): AccionPiquet => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'descartar':
        return {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          descartes: e.descartes.map((d, a) => (a === asiento ? [...d, accion.carta] : d)),
        };
      case 'robar': {
        const k = e.descartes[asiento]!.length;
        const r: EstadoPiquet = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, ...e.monton.slice(0, k)] : m)),
          monton: e.monton.slice(k),
          cambiadas: e.cambiadas.map((c, a) => (a === asiento ? k : c)),
          turno: otro(asiento),
        };
        return asiento === e.mayor ? r : declarar(r);
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        if (mesa.length === 1) {
          // 1 por salir.
          return anotar({ ...e, manos, mesa, turno: otro(asiento) }, asiento, 1);
        }
        return resolverBaza({ ...e, manos, mesa });
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      misDescartes: asiento === null ? [] : [...e.descartes[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      enDescarte: e.descartes.map((d) => d.length),
      enMonton: e.monton.length,
      cambiadas: [...e.cambiadas],
      mayor: e.mayor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      declaraciones: e.declaraciones,
      porDeclaraciones: e.porDeclaraciones,
      repique: e.repique,
      pique: e.pique,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadas: [...e.jugadas],
      bazas: e.bazas,
      puntosMano: e.puntosMano,
      puntos: e.puntos,
      manoNumero: Math.min(e.resultadosManos.length + 1, e.config.manos),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    if (e.puntos[0] === e.puntos[1])
      return { ganadores: [0, 1], empate: true, puntos: [...e.puntos] };
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return { ganadores: [gana], empate: false, puntos: [...e.puntos] };
  },
};
