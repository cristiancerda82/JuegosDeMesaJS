import { describe, expect, it } from 'vitest';
import { crearBaraja } from '../../src/baraja/cartas';
import { repartir } from '../../src/baraja/repartir';

describe('repartir', () => {
  const mazo = crearBaraja('espanola40');

  it('3 cartas a cada uno de 2 jugadores desde un mazo de 40', () => {
    const r = repartir(mazo, [3, 3]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const [mano1, mano2] = r.valor.manos;
    expect(mano1).toHaveLength(3);
    expect(mano2).toHaveLength(3);
    expect(r.valor.mazo).toHaveLength(34);
    const todas = [...mano1!, ...mano2!, ...r.valor.mazo];
    expect(new Set(todas).size).toBe(40);
  });

  it('reparte de a una carta por destino, en ronda, desde arriba', () => {
    const r = repartir(['a', 'b', 'c', 'd', 'e'], [2, 2]);
    expect(r).toEqual({
      ok: true,
      valor: {
        manos: [
          ['a', 'c'],
          ['b', 'd'],
        ],
        mazo: ['e'],
      },
    });
  });

  it('admite cantidades distintas por destino', () => {
    const r = repartir(['a', 'b', 'c', 'd'], [1, 3]);
    expect(r).toEqual({ ok: true, valor: { manos: [['a'], ['b', 'c', 'd']], mazo: [] } });
  });

  it('falla sin repartir si faltan cartas', () => {
    const corto = mazo.slice(0, 4);
    const copia = [...corto];
    const r = repartir(corto, [5]);
    expect(r.ok).toBe(false);
    expect(corto).toEqual(copia);
  });

  it('rechaza cantidades inválidas', () => {
    expect(repartir(mazo, [-1]).ok).toBe(false);
    expect(repartir(mazo, [1.5]).ok).toBe(false);
  });
});
