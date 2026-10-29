import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { cadenaKings, iaKingsCornerBasica } from '../../src/ia/kings-corner-basica';
import {
  CONFIG_KINGS_CORNER_POR_DEFECTO,
  kingsCorner,
  type AccionKingsCorner,
  type EstadoKingsCorner,
  type VistaKingsCorner,
} from '../../src/juegos/kings-corner';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «Ap» es el As de picas; c, d y t, corazones, diamantes y tréboles. */
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

function preparado(parcial: Partial<EstadoKingsCorner>): EstadoKingsCorner {
  const r = kingsCorner.crear(CONFIG_KINGS_CORNER_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    turno: 0,
    pasesSeguidos: 0,
    ganador: null,
    ultimaAccion: null,
    ...parcial,
  };
}

const decide = (e: EstadoKingsCorner) =>
  iaKingsCornerBasica.decidir(
    kingsCorner.vistaDe(e, e.turno),
    kingsCorner.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica de Kings in the Corner', () => {
  it('mueve una pila para abrir hueco', () => {
    const e = preparado({
      manos: [c('Kd 3p'), c('2p')],
      pilas: [c('8d'), c('10t'), c('9c'), c('2d'), [], [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'mover', desde: 2, a: 1 });
  });

  it('pone el K en la esquina', () => {
    const e = preparado({
      manos: [c('Kd 3p'), c('2p')],
      pilas: [c('8p'), c('10t'), c('6c'), c('2d'), [], [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kd'), pila: 4 });
  });

  it('juega primero la carta más alta', () => {
    const e = preparado({
      manos: [c('7c 5c'), c('2p')],
      pilas: [c('8p'), c('6t'), c('Jc'), c('2d'), [], [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('7c'), pila: 0 });
  });

  it('llena el hueco con la carta que más encadena y, si no puede hacer nada, pasa', () => {
    expect(cadenaKings(una('9c'), c('9c 8p 7d 3p'))).toBe(2);
    const e = preparado({
      manos: [c('3p 9c 8p 7d'), c('2p')],
      pilas: [[], c('Kt'), c('Jc'), c('2d'), [], [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('9c'), pila: 0 });
    const sinNada = preparado({
      manos: [c('3p'), c('2p')],
      pilas: [c('Kt'), c('Jc'), c('8c'), c('2d'), [], [], [], []],
    });
    expect(decide(sinNada)).toEqual({ tipo: 'pasar' });
  });
});

describe('IA difícil de Kings in the Corner', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = kingsCorner.crear(CONFIG_KINGS_CORNER_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = kingsCorner.vistaDe(e, 0);
    const acciones = kingsCorner.accionesLegales(e, 0);
    expect(IAS.kingsCorner.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.kingsCorner.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA de Kings in the Corner', () => {
  const azar = aleatorio<VistaKingsCorner, AccionKingsCorner>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      kingsCorner,
      { jugadores: 4 },
      iaKingsCornerBasica,
      IAS.kingsCorner.facil,
      100,
      unoContraTodos(4),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      kingsCorner,
      CONFIG_KINGS_CORNER_POR_DEFECTO,
      iaKingsCornerBasica,
      azar,
      200,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    for (const jugadores of [2, 4]) {
      const r = duelo(
        kingsCorner,
        { jugadores },
        IAS.kingsCorner.dificil,
        iaKingsCornerBasica,
        1,
        unoContraTodos(jugadores),
        'tiempo',
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
