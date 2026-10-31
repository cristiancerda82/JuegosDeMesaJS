import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaJassBasica, valorModoJass } from '../../src/ia/jass-basica';
import { jass, type AccionJass, type EstadoJass, type VistaJass } from '../../src/juegos/jass';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
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
const una = (t: string) => c(t)[0]!;

/** Partidas cortas para las pruebas. */
const CONFIG = { jugadores: 4, meta: 300 } as const;

function preparado(parcial: Partial<EstadoJass>): EstadoJass {
  const r = jass.crear(CONFIG, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, ...parcial };
}

const decide = (e: EstadoJass) =>
  iaJassBasica.decidir(jass.vistaDe(e, e.turno), jass.accionesLegales(e, e.turno), crearAzar('x'))
    .accion;

describe('IA básica del Jass', () => {
  it('elige el triunfo con una mano fuerte', () => {
    const mano = c('Jc 9c Ac Kc Ap 6d 7t 8t 10d');
    expect(valorModoJass(mano, 'corazones')).toBeGreaterThanOrEqual(18);
    const e = preparado({ manos: [mano, [], [], []], manosIniciales: [mano, [], [], []] });
    expect(decide(e)).toEqual({ tipo: 'elegir', modo: 'corazones' });
  });

  it('pasa con una mano floja', () => {
    const mano = c('7c 8c Qc 7p 8p Kd Qd 10t Kt');
    const e = preparado({ manos: [mano, [], [], []], manosIniciales: [mano, [], [], []] });
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('elige si le pasan, aunque la mano sea floja', () => {
    const mano = c('7c 8c Qc 7p 8p Kd Qd 10t Kt');
    const e = preparado({
      manos: [[], [], mano, []],
      manosIniciales: [[], [], mano, []],
      pasado: true,
      turno: 2,
    });
    expect(decide(e).tipo).toBe('elegir');
  });

  it('carga a su compañero', () => {
    // Obenabe: el 0 va ganando con el As de picas; responde su compañero, el 2.
    const e = preparado({
      fase: 'bazas',
      modo: 'obenabe',
      turno: 2,
      manos: [c('6d'), c('6d'), c('10p 6p'), c('6d')],
      mesa: [
        { asiento: 0, carta: una('Ap') },
        { asiento: 1, carta: una('7p') },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('10p') });
  });

  it('gana con lo justo', () => {
    const e = preparado({
      fase: 'bazas',
      modo: 'picas',
      turno: 1,
      manos: [c('6d'), c('6p Jp 7d'), c('6d'), c('6d')],
      mesa: [{ asiento: 0, carta: una('Ac') }],
    });
    // Sin corazones: el 6 de picas gana; la Jota también, pero vale más.
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('6p') });
  });

  it('sale con la carta más alta que queda de un palo que no es triunfo', () => {
    const e = preparado({
      fase: 'bazas',
      modo: 'picas',
      turno: 0,
      manos: [c('Jp Ad 7c'), c('6d'), c('6d'), c('6d')],
      mesa: [],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ad') });
  });
});

describe('IA difícil del Jass', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = jass.crear(CONFIG, 'dificil');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    e = jass.transicion(e, e.turno, { tipo: 'elegir', modo: 'corazones' });
    const v = jass.vistaDe(e, e.turno);
    const acciones = jass.accionesLegales(e, e.turno);
    expect(IAS.jass.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.jass.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Jass', () => {
  const azar = aleatorio<VistaJass, AccionJass>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(jass, CONFIG, iaJassBasica, IAS.jass.facil, 100, porBandos, 'sim');
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(jass, CONFIG, iaJassBasica, azar, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(jass, CONFIG, IAS.jass.dificil, iaJassBasica, 1, porBandos, 'tiempo');
    expect(r.maxMs).toBeLessThan(500);
  });
});
