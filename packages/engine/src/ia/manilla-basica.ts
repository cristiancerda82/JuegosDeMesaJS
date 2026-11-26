import type { AccionManilla, VistaManilla } from '../juegos/manilla';
import type { Agente } from './agente';
import { cartaEnPareja } from './butifarra-basica';

/**
 * IA básica de la Manilla: juega en pareja como la de la Butifarra, con el triunfo del pinte.
 * Es determinista: no usa el azar que recibe.
 */
export const iaManillaBasica: Agente<VistaManilla, AccionManilla> = {
  id: 'manilla-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const cartas = acciones.map((a) => a.carta);
    const carta =
      cartas.length === 1
        ? cartas[0]!
        : cartaEnPareja(
            {
              asiento: vista.asiento!,
              triunfo: vista.triunfo,
              miMano: vista.miMano,
              mesa: vista.mesa,
              bazasJugadas: vista.bazasJugadas,
            },
            cartas,
          );
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
