import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { descarteSkat, iaSkatBasica, mejorJuegoSkat } from '../../src/ia/skat-basica';
import {
  CONFIG_SKAT_POR_DEFECTO,
  skat,
  type AccionSkat,
  type EstadoSkat,
  type VistaSkat,
} from '../../src/juegos/skat';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «Jt» es la J de tréboles; p, c y d, picas, corazones y diamantes. */
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

/** Reparte el 2 y puja Mittelhand (el 1) con la mano dada. */
function conMano(mano: string, parcial: Partial<EstadoSkat> = {}): EstadoSkat {
  const r = skat.crear(CONFIG_SKAT_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, manos: r.valor.manos.map((m, a) => (a === 1 ? c(mano) : m)), ...parcial };
}

const decide = (e: EstadoSkat) =>
  iaSkatBasica.decidir(skat.vistaDe(e, e.turno), skat.accionesLegales(e, e.turno), crearAzar('x'))
    .accion;

describe('IA básica del Skat', () => {
  it('puja con las cuatro J y dos Ases', () => {
    expect(decide(conMano('Jt Jp Jc Jd At Ap 7c 8c 9d 8p'))).toEqual({ tipo: 'pujar' });
  });

  it('pasa con una mano floja', () => {
    expect(decide(conMano('Kt Qp 9c 8c Kd Qd 9p 10t 8d Qc'))).toEqual({ tipo: 'pasar' });
  });

  it('valora un juego de palo largo con J', () => {
    expect(mejorJuegoSkat(c('Jt Jc At 10t Kt Qt 9t Ap 8c 7d'))).toEqual({
      juego: 'treboles',
      valor: 24,
    });
  });

  it('se descarta de un 10 suelto antes que de un As', () => {
    expect(descarteSkat(c('Jt Jc At 10t Kt Qt 9t Ap 10d 8c 7c Ac'))).toBe('diamantes-10');
  });

  it('el solista en Nulo juega la más alta que no gana', () => {
    const e = conMano('7t 9t Jt 7p 8p 7c 8c 9c 7d 8d', {
      fase: 'bazas',
      solista: 1,
      juego: 'nulo',
      mesa: [{ asiento: 0, carta: 'treboles-10' }],
      turno: 1,
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'treboles-9' });
  });
});

describe('IA difícil del Skat', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = skat.crear(CONFIG_SKAT_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    // Mittelhand y Hinterhand pasan y Vorhand juega con 18: un Grand cualquiera.
    e = skat.transicion(e, e.turno, { tipo: 'pasar' });
    e = skat.transicion(e, e.turno, { tipo: 'pasar' });
    e = skat.transicion(e, e.turno, { tipo: 'pujar' });
    e = skat.transicion(e, e.turno, { tipo: 'declarar', juego: 'grand', anuncio: 'ninguno' });
    const v = skat.vistaDe(e, e.turno);
    const acciones = skat.accionesLegales(e, e.turno);
    expect(IAS.skat.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.skat.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Skat', () => {
  const azar = aleatorio<VistaSkat, AccionSkat>();
  const tres = unoContraTodos(3);

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(skat, CONFIG_SKAT_POR_DEFECTO, iaSkatBasica, IAS.skat.facil, 100, tres, 'sim');
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(skat, CONFIG_SKAT_POR_DEFECTO, iaSkatBasica, azar, 200, tres, 'azar');
    expect(r.ganadas).toBeGreaterThan(100);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      skat,
      CONFIG_SKAT_POR_DEFECTO,
      IAS.skat.dificil,
      iaSkatBasica,
      2,
      tres,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
