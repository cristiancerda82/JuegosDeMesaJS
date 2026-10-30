import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_SUECA,
  CONFIG_SUECA_POR_DEFECTO,
  ganadoraSueca,
  juegosPorPuntosSueca,
  puntosCartaSueca,
  sueca,
  type AccionSueca,
  type EstadoSueca,
} from '../../src/juegos/sueca';
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

function nueva(semilla = 'sueca'): EstadoSueca {
  const r = sueca.crear(CONFIG_SUECA_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoSueca, texto: string): EstadoSueca {
  const accion: AccionSueca = { tipo: 'jugar', carta: una(texto) };
  const r = aplicar(sueca, e, e.turno, accion);
  if (!r.ok) throw new Error(`${texto} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada: le toca al 0, reparte el 3 y el triunfo es tréboles. */
function mesa(manos: string[], parcial: Partial<EstadoSueca> = {}): EstadoSueca {
  return {
    ...nueva(),
    manos: manos.map(c),
    triunfo: 'treboles',
    cartaTriunfo: null,
    repartidor: 3,
    turno: 0,
    mesa: [],
    bazas: [0, 0, 0, 0],
    puntosMano: [0, 0],
    fallos: [[], [], [], []],
    ...parcial,
  };
}

describe('baraja y reparto', () => {
  it('40 cartas sin ochos, nueves ni dieces, que suman 120', () => {
    expect(BARAJA_SUECA).toHaveLength(40);
    expect(BARAJA_SUECA.some((x) => /-(8|9|10)$/.test(x))).toBe(false);
    expect(BARAJA_SUECA.reduce((s, x) => s + puntosCartaSueca(x), 0)).toBe(120);
  });

  it('10 cartas a cada uno; la carta del triunfo es la última del repartidor y se ve', () => {
    for (let i = 0; i < 8; i++) {
      const e = nueva(`reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
      expect(e.manos[3]).toContain(e.cartaTriunfo);
      expect(e.triunfo).toBe(e.cartaTriunfo!.split('-')[0]);
      expect(e.turno).toBe(0);
      expect(sueca.vistaDe(e, 1).cartaTriunfo).toBe(e.cartaTriunfo);
    }
  });

  it('al jugar la carta del triunfo deja de verse, pero el triunfo sigue', () => {
    const e = mesa(['3d', '4d', '5d', '7t 6d'], {
      turno: 3,
      cartaTriunfo: una('7t'),
      mesa: enMesa([0, '2p'], [1, '3p'], [2, '4p']),
    });
    const r = hacer(e, '7t');
    expect(r.cartaTriunfo).toBeNull();
    expect(r.triunfo).toBe('treboles');
  });
});

describe('bazas', () => {
  it('el 7 gana al Rey', () => {
    expect(ganadoraSueca(enMesa([0, 'Kp'], [1, '7p']), 'treboles').asiento).toBe(1);
  });

  it('el orden es A, 7, K, J, Q, 6…', () => {
    const mano = enMesa([0, 'Qp'], [1, 'Jp'], [2, '6p']);
    expect(ganadoraSueca(mano, 'corazones').asiento).toBe(1);
    expect(ganadoraSueca(enMesa([0, '7p'], [1, 'Ap']), 'corazones').asiento).toBe(1);
  });

  it('fallar con triunfo gana la baza', () => {
    expect(ganadoraSueca(enMesa([0, 'Ac'], [1, '2t'], [2, '7c']), 'treboles').asiento).toBe(1);
  });

  it('hay que seguir el palo; sin él, cualquier carta', () => {
    const e = mesa(['Ad', '2d 3t', 'Kp 2c', '4d'], { turno: 1, mesa: enMesa([0, 'Ad']) });
    expect(sueca.accionesLegales(e, 1)).toEqual([{ tipo: 'jugar', carta: una('2d') }]);
    expect(sueca.accionesLegales({ ...e, turno: 2 }, 2)).toHaveLength(2);
  });

  it('los puntos de la baza van a la pareja que la gana', () => {
    let e = mesa(['Ap 2d', '7p 2d', 'Kp 2d', 'Jp 2d']);
    for (const x of ['Ap', '7p', 'Kp', 'Jp']) e = hacer(e, x);
    expect(e.puntosMano).toEqual([28, 0]);
    expect(e.turno).toBe(0);
  });
});

describe('puntos y juegos', () => {
  it('61–90 un juego, 91–119 dos, 120 cuatro', () => {
    expect(juegosPorPuntosSueca(60)).toBe(0);
    expect(juegosPorPuntosSueca(75)).toBe(1);
    expect(juegosPorPuntosSueca(90)).toBe(1);
    expect(juegosPorPuntosSueca(95)).toBe(2);
    expect(juegosPorPuntosSueca(120)).toBe(4);
  });

  function cerrar(puntos: [number, number], juegos: [number, number] = [0, 0]): EstadoSueca {
    // La última baza no vale nada y la gana el 0: la mano se cierra con estos puntos.
    let e = mesa(['2p', '3p', '4p', '5p'], { puntosMano: puntos, juegos });
    for (const x of ['2p', '3p', '4p', '5p']) e = hacer(e, x);
    return e;
  }

  it('una pareja con 95 gana 2 juegos', () => {
    const e = cerrar([95, 25]);
    expect(e.resultadosManos.at(-1)).toMatchObject({
      gana: 0,
      juegosGanados: 2,
      juegosTras: [2, 0],
    });
    expect(e.juegos).toEqual([2, 0]);
  });

  it('con 60 a 60 nadie gana juegos y se reparte otra', () => {
    const e = cerrar([60, 60]);
    expect(e.resultadosManos.at(-1)).toMatchObject({ gana: null, juegosGanados: 0 });
    expect(e.juegos).toEqual([0, 0]);
    expect(e.manos.every((m) => m.length === 10)).toBe(true);
    expect(e.repartidor).toBe(0);
  });

  it('la partida termina al llegar a 4 juegos', () => {
    const e = cerrar([30, 90], [0, 3]);
    expect(e.juegos).toEqual([0, 4]);
    expect(sueca.resultado(e)).toEqual({ ganadores: [1, 3], empate: false, puntos: [0, 4, 0, 4] });
    expect(sueca.accionesLegales(e, e.turno)).toEqual([]);
  });
});

describe('vista', () => {
  it('cada uno ve su mano, cuántas tienen los demás y la carta del triunfo', () => {
    const e = nueva();
    const v = sueca.vistaDe(e, 0);
    expect(v.miMano).toHaveLength(10);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    expect(JSON.stringify(v)).not.toContain('"manos"');
  });
});

describirContrato(sueca, {
  configs: [CONFIG_SUECA_POR_DEFECTO],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []), e.cartaTriunfo]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 400,
});
