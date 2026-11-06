import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_CONQUIAN,
  conquian,
  type AccionConquian,
  type ConfigConquian,
  type EstadoConquian,
  type VistaConquian,
} from '../../juegos/conquian';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Un estado de Conquián coherente con la vista: la mano del rival y el mazo al azar entre las
 * cartas que no se ven. Las combinaciones, las muertas y la descubierta están a la vista.
 */
export function reconstruirConquian(vista: VistaConquian, azar: EstadoAzar): EstadoConquian {
  const yo = vista.asiento ?? 0;
  const mia = vista.miMano ?? [];
  const { cartas } = barajar(
    cartasFuera(
      BARAJA_CONQUIAN,
      mia,
      vista.muertas,
      vista.combinaciones.flat(2),
      vista.descubierta ? [vista.descubierta] : [],
    ),
    azar,
  );
  const rival = 1 - yo;
  const nRival = vista.cartasEnMano[rival]!;
  const manos = [0, 1].map((a) =>
    a === yo && vista.miMano ? [...vista.miMano] : a === rival ? cartas.slice(0, nRival) : [],
  );
  return {
    config: vista.config,
    azar,
    empieza: vista.empieza,
    manos,
    mazo: cartas.slice(nRival, nRival + vista.enMazo),
    muertas: [...vista.muertas],
    combinaciones: vista.combinaciones.map((cs) => cs.map((c) => [...c])),
    descubierta: vista.descubierta,
    origen: vista.origen,
    deQuien: vista.deQuien,
    ofrecidaA: vista.ofrecidaA,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    ganadas: [...vista.ganadas],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_CONQUIAN: Simulable<
  ConfigConquian,
  EstadoConquian,
  AccionConquian,
  VistaConquian
> = {
  juego: conquian,
  reconstruir: reconstruirConquian,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // Se simulan usar o pasar, con qué jugada y el descarte.
  decideLaBase: () => false,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(conquian.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    const mano = !r || r.ganador === null ? 0 : r.ganador === asiento ? 1 : -1;
    return mano + bono;
  },
  reconstrucciones: 30,
  presupuesto: 300,
};
