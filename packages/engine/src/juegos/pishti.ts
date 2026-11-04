import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import { bandoDe, siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigPishti {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Puntos para ganar: 151 (más bajo solo en las pruebas). */
  readonly meta: number;
}

export const META_PISHTI = 151;
export const CONFIG_PISHTI_POR_DEFECTO: ConfigPishti = { jugadores: 2, meta: META_PISHTI };

export const BARAJA_PISHTI: readonly IdCarta[] = crearBaraja('francesa52');

export interface JugadaPishti {
  readonly asiento: Asiento;
  readonly carta: IdCarta;
  /** Cartas a la vista del montón que se llevó; vacío si la carta se quedó arriba. */
  readonly llevadas: readonly IdCarta[];
  /** Cuántas cartas tapadas se llevó con el montón. */
  readonly tapadas: number;
  /** Puntos del pishti: 0 si no lo hubo, 10, o 20 con dos J. */
  readonly pishti: 0 | 10 | 20;
}

export interface PishtisBando {
  readonly cuantos: number;
  readonly puntos: number;
}

/** Lo que reunió un bando en la mano. */
export interface RecuentoPishti {
  readonly cartas: number;
  readonly ases: number;
  readonly jotas: number;
  readonly dosTreboles: boolean;
  readonly diezDiamantes: boolean;
  readonly pishtis: number;
}

/** Puntos de un bando en la mano, concepto por concepto. */
export interface PuntosPishti {
  readonly cartas: 0 | 3;
  readonly asesYJotas: number;
  readonly dosTreboles: 0 | 2;
  readonly diezDiamantes: 0 | 3;
  readonly pishtis: number;
  readonly total: number;
}

export interface ResultadoManoPishti {
  readonly recuento: readonly [RecuentoPishti, RecuentoPishti];
  readonly puntos: readonly [PuntosPishti, PuntosPishti];
  readonly puntosTras: readonly [number, number];
}

export interface EstadoPishti {
  readonly config: ConfigPishti;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas por repartir; las siguientes son las primeras. */
  readonly mazo: readonly IdCarta[];
  /** Las tapadas del montón inicial, mientras nadie se lo lleva. */
  readonly tapadas: readonly IdCarta[];
  /** Las cartas a la vista del montón, de abajo arriba. */
  readonly monton: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  /** Cartas recogidas por cada bando en la mano, boca abajo. */
  readonly recogidas: readonly [readonly IdCarta[], readonly IdCarta[]];
  readonly pishtis: readonly [PishtisBando, PishtisBando];
  /** Las cartas que se han visto en la mano, en orden: la de arriba del montón inicial y las echadas. */
  readonly vistasMano: readonly IdCarta[];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaPishti | null;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoPishti[];
}

export interface AccionPishti {
  readonly tipo: 'jugar';
  readonly carta: IdCarta;
}

export interface VistaPishti {
  readonly config: ConfigPishti;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly tapadas: number;
  readonly monton: readonly IdCarta[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly cartasRecogidas: readonly [number, number];
  readonly pishtis: readonly [PishtisBando, PishtisBando];
  readonly vistasMano: readonly IdCarta[];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaJugada: JugadaPishti | null;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoPishti[];
}

// ── Cartas y puntos ──────────────────────────────────────────────────────────

export const DOS_DE_TREBOLES: IdCarta = 'treboles-2';
export const DIEZ_DE_DIAMANTES: IdCarta = 'diamantes-10';
const JOTA = 11;

export const rangoPishti = (c: IdCarta) => cartaDeId(c)!.valor;
export const esJotaPishti = (c: IdCarta) => rangoPishti(c) === JOTA;

/** Puntos de una carta: As y J 1, 2 de tréboles 2, 10 de diamantes 3, el resto 0. */
export function puntosCartaPishti(c: IdCarta): number {
  if (c === DOS_DE_TREBOLES) return 2;
  if (c === DIEZ_DE_DIAMANTES) return 3;
  const r = rangoPishti(c);
  return r === 1 || r === JOTA ? 1 : 0;
}

/** Lo que hace una carta sobre el montón: si se lo lleva y los puntos de pishti. */
export function efectoPishti(
  monton: readonly IdCarta[],
  tapadas: number,
  carta: IdCarta,
): { lleva: boolean; pishti: 0 | 10 | 20 } {
  const arriba = monton.at(-1);
  if (arriba === undefined) return { lleva: false, pishti: 0 };
  const iguales = rangoPishti(arriba) === rangoPishti(carta);
  if (!iguales && !esJotaPishti(carta)) return { lleva: false, pishti: 0 };
  if (iguales && monton.length === 1 && tapadas === 0)
    return { lleva: true, pishti: esJotaPishti(carta) ? 20 : 10 };
  return { lleva: true, pishti: 0 };
}

const PUNTOS_CARTAS = 3;

/** Puntos de la mano a partir de lo que recogió cada bando y sus pishtis. */
export function puntuarManoPishti(
  recogidas: readonly [readonly IdCarta[], readonly IdCarta[]],
  pishtis: readonly [PishtisBando, PishtisBando],
): Pick<ResultadoManoPishti, 'recuento' | 'puntos'> {
  const recuento = ([0, 1] as const).map((b) => ({
    cartas: recogidas[b].length,
    ases: recogidas[b].filter((c) => rangoPishti(c) === 1).length,
    jotas: recogidas[b].filter(esJotaPishti).length,
    dosTreboles: recogidas[b].includes(DOS_DE_TREBOLES),
    diezDiamantes: recogidas[b].includes(DIEZ_DE_DIAMANTES),
    pishtis: pishtis[b].cuantos,
  })) as [RecuentoPishti, RecuentoPishti];
  const puntos = ([0, 1] as const).map((b) => {
    const r = recuento[b];
    const p = {
      cartas: r.cartas > recuento[1 - b]!.cartas ? PUNTOS_CARTAS : 0,
      asesYJotas: r.ases + r.jotas,
      dosTreboles: r.dosTreboles ? 2 : 0,
      diezDiamantes: r.diezDiamantes ? 3 : 0,
      pishtis: pishtis[b].puntos,
    } as const;
    return {
      ...p,
      total: p.cartas + p.asesYJotas + p.dosTreboles + p.diezDiamantes + p.pishtis,
    };
  }) as [PuntosPishti, PuntosPishti];
  return { recuento, puntos };
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_POR_REPARTO = 4;
const TAPADAS = 3;
const SIN_PISHTIS: PishtisBando = { cuantos: 0, puntos: 0 };

const terminada = (e: Pick<EstadoPishti, 'puntos' | 'config'>) =>
  Math.max(...e.puntos) >= e.config.meta && e.puntos[0] !== e.puntos[1];

/** Reparte 4 cartas a cada uno desde `desde`. */
function repartir(
  mazo: readonly IdCarta[],
  jugadores: number,
  desde: Asiento,
): { manos: IdCarta[][]; mazo: IdCarta[] } {
  const manos: IdCarta[][] = Array.from({ length: jugadores }, () => []);
  for (let k = 0; k < jugadores; k++) {
    manos[(desde + k) % jugadores] = mazo.slice(
      k * CARTAS_POR_REPARTO,
      (k + 1) * CARTAS_POR_REPARTO,
    );
  }
  return { manos, mazo: mazo.slice(jugadores * CARTAS_POR_REPARTO) };
}

function nuevaMano(
  base: Pick<EstadoPishti, 'config' | 'puntos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoPishti {
  const { cartas, azar: sig } = barajar(BARAJA_PISHTI, azar);
  const n = base.config.jugadores;
  const sale = siguiente(repartidor, n);
  const reparto = repartir(cartas.slice(TAPADAS + 1), n, sale);
  return {
    ...base,
    azar: sig,
    repartidor,
    mazo: reparto.mazo,
    tapadas: cartas.slice(0, TAPADAS),
    monton: [cartas[TAPADAS]!],
    manos: reparto.manos,
    turno: sale,
    recogidas: [[], []],
    pishtis: [SIN_PISHTIS, SIN_PISHTIS],
    vistasMano: [cartas[TAPADAS]!],
    ultimoEnRecoger: null,
    ultimaJugada: null,
  };
}

/** El montón va al último que se llevó uno; se puntúa y se reparte otra o termina. */
function cerrarMano(e: EstadoPishti): EstadoPishti {
  const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
  const enMesa = [...e.tapadas, ...e.monton];
  if (e.ultimoEnRecoger !== null) recogidas[bandoDe(e.ultimoEnRecoger)].push(...enMesa);
  const { recuento, puntos: puntosMano } = puntuarManoPishti(recogidas, e.pishtis);
  const puntos: [number, number] = [
    e.puntos[0] + puntosMano[0].total,
    e.puntos[1] + puntosMano[1].total,
  ];
  const cerrado: EstadoPishti = {
    ...e,
    tapadas: e.ultimoEnRecoger === null ? e.tapadas : [],
    monton: e.ultimoEnRecoger === null ? e.monton : [],
    recogidas,
    puntos,
    resultadosManos: [...e.resultadosManos, { recuento, puntos: puntosMano, puntosTras: puntos }],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor, e.config.jugadores), e.azar);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const pishti: Juego<ConfigPishti, EstadoPishti, AccionPishti, VistaPishti> = {
  id: 'pishti',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('El Pishti se juega con 2 jugadores o con 4 en parejas');
    }
    if (!Number.isInteger(config.meta) || config.meta < 1)
      return error('La meta debe ser positiva');
    const limpia: ConfigPishti = { jugadores: config.jugadores, meta: config.meta };
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
    return e.manos[asiento]!.map((carta): AccionPishti => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    const bando = bandoDe(asiento);
    let manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    let mazo = e.mazo;
    const { lleva, pishti: puntosPishti } = efectoPishti(e.monton, e.tapadas.length, accion.carta);
    const recogidas: [IdCarta[], IdCarta[]] = [[...e.recogidas[0]], [...e.recogidas[1]]];
    const pishtis: [PishtisBando, PishtisBando] = [e.pishtis[0], e.pishtis[1]];
    if (lleva) recogidas[bando].push(...e.tapadas, ...e.monton, accion.carta);
    if (puntosPishti > 0) {
      pishtis[bando] = {
        cuantos: pishtis[bando].cuantos + 1,
        puntos: pishtis[bando].puntos + puntosPishti,
      };
    }
    const turno = siguiente(asiento, n);
    const ultimaDeLaMano = mazo.length === 0 && manos.every((m) => m.length === 0);
    if (manos.every((m) => m.length === 0) && mazo.length > 0) {
      ({ manos, mazo } = repartir(mazo, n, turno));
    }
    const jugado: EstadoPishti = {
      ...e,
      manos,
      mazo,
      tapadas: lleva ? [] : e.tapadas,
      monton: lleva ? [] : [...e.monton, accion.carta],
      turno,
      recogidas,
      pishtis,
      vistasMano: [...e.vistasMano, accion.carta],
      ultimoEnRecoger: lleva ? asiento : e.ultimoEnRecoger,
      ultimaJugada: {
        asiento,
        carta: accion.carta,
        llevadas: lleva ? [...e.monton] : [],
        tapadas: lleva ? e.tapadas.length : 0,
        pishti: puntosPishti,
      },
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
      tapadas: e.tapadas.length,
      monton: [...e.monton],
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      cartasRecogidas: [e.recogidas[0].length, e.recogidas[1].length],
      pishtis: e.pishtis,
      vistasMano: [...e.vistasMano],
      ultimoEnRecoger: e.ultimoEnRecoger,
      ultimaJugada: e.ultimaJugada,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const bando = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return {
      ganadores: asientos.filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: asientos.map((a) => e.puntos[bandoDe(a)]),
    };
  },
};
