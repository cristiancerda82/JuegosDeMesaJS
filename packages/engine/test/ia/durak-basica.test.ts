import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaDurakBasica } from '../../src/ia/durak-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_DURAK_POR_DEFECTO,
  durak,
  type AccionDurak,
  type EstadoDurak,
  type VistaDurak,
} from '../../src/juegos/durak';
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

/** Triunfo picas; el asiento 0 ataca al 1. */
function conManos(mia: string, rival: string, parcial: Partial<EstadoDurak> = {}): EstadoDurak {
  const r = durak.crear(CONFIG_DURAK_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    manos: [c(mia), c(rival)],
    triunfo: 'picas',
    cartaTriunfo: 'picas-10',
    mazo: c('Kt Kd Kc 10p'),
    atacante: 0,
    defensor: 1,
    turno: 0,
    conocidas: [[], []],
    ...parcial,
  };
}

const decide = (e: EstadoDurak) =>
  iaDurakBasica.decidir(
    durak.vistaDe(e, e.turno),
    durak.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Durak', () => {
  it('ataca con la más baja que no es triunfo', () => {
    expect(decide(conManos('6c 10t 7p', '8d 9d'))).toEqual({
      tipo: 'atacar',
      carta: 'corazones-6',
    });
  });

  it('defiende con lo justo', () => {
    const e = conManos('7c', '9d Kd 6p', {
      mesa: [{ ataque: 'diamantes-8', defensa: null }],
      turno: 1,
    });
    expect(decide(e)).toEqual({ tipo: 'defender', carta: 'diamantes-9' });
  });

  it('se las lleva antes que gastar un triunfo alto con mucho mazo', () => {
    const mazo = c('Kt Kd Kc Qt Qd Qc Jt Jd 10p');
    const e = conManos('7c', '6d Ap', {
      mesa: [{ ataque: 'diamantes-8', defensa: null }],
      turno: 1,
      mazo,
    });
    expect(decide(e)).toEqual({ tipo: 'tomar' });
  });

  it('no echa triunfos mientras queda mazo', () => {
    const e = conManos('8p 9c', '7d', {
      mesa: [{ ataque: 'diamantes-8', defensa: 'diamantes-9' }],
      turno: 0,
    });
    expect(decide(e)).toEqual({ tipo: 'atacar', carta: 'corazones-9' });
    const sinNueve = { ...e, manos: [c('8p 7c'), c('7d')] };
    expect(decide(sinNueve)).toEqual({ tipo: 'pasar' });
  });
});

describe('IA difícil del Durak', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = conManos('6c 10t 7p 8c 9d Jt', '8d 9t 10c Qc Ad 6t');
    const v = durak.vistaDe(e, 0);
    const acciones = durak.accionesLegales(e, 0);
    expect(IAS.durak.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.durak.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Durak', () => {
  const azar = aleatorio<VistaDurak, AccionDurak>();

  it('100 partidas entre IAs, de 2 a 6, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    for (const jugadores of [2, 3, 4, 5, 6] as const) {
      const r = duelo(
        durak,
        { jugadores },
        iaDurakBasica,
        IAS.durak.facil,
        20,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      durak,
      CONFIG_DURAK_POR_DEFECTO,
      iaDurakBasica,
      azar,
      200,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      durak,
      { jugadores: 6 },
      IAS.durak.dificil,
      iaDurakBasica,
      2,
      unoContraTodos(6),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
