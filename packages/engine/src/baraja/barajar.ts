import { Generador, type EstadoAzar } from './azar';

/** Baraja con Fisher–Yates. No modifica la entrada; devuelve el nuevo orden y el estado del azar. */
export function barajar<T>(
  cartas: readonly T[],
  azar: EstadoAzar,
): { cartas: T[]; azar: EstadoAzar } {
  const g = new Generador(azar);
  const resultado = [...cartas];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = g.enteroHasta(i + 1);
    [resultado[i], resultado[j]] = [resultado[j] as T, resultado[i] as T];
  }
  return { cartas: resultado, azar: g.estado() };
}
