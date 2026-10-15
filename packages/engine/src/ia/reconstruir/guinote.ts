import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  guinote,
  type AccionGuinote,
  type ConfigGuinote,
  type EstadoGuinote,
  type VistaGuinote,
} from '../../juegos/guinote';
import { bandoDe } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/** Un estado de Guiñote coherente con la vista: manos ajenas y mazo, al azar. */
export function reconstruirGuinote(vista: VistaGuinote, azar: EstadoAzar): EstadoGuinote {
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
    cantes: [...vista.cantes],
    puedeCantar: vista.puedeCantar,
    resultadosManos: [...vista.resultadosManos],
    totales: vista.totales,
  };
}

/** Puntos de la mano por bando: los del resultado si ya se cerró, o bazas y cantes si no. */
function puntosMano(inicio: EstadoGuinote, final: EstadoGuinote): readonly [number, number] {
  const cerrada = final.resultadosManos[inicio.resultadosManos.length];
  if (cerrada) return cerrada.puntos;
  const puntos: [number, number] = [0, 0];
  final.puntos.forEach((p, a) => (puntos[bandoDe(a)] += p));
  for (const c of final.cantes) puntos[bandoDe(c.asiento)] += c.puntos;
  return puntos;
}

export const SIMULABLE_GUINOTE: Simulable<
  ConfigGuinote,
  EstadoGuinote,
  AccionGuinote,
  VistaGuinote
> = {
  juego: guinote,
  reconstruir: reconstruirGuinote,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const puntos = puntosMano(inicio, final);
    const mio = bandoDe(asiento);
    return puntos[mio] - puntos[1 - mio]! + bonoPartida(guinote.resultado(final), asiento);
  },
  reconstrucciones: 30,
  presupuesto: 180,
};
