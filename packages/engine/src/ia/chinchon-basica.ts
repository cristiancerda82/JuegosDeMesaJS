import { esComodin, type IdCarta } from '../baraja/cartas';
import {
  esChinchon,
  mejorReparto,
  puntosCarta,
  type AccionChinchon,
  type VistaChinchon,
} from '../juegos/chinchon';
import type { Agente } from './agente';

/**
 * IA básica del Chinchón: decide con la mejor combinación de su mano (design, decisión 5).
 * Es determinista y solo usa su vista: su mano y la carta de arriba del descarte.
 */
export const iaChinchonBasica: Agente<VistaChinchon, AccionChinchon> = {
  id: 'chinchon-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

const sin = (mano: readonly IdCarta[], carta: IdCarta) => mano.filter((c) => c !== carta);

/** Puntos sueltos de la mejor mano posible tras descartar una de estas cartas. */
function mejorTrasDescartar(
  mano: readonly IdCarta[],
  vista: VistaChinchon,
  prohibida: IdCarta | null,
): number {
  let mejor = Infinity;
  for (const carta of mano) {
    if (carta === prohibida) continue;
    mejor = Math.min(mejor, mejorReparto(sin(mano, carta), vista.config.baraja).puntos);
  }
  return mejor;
}

function elegir(vista: VistaChinchon, acciones: readonly AccionChinchon[]): AccionChinchon {
  const mano = vista.miMano ?? [];
  const baraja = vista.config.baraja;

  if (vista.fase === 'robar') {
    const delDescarte = acciones.find((a) => a.tipo === 'robar' && a.desde === 'descarte');
    const delMazo = acciones.find((a) => a.tipo === 'robar' && a.desde === 'mazo');
    if (!delMazo) return delDescarte!;
    const arriba = vista.descarteArriba;
    if (!delDescarte || arriba === null) return delMazo;
    // Solo roba del descarte si esa carta le deja una mano mejor que la que ya tiene.
    const ahora = mejorReparto(mano, baraja).puntos;
    const conElla = mejorTrasDescartar([...mano, arriba], vista, arriba);
    return conElla < ahora ? delDescarte : delMazo;
  }

  // Cierra siempre que puede: primero el chinchón, después el cierre con menos puntos.
  const cierres = acciones.filter(
    (a): a is Extract<AccionChinchon, { tipo: 'cerrar' }> => a.tipo === 'cerrar',
  );
  if (cierres.length > 0) {
    const valorCierre = (a: (typeof cierres)[number]) => {
      const resto = sin(mano, a.carta);
      if (esChinchon(resto, baraja)) return -Infinity;
      const { puntos, sueltas } = mejorReparto(resto, baraja);
      return sueltas.length === 0 ? -10 : puntos;
    };
    return [...cierres].sort((a, b) => valorCierre(a) - valorCierre(b))[0]!;
  }

  // Descarta lo que menos sirve; a igualdad, la carta de más valor. Nunca un comodín si hay otra.
  const descartes = acciones.filter(
    (a): a is Extract<AccionChinchon, { tipo: 'descartar' }> => a.tipo === 'descartar',
  );
  const sinComodin = descartes.filter((a) => !esComodin(a.carta));
  const candidatos = sinComodin.length > 0 ? sinComodin : descartes;
  const puntosTras = (a: (typeof candidatos)[number]) =>
    mejorReparto(sin(mano, a.carta), baraja).puntos;
  return [...candidatos].sort(
    (a, b) => puntosTras(a) - puntosTras(b) || puntosCarta(b.carta) - puntosCarta(a.carta),
  )[0]!;
}
