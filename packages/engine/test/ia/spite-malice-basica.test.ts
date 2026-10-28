import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaSpiteMaliceBasica } from '../../src/ia/spite-malice-basica';
import {
  CONFIG_SPITE_MALICE_POR_DEFECTO,
  spiteMalice,
  type AccionSpiteMalice,
  type EstadoSpiteMalice,
  type VistaSpiteMalice,
} from '../../src/juegos/spite-malice';
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
const vacias = () => [[], [], [], []] as IdCarta[][];

function preparado(parcial: Partial<EstadoSpiteMalice>): EstadoSpiteMalice {
  const r = spiteMalice.crear(CONFIG_SPITE_MALICE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    descartes: [vacias(), vacias()],
    escaleras: vacias(),
    completas: [],
    ...parcial,
  };
}

const decide = (e: EstadoSpiteMalice) =>
  iaSpiteMaliceBasica.decidir(
    spiteMalice.vistaDe(e, e.turno),
    spiteMalice.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Spite and Malice', () => {
  it('juega su montón en cuanto puede', () => {
    const e = preparado({
      montones: [c('9c 4t'), c('8c 8d')],
      manos: [c('2p 7p 9p Jp Qp'), c('3d')],
      escaleras: [c('Ap 2p 3p'), [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', desde: { tipo: 'monton' }, escalera: 0 });
  });

  it('busca una cadena hasta la carta de su montón', () => {
    const e = preparado({
      montones: [c('9c 5t'), c('8c 8d')],
      manos: [c('3p 4p 9p Jp Qp'), c('3d')],
      escaleras: [c('Ap 2p'), [], [], []],
    });
    expect(decide(e)).toEqual({
      tipo: 'jugar',
      desde: { tipo: 'mano', carta: una('3p') },
      escalera: 0,
    });
  });

  it('no deja una escalera justo antes de la carta del rival', () => {
    // El rival tiene un 4 arriba: la IA no juega el 3 en la escalera que va por el 2.
    const e = preparado({
      montones: [c('9c Qt'), c('8c 4d')],
      manos: [c('3p 8p 9p Jp Kp'), c('3d')],
      escaleras: [c('Ap 2p'), [], [], []],
    });
    const accion = decide(e);
    expect(accion.tipo).toBe('descartar');
  });

  it('guarda los K y descarta la carta más alta sobre una de un valor más', () => {
    const e = preparado({
      montones: [c('9c Qt'), c('8c 4d')],
      manos: [c('8p 9p Jp Kp Kd'), c('3d')],
      descartes: [[c('10c'), [], [], []], vacias()],
      escaleras: [c('Ap 2p'), [], [], []],
    });
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: una('9p'), pila: 0 });
  });
});

describe('IA difícil del Spite and Malice', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = spiteMalice.crear(CONFIG_SPITE_MALICE_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = spiteMalice.vistaDe(e, 0);
    const acciones = spiteMalice.accionesLegales(e, 0);
    expect(IAS.spiteMalice.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.spiteMalice.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Spite and Malice', () => {
  const azar = aleatorio<VistaSpiteMalice, AccionSpiteMalice>();
  const dos = unoContraTodos(2);

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      spiteMalice,
      CONFIG_SPITE_MALICE_POR_DEFECTO,
      iaSpiteMaliceBasica,
      IAS.spiteMalice.facil,
      100,
      dos,
      'sim',
    );
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      spiteMalice,
      CONFIG_SPITE_MALICE_POR_DEFECTO,
      iaSpiteMaliceBasica,
      azar,
      200,
      dos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      spiteMalice,
      CONFIG_SPITE_MALICE_POR_DEFECTO,
      IAS.spiteMalice.dificil,
      iaSpiteMaliceBasica,
      1,
      dos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
