import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigEcarte {
  /** Puntos para ganar: 5 (otra cosa solo en las pruebas). */
  readonly meta: number;
}

export const META_ECARTE = 5;
export const CONFIG_ECARTE_POR_DEFECTO: ConfigEcarte = { meta: META_ECARTE };

type DeDos<T> = readonly [T, T];

export type FaseEcarte = 'cambio' | 'respuesta' | 'descarte' | 'bazas';

export type AccionEcarte =
  | { readonly tipo: 'proponer' }
  | { readonly tipo: 'jugar' }
  | { readonly tipo: 'aceptar' }
  | { readonly tipo: 'rehusar' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'jugarCarta'; readonly carta: IdCarta };

/** Palos que un jugador no siguió en la mano, y `'triunfo'` si además no falló. */
export type FalloEcarte = PaloFrances | 'triunfo';

export interface ResultadoManoEcarte {
  readonly repartidor: Asiento;
  /** El palo del triunfo (la vuelta no: en la mano siguiente puede estar oculta). */
  readonly triunfo: PaloFrances;
  readonly reyVuelto: boolean;
  readonly rey: Asiento | null;
  readonly autoridad: Asiento | null;
  readonly bazas: DeDos<number>;
  /** Quien hizo 3 bazas o más; `null` si la partida terminó antes de acabar las bazas. */
  readonly ganador: Asiento | null;
  readonly vole: boolean;
  readonly puntosMano: DeDos<number>;
  readonly puntosTras: DeDos<number>;
  /** `false` si la partida terminó a mitad de la mano. */
  readonly completa: boolean;
}

export interface EstadoEcarte {
  readonly config: ConfigEcarte;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly vuelta: IdCarta;
  readonly manos: readonly (readonly IdCarta[])[];
  /** El siguiente que se roba es el primero. */
  readonly monton: readonly IdCarta[];
  readonly descartes: readonly (readonly IdCarta[])[];
  readonly fase: FaseEcarte;
  readonly turno: Asiento;
  /** Cuántas cartas se ha descartado el que tiene el turno en este cambio. */
  readonly cambiando: number;
  readonly propuestas: number;
  readonly autoridad: Asiento | null;
  readonly reyVuelto: boolean;
  readonly rey: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Cartas jugadas en las bazas de la mano. */
  readonly jugadas: readonly CartaJugada[];
  readonly bazas: DeDos<number>;
  readonly fallos: readonly (readonly FalloEcarte[])[];
  readonly puntosMano: DeDos<number>;
  readonly puntos: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoEcarte[];
}

export interface VistaEcarte {
  readonly config: ConfigEcarte;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly misDescartes: readonly IdCarta[];
  readonly cartasEnMano: readonly number[];
  readonly enDescarte: readonly number[];
  readonly enMonton: number;
  readonly repartidor: Asiento;
  readonly vuelta: IdCarta;
  readonly fase: FaseEcarte;
  readonly turno: Asiento | null;
  readonly cambiando: number;
  readonly propuestas: number;
  readonly autoridad: Asiento | null;
  readonly reyVuelto: boolean;
  readonly rey: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoEcarte['ultimaBaza'];
  readonly jugadas: readonly CartaJugada[];
  readonly bazas: DeDos<number>;
  readonly fallos: readonly (readonly FalloEcarte[])[];
  readonly puntosMano: DeDos<number>;
  readonly puntos: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoEcarte[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** 32 cartas francesas, del 7 al As. */
export const BARAJA_ECARTE: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

export const paloEcarte = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;

const RANGOS: Readonly<Record<number, number>> = {
  13: 8,
  12: 7,
  11: 6,
  1: 5,
  10: 4,
  9: 3,
  8: 2,
  7: 1,
};

/** Orden dentro del palo: K 8, Q 7, J 6, As 5, 10 4, 9 3, 8 2, 7 1. */
export const rangoEcarte = (c: IdCarta) => RANGOS[cartaDeId(c)!.valor]!;

export const esReyEcarte = (c: IdCarta) => cartaDeId(c)!.valor === 13;

/** Si `segunda` gana a `primera` (la de salida) con este triunfo. */
export function ganaSegundaEcarte(primera: IdCarta, segunda: IdCarta, triunfo: PaloFrances) {
  const p1 = paloEcarte(primera);
  const p2 = paloEcarte(segunda);
  if (p2 === p1) return rangoEcarte(segunda) > rangoEcarte(primera);
  return p2 === triunfo;
}

/**
 * Cartas que se pueden jugar: al salir, todas; al responder, las del palo de salida que ganan
 * (o todas las del palo si ninguna gana); sin el palo, los triunfos; si no, todas.
 */
export function cartasLegalesEcarte(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = mesa[0]!.carta;
  const delPalo = mano.filter((c) => paloEcarte(c) === paloEcarte(salida));
  if (delPalo.length > 0) {
    const ganan = delPalo.filter((c) => rangoEcarte(c) > rangoEcarte(salida));
    return ganan.length > 0 ? ganan : delPalo;
  }
  const triunfos = mano.filter((c) => paloEcarte(c) === triunfo);
  return triunfos.length > 0 ? triunfos : [...mano];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const CARTAS_EN_MANO_ECARTE = 5;
const MAXIMO_CAMBIO = 5;

const otro = (a: Asiento): Asiento => (a === 0 ? 1 : 0);
export const triunfoEcarte = (e: Pick<EstadoEcarte, 'vuelta'>) => paloEcarte(e.vuelta);

const terminada = (e: Pick<EstadoEcarte, 'puntos' | 'config'>) =>
  e.puntos.some((p) => p >= e.config.meta);

function resultadoDe(e: EstadoEcarte, completa: boolean): ResultadoManoEcarte {
  const [b0, b1] = e.bazas;
  const ganador: Asiento | null = !completa ? null : b0 > b1 ? 0 : 1;
  return {
    repartidor: e.repartidor,
    triunfo: paloEcarte(e.vuelta),
    reyVuelto: e.reyVuelto,
    rey: e.rey,
    autoridad: e.autoridad,
    bazas: e.bazas,
    ganador,
    vole: completa && (b0 === CARTAS_EN_MANO_ECARTE || b1 === CARTAS_EN_MANO_ECARTE),
    puntosMano: e.puntosMano,
    puntosTras: e.puntos,
    completa,
  };
}

/** Suma puntos; si alguien llega a la meta, la mano se cierra a medias. */
function anotar(e: EstadoEcarte, a: Asiento, n: number): EstadoEcarte {
  const puntos: [number, number] = [e.puntos[0], e.puntos[1]];
  const puntosMano: [number, number] = [e.puntosMano[0], e.puntosMano[1]];
  puntos[a as 0 | 1] += n;
  puntosMano[a as 0 | 1] += n;
  const r: EstadoEcarte = { ...e, puntos, puntosMano };
  if (!terminada(r)) return r;
  return { ...r, resultadosManos: [...e.resultadosManos, resultadoDe(r, false)] };
}

function nuevaMano(
  base: Pick<EstadoEcarte, 'config' | 'puntos' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoEcarte {
  const { cartas, azar: sig } = barajar(BARAJA_ECARTE, azar);
  const mano = otro(repartidor);
  const manos: IdCarta[][] = [[], []];
  manos[mano] = cartas.slice(0, CARTAS_EN_MANO_ECARTE);
  manos[repartidor] = cartas.slice(CARTAS_EN_MANO_ECARTE, 2 * CARTAS_EN_MANO_ECARTE);
  const vuelta = cartas[2 * CARTAS_EN_MANO_ECARTE]!;
  const e: EstadoEcarte = {
    ...base,
    azar: sig,
    repartidor,
    vuelta,
    manos,
    monton: cartas.slice(2 * CARTAS_EN_MANO_ECARTE + 1),
    descartes: [[], []],
    fase: 'cambio',
    turno: mano,
    cambiando: 0,
    propuestas: 0,
    autoridad: null,
    reyVuelto: esReyEcarte(vuelta),
    rey: null,
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    jugadas: [],
    bazas: [0, 0],
    fallos: [[], []],
    puntosMano: [0, 0],
  };
  return e.reyVuelto ? anotar(e, repartidor, 1) : e;
}

/** Empiezan las bazas: sale el mano. */
const aBazas = (e: EstadoEcarte): EstadoEcarte => ({
  ...e,
  fase: 'bazas',
  turno: otro(e.repartidor),
  cambiando: 0,
});

function cerrarMano(e: EstadoEcarte): EstadoEcarte {
  const ganador: Asiento = e.bazas[0] > e.bazas[1] ? 0 : 1;
  const vole = e.bazas[ganador as 0 | 1] === CARTAS_EN_MANO_ECARTE;
  const n = vole || e.autoridad === otro(ganador) ? 2 : 1;
  const puntos: [number, number] = [e.puntos[0], e.puntos[1]];
  const puntosMano: [number, number] = [e.puntosMano[0], e.puntosMano[1]];
  puntos[ganador as 0 | 1] += n;
  puntosMano[ganador as 0 | 1] += n;
  const anotado: EstadoEcarte = { ...e, puntos, puntosMano };
  const cerrado: EstadoEcarte = {
    ...anotado,
    resultadosManos: [...e.resultadosManos, resultadoDe(anotado, true)],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, otro(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoEcarte): EstadoEcarte {
  const [primera, segunda] = e.mesa as [CartaJugada, CartaJugada];
  const triunfo = triunfoEcarte(e);
  const ganador = ganaSegundaEcarte(primera.carta, segunda.carta, triunfo)
    ? segunda.asiento
    : primera.asiento;
  // Lo que se sabe del que respondió: si no siguió el palo, y si además no falló.
  const paloSalida = paloEcarte(primera.carta);
  const fallos = e.fallos.map((f) => [...f]);
  if (paloEcarte(segunda.carta) !== paloSalida) {
    const f = fallos[segunda.asiento]!;
    if (!f.includes(paloSalida)) f.push(paloSalida);
    if (paloEcarte(segunda.carta) !== triunfo && !f.includes('triunfo')) f.push('triunfo');
  }
  const bazas: [number, number] = [e.bazas[0], e.bazas[1]];
  bazas[ganador as 0 | 1]++;
  const r: EstadoEcarte = {
    ...e,
    mesa: [],
    ultimaBaza: { cartas: e.mesa, ganador },
    jugadas: [...e.jugadas, ...e.mesa],
    bazas,
    fallos,
    turno: ganador,
  };
  return r.manos.every((m) => m.length === 0) ? cerrarMano(r) : r;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const ecarte: Juego<ConfigEcarte, EstadoEcarte, AccionEcarte, VistaEcarte> = {
  id: 'ecarte',

  crear(config, semilla) {
    if (!Number.isInteger(config.meta) || config.meta < 1)
      return error('La meta debe ser positiva');
    // Reparte el asiento 1, así el asiento 0 es mano.
    return ok(
      nuevaMano(
        { config: { meta: config.meta }, puntos: [0, 0], resultadosManos: [] },
        1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => 2,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'cambio':
        return [{ tipo: 'proponer' }, { tipo: 'jugar' }];
      case 'respuesta':
        return [{ tipo: 'aceptar' }, { tipo: 'rehusar' }];
      case 'descarte': {
        const esMano = asiento !== e.repartidor;
        const maximo = Math.min(MAXIMO_CAMBIO, e.monton.length);
        const r: AccionEcarte[] = [];
        if (!esMano || e.cambiando > 0) r.push({ tipo: 'robar' });
        if (e.cambiando < maximo) {
          for (const carta of [...e.manos[asiento]!].sort()) r.push({ tipo: 'descartar', carta });
        }
        return r;
      }
      case 'bazas':
        return cartasLegalesEcarte(e.manos[asiento]!, e.mesa, triunfoEcarte(e))
          .sort()
          .map((carta): AccionEcarte => ({ tipo: 'jugarCarta', carta }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'proponer':
        return { ...e, fase: 'respuesta', turno: e.repartidor, propuestas: e.propuestas + 1 };
      case 'jugar':
        return aBazas({ ...e, autoridad: e.propuestas === 0 ? asiento : e.autoridad });
      case 'aceptar':
        return { ...e, fase: 'descarte', turno: otro(e.repartidor), cambiando: 0 };
      case 'rehusar':
        return aBazas({ ...e, autoridad: e.propuestas === 1 ? asiento : e.autoridad });
      case 'descartar':
        return {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          descartes: e.descartes.map((d, a) => (a === asiento ? [...d, accion.carta] : d)),
          cambiando: e.cambiando + 1,
        };
      case 'robar': {
        const k = e.cambiando;
        const r: EstadoEcarte = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, ...e.monton.slice(0, k)] : m)),
          monton: e.monton.slice(k),
          cambiando: 0,
        };
        if (r.monton.length === 0) return aBazas(r);
        if (asiento !== e.repartidor) return { ...r, turno: e.repartidor };
        return { ...r, fase: 'cambio', turno: otro(e.repartidor) };
      }
      case 'jugarCarta': {
        let r: EstadoEcarte = e;
        // Al jugar su primera carta, quien tiene el rey de triunfo lo anuncia.
        const primera =
          !e.jugadas.some((j) => j.asiento === asiento) &&
          !e.mesa.some((j) => j.asiento === asiento);
        const rey = e.manos[asiento]!.find(
          (c) => esReyEcarte(c) && paloEcarte(c) === triunfoEcarte(e),
        );
        if (primera && rey !== undefined) {
          r = anotar({ ...r, rey: asiento }, asiento, 1);
          if (terminada(r)) return r;
        }
        const manos = r.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...r.mesa, { asiento, carta: accion.carta }];
        if (mesa.length === 1) return { ...r, manos, mesa, turno: otro(asiento) };
        return resolverBaza({ ...r, manos, mesa });
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
      repartidor: e.repartidor,
      vuelta: e.vuelta,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      cambiando: e.cambiando,
      propuestas: e.propuestas,
      autoridad: e.autoridad,
      reyVuelto: e.reyVuelto,
      rey: e.rey,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadas: [...e.jugadas],
      bazas: e.bazas,
      fallos: e.fallos.map((f) => [...f]),
      puntosMano: e.puntosMano,
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const ganador = e.puntos[0] >= e.config.meta ? 0 : 1;
    return { ganadores: [ganador], empate: false, puntos: [...e.puntos] };
  },
};
