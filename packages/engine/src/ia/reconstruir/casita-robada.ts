import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  casitaRobada,
  type AccionCasitaRobada,
  type ConfigCasitaRobada,
  type EstadoCasitaRobada,
  type VistaCasitaRobada,
} from '../../juegos/casita-robada';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Un estado de Casita robada coherente con la vista (spec niveles-ia): la mesa y las casitas son
 * públicas; las manos ajenas y el mazo, al azar entre las cartas que no se ven.
 */
export function reconstruirCasitaRobada(
  vista: VistaCasitaRobada,
  azar: EstadoAzar,
): EstadoCasitaRobada {
  const yo = vista.asiento;
  const { cartas, azar: siguiente } = barajar(
    cartasFuera(crearBaraja('espanola40'), vista.miMano ?? [], vista.mesa, vista.casitas.flat()),
    azar,
  );
  const resto = [...cartas];
  const manos = vista.cartasEnMano.map((n, a) =>
    a === yo && vista.miMano ? [...vista.miMano] : resto.splice(0, n),
  );
  return {
    config: vista.config,
    azar: siguiente,
    mesa: [...vista.mesa],
    manos,
    mazo: resto,
    casitas: vista.casitas.map((c) => [...c]),
    turno: vista.turno ?? 0,
    ultimoEnLlevarse: vista.ultimoEnLlevarse,
    ultimaJugada: vista.ultimaJugada,
    final: vista.final,
  };
}

export const SIMULABLE_CASITA_ROBADA: Simulable<
  ConfigCasitaRobada,
  EstadoCasitaRobada,
  AccionCasitaRobada,
  VistaCasitaRobada
> = {
  juego: casitaRobada,
  reconstruir: reconstruirCasitaRobada,
  // Una partida es una sola mano: se simula hasta el final.
  manoTerminada: (_inicio, e) => e.final !== null,
  valorar(_inicio, final, asiento) {
    const cartas = final.casitas.map((c) => c.length);
    const otros = cartas.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, x) => s + x, 0) / otros.length;
    return (cartas[asiento]! - media) / 5 + bonoPartida(casitaRobada.resultado(final), asiento);
  },
  reconstrucciones: 20,
  presupuesto: 160,
};
