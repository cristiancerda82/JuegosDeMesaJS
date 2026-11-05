import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaSheepsheadBasica } from '../../src/ia/sheepshead-basica';
import {
  CONFIG_SHEEPSHEAD_POR_DEFECTO,
  sheepshead,
  type AccionSheepshead,
  type ConfigSheepshead,
  type EstadoSheepshead,
  type VistaSheepshead,
} from '../../src/juegos/sheepshead';
import { duelo, unoContraTodos } from './duelo';

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

function base(): EstadoSheepshead {
  const r = sheepshead.crear(CONFIG_SHEEPSHEAD_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoSheepshead) =>
  iaSheepsheadBasica.decidir(
    sheepshead.vistaDe(e, e.turno),
    sheepshead.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const conMano = (e: EstadoSheepshead, mano: string): EstadoSheepshead => ({
  ...e,
  manos: e.manos.map((m, a) => (a === e.turno ? c(mano) : m)),
});

describe('IA básica del Sheepshead', () => {
  it('coge con la Q de tréboles, la Q de picas y la J de corazones', () => {
    expect(decide(conMano(base(), 'Qt Qp Jc 7c 8t 9p'))).toEqual({ tipo: 'coger' });
  });

  it('pasa con un solo triunfo', () => {
    expect(decide(conMano(base(), 'Qt 7c 8t 9p Ac 10t'))).toEqual({ tipo: 'pasar' });
  });

  it('entierra el As de picas si es su única pica', () => {
    const e: EstadoSheepshead = {
      ...base(),
      fase: 'enterrar',
      picker: 0,
      turno: 0,
      manos: [c('Ap Qt Qp Jc 7c 8c 7t 8t'), [], [], [], []],
    };
    expect(decide(e)).toEqual({ tipo: 'enterrar', carta: una('Ap') });
  });

  it('en el leaster echa la carta más alta que no gana', () => {
    const e: EstadoSheepshead = {
      ...base(),
      fase: 'bazas',
      leaster: true,
      turno: 1,
      manos: [[], c('9c Ac 8c'), [], [], []],
      mesa: [{ asiento: 0, carta: una('10c') }],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('9c') });
  });
});

describe('IA del Sheepshead en partidas', () => {
  const azar = aleatorio<VistaSheepshead, AccionSheepshead>();
  // Cinco manos, para que las partidas de las pruebas no sean tan largas.
  const corta: ConfigSheepshead = { jugadores: 5, manos: 5 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      sheepshead,
      corta,
      iaSheepsheadBasica,
      IAS.sheepshead.facil,
      100,
      unoContraTodos(5),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(sheepshead, corta, iaSheepsheadBasica, azar, 200, unoContraTodos(5), 'azar');
    expect(r.ganadas).toBeGreaterThan(70);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      sheepshead,
      corta,
      IAS.sheepshead.dificil,
      iaSheepsheadBasica,
      1,
      unoContraTodos(5),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
