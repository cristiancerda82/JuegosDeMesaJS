import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** 5 jugadores; las manos van en la config para que las pruebas usen partidas cortas. */
export interface ConfigSheepshead {
  readonly jugadores: 5;
  readonly manos: number;
}

export const CONFIG_SHEEPSHEAD_POR_DEFECTO: ConfigSheepshead = { jugadores: 5, manos: 10 };

export type FaseSheepshead = 'coger' | 'enterrar' | 'bazas';

/** Palo de una carta para seguir la salida: los triunfos son todos un palo. */
export type PaloEfectivoSheepshead = PaloFrances | 'triunfo';

export type AccionSheepshead =
  | { readonly tipo: 'coger' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'enterrar'; readonly carta: IdCarta }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface ResultadoManoSheepshead {
  readonly picker: Asiento | null;
  readonly companero: Asiento | null;
  readonly solo: boolean;
  readonly leaster: boolean;
  /** Puntos de cartas del bando del picker (con las enterradas); 0 en el leaster. */
  readonly puntosBando: number;
  readonly bazasBando: number;
  readonly ganadorLeaster: Asiento | null;
  /** Puntos de cartas de cada uno (con las enterradas o el blind del leaster). */
  readonly puntos: readonly number[];
  readonly anotado: readonly number[];
  readonly marcadorTras: readonly number[];
}

export interface EstadoSheepshead {
  readonly config: ConfigSheepshead;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly blind: readonly IdCarta[];
  readonly enterradas: readonly IdCarta[];
  readonly fase: FaseSheepshead;
  readonly turno: Asiento;
  readonly pasados: readonly boolean[];
  readonly picker: Asiento | null;
  readonly leaster: boolean;
  /** El dueño de la J de diamantes al empezar las bazas (`null` en el leaster). */
  readonly companero: Asiento | null;
  readonly companeroVisto: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos efectivos de salida que cada jugador no ha seguido en la mano. */
  readonly fallos: readonly (readonly PaloEfectivoSheepshead[])[];
  readonly bazas: readonly number[];
  /** Puntos de cartas de las bazas de cada jugador en la mano. */
  readonly puntosMano: readonly number[];
  readonly marcador: readonly number[];
  readonly resultadosManos: readonly ResultadoManoSheepshead[];
}

export interface VistaSheepshead {
  readonly config: ConfigSheepshead;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Las enterradas, solo para el picker. */
  readonly misEnterradas: readonly IdCarta[];
  readonly enBlind: number;
  readonly enterradas: number;
  readonly repartidor: Asiento;
  readonly fase: FaseSheepshead;
  readonly turno: Asiento | null;
  readonly pasados: readonly boolean[];
  readonly picker: Asiento | null;
  readonly leaster: boolean;
  /** El compañero si ya jugó la J de diamantes o si es este asiento; si no, `null`. */
  readonly companero: Asiento | null;
  readonly companeroVisto: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoSheepshead['ultimaBaza'];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloEfectivoSheepshead[])[];
  readonly bazas: readonly number[];
  readonly puntosMano: readonly number[];
  /** El número de la mano en la partida, desde 1. */
  readonly manoNumero: number;
  readonly marcador: readonly number[];
  readonly resultadosManos: readonly ResultadoManoSheepshead[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** 32 cartas francesas, del 7 al As. */
export const BARAJA_SHEEPSHEAD: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

export const J_DIAMANTES = 'diamantes-11' as IdCarta;

const PUNTOS: Readonly<Record<number, number>> = { 1: 11, 10: 10, 13: 4, 12: 3, 11: 2 };
const RANGO_PALO: Readonly<Record<number, number>> = { 1: 6, 10: 5, 13: 4, 9: 3, 8: 2, 7: 1 };
const ORDEN_PALOS: readonly PaloFrances[] = ['treboles', 'picas', 'corazones', 'diamantes'];
const id = (palo: PaloFrances, valor: number) => `${palo}-${valor}` as IdCarta;

/** Los 14 triunfos de mayor a menor. */
export const TRIUNFOS_SHEEPSHEAD: readonly IdCarta[] = [
  ...ORDEN_PALOS.map((p) => id(p, 12)),
  ...ORDEN_PALOS.map((p) => id(p, 11)),
  ...[1, 10, 13, 9, 8, 7].map((v) => id('diamantes', v)),
];

export const paloSheepshead = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
export const valorSheepshead = (c: IdCarta) => cartaDeId(c)!.valor;
export const puntosCartaSheepshead = (c: IdCarta) => PUNTOS[valorSheepshead(c)] ?? 0;
export const esTriunfoSheepshead = (c: IdCarta) => TRIUNFOS_SHEEPSHEAD.includes(c);

export const paloEfectivoSheepshead = (c: IdCarta): PaloEfectivoSheepshead =>
  esTriunfoSheepshead(c) ? 'triunfo' : paloSheepshead(c);

/** Fuerza de una carta: los triunfos de 113 a 100; el resto, su rango en el palo. */
export function fuerzaSheepshead(c: IdCarta): number {
  const i = TRIUNFOS_SHEEPSHEAD.indexOf(c);
  return i >= 0 ? 113 - i : RANGO_PALO[valorSheepshead(c)]!;
}

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraSheepshead(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = paloEfectivoSheepshead(mesa[0]!.carta);
  const valor = (c: IdCarta) => {
    const p = paloEfectivoSheepshead(c);
    return p === 'triunfo' || p === salida ? fuerzaSheepshead(c) : 0;
  };
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar: las del palo efectivo de salida; si no hay, todas. */
export function cartasLegalesSheepshead(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloEfectivoSheepshead(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloEfectivoSheepshead(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

// ── Cuenta ───────────────────────────────────────────────────────────────────

const JUGADORES = 5;
export const CARTAS_EN_MANO_SHEEPSHEAD = 6;
const ENTERRAR = 2;
const TODAS_LAS_BAZAS = CARTAS_EN_MANO_SHEEPSHEAD;

const ceros = () => [0, 0, 0, 0, 0];
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;
/** Los asientos en orden de juego desde el que sigue al que reparte. */
const ordenDesde = (repartidor: Asiento) =>
  Array.from({ length: JUGADORES }, (_, k) => (repartidor + 1 + k) % JUGADORES);

/** Lo que anota cada uno en una mano con picker. */
export function puntuarPickerSheepshead(
  picker: Asiento,
  companero: Asiento | null,
  puntosBando: number,
  bazasBando: number,
): number[] {
  let base: number;
  if (puntosBando >= 61) base = bazasBando === TODAS_LAS_BAZAS ? 3 : puntosBando >= 91 ? 2 : 1;
  else base = bazasBando === 0 ? -6 : puntosBando <= 30 ? -4 : -2;
  const solo = companero === null || companero === picker;
  return ceros().map((_, a) => {
    if (a === picker) return solo ? 4 * base : 2 * base;
    if (a === companero) return base;
    return -base;
  });
}

/** El ganador del leaster: menos puntos con alguna baza; luego menos bazas; luego el orden. */
export function ganadorLeasterSheepshead(
  puntos: readonly number[],
  bazas: readonly number[],
  repartidor: Asiento,
): Asiento | null {
  const candidatos = ordenDesde(repartidor).filter((a) => bazas[a]! > 0);
  if (candidatos.length === 0) return null;
  return candidatos.reduce((mejor, a) =>
    puntos[a]! < puntos[mejor]! || (puntos[a] === puntos[mejor] && bazas[a]! < bazas[mejor]!)
      ? a
      : mejor,
  );
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const terminada = (e: Pick<EstadoSheepshead, 'config' | 'resultadosManos'>) =>
  e.resultadosManos.length >= e.config.manos;

function nuevaMano(
  base: Pick<EstadoSheepshead, 'config' | 'marcador' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoSheepshead {
  const { cartas, azar: sig } = barajar(BARAJA_SHEEPSHEAD, azar);
  const manos: IdCarta[][] = new Array<IdCarta[]>(JUGADORES);
  ordenDesde(repartidor).forEach((a, k) => {
    manos[a] = cartas.slice(k * CARTAS_EN_MANO_SHEEPSHEAD, (k + 1) * CARTAS_EN_MANO_SHEEPSHEAD);
  });
  return {
    ...base,
    azar: sig,
    repartidor,
    manos,
    blind: cartas.slice(JUGADORES * CARTAS_EN_MANO_SHEEPSHEAD),
    enterradas: [],
    fase: 'coger',
    turno: siguiente(repartidor),
    pasados: [false, false, false, false, false],
    picker: null,
    leaster: false,
    companero: null,
    companeroVisto: false,
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    jugadasPor: [[], [], [], [], []],
    fallos: [[], [], [], [], []],
    bazas: ceros(),
    puntosMano: ceros(),
  };
}

/** Empiezan las bazas: sale el siguiente al que reparte. */
function aBazas(e: EstadoSheepshead): EstadoSheepshead {
  const dueno = e.manos.findIndex((m) => m.includes(J_DIAMANTES));
  return {
    ...e,
    fase: 'bazas',
    turno: siguiente(e.repartidor),
    companero: e.leaster || dueno < 0 ? null : dueno,
  };
}

function cerrarMano(e: EstadoSheepshead): EstadoSheepshead {
  const ultimo = e.ultimaBaza!.ganador;
  const sumaBlind = e.blind.reduce((s, c) => s + puntosCartaSheepshead(c), 0);
  const sumaEnterradas = e.enterradas.reduce((s, c) => s + puntosCartaSheepshead(c), 0);
  const puntos = e.puntosMano.map((p, a) => {
    if (e.leaster) return a === ultimo ? p + sumaBlind : p;
    return a === e.picker ? p + sumaEnterradas : p;
  });
  let anotado: number[];
  let puntosBando = 0;
  let bazasBando = 0;
  let ganadorLeaster: Asiento | null = null;
  if (e.leaster) {
    ganadorLeaster = ganadorLeasterSheepshead(puntos, e.bazas, e.repartidor);
    anotado = ceros().map((_, a) => (ganadorLeaster === null ? 0 : a === ganadorLeaster ? 4 : -1));
  } else {
    const bando = [
      e.picker!,
      ...(e.companero !== null && e.companero !== e.picker ? [e.companero] : []),
    ];
    puntosBando = bando.reduce((s, a) => s + puntos[a]!, 0);
    bazasBando = bando.reduce((s, a) => s + e.bazas[a]!, 0);
    anotado = puntuarPickerSheepshead(e.picker!, e.companero, puntosBando, bazasBando);
  }
  const marcadorTras = e.marcador.map((m, a) => m + anotado[a]!);
  const resultado: ResultadoManoSheepshead = {
    picker: e.picker,
    companero: e.companero,
    solo: !e.leaster && (e.companero === null || e.companero === e.picker),
    leaster: e.leaster,
    puntosBando,
    bazasBando,
    ganadorLeaster,
    puntos,
    anotado,
    marcadorTras,
  };
  const cerrado: EstadoSheepshead = {
    ...e,
    marcador: marcadorTras,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

function resolverBaza(e: EstadoSheepshead): EstadoSheepshead {
  const ganador = ganadoraSheepshead(e.mesa).asiento;
  const puntos = e.mesa.reduce((s, j) => s + puntosCartaSheepshead(j.carta), 0);
  const r: EstadoSheepshead = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    puntosMano: e.puntosMano.map((p, a) => (a === ganador ? p + puntos : p)),
  };
  return r.manos.every((m) => m.length === 0) ? cerrarMano(r) : r;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const sheepshead: Juego<
  ConfigSheepshead,
  EstadoSheepshead,
  AccionSheepshead,
  VistaSheepshead
> = {
  id: 'sheepshead',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Sheepshead se juega con 5 jugadores');
    if (!Number.isInteger(config.manos) || config.manos < 1) {
      return error('El número de manos debe ser un entero positivo');
    }
    // Reparte el asiento 4, así el asiento 0 decide primero.
    return ok(
      nuevaMano(
        { config: { jugadores: 5, manos: config.manos }, marcador: ceros(), resultadosManos: [] },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    switch (e.fase) {
      case 'coger':
        return [{ tipo: 'coger' }, { tipo: 'pasar' }];
      case 'enterrar':
        return [...mano]
          .filter((c) => c !== J_DIAMANTES)
          .sort()
          .map((carta) => ({ tipo: 'enterrar', carta }));
      case 'bazas':
        return cartasLegalesSheepshead(mano, e.mesa)
          .sort()
          .map((carta) => ({ tipo: 'jugar', carta }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'coger':
        return {
          ...e,
          fase: 'enterrar',
          picker: asiento,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, ...e.blind] : m)),
          blind: [],
        };
      case 'pasar': {
        const pasados = e.pasados.map((p, a) => p || a === asiento);
        if (pasados.every((p) => p)) return aBazas({ ...e, pasados, leaster: true });
        return { ...e, pasados, turno: siguiente(asiento) };
      }
      case 'enterrar': {
        const r: EstadoSheepshead = {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m)),
          enterradas: [...e.enterradas, accion.carta],
        };
        return r.enterradas.length < ENTERRAR ? r : aBazas(r);
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const salida = paloEfectivoSheepshead(mesa[0]!.carta);
        const noSigue = paloEfectivoSheepshead(accion.carta) !== salida;
        const jugado: EstadoSheepshead = {
          ...e,
          manos,
          mesa,
          companeroVisto: e.companeroVisto || accion.carta === J_DIAMANTES,
          jugadasPor: e.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
          fallos: e.fallos.map((f, a) =>
            a === asiento && noSigue && !f.includes(salida) ? [...f, salida] : f,
          ),
        };
        return mesa.length < JUGADORES
          ? { ...jugado, turno: siguiente(asiento) }
          : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    const companeroConocido = e.companeroVisto || (asiento !== null && asiento === e.companero);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      misEnterradas: asiento !== null && asiento === e.picker ? [...e.enterradas] : [],
      enBlind: e.blind.length,
      enterradas: e.enterradas.length,
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      pasados: [...e.pasados],
      picker: e.picker,
      leaster: e.leaster,
      companero: companeroConocido ? e.companero : null,
      companeroVisto: e.companeroVisto,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      fallos: e.fallos.map((f) => [...f]),
      bazas: [...e.bazas],
      puntosMano: [...e.puntosMano],
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      marcador: [...e.marcador],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = [...e.marcador];
    const maximo = Math.max(...puntos);
    const ganadores = puntos.flatMap((p, a) => (p === maximo ? [a] : []));
    if (ganadores.length === JUGADORES) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
