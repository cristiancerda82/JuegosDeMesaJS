import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_CONQUIAN_POR_DEFECTO,
  conquian,
  esCombinacionConquian,
  type AccionConquian,
  type EstadoConquian,
} from '../../src/juegos/conquian';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;

function nueva(semilla = 'conquian', manosParaGanar = 3): EstadoConquian {
  const r = conquian.crear({ manosParaGanar }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoConquian, accion: AccionConquian): EstadoConquian {
  const r = aplicar(conquian, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const pasar = (e: EstadoConquian) => hacer(e, { tipo: 'pasar' });

/** Un estado en el que se le ofrece al 0 la carta `d`, descubierta por él. */
function conDescubierta(d: string, mano0: string, parcial: Partial<EstadoConquian> = {}) {
  const e = nueva();
  return {
    ...e,
    manos: [c(mano0), e.manos[1]!],
    descubierta: una(d),
    origen: 'mazo',
    deQuien: 0,
    ofrecidaA: 0,
    fase: 'decidir',
    turno: 0,
    ...parcial,
  } satisfies EstadoConquian;
}

describe('baraja y reparto', () => {
  it('10 cartas a cada uno, 20 en el mazo, y se descubre la primera para el 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10]);
    expect(e.mazo).toHaveLength(19);
    expect(e.descubierta).not.toBeNull();
    expect(e.ofrecidaA).toBe(0);
    expect(e.turno).toBe(0);
    expect(conquian.vistaDe(e, 1).enMazo).toBe(19);
  });
});

describe('combinaciones', () => {
  it('el 7 y la sota van seguidos', () => {
    expect(esCombinacionConquian(c('6c 7c Sc'))).toBe(true);
    expect(esCombinacionConquian(c('Sc Cc Rc'))).toBe(true);
  });

  it('sin dar la vuelta', () => {
    expect(esCombinacionConquian(c('Ro Ao 2o'))).toBe(false);
  });

  it('grupos de 3 o 4 del mismo número', () => {
    expect(esCombinacionConquian(c('5o 5c 5b'))).toBe(true);
    expect(esCombinacionConquian(c('5o 5c 5b 5e'))).toBe(true);
    expect(esCombinacionConquian(c('5o 5c'))).toBe(false);
  });
});

describe('la carta descubierta', () => {
  it('si pasa quien la descubre, se ofrece al rival', () => {
    const e = pasar(nueva());
    expect(e.ofrecidaA).toBe(1);
    expect(e.turno).toBe(1);
  });

  it('si pasan los dos, queda muerta y el rival descubre la siguiente', () => {
    const inicio = nueva();
    const primera = inicio.descubierta!;
    const e = pasar(pasar(inicio));
    expect(e.muertas).toEqual([primera]);
    expect(e.deQuien).toBe(1);
    expect(e.ofrecidaA).toBe(1);
    expect(e.mazo).toHaveLength(18);
    expect(conquian.vistaDe(e, 0).muertas).toEqual([primera]);
  });

  it('bajar un grupo con la descubierta y dos de la mano', () => {
    let e = conDescubierta('5b', '5o 5c 2e 3e Rc 7o Sb Cb 4o 6c');
    expect(conquian.accionesLegales(e, 0)).toContainEqual({
      tipo: 'bajar',
      cartas: c('5c 5o'),
    });
    e = hacer(e, { tipo: 'bajar', cartas: c('5c 5o') });
    expect(e.combinaciones[0]).toEqual([c('5b 5c 5o')]);
    expect(e.manos[0]).toHaveLength(8);
    expect(e.fase).toBe('descartar');
    e = hacer(e, { tipo: 'descartar', carta: una('Rc') });
    expect(e.descubierta).toBe(una('Rc'));
    expect(e.origen).toBe('descarte');
    expect(e.ofrecidaA).toBe(1);
  });

  it('añadir a una escalera propia', () => {
    const e = conDescubierta('6e', '2o 3o Rc 7o Sb Cb 4o', {
      combinaciones: [[c('3e 4e 5e')], []],
    });
    expect(conquian.accionesLegales(e, 0)).toContainEqual({
      tipo: 'anadir',
      combinacion: 0,
      cartas: [],
    });
    const f = hacer(e, { tipo: 'anadir', combinacion: 0, cartas: [] });
    expect(f.combinaciones[0]).toEqual([c('3e 4e 5e 6e')]);
  });

  it('la descartada solo se ofrece al rival: si pasa, queda muerta y descubre él', () => {
    let e = conDescubierta('5b', '5o 5c 2e 3e Rc 7o Sb Cb 4o 6c');
    e = hacer(e, { tipo: 'bajar', cartas: c('5c 5o') });
    e = hacer(e, { tipo: 'descartar', carta: una('Rc') });
    e = pasar(e);
    expect(e.muertas).toContain(una('Rc'));
    expect(e.deQuien).toBe(1);
    expect(e.ofrecidaA).toBe(1);
    expect(e.origen).toBe('mazo');
  });

  it('no se puede meter la carta en la mano: solo hay pasar, bajar y añadir', () => {
    const tipos = new Set(conquian.accionesLegales(nueva(), 0).map((a) => a.tipo));
    for (const t of tipos) expect(['pasar', 'bajar', 'anadir']).toContain(t);
  });
});

describe('fin de la mano y partida', () => {
  it('gana la mano quien baja su última carta con la descubierta', () => {
    const e = conDescubierta('6e', '7e', {
      combinaciones: [[c('3e 4e 5e'), c('2o 2c 2b'), c('Ro Rc Rb')], []],
    });
    const f = hacer(e, { tipo: 'anadir', combinacion: 0, cartas: [una('7e')] });
    const r = f.resultadosManos.at(-1)!;
    expect(r.ganador).toBe(0);
    expect(r.bajadas[0]).toBe(11);
    expect(f.ganadas).toEqual([1, 0]);
    // La siguiente mano la empieza el otro.
    expect(f.empieza).toBe(1);
    expect(f.turno).toBe(1);
  });

  it('si se acaba el mazo, tablas', () => {
    let e = nueva();
    e = { ...e, mazo: [] };
    e = pasar(pasar(e));
    const r = e.resultadosManos.at(-1)!;
    expect(r.ganador).toBeNull();
    expect(e.ganadas).toEqual([0, 0]);
  });

  it('gana la partida quien gana 3 manos', () => {
    let e = conDescubierta('6e', '7e', {
      ganadas: [2, 1],
      combinaciones: [[c('3e 4e 5e'), c('2o 2c 2b'), c('Ro Rc Rb')], []],
    });
    e = hacer(e, { tipo: 'anadir', combinacion: 0, cartas: [una('7e')] });
    expect(conquian.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [3, 1] });
  });

  it('tras 9 manos sin 3 ganadas, gana quien más tiene', () => {
    let e = nueva();
    const tablas = { empieza: 0, ganador: null, bajadas: [0, 0], ganadas: [2, 1] };
    e = { ...e, ganadas: [2, 1], resultadosManos: Array.from({ length: 8 }, () => tablas) };
    e = pasar(pasar({ ...e, mazo: [] }));
    expect(e.resultadosManos).toHaveLength(9);
    expect(conquian.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [2, 1] });
  });
});

describirContrato(conquian, {
  configs: [CONFIG_CONQUIAN_POR_DEFECTO, { manosParaGanar: 1 }],
  // Las combinaciones, las muertas y la descubierta son públicas; la mano ajena y el mazo, no.
  cartasOcultas: (e, asiento) => [
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
    ...e.mazo,
  ],
  pasosMaximos: 2_000,
});
