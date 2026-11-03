import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import { bandoDe, siguiente, type CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { ganadorDeLaMano, puntosEnvit, rangoTruc } from './truc';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigTruco {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Puntos para ganar la partida; la meta va en la config para que las pruebas sean cortas. */
  readonly meta: number;
}

export const CONFIG_TRUCO_POR_DEFECTO: ConfigTruco = { jugadores: 2, meta: 30 };

/** Puntos de las malas: los siguientes son las buenas. */
export const MALAS_TRUCO = 15;

/** Una baza jugada: el bando que la ganó, o `null` si fue parda. */
export interface BazaTruco {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: 0 | 1 | null;
}

export type CantoEnvido = 'envido' | 'real' | 'falta';

export interface EnvidoTruco {
  /** Lo cantado, en orden. */
  readonly cantos: readonly CantoEnvido[];
  readonly estado: 'nada' | 'pendiente' | 'querido' | 'noQuerido';
  /** Quien hizo el último canto. */
  readonly quien: Asiento | null;
  /** Quien tiene que responder mientras está pendiente. */
  readonly responde: Asiento | null;
  /** Lo que cobra el ganador: el valor querido, o el del no querido. */
  readonly valor: number;
  readonly ganador: 0 | 1 | null;
  /** Puntos de envido que mostró cada asiento al quererse (el mejor de cada bando). */
  readonly mostrado: readonly (number | null)[];
}

/** Truco: 0 sin cantar, 1 truco, 2 retruco, 3 vale cuatro. */
export type NivelTruco = 0 | 1 | 2 | 3;

export interface TrucoTruco {
  /** Nivel aceptado. */
  readonly nivel: NivelTruco;
  /** Nivel cantado que espera respuesta; 0 si no hay ninguno. */
  readonly pendiente: NivelTruco;
  readonly quien: Asiento | null;
  readonly responde: Asiento | null;
  /** Bando que puede subir el truco aceptado. */
  readonly puedeSubir: 0 | 1 | null;
}

export interface ResultadoManoTruco {
  readonly repartidor: Asiento;
  readonly envido: EnvidoTruco;
  readonly truco: TrucoTruco;
  readonly ganadorMano: 0 | 1;
  /** Quien se fue al mazo, si alguien se fue. */
  readonly seFue: Asiento | null;
  /** Puntos de envido y de truco que cobró cada bando. */
  readonly puntosEnvido: readonly [number, number];
  readonly puntosTruco: readonly [number, number];
  readonly puntosTras: readonly [number, number];
}

export interface EstadoTruco {
  readonly config: ConfigTruco;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Jugador al que le toca jugar carta (las respuestas van aparte). */
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaTruco[];
  /** La última baza jugada, aunque sea de la mano anterior: se ve mientras se recoge. */
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly envido: EnvidoTruco;
  readonly truco: TrucoTruco;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoTruco[];
}

export type AccionTruco =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'envido' }
  | { readonly tipo: 'realEnvido' }
  | { readonly tipo: 'faltaEnvido' }
  | { readonly tipo: 'truco' }
  | { readonly tipo: 'quiero' }
  | { readonly tipo: 'noQuiero' }
  | { readonly tipo: 'meVoy' };

export interface VistaTruco {
  readonly config: ConfigTruco;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** No hay mazo ni muestra a la vista. */
  readonly mazo: 0;
  readonly muestra: null;
  readonly repartidor: Asiento;
  readonly mano: Asiento;
  /** A quién le toca actuar: quien responde a un canto, o quien juega carta. */
  readonly turno: Asiento | null;
  /** A quién le toca jugar carta cuando no hay cantos pendientes. */
  readonly turnoCarta: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaTruco[];
  /** Bazas ganadas por cada asiento en la mano. */
  readonly bazas: readonly number[];
  readonly ultimaBaza: EstadoTruco['ultimaBaza'];
  readonly envido: EnvidoTruco;
  readonly truco: TrucoTruco;
  /** Lo que vale la mano ahora mismo por el truco aceptado. */
  readonly valorMano: number;
  readonly puntos: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoTruco[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_EN_MANO = 3;

const TRUCO_NADA: TrucoTruco = {
  nivel: 0,
  pendiente: 0,
  quien: null,
  responde: null,
  puedeSubir: null,
};

/** Lo que vale la mano con el truco `nivel` aceptado. */
export const valorTruco = (nivel: NivelTruco) => (nivel === 0 ? 1 : nivel + 1);

/** Lo que vale una cadena de cantos querida: la suma, o la falta (lo que le falta al que va ganando). */
export function valorCantosTruco(
  cantos: readonly CantoEnvido[],
  puntos: readonly [number, number],
  meta: number,
): number {
  if (cantos.includes('falta')) return meta - Math.max(...puntos);
  return cantos.reduce((s, c) => s + (c === 'envido' ? 2 : 3), 0);
}

/** Lo que cobra quien cantó lo último si no se quiere: lo querido antes, o 1. */
export const valorNoQueridoTruco = (
  cantos: readonly CantoEnvido[],
  puntos: readonly [number, number],
  meta: number,
) => Math.max(1, valorCantosTruco(cantos.slice(0, -1), puntos, meta));

/** Los cantos que se pueden hacer tras `cantos` (spec juego-truco: envido). */
export function cantosPosiblesTruco(cantos: readonly CantoEnvido[]): CantoEnvido[] {
  const r: CantoEnvido[] = [];
  const sinSubir = !cantos.includes('real') && !cantos.includes('falta');
  if (sinSubir && cantos.filter((c) => c === 'envido').length < 2) r.push('envido');
  if (sinSubir) r.push('real');
  if (!cantos.includes('falta')) r.push('falta');
  return r;
}

const CANTO_DE_ACCION = { envido: 'envido', realEnvido: 'real', faltaEnvido: 'falta' } as const;
const ACCION_DE_CANTO = { envido: 'envido', real: 'realEnvido', falta: 'faltaEnvido' } as const;

const manoDe = (e: { repartidor: Asiento; config: ConfigTruco }) =>
  siguiente(e.repartidor, e.config.jugadores);

/** Los asientos en orden de juego empezando por `desde`. */
const desde = (inicio: Asiento, n: number) => Array.from({ length: n }, (_, i) => (inicio + i) % n);

/** Quien actúa ahora: el que responde a un canto, o el que juega carta. */
export function actorTruco(e: EstadoTruco): Asiento {
  if (e.envido.estado === 'pendiente') return e.envido.responde!;
  if (e.truco.pendiente > 0) return e.truco.responde!;
  return e.turno;
}

const partidaTerminada = (e: EstadoTruco) => Math.max(...e.puntos) >= e.config.meta;

/**
 * Se puede cantar envido: primera baza, sin envido aún, el asiento no ha jugado su carta y
 * no se ha aceptado ningún truco.
 */
function puedeCantarEnvido(e: EstadoTruco, asiento: Asiento): boolean {
  return (
    e.envido.estado === 'nada' &&
    e.truco.nivel === 0 &&
    e.bazasJugadas.length === 0 &&
    !e.mesa.some((j) => j.asiento === asiento)
  );
}

/** Cartas que cada asiento tiene o ha jugado en la mano. */
function cartasDeLaMano(e: EstadoTruco, asiento: Asiento): IdCarta[] {
  const jugadas = [...e.bazasJugadas.flatMap((b) => b.cartas), ...e.mesa]
    .filter((j) => j.asiento === asiento)
    .map((j) => j.carta);
  return [...e.manos[asiento]!, ...jugadas];
}

/** Resuelve un envido querido: el mejor de cada bando y el ganador (empate: el más cercano a la mano). */
function resolverEnvido(e: EstadoTruco): EnvidoTruco {
  const n = e.config.jugadores;
  const orden = desde(manoDe(e), n);
  const puntos = orden.map((a) => ({ a, p: puntosEnvit(cartasDeLaMano(e, a)) }));
  const mostrado = new Array<number | null>(n).fill(null);
  for (const bando of [0, 1]) {
    const delBando = puntos.filter((x) => bandoDe(x.a) === bando);
    const max = Math.max(...delBando.map((x) => x.p));
    mostrado[delBando.find((x) => x.p === max)!.a] = max;
  }
  const max = Math.max(...puntos.map((x) => x.p));
  const ganador = bandoDe(puntos.find((x) => x.p === max)!.a);
  const valor = valorCantosTruco(e.envido.cantos, e.puntos, e.config.meta);
  return { ...e.envido, estado: 'querido', responde: null, ganador, valor, mostrado };
}

/** El envido pendiente que no se quiere: cobra quien cantó lo último. */
const envidoNoQuerido = (e: EstadoTruco): EnvidoTruco => ({
  ...e.envido,
  estado: 'noQuerido',
  responde: null,
  ganador: bandoDe(e.envido.quien!),
  valor: valorNoQueridoTruco(e.envido.cantos, e.puntos, e.config.meta),
});

function nuevaMano(
  config: ConfigTruco,
  azar: EstadoAzar,
  repartidor: Asiento,
  puntos: readonly [number, number],
  resultadosManos: readonly ResultadoManoTruco[],
  ultimaBaza: EstadoTruco['ultimaBaza'],
): EstadoTruco {
  const n = config.jugadores;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  const reparto = repartir(cartas, new Array<number>(n).fill(CARTAS_EN_MANO));
  if (!reparto.ok) throw new Error(reparto.error);
  const mano = siguiente(repartidor, n);
  const manos = Array.from({ length: n }, (_, a) => reparto.valor.manos[(a - mano + n) % n]!);
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    manos,
    turno: mano,
    mesa: [],
    bazasJugadas: [],
    ultimaBaza,
    envido: {
      cantos: [],
      estado: 'nada',
      quien: null,
      responde: null,
      valor: 0,
      ganador: null,
      mostrado: new Array<number | null>(n).fill(null),
    },
    truco: TRUCO_NADA,
    puntos,
    resultadosManos,
  };
}

/** Cierra la mano: cobra el envido y, si nadie llega a la meta, el truco; y reparte otra. */
function cerrarMano(
  e: EstadoTruco,
  ganadorMano: 0 | 1,
  puntosTrucoMano: number,
  seFue: Asiento | null,
): EstadoTruco {
  const meta = e.config.meta;
  const puntosEnvido: [number, number] = [0, 0];
  if (e.envido.ganador !== null) puntosEnvido[e.envido.ganador] = e.envido.valor;
  const puntosTruco: [number, number] = [0, 0];
  let puntos: [number, number] = [e.puntos[0] + puntosEnvido[0], e.puntos[1] + puntosEnvido[1]];
  if (Math.max(...puntos) < meta) {
    puntosTruco[ganadorMano] = puntosTrucoMano;
    puntos = [puntos[0] + puntosTruco[0], puntos[1] + puntosTruco[1]];
  }
  const resultadosManos = [
    ...e.resultadosManos,
    {
      repartidor: e.repartidor,
      envido: e.envido,
      truco: e.truco,
      ganadorMano,
      seFue,
      puntosEnvido,
      puntosTruco,
      puntosTras: puntos,
    },
  ];
  const cerrado: EstadoTruco = { ...e, puntos, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, e.config.jugadores),
    puntos,
    resultadosManos,
    e.ultimaBaza,
  );
}

function resolverBaza(e: EstadoTruco): EstadoTruco {
  let mejor = e.mesa[0]!;
  let parda = false;
  for (const j of e.mesa.slice(1)) {
    const r = rangoTruc(j.carta);
    const m = rangoTruc(mejor.carta);
    if (r > m) {
      mejor = j;
      parda = false;
    } else if (r === m && bandoDe(j.asiento) !== bandoDe(mejor.asiento)) {
      parda = true;
    }
  }
  const ganador = parda ? null : bandoDe(mejor.asiento);
  const bazasJugadas = [...e.bazasJugadas, { cartas: e.mesa, ganador }];
  const resuelto: EstadoTruco = {
    ...e,
    mesa: [],
    bazasJugadas,
    // Tras una parda sale el mismo que salió en ella.
    turno: parda ? e.mesa[0]!.asiento : mejor.asiento,
    ultimaBaza: { cartas: e.mesa, ganador: parda ? e.mesa[0]!.asiento : mejor.asiento },
  };
  const gana = ganadorDeLaMano(
    bazasJugadas.map((b) => b.ganador),
    bandoDe(manoDe(e)),
  );
  return gana === null ? resuelto : cerrarMano(resuelto, gana, valorTruco(e.truco.nivel), null);
}

/** Primer rival en orden de juego tras `asiento`. */
const primerRival = (asiento: Asiento, n: number) => siguiente(asiento, n);

/** Lo que cobran los rivales de quien se va: lo anterior de lo pendiente, o lo aceptado. */
const valorAlIrse = (truco: TrucoTruco) =>
  truco.pendiente > 0 ? valorTruco((truco.pendiente - 1) as NivelTruco) : valorTruco(truco.nivel);

// ── Juego ────────────────────────────────────────────────────────────────────

export const truco: Juego<ConfigTruco, EstadoTruco, AccionTruco, VistaTruco> = {
  id: 'truco',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('El Truco se juega con 2 jugadores o con 4 en parejas');
    }
    if (!Number.isInteger(config.meta) || config.meta < 1) {
      return error('La meta del Truco debe ser un entero positivo');
    }
    const limpia: ConfigTruco = { jugadores: config.jugadores, meta: config.meta };
    // Empieza repartiendo el último asiento, así es mano el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, [0, 0], [], null));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== actorTruco(e)) return [];
    const acciones: AccionTruco[] = [];
    const cantos = (base: readonly CantoEnvido[]) =>
      cantosPosiblesTruco(base).map((c) => ({ tipo: ACCION_DE_CANTO[c] }));
    if (e.envido.estado === 'pendiente') {
      acciones.push({ tipo: 'quiero' }, { tipo: 'noQuiero' }, ...cantos(e.envido.cantos));
    } else if (e.truco.pendiente > 0) {
      acciones.push({ tipo: 'quiero' }, { tipo: 'noQuiero' });
      if (e.truco.pendiente < 3) acciones.push({ tipo: 'truco' });
      // El envido está primero.
      if (puedeCantarEnvido(e, asiento)) acciones.push(...cantos([]));
    } else {
      for (const carta of e.manos[asiento]!) acciones.push({ tipo: 'jugar', carta });
      if (puedeCantarEnvido(e, asiento)) acciones.push(...cantos([]));
      const sube =
        e.truco.nivel === 0 || (e.truco.nivel < 3 && e.truco.puedeSubir === bandoDe(asiento));
      if (sube) acciones.push({ tipo: 'truco' });
    }
    acciones.push({ tipo: 'meVoy' });
    return acciones;
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    const envidoPendiente = e.envido.estado === 'pendiente';
    switch (accion.tipo) {
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoTruco = { ...e, manos, mesa };
        return mesa.length < n ? { ...jugado, turno: siguiente(asiento, n) } : resolverBaza(jugado);
      }
      case 'envido':
      case 'realEnvido':
      case 'faltaEnvido':
        return {
          ...e,
          envido: {
            ...e.envido,
            cantos: [...e.envido.cantos, CANTO_DE_ACCION[accion.tipo]],
            estado: 'pendiente',
            quien: asiento,
            responde: primerRival(asiento, n),
          },
        };
      case 'truco': {
        // Al responder con una subida se acepta lo pendiente.
        const aceptado = e.truco.pendiente > 0 ? e.truco.pendiente : e.truco.nivel;
        return {
          ...e,
          truco: {
            nivel: aceptado,
            pendiente: (aceptado + 1) as NivelTruco,
            quien: asiento,
            responde: primerRival(asiento, n),
            puedeSubir: null,
          },
        };
      }
      case 'quiero':
        if (envidoPendiente) return { ...e, envido: resolverEnvido(e) };
        return {
          ...e,
          truco: {
            ...e.truco,
            nivel: e.truco.pendiente,
            pendiente: 0,
            responde: null,
            puedeSubir: bandoDe(asiento),
          },
        };
      case 'noQuiero': {
        if (envidoPendiente) return { ...e, envido: envidoNoQuerido(e) };
        return cerrarMano(e, bandoDe(e.truco.quien!), valorAlIrse(e.truco), null);
      }
      case 'meVoy': {
        const envido = envidoPendiente ? envidoNoQuerido(e) : e.envido;
        const rival = (1 - bandoDe(asiento)) as 0 | 1;
        return cerrarMano({ ...e, envido }, rival, valorAlIrse(e.truco), asiento);
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
      mazo: 0,
      muestra: null,
      repartidor: e.repartidor,
      mano: manoDe(e),
      turno: terminada ? null : actorTruco(e),
      turnoCarta: e.turno,
      mesa: [...e.mesa],
      bazasJugadas: [...e.bazasJugadas],
      bazas: Array.from({ length: e.config.jugadores }, (_, a) =>
        e.bazasJugadas.reduce(
          (s, b) =>
            b.ganador !== null &&
            b.cartas.reduce((m, j) => (rangoTruc(j.carta) > rangoTruc(m.carta) ? j : m)).asiento ===
              a
              ? s + 1
              : s,
          0,
        ),
      ),
      ultimaBaza: e.ultimaBaza,
      envido: e.envido,
      truco: e.truco,
      valorMano: valorTruco(e.truco.nivel),
      puntos: e.puntos,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const bando = e.puntos[0] > e.puntos[1] ? 0 : 1;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    return {
      ganadores: asientos.filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: asientos.map((a) => e.puntos[bandoDe(a)]),
    };
  },
};
