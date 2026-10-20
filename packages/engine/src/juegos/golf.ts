import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigGolf {
  /** Si la K y el As se tocan: sobre una K va un As, y sobre un As una K. */
  readonly vuelta: boolean;
}

export const CONFIG_GOLF_POR_DEFECTO: ConfigGolf = { vuelta: false };

interface Tablero {
  /** Las 7 columnas; la carta que se puede mover es la última. */
  readonly columnas: readonly (readonly IdCarta[])[];
  /** Boca abajo; se roba del final. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la de arriba es la última. */
  readonly descarte: readonly IdCarta[];
}

export interface EstadoGolf extends Tablero {
  readonly config: ConfigGolf;
  readonly movimientos: number;
  /** Tablero antes de cada acción, para deshacer. */
  readonly historial: readonly Tablero[];
  readonly abandonada: boolean;
}

export type AccionGolf =
  | { readonly tipo: 'mover'; readonly columna: number }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'abandonar' };

export interface VistaGolf {
  readonly config: ConfigGolf;
  readonly columnas: readonly (readonly IdCarta[])[];
  readonly mazo: number;
  readonly descarte: readonly IdCarta[];
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const COLUMNAS_GOLF = 7;
export const CARTAS_POR_COLUMNA_GOLF = 5;
const EN_COLUMNAS = COLUMNAS_GOLF * CARTAS_POR_COLUMNA_GOLF;

/** As 1, los números lo que marcan, J 11, Q 12 y K 13. */
export const valorGolf = (carta: IdCarta) => cartaDeId(carta)!.valor;

/** `carta` puede ir sobre `arriba`: una más o una menos, y con vuelta la K y el As se tocan. */
export function encajaGolf(carta: IdCarta, arriba: IdCarta, vuelta: boolean): boolean {
  const diferencia = Math.abs(valorGolf(carta) - valorGolf(arriba));
  return diferencia === 1 || (vuelta && diferencia === 12);
}

const vacias = (t: Tablero) => t.columnas.every((c) => c.length === 0);

const tablero = (e: EstadoGolf): Tablero => ({
  columnas: e.columnas,
  mazo: e.mazo,
  descarte: e.descarte,
});

// ── Juego ────────────────────────────────────────────────────────────────────

export const golf: Juego<ConfigGolf, EstadoGolf, AccionGolf, VistaGolf> = {
  id: 'golf',

  crear(config, semilla) {
    if (typeof config.vuelta !== 'boolean') return error('Opción de vuelta inválida');
    const { cartas } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const columnas = Array.from({ length: COLUMNAS_GOLF }, (_, i) =>
      cartas.slice(i * CARTAS_POR_COLUMNA_GOLF, (i + 1) * CARTAS_POR_COLUMNA_GOLF),
    );
    const resto = cartas.slice(EN_COLUMNAS);
    return ok({
      config: { vuelta: config.vuelta },
      columnas,
      descarte: [resto.at(-1)!],
      mazo: resto.slice(0, -1),
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || golf.resultado(e) !== null) return [];
    const acciones: AccionGolf[] = [];
    const arriba = e.descarte.at(-1)!;
    e.columnas.forEach((c, columna) => {
      const ultima = c.at(-1);
      if (ultima !== undefined && encajaGolf(ultima, arriba, e.config.vuelta)) {
        acciones.push({ tipo: 'mover', columna });
      }
    });
    if (e.mazo.length > 0) acciones.push({ tipo: 'robar' });
    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    const tras = (t: Partial<Tablero>): EstadoGolf => ({
      ...e,
      ...t,
      movimientos: e.movimientos + 1,
      historial: [...e.historial, tablero(e)],
    });
    switch (accion.tipo) {
      case 'mover': {
        const carta = e.columnas[accion.columna]!.at(-1)!;
        return tras({
          columnas: e.columnas.map((c, i) => (i === accion.columna ? c.slice(0, -1) : c)),
          descarte: [...e.descarte, carta],
        });
      }
      case 'robar':
        return tras({ mazo: e.mazo.slice(0, -1), descarte: [...e.descarte, e.mazo.at(-1)!] });
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
      columnas: e.columnas.map((c) => [...c]),
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      movimientos: e.movimientos,
      situacion: e.abandonada ? 'abandono' : vacias(e) ? 'victoria' : 'jugando',
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false };
    if (vacias(e)) return { ganadores: [0], empate: false };
    return null;
  },
};
