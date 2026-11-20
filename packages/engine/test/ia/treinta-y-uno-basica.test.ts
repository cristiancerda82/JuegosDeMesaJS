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

describe('IA básica del Treinta y uno con viuda', () => {
  function conViuda(mano: string, viuda: string): EstadoTreintaYUno {
    const r = treintaYUno.crear({ jugadores: 4, vidas: 3, viuda: true }, 'ia-viuda');
    if (!r.ok) throw new Error(r.error);
    return {
      ...r.valor,
      manos: r.valor.manos.map((m, a) => (a === 0 ? c(mano) : m)),
      viuda: c(viuda),
    };
  }

  it('coge el As de su palo', () => {
    expect(decide(conViuda('Kc 9c 2p', 'Ac 4t 6d'))).toEqual({
      tipo: 'cambiar',
      mia: una('2p'),
      mesa: una('Ac'),
    });
  });

  it('se lleva la viuda entera', () => {
    expect(decide(conViuda('2p 3c 5t', 'Ad Kd Qd'))).toEqual({ tipo: 'cambiarTodas' });
  });

  it('pasa si nada la mejora', () => {
    expect(decide(conViuda('Ac 4c 10p', '2t 3d 4p'))).toEqual({ tipo: 'pasar' });
  });

  it('se planta con 27 o más', () => {
    expect(decide(conViuda('Ac Kc 7c', '2t 3d 4p'))).toEqual({ tipo: 'plantarse' });
  });
});

describe('IA del Treinta y uno con viuda en partidas', () => {
  const azar = aleatorio<VistaTreintaYUno, AccionTreintaYUno>();

  it('partidas entre IAs de 2 a 6 terminan sin acciones ilegales y rápidas', () => {
    for (const jugadores of [2, 3, 4, 5, 6] as const) {
      const r = duelo(
        treintaYUno,
        { jugadores, vidas: 2, viuda: true },
        iaTreintaYUnoBasica,
        IAS.treintaYUno.facil,
        20,
        unoContraTodos(jugadores),
        `viuda-${jugadores}`,
      );
      expect(r.partidas).toBe(20);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      treintaYUno,
      { jugadores: 4, vidas: 2, viuda: true },
      iaTreintaYUnoBasica,
      azar,
      200,
      unoContraTodos(4),
      'viuda-azar',
    );
    expect(r.ganadas, `${r.ganadas} de 200`).toBeGreaterThan(80);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      treintaYUno,
      { jugadores: 4, vidas: 1, viuda: true },
      IAS.treintaYUno.dificil,
      iaTreintaYUnoBasica,
      2,
      unoContraTodos(4),
      'viuda-tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
