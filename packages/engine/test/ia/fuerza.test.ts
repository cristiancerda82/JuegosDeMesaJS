import { describe, expect, it } from 'vitest';
import { duelo } from './duelo';
import { JUEGOS_CON_NIVELES } from './tabla-niveles';

/** Variable de entorno sin depender de los tipos de Node (el motor no los usa). */
const entorno = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  ?.env;

/**
 * Fuerza del nivel difícil contra el normal (spec niveles-ia): 200 partidas por juego. Tarda
 * minutos, así que solo se ejecuta con `FUERZA=1`.
 */
describe.runIf(entorno?.FUERZA)('difícil contra normal', () => {
  it.each(JUEGOS_CON_NIVELES.filter((j) => j.simula))('$nombre', { timeout: 7_200_000 }, (j) => {
    const partidas = 200;
    const r = duelo(j.juego, j.config, j.ias.dificil, j.ias.normal, partidas, j.esA, 'fuerza');
    expect(r.ganadas, `${r.ganadas} de ${r.partidas} (máx. ${r.maxMs} ms)`).toBeGreaterThan(
      partidas * j.parteJusta,
    );
    // Aquí se mide sin otros tests en paralelo: 250 ms en escritorio dejan margen para los
    // 500 ms en un móvil de gama media.
    expect(r.maxMs).toBeLessThan(250);
  });
});
