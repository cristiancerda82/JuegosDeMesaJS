import type { AccionBrisca, VistaBrisca } from '../juegos/brisca';
import type { Agente } from './agente';
import { cartaParaResponder, cartaParaSalir } from './bazas-heuristica';

/**
 * IA básica de la Brisca: reglas en orden de prioridad, sin búsqueda.
 * Es determinista: no usa el azar que recibe.
 */
export const iaBriscaBasica: Agente<VistaBrisca, AccionBrisca> = {
  id: 'brisca-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

function elegir(vista: VistaBrisca, acciones: readonly AccionBrisca[]): AccionBrisca {
  // La muestra que se recibe siempre vale más que la carta que se entrega.
  const cambio = acciones.find((a) => a.tipo === 'cambiarMuestra');
  if (cambio) return cambio;

  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  const carta =
    vista.mesa.length === 0
      ? cartaParaSalir(vista.triunfo, cartas)
      : cartaParaResponder(
          {
            asiento: vista.asiento!,
            jugadores: vista.config.jugadores,
            triunfo: vista.triunfo,
            mesa: vista.mesa,
          },
          cartas,
        );
  return { tipo: 'jugar', carta };
}
