import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaEuchreBasica } from '../../src/ia/euchre-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_EUCHRE_POR_DEFECTO,
  euchre,
  type AccionEuchre,
  type EstadoEuchre,
  type VistaEuchre,
} from '../../src/juegos/euchre';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «9p» es el 9 de picas; c, d y t, corazones, diamantes y tréboles. */
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

/** Reparte el 3 y le toca al 0, con el 10 de corazones de carta vuelta. */
function conMano(mano: string, parcial: Partial<EstadoEuchre> = {}): EstadoEuchre {
  const r = euchre.crear(CONFIG_EUCHRE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    manos: [c(mano), c('9p 10p Qp Kp Ap'), c('9t 10t Qt Kt At'), c('9d 10d Qd Kd Ad')],
    cartaVuelta: 'corazones-10',
    ...parcial,
  };
}

const decide = (e: EstadoEuchre) =>
  iaEuchreBasica.decidir(
    euchre.vistaDe(e, e.turno),
    euchre.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Euchre', () => {
  it('pide con los dos bowers', () => {
    expect(decide(conMano('Jc Jd Ac 9t 9p'))).toMatchObject({ tipo: 'pedir' });
  });

  it('pasa con una mano floja', () => {
    expect(decide(conMano('9p 10t Qd 9t Kp'))).toEqual({ tipo: 'pasar' });
  });

  it('nombra en la segunda vuelta su mejor palo', () => {
    const e = conMano('Jp Jt Ap Kp 9d', { fase: 'segunda' });
    expect(decide(e)).toMatchObject({ tipo: 'nombrar', palo: 'picas' });
  });

  it('se descarta de la más baja que no es triunfo', () => {
    const e = conMano('Jc Ac 9t Kd Qd', {
      fase: 'descarte',
      triunfo: 'corazones',
      elige: 1,
      turno: 0,
    });
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: 'treboles-9' });
  });
});

describe('IA difícil del Euchre', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano('Jc Ac 9t Kd Qd', { fase: 'bazas', triunfo: 'corazones', elige: 1 });
    const v = euchre.vistaDe(e, 0);
    const acciones = euchre.accionesLegales(e, 0);
    expect(IAS.euchre.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.euchre.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Euchre', () => {
  const azar = aleatorio<VistaEuchre, AccionEuchre>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      euchre,
      CONFIG_EUCHRE_POR_DEFECTO,
      iaEuchreBasica,
      IAS.euchre.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      euchre,
      CONFIG_EUCHRE_POR_DEFECTO,
      iaEuchreBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      euchre,
      CONFIG_EUCHRE_POR_DEFECTO,
      IAS.euchre.dificil,
      iaEuchreBasica,
      2,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
