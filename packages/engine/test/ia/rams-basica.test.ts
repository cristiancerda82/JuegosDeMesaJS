import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaRamsBasica } from '../../src/ia/rams-basica';
import {
  CONFIG_RAMS_POR_DEFECTO,
  rams,
  type AccionRams,
  type EstadoRams,
  type VistaRams,
} from '../../src/juegos/rams';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «13c» es el Rey de corazones; p, c, d y t, picas, corazones… */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}

function base(parcial: Partial<EstadoRams>): EstadoRams {
  const r = rams.crear(CONFIG_RAMS_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, triunfo: 'picas', pinte: 'picas-9', ...parcial };
}

const decide = (e: EstadoRams) =>
  iaRamsBasica.decidir(rams.vistaDe(e, e.turno), rams.accionesLegales(e, e.turno), crearAzar('x'))
    .accion;

describe('IA básica del Rams', () => {
  it('juega con un As y el Rey de triunfo', () => {
    const e = base({ manos: [c('1t 13p 7c 8d 9d'), c(''), c(''), c('')], turno: 0 });
    expect(decide(e)).toEqual({ tipo: 'rams' });
  });

  it('pasa sin bazas, con la niña ya cogida', () => {
    const e = base({ manos: [c('7t 8c 7c 8d 9d'), c(''), c(''), c('')], ninaDe: 1, turno: 0 });
    expect(decide(e)).toEqual({ tipo: 'paso' });
  });

  it('coge la niña con una mano sin bazas', () => {
    const e = base({ manos: [c('7t 8c 7c 8d 9d'), c(''), c(''), c('')], turno: 0 });
    expect(decide(e)).toEqual({ tipo: 'nina' });
  });

  it('al repartir, descarta la más baja que no es triunfo', () => {
    const e = base({
      fase: 'descartar',
      manos: [c(''), c(''), c(''), c('1t 7p 9c 8d 13d')],
      dichos: ['rams', 'paso', 'paso', 'rams'],
      turno: 3,
    });
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: 'diamantes-8' });
  });

  it('siendo el último, gana con la carta más barata', () => {
    const e = base({
      fase: 'jugar',
      manos: [c(''), c(''), c('1c 12c 7d'), c('')],
      dichos: ['rams', 'rams', 'rams', 'paso'],
      mesa: [
        { asiento: 0, carta: 'corazones-10' },
        { asiento: 1, carta: 'corazones-11' },
      ],
      turno: 2,
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'corazones-12' });
  });
});

describe('IA del Rams en partidas', () => {
  const azar = aleatorio<VistaRams, AccionRams>();

  it('partidas entre IAs terminan sin acciones ilegales y rápidas, con 3 y con 6', () => {
    for (const jugadores of [3, 6] as const) {
      const r = duelo(
        rams,
        { jugadores },
        iaRamsBasica,
        IAS.rams.facil,
        20,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(20);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana más partidas de las que le tocarían contra el azar', () => {
    const r = duelo(rams, { jugadores: 4 }, iaRamsBasica, azar, 100, unoContraTodos(4), 'azar');
    expect(r.ganadas).toBeGreaterThan(40);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      rams,
      { jugadores: 4 },
      IAS.rams.dificil,
      iaRamsBasica,
      1,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
