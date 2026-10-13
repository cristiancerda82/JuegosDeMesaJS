import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import {
  bandoDe,
  cartaDeCambio,
  cartaGanadora,
  cartasObligadas,
  paloDe,
  puntosDe,
  robar,
  siguiente,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigTute {
  /** 2 jugadores con robo, o 4 en parejas (asientos 0 y 2 contra 1 y 3) sin mazo. */
  readonly jugadores: 2 | 4;
  /** Cambio del 7 (o el 2) de triunfo por la muestra; solo con 2 jugadores. */
  readonly cambioSiete: 'no' | 'libre' | 'trasGanarBaza';
  /** Con 4 jugadores, si hay que superar la baza cuando ya la gana el compañero. */
  readonly montarSobreCompanero: boolean;
  /** Partida a una mano o al mejor de N (N impar). */
  readonly manos: number;
}

export const CONFIG_TUTE_POR_DEFECTO: ConfigTute = {
  jugadores: 2,
  cambioSiete: 'trasGanarBaza',
  montarSobreCompanero: false,
  manos: 1,
};

export interface Cante {
  readonly asiento: Asiento;
  readonly palo: PaloEspanol;
  readonly puntos: 20 | 40;
}

export interface ResultadoManoTute {
  /** Puntos de cada bando: bazas, cantes y 10 de últimas. */
  readonly puntos: readonly [number, number];
  /** Bando ganador, o `null` si empataron. */
  readonly ganador: 0 | 1 | null;
  /** La mano se cerró porque ese bando cantó el tute. */
  readonly tute: boolean;
}

export interface EstadoTute {
  readonly config: ConfigTute;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas boca abajo (solo con 2 jugadores); la siguiente que se roba es la última. */
  readonly mazo: readonly IdCarta[];
  /** Carta boca arriba al fondo del mazo (2 jugadores); `null` cuando ya se robó. */
  readonly muestra: IdCarta | null;
  /** Con 4 jugadores, la carta del repartidor que marcó el triunfo, mientras siga en su mano. */
  readonly cartaTriunfo: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento;
  /** Puntos de las bazas ganadas por cada asiento en la mano en curso. */
  readonly puntos: readonly number[];
  readonly bazas: readonly number[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly cantes: readonly Cante[];
  /** Quien ganó la última baza y aún puede cantar (un cante por baza ganada). */
  readonly puedeCantar: Asiento | null;
  readonly resultadosManos: readonly ResultadoManoTute[];
}

export type AccionTute =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'cambiarSiete' }
  | { readonly tipo: 'cantar'; readonly palo: PaloEspanol }
  | { readonly tipo: 'cantarTute' };

export interface VistaTute {
  readonly config: ConfigTute;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas boca abajo que quedan en el mazo (sin contar la muestra). */
  readonly mazo: number;
  readonly muestra: IdCarta | null;
  readonly cartaTriunfo: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly bazas: readonly number[];
  readonly ultimaBaza: EstadoTute['ultimaBaza'];
  readonly cantes: readonly Cante[];
  readonly resultadosManos: readonly ResultadoManoTute[];
  readonly manosGanadas: readonly [number, number];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const REY = 12;
const CABALLO = 11;
const DIEZ_DE_ULTIMAS = 10;
const CARTAS_EN_MANO: Readonly<Record<2 | 4, number>> = { 2: 8, 4: 10 };

const mazoAgotado = (e: EstadoTute) => e.mazo.length === 0 && e.muestra === null;

function manosGanadas(e: EstadoTute): [number, number] {
  const cuenta: [number, number] = [0, 0];
  for (const r of e.resultadosManos) if (r.ganador !== null) cuenta[r.ganador]++;
  return cuenta;
}

function partidaTerminada(e: EstadoTute): boolean {
  const necesarias = Math.floor(e.config.manos / 2) + 1;
  return manosGanadas(e).some((g) => g >= necesarias) || e.resultadosManos.length >= e.config.manos;
}

/** Con 4 jugadores las obligaciones rigen siempre; con 2, al agotarse el mazo. */
function cartasJugables(e: EstadoTute, asiento: Asiento): readonly IdCarta[] {
  const mano = e.manos[asiento]!;
  if (e.config.jugadores === 2 && !mazoAgotado(e)) return mano;
  return cartasObligadas(mano, e.mesa, e.triunfo, {
    asiento,
    montarSobreCompanero: e.config.montarSobreCompanero,
  });
}

function puedeCambiarSiete(e: EstadoTute, asiento: Asiento): boolean {
  if (e.config.jugadores !== 2 || e.config.cambioSiete === 'no') return false;
  if (e.muestra === null || e.mazo.length === 0) return false;
  if (e.config.cambioSiete === 'trasGanarBaza' && e.bazas[asiento] === 0) return false;
  return e.manos[asiento]!.includes(cartaDeCambio(e.muestra));
}

/** Palos en los que el asiento puede cantar: tiene rey y caballo y aún no se cantaron. */
function palosCantables(e: EstadoTute, asiento: Asiento): PaloEspanol[] {
  const mano = e.manos[asiento]!;
  return PALOS_ESPANOLES.filter(
    (palo) =>
      mano.includes(`${palo}-${REY}`) &&
      mano.includes(`${palo}-${CABALLO}`) &&
      !e.cantes.some((c) => c.palo === palo),
  );
}

/** Tiene los 4 reyes o los 4 caballos. */
function tieneTute(mano: readonly IdCarta[]): boolean {
  return [REY, CABALLO].some((valor) =>
    PALOS_ESPANOLES.every((palo) => mano.includes(`${palo}-${valor}`)),
  );
}

/** Puntos de cada bando: bazas ganadas por sus asientos más sus cantes. */
export function puntosPorBando(
  puntosAsientos: readonly number[],
  cantes: readonly Cante[],
): [number, number] {
  const puntos: [number, number] = [0, 0];
  puntosAsientos.forEach((p, asiento) => (puntos[bandoDe(asiento)] += p));
  for (const c of cantes) puntos[bandoDe(c.asiento)] += c.puntos;
  return puntos;
}

/** Reparte una mano nueva empezando por el que sale (el siguiente al repartidor). */
function nuevaMano(
  config: ConfigTute,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoTute[],
): EstadoTute {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const n = config.jugadores;
  const sale = siguiente(repartidor, n);
  const reparto = repartir(cartas, new Array<number>(n).fill(CARTAS_EN_MANO[n]));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = Array.from(
    { length: n },
    (_, asiento) => reparto.valor.manos[(asiento - sale + n) % n]!,
  );
  let muestra: IdCarta | null = null;
  let cartaTriunfo: IdCarta | null = null;
  let mazo: IdCarta[] = [];
  if (n === 2) {
    [muestra, ...mazo] = reparto.valor.mazo as [IdCarta, ...IdCarta[]];
  } else {
    // Con 4 se reparte todo: la última carta, del repartidor, marca el triunfo.
    cartaTriunfo = cartas.at(-1)!;
  }
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    mazo,
    muestra,
    cartaTriunfo,
    triunfo: paloDe((muestra ?? cartaTriunfo)!),
    manos,
    mesa: [],
    turno: sale,
    puntos: new Array<number>(n).fill(0),
    bazas: new Array<number>(n).fill(0),
    ultimaBaza: null,
    cantes: [],
    puedeCantar: null,
    resultadosManos,
  };
}

function cerrarMano(e: EstadoTute, tuteDe: Asiento | null): EstadoTute {
  const puntos = puntosPorBando(e.puntos, e.cantes);
  const ganador: ResultadoManoTute['ganador'] =
    tuteDe !== null
      ? bandoDe(tuteDe)
      : puntos[0] > puntos[1]
        ? 0
        : puntos[1] > puntos[0]
          ? 1
          : null;
  const resultadosManos = [...e.resultadosManos, { puntos, ganador, tute: tuteDe !== null }];
  const cerrado: EstadoTute = { ...e, resultadosManos, puedeCantar: null };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, siguiente(e.repartidor, e.config.jugadores), resultadosManos);
}

function resolverBaza(e: EstadoTute): EstadoTute {
  const ganador = cartaGanadora(e.mesa, e.triunfo).asiento;
  const { manos, mazo, muestra } = robar(e.manos, e.mazo, e.muestra, ganador);
  const ultima = manos.every((m) => m.length === 0);
  const valor =
    e.mesa.reduce((suma, j) => suma + puntosDe(j.carta), 0) + (ultima ? DIEZ_DE_ULTIMAS : 0);
  const resuelto: EstadoTute = {
    ...e,
    manos,
    mazo,
    muestra,
    mesa: [],
    turno: ganador,
    puntos: e.puntos.map((p, a) => (a === ganador ? p + valor : p)),
    bazas: e.bazas.map((b, a) => (a === ganador ? b + 1 : b)),
    ultimaBaza: { cartas: e.mesa, ganador },
    puedeCantar: ganador,
  };
  return ultima ? cerrarMano(resuelto, null) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const tute: Juego<ConfigTute, EstadoTute, AccionTute, VistaTute> = {
  id: 'tute',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('El Tute se juega con 2 jugadores o con 4 en parejas');
    }
    if (!['no', 'libre', 'trasGanarBaza'].includes(config.cambioSiete)) {
      return error('Opción de cambio del 7 inválida');
    }
    if (typeof config.montarSobreCompanero !== 'boolean') {
      return error('Opción de montar sobre el compañero inválida');
    }
    if (!Number.isInteger(config.manos) || config.manos < 1 || config.manos % 2 === 0) {
      return error('El número de manos debe ser un entero impar positivo');
    }
    const limpia: ConfigTute = {
      jugadores: config.jugadores,
      cambioSiete: config.cambioSiete,
      montarSobreCompanero: config.montarSobreCompanero,
      manos: config.manos,
    };
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, []));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const acciones: AccionTute[] = [];
    if (e.puedeCantar === asiento && e.mesa.length === 0) {
      if (tieneTute(e.manos[asiento]!)) acciones.push({ tipo: 'cantarTute' });
      for (const palo of palosCantables(e, asiento)) acciones.push({ tipo: 'cantar', palo });
    }
    if (puedeCambiarSiete(e, asiento)) acciones.push({ tipo: 'cambiarSiete' });
    for (const carta of cartasJugables(e, asiento)) acciones.push({ tipo: 'jugar', carta });
    return acciones;
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'cambiarSiete': {
        const cambio = cartaDeCambio(e.muestra!);
        const manos = e.manos.map((m, a) =>
          a === asiento ? [...m.filter((c) => c !== cambio), e.muestra!] : m,
        );
        return { ...e, manos, muestra: cambio };
      }
      case 'cantar': {
        const puntos = accion.palo === e.triunfo ? 40 : 20;
        return {
          ...e,
          cantes: [...e.cantes, { asiento, palo: accion.palo, puntos }],
          puedeCantar: null,
        };
      }
      case 'cantarTute':
        return cerrarMano(e, asiento);
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoTute = {
          ...e,
          manos,
          mesa,
          puedeCantar: null,
          cartaTriunfo: accion.carta === e.cartaTriunfo ? null : e.cartaTriunfo,
        };
        return mesa.length < e.config.jugadores
          ? { ...jugado, turno: siguiente(asiento, e.config.jugadores) }
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
      muestra: e.muestra,
      cartaTriunfo: e.cartaTriunfo,
      triunfo: e.triunfo,
      mesa: [...e.mesa],
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      bazas: [...e.bazas],
      ultimaBaza: e.ultimaBaza,
      cantes: [...e.cantes],
      resultadosManos: [...e.resultadosManos],
      manosGanadas: manosGanadas(e),
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const ganadas = manosGanadas(e);
    // A una mano, la puntuación son los puntos; a varias, las manos ganadas.
    const porBando: readonly number[] =
      e.config.manos === 1 ? e.resultadosManos[0]!.puntos : ganadas;
    const puntos = asientos.map((a) => porBando[bandoDe(a)]!);
    if (ganadas[0] === ganadas[1]) return { ganadores: [], empate: true, puntos };
    const bando = ganadas[0] > ganadas[1] ? 0 : 1;
    return { ganadores: asientos.filter((a) => bandoDe(a) === bando), empate: false, puntos };
  },
};
