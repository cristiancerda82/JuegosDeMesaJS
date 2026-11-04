import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaPishtiBasica } from '../../src/ia/pishti-basica';
import {
  CONFIG_PISHTI_POR_DEFECTO,
  pishti,
  type AccionPishti,
  type EstadoPishti,
  type VistaPishti,
} from '../../src/juegos/pishti';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «5p» es el 5 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function preparado(parcial: Partial<EstadoPishti>): EstadoPishti {
  const r = pishti.crear(CONFIG_PISHTI_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, turno: 0, mazo: [], tapadas: [], vistasMano: [], ...parcial };
}

const decide = (e: EstadoPishti) =>
  iaPishtiBasica.decidir(
    pishti.vistaDe(e, e.turno),
    pishti.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Pishti', () => {
  it('prefiere el pishti', () => {
    const e = preparado({ manos: [c('Jp 8c'), c('2d')], monton: c('8d') });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('8c')[0] });
  });

  it('guarda la J', () => {
    const e = preparado({ manos: [c('Jp 6c'), c('2d')], monton: c('4d 9t') });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('6c')[0] });
  });
});

describe('IA difícil del Pishti', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = pishti.crear(CONFIG_PISHTI_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = pishti.vistaDe(e, e.turno);
    const acciones = pishti.accionesLegales(e, e.turno);
    expect(IAS.pishti.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.pishti.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Pishti', () => {
  const azar = aleatorio<VistaPishti, AccionPishti>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        pishti,
        { jugadores, meta: 151 },
        iaPishtiBasica,
        IAS.pishti.facil,
        50,
        porBandos,
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(50);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      pishti,
      CONFIG_PISHTI_POR_DEFECTO,
      iaPishtiBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        pishti,
        { jugadores, meta: 151 },
        IAS.pishti.dificil,
        iaPishtiBasica,
        1,
        porBandos,
        `tiempo-${jugadores}`,
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
