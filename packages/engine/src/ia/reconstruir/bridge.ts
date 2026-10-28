import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  bridge,
  paloBridge,
  parejaBridge,
  type AccionBridge,
  type ConfigBridge,
  type EstadoBridge,
  type VistaBridge,
} from '../../juegos/bridge';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Bridge coherente con la vista: el muerto descubierto se queda como está, y las
 * manos que no se ven salen al azar de las cartas que no se ven, sin los palos de salida que
 * cada uno no siguió en esta mano.
 */
export function reconstruirBridge(vista: VistaBridge, azar: EstadoAzar): EstadoBridge {
  const yo = vista.asiento;
  const muerto = vista.manoMuerto !== null ? vista.muerto : null;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      vista.manoMuerto ?? [],
      vista.jugadas,
    ),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo || a === muerto ? 0 : n));
  const repartidas = repartirConPermitidos(
    cartas,
    huecos,
    (a, c) => !vista.fallos[a]!.includes(paloBridge(c)),
    new Generador(azarReparto),
  );
  const manos = repartidas.map((m, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    if (a === muerto) return [...vista.manoMuerto!];
    return m;
  });
  return {
    config: vista.config,
    azar,
    fase: vista.fase,
    repartidor: vista.repartidor,
    manoDelCiclo: vista.manoDelCiclo,
    manosJugadas: vista.manosJugadas,
    repartoRepetido: vista.repartoRepetido,
    manos,
    subasta: [...vista.subasta],
    contrato: vista.contrato,
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: vista.bazas,
    jugadasPor: vista.jugadasPor.map((j) => [...j]),
    fallos: vista.fallos.map((f) => [...f]),
    resultadosManos: [...vista.resultadosManos],
    puntos: vista.puntos,
  };
}

export const SIMULABLE_BRIDGE: Simulable<ConfigBridge, EstadoBridge, AccionBridge, VistaBridge> = {
  juego: bridge,
  reconstruir: reconstruirBridge,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // La subasta la decide la base: el carteo es lo que se simula.
  decideLaBase: (vista) => vista.fase !== 'carteo',
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mia = parejaBridge(asiento);
    // Los puntos de la mano; las bazas desempatan cuando no cambian los puntos.
    return (
      (cerrada.puntosMano[mia] - cerrada.puntosMano[1 - mia]!) / 50 +
      (cerrada.bazas[mia] - cerrada.bazas[1 - mia]!) / 10 +
      bonoPartida(bridge.resultado(final), asiento)
    );
  },
  reconstrucciones: 12,
  presupuesto: 120,
};
