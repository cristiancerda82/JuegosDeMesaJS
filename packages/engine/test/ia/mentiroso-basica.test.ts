import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import {
  fueraDelQueBaja,
  iaMentirosoBasica,
  iaMentirosoExperta,
  PARAMETROS_MENTIROSO_BASICA,
  planMentiroso,
} from '../../src/ia/mentiroso-basica';
import {
  CONFIG_MENTIROSO_POR_DEFECTO,
  mentiroso,
  valorMentiroso,
  type AccionMentiroso,
  type EstadoMentiroso,
  type VistaMentiroso,
} from '../../src/juegos/mentiroso';
import { duelo, unoContraTodos } from './duelo';

const azarDe = aleatorio<VistaMentiroso, AccionMentiroso>();

/** Estado con estas manos, turno del asiento 0 y el valor dado. */
function con(manos: IdCarta[][], parcial: Partial<EstadoMentiroso> = {}): EstadoMentiroso {
  const r = mentiroso.crear({ jugadores: manos.length as 4 }, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, manos, ...parcial };
}

/** Lo que baja la IA en su turno: sigue sus decisiones hasta bajar. */
function bajada(e: EstadoMentiroso, ia = iaMentirosoBasica): IdCarta[] | 'desconfia' {
  for (let i = 0; i < 20; i++) {
    const { accion } = ia.decidir(
      mentiroso.vistaDe(e, e.turno),
      mentiroso.accionesLegales(e, e.turno),
      crearAzar(`x${i}`),
    );
    if (accion.tipo === 'desconfiar') return 'desconfia';
    if (accion.tipo === 'bajar') return [...e.marcadas];
    e = mentiroso.transicion(e, e.turno, accion);
  }
  throw new Error('La IA no bajó');
}

const RELLENO: IdCarta[] = ['picas-3', 'picas-4'];

describe('IA básica del Mentiroso', () => {
  const MONTON_GRANDE: EstadoMentiroso['monton'] = [
    { asiento: 2, cartas: ['picas-8', 'picas-9', 'picas-10', 'picas-11'], valor: 5 },
    {
      asiento: 3,
      cartas: ['corazones-8', 'corazones-9', 'corazones-10', 'corazones-11'],
      valor: 6,
    },
  ];
  const planBasica = (e: EstadoMentiroso) =>
    planMentiroso(
      mentiroso.vistaDe(e, 0),
      PARAMETROS_MENTIROSO_BASICA.objetivo,
      PARAMETROS_MENTIROSO_BASICA.montonMax,
    );

  it('dice la verdad cuando puede', () => {
    const mano: IdCarta[] = ['picas-7', 'corazones-7', 'picas-2', 'treboles-9'];
    const e = con([mano, RELLENO, RELLENO, RELLENO], { valor: 7, monton: MONTON_GRANDE });
    expect(planBasica(e).sort()).toEqual(['corazones-7', 'picas-7']);
  });

  it('miente con una carta', () => {
    const mano: IdCarta[] = ['picas-2', 'corazones-9', 'treboles-10'];
    const e = con([mano, RELLENO, RELLENO, RELLENO], { valor: 7, monton: MONTON_GRANDE });
    expect(planBasica(e)).toHaveLength(1);
  });

  it('rellena con falsas con el montón pequeño', () => {
    const mano: IdCarta[] = ['picas-7', 'corazones-2', 'treboles-9', 'diamantes-10', 'picas-4'];
    const b = bajada(con([mano, RELLENO, RELLENO, RELLENO], { valor: 7 })) as IdCarta[];
    expect(b).toHaveLength(3);
    expect(b).toContain('picas-7');
  });

  it('desconfía de una mentira imposible', () => {
    const e = con([['picas-13', 'corazones-13', 'picas-2'], RELLENO, RELLENO, RELLENO], {
      valor: 1,
      monton: [{ asiento: 3, cartas: ['picas-5', 'picas-6', 'picas-8'], valor: 13 }],
    });
    expect(bajada(e)).toBe('desconfia');
  });

  it('desconfía de la última bajada de un rival', () => {
    const e = con([['picas-2'], RELLENO, RELLENO, []], {
      valor: 1,
      monton: [{ asiento: 3, cartas: ['picas-13'], valor: 13 }],
    });
    const { accion } = iaMentirosoBasica.decidir(
      mentiroso.vistaDe(e, 0),
      mentiroso.accionesLegales(e, 0),
      crearAzar('y'),
    );
    expect(accion).toEqual({ tipo: 'desconfiar' });
  });
});

describe('IA experta del Mentiroso', () => {
  it('cuenta las cartas que dejó en el montón', () => {
    const e = con([['picas-2', 'corazones-12'], RELLENO, RELLENO, RELLENO], {
      valor: 1,
      monton: [
        { asiento: 0, cartas: ['picas-12', 'treboles-12'], valor: 12 },
        { asiento: 3, cartas: ['picas-5', 'picas-6'], valor: 13 },
      ],
    });
    expect(fueraDelQueBaja(mentiroso.vistaDe(e, 0), 12, 3)).toBe(3);
  });

  it('recuerda las descubiertas que se llevó otro: 2 reinas del asiento 1 y una propia', () => {
    const e = con([['corazones-12', 'picas-2'], RELLENO, RELLENO, RELLENO], {
      valor: 1,
      monton: [{ asiento: 3, cartas: ['picas-5', 'picas-6'], valor: 12 }],
      revelaciones: [
        {
          bajo: 1,
          desconfio: 2,
          cartas: ['picas-12', 'treboles-12'],
          valor: 12,
          mentia: false,
          seLleva: 2,
          cuantas: 2,
        },
      ],
    });
    expect(fueraDelQueBaja(mentiroso.vistaDe(e, 0), 12, 3)).toBe(3);
    expect(bajada(e, iaMentirosoExperta)).toBe('desconfia');
  });

  it('baja con prudencia: solo la verdad, aunque el montón sea pequeño', () => {
    const mano: IdCarta[] = ['picas-7', 'corazones-2', 'treboles-9', 'diamantes-10', 'picas-4'];
    const b = bajada(con([mano, RELLENO, RELLENO, RELLENO], { valor: 7 }), iaMentirosoExperta);
    expect(b).toEqual(['picas-7']);
    expect((b as IdCarta[]).every((c) => valorMentiroso(c) === 7)).toBe(true);
  });
});

describe('garantías de la IA del Mentiroso', () => {
  it('500 partidas entre IAs de 3 a 6 terminan sin acciones ilegales', () => {
    for (const jugadores of [3, 4, 5, 6] as const) {
      const r = duelo(
        mentiroso,
        { jugadores },
        iaMentirosoBasica,
        iaMentirosoExperta,
        110,
        unoContraTodos(jugadores),
        `entre-${jugadores}`,
      );
      expect(r.partidas).toBe(110);
    }
    const mezcla = duelo(
      mentiroso,
      { jugadores: 5 },
      iaMentirosoBasica,
      azarDe,
      60,
      (a, i) => (a + i) % 2 === 0,
      'mezcla',
    );
    expect(mezcla.partidas).toBe(60);
  });

  it('gana claramente más de lo que le toca contra el azar', () => {
    const r = duelo(
      mentiroso,
      CONFIG_MENTIROSO_POR_DEFECTO,
      iaMentirosoBasica,
      azarDe,
      500,
      unoContraTodos(4),
      'contra-azar',
    );
    expect(r.ganadas).toBeGreaterThan(250);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = con([['picas-7', 'picas-2'], RELLENO, RELLENO, RELLENO], {
      valor: 2,
      monton: [{ asiento: 3, cartas: ['picas-5'], valor: 1 }],
    });
    for (const ia of [iaMentirosoBasica, iaMentirosoExperta]) {
      const v = mentiroso.vistaDe(e, 0);
      const acciones = mentiroso.accionesLegales(e, 0);
      const a = ia.decidir(v, acciones, crearAzar('s'));
      const b = ia.decidir(
        JSON.parse(JSON.stringify(v)) as VistaMentiroso,
        [...acciones],
        crearAzar('s'),
      );
      expect(b).toEqual(a);
    }
  });
});
