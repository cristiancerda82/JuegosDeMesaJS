import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

/** Sin opciones: las reglas son siempre las clásicas. */
export type ConfigScorpion = Record<string, never>;

export const CONFIG_SCORPION_POR_DEFECTO: ConfigScorpion = {};

export interface ColumnaScorpion {
  /** Cartas boca abajo, de abajo hacia arriba. */
  readonly ocultas: readonly IdCarta[];
  /** Cartas boca arriba, de abajo hacia arriba. */
  readonly visibles: readonly IdCarta[];
}

interface Tablero {
  readonly columnas: readonly ColumnaScorpion[];
  /** Boca abajo; se reparte de una vez a las 3 primeras columnas. */
  readonly reserva: readonly IdCarta[];
}

export interface EstadoScorpion extends Tablero {
  readonly config: ConfigScorpion;
  readonly movimientos: number;
  /** Tablero antes de cada movimiento o reparto, para deshacer. */
  readonly historial: readonly Tablero[];
  readonly abandonada: boolean;
}

export type AccionScorpion =
  | {
      readonly tipo: 'mover';
      readonly desde: number;
      readonly hasta: number;
      /** Cartas que se mueven: la elegida y todas las que tiene encima. */
      readonly cantidad: number;
    }
  | { readonly tipo: 'repartir' }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'abandonar' };

export interface VistaScorpion {
  readonly config: ConfigScorpion;
  readonly columnas: readonly {
    readonly ocultas: number;
    readonly visibles: readonly IdCarta[];
  }[];
  readonly reserva: number;
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reglas ───────────────────────────────────────────────────────────────────

export const COLUMNAS_SCORPION = 7;
const CARTAS_POR_COLUMNA = 7;
/** Columnas con cartas tapadas, y cuántas. */
const COLUMNAS_CON_TAPADAS = 4;
const TAPADAS = 3;
/** Columnas que reciben la reserva. */
const COLUMNAS_RESERVA = 3;
const REY = 13;

const valor = (c: IdCarta) => cartaDeId(c)!.valor;
const palo = (c: IdCarta) => cartaDeId(c)!.palo as PaloFrances;

/** `carta` puede ir sobre `tope`: la siguiente de su palo, o una K en una columna vacía. */
export function encajaScorpion(carta: IdCarta, tope: IdCarta | undefined): boolean {
  if (tope === undefined) return valor(carta) === REY;
  return palo(carta) === palo(tope) && valor(carta) === valor(tope) - 1;
}

/** Las cartas forman una escalera de la K al As del mismo palo. */
const esEscaleraCompleta = (cartas: readonly IdCarta[]) =>
  cartas.length === REY &&
  cartas.every((c, i) => palo(c) === palo(cartas[0]!) && valor(c) === REY - i);

const ganada = (t: Tablero) =>
  t.reserva.length === 0 &&
  t.columnas.every(
    (c) => c.ocultas.length === 0 && (c.visibles.length === 0 || esEscaleraCompleta(c.visibles)),
  );

// ── Juego ────────────────────────────────────────────────────────────────────

export const scorpion: Juego<ConfigScorpion, EstadoScorpion, AccionScorpion, VistaScorpion> = {
  id: 'scorpion',

  crear(config, semilla) {
    if (typeof config !== 'object' || config === null) return error('Configuración no válida');
    const { cartas } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    const columnas: ColumnaScorpion[] = Array.from({ length: COLUMNAS_SCORPION }, (_, i) => {
      const propias = cartas.slice(i * CARTAS_POR_COLUMNA, (i + 1) * CARTAS_POR_COLUMNA);
      const tapadas = i < COLUMNAS_CON_TAPADAS ? TAPADAS : 0;
      return { ocultas: propias.slice(0, tapadas), visibles: propias.slice(tapadas) };
    });
    return ok({
      config: {},
      columnas,
      reserva: cartas.slice(COLUMNAS_SCORPION * CARTAS_POR_COLUMNA),
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || scorpion.resultado(e) !== null) return [];
    const acciones: AccionScorpion[] = [];
    e.columnas.forEach((c, desde) => {
      c.visibles.forEach((carta, k) => {
        const cantidad = c.visibles.length - k;
        // Una K que ya está al fondo de su columna no gana nada pasando a otra vacía.
        const alFondo = k === 0 && c.ocultas.length === 0;
        e.columnas.forEach((d, hasta) => {
          if (hasta === desde) return;
          const vacia = d.ocultas.length + d.visibles.length === 0;
          if (vacia && alFondo) return;
          if (encajaScorpion(carta, vacia ? undefined : d.visibles.at(-1))) {
            acciones.push({ tipo: 'mover', desde, hasta, cantidad });
          }
        });
      });
    });
    if (e.reserva.length > 0) acciones.push({ tipo: 'repartir' });
    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    const tablero: Tablero = { columnas: e.columnas, reserva: e.reserva };
    switch (accion.tipo) {
      case 'mover':
      case 'repartir': {
        const columnas = e.columnas.map((c) => ({
          ocultas: [...c.ocultas],
          visibles: [...c.visibles],
        }));
        let reserva = e.reserva;
        if (accion.tipo === 'mover') {
          const origen = columnas[accion.desde]!;
          const cartas = origen.visibles.splice(origen.visibles.length - accion.cantidad);
          columnas[accion.hasta]!.visibles.push(...cartas);
        } else {
          e.reserva.forEach((c, i) => columnas[i % COLUMNAS_RESERVA]!.visibles.push(c));
          reserva = [];
        }
        // La carta tapada que queda arriba se da la vuelta.
        for (const c of columnas) {
          if (c.visibles.length === 0 && c.ocultas.length > 0) c.visibles.push(c.ocultas.pop()!);
        }
        return {
          ...e,
          columnas,
          reserva,
          movimientos: e.movimientos + 1,
          historial: [...e.historial, tablero],
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
      reserva: e.reserva.length,
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
