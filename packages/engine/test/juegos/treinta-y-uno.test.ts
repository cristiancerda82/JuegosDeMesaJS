import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_TREINTA_Y_UNO_POR_DEFECTO,
  treintaYUno,
  valorManoTreinta,
  type AccionTreintaYUno,
  type EstadoTreintaYUno,
  type JugadoresTreinta,
} from '../../src/juegos/treinta-y-uno';
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

function nueva(semilla = 'treinta', jugadores: JugadoresTreinta = 4, vidas = 3) {
  const r = treintaYUno.crear({ jugadores, vidas }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTreintaYUno, accion: AccionTreintaYUno): EstadoTreintaYUno {
  const r = aplicar(treintaYUno, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const robarMazo = (e: EstadoTreintaYUno) => hacer(e, { tipo: 'robar', desde: 'mazo' });
/** Roba del mazo y descarta la primera carta legal. */
function turno(e: EstadoTreintaYUno) {
  const r = robarMazo(e);
  return hacer(r, treintaYUno.accionesLegales(r, r.turno)[0]!);
}

describe('valor de la mano', () => {
  it('la suma de un palo', () => {
    expect(valorManoTreinta(c('Ac Kc 9p'))).toBe(21);
  });

  it('treinta y uno', () => {
    expect(valorManoTreinta(c('At Kt 10t'))).toBe(31);
  });

  it('tres iguales valen 30,5', () => {
    expect(valorManoTreinta(c('7c 7p 7t'))).toBe(30.5);
  });
});

describe('reparto', () => {
  it('con 4: 3 cartas a cada uno, una en el descarte y 39 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([3, 3, 3, 3]);
    expect(e.descarte).toHaveLength(1);
    expect(e.mazo).toHaveLength(39);
    expect(e.vidas).toEqual([3, 3, 3, 3]);
    expect(e.turno).toBe(0);
  });

  it('con 6 también', () => {
    const e = nueva('seis', 6);
    expect(e.manos.map((m) => m.length)).toEqual([3, 3, 3, 3, 3, 3]);
    expect(e.mazo).toHaveLength(33);
  });
});

describe('turno', () => {
  it('robar del descarte obliga a descartar otra', () => {
    const e = nueva();
    const arriba = e.descarte.at(-1)!;
    const r = hacer(e, { tipo: 'robar', desde: 'descarte' });
    expect(r.manos[0]).toHaveLength(4);
    const descartables = treintaYUno
      .accionesLegales(r, 0)
      .flatMap((a) => (a.tipo === 'descartar' ? [a.carta] : []));
    expect(descartables).toHaveLength(3);
    expect(descartables).not.toContain(arriba);
    // Los demás ven que la tiene.
    expect(treintaYUno.vistaDe(r, 1).conocidas[0]).toEqual([arriba]);
  });

  it('robar del mazo y descartar pasa el turno', () => {
    const e = turno(nueva());
    expect(e.manos[0]).toHaveLength(3);
    expect(e.descarte).toHaveLength(2);
    expect(e.turno).toBe(1);
  });

  it('si el mazo se acaba, se baraja el descarte salvo la de arriba', () => {
    const e0 = nueva();
    const e: EstadoTreintaYUno = {
      ...e0,
      mazo: [],
      descarte: [...e0.mazo.slice(0, 5), e0.descarte[0]!],
    };
    const r = robarMazo(e);
    expect(r.descarte).toEqual([e0.descarte[0]]);
    expect(r.mazo).toHaveLength(4);
    expect(r.manos[0]).toHaveLength(4);
  });
});

describe('plantarse', () => {
  it('los demás juegan su último turno y se enseñan las manos', () => {
    let e = turno(nueva());
    e = hacer(e, { tipo: 'plantarse' });
    expect(e.plantado).toBe(1);
    expect(e.ultimos).toBe(3);
    expect(treintaYUno.accionesLegales(e, 2)).not.toContainEqual({ tipo: 'plantarse' });
    e = turno(e);
    e = turno(e);
    expect(e.resultadosRondas).toHaveLength(0);
    e = turno(e);
    expect(e.resultadosRondas).toHaveLength(1);
    expect(e.resultadosRondas[0]!.plantado).toBe(1);
  });

  it('tras 8 vueltas sin plantarse, se enseñan las manos', () => {
    let e = nueva('vueltas', 2);
    for (let i = 0; i < 15; i++) e = turno(e);
    expect(e.resultadosRondas).toHaveLength(0);
    e = turno(e);
    expect(e.resultadosRondas).toHaveLength(1);
    expect(e.resultadosRondas[0]!.plantado).toBeNull();
  });
});

describe('vidas y fin', () => {
  /** Enseña las manos con esas cartas (el 0 se planta y los demás descartan lo robado). */
  function ensenar(manos: string[], vidas: number[]) {
    const e0 = nueva('vidas', manos.length as JugadoresTreinta);
    let e: EstadoTreintaYUno = { ...e0, manos: manos.map(c), vidas };
    e = hacer(e, { tipo: 'plantarse' });
    while (e.resultadosRondas.length === 0) {
      e = robarMazo(e);
      // Descarta la carta robada para no cambiar la mano.
      e = hacer(e, { tipo: 'descartar', carta: e.manos[e.turno]!.at(-1)! });
    }
    return e;
  }

  it('pierde una vida la peor mano', () => {
    const e = ensenar(['Ap Kp 7p', 'Ac Qc 9t', '7c 7p 7t'], [3, 3, 3]);
    const r = e.resultadosRondas[0]!;
    expect(r.valores).toEqual([28, 21, 30.5]);
    expect(r.pierden).toEqual([1]);
    expect(e.vidas).toEqual([3, 2, 3]);
  });

  it('si empatan abajo, pierden todos', () => {
    const e = ensenar(['Ap Kp 7p', 'Kc Qc 2t', 'Kt Qt 3p'], [3, 3, 3]);
    expect(e.resultadosRondas[0]!.pierden).toEqual([1, 2]);
  });

  it('gana el último con vidas', () => {
    const e = ensenar(['Ap Kp 7p', 'Ac Qc 9t'], [1, 1]);
    expect(treintaYUno.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [1, 0] });
  });

  it('si los últimos pierden a la vez, empatan', () => {
    const e = ensenar(['Kp Qp 2t', 'Kc Qc 3t', ''], [1, 1, 0]);
    expect(treintaYUno.resultado(e)).toEqual({
      ganadores: [0, 1],
      empate: false,
      puntos: [0, 0, 0],
    });
  });
});

describirContrato(treintaYUno, {
  configs: [
    CONFIG_TREINTA_Y_UNO_POR_DEFECTO,
    { jugadores: 2, vidas: 1 },
    { jugadores: 6, vidas: 2 },
  ],
  // El descarte y las cartas cogidas de él son públicos; las manos enseñadas, también.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.resultadosRondas.flatMap((r) => r.manos.flat()));
    const ajenas = e.manos.flatMap((m, a) =>
      a === asiento ? [] : m.filter((x) => !e.conocidas[a]!.includes(x)),
    );
    return [...ajenas, ...e.mazo].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 3_000,
});
