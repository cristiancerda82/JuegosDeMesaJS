import type { IdCarta } from '../baraja/cartas';
import {
  ordenCuatroSeises,
  posicionCuatroSeises,
  type AccionCuatroSeises,
  type VistaCuatroSeises,
} from '../juegos/cuatro-seises';
import type { Agente } from './agente';
import { elegirEnEscaleras } from './cinquillo-basica';

/**
 * IA básica del Cuatro seises: la del Cinquillo con las escaleras naciendo del 6. Prefiere las
 * cartas que acercan las suyas y no abren camino a los demás, así que guarda los seises que no
 * le hacen falta. Es determinista: no usa el azar que recibe.
 */
export const iaCuatroSeisesBasica: Agente<VistaCuatroSeises, AccionCuatroSeises> = {
  id: 'cuatro-seises-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const { baraja } = vista.config;
    const orden = ordenCuatroSeises(baraja);
    const accion = elegirEnEscaleras(
      vista.miMano ?? [],
      acciones,
      (c: IdCarta) => posicionCuatroSeises(c, baraja),
      orden.indexOf(6),
      orden.length - 1,
    );
    return { accion, azar };
  },
};
