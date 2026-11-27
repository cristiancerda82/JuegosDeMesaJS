import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, PALOS_ESPANOLES, type IdCarta } from '../../baraja/cartas';
import {
  cuatroSeises,
  ordenCuatroSeises,
  type AccionCuatroSeises,
  type ConfigCuatroSeises,
  type EstadoCuatroSeises,
  type VistaCuatroSeises,
} from '../../juegos/cuatro-seises';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Cuatro seises coherente con la vista: las manos ajenas al azar, sin las cartas
 * que encajaban cuando cada uno pasó.
 */
export function reconstruirCuatroSeises(
  vista: VistaCuatroSeises,
  azar: EstadoAzar,
): EstadoCuatroSeises {
  const { baraja } = vista.config;
  const orden = ordenCuatroSeises(baraja);
  const enMesa = PALOS_ESPANOLES.flatMap((palo) => {
    const escalera = vista.mesa[palo];
    if (escalera === null) return [];
    return orden
      .slice(escalera.bajo, escalera.alto + 1)
      .map((valor): IdCarta => `${palo}-${valor}`);
  });
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja(baraja === 40 ? 'espanola40' : 'espanola48'),
      vista.miMano ?? [],
      enMesa,
    ),
    azar,
  );
  // Quien pasó no tenía ninguna de las cartas que encajaban entonces.
  const repartidas = repartirConPermitidos(
    cartas,
    vista.cartasEnMano.map((n, a) => (a === vista.asiento ? 0 : n)),
    (a, c) => !vista.noTiene[a]!.includes(c),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos: repartidas.map((m, a) => (a === vista.asiento && vista.miMano ? [...vista.miMano] : m)),
    mesa: vista.mesa,
    turno: vista.turno ?? 0,
    fondo: vista.fondo,
    pases: [...vista.pases],
    noTiene: vista.noTiene.map((nt) => [...nt]),
    ultimaAccion: vista.ultimaAccion,
    saldos: [...vista.saldos],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_CUATRO_SEISES: Simulable<
  ConfigCuatroSeises,
  EstadoCuatroSeises,
  AccionCuatroSeises,
  VistaCuatroSeises
> = {
  juego: cuatroSeises,
  reconstruir: reconstruirCuatroSeises,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    // Sin cerrar la mano, cuenta lo que ha pagado cada uno hasta ahora.
    const fichas = cerrada ? cerrada.fichas : final.pases.map((p) => -1 - p);
    const otros = fichas.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, f) => s + f, 0) / otros.length;
    return fichas[asiento]! - media + bonoPartida(cuatroSeises.resultado(final), asiento);
  },
  // Las manos se simulan deprisa y la ventaja solo aparece con muchas reconstrucciones.
  reconstrucciones: 80,
  presupuesto: 600,
};
