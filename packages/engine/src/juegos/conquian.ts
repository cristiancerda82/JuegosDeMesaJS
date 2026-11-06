import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { posicionEscalera } from './chinchon-combinaciones';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Conquián para 2; gana la partida quien gana `manosParaGanar` manos (3: al mejor de 5). */
export interface ConfigConquian {
  readonly manosParaGanar: number;
}

export const CONFIG_CONQUIAN_POR_DEFECTO: ConfigConquian = { manosParaGanar: 3 };

export type FaseConquian = 'decidir' | 'descartar';
export type OrigenConquian = 'mazo' | 'descarte';

export type AccionConquian =
  /** Una combinación nueva con la descubierta y esas cartas de la mano. */
  | { readonly tipo: 'bajar'; readonly cartas: readonly IdCarta[] }
  /** La descubierta y esas cartas de la mano, a la combinación propia `combinacion`. */
  | {
      readonly tipo: 'anadir';
      readonly combinacion: number;
      readonly cartas: readonly IdCarta[];
    }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'descartar'; readonly carta: IdCarta };

export interface ResultadoManoConquian {
  readonly empieza: Asiento;
  /** Quien ganó la mano, o `null` si fue tablas. */
  readonly ganador: Asiento | null;
  /** Cuántas cartas bajó cada uno. */
  readonly bajadas: readonly number[];
  /** Las manos ganadas por cada uno tras esta. */
  readonly ganadas: readonly number[];
}

export interface EstadoConquian {
  readonly config: ConfigConquian;
  readonly azar: EstadoAzar;
  readonly empieza: Asiento;
  readonly manos: readonly (readonly IdCarta[])[];
  /** La siguiente que se descubre es la primera. */
  readonly mazo: readonly IdCarta[];
  /** Las que nadie usó, boca arriba. */
  readonly muertas: readonly IdCarta[];
  /** Las combinaciones bajadas de cada jugador, en el orden en que se bajaron. */
  readonly combinaciones: readonly (readonly (readonly IdCarta[])[])[];
  readonly descubierta: IdCarta | null;
  readonly origen: OrigenConquian;
  /** Quien descubrió o descartó la carta. */
  readonly deQuien: Asiento;
  readonly ofrecidaA: Asiento;
  readonly fase: FaseConquian;
  readonly turno: Asiento;
  readonly ganadas: readonly number[];
  readonly resultadosManos: readonly ResultadoManoConquian[];
}

export interface VistaConquian {
  readonly config: ConfigConquian;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly enMazo: number;
  readonly muertas: readonly IdCarta[];
  readonly combinaciones: EstadoConquian['combinaciones'];
  readonly descubierta: IdCarta | null;
  readonly origen: OrigenConquian;
  readonly deQuien: Asiento;
  readonly ofrecidaA: Asiento;
  readonly fase: FaseConquian;
  readonly turno: Asiento | null;
  readonly empieza: Asiento;
  readonly ganadas: readonly number[];
  /** El número de la mano, desde 1. */
  readonly manoNumero: number;
  readonly resultadosManos: readonly ResultadoManoConquian[];
}

// ── Cartas y combinaciones ───────────────────────────────────────────────────

export const BARAJA_CONQUIAN: readonly IdCarta[] = crearBaraja('espanola40');

export const paloConquian = (c: IdCarta) => cartaDeId(c)!.palo as PaloEspanol;
export const valorConquian = (c: IdCarta) => cartaDeId(c)!.valor;
/** La posición en el orden: As 0 … 7 6, sota 7, caballo 8, rey 9. */
export const posicionConquian = (c: IdCarta) => posicionEscalera(valorConquian(c), 'espanola40');

const esGrupo = (cartas: readonly IdCarta[]) =>
  cartas.length >= 3 &&
  cartas.length <= 4 &&
  cartas.every((c) => valorConquian(c) === valorConquian(cartas[0]!));

const esEscalera = (cartas: readonly IdCarta[]) => {
  if (cartas.length < 3) return false;
  if (cartas.some((c) => paloConquian(c) !== paloConquian(cartas[0]!))) return false;
  const p = cartas.map(posicionConquian).sort((a, b) => a - b);
  return p.every((x, k) => x === p[0]! + k);
};

/** Un grupo de 3 o 4 del mismo número, o una escalera de 3 o más del mismo palo. */
export const esCombinacionConquian = (cartas: readonly IdCarta[]) =>
  esGrupo(cartas) || esEscalera(cartas);

/** Ordena una combinación: por posición y, en los grupos, por palo. */
export const ordenarConquian = (cartas: readonly IdCarta[]) =>
  [...cartas].sort((a, b) => posicionConquian(a) - posicionConquian(b) || (a < b ? -1 : 1));

/** Todos los subconjuntos de `cartas` con al menos `minimo` cartas. */
function subconjuntos(cartas: readonly IdCarta[], minimo: number): IdCarta[][] {
  const r: IdCarta[][] = [];
  for (let m = 1; m < 1 << cartas.length; m++) {
    const s = cartas.filter((_, k) => m & (1 << k));
    if (s.length >= minimo) r.push(s);
  }
  return r;
}

/** Cartas de la mano (de un palo) en posiciones seguidas desde `desde`, en el sentido `paso`. */
function seguidas(mano: readonly IdCarta[], palo: PaloEspanol, desde: number, paso: 1 | -1) {
  const r: IdCarta[] = [];
  for (let p = desde; ; p += paso) {
    const c = mano.find((x) => paloConquian(x) === palo && posicionConquian(x) === p);
    if (!c) return r;
    r.push(c);
  }
}

/** Las combinaciones nuevas que se pueden bajar con la descubierta: las cartas de la mano de cada una. */
export function bajadasConquian(mano: readonly IdCarta[], d: IdCarta): IdCarta[][] {
  const r: IdCarta[][] = [];
  const mismos = mano.filter((c) => valorConquian(c) === valorConquian(d));
  r.push(...subconjuntos(mismos, 2));
  const palo = paloConquian(d);
  const p = posicionConquian(d);
  const abajo = seguidas(mano, palo, p - 1, -1); // p-1, p-2, …
  const arriba = seguidas(mano, palo, p + 1, 1); // p+1, p+2, …
  for (let i = 0; i <= abajo.length; i++) {
    for (let j = 0; j <= arriba.length; j++) {
      if (i + j >= 2) r.push([...abajo.slice(0, i), ...arriba.slice(0, j)]);
    }
  }
  return r.map(ordenarConquian);
}

/** Lo que se puede añadir con la descubierta a cada combinación propia. */
export function anadidosConquian(
  mano: readonly IdCarta[],
  d: IdCarta,
  combinaciones: readonly (readonly IdCarta[])[],
): { combinacion: number; cartas: IdCarta[] }[] {
  const r: { combinacion: number; cartas: IdCarta[] }[] = [];
  combinaciones.forEach((comb, k) => {
    if (esGrupo(comb)) {
      if (comb.length === 3 && valorConquian(comb[0]!) === valorConquian(d)) {
        r.push({ combinacion: k, cartas: [] });
      }
      return;
    }
    if (paloConquian(comb[0]!) !== paloConquian(d)) return;
    const pos = comb.map(posicionConquian);
    const p = posicionConquian(d);
    const palo = paloConquian(d);
    let mas: IdCarta[];
    if (p === Math.max(...pos) + 1) mas = seguidas(mano, palo, p + 1, 1);
    else if (p === Math.min(...pos) - 1) mas = seguidas(mano, palo, p - 1, -1);
    else return;
    for (let i = 0; i <= mas.length; i++) {
      r.push({ combinacion: k, cartas: ordenarConquian(mas.slice(0, i)) });
    }
  });
  return r;
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const JUGADORES = 2;
export const CARTAS_EN_MANO_CONQUIAN = 10;
const otro = (a: Asiento) => 1 - a;

const maximoManos = (c: ConfigConquian) => 3 * c.manosParaGanar;

const terminada = (e: Pick<EstadoConquian, 'config' | 'ganadas' | 'resultadosManos'>) =>
  e.ganadas.some((g) => g >= e.config.manosParaGanar) ||
  e.resultadosManos.length >= maximoManos(e.config);

const bajadasDe = (e: EstadoConquian) =>
  e.combinaciones.map((cs) => cs.reduce((s, c) => s + c.length, 0));

function cerrarMano(e: EstadoConquian, ganador: Asiento | null): EstadoConquian {
  const ganadas = e.ganadas.map((g, a) => (a === ganador ? g + 1 : g));
  const resultado: ResultadoManoConquian = {
    empieza: e.empieza,
    ganador,
    bajadas: bajadasDe(e),
    ganadas,
  };
  const cerrado: EstadoConquian = {
    ...e,
    descubierta: null,
    ganadas,
    resultadosManos: [...e.resultadosManos, resultado],
  };
  if (terminada(cerrado)) return cerrado;
  return nuevaMano(cerrado, otro(e.empieza), e.azar);
}

/** Descubre la siguiente del mazo para `quien`; sin mazo, la mano es tablas. */
function descubrir(e: EstadoConquian, quien: Asiento): EstadoConquian {
  if (e.mazo.length === 0) return cerrarMano(e, null);
  return {
    ...e,
    descubierta: e.mazo[0]!,
    mazo: e.mazo.slice(1),
    origen: 'mazo',
    deQuien: quien,
    ofrecidaA: quien,
    fase: 'decidir',
    turno: quien,
  };
}

function nuevaMano(
  base: Pick<EstadoConquian, 'config' | 'ganadas' | 'resultadosManos'>,
  empieza: Asiento,
  azar: EstadoAzar,
): EstadoConquian {
  const { cartas, azar: sig } = barajar(BARAJA_CONQUIAN, azar);
  const n = CARTAS_EN_MANO_CONQUIAN;
  const repartido: EstadoConquian = {
    ...base,
    azar: sig,
    empieza,
    manos: [cartas.slice(0, n), cartas.slice(n, 2 * n)],
    mazo: cartas.slice(2 * n),
    muertas: [],
    combinaciones: [[], []],
    descubierta: null,
    origen: 'mazo',
    deQuien: empieza,
    ofrecidaA: empieza,
    fase: 'decidir',
    turno: empieza,
  };
  return descubrir(repartido, empieza);
}

/** Tras bajar o añadir: si se queda sin mano gana; si no, descarta. */
function trasUsar(e: EstadoConquian, asiento: Asiento): EstadoConquian {
  if (e.manos[asiento]!.length === 0) return cerrarMano(e, asiento);
  return { ...e, descubierta: null, fase: 'descartar', turno: asiento };
}

const sinCartas = (mano: readonly IdCarta[], quitar: readonly IdCarta[]) =>
  mano.filter((c) => !quitar.includes(c));

// ── Juego ────────────────────────────────────────────────────────────────────

export const conquian: Juego<ConfigConquian, EstadoConquian, AccionConquian, VistaConquian> = {
  id: 'conquian',

  crear(config, semilla) {
    if (!Number.isInteger(config.manosParaGanar) || config.manosParaGanar < 1) {
      return error('Las manos para ganar deben ser un entero positivo');
    }
    return ok(
      nuevaMano(
        {
          config: { manosParaGanar: config.manosParaGanar },
          ganadas: [0, 0],
          resultadosManos: [],
        },
        0,
        crearAzar(semilla),
      ),
    );
  },

  asientos: () => JUGADORES,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    if (e.fase === 'descartar') {
      return [...mano].sort().map((carta) => ({ tipo: 'descartar', carta }));
    }
    const d = e.descubierta!;
    return [
      { tipo: 'pasar' },
      ...bajadasConquian(mano, d).map((cartas): AccionConquian => ({ tipo: 'bajar', cartas })),
      ...anadidosConquian(mano, d, e.combinaciones[asiento]!).map(
        ({ combinacion, cartas }): AccionConquian => ({ tipo: 'anadir', combinacion, cartas }),
      ),
    ];
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'bajar': {
        const nueva = ordenarConquian([e.descubierta!, ...accion.cartas]);
        return trasUsar(
          {
            ...e,
            manos: e.manos.map((m, a) => (a === asiento ? sinCartas(m, accion.cartas) : m)),
            combinaciones: e.combinaciones.map((cs, a) => (a === asiento ? [...cs, nueva] : cs)),
          },
          asiento,
        );
      }
      case 'anadir': {
        const anadir = (comb: readonly IdCarta[]) =>
          ordenarConquian([...comb, e.descubierta!, ...accion.cartas]);
        return trasUsar(
          {
            ...e,
            manos: e.manos.map((m, a) => (a === asiento ? sinCartas(m, accion.cartas) : m)),
            combinaciones: e.combinaciones.map((cs, a) =>
              a === asiento ? cs.map((c, k) => (k === accion.combinacion ? anadir(c) : c)) : cs,
            ),
          },
          asiento,
        );
      }
      case 'pasar': {
        // La del mazo se ofrece también al rival de quien la descubrió.
        if (e.origen === 'mazo' && e.ofrecidaA === e.deQuien) {
          const rival = otro(e.deQuien);
          return { ...e, ofrecidaA: rival, turno: rival };
        }
        return descubrir(
          { ...e, muertas: [...e.muertas, e.descubierta!], descubierta: null },
          otro(e.deQuien),
        );
      }
      case 'descartar': {
        const rival = otro(asiento);
        return {
          ...e,
          manos: e.manos.map((m, a) => (a === asiento ? sinCartas(m, [accion.carta]) : m)),
          descubierta: accion.carta,
          origen: 'descarte',
          deQuien: asiento,
          ofrecidaA: rival,
          fase: 'decidir',
          turno: rival,
        };
      }
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      enMazo: e.mazo.length,
      muertas: [...e.muertas],
      combinaciones: e.combinaciones.map((cs) => cs.map((c) => [...c])),
      descubierta: e.descubierta,
      origen: e.origen,
      deQuien: e.deQuien,
      ofrecidaA: e.ofrecidaA,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      empieza: e.empieza,
      ganadas: [...e.ganadas],
      manoNumero: e.resultadosManos.length + (terminada(e) ? 0 : 1),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const puntos = [...e.ganadas];
    if (puntos[0] === puntos[1]) return { ganadores: [], empate: true, puntos };
    return { ganadores: [puntos[0]! > puntos[1]! ? 0 : 1], empate: false, puntos };
  },
};
