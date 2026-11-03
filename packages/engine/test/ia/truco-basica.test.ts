import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTrucoBasica } from '../../src/ia/truco-basica';
import {
  actorTruco,
  CONFIG_TRUCO_POR_DEFECTO,
  truco,
  type AccionTruco,
  type EstadoTruco,
  type VistaTruco,
} from '../../src/juegos/truco';
import { aplicar } from '../../src/motor/aplicar';
import { duelo, porBandos } from './duelo';

const azarDe = aleatorio<VistaTruco, AccionTruco>();

/** Estado de 2 jugadores con las manos dadas: es mano el 0. */
function mesa(manos: IdCarta[][]): EstadoTruco {
  const r = truco.crear({ ...CONFIG_TRUCO_POR_DEFECTO, jugadores: manos.length as 2 | 4 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, manos };
}

function hacer(e: EstadoTruco, accion: AccionTruco): EstadoTruco {
  const r = aplicar(truco, e, actorTruco(e), accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoTruco, semilla = 'x') => {
  const a = actorTruco(e);
  return iaTrucoBasica.decidir(truco.vistaDe(e, a), truco.accionesLegales(e, a), crearAzar(semilla))
    .accion;
};

describe('IA básica del Truco', () => {
  it('canta envido con 33 puntos', () => {
    const e = mesa([
      ['oros-7', 'oros-6', 'copas-4'],
      ['copas-5', 'espadas-6', 'bastos-4'],
    ]);
    expect(decide(e)).toEqual({ tipo: 'envido' });
  });

  it('no quiere un truco con 4, 5 y 6 sin bazas ganadas', () => {
    let e = mesa([
      ['espadas-1', 'bastos-1', 'oros-7'],
      ['copas-4', 'oros-5', 'espadas-6'],
    ]);
    e = hacer(e, { tipo: 'truco' });
    expect(decide(e)).toEqual({ tipo: 'noQuiero' });
  });

  it('quiere un truco con cartas altas', () => {
    let e = mesa([
      ['copas-4', 'oros-5', 'espadas-6'],
      ['espadas-1', 'bastos-1', 'oros-12'],
    ]);
    e = hacer(e, { tipo: 'truco' });
    expect(['quiero', 'truco']).toContain(decide(e).tipo);
  });

  it('sube a real envido con 31 o más y no quiere con pocos puntos', () => {
    const conPuntos = hacer(
      mesa([
        ['copas-4', 'oros-5', 'espadas-6'],
        ['bastos-7', 'bastos-4', 'oros-12'],
      ]),
      { tipo: 'envido' },
    );
    expect(decide(conPuntos).tipo).toBe('realEnvido');
    const sinPuntos = hacer(
      mesa([
        ['copas-4', 'oros-5', 'espadas-6'],
        ['bastos-2', 'copas-1', 'oros-12'],
      ]),
      { tipo: 'envido' },
    );
    expect(decide(sinPuntos).tipo).toBe('noQuiero');
  });

  it('responde con la carta más baja que gana', () => {
    let e = mesa([
      ['copas-4', 'copas-5', 'copas-6'],
      ['espadas-1', 'oros-3', 'bastos-4'],
    ]);
    e = {
      ...e,
      envido: { ...e.envido, estado: 'noQuerido' },
      truco: { nivel: 1, pendiente: 0, quien: 1, responde: null, puedeSubir: 0 },
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
    const faroles = decisiones.filter((t) => t === 'truco').length;
    expect(faroles).toBeGreaterThan(5);
    expect(faroles).toBeLessThan(50);
    expect(decide(e, 'farol-1')).toEqual(decide(e, 'farol-1'));
  });
});

describe('IA difícil del Truco', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = mesa([
      ['copas-4', 'oros-5', 'espadas-6'],
      ['bastos-2', 'copas-1', 'oros-12'],
    ]);
    const v = truco.vistaDe(e, 0);
    const acciones = truco.accionesLegales(e, 0);
    expect(IAS.truco.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.truco.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Truco', () => {
  it('partidas entre IAs, de 2 y de 4, terminan sin acciones ilegales', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        truco,
        { jugadores, meta: 15 },
        iaTrucoBasica,
        IAS.truco.facil,
        100,
        porBandos,
        `entre-${jugadores}`,
      );
      expect(r.partidas).toBe(100);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(truco, CONFIG_TRUCO_POR_DEFECTO, iaTrucoBasica, azarDe, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(150);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      truco,
      { ...CONFIG_TRUCO_POR_DEFECTO, jugadores: 4 },
      IAS.truco.dificil,
      iaTrucoBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
