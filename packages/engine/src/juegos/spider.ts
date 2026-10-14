import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigSpider {
  /** Palos distintos entre las 104 cartas: 1 (todas picas), 2 (picas y corazones) o 4. */
  readonly palos: 1 | 2 | 4;
  /** Permitir repartir del mazo aunque haya columnas vacías. */
  readonly repartirConVacias: boolean;
}

export const CONFIG_SPIDER_POR_DEFECTO: ConfigSpider = { palos: 1, repartirConVacias: false };

/** Carta del Spider: la carta de la baraja y su número de copia, p. ej. "picas-12#3". */
export type CartaSpider = `${IdCarta}#${number}`;

/** La carta de la baraja que representa una carta del Spider (sin el número de copia). */
export const baseSpider = (carta: CartaSpider): IdCarta =>
  carta.slice(0, carta.indexOf('#')) as IdCarta;

export interface ColumnaSpider {
  /** Cartas boca abajo, de abajo hacia arriba. */
  readonly ocultas: readonly CartaSpider[];
  /** Cartas boca arriba, de abajo hacia arriba. */
  readonly visibles: readonly CartaSpider[];
}

interface Tablero {
  readonly columnas: readonly ColumnaSpider[];
  /** Boca abajo; se reparte desde el final. */
  readonly mazo: readonly CartaSpider[];
  /** Palo de cada escalera completada, en orden. */
  readonly completadas: readonly PaloFrances[];
}

export interface EstadoSpider extends Tablero {
  readonly config: ConfigSpider;
  readonly movimientos: number;
  /** Tablero antes de cada movimiento o reparto, para deshacer. */
  readonly historial: readonly Tablero[];
  readonly abandonada: boolean;
}

export type AccionSpider =
  | {
      readonly tipo: 'mover';
      readonly desde: number;
      readonly hasta: number;
      readonly cantidad: number;
    }
  | { readonly tipo: 'repartir' }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'abandonar' };

export interface VistaSpider {
  readonly config: ConfigSpider;
  readonly columnas: readonly {
    readonly ocultas: number;
    readonly visibles: readonly CartaSpider[];
  }[];
  readonly repartosRestantes: number;
  readonly completadas: readonly PaloFrances[];
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const COLUMNAS_SPIDER = 10;
const CARTAS_EN_COLUMNAS = 54;
const ESCALERAS = 8;
const REY = 13;
const PALOS_POR_DIFICULTAD: Record<ConfigSpider['palos'], readonly PaloFrances[]> = {
  1: ['picas'],
  2: ['picas', 'corazones'],
  4: ['picas', 'corazones', 'diamantes', 'treboles'],
};

const valor = (c: CartaSpider) => cartaDeId(baseSpider(c))!.valor;
const palo = (c: CartaSpider) => cartaDeId(baseSpider(c))!.palo as PaloFrances;

/** Las 104 cartas: cada palo de la dificultad se repite hasta llenar 8 escaleras. */
export function cartasSpider(palos: ConfigSpider['palos']): CartaSpider[] {
  const lista = PALOS_POR_DIFICULTAD[palos];
  const copias = ESCALERAS / lista.length;
  const cartas: CartaSpider[] = [];
  for (const p of lista) {
    for (let copia = 0; copia < copias; copia++) {
      for (let v = 1; v <= REY; v++) cartas.push(`${p}-${v}#${copia}`);
    }
  }
  return cartas;
}

/** `carta` puede ir encima de `tope` (o en una columna vacía). */
const encaja = (carta: CartaSpider, tope: CartaSpider | undefined) =>
  tope === undefined || valor(carta) === valor(tope) - 1;

/** Largo de la escalera del mismo palo al final de las cartas visibles. */
export function escaleraFinal(visibles: readonly CartaSpider[]): number {
  let n = visibles.length === 0 ? 0 : 1;
  while (n < visibles.length) {
    const encima = visibles.at(-n)!;
    const debajo = visibles.at(-n - 1)!;
    if (palo(encima) !== palo(debajo) || valor(encima) !== valor(debajo) - 1) break;
    n++;
  }
  return n;
}

const ganada = (t: Tablero) => t.completadas.length === ESCALERAS;

const puedeRepartir = (e: EstadoSpider) =>
  e.mazo.length > 0 &&
  (e.config.repartirConVacias || e.columnas.every((c) => c.ocultas.length + c.visibles.length > 0));

// ── Columnas mutables (solo dentro de una transición) ────────────────────────

interface Columna {
  ocultas: CartaSpider[];
  visibles: CartaSpider[];
}

/** Retira la escalera Rey…As del final de la columna, si la hay, y voltea la tapada. */
function ordenarColumna(c: Columna, completadas: PaloFrances[]): void {
  if (escaleraFinal(c.visibles) >= REY && valor(c.visibles.at(-1)!) === 1) {
    const escalera = c.visibles.splice(c.visibles.length - REY);
    completadas.push(palo(escalera[0]!));
  }
  if (c.visibles.length === 0 && c.ocultas.length > 0) c.visibles.push(c.ocultas.pop()!);
}

const tablero = (e: EstadoSpider): Tablero => ({
  columnas: e.columnas,
  mazo: e.mazo,
  completadas: e.completadas,
});

// ── Juego ────────────────────────────────────────────────────────────────────

export const spider: Juego<ConfigSpider, EstadoSpider, AccionSpider, VistaSpider> = {
  id: 'spider',

  crear(config, semilla) {
    if (![1, 2, 4].includes(config.palos)) return error('El Spider se juega con 1, 2 o 4 palos');
    if (typeof config.repartirConVacias !== 'boolean') {
      return error('Opción de reparto con columnas vacías inválida');
    }
    const limpia: ConfigSpider = {
      palos: config.palos,
      repartirConVacias: config.repartirConVacias,
    };
    const { cartas } = barajar(cartasSpider(limpia.palos), crearAzar(semilla));
    // Se reparte por filas: la carta i va a la columna i % 10.
    const columnas: Columna[] = Array.from({ length: COLUMNAS_SPIDER }, () => ({
      ocultas: [],
      visibles: [],
    }));
    cartas
      .slice(0, CARTAS_EN_COLUMNAS)
      .forEach((c, i) => columnas[i % COLUMNAS_SPIDER]!.ocultas.push(c));
    for (const c of columnas) c.visibles.push(c.ocultas.pop()!);
    return ok({
      config: limpia,
      columnas,
      mazo: cartas.slice(CARTAS_EN_COLUMNAS),
      completadas: [],
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || spider.resultado(e) !== null) return [];
    const acciones: AccionSpider[] = [];
    e.columnas.forEach((c, desde) => {
      const escalera = escaleraFinal(c.visibles);
      for (let cantidad = 1; cantidad <= escalera; cantidad++) {
        const primera = c.visibles.at(-cantidad)!;
        // Mover a una vacía la columna entera no cambia nada.
        const columnaEntera = cantidad === c.visibles.length && c.ocultas.length === 0;
        e.columnas.forEach((d, hasta) => {
          if (hasta === desde) return;
          const vacia = d.ocultas.length + d.visibles.length === 0;
          if (vacia ? !columnaEntera : encaja(primera, d.visibles.at(-1))) {
            acciones.push({ tipo: 'mover', desde, hasta, cantidad });
          }
        });
      }
    });
    if (puedeRepartir(e)) acciones.push({ tipo: 'repartir' });
    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    switch (accion.tipo) {
      case 'mover':
      case 'repartir': {
        const columnas: Columna[] = e.columnas.map((c) => ({
          ocultas: [...c.ocultas],
          visibles: [...c.visibles],
        }));
        const completadas = [...e.completadas];
        let mazo = e.mazo;
        if (accion.tipo === 'mover') {
          const origen = columnas[accion.desde]!;
          const cartas = origen.visibles.splice(origen.visibles.length - accion.cantidad);
          columnas[accion.hasta]!.visibles.push(...cartas);
        } else {
          const reparto = e.mazo.slice(-COLUMNAS_SPIDER);
          mazo = e.mazo.slice(0, -COLUMNAS_SPIDER);
          columnas.forEach((c, i) => c.visibles.push(reparto[i]!));
        }
        for (const c of columnas) ordenarColumna(c, completadas);
        return {
          ...e,
          columnas,
          mazo,
          completadas,
          movimientos: e.movimientos + 1,
          historial: [...e.historial, tablero(e)],
        };
      }
      case 'deshacer':
        // Deshacer cuenta como un movimiento más: el contador nunca baja.
        return {
          ...e,
          ...e.historial.at(-1)!,
          movimientos: e.movimientos + 1,
          historial: e.historial.slice(0, -1),
        };
      case 'abandonar':
        return { ...e, abandonada: true };
    }
  },

  vistaDe(e) {
    return {
      config: e.config,
      columnas: e.columnas.map((c) => ({ ocultas: c.ocultas.length, visibles: [...c.visibles] })),
      repartosRestantes: e.mazo.length / COLUMNAS_SPIDER,
      completadas: [...e.completadas],
      movimientos: e.movimientos,
      situacion: e.abandonada ? 'abandono' : ganada(e) ? 'victoria' : 'jugando',
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false };
    if (ganada(e)) return { ganadores: [0], empate: false };
    return null;
  },
};
