import type { IdFamilia } from './catalogo';

/**
 * Qué está viendo el jugador en el menú (design, decisión 4). Vive fuera de `Menu.svelte` para
 * que, al ir a las opciones de un juego y volver, se vuelva a la misma familia o búsqueda. No se
 * guarda en el dispositivo: al recargar se empieza en las familias.
 */
export const navegacion = $state<{ familia: IdFamilia | null; busqueda: string }>({
  familia: null,
  busqueda: '',
});
