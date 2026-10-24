import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, colorDe, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigCanfield {
  /** Cartas que pasan del mazo al descarte en cada robo. */
  readonly robo: 1 | 3;
}

export const CONFIG_CANFIELD_POR_DEFECTO: ConfigCanfield = { robo: 3 };

/** 'descarte', 'reserva', columnas 'c0'–'c3' y fundaciones 'f0'–'f3'. */
export type PilaCanfield = 'descarte' | 'reserva' | `c${number}` | `f${number}`;

/** Lo necesario para revertir cada movimiento. */
export type MovimientoCanfield =
  | { readonly tipo: 'robar'; readonly cantidad: number }
  | { readonly tipo: 'reciclar' }
  | {
      readonly tipo: 'mover';
      readonly desde: PilaCanfield;
      readonly hasta: PilaCanfield;
      readonly cantidad: number;
      /** Columna que se llenó con la carta de la reserva en este movimiento. */
      readonly relleno: number | null;
    };

export interface EstadoCanfield {
  readonly config: ConfigCanfield;
  /** Número con el que empiezan las cuatro fundaciones. */
  readonly base: number;
  /** De abajo arriba; solo la última está boca arriba. */
  readonly reserva: readonly IdCarta[];
  /** Boca abajo; la carta superior es la última. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la carta superior (la única jugable) es la última. */
  readonly descarte: readonly IdCarta[];
  /** Todas boca arriba, de abajo arriba. */
  readonly columnas: readonly (readonly IdCarta[])[];
  readonly fundaciones: readonly (readonly IdCarta[])[];
  readonly movimientos: number;
  readonly historial: readonly MovimientoCanfield[];
  readonly abandonada: boolean;
}

export type AccionCanfield =
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'reciclar' }
  | {
      readonly tipo: 'mover';
      readonly desde: PilaCanfield;
      readonly hasta: PilaCanfield;
      readonly cantidad: number;
    }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'autocompletar' }
  | { readonly tipo: 'abandonar' };

export interface VistaCanfield {
  readonly config: ConfigCanfield;
  readonly base: number;
  readonly reservaArriba: IdCarta | null;
  readonly reserva: number;
  readonly mazo: number;
  readonly descarte: readonly IdCarta[];
  readonly columnas: readonly (readonly IdCarta[])[];
  readonly fundaciones: readonly (readonly IdCarta[])[];
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas de apilado ────────────────────────────────────────────────────────

const COLUMNAS = 4;
const FUNDACIONES = 4;
const RESERVA = 13;

const valor = (id: IdCarta) => cartaDeId(id)!.valor;
const palo = (id: IdCarta) => cartaDeId(id)!.palo as PaloFrances;
const color = (id: IdCarta) => colorDe(palo(id));

/** El valor siguiente, con vuelta: después de la K va el As. */
export const siguienteValorCanfield = (v: number) => (v === 13 ? 1 : v + 1);

const columna = (i: number): PilaCanfield => `c${i}`;
const fundacion = (i: number): PilaCanfield => `f${i}`;

/** `carta` puede ir sobre `tope` en una columna: un valor menos (con vuelta) y otro color. */
export function encajaCanfield(carta: IdCarta, tope: IdCarta): boolean {
  return siguienteValorCanfield(valor(carta)) === valor(tope) && color(carta) !== color(tope);
}

function puedeIrAColumna(carta: IdCarta, destino: readonly IdCarta[]): boolean {
  const tope = destino.at(-1);
  return tope === undefined || encajaCanfield(carta, tope);
}

export function puedeIrAFundacionCanfield(
  carta: IdCarta,
  destino: readonly IdCarta[],
  base: number,
): boolean {
  const tope = destino.at(-1);
  if (tope === undefined) return valor(carta) === base;
  if (destino.length === 13) return false;
  return palo(carta) === palo(tope) && valor(carta) === siguienteValorCanfield(valor(tope));
}

/** Las cartas desde `inicio` hasta el final bajan de a uno (con vuelta) y alternan color. */
function esTramo(cartas: readonly IdCarta[], inicio: number): boolean {
  for (let i = inicio + 1; i < cartas.length; i++) {
    if (!encajaCanfield(cartas[i]!, cartas[i - 1]!)) return false;
  }
  return true;
}

// ── Estado mutable de trabajo (solo dentro de una transición) ────────────────

interface Mesa {
  config: ConfigCanfield;
  base: number;
  reserva: IdCarta[];
  mazo: IdCarta[];
  descarte: IdCarta[];
  columnas: IdCarta[][];
  fundaciones: IdCarta[][];
  movimientos: number;
  historial: MovimientoCanfield[];
  abandonada: boolean;
}

function copiar(e: EstadoCanfield): Mesa {
  return {
    ...e,
    reserva: [...e.reserva],
    mazo: [...e.mazo],
    descarte: [...e.descarte],
    columnas: e.columnas.map((c) => [...c]),
    fundaciones: e.fundaciones.map((f) => [...f]),
    historial: [...e.historial],
  };
}

function cartasDe(m: Mesa, pila: PilaCanfield): IdCarta[] {
  if (pila === 'descarte') return m.descarte;
  if (pila === 'reserva') return m.reserva;
  const i = Number(pila.slice(1));
  return pila[0] === 'c' ? m.columnas[i]! : m.fundaciones[i]!;
}

/** Mueve cartas y, si una columna queda vacía, la llena con la carta de arriba de la reserva. */
function moverCartas(
  m: Mesa,
  desde: PilaCanfield,
  hasta: PilaCanfield,
  cantidad: number,
): number | null {
  const origen = cartasDe(m, desde);
  cartasDe(m, hasta).push(...origen.splice(origen.length - cantidad));
  if (desde[0] !== 'c' || m.reserva.length === 0) return null;
  const i = Number(desde.slice(1));
  if (m.columnas[i]!.length > 0) return null;
  m.columnas[i]!.push(m.reserva.pop()!);
  return i;
}

function deshacer(m: Mesa): void {
  const ultimo = m.historial.pop()!;
  switch (ultimo.tipo) {
    case 'robar':
      m.mazo.push(...m.descarte.splice(m.descarte.length - ultimo.cantidad).reverse());
      break;
    case 'reciclar':
      m.descarte = m.mazo.reverse();
      m.mazo = [];
      break;
    case 'mover': {
      if (ultimo.relleno !== null) m.reserva.push(m.columnas[ultimo.relleno]!.pop()!);
      const destino = cartasDe(m, ultimo.hasta);
      cartasDe(m, ultimo.desde).push(...destino.splice(destino.length - ultimo.cantidad));
      break;
    }
  }
}

/**
 * Sube a las fundaciones cualquier carta de arriba de una columna que encaje, mientras haya
 * alguna. Devuelve si se completaron las cuatro. Trabaja sobre `m`.
 */
function subirTodo(m: Mesa): boolean {
  for (let cambio = true; cambio;) {
    cambio = false;
    for (const c of m.columnas) {
      const tope = c.at(-1);
      if (tope === undefined) continue;
      const f = m.fundaciones.findIndex((x) => puedeIrAFundacionCanfield(tope, x, m.base));
      if (f < 0) continue;
      m.fundaciones[f]!.push(c.pop()!);
      m.movimientos++;
      cambio = true;
    }
  }
  return m.fundaciones.every((f) => f.length === 13);
}

function puedeAutocompletar(e: EstadoCanfield): boolean {
  if (e.mazo.length > 0 || e.descarte.length > 0 || e.reserva.length > 0) return false;
  if (e.columnas.every((c) => c.length === 0)) return false;
  return subirTodo(copiar(e));
}

const ganada = (e: EstadoCanfield) => e.fundaciones.every((f) => f.length === 13);

// ── Juego ────────────────────────────────────────────────────────────────────

export const canfield: Juego<ConfigCanfield, EstadoCanfield, AccionCanfield, VistaCanfield> = {
  id: 'canfield',

  crear(config, semilla) {
    if (config.robo !== 1 && config.robo !== 3) return error('El robo debe ser de 1 o de 3 cartas');
    const { cartas } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const reserva = cartas.slice(0, RESERVA);
    const primera = cartas[RESERVA]!;
    const columnas = cartas.slice(RESERVA + 1, RESERVA + 1 + COLUMNAS).map((c) => [c]);
    return ok({
      config: { robo: config.robo },
      base: valor(primera),
      reserva,
      mazo: cartas.slice(RESERVA + 1 + COLUMNAS),
      descarte: [],
      columnas,
      fundaciones: [[primera], ...Array.from({ length: FUNDACIONES - 1 }, () => [])],
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || canfield.resultado(e) !== null) return [];
    const acciones: AccionCanfield[] = [];
    const mover = (desde: PilaCanfield, hasta: PilaCanfield, cantidad: number) =>
      acciones.push({ tipo: 'mover', desde, hasta, cantidad });

    if (e.mazo.length > 0) acciones.push({ tipo: 'robar' });
    else if (e.descarte.length > 0) acciones.push({ tipo: 'reciclar' });

    // Una carta suelta (la de arriba del descarte o de la reserva) a columnas y fundaciones.
    const suelta = (pila: 'descarte' | 'reserva', carta: IdCarta | undefined) => {
      if (carta === undefined) return;
      e.columnas.forEach((c, j) => puedeIrAColumna(carta, c) && mover(pila, columna(j), 1));
      e.fundaciones.forEach(
        (f, j) => puedeIrAFundacionCanfield(carta, f, e.base) && mover(pila, fundacion(j), 1),
      );
    };
    suelta('descarte', e.descarte.at(-1));
    suelta('reserva', e.reserva.at(-1));

    e.columnas.forEach((c, i) => {
      c.forEach((carta, k) => {
        if (!esTramo(c, k)) return;
        const cantidad = c.length - k;
        e.columnas.forEach((d, j) => {
          if (j === i || !puedeIrAColumna(carta, d)) return;
          // Pasar una columna entera a un hueco no cambia nada.
          if (d.length === 0 && k === 0) return;
          mover(columna(i), columna(j), cantidad);
        });
        if (cantidad === 1) {
          e.fundaciones.forEach(
            (f, j) =>
              puedeIrAFundacionCanfield(carta, f, e.base) && mover(columna(i), fundacion(j), 1),
          );
        }
      });
    });

    e.fundaciones.forEach((f, i) => {
      const tope = f.at(-1);
      if (tope === undefined) return;
      e.columnas.forEach(
        (c, j) => c.length > 0 && puedeIrAColumna(tope, c) && mover(fundacion(i), columna(j), 1),
      );
    });

    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    if (puedeAutocompletar(e)) acciones.push({ tipo: 'autocompletar' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    const m = copiar(e);
    switch (accion.tipo) {
      case 'robar': {
        const cantidad = Math.min(m.config.robo, m.mazo.length);
        for (let i = 0; i < cantidad; i++) m.descarte.push(m.mazo.pop()!);
        m.historial.push({ tipo: 'robar', cantidad });
        m.movimientos++;
        break;
      }
      case 'reciclar':
        m.mazo = m.descarte.reverse();
        m.descarte = [];
        m.historial.push({ tipo: 'reciclar' });
        m.movimientos++;
        break;
      case 'mover': {
        const relleno = moverCartas(m, accion.desde, accion.hasta, accion.cantidad);
        m.historial.push({ ...accion, relleno });
        m.movimientos++;
        break;
      }
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
      base: e.base,
      reservaArriba: e.reserva.at(-1) ?? null,
      reserva: e.reserva.length,
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
