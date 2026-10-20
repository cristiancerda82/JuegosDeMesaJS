import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import { paloDe, siguiente, valorDe, type CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export const MANOS_CUATROLA = [4, 8, 12] as const;

export interface ConfigCuatrola {
  /** Manos que dura la partida (las que se juegan; si todos pasan, no cuenta). */
  readonly manos: (typeof MANOS_CUATROLA)[number];
}

export const CONFIG_CUATROLA_POR_DEFECTO: ConfigCuatrola = { manos: 8 };

/** Bazas que necesita el bando del jugador para ganar la mano. */
export const BAZAS_PARA_GANAR_CUATROLA = 6;
export const BAZAS_MANO_CUATROLA = 10;

const JUGADORES = 4;

export type ModalidadCuatrola = 'rey' | 'solo';
export type FaseCuatrola = 'subasta' | 'triunfo' | 'bazas';
/** Lo último que dijo cada uno en la subasta, o `null` si aún no habló. */
export type DichoCuatrola = ModalidadCuatrola | 'paso' | null;

export interface ResultadoManoCuatrola {
  readonly repartidor: Asiento;
  readonly jugador: Asiento;
  readonly modalidad: ModalidadCuatrola;
  readonly triunfo: PaloEspanol;
  readonly llamada: IdCarta | null;
  readonly companero: Asiento | null;
  /** Bazas del bando del jugador (con su compañero) y de los defensores. */
  readonly bazasJugador: number;
  readonly bazasDefensores: number;
  readonly gana: boolean;
  readonly bola: boolean;
  /** Fichas que ganó (positivo) o perdió (negativo) cada uno. */
  readonly cambio: readonly number[];
  readonly fichasTras: readonly number[];
}

interface Baza {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: Asiento;
}

export interface EstadoCuatrola {
  readonly config: ConfigCuatrola;
  readonly azar: EstadoAzar;
  /** Manos ya jugadas (las que cuentan). */
  readonly numeroMano: number;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: FaseCuatrola;
  readonly turno: Asiento;
  readonly dichos: readonly DichoCuatrola[];
  /** Puja vigente y quién la hizo; tras la subasta, el jugador y su modalidad. */
  readonly modalidad: ModalidadCuatrola | null;
  readonly jugador: Asiento | null;
  /** La mano anterior se repartió de nuevo porque pasaron los cuatro. */
  readonly todosPasaron: boolean;
  readonly triunfo: PaloEspanol | null;
  readonly llamada: IdCarta | null;
  /** Quien tiene la carta llamada: el compañero del jugador (oculto en las vistas ajenas). */
  readonly companero: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly bazasMano: readonly Baza[];
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  readonly resultadosManos: readonly ResultadoManoCuatrola[];
  /** La última baza jugada, aunque sea de la mano anterior: se ve mientras se recoge. */
  readonly ultimaBaza: Baza | null;
}

export type AccionCuatrola =
  | { readonly tipo: 'pujar'; readonly modalidad: ModalidadCuatrola }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'elegir'; readonly triunfo: PaloEspanol; readonly llamada: IdCarta | null }
  | { readonly tipo: 'jugar'; readonly carta: IdCarta };

export interface VistaCuatrola {
  readonly config: ConfigCuatrola;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly repartidor: Asiento;
  /** El primero en hablar y en salir. */
  readonly mano: Asiento;
  readonly fase: FaseCuatrola;
  readonly turno: Asiento | null;
  readonly dichos: readonly DichoCuatrola[];
  readonly modalidad: ModalidadCuatrola | null;
  readonly jugador: Asiento | null;
  readonly todosPasaron: boolean;
  readonly triunfo: PaloEspanol | null;
  readonly llamada: IdCarta | null;
  /** El compañero, si es este asiento o si ya se jugó la carta llamada; si no, `null`. */
  readonly companero: Asiento | null;
  readonly mesa: readonly CartaJugada[];
  readonly bazasMano: readonly Baza[];
  readonly bazas: readonly number[];
  readonly fichas: readonly number[];
  readonly numeroMano: number;
  readonly resultadosManos: readonly ResultadoManoCuatrola[];
  readonly ultimaBaza: Baza | null;
}

// ── Orden del Tresillo ───────────────────────────────────────────────────────

const AS = 1;
const ESPADILLA: IdCarta = 'espadas-1';
const BASTO: IdCarta = 'bastos-1';

const esRojo = (palo: PaloEspanol) => palo === 'oros' || palo === 'copas';

/** La malilla: el 7 del triunfo si es oros o copas, el 2 si es espadas o bastos. */
export const malillaCuatrola = (triunfo: PaloEspanol): IdCarta =>
  `${triunfo}-${esRojo(triunfo) ? 7 : 2}`;

/** Espadilla, malilla, basto y, con triunfo rojo, el punto (su As). */
export function esMatador(carta: IdCarta, triunfo: PaloEspanol): boolean {
  return (
    carta === ESPADILLA ||
    carta === BASTO ||
    carta === malillaCuatrola(triunfo) ||
    (esRojo(triunfo) && carta === `${triunfo}-${AS}`)
  );
}

/** El palo que cuenta para seguir y ganar: el triunfo para los matadores. */
export const paloCuatrola = (carta: IdCarta, triunfo: PaloEspanol): PaloEspanol =>
  esMatador(carta, triunfo) ? triunfo : paloDe(carta);

/** Orden de los números, de mayor a menor, en un palo rojo y en uno negro (sin figuras). */
const NUMEROS_ROJO = [1, 2, 3, 4, 5, 6, 7];
const NUMEROS_NEGRO = [7, 6, 5, 4, 3, 2];

/**
 * Rango de la carta dentro de su palo efectivo: mayor cuanto más alta. Los matadores van
 * delante (espadilla, malilla, basto y punto), después Rey, Caballo y Sota, y después los
 * números en el orden de su color.
 */
export function rangoCuatrola(carta: IdCarta, triunfo: PaloEspanol): number {
  if (carta === ESPADILLA) return 100;
  if (carta === malillaCuatrola(triunfo)) return 99;
  if (carta === BASTO) return 98;
  if (esMatador(carta, triunfo)) return 97;
  const v = valorDe(carta);
  if (v >= 10) return 40 + v;
  const orden = esRojo(paloDe(carta)) ? NUMEROS_ROJO : NUMEROS_NEGRO;
  return 40 - orden.indexOf(v);
}

/** La carta que gana la baza: el triunfo más alto o, sin triunfo, la más alta de la salida. */
export function ganadoraCuatrola(mesa: readonly CartaJugada[], triunfo: PaloEspanol): CartaJugada {
  const salida = paloCuatrola(mesa[0]!.carta, triunfo);
  let mejor = mesa[0]!;
  for (const j of mesa.slice(1)) {
    const palo = paloCuatrola(j.carta, triunfo);
    const paloMejor = paloCuatrola(mejor.carta, triunfo);
    if (palo === paloMejor) {
      if (rangoCuatrola(j.carta, triunfo) > rangoCuatrola(mejor.carta, triunfo)) mejor = j;
    } else if (palo === triunfo || (palo === salida && paloMejor !== triunfo)) {
      mejor = j;
    }
  }
  return mejor;
}

/**
 * Cartas que se pueden jugar: hay que seguir el palo de salida si se puede, sin obligación de
 * fallar ni de superar. Si la salida es triunfo, los matadores más altos que ella no obligan:
 * quien solo tiene esos juega lo que quiera, y quien tiene otros triunfos puede echar esos o
 * sus matadores.
 */
export function jugablesCuatrola(
  mano: readonly IdCarta[],
  mesa: readonly CartaJugada[],
  triunfo: PaloEspanol,
): readonly IdCarta[] {
  if (mesa.length === 0) return mano;
  const salida = mesa[0]!.carta;
  const palo = paloCuatrola(salida, triunfo);
  const delPalo = mano.filter((c) => paloCuatrola(c, triunfo) === palo);
  if (palo !== triunfo) return delPalo.length > 0 ? delPalo : mano;
  const privilegiado = (c: IdCarta) =>
    esMatador(c, triunfo) && rangoCuatrola(c, triunfo) > rangoCuatrola(salida, triunfo);
  const obligadas = delPalo.filter((c) => !privilegiado(c));
  return obligadas.length > 0 ? delPalo : mano;
}

/** Cartas que el jugador puede llamar: los reyes que no tiene, o los caballos, o las sotas. */
export function llamablesCuatrola(mano: readonly IdCarta[]): IdCarta[] {
  for (const valor of [12, 11, 10]) {
    const faltan = PALOS_ESPANOLES.map((p): IdCarta => `${p}-${valor}`).filter(
      (c) => !mano.includes(c),
    );
    if (faltan.length > 0) return faltan;
  }
  return [];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const partidaTerminada = (e: EstadoCuatrola) => e.numeroMano >= e.config.manos;

/** Bazas del bando del jugador (con su compañero) y de los defensores. */
export function bazasPorBando(e: Pick<EstadoCuatrola, 'bazas' | 'jugador' | 'companero'>): {
  jugador: number;
  defensores: number;
} {
  let jugador = 0;
  let defensores = 0;
  e.bazas.forEach((b, a) => {
    if (a === e.jugador || a === e.companero) jugador += b;
    else defensores += b;
  });
  return { jugador, defensores };
}

/** Reparte una mano nueva con `repartidor`: 10 cartas a cada uno y empieza la subasta. */
function nuevaMano(
  base: Pick<
    EstadoCuatrola,
    'config' | 'azar' | 'numeroMano' | 'repartidor' | 'fichas' | 'resultadosManos' | 'ultimaBaza'
  >,
  todosPasaron: boolean,
): EstadoCuatrola {
  const { cartas, azar } = barajar(crearBaraja('espanola40'), base.azar);
  const reparto = repartir(cartas, new Array<number>(JUGADORES).fill(BAZAS_MANO_CUATROLA));
  if (!reparto.ok) throw new Error(reparto.error);
  const mano = siguiente(base.repartidor, JUGADORES);
  const manos = Array.from(
    { length: JUGADORES },
    (_, a) => reparto.valor.manos[(a - mano + JUGADORES) % JUGADORES]!,
  );
  return {
    ...base,
    azar,
    manos,
    fase: 'subasta',
    turno: mano,
    dichos: new Array<DichoCuatrola>(JUGADORES).fill(null),
    modalidad: null,
    jugador: null,
    todosPasaron,
    triunfo: null,
    llamada: null,
    companero: null,
    mesa: [],
    bazasMano: [],
    bazas: new Array<number>(JUGADORES).fill(0),
  };
}

/** Fichas que gana o pierde cada uno al cerrar la mano. */
function cobro(
  jugador: Asiento,
  companero: Asiento | null,
  modalidad: ModalidadCuatrola,
  gana: boolean,
  bola: boolean,
): number[] {
  const valor = (modalidad === 'rey' ? 1 : 2) * (bola ? 2 : 1);
  return Array.from({ length: JUGADORES }, (_, a) => {
    if (modalidad === 'solo')
      return a === jugador ? (gana ? 3 : -3) * valor : gana ? -valor : valor;
    if (gana) return a === jugador || a === companero ? 2 * valor : -2 * valor;
    return a === jugador ? -4 * valor : a === companero ? 0 : 2 * valor;
  });
}

function cerrarMano(e: EstadoCuatrola): EstadoCuatrola {
  const jugador = e.jugador!;
  const modalidad = e.modalidad!;
  const { jugador: bazasJugador, defensores: bazasDefensores } = bazasPorBando(e);
  const gana = bazasJugador >= BAZAS_PARA_GANAR_CUATROLA;
  const bola = bazasJugador === BAZAS_MANO_CUATROLA || bazasDefensores === BAZAS_MANO_CUATROLA;
  const cambio = cobro(jugador, e.companero, modalidad, gana, bola);
  const fichas = e.fichas.map((f, a) => f + cambio[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    {
      repartidor: e.repartidor,
      jugador,
      modalidad,
      triunfo: e.triunfo!,
      llamada: e.llamada,
      companero: e.companero,
      bazasJugador,
      bazasDefensores,
      gana,
      bola,
      cambio,
      fichasTras: fichas,
    },
  ];
  const cerrado: EstadoCuatrola = {
    ...e,
    numeroMano: e.numeroMano + 1,
    fichas,
    resultadosManos,
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano({ ...cerrado, repartidor: siguiente(e.repartidor, JUGADORES) }, false);
}

function resolverBaza(e: EstadoCuatrola): EstadoCuatrola {
  const ganador = ganadoraCuatrola(e.mesa, e.triunfo!).asiento;
  const baza = { cartas: e.mesa, ganador };
  const resuelto: EstadoCuatrola = {
    ...e,
    mesa: [],
    turno: ganador,
    bazasMano: [...e.bazasMano, baza],
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    ultimaBaza: baza,
  };
  return resuelto.bazasMano.length === BAZAS_MANO_CUATROLA ? cerrarMano(resuelto) : resuelto;
}

/** Tras pujar o pasar: sigue la subasta, gana el jugador, o se reparte otra vez. */
function trasHablar(e: EstadoCuatrola, asiento: Asiento): EstadoCuatrola {
  const quedan = e.dichos.flatMap((d, a) => (d === 'paso' ? [] : [a]));
  if (quedan.length === 0) {
    return nuevaMano({ ...e, repartidor: siguiente(e.repartidor, JUGADORES) }, true);
  }
  if (e.modalidad === 'solo' || (quedan.length === 1 && e.modalidad !== null)) {
    return { ...e, fase: 'triunfo', turno: e.jugador! };
  }
  let turno = siguiente(asiento, JUGADORES);
  while (e.dichos[turno] === 'paso') turno = siguiente(turno, JUGADORES);
  return { ...e, turno };
}

/** Si se ha jugado la carta llamada (en una baza anterior o en la mesa). */
function llamadaJugada(e: Pick<EstadoCuatrola, 'llamada' | 'bazasMano' | 'mesa'>): boolean {
  if (e.llamada === null) return false;
  return (
    e.mesa.some((j) => j.carta === e.llamada) ||
    e.bazasMano.some((b) => b.cartas.some((j) => j.carta === e.llamada))
  );
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cuatrola: Juego<ConfigCuatrola, EstadoCuatrola, AccionCuatrola, VistaCuatrola> = {
  id: 'cuatrola',

  crear(config, semilla) {
    if (!(MANOS_CUATROLA as readonly number[]).includes(config.manos)) {
      return error('La partida de Cuatrola dura 4, 8 o 12 manos');
    }
    // Empieza repartiendo el último asiento, así es mano el asiento 0.
    return ok(
      nuevaMano(
        {
          config: { manos: config.manos },
          azar: crearAzar(semilla),
          numeroMano: 0,
          repartidor: JUGADORES - 1,
          fichas: new Array<number>(JUGADORES).fill(0),
          resultadosManos: [],
          ultimaBaza: null,
        },
        false,
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    switch (e.fase) {
      case 'subasta': {
        const acciones: AccionCuatrola[] = [{ tipo: 'pasar' }];
        if (e.modalidad === null) acciones.push({ tipo: 'pujar', modalidad: 'rey' });
        acciones.push({ tipo: 'pujar', modalidad: 'solo' });
        return acciones;
      }
      case 'triunfo': {
        const llamadas = e.modalidad === 'rey' ? llamablesCuatrola(e.manos[asiento]!) : [null];
        return PALOS_ESPANOLES.flatMap((triunfo) =>
          llamadas.map((llamada) => ({ tipo: 'elegir' as const, triunfo, llamada })),
        );
      }
      case 'bazas':
        return jugablesCuatrola(e.manos[asiento]!, e.mesa, e.triunfo!).map((carta) => ({
          tipo: 'jugar' as const,
          carta,
        }));
    }
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'pujar':
        return trasHablar(
          {
            ...e,
            dichos: e.dichos.map((d, a) => (a === asiento ? accion.modalidad : d)),
            modalidad: accion.modalidad,
            jugador: asiento,
            todosPasaron: false,
          },
          asiento,
        );
      case 'pasar':
        return trasHablar(
          {
            ...e,
            dichos: e.dichos.map((d, a) => (a === asiento ? 'paso' : d)),
            todosPasaron: false,
          },
          asiento,
        );
      case 'elegir': {
        const llamada = accion.llamada;
        const companero = llamada === null ? null : e.manos.findIndex((m) => m.includes(llamada));
        return {
          ...e,
          triunfo: accion.triunfo,
          llamada,
          companero,
          fase: 'bazas',
          turno: siguiente(e.repartidor, JUGADORES),
        };
      }
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoCuatrola = { ...e, manos, mesa };
        return mesa.length < JUGADORES
          ? { ...jugado, turno: siguiente(asiento, JUGADORES) }
          : resolverBaza(jugado);
      }
    }
  },

  vistaDe(e, asiento) {
    const companero =
      e.companero !== null && (asiento === e.companero || llamadaJugada(e)) ? e.companero : null;
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      repartidor: e.repartidor,
      mano: siguiente(e.repartidor, JUGADORES),
      fase: e.fase,
      turno: partidaTerminada(e) ? null : e.turno,
      dichos: [...e.dichos],
      modalidad: e.modalidad,
      jugador: e.jugador,
      todosPasaron: e.todosPasaron,
      triunfo: e.triunfo,
      llamada: e.llamada,
      companero,
      mesa: [...e.mesa],
      bazasMano: [...e.bazasMano],
      bazas: [...e.bazas],
      fichas: [...e.fichas],
      numeroMano: e.numeroMano,
      resultadosManos: [...e.resultadosManos],
      ultimaBaza: e.ultimaBaza,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const maximo = Math.max(...e.fichas);
    const ganadores = e.fichas.flatMap((f, a) => (f === maximo ? [a] : []));
    const puntos = [...e.fichas];
    if (ganadores.length === JUGADORES) return { ganadores: [], empate: true, puntos };
    return { ganadores, empate: false, puntos };
  },
};
