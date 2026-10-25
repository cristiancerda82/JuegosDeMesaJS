import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type PaloFrances } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { baseSpider, type CartaSpider } from './spider';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Carta de Cuarenta ladrones: la carta de la baraja y su copia (0 o 1), p. ej. "picas-12#1". */
export type CartaLadrones = CartaSpider;

/** Sin opciones: las reglas son siempre las clásicas. */
export type ConfigCuarentaLadrones = Record<string, never>;

export const CONFIG_CUARENTA_LADRONES_POR_DEFECTO: ConfigCuarentaLadrones = {};

/** 'descarte', columnas 'c0'–'c9' y fundaciones 'f0'–'f7'. */
export type PilaLadrones = 'descarte' | `c${number}` | `f${number}`;

/** Lo necesario para revertir cada movimiento. */
export type MovimientoLadrones =
  | { readonly tipo: 'robar' }
  | {
      readonly tipo: 'mover';
      readonly desde: PilaLadrones;
      readonly hasta: PilaLadrones;
      readonly cantidad: number;
    };

export interface EstadoCuarentaLadrones {
  readonly config: ConfigCuarentaLadrones;
  /** Boca abajo; la carta superior es la última. */
  readonly mazo: readonly CartaLadrones[];
  /** Boca arriba; la carta superior (la única jugable) es la última. */
  readonly descarte: readonly CartaLadrones[];
  /** Todas boca arriba, de abajo arriba. */
  readonly columnas: readonly (readonly CartaLadrones[])[];
  readonly fundaciones: readonly (readonly CartaLadrones[])[];
  readonly movimientos: number;
  readonly historial: readonly MovimientoLadrones[];
  readonly abandonada: boolean;
}

export type AccionCuarentaLadrones =
  | { readonly tipo: 'robar' }
  | {
      readonly tipo: 'mover';
      readonly desde: PilaLadrones;
      readonly hasta: PilaLadrones;
      readonly cantidad: number;
    }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'autocompletar' }
  | { readonly tipo: 'abandonar' };

export interface VistaCuarentaLadrones {
  readonly config: ConfigCuarentaLadrones;
  readonly mazo: number;
  readonly descarte: readonly CartaLadrones[];
  readonly columnas: readonly (readonly CartaLadrones[])[];
  readonly fundaciones: readonly (readonly CartaLadrones[])[];
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas de apilado ────────────────────────────────────────────────────────

export const COLUMNAS_LADRONES = 10;
export const FUNDACIONES_LADRONES = 8;
const CARTAS_POR_COLUMNA = 4;
export const TOTAL_CARTAS_LADRONES = 104;

const valor = (c: CartaLadrones) => cartaDeId(baseSpider(c))!.valor;
const palo = (c: CartaLadrones) => cartaDeId(baseSpider(c))!.palo as PaloFrances;

const columna = (i: number): PilaLadrones => `c${i}`;
const fundacion = (i: number): PilaLadrones => `f${i}`;

/** `carta` puede ir sobre `tope` en una columna: un valor menos y del mismo palo. */
export function encajaLadrones(carta: CartaLadrones, tope: CartaLadrones): boolean {
  return valor(carta) + 1 === valor(tope) && palo(carta) === palo(tope);
}

function puedeIrAColumna(carta: CartaLadrones, destino: readonly CartaLadrones[]): boolean {
  const tope = destino.at(-1);
  return tope === undefined || encajaLadrones(carta, tope);
}

export function puedeIrAFundacionLadrones(
  carta: CartaLadrones,
  destino: readonly CartaLadrones[],
): boolean {
  const tope = destino.at(-1);
  if (tope === undefined) return valor(carta) === 1;
  return palo(carta) === palo(tope) && valor(carta) === valor(tope) + 1;
}

/** Las cartas desde `inicio` hasta el final bajan de a uno y son del mismo palo. */
function esTramo(cartas: readonly CartaLadrones[], inicio: number): boolean {
  for (let i = inicio + 1; i < cartas.length; i++) {
    if (!encajaLadrones(cartas[i]!, cartas[i - 1]!)) return false;
  }
  return true;
}

/** Cartas que caben en un tramo moviéndolas una a una por los huecos que no son el destino. */
export const capacidadLadrones = (huecos: number) => 2 ** huecos;

// ── Estado mutable de trabajo (solo dentro de una transición) ────────────────

interface Mesa {
  config: ConfigCuarentaLadrones;
  mazo: CartaLadrones[];
  descarte: CartaLadrones[];
  columnas: CartaLadrones[][];
  fundaciones: CartaLadrones[][];
  movimientos: number;
  historial: MovimientoLadrones[];
  abandonada: boolean;
}

function copiar(e: EstadoCuarentaLadrones): Mesa {
  return {
    ...e,
    mazo: [...e.mazo],
    descarte: [...e.descarte],
    columnas: e.columnas.map((c) => [...c]),
    fundaciones: e.fundaciones.map((f) => [...f]),
    historial: [...e.historial],
  };
}

function cartasDe(m: Mesa, pila: PilaLadrones): CartaLadrones[] {
  if (pila === 'descarte') return m.descarte;
  const i = Number(pila.slice(1));
  return pila[0] === 'c' ? m.columnas[i]! : m.fundaciones[i]!;
}

function moverCartas(m: Mesa, desde: PilaLadrones, hasta: PilaLadrones, cantidad: number): void {
  const origen = cartasDe(m, desde);
  cartasDe(m, hasta).push(...origen.splice(origen.length - cantidad));
}

function deshacer(m: Mesa): void {
  const ultimo = m.historial.pop()!;
  if (ultimo.tipo === 'robar') m.mazo.push(m.descarte.pop()!);
  else moverCartas(m, ultimo.hasta, ultimo.desde, ultimo.cantidad);
}

/** Sube a las fundaciones cualquier carta de arriba de una columna que encaje, mientras haya. */
function subirTodo(m: Mesa): boolean {
  for (let cambio = true; cambio;) {
    cambio = false;
    for (const c of m.columnas) {
      const tope = c.at(-1);
      if (tope === undefined) continue;
      const f = m.fundaciones.findIndex((x) => puedeIrAFundacionLadrones(tope, x));
      if (f < 0) continue;
      m.fundaciones[f]!.push(c.pop()!);
      m.movimientos++;
      cambio = true;
    }
  }
  return m.fundaciones.every((f) => f.length === 13);
}

function puedeAutocompletar(e: EstadoCuarentaLadrones): boolean {
  if (e.mazo.length > 0 || e.descarte.length > 0) return false;
  if (e.columnas.every((c) => c.length === 0)) return false;
  return subirTodo(copiar(e));
}

const ganada = (e: EstadoCuarentaLadrones) => e.fundaciones.every((f) => f.length === 13);

/** Las 104 cartas: dos copias de la baraja francesa. */
function dosBarajas(): CartaLadrones[] {
  const baraja = crearBaraja('francesa52');
  return [0, 1].flatMap((copia) => baraja.map((c): CartaLadrones => `${c}#${copia}`));
}

// ── Juego ────────────────────────────────────────────────────────────────────

export const cuarentaLadrones: Juego<
  ConfigCuarentaLadrones,
  EstadoCuarentaLadrones,
  AccionCuarentaLadrones,
  VistaCuarentaLadrones
> = {
  id: 'cuarentaLadrones',

  crear(config, semilla) {
    if (typeof config !== 'object' || config === null) return error('Configuración no válida');
    const { cartas } = barajar(dosBarajas(), crearAzar(semilla));
    const enColumnas = COLUMNAS_LADRONES * CARTAS_POR_COLUMNA;
    const columnas = Array.from({ length: COLUMNAS_LADRONES }, (_, i) =>
      cartas.slice(i * CARTAS_POR_COLUMNA, (i + 1) * CARTAS_POR_COLUMNA),
    );
    return ok({
      config: {},
      mazo: cartas.slice(enColumnas),
      descarte: [],
      columnas,
      fundaciones: Array.from({ length: FUNDACIONES_LADRONES }, () => []),
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || cuarentaLadrones.resultado(e) !== null) return [];
    const acciones: AccionCuarentaLadrones[] = [];
    const mover = (desde: PilaLadrones, hasta: PilaLadrones, cantidad: number) =>
      acciones.push({ tipo: 'mover', desde, hasta, cantidad });
    const huecos = e.columnas.filter((c) => c.length === 0).length;
    // A una columna vacía se lista solo la primera: todas son iguales.
    const primerHueco = e.columnas.findIndex((c) => c.length === 0);
    const destinoValido = (j: number) => e.columnas[j]!.length > 0 || j === primerHueco;

    if (e.mazo.length > 0) acciones.push({ tipo: 'robar' });

    // La carta de arriba del descarte, a columnas y fundaciones.
    const arriba = e.descarte.at(-1);
    if (arriba !== undefined) {
      e.columnas.forEach(
        (c, j) =>
          destinoValido(j) && puedeIrAColumna(arriba, c) && mover('descarte', columna(j), 1),
      );
      const f = e.fundaciones.findIndex((x) => puedeIrAFundacionLadrones(arriba, x));
      if (f >= 0) mover('descarte', fundacion(f), 1);
    }

    e.columnas.forEach((c, i) => {
      c.forEach((carta, k) => {
        if (!esTramo(c, k)) return;
        const cantidad = c.length - k;
        e.columnas.forEach((d, j) => {
          if (j === i || !destinoValido(j) || !puedeIrAColumna(carta, d)) return;
          // Pasar una columna entera a un hueco no cambia nada.
          if (d.length === 0 && k === 0) return;
          const libres = huecos - (d.length === 0 ? 1 : 0);
          if (cantidad > capacidadLadrones(libres)) return;
          mover(columna(i), columna(j), cantidad);
        });
        if (cantidad === 1) {
          const f = e.fundaciones.findIndex((x) => puedeIrAFundacionLadrones(carta, x));
          if (f >= 0) mover(columna(i), fundacion(f), 1);
        }
      });
    });

    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    if (puedeAutocompletar(e)) acciones.push({ tipo: 'autocompletar' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    const m = copiar(e);
    switch (accion.tipo) {
      case 'robar':
        m.descarte.push(m.mazo.pop()!);
        m.historial.push({ tipo: 'robar' });
        m.movimientos++;
        break;
      case 'mover':
        moverCartas(m, accion.desde, accion.hasta, accion.cantidad);
        m.historial.push(accion);
        m.movimientos++;
        break;
      case 'deshacer':
        // Deshacer cuenta como un movimiento más: el contador nunca baja.
        deshacer(m);
        m.movimientos++;
        break;
      case 'autocompletar':
        subirTodo(m);
        break;
      case 'abandonar':
        m.abandonada = true;
        break;
    }
    return m;
  },

  vistaDe(e) {
    const situacion = e.abandonada ? 'abandono' : ganada(e) ? 'victoria' : 'jugando';
    return {
      config: e.config,
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      columnas: e.columnas.map((c) => [...c]),
      fundaciones: e.fundaciones.map((f) => [...f]),
      movimientos: e.movimientos,
      situacion,
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false };
    if (ganada(e)) return { ganadores: [0], empate: false };
    return null;
  },
};
