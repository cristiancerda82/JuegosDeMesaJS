import { ID_JUEGOS, type IdJuego } from '../sesion/juegos';
import type { Baraja } from './catalogo';

/**
 * Favoritos y últimos jugados (spec menu-juegos; design, decisión 2): funciones puras sobre
 * listas de ids. El estado reactivo y el guardado están en `preferencias.svelte.ts`.
 */

export const MAX_RECIENTES = 10;

/** Si el juego era favorito, lo quita; si no, lo pone el primero. */
export function alternarFavorito(lista: readonly IdJuego[], id: IdJuego): IdJuego[] {
  return lista.includes(id) ? lista.filter((j) => j !== id) : [id, ...lista];
}

/** Pone el juego el primero, sin repetirlo, y se queda con los 10 más recientes. */
export function registrarReciente(lista: readonly IdJuego[], id: IdJuego): IdJuego[] {
  return [id, ...lista.filter((j) => j !== id)].slice(0, MAX_RECIENTES);
}

/**
 * Lee una lista guardada. Tolera cualquier cosa: JSON roto, otro tipo de dato o juegos que ya
 * no existen se ignoran sin error, y los repetidos se quitan.
 */
export function leerLista(texto: string | null): IdJuego[] {
  if (texto === null) return [];
  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return [];
  }
  if (!Array.isArray(datos)) return [];
  const validos = datos.filter((x): x is IdJuego => (ID_JUEGOS as readonly unknown[]).includes(x));
  return [...new Set(validos)];
}

export type FiltroBaraja = Baraja | 'todas';

/** El filtro guardado, o `'todas'` si no hay o no es válido. */
export function leerFiltro(texto: string | null): FiltroBaraja {
  return texto === 'espanola' || texto === 'francesa' ? texto : 'todas';
}

// ── Almacenamiento ───────────────────────────────────────────────────────────

export const CLAVES = {
  favoritos: 'juegos-de-mesa/favoritos',
  recientes: 'juegos-de-mesa/recientes',
  filtro: 'juegos-de-mesa/filtro-baraja',
} as const;

/** Lee una clave; el almacenamiento puede no existir o fallar (modo privado): devuelve `null`. */
export function leerClave(clave: string): string | null {
  try {
    return globalThis.localStorage?.getItem(clave) ?? null;
  } catch {
    return null;
  }
}

/** Guarda una clave; si falla, el valor vale solo para esta visita (lo conserva el estado en memoria). */
export function guardarClave(clave: string, valor: string): void {
  try {
    globalThis.localStorage?.setItem(clave, valor);
  } catch {
    // Sin espacio o sin permiso.
  }
}
