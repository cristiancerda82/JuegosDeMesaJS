import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { repartir } from '../baraja/repartir';
import { siguiente } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import {
  aplicarBajada,
  cartasDe,
  cartasPinacle,
  cartasQueBaja,
  clave,
  esComodinPinacle,
  jugadasDeBajada,
  puntosCartaPinacle,
  type AccionBajada,
  type CartaPinacle,
  type Combinacion,
} from './pinacle-combinaciones';
import {
  PENALIZACION_BARBELE,
  puntuarManoPinacle,
  type CierrePinacle,
  type DesgloseBando,
} from './pinacle-puntos';

export * from './pinacle-combinaciones';
export * from './pinacle-puntos';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigPinacle {
  /** 2 jugadores, o 4 en dos parejas (0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
}

export const CONFIG_PINACLE_POR_DEFECTO: ConfigPinacle = { jugadores: 2 };

export type AccionPinacle =
  | { readonly tipo: 'robar'; readonly desde: 'mazo' | 'monton' }
  | AccionBajada
  | { readonly tipo: 'descartar'; readonly carta: CartaPinacle };

/** Lo que lleva hecho el jugador en el turno en curso. */
export interface TurnoPinacle {
  /** Valor de las cartas que ha bajado en el turno (para el barbelé). */
  readonly puntosBajados: number;
  /** Combinaciones nuevas del turno. */
  readonly creadas: readonly number[];
  /** Ha bajado o añadido algún comodín. */
  readonly comodinBajado: boolean;
  /** Había bajado algo antes en la mano. */
  readonly bajoAntes: boolean;
}

export interface ResultadoManoPinacle {
  readonly numero: number;
  /** Quién cerró; `null` si se acabó el mazo. */
  readonly cierra: Asiento | null;
  readonly desglose: readonly DesgloseBando[];
  readonly puntosTras: readonly number[];
}

export interface EstadoPinacle {
  readonly config: ConfigPinacle;
  readonly azar: EstadoAzar;
  readonly numeroMano: number;
  readonly repartidor: Asiento;
  readonly turno: Asiento;
  readonly fase: 'robar' | 'bajar';
  /** Contador de turnos de la mano (para saber si una combinación se bajó en un solo turno). */
  readonly numeroTurno: number;
  readonly manos: readonly (readonly CartaPinacle[])[];
  /** Boca abajo; la siguiente que se roba es la última. */
  readonly mazo: readonly CartaPinacle[];
  /** Boca arriba; la de arriba es la última. */
  readonly monton: readonly CartaPinacle[];
  /** Cartas que cada uno se llevó del montón y siguen en su mano. */
  readonly conocidas: readonly (readonly CartaPinacle[])[];
  readonly combinaciones: readonly Combinacion[];
  readonly siguienteId: number;
  /** Carta de arriba del montón que se llevó el jugador en turno y aún no ha bajado. */
  readonly debeBajar: CartaPinacle | null;
  /** Puntos acumulados por bando. */
  readonly puntos: readonly number[];
  readonly puntosInicioMano: readonly number[];
  /** Por bando: empezó la mano con 750 o más. */
  readonly barbele: readonly boolean[];
  /** Por bando: ya ha bajado en la mano. */
  readonly abierto: readonly boolean[];
  /** Por asiento: ya ha bajado en la mano. */
  readonly bajo: readonly boolean[];
  /** Por bando: veces que el barbelé le devolvió la bajada en la mano. */
  readonly penalizaciones: readonly number[];
  /** Por bando: premios por cambiar comodines en la mano. */
  readonly cambios: readonly number[];
  /** Premios por cambios del turno en curso (se pierden si el barbelé devuelve la bajada). */
  readonly cambiosTurno: number;
  readonly turnoActual: TurnoPinacle;
  readonly ultimaAccion: { readonly asiento: Asiento; readonly accion: AccionPinacle } | null;
  readonly ultimaMano: ResultadoManoPinacle | null;
  readonly terminada: boolean;
}

export interface VistaPinacle {
  readonly config: ConfigPinacle;
  readonly asiento: Asiento | null;
  /** Mano propia; `null` para un espectador. */
  readonly miMano: readonly CartaPinacle[] | null;
  readonly cartasEnMano: readonly number[];
  readonly conocidas: readonly (readonly CartaPinacle[])[];
  readonly monton: readonly CartaPinacle[];
  readonly cartasEnMazo: number;
  readonly combinaciones: readonly Combinacion[];
  readonly siguienteId: number;
  readonly debeBajar: CartaPinacle | null;
  readonly numeroMano: number;
  readonly repartidor: Asiento;
  readonly turno: Asiento | null;
  readonly fase: 'robar' | 'bajar';
  readonly numeroTurno: number;
  readonly puntos: readonly number[];
  readonly puntosInicioMano: readonly number[];
  readonly barbele: readonly boolean[];
  readonly abierto: readonly boolean[];
  readonly bajo: readonly boolean[];
  readonly penalizaciones: readonly number[];
  readonly cambios: readonly number[];
  readonly cambiosTurno: number;
  readonly turnoActual: TurnoPinacle;
  readonly ultimaAccion: EstadoPinacle['ultimaAccion'];
  readonly ultimaMano: ResultadoManoPinacle | null;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_EN_MANO = 11;
export const OBJETIVO_PINACLE = 1500;
export const UMBRAL_BARBELE = 750;
export const MINIMO_BARBELE = 70;

export const bandoPinacle = (asiento: Asiento) => asiento % 2;

const TURNO_VACIO: TurnoPinacle = {
  puntosBajados: 0,
  creadas: [],
  comodinBajado: false,
  bajoAntes: false,
};

function nuevaMano(
  config: ConfigPinacle,
  azar: EstadoAzar,
  repartidor: Asiento,
  numeroMano: number,
  puntos: readonly number[],
  ultimaMano: ResultadoManoPinacle | null,
): EstadoPinacle {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(cartasPinacle(), azar);
  const sale = siguiente(repartidor, n);
  const reparto = repartir(cartas, new Array<number>(n).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  // El reparto empieza por el jugador que sale.
  const manos = Array.from({ length: n }, (_, a) => reparto.valor.manos[(a - sale + n) % n]!);
  const [primera, ...mazo] = reparto.valor.mazo as [CartaPinacle, ...CartaPinacle[]];
  return {
    config,
    azar: azarSiguiente,
    numeroMano,
    repartidor,
    turno: sale,
    fase: 'robar',
    numeroTurno: 1,
    manos,
    mazo,
    monton: [primera],
    conocidas: manos.map(() => []),
    combinaciones: [],
    siguienteId: 1,
    debeBajar: null,
    puntos,
    puntosInicioMano: puntos,
    barbele: puntos.map((p) => p >= UMBRAL_BARBELE),
    abierto: [false, false],
    bajo: new Array<boolean>(n).fill(false),
    penalizaciones: [0, 0],
    cambios: [0, 0],
    cambiosTurno: 0,
    turnoActual: TURNO_VACIO,
    ultimaAccion: null,
    ultimaMano,
    terminada: false,
  };
}

/** El bando del jugador en turno está barbelé y todavía no ha abierto. */
const barbelePendiente = (e: EstadoPinacle) =>
  e.barbele[bandoPinacle(e.turno)]! && !e.abierto[bandoPinacle(e.turno)]!;

const delBando = (e: EstadoPinacle, asiento: Asiento) =>
  e.combinaciones.filter((c) => c.bando === bandoPinacle(asiento));

/**
 * El jugador en turno puede llevarse el montón: con la carta de arriba en la mano tendría una
 * jugada legal que la baja.
 */
export function puedeLlevarseElMonton(e: EstadoPinacle): boolean {
  const arriba = e.monton.at(-1);
  if (arriba === undefined) return false;
  return (
    bajadasLegales({
      ...e,
      manos: e.manos.map((m, a) => (a === e.turno ? [...m, arriba] : m)),
      debeBajar: arriba,
      turnoActual: TURNO_VACIO,
    }).length > 0
  );
}

/**
 * Jugadas de bajada legales del jugador en turno. Tras llevarse el montón, lo primero que baja
 * tiene que llevar su carta de arriba (así nunca se queda sin poder bajarla).
 */
function bajadasLegales(e: EstadoPinacle): AccionBajada[] {
  const mano = e.manos[e.turno]!;
  const debe = e.debeBajar;
  const todas = jugadasDeBajada(mano, delBando(e, e.turno), debe);
  const jugadas = debe === null ? todas : todas.filter((j) => cartasQueBaja(j).includes(debe));
  if (!barbelePendiente(e)) return jugadas;
  // Barbelé: no se puede quedar sin cartas (y cerrar) con una bajada de menos de 70.
  return jugadas.filter((j) => {
    const salen = cartasQueBaja(j);
    if (salen.length < mano.length) return true;
    const puntos =
      e.turnoActual.puntosBajados + salen.reduce((s, c) => s + puntosCartaPinacle(c), 0);
    return puntos >= MINIMO_BARBELE;
  });
}

function sinCarta(lista: readonly CartaPinacle[], cartas: readonly CartaPinacle[]) {
  return lista.filter((c) => !cartas.includes(c));
}

/** Termina el turno: barbelé, y cierre, fin por mazo o turno siguiente. */
function terminarTurno(e: EstadoPinacle): EstadoPinacle {
  const asiento = e.turno;
  const bando = bandoPinacle(asiento);
  let estado = e;
  const bajo = e.turnoActual.puntosBajados > 0;
  if (bajo && barbelePendiente(e) && e.turnoActual.puntosBajados < MINIMO_BARBELE) {
    // La bajada no llega: todas las combinaciones del bando (son las del turno) vuelven a la
    // mano y el bando pierde 50.
    const devueltas = e.combinaciones.filter((c) => c.bando === bando).flatMap(cartasDe);
    estado = {
      ...e,
      manos: e.manos.map((m, a) => (a === asiento ? [...m, ...devueltas] : m)),
      combinaciones: e.combinaciones.filter((c) => c.bando !== bando),
      puntos: e.puntos.map((p, b) => (b === bando ? p - PENALIZACION_BARBELE : p)),
      penalizaciones: e.penalizaciones.map((p, b) => (b === bando ? p + 1 : p)),
    };
  } else if (bajo) {
    estado = {
      ...e,
      abierto: e.abierto.map((x, b) => x || b === bando),
      bajo: e.bajo.map((x, a) => x || a === asiento),
      cambios: e.cambios.map((c, b) => (b === bando ? c + e.cambiosTurno : c)),
    };
  }
  if (estado.manos[asiento]!.length === 0) return cerrarMano(estado, asiento);
  if (estado.mazo.length === 0) return cerrarMano(estado, null);
  return {
    ...estado,
    turno: siguiente(asiento, e.config.jugadores),
    fase: 'robar',
    numeroTurno: e.numeroTurno + 1,
    debeBajar: null,
    cambiosTurno: 0,
    turnoActual: TURNO_VACIO,
  };
}

/** Puntúa la mano y reparte otra, o termina la partida. */
function cerrarMano(e: EstadoPinacle, cierra: Asiento | null): EstadoPinacle {
  const cierre: CierrePinacle | null =
    cierra === null
      ? null
      : {
          bando: bandoPinacle(cierra),
          deGolpe: !e.turnoActual.bajoAntes,
          sinComodin: !e.turnoActual.comodinBajado,
          creadas: e.turnoActual.creadas,
        };
  const desglose = puntuarManoPinacle({
    bandos: 2,
    combinaciones: e.combinaciones,
    manos: [0, 1].map((b) => e.manos.filter((_, a) => bandoPinacle(a) === b).flat()),
    cambios: e.cambios,
    penalizaciones: e.penalizaciones,
    cierre,
  });
  const puntosTras = e.puntosInicioMano.map((p, b) => p + desglose[b]!.total);
  const ultimaMano: ResultadoManoPinacle = { numero: e.numeroMano, cierra, desglose, puntosTras };
  if (puntosTras.some((p) => p >= OBJETIVO_PINACLE)) {
    return { ...e, puntos: puntosTras, ultimaMano, terminada: true };
  }
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, e.config.jugadores),
    e.numeroMano + 1,
    puntosTras,
    ultimaMano,
  );
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const pinacle: Juego<ConfigPinacle, EstadoPinacle, AccionPinacle, VistaPinacle> = {
  id: 'pinacle',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('El Pinacle se juega con 2 jugadores o con 4 por parejas');
    }
    const limpia: ConfigPinacle = { jugadores: config.jugadores };
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, 1, [0, 0], null));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (e.terminada || asiento !== e.turno) return [];
    if (e.fase === 'robar') {
      const acciones: AccionPinacle[] = [{ tipo: 'robar', desde: 'mazo' }];
      if (puedeLlevarseElMonton(e)) acciones.push({ tipo: 'robar', desde: 'monton' });
      return acciones;
    }
    const acciones: AccionPinacle[] = bajadasLegales(e);
    if (e.debeBajar === null) {
      const vistas = new Set<string>();
      for (const carta of e.manos[asiento]!) {
        // Las dos copias de una carta son el mismo descarte.
        if (vistas.has(clave(carta))) continue;
        vistas.add(clave(carta));
        acciones.push({ tipo: 'descartar', carta });
      }
    }
    return acciones;
  },

  transicion(e, asiento, accion) {
    const conAccion = { ...e, ultimaAccion: { asiento, accion } };
    if (accion.tipo === 'robar') {
      if (accion.desde === 'mazo') {
        const carta = e.mazo.at(-1)!;
        return {
          ...conAccion,
          mazo: e.mazo.slice(0, -1),
          manos: e.manos.map((m, a) => (a === asiento ? [...m, carta] : m)),
          fase: 'bajar',
          turnoActual: { ...TURNO_VACIO, bajoAntes: e.bajo[asiento]! },
        };
      }
      return {
        ...conAccion,
        monton: [],
        manos: e.manos.map((m, a) => (a === asiento ? [...m, ...e.monton] : m)),
        conocidas: e.conocidas.map((c, a) => (a === asiento ? [...c, ...e.monton] : c)),
        debeBajar: e.monton.at(-1)!,
        fase: 'bajar',
        turnoActual: { ...TURNO_VACIO, bajoAntes: e.bajo[asiento]! },
      };
    }

    if (accion.tipo === 'descartar') {
      return terminarTurno({
        ...conAccion,
        manos: e.manos.map((m, a) => (a === asiento ? sinCarta(m, [accion.carta]) : m)),
        conocidas: e.conocidas.map((c, a) => (a === asiento ? sinCarta(c, [accion.carta]) : c)),
        monton: [...e.monton, accion.carta],
      });
    }

    const tras = aplicarBajada(e.manos[asiento]!, e.combinaciones, accion, {
      id: e.siguienteId,
      bando: bandoPinacle(asiento),
      turno: e.numeroTurno,
    });
    const salen = cartasQueBaja(accion);
    const bajado: EstadoPinacle = {
      ...conAccion,
      manos: e.manos.map((m, a) => (a === asiento ? tras.mano : m)),
      conocidas: e.conocidas.map((c, a) => (a === asiento ? sinCarta(c, salen) : c)),
      combinaciones: tras.combinaciones,
      siguienteId: accion.tipo === 'bajar' ? e.siguienteId + 1 : e.siguienteId,
      debeBajar: e.debeBajar !== null && salen.includes(e.debeBajar) ? null : e.debeBajar,
      cambiosTurno: e.cambiosTurno + tras.premioCambio,
      turnoActual: {
        ...e.turnoActual,
        puntosBajados:
          e.turnoActual.puntosBajados + salen.reduce((s, c) => s + puntosCartaPinacle(c), 0),
        creadas:
          accion.tipo === 'bajar'
            ? [...e.turnoActual.creadas, e.siguienteId]
            : e.turnoActual.creadas,
        comodinBajado: e.turnoActual.comodinBajado || salen.some(esComodinPinacle),
      },
    };
    return tras.mano.length === 0 ? terminarTurno(bajado) : bajado;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      conocidas: e.conocidas.map((c) => [...c]),
      monton: [...e.monton],
      cartasEnMazo: e.mazo.length,
      combinaciones: [...e.combinaciones],
      siguienteId: e.siguienteId,
      debeBajar: e.debeBajar,
      numeroMano: e.numeroMano,
      repartidor: e.repartidor,
      turno: e.terminada ? null : e.turno,
      fase: e.fase,
      numeroTurno: e.numeroTurno,
      puntos: [...e.puntos],
      puntosInicioMano: [...e.puntosInicioMano],
      barbele: [...e.barbele],
      abierto: [...e.abierto],
      bajo: [...e.bajo],
      penalizaciones: [...e.penalizaciones],
      cambios: [...e.cambios],
      cambiosTurno: e.cambiosTurno,
      turnoActual: e.turnoActual,
      ultimaAccion: e.ultimaAccion,
      ultimaMano: e.ultimaMano,
    };
  },

  resultado(e): Fin | null {
    if (!e.terminada) return null;
    const maximo = Math.max(...e.puntos);
    const ganan = [0, 1].filter((b) => e.puntos[b] === maximo);
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    return {
      ganadores: asientos.filter((a) => ganan.includes(bandoPinacle(a))),
      empate: ganan.length > 1,
      puntos: asientos.map((a) => e.puntos[bandoPinacle(a)]!),
    };
  },
};
