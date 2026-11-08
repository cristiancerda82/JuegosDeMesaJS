import { describe, expect, it } from 'vitest';
import { factorPausas, leerVelocidad } from './ritmo';

describe('velocidad de las jugadas', () => {
  it('por defecto, y con un valor que no existe, Normal', () => {
    expect(leerVelocidad(null)).toBe('normal');
    expect(leerVelocidad('turbo')).toBe('normal');
    expect(leerVelocidad('pausada')).toBe('pausada');
  });

  it('Rápida es el ritmo de antes; Normal, el doble; Pausada, el triple', () => {
    expect(factorPausas('rapida', 1)).toBe(1);
    expect(factorPausas('normal', 1)).toBe(2);
    expect(factorPausas('pausada', 1)).toBe(3);
  });

  it('se combina con el factor de las pruebas (?rapido)', () => {
    expect(factorPausas('normal', 0.05)).toBeCloseTo(0.1);
  });
});
