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

/** El Belote clásico no tiene opciones: 4 jugadores en parejas y partida a 501. */
export interface ConfigBelote {
  readonly jugadores: 4;
}

export const CONFIG_BELOTE_POR_DEFECTO: ConfigBelote = { jugadores: 4 };

export const PUNTOS_PARTIDA_BELOTE = 501;
/** Lo que valen las cartas y el diez de últimas de una mano. */
export const PUNTOS_MANO_BELOTE = 162;
export const PUNTOS_CAPOT_BELOTE = 252;
export const PUNTOS_BELOTE = 20;
export const DIEZ_DE_ULTIMAS = 10;
const JUGADORES = 4;
const CARTAS_PRIMERAS = 5;
const CARTAS_MANO = 8;

export type FaseBelote = 'primera' | 'segunda' | 'bazas';
type DePareja<T> = readonly [T, T];

export type AccionBelote =
  | { readonly tipo: 'tomar' }
  | { readonly tipo: 'nombrar'; readonly palo: PaloFrances }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface AccionBeloteHecha {
  readonly asiento: Asiento;
  readonly accion: AccionBelote;
}

export interface AnuncioBelote {
  readonly asiento: Asiento;
  readonly tipo: 'belote' | 'rebelote';
}

export interface ResultadoManoBelote {
  readonly elige: Asiento;
  readonly triunfo: PaloFrances;
  /** Puntos de las cartas de las bazas de cada pareja. */
  readonly cartas: DePareja<number>;
  /** La pareja que hizo la última baza. */
  readonly ultimas: 0 | 1;
  /** La pareja que tuvo el belote, si alguna. */
  readonly belote: 0 | 1 | null;
  readonly bazas: DePareja<number>;
  /** Lo que hizo cada pareja: cartas, diez de últimas y belote. */
  readonly hechos: DePareja<number>;
  readonly puntosMano: DePareja<number>;
  /** Puntos de la partida tras la mano. */
  readonly totales: DePareja<number>;
  /** La pareja que eligió hizo menos que la otra. */
  readonly dentro: boolean;
  /** La pareja que hizo las 8 bazas, si alguna. */
  readonly capot: 0 | 1 | null;
}

export interface EstadoBelote {
  readonly config: ConfigBelote;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseBelote;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly cartaVuelta: IdCarta;
  /** Las cartas que quedan por repartir tras elegir el triunfo. */
  readonly mazo: readonly IdCarta[];
  readonly turno: Asiento;
  /** Pases en la vuelta en curso. */
  readonly pasaron: number;
  readonly triunfo: PaloFrances | null;
  readonly elige: Asiento | null;
  /** Quien tiene el rey y la dama del triunfo: oculto hasta que lo anuncia. */
  readonly belote: Asiento | null;
  readonly anuncios: readonly AnuncioBelote[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  /** Bazas de cada pareja en la mano. */
  readonly bazas: DePareja<number>;
  /** Puntos de las cartas de las bazas de cada pareja en la mano. */
  readonly puntosBazas: DePareja<number>;
  /** Palos que cada uno ya no tiene: el de salida que no siguió, o el triunfo si no falló. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  /** Cartas jugadas en las bazas cerradas de esta mano. */
  readonly jugadas: readonly IdCarta[];
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoBelote[];
  readonly manosAnuladas: number;
  readonly ultimaAccion: AccionBeloteHecha | null;
}

export interface VistaBelote {
  readonly config: ConfigBelote;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly enMazo: number;
  readonly repartidor: Asiento;
  readonly fase: FaseBelote;
  readonly cartaVuelta: IdCarta;
  readonly turno: Asiento | null;
  readonly pasaron: number;
  readonly triunfo: PaloFrances | null;
  readonly elige: Asiento | null;
  readonly anuncios: readonly AnuncioBelote[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoBelote['ultimaBaza'];
  readonly bazas: DePareja<number>;
  readonly puntosBazas: DePareja<number>;
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly jugadas: readonly IdCarta[];
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoBelote[];
  readonly manosAnuladas: number;
  readonly ultimaAccion: AccionBeloteHecha | null;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La baraja de 32: del 7 al As de cada palo. */
export const BARAJA_BELOTE: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

export const paloBelote = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const numero = (c: IdCarta) => cartaDeId(c)!.valor;
const REY = 13;
const DAMA = 12;

// Orden dentro del palo, por número (1 es el As).
const RANGO_TRIUNFO: Record<number, number> = {
  11: 8,
  9: 7,
  1: 6,
  10: 5,
  13: 4,
  12: 3,
  8: 2,
  7: 1,
};
const RANGO_NORMAL: Record<number, number> = { 1: 8, 10: 7, 13: 6, 12: 5, 11: 4, 9: 3, 8: 2, 7: 1 };
const VALOR_TRIUNFO: Record<number, number> = { 11: 20, 9: 14, 1: 11, 10: 10, 13: 4, 12: 3 };
const VALOR_NORMAL: Record<number, number> = { 1: 11, 10: 10, 13: 4, 12: 3, 11: 2 };

const esTriunfo = (c: IdCarta, triunfo: PaloFrances | null) => paloBelote(c) === triunfo;

/** El orden de la carta dentro de su palo, de 1 (el 7) a 8 (la J del triunfo o el As). */
export function rangoBelote(c: IdCarta, triunfo: PaloFrances | null): number {
  return (esTriunfo(c, triunfo) ? RANGO_TRIUNFO : RANGO_NORMAL)[numero(c)]!;
}

/** Los puntos que vale la carta. */
export function valorBelote(c: IdCarta, triunfo: PaloFrances | null): number {
  return (esTriunfo(c, triunfo) ? VALOR_TRIUNFO : VALOR_NORMAL)[numero(c)] ?? 0;
}

export const parejaBelote = (a: Asiento) => (a % 2) as 0 | 1;

export const esReyODamaDelTriunfo = (c: IdCarta, triunfo: PaloFrances | null) =>
  esTriunfo(c, triunfo) && (numero(c) === REY || numero(c) === DAMA);

/** La carta que va ganando la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraBelote(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloBelote(mesa[0]!.carta);
  const fuerza = (c: IdCarta) =>
    esTriunfo(c, triunfo)
      ? 100 + rangoBelote(c, triunfo)
      : paloBelote(c) === salida
        ? rangoBelote(c, triunfo)
        : 0;
  return mesa.reduce((mejor, j) => (fuerza(j.carta) > fuerza(mejor.carta) ? j : mejor));
}

/** El triunfo más alto de la mesa, o 0 si no hay ninguno. */
const triunfoMasAlto = (mesa: readonly CartaJugada[], triunfo: PaloFrances) =>
  Math.max(
    0,
    ...mesa.filter((j) => esTriunfo(j.carta, triunfo)).map((j) => rangoBelote(j.carta, triunfo)),
  );

/** Los triunfos de `cartas` que montan sobre la mesa, o todos si ninguno monta. */
function montando(cartas: readonly IdCarta[], mesa: readonly CartaJugada[], triunfo: PaloFrances) {
  const tope = triunfoMasAlto(mesa, triunfo);
  const altos = cartas.filter((c) => rangoBelote(c, triunfo) > tope);
  return altos.length > 0 ? altos : [...cartas];
}

/** El compañero de `asiento` va ganando la baza. */
export const vaGanandoCompanero = (
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
  asiento: Asiento,
) =>
  mesa.length > 0 && parejaBelote(ganadoraBelote(mesa, triunfo).asiento) === parejaBelote(asiento);

/** Las cartas que se pueden jugar: seguir el palo, montar en el triunfo y fallar. */
export function cartasLegalesBelote(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
  asiento: Asiento,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloBelote(mesa[0]!.carta);
  const triunfos = mano.filter((c) => esTriunfo(c, triunfo));
  if (salida === triunfo)
    return triunfos.length > 0 ? montando(triunfos, mesa, triunfo) : [...mano];
  const delPalo = mano.filter((c) => paloBelote(c) === salida);
  if (delPalo.length > 0) return delPalo;
  if (triunfos.length === 0 || vaGanandoCompanero(mesa, triunfo, asiento)) return [...mano];
  return montando(triunfos, mesa, triunfo);
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

const partidaTerminada = (e: Pick<EstadoBelote, 'puntos'>) =>
  Math.max(...e.puntos) >= PUNTOS_PARTIDA_BELOTE && e.puntos[0] !== e.puntos[1];

function nuevaMano(
  config: ConfigBelote,
  azar: EstadoAzar,
  repartidor: Asiento,
  previo: Pick<
    EstadoBelote,
    'puntos' | 'resultadosManos' | 'manosAnuladas' | 'ultimaBaza' | 'ultimaAccion'
  >,
): EstadoBelote {
  const { cartas, azar: azarSiguiente } = barajar(BARAJA_BELOTE, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(
      k * CARTAS_PRIMERAS,
      (k + 1) * CARTAS_PRIMERAS,
    );
  }
  const resto = cartas.slice(JUGADORES * CARTAS_PRIMERAS);
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    fase: 'primera',
    manos,
    cartaVuelta: resto[0]!,
    mazo: resto.slice(1),
    turno: siguiente(repartidor),
    pasaron: 0,
    triunfo: null,
    elige: null,
    belote: null,
    anuncios: [],
    mesa: [],
    bazas: [0, 0],
    puntosBazas: [0, 0],
    fallos: Array.from({ length: JUGADORES }, () => []),
    jugadas: [],
    puntos: previo.puntos,
    resultadosManos: previo.resultadosManos,
    manosAnuladas: previo.manosAnuladas,
    ultimaBaza: previo.ultimaBaza,
    ultimaAccion: previo.ultimaAccion,
  };
}

/** Quien tiene el rey y la dama del triunfo en la mano, si alguno. */
export function tieneBelote(
  manos: readonly (readonly IdCarta[])[],
  triunfo: PaloFrances,
): Asiento | null {
  const a = manos.findIndex((m) => m.filter((c) => esReyODamaDelTriunfo(c, triunfo)).length === 2);
  return a < 0 ? null : a;
}

/** Tras elegir el triunfo: quien eligió se lleva la carta vuelta y se reparte el resto. */
function elegir(e: EstadoBelote, asiento: Asiento, triunfo: PaloFrances): EstadoBelote {
  const manos = e.manos.map((m) => [...m]);
  manos[asiento]!.push(e.cartaVuelta);
  let k = 0;
  for (let i = 1; i <= JUGADORES; i++) {
    const a = (e.repartidor + i) % JUGADORES;
    const faltan = CARTAS_MANO - manos[a]!.length;
    manos[a]!.push(...e.mazo.slice(k, k + faltan));
    k += faltan;
  }
  return {
    ...e,
    fase: 'bazas',
    manos,
    mazo: [],
    triunfo,
    elige: asiento,
    pasaron: 0,
    belote: tieneBelote(manos, triunfo),
    turno: siguiente(e.repartidor),
  };
}

/** Los puntos que se apunta cada pareja al acabar la mano. */
export function puntuarManoBelote(
  hechos: DePareja<number>,
  bazas: DePareja<number>,
  elige: 0 | 1,
  belote: 0 | 1 | null,
): { puntosMano: [number, number]; dentro: boolean; capot: 0 | 1 | null } {
  const conBelote = (p: 0 | 1) => (belote === p ? PUNTOS_BELOTE : 0);
  const capot = bazas[0] === CARTAS_MANO ? 0 : bazas[1] === CARTAS_MANO ? 1 : null;
  if (capot !== null) {
    const puntosMano: [number, number] = [conBelote(0), conBelote(1)];
    puntosMano[capot] += PUNTOS_CAPOT_BELOTE;
    return { puntosMano, dentro: capot !== elige, capot };
  }
  if (hechos[elige] >= hechos[1 - elige]!) {
    return { puntosMano: [hechos[0], hechos[1]], dentro: false, capot: null };
  }
  const puntosMano: [number, number] = [conBelote(0), conBelote(1)];
  puntosMano[elige === 0 ? 1 : 0] += PUNTOS_MANO_BELOTE;
  return { puntosMano, dentro: true, capot: null };
}

function cerrarMano(e: EstadoBelote, ultimas: 0 | 1): EstadoBelote {
  const elige = parejaBelote(e.elige!);
  const belote = e.belote === null ? null : parejaBelote(e.belote);
  const hecho = (p: 0 | 1) =>
    e.puntosBazas[p] + (ultimas === p ? DIEZ_DE_ULTIMAS : 0) + (belote === p ? PUNTOS_BELOTE : 0);
  const hechos: DePareja<number> = [hecho(0), hecho(1)];
  const { puntosMano, dentro, capot } = puntuarManoBelote(hechos, e.bazas, elige, belote);
  const totales: DePareja<number> = [e.puntos[0] + puntosMano[0], e.puntos[1] + puntosMano[1]];
  const resultadosManos = [
    ...e.resultadosManos,
    {
      elige: e.elige!,
      triunfo: e.triunfo!,
      cartas: e.puntosBazas,
      ultimas,
      belote,
      bazas: e.bazas,
      hechos,
      puntosMano,
      totales,
      dentro,
      capot,
    },
  ];
  const cerrado: EstadoBelote = { ...e, puntos: totales, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, siguiente(e.repartidor), cerrado);
}

function resolverBaza(e: EstadoBelote): EstadoBelote {
  const triunfo = e.triunfo!;
  const ganador = ganadoraBelote(e.mesa, triunfo).asiento;
  const p = parejaBelote(ganador);
  const valor = e.mesa.reduce((s, j) => s + valorBelote(j.carta, triunfo), 0);
  const suma = (par: DePareja<number>, n: number): DePareja<number> =>
    p === 0 ? [par[0] + n, par[1]] : [par[0], par[1] + n];
  const resuelto: EstadoBelote = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    jugadas: [...e.jugadas, ...e.mesa.map((j) => j.carta)],
    bazas: suma(e.bazas, 1),
    puntosBazas: suma(e.puntosBazas, valor),
  };
  return resuelto.bazas[0] + resuelto.bazas[1] === CARTAS_MANO ? cerrarMano(resuelto, p) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const belote: Juego<ConfigBelote, EstadoBelote, AccionBelote, VistaBelote> = {
  id: 'belote',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Belote se juega con 4 jugadores');
    return ok(
      nuevaMano({ jugadores: 4 }, crearAzar(semilla), JUGADORES - 1, {
        puntos: [0, 0],
        resultadosManos: [],
        manosAnuladas: 0,
        ultimaBaza: null,
        ultimaAccion: null,
      }),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'primera':
        return [{ tipo: 'tomar' }, { tipo: 'pasar' }];
      case 'segunda': {
        const vuelta = paloBelote(e.cartaVuelta);
        return [
          ...PALOS_FRANCESES.filter((p) => p !== vuelta).map((palo): AccionBelote => ({
            tipo: 'nombrar',
            palo,
          })),
          { tipo: 'pasar' },
        ];
      }
      case 'bazas':
        return cartasLegalesBelote(e.manos[asiento]!, e.mesa, e.triunfo!, asiento).map((carta) => ({
          tipo: 'jugar',
          carta,
        }));
    }
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoBelote = { ...e, ultimaAccion: { asiento, accion } };
    switch (accion.tipo) {
      case 'tomar':
        return elegir(hecha, asiento, paloBelote(e.cartaVuelta));
      case 'nombrar':
        return elegir(hecha, asiento, accion.palo);
      case 'pasar': {
        const pasaron = e.pasaron + 1;
        if (pasaron < JUGADORES) return { ...hecha, pasaron, turno: siguiente(asiento) };
        if (e.fase === 'primera') {
          return { ...hecha, fase: 'segunda', pasaron: 0, turno: siguiente(e.repartidor) };
        }
        // Nadie elige: mano anulada y reparte el siguiente.
        return nuevaMano(e.config, e.azar, siguiente(e.repartidor), {
          ...hecha,
          manosAnuladas: e.manosAnuladas + 1,
        });
      }
      case 'jugar': {
        const triunfo = e.triunfo!;
        const carta = accion.carta;
        const mesa = [...e.mesa, { asiento, carta }];
        const salida = paloBelote(mesa[0]!.carta);
        // Lo que se sabe de su mano: el palo que no siguió, y el triunfo si no falló debiendo.
        const nuevos: PaloFrances[] = [];
        if (paloBelote(carta) !== salida) {
          nuevos.push(salida);
          if (!esTriunfo(carta, triunfo) && !vaGanandoCompanero(e.mesa, triunfo, asiento)) {
            nuevos.push(triunfo);
          }
        }
        const fallos = e.fallos.map((f, a) =>
          a === asiento ? [...f, ...nuevos.filter((p) => !f.includes(p))] : f,
        );
        const anuncios =
          asiento === e.belote && esReyODamaDelTriunfo(carta, triunfo)
            ? [
                ...e.anuncios,
                {
                  asiento,
                  tipo: e.anuncios.length === 0 ? ('belote' as const) : ('rebelote' as const),
                },
              ]
            : e.anuncios;
        const jugado: EstadoBelote = {
          ...hecha,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
          mesa,
          fallos,
          anuncios,
        };
        return mesa.length < JUGADORES
          ? { ...jugado, turno: siguiente(asiento) }
          : resolverBaza(jugado);
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
      repartidor: e.repartidor,
      fase: e.fase,
      cartaVuelta: e.cartaVuelta,
      turno: partidaTerminada(e) ? null : e.turno,
      pasaron: e.pasaron,
      triunfo: e.triunfo,
      elige: e.elige,
      anuncios: [...e.anuncios],
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: e.bazas,
      puntosBazas: e.puntosBazas,
      fallos: e.fallos.map((f) => [...f]),
      jugadas: [...e.jugadas],
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
      manosAnuladas: e.manosAnuladas,
      ultimaAccion: e.ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaBelote(a)]),
    };
  },
};
