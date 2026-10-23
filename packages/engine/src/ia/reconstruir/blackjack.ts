import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  blackjack,
  esBlackjack,
  type AccionBlackjack,
  type ConfigBlackjack,
  type EstadoBlackjack,
  type VistaBlackjack,
} from '../../juegos/blackjack';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Un estado de Blackjack coherente con la vista: la tapada de la banca y el mazo, al azar entre
 * las cartas que no se ven. Si la banca miró su tapada sin descubrirla, no tiene blackjack.
 */
export function reconstruirBlackjack(vista: VistaBlackjack, azar: EstadoAzar): EstadoBlackjack {
  const visibles = vista.banca.filter((c): c is IdCarta => c !== null);
  const enJuego = vista.manos.flat().flatMap((m) => m.cartas);
  let { cartas } = barajar(cartasFuera(crearBaraja('francesa52'), visibles, enJuego), azar);
  const oculta = vista.banca.length === 2 && vista.banca[1] === null;
  let banca = [...visibles];
  if (oculta) {
    // La tapada: la primera que no dé blackjack a la banca si miró.
    const i = cartas.findIndex((c) => !vista.miro || !esBlackjack([visibles[0]!, c]));
    banca = [visibles[0]!, cartas[i]!];
    cartas = cartas.filter((_, k) => k !== i);
  }
  return {
    config: vista.config,
    azar,
    fichas: [...vista.fichas],
    activos: [...vista.activos],
    fase: vista.fase,
    turno: vista.turno ?? 0,
    manoActiva: vista.manoActiva,
    apuestas: [...vista.apuestas],
    manos: vista.manos.map((ms) => [...ms]),
    banca,
    descubierta: !oculta && vista.valorBanca !== null,
    miro: vista.miro,
    // El mazo real tiene las que no se han repartido; en la apuesta aún no hay mazo.
    mazo: vista.fase === 'apuesta' ? [] : cartas.slice(0, vista.mazo),
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_BLACKJACK: Simulable<
  ConfigBlackjack,
  EstadoBlackjack,
  AccionBlackjack,
  VistaBlackjack
> = {
  juego: blackjack,
  reconstruir: reconstruirBlackjack,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    return cerrada.ganancias[asiento]! + bonoPartida(blackjack.resultado(final), asiento);
  },
  // La apuesta la decide la base, sin simular.
  decideLaBase: (vista) => vista.fase === 'apuesta',
  reconstrucciones: 40,
  presupuesto: 160,
};
