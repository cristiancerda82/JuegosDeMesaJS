import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  paloWhist,
  parejaWhist,
  whist,
  type AccionWhist,
  type ConfigWhist,
  type EstadoWhist,
  type VistaWhist,
} from '../../juegos/whist';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Whist coherente con la vista: las manos ajenas al azar entre las cartas que no
 * se ven, sin los palos de salida que cada uno no siguió en esta mano, y con la carta del
 * triunfo en la mano del repartidor mientras no la haya jugado.
 */
export function reconstruirWhist(vista: VistaWhist, azar: EstadoAzar): EstadoWhist {
  const yo = vista.asiento;
  const triunfoAjeno =
    vista.cartaTriunfo !== null && vista.repartidor !== yo ? vista.cartaTriunfo : null;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      vista.jugadas,
      vista.mesa.map((j) => j.carta),
      triunfoAjeno ? [triunfoAjeno] : [],
    ),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) =>
    a === yo ? 0 : a === vista.repartidor && triunfoAjeno ? n - 1 : n,
  );
  const repartidas = repartirConPermitidos(
    cartas,
    huecos,
    (a, c) => !vista.fallos[a]!.includes(paloWhist(c)),
    new Generador(azarReparto),
  );
  const manos = repartidas.map((m, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    if (a === vista.repartidor && triunfoAjeno) return [...m, triunfoAjeno];
    return m;
  });
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    triunfo: vista.triunfo,
    cartaTriunfo: vista.cartaTriunfo,
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    fallos: vista.fallos.map((f) => [...f]),
    resultadosManos: [...vista.resultadosManos],
    puntos: vista.puntos,
    juegos: vista.juegos,
  };
}

export const SIMULABLE_WHIST: Simulable<ConfigWhist, EstadoWhist, AccionWhist, VistaWhist> = {
  juego: whist,
  reconstruir: reconstruirWhist,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mia = parejaWhist(asiento);
    // Las bazas cuentan aunque no den puntos; los puntos y ganar el juego, más.
    const juego = cerrada.ganaJuego === null ? 0 : cerrada.ganaJuego === mia ? 20 : -20;
    return (
      cerrada.bazas[mia] -
      cerrada.bazas[1 - mia]! +
      3 * (cerrada.puntosMano[mia] - cerrada.puntosMano[1 - mia]!) +
      juego +
      bonoPartida(whist.resultado(final), asiento)
    );
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
