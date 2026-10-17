import { describe, expect, it } from 'vitest';
import { crearAzar } from '../src/baraja/azar';
import { esJuegoEnRed, IDS_JUEGOS_EN_RED, JUEGOS_EN_RED } from '../src/red';

describe('juegos en red', () => {
  it('cada juego se crea con su configuración por defecto y tiene sus tres IAs', () => {
    for (const id of IDS_JUEGOS_EN_RED) {
      const j = JUEGOS_EN_RED[id];
      const creado = j.juego.crear(j.configPorDefecto, `red-${id}`);
      expect(creado.ok, id).toBe(true);
      if (!creado.ok) continue;
      const e = creado.valor;
      const asiento = Array.from({ length: j.juego.asientos(e) }, (_, a) => a).find(
        (a) => j.juego.accionesLegales(e, a).length > 0,
      )!;
      const acciones = j.juego.accionesLegales(e, asiento);
      for (const nivel of ['facil', 'normal', 'dificil'] as const) {
        const d = j.ias[nivel].decidir(j.juego.vistaDe(e, asiento), acciones, crearAzar('x'));
        expect(acciones).toContainEqual(d.accion);
      }
    }
  });

  it('solo el Burro es en tiempo real', () => {
    const simultaneos = IDS_JUEGOS_EN_RED.filter((id) => JUEGOS_EN_RED[id].retrasoIA !== null);
    expect(simultaneos).toEqual(['burro']);
  });

  it('los solitarios no se juegan en red', () => {
    expect(esJuegoEnRed('klondike')).toBe(false);
    expect(esJuegoEnRed('mus')).toBe(true);
  });
});
