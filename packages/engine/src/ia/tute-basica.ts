import { PALOS_ESPANOLES, type IdCarta } from '../baraja/cartas';
import type { AccionTute, VistaTute } from '../juegos/tute';
import type { Agente } from './agente';
import { cartaParaResponder, cartaParaSalir } from './bazas-heuristica';

/**
 * IA básica del Tute: la heurística de bazas de la Brisca más los cantes.
 * Es determinista: no usa el azar que recibe.
 */
export const iaTuteBasica: Agente<VistaTute, AccionTute> = {
  id: 'tute-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

function elegir(vista: VistaTute, acciones: readonly AccionTute[]): AccionTute {
  // 1. El tute gana la mano en el acto.
  const tute = acciones.find((a) => a.tipo === 'cantarTute');
  if (tute) return tute;

  // 2. Cantar siempre que se pueda: las 40 antes que las 20.
  const cantes = acciones.filter(
    (a): a is Extract<AccionTute, { tipo: 'cantar' }> => a.tipo === 'cantar',
  );
  const cante = cantes.find((a) => a.palo === vista.triunfo) ?? cantes[0];
  if (cante) return cante;

  // 3. La muestra que se recibe siempre vale más que la carta que se entrega.
  const cambio = acciones.find((a) => a.tipo === 'cambiarSiete');
  if (cambio) return cambio;

  // 4. Se guardan el rey y el caballo de las parejas que aún se pueden cantar.
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  const guardadas = cartasDeParejas(vista);
  const libres = cartas.filter((c) => !guardadas.has(c));
  const candidatas = libres.length > 0 ? libres : cartas;

  const carta =
    vista.mesa.length === 0
      ? cartaParaSalir(vista.triunfo, candidatas)
      : cartaParaResponder(
          {
            asiento: vista.asiento!,
            jugadores: vista.config.jugadores,
            triunfo: vista.triunfo,
            mesa: vista.mesa,
          },
          candidatas,
        );
  return { tipo: 'jugar', carta };
}

/** Reyes y caballos de los palos en los que la mano propia aún puede cantar. */
function cartasDeParejas(vista: VistaTute): Set<IdCarta> {
  const mano = vista.miMano ?? [];
  const guardadas = new Set<IdCarta>();
  for (const palo of PALOS_ESPANOLES) {
    const rey: IdCarta = `${palo}-12`;
    const caballo: IdCarta = `${palo}-11`;
    const cantado = vista.cantes.some((c) => c.palo === palo);
    if (!cantado && mano.includes(rey) && mano.includes(caballo)) {
      guardadas.add(rey);
      guardadas.add(caballo);
    }
  }
  return guardadas;
}
