import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_SHEEPSHEAD,
  CONFIG_SHEEPSHEAD_POR_DEFECTO,
  ganadoraSheepshead,
  ganadorLeasterSheepshead,
  J_DIAMANTES,
  puntosCartaSheepshead,
  puntuarPickerSheepshead,
  sheepshead,
  TRIUNFOS_SHEEPSHEAD,
  type AccionSheepshead,
  type EstadoSheepshead,
} from '../../src/juegos/sheepshead';
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

function nueva(semilla = 'sheepshead', manos = 10): EstadoSheepshead {
  const r = sheepshead.crear({ jugadores: 5, manos }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoSheepshead, accion: AccionSheepshead): EstadoSheepshead {
  const r = aplicar(sheepshead, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

describe('baraja, triunfos y reparto', () => {
  it('32 cartas que suman 120 y 14 triunfos', () => {
    expect(BARAJA_SHEEPSHEAD).toHaveLength(32);
    expect(BARAJA_SHEEPSHEAD.reduce((s, x) => s + puntosCartaSheepshead(x), 0)).toBe(120);
    expect(TRIUNFOS_SHEEPSHEAD).toHaveLength(14);
  });

  it('las damas mandan y el 10 gana al K', () => {
    expect(ganadoraSheepshead(enMesa([0, 'Jt'], [1, 'Qd'], [2, 'Ad'])).asiento).toBe(1);
    expect(ganadoraSheepshead(enMesa([0, 'Kc'], [1, '10c'])).asiento).toBe(1);
  });

  it('6 cartas a cada uno y 2 en el blind que nadie ve; decide primero el 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([6, 6, 6, 6, 6]);
    expect(e.blind).toHaveLength(2);
    expect(new Set([...e.manos.flat(), ...e.blind]).size).toBe(32);
    expect(e.repartidor).toBe(4);
    expect(e.turno).toBe(0);
    for (const a of [0, 1, 2, 3, 4]) {
      const texto = JSON.stringify(sheepshead.vistaDe(e, a));
      for (const x of e.blind) expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describe('coger y enterrar', () => {
  it('el tercero coge, entierra 2 y empiezan las bazas', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'coger' });
    expect(e.picker).toBe(2);
    expect(e.fase).toBe('enterrar');
    expect(e.manos[2]).toHaveLength(8);
    const [x, y] = sheepshead.accionesLegales(e, 2).map((a) => (a as { carta: IdCarta }).carta);
    e = hacer(e, { tipo: 'enterrar', carta: x! });
    e = hacer(e, { tipo: 'enterrar', carta: y! });
    expect(e.fase).toBe('bazas');
    expect(e.manos[2]).toHaveLength(6);
    expect(e.turno).toBe(0);
    expect(sheepshead.vistaDe(e, 2).misEnterradas).toEqual([x, y]);
    expect(sheepshead.vistaDe(e, 1).misEnterradas).toEqual([]);
  });

  it('no se puede enterrar la J de diamantes', () => {
    const e: EstadoSheepshead = {
      ...nueva(),
      fase: 'enterrar',
      picker: 0,
      turno: 0,
      manos: [c('Jd 7c 8c 9c 7p 8p Ap 10p'), [], [], [], []],
    };
    const cartas = sheepshead.accionesLegales(e, 0).map((a) => (a as { carta: IdCarta }).carta);
    expect(cartas).toHaveLength(7);
    expect(cartas).not.toContain(J_DIAMANTES);
  });

  it('si pasan los cinco se juega el leaster', () => {
    let e = nueva();
    for (let i = 0; i < 5; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.leaster).toBe(true);
    expect(e.fase).toBe('bazas');
    expect(e.companero).toBeNull();
  });
});

describe('compañero', () => {
  function conPicker(manos: string[], picker = 0): EstadoSheepshead {
    return { ...nueva(), fase: 'bazas', picker, turno: 0, manos: manos.map(c), companero: null };
  }

  it('el compañero es quien tiene la J de diamantes y se ve al jugarla', () => {
    let e: EstadoSheepshead = { ...conPicker(['Qt', 'Ac', 'Jd', '7p', '8p']), companero: 2 };
    expect(sheepshead.vistaDe(e, 1).companero).toBeNull();
    expect(sheepshead.vistaDe(e, 2).companero).toBe(2);
    e = hacer(e, { tipo: 'jugar', carta: una('Qt') });
    e = hacer(e, { tipo: 'jugar', carta: una('Ac') });
    e = hacer(e, { tipo: 'jugar', carta: una('Jd') });
    expect(sheepshead.vistaDe(e, 1).companero).toBe(2);
  });

  it('al empezar las bazas el compañero se fija por la J de diamantes', () => {
    const e: EstadoSheepshead = {
      ...nueva(),
      fase: 'enterrar',
      picker: 0,
      turno: 0,
      manos: [c('7c 8c 9c 7p 8p 9p Ap 10p'), c('Jd'), [], [], []],
    };
    let f = hacer(e, { tipo: 'enterrar', carta: una('7c') });
    f = hacer(f, { tipo: 'enterrar', carta: una('8c') });
    expect(f.companero).toBe(1);
  });
});

describe('bazas', () => {
  it('se sigue al triunfo con una J; sin el palo, cualquier carta', () => {
    const e: EstadoSheepshead = {
      ...nueva(),
      fase: 'bazas',
      picker: 0,
      turno: 1,
      manos: [[], c('Jp At'), [], [], []],
      mesa: enMesa([0, '7d']),
    };
    expect(sheepshead.accionesLegales(e, 1)).toEqual([{ tipo: 'jugar', carta: una('Jp') }]);
    const f = { ...e, mesa: enMesa([0, 'Ac']) };
    expect(sheepshead.accionesLegales(f, 1)).toHaveLength(2);
  });
});

describe('puntuación', () => {
  it('con compañero: gana, schneider y schwarz', () => {
    expect(puntuarPickerSheepshead(0, 2, 75, 3)).toEqual([2, -1, 1, -1, -1]);
    expect(puntuarPickerSheepshead(0, 2, 95, 4)).toEqual([4, -2, 2, -2, -2]);
    expect(puntuarPickerSheepshead(0, 2, 120, 6)).toEqual([6, -3, 3, -3, -3]);
  });

  it('pierde, con schneider y con schwarz', () => {
    expect(puntuarPickerSheepshead(0, 2, 50, 2)).toEqual([-4, 2, -2, 2, 2]);
    expect(puntuarPickerSheepshead(0, 2, 28, 1)).toEqual([-8, 4, -4, 4, 4]);
    expect(puntuarPickerSheepshead(0, 2, 10, 0)).toEqual([-12, 6, -6, 6, 6]);
  });

  it('solo: lo suyo y lo del compañero', () => {
    expect(puntuarPickerSheepshead(1, 1, 95, 4)).toEqual([-2, 8, -2, -2, -2]);
    expect(puntuarPickerSheepshead(1, 1, 50, 2)).toEqual([2, -8, 2, 2, 2]);
  });

  it('leaster: menos puntos con alguna baza; luego menos bazas; luego el orden', () => {
    expect(ganadorLeasterSheepshead([30, 0, 10, 40, 40], [2, 0, 1, 2, 1], 4)).toBe(2);
    expect(ganadorLeasterSheepshead([10, 10, 50, 25, 25], [2, 1, 1, 1, 1], 4)).toBe(1);
    expect(ganadorLeasterSheepshead([10, 10, 50, 25, 25], [1, 1, 1, 2, 1], 4)).toBe(0);
  });

  it('el leaster anota +4 al ganador y −1 a los demás; el blind va al de la última baza', () => {
    const e: EstadoSheepshead = {
      ...nueva(),
      fase: 'bazas',
      leaster: true,
      blind: c('Ac 10c'),
      turno: 0,
      manos: [c('7p'), c('8p'), c('9p'), c('Ap'), c('7t')],
      bazas: [1, 1, 1, 1, 1],
      puntosMano: [0, 5, 3, 30, 40],
    };
    let f = e;
    for (const x of ['7p', '8p', '9p', 'Ap', '7t']) f = hacer(f, { tipo: 'jugar', carta: una(x) });
    const r = f.resultadosManos.at(-1)!;
    // La última la gana el 3 (As de picas): 30 + 11 + 21 del blind.
    expect(r.puntos[3]).toBe(62);
    expect(r.ganadorLeaster).toBe(0);
    expect(r.anotado).toEqual([4, -1, -1, -1, -1]);
  });
});

describe('partida', () => {
  it('termina tras las manos de la config y gana el mejor marcador', () => {
    let e = nueva('corta', 1);
    for (let i = 0; i < 5; i++) e = hacer(e, { tipo: 'pasar' });
    while (sheepshead.resultado(e) === null)
      e = hacer(e, sheepshead.accionesLegales(e, e.turno)[0]!);
    const fin = sheepshead.resultado(e)!;
    expect(e.resultadosManos).toHaveLength(1);
    expect(fin.puntos!.reduce((s, p) => s + p, 0)).toBe(0);
    expect(sheepshead.accionesLegales(e, e.turno)).toEqual([]);
  });
});

describirContrato(sheepshead, {
  configs: [CONFIG_SHEEPSHEAD_POR_DEFECTO, { jugadores: 5, manos: 2 }],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    const ajenas = e.manos.flatMap((m, a) => (a === asiento ? [] : m));
    const ocultas = [...ajenas, ...e.blind, ...(asiento === e.picker ? [] : e.enterradas)];
    return ocultas.filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1_000,
});
