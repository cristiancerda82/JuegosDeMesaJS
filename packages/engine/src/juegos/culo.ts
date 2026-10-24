import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, PALOS_ESPANOLES, type IdCarta } from '../baraja/cartas';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigCulo {
  /** De 3 a 6 jugadores, cada uno por su cuenta. */
  readonly jugadores: 3 | 4 | 5 | 6;
}

export const CONFIG_CULO_POR_DEFECTO: ConfigCulo = { jugadores: 4 };

/** Manos que dura la partida. */
export const MANOS_CULO = 5;

export type CargoCulo = 'presidente' | 'vicepresidente' | 'neutral' | 'viceculo' | 'culo';

export type FaseCulo = 'intercambio' | 'juego';

export interface JugadaCulo {
  readonly asiento: Asiento;
  readonly cartas: readonly IdCarta[];
}

/** Un intercambio entre manos: `da` entrega sus mejores cartas a `recibe`, que le devuelve otras. */
export interface IntercambioCulo {
  readonly da: Asiento;
  readonly recibe: Asiento;
  /** Las mejores cartas de `da`, que se dan solas. */
  readonly dadas: readonly IdCarta[];
  /** Las que devuelve `recibe`; `null` mientras no ha elegido. */
  readonly devueltas: readonly IdCarta[] | null;
}

export interface ResultadoManoCulo {
  /** Asientos por orden de salida: el primero es el presidente y el último el culo. */
  readonly orden: readonly Asiento[];
  /** Cargo de cada asiento en esta mano. */
  readonly cargos: readonly CargoCulo[];
  readonly puntosMano: readonly number[];
  readonly totalesTras: readonly number[];
}

export interface EstadoCulo {
  readonly config: ConfigCulo;
  readonly azar: EstadoAzar;
  /** De 1 a 5. */
  readonly numeroMano: number;
  /** Ordenadas de menor a mayor. */
  readonly manos: readonly (readonly IdCarta[])[];
  readonly fase: FaseCulo;
  readonly turno: Asiento;
  /** La jugada que hay que superar; `null` si la ronda está limpia. */
  readonly mesa: JugadaCulo | null;
  /** Quienes han pasado desde la jugada de la mesa, en orden. */
  readonly pasados: readonly Asiento[];
  /** Quienes han salido de la mano, por orden. */
  readonly salidos: readonly Asiento[];
  /** Todas las jugadas de la mano, en orden. */
  readonly jugadas: readonly JugadaCulo[];
  /** Cargos de la mano anterior; `null` en la primera. */
  readonly cargos: readonly CargoCulo[] | null;
  readonly intercambios: readonly IntercambioCulo[];
  readonly puntos: readonly number[];
  readonly ultimaAccion: {
    readonly asiento: Asiento;
    readonly tipo: AccionCulo['tipo'];
    /** Las jugadas; vacía al pasar y al devolver, porque lo devuelto no es público. */
    readonly cartas: readonly IdCarta[];
    /** La ronda quedó limpia con esta acción. */
    readonly limpia: boolean;
  } | null;
  readonly resultadosManos: readonly ResultadoManoCulo[];
}

export type AccionCulo =
  | { readonly tipo: 'jugar'; readonly cartas: readonly IdCarta[] }
  | { readonly tipo: 'pasar' }
  | { readonly tipo: 'devolver'; readonly cartas: readonly IdCarta[] };

/** Lo que todos ven de un intercambio. */
export interface IntercambioPublicoCulo {
  readonly da: Asiento;
  readonly recibe: Asiento;
  readonly cuantas: number;
  readonly hecho: boolean;
}

export interface VistaCulo {
  readonly config: ConfigCulo;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly numeroMano: number;
  readonly fase: FaseCulo;
  readonly turno: Asiento | null;
  readonly mesa: JugadaCulo | null;
  readonly pasados: readonly Asiento[];
  readonly salidos: readonly Asiento[];
  readonly jugadas: readonly JugadaCulo[];
  readonly cargos: readonly CargoCulo[] | null;
  readonly intercambios: readonly IntercambioPublicoCulo[];
  /** Los intercambios en los que ha participado este asiento, con las cartas. */
  readonly misIntercambios: readonly IntercambioCulo[];
  readonly puntos: readonly number[];
  readonly ultimaAccion: EstadoCulo['ultimaAccion'];
  readonly resultadosManos: readonly ResultadoManoCulo[];
}

// ── Reglas ───────────────────────────────────────────────────────────────────

/** Orden de los valores, de menor a mayor: 3, 4, 5, 6, 7, sota, caballo, rey, As y 2. */
export const ORDEN_CULO = [3, 4, 5, 6, 7, 10, 11, 12, 1, 2] as const;

/** Rango de una carta en el Culo: 0 el 3, 9 el 2. */
export const rangoCulo = (carta: IdCarta) =>
  ORDEN_CULO.indexOf(cartaDeId(carta)!.valor as (typeof ORDEN_CULO)[number]);

/** El 2 es la carta más alta y corta la ronda. */
export const RANGO_DOS_CULO = 9;

const paloIndice = (carta: IdCarta) =>
  PALOS_ESPANOLES.indexOf(cartaDeId(carta)!.palo as (typeof PALOS_ESPANOLES)[number]);

/** Orden de las cartas en la mano: por rango y, dentro, por palo. */
export const compararCulo = (a: IdCarta, b: IdCarta) =>
  rangoCulo(a) - rangoCulo(b) || paloIndice(a) - paloIndice(b);

const ordenar = (cartas: readonly IdCarta[]) => [...cartas].sort(compararCulo);

/** Los cargos de una mano de `n` jugadores, por puesto. */
export function cargosPorPuesto(n: number): CargoCulo[] {
  return Array.from({ length: n }, (_, p): CargoCulo => {
    if (p === 0) return 'presidente';
    if (p === n - 1) return 'culo';
    if (n >= 4 && p === 1) return 'vicepresidente';
    if (n >= 4 && p === n - 2) return 'viceculo';
    return 'neutral';
  });
}

const activos = (e: Pick<EstadoCulo, 'config' | 'salidos'>) =>
  Array.from({ length: e.config.jugadores }, (_, a) => a).filter((a) => !e.salidos.includes(a));

/** El siguiente asiento después de `a` que sigue en la mano. */
function siguienteActivo(e: Pick<EstadoCulo, 'config' | 'salidos'>, a: Asiento): Asiento {
  const n = e.config.jugadores;
  for (let k = 1; k <= n; k++) {
    const b = (a + k) % n;
    if (!e.salidos.includes(b)) return b;
  }
  throw new Error('No queda nadie en la mano');
}

/** Todas las combinaciones de `k` elementos, en el orden de `xs`. */
function combinaciones<T>(xs: readonly T[], k: number): T[][] {
  if (k === 0) return [[]];
  const out: T[][] = [];
  for (let i = 0; i <= xs.length - k; i++) {
    for (const resto of combinaciones(xs.slice(i + 1), k - 1)) out.push([xs[i]!, ...resto]);
  }
  return out;
}

/** Las cartas de la mano agrupadas por rango, de menor a mayor. */
export function gruposCulo(mano: readonly IdCarta[]): IdCarta[][] {
  const grupos = new Map<number, IdCarta[]>();
  for (const c of ordenar(mano)) {
    const r = rangoCulo(c);
    grupos.set(r, [...(grupos.get(r) ?? []), c]);
  }
  return [...grupos.entries()].sort((a, b) => a[0] - b[0]).map(([, g]) => g);
}

/** Las cartas son una jugada legal ante la mesa: mismo valor y, si hay mesa, mismo número y más alto. */
export function superaCulo(cartas: readonly IdCarta[], mesa: readonly IdCarta[] | null): boolean {
  if (cartas.length < 1 || cartas.length > 4) return false;
  const r = rangoCulo(cartas[0]!);
  if (cartas.some((c) => rangoCulo(c) !== r)) return false;
  if (mesa === null) return true;
  return cartas.length === mesa.length && r > rangoCulo(mesa[0]!);
}

const terminada = (e: Pick<EstadoCulo, 'resultadosManos'>) =>
  e.resultadosManos.length >= MANOS_CULO;

/** Asientos de mejor a peor: por puntos y, a igualdad, por el puesto en la última mano. */
export function clasificacionCulo(
  puntos: readonly number[],
  ultimaOrden: readonly Asiento[],
): Asiento[] {
  return puntos
    .map((_, a) => a)
    .sort((a, b) => puntos[b]! - puntos[a]! || ultimaOrden.indexOf(a) - ultimaOrden.indexOf(b));
}

function nuevaMano(
  config: ConfigCulo,
  azar: EstadoAzar,
  numeroMano: number,
  puntos: readonly number[],
  resultadosManos: readonly ResultadoManoCulo[],
): EstadoCulo {
  const n = config.jugadores;
  const anterior = resultadosManos.at(-1) ?? null;
  const cargos = anterior?.cargos ?? null;
  const culo = anterior ? anterior.orden.at(-1)! : null;
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('espanola40'), azar);
  // Una a una desde el asiento 0 o desde el culo: los primeros pueden tener una carta más.
  const inicio = culo ?? 0;
  const manos: IdCarta[][] = Array.from({ length: n }, () => []);
  cartas.forEach((c, i) => manos[(inicio + i) % n]!.push(c));

  const base = {
    config,
    azar: azarSiguiente,
    numeroMano,
    mesa: null,
    pasados: [],
    salidos: [],
    jugadas: [],
    cargos,
    puntos,
    ultimaAccion: null,
    resultadosManos,
  };

  if (anterior === null) {
    const tresDeOros = manos.findIndex((m) => m.includes('oros-3'));
    return {
      ...base,
      manos: manos.map(ordenar),
      fase: 'juego',
      turno: tresDeOros,
      intercambios: [],
    };
  }

  // Las mejores cartas se dan solas.
  const parejas: [Asiento, Asiento, number][] = [[anterior.orden.at(-1)!, anterior.orden[0]!, 2]];
  if (n >= 4) parejas.push([anterior.orden.at(-2)!, anterior.orden[1]!, 1]);
  const ordenadas = manos.map(ordenar);
  const intercambios: IntercambioCulo[] = parejas.map(([da, recibe, k]) => {
    const dadas = ordenadas[da]!.slice(-k);
    ordenadas[da] = ordenadas[da]!.slice(0, -k);
    ordenadas[recibe] = ordenar([...ordenadas[recibe]!, ...dadas]);
    return { da, recibe, dadas, devueltas: null };
  });
  return {
    ...base,
    manos: ordenadas,
    fase: 'intercambio',
    turno: intercambios[0]!.recibe,
    intercambios,
  };
}

/** Cierra la mano con el último que queda y reparte la siguiente, salvo que sea la última. */
function cerrarMano(e: EstadoCulo): EstadoCulo {
  const n = e.config.jugadores;
  const orden = [...e.salidos, ...activos(e)];
  const puesto = cargosPorPuesto(n);
  const cargos = new Array<CargoCulo>(n);
  const puntosMano = new Array<number>(n).fill(0);
  orden.forEach((a, p) => {
    cargos[a] = puesto[p]!;
    puntosMano[a] = n - 1 - p;
  });
  const puntos = e.puntos.map((p, a) => p + puntosMano[a]!);
  const resultadosManos = [
    ...e.resultadosManos,
    { orden, cargos, puntosMano, totalesTras: puntos },
  ];
  if (resultadosManos.length >= MANOS_CULO) {
    return { ...e, salidos: orden, puntos, resultadosManos };
  }
  return nuevaMano(e.config, e.azar, e.numeroMano + 1, puntos, resultadosManos);
}

function jugar(e: EstadoCulo, asiento: Asiento, cartas: readonly IdCarta[]): EstadoCulo {
  const mano = e.manos[asiento]!.filter((c) => !cartas.includes(c));
  const salidos = mano.length === 0 ? [...e.salidos, asiento] : e.salidos;
  const corta = rangoCulo(cartas[0]!) === RANGO_DOS_CULO;
  const tras: EstadoCulo = {
    ...e,
    manos: e.manos.map((m, a) => (a === asiento ? mano : m)),
    jugadas: [...e.jugadas, { asiento, cartas }],
    salidos,
    pasados: [],
    ultimaAccion: { asiento, tipo: 'jugar', cartas, limpia: corta },
  };
  if (activos(tras).length <= 1) return cerrarMano(tras);
  if (corta) {
    const abre = salidos.includes(asiento) ? siguienteActivo(tras, asiento) : asiento;
    return { ...tras, mesa: null, turno: abre };
  }
  return { ...tras, mesa: { asiento, cartas }, turno: siguienteActivo(tras, asiento) };
}

function pasar(e: EstadoCulo, asiento: Asiento): EstadoCulo {
  const mesa = e.mesa!;
  const pasados = [...e.pasados, asiento];
  const autorActivo = !e.salidos.includes(mesa.asiento);
  const necesarios = activos(e).length - (autorActivo ? 1 : 0);
  if (pasados.length >= necesarios) {
    return {
      ...e,
      mesa: null,
      pasados: [],
      turno: autorActivo ? mesa.asiento : siguienteActivo(e, mesa.asiento),
      ultimaAccion: { asiento, tipo: 'pasar', cartas: [], limpia: true },
    };
  }
  return {
    ...e,
    pasados,
    turno: siguienteActivo(e, asiento),
    ultimaAccion: { asiento, tipo: 'pasar', cartas: [], limpia: false },
  };
}

function devolver(e: EstadoCulo, asiento: Asiento, cartas: readonly IdCarta[]): EstadoCulo {
  const i = e.intercambios.findIndex((x) => x.devueltas === null);
  const inter = e.intercambios[i]!;
  const manos = e.manos.map((m, a) => {
    if (a === asiento) return m.filter((c) => !cartas.includes(c));
    if (a === inter.da) return ordenar([...m, ...cartas]);
    return m;
  });
  const intercambios = e.intercambios.map((x, k) => (k === i ? { ...x, devueltas: cartas } : x));
  const pendiente = intercambios.find((x) => x.devueltas === null);
  const ultimaAccion = { asiento, tipo: 'devolver' as const, cartas: [], limpia: false };
  if (pendiente) return { ...e, manos, intercambios, turno: pendiente.recibe, ultimaAccion };
  // Abre el culo de la mano anterior.
  const culo = e.resultadosManos.at(-1)!.orden.at(-1)!;
  return { ...e, manos, intercambios, fase: 'juego', turno: culo, ultimaAccion };
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const culo: Juego<ConfigCulo, EstadoCulo, AccionCulo, VistaCulo> = {
  id: 'culo',

  crear(config, semilla) {
    if (![3, 4, 5, 6].includes(config.jugadores)) {
      return error('El Culo se juega de 3 a 6 jugadores');
    }
    const limpia: ConfigCulo = { jugadores: config.jugadores };
    const n = limpia.jugadores;
    return ok(nuevaMano(limpia, crearAzar(semilla), 1, new Array<number>(n).fill(0), []));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (terminada(e) || asiento !== e.turno) return [];
    const mano = e.manos[asiento]!;
    if (e.fase === 'intercambio') {
      const inter = e.intercambios.find((x) => x.devueltas === null)!;
      return combinaciones(mano, inter.dadas.length).map((cartas) => ({
        tipo: 'devolver' as const,
        cartas,
      }));
    }
    const acciones: AccionCulo[] = [];
    for (const grupo of gruposCulo(mano)) {
      if (e.mesa !== null && rangoCulo(grupo[0]!) <= rangoCulo(e.mesa.cartas[0]!)) continue;
      const tamanos = e.mesa === null ? [1, 2, 3, 4] : [e.mesa.cartas.length];
      for (const k of tamanos) {
        for (const cartas of combinaciones(grupo, k)) acciones.push({ tipo: 'jugar', cartas });
      }
    }
    if (e.mesa !== null) acciones.push({ tipo: 'pasar' });
    return acciones;
  },

  transicion(e, asiento, accion) {
    switch (accion.tipo) {
      case 'jugar':
        return jugar(e, asiento, accion.cartas);
      case 'pasar':
        return pasar(e, asiento);
      case 'devolver':
        return devolver(e, asiento, accion.cartas);
    }
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      numeroMano: e.numeroMano,
      fase: e.fase,
      turno: terminada(e) ? null : e.turno,
      mesa: e.mesa,
      pasados: [...e.pasados],
      salidos: [...e.salidos],
      jugadas: [...e.jugadas],
      cargos: e.cargos,
      intercambios: e.intercambios.map((x) => ({
        da: x.da,
        recibe: x.recibe,
        cuantas: x.dadas.length,
        hecho: x.devueltas !== null,
      })),
      misIntercambios: e.intercambios.filter((x) => x.da === asiento || x.recibe === asiento),
      puntos: [...e.puntos],
      ultimaAccion: e.ultimaAccion,
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!terminada(e)) return null;
    const clasificacion = clasificacionCulo(e.puntos, e.resultadosManos.at(-1)!.orden);
    return { ganadores: [clasificacion[0]!], empate: false, puntos: [...e.puntos] };
  },
};
