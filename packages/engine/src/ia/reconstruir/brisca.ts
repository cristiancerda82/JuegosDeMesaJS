import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  brisca,
  bandoDe,
  type AccionBrisca,
  type ConfigBrisca,
  type EstadoBrisca,
  type VistaBrisca,
} from '../../juegos/brisca';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/** Un estado de Brisca coherente con la vista: manos ajenas y mazo, al azar. */
export function reconstruirBrisca(vista: VistaBrisca, azar: EstadoAzar): EstadoBrisca {
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('espanola40'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      vista.muestra === null ? [] : [vista.muestra],
      vista.jugadas,
    ),
    azar,
  );
  const manos = manosOcultas(vista.cartasEnMano, vista.asiento, vista.miMano, ocultas);
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo: ocultas.tomar(vista.mazo),
    muestra: vista.muestra,
    triunfo: vista.triunfo,
    manos,
    mesa: [...vista.mesa],
    turno: vista.turno ?? 0,
    puntos: [...vista.puntos],
    bazas: [...vista.bazas],
    ultimaBaza: vista.ultimaBaza,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Puntos de la mano por bando: los del resultado si ya se cerró, o los que lleva. */
function puntosMano(inicio: EstadoBrisca, final: EstadoBrisca): [number, number] {
  const cerrada = final.resultadosManos[inicio.resultadosManos.length];
  if (cerrada) return [...cerrada.puntos];
  const puntos: [number, number] = [0, 0];
  final.puntos.forEach((p, a) => (puntos[bandoDe(a)] += p));
  return puntos;
}

export const SIMULABLE_BRISCA: Simulable<ConfigBrisca, EstadoBrisca, AccionBrisca, VistaBrisca> = {
  juego: brisca,
  reconstruir: reconstruirBrisca,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const puntos = puntosMano(inicio, final);
    const mio = bandoDe(asiento);
    return puntos[mio] - puntos[1 - mio]! + bonoPartida(brisca.resultado(final), asiento);
  },
  reconstrucciones: 40,
  presupuesto: 160,
};
