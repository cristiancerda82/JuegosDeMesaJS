import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCasinoBasica } from '../../src/ia/casino-basica';
import { IAS } from '../../src/ia/ias';
import {
  casino,
  CONFIG_CASINO_POR_DEFECTO,
  type AccionCasino,
  type ElementoMesaCasino,
  type EstadoCasino,
  type VistaCasino,
} from '../../src/juegos/casino';
import { duelo, porBandos, unoContraTodos } from './duelo';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
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

function conMano(mano: string, mesa: string): EstadoCasino {
  const r = casino.crear(CONFIG_CASINO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    manos: [c(mano), c('Jt Jc')],
    mesa: c(mesa).map((carta): ElementoMesaCasino => ({ tipo: 'carta', carta })),
    turno: 0,
  };
}

const decide = (e: EstadoCasino) =>
  iaCasinoBasica.decidir(casino.vistaDe(e, 0), casino.accionesLegales(e, 0), crearAzar('x')).accion;

describe('IA básica del Casino', () => {
  it('recoge el Big Casino', () => {
    expect(decide(conMano('10t 4p', '10d 4t Qc'))).toEqual({
      tipo: 'recoger',
      carta: 'treboles-10',
    });
  });

  it('construye cuando puede recoger después', () => {
    expect(decide(conMano('3t 8c', '5d Qc'))).toEqual({
      tipo: 'construir',
      carta: 'treboles-3',
      cartas: ['diamantes-5'],
      construccion: null,
      valor: 8,
    });
  });

  it('deja la carta que menos vale', () => {
    expect(decide(conMano('Ap 10d Kc 9t', 'Qt'))).toEqual({ tipo: 'dejar', carta: 'corazones-13' });
  });
});

describe('IA difícil del Casino', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano('3t 8c 9p Ad', '5d Qc 2t 7c');
    const v = casino.vistaDe(e, 0);
    const acciones = casino.accionesLegales(e, 0);
    expect(IAS.casino.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.casino.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Casino', () => {
  const azar = aleatorio<VistaCasino, AccionCasino>();

  it('100 partidas entre IAs, de 2 a 4, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    const configs = [
      { config: { jugadores: 2, parejas: false }, n: 30, esA: unoContraTodos(2) },
      { config: { jugadores: 3, parejas: false }, n: 25, esA: unoContraTodos(3) },
      { config: { jugadores: 4, parejas: false }, n: 20, esA: unoContraTodos(4) },
      { config: { jugadores: 4, parejas: true }, n: 25, esA: porBandos },
    ] as const;
    for (const { config, n, esA } of configs) {
      const r = duelo(casino, config, iaCasinoBasica, IAS.casino.facil, n, esA, `sim-${n}`);
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      casino,
      CONFIG_CASINO_POR_DEFECTO,
      iaCasinoBasica,
      azar,
      200,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      casino,
      { jugadores: 4, parejas: false },
      IAS.casino.dificil,
      iaCasinoBasica,
      2,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
