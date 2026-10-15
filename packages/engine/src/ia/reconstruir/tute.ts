import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import { bandoDe } from '../../motor/bazas';
import {
  puntosPorBando,
  tute,
  type AccionTute,
  type ConfigTute,
  type EstadoTute,
  type VistaTute,
} from '../../juegos/tute';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/** Ganar la mano vale más que los puntos: el Tute se juega a manos ganadas. */
const PREMIO_MANO = 60;

/**
 * Un estado de Tute coherente con la vista: manos ajenas y mazo, al azar. Con 4 jugadores, la
 * carta que marcó el triunfo sigue en la mano del repartidor mientras no la juegue.
 */
export function reconstruirTute(vista: VistaTute, azar: EstadoAzar): EstadoTute {
  const triunfoAjeno =
    vista.cartaTriunfo !== null && vista.repartidor !== vista.asiento ? vista.cartaTriunfo : null;
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('espanola40'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      vista.muestra === null ? [] : [vista.muestra],
      triunfoAjeno === null ? [] : [triunfoAjeno],
      vista.jugadas,
    ),
    azar,
  );
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === vista.asiento && vista.miMano) return [...vista.miMano];
    if (a === vista.repartidor && triunfoAjeno !== null) {
      return [...ocultas.tomar(n - 1), triunfoAjeno];
    }
    return ocultas.tomar(n);
  });
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo: ocultas.tomar(vista.mazo),
    muestra: vista.muestra,
    cartaTriunfo: vista.cartaTriunfo,
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
  };
}

export const SIMULABLE_TUTE: Simulable<ConfigTute, EstadoTute, AccionTute, VistaTute> = {
  juego: tute,
  reconstruir: reconstruirTute,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const mio = bandoDe(asiento);
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const puntos = cerrada ? cerrada.puntos : puntosPorBando(final.puntos, final.cantes);
    const premio =
      !cerrada || cerrada.ganador === null
        ? 0
        : cerrada.ganador === mio
          ? PREMIO_MANO
          : -PREMIO_MANO;
    return puntos[mio] - puntos[1 - mio]! + premio + bonoPartida(tute.resultado(final), asiento);
  },
  reconstrucciones: 24,
  presupuesto: 200,
};
