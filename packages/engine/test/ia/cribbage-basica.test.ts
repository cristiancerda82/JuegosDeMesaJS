import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCribbageBasica } from '../../src/ia/cribbage-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_CRIBBAGE_POR_DEFECTO,
  cribbage,
  type AccionCribbage,
  type EstadoCribbage,
  type VistaCribbage,
} from '../../src/juegos/cribbage';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «9p» es el 9 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(): EstadoCribbage {
  const r = cribbage.crear(CONFIG_CRIBBAGE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoCribbage) =>
  iaCribbageBasica.decidir(
    cribbage.vistaDe(e, e.turno),
    cribbage.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Cribbage', () => {
  it('se queda los cincos si el crib es del otro', () => {
    // Reparte el 1: para el 0, el crib es del otro.
    const e: EstadoCribbage = {
      ...nueva(),
      manos: [c('5t 5c 10d Jp 2c 9t'), c('Ap 2p 3p 4p 6p 7p')],
    };
    const accion = decide(e);
    expect(accion.tipo).toBe('echar');
    if (accion.tipo === 'echar') expect(accion.cartas.some((x) => x.endsWith('-5'))).toBe(false);
  });

  it('busca el quince', () => {
    const e: EstadoCribbage = {
      ...nueva(),
      fase: 'juego',
      manos: [c('5t 8c'), c('Kd Qd')],
      guardadas: [c('5t 8c'), c('Kd Qd')],
      starter: 'picas-1',
      cuenta: 10,
      secuencia: c('10p'),
      turno: 0,
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'treboles-5' });
  });
});

describe('IA difícil del Cribbage', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    let e = nueva();
    e = cribbage.transicion(e, 0, cribbage.accionesLegales(e, 0)[0]!);
    e = cribbage.transicion(e, 1, cribbage.accionesLegales(e, 1)[0]!);
    const v = cribbage.vistaDe(e, 0);
    const acciones = cribbage.accionesLegales(e, 0);
    expect(IAS.cribbage.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.cribbage.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Cribbage', () => {
  const azar = aleatorio<VistaCribbage, AccionCribbage>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      cribbage,
      CONFIG_CRIBBAGE_POR_DEFECTO,
      iaCribbageBasica,
      IAS.cribbage.facil,
      100,
      unoContraTodos(2),
      'sim',
    );
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      cribbage,
      CONFIG_CRIBBAGE_POR_DEFECTO,
      iaCribbageBasica,
      azar,
      200,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      cribbage,
      CONFIG_CRIBBAGE_POR_DEFECTO,
      IAS.cribbage.dificil,
      iaCribbageBasica,
      2,
      unoContraTodos(2),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
