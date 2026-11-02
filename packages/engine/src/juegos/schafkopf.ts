import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** 4 jugadores; las manos van en la config para que las pruebas usen partidas cortas. */
export interface ConfigSchafkopf {
  readonly jugadores: 4;
  readonly manos: number;
}

export const CONFIG_SCHAFKOPF_POR_DEFECTO: ConfigSchafkopf = { jugadores: 4, manos: 12 };

/** Los palos cuyo As se puede llamar en el Rufspiel (los corazones son triunfo). */
export const PALOS_LLAMABLES_SCHAFKOPF = ['treboles', 'picas', 'diamantes'] as const;
export type PaloLlamable = (typeof PALOS_LLAMABLES_SCHAFKOPF)[number];

export type ContratoSchafkopf =
  | { readonly tipo: 'rufspiel'; readonly palo: PaloLlamable }
  | { readonly tipo: 'wenz' }
  | { readonly tipo: 'solo'; readonly palo: PaloFrances };

/** Palo de una carta para seguir la salida: los triunfos son todos un palo. */
export type PaloEfectivoSchafkopf = PaloFrances | 'triunfo';

export type AccionSchafkopf =
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'anunciar'; readonly contrato: ContratoSchafkopf }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface AnuncioSchafkopf {
  readonly asiento: Asiento;
  /** `null` si pasó. */
  readonly contrato: ContratoSchafkopf | null;
}

export interface ResultadoManoSchafkopf {
  /** `null` si todos pasaron. */
  readonly contrato: ContratoSchafkopf | null;
  readonly jugador: Asiento | null;
  readonly companero: Asiento | null;
  /** Puntos de cartas del lado del que juega. */
  readonly puntosJugador: number;
  readonly ganaJugador: boolean;
  readonly schneider: boolean;
  readonly schwarz: boolean;
  readonly laufende: number;
  readonly tarifa: number;
  readonly fichasMano: readonly number[];
  readonly fichasTras: readonly number[];
}

export interface EstadoSchafkopf {
  readonly config: ConfigSchafkopf;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: 'anuncio' | 'bazas';
  readonly turno: Asiento;
  readonly anuncios: readonly AnuncioSchafkopf[];
  /** El contrato más alto anunciado y quién lo anunció. */
  readonly contrato: ContratoSchafkopf | null;
  readonly jugador: Asiento | null;
  /** En el Rufspiel, el dueño del As llamado (se fija al empezar las bazas). */
  readonly companero: Asiento | null;
  /** Si ya se ha echado el As llamado. */
  readonly companeroVisto: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazas: readonly number[];
  /** Puntos de cartas de las bazas de cada jugador en la mano. */
  readonly puntosMano: readonly number[];
  /** Cartas que ha echado cada jugador en la mano (incluida la baza en curso). */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos efectivos de salida que cada jugador no ha seguido en la mano. */
  readonly fallos: readonly (readonly PaloEfectivoSchafkopf[])[];
  readonly fichas: readonly number[];
  readonly resultadosManos: readonly ResultadoManoSchafkopf[];
}

export interface VistaSchafkopf {
  readonly config: ConfigSchafkopf;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  readonly fase: EstadoSchafkopf['fase'];
  readonly turno: Asiento | null;
  readonly anuncios: readonly AnuncioSchafkopf[];
  readonly contrato: ContratoSchafkopf | null;
  readonly jugador: Asiento | null;
  /** El compañero si se ha echado el As llamado o si es este asiento; si no, `null`. */
  readonly companero: Asiento | null;
  readonly companeroVisto: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoSchafkopf['ultimaBaza'];
  readonly bazas: readonly number[];
  readonly puntosMano: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloEfectivoSchafkopf[])[];
  /** El número de la mano en la partida, desde 1. */
  readonly manoNumero: number;
  readonly fichas: readonly number[];
  readonly resultadosManos: readonly ResultadoManoSchafkopf[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La baraja de 32: del 7 al As de cada palo. */
export const BARAJA_SCHAFKOPF: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

const DAMA = 12;
const JOTA = 11;
const ORDEN_PALOS: readonly PaloFrances[] = ['treboles', 'picas', 'corazones', 'diamantes'];
const PUNTOS: Readonly<Record<number, number>> = { 1: 11, 10: 10, 13: 4, 12: 3, 11: 2 };
/** Orden en los palos que no son triunfo: A, 10, K, (Q en el Wenz), 9, 8 y 7. */
const RANGO_PALO: Readonly<Record<number, number>> = {
  1: 8,
  10: 7,
  13: 6,
  12: 5,
  9: 4,
  8: 3,
  7: 2,
};
const ORDEN_PALO_TRIUNFO = [1, 10, 13, 9, 8, 7];

export const paloSchafkopf = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
export const valorSchafkopf = (c: IdCarta) => cartaDeId(c)!.valor;
export const puntosCartaSchafkopf = (c: IdCarta) => PUNTOS[valorSchafkopf(c)] ?? 0;
const id = (palo: PaloFrances, valor: number) => `${palo}-${valor}` as IdCarta;

export const asLlamado = (palo: PaloLlamable) => id(palo, 1);

/** Rango de cada contrato: solo se puede anunciar uno mayor que el anunciado. */
export const RANGO_CONTRATO_SCHAFKOPF = { rufspiel: 1, wenz: 2, solo: 3 } as const;

/** Triunfos de mayor a menor en cada contrato. */
export function triunfosSchafkopf(contrato: ContratoSchafkopf): readonly IdCarta[] {
  const jotas = ORDEN_PALOS.map((p) => id(p, JOTA));
  if (contrato.tipo === 'wenz') return jotas;
  const palo = contrato.tipo === 'solo' ? contrato.palo : 'corazones';
  return [
    ...ORDEN_PALOS.map((p) => id(p, DAMA)),
    ...jotas,
    ...ORDEN_PALO_TRIUNFO.map((v) => id(palo, v)),
  ];
}

const cacheTriunfos = new Map<string, readonly IdCarta[]>();
function triunfos(contrato: ContratoSchafkopf): readonly IdCarta[] {
  const clave = `${contrato.tipo}-${'palo' in contrato ? contrato.palo : ''}`;
  let t = cacheTriunfos.get(clave);
  if (!t) cacheTriunfos.set(clave, (t = triunfosSchafkopf(contrato)));
  return t;
}

export const esTriunfoSchafkopf = (c: IdCarta, contrato: ContratoSchafkopf) =>
  triunfos(contrato).includes(c);

export function paloEfectivoSchafkopf(
  c: IdCarta,
  contrato: ContratoSchafkopf,
): PaloEfectivoSchafkopf {
  return esTriunfoSchafkopf(c, contrato) ? 'triunfo' : paloSchafkopf(c);
}

/** Fuerza de una carta: los triunfos por encima de todo; el resto, por su rango en el palo. */
export function fuerzaSchafkopf(c: IdCarta, contrato: ContratoSchafkopf): number {
  const t = triunfos(contrato);
  const i = t.indexOf(c);
  return i >= 0 ? 100 + t.length - i : RANGO_PALO[valorSchafkopf(c)]!;
}

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraSchafkopf(
  mesa: readonly CartaJugada[],
  contrato: ContratoSchafkopf,
): CartaJugada {
  const salida = paloEfectivoSchafkopf(mesa[0]!.carta, contrato);
  const valor = (c: IdCarta) => {
    const p = paloEfectivoSchafkopf(c, contrato);
    return p === 'triunfo' || p === salida ? fuerzaSchafkopf(c, contrato) : 0;
  };
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Si se puede llamar al As de `palo` con esta mano. */
export function puedeLlamar(mano: readonly IdCarta[], palo: PaloLlamable): boolean {
  return (
    !mano.includes(asLlamado(palo)) &&
    mano.some(
      (c) => paloSchafkopf(c) === palo && valorSchafkopf(c) !== DAMA && valorSchafkopf(c) !== JOTA,
    )
  );
}

/** Contratos que puede anunciar un jugador con esta mano por encima de `actual`. */
export function contratosPosiblesSchafkopf(
  mano: readonly IdCarta[],
  actual: ContratoSchafkopf | null,
): ContratoSchafkopf[] {
  const minimo = actual === null ? 0 : RANGO_CONTRATO_SCHAFKOPF[actual.tipo];
  const r: ContratoSchafkopf[] = [];
  if (minimo < 1) {
    for (const palo of PALOS_LLAMABLES_SCHAFKOPF) {
      if (puedeLlamar(mano, palo)) r.push({ tipo: 'rufspiel', palo });
    }
  }
  if (minimo < 2) r.push({ tipo: 'wenz' });
  if (minimo < 3) for (const palo of ORDEN_PALOS) r.push({ tipo: 'solo', palo });
  return r;
}

/** Cartas que se pueden jugar, con las reglas del As llamado. */
export function cartasLegalesSchafkopf(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  contrato: ContratoSchafkopf,
): IdCarta[] {
  const efectivo = (c: IdCarta) => paloEfectivoSchafkopf(c, contrato);
  let legales: IdCarta[];
  if (mesa.length === 0) {
    legales = [...mano];
  } else {
    const salida = efectivo(mesa[0]!.carta);
    const delPalo = mano.filter((c) => efectivo(c) === salida);
    legales = delPalo.length > 0 ? delPalo : [...mano];
  }
  if (contrato.tipo !== 'rufspiel') return legales;
  const as = asLlamado(contrato.palo);
  if (!mano.includes(as)) return legales;
  if (mesa.length === 0) {
    // Si sale con el palo llamado, tiene que salir con el As.
    return legales.filter((c) => c === as || efectivo(c) !== contrato.palo);
  }
  if (efectivo(mesa[0]!.carta) === contrato.palo) return [as];
  // No puede descartar el As en otro palo salvo en la última baza.
  return mano.length > 1 ? legales.filter((c) => c !== as) : legales;
}

/**
 * Laufende: los triunfos más altos seguidos, desde el primero, que tuvo un mismo lado en la mano;
 * cuentan desde 3 (desde 2 en el Wenz).
 */
export function laufendeSchafkopf(
  contrato: ContratoSchafkopf,
  duenoDe: (c: IdCarta) => Asiento,
  lado: readonly Asiento[],
): number {
  const t = triunfos(contrato);
  const delLado = (c: IdCarta) => lado.includes(duenoDe(c));
  const primero = delLado(t[0]!);
  let n = 0;
  while (n < t.length && delLado(t[n]!) === primero) n++;
  return n >= (contrato.tipo === 'wenz' ? 2 : 3) ? n : 0;
}

/** Tarifa base de cada contrato. */
export const TARIFA_SCHAFKOPF = { rufspiel: 10, wenz: 50, solo: 50 } as const;

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 8;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

const terminada = (e: Pick<EstadoSchafkopf, 'config' | 'resultadosManos'>) =>
  e.resultadosManos.length >= e.config.manos;

function nuevaMano(
  base: Pick<EstadoSchafkopf, 'config' | 'fichas' | 'resultadosManos' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoSchafkopf {
  const { cartas, azar: sig } = barajar(BARAJA_SCHAFKOPF, azar);
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
    manos,
    fase: 'anuncio',
    turno: siguiente(repartidor),
    anuncios: [],
    contrato: null,
    jugador: null,
    companero: null,
    companeroVisto: false,
    mesa: [],
    bazas: [0, 0, 0, 0],
    puntosMano: [0, 0, 0, 0],
    jugadasPor: [[], [], [], []],
    fallos: [[], [], [], []],
  };
}

function siguienteMano(e: EstadoSchafkopf, resultado: ResultadoManoSchafkopf): EstadoSchafkopf {
  const cerrado: EstadoSchafkopf = {
    ...e,
    fichas: resultado.fichasTras,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** El resultado de una mano jugada, con los puntos, la tarifa y las fichas. */
export function puntuarManoSchafkopf(
  contrato: ContratoSchafkopf,
  jugador: Asiento,
  companero: Asiento | null,
  puntosMano: readonly number[],
  bazas: readonly number[],
  laufende: number,
  fichas: readonly number[],
): ResultadoManoSchafkopf {
  const lado = companero === null ? [jugador] : [jugador, companero];
  const suma = (xs: readonly number[], de: (a: Asiento) => boolean) =>
    xs.reduce((s, x, a) => (de(a) ? s + x : s), 0);
  const puntosJugador = suma(puntosMano, (a) => lado.includes(a));
  const ganaJugador = puntosJugador >= 61;
  const perdedor = (a: Asiento) => lado.includes(a) !== ganaJugador;
  const schneider = suma(puntosMano, perdedor) <= 30;
  const schwarz = suma(bazas, perdedor) === 0;
  const tarifa =
    TARIFA_SCHAFKOPF[contrato.tipo] + (schneider ? 10 : 0) + (schwarz ? 10 : 0) + 10 * laufende;
  const signo = ganaJugador ? 1 : -1;
  const fichasMano = [0, 1, 2, 3].map((a) => {
    if (contrato.tipo === 'rufspiel') return (lado.includes(a) ? signo : -signo) * tarifa;
    return a === jugador ? 3 * signo * tarifa : -signo * tarifa;
  });
  return {
    contrato,
    jugador,
    companero,
    puntosJugador,
    ganaJugador,
    schneider,
    schwarz,
    laufende,
    tarifa,
    fichasMano,
    fichasTras: fichas.map((f, a) => f + fichasMano[a]!),
  };
}

function cerrarMano(e: EstadoSchafkopf): EstadoSchafkopf {
  const contrato = e.contrato!;
  const jugador = e.jugador!;
  const lado = e.companero === null ? [jugador] : [jugador, e.companero];
  const duenoDe = (c: IdCarta) => e.jugadasPor.findIndex((cs) => cs.includes(c));
  const laufende = laufendeSchafkopf(contrato, duenoDe, lado);
  return siguienteMano(
    e,
    puntuarManoSchafkopf(contrato, jugador, e.companero, e.puntosMano, e.bazas, laufende, e.fichas),
  );
}

function pasada(e: EstadoSchafkopf): EstadoSchafkopf {
  return siguienteMano(e, {
    contrato: null,
    jugador: null,
    companero: null,
    puntosJugador: 0,
    ganaJugador: false,
    schneider: false,
    schwarz: false,
    laufende: 0,
    tarifa: 0,
    fichasMano: [0, 0, 0, 0],
    fichasTras: e.fichas,
  });
}

function resolverBaza(e: EstadoSchafkopf): EstadoSchafkopf {
  const ganador = ganadoraSchafkopf(e.mesa, e.contrato!).asiento;
  const puntos = e.mesa.reduce((s, j) => s + puntosCartaSchafkopf(j.carta), 0);
  const resuelto: EstadoSchafkopf = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    puntosMano: e.puntosMano.map((p, a) => (a === ganador ? p + puntos : p)),
  };
  return resuelto.manos.every((m) => m.length === 0) ? cerrarMano(resuelto) : resuelto;
}

function anunciar(e: EstadoSchafkopf, asiento: Asiento, contrato: ContratoSchafkopf | null) {
  const anuncios = [...e.anuncios, { asiento, contrato }];
  const conAnuncio: EstadoSchafkopf = {
    ...e,
    anuncios,
    contrato: contrato ?? e.contrato,
    jugador: contrato ? asiento : e.jugador,
  };
  if (anuncios.length < JUGADORES) return { ...conAnuncio, turno: siguiente(asiento) };
  if (conAnuncio.contrato === null) return pasada(conAnuncio);
  const c = conAnuncio.contrato;
  const companero =
    c.tipo === 'rufspiel' ? e.manos.findIndex((m) => m.includes(asLlamado(c.palo))) : null;
  return {
    ...conAnuncio,
    fase: 'bazas' as const,
    companero,
    turno: siguiente(e.repartidor),
  };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const schafkopf: Juego<ConfigSchafkopf, EstadoSchafkopf, AccionSchafkopf, VistaSchafkopf> = {
  id: 'schafkopf',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Schafkopf se juega con 4 jugadores');
    if (!Number.isInteger(config.manos) || config.manos < 1) {
      return error('El número de manos del Schafkopf debe ser un entero positivo');
    }
    return ok(
      nuevaMano(
        {
          config: { jugadores: 4, manos: config.manos },
          fichas: [0, 0, 0, 0],
          resultadosManos: [],
          ultimaBaza: null,
        },
        JUGADORES - 1,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    if (e.fase === 'anuncio') {
      return [
        { tipo: 'pasar' },
        ...contratosPosiblesSchafkopf(mano, e.contrato).map((contrato) => ({
          tipo: 'anunciar' as const,
          contrato,
        })),
      ];
    }
    return cartasLegalesSchafkopf(mano, e.mesa, e.contrato!)
      .sort()
      .map((carta) => ({ tipo: 'jugar', carta }));
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'pasar') return anunciar(e, asiento, null);
    if (accion.tipo === 'anunciar') return anunciar(e, asiento, accion.contrato);
    const contrato = e.contrato!;
    const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    const mesa = [...e.mesa, { asiento, carta: accion.carta }];
    const salida = paloEfectivoSchafkopf(mesa[0]!.carta, contrato);
    const falla = paloEfectivoSchafkopf(accion.carta, contrato) !== salida;
    const jugado: EstadoSchafkopf = {
      ...e,
      manos,
      mesa,
      jugadasPor: e.jugadasPor.map((cs, a) => (a === asiento ? [...cs, accion.carta] : cs)),
      companeroVisto:
        e.companeroVisto ||
        (contrato.tipo === 'rufspiel' && accion.carta === asLlamado(contrato.palo)),
      fallos:
        falla && !e.fallos[asiento]!.includes(salida)
          ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f))
          : e.fallos,
    };
    return mesa.length < JUGADORES
      ? { ...jugado, turno: siguiente(asiento) }
      : resolverBaza(jugado);
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      anuncios: [...e.anuncios],
      contrato: e.contrato,
      jugador: e.jugador,
      companero:
        e.companero !== null && (e.companeroVisto || e.companero === asiento) ? e.companero : null,
      companeroVisto: e.companeroVisto,
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazas: [...e.bazas],
      puntosMano: [...e.puntosMano],
      jugadasPor: e.jugadasPor.map((cs) => [...cs]),
      fallos: e.fallos.map((f) => [...f]),
      manoNumero: Math.min(e.resultadosManos.length + 1, e.config.manos),
      fichas: [...e.fichas],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const maximo = Math.max(...e.fichas);
    const ganadores = [0, 1, 2, 3].filter((a) => e.fichas[a] === maximo);
    if (ganadores.length === JUGADORES)
      return { ganadores: [], empate: true, puntos: [...e.fichas] };
    return { ganadores, empate: false, puntos: [...e.fichas] };
  },
};
