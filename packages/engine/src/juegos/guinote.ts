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
  VALORES_GUINOTE,
  type CartaJugada,
} from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

export { VALORES_GUINOTE, type ValoresBazas } from '../motor/bazas';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigGuinote {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Cambio del 7 (o el 2) de triunfo por la muestra. */
  readonly cambioSiete: 'no' | 'libre' | 'trasGanarBaza';
  /** Con 4 jugadores, si en el arrastre hay que superar la baza que ya gana el compañero. */
  readonly montarSobreCompanero: boolean;
  /** Puntos acumulados con los que se gana la partida. */
  readonly meta: number;
}

export const CONFIG_GUINOTE_POR_DEFECTO: ConfigGuinote = {
  jugadores: 2,
  cambioSiete: 'trasGanarBaza',
  montarSobreCompanero: false,
  meta: 101,
};

export interface CanteGuinote {
  readonly asiento: Asiento;
  readonly palo: PaloEspanol;
  readonly puntos: 20 | 40;
}

export interface ResultadoManoGuinote {
  /** Puntos de las cartas de las bazas de cada bando, sin los 10 de últimas. */
  readonly bazas: readonly [number, number];
  readonly cantes: readonly [number, number];
  /** Bando que se llevó la última baza (y sus 10 puntos). */
  readonly ultimas: 0 | 1;
  /** Puntos de la mano de cada bando: bazas, cantes y últimas. */
  readonly puntos: readonly [number, number];
  /** Puntos acumulados de la partida tras esta mano. */
  readonly totalesTras: readonly [number, number];
}

export interface EstadoGuinote {
  readonly config: ConfigGuinote;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  /** Cartas boca abajo; la siguiente que se roba es la última. */
  readonly mazo: readonly IdCarta[];
  /** Carta boca arriba al fondo del mazo; `null` cuando ya se robó. */
  readonly muestra: IdCarta | null;
  readonly triunfo: PaloEspanol;
  readonly manos: readonly (readonly IdCarta[])[];
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento;
  /** Puntos de las cartas de las bazas ganadas por cada asiento en la mano en curso. */
  readonly puntos: readonly number[];
  readonly bazas: readonly number[];
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly cantes: readonly CanteGuinote[];
  /** Quien ganó la última baza y aún puede cantar (un cante por baza ganada). */
  readonly puedeCantar: Asiento | null;
  readonly resultadosManos: readonly ResultadoManoGuinote[];
  /** Puntos acumulados de cada bando en las manos ya terminadas. */
  readonly totales: readonly [number, number];
}

export type AccionGuinote =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'cambiarSiete' }
  | { readonly tipo: 'cantar'; readonly palo: PaloEspanol };

export interface VistaGuinote {
  readonly config: ConfigGuinote;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** Cartas boca abajo que quedan en el mazo (sin contar la muestra). */
  readonly mazo: number;
  readonly muestra: IdCarta | null;
  readonly triunfo: PaloEspanol;
  /** Se agotó el mazo: rigen las obligaciones y ya no se canta. */
  readonly arrastre: boolean;
  readonly mesa: readonly CartaJugada[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly bazas: readonly number[];
  readonly ultimaBaza: EstadoGuinote['ultimaBaza'];
  readonly cantes: readonly CanteGuinote[];
  readonly resultadosManos: readonly ResultadoManoGuinote[];
  readonly totales: readonly [number, number];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const REY = 12;
const SOTA = 10;
const DIEZ_DE_ULTIMAS = 10;
const CARTAS_EN_MANO = 6;

const enArrastre = (e: EstadoGuinote) => e.mazo.length === 0 && e.muestra === null;

function partidaTerminada(e: EstadoGuinote): boolean {
  const [a, b] = e.totales;
  return e.resultadosManos.length > 0 && Math.max(a, b) >= e.config.meta && a !== b;
}

/** Con mazo, cualquier carta; en el arrastre, asistir, montar y fallar. */
function cartasJugables(e: EstadoGuinote, asiento: Asiento): readonly IdCarta[] {
  const mano = e.manos[asiento]!;
  if (!enArrastre(e)) return mano;
  return cartasObligadas(mano, e.mesa, e.triunfo, {
    asiento,
    montarSobreCompanero: e.config.montarSobreCompanero,
    valores: VALORES_GUINOTE,
  });
}

function bazasDelBando(e: EstadoGuinote, asiento: Asiento): number {
  return e.bazas.reduce((s, b, a) => (bandoDe(a) === bandoDe(asiento) ? s + b : s), 0);
}

function puedeCambiarSiete(e: EstadoGuinote, asiento: Asiento): boolean {
  if (e.config.cambioSiete === 'no') return false;
  if (e.muestra === null || e.mazo.length === 0) return false;
  if (e.config.cambioSiete === 'trasGanarBaza' && bazasDelBando(e, asiento) === 0) return false;
  return e.manos[asiento]!.includes(cartaDeCambio(e.muestra, VALORES_GUINOTE));
}

/** Palos en los que el asiento puede cantar: tiene rey y sota y aún no se cantaron. */
function palosCantables(e: EstadoGuinote, asiento: Asiento): PaloEspanol[] {
  const mano = e.manos[asiento]!;
  return PALOS_ESPANOLES.filter(
    (palo) =>
      mano.includes(`${palo}-${REY}`) &&
      mano.includes(`${palo}-${SOTA}`) &&
      !e.cantes.some((c) => c.palo === palo),
  );
}

/** Reparte una mano nueva empezando por el que sale (el siguiente al repartidor). */
function nuevaMano(
  config: ConfigGuinote,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoGuinote[],
  totales: readonly [number, number],
): EstadoGuinote {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const n = config.jugadores;
  const sale = siguiente(repartidor, n);
  const reparto = repartir(cartas, new Array<number>(n).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  const manos = Array.from(
    { length: n },
    (_, asiento) => reparto.valor.manos[(asiento - sale + n) % n]!,
  );
  const [muestra, ...mazo] = reparto.valor.mazo as [IdCarta, ...IdCarta[]];
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    mazo,
    muestra,
    triunfo: paloDe(muestra),
    manos,
    mesa: [],
    turno: sale,
    puntos: new Array<number>(n).fill(0),
    bazas: new Array<number>(n).fill(0),
    ultimaBaza: null,
    cantes: [],
    puedeCantar: null,
    resultadosManos,
    totales,
  };
}

function cerrarMano(e: EstadoGuinote, ultimas: 0 | 1): EstadoGuinote {
  const bazas: [number, number] = [0, 0];
  e.puntos.forEach((p, asiento) => (bazas[bandoDe(asiento)] += p));
  const cantes: [number, number] = [0, 0];
  for (const c of e.cantes) cantes[bandoDe(c.asiento)] += c.puntos;
  const puntos: [number, number] = [0, 1].map(
    (b) => bazas[b]! + cantes[b]! + (ultimas === b ? DIEZ_DE_ULTIMAS : 0),
  ) as [number, number];
  const totales: [number, number] = [e.totales[0] + puntos[0], e.totales[1] + puntos[1]];
  const resultadosManos = [
    ...e.resultadosManos,
    { bazas, cantes, ultimas, puntos, totalesTras: totales },
  ];
  const cerrado: EstadoGuinote = { ...e, resultadosManos, totales, puedeCantar: null };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, e.config.jugadores),
    resultadosManos,
    totales,
  );
}

function resolverBaza(e: EstadoGuinote): EstadoGuinote {
  const ganador = cartaGanadora(e.mesa, e.triunfo, VALORES_GUINOTE).asiento;
  const { manos, mazo, muestra } = robar(e.manos, e.mazo, e.muestra, ganador);
  const ultima = manos.every((m) => m.length === 0);
  const valor = e.mesa.reduce((suma, j) => suma + puntosDe(j.carta, VALORES_GUINOTE), 0);
  const resuelto: EstadoGuinote = {
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
  return ultima ? cerrarMano(resuelto, bandoDe(ganador)) : resuelto;
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const guinote: Juego<ConfigGuinote, EstadoGuinote, AccionGuinote, VistaGuinote> = {
  id: 'guinote',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('El Guiñote se juega con 2 jugadores o con 4 en parejas');
    }
    if (!['no', 'libre', 'trasGanarBaza'].includes(config.cambioSiete)) {
      return error('Opción de cambio del 7 inválida');
    }
    if (typeof config.montarSobreCompanero !== 'boolean') {
      return error('Opción de montar sobre el compañero inválida');
    }
    if (!Number.isInteger(config.meta) || config.meta < 1) {
      return error('Los puntos de la partida deben ser un entero positivo');
    }
    const limpia: ConfigGuinote = {
      jugadores: config.jugadores,
      cambioSiete: config.cambioSiete,
      montarSobreCompanero: config.montarSobreCompanero,
      meta: config.meta,
    };
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, [], [0, 0]));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    const acciones: AccionGuinote[] = [];
    if (e.puedeCantar === asiento && e.mesa.length === 0 && !enArrastre(e)) {
      for (const palo of palosCantables(e, asiento)) acciones.push({ tipo: 'cantar', palo });
    }
    if (puedeCambiarSiete(e, asiento)) acciones.push({ tipo: 'cambiarSiete' });
    for (const carta of cartasJugables(e, asiento)) acciones.push({ tipo: 'jugar', carta });
    return acciones;
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'cambiarSiete': {
        const cambio = cartaDeCambio(e.muestra!, VALORES_GUINOTE);
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
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoGuinote = { ...e, manos, mesa, puedeCantar: null };
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
      triunfo: e.triunfo,
      arrastre: enArrastre(e),
      mesa: [...e.mesa],
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      bazas: [...e.bazas],
      ultimaBaza: e.ultimaBaza,
      cantes: [...e.cantes],
      resultadosManos: [...e.resultadosManos],
      totales: e.totales,
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    const puntos = asientos.map((a) => e.totales[bandoDe(a)]);
    const bando = e.totales[0] > e.totales[1] ? 0 : 1;
    return { ganadores: asientos.filter((a) => bandoDe(a) === bando), empate: false, puntos };
  },
};
