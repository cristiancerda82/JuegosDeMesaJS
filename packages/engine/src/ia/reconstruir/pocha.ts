import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  pocha,
  secuenciaPocha,
  type AccionPocha,
  type ConfigPocha,
  type EstadoPocha,
  type VistaPocha,
} from '../../juegos/pocha';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/**
 * Un estado de Pocha coherente con la vista: manos ajenas y cartas sin repartir, al azar. Sin
 * muestra, la carta de triunfo del repartidor sigue en su mano mientras no la juegue.
 */
export function reconstruirPocha(vista: VistaPocha, azar: EstadoAzar): EstadoPocha {
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
    secuencia: secuenciaPocha(vista.config),
    indiceMano: vista.indiceMano,
    repartidor: vista.repartidor,
    manos,
    // Lo que queda sin repartir: ni se juega ni se ve.
    mazo: ocultas.tomar(ocultas.quedan),
    muestra: vista.muestra,
    cartaTriunfo: vista.cartaTriunfo,
    triunfo: vista.triunfo,
    fase: vista.fase,
    apuestas: [...vista.apuestas],
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    bazas: [...vista.bazas],
    ultimaBaza: vista.ultimaBaza,
    resultadosManos: [...vista.resultadosManos],
    totales: [...vista.totales],
  };
}

export const SIMULABLE_POCHA: Simulable<ConfigPocha, EstadoPocha, AccionPocha, VistaPocha> = {
  juego: pocha,
  reconstruir: reconstruirPocha,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return bonoPartida(pocha.resultado(final), asiento);
    const otros = cerrada.puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return cerrada.puntos[asiento]! - media + bonoPartida(pocha.resultado(final), asiento);
  },
  reconstrucciones: 24,
  presupuesto: 200,
};
