import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  escoba,
  puntuarMano,
  type AccionEscoba,
  type ConfigEscoba,
  type EstadoEscoba,
  type ResultadoManoEscoba,
  type VistaEscoba,
} from '../../juegos/escoba';
import { bandoDe } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/**
 * Un estado de Escoba coherente con la vista: manos ajenas, mazo y cartas recogidas, al azar.
 * Las recogidas quedan boca abajo y no se pueden consultar (spec juego-escoba): de ellas solo
 * se sabe cuántas son.
 */
export function reconstruirEscoba(vista: VistaEscoba, azar: EstadoAzar): EstadoEscoba {
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
    escobas: [vista.escobas[0], vista.escobas[1]],
    ultimoEnRecoger: vista.ultimoEnRecoger,
    ultimaJugada: vista.ultimaJugada,
    resultadosManos: [...vista.resultadosManos],
  };
}

/**
 * Puntos de la mano para el bando `mio` menos los del rival. Los puntos van de uno en uno y
 * empatan a menudo: el recuento (cartas, oros y sietes) desempata.
 */
function diferencia(r: ResultadoManoEscoba, mio: 0 | 1): number {
  const otro = (1 - mio) as 0 | 1;
  const [a, b] = [r.recuento[mio], r.recuento[otro]];
  return (
    r.puntos[mio].total -
    r.puntos[otro].total +
    0.02 * (a.cartas - b.cartas) +
    0.05 * (a.oros - b.oros) +
    0.1 * (a.sietes - b.sietes)
  );
}

export const SIMULABLE_ESCOBA: Simulable<ConfigEscoba, EstadoEscoba, AccionEscoba, VistaEscoba> = {
  juego: escoba,
  reconstruir: reconstruirEscoba,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const r =
      final.resultadosManos[inicio.resultadosManos.length] ??
      puntuarMano(final.recogidas, final.escobas);
    return diferencia(r, bandoDe(asiento)) + bonoPartida(escoba.resultado(final), asiento);
  },
  reconstrucciones: 20,
  presupuesto: 120,
};
