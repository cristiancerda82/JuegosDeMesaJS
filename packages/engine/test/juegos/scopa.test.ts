import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  capturasScopa,
  CONFIG_SCOPA_POR_DEFECTO,
  primieraScopa,
  puntuarManoScopa,
  scopa,
  type AccionScopa,
  type EstadoScopa,
} from '../../src/juegos/scopa';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos; S, C y R. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}

function nueva(jugadores: 2 | 4 = 2, semilla = 'scopa'): EstadoScopa {
  const r = scopa.crear({ jugadores, meta: 11 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoScopa, carta: string, captura = ''): EstadoScopa {
  const a: AccionScopa = { tipo: 'jugar', carta: c(carta)[0]!, captura: c(captura) };
  const r = aplicar(scopa, e, e.turno, a);
  if (!r.ok) throw new Error(`${carta} ${captura} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada con 2: le toca al 0, con mazo vacío salvo que se diga otra cosa. */
function mesa(manos: string[], enMesa: string, parcial: Partial<EstadoScopa> = {}): EstadoScopa {
  return { ...nueva(), manos: manos.map(c), mesa: c(enMesa), mazo: [], turno: 0, ...parcial };
}

describe('reparto', () => {
  it('con 2: 3 cartas a cada uno, 4 en la mesa y 30 en el mazo', () => {
    const e = nueva(2);
    expect(e.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(e.mesa).toHaveLength(4);
    expect(e.mazo).toHaveLength(30);
    expect(e.turno).toBe(0);
  });

  it('con 4 (Scopone): 10 cartas a cada uno y la mesa vacía', () => {
    const e = nueva(4);
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
    expect(e.mesa).toEqual([]);
    expect(e.mazo).toEqual([]);
    expect(e.turno).toBe(0);
  });

  it('con 2, cuando los dos se quedan sin cartas se reparten otras 3', () => {
    let e: EstadoScopa = { ...nueva(2), manos: [c('2o'), c('3c')], mesa: c('Rb') };
    e = hacer(e, '2o');
    e = hacer(e, '3c');
    expect(e.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(e.mazo).toHaveLength(24);
  });
});

describe('captura', () => {
  it('hay que llevarse la carta igual, no una suma', () => {
    expect(capturasScopa(c('5c 2o 3b'), c('5e')[0]!)).toEqual([c('5c')]);
  });

  it('con varias iguales se elige cuál', () => {
    expect(capturasScopa(c('5c 5b'), c('5e')[0]!)).toEqual([c('5c'), c('5b')]);
  });

  it('sin igual, una suma; sin captura, se queda en la mesa', () => {
    expect(capturasScopa(c('4c 6o 3b'), c('Re')[0]!)).toEqual([c('4c 6o')]);
    const e = mesa(['2o 7e', '3c'], '5c 6b');
    expect(scopa.accionesLegales(e, 0)).toContainEqual({
      tipo: 'jugar',
      carta: c('2o')[0],
      captura: [],
    });
  });

  it('capturar es obligatorio', () => {
    const e = mesa(['5o 2e', '3c'], '5c 6b');
    const delCinco = scopa.accionesLegales(e, 0).filter((a) => a.carta === c('5o')[0]);
    expect(delCinco).toEqual([{ tipo: 'jugar', carta: c('5o')[0], captura: c('5c') }]);
  });
});

describe('scopa', () => {
  it('dejar la mesa vacía es scopa', () => {
    let e = mesa(['7c 2e', '3c 4b'], '3b 4o');
    e = hacer(e, '7c', '3b 4o');
    expect(e.scopas).toEqual([1, 0]);
    expect(e.ultimaJugada?.scopa).toBe(true);
  });

  it('con la última jugada de la mano no es scopa', () => {
    let e = mesa(['2e', '7c'], '2b 3b 4o');
    e = hacer(e, '2e', '2b');
    // El 7 se lleva el 3 y el 4 y deja la mesa vacía, pero es la última jugada.
    e = hacer(e, '7c', '3b 4o');
    expect(e.resultadosManos.at(-1)!.recuento[1].scopas).toBe(0);
  });
});

describe('fin de la mano y puntos', () => {
  it('las cartas de la mesa van al último que capturó', () => {
    let e = mesa(['5o', '2e'], '5c 6b', { ultimoEnRecoger: null });
    e = hacer(e, '5o', '5c');
    e = hacer(e, '2e');
    const r = e.resultadosManos.at(-1)!;
    expect(r.recuento[0].cartas).toBe(4);
    expect(r.recuento[1].cartas).toBe(0);
  });

  it('primiera', () => {
    expect(primieraScopa(c('7o 7c 7e 7b'))).toBe(84);
    expect(primieraScopa(c('6o 6c 6e 6b'))).toBe(72);
    expect(primieraScopa(c('7o Ro'))).toBe(21);
  });

  it('puntos de la mano por concepto', () => {
    const todas = c('7o 7c 7e 7b Ao Ac Ae Ab 2o 3o 4o 5o 6o 2c 3c 4c 5c 6c 2e 3e 4e');
    const r = puntuarManoScopa([todas, c('Ro Co So 6e 6b')], [1, 0]);
    expect(r.puntos[0]).toEqual({
      cartas: 1,
      oros: 1,
      settebello: 1,
      primiera: 1,
      scopas: 1,
      total: 5,
    });
    expect(r.puntos[1].total).toBe(0);
  });

  it('con 20 a 20 cartas nadie anota ese punto', () => {
    const veinte = (palo: string) =>
      c(`Ao 2o 3o 4o 5o`).map((x) => x.replace('oros', palo) as IdCarta);
    const a = [...veinte('copas'), ...veinte('copas'), ...veinte('copas'), ...veinte('copas')];
    const r = puntuarManoScopa([a, a], [0, 0]);
    expect(r.puntos[0].cartas).toBe(0);
    expect(r.puntos[1].cartas).toBe(0);
  });
});

describe('partida', () => {
  /** Juega la mano con la primera acción legal. */
  function acabarMano(e: EstadoScopa): EstadoScopa {
    const inicio = e.resultadosManos.length;
    for (let paso = 0; e.resultadosManos.length === inicio && paso < 100; paso++) {
      e = scopa.transicion(e, e.turno, scopa.accionesLegales(e, e.turno)[0]!);
    }
    return e;
  }

  it('cada mano usa las 40 cartas, con 2 y con 4', () => {
    for (const n of [2, 4] as const) {
      const e = acabarMano(nueva(n, `mano-${n}`));
      const r = e.resultadosManos.at(-1)!;
      expect(r.recuento[0].cartas + r.recuento[1].cartas).toBe(40);
      expect(e.repartidor).toBe(0);
    }
  });

  it('termina al llegar a 11 con más puntos; con empate sigue', () => {
    let e = mesa(['5o', '2e'], '5c 6b', { puntos: [9, 9] });
    e = hacer(e, '5o', '5c');
    e = hacer(e, '2e');
    const [p0, p1] = e.puntos;
    if (p0 !== p1 && Math.max(p0, p1) >= 11) {
      expect(scopa.resultado(e)?.ganadores).toEqual([p0 > p1 ? 0 : 1]);
    }
    expect(scopa.resultado({ ...e, puntos: [12, 12] })).toBeNull();
    expect(scopa.resultado({ ...e, puntos: [12, 10] })?.ganadores).toEqual([0]);
  });
});

describe('vista', () => {
  it('cada uno ve su mano, la mesa y cuántas cartas recogió cada bando', () => {
    const e = nueva();
    const v = scopa.vistaDe(e, 1);
    expect(v.miMano).toHaveLength(3);
    expect(v.mesa).toHaveLength(4);
    expect(v.mazo).toBe(30);
    expect(JSON.stringify(v)).not.toContain('"manos"');
    expect(JSON.stringify(v)).not.toContain('"recogidas"');
  });
});

describirContrato(scopa, {
  configs: [CONFIG_SCOPA_POR_DEFECTO, { jugadores: 4, meta: 11 }],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
  pasosMaximos: 400,
  ejecuciones: 30,
});
