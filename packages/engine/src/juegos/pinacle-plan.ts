import {
  anadidosPosibles,
  aplicarBajada,
  bajadasPosibles,
  basePinacle,
  cartasDe,
  cartasQueBaja,
  clave,
  type AccionBajada,
  type CartaPinacle,
  type Combinacion,
} from './pinacle-combinaciones';
import { bandoPinacle, type VistaPinacle } from './pinacle';

/** Una forma de bajar unas cartas: las jugadas en orden y la combinación que queda. */
export interface PlanBajada {
  readonly acciones: readonly AccionBajada[];
  readonly combinacion: Combinacion;
}

/** Clave de una combinación por cómo queda en la mesa, sin copias ni el orden de un grupo. */
function forma(c: Combinacion): string {
  const bases = cartasDe(c).map((x) => (clave(x) === 'comodin' ? 'comodin' : basePinacle(x)));
  return c.tipo === 'grupo'
    ? `g:${c.numero}:${[...bases].sort().join(',')}`
    : `e:${c.palo}:${c.desde}:${bases.join(',')}`;
}

/**
 * Las formas de bajar las cartas elegidas (spec mesa-cliente: «Bajar»): como una combinación
 * nueva o, con `destino`, añadidas a esa combinación del bando. Cada plan es una secuencia de
 * jugadas legales (un `bajar` de 3 y los `anadir` que hagan falta); los planes que dejan la
 * misma combinación se juntan. Sin planes, las cartas no forman una combinación.
 */
export function planesParaBajar(
  vista: VistaPinacle,
  seleccion: readonly CartaPinacle[],
  destino: number | null = null,
): PlanBajada[] {
  if (vista.asiento === null || vista.miMano === null || seleccion.length === 0) return [];
  const bando = bandoPinacle(vista.asiento);
  const contexto = { id: vista.siguienteId, bando, turno: vista.numeroTurno };
  const delBando = vista.combinaciones.filter((c) => c.bando === bando);
  if (destino !== null && !delBando.some((c) => c.id === destino)) return [];
  if (destino === null && seleccion.length < 3) return [];

  const faltan = new Map<string, number>();
  for (const c of seleccion) faltan.set(clave(c), (faltan.get(clave(c)) ?? 0) + 1);

  const planes = new Map<string, PlanBajada>();
  const vistos = new Set<string>();

  const buscar = (
    mano: readonly CartaPinacle[],
    combinaciones: readonly Combinacion[],
    objetivo: number | null,
    faltanAhora: Map<string, number>,
    acciones: readonly AccionBajada[],
  ) => {
    const actual = objetivo === null ? null : combinaciones.find((c) => c.id === objetivo)!;
    if (actual && [...faltanAhora.values()].every((n) => n === 0)) {
      if (!planes.has(forma(actual))) planes.set(forma(actual), { acciones, combinacion: actual });
      return;
    }
    const clavePaso = `${actual ? forma(actual) : '-'}|${[...faltanAhora.entries()].join(';')}`;
    if (vistos.has(clavePaso)) return;
    vistos.add(clavePaso);

    const candidatas: AccionBajada[] =
      actual === null
        ? bajadasPosibles(mano, vista.debeBajar).map((combinacion) => ({
            tipo: 'bajar' as const,
            combinacion,
          }))
        : anadidosPosibles(mano, [actual], vista.debeBajar);
    for (const accion of candidatas) {
      const restan = new Map(faltanAhora);
      const encaja = cartasQueBaja(accion).every((c) => {
        const n = restan.get(clave(c)) ?? 0;
        restan.set(clave(c), n - 1);
        return n > 0;
      });
      if (!encaja) continue;
      const tras = aplicarBajada(mano, combinaciones, accion, contexto);
      buscar(tras.mano, tras.combinaciones, objetivo ?? contexto.id, restan, [...acciones, accion]);
    }
  };

  buscar(vista.miMano, delBando, destino, faltan, []);
  return [...planes.values()];
}
