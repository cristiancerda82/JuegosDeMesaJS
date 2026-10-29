import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, colorDe, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Kings in the Corner de 2 a 4 jugadores, a una sola mano. */
export interface ConfigKingsCorner {
  readonly jugadores: number;
}

export const CONFIG_KINGS_CORNER_POR_DEFECTO: ConfigKingsCorner = { jugadores: 2 };

/** Pilas laterales (0 a 3: arriba, derecha, abajo, izquierda) y esquinas (4 a 7). */
export const LATERALES_KINGS = [0, 1, 2, 3] as const;
export const ESQUINAS_KINGS = [4, 5, 6, 7] as const;
export const esEsquinaKings = (pila: number) => pila >= 4;

export type AccionKingsCorner =
  | { readonly tipo: 'jugar'; readonly carta: IdCarta; readonly pila: number }
  | { readonly tipo: 'mover'; readonly desde: number; readonly a: number }
  | { readonly tipo: 'pasar' };

export interface EstadoKingsCorner {
  readonly config: ConfigKingsCorner;
  readonly azar: EstadoAzar;
  readonly manos: readonly (readonly IdCarta[])[];
  /** La siguiente que se roba es la última. */
  readonly mazo: readonly IdCarta[];
  /** Las 8 pilas; la carta de arriba es la última. */
  readonly pilas: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly pasesSeguidos: number;
  readonly ganador: Asiento | 'empate' | null;
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly accion: AccionKingsCorner;
  } | null;
}

export interface VistaKingsCorner {
  readonly config: ConfigKingsCorner;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly enMazo: number;
  readonly pilas: readonly (readonly IdCarta[])[];
  readonly turno: Asiento | null;
  readonly pasesSeguidos: number;
  readonly ganador: Asiento | 'empate' | null;
  readonly ultimaAccion: EstadoKingsCorner['ultimaAccion'];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const CARTAS_EN_MANO = 7;

export const valorKings = (c: IdCarta) => cartaDeId(c)!.valor;
const colorKings = (c: IdCarta) => colorDe(cartaDeId(c)!.palo as PaloFrances);
export const esReyKings = (c: IdCarta) => valorKings(c) === 13;

/** La carta se puede poner sobre `sobre`: un punto menos y del color contrario. */
export const encajaKings = (carta: IdCarta, sobre: IdCarta) =>
  valorKings(carta) === valorKings(sobre) - 1 && colorKings(carta) !== colorKings(sobre);

/** La carta se puede poner en la pila: encaja arriba, o la pila es un hueco que la admite. */
export function admiteKings(pilas: EstadoKingsCorner['pilas'], pila: number, carta: IdCarta) {
  const p = pilas[pila]!;
  if (p.length > 0) return encajaKings(carta, p.at(-1)!);
  return esEsquinaKings(pila) ? esReyKings(carta) : true;
}

/** Roba una carta para quien empieza su turno, si quedan. */
function robar(e: EstadoKingsCorner): EstadoKingsCorner {
  if (e.mazo.length === 0) return e;
  const carta = e.mazo.at(-1)!;
  return {
    ...e,
    mazo: e.mazo.slice(0, -1),
    manos: e.manos.map((m, a) => (a === e.turno ? [...m, carta] : m)),
  };
}

/** Las acciones de mover pilas: las laterales cuya primera carta encaja arriba de otra pila. */
function movimientos(pilas: EstadoKingsCorner['pilas']): AccionKingsCorner[] {
  const r: AccionKingsCorner[] = [];
  for (const desde of LATERALES_KINGS) {
    const base = pilas[desde]![0];
    if (base === undefined) continue;
    for (let a = 0; a < 8; a++) {
      const arriba = pilas[a]!.at(-1);
      if (a !== desde && arriba !== undefined && encajaKings(base, arriba)) {
        r.push({ tipo: 'mover', desde, a });
      }
    }
  }
  return r;
}

/** Las jugadas de la mano; de los huecos y de las esquinas vacías, solo el primero. */
function jugadas(e: EstadoKingsCorner, asiento: Asiento): AccionKingsCorner[] {
  const huecoLateral = LATERALES_KINGS.find((p) => e.pilas[p]!.length === 0);
  const esquinaLibre = ESQUINAS_KINGS.find((p) => e.pilas[p]!.length === 0);
  const destinos = [
    ...Array.from({ length: 8 }, (_, p) => p).filter((p) => e.pilas[p]!.length > 0),
    ...(huecoLateral === undefined ? [] : [huecoLateral]),
    ...(esquinaLibre === undefined ? [] : [esquinaLibre]),
  ].sort((a, b) => a - b);
  const cartas = [...new Set(e.manos[asiento]!)].sort();
  return cartas.flatMap((carta) =>
    destinos
      .filter((pila) => admiteKings(e.pilas, pila, carta))
      .map((pila): AccionKingsCorner => ({ tipo: 'jugar', carta, pila })),
  );
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const kingsCorner: Juego<
  ConfigKingsCorner,
  EstadoKingsCorner,
  AccionKingsCorner,
  VistaKingsCorner
> = {
  id: 'kingsCorner',

  crear(config, semilla) {
    const n = config.jugadores;
    if (!Number.isInteger(n) || n < 2 || n > 4) {
      return error('Kings in the Corner se juega de 2 a 4 jugadores');
    }
    const { cartas, azar } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const manos = Array.from({ length: n }, (_, a) =>
      cartas.slice(a * CARTAS_EN_MANO, (a + 1) * CARTAS_EN_MANO),
    );
    const resto = cartas.slice(n * CARTAS_EN_MANO);
    const cruz = resto.slice(-4);
    return ok(
      robar({
        config: { jugadores: n },
        azar,
        manos,
        mazo: resto.slice(0, -4),
        pilas: [...cruz.map((c) => [c]), [], [], [], []],
        turno: 0,
        pasesSeguidos: 0,
        ganador: null,
        ultimaAccion: null,
      }),
    );
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (e.ganador !== null || asiento !== e.turno) return [];
    return [...movimientos(e.pilas), ...jugadas(e, asiento), { tipo: 'pasar' }];
  },

  transicion(e, asiento, accion) {
    const hecha = { asiento, accion };
    if (accion.tipo === 'pasar') {
      const n = e.config.jugadores;
      const pases = e.pasesSeguidos + 1;
      if (e.mazo.length === 0 && pases >= n) {
        const menos = Math.min(...e.manos.map((m) => m.length));
        const conMenos = e.manos.flatMap((m, a) => (m.length === menos ? [a] : []));
        return {
          ...e,
          pasesSeguidos: pases,
          ganador: conMenos.length === 1 ? conMenos[0]! : 'empate',
          ultimaAccion: hecha,
        };
      }
      return robar({ ...e, turno: (asiento + 1) % n, pasesSeguidos: pases, ultimaAccion: hecha });
    }
    if (accion.tipo === 'mover') {
      const movida = e.pilas[accion.desde]!;
      return {
        ...e,
        pilas: e.pilas.map((p, i) =>
          i === accion.desde ? [] : i === accion.a ? [...p, ...movida] : p,
        ),
        pasesSeguidos: 0,
        ultimaAccion: hecha,
      };
    }
    const mano = [...e.manos[asiento]!];
    mano.splice(mano.indexOf(accion.carta), 1);
    return {
      ...e,
      manos: e.manos.map((m, a) => (a === asiento ? mano : m)),
      pilas: e.pilas.map((p, i) => (i === accion.pila ? [...p, accion.carta] : p)),
      pasesSeguidos: 0,
      ganador: mano.length === 0 ? asiento : null,
      ultimaAccion: hecha,
    };
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      enMazo: e.mazo.length,
      pilas: e.pilas.map((p) => [...p]),
      turno: e.ganador === null ? e.turno : null,
      pasesSeguidos: e.pasesSeguidos,
      ganador: e.ganador,
      ultimaAccion: e.ultimaAccion,
    };
  },

  resultado(e): Fin | null {
    if (e.ganador === null) return null;
    const puntos = e.manos.map((m) => m.length);
    if (e.ganador !== 'empate') return { ganadores: [e.ganador], empate: false, puntos };
    const menos = Math.min(...puntos);
    return { ganadores: puntos.flatMap((p, a) => (p === menos ? [a] : [])), empate: true, puntos };
  },
};
