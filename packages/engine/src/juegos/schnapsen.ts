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

/** El Schnapsen clásico no tiene opciones: 2 jugadores, 20 cartas y bummerl a 7. */
export interface ConfigSchnapsen {
  readonly jugadores: 2;
}

export const CONFIG_SCHNAPSEN_POR_DEFECTO: ConfigSchnapsen = { jugadores: 2 };

export const PUNTOS_PARTIDA_SCHNAPSEN = 7;
export const PUNTOS_MANO_SCHNAPSEN = 66;
/** Por debajo de esto, el perdedor da 2 puntos de partida (schneider). */
const PUNTOS_SCHNEIDER = 33;
const JUGADORES = 2;
const CARTAS_MANO = 5;

type DeDos<T> = readonly [T, T];

export type AccionSchnapsen =
  | { readonly tipo: 'cambiar' }
  | { readonly tipo: 'cantar'; readonly palo: PaloFrances }
  | { readonly tipo: 'cerrar' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface AccionSchnapsenHecha {
  readonly asiento: Asiento;
  readonly accion: AccionSchnapsen;
}

export interface CanteSchnapsen {
  readonly asiento: Asiento;
  readonly palo: PaloFrances;
  readonly puntos: 20 | 40;
}

/** Quién cerró el mazo y cómo estaba su rival en ese momento. */
export interface CierreSchnapsen {
  readonly asiento: Asiento;
  readonly bazasRival: number;
  readonly puntosRival: number;
}

export type MotivoSchnapsen = '66' | 'ultima' | 'cierre';

export interface ResultadoManoSchnapsen {
  readonly ganador: Asiento;
  readonly motivo: MotivoSchnapsen;
  /** Si se cerró el mazo, quién lo cerró. */
  readonly cerro: Asiento | null;
  readonly puntosMano: DeDos<number>;
  readonly bazas: DeDos<number>;
  readonly puntosPartida: number;
  /** Puntos de partida tras la mano. */
  readonly totales: DeDos<number>;
}

export interface EstadoSchnapsen {
  readonly config: ConfigSchnapsen;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Cartas boca abajo; la siguiente que se roba es la primera. */
  readonly mazo: readonly IdCarta[];
  /** Carta boca arriba bajo el mazo; `null` cuando ya se robó. */
  readonly cartaVuelta: IdCarta | null;
  readonly triunfo: PaloFrances;
  readonly turno: Asiento;
  readonly cerrado: CierreSchnapsen | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Cartas jugadas en las bazas cerradas de esta mano. */
  readonly jugadas: readonly IdCarta[];
  /** Puntos de las cartas de las bazas de cada uno. */
  readonly puntosBazas: DeDos<number>;
  readonly bazas: DeDos<number>;
  readonly cantes: readonly CanteSchnapsen[];
  /** El palo recién cantado: hay que salir con su K o su Q. */
  readonly cantado: PaloFrances | null;
  /** Palos que cada uno ya no tiene, sabidos por las reglas estrictas. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  /** Cartas a la vista que están en una mano: la carta vuelta robada o cambiada. */
  readonly conocidas: readonly { readonly asiento: Asiento; readonly carta: IdCarta }[];
  /** Puntos de partida. */
  readonly puntos: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoSchnapsen[];
  readonly ultimaAccion: AccionSchnapsenHecha | null;
}

export interface VistaSchnapsen {
  readonly config: ConfigSchnapsen;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas boca abajo que quedan en el mazo. */
  readonly enMazo: number;
  readonly cartaVuelta: IdCarta | null;
  readonly triunfo: PaloFrances;
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly cerrado: CierreSchnapsen | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoSchnapsen['ultimaBaza'];
  readonly jugadas: readonly IdCarta[];
  readonly puntosBazas: DeDos<number>;
  readonly bazas: DeDos<number>;
  readonly cantes: readonly CanteSchnapsen[];
  readonly cantado: PaloFrances | null;
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly conocidas: EstadoSchnapsen['conocidas'];
  readonly puntos: DeDos<number>;
  readonly resultadosManos: readonly ResultadoManoSchnapsen[];
  readonly ultimaAccion: AccionSchnapsenHecha | null;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

const AS = 1;
const DIEZ = 10;
const JOTA = 11;
const DAMA = 12;
const REY = 13;

/** La baraja de 20: As, 10, J, Q y K de cada palo. */
export const BARAJA_SCHNAPSEN: readonly IdCarta[] = crearBaraja('francesa52').filter((c) =>
  [AS, DIEZ, JOTA, DAMA, REY].includes(cartaDeId(c)!.valor),
);

const RANGO: Record<number, number> = { [AS]: 5, [DIEZ]: 4, [REY]: 3, [DAMA]: 2, [JOTA]: 1 };
const VALOR: Record<number, number> = { [AS]: 11, [DIEZ]: 10, [REY]: 4, [DAMA]: 3, [JOTA]: 2 };

export const paloSchnapsen = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const numero = (c: IdCarta) => cartaDeId(c)!.valor;
/** El orden dentro del palo: As 5, 10 4, K 3, Q 2 y J 1. */
export const rangoSchnapsen = (c: IdCarta) => RANGO[numero(c)]!;
/** Los puntos de la carta. */
export const valorSchnapsen = (c: IdCarta) => VALOR[numero(c)]!;

export const jotaDe = (palo: PaloFrances): IdCarta => `${palo}-${JOTA}` as IdCarta;
export const reyDe = (palo: PaloFrances): IdCarta => `${palo}-${REY}` as IdCarta;
export const damaDe = (palo: PaloFrances): IdCarta => `${palo}-${DAMA}` as IdCarta;

/** La carta que va ganando la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraSchnapsen(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloSchnapsen(mesa[0]!.carta);
  const fuerza = (c: IdCarta) =>
    paloSchnapsen(c) === triunfo
      ? 100 + rangoSchnapsen(c)
      : paloSchnapsen(c) === salida
        ? rangoSchnapsen(c)
        : 0;
  return mesa.reduce((mejor, j) => (fuerza(j.carta) > fuerza(mejor.carta) ? j : mejor));
}

/**
 * Las cartas que se pueden jugar. Con el mazo abierto, cualquiera. Con las reglas estrictas, al
 * responder: del palo de salida (ganando si se puede), si no triunfo, y si no cualquiera.
 */
export function cartasLegalesSchnapsen(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
  estrictas: boolean,
): IdCarta[] {
  if (mesa.length === 0 || !estrictas) return [...mano];
  const salida = mesa[0]!.carta;
  const delPalo = mano.filter((c) => paloSchnapsen(c) === paloSchnapsen(salida));
  if (delPalo.length > 0) {
    const ganan = delPalo.filter((c) => rangoSchnapsen(c) > rangoSchnapsen(salida));
    return ganan.length > 0 ? ganan : delPalo;
  }
  const triunfos = mano.filter((c) => paloSchnapsen(c) === triunfo);
  return triunfos.length > 0 ? triunfos : [...mano];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const otro = (a: Asiento): Asiento => (a === 0 ? 1 : 0);

const partidaTerminada = (e: Pick<EstadoSchnapsen, 'puntos'>) =>
  Math.max(...e.puntos) >= PUNTOS_PARTIDA_SCHNAPSEN;

/** Con el mazo cerrado o agotado rigen las reglas estrictas. */
export const reglasEstrictas = (e: Pick<EstadoSchnapsen, 'cerrado' | 'cartaVuelta'>) =>
  e.cerrado !== null || e.cartaVuelta === null;

/** Los puntos de la mano: los de las bazas y, si ya tiene alguna baza, sus cantes. */
export function puntosManoSchnapsen(
  e: Pick<EstadoSchnapsen, 'puntosBazas' | 'bazas' | 'cantes'>,
  asiento: Asiento,
): number {
  const cantes =
    e.bazas[asiento]! > 0
      ? e.cantes.filter((c) => c.asiento === asiento).reduce((s, c) => s + c.puntos, 0)
      : 0;
  return e.puntosBazas[asiento]! + cantes;
}

/** Puntos de partida para el ganador según cómo quedó el perdedor. */
export function puntosDePartida(bazasPerdedor: number, puntosPerdedor: number): number {
  if (bazasPerdedor === 0) return 3;
  return puntosPerdedor < PUNTOS_SCHNEIDER ? 2 : 1;
}

/** Las parejas de K y Q que `asiento` puede cantar. */
function palosCantables(e: EstadoSchnapsen, asiento: Asiento): PaloFrances[] {
  const mano = e.manos[asiento]!;
  return PALOS_FRANCESES.filter(
    (p) =>
      mano.includes(reyDe(p)) && mano.includes(damaDe(p)) && !e.cantes.some((c) => c.palo === p),
  );
}

function nuevaMano(
  config: ConfigSchnapsen,
  azar: EstadoAzar,
  repartidor: Asiento,
  previo: Pick<EstadoSchnapsen, 'puntos' | 'resultadosManos' | 'ultimaBaza' | 'ultimaAccion'>,
): EstadoSchnapsen {
  const { cartas, azar: azarSiguiente } = barajar(BARAJA_SCHNAPSEN, azar);
  const sale = otro(repartidor);
  const manos: IdCarta[][] = [[], []];
  manos[sale] = cartas.slice(0, CARTAS_MANO);
  manos[repartidor] = cartas.slice(CARTAS_MANO, 2 * CARTAS_MANO);
  const vuelta = cartas[2 * CARTAS_MANO]!;
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    mazo: cartas.slice(2 * CARTAS_MANO + 1),
    cartaVuelta: vuelta,
    triunfo: paloSchnapsen(vuelta),
    turno: sale,
    cerrado: null,
    mesa: [],
    jugadas: [],
    puntosBazas: [0, 0],
    bazas: [0, 0],
    cantes: [],
    cantado: null,
    fallos: [[], []],
    conocidas: [],
    puntos: previo.puntos,
    resultadosManos: previo.resultadosManos,
    ultimaBaza: previo.ultimaBaza,
    ultimaAccion: previo.ultimaAccion,
  };
}

function cerrarMano(
  e: EstadoSchnapsen,
  ganador: Asiento,
  motivo: MotivoSchnapsen,
): EstadoSchnapsen {
  const perdedor = otro(ganador);
  const puntosMano: DeDos<number> = [puntosManoSchnapsen(e, 0), puntosManoSchnapsen(e, 1)];
  let puntosPartida: number;
  if (e.cerrado === null) {
    puntosPartida = puntosDePartida(e.bazas[perdedor]!, puntosMano[perdedor]!);
  } else if (ganador === e.cerrado.asiento) {
    puntosPartida = puntosDePartida(e.cerrado.bazasRival, e.cerrado.puntosRival);
  } else {
    puntosPartida = e.cerrado.bazasRival === 0 ? 3 : 2;
  }
  const totales: DeDos<number> =
    ganador === 0
      ? [e.puntos[0] + puntosPartida, e.puntos[1]]
      : [e.puntos[0], e.puntos[1] + puntosPartida];
  const resultadosManos = [
    ...e.resultadosManos,
    {
      ganador,
      motivo,
      cerro: e.cerrado?.asiento ?? null,
      puntosMano,
      bazas: e.bazas,
      puntosPartida,
      totales,
    },
  ];
  const cerrado: EstadoSchnapsen = { ...e, puntos: totales, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, otro(e.repartidor), cerrado);
}

/** Tras cada baza, si el mazo está abierto, roba el ganador y después el otro. */
function robar(e: EstadoSchnapsen, ganador: Asiento): EstadoSchnapsen {
  if (e.cerrado !== null || e.cartaVuelta === null) return e;
  const pila = [...e.mazo, e.cartaVuelta];
  const manos = e.manos.map((m) => [...m]);
  manos[ganador]!.push(pila[0]!);
  manos[otro(ganador)]!.push(pila[1]!);
  const quedan = pila.slice(2);
  const conocidas =
    quedan.length === 0
      ? [...e.conocidas, { asiento: otro(ganador), carta: e.cartaVuelta }]
      : e.conocidas;
  return {
    ...e,
    manos,
    mazo: quedan.slice(0, -1),
    cartaVuelta: quedan.length > 0 ? quedan.at(-1)! : null,
    conocidas,
  };
}

function resolverBaza(e: EstadoSchnapsen): EstadoSchnapsen {
  const ganador = ganadoraSchnapsen(e.mesa, e.triunfo).asiento;
  const valor = e.mesa.reduce((s, j) => s + valorSchnapsen(j.carta), 0);
  const suma = (par: DeDos<number>, n: number): DeDos<number> =>
    ganador === 0 ? [par[0] + n, par[1]] : [par[0], par[1] + n];
  const resuelto: EstadoSchnapsen = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    jugadas: [...e.jugadas, ...e.mesa.map((j) => j.carta)],
    puntosBazas: suma(e.puntosBazas, valor),
    bazas: suma(e.bazas, 1),
  };
  if (puntosManoSchnapsen(resuelto, ganador) >= PUNTOS_MANO_SCHNAPSEN) {
    return cerrarMano(resuelto, ganador, '66');
  }
  const robado = robar(resuelto, ganador);
  if (robado.manos.every((m) => m.length === 0)) {
    return robado.cerrado === null
      ? cerrarMano(robado, ganador, 'ultima')
      : cerrarMano(robado, otro(robado.cerrado.asiento), 'cierre');
  }
  return robado;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const schnapsen: Juego<ConfigSchnapsen, EstadoSchnapsen, AccionSchnapsen, VistaSchnapsen> = {
  id: 'schnapsen',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Schnapsen se juega entre 2');
    return ok(
      nuevaMano({ jugadores: 2 }, crearAzar(semilla), 1, {
        puntos: [0, 0],
        resultadosManos: [],
        ultimaBaza: null,
        ultimaAccion: null,
      }),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    const jugar = (cartas: readonly IdCarta[]): AccionSchnapsen[] =>
      cartas.map((carta) => ({ tipo: 'jugar', carta }));
    if (e.mesa.length > 0) {
      return jugar(cartasLegalesSchnapsen(mano, e.mesa, e.triunfo, reglasEstrictas(e)));
    }
    if (e.cantado !== null) {
      return jugar(mano.filter((c) => c === reyDe(e.cantado!) || c === damaDe(e.cantado!)));
    }
    const acciones: AccionSchnapsen[] = [];
    const abierto = e.cerrado === null && e.cartaVuelta !== null;
    if (abierto && mano.includes(jotaDe(e.triunfo))) acciones.push({ tipo: 'cambiar' });
    for (const palo of palosCantables(e, asiento)) acciones.push({ tipo: 'cantar', palo });
    if (abierto) acciones.push({ tipo: 'cerrar' });
    return [...acciones, ...jugar(mano)];
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoSchnapsen = { ...e, ultimaAccion: { asiento, accion } };
    switch (accion.tipo) {
      case 'cambiar': {
        const jota = jotaDe(e.triunfo);
        const vuelta = e.cartaVuelta!;
        return {
          ...hecha,
          manos: e.manos.map((m, a) =>
            a === asiento ? [...m.filter((c) => c !== jota), vuelta] : m,
          ),
          cartaVuelta: jota,
          conocidas: [...e.conocidas, { asiento, carta: vuelta }],
        };
      }
      case 'cantar': {
        const cantado: EstadoSchnapsen = {
          ...hecha,
          cantes: [
            ...e.cantes,
            { asiento, palo: accion.palo, puntos: accion.palo === e.triunfo ? 40 : 20 },
          ],
          cantado: accion.palo,
        };
        return e.bazas[asiento]! > 0 &&
          puntosManoSchnapsen(cantado, asiento) >= PUNTOS_MANO_SCHNAPSEN
          ? cerrarMano(cantado, asiento, '66')
          : cantado;
      }
      case 'cerrar':
        return {
          ...hecha,
          cerrado: {
            asiento,
            bazasRival: e.bazas[otro(asiento)]!,
            puntosRival: puntosManoSchnapsen(e, otro(asiento)),
          },
        };
      case 'jugar': {
        const carta = accion.carta;
        const mesa = [...e.mesa, { asiento, carta }];
        let fallos = e.fallos;
        if (e.mesa.length > 0 && reglasEstrictas(e)) {
          const salida = paloSchnapsen(e.mesa[0]!.carta);
          if (paloSchnapsen(carta) !== salida) {
            const nuevos = paloSchnapsen(carta) === e.triunfo ? [salida] : [salida, e.triunfo];
            fallos = e.fallos.map((f, a) =>
              a === asiento ? [...f, ...nuevos.filter((p) => !f.includes(p))] : f,
            );
          }
        }
        const jugado: EstadoSchnapsen = {
          ...hecha,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
          mesa,
          cantado: null,
          fallos,
          conocidas: e.conocidas.filter((k) => k.carta !== carta),
        };
        return mesa.length < JUGADORES ? { ...jugado, turno: otro(asiento) } : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      enMazo: e.mazo.length,
      cartaVuelta: e.cartaVuelta,
      triunfo: e.triunfo,
      repartidor: e.repartidor,
      turno: partidaTerminada(e) ? null : e.turno,
      cerrado: e.cerrado,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadas: [...e.jugadas],
      puntosBazas: e.puntosBazas,
      bazas: e.bazas,
      cantes: [...e.cantes],
      cantado: e.cantado,
      fallos: e.fallos.map((f) => [...f]),
      conocidas: [...e.conocidas],
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
      ultimaAccion: e.ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const gana = e.puntos[0] >= PUNTOS_PARTIDA_SCHNAPSEN ? 0 : 1;
    return { ganadores: [gana], empate: false, puntos: [e.puntos[0], e.puntos[1]] };
  },
};
