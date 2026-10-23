import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigBlackjack {
  /** Jugadores contra la banca, que juega la máquina y no ocupa asiento. */
  readonly jugadores: 1 | 2 | 3 | 4;
  /** Manos de la partida. */
  readonly manos: 5 | 10 | 20;
}

export const CONFIG_BLACKJACK_POR_DEFECTO: ConfigBlackjack = { jugadores: 2, manos: 10 };

export const FICHAS_INICIALES_BLACKJACK = 100;
export const APUESTA_MINIMA_BLACKJACK = 2;
export const APUESTA_MAXIMA_BLACKJACK = 20;

export interface ManoJugadorBlackjack {
  readonly cartas: readonly IdCarta[];
  readonly apuesta: number;
  readonly doblada: boolean;
  /** Viene de separar: no puede ser blackjack ni doblarse. */
  readonly separada: boolean;
  readonly terminada: boolean;
}

export type ResultadoBlackjack = 'gana' | 'blackjack' | 'empata' | 'pierde' | 'pasa';

export interface ResultadoManoBlackjack {
  readonly banca: readonly IdCarta[];
  readonly valorBanca: number;
  /** Las manos de cada jugador (vacío si no jugó), con su resultado. */
  readonly manos: readonly (readonly {
    readonly cartas: readonly IdCarta[];
    readonly apuesta: number;
    readonly valor: number;
    readonly resultado: ResultadoBlackjack;
  }[])[];
  /** Fichas ganadas (positivo) o perdidas (negativo) por cada jugador en la mano. */
  readonly ganancias: readonly number[];
  readonly fichasTras: readonly number[];
}

export interface EstadoBlackjack {
  readonly config: ConfigBlackjack;
  readonly azar: EstadoAzar;
  readonly fichas: readonly number[];
  /** Quién juega la mano en curso: tenía fichas para apostar al empezarla. */
  readonly activos: readonly boolean[];
  readonly fase: 'apuesta' | 'juego';
  readonly turno: Asiento;
  /** Mano del jugador en turno que se juega (tras separar, 0 o 1). */
  readonly manoActiva: number;
  /** Apuesta de cada jugador en esta mano; `null` si aún no apostó o no juega. */
  readonly apuestas: readonly (number | null)[];
  readonly manos: readonly (readonly ManoJugadorBlackjack[])[];
  /** Cartas de la banca: la segunda es la tapada. */
  readonly banca: readonly IdCarta[];
  readonly descubierta: boolean;
  /** La banca miró su tapada (con un As o un 10 visible) y no tenía blackjack. */
  readonly miro: boolean;
  /** Boca abajo; la siguiente que sale es la última. */
  readonly mazo: readonly IdCarta[];
  readonly resultadosManos: readonly ResultadoManoBlackjack[];
}

export type AccionBlackjack =
  | { readonly tipo: 'apostar'; readonly fichas: number }
  | { readonly tipo: 'pedir' }
  | { readonly tipo: 'plantarse' }
  | { readonly tipo: 'doblar' }
  | { readonly tipo: 'separar' };

export interface VistaBlackjack {
  readonly config: ConfigBlackjack;
  readonly asiento: Asiento | null;
  readonly fichas: readonly number[];
  readonly activos: readonly boolean[];
  readonly fase: EstadoBlackjack['fase'];
  readonly turno: Asiento | null;
  readonly manoActiva: number;
  readonly apuestas: readonly (number | null)[];
  readonly manos: readonly (readonly ManoJugadorBlackjack[])[];
  /** Cartas de la banca; la tapada es `null` hasta que se descubre. */
  readonly banca: readonly (IdCarta | null)[];
  /** Valor de la banca cuando se ven todas sus cartas. */
  readonly valorBanca: number | null;
  readonly miro: boolean;
  readonly mazo: number;
  readonly resultadosManos: readonly ResultadoManoBlackjack[];
}

// ── Valores ──────────────────────────────────────────────────────────────────

/** Valor de una carta con el As como 1 y las figuras como 10. */
export const puntosCartaBlackjack = (c: IdCarta) => Math.min(10, cartaDeId(c)!.valor);

/** Valor de una mano: los ases como 1 y, si cabe, uno como 11 (mano blanda). */
export function valorBlackjack(cartas: readonly IdCarta[]): { total: number; blanda: boolean } {
  const base = cartas.reduce((s, c) => s + puntosCartaBlackjack(c), 0);
  const conAs = cartas.some((c) => puntosCartaBlackjack(c) === 1);
  if (conAs && base + 10 <= 21) return { total: base + 10, blanda: true };
  return { total: base, blanda: false };
}

/** Dos cartas que suman 21 en una mano que no viene de separar. */
export const esBlackjack = (cartas: readonly IdCarta[], separada = false) =>
  !separada && cartas.length === 2 && valorBlackjack(cartas).total === 21;

/** Fichas que no están comprometidas en las apuestas de la mano. */
function libres(e: EstadoBlackjack, asiento: Asiento): number {
  return e.fichas[asiento]! - e.manos[asiento]!.reduce((s, m) => s + m.apuesta, 0);
}

/** Las apuestas legales con estas fichas: pares de 2 a 20. */
export function apuestasLegalesBlackjack(fichas: number): number[] {
  const tope = Math.min(APUESTA_MAXIMA_BLACKJACK, fichas);
  const apuestas: number[] = [];
  for (let f = APUESTA_MINIMA_BLACKJACK; f <= tope; f += 2) apuestas.push(f);
  return apuestas;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const partidaTerminada = (e: EstadoBlackjack) =>
  e.resultadosManos.length >= e.config.manos ||
  (e.resultadosManos.length > 0 && e.fichas.every((f) => f < APUESTA_MINIMA_BLACKJACK));

/** Siguiente jugador activo que aún no ha apostado, desde `desde`. */
function siguienteSinApostar(e: EstadoBlackjack, desde: number): Asiento | null {
  for (let a = desde; a < e.config.jugadores; a++) {
    if (e.activos[a] && e.apuestas[a] === null) return a;
  }
  return null;
}

/** La siguiente mano sin terminar, desde la mano `mano` del asiento `asiento`. */
function siguienteMano(
  manos: EstadoBlackjack['manos'],
  asiento: Asiento,
  mano: number,
): { turno: Asiento; manoActiva: number } | null {
  for (let a = asiento; a < manos.length; a++) {
    const desde = a === asiento ? mano : 0;
    for (let m = desde; m < manos[a]!.length; m++) {
      if (!manos[a]![m]!.terminada) return { turno: a, manoActiva: m };
    }
  }
  return null;
}

function nuevaMano(e: EstadoBlackjack): EstadoBlackjack {
  const activos = e.fichas.map((f) => f >= APUESTA_MINIMA_BLACKJACK);
  return {
    ...e,
    activos,
    fase: 'apuesta',
    turno: Math.max(0, activos.indexOf(true)),
    manoActiva: 0,
    apuestas: e.fichas.map(() => null),
    manos: e.fichas.map(() => []),
    banca: [],
    descubierta: false,
    miro: false,
    mazo: [],
  };
}

/** Baraja y reparte: dos cartas a cada jugador activo y a la banca (la segunda, tapada). */
function repartir(e: EstadoBlackjack): EstadoBlackjack {
  const { cartas, azar } = barajar(crearBaraja('francesa52'), e.azar);
  const mazo = [...cartas];
  const sacar = () => mazo.pop()!;
  const primeras = e.activos.map((activo) => (activo ? [sacar()] : []));
  const visible = sacar();
  const segundas = primeras.map((c) => (c.length > 0 ? [...c, sacar()] : c));
  const tapada = sacar();
  const banca = [visible, tapada];
  const manos = segundas.map((cartas, a) =>
    cartas.length === 0
      ? []
      : [
          {
            cartas,
            apuesta: e.apuestas[a]!,
            doblada: false,
            separada: false,
            terminada: esBlackjack(cartas),
          },
        ],
  );
  const puedeTener = puntosCartaBlackjack(visible) === 1 || puntosCartaBlackjack(visible) === 10;
  const repartido: EstadoBlackjack = {
    ...e,
    azar,
    mazo,
    banca,
    manos,
    fase: 'juego',
    descubierta: false,
    miro: puedeTener,
  };
  if (puedeTener && esBlackjack(banca)) return liquidar({ ...repartido, miro: false });
  return avanzar(repartido, 0, 0);
}

/** Pasa el turno a la siguiente mano sin terminar; si no queda ninguna, juega la banca. */
function avanzar(e: EstadoBlackjack, asiento: Asiento, mano: number): EstadoBlackjack {
  const sigue = siguienteMano(e.manos, asiento, mano);
  if (sigue) return { ...e, ...sigue };
  return liquidar(jugarBanca(e));
}

/** La banca descubre y pide hasta 17 si alguna mano sigue viva. */
function jugarBanca(e: EstadoBlackjack): EstadoBlackjack {
  const vivas = e.manos.some((ms) => ms.some((m) => valorBlackjack(m.cartas).total <= 21));
  const mazo = [...e.mazo];
  const banca = [...e.banca];
  while (vivas && valorBlackjack(banca).total < 17) banca.push(mazo.pop()!);
  return { ...e, banca, mazo };
}

function resultadoDe(
  m: ManoJugadorBlackjack,
  banca: readonly IdCarta[],
): { resultado: ResultadoBlackjack; ganancia: number } {
  const valor = valorBlackjack(m.cartas).total;
  const vBanca = valorBlackjack(banca).total;
  const bjBanca = esBlackjack(banca);
  if (valor > 21) return { resultado: 'pasa', ganancia: -m.apuesta };
  if (esBlackjack(m.cartas, m.separada)) {
    return bjBanca
      ? { resultado: 'empata', ganancia: 0 }
      : { resultado: 'blackjack', ganancia: (m.apuesta * 3) / 2 };
  }
  if (bjBanca) return { resultado: 'pierde', ganancia: -m.apuesta };
  if (vBanca > 21 || valor > vBanca) return { resultado: 'gana', ganancia: m.apuesta };
  if (valor === vBanca) return { resultado: 'empata', ganancia: 0 };
  return { resultado: 'pierde', ganancia: -m.apuesta };
}

function liquidar(e: EstadoBlackjack): EstadoBlackjack {
  const manos = e.manos.map((ms) =>
    ms.map((m) => ({
      cartas: m.cartas,
      apuesta: m.apuesta,
      valor: valorBlackjack(m.cartas).total,
      ...resultadoDe(m, e.banca),
    })),
  );
  const ganancias = manos.map((ms) => ms.reduce((s, m) => s + m.ganancia, 0));
  const fichas = e.fichas.map((f, a) => f + ganancias[a]!);
  const resultado: ResultadoManoBlackjack = {
    banca: e.banca,
    valorBanca: valorBlackjack(e.banca).total,
    manos: manos.map((ms) =>
      ms.map(({ cartas, apuesta, valor, resultado }) => ({ cartas, apuesta, valor, resultado })),
    ),
    ganancias,
    fichasTras: fichas,
  };
  const cerrado: EstadoBlackjack = {
    ...e,
    fichas,
    descubierta: true,
    manos: e.manos.map((ms) => ms.map((m) => ({ ...m, terminada: true }))),
    resultadosManos: [...e.resultadosManos, resultado],
  };
  return partidaTerminada(cerrado) ? cerrado : nuevaMano(cerrado);
}

/** Cambia la mano activa del jugador en turno. */
function conMano(
  e: EstadoBlackjack,
  cambio: (m: ManoJugadorBlackjack) => ManoJugadorBlackjack,
): EstadoBlackjack['manos'] {
  return e.manos.map((ms, a) =>
    a === e.turno ? ms.map((m, i) => (i === e.manoActiva ? cambio(m) : m)) : ms,
  );
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const blackjack: Juego<ConfigBlackjack, EstadoBlackjack, AccionBlackjack, VistaBlackjack> = {
  id: 'blackjack',

  crear(config, semilla) {
    if (![1, 2, 3, 4].includes(config.jugadores)) {
      return error('El Blackjack se juega de 1 a 4 jugadores');
    }
    if (![5, 10, 20].includes(config.manos)) return error('La partida es a 5, 10 o 20 manos');
    const limpia: ConfigBlackjack = { jugadores: config.jugadores, manos: config.manos };
    const n = limpia.jugadores;
    const inicial: EstadoBlackjack = {
      config: limpia,
      azar: crearAzar(semilla),
      fichas: new Array<number>(n).fill(FICHAS_INICIALES_BLACKJACK),
      activos: [],
      fase: 'apuesta',
      turno: 0,
      manoActiva: 0,
      apuestas: [],
      manos: [],
      banca: [],
      descubierta: false,
      miro: false,
      mazo: [],
      resultadosManos: [],
    };
    return ok(nuevaMano(inicial));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    if (e.fase === 'apuesta') {
      return apuestasLegalesBlackjack(e.fichas[asiento]!).map((fichas) => ({
        tipo: 'apostar',
        fichas,
      }));
    }
    const mano = e.manos[asiento]![e.manoActiva]!;
    const acciones: AccionBlackjack[] = [{ tipo: 'pedir' }, { tipo: 'plantarse' }];
    const quedan = libres(e, asiento) >= mano.apuesta;
    if (mano.cartas.length === 2 && !mano.separada && quedan) acciones.push({ tipo: 'doblar' });
    const [a, b] = mano.cartas;
    const pareja =
      mano.cartas.length === 2 && puntosCartaBlackjack(a!) === puntosCartaBlackjack(b!);
    if (pareja && e.manos[asiento]!.length === 1 && quedan) acciones.push({ tipo: 'separar' });
    return acciones;
  },

  transicion(e, asiento, accion) {
    if (accion.tipo === 'apostar') {
      const apuestas = e.apuestas.map((x, a) => (a === asiento ? accion.fichas : x));
      const apostado: EstadoBlackjack = { ...e, apuestas };
      const siguiente = siguienteSinApostar(apostado, asiento + 1);
      return siguiente === null ? repartir(apostado) : { ...apostado, turno: siguiente };
    }
    const mazo = [...e.mazo];
    const sacar = () => mazo.pop()!;
    switch (accion.tipo) {
      case 'pedir': {
        const manos = conMano(e, (m) => {
          const cartas = [...m.cartas, sacar()];
          return { ...m, cartas, terminada: valorBlackjack(cartas).total >= 21 };
        });
        const tras: EstadoBlackjack = { ...e, manos, mazo };
        return manos[asiento]![e.manoActiva]!.terminada
          ? avanzar(tras, asiento, e.manoActiva + 1)
          : tras;
      }
      case 'plantarse': {
        const manos = conMano(e, (m) => ({ ...m, terminada: true }));
        return avanzar({ ...e, manos }, asiento, e.manoActiva + 1);
      }
      case 'doblar': {
        const manos = conMano(e, (m) => ({
          ...m,
          cartas: [...m.cartas, sacar()],
          apuesta: m.apuesta * 2,
          doblada: true,
          terminada: true,
        }));
        return avanzar({ ...e, manos, mazo }, asiento, e.manoActiva + 1);
      }
      case 'separar': {
        const mano = e.manos[asiento]![e.manoActiva]!;
        const ases = puntosCartaBlackjack(mano.cartas[0]!) === 1;
        const dos = mano.cartas.map((c) => {
          const cartas = [c, sacar()];
          return {
            cartas,
            apuesta: mano.apuesta,
            doblada: false,
            separada: true,
            terminada: ases || valorBlackjack(cartas).total === 21,
          };
        });
        const manos = e.manos.map((ms, a) => (a === asiento ? dos : ms));
        return avanzar({ ...e, manos, mazo }, asiento, 0);
      }
    }
  },

  vistaDe(e, asiento) {
    const terminada = partidaTerminada(e);
    return {
      config: e.config,
      asiento,
      fichas: [...e.fichas],
      activos: [...e.activos],
      fase: e.fase,
      turno: terminada ? null : e.turno,
      manoActiva: e.manoActiva,
      apuestas: [...e.apuestas],
      manos: e.manos.map((ms) => [...ms]),
      banca: e.banca.map((c, i) => (i === 1 && !e.descubierta ? null : c)),
      valorBanca: e.descubierta ? valorBlackjack(e.banca).total : null,
      miro: e.miro,
      mazo: e.mazo.length,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const puntos = [...e.fichas];
    if (e.config.jugadores === 1) {
      const f = e.fichas[0]!;
      if (f === FICHAS_INICIALES_BLACKJACK) return { ganadores: [], empate: true, puntos };
      return { ganadores: f > FICHAS_INICIALES_BLACKJACK ? [0] : [], empate: false, puntos };
    }
    const maximo = Math.max(...e.fichas);
    const ganadores = e.fichas.flatMap((f, a) => (f === maximo ? [a] : []));
    if (ganadores.length === e.fichas.length) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
