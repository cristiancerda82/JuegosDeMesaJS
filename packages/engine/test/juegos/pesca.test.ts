import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  CONFIG_PESCA_POR_DEFECTO,
  pesca,
  type AccionPesca,
  type EstadoPesca,
} from '../../src/juegos/pesca';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «Ap» es el As de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(jugadores = 4, semilla = 'pesca'): EstadoPesca {
  const r = pesca.crear({ jugadores }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoPesca, accion: AccionPesca): EstadoPesca {
  const r = aplicar(pesca, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Un estado preparado con tres jugadores: le toca al 0. */
function preparado(parcial: Partial<EstadoPesca>): EstadoPesca {
  return {
    ...nueva(3),
    manos: [c('7p Kp 2c'), c('7c 7d 3c'), c('4c 5c')],
    mar: c('9t 4d'),
    cuartetos: [[], [], []],
    turno: 0,
    registro: [],
    ...parcial,
  };
}

const pedir = (a: number, valor: number): AccionPesca => ({ tipo: 'pedir', a, valor });

describe('baraja y reparto', () => {
  it('7 cartas con 3 jugadores y 5 con 5', () => {
    const tres = nueva(3);
    const cartas = (e: EstadoPesca) =>
      e.manos.reduce((s, m) => s + m.length, 0) + e.cuartetos.flat().length * 4;
    expect(cartas(tres)).toBe(21);
    expect(tres.mar).toHaveLength(31);
    const cinco = nueva(5);
    expect(cartas(cinco)).toBe(25);
    expect(cinco.mar).toHaveLength(27);
    expect(cinco.turno).toBe(0);
  });

  it('de 2 a 6 jugadores', () => {
    expect(pesca.crear({ jugadores: 1 }, 'x').ok).toBe(false);
    expect(pesca.crear({ jugadores: 7 }, 'x').ok).toBe(false);
    expect(pesca.crear({ jugadores: 6 }, 'x').ok).toBe(true);
  });
});

describe('pedir', () => {
  it('solo valores propios y a rivales con cartas', () => {
    const e = preparado({ manos: [c('7p Kp'), c('7c'), []] });
    expect(pesca.accionesLegales(e, 0)).toEqual([pedir(1, 7), pedir(1, 13)]);
  });

  it('el rival da todas y se sigue pidiendo', () => {
    const e = jugar(preparado({}), pedir(1, 7));
    expect(e.manos[0]).toHaveLength(5);
    expect(e.manos[1]).toEqual(c('3c'));
    expect(e.turno).toBe(0);
    expect(e.registro.at(-1)).toMatchObject({ dadas: c('7c 7d'), pesco: null });
  });

  it('a pescar: roba y pasa el turno', () => {
    const e = jugar(preparado({}), pedir(1, 13));
    expect(e.manos[0]).toContain(c('4d')[0]);
    expect(e.mar).toEqual(c('9t'));
    expect(e.turno).toBe(1);
    expect(e.registro.at(-1)).toMatchObject({ dadas: [], pesco: 'otra' });
  });

  it('si pesca lo que pidió, lo enseña y sigue', () => {
    const e = jugar(preparado({ mar: c('9t Kd') }), pedir(1, 13));
    expect(e.turno).toBe(0);
    expect(e.registro.at(-1)).toMatchObject({ pesco: c('Kd')[0] });
  });

  it('con el mar vacío no roba y pasa el turno', () => {
    const e = jugar(preparado({ mar: [] }), pedir(1, 13));
    expect(e.turno).toBe(1);
    expect(e.registro.at(-1)).toMatchObject({ pesco: 'nada' });
  });
});

describe('cuartetos', () => {
  it('se bajan al reunir las cuatro', () => {
    const e = jugar(preparado({ manos: [c('9p 9c Kp'), c('9d 9t 3c'), c('4c')] }), pedir(1, 9));
    expect(e.cuartetos[0]).toEqual([9]);
    expect(e.manos[0]).toEqual(c('Kp'));
    expect(e.registro.at(-1)).toMatchObject({ cuarteto: 9 });
  });
});

describe('sin cartas', () => {
  it('quien se queda sin cartas roba una y sigue', () => {
    const e = jugar(preparado({ manos: [c('9p 9c'), c('9d 9t 3c'), c('4c')] }), pedir(1, 9));
    expect(e.cuartetos[0]).toEqual([9]);
    expect(e.manos[0]).toEqual(c('4d'));
    expect(e.turno).toBe(0);
    expect(e.registro.at(-1)).toEqual({ tipo: 'robar', asiento: 0 });
  });

  it('sin cartas y con el mar vacío, le toca al siguiente', () => {
    const e = jugar(preparado({ manos: [c('Kp'), [], c('4c 5c')], mar: [] }), pedir(2, 13));
    expect(e.turno).toBe(2);
  });
});

describe('fin', () => {
  it('termina con los 13 cuartetos y gana quien más tiene', () => {
    const cuartetos = [
      [1, 2, 3, 4, 5],
      [6, 7, 8],
      [10, 11, 12, 13],
    ];
    const e = jugar(
      preparado({ manos: [c('9p 9c'), c('9d 9t'), []], mar: [], cuartetos }),
      pedir(1, 9),
    );
    expect(pesca.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [6, 3, 4] });
    expect(pesca.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('empate entre los que tienen el máximo', () => {
    const cuartetos = [
      [1, 2, 3, 4],
      [6, 7, 8, 10, 11],
      [5, 12, 13],
    ];
    const e = jugar(
      preparado({ manos: [c('9p 9c'), c('9d 9t'), []], mar: [], cuartetos }),
      pedir(1, 9),
    );
    expect(pesca.resultado(e)).toEqual({ ganadores: [0, 1], empate: true, puntos: [5, 5, 3] });
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni el mar', () => {
    const e = nueva(4);
    const texto = JSON.stringify(pesca.vistaDe(e, 0));
    for (const x of [...e.manos.slice(1).flat(), ...e.mar]) expect(texto).not.toContain(`"${x}"`);
  });
});

describirContrato(pesca, {
  configs: [2, 3, 4, 6].map((jugadores) => ({ ...CONFIG_PESCA_POR_DEFECTO, jugadores })),
  // Las cartas que se dieron o se enseñaron en el registro ya se vieron.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(
      e.registro.flatMap((r) =>
        r.tipo === 'pedir'
          ? [...r.dadas, ...(r.pesco && r.pesco !== 'otra' && r.pesco !== 'nada' ? [r.pesco] : [])]
          : [],
      ),
    );
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.mar].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 1_500,
});
