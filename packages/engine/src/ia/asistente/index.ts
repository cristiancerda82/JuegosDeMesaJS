import type { EstadoAzar } from '../../baraja/azar';
import type { Agente } from '../agente';
import { analizar, type Simulacion } from '../niveles';
import { explicar, type ContextoAsistente, type Motivo } from './explicar';

export * from './cartas';
export * from './explicar';

/**
 * La jugada que sugiere el modo asistido: la que elegiría `agente` (la IA difícil) en el asiento
 * del jugador, con su misma vista (spec modo-asistido, «Sugerencia de jugada»; design, decisión 1).
 * El azar es propio del asistente: no consume el de los rivales.
 */
export function sugerir<V, A>(
  agente: Agente<V, A>,
  vista: V,
  legales: readonly A[],
  azar: EstadoAzar,
): A {
  return agente.decidir(vista, legales, azar).accion;
}

/** La sugerencia, su explicación y lo que simuló la IA difícil (para comentar la jugada luego). */
export interface Asistencia<A> {
  readonly sugerida: A;
  readonly motivo: Motivo;
  readonly simulacion: Simulacion<A>;
}

/** Sugerencia y explicación de una vez: la simulación de la IA difícil sirve para las dos. */
export function asistir<V, A>(
  dificil: Agente<V, A>,
  ctx: ContextoAsistente<V, A>,
  vista: V,
  legales: readonly A[],
  azar: EstadoAzar,
): Asistencia<A> {
  const simulacion = analizar(dificil, vista, legales, azar);
  const sugerida = simulacion.decision.accion;
  return {
    sugerida,
    motivo: explicar(ctx, vista, legales, sugerida, azar, simulacion),
    simulacion,
  };
}

/**
 * Por qué un rival hizo `accion`, medido con su propia vista (spec modo-asistido, «Lectura de
 * las jugadas de los rivales»). Sin simulación de la IA difícil: si no hay un hecho concreto,
 * queda su tipo de acción. «Era su única jugada» no se dice: delataría cartas que el jugador no ve.
 */
export function leer<V, A>(
  ctx: ContextoAsistente<V, A>,
  vista: V,
  legales: readonly A[],
  accion: A,
  azar: EstadoAzar,
): Motivo {
  // Con una sola acción, `explicar` no mide nada: se le da la jugada como única opción conocida.
  const motivo = explicar(
    ctx,
    vista,
    legales.length > 1 ? legales : [accion, accion],
    accion,
    azar,
  );
  return motivo.codigo === 'unica' ? { codigo: 'jugada', datos: motivo.datos } : motivo;
}
