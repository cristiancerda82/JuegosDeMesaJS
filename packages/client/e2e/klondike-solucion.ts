import { expect, type Page } from '@playwright/test';
import {
  aplicar,
  klondike,
  type AccionKlondike,
  type ConfigKlondike,
  type EstadoKlondike,
} from '@juegos/engine';

/**
 * Busca, con el motor, una secuencia de acciones que gane un Klondike con la semilla dada.
 * Búsqueda en profundidad con poda por estados ya vistos; sirve para jugar por la UI una
 * partida completa y reproducible en los tests E2E.
 */
export function solucionarKlondike(
  semilla: string,
  config: ConfigKlondike = { robo: 1, reciclajes: null },
  limiteNodos = 200_000,
): AccionKlondike[] | null {
  const inicio = klondike.crear(config, semilla);
  if (!inicio.ok) return null;
  const vistos = new Set<string>();
  const camino: AccionKlondike[] = [];
  let nodos = 0;

  const clave = (e: EstadoKlondike) =>
    JSON.stringify([
      e.mazo.length,
      e.descarte.at(-1),
      e.columnas,
      e.fundaciones.map((f) => f.length),
    ]);

  // Primero lo que más avanza: autocompletar, fundaciones, columnas, y robar al final.
  const prioridad = (a: AccionKlondike) => {
    if (a.tipo === 'autocompletar') return 0;
    if (a.tipo === 'mover' && a.hasta.startsWith('f')) return 1;
    if (a.tipo === 'mover' && a.desde.startsWith('c')) return 2;
    if (a.tipo === 'mover' && a.desde === 'descarte') return 3;
    if (a.tipo === 'robar' || a.tipo === 'reciclar') return 4;
    return 9;
  };

  const candidatas = (e: EstadoKlondike) =>
    klondike
      .accionesLegales(e, 0)
      .filter((a) => a.tipo !== 'deshacer' && a.tipo !== 'abandonar')
      // Sacar de una fundación rara vez ayuda y multiplica la búsqueda.
      .filter((a) => !(a.tipo === 'mover' && a.desde.startsWith('f')))
      // Entre columnas, solo mover la pila visible entera y solo si descubre una carta oculta.
      .filter((a) => {
        if (a.tipo !== 'mover' || !a.desde.startsWith('c') || !a.hasta.startsWith('c')) return true;
        const col = e.columnas[Number(a.desde.slice(1))]!;
        return a.cantidad === col.visibles.length && col.ocultas.length > 0;
      })
      .sort((a, b) => prioridad(a) - prioridad(b));

  // Profundidad iterativa con pila explícita: las soluciones pueden tener miles de pasos.
  vistos.add(clave(inicio.valor));
  const pila = [{ acciones: candidatas(inicio.valor), i: 0, estado: inicio.valor }];
  while (pila.length > 0) {
    const tope = pila.at(-1)!;
    if (tope.i >= tope.acciones.length) {
      pila.pop();
      if (pila.length > 0) camino.pop();
      continue;
    }
    const accion = tope.acciones[tope.i++]!;
    const r = aplicar(klondike, tope.estado, 0, accion);
    if (!r.ok) continue;
    if (klondike.resultado(r.valor)?.ganadores.length) return [...camino, accion];
    if (++nodos > limiteNodos) return null;
    const k = clave(r.valor);
    if (vistos.has(k)) continue;
    vistos.add(k);
    camino.push(accion);
    pila.push({ acciones: candidatas(r.valor), i: 0, estado: r.valor });
  }
  return null;
}

/** Repite las acciones y devuelve los estados intermedios (para saber qué carta mover). */
export function estadosDe(semilla: string, acciones: readonly AccionKlondike[]): EstadoKlondike[] {
  const r = klondike.crear({ robo: 1, reciclajes: null }, semilla);
  if (!r.ok) throw new Error(r.error);
  const estados = [r.valor];
  for (const a of acciones) {
    const s = aplicar(klondike, estados.at(-1)!, 0, a);
    if (!s.ok) throw new Error(s.error);
    estados.push(s.valor);
  }
  return estados;
}

// ── Jugar desde la mesa ──────────────────────────────────────────────────────

/** Carta que se toca para hacer un movimiento (la base de la secuencia que se mueve). */
function cartaOrigen(e: EstadoKlondike, a: Extract<AccionKlondike, { tipo: 'mover' }>): string {
  if (a.desde === 'descarte') return e.descarte.at(-1)!;
  const i = Number(a.desde.slice(1));
  if (a.desde.startsWith('f')) return e.fundaciones[i]!.at(-1)!;
  const visibles = e.columnas[i]!.visibles;
  return visibles[visibles.length - a.cantidad]!;
}

/** Toca la esquina superior izquierda, que siempre queda a la vista aunque haya cartas encima. */
const ESQUINA = { position: { x: 8, y: 8 } };

/** Juega por la UI las acciones de una solución, comprobando el contador de movimientos. */
export async function jugarKlondike(
  page: Page,
  semilla: string,
  acciones: readonly AccionKlondike[],
) {
  const estados = estadosDe(semilla, acciones);
  for (const [i, a] of acciones.entries()) {
    const e = estados[i]!;
    await page.waitForFunction(() => document.getAnimations().length === 0);
    if (a.tipo === 'robar' || a.tipo === 'reciclar') {
      await page.getByTestId('mazo').click();
    } else if (a.tipo === 'autocompletar') {
      await page.getByRole('button', { name: 'Autocompletar' }).click();
    } else if (a.tipo === 'mover') {
      await page.locator(`[data-carta="${cartaOrigen(e, a)}"]`).click(ESQUINA);
      await page.getByTestId(a.hasta).click(ESQUINA);
    }
    if (a.tipo !== 'autocompletar') {
      await expect(page.getByTestId('movimientos')).toHaveText(String(estados[i + 1]!.movimientos));
    }
  }
}
