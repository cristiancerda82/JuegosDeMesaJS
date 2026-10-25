import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaSevensBasica } from '../../src/ia/sevens-basica';
import {
  CONFIG_SEVENS_POR_DEFECTO,
  sevens,
  type AccionSevens,
  type EstadoSevens,
  type VistaSevens,
} from '../../src/juegos/sevens';
import { duelo, unoContraTodos } from './duelo';

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

function conMano(mano: string, mesa: Partial<EstadoSevens['mesa']>): EstadoSevens {
  const r = sevens.crear(CONFIG_SEVENS_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    manos: [c(mano), c('2d'), c('3d'), c('4d')],
    mesa: {
      picas: null,
      corazones: null,
      diamantes: { bajo: 5, alto: 7 },
      treboles: null,
      ...mesa,
    },
    turno: 0,
  };
}

describe('IA básica del Sevens', () => {
  it('prefiere la carta que le acerca otras', () => {
    const e = conMano('9p 10p Jp 5p 2c', { picas: { bajo: 6, alto: 8 } });
    const { accion } = iaSevensBasica.decidir(
      sevens.vistaDe(e, 0),
      sevens.accionesLegales(e, 0),
      crearAzar('x'),
    );
    expect(accion).toEqual({ tipo: 'jugar', carta: 'picas-9' });
  });
});

describe('IA difícil del Sevens', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano('9p 10p Jp 5p 2c 8d 4d', { picas: { bajo: 6, alto: 8 } });
    const v = sevens.vistaDe(e, 0);
    const acciones = sevens.accionesLegales(e, 0);
    expect(IAS.sevens.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.sevens.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Sevens', () => {
  const azar = aleatorio<VistaSevens, AccionSevens>();

  it('200 partidas entre IAs, de 3 a 6, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    for (const jugadores of [3, 4, 5, 6] as const) {
      const r = duelo(
        sevens,
        { jugadores },
        iaSevensBasica,
        IAS.sevens.facil,
        50,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      sevens,
      CONFIG_SEVENS_POR_DEFECTO,
      iaSevensBasica,
      azar,
      200,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(70);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      sevens,
      CONFIG_SEVENS_POR_DEFECTO,
      IAS.sevens.dificil,
      iaSevensBasica,
      2,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
