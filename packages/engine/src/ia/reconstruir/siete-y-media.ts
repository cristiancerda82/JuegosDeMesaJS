import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  sieteYMedia,
  type AccionSieteYMedia,
  type ConfigSieteYMedia,
  type EstadoSieteYMedia,
  type VistaSieteYMedia,
} from '../../juegos/siete-y-media';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/**
 * Un estado de Siete y media coherente con la vista: las cartas tapadas ajenas y el mazo, al
 * azar. Cada mano se baraja la baraja entera, así que las manos anteriores no cuentan.
 */
export function reconstruirSieteYMedia(
  vista: VistaSieteYMedia,
  azar: EstadoAzar,
): EstadoSieteYMedia {
  const vistas = vista.cartas.flat().filter((c): c is IdCarta => c !== null);
  const ocultas = new Ocultas(cartasFuera(crearBaraja('espanola40'), vistas), azar);
  const cartas = vista.cartas.map((c) => c.map((carta) => carta ?? ocultas.tomar(1)[0]!));
  const n = vista.config.jugadores;
  return {
    config: vista.config,
    azar,
    banca: vista.banca,
    fichas: [...vista.fichas],
    // Las fichas al empezar la mano son las del cierre de la anterior (o las iniciales).
    fichasInicioMano:
      vista.resultadosManos.at(-1)?.fichasTras ??
      new Array<number>(n).fill(vista.config.fichasIniciales),
    fase: vista.fase,
    turno: vista.turno ?? vista.banca,
    apuestas: [...vista.apuestas],
    mazo: ocultas.tomar(vista.mazo),
    cartas,
    estados: [...vista.estados],
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_SIETE_Y_MEDIA: Simulable<
  ConfigSieteYMedia,
  EstadoSieteYMedia,
  AccionSieteYMedia,
  VistaSieteYMedia
> = {
  juego: sieteYMedia,
  reconstruir: reconstruirSieteYMedia,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const ganado = cerrada
      ? cerrada.fichasTras[asiento]! - inicio.fichas[asiento]!
      : final.fichas[asiento]! - inicio.fichas[asiento]!;
    return ganado + bonoPartida(sieteYMedia.resultado(final), asiento);
  },
  reconstrucciones: 40,
  presupuesto: 400,
};
