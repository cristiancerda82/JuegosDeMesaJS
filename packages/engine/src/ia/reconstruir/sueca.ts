import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_SUECA,
  paloSueca,
  parejaSueca,
  sueca,
  type AccionSueca,
  type ConfigSueca,
  type EstadoSueca,
  type VistaSueca,
} from '../../juegos/sueca';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Sueca coherente con la vista: las manos ajenas al azar entre las cartas que no
 * se ven, sin los palos de salida que cada uno no siguió, y con la carta del triunfo en la mano
 * del repartidor mientras no la haya jugado (como en el Whist).
 */
export function reconstruirSueca(vista: VistaSueca, azar: EstadoAzar): EstadoSueca {
  const yo = vista.asiento;
  const triunfoAjeno =
    vista.cartaTriunfo !== null && vista.repartidor !== yo ? vista.cartaTriunfo : null;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      BARAJA_SUECA,
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
    (a, c) => !vista.fallos[a]!.includes(paloSueca(c)),
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
    puntosMano: vista.puntosMano,
    fallos: vista.fallos.map((f) => [...f]),
    resultadosManos: [...vista.resultadosManos],
    juegos: vista.juegos,
  };
}

export const SIMULABLE_SUECA: Simulable<ConfigSueca, EstadoSueca, AccionSueca, VistaSueca> = {
  juego: sueca,
  reconstruir: reconstruirSueca,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mia = parejaSueca(asiento);
    // Los puntos de cartas cuentan aunque no den juegos; los juegos, más.
    const juegos =
      cerrada.gana === null ? 0 : (cerrada.gana === mia ? 1 : -1) * cerrada.juegosGanados;
    return (
      (cerrada.puntos[mia] - cerrada.puntos[1 - mia]!) / 10 +
      10 * juegos +
      bonoPartida(sueca.resultado(final), asiento)
    );
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
