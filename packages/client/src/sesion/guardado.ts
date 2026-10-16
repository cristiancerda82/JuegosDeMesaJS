import { NIVELES_IA, VERSION_MOTOR, type Jugada, type NivelIA } from '@juegos/engine';
import { ID_JUEGOS, type IdJuego } from './juegos';

/**
 * Partida guardada como registro repetible (design, decisión 12): con la configuración, la
 * semilla y las jugadas se reconstruye el estado, lo que además verifica el determinismo.
 */
export interface Guardado {
  readonly version: number;
  readonly motor: number;
  readonly juego: IdJuego;
  readonly config: unknown;
  readonly semilla: string;
  readonly jugadas: readonly Jugada<unknown>[];
  /** Tiempo jugado, medido por el cliente (el motor no lee la hora). */
  readonly tiempoMs: number;
  /** Nivel de la IA; falta en las partidas guardadas antes de los niveles (se toman en Normal). */
  readonly nivel?: NivelIA;
  /** Pistas pedidas en los solitarios; falta en las partidas guardadas antes de las pistas. */
  readonly pistas?: number;
}

export const VERSION_GUARDADO = 1;
const CLAVE = 'juegos-de-mesa/partida';

/** El almacenamiento puede no existir o fallar (modo privado, cuota): nunca rompe la app. */
function almacen(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function guardar(g: Omit<Guardado, 'version' | 'motor'>): void {
  try {
    almacen()?.setItem(
      CLAVE,
      JSON.stringify({ version: VERSION_GUARDADO, motor: VERSION_MOTOR, ...g }),
    );
  } catch {
    // Sin espacio o sin permiso: la partida sigue, solo que no se podrá retomar.
  }
}

export function borrarGuardado(): void {
  try {
    almacen()?.removeItem(CLAVE);
  } catch {
    // Nada que hacer.
  }
}

export type Lectura =
  | { readonly tipo: 'nada' }
  | { readonly tipo: 'valido'; readonly guardado: Guardado }
  | { readonly tipo: 'invalido' };

/** Lee el guardado y comprueba su forma y su versión; no lo repite (eso lo hace la sesión). */
export function leerGuardado(): Lectura {
  let texto: string | null;
  try {
    texto = almacen()?.getItem(CLAVE) ?? null;
  } catch {
    return { tipo: 'nada' };
  }
  if (texto === null) return { tipo: 'nada' };
  try {
    const g = JSON.parse(texto) as Partial<Guardado>;
    const valido =
      g.version === VERSION_GUARDADO &&
      g.motor === VERSION_MOTOR &&
      ID_JUEGOS.includes(g.juego as IdJuego) &&
      typeof g.semilla === 'string' &&
      Array.isArray(g.jugadas) &&
      typeof g.tiempoMs === 'number' &&
      typeof g.config === 'object' &&
      g.config !== null &&
      (g.nivel === undefined || NIVELES_IA.includes(g.nivel)) &&
      (g.pistas === undefined || (Number.isInteger(g.pistas) && g.pistas >= 0));
    return valido ? { tipo: 'valido', guardado: g as Guardado } : { tipo: 'invalido' };
  } catch {
    return { tipo: 'invalido' };
  }
}
