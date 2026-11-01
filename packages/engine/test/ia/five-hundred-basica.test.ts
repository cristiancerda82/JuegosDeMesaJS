import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaFiveHundredBasica } from '../../src/ia/five-hundred-basica';
import { IAS } from '../../src/ia/ias';
import {
  COMODIN_FIVE_HUNDRED,
  fiveHundred,
  type AccionFiveHundred,
  type EstadoFiveHundred,
  type VistaFiveHundred,
} from '../../src/juegos/five-hundred';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t; «X» es el comodín. */
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
    if (t === 'X') return COMODIN_FIVE_HUNDRED;
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;

/** Partidas cortas para las pruebas. */
const CONFIG = { jugadores: 4, meta: 200 } as const;

function preparado(parcial: Partial<EstadoFiveHundred>): EstadoFiveHundred {
  const r = fiveHundred.crear(CONFIG, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, ...parcial };
}

const decide = (e: EstadoFiveHundred) =>
  iaFiveHundredBasica.decidir(
    fiveHundred.vistaDe(e, e.turno),
    fiveHundred.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Five Hundred', () => {
  it('sobre 6 sin triunfo, puja 7 corazones con un triunfo fuerte', () => {
    const e = preparado({
      manos: [c('X Jc Jd Ac Kc Ap At 5p 6t 7d'), [], [], []],
      mejor: { asiento: 3, puja: { tipo: 'bazas', bazas: 6, palo: 'sin' } },
    });
    expect(decide(e)).toEqual({
      tipo: 'pujar',
      puja: { tipo: 'bazas', bazas: 7, palo: 'corazones' },
    });
  });

  it('pasa con una mano floja', () => {
    const e = preparado({
      manos: [c('5p 6p 7p 9c 10c 6d 8d 9t 10t Qd'), [], [], []],
      mejor: { asiento: 3, puja: { tipo: 'bazas', bazas: 9, palo: 'sin' } },
    });
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('gana la baza con lo justo', () => {
    const e = preparado({
      fase: 'bazas',
      mejor: { asiento: 0, puja: { tipo: 'bazas', bazas: 6, palo: 'picas' } },
      turno: 1,
      manos: [c('5d'), c('Ac 5c 6d'), c('5d'), c('6t')],
      mesa: [{ asiento: 0, carta: una('Kc') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ac') });
  });

  it('en el misère, quien juega suelta la más alta que no gana', () => {
    const e = preparado({
      fase: 'bazas',
      mejor: { asiento: 1, puja: { tipo: 'misere' } },
      turno: 1,
      manos: [c('5d'), c('Qc 9c Ac'), c('5d'), c('6t')],
      mesa: [{ asiento: 0, carta: una('Kc') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Qc') });
  });
});

describe('IA difícil del Five Hundred', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = fiveHundred.crear(CONFIG, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoFiveHundred = {
      ...r.valor,
      fase: 'bazas',
      mejor: { asiento: 0, puja: { tipo: 'bazas', bazas: 6, palo: 'picas' } },
      // El 0 se ha descartado de la viuda.
      descartes: r.valor.viuda,
      viuda: [],
      turno: 0,
    };
    const v = fiveHundred.vistaDe(e, 0);
    const acciones = fiveHundred.accionesLegales(e, 0);
    expect(IAS.fiveHundred.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.fiveHundred.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Five Hundred', () => {
  const azar = aleatorio<VistaFiveHundred, AccionFiveHundred>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      fiveHundred,
      CONFIG,
      iaFiveHundredBasica,
      IAS.fiveHundred.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(fiveHundred, CONFIG, iaFiveHundredBasica, azar, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      fiveHundred,
      CONFIG,
      IAS.fiveHundred.dificil,
      iaFiveHundredBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
