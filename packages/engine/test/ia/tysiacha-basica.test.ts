import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTysiachaBasica } from '../../src/ia/tysiacha-basica';
import {
  CONFIG_TYSIACHA_POR_DEFECTO,
  tysiacha,
  type AccionTysiacha,
  type ConfigTysiacha,
  type EstadoTysiacha,
  type VistaTysiacha,
} from '../../src/juegos/tysiacha';
import { duelo, unoContraTodos } from './duelo';

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

function base(): EstadoTysiacha {
  const r = tysiacha.crear(CONFIG_TYSIACHA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoTysiacha) =>
  iaTysiachaBasica.decidir(
    tysiacha.vistaDe(e, e.turno),
    tysiacha.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Tysiącha', () => {
  it('puja con el matrimonio de corazones y dos Ases', () => {
    const e = { ...base(), manos: [c(''), c('Kc Qc Ap Ad 9t Jt 9d'), c('')] };
    expect(decide(e)).toEqual({ tipo: 'pujar' });
  });

  it('pasa sin Ases ni matrimonios', () => {
    const e = { ...base(), manos: [c(''), c('Kc Qp 9t Jt 9d Jd 10p'), c('')] };
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('canta en cuanto puede, saliendo con la Q', () => {
    const e: EstadoTysiacha = {
      ...base(),
      fase: 'bazas',
      declarante: 0,
      contrato: 100,
      turno: 0,
      bazasGanadas: [1, 0, 0],
      manos: [c('Kd Qd Ap 9t'), c('9p'), c('9c')],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('Qd')[0] });
  });

  it('da un 9 a cada rival', () => {
    const e: EstadoTysiacha = {
      ...base(),
      fase: 'dar',
      declarante: 0,
      contrato: 100,
      turno: 0,
      manos: [c('Kc Qc Ap Ad 10d 9t 9d Jt Kp Jp'), c(''), c('')],
    };
    expect(decide(e)).toEqual({ tipo: 'dar', carta: c('9t')[0] });
    const tras = tysiacha.transicion(e, 0, { tipo: 'dar', carta: c('9t')[0]! });
    expect(decide(tras)).toEqual({ tipo: 'dar', carta: c('9d')[0] });
  });

  it('responde con la carta más baja que gana', () => {
    const e: EstadoTysiacha = {
      ...base(),
      fase: 'bazas',
      declarante: 0,
      contrato: 100,
      turno: 1,
      manos: [c(''), c('Ap 10p 9p'), c('')],
      mesa: [{ asiento: 0, carta: c('Kp')[0]! }],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('10p')[0] });
  });
});

describe('IA del Tysiącha en partidas', () => {
  const azar = aleatorio<VistaTysiacha, AccionTysiacha>();
  // A 300, para que las 100 partidas no sean tan largas.
  const corta: ConfigTysiacha = { jugadores: 3, meta: 300 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      tysiacha,
      corta,
      iaTysiachaBasica,
      IAS.tysiacha.facil,
      100,
      unoContraTodos(3),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(tysiacha, corta, iaTysiachaBasica, azar, 200, unoContraTodos(3), 'azar');
    expect(r.ganadas).toBeGreaterThan(100);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      tysiacha,
      corta,
      IAS.tysiacha.dificil,
      iaTysiachaBasica,
      1,
      unoContraTodos(3),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
