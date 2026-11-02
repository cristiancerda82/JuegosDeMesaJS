import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_TRESSETTE,
  CONFIG_TRESSETTE_POR_DEFECTO,
  ganadoraTressette,
  puntosManoTressette,
  terciosCartaTressette,
  tressette,
  type AccionTressette,
  type EstadoTressette,
} from '../../src/juegos/tressette';
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
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(semilla = 'tressette'): EstadoTressette {
  const r = tressette.crear(CONFIG_TRESSETTE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTressette, texto: string): EstadoTressette {
  const accion: AccionTressette = { tipo: 'jugar', carta: una(texto) };
  const r = aplicar(tressette, e, e.turno, accion);
  if (!r.ok) throw new Error(`${texto} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada: le toca al 0 y reparte el 3. */
function mesa(manos: string[], parcial: Partial<EstadoTressette> = {}): EstadoTressette {
  return {
    ...nueva(),
    manos: manos.map(c),
    repartidor: 3,
    turno: 0,
    mesa: [],
    tercios: [0, 0],
    fallos: [[], [], [], []],
    ...parcial,
  };
}

describe('baraja y reparto', () => {
  it('40 cartas españolas que suman 32 tercios, 35 con la última baza', () => {
    expect(BARAJA_TRESSETTE).toHaveLength(40);
    expect(BARAJA_TRESSETTE.reduce((s, x) => s + terciosCartaTressette(x), 0)).toBe(32);
  });

  it('10 cartas a cada uno, sin mazo; sale el siguiente al repartidor', () => {
    for (let i = 0; i < 8; i++) {
      const e = nueva(`reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
      expect(new Set(e.manos.flat()).size).toBe(40);
      expect(e.repartidor).toBe(3);
      expect(e.turno).toBe(0);
    }
  });

  it('rechaza otro número de jugadores o una meta inválida', () => {
    expect(tressette.crear({ jugadores: 2 as 4, meta: 21 }, 'x').ok).toBe(false);
    expect(tressette.crear({ jugadores: 4, meta: 0 }, 'x').ok).toBe(false);
  });
});

describe('bazas', () => {
  it('el 3 gana al As', () => {
    expect(ganadoraTressette(enMesa([0, 'Ac'], [1, '3c'])).asiento).toBe(1);
  });

  it('el orden es 3, 2, As, rey, caballo, sota, 7…4', () => {
    expect(ganadoraTressette(enMesa([0, 'Ab'], [1, '2b'])).asiento).toBe(1);
    expect(ganadoraTressette(enMesa([0, 'Rb'], [1, 'Ab'])).asiento).toBe(1);
    expect(ganadoraTressette(enMesa([0, 'Cb'], [1, 'Rb'])).asiento).toBe(1);
    expect(ganadoraTressette(enMesa([0, 'Sb'], [1, 'Cb'])).asiento).toBe(1);
    expect(ganadoraTressette(enMesa([0, '7b'], [1, 'Sb'])).asiento).toBe(1);
    expect(ganadoraTressette(enMesa([0, '4b'], [1, '5b'])).asiento).toBe(1);
  });

  it('sin palo no se gana: no hay triunfo', () => {
    expect(ganadoraTressette(enMesa([0, '4o'], [1, '3e'], [2, '5o'], [3, '2e'])).asiento).toBe(2);
  });

  it('hay que seguir el palo; sin él, cualquier carta', () => {
    const e = mesa(['Ab', '2b 3o', 'Re 2c', '4b'], { turno: 1, mesa: enMesa([0, 'Ab']) });
    expect(tressette.accionesLegales(e, 1)).toEqual([{ tipo: 'jugar', carta: una('2b') }]);
    expect(tressette.accionesLegales({ ...e, turno: 2 }, 2)).toHaveLength(2);
  });

  it('los tercios de la baza van a la pareja que la gana, y anota el que no siguió', () => {
    let e = mesa(['Ab 4o', '3b 4o', 'Rb 4o', 'Ce 4o']);
    for (const x of ['Ab', '3b', 'Rb', 'Ce']) e = hacer(e, x);
    expect(e.tercios).toEqual([0, 6]);
    expect(e.turno).toBe(1);
    expect(e.fallos[3]).toEqual(['bastos']);
  });
});

describe('puntos de la mano', () => {
  it('solo cuentan los puntos enteros, y entre las dos siempre suman 11', () => {
    expect(puntosManoTressette([16, 19])).toEqual([5, 6]);
    for (let t = 0; t <= 35; t++) {
      const [a, b] = puntosManoTressette([t, 35 - t]);
      expect(a + b).toBe(11);
    }
  });

  function cerrar(tercios: [number, number], puntos: [number, number] = [0, 0]) {
    // La última baza la gana el 0 con cartas que no valen nada.
    let e = mesa(['7o', '4o', '5o', '6o'], { tercios, puntos });
    for (const x of ['7o', '4o', '5o', '6o']) e = hacer(e, x);
    return e;
  }

  it('2 Ases, 7 cartas de un tercio y la última: 5 puntos y un tercio, anota 5; la otra 6', () => {
    const e = cerrar([13, 19]);
    expect(e.resultadosManos.at(-1)).toEqual({
      tercios: [16, 19],
      ultima: 0,
      puntos: [5, 6],
      puntosTras: [5, 6],
    });
    expect(e.puntos).toEqual([5, 6]);
    expect(e.manos.every((m) => m.length === 10)).toBe(true);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
  });

  it('con todas las bazas anota 11 y la otra 0', () => {
    expect(cerrar([32, 0]).resultadosManos.at(-1)!.puntos).toEqual([11, 0]);
  });
});

describe('partida', () => {
  function cerrar(tercios: [number, number], puntos: [number, number]) {
    let e = mesa(['7o', '4o', '5o', '6o'], { tercios, puntos });
    for (const x of ['7o', '4o', '5o', '6o']) e = hacer(e, x);
    return e;
  }

  it('una pareja con 15 anota 7 y la otra queda en 19: gana la de 22', () => {
    const e = cerrar([18, 14], [15, 15]);
    expect(e.puntos).toEqual([22, 19]);
    expect(tressette.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [22, 19, 22, 19],
    });
    expect(tressette.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('si las dos pasan de 21, gana la que tiene más', () => {
    const e = cerrar([12, 20], [18, 15]);
    expect(e.puntos).toEqual([23, 21]);
    expect(tressette.resultado(e)!.ganadores).toEqual([0, 2]);
  });

  it('con empate por encima de 21 se reparte otra mano', () => {
    const empate = cerrar([12, 20], [17, 16]);
    expect(empate.puntos).toEqual([22, 22]);
    expect(tressette.resultado(empate)).toBeNull();
    expect(empate.manos.every((m) => m.length === 10)).toBe(true);
  });
});

describe('vista', () => {
  it('cada uno ve su mano y cuántas tienen los demás, no cuáles', () => {
    const e = nueva();
    const v = tressette.vistaDe(e, 0);
    expect(v.miMano).toHaveLength(10);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    expect(JSON.stringify(v)).not.toContain('"manos"');
    for (const x of e.manos[1]!) expect(JSON.stringify(v)).not.toContain(`"${x}"`);
  });
});

describirContrato(tressette, {
  configs: [CONFIG_TRESSETTE_POR_DEFECTO],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 600,
});
