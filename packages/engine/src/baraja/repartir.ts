import { error, ok, type Resultado } from '../resultado';

/**
 * Reparte desde la parte superior del mazo (índice 0) de a una carta por destino, en ronda,
 * hasta que cada destino recibe su cantidad. Si no alcanzan las cartas, falla sin repartir nada.
 */
export function repartir<T>(
  mazo: readonly T[],
  cantidades: readonly number[],
): Resultado<{ manos: T[][]; mazo: T[] }> {
  if (cantidades.some((n) => !Number.isInteger(n) || n < 0)) {
    return error('Las cantidades a repartir deben ser enteros no negativos');
  }
  const total = cantidades.reduce((suma, n) => suma + n, 0);
  if (total > mazo.length) {
    return error(`No hay cartas suficientes: se piden ${total} y el mazo tiene ${mazo.length}`);
  }
  const manos: T[][] = cantidades.map(() => []);
  let siguiente = 0;
  const maximo = Math.max(0, ...cantidades);
  for (let ronda = 0; ronda < maximo; ronda++) {
    cantidades.forEach((cantidad, destino) => {
      if (ronda < cantidad) manos[destino]!.push(mazo[siguiente++] as T);
    });
  }
  return ok({ manos, mazo: mazo.slice(siguiente) });
}
