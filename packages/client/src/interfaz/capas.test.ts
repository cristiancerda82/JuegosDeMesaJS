import { describe, expect, it } from 'vitest';
import { abrirCapa, capasAbiertas, cerrarUltimaCapa } from './capas';

describe('capas abiertas', () => {
  it('cierra de la última a la primera y avisa cuando no queda ninguna', () => {
    const cerradas: string[] = [];
    abrirCapa(() => cerradas.push('panel'));
    const baja = abrirCapa(() => {
      cerradas.push('guía');
      baja();
    });
    expect(capasAbiertas()).toBe(2);
    expect(cerrarUltimaCapa()).toBe(true);
    expect(cerrarUltimaCapa()).toBe(true);
    expect(cerrarUltimaCapa()).toBe(false);
    expect(cerradas).toEqual(['guía', 'panel']);
  });

  it('una capa dada de baja ya no se cierra', () => {
    let cerrada = false;
    const baja = abrirCapa(() => (cerrada = true));
    baja();
    expect(cerrarUltimaCapa()).toBe(false);
    expect(cerrada).toBe(false);
  });
});
