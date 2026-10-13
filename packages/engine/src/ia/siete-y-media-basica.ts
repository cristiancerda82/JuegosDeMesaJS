import type { AccionSieteYMedia, VistaSieteYMedia } from '../juegos/siete-y-media';
import type { Agente } from './agente';

/** Umbral para plantarse (5) y valor con el que la banca ya no arriesga (6), en medios puntos. */
const PLANTARSE_DESDE = 10;
const BANCA_SEGURA = 12;

/**
 * IA básica de la Siete y media: apuesta según sus fichas, como punto pide hasta 5 y como banca
 * pide mientras pierda contra lo que se ve de los puntos. Es determinista: no usa el azar.
 */
export const iaSieteYMediaBasica: Agente<VistaSieteYMedia, AccionSieteYMedia> = {
  id: 'siete-y-media-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

function elegir(
  vista: VistaSieteYMedia,
  acciones: readonly AccionSieteYMedia[],
): AccionSieteYMedia {
  const asiento = vista.asiento!;
  if (vista.fase === 'apostar') {
    const deseada = Math.max(1, Math.round(vista.fichas[asiento]! / 10));
    const apuestas = acciones.flatMap((a) => (a.tipo === 'apostar' ? [a.fichas] : []));
    return { tipo: 'apostar', fichas: Math.min(deseada, Math.max(...apuestas)) };
  }

  const valor = vista.miValor!;
  const puedePedir = acciones.some((a) => a.tipo === 'pedir');
  let pedir = valor < PLANTARSE_DESDE;
  if (asiento === vista.banca) {
    // La tapada de cada punto plantado vale, como mínimo, medio punto.
    const amenaza = Math.max(
      0,
      ...vista.estados.flatMap((s, a) =>
        a !== asiento && s === 'plantado' ? [vista.visibles[a]! + 1] : [],
      ),
    );
    pedir ||= valor < BANCA_SEGURA && amenaza > valor;
  }
  return pedir && puedePedir ? { tipo: 'pedir' } : { tipo: 'plantarse' };
}
