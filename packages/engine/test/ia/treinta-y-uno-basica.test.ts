import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTreintaYUnoBasica } from '../../src/ia/treinta-y-uno-basica';
import {
  CONFIG_TREINTA_Y_UNO_POR_DEFECTO,
  treintaYUno,
  type AccionTreintaYUno,
  type ConfigTreintaYUno,
  type EstadoTreintaYUno,
  type VistaTreintaYUno,
} from '../../src/juegos/treinta-y-uno';
import { duelo, unoContraTodos } from './duelo';

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

function base(): EstadoTreintaYUno {
  const r = treintaYUno.crear(CONFIG_TREINTA_Y_UNO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoTreintaYUno) =>
  iaTreintaYUnoBasica.decidir(
    treintaYUno.vistaDe(e, e.turno),
    treintaYUno.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const conMano = (e: EstadoTreintaYUno, mano: string, arriba?: string): EstadoTreintaYUno => ({
  ...e,
  manos: e.manos.map((m, a) => (a === e.turno ? c(mano) : m)),
  descarte: arriba ? [una(arriba)] : e.descarte,
});

describe('IA básica del Treinta y uno', () => {
  it('se planta con buena mano', () => {
    expect(decide(conMano(base(), 'Ap Kp 8p', '2d'))).toEqual({ tipo: 'plantarse' });
  });

  it('coge del descarte y descarta lo que sobra', () => {
    let e = conMano(base(), 'Ac 9c 4p', 'Kc');
    expect(decide(e)).toEqual({ tipo: 'robar', desde: 'descarte' });
    e = treintaYUno.transicion(e, 0, decide(e));
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: una('4p') });
  });

  it('con una mano floja y un descarte que no ayuda, roba del mazo', () => {
    expect(decide(conMano(base(), '2c 5p 9t', '3d'))).toEqual({ tipo: 'robar', desde: 'mazo' });
  });
});

describe('IA del Treinta y uno en partidas', () => {
  const azar = aleatorio<VistaTreintaYUno, AccionTreintaYUno>();
  // Dos vidas, para que las partidas de las pruebas no sean tan largas.
  const corta: ConfigTreintaYUno = { jugadores: 4, vidas: 2 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      treintaYUno,
      corta,
      iaTreintaYUnoBasica,
      IAS.treintaYUno.facil,
      100,
      unoContraTodos(4),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(treintaYUno, corta, iaTreintaYUnoBasica, azar, 300, unoContraTodos(4), 'azar');
    expect(r.ganadas).toBeGreaterThan(120);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      treintaYUno,
      corta,
      IAS.treintaYUno.dificil,
      iaTreintaYUnoBasica,
      1,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
