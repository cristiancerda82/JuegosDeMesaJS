import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_TRESSETTE,
  paloTressette,
  parejaTressette,
  tressette,
  type AccionTressette,
  type ConfigTressette,
  type EstadoTressette,
  type VistaTressette,
} from '../../juegos/tressette';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Tressette coherente con la vista: las manos ajenas al azar entre las cartas que
 * no se ven, sin los palos de salida que cada uno no siguió (como en la Sueca, sin triunfo).
 */
export function reconstruirTressette(vista: VistaTressette, azar: EstadoAzar): EstadoTressette {
  const yo = vista.asiento;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      BARAJA_TRESSETTE,
      vista.miMano ?? [],
      vista.jugadas,
      vista.mesa.map((j) => j.carta),
    ),
    azar,
  );
  const repartidas = repartirConPermitidos(
    cartas,
    vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)),
    (a, c) => !vista.fallos[a]!.includes(paloTressette(c)),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos: repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m)),
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    tercios: vista.tercios,
    fallos: vista.fallos.map((f) => [...f]),
    resultadosManos: [...vista.resultadosManos],
    puntos: vista.puntos,
  };
}

export const SIMULABLE_TRESSETTE: Simulable<
  ConfigTressette,
  EstadoTressette,
  AccionTressette,
  VistaTressette
> = {
  juego: tressette,
  reconstruir: reconstruirTressette,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mia = parejaTressette(asiento);
    // Los tercios cuentan aunque no lleguen a un punto entero; los puntos, más.
    return (
      (cerrada.tercios[mia] - cerrada.tercios[1 - mia]!) / 3 +
      (cerrada.puntos[mia] - cerrada.puntos[1 - mia]!) +
      bonoPartida(tressette.resultado(final), asiento)
    );
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
