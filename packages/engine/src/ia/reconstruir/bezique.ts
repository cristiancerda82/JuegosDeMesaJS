import { type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import type { IdCarta } from '../../baraja/cartas';
import {
  BARAJA_BEZIQUE,
  bezique,
  type AccionBezique,
  type ConfigBezique,
  type EstadoBezique,
  type VistaBezique,
} from '../../juegos/bezique';
import { restarCartas } from '../../juegos/spite-malice';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Un estado de Bezique coherente con la vista: el rival conserva sus cartas cantadas y el resto
 * de su mano y el mazo salen al azar de las cartas que no se ven, contando las copias.
 */
export function reconstruirBezique(vista: VistaBezique, azar: EstadoAzar): EstadoBezique {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const vistas = [
    ...mia,
    ...vista.cantadas.flatMap((x, a) => (a === yo ? [] : x)),
    ...vista.jugadas,
    ...(vista.vuelta ? [vista.vuelta] : []),
  ];
  const { cartas } = barajar(restarCartas(BARAJA_BEZIQUE, vistas), azar);
  let i = 0;
  const tomar = (n: number): IdCarta[] => {
    const r = cartas.slice(i, i + n);
    i += n;
    return r;
  };
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === yo) return [...mia];
    const cantadas = vista.cantadas[a]!;
    return [...cantadas, ...tomar(n - cantadas.length)];
  });
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    triunfo: vista.triunfo,
    vuelta: vista.vuelta,
    manos,
    cantadas: vista.cantadas.map((x) => [...x]),
    mazo: tomar(vista.enMazo),
    fase: vista.fase,
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    usadas: vista.usadas,
    cantes: [...vista.cantes],
    ganadas: vista.ganadas.map((g) => [...g]),
    puntosMano: vista.puntosMano,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_BEZIQUE: Simulable<
  ConfigBezique,
  EstadoBezique,
  AccionBezique,
  VistaBezique
> = {
  juego: bezique,
  reconstruir: reconstruirBezique,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  horizonte: 24,
  // Las declaraciones las decide la base; se simulan las cartas.
  decideLaBase: (vista) => vista.fase === 'declarar',
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const rival = asiento === 0 ? 1 : 0;
    // Con la mano cerrada, sus puntos; si no, los de la mano más las brisques ganadas.
    const puntos = (a: 0 | 1) =>
      cerrada
        ? cerrada.puntosMano[a]
        : final.puntosMano[a] + 10 * final.ganadas[a]!.filter((c) => /-(1|10)$/.test(c)).length;
    return (
      (puntos(asiento as 0 | 1) - puntos(rival)) / 10 +
      bonoPartida(bezique.resultado(final), asiento)
    );
  },
  reconstrucciones: 10,
  presupuesto: 80,
};
