import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  barajaPolignac,
  CONFIG_POLIGNAC_POR_DEFECTO,
  ganadoraPolignac,
  polignac,
  type AccionPolignac,
  type ConfigPolignac,
  type EstadoPolignac,
} from '../../src/juegos/polignac';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(config: Partial<ConfigPolignac> = {}, semilla = 'polignac'): EstadoPolignac {
  const r = polignac.crear({ ...CONFIG_POLIGNAC_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoPolignac, accion: AccionPolignac): EstadoPolignac {
  const r = aplicar(polignac, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const jugar = (e: EstadoPolignac, ...cartas: string[]) =>
  cartas.reduce((x, t) => hacer(x, { tipo: 'jugar', carta: una(t) }), e);

/** Una mano a mitad de bazas con estas manos (en orden de asiento). */
function enBazas(manos: string[], parcial: Partial<EstadoPolignac> = {}): EstadoPolignac {
  return { ...nueva(), fase: 'bazas', turno: 0, manos: manos.map(c), ...parcial };
}

describe('baraja y reparto', () => {
  it('con 4, 32 cartas y 8 a cada uno; decide primero el siguiente al que reparte', () => {
    expect(barajaPolignac(4)).toHaveLength(32);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
    expect(new Set(e.manos.flat()).size).toBe(32);
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('general');
    expect(e.turno).toBe(1);
  });

  it.each([
    [3, 10],
    [5, 6],
    [6, 5],
  ] as const)('con %i, 30 cartas sin el 7 de picas ni el de tréboles: %i a cada uno', (n, cada) => {
    const e = nueva({ jugadores: n });
    expect(e.manos.map((m) => m.length)).toEqual(Array(n).fill(cada));
    expect(e.manos.flat()).toHaveLength(30);
    expect(e.manos.flat()).not.toContain('picas-7');
    expect(e.manos.flat()).not.toContain('treboles-7');
  });

  it('rechaza 2 o 7 jugadores y límites que no son 10, 20 o 30', () => {
    for (const jugadores of [2, 7]) {
      const r = polignac.crear({ ...CONFIG_POLIGNAC_POR_DEFECTO, jugadores } as never, 'x');
      expect(r.ok).toBe(false);
    }
    const r = polignac.crear({ ...CONFIG_POLIGNAC_POR_DEFECTO, limite: 15 } as never, 'x');
    expect(r.ok).toBe(false);
  });
});

describe('bazas', () => {
  it('sin triunfo gana la más alta del palo de salida', () => {
    expect(ganadoraPolignac(enMesa([0, '7p'], [1, 'Ac'], [2, '8p'], [3, 'Kt'])).asiento).toBe(2);
  });

  it('hay que seguir el palo; sin él, cualquier carta', () => {
    const e = enBazas(['', '9c Qc 8d', '', ''], { turno: 1, mesa: enMesa([0, '7c']) });
    expect(polignac.accionesLegales(e, 1).map((a) => (a as { carta: string }).carta)).toEqual(
      c('9c Qc').sort(),
    );
    const f = enBazas(['', '9c Qd', '', ''], { turno: 1, mesa: enMesa([0, '7p']) });
    expect(polignac.accionesLegales(f, 1)).toHaveLength(2);
  });

  it('la J de picas y la de corazones en una baza: −3 para quien la gana', () => {
    const e = jugar(enBazas(['Ap 7d', 'Jp 8d', 'Jc 9d', '9p Jd Jt']), 'Ap', 'Jp', 'Jc', '9p');
    expect(e.puntosMano).toEqual([-3, 0, 0, 0]);
    expect(e.bazas).toEqual([1, 0, 0, 0]);
    expect(e.turno).toBe(0);
  });

  it('la mano se acaba en cuanto se han ganado las cuatro J', () => {
    const e = jugar(enBazas(['Ap Ad', 'Jp 8d', 'Jc 9d', 'Jd Jt']), 'Ap', 'Jp', 'Jc', 'Jt');
    // Quedaba la J de diamantes: sigue la mano.
    expect(e.resultadosManos).toHaveLength(0);
    const f = jugar(e, 'Ad', '8d', '9d', 'Jd');
    const r = f.resultadosManos.at(-1)!;
    expect(r.puntos).toEqual([-5, 0, 0, 0]);
    expect(r.general).toBeNull();
    expect(r.cumplido).toBeNull();
    // Se reparte la siguiente: reparte el 1 y decide el 2.
    expect(f.repartidor).toBe(1);
    expect(f.turno).toBe(2);
    expect(f.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
  });
});

describe('general', () => {
  it('el primero que lo anuncia lo juega y sale él', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'pasar' }); // 1
    expect(e.turno).toBe(2);
    e = hacer(e, { tipo: 'general' }); // 2
    expect(e.fase).toBe('bazas');
    expect(e.general).toBe(2);
    expect(e.turno).toBe(2);
  });

  it('si todos pasan, sale el siguiente al que reparte', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.fase).toBe('bazas');
    expect(e.general).toBeNull();
    expect(e.turno).toBe(1);
  });

  it('cumplido: los demás anotan −5 y él 0; las J no cuentan', () => {
    const e = jugar(
      enBazas(['Ap Jp', '7p 8c', '8p 9c', '9p Jc'], { general: 0 }),
      'Ap',
      '7p',
      '8p',
      '9p',
      'Jp',
      '8c',
      '9c',
      'Jc',
    );
    const r = e.resultadosManos.at(-1)!;
    expect(r).toMatchObject({ general: 0, cumplido: true, puntos: [0, -5, -5, -5] });
  });

  it('fallido: en cuanto pierde una baza, la mano se acaba y él anota −5', () => {
    const e = jugar(
      enBazas(['Ap 7c 7d', '7p Ac 8d', '8p 9c 9d', '9p 10c 10d'], { general: 0 }),
      'Ap',
      '7p',
      '8p',
      '9p',
      '7c',
      'Ac',
      '9c',
      '10c',
    );
    const r = e.resultadosManos.at(-1)!;
    expect(r).toMatchObject({ general: 0, cumplido: false, puntos: [-5, 0, 0, 0] });
  });

  it('sin el general, la mano empieza con la primera baza', () => {
    const e = nueva({ general: false });
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(1);
  });
});

describe('fin de la partida', () => {
  it('termina al llegar al límite y gana quien tiene más puntos', () => {
    const e = jugar(
      enBazas(['Ap Ad', 'Jp 8d', 'Jc 9d', 'Jd Jt'], { totales: [-9, -3, -2, 0] }),
      'Ap',
      'Jp',
      'Jc',
      'Jt',
      'Ad',
      '8d',
      '9d',
      'Jd',
    );
    expect(e.totales).toEqual([-14, -3, -2, 0]);
    expect(polignac.resultado(e)).toEqual({
      ganadores: [3],
      empate: false,
      puntos: [-14, -3, -2, 0],
    });
    expect(polignac.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('partidas completas de 3 a 6 jugadores', () => {
    for (const jugadores of [3, 4, 5, 6] as const) {
      let e = nueva({ jugadores }, `completa-${jugadores}`);
      while (polignac.resultado(e) === null) {
        e = hacer(e, polignac.accionesLegales(e, e.turno).at(-1)!);
      }
      expect(e.totales.some((t) => t <= -10)).toBe(true);
      // Sin general, cada mano reparte 5 puntos.
      expect(e.totales.reduce((s, t) => s + t, 0)).toBe(-5 * e.resultadosManos.length);
    }
  });
});

describirContrato(polignac, {
  configs: [
    CONFIG_POLIGNAC_POR_DEFECTO,
    { jugadores: 3, limite: 10, general: false },
    { jugadores: 6, limite: 20, general: true },
  ],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 2_000,
});
