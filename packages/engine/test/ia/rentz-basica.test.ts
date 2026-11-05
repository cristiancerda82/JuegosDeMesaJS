import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaRentzBasica } from '../../src/ia/rentz-basica';
import {
  rentz,
  type AccionRentz,
  type ConfigRentz,
  type EstadoRentz,
  type VistaRentz,
} from '../../src/juegos/rentz';
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

function base(): EstadoRentz {
  const r = rentz.crear({ jugadores: 4, rondas: 7 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoRentz) =>
  iaRentzBasica.decidir(
    rentz.vistaDe(e, e.turno),
    rentz.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Rentz', () => {
  it('elige bazas con los cuatro Ases y dos K', () => {
    const e = { ...base(), manos: [c('Ap Ac Ad At Kp Kc 7d 8t'), [], [], []] };
    expect(decide(e)).toEqual({ tipo: 'contrato', contrato: 'positivo' });
  });

  it('en sin bazas sale con su palo más corto, la más baja', () => {
    const e: EstadoRentz = {
      ...base(),
      fase: 'bazas',
      contrato: 'bazas',
      manos: [c('7p 8c 9c 10c Jc Qc'), [], [], []],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('7p') });
  });

  it('en sin damas, sin el palo, se descarta de la dama', () => {
    const e: EstadoRentz = {
      ...base(),
      fase: 'bazas',
      contrato: 'damas',
      turno: 1,
      manos: [[], c('Qd Ac 7t'), [], []],
      mesa: [{ asiento: 0, carta: una('9p') }],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Qd') });
  });
});

describe('IA del Rentz en partidas', () => {
  const azar = aleatorio<VistaRentz, AccionRentz>();
  // Una ronda (4 manos), para que las partidas de las pruebas no sean tan largas.
  const corta: ConfigRentz = { jugadores: 4, rondas: 1 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(rentz, corta, iaRentzBasica, IAS.rentz.facil, 100, unoContraTodos(4), 'sim');
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(rentz, corta, iaRentzBasica, azar, 200, unoContraTodos(4), 'azar');
    expect(r.ganadas).toBeGreaterThan(80);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(rentz, corta, IAS.rentz.dificil, iaRentzBasica, 1, unoContraTodos(4), 'tiempo');
    expect(r.maxMs).toBeLessThan(500);
  });
});
