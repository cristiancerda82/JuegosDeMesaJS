import { describe, expect, it } from 'vitest';
import {
  cartaDeId,
  colorDe,
  COMODINES,
  crearBaraja,
  esComodin,
  esExcusa,
  esTriunfoTarot,
  BARAJA_TAROT,
  numeroTriunfo,
  idCarta,
  type Palo,
} from '../../src/baraja/cartas';

function porPalo(ids: string[]): Map<Palo, number[]> {
  const mapa = new Map<Palo, number[]>();
  for (const id of ids) {
    const carta = cartaDeId(id)!;
    mapa.set(carta.palo, [...(mapa.get(carta.palo) ?? []), carta.valor]);
  }
  return mapa;
}

describe('baraja española', () => {
  it('de 40 cartas: 10 por palo, sin ochos ni nueves', () => {
    const baraja = crearBaraja('espanola40');
    expect(baraja).toHaveLength(40);
    expect(new Set(baraja).size).toBe(40);
    const palos = porPalo(baraja);
    expect([...palos.keys()]).toEqual(['oros', 'copas', 'espadas', 'bastos']);
    for (const valores of palos.values()) {
      expect(valores).toEqual([1, 2, 3, 4, 5, 6, 7, 10, 11, 12]);
    }
  });

  it('de 48 cartas: 12 por palo, del 1 al 12', () => {
    const baraja = crearBaraja('espanola48');
    expect(baraja).toHaveLength(48);
    expect(new Set(baraja).size).toBe(48);
    for (const valores of porPalo(baraja).values()) {
      expect(valores).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    }
  });
});

describe('baraja francesa', () => {
  it('52 cartas, 13 por palo', () => {
    const baraja = crearBaraja('francesa52');
    expect(baraja).toHaveLength(52);
    expect(new Set(baraja).size).toBe(52);
    const palos = porPalo(baraja);
    expect([...palos.keys()]).toEqual(['picas', 'corazones', 'diamantes', 'treboles']);
    for (const valores of palos.values()) {
      expect(valores).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    }
  });

  it('corazones y diamantes son rojos; picas y tréboles, negros', () => {
    expect(colorDe('corazones')).toBe('rojo');
    expect(colorDe('diamantes')).toBe('rojo');
    expect(colorDe('picas')).toBe('negro');
    expect(colorDe('treboles')).toBe('negro');
  });
});

describe('identidad de las cartas', () => {
  it('ida y vuelta del identificador para todas las barajas', () => {
    const todas = [...crearBaraja('espanola48'), ...crearBaraja('francesa52')];
    for (const id of todas) {
      const serializado = JSON.parse(JSON.stringify(id)) as string;
      const carta = cartaDeId(serializado);
      expect(carta).not.toBeNull();
      expect(idCarta(carta!)).toBe(id);
    }
  });

  it('rechaza identificadores inválidos', () => {
    for (const id of [
      '',
      'oros',
      'oros-0',
      'oros-13',
      'picas-15',
      'triunfo-5',
      'excusa',
      'copas-x',
      'rombos-1',
      'oros-1.5',
    ]) {
      expect(cartaDeId(id)).toBeNull();
    }
  });
});

describe('comodines', () => {
  it('una baraja española de 40 con comodines tiene 42 cartas distintas', () => {
    const baraja = crearBaraja('espanola40', { comodines: true });
    expect(baraja).toHaveLength(42);
    expect(new Set(baraja).size).toBe(42);
    expect(baraja.filter(esComodin)).toEqual([...COMODINES]);
  });

  it('sin la opción, las barajas no cambian', () => {
    expect(crearBaraja('espanola40')).toHaveLength(40);
    expect(crearBaraja('espanola48')).toHaveLength(48);
    expect(crearBaraja('espanola40').some(esComodin)).toBe(false);
  });

  it('solo los dos identificadores de comodín son comodines', () => {
    expect(COMODINES.every(esComodin)).toBe(true);
    expect(esComodin('oros-1')).toBe(false);
    expect(esComodin('comodin-3')).toBe(false);
    // Un comodín no tiene palo ni valor.
    expect(cartaDeId('comodin-1')).toBeNull();
  });

  it('la baraja francesa no admite comodines', () => {
    expect(() => crearBaraja('francesa52', { comodines: true })).toThrow();
  });
});

describe('baraja de Tarot', () => {
  it('78 cartas distintas: 56 de palo, 21 triunfos y la Excusa', () => {
    expect(BARAJA_TAROT).toHaveLength(78);
    expect(new Set(BARAJA_TAROT).size).toBe(78);
    expect(BARAJA_TAROT.filter((c) => cartaDeId(c) !== null)).toHaveLength(56);
    expect(BARAJA_TAROT.filter(esTriunfoTarot)).toHaveLength(21);
    expect(BARAJA_TAROT.filter(esExcusa)).toEqual(['excusa']);
  });

  it('el Caballo es el valor 14 de un palo francés, que la baraja de 52 no tiene', () => {
    expect(cartaDeId('picas-14')).toEqual({ palo: 'picas', valor: 14 });
    expect(crearBaraja('francesa52')).not.toContain('picas-14');
  });

  it('los triunfos y la Excusa no tienen palo', () => {
    expect(cartaDeId('triunfo-21')).toBeNull();
    expect(esTriunfoTarot('triunfo-21')).toBe(true);
    expect(esTriunfoTarot('triunfo-22')).toBe(false);
    expect(numeroTriunfo('triunfo-7')).toBe(7);
  });
});
