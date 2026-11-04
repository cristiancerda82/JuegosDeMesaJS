import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCuarentaBasica } from '../../src/ia/cuarenta-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_CUARENTA_POR_DEFECTO,
  cuarenta,
  type AccionCuarenta,
  type EstadoCuarenta,
  type VistaCuarenta,
} from '../../src/juegos/cuarenta';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «5p» es el 5 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function preparado(parcial: Partial<EstadoCuarenta>): EstadoCuarenta {
  const r = cuarenta.crear(CONFIG_CUARENTA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    turno: 0,
    mazo: [],
    caible: null,
    rondas: [],
    jugadasReparto: [[], []],
    ...parcial,
  };
}

const decide = (e: EstadoCuarenta) =>
  iaCuarentaBasica.decidir(
    cuarenta.vistaDe(e, e.turno),
    cuarenta.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Cuarenta', () => {
  it('prefiere la caída', () => {
    const e = preparado({
      manos: [c('4p Kc'), c('2d')],
      mesa: c('4d Kd'),
      caible: c('4d')[0]!,
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('4p')[0], captura: c('4d') });
  });

  it('suelta la carta más segura', () => {
    // Del 3 ya han salido los otros tres; del 6, ninguno.
    const e = preparado({
      manos: [c('3p 6c'), c('2d')],
      mesa: [],
      jugadasReparto: [[], c('3c 3d 3t')],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('3p')[0], captura: [] });
  });
});

describe('IA difícil del Cuarenta', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = cuarenta.crear(CONFIG_CUARENTA_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = cuarenta.vistaDe(e, e.turno);
    const acciones = cuarenta.accionesLegales(e, e.turno);
    expect(IAS.cuarenta.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.cuarenta.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Cuarenta', () => {
  const azar = aleatorio<VistaCuarenta, AccionCuarenta>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        cuarenta,
        { jugadores, meta: 40 },
        iaCuarentaBasica,
        IAS.cuarenta.facil,
        50,
        porBandos,
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(50);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      cuarenta,
      CONFIG_CUARENTA_POR_DEFECTO,
      iaCuarentaBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms, con 2 y con 4', () => {
    for (const jugadores of [2, 4] as const) {
      const r = duelo(
        cuarenta,
        { jugadores, meta: 40 },
        IAS.cuarenta.dificil,
        iaCuarentaBasica,
        1,
        porBandos,
        `tiempo-${jugadores}`,
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
