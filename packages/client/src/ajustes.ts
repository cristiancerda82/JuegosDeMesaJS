/**
 * Ajustes por parámetros de la URL, pensados para pruebas y depuración:
 * - `?semilla=<texto>` fija la semilla de las partidas nuevas (partidas reproducibles).
 * - `?rapido` acorta las pausas de la IA y de las bazas.
 * - `?atras` simula el botón atrás de Android en el navegador: el evento `atras` de `window`
 *   hace lo mismo que el botón, y salir de la app marca `data-app-cerrada` en `<html>`.
 */
const parametros = new URLSearchParams(globalThis.location?.search ?? '');

export const SEMILLA_FIJA: string | null = parametros.get('semilla');

export const FACTOR_PAUSAS: number = parametros.has('rapido') ? 0.05 : 1;

export const SIMULAR_ATRAS: boolean = parametros.has('atras');
