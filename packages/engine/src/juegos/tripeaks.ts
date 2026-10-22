import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';
import { encajaGolf } from './golf';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** TriPeaks no tiene opciones de reglas: siempre con vuelta (la K y el As se tocan). */
export type ConfigTriPeaks = Readonly<Record<string, never>>;

export const CONFIG_TRIPEAKS_POR_DEFECTO: ConfigTriPeaks = {};

interface Tablero {
  /** Las 28 cartas de los picos por filas (3, 6, 9 y 10); `null` si ya se quitó. */
  readonly picos: readonly (IdCarta | null)[];
  /** Boca abajo; se roba del final. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la de arriba es la última. */
  readonly descarte: readonly IdCarta[];
  readonly puntos: number;
  /** Cartas quitadas seguidas desde el último robo. */
  readonly racha: number;
}

export interface EstadoTriPeaks extends Tablero {
  readonly config: ConfigTriPeaks;
  readonly movimientos: number;
  /** Tablero antes de cada acción, para deshacer. */
  readonly historial: readonly Tablero[];
  readonly abandonada: boolean;
}

export type AccionTriPeaks =
  | { readonly tipo: 'quitar'; readonly posicion: number }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'abandonar' };

/** Una posición de los picos vista por el jugador: la carta, boca abajo o vacía. */
export type SitioTriPeaks = IdCarta | 'oculta' | null;

export interface VistaTriPeaks {
  readonly config: ConfigTriPeaks;
  readonly picos: readonly SitioTriPeaks[];
  readonly mazo: number;
  readonly descarte: readonly IdCarta[];
  readonly movimientos: number;
  readonly puntos: number;
  readonly racha: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const CARTAS_PICOS_TRIPEAKS = 28;
/** Primera posición de cada fila y cuántas cartas tiene. */
export const FILAS_TRIPEAKS = [
  { inicio: 0, cartas: 3 },
  { inicio: 3, cartas: 6 },
  { inicio: 9, cartas: 9 },
  { inicio: 18, cartas: 10 },
] as const;
export const PUNTOS_PICO_TRIPEAKS = 15;
export const PUNTOS_TRES_PICOS_TRIPEAKS = 30;
/** Las cimas de los tres picos: posiciones 0, 1 y 2. */
const CIMAS = [0, 1, 2];

/** Fila (0 arriba, 3 abajo) de una posición de los picos. */
export const filaTriPeaks = (posicion: number) =>
  FILAS_TRIPEAKS.findLastIndex((f) => posicion >= f.inicio);

/** Las posiciones que tapan a `posicion`: las dos cartas de la fila de debajo que la pisan. */
export function tapadorasTriPeaks(posicion: number): number[] {
  const fila = filaTriPeaks(posicion);
  if (fila === 3) return [];
  const i = posicion - FILAS_TRIPEAKS[fila]!.inicio;
  const debajo = FILAS_TRIPEAKS[fila + 1]!.inicio;
  // Cada cima tiene dos cartas debajo; en la fila 1, cada pico se desplaza uno más en la 2.
  const primera = fila === 0 ? 2 * i : fila === 1 ? i + Math.floor(i / 2) : i;
  return [debajo + primera, debajo + primera + 1];
}

/** La carta de `posicion` está y no tiene nada encima: está boca arriba y se puede quitar. */
export function libreEnTriPeaks(picos: readonly (unknown | null)[], posicion: number): boolean {
  return picos[posicion] !== null && tapadorasTriPeaks(posicion).every((t) => picos[t] === null);
}

const despejados = (t: Pick<Tablero, 'picos'>) => t.picos.every((c) => c === null);

const tablero = (e: EstadoTriPeaks): Tablero => ({
  picos: e.picos,
  mazo: e.mazo,
  descarte: e.descarte,
  puntos: e.puntos,
  racha: e.racha,
});

// ── Juego ────────────────────────────────────────────────────────────────────

export const tripeaks: Juego<ConfigTriPeaks, EstadoTriPeaks, AccionTriPeaks, VistaTriPeaks> = {
  id: 'tripeaks',

  crear(config, semilla) {
    if (typeof config !== 'object' || config === null) return error('Configuración inválida');
    const { cartas } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const resto = cartas.slice(CARTAS_PICOS_TRIPEAKS);
    return ok({
      config: {},
      picos: cartas.slice(0, CARTAS_PICOS_TRIPEAKS),
      descarte: [resto.at(-1)!],
      mazo: resto.slice(0, -1),
      puntos: 0,
      racha: 0,
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || tripeaks.resultado(e) !== null) return [];
    const acciones: AccionTriPeaks[] = [];
    const arriba = e.descarte.at(-1)!;
    e.picos.forEach((carta, posicion) => {
      if (carta !== null && libreEnTriPeaks(e.picos, posicion) && encajaGolf(carta, arriba, true)) {
        acciones.push({ tipo: 'quitar', posicion });
      }
    });
    if (e.mazo.length > 0) acciones.push({ tipo: 'robar' });
    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    const tras = (t: Partial<Tablero>): EstadoTriPeaks => ({
      ...e,
      ...t,
      movimientos: e.movimientos + 1,
      historial: [...e.historial, tablero(e)],
    });
    switch (accion.tipo) {
      case 'quitar': {
        const carta = e.picos[accion.posicion]!;
        const picos = e.picos.map((c, i) => (i === accion.posicion ? null : c));
        const racha = e.racha + 1;
        let puntos = e.puntos + racha;
        if (CIMAS.includes(accion.posicion)) {
          puntos += PUNTOS_PICO_TRIPEAKS;
          if (CIMAS.every((c) => picos[c] === null)) puntos += PUNTOS_TRES_PICOS_TRIPEAKS;
        }
        return tras({ picos, descarte: [...e.descarte, carta], puntos, racha });
      }
      case 'robar':
        return tras({
          mazo: e.mazo.slice(0, -1),
          descarte: [...e.descarte, e.mazo.at(-1)!],
          racha: 0,
        });
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
      picos: e.picos.map((c, i) =>
        c === null ? null : libreEnTriPeaks(e.picos, i) ? c : 'oculta',
      ),
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      movimientos: e.movimientos,
      puntos: e.puntos,
      racha: e.racha,
      situacion: e.abandonada ? 'abandono' : despejados(e) ? 'victoria' : 'jugando',
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false, puntos: [e.puntos] };
    if (despejados(e)) return { ganadores: [0], empate: false, puntos: [e.puntos] };
    return null;
  },
};
