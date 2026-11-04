import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_PISHTI,
  CONFIG_PISHTI_POR_DEFECTO,
  pishti,
  puntuarManoPishti,
  type EstadoPishti,
} from '../../src/juegos/pishti';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «5p» es el 5 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(jugadores: 2 | 4 = 2, semilla = 'pishti'): EstadoPishti {
  const r = pishti.crear({ jugadores, meta: 151 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoPishti, carta: string): EstadoPishti {
  const r = aplicar(pishti, e, e.turno, { tipo: 'jugar', carta: c(carta)[0]! });
  if (!r.ok) throw new Error(`${carta} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada con 2: le toca al 0, sin tapadas y con el mazo vacío salvo que se diga. */
function mesa(manos: string[], monton: string, parcial: Partial<EstadoPishti> = {}): EstadoPishti {
  return {
    ...nueva(),
    manos: manos.map(c),
    monton: c(monton),
    tapadas: [],
    mazo: [],
    turno: 0,
    ...parcial,
  };
}

describe('Baraja y repartos del Pishti', () => {
  it('con 2: 4 cartas a cada uno, el montón con 3 tapadas y 1 a la vista, 40 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([4, 4]);
    expect(e.tapadas).toHaveLength(3);
    expect(e.monton).toHaveLength(1);
    expect(e.mazo).toHaveLength(40);
    expect(e.turno).toBe(0);
  });

  it('con 4: 4 cartas a cada uno y 32 en el mazo', () => {
    const e = nueva(4);
    expect(e.manos.map((m) => m.length)).toEqual([4, 4, 4, 4]);
    expect(e.mazo).toHaveLength(32);
  });

  it('cuando los dos juegan su cuarta carta, otras 4 a cada uno', () => {
    let e = nueva();
    for (let i = 0; i < 8; i++)
      e = pishti.transicion(e, e.turno, pishti.accionesLegales(e, e.turno)[0]!);
    expect(e.manos.map((m) => m.length)).toEqual([4, 4]);
    expect(e.mazo).toHaveLength(32);
  });
});

describe('Jugar en el Pishti', () => {
  it('por número se lleva el montón entero, tapadas incluidas', () => {
    const e = hacer(mesa(['7p 2c', '3d'], '4t 7c', { tapadas: c('5p 6p 8p') }), '7p');
    expect(e.monton).toEqual([]);
    expect(e.tapadas).toEqual([]);
    expect(e.recogidas[0]).toHaveLength(6);
    expect(e.ultimaJugada).toMatchObject({ llevadas: c('4t 7c'), tapadas: 3, pishti: 0 });
  });

  it('una J se lleva el montón', () => {
    const e = hacer(mesa(['Jp 2c', '3d'], '9c 4t'), 'Jp');
    expect(e.monton).toEqual([]);
    expect(e.recogidas[0]).toHaveLength(3);
  });

  it('sin captura la carta queda arriba', () => {
    const e = hacer(mesa(['9p 2c', '3d'], '4t'), '9p');
    expect(e.monton).toEqual(c('4t 9p'));
  });

  it('con el montón vacío la J se queda en el montón', () => {
    const e = hacer(mesa(['Jp 2c', '3d'], ''), 'Jp');
    expect(e.monton).toEqual(c('Jp'));
  });
});

describe('Pishti', () => {
  it('llevarse por número una carta sola: 10', () => {
    const e = hacer(mesa(['5p 2c', '3d'], '5c'), '5p');
    expect(e.pishtis[0]).toEqual({ cuantos: 1, puntos: 10 });
    expect(e.ultimaJugada?.pishti).toBe(10);
  });

  it('dos J: 20', () => {
    const e = hacer(mesa(['Jp 2c', '3d'], 'Jc'), 'Jp');
    expect(e.pishtis[0]).toEqual({ cuantos: 1, puntos: 20 });
  });

  it('la J sobre una carta sola no es pishti', () => {
    const e = hacer(mesa(['Jp 2c', '3d'], '5c'), 'Jp');
    expect(e.recogidas[0]).toHaveLength(2);
    expect(e.pishtis[0]).toEqual({ cuantos: 0, puntos: 0 });
  });

  it('con tapadas debajo no es pishti', () => {
    const e = hacer(mesa(['5p 2c', '3d'], '5c', { tapadas: c('6p 7p 8p') }), '5p');
    expect(e.pishtis[0].cuantos).toBe(0);
  });
});

describe('Fin de la mano y puntos del Pishti', () => {
  it('30 cartas con dos Ases, una J y el 10 de diamantes: 9 puntos', () => {
    const base = BARAJA_PISHTI.filter(
      (x) => !/-(1|11)$/.test(x) && x !== 'diamantes-10' && x !== 'treboles-2',
    );
    const mios = [...c('Ap Ac Jp 10d'), ...base.slice(0, 26)];
    const suyos = base.slice(26, 48);
    const { puntos } = puntuarManoPishti(
      [mios, suyos],
      [
        { cuantos: 0, puntos: 0 },
        { cuantos: 0, puntos: 0 },
      ],
    );
    expect(puntos[0]).toMatchObject({ cartas: 3, asesYJotas: 3, diezDiamantes: 3, total: 9 });
  });

  it('las cartas del montón van al último que se llevó uno', () => {
    const e = mesa(['9p', ''], '4t 6c', {
      manos: [c('9p'), []],
      ultimoEnRecoger: 1,
      recogidas: [[], []],
    });
    const tras = hacer(e, '9p');
    expect(tras.resultadosManos.at(-1)!.recuento[1].cartas).toBe(3);
  });
});

describe('Partida del Pishti', () => {
  it('termina si un bando llega a 151 con más que el otro', () => {
    const e = mesa(['9p', ''], '', {
      manos: [c('9p'), []],
      ultimoEnRecoger: 0,
      puntos: [150, 120],
    });
    const tras = hacer(e, '9p');
    // Se lleva su 9 al cerrar (último en recoger), más cartas que el otro: 3 puntos.
    expect(tras.puntos[0]).toBeGreaterThanOrEqual(151);
    expect(pishti.resultado(tras)).toMatchObject({ ganadores: [0], empate: false });
  });

  it('con empate por encima de 151 se juega otra mano', () => {
    const e = mesa(['9p', ''], '', {
      manos: [c('9p'), []],
      ultimoEnRecoger: null,
      puntos: [160, 160],
    });
    const tras = hacer(e, '9p');
    expect(pishti.resultado(tras)).toBeNull();
    expect(tras.resultadosManos).toHaveLength(1);
    expect(tras.manos.map((m) => m.length)).toEqual([4, 4]);
  });
});

describe('Vista del Pishti', () => {
  it('ve la carta de arriba y cuántas tapadas hay, pero no cuáles', () => {
    const e = nueva();
    const v = pishti.vistaDe(e, 0);
    expect(v.monton).toEqual(e.monton);
    expect(v.tapadas).toBe(3);
    for (const t of e.tapadas) expect(JSON.stringify(v)).not.toContain(`"${t}"`);
  });
});

describirContrato(pishti, {
  configs: [CONFIG_PISHTI_POR_DEFECTO, { jugadores: 4, meta: 151 }],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.tapadas,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
  pasosMaximos: 1_500,
  ejecuciones: 20,
});
