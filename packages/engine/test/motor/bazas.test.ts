import { describe, expect, it } from 'vitest';
import { crearBaraja, type IdCarta } from '../../src/baraja/cartas';
import {
  bandoDe,
  cartaDeCambio,
  cartaGanadora,
  cartasObligadas,
  fuerza,
  puntosDe,
  robar,
  siguiente,
  VALORES_BUTIFARRA,
  VALORES_GUINOTE,
  type CartaJugada,
} from '../../src/motor/bazas';

const jugadas = (...cartas: [number, IdCarta][]): CartaJugada[] =>
  cartas.map(([asiento, carta]) => ({ asiento, carta }));

describe('valores', () => {
  it('la baraja de 40 suma 120 puntos', () => {
    expect(crearBaraja('espanola40').reduce((s, c) => s + puntosDe(c), 0)).toBe(120);
  });

  it('orden: as, tres, rey, caballo, sota, 7, 6, 5, 4, 2', () => {
    const orden = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2].map((v) => `oros-${v}` as IdCarta);
    expect([...orden].sort((a, b) => fuerza(b) - fuerza(a))).toEqual(orden);
  });
});

describe('cartaGanadora', () => {
  it('gana el triunfo más alto', () => {
    const mesa = jugadas([0, 'oros-1'], [1, 'copas-4'], [2, 'copas-2']);
    expect(cartaGanadora(mesa, 'copas').asiento).toBe(1);
  });

  it('sin triunfos gana la más alta del palo de salida', () => {
    const mesa = jugadas([0, 'espadas-4'], [1, 'bastos-1'], [2, 'espadas-7']);
    expect(cartaGanadora(mesa, 'oros').asiento).toBe(2);
  });
});

describe('cartaDeCambio', () => {
  it('el 7 con una muestra alta y el 2 con una muestra de 7 o menos', () => {
    expect(cartaDeCambio('oros-1')).toBe('oros-7');
    expect(cartaDeCambio('oros-10')).toBe('oros-7');
    expect(cartaDeCambio('oros-7')).toBe('oros-2');
    expect(cartaDeCambio('oros-5')).toBe('oros-2');
  });
});

describe('asientos', () => {
  it('bandos y turno', () => {
    expect([0, 1, 2, 3].map(bandoDe)).toEqual([0, 1, 0, 1]);
    expect(siguiente(3, 4)).toBe(0);
    expect(siguiente(0, 2)).toBe(1);
  });
});

describe('robar', () => {
  it('roba primero el ganador, de arriba del mazo', () => {
    const r = robar([['oros-1'], ['oros-2']], ['copas-1', 'copas-2', 'copas-3'], 'bastos-5', 1);
    expect(r.manos).toEqual([
      ['oros-1', 'copas-2'],
      ['oros-2', 'copas-3'],
    ]);
    expect(r.mazo).toEqual(['copas-1']);
    expect(r.muestra).toBe('bastos-5');
  });

  it('agotado el mazo se roba la muestra', () => {
    const r = robar([[], []], ['copas-1'], 'bastos-5', 0);
    expect(r.manos).toEqual([['copas-1'], ['bastos-5']]);
    expect(r.mazo).toEqual([]);
    expect(r.muestra).toBeNull();
  });

  it('sin nada que robar, no cambia nada', () => {
    const r = robar([['oros-1'], []], [], null, 0);
    expect(r.manos).toEqual([['oros-1'], []]);
  });

  it('no modifica la entrada', () => {
    const manos: IdCarta[][] = [[], []];
    const mazo: IdCarta[] = ['copas-1', 'copas-2'];
    robar(manos, mazo, null, 0);
    expect(manos).toEqual([[], []]);
    expect(mazo).toEqual(['copas-1', 'copas-2']);
  });
});

describe('cartasObligadas', () => {
  const montando = (asiento: number) => ({ asiento, montarSobreCompanero: true });
  const sinMontar = (asiento: number) => ({ asiento, montarSobreCompanero: false });

  it('con la baza vacía, cualquier carta', () => {
    const mano: IdCarta[] = ['oros-1', 'copas-2'];
    expect(cartasObligadas(mano, [], 'oros', montando(0))).toEqual(mano);
  });

  it('seguir el palo y montar si se puede', () => {
    const mesa = jugadas([0, 'espadas-12']);
    expect(
      cartasObligadas(['espadas-2', 'espadas-3', 'oros-1'], mesa, 'copas', montando(1)),
    ).toEqual(['espadas-3']);
  });

  it('si no se puede montar con el palo, cualquiera del palo', () => {
    const mesa = jugadas([0, 'espadas-1']);
    expect(
      cartasObligadas(['espadas-2', 'espadas-4', 'oros-1'], mesa, 'copas', montando(1)),
    ).toEqual(['espadas-2', 'espadas-4']);
  });

  it('si la baza está fallada, se sigue el palo sin poder superarla', () => {
    const mesa = jugadas([0, 'espadas-4'], [1, 'copas-2']);
    expect(cartasObligadas(['espadas-1', 'espadas-5'], mesa, 'copas', montando(2))).toEqual([
      'espadas-1',
      'espadas-5',
    ]);
  });

  it('sin el palo, fallar y superar el triunfo más alto si se puede', () => {
    const mesa = jugadas([0, 'espadas-1'], [1, 'copas-12']);
    expect(cartasObligadas(['copas-2', 'copas-3', 'oros-1'], mesa, 'copas', montando(2))).toEqual([
      'copas-3',
    ]);
  });

  it('sin el palo ni triunfo, cualquier carta', () => {
    const mesa = jugadas([0, 'espadas-1']);
    expect(cartasObligadas(['oros-1', 'bastos-2'], mesa, 'copas', montando(1))).toEqual([
      'oros-1',
      'bastos-2',
    ]);
  });

  it('si la baza es del compañero y no hay que montar, cualquiera del palo', () => {
    const mesa = jugadas([0, 'espadas-1'], [1, 'espadas-4']);
    expect(cartasObligadas(['espadas-2', 'espadas-3'], mesa, 'copas', sinMontar(2))).toEqual([
      'espadas-2',
      'espadas-3',
    ]);
  });

  it('si la baza es del compañero y no tiene el palo, cualquier carta', () => {
    const mesa = jugadas([0, 'espadas-1'], [1, 'espadas-4']);
    expect(cartasObligadas(['copas-2', 'oros-3'], mesa, 'copas', sinMontar(2))).toEqual([
      'copas-2',
      'oros-3',
    ]);
  });

  it('con montar sobre el compañero, hay que superarlo', () => {
    const mesa = jugadas([0, 'espadas-12'], [1, 'espadas-4']);
    expect(cartasObligadas(['espadas-2', 'espadas-3'], mesa, 'copas', montando(2))).toEqual([
      'espadas-3',
    ]);
  });
});

describe('valores del Guiñote', () => {
  const G = VALORES_GUINOTE;

  it('la baraja de 40 suma 120 puntos', () => {
    expect(crearBaraja('espanola40').reduce((s, c) => s + puntosDe(c, G), 0)).toBe(120);
  });

  it('orden: as, tres, rey, sota, caballo, 7, 6, 5, 4, 2; la sota vale 3 y el caballo 2', () => {
    const orden = [1, 3, 12, 10, 11, 7, 6, 5, 4, 2].map((v) => `oros-${v}` as IdCarta);
    expect([...orden].sort((a, b) => fuerza(b, G) - fuerza(a, G))).toEqual(orden);
    expect(puntosDe('oros-10', G)).toBe(3);
    expect(puntosDe('oros-11', G)).toBe(2);
  });

  it('la sota gana al caballo', () => {
    const mesa = jugadas([0, 'oros-11'], [1, 'oros-10']);
    expect(cartaGanadora(mesa, 'copas', G).asiento).toBe(1);
    expect(cartaGanadora(mesa, 'copas').asiento).toBe(0);
  });

  it('obligaciones con el orden del Guiñote: montar con la sota sobre el caballo', () => {
    const mano: IdCarta[] = ['espadas-2', 'espadas-10', 'oros-1'];
    const mesa = jugadas([0, 'espadas-11']);
    expect(
      cartasObligadas(mano, mesa, 'copas', {
        asiento: 1,
        montarSobreCompanero: false,
        valores: G,
      }),
    ).toEqual(['espadas-10']);
  });

  it('cambio: el 7, o el 2 si la muestra es un 7 o menor', () => {
    expect(cartaDeCambio('bastos-10', G)).toBe('bastos-7');
    expect(cartaDeCambio('bastos-11', G)).toBe('bastos-7');
    expect(cartaDeCambio('bastos-6', G)).toBe('bastos-2');
  });
});

describe('valores de la Butifarra y sin triunfo', () => {
  const B = VALORES_BUTIFARRA;

  it('la baraja de 48 suma 60 puntos de cartas (72 con las 12 bazas)', () => {
    expect(crearBaraja('espanola48').reduce((s, c) => s + puntosDe(c, B), 0)).toBe(60);
  });

  it('orden: manilla, as, rey, caballo, sota, 8…2', () => {
    const orden = [9, 1, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2].map((v) => `oros-${v}` as IdCarta);
    expect([...orden].sort((a, b) => fuerza(b, B) - fuerza(a, B))).toEqual(orden);
  });

  it('sin triunfo gana la más alta del palo de salida aunque haya manillas de otro palo', () => {
    const mesa = jugadas([0, 'copas-12'], [1, 'oros-9'], [2, 'copas-1'], [3, 'espadas-9']);
    expect(cartaGanadora(mesa, null, B).asiento).toBe(2);
  });

  it('sin triunfo y sin el palo de salida, cualquier carta', () => {
    const mano: IdCarta[] = ['oros-2', 'bastos-9'];
    const mesa = jugadas([0, 'copas-12']);
    expect(
      cartasObligadas(mano, mesa, null, { asiento: 1, montarSobreCompanero: false, valores: B }),
    ).toEqual(mano);
  });

  it('con el palo hay que superar; si la baza es del compañero, solo seguir el palo', () => {
    const mano: IdCarta[] = ['copas-10', 'copas-9', 'oros-1'];
    const opciones = { montarSobreCompanero: false, valores: B } as const;
    expect(
      cartasObligadas(mano, jugadas([0, 'copas-12']), 'oros', { ...opciones, asiento: 1 }),
    ).toEqual(['copas-9']);
    expect(
      cartasObligadas(mano, jugadas([0, 'copas-12'], [1, 'copas-2']), 'oros', {
        ...opciones,
        asiento: 2,
      }),
    ).toEqual(['copas-10', 'copas-9']);
  });
});
