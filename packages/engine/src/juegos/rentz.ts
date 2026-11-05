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

/** Rentz para 4: cada uno elige `rondas` contratos (7 en la partida; menos en las pruebas). */
export interface ConfigRentz {
  readonly jugadores: 4;
  readonly rondas: number;
}

export type ContratoRentz =
  'bazas' | 'corazones' | 'damas' | 'rey' | 'ultima' | 'domino' | 'positivo';

export const CONTRATOS_RENTZ: readonly ContratoRentz[] = [
  'bazas',
  'corazones',
  'damas',
  'rey',
  'ultima',
  'domino',
  'positivo',
];

export const RONDAS_RENTZ = CONTRATOS_RENTZ.length;
export const CONFIG_RENTZ_POR_DEFECTO: ConfigRentz = { jugadores: 4, rondas: RONDAS_RENTZ };

/** Puntos del dominó por orden de acabar. */
export const PUNTOS_DOMINO_RENTZ = [40, 20, 10, 0] as const;

export type FaseRentz = 'contrato' | 'bazas' | 'domino';

/** Una fila del dominó: de la carta más baja a la más alta (As 14). */
export interface FilaRentz {
  readonly bajo: number;
  readonly alto: number;
}
export type FilasRentz = Readonly<Record<PaloFrances, FilaRentz | null>>;

export interface ResultadoManoRentz {
  readonly contrato: ContratoRentz;
  /** Quien eligió el contrato (el que repartió). */
  readonly elige: Asiento;
  readonly puntos: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoRentz {
  readonly config: ConfigRentz;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseRentz;
  readonly contrato: ContratoRentz | null;
  /** Los contratos que ha elegido ya cada jugador. */
  readonly jugados: readonly (readonly ContratoRentz[])[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazasJugadas: number;
  readonly puntosMano: readonly number[];
  readonly filas: FilasRentz;
  /** En el dominó, los que se han quedado sin cartas, por orden. */
  readonly acabados: readonly Asiento[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos de salida que cada uno no siguió. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  /** Cartas que se sabe que cada uno no tiene (las que encajaban cuando pasó en el dominó). */
  readonly noTiene: readonly (readonly IdCarta[])[];
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoRentz[];
}

export type AccionRentz =
  | { readonly tipo: 'contrato'; readonly contrato: ContratoRentz }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'pasar' };

export interface VistaRentz {
  readonly config: ConfigRentz;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly fase: FaseRentz;
  readonly contrato: ContratoRentz | null;
  readonly jugados: readonly (readonly ContratoRentz[])[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoRentz['ultimaBaza'];
  readonly bazasJugadas: number;
  readonly puntosMano: readonly number[];
  readonly filas: FilasRentz;
  readonly acabados: readonly Asiento[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly noTiene: readonly (readonly IdCarta[])[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoRentz[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** 32 cartas francesas, del 7 al As. */
export const BARAJA_RENTZ: readonly IdCarta[] = crearBaraja('francesa52').filter((c) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 || v >= 7;
});

export const paloRentz = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** El orden: del 7 (7) al As (14). */
export const rangoRentz = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
const idDe = (palo: PaloFrances, rango: number) => `${palo}-${rango === 14 ? 1 : rango}` as IdCarta;

const JOTA = 11;
const SIETE = 7;
const AS = 14;
export const REY_CORAZONES_RENTZ: IdCarta = 'corazones-13';

/** Lo que resta una carta ganada en un contrato de evitar cartas (0 si nada). */
export function penalizaRentz(c: IdCarta, contrato: ContratoRentz): number {
  if (contrato === 'corazones' && paloRentz(c) === 'corazones') return 5;
  if (contrato === 'damas' && rangoRentz(c) === 12) return 10;
  if (contrato === 'rey' && c === REY_CORAZONES_RENTZ) return 40;
  return 0;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
export const CARTAS_EN_MANO_RENTZ = 8;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: la más alta del palo de salida (no hay triunfo). */
export function ganadoraRentz(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = paloRentz(mesa[0]!.carta);
  const valor = (c: IdCarta) => (paloRentz(c) === salida ? rangoRentz(c) : 0);
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar en una baza: el palo de salida si se tiene; si no, todas. */
export function cartasLegalesRentz(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
): IdCarta[] {
  if (mesa.length === 0) return [...mano];
  const salida = paloRentz(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloRentz(c) === salida);
  return delPalo.length > 0 ? delPalo : [...mano];
}

export const FILAS_VACIAS_RENTZ: FilasRentz = {
  picas: null,
  corazones: null,
  diamantes: null,
  treboles: null,
};

/** Si una carta encaja en las filas del dominó. */
export function encajaRentz(filas: FilasRentz, c: IdCarta): boolean {
  const fila = filas[paloRentz(c)];
  const r = rangoRentz(c);
  if (fila === null) return r === JOTA;
  return r === fila.bajo - 1 || r === fila.alto + 1;
}

/** Las cartas que encajan ahora en las filas (estén donde estén). */
export function encajanRentz(filas: FilasRentz): IdCarta[] {
  return PALOS_FRANCESES.flatMap((palo) => {
    const fila = filas[palo];
    if (fila === null) return [idDe(palo, JOTA)];
    const r: IdCarta[] = [];
    if (fila.bajo > SIETE) r.push(idDe(palo, fila.bajo - 1));
    if (fila.alto < AS) r.push(idDe(palo, fila.alto + 1));
    return r;
  });
}

function ponerEnFila(filas: FilasRentz, c: IdCarta): FilasRentz {
  const palo = paloRentz(c);
  const r = rangoRentz(c);
  const fila = filas[palo];
  return {
    ...filas,
    [palo]:
      fila === null
        ? { bajo: r, alto: r }
        : { bajo: Math.min(fila.bajo, r), alto: Math.max(fila.alto, r) },
  };
}

// ── Mano ─────────────────────────────────────────────────────────────────────

export const manosRentz = (config: ConfigRentz) => JUGADORES * config.rondas;

const terminada = (e: Pick<EstadoRentz, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= manosRentz(e.config);

const CEROS = [0, 0, 0, 0] as const;
const vacios = () => Array.from({ length: JUGADORES }, () => [] as IdCarta[]);

function nuevaMano(
  base: Pick<EstadoRentz, 'config' | 'jugados' | 'totales' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoRentz {
  const { cartas, azar: sig } = barajar(BARAJA_RENTZ, azar);
  const manos = Array.from({ length: JUGADORES }, (_, k) =>
    cartas.slice(k * CARTAS_EN_MANO_RENTZ, (k + 1) * CARTAS_EN_MANO_RENTZ),
  );
  return {
    ...base,
    azar: sig,
    repartidor,
    fase: 'contrato',
    contrato: null,
    manos,
    turno: repartidor,
    mesa: [],
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    bazasJugadas: 0,
    puntosMano: CEROS,
    filas: FILAS_VACIAS_RENTZ,
    acabados: [],
    jugadasPor: vacios(),
    fallos: Array.from({ length: JUGADORES }, () => []),
    noTiene: vacios(),
  };
}

function cerrarMano(e: EstadoRentz): EstadoRentz {
  const totales = e.totales.map((t, a) => t + e.puntosMano[a]!);
  const cerrado: EstadoRentz = {
    ...e,
    totales,
    resultadosManos: [
      ...e.resultadosManos,
      { contrato: e.contrato!, elige: e.repartidor, puntos: e.puntosMano, totalesTras: totales },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** Puntos de una baza para quien la gana, según el contrato. */
function puntosBaza(contrato: ContratoRentz, cartas: readonly IdCarta[], numero: number): number {
  switch (contrato) {
    case 'bazas':
      return -5;
    case 'positivo':
      return 5;
    case 'ultima':
      return numero === CARTAS_EN_MANO_RENTZ ? -40 : 0;
    default:
      return -cartas.reduce((s, c) => s + penalizaRentz(c, contrato), 0);
  }
}

function resolverBaza(e: EstadoRentz): EstadoRentz {
  const contrato = e.contrato!;
  const ganador = ganadoraRentz(e.mesa).asiento;
  const numero = e.bazasJugadas + 1;
  const puntos = puntosBaza(
    contrato,
    e.mesa.map((j) => j.carta),
    numero,
  );
  const resuelto: EstadoRentz = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazasJugadas: numero,
    puntosMano: e.puntosMano.map((p, a) => (a === ganador ? p + puntos : p)),
  };
  // Se acaba al no quedar cartas, o cuando ya se han ganado todas las que restan.
  const deEvitar = contrato === 'corazones' || contrato === 'damas' || contrato === 'rey';
  const quedanPenas = resuelto.manos.some((m) => m.some((c) => penalizaRentz(c, contrato) > 0));
  const acaba = resuelto.manos.every((m) => m.length === 0) || (deEvitar && !quedanPenas);
  return acaba ? cerrarMano(resuelto) : resuelto;
}

function jugarBaza(e: EstadoRentz, asiento: Asiento, carta: IdCarta): EstadoRentz {
  const mesa = [...e.mesa, { asiento, carta }];
  const salida = paloRentz(mesa[0]!.carta);
  const nuevo = paloRentz(carta) !== salida && !e.fallos[asiento]!.includes(salida);
  const jugado: EstadoRentz = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
    mesa,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
    fallos: nuevo ? e.fallos.map((f, a) => (a === asiento ? [...f, salida] : f)) : e.fallos,
  };
  return mesa.length < JUGADORES ? { ...jugado, turno: siguiente(asiento) } : resolverBaza(jugado);
}

/** El siguiente en el dominó que aún tiene cartas. */
function siguienteEnDomino(e: EstadoRentz, desde: Asiento): Asiento {
  let a = siguiente(desde);
  while (e.manos[a]!.length === 0) a = siguiente(a);
  return a;
}

function jugarDomino(e: EstadoRentz, asiento: Asiento, carta: IdCarta | null): EstadoRentz {
  if (carta === null) {
    const encajan = encajanRentz(e.filas).filter((c) => !e.noTiene[asiento]!.includes(c));
    return {
      ...e,
      noTiene: e.noTiene.map((n, a) => (a === asiento ? [...n, ...encajan] : n)),
      turno: siguienteEnDomino(e, asiento),
    };
  }
  const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m));
  const acabados = manos[asiento]!.length === 0 ? [...e.acabados, asiento] : e.acabados;
  const jugado: EstadoRentz = {
    ...e,
    manos,
    filas: ponerEnFila(e.filas, carta),
    acabados,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
  };
  if (acabados.length < JUGADORES - 1) {
    return { ...jugado, turno: siguienteEnDomino(jugado, asiento) };
  }
  const ultimo = [0, 1, 2, 3].find((a) => !acabados.includes(a))!;
  const orden = [...acabados, ultimo];
  return cerrarMano({
    ...jugado,
    acabados: orden,
    puntosMano: CEROS.map((_, a) => PUNTOS_DOMINO_RENTZ[orden.indexOf(a)]!),
  });
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const rentz: Juego<ConfigRentz, EstadoRentz, AccionRentz, VistaRentz> = {
  id: 'rentz',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Rentz se juega con 4 jugadores');
    if (!Number.isInteger(config.rondas) || config.rondas < 1 || config.rondas > RONDAS_RENTZ) {
      return error('Las rondas deben ir de 1 a 7');
    }
    return ok(
      nuevaMano(
        {
          config: { jugadores: 4, rondas: config.rondas },
          jugados: [[], [], [], []],
          totales: CEROS,
          resultadosManos: [],
        },
        0,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'contrato':
        return CONTRATOS_RENTZ.filter((c) => !e.jugados[asiento]!.includes(c)).map((contrato) => ({
          tipo: 'contrato',
          contrato,
        }));
      case 'bazas':
        return cartasLegalesRentz(e.manos[asiento]!, e.mesa)
          .sort()
          .map((carta) => ({ tipo: 'jugar', carta }));
      case 'domino': {
        const encajan = e.manos[asiento]!.filter((c) => encajaRentz(e.filas, c)).sort();
        return encajan.length > 0
          ? encajan.map((carta) => ({ tipo: 'jugar', carta }))
          : [{ tipo: 'pasar' }];
      }
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'contrato':
        return {
          ...e,
          contrato: accion.contrato,
          jugados: e.jugados.map((j, a) => (a === asiento ? [...j, accion.contrato] : j)),
          fase: accion.contrato === 'domino' ? 'domino' : 'bazas',
        };
      case 'jugar':
        return e.fase === 'domino'
          ? jugarDomino(e, asiento, accion.carta)
          : jugarBaza(e, asiento, accion.carta);
      case 'pasar':
        return jugarDomino(e, asiento, null);
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      fase: e.fase,
      contrato: e.contrato,
      jugados: e.jugados.map((j) => [...j]),
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazasJugadas: e.bazasJugadas,
      puntosMano: [...e.puntosMano],
      filas: e.filas,
      acabados: [...e.acabados],
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      fallos: e.fallos.map((f) => [...f]),
      noTiene: e.noTiene.map((n) => [...n]),
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      totales: [...e.totales],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const maximo = Math.max(...e.totales);
    const ganadores = [0, 1, 2, 3].filter((a) => e.totales[a] === maximo);
    if (ganadores.length === JUGADORES)
      return { ganadores: [], empate: true, puntos: [...e.totales] };
    return { ganadores, empate: false, puntos: [...e.totales] };
  },
};
