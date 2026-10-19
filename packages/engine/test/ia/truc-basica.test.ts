import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaTrucBasica } from '../../src/ia/truc-basica';
import {
  actorTruc,
  CONFIG_TRUC_POR_DEFECTO,
  truc,
  type AccionTruc,
  type EstadoTruc,
  type VistaTruc,
} from '../../src/juegos/truc';
import { aplicar } from '../../src/motor/aplicar';
import { duelo, porBandos } from './duelo';

const azarDe = aleatorio<VistaTruc, AccionTruc>();

/** Estado de 2 jugadores con las manos dadas: es mano el 0. */
function mesa(manos: IdCarta[][]): EstadoTruc {
  const r = truc.crear({ ...CONFIG_TRUC_POR_DEFECTO, jugadores: manos.length as 2 | 4 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, manos };
}

function hacer(e: EstadoTruc, accion: AccionTruc): EstadoTruc {
  const r = aplicar(truc, e, actorTruc(e), accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoTruc, semilla = 'x') => {
  const a = actorTruc(e);
  return iaTrucBasica.decidir(truc.vistaDe(e, a), truc.accionesLegales(e, a), crearAzar(semilla))
    .accion;
};

describe('IA básica del Truc', () => {
  it('envida con mucho envit', () => {
    const e = mesa([
      ['oros-7', 'oros-6', 'copas-4'],
      ['copas-5', 'espadas-6', 'bastos-4'],
    ]);
    expect(decide(e)).toEqual({ tipo: 'envidar' });
  });

  it('no quiere un truc con 4, 5 y 6 sin bazas ganadas', () => {
    let e = mesa([
      ['espadas-1', 'bastos-1', 'oros-7'],
      ['copas-4', 'oros-5', 'espadas-6'],
    ]);
    e = hacer(e, { tipo: 'trucar' });
    expect(decide(e)).toEqual({ tipo: 'noVull' });
  });

  it('quiere un truc con cartas altas', () => {
    let e = mesa([
      ['copas-4', 'oros-5', 'espadas-6'],
      ['espadas-1', 'bastos-1', 'oros-12'],
    ]);
    e = hacer(e, { tipo: 'trucar' });
    expect(['vull', 'trucar']).toContain(decide(e).tipo);
  });

  it('quiere el envit con muchos puntos y no con pocos', () => {
    const conPuntos = hacer(
      mesa([
        ['copas-4', 'oros-5', 'espadas-6'],
        ['bastos-7', 'bastos-1', 'oros-12'],
      ]),
      { tipo: 'envidar' },
    );
    expect(decide(conPuntos).tipo).toBe('vull');
    const sinPuntos = hacer(
      mesa([
        ['copas-4', 'oros-5', 'espadas-6'],
        ['bastos-2', 'copas-1', 'oros-12'],
      ]),
      { tipo: 'envidar' },
    );
    expect(decide(sinPuntos).tipo).toBe('noVull');
  });

  it('responde con la carta más baja que gana, o la más baja si no gana', () => {
    let e = mesa([
      ['copas-4', 'copas-5', 'copas-6'],
      ['espadas-1', 'oros-3', 'bastos-4'],
    ]);
    // Sin envit posible y con el truc ya querido por el rival: solo queda jugar carta.
    e = {
      ...e,
      envit: { ...e.envit, estado: 'noQuerido' },
      truc: { nivel: 1, pendiente: 0, quien: 1, responde: null, puedeSubir: 0 },
    };
    e = hacer(e, { tipo: 'jugar', carta: 'copas-6' });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'oros-3' });
  });

  it('a veces farolea, de forma reproducible', () => {
    const e = mesa([
      ['copas-4', 'oros-5', 'espadas-6'],
      ['bastos-2', 'copas-1', 'oros-12'],
    ]);
    const decisiones = Array.from({ length: 200 }, (_, i) => decide(e, `farol-${i}`).tipo);
    const faroles = decisiones.filter((t) => t === 'trucar').length;
    expect(faroles).toBeGreaterThan(5);
    expect(faroles).toBeLessThan(50);
    expect(decide(e, 'farol-1')).toEqual(decide(e, 'farol-1'));
  });
});

describe('garantías de la IA del Truc', () => {
  it('500 partidas entre IAs, de 2 y de 4, terminan sin acciones ilegales', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        truc,
        { jugadores, cames: 1 },
        iaTrucBasica,
        iaTrucBasica,
        200,
        porBandos,
        `entre-${jugadores}`,
      );
      expect(r.partidas).toBe(200);
    }
    const mezcla = duelo(
      truc,
      { jugadores: 4, cames: 1 },
      iaTrucBasica,
      azarDe,
      100,
      (a, i) => (a + i) % 3 !== 0,
      'mezcla',
    );
    expect(mezcla.partidas).toBe(100);
  });

  it('gana claramente al azar', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        truc,
        { ...CONFIG_TRUC_POR_DEFECTO, jugadores },
        iaTrucBasica,
        azarDe,
        250,
        porBandos,
        `azar-${jugadores}`,
      );
      expect(r.ganadas, `${jugadores} jugadores`).toBeGreaterThan(190);
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
