/**
 * Ajustes por parámetros de la URL, pensados para pruebas y depuración:
 * - `?semilla=<texto>` fija la semilla de las partidas nuevas (partidas reproducibles).
 * - `?rapido` acorta las pausas de la IA y de las bazas.
 */
const parametros = new URLSearchParams(globalThis.location?.search ?? '');

export const SEMILLA_FIJA: string | null = parametros.get('semilla');

export const FACTOR_PAUSAS: number = parametros.has('rapido') ? 0.05 : 1;
