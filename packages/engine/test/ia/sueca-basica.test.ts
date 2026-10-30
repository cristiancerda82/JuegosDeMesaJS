import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaSuecaBasica } from '../../src/ia/sueca-basica';
import {
  CONFIG_SUECA_POR_DEFECTO,
  sueca,
  type AccionSueca,
  type EstadoSueca,
  type VistaSueca,
} from '../../src/juegos/sueca';
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

function preparado(parcial: Partial<EstadoSueca>): EstadoSueca {
  const r = sueca.crear(CONFIG_SUECA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, cartaTriunfo: null, fallos: [[], [], [], []], ...parcial };
}

const decide = (e: EstadoSueca) =>
  iaSuecaBasica.decidir(
    sueca.vistaDe(e, e.turno),
    sueca.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica de la Sueca', () => {
  it('carga a su compañero', () => {
    // El 0 va ganando con el Rey de picas; responde su compañero, el 2.
    const e = preparado({
      triunfo: 'treboles',
      turno: 2,
      manos: [c('2d'), c('2d'), c('Ap 2p'), c('2d')],
      mesa: [
        { asiento: 0, carta: una('Kp') },
        { asiento: 1, carta: una('3p') },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ap') });
  });

  it('gana con lo justo', () => {
    const e = preparado({
      triunfo: 'picas',
      turno: 1,
      manos: [c('2d'), c('2p Ap 3d'), c('2d'), c('2d')],
      mesa: [{ asiento: 0, carta: una('Ac') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('2p') });
  });

  it('sale con un As que no es triunfo', () => {
    const e = preparado({
      triunfo: 'picas',
      turno: 0,
      manos: [c('Ap Ad 3c'), c('2d'), c('2d'), c('2d')],
      mesa: [],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ad') });
  });
});

describe('IA difícil de la Sueca', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = sueca.crear(CONFIG_SUECA_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = sueca.vistaDe(e, e.turno);
    const acciones = sueca.accionesLegales(e, e.turno);
    expect(IAS.sueca.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.sueca.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA de la Sueca', () => {
  const azar = aleatorio<VistaSueca, AccionSueca>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      sueca,
      CONFIG_SUECA_POR_DEFECTO,
      iaSuecaBasica,
      IAS.sueca.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(sueca, CONFIG_SUECA_POR_DEFECTO, iaSuecaBasica, azar, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(150);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      sueca,
      CONFIG_SUECA_POR_DEFECTO,
      IAS.sueca.dificil,
      iaSuecaBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
