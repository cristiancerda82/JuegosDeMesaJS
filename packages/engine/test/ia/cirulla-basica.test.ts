import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCirullaBasica } from '../../src/ia/cirulla-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_CIRULLA_POR_DEFECTO,
  cirulla,
  type AccionCirulla,
  type EstadoCirulla,
  type VistaCirulla,
} from '../../src/juegos/cirulla';
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

function preparado(parcial: Partial<EstadoCirulla>): EstadoCirulla {
  const r = cirulla.crear(CONFIG_CIRULLA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, turno: 0, acusadas: [[], []], acuses: [], ...parcial };
}

const decide = (e: EstadoCirulla) =>
  iaCirullaBasica.decidir(
    cirulla.vistaDe(e, e.turno),
    cirulla.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica de la Cirulla', () => {
  it('prefiere la escoba', () => {
    const e = preparado({ manos: [c('7c 3b'), c('2o')], mesa: c('3e 4o') });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'copas-7', captura: c('3e 4o') });
  });

  it('se lleva la grande', () => {
    const e = preparado({ manos: [c('Rc'), c('2o')], mesa: c('Ro Rb 6e 5b') });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'copas-12', captura: c('Ro') });
  });

  it('barre la mesa con el As', () => {
    const e = preparado({ manos: [c('Ae 4c'), c('2o')], mesa: c('Ro 3b') });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'espadas-1', captura: c('Ro 3b') });
  });
});

describe('garantías de la IA de la Cirulla', () => {
  const azar = aleatorio<VistaCirulla, AccionCirulla>();

  it('partidas entre IAs terminan sin acciones ilegales y rápidas, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        cirulla,
        { jugadores, meta: 21 },
        iaCirullaBasica,
        IAS.cirulla.facil,
        30,
        porBandos,
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(30);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      cirulla,
      { jugadores: 2, meta: 21 },
      iaCirullaBasica,
      azar,
      100,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(65);
  });

  it('la difícil decide en menos de 500 ms, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        cirulla,
        { jugadores, meta: 21 },
        IAS.cirulla.dificil,
        iaCirullaBasica,
        1,
        porBandos,
        `tiempo-${jugadores}`,
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
