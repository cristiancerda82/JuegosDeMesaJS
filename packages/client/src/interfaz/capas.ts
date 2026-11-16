/**
 * Registro de las capas abiertas (guías, paneles flotantes, listas que tapan la pantalla)
 * para que el botón atrás de Android cierre primero la última que se abrió (red-publica-movil,
 * design, decisión 9). Los paneles de fin de mano no se apuntan: forman parte del juego.
 */
const pila: { cerrar: () => void }[] = [];

/** Apunta una capa abierta; devuelve la función que la da de baja (útil en un `$effect`). */
export function abrirCapa(cerrar: () => void): () => void {
  const capa = { cerrar };
  pila.push(capa);
  return () => {
    const i = pila.indexOf(capa);
    if (i >= 0) pila.splice(i, 1);
  };
}

/** Cierra la última capa abierta. Devuelve si había alguna. */
export function cerrarUltimaCapa(): boolean {
  const capa = pila.at(-1);
  if (!capa) return false;
  capa.cerrar();
  // Por si la capa no se dio de baja al cerrarse, para no quedarse atascado en ella.
  const i = pila.indexOf(capa);
  if (i >= 0) pila.splice(i, 1);
  return true;
}

/** Número de capas abiertas (para los tests). */
export const capasAbiertas = () => pila.length;
