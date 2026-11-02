import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  puntuarManoScopa,
  scopa,
  type AccionScopa,
  type ConfigScopa,
  type EstadoScopa,
  type ResultadoManoScopa,
  type VistaScopa,
} from '../../juegos/scopa';
import { bandoDe } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/**
 * Un estado de Scopa coherente con la vista: manos ajenas, mazo y cartas recogidas, al azar.
 * Las recogidas quedan boca abajo (spec juego-scopa): de ellas solo se sabe cuántas son.
 */
export function reconstruirScopa(vista: VistaScopa, azar: EstadoAzar): EstadoScopa {
  const ocultas = new Ocultas(
    cartasFuera(crearBaraja('espanola40'), vista.miMano ?? [], vista.mesa),
    azar,
  );
  const manos = manosOcultas(vista.cartasEnMano, vista.asiento, vista.miMano, ocultas);
  const recogidas: [IdCarta[], IdCarta[]] = [
    ocultas.tomar(vista.cartasRecogidas[0]),
    ocultas.tomar(vista.cartasRecogidas[1]),
  ];
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo: ocultas.tomar(vista.mazo),
    mesa: [...vista.mesa],
    manos,
    turno: vista.turno ?? 0,
    recogidas,
    scopas: [vista.scopas[0], vista.scopas[1]],
    ultimoEnRecoger: vista.ultimoEnRecoger,
    ultimaJugada: vista.ultimaJugada,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Puntos de la mano del bando `mio` menos los del otro, con el recuento para desempatar. */
function diferencia(r: Pick<ResultadoManoScopa, 'recuento' | 'puntos'>, mio: 0 | 1): number {
  const otro = (1 - mio) as 0 | 1;
  const [a, b] = [r.recuento[mio], r.recuento[otro]];
  return (
    r.puntos[mio].total -
    r.puntos[otro].total +
    0.02 * (a.cartas - b.cartas) +
    0.05 * (a.oros - b.oros) +
    0.01 * (a.primiera - b.primiera)
  );
}

export const SIMULABLE_SCOPA: Simulable<ConfigScopa, EstadoScopa, AccionScopa, VistaScopa> = {
  juego: scopa,
  reconstruir: reconstruirScopa,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const r =
      final.resultadosManos[inicio.resultadosManos.length] ??
      puntuarManoScopa(final.recogidas, final.scopas);
    return diferencia(r, bandoDe(asiento)) + bonoPartida(scopa.resultado(final), asiento);
  },
  reconstrucciones: 30,
  presupuesto: 300,
  // Con 4, la mano entera son 40 jugadas: se simulan 24 para no pasar del tiempo.
  horizonte: 24,
};
