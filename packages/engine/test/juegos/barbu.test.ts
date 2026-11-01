import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  barbu,
  CONTRATOS_BARBU,
  encajaBarbu,
  FILAS_VACIAS,
  type AccionBarbu,
  type EstadoBarbu,
} from '../../src/juegos/barbu';
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

function nueva(semilla = 'barbu', manos = 7): EstadoBarbu {
  const r = barbu.crear({ jugadores: 4, manos }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoBarbu, accion: AccionBarbu | string): EstadoBarbu {
  const a: AccionBarbu =
    typeof accion === 'string' ? { tipo: 'jugar', carta: una(accion) } : accion;
  const r = aplicar(barbu, e, e.turno, a);
  if (!r.ok) throw new Error(`${JSON.stringify(a)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada en bazas con un contrato: le toca al 0, que reparte. */
function mesa(
  manos: string[],
  contrato: EstadoBarbu['contrato'],
  parcial: Partial<EstadoBarbu> = {},
): EstadoBarbu {
  return {
    ...nueva(),
    fase: contrato === 'domino' ? 'domino' : 'bazas',
    contrato,
    jugados: contrato ? [contrato] : [],
    manos: manos.map(c),
    turno: 0,
    ...parcial,
  };
}

const legales = (e: EstadoBarbu) =>
  barbu
    .accionesLegales(e, e.turno)
    .map((a) =>
      a.tipo === 'jugar'
        ? a.carta
        : a.tipo === 'contrato'
          ? a.contrato
          : a.tipo === 'triunfo'
            ? a.palo
            : a.tipo,
    );

/** Juega la mano con la primera acción legal. */
function acabarMano(e: EstadoBarbu): EstadoBarbu {
  const inicio = e.resultadosManos.length;
  for (let paso = 0; e.resultadosManos.length === inicio && paso < 500; paso++) {
    e = hacer(e, barbu.accionesLegales(e, e.turno)[0]!);
  }
  return e;
}

describe('reparto y contrato', () => {
  it('13 cartas a cada uno; el repartidor elige entre los siete contratos', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
    expect(new Set(e.manos.flat()).size).toBe(52);
    expect(e.fase).toBe('contrato');
    expect(e.turno).toBe(0);
    expect(legales(e)).toEqual([...CONTRATOS_BARBU]);
  });

  it('solo los contratos que quedan', () => {
    const e = { ...nueva(), jugados: ['bazas', 'domino'] as const };
    expect(legales({ ...e, jugados: [...e.jugados] })).toEqual([
      'corazones',
      'damas',
      'rey',
      'ultimas',
      'triunfo',
    ]);
  });

  it('con el triunfo se elige el palo y sale el repartidor', () => {
    let e = hacer(nueva(), { tipo: 'contrato', contrato: 'triunfo' });
    expect(e.fase).toBe('triunfo');
    expect(legales(e)).toEqual(['picas', 'corazones', 'diamantes', 'treboles']);
    e = hacer(e, { tipo: 'triunfo', palo: 'picas' });
    expect(e.fase).toBe('bazas');
    expect(e.triunfo).toBe('picas');
    expect(e.turno).toBe(0);
  });
});

describe('bazas', () => {
  it('hay que seguir el palo', () => {
    const e = mesa(['Ap', '2p 3d', '4d', '5d'], 'bazas', { turno: 1, mesa: enMesa([0, 'Ap']) });
    expect(legales(e)).toEqual(c('2p'));
  });

  it('en el triunfo hay que fallar y subir', () => {
    const e = mesa(['Ac', '3t', 'At 2t 4d', '5d'], 'triunfo', {
      triunfo: 'treboles',
      turno: 2,
      mesa: enMesa([0, 'Ac'], [1, '3t']),
    });
    expect(legales(e)).toEqual(c('At'));
    expect(legales({ ...e, mesa: enMesa([0, 'Ac']) }).sort()).toEqual(c('At 2t').sort());
  });

  it('no se sale de corazones mientras se tengan otros palos', () => {
    const e = mesa(['2c 3p', '2d', '3d', '4d'], 'corazones');
    expect(legales(e)).toEqual(c('3p'));
    expect(legales(mesa(['2c 3c', '2d', '3d', '4d'], 'corazones'))).toHaveLength(2);
  });

  it('sin el palo hay que echar el Rey de corazones', () => {
    const e = mesa(['Ap', 'Kc 2d', '3d', '4d'], 'rey', { turno: 1, mesa: enMesa([0, 'Ap']) });
    expect(legales(e)).toEqual(c('Kc'));
  });
});

describe('puntos de los contratos de bazas', () => {
  it('sin bazas: −2 por baza', () => {
    let e = mesa(['Ap 2d', '2p 3d', '3p 4d', '4p 5d'], 'bazas');
    for (const x of ['Ap', '2p', '3p', '4p']) e = hacer(e, x);
    expect(e.puntosMano).toEqual([-2, 0, 0, 0]);
  });

  it('sin corazones: −2 por corazón y −6 por el As', () => {
    let e = mesa(['2p 2d', 'Ac 3d', '3c 4d', '4c 5d'], 'corazones', {
      manos: [c('2p 2d'), c('Ac 3d'), c('3c 4d'), c('4c 5c')],
    });
    for (const x of ['2p', 'Ac', '3c', '4c']) e = hacer(e, x);
    expect(e.puntosMano).toEqual([-10, 0, 0, 0]);
  });

  it('sin damas: la mano acaba al ganarse las damas que quedan', () => {
    // La dama de picas ya no está en ninguna mano: quedan tres.
    let e = mesa(['Ap 2d', 'Qc 3d', 'Qd 4d', 'Qt 5d'], 'damas');
    for (const x of ['Ap', 'Qc', 'Qd', 'Qt']) e = hacer(e, x);
    expect(e.resultadosManos.at(-1)).toMatchObject({ contrato: 'damas', puntos: [-18, 0, 0, 0] });
    expect(e.fase).toBe('contrato');
    expect(e.repartidor).toBe(1);
  });

  it('sin el Rey de corazones: −20 y termina', () => {
    let e = mesa(['Ap 2d', 'Kc 3d', '3p 4d', '4p 5d'], 'rey');
    for (const x of ['Ap', 'Kc', '3p', '4p']) e = hacer(e, x);
    expect(e.resultadosManos.at(-1)?.puntos).toEqual([-20, 0, 0, 0]);
  });

  it('sin las dos últimas: −10 y −20', () => {
    let e = mesa(['Ap Ad', '2p 2d', '3p 3d', '4p 4d'], 'ultimas', { bazasJugadas: 11 });
    for (const x of ['Ap', '2p', '3p', '4p', 'Ad', '2d', '3d', '4d']) e = hacer(e, x);
    expect(e.resultadosManos.at(-1)?.puntos).toEqual([-30, 0, 0, 0]);
  });

  it('triunfo: +5 por baza', () => {
    let e = mesa(['2p', 'Ap', '3p', '4p'], 'triunfo', { triunfo: 'corazones' });
    for (const x of ['2p', 'Ap', '3p', '4p']) e = hacer(e, x);
    expect(e.resultadosManos.at(-1)?.puntos).toEqual([0, 5, 0, 0]);
  });

  it('cada contrato de bazas suma lo de su tabla en una mano entera', () => {
    const totales: Record<string, number> = {
      bazas: -26,
      corazones: -30,
      damas: -24,
      rey: -20,
      ultimas: -30,
      triunfo: 65,
      domino: 65,
    };
    for (const contrato of CONTRATOS_BARBU) {
      for (let i = 0; i < 3; i++) {
        let e = hacer(nueva(`mano-${contrato}-${i}`), { tipo: 'contrato', contrato });
        if (contrato === 'triunfo') e = hacer(e, { tipo: 'triunfo', palo: 'picas' });
        e = acabarMano(e);
        const r = e.resultadosManos.at(-1)!;
        expect(r.puntos.reduce((s, p) => s + p, 0)).toBe(totales[contrato]);
      }
    }
  });
});

describe('dominó', () => {
  it('abre la Jota; encajan la anterior y la siguiente', () => {
    expect(encajaBarbu(FILAS_VACIAS, una('Jp'))).toBe(true);
    expect(encajaBarbu(FILAS_VACIAS, una('10p'))).toBe(false);
    const filas = { ...FILAS_VACIAS, corazones: { bajo: 9, alto: 12 } };
    expect(encajaBarbu(filas, una('8c'))).toBe(true);
    expect(encajaBarbu(filas, una('Kc'))).toBe(true);
    expect(encajaBarbu(filas, una('Ac'))).toBe(false);
  });

  it('sin carta que encaje, solo se puede pasar; y se sabe que no tiene las que encajaban', () => {
    let e = mesa(['2p 3p', 'Jp 4d', '5d', '6d'], 'domino');
    expect(legales(e)).toEqual(['pasar']);
    e = hacer(e, { tipo: 'pasar' });
    expect(e.turno).toBe(1);
    expect(e.noTiene[0]).toEqual(expect.arrayContaining(c('Jp Jc Jd Jt')));
  });

  it('los que acaban anotan +45, +20 y +5, y el último −5', () => {
    let e = mesa(['Jp', 'Jc', 'Jd', 'Jt 10t'], 'domino');
    for (const x of ['Jp', 'Jc', 'Jd']) e = hacer(e, x);
    expect(e.resultadosManos.at(-1)?.puntos).toEqual([45, 20, 5, -5]);
  });
});

describe('partida', () => {
  it('tras 7 manos se han jugado todos los contratos y gana quien más suma', () => {
    let e = nueva('partida');
    for (let m = 0; m < 7; m++) e = acabarMano(e);
    expect(new Set(e.resultadosManos.map((r) => r.contrato)).size).toBe(7);
    expect(e.totales.reduce((s, t) => s + t, 0)).toBe(0);
    const fin = barbu.resultado(e)!;
    const maximo = Math.max(...e.totales);
    expect(fin.ganadores.every((a) => e.totales[a] === maximo)).toBe(true);
    expect(barbu.accionesLegales(e, e.turno)).toEqual([]);
  });
});

describe('vista', () => {
  it('cada uno ve su mano y cuántas tienen los demás', () => {
    const v = barbu.vistaDe(nueva(), 0);
    expect(v.miMano).toHaveLength(13);
    expect(v.cartasEnMano).toEqual([13, 13, 13, 13]);
    expect(JSON.stringify(v)).not.toContain('"manos":[');
  });
});

describirContrato(barbu, {
  configs: [{ jugadores: 4, manos: 3 }],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano; las de
  // `noTiene` se nombran para decir quién no las tiene, no dónde están.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...e.noTiene.flat(),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1500,
});
