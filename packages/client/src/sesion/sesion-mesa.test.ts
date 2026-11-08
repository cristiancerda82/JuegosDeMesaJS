import { describe, expect, it } from 'vitest';
import { bazaCerrada } from './sesion-mesa';

describe('baza cerrada (velocidad Pausada)', () => {
  it('con las bazas contadas por asiento', () => {
    expect(bazaCerrada({ bazas: [1, 0] }, { bazas: [1, 1] })).toBe(true);
    expect(bazaCerrada({ bazas: [1, 0] }, { bazas: [1, 0] })).toBe(false);
    // Al cerrar la mano las bazas vuelven a 0: se ve el resumen, no se retiene.
    expect(bazaCerrada({ bazas: [5, 4] }, { bazas: [0, 0] })).toBe(false);
  });

  it('con todas las bazas guardadas (Tarot, Doppelkopf)', () => {
    const baza = { cartas: [], ganador: 0 };
    expect(bazaCerrada({ bazas: [baza] }, { bazas: [baza, baza] })).toBe(true);
  });

  it('con la mesa que se vacía y la última baza (Corazones)', () => {
    const jugada = { asiento: 0, carta: 'copas-2' };
    const ultima = { cartas: [jugada], ganador: 0 };
    expect(bazaCerrada({ mesa: [jugada] }, { mesa: [], ultimaBaza: ultima })).toBe(true);
    // Una escoba también vacía la mesa, pero no es una baza.
    expect(bazaCerrada({ mesa: ['oros-1'] }, { mesa: [] })).toBe(false);
  });
});
