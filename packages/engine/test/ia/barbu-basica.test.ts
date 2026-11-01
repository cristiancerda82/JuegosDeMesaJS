import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaBarbuBasica } from '../../src/ia/barbu-basica';
import { IAS } from '../../src/ia/ias';
import { barbu, type AccionBarbu, type EstadoBarbu, type VistaBarbu } from '../../src/juegos/barbu';
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

/** Partidas cortas para las pruebas. */
const CONFIG = { jugadores: 4, manos: 2 } as const;

function preparado(parcial: Partial<EstadoBarbu>): EstadoBarbu {
  const r = barbu.crear(CONFIG, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, ...parcial };
}

const decide = (e: EstadoBarbu) =>
  iaBarbuBasica.decidir(
    barbu.vistaDe(e, e.turno),
    barbu.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Barbu', () => {
  it('elige el triunfo con un palo largo y, después, ese palo', () => {
    const mano = c('Ap Kp Qp 9p 7p 5p 3p Ad Ac 2t 3t 4d 5c');
    let e = preparado({ manos: [mano, [], [], []] });
    expect(decide(e)).toEqual({ tipo: 'contrato', contrato: 'triunfo' });
    e = { ...e, fase: 'triunfo', contrato: 'triunfo', jugados: ['triunfo'] };
    expect(decide(e)).toEqual({ tipo: 'triunfo', palo: 'picas' });
  });

  it('se descarta del Rey de corazones', () => {
    const e = preparado({
      fase: 'bazas',
      contrato: 'rey',
      turno: 1,
      manos: [c('2d'), c('Kc 2c 3d'), c('2d'), c('2d')],
      mesa: [{ asiento: 0, carta: una('5p') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kc') });
  });

  it('no gana la baza si puede evitarlo', () => {
    const e = preparado({
      fase: 'bazas',
      contrato: 'bazas',
      turno: 1,
      manos: [c('2p'), c('9d Qd'), c('2p'), c('2p')],
      mesa: [{ asiento: 0, carta: una('10d') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('9d') });
  });

  it('en el dominó abre las cartas que le dejan seguir jugando', () => {
    const e = preparado({
      fase: 'domino',
      contrato: 'domino',
      turno: 0,
      manos: [c('Jp Jc Qc Kc'), c('2d'), c('3d'), c('4d')],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Jc') });
  });
});

describe('IA difícil del Barbu', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = barbu.crear(CONFIG, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e: EstadoBarbu = { ...r.valor, fase: 'bazas', contrato: 'bazas', jugados: ['bazas'] };
    const v = barbu.vistaDe(e, e.turno);
    const acciones = barbu.accionesLegales(e, e.turno);
    expect(IAS.barbu.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.barbu.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Barbu', () => {
  const azar = aleatorio<VistaBarbu, AccionBarbu>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(barbu, CONFIG, iaBarbuBasica, IAS.barbu.facil, 100, unoContraTodos(4), 'sim');
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(barbu, CONFIG, iaBarbuBasica, azar, 200, unoContraTodos(4), 'azar');
    expect(r.ganadas).toBeGreaterThan(70);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      barbu,
      CONFIG,
      IAS.barbu.dificil,
      iaBarbuBasica,
      1,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
