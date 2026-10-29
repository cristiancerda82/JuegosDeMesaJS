import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { conocimientoPesca, iaPescaBasica } from '../../src/ia/pesca-basica';
import {
  CONFIG_PESCA_POR_DEFECTO,
  pesca,
  type AccionPesca,
  type EstadoPesca,
  type VistaPesca,
} from '../../src/juegos/pesca';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «Ap» es el As de picas; c, d y t, corazones, diamantes y tréboles. */
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

function preparado(parcial: Partial<EstadoPesca>): EstadoPesca {
  const r = pesca.crear({ jugadores: 3 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, cuartetos: [[], [], []], turno: 0, registro: [], ...parcial };
}

const decide = (e: EstadoPesca) =>
  iaPescaBasica.decidir(
    pesca.vistaDe(e, e.turno),
    pesca.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('conocimiento del registro', () => {
  it('quien pide un valor lo tiene; quien no lo da, no; al robar, se olvida', () => {
    const s = conocimientoPesca({
      cartasEnMano: [3, 3, 3],
      registro: [
        { tipo: 'pedir', asiento: 1, a: 2, valor: 13, dadas: [], pesco: 'nada', cuarteto: null },
        { tipo: 'pedir', asiento: 2, a: 0, valor: 5, dadas: c('5p'), pesco: null, cuarteto: null },
      ],
    });
    expect(s[1]!.tiene.has(13)).toBe(true);
    expect(s[2]!.noTiene.has(13)).toBe(true);
    expect(s[2]!.cartas).toEqual(c('5p'));
    expect(s[0]!.noTiene.has(5)).toBe(true);
  });
});

describe('IA básica de la Pesca', () => {
  it('pide a quien sabe que tiene el valor', () => {
    const e = preparado({
      manos: [c('Kp 5c 5d'), c('Kc 2p 3p 4p'), c('Kd 9p 9c 8d 7d')],
      registro: [
        { tipo: 'pedir', asiento: 1, a: 2, valor: 13, dadas: [], pesco: 'nada', cuarteto: null },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'pedir', a: 1, valor: 13 });
  });

  it('sin saber nada, el valor del que más tiene al rival con más cartas', () => {
    const e = preparado({ manos: [c('5c 5d 9p'), c('2p 3p'), c('4c 6c 7c')] });
    expect(decide(e)).toEqual({ tipo: 'pedir', a: 2, valor: 5 });
  });

  it('no pide a quien sabe que no lo tiene', () => {
    const e = preparado({
      manos: [c('5c 5d 9p'), c('2p 3p'), c('4c 6c 7c')],
      registro: [
        { tipo: 'pedir', asiento: 1, a: 2, valor: 5, dadas: [], pesco: 'nada', cuarteto: null },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'pedir', a: 1, valor: 5 });
  });
});

describe('IA difícil de la Pesca', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = pesca.crear(CONFIG_PESCA_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = pesca.vistaDe(e, e.turno);
    const acciones = pesca.accionesLegales(e, e.turno);
    expect(IAS.pesca.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.pesca.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA de la Pesca', () => {
  const azar = aleatorio<VistaPesca, AccionPesca>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      pesca,
      CONFIG_PESCA_POR_DEFECTO,
      iaPescaBasica,
      IAS.pesca.facil,
      100,
      unoContraTodos(4),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    // A cuatro: a dos, la Pesca depende casi solo de la suerte.
    const r = duelo(
      pesca,
      CONFIG_PESCA_POR_DEFECTO,
      iaPescaBasica,
      azar,
      200,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(120);
  });

  it('la difícil decide en menos de 500 ms', () => {
    for (const jugadores of [2, 6]) {
      const r = duelo(
        pesca,
        { jugadores },
        IAS.pesca.dificil,
        iaPescaBasica,
        1,
        unoContraTodos(jugadores),
        'tiempo',
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
