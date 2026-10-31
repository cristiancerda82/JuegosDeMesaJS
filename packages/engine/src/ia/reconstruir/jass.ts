import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_JASS,
  esPaloJass,
  jass,
  paloJass,
  parejaJass,
  type AccionJass,
  type ConfigJass,
  type EstadoJass,
  type VistaJass,
} from '../../juegos/jass';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Jass coherente con la vista (spec niveles-ia): las manos ajenas al azar entre
 * las cartas que no se ven, sin los palos que se sabe que no tienen (del triunfo solo puede
 * quedar el Buur), y con las cartas de las declaraciones ganadoras que no se han jugado en la
 * mano de su jugador.
 */
export function reconstruirJass(vista: VistaJass, azar: EstadoAzar): EstadoJass {
  const yo = vista.asiento;
  const jugadas = vista.jugadasPor.flat();
  const fijas: IdCarta[][] = [[], [], [], []];
  for (const { asiento, weis } of vista.weis?.declaraciones ?? []) {
    if (asiento === yo) continue;
    for (const c of weis.cartas) {
      if (!jugadas.includes(c) && !fijas[asiento]!.includes(c)) fijas[asiento]!.push(c);
    }
  }
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_JASS, vista.miMano ?? [], jugadas, ...fijas),
    azar,
  );
  const triunfo = esPaloJass(vista.modo) ? vista.modo : null;
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n - fijas[a]!.length));
  const repartidas = repartirConPermitidos(
    cartas,
    huecos,
    (a, c) => {
      const palo = paloJass(c);
      if (!vista.fallos[a]!.includes(palo)) return true;
      return palo === triunfo && c.endsWith('-11');
    },
    new Generador(azarReparto),
  );
  const manos = repartidas.map((m, a) =>
    a === yo && vista.miMano ? [...vista.miMano] : [...fijas[a]!, ...m],
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    elige: vista.elige,
    pasado: vista.pasado,
    modo: vista.modo,
    manos,
    manosIniciales: manos.map((m, a) => [...m, ...vista.jugadasPor[a]!]),
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazasGanadas: vista.bazasGanadas,
    jugadasPor: vista.jugadasPor.map((j) => [...j]),
    fallos: vista.fallos.map((f) => [...f]),
    weis: vista.weis,
    stock: vista.stock,
    puntosMano: vista.puntosMano,
    porConcepto: vista.porConcepto,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_JASS: Simulable<ConfigJass, EstadoJass, AccionJass, VistaJass> = {
  juego: jass,
  reconstruir: reconstruirJass,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // La elección la decide la base; se simulan las bazas.
  decideLaBase: (vista) => vista.fase === 'eleccion',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(jass.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const mia = parejaJass(asiento);
    return (r.total[mia] - r.total[1 - mia]!) / 50 + bono;
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
