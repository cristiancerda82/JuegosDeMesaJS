import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaWhistBasica } from '../../src/ia/whist-basica';
import {
  CONFIG_WHIST_POR_DEFECTO,
  whist,
  type AccionWhist,
  type EstadoWhist,
  type VistaWhist,
} from '../../src/juegos/whist';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
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

/** Le toca al asiento 2 (compañero del 0) con esta mano, triunfo picas, y estas cartas en la mesa. */
function situacion(mano: string, mesa: [number, string][]): EstadoWhist {
  const r = whist.crear(CONFIG_WHIST_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const propia = c(mano);
  const enMesa = mesa.map(([, t]) => c(t)[0]!);
  const resto = r.valor.manos.flat().filter((x) => !propia.includes(x) && !enMesa.includes(x));
  const turno = mesa.length === 0 ? 2 : (mesa.at(-1)![0] + 1) % 4;
  const manos = [0, 1, 2, 3].map((a) => (a === turno ? propia : resto.splice(0, propia.length)));
  return {
    ...r.valor,
    manos,
    triunfo: 'picas',
    cartaTriunfo: null,
    turno,
    mesa: mesa.map(([asiento, t]) => ({ asiento, carta: c(t)[0]! })),
  };
}

function decide(e: EstadoWhist, ia = iaWhistBasica): IdCarta {
  return ia.decidir(whist.vistaDe(e, e.turno), whist.accionesLegales(e, e.turno), crearAzar('x'))
    .accion.carta;
}

describe('IA básica del Whist', () => {
  it('gana con la carta justa', () => {
    expect(decide(situacion('10c Jc Kc 2d', [[1, '9c']]))).toBe(c('10c')[0]);
  });

  it('no le quita la baza al compañero', () => {
    // El 0 (compañero del 2) gana con el As de diamantes.
    expect(
      decide(
        situacion('3d Kd 5t', [
          [0, 'Ad'],
          [1, '2d'],
        ]),
      ),
    ).toBe(c('3d')[0]);
  });

  it('falla con el triunfo más bajo cuando gana el rival', () => {
    expect(
      decide(
        situacion('3p Qp 5t', [
          [0, '2c'],
          [1, 'Kc'],
        ]),
      ),
    ).toBe(c('3p')[0]);
  });

  it('sale con un As que no es triunfo', () => {
    expect(decide(situacion('Ad 2d 3c 4c 5c', []))).toBe(c('Ad')[0]);
  });

  it('sale de su palo más largo: alta con la siguiente, si no la más baja', () => {
    expect(decide(situacion('Kc Qc 5c 2d', []))).toBe(c('Kc')[0]);
    expect(decide(situacion('Kc 9c 5c 2d', []))).toBe(c('5c')[0]);
  });
});

describe('IA difícil del Whist', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = situacion('10c Jc Kc 2d', [[1, '9c']]);
    const v = whist.vistaDe(e, e.turno);
    const acciones = whist.accionesLegales(e, e.turno);
    expect(IAS.whist.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.whist.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Whist', () => {
  const azar = aleatorio<VistaWhist, AccionWhist>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      whist,
      CONFIG_WHIST_POR_DEFECTO,
      iaWhistBasica,
      IAS.whist.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(whist, CONFIG_WHIST_POR_DEFECTO, iaWhistBasica, azar, 100, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(70);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      whist,
      CONFIG_WHIST_POR_DEFECTO,
      IAS.whist.dificil,
      iaWhistBasica,
      2,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
