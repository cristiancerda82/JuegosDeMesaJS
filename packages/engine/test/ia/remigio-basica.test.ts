import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { aleatorio } from '../../src/ia/agente';
import { iaRemigioBasica } from '../../src/ia/remigio-basica';
import {
  CONFIG_REMIGIO_POR_DEFECTO,
  remigio,
  type AccionRemigio,
  type EstadoRemigio,
  type VistaRemigio,
} from '../../src/juegos/remigio';
import type { CartaRemigio } from '../../src/juegos/remigio-combinaciones';
import { duelo, unoContraTodos } from './duelo';

const azarDe = aleatorio<VistaRemigio, AccionRemigio>();

function estado(mano: CartaRemigio[], parcial: Partial<EstadoRemigio> = {}): EstadoRemigio {
  const r = remigio.crear(CONFIG_REMIGIO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, manos: [mano, r.valor.manos[1]!], turno: 0, ...parcial };
}

const decide = (e: EstadoRemigio) =>
  iaRemigioBasica.decidir(remigio.vistaDe(e, 0), remigio.accionesLegales(e, 0), crearAzar('x'))
    .accion;

describe('IA básica del Remigio', () => {
  it('roba del montón si su carta forma una escalera con la mano', () => {
    const e = estado(
      [
        'copas-4#0',
        'copas-5#0',
        'oros-1#0',
        'espadas-12#0',
        'bastos-3#0',
        'oros-7#1',
        'espadas-2#0',
      ],
      { monton: ['copas-6#1'] },
    );
    expect(decide(e)).toEqual({ tipo: 'robarMonton' });
  });

  it('roba del mazo si la del montón no le sirve', () => {
    const e = estado(['copas-4#0', 'copas-5#0', 'oros-1#0'], { monton: ['bastos-12#1'] });
    expect(decide(e)).toEqual({ tipo: 'robarMazo' });
  });

  it('no descarta comodines', () => {
    const e = estado(['comodin-1#0', 'oros-1#0', 'espadas-12#0', 'copas-7#1'], { fase: 'bajar' });
    const a = decide(e);
    expect(a.tipo).toBe('descartar');
    if (a.tipo === 'descartar') expect(a.carta).not.toBe('comodin-1#0');
  });

  it('baja cuando puede cerrar', () => {
    const e = estado(['oros-1#0', 'oros-2#0', 'oros-3#0', 'copas-7#0'], { fase: 'bajar' });
    expect(decide(e).tipo).toBe('bajar');
  });
});

describe('garantías de la IA del Remigio', () => {
  it('200 partidas entre IAs de 2 a 5 terminan sin acciones ilegales', () => {
    for (const jugadores of [2, 3, 4, 5] as const) {
      const r = duelo(
        remigio,
        { jugadores },
        iaRemigioBasica,
        iaRemigioBasica,
        50,
        unoContraTodos(jugadores),
        `entre-${jugadores}`,
      );
      expect(r.partidas).toBe(50);
    }
  });

  it('gana claramente más de lo que le toca contra el azar', () => {
    const r = duelo(
      remigio,
      { jugadores: 3 },
      iaRemigioBasica,
      azarDe,
      200,
      unoContraTodos(3),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(120);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = estado(['oros-1#0', 'oros-2#0', 'oros-3#0', 'copas-7#0'], { fase: 'bajar' });
    const v = remigio.vistaDe(e, 0);
    const acciones = remigio.accionesLegales(e, 0);
    const a = iaRemigioBasica.decidir(v, acciones, crearAzar('s'));
    const b = iaRemigioBasica.decidir(
      JSON.parse(JSON.stringify(v)) as VistaRemigio,
      [...acciones],
      crearAzar('s'),
    );
    expect(b).toEqual(a);
  });
});
