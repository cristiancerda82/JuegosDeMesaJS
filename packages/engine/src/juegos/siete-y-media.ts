import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigSieteYMedia {
  readonly jugadores: 2 | 3 | 4;
  /** Número de manos de la partida. */
  readonly manos: number;
  readonly fichasIniciales: number;
  readonly apuestaMaxima: number;
  /** La siete y media natural (un 7 y una figura) cobra el doble. */
  readonly pagoDoble: boolean;
  /** La banca pasa al siguiente cada mano, o a quien le gana con siete y media. */
  readonly cambioBanca: 'rotar' | 'sieteYMedia';
}

export const CONFIG_SIETE_Y_MEDIA_POR_DEFECTO: ConfigSieteYMedia = {
  jugadores: 2,
  manos: 10,
  fichasIniciales: 50,
  apuestaMaxima: 10,
  pagoDoble: true,
  cambioBanca: 'rotar',
};

export type EstadoJugada = 'jugando' | 'plantado' | 'pasado';

export type UltimaAccionSieteYMedia =
  | { readonly asiento: Asiento; readonly tipo: 'apostar'; readonly fichas: number }
  | {
      readonly asiento: Asiento;
      readonly tipo: 'pedir';
      readonly carta: IdCarta;
      readonly pasado: boolean;
    }
  | { readonly asiento: Asiento; readonly tipo: 'plantarse' };

export interface ResultadoManoSieteYMedia {
  readonly banca: Asiento;
  /** Cartas de cada jugador, destapadas; la primera es la que estaba tapada. */
  readonly cartas: readonly (readonly IdCarta[])[];
  /** Valor de cada jugada en medios puntos (7,5 = 15). */
  readonly valores: readonly number[];
  readonly pasados: readonly boolean[];
  /** Fichas ganadas (positivo) o perdidas (negativo) por cada jugador en la mano. */
  readonly variacion: readonly number[];
  readonly fichasTras: readonly number[];
}

export interface EstadoSieteYMedia {
  readonly config: ConfigSieteYMedia;
  readonly azar: EstadoAzar;
  readonly banca: Asiento;
  readonly fichas: readonly number[];
  /** Fichas de cada jugador al empezar la mano en curso. */
  readonly fichasInicioMano: readonly number[];
  readonly fase: 'apostar' | 'jugar';
  readonly turno: Asiento;
  /** Apuesta de cada punto; `null` para la banca y para quien aún no apostó. */
  readonly apuestas: readonly (number | null)[];
  /** Cartas boca abajo; la siguiente que se pide es la última. Vacío hasta repartir. */
  readonly mazo: readonly IdCarta[];
  /** Cartas de cada jugador: la primera, tapada; las demás, boca arriba. */
  readonly cartas: readonly (readonly IdCarta[])[];
  readonly estados: readonly EstadoJugada[];
  readonly ultimaAccion: UltimaAccionSieteYMedia | null;
  readonly resultadosManos: readonly ResultadoManoSieteYMedia[];
}

export type AccionSieteYMedia =
  | { readonly tipo: 'apostar'; readonly fichas: number }
  | { readonly tipo: 'pedir' }
  | { readonly tipo: 'plantarse' };

export interface VistaSieteYMedia {
  readonly config: ConfigSieteYMedia;
  readonly asiento: Asiento | null;
  readonly banca: Asiento;
  readonly fichas: readonly number[];
  readonly fase: 'apostar' | 'jugar';
  readonly turno: Asiento | null;
  readonly apuestas: readonly (number | null)[];
  /** Cartas de cada jugador; la tapada ajena es `null`. */
  readonly cartas: readonly (readonly (IdCarta | null)[])[];
  /** Valor de la jugada propia en medios puntos; `null` para un espectador. */
  readonly miValor: number | null;
  /** Valor de las cartas boca arriba de cada jugador, en medios puntos. */
  readonly visibles: readonly number[];
  readonly estados: readonly EstadoJugada[];
  /** Cartas que quedan en el mazo. */
  readonly mazo: number;
  readonly ultimaAccion: UltimaAccionSieteYMedia | null;
  readonly resultadosManos: readonly ResultadoManoSieteYMedia[];
}

// ── Valores ──────────────────────────────────────────────────────────────────

/** 7,5 en medios puntos. */
export const SIETE_Y_MEDIA = 15;

/** Valor de una carta en medios puntos: del As al 7 su número (doble), las figuras 1. */
export function valorCarta(id: IdCarta): number {
  const valor = cartaDeId(id)!.valor;
  return valor >= 10 ? 1 : valor * 2;
}

export const valorJugada = (cartas: readonly IdCarta[]) =>
  cartas.reduce((suma, c) => suma + valorCarta(c), 0);

/** Exactamente dos cartas: un 7 y una figura. */
export function esSieteYMediaNatural(cartas: readonly IdCarta[]): boolean {
  if (cartas.length !== 2) return false;
  const valores = cartas.map((c) => cartaDeId(c)!.valor).sort((a, b) => a - b);
  return valores[0] === 7 && valores[1]! >= 10;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const siguiente = (a: Asiento, n: number) => (a + 1) % n;

/** Puntos de la mano en orden de turno, desde el siguiente a la banca. */
function puntos(e: EstadoSieteYMedia): Asiento[] {
  const n = e.config.jugadores;
  const orden: Asiento[] = [];
  for (let a = siguiente(e.banca, n); a !== e.banca; a = siguiente(a, n)) {
    if (e.fichasInicioMano[a]! > 0) orden.push(a);
  }
  return orden;
}

function partidaTerminada(e: EstadoSieteYMedia): boolean {
  return (
    e.resultadosManos.length >= e.config.manos ||
    (e.resultadosManos.length > 0 && e.fichas.some((f) => f <= 0))
  );
}

function nuevaMano(
  config: ConfigSieteYMedia,
  azar: EstadoAzar,
  banca: Asiento,
  fichas: readonly number[],
  resultadosManos: readonly ResultadoManoSieteYMedia[],
  ultimaAccion: UltimaAccionSieteYMedia | null,
): EstadoSieteYMedia {
  const n = config.jugadores;
  const e: EstadoSieteYMedia = {
    config,
    azar,
    banca,
    fichas,
    fichasInicioMano: fichas,
    fase: 'apostar',
    turno: banca,
    apuestas: new Array<number | null>(n).fill(null),
    mazo: [],
    cartas: Array.from({ length: n }, () => []),
    estados: new Array<EstadoJugada>(n).fill('jugando'),
    ultimaAccion,
    resultadosManos,
  };
  return { ...e, turno: puntos(e)[0]! };
}

/** Baraja y da una carta tapada a cada jugador, desde el siguiente a la banca. */
function repartir(e: EstadoSieteYMedia): EstadoSieteYMedia {
  const { cartas: barajadas, azar } = barajar(crearBaraja('espanola40'), e.azar);
  const mazo = [...barajadas];
  const cartas = e.cartas.map((c) => [...c]);
  for (const a of [...puntos(e), e.banca]) cartas[a]!.push(mazo.pop()!);
  return { ...e, azar, mazo, cartas, fase: 'jugar', turno: puntos(e)[0]! };
}

/** Pasa el turno al siguiente punto que siga jugando, a la banca o a la liquidación. */
function avanzar(e: EstadoSieteYMedia): EstadoSieteYMedia {
  if (e.turno === e.banca) return liquidar(e);
  const orden = puntos(e);
  const resto = orden.slice(orden.indexOf(e.turno) + 1);
  const proximo = resto.find((a) => e.estados[a] === 'jugando');
  if (proximo !== undefined) return { ...e, turno: proximo };
  if (orden.every((a) => e.estados[a] === 'pasado')) return liquidar(e);
  return { ...e, turno: e.banca };
}

function liquidar(e: EstadoSieteYMedia): EstadoSieteYMedia {
  const fichas = [...e.fichas];
  const orden = puntos(e);
  const valores = e.cartas.map((c) => valorJugada(c));
  const bancaPasada = e.estados[e.banca] === 'pasado';
  const ganadores: Asiento[] = [];

  // Primero cobra la banca a los que pierden; después paga, en orden, mientras le alcance.
  for (const a of orden) {
    if (e.estados[a] === 'pasado') continue;
    if (bancaPasada || valores[a]! > valores[e.banca]!) ganadores.push(a);
    else {
      fichas[a]! -= e.apuestas[a]!;
      fichas[e.banca]! += e.apuestas[a]!;
    }
  }
  for (const a of ganadores) {
    const doble = e.config.pagoDoble && esSieteYMediaNatural(e.cartas[a]!);
    const pago = Math.min(e.apuestas[a]! * (doble ? 2 : 1), fichas[e.banca]!);
    fichas[a]! += pago;
    fichas[e.banca]! -= pago;
  }

  const resultado: ResultadoManoSieteYMedia = {
    banca: e.banca,
    cartas: e.cartas,
    valores,
    pasados: e.estados.map((s) => s === 'pasado'),
    variacion: fichas.map((f, a) => f - e.fichasInicioMano[a]!),
    fichasTras: fichas,
  };
  const resultadosManos = [...e.resultadosManos, resultado];
  const cerrado: EstadoSieteYMedia = { ...e, fichas, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;

  const n = e.config.jugadores;
  let banca = siguiente(e.banca, n);
  if (e.config.cambioBanca === 'sieteYMedia') {
    banca = ganadores.find((a) => valores[a] === SIETE_Y_MEDIA) ?? e.banca;
  }
  return nuevaMano(e.config, e.azar, banca, fichas, resultadosManos, e.ultimaAccion);
}

// ── Juego ────────────────────────────────────────────────────────────────────

const entero = (x: unknown, minimo: number) =>
  typeof x === 'number' && Number.isInteger(x) && x >= minimo;

export const sieteYMedia: Juego<
  ConfigSieteYMedia,
  EstadoSieteYMedia,
  AccionSieteYMedia,
  VistaSieteYMedia
> = {
  id: 'siete-y-media',

  crear(config, semilla) {
    if (![2, 3, 4].includes(config.jugadores)) {
      return error('La Siete y media se juega de 2 a 4 jugadores');
    }
    if (!entero(config.manos, 1)) return error('El número de manos debe ser un entero positivo');
    if (!entero(config.fichasIniciales, 1)) {
      return error('Las fichas iniciales deben ser un entero positivo');
    }
    if (!entero(config.apuestaMaxima, 1)) {
      return error('La apuesta máxima debe ser un entero positivo');
    }
    if (typeof config.pagoDoble !== 'boolean') return error('Opción de pago doble inválida');
    if (!['rotar', 'sieteYMedia'].includes(config.cambioBanca)) {
      return error('Opción de cambio de banca inválida');
    }
    const limpia: ConfigSieteYMedia = {
      jugadores: config.jugadores,
      manos: config.manos,
      fichasIniciales: config.fichasIniciales,
      apuestaMaxima: config.apuestaMaxima,
      pagoDoble: config.pagoDoble,
      cambioBanca: config.cambioBanca,
    };
    const fichas = new Array<number>(limpia.jugadores).fill(limpia.fichasIniciales);
    return ok(nuevaMano(limpia, crearAzar(semilla), 0, fichas, [], null));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'apostar') {
      const maximo = Math.min(e.config.apuestaMaxima, e.fichas[asiento]!);
      return Array.from({ length: maximo }, (_, i) => ({ tipo: 'apostar', fichas: i + 1 }));
    }
    const acciones: AccionSieteYMedia[] = [];
    if (e.mazo.length > 0) acciones.push({ tipo: 'pedir' });
    acciones.push({ tipo: 'plantarse' });
    return acciones;
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'apostar': {
        const apuestas = e.apuestas.map((x, a) => (a === asiento ? accion.fichas : x));
        const apostado: EstadoSieteYMedia = {
          ...e,
          apuestas,
          ultimaAccion: { asiento, tipo: 'apostar', fichas: accion.fichas },
        };
        const pendiente = puntos(e).find((a) => apuestas[a] === null);
        return pendiente === undefined ? repartir(apostado) : { ...apostado, turno: pendiente };
      }
      case 'pedir': {
        const mazo = e.mazo.slice(0, -1);
        const carta = e.mazo.at(-1)!;
        const cartas = e.cartas.map((c, a) => (a === asiento ? [...c, carta] : c));
        const valor = valorJugada(cartas[asiento]!);
        const pasado = valor > SIETE_Y_MEDIA;
        const fichas = [...e.fichas];
        if (pasado && asiento !== e.banca) {
          // El punto que se pasa paga su apuesta a la banca en el acto.
          fichas[asiento]! -= e.apuestas[asiento]!;
          fichas[e.banca]! += e.apuestas[asiento]!;
        }
        const estados = e.estados.map((s, a) =>
          a !== asiento ? s : pasado ? 'pasado' : valor === SIETE_Y_MEDIA ? 'plantado' : s,
        );
        const pedido: EstadoSieteYMedia = {
          ...e,
          mazo,
          cartas,
          fichas,
          estados,
          ultimaAccion: { asiento, tipo: 'pedir', carta, pasado },
        };
        return estados[asiento] === 'jugando' ? pedido : avanzar(pedido);
      }
      case 'plantarse': {
        const estados = e.estados.map((s, a) => (a === asiento ? 'plantado' : s));
        return avanzar({ ...e, estados, ultimaAccion: { asiento, tipo: 'plantarse' } });
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      banca: e.banca,
      fichas: [...e.fichas],
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      apuestas: [...e.apuestas],
      cartas: e.cartas.map((c, a) =>
        c.map((carta, i) => (i === 0 && a !== asiento ? null : carta)),
      ),
      miValor: asiento === null ? null : valorJugada(e.cartas[asiento]!),
      visibles: e.cartas.map((c) => valorJugada(c.slice(1))),
      estados: [...e.estados],
      mazo: e.mazo.length,
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const maximo = Math.max(...e.fichas);
    const ganadores = e.fichas.flatMap((f, a) => (f === maximo ? [a] : []));
    const puntos = [...e.fichas];
    if (ganadores.length === e.fichas.length) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
