import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  mejorReparto,
  posicionEscalera,
  puntosCarta,
  type Reparto,
} from './chinchon-combinaciones';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigGinRummy {
  readonly jugadores: 2;
}

export const CONFIG_GIN_RUMMY_POR_DEFECTO: ConfigGinRummy = { jugadores: 2 };

export const OBJETIVO_GIN_RUMMY = 100;
/** Puntos sueltos con los que, como mucho, se puede cerrar. */
export const MAXIMO_CIERRE_GIN_RUMMY = 10;
export const BONO_GIN = 25;
export const BONO_UNDERCUT = 25;
export const BONO_MANO_GIN_RUMMY = 25;
export const BONO_PARTIDA_GIN_RUMMY = 100;

const CARTAS_EN_MANO = 10;
/** Con estas cartas en el mazo, un descarte sin cerrar deja la mano nula. */
const MAZO_NULO = 2;

export type FaseGinRummy = 'primera' | 'robar' | 'descartar';

/** Última acción, visible para los dos (la carta robada del mazo no se revela). */
export type AccionVisibleGinRummy =
  | {
      readonly asiento: Asiento;
      readonly tipo: 'robar';
      readonly desde: 'mazo' | 'descarte';
      readonly carta: IdCarta | null;
    }
  | { readonly asiento: Asiento; readonly tipo: 'pasar' }
  | { readonly asiento: Asiento; readonly tipo: 'descartar' | 'cerrar'; readonly carta: IdCarta };

export interface ManoDestapadaGinRummy {
  readonly asiento: Asiento;
  readonly cartas: readonly IdCarta[];
  readonly combinaciones: readonly (readonly IdCarta[])[];
  readonly sueltas: readonly IdCarta[];
  /** Cartas colocadas en las combinaciones de quien cierra (solo el rival). */
  readonly colocadas: readonly IdCarta[];
  /** Puntos sueltos que le quedan. */
  readonly puntos: number;
}

export interface ResultadoManoGinRummy {
  readonly tipo: 'gin' | 'cierre' | 'undercut' | 'nula';
  readonly cierra: Asiento | null;
  readonly gana: Asiento | null;
  readonly puntosMano: number;
  /** Quien cierra primero; vacío en una mano nula. */
  readonly manos: readonly ManoDestapadaGinRummy[];
  readonly puntosTras: readonly number[];
  readonly manosGanadasTras: readonly number[];
}

export interface EstadoGinRummy {
  readonly config: ConfigGinRummy;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Boca abajo; la siguiente que se roba es la última. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la de arriba es la última. */
  readonly descarte: readonly IdCarta[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly fase: FaseGinRummy;
  /** Pases sobre la primera carta: con 2, el que no reparte solo puede robar del mazo. */
  readonly pasesPrimera: 0 | 1 | 2;
  /** Carta cogida del descarte en este turno, que no se puede soltar. */
  readonly robadaDelDescarte: IdCarta | null;
  /** Cartas que cada jugador cogió del descarte y siguen en su mano (públicas). */
  readonly cogidas: readonly (readonly IdCarta[])[];
  readonly puntos: readonly number[];
  readonly manosGanadas: readonly number[];
  readonly ultimaAccion: AccionVisibleGinRummy | null;
  readonly resultadosManos: readonly ResultadoManoGinRummy[];
}

export type AccionGinRummy =
  | { readonly tipo: 'robar'; readonly desde: 'mazo' | 'descarte' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'cerrar'; readonly carta: IdCarta };

export interface VistaGinRummy {
  readonly config: ConfigGinRummy;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  /** El descarte entero, la de arriba la última. */
  readonly descarte: readonly IdCarta[];
  readonly cogidas: readonly (readonly IdCarta[])[];
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly fase: FaseGinRummy;
  readonly pasesPrimera: 0 | 1 | 2;
  readonly robadaDelDescarte: IdCarta | null;
  readonly puntos: readonly number[];
  readonly manosGanadas: readonly number[];
  readonly ultimaAccion: AccionVisibleGinRummy | null;
  readonly resultadosManos: readonly ResultadoManoGinRummy[];
}

export interface MarcadorGinRummy {
  readonly puntos: number;
  readonly bonoManos: number;
  readonly bonoPartida: number;
  /** El ganador dobla su marcador si el rival no ganó ninguna mano. */
  readonly doble: boolean;
  readonly total: number;
}

// ── Combinaciones y colocar ──────────────────────────────────────────────────

/** La agrupación de una mano de Gin Rummy que deja menos puntos sueltos. */
export function mejorRepartoGin(cartas: readonly IdCarta[]): Reparto {
  return mejorReparto(cartas, 'francesa52');
}

export { puntosCarta as puntosCartaGin };

export interface Colocacion {
  readonly combinaciones: readonly (readonly IdCarta[])[];
  readonly sueltas: readonly IdCarta[];
  readonly colocadas: readonly IdCarta[];
  readonly puntos: number;
}

const palo = (c: IdCarta) => cartaDeId(c)!.palo;
const posicion = (c: IdCarta) => posicionEscalera(cartaDeId(c)!.valor, 'francesa52');

/** Si todas las cartas del subconjunto se pueden colocar en las combinaciones de quien cierra. */
function sePuedenColocar(
  subconjunto: readonly IdCarta[],
  grupos: readonly number[],
  escaleras: readonly { palo: string; desde: number; hasta: number }[],
): boolean {
  const extremos = escaleras.map((e) => ({ ...e }));
  const pendientes = new Set(subconjunto);
  // Alarga las escaleras en cadena con lo que encaje en sus extremos.
  for (let cambio = true; cambio;) {
    cambio = false;
    for (const c of pendientes) {
      const p = posicion(c);
      const escalera = extremos.find(
        (e) => e.palo === palo(c) && (p === e.desde - 1 || p === e.hasta + 1),
      );
      if (escalera) {
        escalera.desde = Math.min(escalera.desde, p);
        escalera.hasta = Math.max(escalera.hasta, p);
        pendientes.delete(c);
        cambio = true;
      }
    }
  }
  return [...pendientes].every((c) => grupos.includes(cartaDeId(c)!.valor));
}

/**
 * Las cartas del rival colocadas en las combinaciones de quien cierra y la agrupación del resto,
 * de la forma que le deja menos puntos sueltos (y, si empatan, con menos colocadas).
 */
export function colocar(
  combinacionesCierre: readonly (readonly IdCarta[])[],
  manoRival: readonly IdCarta[],
): Colocacion {
  const grupos: number[] = [];
  const escaleras: { palo: string; desde: number; hasta: number }[] = [];
  for (const comb of combinacionesCierre) {
    const valores = comb.map((c) => cartaDeId(c)!.valor);
    if (valores.every((v) => v === valores[0])) {
      if (comb.length === 3) grupos.push(valores[0]!);
    } else {
      const posiciones = comb.map(posicion);
      escaleras.push({
        palo: palo(comb[0]!),
        desde: Math.min(...posiciones),
        hasta: Math.max(...posiciones),
      });
    }
  }
  const candidatas = manoRival.filter(
    (c) =>
      grupos.includes(cartaDeId(c)!.valor) ||
      escaleras.some((e) => e.palo === palo(c) && (posicion(c) < e.desde || posicion(c) > e.hasta)),
  );
  let mejor: Colocacion | null = null;
  for (let mascara = 0; mascara < 1 << candidatas.length; mascara++) {
    const subconjunto = candidatas.filter((_, i) => (mascara & (1 << i)) !== 0);
    if (!sePuedenColocar(subconjunto, grupos, escaleras)) continue;
    const resto = manoRival.filter((c) => !subconjunto.includes(c));
    const reparto = mejorRepartoGin(resto);
    if (
      mejor === null ||
      reparto.puntos < mejor.puntos ||
      (reparto.puntos === mejor.puntos && subconjunto.length < mejor.colocadas.length)
    ) {
      mejor = {
        combinaciones: reparto.combinaciones,
        sueltas: reparto.sueltas,
        colocadas: subconjunto,
        puntos: reparto.puntos,
      };
    }
  }
  return mejor!;
}

/** El marcador final con los bonos: 25 por mano ganada, 100 al ganador y doble si el rival no ganó ninguna. */
export function marcadorFinal(
  puntos: readonly number[],
  manosGanadas: readonly number[],
  ganador: Asiento | null,
): MarcadorGinRummy[] {
  return puntos.map((p, a) => {
    const bonoManos = BONO_MANO_GIN_RUMMY * manosGanadas[a]!;
    const bonoPartida = a === ganador ? BONO_PARTIDA_GIN_RUMMY : 0;
    const doble = a === ganador && manosGanadas[1 - a] === 0;
    const total = (p + bonoManos + bonoPartida) * (doble ? 2 : 1);
    return { puntos: p, bonoManos, bonoPartida, doble, total };
  });
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const otro = (a: Asiento): Asiento => 1 - a;

function ganadorPartida(e: Pick<EstadoGinRummy, 'puntos'>): Asiento | null {
  const a = e.puntos.findIndex((p) => p >= OBJETIVO_GIN_RUMMY);
  return a < 0 ? null : a;
}

/** Con estas 10 cartas se puede cerrar. */
export function puedeCerrarGin(cartas: readonly IdCarta[]): boolean {
  return mejorRepartoGin(cartas).puntos <= MAXIMO_CIERRE_GIN_RUMMY;
}

function nuevaMano(
  config: ConfigGinRummy,
  azar: EstadoAzar,
  repartidor: Asiento,
  puntos: readonly number[],
  manosGanadas: readonly number[],
  resultadosManos: readonly ResultadoManoGinRummy[],
): EstadoGinRummy {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const sale = otro(repartidor);
  const reparto = repartir(cartas, [CARTAS_EN_MANO, CARTAS_EN_MANO]);
  if (!reparto.ok) throw new Error(reparto.error);
  const manos: IdCarta[][] = [[], []];
  manos[sale] = reparto.valor.manos[0]!;
  manos[repartidor] = reparto.valor.manos[1]!;
  const [primera, ...mazo] = reparto.valor.mazo as [IdCarta, ...IdCarta[]];
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    mazo,
    descarte: [primera],
    manos,
    turno: sale,
    fase: 'primera',
    pasesPrimera: 0,
    robadaDelDescarte: null,
    cogidas: [[], []],
    puntos,
    manosGanadas,
    ultimaAccion: null,
    resultadosManos,
  };
}

/** Destapa las manos, coloca, puntúa y reparte otra mano o termina la partida. */
function cerrarMano(e: EstadoGinRummy, cierra: Asiento): EstadoGinRummy {
  const rival = otro(cierra);
  const cartasCierre = e.manos[cierra]!;
  const repartoCierre = mejorRepartoGin(cartasCierre);
  const gin = repartoCierre.puntos === 0;
  const colocacion: Colocacion = gin
    ? { ...mejorRepartoGin(e.manos[rival]!), colocadas: [] }
    : colocar(repartoCierre.combinaciones, e.manos[rival]!);
  let tipo: ResultadoManoGinRummy['tipo'];
  let gana: Asiento;
  let puntosMano: number;
  if (gin) {
    tipo = 'gin';
    gana = cierra;
    puntosMano = colocacion.puntos + BONO_GIN;
  } else if (repartoCierre.puntos < colocacion.puntos) {
    tipo = 'cierre';
    gana = cierra;
    puntosMano = colocacion.puntos - repartoCierre.puntos;
  } else {
    tipo = 'undercut';
    gana = rival;
    puntosMano = repartoCierre.puntos - colocacion.puntos + BONO_UNDERCUT;
  }
  const puntos = e.puntos.map((p, a) => (a === gana ? p + puntosMano : p));
  const manosGanadas = e.manosGanadas.map((m, a) => (a === gana ? m + 1 : m));
  const resultado: ResultadoManoGinRummy = {
    tipo,
    cierra,
    gana,
    puntosMano,
    manos: [
      {
        asiento: cierra,
        cartas: cartasCierre,
        combinaciones: repartoCierre.combinaciones,
        sueltas: repartoCierre.sueltas,
        colocadas: [],
        puntos: repartoCierre.puntos,
      },
      {
        asiento: rival,
        cartas: e.manos[rival]!,
        combinaciones: colocacion.combinaciones,
        sueltas: colocacion.sueltas,
        colocadas: colocacion.colocadas,
        puntos: colocacion.puntos,
      },
    ],
    puntosTras: puntos,
    manosGanadasTras: manosGanadas,
  };
  const resultadosManos = [...e.resultadosManos, resultado];
  if (ganadorPartida({ puntos }) !== null) return { ...e, puntos, manosGanadas, resultadosManos };
  return nuevaMano(e.config, e.azar, otro(e.repartidor), puntos, manosGanadas, resultadosManos);
}

function manoNula(e: EstadoGinRummy): EstadoGinRummy {
  const resultadosManos: ResultadoManoGinRummy[] = [
    ...e.resultadosManos,
    {
      tipo: 'nula',
      cierra: null,
      gana: null,
      puntosMano: 0,
      manos: [],
      puntosTras: e.puntos,
      manosGanadasTras: e.manosGanadas,
    },
  ];
  return nuevaMano(e.config, e.azar, e.repartidor, e.puntos, e.manosGanadas, resultadosManos);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const ginRummy: Juego<ConfigGinRummy, EstadoGinRummy, AccionGinRummy, VistaGinRummy> = {
  id: 'ginRummy',

  crear(config, semilla) {
    if (config.jugadores !== 2) return error('El Gin Rummy se juega entre 2 jugadores');
    // Reparte el asiento 1, así decide primero el asiento 0.
    return ok(nuevaMano({ jugadores: 2 }, crearAzar(semilla), 1, [0, 0], [0, 0], []));
  },

  asientos: () => 2,

  accionesLegales(e, asiento) {
    if (ganadorPartida(e) !== null || asiento !== e.turno) return [];
    if (e.fase === 'primera') return [{ tipo: 'robar', desde: 'descarte' }, { tipo: 'pasar' }];
    if (e.fase === 'robar') {
      const acciones: AccionGinRummy[] = [{ tipo: 'robar', desde: 'mazo' }];
      if (e.pasesPrimera < 2) acciones.push({ tipo: 'robar', desde: 'descarte' });
      return acciones;
    }
    const mano = e.manos[asiento]!;
    const acciones: AccionGinRummy[] = [];
    for (const carta of mano) {
      if (carta === e.robadaDelDescarte) continue;
      acciones.push({ tipo: 'descartar', carta });
      if (puedeCerrarGin(mano.filter((c) => c !== carta))) acciones.push({ tipo: 'cerrar', carta });
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'pasar') {
      const ultimaAccion = { asiento, tipo: 'pasar' } as const;
      if (e.pasesPrimera === 0) {
        return { ...e, turno: e.repartidor, pasesPrimera: 1, ultimaAccion };
      }
      return { ...e, turno: otro(e.repartidor), fase: 'robar', pasesPrimera: 2, ultimaAccion };
    }

    if (accion.tipo === 'robar') {
      const mazo = [...e.mazo];
      const descarte = [...e.descarte];
      const delDescarte = accion.desde === 'descarte';
      const carta = delDescarte ? descarte.pop()! : mazo.pop()!;
      return {
        ...e,
        mazo,
        descarte,
        manos: e.manos.map((m, a) => (a === asiento ? [...m, carta] : m)),
        cogidas: e.cogidas.map((c, a) => (a === asiento && delDescarte ? [...c, carta] : c)),
        fase: 'descartar',
        pasesPrimera: 0,
        robadaDelDescarte: delDescarte ? carta : null,
        ultimaAccion: {
          asiento,
          tipo: 'robar',
          desde: accion.desde,
          carta: delDescarte ? carta : null,
        },
      };
    }

    const jugado: EstadoGinRummy = {
      ...e,
      manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
      cogidas: e.cogidas.map((c) => c.filter((x) => x !== accion.carta)),
      descarte: [...e.descarte, accion.carta],
      robadaDelDescarte: null,
      ultimaAccion: { asiento, tipo: accion.tipo, carta: accion.carta },
    };
    if (accion.tipo === 'cerrar') return cerrarMano(jugado, asiento);
    if (jugado.mazo.length <= MAZO_NULO) return manoNula(jugado);
    return { ...jugado, fase: 'robar', turno: otro(asiento) };
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      cogidas: e.cogidas.map((c) => [...c]),
      repartidor: e.repartidor,
      turno: ganadorPartida(e) === null ? e.turno : null,
      fase: e.fase,
      pasesPrimera: e.pasesPrimera,
      robadaDelDescarte: e.robadaDelDescarte,
      puntos: [...e.puntos],
      manosGanadas: [...e.manosGanadas],
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    const ganador = ganadorPartida(e);
    if (ganador === null) return null;
    const marcador = marcadorFinal(e.puntos, e.manosGanadas, ganador);
    return { ganadores: [ganador], empate: false, puntos: marcador.map((m) => m.total) };
  },
};
