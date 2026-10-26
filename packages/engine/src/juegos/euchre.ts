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

/** El Euchre clásico no tiene opciones: 4 jugadores en parejas y partida a 10. */
export interface ConfigEuchre {
  readonly jugadores: 4;
}

export const CONFIG_EUCHRE_POR_DEFECTO: ConfigEuchre = { jugadores: 4 };

export const PUNTOS_PARTIDA_EUCHRE = 10;
const JUGADORES = 4;
const CARTAS_MANO = 5;

export type FaseEuchre = 'primera' | 'segunda' | 'descarte' | 'bazas';
type DePareja<T> = readonly [T, T];

export type AccionEuchre =
  | { readonly tipo: 'pedir'; readonly solo: boolean }
  | { readonly tipo: 'nombrar'; readonly palo: PaloFrances; readonly solo: boolean }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface AccionEuchreHecha {
  readonly asiento: Asiento;
  /** El descarte del repartidor se ve sin la carta, salvo para él. */
  readonly accion: AccionEuchre | { readonly tipo: 'descartar' };
}

export interface ResultadoManoEuchre {
  readonly elige: Asiento;
  readonly solo: boolean;
  readonly triunfo: PaloFrances;
  readonly bazas: DePareja<number>;
  readonly puntosMano: DePareja<number>;
  /** Puntos de la partida tras la mano. */
  readonly totales: DePareja<number>;
  /** La pareja que eligió no llegó a 3 bazas. */
  readonly euchre: boolean;
}

export interface EstadoEuchre {
  readonly config: ConfigEuchre;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseEuchre;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly cartaVuelta: IdCarta;
  /** Las 3 cartas que no se juegan. */
  readonly ocultas: readonly IdCarta[];
  readonly turno: Asiento;
  /** Pases en la vuelta en curso. */
  readonly pasaron: number;
  readonly triunfo: PaloFrances | null;
  readonly elige: Asiento | null;
  readonly solo: boolean;
  /** El compañero del que juega solo: deja la mano. */
  readonly fuera: Asiento | null;
  /** El repartidor recogió la carta vuelta. */
  readonly recogioVuelta: boolean;
  readonly descarte: IdCarta | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazas: readonly number[];
  /** Palos efectivos de salida que cada uno no siguió en esta mano: no le quedan. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  /** Cartas jugadas en las bazas de esta mano. */
  readonly jugadas: readonly IdCarta[];
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoEuchre[];
  readonly manosAnuladas: number;
  readonly ultimaAccion: AccionEuchreHecha | null;
}

export interface VistaEuchre {
  readonly config: ConfigEuchre;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  readonly fase: FaseEuchre;
  readonly cartaVuelta: IdCarta;
  readonly turno: Asiento | null;
  readonly pasaron: number;
  readonly triunfo: PaloFrances | null;
  readonly elige: Asiento | null;
  readonly solo: boolean;
  readonly fuera: Asiento | null;
  readonly recogioVuelta: boolean;
  /** El descarte, solo para el repartidor. */
  readonly descarte: IdCarta | null;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoEuchre['ultimaBaza'];
  readonly bazas: readonly number[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly jugadas: readonly IdCarta[];
  readonly puntos: DePareja<number>;
  readonly resultadosManos: readonly ResultadoManoEuchre[];
  readonly manosAnuladas: number;
  readonly ultimaAccion: AccionEuchreHecha | null;
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La baraja de 24: del 9 al As de cada palo. */
export const BARAJA_EUCHRE: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 9;
});

const COMPANERO_DE_PALO: Record<PaloFrances, PaloFrances> = {
  picas: 'treboles',
  treboles: 'picas',
  corazones: 'diamantes',
  diamantes: 'corazones',
};

const paloNatural = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
const JOTA = 11;

export const esBowerDerecho = (c: IdCarta, triunfo: PaloFrances | null) =>
  triunfo !== null && c === `${triunfo}-${JOTA}`;
export const esBowerIzquierdo = (c: IdCarta, triunfo: PaloFrances | null) =>
  triunfo !== null && c === `${COMPANERO_DE_PALO[triunfo]}-${JOTA}`;

/** El palo a efectos del juego: el bower izquierdo es del triunfo. */
export function paloEuchre(c: IdCarta, triunfo: PaloFrances | null): PaloFrances {
  return esBowerIzquierdo(c, triunfo) ? triunfo! : paloNatural(c);
}

/** Rango para ganar: bower derecho 16, izquierdo 15, As 14 y las demás su número. */
export function rangoEuchre(c: IdCarta, triunfo: PaloFrances | null): number {
  if (esBowerDerecho(c, triunfo)) return 16;
  if (esBowerIzquierdo(c, triunfo)) return 15;
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
}

export const parejaEuchre = (a: Asiento) => (a % 2) as 0 | 1;

/** La carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraEuchre(mesa: readonly CartaJugada[], triunfo: PaloFrances): CartaJugada {
  const salida = paloEuchre(mesa[0]!.carta, triunfo);
  const valor = (c: IdCarta) => {
    const p = paloEuchre(c, triunfo);
    return p === triunfo
      ? 100 + rangoEuchre(c, triunfo)
      : p === salida
        ? rangoEuchre(c, triunfo)
        : 0;
  };
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Las cartas que se pueden jugar: las del palo efectivo de salida, si se tienen. */
export function cartasLegalesEuchre(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances,
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloEuchre(mesa[0]!.carta, triunfo);
  const delPalo = mano.filter((c) => paloEuchre(c, triunfo) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** El siguiente que juega, saltando al que deja la mano. */
const siguienteEnMano = (e: Pick<EstadoEuchre, 'fuera'>, a: Asiento): Asiento => {
  const s = siguiente(a);
  return s === e.fuera ? siguiente(s) : s;
};

const partidaTerminada = (e: Pick<EstadoEuchre, 'puntos'>) =>
  Math.max(...e.puntos) >= PUNTOS_PARTIDA_EUCHRE;

function nuevaMano(
  config: ConfigEuchre,
  azar: EstadoAzar,
  repartidor: Asiento,
  previo: Pick<
    EstadoEuchre,
    'puntos' | 'resultadosManos' | 'manosAnuladas' | 'ultimaBaza' | 'ultimaAccion'
  >,
): EstadoEuchre {
  const { cartas, azar: azarSiguiente } = barajar(BARAJA_EUCHRE, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  for (let k = 0; k < JUGADORES; k++) {
    manos[(repartidor + 1 + k) % JUGADORES] = cartas.slice(k * CARTAS_MANO, (k + 1) * CARTAS_MANO);
  }
  const resto = cartas.slice(JUGADORES * CARTAS_MANO);
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    fase: 'primera',
    manos,
    cartaVuelta: resto[0]!,
    ocultas: resto.slice(1),
    turno: siguiente(repartidor),
    pasaron: 0,
    triunfo: null,
    elige: null,
    solo: false,
    fuera: null,
    recogioVuelta: false,
    descarte: null,
    mesa: [],
    bazas: new Array<number>(JUGADORES).fill(0),
    fallos: Array.from({ length: JUGADORES }, () => []),
    jugadas: [],
    puntos: previo.puntos,
    resultadosManos: previo.resultadosManos,
    manosAnuladas: previo.manosAnuladas,
    ultimaBaza: previo.ultimaBaza,
    ultimaAccion: previo.ultimaAccion,
  };
}

/** Tras elegir el triunfo: el repartidor recoge la carta vuelta o se empieza a jugar. */
function elegir(
  e: EstadoEuchre,
  asiento: Asiento,
  triunfo: PaloFrances,
  solo: boolean,
  conVuelta: boolean,
): EstadoEuchre {
  const fuera = solo ? (asiento + 2) % JUGADORES : null;
  const elegido = { ...e, triunfo, elige: asiento, solo, fuera, pasaron: 0 };
  if (conVuelta && fuera !== e.repartidor) {
    return {
      ...elegido,
      fase: 'descarte',
      recogioVuelta: true,
      manos: e.manos.map((m, a) => (a === e.repartidor ? [...m, e.cartaVuelta] : m)),
      turno: e.repartidor,
    };
  }
  return { ...elegido, fase: 'bazas', turno: siguienteEnMano(elegido, e.repartidor) };
}

function cerrarMano(e: EstadoEuchre): EstadoEuchre {
  const bazas: [number, number] = [0, 0];
  e.bazas.forEach((b, a) => (bazas[parejaEuchre(a)] += b));
  const p = parejaEuchre(e.elige!);
  const puntosMano: [number, number] = [0, 0];
  const euchre = bazas[p] < 3;
  if (euchre) puntosMano[1 - p] = 2;
  else puntosMano[p] = bazas[p] === CARTAS_MANO ? (e.solo ? 4 : 2) : 1;
  const totales: DePareja<number> = [e.puntos[0] + puntosMano[0], e.puntos[1] + puntosMano[1]];
  const resultadosManos = [
    ...e.resultadosManos,
    { elige: e.elige!, solo: e.solo, triunfo: e.triunfo!, bazas, puntosMano, totales, euchre },
  ];
  const cerrado: EstadoEuchre = { ...e, puntos: totales, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, siguiente(e.repartidor), cerrado);
}

function resolverBaza(e: EstadoEuchre): EstadoEuchre {
  const ganador = ganadoraEuchre(e.mesa, e.triunfo!).asiento;
  const resuelto: EstadoEuchre = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  const jugadas = resuelto.bazas.reduce((s, b) => s + b, 0);
  return jugadas === CARTAS_MANO ? cerrarMano(resuelto) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const euchre: Juego<ConfigEuchre, EstadoEuchre, AccionEuchre, VistaEuchre> = {
  id: 'euchre',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Euchre se juega con 4 jugadores');
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
        return [{ tipo: 'pedir', solo: false }, { tipo: 'pedir', solo: true }, { tipo: 'pasar' }];
      case 'segunda': {
        const vuelta = paloNatural(e.cartaVuelta);
        return [
          ...PALOS_FRANCESES.filter((p) => p !== vuelta).flatMap((palo): AccionEuchre[] => [
            { tipo: 'nombrar', palo, solo: false },
            { tipo: 'nombrar', palo, solo: true },
          ]),
          { tipo: 'pasar' },
        ];
      }
      case 'descarte':
        return e.manos[asiento]!.map((carta) => ({ tipo: 'descartar', carta }));
      case 'bazas':
        return cartasLegalesEuchre(e.manos[asiento]!, e.mesa, e.triunfo!).map((carta) => ({
          tipo: 'jugar',
          carta,
        }));
    }
  },

  transicion(e, asiento, accion) {
    const hecha: EstadoEuchre = { ...e, ultimaAccion: { asiento, accion } };
    switch (accion.tipo) {
      case 'pedir':
        return elegir(hecha, asiento, paloNatural(e.cartaVuelta), accion.solo, true);
      case 'nombrar':
        return elegir(hecha, asiento, accion.palo, accion.solo, false);
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
      case 'descartar': {
        const listo: EstadoEuchre = {
          ...hecha,
          fase: 'bazas',
          descarte: accion.carta,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
        };
        return { ...listo, turno: siguienteEnMano(listo, e.repartidor) };
      }
      case 'jugar': {
        const triunfo = e.triunfo!;
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const salida = paloEuchre(mesa[0]!.carta, triunfo);
        const falla = paloEuchre(accion.carta, triunfo) !== salida;
        const jugado: EstadoEuchre = {
          ...hecha,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          mesa,
          jugadas: [...e.jugadas, accion.carta],
          fallos:
            falla && !e.fallos[asiento]!.includes(salida)
              ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f))
              : e.fallos,
        };
        const enMano = e.fuera === null ? JUGADORES : JUGADORES - 1;
        return mesa.length < enMano
          ? { ...jugado, turno: siguienteEnMano(jugado, asiento) }
          : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    const accion = e.ultimaAccion;
    const ultimaAccion =
      accion && accion.accion.tipo === 'descartar' && accion.asiento !== asiento
        ? { asiento: accion.asiento, accion: { tipo: 'descartar' as const } }
        : accion;
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      fase: e.fase,
      cartaVuelta: e.cartaVuelta,
      turno: partidaTerminada(e) ? null : e.turno,
      pasaron: e.pasaron,
      triunfo: e.triunfo,
      elige: e.elige,
      solo: e.solo,
      fuera: e.fuera,
      recogioVuelta: e.recogioVuelta,
      descarte: asiento === e.repartidor ? e.descarte : null,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      fallos: e.fallos.map((f) => [...f]),
      jugadas: [...e.jugadas],
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
      manosAnuladas: e.manosAnuladas,
      ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const gana = e.puntos[0] >= PUNTOS_PARTIDA_EUCHRE ? 0 : 1;
    return {
      ganadores: [gana, gana + 2],
      empate: false,
      puntos: Array.from({ length: JUGADORES }, (_, a) => e.puntos[parejaEuchre(a)]),
    };
  },
};
