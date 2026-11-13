import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  barajaPolignac,
  paloPolignac,
  polignac,
  type AccionPolignac,
  type ConfigPolignac,
  type EstadoPolignac,
  type VistaPolignac,
} from '../../juegos/polignac';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Polignac coherente con la vista (spec niveles-ia): las manos ajenas al azar entre
 * las cartas que no se ven, sin los palos que se sabe que no tienen.
 */
export function reconstruirPolignac(vista: VistaPolignac, azar: EstadoAzar): EstadoPolignac {
  const yo = vista.asiento;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      barajaPolignac(vista.config.jugadores),
      vista.miMano ?? [],
      vista.jugadasPor.flat(),
    ),
    azar,
  );
  const repartidas = repartirConPermitidos(
    cartas,
    vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)),
    (a, c) => !vista.fallos[a]!.includes(paloPolignac(c)),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    general: vista.general,
    pasados: vista.pasados,
    manos: repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m)),
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazasJugadas: vista.bazasJugadas,
    bazas: [...vista.bazas],
    puntosMano: [...vista.puntosMano],
    jugadasPor: vista.jugadasPor.map((j) => [...j]),
    fallos: vista.fallos.map((f) => [...f]),
    totales: [...vista.totales],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_POLIGNAC: Simulable<
  ConfigPolignac,
  EstadoPolignac,
  AccionPolignac,
  VistaPolignac
> = {
  juego: polignac,
  reconstruir: reconstruirPolignac,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El general lo decide la base; se simulan las cartas.
  decideLaBase: (vista) => vista.fase === 'general',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(polignac.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const otros = r.puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return r.puntos[asiento]! - media + bono;
  },
  reconstrucciones: 20,
  presupuesto: 160,
};
