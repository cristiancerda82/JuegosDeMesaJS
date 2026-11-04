import type { IdCarta } from '../baraja/cartas';
import {
  efectoPishti,
  esJotaPishti,
  puntosCartaPishti,
  rangoPishti,
  type AccionPishti,
  type VistaPishti,
} from '../juegos/pishti';
import type { Agente } from './agente';

/**
 * IA básica del Pishti: puntúa cada carta que puede echar y elige la mejor (la primera, si
 * empatan). Es determinista y solo usa su vista: su mano, el montón y las cartas echadas.
 */
export const iaPishtiBasica: Agente<VistaPishti, AccionPishti> = {
  id: 'pishti-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    let mejor = acciones[0]!;
    let mejorValor = -Infinity;
    for (const accion of acciones) {
      const valor = valorarPishti(vista, accion);
      if (valor > mejorValor) {
        mejor = accion;
        mejorValor = valor;
      }
    }
    return { accion: mejor, azar };
  },
};

/** Lo que vale cada punto de pishti (un pishti de 10 vale 1000). */
const PISHTI = 100;
const CARTA = 5;
const PUNTO = 30;
/** Lo que cuesta gastar una J sin hacer pishti. */
const GASTAR_JOTA = 60;
const RIESGO_PISHTI = 300;
const RIESGO_PISHTI_JOTA = 600;

/** Lo que vale llevarse estas cartas (las tapadas solo cuentan como cartas). */
const valorMonton = (cartas: readonly IdCarta[], tapadas: number) =>
  CARTA * (cartas.length + tapadas) + PUNTO * cartas.reduce((s, c) => s + puntosCartaPishti(c), 0);

/** La valoración de una carta (spec ia-jugadores). */
export function valorarPishti(vista: VistaPishti, accion: AccionPishti): number {
  const { carta } = accion;
  const { lleva, pishti } = efectoPishti(vista.monton, vista.tapadas, carta);
  if (lleva) {
    let valor = PISHTI * pishti + valorMonton([...vista.monton, carta], vista.tapadas);
    if (pishti === 0 && esJotaPishti(carta)) valor -= GASTAR_JOTA;
    return valor;
  }
  let valor = -PUNTO * puntosCartaPishti(carta);
  if (vista.monton.length === 0 && vista.tapadas === 0) {
    const rango = rangoPishti(carta);
    const vistas = new Set([...(vista.miMano ?? []), ...vista.vistasMano]);
    const quedan = 4 - [...vistas].filter((c) => rangoPishti(c) === rango).length;
    if (quedan > 0) valor -= esJotaPishti(carta) ? RIESGO_PISHTI_JOTA : RIESGO_PISHTI;
  } else {
    valor -= valorMonton([...vista.monton, carta], vista.tapadas) / 2;
  }
  return valor;
}
