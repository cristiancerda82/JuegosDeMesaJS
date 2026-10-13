import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { agenteAleatorio } from '../../src/ia/agente';

describe('agente aleatorio', () => {
  const acciones = ['a', 'b', 'c', 'd'] as never[];

  it('elige siempre una de las acciones legales', () => {
    let azar = crearAzar('legal');
    for (let i = 0; i < 200; i++) {
      const d = agenteAleatorio.decidir(null, acciones, azar);
      expect(acciones).toContain(d.accion);
      azar = d.azar;
    }
  });

  it('con la misma semilla elige lo mismo y avanza su generador', () => {
    const a = agenteAleatorio.decidir(null, acciones, crearAzar('s'));
    const b = agenteAleatorio.decidir(null, acciones, crearAzar('s'));
    expect(b).toEqual(a);
    expect(a.azar).not.toEqual(crearAzar('s'));
  });

  it('reparte las elecciones entre todas las acciones', () => {
    const vistas = new Set<unknown>();
    let azar = crearAzar('reparto');
    for (let i = 0; i < 100; i++) {
      const d = agenteAleatorio.decidir(null, acciones, azar);
      vistas.add(d.accion);
      azar = d.azar;
    }
    expect(vistas.size).toBe(acciones.length);
  });

  it('falla si no hay acciones', () => {
    expect(() => agenteAleatorio.decidir(null, [], crearAzar('x'))).toThrow();
  });
});
