import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_TREINTA,
  treintaYUno,
  type AccionTreintaYUno,
  type ConfigTreintaYUno,
  type EstadoTreintaYUno,
  type VistaTreintaYUno,
} from '../../juegos/treinta-y-uno';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Un estado de Treinta y uno coherente con la vista: las manos ajenas y el mazo al azar entre las
 * cartas que no se ven, con las que cada uno cogió del descarte fijas en su mano.
 */
export function reconstruirTreintaYUno(
  vista: VistaTreintaYUno,
  azar: EstadoAzar,
): EstadoTreintaYUno {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_TREINTA, mia, vista.descarte, vista.conocidas.flat()),
    azar,
  );
  let i = 0;
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    const conocidas = vista.conocidas[a]!;
    const resto = cartas.slice(i, i + n - conocidas.length);
    i += n - conocidas.length;
    return [...conocidas, ...resto];
  });
  return {
    config: vista.config,
    azar: azarReparto,
    empieza: vista.empieza,
    manos,
    mazo: cartas.slice(i, i + vista.enMazo),
    descarte: [...vista.descarte],
    conocidas: vista.conocidas.map((cs) => [...cs]),
    fase: vista.fase,
    turno: vista.turno ?? 0,
    cogida: vista.cogida,
    plantado: vista.plantado,
    ultimos: vista.ultimos,
    turnos: vista.turnos,
    vidas: [...vista.vidas],
    resultadosRondas: [...vista.resultadosRondas],
  };
}

export const SIMULABLE_TREINTA: Simulable<
  ConfigTreintaYUno,
  EstadoTreintaYUno,
  AccionTreintaYUno,
  VistaTreintaYUno
> = {
  juego: treintaYUno,
  reconstruir: reconstruirTreintaYUno,
  manoTerminada: (inicio, e) => e.resultadosRondas.length > inicio.resultadosRondas.length,
  // Se simulan plantarse, de dónde robar y el descarte.
  decideLaBase: () => false,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(treintaYUno.resultado(final), asiento);
    const r = final.resultadosRondas[inicio.resultadosRondas.length];
    if (!r) return bono;
    // Perder la vida es lo que cuenta; el valor de la mano desempata entre jugadas parecidas.
    return (r.pierden.includes(asiento) ? -1 : 0) + 0.01 * (r.valores[asiento] ?? 0) + bono;
  },
  reconstrucciones: 40,
  presupuesto: 400,
};
