import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaBeloteBasica } from '../../src/ia/belote-basica';
import { IAS } from '../../src/ia/ias';
import {
  belote,
  CONFIG_BELOTE_POR_DEFECTO,
  type AccionBelote,
  type EstadoBelote,
  type VistaBelote,
} from '../../src/juegos/belote';
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
function conMano(mano: string, parcial: Partial<EstadoBelote> = {}): EstadoBelote {
  const r = belote.crear(CONFIG_BELOTE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    manos: [c(mano), c('7p 8p Qp Kp Ap'), c('7t 8t Qt Kt At'), c('7d 8d Qd Kd Ad')],
    cartaVuelta: 'corazones-10',
    ...parcial,
  };
}

const decide = (e: EstadoBelote) =>
  iaBeloteBasica.decidir(
    belote.vistaDe(e, e.turno),
    belote.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Belote', () => {
  it('toma con la J y el 9 del palo de la carta vuelta', () => {
    expect(decide(conMano('Jc 9c 7c 9t 9p'))).toEqual({ tipo: 'tomar' });
  });

  it('pasa con una mano floja', () => {
    expect(decide(conMano('9p 10t Jd 9t Kp'))).toEqual({ tipo: 'pasar' });
  });

  it('nombra en la segunda vuelta su mejor palo', () => {
    const e = conMano('Jp 9p 10p 7c 9d', { fase: 'segunda' });
    expect(decide(e)).toEqual({ tipo: 'nombrar', palo: 'picas' });
  });

  it('gana la baza con la carta más barata que la gana', () => {
    const e = conMano('Ap 10p 7p', {
      fase: 'bazas',
      triunfo: 'corazones',
      elige: 1,
      mazo: [],
      mesa: [{ asiento: 3, carta: 'picas-13' }],
      turno: 0,
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'picas-10' });
  });

  it('carga la baza de su compañero cuando juega el último', () => {
    const e = conMano('7t 10d 8d', {
      fase: 'bazas',
      triunfo: 'corazones',
      elige: 0,
      mazo: [],
      mesa: [
        { asiento: 1, carta: 'picas-7' },
        { asiento: 2, carta: 'picas-1' },
        { asiento: 3, carta: 'picas-8' },
      ],
      turno: 0,
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'diamantes-10' });
  });
});

describe('IA difícil del Belote', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = belote.transicion(conMano('Jc Ac 9t Kd Qd'), 0, { tipo: 'tomar' });
    const v = belote.vistaDe(e, 0);
    const acciones = belote.accionesLegales(e, 0);
    expect(IAS.belote.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.belote.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Belote', () => {
  const azar = aleatorio<VistaBelote, AccionBelote>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      belote,
      CONFIG_BELOTE_POR_DEFECTO,
      iaBeloteBasica,
      IAS.belote.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      belote,
      CONFIG_BELOTE_POR_DEFECTO,
      iaBeloteBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      belote,
      CONFIG_BELOTE_POR_DEFECTO,
      IAS.belote.dificil,
      iaBeloteBasica,
      2,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
