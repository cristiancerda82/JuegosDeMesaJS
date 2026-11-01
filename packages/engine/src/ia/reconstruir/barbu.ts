import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_BARBU,
  barbu,
  paloBarbu,
  type AccionBarbu,
  type ConfigBarbu,
  type EstadoBarbu,
  type VistaBarbu,
} from '../../juegos/barbu';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Barbu coherente con la vista (spec niveles-ia): las manos ajenas al azar entre
 * las cartas que no se ven, sin los palos que se sabe que no tienen ni las cartas que
 * encajaban cuando pasaron en el dominó.
 */
export function reconstruirBarbu(vista: VistaBarbu, azar: EstadoAzar): EstadoBarbu {
  const yo = vista.asiento;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_BARBU, vista.miMano ?? [], vista.jugadasPor.flat()),
    azar,
  );
  const repartidas = repartirConPermitidos(
    cartas,
    vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)),
    (a, c) => !vista.fallos[a]!.includes(paloBarbu(c)) && !vista.noTiene[a]!.includes(c),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    contrato: vista.contrato,
    triunfo: vista.triunfo,
    jugados: [...vista.jugados],
    manos: repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m)),
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazasJugadas: vista.bazasJugadas,
    puntosMano: [...vista.puntosMano],
    filas: vista.filas,
    acabados: [...vista.acabados],
    jugadasPor: vista.jugadasPor.map((j) => [...j]),
    fallos: vista.fallos.map((f) => [...f]),
    noTiene: vista.noTiene.map((n) => [...n]),
    totales: [...vista.totales],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_BARBU: Simulable<ConfigBarbu, EstadoBarbu, AccionBarbu, VistaBarbu> = {
  juego: barbu,
  reconstruir: reconstruirBarbu,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El contrato y el triunfo los decide la base; se simulan las jugadas.
  decideLaBase: (vista) => vista.fase === 'contrato' || vista.fase === 'triunfo',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(barbu.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const otros = r.puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return (r.puntos[asiento]! - media) / 10 + bono;
  },
  reconstrucciones: 10,
  presupuesto: 80,
};
