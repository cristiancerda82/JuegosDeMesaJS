import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, colorDe, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import { repartir } from '../baraja/repartir';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigKlondike {
  /** Cartas que pasan del mazo al descarte en cada robo. */
  readonly robo: 1 | 3;
  /** Veces que se puede reciclar el descarte al mazo; `null` = ilimitadas. */
  readonly reciclajes: number | null;
}

export const CONFIG_KLONDIKE_POR_DEFECTO: ConfigKlondike = { robo: 1, reciclajes: null };

/** 'descarte', columnas 'c0'–'c6' y fundaciones 'f0'–'f3'. */
export type PilaKlondike = 'descarte' | `c${number}` | `f${number}`;

export interface ColumnaKlondike {
  /** Cartas boca abajo, de abajo hacia arriba. */
  readonly ocultas: readonly IdCarta[];
  /** Cartas boca arriba, de abajo hacia arriba. */
  readonly visibles: readonly IdCarta[];
}

/** Lo necesario para revertir cada movimiento. */
export type MovimientoKlondike =
  | { readonly tipo: 'robar'; readonly cantidad: number }
  | { readonly tipo: 'reciclar' }
  | {
      readonly tipo: 'mover';
      readonly desde: PilaKlondike;
      readonly hasta: PilaKlondike;
      readonly cantidad: number;
      readonly volteo: boolean;
    };

export interface EstadoKlondike {
  readonly config: ConfigKlondike;
  /** Boca abajo; la carta superior es la última. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la carta superior (la única jugable) es la última. */
  readonly descarte: readonly IdCarta[];
  readonly columnas: readonly ColumnaKlondike[];
  readonly fundaciones: readonly (readonly IdCarta[])[];
  readonly reciclajesUsados: number;
  readonly movimientos: number;
  readonly historial: readonly MovimientoKlondike[];
  readonly abandonada: boolean;
}

export type AccionKlondike =
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'reciclar' }
  | {
      readonly tipo: 'mover';
      readonly desde: PilaKlondike;
      readonly hasta: PilaKlondike;
      readonly cantidad: number;
    }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'autocompletar' }
  | { readonly tipo: 'abandonar' };

export interface VistaKlondike {
  readonly config: ConfigKlondike;
  readonly mazo: number;
  readonly descarte: readonly IdCarta[];
  readonly columnas: readonly { readonly ocultas: number; readonly visibles: readonly IdCarta[] }[];
  readonly fundaciones: readonly (readonly IdCarta[])[];
  readonly movimientos: number;
  /** `null` si son ilimitados. */
  readonly reciclajesRestantes: number | null;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas de apilado ────────────────────────────────────────────────────────

const COLUMNAS = 7;
const FUNDACIONES = 4;

const valor = (id: IdCarta) => cartaDeId(id)!.valor;
const palo = (id: IdCarta) => cartaDeId(id)!.palo as PaloFrances;
const color = (id: IdCarta) => colorDe(palo(id));

const columna = (i: number): PilaKlondike => `c${i}`;
const fundacion = (i: number): PilaKlondike => `f${i}`;

function puedeIrAColumna(carta: IdCarta, destino: ColumnaKlondike): boolean {
  const tope = destino.visibles.at(-1);
  if (tope === undefined) return destino.ocultas.length === 0 && valor(carta) === 13;
  return valor(carta) === valor(tope) - 1 && color(carta) !== color(tope);
}

function puedeIrAFundacion(carta: IdCarta, destino: readonly IdCarta[]): boolean {
  const tope = destino.at(-1);
  if (tope === undefined) return valor(carta) === 1;
  return palo(carta) === palo(tope) && valor(carta) === valor(tope) + 1;
}

/** Las cartas desde `inicio` hasta el final bajan de a uno y alternan color. */
function esSecuencia(cartas: readonly IdCarta[], inicio: number): boolean {
  for (let i = inicio + 1; i < cartas.length; i++) {
    if (!puedeIrAColumna(cartas[i]!, { ocultas: [], visibles: [cartas[i - 1]!] })) return false;
  }
  return true;
}

// ── Estado mutable de trabajo (solo dentro de una transición) ────────────────

interface Mesa {
  config: ConfigKlondike;
  mazo: IdCarta[];
  descarte: IdCarta[];
  columnas: { ocultas: IdCarta[]; visibles: IdCarta[] }[];
  fundaciones: IdCarta[][];
  reciclajesUsados: number;
  movimientos: number;
  historial: MovimientoKlondike[];
  abandonada: boolean;
}

function copiar(e: EstadoKlondike): Mesa {
  return {
    ...e,
    mazo: [...e.mazo],
    descarte: [...e.descarte],
    columnas: e.columnas.map((c) => ({ ocultas: [...c.ocultas], visibles: [...c.visibles] })),
    fundaciones: e.fundaciones.map((f) => [...f]),
    historial: [...e.historial],
  };
}

function cartasDe(m: Mesa, pila: PilaKlondike): IdCarta[] {
  if (pila === 'descarte') return m.descarte;
  const i = Number(pila.slice(1));
  return pila[0] === 'c' ? m.columnas[i]!.visibles : m.fundaciones[i]!;
}

/** Mueve cartas entre pilas y voltea la nueva carta superior de la columna de origen. */
function moverCartas(m: Mesa, desde: PilaKlondike, hasta: PilaKlondike, cantidad: number): boolean {
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
  switch (ultimo.tipo) {
    case 'robar':
      m.mazo.push(...m.descarte.splice(m.descarte.length - ultimo.cantidad).reverse());
      break;
    case 'reciclar':
      m.descarte = m.mazo.reverse();
      m.mazo = [];
      m.reciclajesUsados--;
      break;
    case 'mover': {
      if (ultimo.volteo) {
        const col = m.columnas[Number(ultimo.desde.slice(1))]!;
        col.ocultas.push(col.visibles.pop()!);
      }
      const destino = cartasDe(m, ultimo.hasta);
      cartasDe(m, ultimo.desde).push(...destino.splice(destino.length - ultimo.cantidad));
      break;
    }
  }
}

function puedeAutocompletar(e: EstadoKlondike): boolean {
  return (
    e.mazo.length === 0 &&
    e.descarte.length === 0 &&
    e.columnas.every((c) => c.ocultas.length === 0) &&
    e.columnas.some((c) => c.visibles.length > 0)
  );
}

/**
 * Con todo boca arriba y sin mazo, la carta de menor valor siempre está en la cima de su
 * columna y es la siguiente de su fundación, así que mover siempre la menor completa el juego.
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
    const destino = m.fundaciones.findIndex((f) => puedeIrAFundacion(carta, f));
    moverCartas(m, columna(i), fundacion(destino), 1);
    m.movimientos++;
  }
}

const ganada = (e: EstadoKlondike) => e.fundaciones.every((f) => f.length === 13);

// ── Juego ────────────────────────────────────────────────────────────────────

export const klondike: Juego<ConfigKlondike, EstadoKlondike, AccionKlondike, VistaKlondike> = {
  id: 'klondike',

  crear(config, semilla) {
    if (config.robo !== 1 && config.robo !== 3) return error('El robo debe ser de 1 o de 3 cartas');
    if (
      config.reciclajes !== null &&
      (!Number.isInteger(config.reciclajes) || config.reciclajes < 0)
    ) {
      return error('Los reciclajes deben ser un entero no negativo o ilimitados');
    }
    const { cartas } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const reparto = repartir(
      cartas,
      Array.from({ length: COLUMNAS }, (_, i) => i + 1),
    );
    if (!reparto.ok) return reparto;
    return ok({
      config: { robo: config.robo, reciclajes: config.reciclajes },
      mazo: reparto.valor.mazo,
      descarte: [],
      columnas: reparto.valor.manos.map((mano) => ({
        ocultas: mano.slice(0, -1),
        visibles: mano.slice(-1),
      })),
      fundaciones: Array.from({ length: FUNDACIONES }, () => []),
      reciclajesUsados: 0,
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || klondike.resultado(e) !== null) return [];
    const acciones: AccionKlondike[] = [];
    const mover = (desde: PilaKlondike, hasta: PilaKlondike, cantidad: number) =>
      acciones.push({ tipo: 'mover', desde, hasta, cantidad });

    if (e.mazo.length > 0) acciones.push({ tipo: 'robar' });
    else if (
      e.descarte.length > 0 &&
      (e.config.reciclajes === null || e.reciclajesUsados < e.config.reciclajes)
    ) {
      acciones.push({ tipo: 'reciclar' });
    }

    const topeDescarte = e.descarte.at(-1);
    if (topeDescarte !== undefined) {
      e.columnas.forEach(
        (c, j) => puedeIrAColumna(topeDescarte, c) && mover('descarte', columna(j), 1),
      );
      e.fundaciones.forEach(
        (f, j) => puedeIrAFundacion(topeDescarte, f) && mover('descarte', fundacion(j), 1),
      );
    }

    e.columnas.forEach((c, i) => {
      c.visibles.forEach((base, k) => {
        if (!esSecuencia(c.visibles, k)) return;
        const cantidad = c.visibles.length - k;
        e.columnas.forEach(
          (d, j) => j !== i && puedeIrAColumna(base, d) && mover(columna(i), columna(j), cantidad),
        );
        if (cantidad === 1) {
          e.fundaciones.forEach(
            (f, j) => puedeIrAFundacion(base, f) && mover(columna(i), fundacion(j), 1),
          );
        }
      });
    });

    e.fundaciones.forEach((f, i) => {
      const tope = f.at(-1);
      if (tope === undefined) return;
      e.columnas.forEach((c, j) => puedeIrAColumna(tope, c) && mover(fundacion(i), columna(j), 1));
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
        m.reciclajesUsados++;
        m.historial.push({ tipo: 'reciclar' });
        m.movimientos++;
        break;
      case 'mover': {
        const volteo = moverCartas(m, accion.desde, accion.hasta, accion.cantidad);
        m.historial.push({ ...accion, volteo });
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
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      columnas: e.columnas.map((c) => ({ ocultas: c.ocultas.length, visibles: [...c.visibles] })),
      fundaciones: e.fundaciones.map((f) => [...f]),
      movimientos: e.movimientos,
      reciclajesRestantes:
        e.config.reciclajes === null ? null : e.config.reciclajes - e.reciclajesUsados,
      situacion,
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false };
    if (ganada(e)) return { ganadores: [0], empate: false };
    return null;
  },
};
