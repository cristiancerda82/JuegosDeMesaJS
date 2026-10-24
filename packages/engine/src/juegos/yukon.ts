import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, colorDe, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigYukon {
  /** Cómo se construye en las columnas: colores alternos (Yukon) o mismo palo (Solitario ruso). */
  readonly construccion: 'colores' | 'palo';
}

export const CONFIG_YUKON_POR_DEFECTO: ConfigYukon = { construccion: 'colores' };

/** Columnas 'c0'–'c6' y fundaciones 'f0'–'f3'. */
export type PilaYukon = `c${number}` | `f${number}`;

export interface ColumnaYukon {
  /** Cartas boca abajo, de abajo hacia arriba. */
  readonly ocultas: readonly IdCarta[];
  /** Cartas boca arriba, de abajo hacia arriba. */
  readonly visibles: readonly IdCarta[];
}

/** Lo necesario para revertir cada movimiento. */
export interface MovimientoYukon {
  readonly desde: PilaYukon;
  readonly hasta: PilaYukon;
  readonly cantidad: number;
  readonly volteo: boolean;
}

export interface EstadoYukon {
  readonly config: ConfigYukon;
  readonly columnas: readonly ColumnaYukon[];
  readonly fundaciones: readonly (readonly IdCarta[])[];
  readonly movimientos: number;
  readonly historial: readonly MovimientoYukon[];
  readonly abandonada: boolean;
}

export type AccionYukon =
  | {
      readonly tipo: 'mover';
      readonly desde: PilaYukon;
      readonly hasta: PilaYukon;
      readonly cantidad: number;
    }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'autocompletar' }
  | { readonly tipo: 'abandonar' };

export interface VistaYukon {
  readonly config: ConfigYukon;
  readonly columnas: readonly { readonly ocultas: number; readonly visibles: readonly IdCarta[] }[];
  readonly fundaciones: readonly (readonly IdCarta[])[];
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas de apilado ────────────────────────────────────────────────────────

/** Cartas por columna al repartir; en todas menos la primera, las 5 de arriba van boca arriba. */
const REPARTO = [1, 6, 7, 8, 9, 10, 11];
const BOCA_ARRIBA = 5;
const FUNDACIONES = 4;

const valor = (id: IdCarta) => cartaDeId(id)!.valor;
const palo = (id: IdCarta) => cartaDeId(id)!.palo as PaloFrances;
const color = (id: IdCarta) => colorDe(palo(id));

const columna = (i: number): PilaYukon => `c${i}`;
const fundacion = (i: number): PilaYukon => `f${i}`;

/** `carta` puede ir sobre `tope` en una columna según la construcción. */
export function encajaYukon(
  carta: IdCarta,
  tope: IdCarta,
  construccion: ConfigYukon['construccion'],
): boolean {
  if (valor(carta) !== valor(tope) - 1) return false;
  return construccion === 'palo' ? palo(carta) === palo(tope) : color(carta) !== color(tope);
}

function puedeIrAColumna(carta: IdCarta, destino: ColumnaYukon, config: ConfigYukon): boolean {
  const tope = destino.visibles.at(-1);
  if (tope === undefined) return destino.ocultas.length === 0 && valor(carta) === 13;
  return encajaYukon(carta, tope, config.construccion);
}

export function puedeIrAFundacionYukon(carta: IdCarta, destino: readonly IdCarta[]): boolean {
  const tope = destino.at(-1);
  if (tope === undefined) return valor(carta) === 1;
  return palo(carta) === palo(tope) && valor(carta) === valor(tope) + 1;
}

/** La columna baja de uno en uno según la construcción, de abajo arriba. */
function ordenada(cartas: readonly IdCarta[], config: ConfigYukon): boolean {
  for (let i = 1; i < cartas.length; i++) {
    if (!encajaYukon(cartas[i]!, cartas[i - 1]!, config.construccion)) return false;
  }
  return true;
}

// ── Estado mutable de trabajo (solo dentro de una transición) ────────────────

interface Mesa {
  config: ConfigYukon;
  columnas: { ocultas: IdCarta[]; visibles: IdCarta[] }[];
  fundaciones: IdCarta[][];
  movimientos: number;
  historial: MovimientoYukon[];
  abandonada: boolean;
}

function copiar(e: EstadoYukon): Mesa {
  return {
    ...e,
    columnas: e.columnas.map((c) => ({ ocultas: [...c.ocultas], visibles: [...c.visibles] })),
    fundaciones: e.fundaciones.map((f) => [...f]),
    historial: [...e.historial],
  };
}

function cartasDe(m: Mesa, pila: PilaYukon): IdCarta[] {
  const i = Number(pila.slice(1));
  return pila[0] === 'c' ? m.columnas[i]!.visibles : m.fundaciones[i]!;
}

/** Mueve cartas entre pilas y voltea la nueva carta superior de la columna de origen. */
function moverCartas(m: Mesa, desde: PilaYukon, hasta: PilaYukon, cantidad: number): boolean {
  const origen = cartasDe(m, desde);
  cartasDe(m, hasta).push(...origen.splice(origen.length - cantidad));
  if (desde[0] !== 'c') return false;
  const col = m.columnas[Number(desde.slice(1))]!;
  if (col.visibles.length > 0 || col.ocultas.length === 0) return false;
  col.visibles.push(col.ocultas.pop()!);
  return true;
}

function deshacer(m: Mesa): void {
  const ultimo = m.historial.pop()!;
  if (ultimo.volteo) {
    const col = m.columnas[Number(ultimo.desde.slice(1))]!;
    col.ocultas.push(col.visibles.pop()!);
  }
  const destino = cartasDe(m, ultimo.hasta);
  cartasDe(m, ultimo.desde).push(...destino.splice(destino.length - ultimo.cantidad));
}

function puedeAutocompletar(e: EstadoYukon): boolean {
  return (
    e.columnas.every((c) => c.ocultas.length === 0 && ordenada(c.visibles, e.config)) &&
    e.columnas.some((c) => c.visibles.length > 0)
  );
}

/**
 * Con todo boca arriba y cada columna ordenada, la carta más baja está siempre arriba de su
 * columna y es la siguiente de su fundación: subir siempre la más baja completa el juego.
 */
function autocompletar(m: Mesa): void {
  for (;;) {
    let mejor: { i: number; carta: IdCarta } | null = null;
    for (const [i, c] of m.columnas.entries()) {
      const tope = c.visibles.at(-1);
      if (tope !== undefined && (mejor === null || valor(tope) < valor(mejor.carta))) {
        mejor = { i, carta: tope };
      }
    }
    if (mejor === null) return;
    const { i, carta } = mejor;
    const destino = m.fundaciones.findIndex((f) => puedeIrAFundacionYukon(carta, f));
    moverCartas(m, columna(i), fundacion(destino), 1);
    m.movimientos++;
  }
}

const ganada = (e: EstadoYukon) => e.fundaciones.every((f) => f.length === 13);

// ── Juego ────────────────────────────────────────────────────────────────────

export const yukon: Juego<ConfigYukon, EstadoYukon, AccionYukon, VistaYukon> = {
  id: 'yukon',

  crear(config, semilla) {
    if (config.construccion !== 'colores' && config.construccion !== 'palo') {
      return error('La construcción debe ser por colores o por palo');
    }
    const { cartas } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const reparto = repartir(cartas, REPARTO);
    if (!reparto.ok) return reparto;
    return ok({
      config: { construccion: config.construccion },
      columnas: reparto.valor.manos.map((mano) => {
        const ocultas = Math.max(0, mano.length - BOCA_ARRIBA);
        return { ocultas: mano.slice(0, ocultas), visibles: mano.slice(ocultas) };
      }),
      fundaciones: Array.from({ length: FUNDACIONES }, () => []),
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || yukon.resultado(e) !== null) return [];
    const acciones: AccionYukon[] = [];
    const mover = (desde: PilaYukon, hasta: PilaYukon, cantidad: number) =>
      acciones.push({ tipo: 'mover', desde, hasta, cantidad });

    e.columnas.forEach((c, i) => {
      c.visibles.forEach((base, k) => {
        const cantidad = c.visibles.length - k;
        e.columnas.forEach(
          (d, j) =>
            j !== i &&
            puedeIrAColumna(base, d, e.config) &&
            mover(columna(i), columna(j), cantidad),
        );
        if (cantidad === 1) {
          e.fundaciones.forEach(
            (f, j) => puedeIrAFundacionYukon(base, f) && mover(columna(i), fundacion(j), 1),
          );
        }
      });
    });

    e.fundaciones.forEach((f, i) => {
      const tope = f.at(-1);
      if (tope === undefined) return;
      e.columnas.forEach(
        (c, j) => puedeIrAColumna(tope, c, e.config) && mover(fundacion(i), columna(j), 1),
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
      case 'mover': {
        const volteo = moverCartas(m, accion.desde, accion.hasta, accion.cantidad);
        m.historial.push({
          desde: accion.desde,
          hasta: accion.hasta,
          cantidad: accion.cantidad,
          volteo,
        });
        m.movimientos++;
        break;
      }
      case 'deshacer':
        // Deshacer cuenta como un movimiento más: el contador nunca baja.
        deshacer(m);
        m.movimientos++;
        break;
      case 'autocompletar':
        autocompletar(m);
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
      columnas: e.columnas.map((c) => ({ ocultas: c.ocultas.length, visibles: [...c.visibles] })),
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
