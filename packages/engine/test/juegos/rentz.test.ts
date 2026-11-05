import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_RENTZ,
  CONFIG_RENTZ_POR_DEFECTO,
  FILAS_VACIAS_RENTZ,
  ganadoraRentz,
  rentz,
  type AccionRentz,
  type EstadoRentz,
} from '../../src/juegos/rentz';
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

function nueva(semilla = 'rentz', rondas = 7): EstadoRentz {
  const r = rentz.crear({ jugadores: 4, rondas }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoRentz, accion: AccionRentz): EstadoRentz {
  const r = aplicar(rentz, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano a mitad de bazas con estas manos (en orden de asiento). */
function enBazas(manos: string[], parcial: Partial<EstadoRentz> = {}): EstadoRentz {
  return { ...nueva(), fase: 'bazas', contrato: 'bazas', manos: manos.map(c), ...parcial };
}

describe('baraja y reparto', () => {
  it('32 cartas, 8 a cada uno; elige primero el que reparte, el 0', () => {
    expect(BARAJA_RENTZ).toHaveLength(32);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
    expect(new Set(e.manos.flat()).size).toBe(32);
    expect(e.fase).toBe('contrato');
    expect(e.turno).toBe(0);
  });
});

describe('elegir contrato', () => {
  it('cada jugador solo puede elegir los suyos que le quedan', () => {
    const e: EstadoRentz = { ...nueva(), jugados: [['damas', 'domino'], ['bazas'], [], []] };
    const suyos = rentz.accionesLegales(e, 0).map((a) => (a as { contrato: string }).contrato);
    expect(suyos).toHaveLength(5);
    expect(suyos).not.toContain('damas');
    const otro = { ...e, turno: 1, repartidor: 1 };
    expect(
      rentz.accionesLegales(otro, 1).map((a) => (a as { contrato: string }).contrato),
    ).toContain('damas');
  });

  it('al elegir, sale el que eligió', () => {
    const e = hacer(nueva(), { tipo: 'contrato', contrato: 'damas' });
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    expect(e.jugados[0]).toEqual(['damas']);
  });
});

describe('bazas y puntos', () => {
  it('sin triunfo gana la más alta del palo de salida', () => {
    expect(ganadoraRentz(enMesa([0, '7p'], [1, 'Ac'], [2, '8p'], [3, 'Kt'])).asiento).toBe(2);
  });

  it('sin el palo se puede echar cualquier carta', () => {
    const e = enBazas(['', '9c Qd', '', ''], { turno: 1, mesa: enMesa([0, '7p']) });
    expect(rentz.accionesLegales(e, 1)).toHaveLength(2);
  });

  it('sin damas: una baza con dos damas resta 20', () => {
    let e = enBazas(['Ap 7c', 'Qp 8c', 'Qd 9c', '9p 10c'], { contrato: 'damas', turno: 0 });
    for (const x of ['Ap', 'Qp', 'Qd', '9p']) e = hacer(e, { tipo: 'jugar', carta: una(x) });
    // No quedan damas: la mano se acaba ya.
    expect(e.resultadosManos.at(-1)!.puntos).toEqual([-20, 0, 0, 0]);
  });

  it('sin el K de corazones se acaba al ganarlo', () => {
    let e = enBazas(['Ac 7p', 'Kc 8p', '7c 9p', '8c 10p'], { contrato: 'rey', turno: 0 });
    for (const x of ['Ac', 'Kc', '7c', '8c']) e = hacer(e, { tipo: 'jugar', carta: una(x) });
    const r = e.resultadosManos.at(-1)!;
    expect(r.contrato).toBe('rey');
    expect(r.puntos).toEqual([-40, 0, 0, 0]);
  });

  it('bazas: +5 por baza; sin bazas: −5; la última: −40', () => {
    let e = enBazas(['Ap', '7p', '8p', '9p'], { contrato: 'positivo', turno: 0, bazasJugadas: 7 });
    for (const x of ['Ap', '7p', '8p', '9p']) e = hacer(e, { tipo: 'jugar', carta: una(x) });
    expect(e.resultadosManos.at(-1)!.puntos).toEqual([5, 0, 0, 0]);
    let f = enBazas(['Ap', '7p', '8p', '9p'], { contrato: 'ultima', turno: 0, bazasJugadas: 7 });
    for (const x of ['Ap', '7p', '8p', '9p']) f = hacer(f, { tipo: 'jugar', carta: una(x) });
    expect(f.resultadosManos.at(-1)!.puntos).toEqual([-40, 0, 0, 0]);
  });
});

describe('dominó', () => {
  function enDomino(manos: string[], parcial: Partial<EstadoRentz> = {}): EstadoRentz {
    return {
      ...nueva(),
      fase: 'domino',
      contrato: 'domino',
      filas: FILAS_VACIAS_RENTZ,
      manos: manos.map(c),
      turno: 0,
      ...parcial,
    };
  }

  it('se abre con una J; quien no puede, pasa', () => {
    const e = enDomino(['Jp 7c', 'Ap', 'Jc', 'Kd']);
    expect(rentz.accionesLegales(e, 0)).toEqual([{ tipo: 'jugar', carta: una('Jp') }]);
    const f = hacer(e, { tipo: 'jugar', carta: una('Jp') });
    expect(rentz.accionesLegales(f, 1)).toEqual([{ tipo: 'pasar' }]);
    const g = hacer(f, { tipo: 'pasar' });
    expect(g.turno).toBe(2);
    expect(g.noTiene[1]).toContain(una('Qp'));
  });

  it('por orden de acabar: +40, +20, +10 y 0', () => {
    let e = enDomino(['Jc 7p', 'Jp', 'Jd', 'Qp Kp'], { turno: 2 });
    // Acaban 2, 0? No: va 2 (Jd), 3 pasa? 3 tiene Qp pero aún no hay fila de picas.
    e = hacer(e, { tipo: 'jugar', carta: una('Jd') }); // acaba 2
    e = hacer(e, { tipo: 'pasar' }); // 3
    e = hacer(e, { tipo: 'jugar', carta: una('Jc') }); // 0
    e = hacer(e, { tipo: 'jugar', carta: una('Jp') }); // acaba 1
    e = hacer(e, { tipo: 'jugar', carta: una('Qp') }); // 3
    e = hacer(e, { tipo: 'pasar' }); // 0: el 7 de picas aún no encaja
    e = hacer(e, { tipo: 'jugar', carta: una('Kp') }); // acaba 3
    expect(e.resultadosManos.at(-1)!.puntos).toEqual([0, 20, 40, 10]);
  });
});

describe('partida', () => {
  it('dura 4 manos por ronda y gana el mejor total', () => {
    let e = nueva('corta', 1);
    while (rentz.resultado(e) === null) e = hacer(e, rentz.accionesLegales(e, e.turno)[0]!);
    expect(e.resultadosManos).toHaveLength(4);
    expect(e.resultadosManos.map((r) => r.elige)).toEqual([0, 1, 2, 3]);
    expect(rentz.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('con las 7 rondas son 28 manos', () => {
    let e = nueva('larga');
    while (rentz.resultado(e) === null) e = hacer(e, rentz.accionesLegales(e, e.turno)[0]!);
    expect(e.resultadosManos).toHaveLength(28);
    expect(e.jugados.every((j) => j.length === 7)).toBe(true);
  });
});

describirContrato(rentz, {
  configs: [CONFIG_RENTZ_POR_DEFECTO, { jugadores: 4, rondas: 1 }],
  // Las de `noTiene` se nombran para decir quién no las tiene, no dónde están.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...e.noTiene.flat(),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1_000,
});
