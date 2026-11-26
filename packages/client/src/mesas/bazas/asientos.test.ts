import { describe, expect, it } from 'vitest';
import { lado, LADOS_ARRIBA } from './asientos';

describe('lado de cada asiento en la mesa de bazas', () => {
  it.each([2, 3, 4, 5, 6, 7])(
    'con %i, cada asiento tiene un lado distinto y el jugador va abajo',
    (n) => {
      for (let yo = 0; yo < n; yo++) {
        const lados = Array.from({ length: n }, (_, a) => lado(a, n, yo));
        expect(lados.every((l) => l !== undefined)).toBe(true);
        expect(new Set(lados).size).toBe(n);
        expect(lados[yo]).toBe('abajo');
      }
    },
  );

  it('con 7, derecha, cuatro arriba de derecha a izquierda e izquierda', () => {
    const lados = Array.from({ length: 7 }, (_, a) => lado(a, 7, 0));
    expect(lados).toEqual([
      'abajo',
      'derecha',
      'arriba-derecha',
      'arriba-centro-derecha',
      'arriba-centro-izquierda',
      'arriba-izquierda',
      'izquierda',
    ]);
    const arriba = lados.filter((l) => LADOS_ARRIBA.includes(l));
    expect(arriba).toHaveLength(4);
  });
});
