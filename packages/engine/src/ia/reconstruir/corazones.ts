import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  corazones,
  type AccionCorazones,
  type ConfigCorazones,
  type EstadoCorazones,
  type VistaCorazones,
} from '../../juegos/corazones';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

const CARTAS_A_PASAR = 3;

/**
 * Un estado de Corazones coherente con la vista: manos ajenas al azar y, durante el pase, las
 * cartas que ya eligieron los demás, al azar entre las de su mano.
 */
export function reconstruirCorazones(vista: VistaCorazones, azar: EstadoAzar): EstadoCorazones {
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      vista.jugadas,
    ),
    azar,
  );
  const manos = manosOcultas(vista.cartasEnMano, vista.asiento, vista.miMano, ocultas);
  // Quien ya pasó conserva su elección (también después del pase, aunque ya no se use).
  const pases = manos.map((mano, a): readonly IdCarta[] | null => {
    if (!vista.pasaron[a]) return null;
    if (a === vista.asiento && vista.miPase !== null) return vista.miPase;
    return barajar(mano, azar).cartas.slice(0, CARTAS_A_PASAR);
  });
  return {
    config: vista.config,
    azar,
    numeroMano: vista.numeroMano,
    manos,
    fase: vista.fase,
    pases,
    recibidas: manos.map((_, a) => (a === vista.asiento ? [...(vista.recibidas ?? [])] : [])),
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazasJugadas: vista.bazasJugadas,
    rotos: vista.rotos,
    puntosMano: [...vista.puntosMano],
    resultadosManos: [...vista.resultadosManos],
    totales: [...vista.totales],
  };
}

export const SIMULABLE_CORAZONES: Simulable<
  ConfigCorazones,
  EstadoCorazones,
  AccionCorazones,
  VistaCorazones
> = {
  juego: corazones,
  reconstruir: reconstruirCorazones,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    // Los puntos son malos: interesa tener menos que la media de los demás.
    const puntos = cerrada ? cerrada.puntos : final.puntosMano;
    const otros = puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return media - puntos[asiento]! + bonoPartida(corazones.resultado(final), asiento);
  },
  reconstrucciones: 24,
  presupuesto: 180,
};
