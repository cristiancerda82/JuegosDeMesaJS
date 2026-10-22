import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  paloPicas,
  parejaPicas,
  picas,
  type AccionPicas,
  type ConfigPicas,
  type EstadoPicas,
  type VistaPicas,
} from '../../juegos/picas';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Picas coherente con la vista: las manos ajenas al azar entre las cartas que no
 * se ven, sin los palos de salida que cada uno no siguió en esta mano.
 */
export function reconstruirPicas(vista: VistaPicas, azar: EstadoAzar): EstadoPicas {
  const yo = vista.asiento;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      vista.jugadas,
      vista.mesa.map((j) => j.carta),
    ),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n));
  const repartidas = repartirConPermitidos(
    cartas,
    huecos,
    (a, c) => !vista.fallos[a]!.includes(paloPicas(c)),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos: repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m)),
    fase: vista.fase,
    turno: vista.turno ?? 0,
    apuestas: [...vista.apuestas],
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    rotas: vista.rotas,
    fallos: vista.fallos.map((f) => [...f]),
    resultadosManos: [...vista.resultadosManos],
    puntos: vista.puntos,
    sacos: vista.sacos,
  };
}

export const SIMULABLE_PICAS: Simulable<ConfigPicas, EstadoPicas, AccionPicas, VistaPicas> = {
  juego: picas,
  reconstruir: reconstruirPicas,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mia = parejaPicas(asiento);
    return (
      cerrada.puntosMano[mia] -
      cerrada.puntosMano[1 - mia]! +
      bonoPartida(picas.resultado(final), asiento)
    );
  },
  // La apuesta la decide la base: la simulación no ve que el rival apuesta alto con buena mano.
  decideLaBase: (vista) => vista.fase === 'apuesta',
  // Las partidas a 500 son largas: con la mitad de simulaciones que los Corazones ya gana
  // claramente a la normal y la prueba de fuerza cabe en su tiempo.
  reconstrucciones: 12,
  presupuesto: 80,
};
