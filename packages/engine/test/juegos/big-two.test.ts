import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  bigTwo,
  CONFIG_BIG_TWO_POR_DEFECTO,
  jugadaBigTwo,
  jugadasPosiblesBigTwo,
  ordenarBigTwo,
  puntosBigTwo,
  superaBigTwo,
  valorBigTwo,
  type AccionBigTwo,
  type EstadoBigTwo,
} from '../../src/juegos/big-two';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «9p» es el 9 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(semilla = 'big-two'): EstadoBigTwo {
  const r = bigTwo.crear(CONFIG_BIG_TWO_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function conManos(manos: string[], parcial: Partial<EstadoBigTwo> = {}): EstadoBigTwo {
  return {
    ...nueva(),
    manos: manos.map((m) => ordenarBigTwo(c(m))),
    turno: 0,
    mesa: null,
    primera: false,
    ...parcial,
  };
}

function jugar(e: EstadoBigTwo, accion: AccionBigTwo): EstadoBigTwo {
  const r = aplicar(bigTwo, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const juega = (t: string): AccionBigTwo => ({ tipo: 'jugar', cartas: ordenarBigTwo(c(t)) });
const pasar: AccionBigTwo = { tipo: 'pasar' };
const legales = (e: EstadoBigTwo) => bigTwo.accionesLegales(e, e.turno);
const mesaDe = (asiento: number, t: string) => {
  const cartas = ordenarBigTwo(c(t));
  return { asiento, cartas, ...jugadaBigTwo(cartas)! };
};

describe('orden y reparto', () => {
  it('el 2 es la más alta y el palo desempata', () => {
    expect(valorBigTwo(c('2d')[0]!)).toBeGreaterThan(valorBigTwo(c('Ap')[0]!));
    expect(valorBigTwo(c('9c')[0]!)).toBeGreaterThan(valorBigTwo(c('9t')[0]!));
    expect(valorBigTwo(c('3d')[0]!)).toBe(0);
  });

  it('13 cartas a cada uno y sale quien tiene el 3 de diamantes, con él', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
    expect(e.manos[e.turno]).toContain('diamantes-3');
    const acciones = legales(e);
    expect(acciones.length).toBeGreaterThan(0);
    for (const a of acciones) {
      expect(a.tipo).toBe('jugar');
      if (a.tipo === 'jugar') expect(a.cartas).toContain('diamantes-3');
    }
  });
});

describe('jugadas', () => {
  it('clasifica cada tipo', () => {
    const tipo = (t: string) => jugadaBigTwo(c(t))?.tipo ?? null;
    expect(tipo('7c')).toBe('suelta');
    expect(tipo('7c 7d')).toBe('pareja');
    expect(tipo('7c 8d')).toBeNull();
    expect(tipo('7c 7d 7p')).toBe('trio');
    expect(tipo('3d 4t 5c 6p 7d')).toBe('escalera');
    expect(tipo('3d 8d 5d Jd Kd')).toBe('color');
    expect(tipo('9d 9t 9c 4p 4d')).toBe('full');
    expect(tipo('9d 9t 9c 9p 4d')).toBe('poker');
    expect(tipo('3c 4c 5c 6c 7c')).toBe('escaleraColor');
    expect(tipo('Jd Qt Kc Ap 2d')).toBe('escalera');
  });

  it('no hay escaleras que den la vuelta', () => {
    expect(jugadaBigTwo(c('Kd At 2c 3p 4d'))).toBeNull();
  });

  it('el full supera al color, y el color a la escalera', () => {
    const fuerza = (t: string) => ({ cartas: c(t), fuerza: jugadaBigTwo(c(t))!.fuerza });
    expect(superaBigTwo(fuerza('9d 9t 9c 4p 4d'), fuerza('3d 8d 5d Jd Ad'))).toBe(true);
    expect(superaBigTwo(fuerza('3d 8d 5d Jd Kd'), fuerza('10d Jt Qc Kp Ad'))).toBe(true);
    // Las parejas se comparan por número y, a igualdad, por la carta más alta.
    expect(superaBigTwo(fuerza('8p 8d'), fuerza('8c 8t'))).toBe(true);
    // Una pareja no supera a una suelta.
    expect(superaBigTwo(fuerza('2p 2c'), fuerza('3d'))).toBe(false);
  });

  it('enumera sin repetir y solo jugadas válidas', () => {
    const mano = c('3d 3t 3c 4d 5d 6d 7d 8d 9p 9c Jd Kd 2p');
    const jugadas = jugadasPosiblesBigTwo(mano);
    expect(new Set(jugadas.map((j) => j.join(','))).size).toBe(jugadas.length);
    for (const j of jugadas) expect(jugadaBigTwo(j)).not.toBeNull();
    // Hay escaleras de color de diamantes y fulls de 3 con 9.
    expect(jugadas.some((j) => jugadaBigTwo(j)!.tipo === 'escaleraColor')).toBe(true);
    expect(jugadas.some((j) => jugadaBigTwo(j)!.tipo === 'full')).toBe(true);
  });
});

describe('rondas', () => {
  it('pareja contra pareja: se supera con una pareja más alta, no con un trío', () => {
    const e = conManos(['10c 10d 5p 5c 5d', '4d', '4t', '4c'], { mesa: mesaDe(3, '8c 8t') });
    expect(legales(e)).toEqual([juega('10d 10c'), pasar]);
  });

  it('si los otros tres pasan, sale con lo que quiera quien hizo la última jugada', () => {
    let e = conManos(['8c 8t 3d', '4d 9t', '4t Kc', '4c Qd']);
    e = jugar(e, juega('8c 8t'));
    e = jugar(e, pasar);
    e = jugar(e, pasar);
    expect(e.mesa).not.toBeNull();
    e = jugar(e, pasar);
    expect(e.mesa).toBeNull();
    expect(e.turno).toBe(0);
    expect(legales(e)).toEqual([juega('3d')]);
  });

  it('pasar no impide jugar más tarde en la ronda', () => {
    let e = conManos(['5c 3d 9p', '6d 10t', '4t Kc', '4c Qd']);
    e = jugar(e, juega('5c'));
    e = jugar(e, pasar);
    e = jugar(e, juega('Kc'));
    e = jugar(e, pasar);
    e = jugar(e, pasar);
    expect(e.turno).toBe(1);
    expect(legales(e)).toContainEqual(pasar);
  });
});

describe('puntos y partida', () => {
  it('puntos de las cartas que quedan', () => {
    expect([3, 10, 13].map(puntosBigTwo)).toEqual([3, 20, 39]);
  });

  it('el que se queda sin cartas cierra la mano', () => {
    let e = conManos([
      '9p',
      '4d 5d 6d',
      '4t 5t 6t 7t 8t 9t 10t Jt Qt Kt',
      '3c 4c 5c 6c 7c 8c 9c 10c Jc Qc Kc Ac 2c',
    ]);
    e = jugar(e, juega('9p'));
    const r = e.resultadosManos[0]!;
    expect(r.ganador).toBe(0);
    expect(r.cartasRestantes).toEqual([0, 3, 10, 13]);
    expect(r.puntos).toEqual([0, 3, 20, 39]);
    expect(r.totales).toEqual([0, 3, 20, 39]);
    // Mano nueva: sale el del 3 de diamantes.
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
    expect(e.primera).toBe(true);
  });

  it('la partida termina cuando alguien llega a 50 y gana quien menos tiene', () => {
    let e = conManos(['9p', '4d 5d 6d', 'Kt', 'Kc'], { totales: [18, 27, 49, 41] });
    e = jugar(e, juega('9p'));
    expect(e.totales).toEqual([18, 30, 50, 42]);
    expect(bigTwo.resultado(e)).toEqual({
      ganadores: [0],
      empate: false,
      puntos: [18, 30, 50, 42],
    });
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas', () => {
    const e = nueva();
    const texto = JSON.stringify(bigTwo.vistaDe(e, 0));
    for (const x of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!]) {
      expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describirContrato(bigTwo, {
  configs: [CONFIG_BIG_TWO_POR_DEFECTO],
  // Las cartas de la última acción ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const a = e.ultimaAccion?.accion;
    const vistas = new Set(a?.tipo === 'jugar' ? a.cartas : []);
    return e.manos.flatMap((m, x) => (x === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
