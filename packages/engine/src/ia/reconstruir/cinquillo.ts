import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, PALOS_ESPANOLES, type IdCarta } from '../../baraja/cartas';
import {
  cinquillo,
  ORDEN_CINQUILLO,
  type AccionCinquillo,
  type ConfigCinquillo,
  type EstadoCinquillo,
  type MesaCinquillo,
  type VistaCinquillo,
} from '../../juegos/cinquillo';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/** Las cartas puestas en la mesa: de cada palo, todas las de su escalera. */
function cartasEnMesa(mesa: MesaCinquillo): IdCarta[] {
  return PALOS_ESPANOLES.flatMap((palo) => {
    const escalera = mesa[palo];
    if (escalera === null) return [];
    return ORDEN_CINQUILLO.slice(escalera.bajo, escalera.alto + 1).map(
      (valor): IdCarta => `${palo}-${valor}`,
    );
  });
}

/** Un estado de Cinquillo coherente con la vista: las manos ajenas, al azar. */
export function reconstruirCinquillo(vista: VistaCinquillo, azar: EstadoAzar): EstadoCinquillo {
  const ocultas = new Ocultas(
    cartasFuera(crearBaraja('espanola40'), vista.miMano ?? [], cartasEnMesa(vista.mesa)),
    azar,
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos: manosOcultas(vista.cartasEnMano, vista.asiento, vista.miMano, ocultas),
    mesa: vista.mesa,
    turno: vista.turno ?? 0,
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
    totales: [...vista.totales],
  };
}

export const SIMULABLE_CINQUILLO: Simulable<
  ConfigCinquillo,
  EstadoCinquillo,
  AccionCinquillo,
  VistaCinquillo
> = {
  juego: cinquillo,
  reconstruir: reconstruirCinquillo,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    // Penalización de cada uno: las cartas que le quedan.
    const puntos = cerrada ? cerrada.puntos : final.manos.map((m) => m.length);
    const otros = puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return media - puntos[asiento]! + bonoPartida(cinquillo.resultado(final), asiento);
  },
  reconstrucciones: 30,
  presupuesto: 150,
};
