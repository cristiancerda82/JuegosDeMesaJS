import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCasitaRobadaBasica } from '../../src/ia/casita-robada-basica';
import { IAS } from '../../src/ia/ias';
import {
  casitaRobada,
  CONFIG_CASITA_ROBADA_POR_DEFECTO,
  type AccionCasitaRobada,
  type EstadoCasitaRobada,
  type VistaCasitaRobada,
} from '../../src/juegos/casita-robada';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «5o» es el 5 de oros; c, e y b, copas, espadas y bastos; S, C y R, sota, caballo y rey. */
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

function con(mesa: string, mano: string, casitas: string[]): EstadoCasitaRobada {
  const r = casitaRobada.crear({ jugadores: 2 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    mesa: c(mesa),
    manos: [c(mano), c('3o')],
    casitas: casitas.map(c),
    turno: 0,
  };
}

const decide = (e: EstadoCasitaRobada) =>
  iaCasitaRobadaBasica.decidir(
    casitaRobada.vistaDe(e, 0),
    casitaRobada.accionesLegales(e, 0),
    crearAzar('x'),
  ).accion;

describe('IA básica de la Casita robada', () => {
  it('roba la casita grande antes que llevarse cartas de la mesa', () => {
    const e = con('4o 4c', 'Ro 4e', ['', 'Ab 2o 3e 5o 6c 7c 7b Rc']);
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ro'), robar: 1 });
  });

  it('se lleva lo que más puede', () => {
    const e = con('3c 6o 6c', '3e 6e', ['', '']);
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('6e'), robar: null });
  });

  it('sin nada que llevarse, deja la carta más vista', () => {
    // Los otros tres sietes ya están en las casitas.
    const e = con('Sb', '2o 7o', ['7c 7e 2c', '7b Cc']);
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('7o'), robar: null });
  });
});

describe('IA de la Casita robada en partidas', () => {
  const azar = aleatorio<VistaCasitaRobada, AccionCasitaRobada>();

  it('100 partidas entre IAs, de 2 a 4, terminan sin acciones ilegales y rápidas', () => {
    for (const jugadores of [2, 3, 4] as const) {
      const r = duelo(
        casitaRobada,
        { jugadores },
        iaCasitaRobadaBasica,
        IAS.casitaRobada.facil,
        34,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(34);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      casitaRobada,
      CONFIG_CASITA_ROBADA_POR_DEFECTO,
      iaCasitaRobadaBasica,
      azar,
      200,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas, `${r.ganadas} de 200`).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms, también con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        casitaRobada,
        { jugadores },
        IAS.casitaRobada.dificil,
        iaCasitaRobadaBasica,
        2,
        unoContraTodos(jugadores),
        'tiempo',
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
