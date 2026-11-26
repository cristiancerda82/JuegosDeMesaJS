import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import type { CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigBurroBazas {
  readonly jugadores: 3 | 4 | 5 | 6;
  /** La partida acaba cuando alguien llega a estas penalizaciones. */
  readonly limite: 3 | 5;
}

export const CONFIG_BURRO_BAZAS_POR_DEFECTO: ConfigBurroBazas = { jugadores: 4, limite: 3 };

export const LIMITES_BURRO_BAZAS = [3, 5] as const;

/** Cartas que recibe cada uno al empezar la mano; el resto forma el mazo. */
export const CARTAS_INICIALES_BURRO_BAZAS = 4;

export interface ResultadoManoBurroBazas {
  /** Quien se quedó con cartas cuando los demás ya no tenían; `null` si se quedaron sin ellas a la vez. */
  readonly burro: Asiento | null;
  /** Quienes se quedaron sin cartas, en orden. */
  readonly orden: readonly Asiento[];
  /** Cartas que le quedaban al burro. */
  readonly cartasBurro: number;
  readonly penalizacionesTras: readonly number[];
}

/** Una baza terminada: las cartas, quién la ganó, quién pasó y cuántas robó cada uno. */
export interface BazaBurroBazas {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
  readonly pasaron: readonly Asiento[];
  readonly robadas: readonly number[];
}

export interface EstadoBurroBazas {
  readonly config: ConfigBurroBazas;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** El mazo boca abajo; se roba por el principio. */
  readonly mazo: readonly IdCarta[];
  readonly turno: Asiento;
  /** Quien sale en la baza en curso. */
  readonly salida: Asiento;
  readonly mesa: readonly CartaJugada[];
  /** Quienes pasaron en la baza en curso, sin el palo y sin mazo. */
  readonly pasaron: readonly Asiento[];
  /** Cartas que robó cada uno en la baza en curso. */
  readonly robadas: readonly number[];
  readonly ultimaBaza: BazaBurroBazas | null;
  readonly bazasJugadas: number;
  /** Bazas ganadas por cada uno en la mano. */
  readonly bazas: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  /** Palos que se sabe que no tiene cada uno en la mano. */
  readonly sinPalo: readonly (readonly PaloEspanol[])[];
  /** Quienes se han quedado sin cartas en la mano, en orden. */
  readonly salieron: readonly Asiento[];
  readonly penalizaciones: readonly number[];
  readonly resultadosManos: readonly ResultadoManoBurroBazas[];
}

export type AccionBurroBazas =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'pasar' };

export interface VistaBurroBazas {
  readonly config: ConfigBurroBazas;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas que quedan en el mazo. */
  readonly mazo: number;
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly salida: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly pasaron: readonly Asiento[];
  readonly robadas: readonly number[];
  readonly ultimaBaza: BazaBurroBazas | null;
  readonly bazasJugadas: number;
  readonly bazas: readonly number[];
  readonly jugadasPor: readonly (readonly IdCarta[])[];
  readonly sinPalo: readonly (readonly PaloEspanol[])[];
  readonly salieron: readonly Asiento[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly penalizaciones: readonly number[];
  readonly resultadosManos: readonly ResultadoManoBurroBazas[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** La baraja española de 48 cartas, con ochos y nueves. */
export const barajaBurroBazas = (): IdCarta[] => crearBaraja('espanola48');

export const paloBurroBazas = (c: IdCarta) => cartaDeId(c)!.palo as PaloEspanol;
/** El orden es el del número: del Rey (12) al As (1), que es la más baja. */
export const rangoBurroBazas = (c: IdCarta) => cartaDeId(c)!.valor;

/** Carta que gana la baza: la más alta del palo de salida (no hay triunfo). */
export function ganadoraBurroBazas(mesa: readonly CartaJugada[]): CartaJugada {
  const salida = paloBurroBazas(mesa[0]!.carta);
  const valor = (c: IdCarta) => (paloBurroBazas(c) === salida ? rangoBurroBazas(c) : 0);
  return mesa.reduce((mejor, j) => (valor(j.carta) > valor(mejor.carta) ? j : mejor));
}

// ── Mano ─────────────────────────────────────────────────────────────────────

const terminada = (e: Pick<EstadoBurroBazas, 'penalizaciones' | 'config'>) =>
  e.penalizaciones.some((p) => p >= e.config.limite);

/** El siguiente asiento desde `desde` (sin contarlo) que aún tiene cartas. */
function siguienteConCartas(
  manos: readonly (readonly IdCarta[])[],
  desde: Asiento,
): Asiento | null {
  const n = manos.length;
  for (let k = 1; k <= n; k++) {
    const a = (desde + k) % n;
    if (manos[a]!.length > 0) return a;
  }
  return null;
}

function nuevaMano(
  base: Pick<EstadoBurroBazas, 'config' | 'penalizaciones' | 'resultadosManos'>,
  repartidor: Asiento,
  azar: EstadoAzar,
): EstadoBurroBazas {
  const n = base.config.jugadores;
  const { cartas, azar: sig } = barajar(barajaBurroBazas(), azar);
  const cada = CARTAS_INICIALES_BURRO_BAZAS;
  const sale = (repartidor + 1) % n;
  return {
    ...base,
    azar: sig,
    repartidor,
    manos: Array.from({ length: n }, (_, k) => cartas.slice(k * cada, (k + 1) * cada)),
    mazo: cartas.slice(n * cada),
    turno: sale,
    salida: sale,
    mesa: [],
    pasaron: [],
    robadas: Array.from({ length: n }, () => 0),
    // La última baza de la mano anterior no se enseña: sus cartas vuelven a estar ocultas.
    ultimaBaza: null,
    bazasJugadas: 0,
    bazas: Array.from({ length: n }, () => 0),
    jugadasPor: Array.from({ length: n }, () => []),
    sinPalo: Array.from({ length: n }, () => []),
    salieron: [],
  };
}

function cerrarMano(e: EstadoBurroBazas, burro: Asiento | null): EstadoBurroBazas {
  const penalizaciones = e.penalizaciones.map((p, a) => (a === burro ? p + 1 : p));
  const cerrado: EstadoBurroBazas = {
    ...e,
    penalizaciones,
    resultadosManos: [
      ...e.resultadosManos,
      {
        burro,
        orden: e.salieron,
        cartasBurro: burro === null ? 0 : e.manos[burro]!.length,
        penalizacionesTras: penalizaciones,
      },
    ],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, (e.repartidor + 1) % e.config.jugadores, e.azar);
}

function resolverBaza(e: EstadoBurroBazas): EstadoBurroBazas {
  const ganador = ganadoraBurroBazas(e.mesa).asiento;
  const resuelto: EstadoBurroBazas = {
    ...e,
    mesa: [],
    pasaron: [],
    robadas: e.robadas.map(() => 0),
    ultimaBaza: { cartas: e.mesa, ganador, pasaron: e.pasaron, robadas: e.robadas },
    bazasJugadas: e.bazasJugadas + 1,
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
  };
  const conCartas = e.manos.flatMap((m, a) => (m.length > 0 ? [a] : []));
  if (conCartas.length <= 1) return cerrarMano(resuelto, conCartas[0] ?? null);
  // Sale quien ganó; si se quedó sin cartas, el siguiente que tiene.
  const sale = e.manos[ganador]!.length > 0 ? ganador : siguienteConCartas(e.manos, ganador)!;
  return { ...resuelto, turno: sale, salida: sale };
}

/** Pasa el turno al siguiente que tiene cartas, o resuelve la baza si ya han jugado todos. */
function avanzar(e: EstadoBurroBazas, asiento: Asiento): EstadoBurroBazas {
  const n = e.config.jugadores;
  for (let k = 1; k < n; k++) {
    const a = (asiento + k) % n;
    if (a === e.salida) break;
    if (e.manos[a]!.length > 0) return { ...e, turno: a };
  }
  return resolverBaza(e);
}

function jugarCarta(e: EstadoBurroBazas, asiento: Asiento, carta: IdCarta): EstadoBurroBazas {
  const mano = e.manos[asiento]!.filter((c) => c !== carta);
  return {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? mano : m)),
    mesa: [...e.mesa, { asiento, carta }],
    jugadasPor: e.jugadasPor.map((j, a) => (a === asiento ? [...j, carta] : j)),
    salieron: mano.length === 0 ? [...e.salieron, asiento] : e.salieron,
  };
}

/**
 * Lo que se sabe de los palos de quien no tenía el de salida y robó `robadas` cartas: no tiene ese
 * palo, y lo que se sabía de los demás solo sigue valiendo si no se llevó ninguna carta de otro palo.
 */
function sinPaloTras(
  antes: readonly PaloEspanol[],
  palo: PaloEspanol,
  otrasRobadas: number,
): PaloEspanol[] {
  if (otrasRobadas > 0) return [palo];
  return antes.includes(palo) ? [...antes] : [...antes, palo];
}

/** Roba hasta sacar una carta del palo de salida y la juega; si se acaba el mazo, pasa. */
function robar(e: EstadoBurroBazas, asiento: Asiento): EstadoBurroBazas {
  const palo = paloBurroBazas(e.mesa[0]!.carta);
  const hasta = e.mazo.findIndex((c) => paloBurroBazas(c) === palo);
  const robadas = hasta === -1 ? e.mazo : e.mazo.slice(0, hasta + 1);
  const otras = hasta === -1 ? robadas.length : robadas.length - 1;
  const conRobo: EstadoBurroBazas = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? [...m, ...robadas] : m)),
    mazo: e.mazo.slice(robadas.length),
    robadas: e.robadas.map((r, a) => (a === asiento ? r + robadas.length : r)),
    sinPalo: e.sinPalo.map((s, a) => (a === asiento ? sinPaloTras(s, palo, otras) : s)),
  };
  if (hasta === -1) return avanzar({ ...conRobo, pasaron: [...e.pasaron, asiento] }, asiento);
  return avanzar(jugarCarta(conRobo, asiento, robadas.at(-1)!), asiento);
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const burroBazas: Juego<
  ConfigBurroBazas,
  EstadoBurroBazas,
  AccionBurroBazas,
  VistaBurroBazas
> = {
  id: 'burro-bazas',

  crear(config, semilla) {
    if (![3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Burro de bazas se juega de 3 a 6 jugadores');
    }
    if (!LIMITES_BURRO_BAZAS.includes(config.limite)) {
      return error('El límite debe ser 3 o 5 penalizaciones');
    }
    const n = config.jugadores;
    return ok(
      nuevaMano(
        {
          config: { jugadores: n, limite: config.limite },
          penalizaciones: Array.from({ length: n }, () => 0),
          resultadosManos: [],
        },
        0,
        crearAzar(semilla),
      ),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    const jugar = (cartas: readonly IdCarta[]): AccionBurroBazas[] =>
      [...cartas].sort().map((carta) => ({ tipo: 'jugar', carta }));
    if (e.mesa.length === 0) return jugar(mano);
    const palo = paloBurroBazas(e.mesa[0]!.carta);
    const delPalo = mano.filter((c) => paloBurroBazas(c) === palo);
    if (delPalo.length > 0) return jugar(delPalo);
    return [{ tipo: e.mazo.length > 0 ? 'robar' : 'pasar' }];
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'jugar':
        return avanzar(jugarCarta(e, asiento, accion.carta), asiento);
      case 'robar':
        return robar(e, asiento);
      case 'pasar': {
        const palo = paloBurroBazas(e.mesa[0]!.carta);
        return avanzar(
          {
            ...e,
            pasaron: [...e.pasaron, asiento],
            sinPalo: e.sinPalo.map((s, a) => (a === asiento ? sinPaloTras(s, palo, 0) : s)),
          },
          asiento,
        );
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      turno: terminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      salida: e.salida,
      mesa: [...e.mesa],
      pasaron: [...e.pasaron],
      robadas: [...e.robadas],
      ultimaBaza: e.ultimaBaza,
      bazasJugadas: e.bazasJugadas,
      bazas: [...e.bazas],
      jugadasPor: e.jugadasPor.map((j) => [...j]),
      sinPalo: e.sinPalo.map((s) => [...s]),
      salieron: [...e.salieron],
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      penalizaciones: [...e.penalizaciones],
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    // Pierde quien llega al límite; ganan los que tienen menos penalizaciones.
    const minimo = Math.min(...e.penalizaciones);
    const ganadores = e.penalizaciones.flatMap((p, a) => (p === minimo ? [a] : []));
    return { ganadores, empate: false, puntos: e.penalizaciones.map((p) => 0 - p) };
  },
};
