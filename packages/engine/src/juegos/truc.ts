import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import { bandoDe, paloDe, siguiente, valorDe, type CartaJugada } from '../motor/bazas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigTruc {
  /** 2 jugadores, o 4 en parejas (asientos 0 y 2 contra 1 y 3). */
  readonly jugadores: 2 | 4;
  /** Cames que hay que ganar para ganar la partida. */
  readonly cames: 1 | 2;
}

export const CONFIG_TRUC_POR_DEFECTO: ConfigTruc = { jugadores: 2, cames: 2 };

/** Piedras con las que se gana una came. */
export const PIEDRAS_CAME = 12;

/** Una baza jugada: el bando que la ganó, o `null` si fue parda. */
export interface BazaTruc {
  readonly cartas: readonly CartaJugada[];
  readonly ganador: 0 | 1 | null;
}

/** Envit: 0 sin envidar, 1 envit, 2 torne, 3 falta. */
export type NivelEnvit = 0 | 1 | 2 | 3;

export interface EnvitTruc {
  readonly nivel: NivelEnvit;
  readonly estado: 'nada' | 'pendiente' | 'querido' | 'noQuerido';
  /** Quien hizo la última apuesta del envit. */
  readonly quien: Asiento | null;
  /** Quien tiene que responder mientras está pendiente. */
  readonly responde: Asiento | null;
  /** Lo que cobra quien apostó si el otro no quiere. */
  readonly siNoQuiere: number;
  /** Lo que cobra el ganador: el valor querido, o el del no querido. */
  readonly valor: number;
  readonly ganador: 0 | 1 | null;
  /** Puntos de envit que mostró cada asiento al quererse (el mejor de cada bando). */
  readonly mostrado: readonly (number | null)[];
}

/** Truc: 0 sin trucar, 1 truc, 2 retruc, 3 quatre val, 4 joc fora. */
export type NivelTruc = 0 | 1 | 2 | 3 | 4;

export interface TrucTruc {
  /** Nivel aceptado. */
  readonly nivel: NivelTruc;
  /** Nivel propuesto que espera respuesta; 0 si no hay ninguno. */
  readonly pendiente: NivelTruc;
  readonly quien: Asiento | null;
  readonly responde: Asiento | null;
  /** Bando que puede subir el truc aceptado. */
  readonly puedeSubir: 0 | 1 | null;
}

export interface ResultadoManoTruc {
  readonly repartidor: Asiento;
  readonly envit: EnvitTruc;
  readonly truc: TrucTruc;
  readonly ganadorMano: 0 | 1;
  /** Quien se fue de la mano («me'n vaig»), si alguien se fue. */
  readonly seFue: Asiento | null;
  /** Piedras de envit y de truc que cobró cada bando. */
  readonly piedrasEnvit: readonly [number, number];
  readonly piedrasTruc: readonly [number, number];
  /** Piedras de la came tras la mano (a 0 si se cerró). */
  readonly piedrasTras: readonly [number, number];
  /** Bando que cerró una came con esta mano. */
  readonly came: 0 | 1 | null;
  readonly camesTras: readonly [number, number];
}

export interface EstadoTruc {
  readonly config: ConfigTruc;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** Jugador al que le toca jugar carta (las respuestas van aparte). */
  readonly turno: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaTruc[];
  /** La última baza jugada, aunque sea de la mano anterior: se ve mientras se recoge. */
  readonly ultimaBaza: {
    readonly cartas: readonly CartaJugada[];
    readonly ganador: Asiento;
  } | null;
  readonly envit: EnvitTruc;
  readonly truc: TrucTruc;
  readonly piedras: readonly [number, number];
  readonly cames: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoTruc[];
}

export type AccionTruc =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta }
  | { readonly tipo: 'envidar' }
  | { readonly tipo: 'torne' }
  | { readonly tipo: 'falta' }
  | { readonly tipo: 'trucar' }
  | { readonly tipo: 'vull' }
  | { readonly tipo: 'noVull' }
  | { readonly tipo: 'meVoy' };

export interface VistaTruc {
  readonly config: ConfigTruc;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  /** No hay mazo ni muestra a la vista. */
  readonly mazo: 0;
  readonly muestra: null;
  readonly repartidor: Asiento;
  readonly mano: Asiento;
  /** A quién le toca actuar: quien responde a una apuesta, o quien juega carta. */
  readonly turno: Asiento | null;
  /** A quién le toca jugar carta cuando no hay apuestas pendientes. */
  readonly turnoCarta: Asiento;
  readonly mesa: readonly CartaJugada[];
  readonly bazasJugadas: readonly BazaTruc[];
  /** Bazas ganadas por cada asiento en la mano. */
  readonly bazas: readonly number[];
  readonly ultimaBaza: EstadoTruc['ultimaBaza'];
  readonly envit: EnvitTruc;
  readonly truc: TrucTruc;
  /** Lo que vale la mano ahora mismo por el truc aceptado. */
  readonly valorMano: number;
  readonly piedras: readonly [number, number];
  readonly cames: readonly [number, number];
  readonly resultadosManos: readonly ResultadoManoTruc[];
}

// ── Cartas ───────────────────────────────────────────────────────────────────

/** Rango de una carta en el Truc: 14 el As de espadas … 1 los cuatros. */
export function rangoTruc(carta: IdCarta): number {
  const palo = paloDe(carta);
  const valor = valorDe(carta);
  switch (valor) {
    case 1:
      return palo === 'espadas' ? 14 : palo === 'bastos' ? 13 : 8;
    case 7:
      return palo === 'espadas' ? 12 : palo === 'oros' ? 11 : 4;
    case 3:
      return 10;
    case 2:
      return 9;
    case 12:
      return 7;
    case 11:
      return 6;
    case 10:
      return 5;
    case 6:
      return 3;
    case 5:
      return 2;
    default:
      return 1;
  }
}

/** Valor de una carta para el envit: su número, con las figuras a 0. */
const valorEnvit = (carta: IdCarta) => (valorDe(carta) >= 10 ? 0 : valorDe(carta));

/**
 * Puntos de envit de las cartas de un jugador en la mano (las que tiene y las que jugó): 20 más
 * las dos más altas de un palo con dos o más; si no, la más alta.
 */
export function puntosEnvit(cartas: readonly IdCarta[]): number {
  let mejor = Math.max(0, ...cartas.map(valorEnvit));
  const porPalo = new Map<string, number[]>();
  for (const c of cartas)
    porPalo.set(paloDe(c), [...(porPalo.get(paloDe(c)) ?? []), valorEnvit(c)]);
  for (const valores of porPalo.values()) {
    if (valores.length < 2) continue;
    const [a, b] = [...valores].sort((x, y) => y - x);
    mejor = Math.max(mejor, 20 + a! + b!);
  }
  return mejor;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_EN_MANO = 3;

const ENVIT_NADA: EnvitTruc = {
  nivel: 0,
  estado: 'nada',
  quien: null,
  responde: null,
  siNoQuiere: 0,
  valor: 0,
  ganador: null,
  mostrado: [],
};
const TRUC_NADA: TrucTruc = {
  nivel: 0,
  pendiente: 0,
  quien: null,
  responde: null,
  puedeSubir: null,
};

/** Lo que vale la mano con el truc `nivel` aceptado. */
export const valorTruc = (nivel: NivelTruc) => (nivel === 0 ? 1 : nivel + 1);

const manoDe = (e: { repartidor: Asiento; config: ConfigTruc }) =>
  siguiente(e.repartidor, e.config.jugadores);

/** Los asientos en orden de juego empezando por `desde`. */
const desde = (inicio: Asiento, n: number) => Array.from({ length: n }, (_, i) => (inicio + i) % n);

/** Quien actúa ahora: el que responde a una apuesta, o el que juega carta. */
export function actorTruc(e: EstadoTruc): Asiento {
  if (e.envit.estado === 'pendiente') return e.envit.responde!;
  if (e.truc.pendiente > 0) return e.truc.responde!;
  return e.turno;
}

function partidaTerminada(e: EstadoTruc): boolean {
  return Math.max(...e.cames) >= e.config.cames;
}

/** Se puede envidar: primera baza, sin envit aún, y el asiento no ha jugado su carta. */
function puedeEnvidar(e: EstadoTruc, asiento: Asiento): boolean {
  return (
    e.envit.estado === 'nada' &&
    e.bazasJugadas.length === 0 &&
    !e.mesa.some((j) => j.asiento === asiento)
  );
}

/**
 * El bando que gana la mano según las bazas jugadas, o `null` si aún no se sabe (spec
 * juego-truc: bazas y pardas).
 */
export function ganadorDeLaMano(bazas: readonly (0 | 1 | null)[], bandoMano: 0 | 1): 0 | 1 | null {
  if (bazas.length < 2) return null;
  const a = bazas[0]!;
  const b = bazas[1]!;
  if (bazas.length === 2) {
    if (a !== null && (b === a || b === null)) return a;
    if (a === null && b !== null) return b;
    return null;
  }
  const c = bazas[2]!;
  if (c !== null) return c;
  if (a !== null) return a;
  return b ?? bandoMano;
}

/** Cartas que cada asiento tiene o ha jugado en la mano. */
function cartasDeLaMano(e: EstadoTruc, asiento: Asiento): IdCarta[] {
  const jugadas = [...e.bazasJugadas.flatMap((b) => b.cartas), ...e.mesa]
    .filter((j) => j.asiento === asiento)
    .map((j) => j.carta);
  return [...e.manos[asiento]!, ...jugadas];
}

/** Resuelve un envit querido: el mejor de cada bando y el ganador (empate: el más cercano a la mano). */
function resolverEnvit(e: EstadoTruc): EnvitTruc {
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
  const valor =
    e.envit.nivel === 1 ? 2 : e.envit.nivel === 2 ? 4 : PIEDRAS_CAME - Math.max(...e.piedras);
  return { ...e.envit, estado: 'querido', responde: null, ganador, valor, mostrado };
}

function nuevaMano(
  config: ConfigTruc,
  azar: EstadoAzar,
  repartidor: Asiento,
  piedras: readonly [number, number],
  cames: readonly [number, number],
  resultadosManos: readonly ResultadoManoTruc[],
  ultimaBaza: EstadoTruc['ultimaBaza'],
): EstadoTruc {
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
    envit: { ...ENVIT_NADA, mostrado: new Array<number | null>(n).fill(null) },
    truc: TRUC_NADA,
    piedras,
    cames,
    resultadosManos,
  };
}

/** Cierra la mano: cobra el envit y luego el truc, cierra la came si toca y reparte otra. */
function cerrarMano(
  e: EstadoTruc,
  ganadorMano: 0 | 1,
  puntosTruc: number,
  seFue: Asiento | null,
): EstadoTruc {
  const piedrasEnvit: [number, number] = [0, 0];
  if (e.envit.ganador !== null) piedrasEnvit[e.envit.ganador] = e.envit.valor;
  const piedrasTruc: [number, number] = [0, 0];
  let piedras: [number, number] = [e.piedras[0] + piedrasEnvit[0], e.piedras[1] + piedrasEnvit[1]];
  let came: 0 | 1 | null = piedras[0] >= PIEDRAS_CAME ? 0 : piedras[1] >= PIEDRAS_CAME ? 1 : null;
  if (came === null) {
    piedrasTruc[ganadorMano] = puntosTruc;
    piedras = [piedras[0] + piedrasTruc[0], piedras[1] + piedrasTruc[1]];
    // Con el joc fora querido, quien gana la mano (o el rival de quien se va) gana la came.
    if (e.truc.nivel === 4 || piedras[ganadorMano] >= PIEDRAS_CAME) came = ganadorMano;
  }
  const cames: [number, number] = [...e.cames];
  if (came !== null) {
    cames[came]++;
    piedras = [0, 0];
  }
  const resultadosManos = [
    ...e.resultadosManos,
    {
      repartidor: e.repartidor,
      envit: e.envit,
      truc: e.truc,
      ganadorMano,
      seFue,
      piedrasEnvit,
      piedrasTruc,
      piedrasTras: piedras,
      came,
      camesTras: cames,
    },
  ];
  const cerrado: EstadoTruc = { ...e, piedras, cames, resultadosManos };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(
    e.config,
    e.azar,
    siguiente(e.repartidor, e.config.jugadores),
    piedras,
    cames,
    resultadosManos,
    e.ultimaBaza,
  );
}

function resolverBaza(e: EstadoTruc): EstadoTruc {
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
  const resuelto: EstadoTruc = {
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
  return gana === null ? resuelto : cerrarMano(resuelto, gana, valorTruc(e.truc.nivel), null);
}

/** Primer rival en orden de juego tras `asiento`. */
const primerRival = (asiento: Asiento, n: number) => siguiente(asiento, n);

/** Lo que cobran los rivales de quien se va: lo anterior de lo pendiente, o lo aceptado. */
const valorAlIrse = (truc: TrucTruc) =>
  truc.pendiente > 0 ? valorTruc((truc.pendiente - 1) as NivelTruc) : valorTruc(truc.nivel);

// ── Juego ────────────────────────────────────────────────────────────────────

export const truc: Juego<ConfigTruc, EstadoTruc, AccionTruc, VistaTruc> = {
  id: 'truc',

  crear(config, semilla) {
    if (config.jugadores !== 2 && config.jugadores !== 4) {
      return error('El Truc se juega con 2 jugadores o con 4 en parejas');
    }
    if (config.cames !== 1 && config.cames !== 2) {
      return error('La partida de Truc se juega a una o a dos cames');
    }
    const limpia: ConfigTruc = { jugadores: config.jugadores, cames: config.cames };
    // Empieza repartiendo el último asiento, así es mano el asiento 0.
    return ok(
      nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, [0, 0], [0, 0], [], null),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== actorTruc(e)) return [];
    const acciones: AccionTruc[] = [];
    if (e.envit.estado === 'pendiente') {
      acciones.push({ tipo: 'vull' }, { tipo: 'noVull' });
      if (e.envit.nivel === 1) acciones.push({ tipo: 'torne' });
      if (e.envit.nivel <= 2) acciones.push({ tipo: 'falta' });
    } else if (e.truc.pendiente > 0) {
      acciones.push({ tipo: 'vull' }, { tipo: 'noVull' });
      if (e.truc.pendiente < 4) acciones.push({ tipo: 'trucar' });
      if (puedeEnvidar(e, asiento)) acciones.push({ tipo: 'envidar' });
    } else {
      for (const carta of e.manos[asiento]!) acciones.push({ tipo: 'jugar', carta });
      if (puedeEnvidar(e, asiento)) acciones.push({ tipo: 'envidar' });
      const sube =
        e.truc.nivel === 0 || (e.truc.nivel < 4 && e.truc.puedeSubir === bandoDe(asiento));
      if (sube) acciones.push({ tipo: 'trucar' });
    }
    acciones.push({ tipo: 'meVoy' });
    return acciones;
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    const envitPendiente = e.envit.estado === 'pendiente';
    switch (accion.tipo) {
      case 'jugar': {
        const manos = e.manos.map((m, a) =>
          a === asiento ? m.filter((c) => c !== accion.carta) : m,
        );
        const mesa = [...e.mesa, { asiento, carta: accion.carta }];
        const jugado: EstadoTruc = { ...e, manos, mesa };
        return mesa.length < n ? { ...jugado, turno: siguiente(asiento, n) } : resolverBaza(jugado);
      }
      case 'envidar':
        return {
          ...e,
          envit: {
            ...e.envit,
            nivel: 1,
            estado: 'pendiente',
            quien: asiento,
            responde: primerRival(asiento, n),
            siNoQuiere: 1,
          },
        };
      case 'torne':
      case 'falta': {
        const nivel = accion.tipo === 'torne' ? 2 : 3;
        // Subir es aceptar lo anterior: si no se quiere la subida, se cobra lo aceptado.
        const siNoQuiere = e.envit.nivel === 1 ? 2 : 4;
        return {
          ...e,
          envit: {
            ...e.envit,
            nivel,
            quien: asiento,
            responde: primerRival(asiento, n),
            siNoQuiere,
          },
        };
      }
      case 'trucar': {
        // Al responder con una subida se acepta lo pendiente.
        const aceptado = e.truc.pendiente > 0 ? e.truc.pendiente : e.truc.nivel;
        return {
          ...e,
          truc: {
            nivel: aceptado,
            pendiente: (aceptado + 1) as NivelTruc,
            quien: asiento,
            responde: primerRival(asiento, n),
            puedeSubir: null,
          },
        };
      }
      case 'vull':
        if (envitPendiente) return { ...e, envit: resolverEnvit(e) };
        return {
          ...e,
          truc: {
            ...e.truc,
            nivel: e.truc.pendiente,
            pendiente: 0,
            responde: null,
            puedeSubir: bandoDe(asiento),
          },
        };
      case 'noVull': {
        if (envitPendiente) {
          const envit: EnvitTruc = {
            ...e.envit,
            estado: 'noQuerido',
            responde: null,
            ganador: bandoDe(e.envit.quien!),
            valor: e.envit.siNoQuiere,
          };
          return { ...e, envit };
        }
        const gana = bandoDe(e.truc.quien!);
        return cerrarMano(e, gana, valorAlIrse(e.truc), null);
      }
      case 'meVoy': {
        const envit: EnvitTruc = envitPendiente
          ? {
              ...e.envit,
              estado: 'noQuerido',
              responde: null,
              ganador: bandoDe(e.envit.quien!),
              valor: e.envit.siNoQuiere,
            }
          : e.envit;
        const rival = (1 - bandoDe(asiento)) as 0 | 1;
        return cerrarMano({ ...e, envit }, rival, valorAlIrse(e.truc), asiento);
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
      turno: terminada ? null : actorTruc(e),
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
      envit: e.envit,
      truc: e.truc,
      valorMano: valorTruc(e.truc.nivel),
      piedras: e.piedras,
      cames: e.cames,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const bando = e.cames[0] > e.cames[1] ? 0 : 1;
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    return {
      ganadores: asientos.filter((a) => bandoDe(a) === bando),
      empate: false,
      puntos: asientos.map((a) => e.cames[bandoDe(a)]),
    };
  },
};
