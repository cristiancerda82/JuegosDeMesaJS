import { PALOS_ESPANOLES, type IdCarta } from '../baraja/cartas';
import type { AccionGuinote, VistaGuinote } from '../juegos/guinote';
import { VALORES_GUINOTE } from '../motor/bazas';
import type { Agente } from './agente';
import { cartaParaResponder, cartaParaSalir } from './bazas-heuristica';

/**
 * IA básica del Guiñote: la heurística de bazas con el orden del Guiñote, más los cantes y el
 * cambio del 7. Es determinista: no usa el azar que recibe.
 */
export const iaGuinoteBasica: Agente<VistaGuinote, AccionGuinote> = {
  id: 'guinote-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

function elegir(vista: VistaGuinote, acciones: readonly AccionGuinote[]): AccionGuinote {
  // 1. Cantar siempre que se pueda: las 40 antes que las 20.
  const cantes = acciones.filter(
    (a): a is Extract<AccionGuinote, { tipo: 'cantar' }> => a.tipo === 'cantar',
  );
  const cante = cantes.find((a) => a.palo === vista.triunfo) ?? cantes[0];
  if (cante) return cante;

  // 2. La muestra que se recibe siempre vale más que la carta que se entrega.
  const cambio = acciones.find((a) => a.tipo === 'cambiarSiete');
  if (cambio) return cambio;

  // 3. Mientras queda mazo, se guardan el rey y la sota de las parejas que aún se pueden cantar.
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  const guardadas = vista.arrastre ? new Set<IdCarta>() : cartasDeParejas(vista);
  const libres = cartas.filter((c) => !guardadas.has(c));
  const candidatas = libres.length > 0 ? libres : cartas;

  const carta =
    vista.mesa.length === 0
      ? cartaParaSalir(vista.triunfo, candidatas, VALORES_GUINOTE)
      : cartaParaResponder(
          {
            asiento: vista.asiento!,
            jugadores: vista.config.jugadores,
            triunfo: vista.triunfo,
            mesa: vista.mesa,
            valores: VALORES_GUINOTE,
          },
          candidatas,
        );
  return { tipo: 'jugar', carta };
}

/** Reyes y sotas de los palos en los que la mano propia aún puede cantar. */
function cartasDeParejas(vista: VistaGuinote): Set<IdCarta> {
  const mano = vista.miMano ?? [];
  const guardadas = new Set<IdCarta>();
  for (const palo of PALOS_ESPANOLES) {
    const rey: IdCarta = `${palo}-12`;
    const sota: IdCarta = `${palo}-10`;
    const cantado = vista.cantes.some((c) => c.palo === palo);
    if (!cantado && mano.includes(rey) && mano.includes(sota)) {
      guardadas.add(rey);
      guardadas.add(sota);
    }
  }
  return guardadas;
}
