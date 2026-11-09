import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JUEGOS, type DefJuego, type IdJuego } from './juegos';
import { Sesion } from './sesion.svelte';

// Spec modo-asistido, «El modo asistido no cambia el juego»: misma semilla y mismas jugadas del
// jugador, con y sin modo asistido, dan las mismas jugadas de los rivales y el mismo final.

type Def = DefJuego<unknown, unknown, unknown, unknown>;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Juega la partida entera: el jugador elige siempre su primera acción legal. */
async function jugar(
  id: IdJuego,
  asistido: boolean,
): Promise<{ vistas: string[]; fin: string; asistencias: number; lecturas: number }> {
  const def = JUEGOS[id] as Def;
  const r = Sesion.nueva(def, def.configPorDefecto, `misma-${id}`, 'normal', asistido);
  if (!r.ok) throw new Error(r.error);
  const sesion = r.valor;
  const vistas: string[] = [];
  let asistencias = 0;
  let lecturas = 0;
  for (let paso = 0; paso < 400 && sesion.fin === null; paso++) {
    // Sin workers (en los tests), el asistente calcula tras un temporizador y responde con una
    // promesa: se dejan correr los dos.
    await vi.runOnlyPendingTimersAsync();
    await vi.runOnlyPendingTimersAsync();
    if (sesion.retenida) sesion.seguir();
    if (sesion.asistencia !== null) asistencias++;
    lecturas += sesion.lecturas.length;
    const accion = sesion.legales[0];
    if (accion !== undefined) {
      sesion.jugar(accion);
      vistas.push(JSON.stringify(sesion.vista));
    }
  }
  sesion.cerrar();
  return { vistas, fin: JSON.stringify(sesion.fin), asistencias, lecturas };
}

describe('el modo asistido no cambia la partida', () => {
  it.each(['brisca', 'escoba', 'chinchon', 'sieteYMedia'] as const)(
    '%s',
    async (id) => {
      const sin = await jugar(id, false);
      const con = await jugar(id, true);
      expect(con.asistencias, 'el asistente no llegó a sugerir nada').toBeGreaterThan(0);
      expect(con.lecturas, 'el asistente no explicó ninguna jugada de los rivales').toBeGreaterThan(
        0,
      );
      expect(sin.asistencias).toBe(0);
      expect(sin.lecturas).toBe(0);
      expect(con.vistas).toEqual(sin.vistas);
      expect(con.fin).toBe(sin.fin);
    },
    120_000,
  );
});
