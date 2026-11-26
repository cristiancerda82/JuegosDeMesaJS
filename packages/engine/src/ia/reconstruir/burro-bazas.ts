import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import {
  burroBazas,
  paloBurroBazas,
  type AccionBurroBazas,
  type ConfigBurroBazas,
  type EstadoBurroBazas,
  type VistaBurroBazas,
} from '../../juegos/burro-bazas';
import { sinVerBurroBazas } from '../burro-bazas-basica';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Burro de bazas coherente con la vista (spec niveles-ia): las cartas que no se ven,
 * al azar entre las manos ajenas (sin los palos que se sabe que no tienen) y el mazo.
 */
export function reconstruirBurroBazas(vista: VistaBurroBazas, azar: EstadoAzar): EstadoBurroBazas {
  const yo = vista.asiento;
  const n = vista.config.jugadores;
  const { cartas, azar: azarReparto } = barajar(sinVerBurroBazas(vista), azar);
  // El mazo es un hueco más, al final, que admite cualquier carta.
  const repartidas = repartirConPermitidos(
    cartas,
    [...vista.cartasEnMano.map((k, a) => (a === yo ? 0 : k)), vista.mazo],
    (a, c) => a === n || !vista.sinPalo[a]!.includes(paloBurroBazas(c)),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos: repartidas.slice(0, n).map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m)),
    mazo: repartidas[n]!,
    turno: vista.turno ?? 0,
    salida: vista.salida,
    mesa: [...vista.mesa],
    pasaron: [...vista.pasaron],
    robadas: [...vista.robadas],
    ultimaBaza: vista.ultimaBaza,
    bazasJugadas: vista.bazasJugadas,
    bazas: [...vista.bazas],
    jugadasPor: vista.jugadasPor.map((j) => [...j]),
    sinPalo: vista.sinPalo.map((s) => [...s]),
    salieron: [...vista.salieron],
    penalizaciones: [...vista.penalizaciones],
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Lo que vale ser el burro en la simulación. */
const PENA_BURRO = 10;

export const SIMULABLE_BURRO_BAZAS: Simulable<
  ConfigBurroBazas,
  EstadoBurroBazas,
  AccionBurroBazas,
  VistaBurroBazas
> = {
  juego: burroBazas,
  reconstruir: reconstruirBurroBazas,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(burroBazas.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) {
      // A mitad de mano, cuantas más cartas tiene respecto a los demás, más cerca está de ser el burro.
      const total = final.manos.reduce((s, m) => s + m.length, 0);
      return (-PENA_BURRO * final.manos[asiento]!.length) / Math.max(total, 1) + bono;
    }
    // Ser el burro es lo peor; salir pronto, lo mejor.
    if (r.burro === asiento) return -PENA_BURRO + bono;
    const puesto = r.orden.indexOf(asiento);
    return puesto === -1 ? bono : -puesto / final.config.jugadores + bono;
  },
  reconstrucciones: 20,
  presupuesto: 120,
  horizonte: 24,
};
