import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, PALOS_FRANCESES, type IdCarta } from '../../baraja/cartas';
import {
  sevens,
  type AccionSevens,
  type ConfigSevens,
  type EstadoSevens,
  type MesaSevens,
  type VistaSevens,
} from '../../juegos/sevens';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/** Las cartas puestas en la mesa: de cada palo, todas las de su escalera. */
function cartasEnMesa(mesa: MesaSevens): IdCarta[] {
  return PALOS_FRANCESES.flatMap((palo) => {
    const escalera = mesa[palo];
    if (escalera === null) return [];
    return Array.from(
      { length: escalera.alto - escalera.bajo + 1 },
      (_, i): IdCarta => `${palo}-${escalera.bajo + i}`,
    );
  });
}

/** Un estado de Sevens coherente con la vista: las manos ajenas, al azar. */
export function reconstruirSevens(vista: VistaSevens, azar: EstadoAzar): EstadoSevens {
  const ocultas = new Ocultas(
    cartasFuera(crearBaraja('francesa52'), vista.miMano ?? [], cartasEnMesa(vista.mesa)),
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

export const SIMULABLE_SEVENS: Simulable<ConfigSevens, EstadoSevens, AccionSevens, VistaSevens> = {
  juego: sevens,
  reconstruir: reconstruirSevens,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    // Penalización de cada uno: las cartas que le quedan.
    const puntos = cerrada ? cerrada.puntos : final.manos.map((m) => m.length);
    const otros = puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return media - puntos[asiento]! + bonoPartida(sevens.resultado(final), asiento);
  },
  reconstrucciones: 20,
  presupuesto: 100,
};
