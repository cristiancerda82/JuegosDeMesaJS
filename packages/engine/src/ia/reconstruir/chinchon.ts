import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  chinchon,
  mejorReparto,
  type AccionChinchon,
  type ConfigChinchon,
  type EstadoChinchon,
  type VistaChinchon,
} from '../../juegos/chinchon';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/** Quedar eliminado en la mano pesa como muchos puntos. */
const CASTIGO_ELIMINADO = 50;

/**
 * Un estado de Chinchón coherente con la vista: manos ajenas, mazo y el descarte salvo la
 * carta de arriba, al azar. La carta que el jugador en turno robó del descarte sigue en su mano.
 */
export function reconstruirChinchon(vista: VistaChinchon, azar: EstadoAzar): EstadoChinchon {
  const robadaAjena =
    vista.robadaDelDescarte !== null && vista.turno !== vista.asiento
      ? vista.robadaDelDescarte
      : null;
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja(vista.config.baraja, { comodines: vista.config.comodines }),
      vista.miMano ?? [],
      vista.descarteArriba === null ? [] : [vista.descarteArriba],
      robadaAjena === null ? [] : [robadaAjena],
    ),
    azar,
  );
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === vista.asiento && vista.miMano) return [...vista.miMano];
    if (a === vista.turno && robadaAjena !== null) return [...ocultas.tomar(n - 1), robadaAjena];
    return ocultas.tomar(n);
  });
  const descarte =
    vista.descarteArriba === null
      ? []
      : [...ocultas.tomar(vista.cartasDescarte - 1), vista.descarteArriba];
  return {
    config: vista.config,
    azar,
    // El repartidor solo decide quién empieza la mano siguiente, fuera de la simulación.
    repartidor: vista.turno ?? 0,
    mazo: ocultas.tomar(vista.mazo),
    descarte,
    manos,
    turno: vista.turno ?? 0,
    fase: vista.fase,
    robadaDelDescarte: vista.robadaDelDescarte,
    puntos: [...vista.puntos],
    eliminados: [...vista.eliminados],
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Puntos que suma cada jugador activo en la mano: los del cierre, o los que tiene en mano. */
function puntosMano(inicio: EstadoChinchon, final: EstadoChinchon): Map<Asiento, number> {
  const cerrada = final.resultadosManos[inicio.resultadosManos.length];
  const puntos = new Map<Asiento, number>();
  if (cerrada) {
    for (const m of cerrada.manos) {
      const eliminado = cerrada.eliminadosTras[m.asiento] && !inicio.eliminados[m.asiento];
      puntos.set(m.asiento, m.puntos + (eliminado ? CASTIGO_ELIMINADO : 0));
    }
  } else {
    final.manos.forEach((mano, a) => {
      if (!final.eliminados[a]) puntos.set(a, mejorReparto(mano, final.config.baraja).puntos);
    });
  }
  return puntos;
}

export const SIMULABLE_CHINCHON: Simulable<
  ConfigChinchon,
  EstadoChinchon,
  AccionChinchon,
  VistaChinchon
> = {
  juego: chinchon,
  reconstruir: reconstruirChinchon,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const puntos = puntosMano(inicio, final);
    const otros = [...puntos].filter(([a]) => a !== asiento).map(([, p]) => p);
    const media = otros.length === 0 ? 0 : otros.reduce((s, p) => s + p, 0) / otros.length;
    return media - (puntos.get(asiento) ?? 0) + bonoPartida(chinchon.resultado(final), asiento);
  },
  reconstrucciones: 12,
  presupuesto: 100,
  // Las manos son largas: se simulan unas vueltas y se valora lo que queda en mano.
  horizonte: 16,
};
