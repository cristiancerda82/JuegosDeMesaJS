import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaScopaBasica } from '../../src/ia/scopa-basica';
import {
  CONFIG_SCOPA_POR_DEFECTO,
  scopa,
  type AccionScopa,
  type EstadoScopa,
  type VistaScopa,
} from '../../src/juegos/scopa';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos; S, C y R. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}

function preparado(parcial: Partial<EstadoScopa>): EstadoScopa {
  const r = scopa.crear(CONFIG_SCOPA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, turno: 0, ...parcial };
}

const decide = (e: EstadoScopa) =>
  iaScopaBasica.decidir(
    scopa.vistaDe(e, e.turno),
    scopa.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica de la Scopa', () => {
  it('prefiere la scopa', () => {
    const e = preparado({ manos: [c('7c 3b'), c('2o')], mesa: c('3e 4o') });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('7c')[0], captura: c('3e 4o') });
  });

  it('se lleva el settebello', () => {
    const e = preparado({ manos: [c('7e'), c('2o')], mesa: c('7c 7o Rb') });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('7e')[0], captura: c('7o') });
  });
});

describe('IA difícil de la Scopa', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = scopa.crear(CONFIG_SCOPA_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = scopa.vistaDe(e, e.turno);
    const acciones = scopa.accionesLegales(e, e.turno);
    expect(IAS.scopa.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.scopa.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA de la Scopa', () => {
  const azar = aleatorio<VistaScopa, AccionScopa>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        scopa,
        { jugadores, meta: 11 },
        iaScopaBasica,
        IAS.scopa.facil,
        50,
        porBandos,
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(50);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(scopa, CONFIG_SCOPA_POR_DEFECTO, iaScopaBasica, azar, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        scopa,
        { jugadores, meta: 11 },
        IAS.scopa.dificil,
        iaScopaBasica,
        1,
        porBandos,
        `tiempo-${jugadores}`,
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
