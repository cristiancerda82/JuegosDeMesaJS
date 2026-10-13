import {
  aplicar,
  freecell,
  type AccionFreeCell,
  type ConfigFreeCell,
  type EstadoFreeCell,
} from '@juegos/engine';

/**
 * Resolvedor de pruebas del FreeCell: búsqueda primero-el-mejor sobre las acciones legales del
 * motor, con una heurística sencilla y estados visitados. No es óptimo; basta para encontrar
 * una solución de las partidas habituales y reproducirla en la mesa.
 */

const valor = (id: string) => Number(id.slice(id.lastIndexOf('-') + 1));

/** Menor es mejor: cartas fuera de las fundaciones y cartas que tapan a otras menores. */
function coste(e: EstadoFreeCell): number {
  let fuera = 52;
  for (const f of e.fundaciones) fuera -= f.length;
  let tapadas = 0;
  for (const c of e.columnas) {
    let minimo = 99;
    for (const carta of c) {
      if (valor(carta) > minimo) tapadas++;
      minimo = Math.min(minimo, valor(carta));
    }
  }
  const ocupadas = e.celdas.filter((c) => c !== null).length;
  return fuera * 4 + tapadas * 3 + ocupadas;
}

/** Clave sin el orden de celdas ni columnas, que no cambia el problema. */
function clave(e: EstadoFreeCell): string {
  const celdas = e.celdas
    .filter((c) => c !== null)
    .sort()
    .join(',');
  const columnas = e.columnas
    .map((c) => c.join(','))
    .sort()
    .join('|');
  return `${celdas}#${columnas}`;
}

export function resolverFreeCell(config: ConfigFreeCell, maxNodos = 300_000): AccionFreeCell[] {
  const creado = freecell.crear(config, 'resolvedor');
  if (!creado.ok) throw new Error(creado.error);
  interface Nodo {
    estado: EstadoFreeCell;
    camino: AccionFreeCell[];
    prioridad: number;
  }
  // Cola por prioridad con cubos: los costes son enteros pequeños.
  const cubos = new Map<number, Nodo[]>();
  const meter = (n: Nodo) => {
    const cubo = cubos.get(n.prioridad);
    if (cubo) cubo.push(n);
    else cubos.set(n.prioridad, [n]);
  };
  const sacar = (): Nodo | undefined => {
    const menor = Math.min(...cubos.keys());
    const cubo = cubos.get(menor);
    const n = cubo?.pop();
    if (cubo && cubo.length === 0) cubos.delete(menor);
    return n;
  };

  const vistos = new Set<string>();
  const inicio = creado.valor;
  meter({ estado: inicio, camino: [], prioridad: coste(inicio) });
  vistos.add(clave(inicio));
  for (let nodos = 0; nodos < maxNodos && cubos.size > 0; nodos++) {
    const { estado, camino } = sacar()!;
    const acciones = freecell.accionesLegales(estado, 0);
    const auto = acciones.find((a) => a.tipo === 'autocompletar');
    if (auto) return [...camino, auto];
    for (const accion of acciones) {
      if (accion.tipo !== 'mover') continue;
      const r = aplicar(freecell, estado, 0, accion);
      if (!r.ok) throw new Error(r.error);
      const siguiente = { ...r.valor, historial: [] };
      if (freecell.resultado(siguiente) !== null) return [...camino, accion];
      const k = clave(siguiente);
      if (vistos.has(k)) continue;
      vistos.add(k);
      meter({ estado: siguiente, camino: [...camino, accion], prioridad: coste(siguiente) });
    }
  }
  throw new Error(`El resolvedor no encontró solución para la partida ${inicio.numero}`);
}
