import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaSchnapsenBasica } from '../../src/ia/schnapsen-basica';
import {
  CONFIG_SCHNAPSEN_POR_DEFECTO,
  schnapsen,
  type AccionSchnapsen,
  type EstadoSchnapsen,
  type VistaSchnapsen,
} from '../../src/juegos/schnapsen';
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

/** Reparte el 1 y sale el 0. Carta vuelta, el As de diamantes: triunfo, diamantes. */
function conManos(manos: string[], parcial: Partial<EstadoSchnapsen> = {}): EstadoSchnapsen {
  const r = schnapsen.crear(CONFIG_SCHNAPSEN_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    manos: manos.map(c),
    cartaVuelta: 'diamantes-1',
    triunfo: 'diamantes',
    mazo: c('10d Kd Qd Jp Jc At 10t Kt Qt'),
    ...parcial,
  };
}

const decide = (e: EstadoSchnapsen) =>
  iaSchnapsenBasica.decidir(
    schnapsen.vistaDe(e, e.turno),
    schnapsen.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Schnapsen', () => {
  it('cambia la J del triunfo', () => {
    expect(decide(conManos(['Jd Ap 10p Kc Qc', 'Kp Qp Ac 10c Jt']))).toEqual({ tipo: 'cambiar' });
  });

  it('canta en cuanto puede, el 40 antes que el 20', () => {
    const e = conManos(['Kc Qc Kd Qd Ap', '10p Jp Ac 10c Jt']);
    expect(decide(e)).toEqual({ tipo: 'cantar', palo: 'diamantes' });
  });

  it('tras cantar sale con la Q', () => {
    const e = conManos(['Kc Qc Ap 10p Jt', 'Kp Qp Ac 10c Jd'], { cantado: 'corazones' });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'corazones-12' });
  });

  it('con el mazo abierto sale con la carta suelta que menos vale', () => {
    expect(decide(conManos(['Ap 10p Jt Ac 10d', 'Kp Qp Kc Qc Jd']))).toEqual({
      tipo: 'jugar',
      carta: 'treboles-11',
    });
  });

  it('gana con el mismo palo si puede', () => {
    const e = conManos(['', 'Ap Jp Kc'], { mesa: [{ asiento: 0, carta: 'picas-13' }], turno: 1 });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'picas-1' });
  });

  it('cierra con los 66 asegurados', () => {
    const e = conManos(['Ad 10d Kc Jt Jp', 'Kp Qp Ac 10c Jc'], {
      cartaVuelta: 'diamantes-12',
      puntosBazas: [50, 10],
      bazas: [3, 1],
    });
    expect(decide(e)).toEqual({ tipo: 'cerrar' });
  });
});

describe('IA difícil del Schnapsen', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = schnapsen.crear(CONFIG_SCHNAPSEN_POR_DEFECTO, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = schnapsen.vistaDe(e, e.turno);
    const acciones = schnapsen.accionesLegales(e, e.turno);
    expect(IAS.schnapsen.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.schnapsen.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Schnapsen', () => {
  const azar = aleatorio<VistaSchnapsen, AccionSchnapsen>();
  const dos = unoContraTodos(2);

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      schnapsen,
      CONFIG_SCHNAPSEN_POR_DEFECTO,
      iaSchnapsenBasica,
      IAS.schnapsen.facil,
      100,
      dos,
      'sim',
    );
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      schnapsen,
      CONFIG_SCHNAPSEN_POR_DEFECTO,
      iaSchnapsenBasica,
      azar,
      200,
      dos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      schnapsen,
      CONFIG_SCHNAPSEN_POR_DEFECTO,
      IAS.schnapsen.dificil,
      iaSchnapsenBasica,
      2,
      dos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
