import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import {
  cartaDeId,
  crearBaraja,
  PALOS_FRANCESES,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigOchoLoco {
  /** De 2 a 5 jugadores, cada uno por su cuenta. */
  readonly jugadores: 2 | 3 | 4 | 5;
  /**
   * Cartas especiales del Ocho americano (opcional, por defecto no): el 10 cambia el sentido, el
   * As obliga a echar un As o robar 2, el 6 a echar un 6 o robar 1, el 7 salta al siguiente y,
   * tras un 9, quien no puede echar carta roba una y pierde el turno.
   */
  readonly cartasEspeciales?: boolean;
}

/** Lo que obliga un As o un 6 al siguiente: echar otra carta de ese número o robar. */
export interface CastigoOchoLoco {
  readonly numero: 1 | 6;
  readonly robar: 1 | 2;
}

export const CONFIG_OCHO_LOCO_POR_DEFECTO: ConfigOchoLoco = { jugadores: 4 };

/** Puntos con los que se gana la partida. */
export const OBJETIVO_OCHO_LOCO = 100;

/** Lo último que hizo cada jugador; la carta robada no se enseña. */
export type UltimaOchoLoco =
  | {
      readonly tipo: 'jugar';
      readonly carta: IdCarta;
      /** El palo elegido con un 8. */
      readonly palo: PaloFrances | null;
      /** Jugó la carta que acababa de robar. */
      readonly robo: boolean;
    }
  | {
      readonly tipo: 'robar';
      /** Cartas robadas por un As o un 6 (con las cartas especiales). */
      readonly cartas?: number;
    }
  | { readonly tipo: 'pasar'; readonly robo: boolean };

/** Lo que se sabe de quien robó: en ese momento no tenía ni ese palo, ni ese número, ni ochos. */
export interface FaltaOchoLoco {
  readonly palo: PaloFrances;
  readonly numero: number;
}

export interface ResultadoManoOchoLoco {
  /** Quien gana la mano; `null` si se bloqueó con empate. */
  readonly ganador: Asiento | null;
  readonly bloqueada: boolean;
  /** Puntos de las cartas que le quedaron a cada uno. */
  readonly puntosEnMano: readonly number[];
  /** Puntos que se apunta cada uno en esta mano. */
  readonly ganados: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoOchoLoco {
  readonly config: ConfigOchoLoco;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Boca abajo; la siguiente que se roba es la última. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la de arriba es la última. */
  readonly descarte: readonly IdCarta[];
  /** El palo que toca: el de la carta de arriba o el elegido con un 8. */
  readonly palo: PaloFrances;
  readonly turno: Asiento;
  /** La carta robada en este turno: la única que se puede jugar después. */
  readonly robada: IdCarta | null;
  /** Jugadores que han pasado seguidos sin poder robar. */
  readonly pasesSeguidos: number;
  readonly ultimas: readonly (UltimaOchoLoco | null)[];
  /** La última vez que robó cada uno en esta mano, qué le faltaba. */
  readonly faltas: readonly (FaltaOchoLoco | null)[];
  readonly resultadosManos: readonly ResultadoManoOchoLoco[];
  readonly totales: readonly number[];
  /** Con las cartas especiales: sentido del juego (1, el de siempre; −1, el contrario). */
  readonly sentido?: 1 | -1;
  /** Con las cartas especiales: la obligación pendiente de quien está en turno. */
  readonly castigo?: CastigoOchoLoco | null;
  /** Con las cartas especiales: la última carta fue un 9. */
  readonly trasNueve?: boolean;
}

export type AccionOchoLoco =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta; readonly palo?: PaloFrances }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'pasar' };

export interface VistaOchoLoco {
  readonly config: ConfigOchoLoco;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas en el mazo. */
  readonly mazo: number;
  /** Todo el descarte, que es público; la de arriba es la última. */
  readonly descarte: readonly IdCarta[];
  readonly palo: PaloFrances;
  readonly turno: Asiento | null;
  /** El jugador en turno ya ha robado. */
  readonly robe: boolean;
  /** La carta robada, solo para quien la robó. */
  readonly robada: IdCarta | null;
  /** Jugadores que han pasado seguidos sin poder robar. */
  readonly pasesSeguidos: number;
  readonly repartidor: Asiento;
  readonly ultimas: readonly (UltimaOchoLoco | null)[];
  readonly faltas: readonly (FaltaOchoLoco | null)[];
  readonly resultadosManos: readonly ResultadoManoOchoLoco[];
  readonly totales: readonly number[];
  /** Sentido del juego: 1, el de siempre; −1, el contrario (solo cambia con las especiales). */
  readonly sentido: 1 | -1;
  /** La obligación pendiente de quien está en turno (con las cartas especiales). */
  readonly castigo: CastigoOchoLoco | null;
  /** La última carta fue un 9 (con las cartas especiales). */
  readonly trasNueve: boolean;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const OCHO = 8;

export const paloOchoLoco = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;
export const numeroOchoLoco = (c: IdCarta) => cartaDeId(c)!.valor;
export const esOcho = (c: IdCarta) => numeroOchoLoco(c) === OCHO;

/** Lo que vale una carta que se queda en la mano: el 8, 50; las figuras, 10; el resto, su número. */
export function puntosOchoLoco(c: IdCarta): number {
  const n = numeroOchoLoco(c);
  if (n === OCHO) return 50;
  return n > 10 ? 10 : n;
}

export const puntosManoOchoLoco = (mano: readonly IdCarta[]) =>
  mano.reduce((s, c) => s + puntosOchoLoco(c), 0);

/** La carta se puede jugar: es un 8, o del palo que toca, o del número de la de arriba. */
export function casaOchoLoco(carta: IdCarta, palo: PaloFrances, arriba: IdCarta): boolean {
  return (
    esOcho(carta) ||
    paloOchoLoco(carta) === palo ||
    numeroOchoLoco(carta) === numeroOchoLoco(arriba)
  );
}

const siguiente = (a: Asiento, n: number, sentido: 1 | -1 = 1, pasos = 1) =>
  (((a + sentido * pasos) % n) + n) % n;

const sentidoDe = (e: EstadoOchoLoco) => e.sentido ?? 1;

/**
 * Roba hasta `cuantas` cartas, rehaciendo el mazo con el descarte (menos la de arriba) si se
 * acaba; si no quedan, roba las que haya.
 */
function robarCartas(e: EstadoOchoLoco, asiento: Asiento, cuantas: number) {
  let { mazo, descarte, azar } = e;
  const robadas: IdCarta[] = [];
  while (robadas.length < cuantas) {
    if (mazo.length === 0) {
      if (descarte.length <= 1) break;
      const barajado = barajar(descarte.slice(0, -1), azar);
      mazo = barajado.cartas;
      azar = barajado.azar;
      descarte = descarte.slice(-1);
    }
    robadas.push(mazo.at(-1)!);
    mazo = mazo.slice(0, -1);
  }
  const manos = e.manos.map((m, a) => (a === asiento ? [...m, ...robadas] : m));
  return { mazo, descarte, azar, manos, robadas };
}

const cartasPorMano = (n: number) => (n === 2 ? 7 : 5);

const partidaTerminada = (e: { totales: readonly number[] }) =>
  e.totales.some((t) => t >= OBJETIVO_OCHO_LOCO);

/** Quedan cartas para robar: en el mazo, o en el descarte bajo la de arriba. */
const puedeRobar = (e: EstadoOchoLoco) => e.mazo.length > 0 || e.descarte.length > 1;

/** Las jugadas con esta carta: una, o una por palo si es un 8. */
function jugadasCon(carta: IdCarta): AccionOchoLoco[] {
  if (!esOcho(carta)) return [{ tipo: 'jugar', carta }];
  return PALOS_FRANCESES.map((palo) => ({ tipo: 'jugar', carta, palo }));
}

function nuevaMano(
  config: ConfigOchoLoco,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoOchoLoco[],
  totales: readonly number[],
): EstadoOchoLoco {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const sale = siguiente(repartidor, n);
  const reparto = repartir(cartas, new Array<number>(n).fill(cartasPorMano(n)));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = Array.from(
    { length: n },
    (_, asiento) => reparto.valor.manos[(asiento - sale + n) % n]!,
  );
  // La de arriba del mazo es la última. Un 8 no abre el descarte: va al fondo.
  const mazo = [...reparto.valor.mazo];
  let arriba = mazo.pop()!;
  while (esOcho(arriba)) {
    mazo.unshift(arriba);
    arriba = mazo.pop()!;
  }
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    mazo,
    descarte: [arriba],
    palo: paloOchoLoco(arriba),
    turno: sale,
    robada: null,
    pasesSeguidos: 0,
    ultimas: new Array<UltimaOchoLoco | null>(n).fill(null),
    faltas: new Array<FaltaOchoLoco | null>(n).fill(null),
    resultadosManos,
    totales,
    ...(config.cartasEspeciales ? { sentido: 1 as const, castigo: null, trasNueve: false } : {}),
  };
}

function cerrarMano(e: EstadoOchoLoco, sinCartas: Asiento | null): EstadoOchoLoco {
  const puntosEnMano = e.manos.map(puntosManoOchoLoco);
  let ganador = sinCartas;
  if (ganador === null) {
    const minimo = Math.min(...puntosEnMano);
    const con = puntosEnMano.flatMap((p, a) => (p === minimo ? [a] : []));
    ganador = con.length === 1 ? con[0]! : null;
  }
  const total = puntosEnMano.reduce((s, p) => s + p, 0);
  const ganados = puntosEnMano.map((p, a) => (a === ganador ? total - p : 0));
  const totales = e.totales.map((t, a) => t + ganados[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    { ganador, bloqueada: sinCartas === null, puntosEnMano, ganados, totalesTras: totales },
  ];
  const cerrado: EstadoOchoLoco = { ...e, resultadosManos, totales, robada: null };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, e.config.jugadores),
    resultadosManos,
    totales,
  );
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const ochoLoco: Juego<ConfigOchoLoco, EstadoOchoLoco, AccionOchoLoco, VistaOchoLoco> = {
  id: 'ocho-loco',

  crear(config, semilla) {
    if (![2, 3, 4, 5].includes(config.jugadores)) {
      return error('El Ocho loco se juega de 2 a 5 jugadores');
    }
    if (config.cartasEspeciales !== undefined && typeof config.cartasEspeciales !== 'boolean') {
      return error('Opción de cartas especiales inválida');
    }
    const limpia: ConfigOchoLoco = {
      jugadores: config.jugadores,
      cartasEspeciales: config.cartasEspeciales === true,
    };
    const n = limpia.jugadores;
    return ok(nuevaMano(limpia, crearAzar(semilla), n - 1, [], new Array<number>(n).fill(0)));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const arriba = e.descarte.at(-1)!;
    if (e.robada !== null) {
      const jugadas = casaOchoLoco(e.robada, e.palo, arriba) ? jugadasCon(e.robada) : [];
      return [...jugadas, { tipo: 'pasar' }];
    }
    const mano = e.manos[asiento]!;
    const castigo = e.castigo ?? null;
    if (castigo !== null) {
      // Echar otra carta de ese número (que siempre casa) o robar.
      const jugadas = mano.filter((c) => numeroOchoLoco(c) === castigo.numero).flatMap(jugadasCon);
      return [...jugadas, { tipo: 'robar' }];
    }
    const jugadas = mano.filter((c) => casaOchoLoco(c, e.palo, arriba)).flatMap(jugadasCon);
    if (jugadas.length > 0) return jugadas;
    return [puedeRobar(e) ? { tipo: 'robar' } : { tipo: 'pasar' }];
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    const ultima = (u: UltimaOchoLoco) => e.ultimas.map((x, a) => (a === asiento ? u : x));
    switch (accion.tipo) {
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        let sentido = sentidoDe(e);
        let pasos = 1;
        let castigo: CastigoOchoLoco | null = null;
        let trasNueve = false;
        if (e.config.cartasEspeciales) {
          const numero = numeroOchoLoco(accion.carta);
          if (numero === 10 && n > 2) sentido = sentido === 1 ? -1 : 1;
          if (numero === 7) pasos = 2;
          if (numero === 1) castigo = { numero: 1, robar: 2 };
          if (numero === 6) castigo = { numero: 6, robar: 1 };
          if (numero === 9) trasNueve = true;
        }
        const jugado: EstadoOchoLoco = {
          ...e,
          ...(e.config.cartasEspeciales ? { sentido, castigo, trasNueve } : {}),
          manos,
          descarte: [...e.descarte, accion.carta],
          palo: accion.palo ?? paloOchoLoco(accion.carta),
          turno: siguiente(asiento, n, sentido, pasos),
          robada: null,
          pasesSeguidos: 0,
          ultimas: ultima({
            tipo: 'jugar',
            carta: accion.carta,
            palo: accion.palo ?? null,
            robo: e.robada !== null,
          }),
        };
        return manos[asiento]!.length === 0 ? cerrarMano(jugado, asiento) : jugado;
      }
      case 'robar': {
        const castigo = e.castigo ?? null;
        if (castigo !== null) {
          // Roba por un As o un 6 y sigue con su turno normal.
          const r = robarCartas(e, asiento, castigo.robar);
          return {
            ...e,
            azar: r.azar,
            mazo: r.mazo,
            descarte: r.descarte,
            manos: r.manos,
            castigo: null,
            robada: null,
            ultimas: ultima({ tipo: 'robar', cartas: r.robadas.length }),
          };
        }
        if (e.trasNueve) {
          // Tras un 9, sin carta que echar: roba una y pierde el turno.
          const r = robarCartas(e, asiento, 1);
          return {
            ...e,
            azar: r.azar,
            mazo: r.mazo,
            descarte: r.descarte,
            manos: r.manos,
            trasNueve: false,
            robada: null,
            pasesSeguidos: 0,
            turno: siguiente(asiento, n, sentidoDe(e)),
            ultimas: ultima({ tipo: 'pasar', robo: true }),
            faltas: e.faltas.map((f, a) =>
              a === asiento ? { palo: e.palo, numero: numeroOchoLoco(e.descarte.at(-1)!) } : f,
            ),
          };
        }
        let { mazo, descarte, azar } = e;
        if (mazo.length === 0) {
          // Se rehace el mazo con el descarte, menos la de arriba.
          const barajado = barajar(descarte.slice(0, -1), azar);
          mazo = barajado.cartas;
          azar = barajado.azar;
          descarte = descarte.slice(-1);
        }
        const robada = mazo.at(-1)!;
        return {
          ...e,
          azar,
          mazo: mazo.slice(0, -1),
          descarte,
          manos: e.manos.map((m, a) => (a === asiento ? [...m, robada] : m)),
          robada,
          ultimas: ultima({ tipo: 'robar' }),
          faltas: e.faltas.map((f, a) =>
            a === asiento ? { palo: e.palo, numero: numeroOchoLoco(e.descarte.at(-1)!) } : f,
          ),
        };
      }
      case 'pasar': {
        const robo = e.robada !== null;
        const pasado: EstadoOchoLoco = {
          ...e,
          ...(e.trasNueve ? { trasNueve: false } : {}),
          turno: siguiente(asiento, n, sentidoDe(e)),
          robada: null,
          pasesSeguidos: robo ? 0 : e.pasesSeguidos + 1,
          ultimas: ultima({ tipo: 'pasar', robo }),
        };
        return pasado.pasesSeguidos >= n ? cerrarMano(pasado, null) : pasado;
      }
    }
  },

  vistaDe(e, asiento) {
    const terminada = partidaTerminada(e);
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      palo: e.palo,
      turno: terminada ? null : e.turno,
      robe: !terminada && e.robada !== null,
      robada: asiento === e.turno && !terminada ? e.robada : null,
      pasesSeguidos: e.pasesSeguidos,
      repartidor: e.repartidor,
      ultimas: [...e.ultimas],
      faltas: [...e.faltas],
      resultadosManos: [...e.resultadosManos],
      totales: [...e.totales],
      sentido: sentidoDe(e),
      castigo: e.castigo ?? null,
      trasNueve: e.trasNueve ?? false,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const maximo = Math.max(...e.totales);
    return {
      ganadores: e.totales.flatMap((t, a) => (t === maximo ? [a] : [])),
      empate: false,
      puntos: [...e.totales],
    };
  },
};
