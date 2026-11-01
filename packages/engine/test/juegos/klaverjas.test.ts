import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  anotarManoKlaverjas,
  BARAJA_KLAVERJAS,
  CONFIG_KLAVERJAS_POR_DEFECTO,
  ganadoraKlaverjas,
  klaverjas,
  puntosCartaKlaverjas,
  roemBaza,
  type AccionKlaverjas,
  type EstadoKlaverjas,
} from '../../src/juegos/klaverjas';
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

function nueva(semilla = 'klaverjas', manos = 8): EstadoKlaverjas {
  const r = klaverjas.crear({ jugadores: 4, manos }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoKlaverjas, accion: AccionKlaverjas | string): EstadoKlaverjas {
  const a: AccionKlaverjas =
    typeof accion === 'string' ? { tipo: 'carta', carta: una(accion) } : accion;
  const r = aplicar(klaverjas, e, e.turno, a);
  if (!r.ok) throw new Error(`${JSON.stringify(a)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada en bazas: le toca al 0, reparte el 3, triunfo tréboles y juega la pareja 0. */
function mesa(manos: string[], parcial: Partial<EstadoKlaverjas> = {}): EstadoKlaverjas {
  return {
    ...nueva(),
    fase: 'bazas',
    triunfo: 'treboles',
    juega: 0,
    manos: manos.map(c),
    turno: 0,
    ...parcial,
  };
}

const legales = (e: EstadoKlaverjas) =>
  klaverjas
    .accionesLegales(e, e.turno)
    .map((a) => (a.tipo === 'carta' ? a.carta : a.tipo === 'elegir' ? a.palo : a.tipo));

describe('baraja y reparto', () => {
  it('32 cartas del 7 al As; con cualquier triunfo suman 152', () => {
    expect(BARAJA_KLAVERJAS).toHaveLength(32);
    for (const t of ['picas', 'corazones', 'diamantes', 'treboles'] as const) {
      expect(BARAJA_KLAVERJAS.reduce((s, x) => s + puntosCartaKlaverjas(x, t), 0)).toBe(152);
    }
  });

  it('8 cartas a cada uno y un palo propuesto; dice primero el siguiente al repartidor', () => {
    const propuestos = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const e = nueva(`reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
      expect(new Set(e.manos.flat()).size).toBe(32);
      expect(e.fase).toBe('propuesta');
      expect(e.turno).toBe(0);
      propuestos.add(e.propuesto);
    }
    expect(propuestos.size).toBeGreaterThan(1);
  });
});

describe('propuesta del triunfo', () => {
  it('el primero que juega hace de su pareja la que juega; sale el siguiente al repartidor', () => {
    let e: EstadoKlaverjas = { ...nueva(), propuesto: 'corazones' };
    expect(legales(e)).toEqual(['jugar', 'pasar']);
    e = hacer(e, { tipo: 'pasar' });
    expect(e.turno).toBe(1);
    e = hacer(e, { tipo: 'jugar' });
    expect(e.triunfo).toBe('corazones');
    expect(e.juega).toBe(1);
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
  });

  it('si pasan todos, el siguiente al repartidor elige cualquier palo', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.fase).toBe('eleccion');
    expect(e.turno).toBe(0);
    expect(legales(e)).toEqual(['picas', 'corazones', 'diamantes', 'treboles']);
    e = hacer(e, { tipo: 'elegir', palo: 'picas' });
    expect(e.triunfo).toBe('picas');
    expect(e.juega).toBe(0);
    expect(e.turno).toBe(0);
  });
});

describe('órdenes y puntos', () => {
  it('la Jota del triunfo gana al As; el 10 gana al Rey', () => {
    expect(ganadoraKlaverjas(enMesa([0, 'Ap'], [1, 'Jp']), 'picas').asiento).toBe(1);
    expect(ganadoraKlaverjas(enMesa([0, 'Ap'], [1, '9p']), 'picas').asiento).toBe(1);
    expect(ganadoraKlaverjas(enMesa([0, 'Kc'], [1, '10c']), 'picas').asiento).toBe(1);
    expect(ganadoraKlaverjas(enMesa([0, 'Ac'], [1, '7p']), 'picas').asiento).toBe(1);
  });

  it('puntos del triunfo y de los demás palos', () => {
    expect(puntosCartaKlaverjas(una('Jt'), 'treboles')).toBe(20);
    expect(puntosCartaKlaverjas(una('9t'), 'treboles')).toBe(14);
    expect(puntosCartaKlaverjas(una('Jp'), 'treboles')).toBe(2);
    expect(puntosCartaKlaverjas(una('9p'), 'treboles')).toBe(0);
  });
});

describe('bazas de Rotterdam', () => {
  it('hay que fallar aunque gane el compañero', () => {
    const e = mesa(['Ac', '7c', '8t 7p', '7d'], {
      turno: 2,
      mesa: enMesa([0, 'Ac'], [1, '7c']),
    });
    expect(legales(e)).toEqual(c('8t'));
  });

  it('hay que subir el triunfo', () => {
    const e = mesa(['Ac', '10t', 'At 8t 7p', '7d'], {
      turno: 2,
      mesa: enMesa([0, 'Ac'], [1, '10t']),
    });
    expect(legales(e)).toEqual(c('At'));
  });

  it('sin poder subir no se echa un triunfo más bajo', () => {
    const e = mesa(['Ac', 'Jt', '8t 7p', '7d'], { turno: 2, mesa: enMesa([0, 'Ac'], [1, 'Jt']) });
    expect(legales(e)).toEqual(c('7p'));
    const solo = mesa(['Ac', 'Jt', '8t 7t', '7d'], {
      turno: 2,
      mesa: enMesa([0, 'Ac'], [1, 'Jt']),
    });
    expect(legales(solo)).toHaveLength(2);
  });

  it('si sale triunfo hay que subir si se puede', () => {
    const e = mesa(['At', '9t 8t', '7d', '7d'], { turno: 1, mesa: enMesa([0, 'At']) });
    expect(legales(e)).toEqual(c('9t'));
  });

  it('hay que seguir el palo', () => {
    const e = mesa(['Ac', '7c 8t', '7d', '7d'], { turno: 1, mesa: enMesa([0, 'Ac']) });
    expect(legales(e)).toEqual(c('7c'));
  });
});

describe('roem', () => {
  it('escaleras, cuatro iguales y stuk', () => {
    expect(roemBaza(c('8c 9c 10c 7d'), 'picas')).toBe(20);
    expect(roemBaza(c('8c 9c 10c Jc'), 'picas')).toBe(50);
    expect(roemBaza(c('Kp Qp 7c 8d'), 'picas')).toBe(20);
    expect(roemBaza(c('Kp Qp Jp 8d'), 'picas')).toBe(40);
    expect(roemBaza(c('Ap Ac Ad At'), 'picas')).toBe(100);
    expect(roemBaza(c('Jp Jc Jd Jt'), 'picas')).toBe(200);
    expect(roemBaza(c('7c 9c 10c 8d'), 'picas')).toBe(0);
  });

  it('el roem lo anota quien gana la baza', () => {
    let e = mesa(['8c 7d', '9c 7d', '10c 8d', '7c 9d'], { triunfo: 'picas' });
    for (const x of ['8c', '9c', '10c', '7c']) e = hacer(e, x);
    // Escalera 7-8-9-10 de corazones: 50, para la pareja del 2.
    expect(e.roemMano).toEqual([50, 0]);
    expect(e.ultimaBaza?.roem).toBe(50);
  });
});

describe('nat, pit y partida', () => {
  it('gana la que juega: cada una anota lo suyo', () => {
    expect(anotarManoKlaverjas([100, 62], [20, 0], 0)).toEqual({ anotado: [120, 62], nat: false });
  });

  it('nat: la otra se lleva los 162 y todo el roem', () => {
    expect(anotarManoKlaverjas([80, 82], [0, 0], 0)).toEqual({ anotado: [0, 162], nat: true });
    expect(anotarManoKlaverjas([100, 62], [0, 50], 0)).toEqual({ anotado: [0, 212], nat: true });
  });

  /** Juega la mano con la primera acción legal. */
  function acabarMano(e: EstadoKlaverjas): EstadoKlaverjas {
    const inicio = e.resultadosManos.length;
    while (e.resultadosManos.length === inicio) {
      e = hacer(e, klaverjas.accionesLegales(e, e.turno)[0]!);
    }
    return e;
  }

  it('cada mano reparte 162 por cartas; se reparte la siguiente con otro repartidor', () => {
    for (let i = 0; i < 8; i++) {
      const e = acabarMano(nueva(`mano-${i}`));
      const r = e.resultadosManos.at(-1)!;
      expect(r.cartas[0] + r.cartas[1]).toBe(162);
      expect(r.anotado[0] + r.anotado[1]).toBe(162 + r.roem[0] + r.roem[1]);
      expect(e.repartidor).toBe(0);
      expect(e.fase).toBe('propuesta');
      expect(e.turno).toBe(1);
    }
  });

  it('pit: la pareja que gana las 8 bazas suma 100 de roem', () => {
    let e = mesa(
      [
        'Jt 9t At 10t Kt Qt 8t 7t',
        '7c 8c 9c 10c Jc Qc Kc Ac',
        '7d 8d 9d 10d Jd Qd Kd Ad',
        '7p 8p 9p 10p Jp Qp Kp Ap',
      ],
      { roemMano: [0, 0] },
    );
    e = acabarMano(e);
    const r = e.resultadosManos.at(-1)!;
    expect(r.pit).toBe(0);
    expect(r.cartas).toEqual([162, 0]);
    expect(r.roem[0]).toBeGreaterThanOrEqual(100);
    expect(r.nat).toBe(false);
  });

  it('la partida termina tras la última mano; gana la pareja con más puntos', () => {
    let e = nueva('fin', 2);
    e = acabarMano(acabarMano(e));
    const fin = klaverjas.resultado(e)!;
    expect(fin).not.toBeNull();
    const [p0, p1] = e.puntos;
    if (p0 === p1) expect(fin.empate).toBe(true);
    else expect(fin.ganadores).toEqual(p0 > p1 ? [0, 2] : [1, 3]);
    expect(klaverjas.accionesLegales(e, e.turno)).toEqual([]);
  });
});

describe('vista', () => {
  it('cada uno ve su mano, el palo propuesto y cuántas tienen los demás', () => {
    const e = nueva();
    const v = klaverjas.vistaDe(e, 0);
    expect(v.miMano).toHaveLength(8);
    expect(v.cartasEnMano).toEqual([8, 8, 8, 8]);
    expect(v.propuesto).toBe(e.propuesto);
    expect(JSON.stringify(v)).not.toContain('"manos":[');
  });
});

describirContrato(klaverjas, {
  configs: [CONFIG_KLAVERJAS_POR_DEFECTO, { jugadores: 4, manos: 2 }],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 600,
});
