import { crearAzar, type EstadoAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Asiento, Fin, Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigCasino {
  readonly jugadores: 2 | 3 | 4;
  /** Con 4 jugadores, 0 y 2 contra 1 y 3. */
  readonly parejas: boolean;
}

export const CONFIG_CASINO_POR_DEFECTO: ConfigCasino = { jugadores: 2, parejas: false };

/** Puntos con los que se gana la partida. */
export const OBJETIVO_CASINO = 21;
export const BIG_CASINO: IdCarta = 'diamantes-10';
export const LITTLE_CASINO: IdCarta = 'picas-2';

export interface ConstruccionCasino {
  readonly tipo: 'construccion';
  readonly id: number;
  readonly valor: number;
  /** Cartas del montón, en el orden en que llegaron. */
  readonly cartas: readonly IdCarta[];
  readonly duenio: Asiento;
  readonly multiple: boolean;
}

export type ElementoMesaCasino =
  { readonly tipo: 'carta'; readonly carta: IdCarta } | ConstruccionCasino;

export type AccionCasino =
  | { readonly tipo: 'recoger'; readonly carta: IdCarta }
  | {
      readonly tipo: 'construir';
      readonly carta: IdCarta;
      /** Cartas sueltas de la mesa que se juntan, en el orden de la mesa. */
      readonly cartas: readonly IdCarta[];
      /** Construcción que se sube o se hace múltiple; `null` para una nueva. */
      readonly construccion: number | null;
      /** Valor de la construcción que resulta. */
      readonly valor: number;
    }
  | { readonly tipo: 'dejar'; readonly carta: IdCarta };

export interface AccionCasinoHecha {
  readonly asiento: Asiento;
  readonly accion: AccionCasino;
  /** Cartas de la mesa que se llevó al recoger (sin la jugada). */
  readonly recogidas: readonly IdCarta[];
  readonly barrida: boolean;
}

/** Lo que reunió un jugador o pareja en la mano. */
export interface RecuentoCasino {
  readonly cartas: number;
  readonly picas: number;
  readonly bigCasino: boolean;
  readonly littleCasino: boolean;
  readonly ases: number;
  readonly barridas: number;
}

export interface PuntosCasino {
  readonly cartas: number;
  readonly picas: number;
  readonly bigCasino: number;
  readonly littleCasino: number;
  readonly ases: number;
  readonly barridas: number;
  readonly total: number;
}

export interface ResultadoManoCasino {
  /** Por jugador, o por pareja en parejas. */
  readonly recuento: readonly RecuentoCasino[];
  readonly puntos: readonly PuntosCasino[];
  /** Totales de la partida tras la mano. */
  readonly totales: readonly number[];
}

export interface EstadoCasino {
  readonly config: ConfigCasino;
  readonly azar: EstadoAzar;
  readonly repartidor: Asiento;
  readonly mazo: readonly IdCarta[];
  readonly mesa: readonly ElementoMesaCasino[];
  readonly manos: readonly (readonly IdCarta[])[];
  readonly turno: Asiento;
  readonly siguienteId: number;
  /** Cartas recogidas por cada jugador o pareja en la mano en curso. */
  readonly recogidas: readonly (readonly IdCarta[])[];
  readonly barridas: readonly number[];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaAccion: AccionCasinoHecha | null;
  readonly resultadosManos: readonly ResultadoManoCasino[];
}

export interface VistaCasino {
  readonly config: ConfigCasino;
  readonly asiento: Asiento | null;
  readonly miMano: readonly IdCarta[] | null;
  readonly cartasEnMano: readonly number[];
  readonly mazo: number;
  readonly mesa: readonly ElementoMesaCasino[];
  readonly turno: Asiento | null;
  readonly repartidor: Asiento;
  readonly recogidas: readonly (readonly IdCarta[])[];
  readonly barridas: readonly number[];
  readonly ultimoEnRecoger: Asiento | null;
  readonly ultimaAccion: AccionCasinoHecha | null;
  /** Puntos de la partida por jugador o pareja. */
  readonly puntos: readonly number[];
  readonly resultadosManos: readonly ResultadoManoCasino[];
}

// ── Valores ──────────────────────────────────────────────────────────────────

const CARTAS_POR_REPARTO = 4;
const CARTAS_EN_MESA = 4;
const VALOR_MAXIMO = 10;
/** Con tantas cartas sueltas o más, las construcciones nuevas usan como mucho 4. */
const SUELTAS_MUCHAS = 8;
const CARTAS_CONSTRUCCION_MAX = 4;

/** Valor de suma: el As 1 y del 2 al 10 su número; las figuras, `null`. */
export function valorCasino(id: IdCarta): number | null {
  const valor = cartaDeId(id)!.valor;
  return valor <= VALOR_MAXIMO ? valor : null;
}

const rangoDe = (id: IdCarta) => cartaDeId(id)!.valor;
const esPica = (id: IdCarta) => id.startsWith('picas-');
const esAs = (id: IdCarta) => rangoDe(id) === 1;

export const numBandosCasino = (config: ConfigCasino) => (config.parejas ? 2 : config.jugadores);
export const bandoCasino = (config: ConfigCasino, asiento: Asiento) =>
  config.parejas ? asiento % 2 : asiento;

export const cartasDeElemento = (el: ElementoMesaCasino): readonly IdCarta[] =>
  el.tipo === 'carta' ? [el.carta] : el.cartas;

const sueltas = (mesa: readonly ElementoMesaCasino[]) =>
  mesa.flatMap((el) => (el.tipo === 'carta' ? [el.carta] : []));

/** Subconjuntos de `cartas` (en su orden) cuya suma cumple `vale`, sin pasar de `maximo`. */
function subconjuntos(
  cartas: readonly IdCarta[],
  maximo: number,
  tamanoMaximo: number,
  vale: (suma: number) => boolean,
): IdCarta[][] {
  const resultado: IdCarta[][] = [];
  const elegidas: IdCarta[] = [];
  const buscar = (desde: number, suma: number) => {
    if (elegidas.length > 0 && vale(suma)) resultado.push([...elegidas]);
    if (elegidas.length === tamanoMaximo) return;
    for (let i = desde; i < cartas.length; i++) {
      const v = valorCasino(cartas[i]!);
      if (v === null || suma + v > maximo) continue;
      elegidas.push(cartas[i]!);
      buscar(i + 1, suma + v);
      elegidas.pop();
    }
  };
  buscar(0, 0);
  return resultado;
}

/**
 * Las combinaciones disjuntas de `cartas` que suman `objetivo` con más cartas en total
 * (una carta igual al objetivo es una combinación de una). Fuerza bruta con memoria.
 */
function mejorCobertura(cartas: readonly IdCarta[], objetivo: number): IdCarta[] {
  const utiles = cartas.filter((c) => (valorCasino(c) ?? Infinity) <= objetivo);
  const memo = new Map<string, number[]>();
  const valores = utiles.map((c) => valorCasino(c)!);
  // Índices de las mejores combinaciones a partir de `i` sin tocar los usados.
  const mejor = (i: number, usados: number): number[] => {
    while (i < utiles.length && usados & (1 << i)) i++;
    if (i >= utiles.length) return [];
    const clave = `${i},${usados}`;
    const guardado = memo.get(clave);
    if (guardado) return guardado;
    let resultado = mejor(i + 1, usados);
    // Combinaciones que contienen la carta `i`.
    const elegidas = [i];
    const buscar = (desde: number, resto: number, mascara: number) => {
      if (resto === 0) {
        const opcion = [...elegidas, ...mejor(i + 1, mascara)];
        if (opcion.length > resultado.length) resultado = opcion;
        return;
      }
      for (let j = desde; j < utiles.length; j++) {
        if (mascara & (1 << j) || valores[j]! > resto) continue;
        elegidas.push(j);
        buscar(j + 1, resto - valores[j]!, mascara | (1 << j));
        elegidas.pop();
      }
    };
    buscar(i + 1, objetivo - valores[i]!, usados | (1 << i));
    memo.set(clave, resultado);
    return resultado;
  };
  const indices = new Set(mejor(0, 0));
  return utiles.filter((_, i) => indices.has(i));
}

export interface RecogidaCasino {
  /** Cartas sueltas que se lleva. */
  readonly sueltas: readonly IdCarta[];
  /** Construcciones que se lleva. */
  readonly construcciones: readonly number[];
}

/** Lo que se lleva la carta `carta` de la mesa; `null` si no recoge nada. */
export function recogidaCasino(
  mesa: readonly ElementoMesaCasino[],
  carta: IdCarta,
): RecogidaCasino | null {
  const valor = valorCasino(carta);
  const libres = sueltas(mesa);
  let tomadas: IdCarta[];
  let construcciones: number[] = [];
  if (valor === null) {
    tomadas = libres.filter((c) => rangoDe(c) === rangoDe(carta));
  } else {
    construcciones = mesa.flatMap((el) =>
      el.tipo === 'construccion' && el.valor === valor ? [el.id] : [],
    );
    tomadas = mejorCobertura(libres, valor);
  }
  if (tomadas.length === 0 && construcciones.length === 0) return null;
  return { sueltas: tomadas, construcciones };
}

/** Cartas de la mesa que se lleva una recogida (sueltas y de construcciones). */
export function cartasRecogidas(
  mesa: readonly ElementoMesaCasino[],
  recogida: RecogidaCasino,
): IdCarta[] {
  return mesa.flatMap((el) =>
    el.tipo === 'carta'
      ? recogida.sueltas.includes(el.carta)
        ? [el.carta]
        : []
      : recogida.construcciones.includes(el.id)
        ? [...el.cartas]
        : [],
  );
}

/** Las construcciones que puede hacer la carta `carta` con la mano `mano`. */
function construcciones(
  mesa: readonly ElementoMesaCasino[],
  mano: readonly IdCarta[],
  carta: IdCarta,
): AccionCasino[] {
  const v = valorCasino(carta);
  if (v === null) return [];
  const resto = mano.filter((c) => c !== carta);
  const tiene = (valor: number) => resto.some((c) => valorCasino(c) === valor);
  const libres = sueltas(mesa);
  const tamano = libres.length >= SUELTAS_MUCHAS ? CARTAS_CONSTRUCCION_MAX : libres.length;
  const acciones: AccionCasino[] = [];
  // Nueva: la carta con cartas sueltas.
  for (const cartas of subconjuntos(libres, VALOR_MAXIMO - v, tamano, () => true)) {
    const valor = v + cartas.reduce((s, c) => s + valorCasino(c)!, 0);
    if (tiene(valor))
      acciones.push({ tipo: 'construir', carta, cartas, construccion: null, valor });
  }
  for (const el of mesa) {
    if (el.tipo !== 'construccion') continue;
    // Subir.
    const subida = el.valor + v;
    if (!el.multiple && subida <= VALOR_MAXIMO && tiene(subida)) {
      acciones.push({ tipo: 'construir', carta, cartas: [], construccion: el.id, valor: subida });
    }
    // Hacer múltiple: la carta sola, o con sueltas que sumen lo mismo.
    if (!tiene(el.valor) || v > el.valor) continue;
    if (v === el.valor) {
      acciones.push({ tipo: 'construir', carta, cartas: [], construccion: el.id, valor: el.valor });
    } else {
      for (const cartas of subconjuntos(libres, el.valor - v, tamano, (s) => s === el.valor - v)) {
        acciones.push({ tipo: 'construir', carta, cartas, construccion: el.id, valor: el.valor });
      }
    }
  }
  return acciones;
}

// ── Puntos ───────────────────────────────────────────────────────────────────

export function recuentoCasino(recogidas: readonly IdCarta[], barridas: number): RecuentoCasino {
  return {
    cartas: recogidas.length,
    picas: recogidas.filter(esPica).length,
    bigCasino: recogidas.includes(BIG_CASINO),
    littleCasino: recogidas.includes(LITTLE_CASINO),
    ases: recogidas.filter(esAs).length,
    barridas,
  };
}

/** Puntos de una mano a partir de lo que recogió cada jugador o pareja. */
export function puntuarManoCasino(
  recogidas: readonly (readonly IdCarta[])[],
  barridas: readonly number[],
  totalesAntes: readonly number[],
): ResultadoManoCasino {
  const recuento = recogidas.map((r, b) => recuentoCasino(r, barridas[b]!));
  /** Los puntos para quien tenga más, sin empate. */
  const mas = (b: number, campo: 'cartas' | 'picas', puntos: number) =>
    recuento.every((r, o) => o === b || recuento[b]![campo] > r[campo]) ? puntos : 0;
  const puntos = recuento.map((r, b) => {
    const p = {
      cartas: mas(b, 'cartas', 3),
      picas: mas(b, 'picas', 1),
      bigCasino: r.bigCasino ? 2 : 0,
      littleCasino: r.littleCasino ? 1 : 0,
      ases: r.ases,
      barridas: r.barridas,
    };
    return {
      ...p,
      total: p.cartas + p.picas + p.bigCasino + p.littleCasino + p.ases + p.barridas,
    };
  });
  return { recuento, puntos, totales: totalesAntes.map((t, b) => t + puntos[b]!.total) };
}

// ── Reglas ───────────────────────────────────────────────────────────────────

const siguiente = (a: Asiento, n: number) => (a + 1) % n;

function totalesDe(e: Pick<EstadoCasino, 'config' | 'resultadosManos'>): readonly number[] {
  return e.resultadosManos.at(-1)?.totales ?? new Array<number>(numBandosCasino(e.config)).fill(0);
}

function partidaTerminada(e: Pick<EstadoCasino, 'config' | 'resultadosManos'>): boolean {
  const totales = totalesDe(e);
  const max = Math.max(...totales);
  return max >= OBJETIVO_CASINO && totales.filter((t) => t === max).length === 1;
}

/** Reparte 4 cartas a cada uno empezando por `desde`. */
function repartirCuatro(
  mazo: readonly IdCarta[],
  jugadores: number,
  desde: Asiento,
): { manos: IdCarta[][]; mazo: IdCarta[] } {
  const r = repartir(mazo, new Array<number>(jugadores).fill(CARTAS_POR_REPARTO));
  if (!r.ok) throw new Error(r.error);
  const manos = Array.from(
    { length: jugadores },
    (_, asiento) => r.valor.manos[(asiento - desde + jugadores) % jugadores]!,
  );
  return { manos, mazo: r.valor.mazo };
}

function nuevaMano(
  config: ConfigCasino,
  azar: EstadoAzar,
  repartidor: Asiento,
  resultadosManos: readonly ResultadoManoCasino[],
): EstadoCasino {
  const { cartas, azar: azarSiguiente } = barajar(crearBaraja('francesa52'), azar);
  const n = config.jugadores;
  const sale = siguiente(repartidor, n);
  const reparto = repartirCuatro(cartas, n, sale);
  const bandos = numBandosCasino(config);
  return {
    config,
    azar: azarSiguiente,
    repartidor,
    mazo: reparto.mazo.slice(CARTAS_EN_MESA),
    mesa: reparto.mazo.slice(0, CARTAS_EN_MESA).map((carta) => ({ tipo: 'carta', carta })),
    manos: reparto.manos,
    turno: sale,
    siguienteId: 1,
    recogidas: Array.from({ length: bandos }, () => []),
    barridas: new Array<number>(bandos).fill(0),
    ultimoEnRecoger: null,
    ultimaAccion: null,
    resultadosManos,
  };
}

/** La mesa va al último que recogió; se puntúa y se reparte otra mano o termina. */
function cerrarMano(e: EstadoCasino): EstadoCasino {
  const recogidas = e.recogidas.map((r) => [...r]);
  if (e.ultimoEnRecoger !== null) {
    recogidas[bandoCasino(e.config, e.ultimoEnRecoger)]!.push(...e.mesa.flatMap(cartasDeElemento));
  }
  const resultadosManos = [
    ...e.resultadosManos,
    puntuarManoCasino(recogidas, e.barridas, totalesDe(e)),
  ];
  const cerrado: EstadoCasino = {
    ...e,
    mesa: e.ultimoEnRecoger === null ? e.mesa : [],
    recogidas,
    resultadosManos,
  };
  if (partidaTerminada(cerrado)) return cerrado;
  return nuevaMano(e.config, e.azar, siguiente(e.repartidor, e.config.jugadores), resultadosManos);
}

/** Todas las jugadas de una carta de la mano: recoger, construir y dejar. */
export function jugadasCasino(
  e: Pick<EstadoCasino, 'mesa' | 'manos'>,
  asiento: Asiento,
): AccionCasino[] {
  const mano = e.manos[asiento]!;
  const acciones: AccionCasino[] = [];
  const dejar: AccionCasino[] = [];
  for (const carta of mano) {
    if (recogidaCasino(e.mesa, carta)) acciones.push({ tipo: 'recoger', carta });
    acciones.push(...construcciones(e.mesa, mano, carta));
    dejar.push({ tipo: 'dejar', carta });
  }
  // Con una construcción propia en la mesa no se deja carta, salvo que no quede otra jugada.
  const tieneConstruccion = e.mesa.some(
    (el) => el.tipo === 'construccion' && el.duenio === asiento,
  );
  return tieneConstruccion && acciones.length > 0 ? acciones : [...acciones, ...dejar];
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const casino: Juego<ConfigCasino, EstadoCasino, AccionCasino, VistaCasino> = {
  id: 'casino',

  crear(config, semilla) {
    if (![2, 3, 4].includes(config.jugadores)) {
      return error('El Casino se juega de 2 a 4 jugadores');
    }
    if (typeof config.parejas !== 'boolean' || (config.parejas && config.jugadores !== 4)) {
      return error('Solo se juega en parejas con 4 jugadores');
    }
    const limpia: ConfigCasino = { jugadores: config.jugadores, parejas: config.parejas };
    // Empieza repartiendo el último asiento, así sale el asiento 0.
    return ok(nuevaMano(limpia, crearAzar(semilla), limpia.jugadores - 1, []));
  },

  asientos: (e) => e.config.jugadores,

  accionesLegales(e, asiento) {
    if (partidaTerminada(e) || asiento !== e.turno) return [];
    return jugadasCasino(e, asiento);
  },

  transicion(e, asiento, accion) {
    const n = e.config.jugadores;
    let manos = e.manos.map((m, a) => (a === asiento ? m.filter((c) => c !== accion.carta) : m));
    let mazo = e.mazo;
    let mesa: ElementoMesaCasino[];
    let siguienteId = e.siguienteId;
    let tomadas: IdCarta[] = [];
    let barrida = false;
    const recogidas = e.recogidas.map((r) => [...r]);
    const barridas = [...e.barridas];
    const bando = bandoCasino(e.config, asiento);

    if (accion.tipo === 'recoger') {
      const recogida = recogidaCasino(e.mesa, accion.carta)!;
      tomadas = cartasRecogidas(e.mesa, recogida);
      mesa = e.mesa.filter((el) =>
        el.tipo === 'carta'
          ? !recogida.sueltas.includes(el.carta)
          : !recogida.construcciones.includes(el.id),
      );
      recogidas[bando]!.push(accion.carta, ...tomadas);
      const ultimaJugada = mazo.length === 0 && manos.every((m) => m.length === 0);
      barrida = mesa.length === 0 && !ultimaJugada;
      if (barrida) barridas[bando]!++;
    } else if (accion.tipo === 'construir') {
      const base =
        accion.construccion === null
          ? null
          : (e.mesa.find(
              (el) => el.tipo === 'construccion' && el.id === accion.construccion,
            ) as ConstruccionCasino);
      const nueva: ConstruccionCasino = {
        tipo: 'construccion',
        id: base?.id ?? siguienteId++,
        valor: accion.valor,
        cartas: [...(base?.cartas ?? []), ...accion.cartas, accion.carta],
        duenio: asiento,
        multiple: base !== null && (base.multiple || base.valor === accion.valor),
      };
      mesa = e.mesa.flatMap((el): ElementoMesaCasino[] =>
        el.tipo === 'carta'
          ? accion.cartas.includes(el.carta)
            ? []
            : [el]
          : el.id === base?.id
            ? [nueva]
            : [el],
      );
      if (base === null) mesa.push(nueva);
    } else {
      mesa = [...e.mesa, { tipo: 'carta', carta: accion.carta }];
    }

    const turno = siguiente(asiento, n);
    if (manos.every((m) => m.length === 0) && mazo.length > 0) {
      // Todos sin cartas: otras 4 a cada uno, empezando por el que juega ahora.
      ({ manos, mazo } = repartirCuatro(mazo, n, turno));
    }

    const jugado: EstadoCasino = {
      ...e,
      manos,
      mazo,
      mesa,
      turno,
      siguienteId,
      recogidas,
      barridas,
      ultimoEnRecoger: accion.tipo === 'recoger' ? asiento : e.ultimoEnRecoger,
      ultimaAccion: { asiento, accion, recogidas: tomadas, barrida },
    };
    return manos.every((m) => m.length === 0) ? cerrarMano(jugado) : jugado;
  },

  vistaDe(e, asiento) {
    return {
      config: e.config,
      asiento,
      miMano: asiento === null ? null : [...e.manos[asiento]!],
      cartasEnMano: e.manos.map((m) => m.length),
      mazo: e.mazo.length,
      mesa: [...e.mesa],
      turno: partidaTerminada(e) ? null : e.turno,
      repartidor: e.repartidor,
      recogidas: e.recogidas.map((r) => [...r]),
      barridas: [...e.barridas],
      ultimoEnRecoger: e.ultimoEnRecoger,
      ultimaAccion: e.ultimaAccion,
      puntos: totalesDe(e),
      resultadosManos: [...e.resultadosManos],
    };
  },

  resultado(e): Fin | null {
    if (!partidaTerminada(e)) return null;
    const totales = totalesDe(e);
    const max = Math.max(...totales);
    const asientos = Array.from({ length: e.config.jugadores }, (_, a) => a);
    return {
      ganadores: asientos.filter((a) => totales[bandoCasino(e.config, a)] === max),
      empate: false,
      puntos: asientos.map((a) => totales[bandoCasino(e.config, a)]!),
    };
  },
};
