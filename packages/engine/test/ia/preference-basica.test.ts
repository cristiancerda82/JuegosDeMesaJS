import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaPreferenceBasica } from '../../src/ia/preference-basica';
import {
  CONFIG_PREFERENCE_POR_DEFECTO,
  preference,
  type AccionPreference,
  type ConfigPreference,
  type EstadoPreference,
  type VistaPreference,
} from '../../src/juegos/preference';
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

function base(): EstadoPreference {
  const r = preference.crear(CONFIG_PREFERENCE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoPreference) =>
  iaPreferenceBasica.decidir(
    preference.vistaDe(e, e.turno),
    preference.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Préférence', () => {
  it('puja 6 de corazones con una mano fuerte en corazones', () => {
    const e = { ...base(), manos: [c('Ac Kc Qc Jc 10c 9c Ap At 7d 8d'), [], []] };
    expect(decide(e)).toEqual({
      tipo: 'pujar',
      puja: { tipo: 'bazas', bazas: 6, palo: 'corazones' },
    });
  });

  it('pasa con una mano floja', () => {
    const e = { ...base(), manos: [c('Qc Jc 10c 9p 8p 7p Qd 10d 9t 8t'), [], []] };
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('puja miseria sin cartas más altas que el 9', () => {
    const e = { ...base(), manos: [c('7c 8c 9c 7p 8p 9p 7d 8d 9d 7t'), [], []] };
    expect(decide(e)).toEqual({ tipo: 'pujar', puja: { tipo: 'miseria' } });
  });

  it('en la raspasy echa la carta más alta que no gana', () => {
    const e: EstadoPreference = {
      ...base(),
      fase: 'bazas',
      contrato: null,
      juega: null,
      turno: 1,
      manos: [c(''), c('9p Qp'), c('')],
      mesa: [{ asiento: 0, carta: c('10p')[0]! }],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('9p')[0] });
  });

  it('descarta las cartas que menos valen de sus palos más cortos, fuera del triunfo', () => {
    const e: EstadoPreference = {
      ...base(),
      fase: 'descarte',
      turno: 0,
      juega: 0,
      mejor: { asiento: 0, puja: { tipo: 'bazas', bazas: 6, palo: 'corazones' } },
      manos: [c('Ac Kc Qc Jc 10c 9c Ap At 7d 8d 7t 7p'), [], []],
    };
    const a = decide(e);
    expect(a.tipo).toBe('descartar');
    if (a.tipo === 'descartar') expect(a.carta.startsWith('corazones')).toBe(false);
  });
});

describe('IA difícil del Préférence', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    let e = base();
    for (let i = 0; i < 3; i++) e = preference.transicion(e, e.turno, { tipo: 'pasar' });
    const v = preference.vistaDe(e, e.turno);
    const acciones = preference.accionesLegales(e, e.turno);
    expect(IAS.preference.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.preference.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Préférence', () => {
  const azar = aleatorio<VistaPreference, AccionPreference>();
  // Pulka a 4, para que las 100 partidas no sean tan largas.
  const corta: ConfigPreference = { jugadores: 3, meta: 4 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      preference,
      corta,
      iaPreferenceBasica,
      IAS.preference.facil,
      100,
      unoContraTodos(3),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(preference, corta, iaPreferenceBasica, azar, 200, unoContraTodos(3), 'azar');
    expect(r.ganadas).toBeGreaterThan(100);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      preference,
      corta,
      IAS.preference.dificil,
      iaPreferenceBasica,
      1,
      unoContraTodos(3),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
