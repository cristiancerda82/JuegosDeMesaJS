import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import { cartaGanadora, cartasObligadas, paloDe, type CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export const MANOS_JULEPE = [6, 12, 20] as const;

export interface ConfigJulepe {
  /** De 3 a 6 jugadores, cada uno por su cuenta. */
  readonly jugadores: 3 | 4 | 5 | 6;
  /** Manos que dura la partida. */
  readonly manos: (typeof MANOS_JULEPE)[number];
}

export const CONFIG_JULEPE_POR_DEFECTO: ConfigJulepe = { jugadores: 4, manos: 12 };

/** Fichas con las que empieza cada jugador. */
export const FICHAS_INICIALES = 50;
/** Fichas que pone el repartidor en el bote al empezar cada mano. */
export const PUESTA_JULEPE = 10;
/** Bazas por mano y bazas mínimas para no pagar julepe. */
export const BAZAS_MANO_JULEPE = 5;
export const BAZAS_MINIMAS_JULEPE = 2;
const CARTAS_EN_MANO = 5;

export type FaseJulepe = 'decidir' | 'descartar' | 'jugar';

export interface ResultadoManoJulepe {
  readonly repartidor: Asiento;
  /** Quién jugó la mano (`null`: eliminado). */
  readonly juega: readonly (boolean | null)[];
  /** Nadie quiso jugar y el repartidor se llevó el bote. */
  readonly nadieJugo: boolean;
  readonly bazas: readonly number[];
  /** Lo que valía el bote en la mano. */
  readonly boteMano: number;
  readonly cobrado: readonly number[];
  /** Julepe que pagó cada uno. */
  readonly julepe: readonly number[];
  readonly fichasTras: readonly number[];
  readonly eliminadosTras: readonly boolean[];
}

export interface EstadoJulepe {
  readonly config: ConfigJulepe;
  readonly azar: EstadoAzar;
  /** Manos ya terminadas. */
  readonly numeroMano: number;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Cartas sin repartir; se roba de la primera. */
  readonly mazo: readonly IdCarta[];
  readonly descartadas: readonly IdCarta[];
  /** La carta del repartidor que marca el triunfo, mientras siga en su mano. */
  readonly cartaTriunfo: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly fase: FaseJulepe;
  readonly turno: Asiento;
  /** Quién juega la mano: `null` si no ha decidido o está eliminado. */
  readonly juega: readonly (boolean | null)[];
  /** Cartas que cambió cada uno en el descarte; `null` si no ha descartado. */
  readonly cambios: readonly (number | null)[];
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  }[];
  readonly bazas: readonly number[];
  readonly bote: number;
  /** Lo que valía el bote al repartir: fija el valor de la baza y el julepe. */
  readonly boteMano: number;
  readonly fichas: readonly number[];
  readonly eliminados: readonly boolean[];
  readonly resultadosManos: readonly ResultadoManoJulepe[];
  /** La última baza jugada, aunque sea de la mano anterior: se ve mientras se recoge. */
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
}

export type AccionJulepe =
  | { readonly tipo: 'jugar' }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'descartar'; readonly cartas: readonly IdCarta[] }
  | { readonly tipo: 'carta'; readonly carta: IdCarta };

export interface VistaJulepe {
  readonly config: ConfigJulepe;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas que quedan en el mazo de descartes. */
  readonly mazo: number;
  readonly muestra: null;
  readonly cartaTriunfo: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly repartidor: Asiento;
  readonly mano: Asiento;
  readonly fase: FaseJulepe;
  readonly turno: Asiento | null;
  readonly juega: readonly (boolean | null)[];
  readonly cambios: readonly (number | null)[];
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: EstadoJulepe['bazasJugadas'];
  readonly bazas: readonly number[];
  readonly ultimaBaza: EstadoJulepe['ultimaBaza'];
  readonly bote: number;
  readonly boteMano: number;
  readonly fichas: readonly number[];
  readonly eliminados: readonly boolean[];
  readonly numeroMano: number;
  readonly resultadosManos: readonly ResultadoManoJulepe[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** El siguiente asiento tras `asiento` que cumple `vale` (vuelve a empezar al final). */
function siguienteQue(asiento: Asiento, n: number, vale: (a: Asiento) => boolean): Asiento {
  for (let i = 1; i <= n; i++) {
    const a = (asiento + i) % n;
    if (vale(a)) return a;
  }
  return asiento;
}

const activo = (e: Pick<EstadoJulepe, 'eliminados'>) => (a: Asiento) => !e.eliminados[a];
const jugando = (e: Pick<EstadoJulepe, 'juega'>) => (a: Asiento) => e.juega[a] === true;

export const manoJulepe = (e: Pick<EstadoJulepe, 'repartidor' | 'eliminados' | 'config'>) =>
  siguienteQue(e.repartidor, e.config.jugadores, activo(e));

const activos = (e: Pick<EstadoJulepe, 'eliminados'>) => e.eliminados.filter((x) => !x).length;

function partidaTerminada(e: EstadoJulepe): boolean {
  return e.numeroMano >= e.config.manos || activos(e) <= 1;
}

/** Reparte una mano: puesta del repartidor, 5 cartas a cada activo y triunfo a la vista. */
function nuevaMano(
  base: Omit<
    EstadoJulepe,
    | 'manos'
    | 'mazo'
    | 'descartadas'
    | 'cartaTriunfo'
    | 'triunfo'
    | 'fase'
    | 'turno'
    | 'juega'
    | 'cambios'
    | 'mesa'
    | 'bazasJugadas'
    | 'bazas'
    | 'boteMano'
  >,
): EstadoJulepe {
  const n = base.config.jugadores;
  const { cartas, azar } = barajar(crearBaraja('espanola40'), base.azar);
  const mano = manoJulepe(base);
  const orden: Asiento[] = [];
  for (let a = mano; ; a = siguienteQue(a, n, activo(base))) {
    orden.push(a);
    if (a === base.repartidor) break;
  }
  const reparto = repartir(
    cartas,
    orden.map(() => CARTAS_EN_MANO),
  );
  if (!reparto.ok) throw new Error(reparto.error);
  const manos: IdCarta[][] = Array.from({ length: n }, () => []);
  orden.forEach((a, i) => (manos[a] = reparto.valor.manos[i]!));
  const cartaTriunfo = manos[base.repartidor]!.at(-1)!;
  const puesta = Math.min(PUESTA_JULEPE, base.fichas[base.repartidor]!);
  const fichas = base.fichas.map((f, a) => (a === base.repartidor ? f - puesta : f));
  const bote = base.bote + puesta;
  return {
    ...base,
    azar,
    manos,
    mazo: reparto.valor.mazo,
    descartadas: [],
    cartaTriunfo,
    triunfo: paloDe(cartaTriunfo),
    fase: 'decidir',
    turno: mano,
    juega: new Array<boolean | null>(n).fill(null),
    cambios: new Array<number | null>(n).fill(null),
    mesa: [],
    bazasJugadas: [],
    bazas: new Array<number>(n).fill(0),
    fichas,
    bote,
    boteMano: bote,
  };
}

/** Cierra la mano: cobro por bazas, julepes, eliminados, y la mano siguiente o el fin. */
function cerrarMano(e: EstadoJulepe, nadieJugo: boolean): EstadoJulepe {
  const n = e.config.jugadores;
  const valorBaza = Math.floor(e.boteMano / BAZAS_MANO_JULEPE);
  const cobrado = new Array<number>(n).fill(0);
  const julepe = new Array<number>(n).fill(0);
  let bote = e.bote;
  if (nadieJugo) {
    cobrado[e.repartidor] = bote;
    bote = 0;
  } else {
    for (let a = 0; a < n; a++) {
      if (e.juega[a] !== true) continue;
      cobrado[a] = e.bazas[a]! * valorBaza;
      bote -= cobrado[a]!;
    }
  }
  let fichas = e.fichas.map((f, a) => f + cobrado[a]!);
  if (!nadieJugo) {
    for (let a = 0; a < n; a++) {
      if (e.juega[a] !== true || e.bazas[a]! >= BAZAS_MINIMAS_JULEPE) continue;
      julepe[a] = Math.min(e.boteMano, fichas[a]!);
      bote += julepe[a]!;
    }
    fichas = fichas.map((f, a) => f - julepe[a]!);
  }
  const eliminados = e.eliminados.map((x, a) => x || fichas[a] === 0);
  const resultadosManos = [
    ...e.resultadosManos,
    {
      repartidor: e.repartidor,
      juega: e.juega,
      nadieJugo,
      bazas: e.bazas,
      boteMano: e.boteMano,
      cobrado,
      julepe,
      fichasTras: fichas,
      eliminadosTras: eliminados,
    },
  ];
  const cerrado: EstadoJulepe = {
    ...e,
    numeroMano: e.numeroMano + 1,
    fichas,
    eliminados,
    bote,
    resultadosManos,
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano({
    ...cerrado,
    repartidor: siguienteQue(e.repartidor, n, (a) => !eliminados[a]),
  });
}

/** Tras decidir el repartidor: al descarte, o el bote para él si nadie juega. */
function trasDecidir(e: EstadoJulepe): EstadoJulepe {
  const n = e.config.jugadores;
  const nadie = !e.juega.some((j, a) => j === true && a !== e.repartidor);
  if (nadie) return cerrarMano(e, true);
  return { ...e, fase: 'descartar', turno: siguienteQue(e.repartidor, n, jugando(e)) };
}

function resolverBaza(e: EstadoJulepe): EstadoJulepe {
  const ganador = cartaGanadora(e.mesa, e.triunfo).asiento;
  const baza = { cartas: e.mesa, ganador };
  const resuelto: EstadoJulepe = {
    ...e,
    mesa: [],
    turno: ganador,
    bazasJugadas: [...e.bazasJugadas, baza],
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    ultimaBaza: baza,
  };
  return resuelto.bazasJugadas.length === BAZAS_MANO_JULEPE
    ? cerrarMano(resuelto, false)
    : resuelto;
}

/** Todos los subconjuntos de `cartas` de tamaño como mucho `maximo`, en orden de la mano. */
function subconjuntos(cartas: readonly IdCarta[], maximo: number): IdCarta[][] {
  const todos: IdCarta[][] = [];
  for (let mascara = 0; mascara < 1 << cartas.length; mascara++) {
    const elegidas = cartas.filter((_, i) => mascara & (1 << i));
    if (elegidas.length <= maximo) todos.push(elegidas);
  }
  return todos;
}

/** Cuántos juegan antes del repartidor (para saber si está obligado). */
const juegan = (e: EstadoJulepe) => e.juega.filter((j) => j === true).length;

// ── Juego ────────────────────────────────────────────────────────────────────

export const julepe: Juego<ConfigJulepe, EstadoJulepe, AccionJulepe, VistaJulepe> = {
  id: 'julepe',

  crear(config, semilla) {
    if (![3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Julepe se juega de 3 a 6 jugadores');
    }
    if (!(MANOS_JULEPE as readonly number[]).includes(config.manos)) {
      return error('La partida de Julepe dura 6, 12 o 20 manos');
    }
    const limpia: ConfigJulepe = { jugadores: config.jugadores, manos: config.manos };
    const n = limpia.jugadores;
    // Empieza repartiendo el último asiento, así es mano el asiento 0.
    return ok(
      nuevaMano({
        config: limpia,
        azar: crearAzar(semilla),
        numeroMano: 0,
        repartidor: n - 1,
        bote: 0,
        fichas: new Array<number>(n).fill(FICHAS_INICIALES),
        eliminados: new Array<boolean>(n).fill(false),
        resultadosManos: [],
        ultimaBaza: null,
      }),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'decidir':
        // El repartidor está obligado si antes de él juega uno solo, o nadie (y se lleva el bote).
        if (asiento === e.repartidor && juegan(e) <= 1) return [{ tipo: 'jugar' }];
        return [{ tipo: 'jugar' }, { tipo: 'pasar' }];
      case 'descartar':
        return subconjuntos(e.manos[asiento]!, e.mazo.length).map((cartas) => ({
          tipo: 'descartar' as const,
          cartas,
        }));
      case 'jugar':
        return cartasObligadas(e.manos[asiento]!, e.mesa, e.triunfo, {
          asiento,
          montarSobreCompanero: true,
        }).map((carta) => ({ tipo: 'carta' as const, carta }));
    }
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    switch (accion.tipo) {
      case 'jugar':
      case 'pasar': {
        const decidido: EstadoJulepe = {
          ...e,
          juega: e.juega.map((j, a) => (a === asiento ? accion.tipo === 'jugar' : j)),
        };
        if (asiento === e.repartidor) return trasDecidir(decidido);
        return { ...decidido, turno: siguienteQue(asiento, n, activo(e)) };
      }
      case 'descartar': {
        const k = accion.cartas.length;
        const robadas = e.mazo.slice(0, k);
        const manos = e.manos.map((m, a) =>
          a === asiento ? [...m.filter((c) => !accion.cartas.includes(c)), ...robadas] : m,
        );
        const descartado: EstadoJulepe = {
          ...e,
          manos,
          mazo: e.mazo.slice(k),
          descartadas: [...e.descartadas, ...accion.cartas],
          cartaTriunfo:
            e.cartaTriunfo !== null && accion.cartas.includes(e.cartaTriunfo)
              ? null
              : e.cartaTriunfo,
          cambios: e.cambios.map((c, a) => (a === asiento ? k : c)),
        };
        const quedan = e.juega.some((j, a) => j === true && descartado.cambios[a] === null);
        if (quedan) {
          return {
            ...descartado,
            turno: siguienteQue(
              asiento,
              n,
              (a) => e.juega[a] === true && descartado.cambios[a] === null,
            ),
          };
        }
        return { ...descartado, fase: 'jugar', turno: siguienteQue(e.repartidor, n, jugando(e)) };
      }
      case 'carta': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const cartaTriunfo = accion.carta === e.cartaTriunfo ? null : e.cartaTriunfo;
        const jugado: EstadoJulepe = { ...e, manos, mesa, cartaTriunfo };
        return mesa.length < juegan(e)
          ? { ...jugado, turno: siguienteQue(asiento, n, jugando(e)) }
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
      mazo: e.mazo.length,
      muestra: null,
      cartaTriunfo: e.cartaTriunfo,
      triunfo: e.triunfo,
      repartidor: e.repartidor,
      mano: manoJulepe(e),
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      juega: [...e.juega],
      cambios: [...e.cambios],
      mesa: [...e.mesa],
      bazasJugadas: [...e.bazasJugadas],
      bazas: [...e.bazas],
      ultimaBaza: e.ultimaBaza,
      bote: e.bote,
      boteMano: e.boteMano,
      fichas: [...e.fichas],
      eliminados: [...e.eliminados],
      numeroMano: e.numeroMano,
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
