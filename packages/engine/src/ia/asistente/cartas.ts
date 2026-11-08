import { cartaDeId, esComodin, esExcusa, esTriunfoTarot, type IdCarta } from '../../baraja/cartas';

/** Es el id de una carta: de palo, comodín, triunfo del Tarot o la Excusa. */
export const esIdCarta = (x: string): x is IdCarta =>
  cartaDeId(x) !== null || esComodin(x) || esTriunfoTarot(x) || esExcusa(x);

/**
 * Todas las cartas que nombra una acción, en el orden en que aparecen (sin repetir): la que se
 * juega, las que se recogen, las que se descartan… Sirve para resaltarlas en la mesa sin saber
 * nada del juego (spec modo-asistido, «Sugerencia de jugada»; design, decisión 5).
 */
export function cartasDeAccion(accion: unknown): IdCarta[] {
  const vistas = new Set<IdCarta>();
  const visitar = (x: unknown): void => {
    if (typeof x === 'string') {
      if (esIdCarta(x)) vistas.add(x);
    } else if (Array.isArray(x)) {
      for (const y of x) visitar(y);
    } else if (x !== null && typeof x === 'object') {
      for (const y of Object.values(x)) visitar(y);
    }
  };
  visitar(accion);
  return [...vistas];
}

/** La carta que juega una acción de un juego de bazas o de captura (`{ carta }`), si la hay. */
export function cartaJugada(accion: unknown): IdCarta | null {
  const carta = (accion as { readonly carta?: unknown } | null)?.carta;
  return typeof carta === 'string' && esIdCarta(carta) ? carta : null;
}
