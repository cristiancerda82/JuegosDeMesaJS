import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type PaloEspanol } from '../../baraja/cartas';
import {
  manilla,
  VALORES_MANILLA,
  type AccionManilla,
  type ConfigManilla,
  type EstadoManilla,
  type VistaManilla,
} from '../../juegos/manilla';
import { bandoDe, fuerza, paloDe, type CartaJugada } from '../../motor/bazas';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';
import { topesPorObligaciones } from './topes';

const V = VALORES_MANILLA;

/**
 * La fuerza máxima que puede tener cada asiento en cada palo, por lo que jugó (0: no tiene ese
 * palo). Las obligaciones solo rigen cuando la baza la gana un rival (`topesPorObligaciones`).
 */
export const topesManilla = (
  bazas: readonly (readonly CartaJugada[])[],
  triunfo: PaloEspanol,
): Map<PaloEspanol, number>[] =>
  topesPorObligaciones(
    bazas.map((cartas) => ({ cartas, triunfo })),
    V,
    4,
    (a, b) => bandoDe(a) !== bandoDe(b),
  );

/**
 * Un estado de Manilla coherente con la vista (spec niveles-ia): las manos ajenas al azar entre
 * las cartas que no se ven, sin lo que se sabe que no tienen, y el pinte en la mano del que
 * reparte mientras no lo juegue.
 */
export function reconstruirManilla(vista: VistaManilla, azar: EstadoAzar): EstadoManilla {
  const yo = vista.asiento;
  const jugadas = vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta));
  const pinteAjeno = vista.pinteEnMano && vista.repartidor !== yo;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('espanola48'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      jugadas,
      pinteAjeno ? [vista.pinte] : [],
    ),
    azar,
  );
  const topes = topesManilla(
    [...vista.bazasJugadas.map((b) => b.cartas), vista.mesa],
    vista.triunfo,
  );
  const huecos = vista.cartasEnMano.map((n, a) => {
    if (a === yo) return 0;
    return pinteAjeno && a === vista.repartidor ? n - 1 : n;
  });
  const repartidas = repartirConPermitidos(
    cartas,
    huecos,
    (a, c) => fuerza(c, V) <= topes[a]!.get(paloDe(c))!,
    new Generador(azarReparto),
  );
  const manos = repartidas.map((m, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    return pinteAjeno && a === vista.repartidor ? [...m, vista.pinte] : m;
  });
  return {
    config: { objetivo: vista.config.objetivo },
    azar,
    repartidor: vista.repartidor,
    manos,
    pinte: vista.pinte,
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    bazasJugadas: [...vista.bazasJugadas],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
    totales: vista.totales,
  };
}

/** La diferencia de puntos entre parejas en la mano, a la mitad (lo que gana uno lo pierde el otro). */
const margen = (puntos: readonly [number, number], asiento: Asiento) => {
  const mio = bandoDe(asiento);
  return (puntos[mio] - puntos[1 - mio]!) / 2;
};

export const SIMULABLE_MANILLA: Simulable<
  ConfigManilla,
  EstadoManilla,
  AccionManilla,
  VistaManilla
> = {
  juego: manilla,
  reconstruir: reconstruirManilla,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(manilla.resultado(final), asiento);
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    return margen(cerrada ? cerrada.puntos : final.puntos, asiento) + bono;
  },
  reconstrucciones: 24,
  presupuesto: 160,
};
