import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import { NIVELES_IA } from '../../src/ia/niveles';
import { duelo } from './duelo';
import { JUEGOS_CON_NIVELES } from './tabla-niveles';

/** Garantías de los tres niveles en todos los juegos con IA (spec niveles-ia). */
describe.each(JUEGOS_CON_NIVELES)('niveles de la IA: $nombre', (j) => {
  it('partidas mezclando niveles terminan sin acciones ilegales, y el difícil decide rápido', () => {
    // Difícil contra fácil en unas pocas partidas: la normal juega dentro de la simulación.
    const r = duelo(j.juego, j.config, j.ias.dificil, j.ias.facil, 2, j.esA, 'mezcla');
    expect(r.partidas).toBe(2);
    // 250 ms en escritorio dejan margen para los 500 ms en un móvil de gama media.
    expect(r.maxMs).toBeLessThan(250);
  });

  it('todos los niveles son reproducibles', () => {
    const creado = j.juego.crear(j.config, 'repro-niveles');
    if (!creado.ok) throw new Error(creado.error);
    let e = creado.valor;
    // Unas jugadas al azar para no decidir siempre en el estado inicial.
    const g = new Generador(crearAzar('repro-niveles'));
    for (let paso = 0; paso < 6 && j.juego.resultado(e) === null; paso++) {
      const s = Array.from({ length: j.juego.asientos(e) }, (_, a) => a).find(
        (a) => j.juego.accionesLegales(e, a).length > 0,
      )!;
      const acciones = j.juego.accionesLegales(e, s);
      e = j.juego.transicion(e, s, acciones[g.enteroHasta(acciones.length)]!);
    }
    const s = Array.from({ length: j.juego.asientos(e) }, (_, a) => a).find(
      (a) => j.juego.accionesLegales(e, a).length > 0,
    )!;
    const vista = j.juego.vistaDe(e, s);
    const acciones = j.juego.accionesLegales(e, s);
    for (const nivel of NIVELES_IA) {
      const a = j.ias[nivel].decidir(vista, acciones, crearAzar('semilla'));
      const b = j.ias[nivel].decidir(
        JSON.parse(JSON.stringify(vista)),
        [...acciones],
        crearAzar('semilla'),
      );
      expect(b).toEqual(a);
    }
  });

  it('la normal gana a la fácil', { timeout: 300_000 }, () => {
    const partidas = 300;
    const r = duelo(j.juego, j.config, j.ias.normal, j.ias.facil, partidas, j.esA, 'facil');
    expect(r.ganadas, `${r.ganadas} de ${r.partidas}`).toBeGreaterThan(partidas * j.parteJusta);
  });
});
