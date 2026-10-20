import {
  anadidosRemigio,
  aplicarJugadaRemigio,
  bajadasRemigio,
  baseRemigio,
  cartasDeCombinacion,
  cartasQueBajaRemigio,
  claveRemigio,
  type CartaRemigio,
  type CombinacionRemigio,
  type JugadaRemigio,
} from './remigio-combinaciones';

/** Una forma de bajar unas cartas: las jugadas en orden y la combinación que queda. */
export interface PlanRemigio {
  readonly jugadas: readonly JugadaRemigio[];
  readonly combinacion: CombinacionRemigio;
}

/** Clave de una combinación por cómo queda en la mesa, sin copias ni el orden de un grupo. */
function forma(c: CombinacionRemigio): string {
  const bases = cartasDeCombinacion(c).map((x) =>
    claveRemigio(x) === 'comodin' ? 'comodin' : baseRemigio(x),
  );
  return c.tipo === 'grupo'
    ? `g:${c.numero}:${[...bases].sort().join(',')}`
    : `e:${c.palo}:${c.desde}:${bases.join(',')}`;
}

/**
 * Las formas de bajar las cartas elegidas (spec mesa-cliente: «Bajar»): como una combinación
 * nueva o, con `destino`, añadidas a esa combinación de la mesa. Cada plan es una secuencia de
 * jugadas legales (un `bajar` de 3 y los `anadir` que hagan falta); los planes que dejan la
 * misma combinación se juntan. Sin planes, las cartas no forman una combinación.
 */
export function planesRemigio(
  mano: readonly CartaRemigio[],
  combinaciones: readonly CombinacionRemigio[],
  seleccion: readonly CartaRemigio[],
  nueva: { readonly id: number; readonly duenio: number },
  destino: number | null = null,
): PlanRemigio[] {
  if (seleccion.length === 0) return [];
  if (destino !== null && !combinaciones.some((c) => c.id === destino)) return [];
  if (destino === null && seleccion.length < 3) return [];

  const faltan = new Map<string, number>();
  for (const c of seleccion) faltan.set(claveRemigio(c), (faltan.get(claveRemigio(c)) ?? 0) + 1);

  const planes = new Map<string, PlanRemigio>();
  const vistos = new Set<string>();

  const buscar = (
    manoAhora: readonly CartaRemigio[],
    mesa: readonly CombinacionRemigio[],
    objetivo: number | null,
    faltanAhora: Map<string, number>,
    jugadas: readonly JugadaRemigio[],
  ) => {
    const actual = objetivo === null ? null : mesa.find((c) => c.id === objetivo)!;
    if (actual && [...faltanAhora.values()].every((n) => n === 0)) {
      if (!planes.has(forma(actual))) planes.set(forma(actual), { jugadas, combinacion: actual });
      return;
    }
    const clavePaso = `${actual ? forma(actual) : '-'}|${[...faltanAhora.entries()].join(';')}`;
    if (vistos.has(clavePaso)) return;
    vistos.add(clavePaso);

    const candidatas: JugadaRemigio[] =
      actual === null
        ? bajadasRemigio(manoAhora).map((combinacion) => ({ tipo: 'bajar' as const, combinacion }))
        : anadidosRemigio(manoAhora, [actual]);
    for (const jugada of candidatas) {
      const restan = new Map(faltanAhora);
      const encaja = cartasQueBajaRemigio(jugada).every((c) => {
        const n = restan.get(claveRemigio(c)) ?? 0;
        restan.set(claveRemigio(c), n - 1);
        return n > 0;
      });
      if (!encaja) continue;
      const tras = aplicarJugadaRemigio(manoAhora, mesa, jugada, nueva);
      buscar(tras.mano, tras.combinaciones, objetivo ?? nueva.id, restan, [...jugadas, jugada]);
    }
  };

  buscar(mano, combinaciones, destino, faltan, []);
  return [...planes.values()];
}
