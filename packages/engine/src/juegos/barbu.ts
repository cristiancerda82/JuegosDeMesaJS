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

/** Barbu sin dobles: 4 jugadores; 7 manos, una por contrato (menos solo en las pruebas). */
export interface ConfigBarbu {
  readonly jugadores: 4;
  readonly manos: number;
}

export const MANOS_BARBU = 7;
export const CONFIG_BARBU_POR_DEFECTO: ConfigBarbu = { jugadores: 4, manos: MANOS_BARBU };

export type ContratoBarbu =
  'bazas' | 'corazones' | 'damas' | 'rey' | 'ultimas' | 'triunfo' | 'domino';

export const CONTRATOS_BARBU: readonly ContratoBarbu[] = [
  'bazas',
  'corazones',
  'damas',
  'rey',
  'ultimas',
  'triunfo',
  'domino',
];

/** Puntos del dominó por orden de acabar. */
export const PUNTOS_DOMINO_BARBU = [45, 20, 5, -5] as const;

export type FaseBarbu = 'contrato' | 'triunfo' | 'bazas' | 'domino';

/** Una fila del dominó: de la carta más baja a la más alta (As 14). */
export interface FilaBarbu {
  readonly bajo: number;
  readonly alto: number;
}
export type FilasBarbu = Readonly<Record<PaloFrances, FilaBarbu | null>>;

export interface ResultadoManoBarbu {
  readonly contrato: ContratoBarbu;
  readonly triunfo: PaloFrances | null;
  readonly repartidor: Asiento;
  readonly puntos: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoBarbu {
  readonly config: ConfigBarbu;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly fase: FaseBarbu;
  readonly contrato: ContratoBarbu | null;
  readonly triunfo: PaloFrances | null;
  /** Los contratos ya jugados en la partida. */
  readonly jugados: readonly ContratoBarbu[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly bazasJugadas: number;
  readonly puntosMano: readonly number[];
  readonly filas: FilasBarbu;
  /** En el dominó, los que se han quedado sin cartas, por orden. */
  readonly acabados: readonly Asiento[];
  /** Las cartas que ha jugado cada uno en la mano. */
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos de los que se sabe que cada uno no tiene. */
  readonly fallos: readonly (readonly PaloFrances[])[];
  /** Cartas que se sabe que cada uno no tiene (las que encajaban cuando pasó en el dominó). */
  readonly noTiene: readonly (readonly IdCarta[])[];
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoBarbu[];
}

export type AccionBarbu =
  | { readonly tipo: 'contrato'; readonly contrato: ContratoBarbu }
  | { readonly tipo: 'triunfo'; readonly palo: PaloFrances }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'pasar' };

export interface VistaBarbu {
  readonly config: ConfigBarbu;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly fase: FaseBarbu;
  readonly contrato: ContratoBarbu | null;
  readonly triunfo: PaloFrances | null;
  readonly jugados: readonly ContratoBarbu[];
  readonly mesa: readonly CartaJugada[];
  readonly ultimaBaza: EstadoBarbu['ultimaBaza'];
  readonly bazasJugadas: number;
  readonly puntosMano: readonly number[];
  readonly filas: FilasBarbu;
  readonly acabados: readonly Asiento[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly fallos: readonly (readonly PaloFrances[])[];
  readonly noTiene: readonly (readonly IdCarta[])[];
  readonly totales: readonly number[];
  readonly resultadosManos: readonly ResultadoManoBarbu[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

export const BARAJA_BARBU: readonly IdCarta[] = crearBaraja('francesa52');

export const paloBarbu = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
/** El orden: del 2 (2) al As (14). */
export const rangoBarbu = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};
const idDe = (palo: PaloFrances, rango: number) => `${palo}-${rango === 14 ? 1 : rango}` as IdCarta;

const JOTA = 11;
const REY_CORAZONES: IdCarta = 'corazones-13';
const AS_CORAZONES: IdCarta = 'corazones-1';

/** Lo que penaliza una carta ganada en un contrato de evitar cartas (0 si nada). */
export function penalizaBarbu(c: IdCarta, contrato: ContratoBarbu): number {
  if (contrato === 'corazones' && paloBarbu(c) === 'corazones') return c === AS_CORAZONES ? 6 : 2;
  if (contrato === 'damas' && rangoBarbu(c) === 12) return 6;
  if (contrato === 'rey' && c === REY_CORAZONES) return 20;
  return 0;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 4;
const CARTAS_EN_MANO = 13;
const siguiente = (a: Asiento) => (a + 1) % JUGADORES;

/** Carta que gana la baza: el triunfo más alto o la más alta del palo de salida. */
export function ganadoraBarbu(
  mesa: readonly CartaJugada[],
  triunfo: PaloFrances | null,
): CartaJugada {
  const salida = paloBarbu(mesa[0]!.carta);
  const valor = (c: IdCarta) =>
    triunfo !== null && paloBarbu(c) === triunfo
      ? 100 + rangoBarbu(c)
      : paloBarbu(c) === salida
        ? rangoBarbu(c)
        : 0;
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

/** Cartas que se pueden jugar en una baza (spec juego-barbu). */
export function cartasLegalesBarbu(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  contrato: ContratoBarbu,
  triunfo: PaloFrances | null,
): IdCarta[] {
  if (mesa.length === 0) {
    const otras = mano.filter((c) => paloBarbu(c) !== 'corazones');
    return (contrato === 'corazones' || contrato === 'rey') && otras.length > 0 ? otras : [...mano];
  }
  const salida = paloBarbu(mesa[0]!.carta);
  const delPalo = mano.filter((c) => paloBarbu(c) === salida);
  if (delPalo.length > 0) return delPalo;
  if (contrato === 'rey' && mano.includes(REY_CORAZONES)) return [REY_CORAZONES];
  if (contrato === 'triunfo' && triunfo !== null) {
    const triunfos = mano.filter((c) => paloBarbu(c) === triunfo);
    if (triunfos.length === 0) return [...mano];
    const alto = Math.max(
      0,
      ...mesa.filter((j) => paloBarbu(j.carta) === triunfo).map((j) => rangoBarbu(j.carta)),
    );
    const masAltos = triunfos.filter((c) => rangoBarbu(c) > alto);
    return masAltos.length > 0 ? masAltos : triunfos;
  }
  return [...mano];
}

export const FILAS_VACIAS: FilasBarbu = {
  picas: null,
  corazones: null,
  diamantes: null,
  treboles: null,
};

/** Si una carta encaja en las filas del dominó. */
export function encajaBarbu(filas: FilasBarbu, c: IdCarta): boolean {
  const fila = filas[paloBarbu(c)];
  const r = rangoBarbu(c);
  if (fila === null) return r === JOTA;
  return r === fila.bajo - 1 || r === fila.alto + 1;
}

/** Las cartas que encajan ahora en las filas (estén donde estén). */
export function encajanBarbu(filas: FilasBarbu): IdCarta[] {
  return PALOS_FRANCESES.flatMap((palo) => {
    const fila = filas[palo];
    if (fila === null) return [idDe(palo, JOTA)];
    const r: IdCarta[] = [];
    if (fila.bajo > 2) r.push(idDe(palo, fila.bajo - 1));
    if (fila.alto < 14) r.push(idDe(palo, fila.alto + 1));
    return r;
  });
}

function ponerEnFila(filas: FilasBarbu, c: IdCarta): FilasBarbu {
  const palo = paloBarbu(c);
  const r = rangoBarbu(c);
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

const terminada = (e: Pick<EstadoBarbu, 'resultadosManos' | 'config'>) =>
  e.resultadosManos.length >= e.config.manos;

const CEROS = [0, 0, 0, 0] as const;
const vacios = () => Array.from({ length: JUGADORES }, () => [] as IdCarta[]);

function nuevaMano(
  base: Pick<EstadoBarbu, 'config' | 'jugados' | 'totales' | 'resultadosManos' | 'ultimaBaza'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoBarbu {
  const { cartas, azar: sig } = barajar(BARAJA_BARBU, azar);
  const manos = Array.from({ length: JUGADORES }, (_, k) =>
    cartas.slice(k * CARTAS_EN_MANO, (k + 1) * CARTAS_EN_MANO),
  );
  return {
    ...base,
    azar: sig,
    repartidor,
    fase: 'contrato',
    contrato: null,
    triunfo: null,
    manos,
    turno: repartidor,
    mesa: [],
    bazasJugadas: 0,
    puntosMano: CEROS,
    filas: FILAS_VACIAS,
    acabados: [],
    jugadasPor: vacios(),
    fallos: Array.from({ length: JUGADORES }, () => []),
    noTiene: vacios(),
  };
}

function cerrarMano(e: EstadoBarbu): EstadoBarbu {
  const totales = e.totales.map((t, a) => t + e.puntosMano[a]!);
  const cerrado: EstadoBarbu = {
    ...e,
    totales,
    resultadosManos: [
      ...e.resultadosManos,
      {
        contrato: e.contrato!,
        triunfo: e.triunfo,
        repartidor: e.repartidor,
        puntos: e.puntosMano,
        totalesTras: totales,
      },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, siguiente(e.repartidor), e.azar);
}

/** Puntos de una baza para quien la gana, según el contrato. */
function puntosBaza(e: EstadoBarbu, cartas: readonly IdCarta[], numero: number): number {
  switch (e.contrato) {
    case 'bazas':
      return -2;
    case 'ultimas':
      return numero === CARTAS_EN_MANO ? -20 : numero === CARTAS_EN_MANO - 1 ? -10 : 0;
    case 'triunfo':
      return 5;
    default:
      return -cartas.reduce((s, c) => s + penalizaBarbu(c, e.contrato!), 0);
  }
}

function resolverBaza(e: EstadoBarbu): EstadoBarbu {
  const ganador = ganadoraBarbu(e.mesa, e.triunfo).asiento;
  const cartas = e.mesa.map((j) => j.carta);
  const numero = e.bazasJugadas + 1;
  const puntos = puntosBaza(e, cartas, numero);
  const resuelto: EstadoBarbu = {
    ...e,
    mesa: [],
    turno: ganador,
    ultimaBaza: { cartas: e.mesa, ganador },
    bazasJugadas: numero,
    puntosMano: e.puntosMano.map((p, a) => (a === ganador ? p + puntos : p)),
  };
  // Se acaba al no quedar cartas, o cuando ya se han ganado todas las que penalizan.
  const quedanPenas = resuelto.manos.some((m) => m.some((c) => penalizaBarbu(c, e.contrato!) > 0));
  const deEvitar = e.contrato === 'corazones' || e.contrato === 'damas' || e.contrato === 'rey';
  const acaba = resuelto.manos.every((m) => m.length === 0) || (deEvitar && !quedanPenas);
  return acaba ? cerrarMano(resuelto) : resuelto;
}

function jugarBaza(e: EstadoBarbu, asiento: Asiento, carta: IdCarta): EstadoBarbu {
  const mesa = [...e.mesa, { asiento, carta }];
  const salida = paloBarbu(mesa[0]!.carta);
  const sabidos: PaloFrances[] = [];
  if (paloBarbu(carta) !== salida) {
    sabidos.push(salida);
    if (e.contrato === 'triunfo' && e.triunfo !== null && paloBarbu(carta) !== e.triunfo) {
      sabidos.push(e.triunfo);
    }
  }
  const nuevos = sabidos.filter((p) => !e.fallos[asiento]!.includes(p));
  const jugado: EstadoBarbu = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m)),
    mesa,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
    fallos:
      nuevos.length > 0
        ? e.fallos.map((f, a) => (a === asiento ? [...f, ...nuevos] : f))
        : e.fallos,
  };
  return mesa.length < JUGADORES ? { ...jugado, turno: siguiente(asiento) } : resolverBaza(jugado);
}

/** El siguiente en el dominó que aún tiene cartas. */
function siguienteEnDomino(e: EstadoBarbu, desde: Asiento): Asiento {
  let a = siguiente(desde);
  while (e.manos[a]!.length === 0) a = siguiente(a);
  return a;
}

function jugarDomino(e: EstadoBarbu, asiento: Asiento, carta: IdCarta | null): EstadoBarbu {
  if (carta === null) {
    const encajan = encajanBarbu(e.filas).filter((c) => !e.noTiene[asiento]!.includes(c));
    return {
      ...e,
      noTiene: e.noTiene.map((n, a) => (a === asiento ? [...n, ...encajan] : n)),
      turno: siguienteEnDomino(e, asiento),
    };
  }
  const manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== carta) : m));
  const acabados = manos[asiento]!.length === 0 ? [...e.acabados, asiento] : e.acabados;
  const jugado: EstadoBarbu = {
    ...e,
    manos,
    filas: ponerEnFila(e.filas, carta),
    acabados,
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
  };
  if (acabados.length < JUGADORES - 1)
    return { ...jugado, turno: siguienteEnDomino(jugado, asiento) };
  const ultimo = [0, 1, 2, 3].find((a) => !acabados.includes(a))!;
  const orden = [...acabados, ultimo];
  return cerrarMano({
    ...jugado,
    acabados: orden,
    puntosMano: CEROS.map((_, a) => PUNTOS_DOMINO_BARBU[orden.indexOf(a)]!),
  });
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const barbu: Juego<ConfigBarbu, EstadoBarbu, AccionBarbu, VistaBarbu> = {
  id: 'barbu',

  crear(config, semilla) {
    if (config.jugadores !== JUGADORES) return error('El Barbu se juega con 4 jugadores');
    if (!Number.isInteger(config.manos) || config.manos < 1 || config.manos > MANOS_BARBU) {
      return error('El número de manos debe ir de 1 a 7');
    }
    return ok(
      nuevaMano(
        {
          config: { jugadores: 4, manos: config.manos },
          jugados: [],
          totales: CEROS,
          resultadosManos: [],
          ultimaBaza: null,
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
        return CONTRATOS_BARBU.filter((c) => !e.jugados.includes(c)).map((contrato) => ({
          tipo: 'contrato',
          contrato,
        }));
      case 'triunfo':
        return PALOS_FRANCESES.map((palo) => ({ tipo: 'triunfo', palo }));
      case 'bazas':
        return cartasLegalesBarbu(e.manos[asiento]!, e.mesa, e.contrato!, e.triunfo)
          .sort()
          .map((carta) => ({ tipo: 'jugar', carta }));
      case 'domino': {
        const encajan = e.manos[asiento]!.filter((c) => encajaBarbu(e.filas, c)).sort();
        return encajan.length > 0
          ? encajan.map((carta) => ({ tipo: 'jugar', carta }))
          : [{ tipo: 'pasar' }];
      }
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'contrato': {
        const jugados = [...e.jugados, accion.contrato];
        const fase: FaseBarbu =
          accion.contrato === 'triunfo'
            ? 'triunfo'
            : accion.contrato === 'domino'
              ? 'domino'
              : 'bazas';
        return { ...e, contrato: accion.contrato, jugados, fase };
      }
      case 'triunfo':
        return { ...e, triunfo: accion.palo, fase: 'bazas' };
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
      triunfo: e.triunfo,
      jugados: [...e.jugados],
      mesa: [...e.mesa],
      ultimaBaza: e.ultimaBaza,
      bazasJugadas: e.bazasJugadas,
      puntosMano: [...e.puntosMano],
      filas: e.filas,
      acabados: [...e.acabados],
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      fallos: e.fallos.map((f) => [...f]),
      noTiene: e.noTiene.map((n) => [...n]),
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
