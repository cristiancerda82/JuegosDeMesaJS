import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { equityHoldem, iaHoldemBasica, iaHoldemExperta } from '../../src/ia/holdem-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_HOLDEM_POR_DEFECTO,
  holdem,
  type AccionHoldem,
  type EstadoHoldem,
  type VistaHoldem,
} from '../../src/juegos/holdem';
import { duelo, unoContraTodos } from './duelo';

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

/** Una partida de 4 recién repartida en la que el asiento 3 (el primero en hablar) tiene esta mano. */
function conMano(mano: IdCarta[], parcial: Partial<EstadoHoldem> = {}): EstadoHoldem {
  const r = holdem.crear(CONFIG_HOLDEM_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const usadas = new Set(mano);
  const otras = r.valor.manos
    .flat()
    .concat(r.valor.mazo)
    .filter((x) => !usadas.has(x));
  const manos = r.valor.manos.map((m, a) => (a === 3 ? mano : otras.splice(0, 2)));
  return { ...r.valor, manos, mazo: otras, ...parcial };
}

function decide(e: EstadoHoldem): AccionHoldem {
  const vista = holdem.vistaDe(e, e.turno);
  return iaHoldemBasica.decidir(vista, holdem.accionesLegales(e, e.turno), crearAzar('x')).accion;
}

describe('IA básica del Texas Hold’em', () => {
  it('sube con pareja de ases antes del flop', () => {
    expect(decide(conMano(c('Ap Ac'))).tipo).toBe('subir');
  });

  it('se retira con 7-2 de distinto palo ante una subida', () => {
    const e = conMano(c('7p 2c'), {
      apuestas: [0, 1, 12, 0],
      aportado: [0, 1, 12, 0],
      fichas: [100, 99, 88, 100],
      apuestaMaxima: 12,
      ultimaSubida: 10,
    });
    expect(decide(e)).toEqual({ tipo: 'retirarse' });
  });

  it('pasa sin nada en el flop si nadie ha apostado', () => {
    const e = conMano(c('7p 2c'), {
      fase: 'flop',
      comunes: c('Kd 9t 4c'),
      apuestas: [0, 0, 0, 0],
      apuestaMaxima: 0,
      ultimaSubida: 2,
    });
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });
});

describe('IA difícil del Texas Hold’em', () => {
  /** Un river en el que el asiento 3 tiene que igualar 50 a un bote de 50. */
  const riverCaro = (mano: IdCarta[]) =>
    conMano(mano, {
      fase: 'river',
      comunes: c('Ap Kp Qd Jc 9t'),
      retirados: [true, true, false, false],
      apuestas: [0, 0, 50, 0],
      aportado: [0, 0, 50, 0],
      fichas: [100, 99, 48, 100],
      apuestaMaxima: 50,
      ultimaSubida: 50,
    });

  it('se retira si su probabilidad de ganar no paga lo que cuesta igualar', () => {
    const e = riverCaro(c('7t 2d'));
    const v = holdem.vistaDe(e, 3);
    expect(equityHoldem(v, 300, new Generador(crearAzar('e')))).toBeLessThan(1 / 3);
    const { accion } = iaHoldemExperta.decidir(v, holdem.accionesLegales(e, 3), crearAzar('s'));
    expect(accion).toEqual({ tipo: 'retirarse' });
  });

  it('con la escalera hecha no se retira', () => {
    const e = riverCaro(c('10p 5c'));
    const v = holdem.vistaDe(e, 3);
    const { accion } = iaHoldemExperta.decidir(v, holdem.accionesLegales(e, 3), crearAzar('s'));
    expect(accion.tipo).not.toBe('retirarse');
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano(c('Jp 10p'));
    const v = holdem.vistaDe(e, 3);
    const acciones = holdem.accionesLegales(e, 3);
    const a = IAS.holdem.dificil.decidir(v, acciones, crearAzar('s'));
    const b = IAS.holdem.dificil.decidir(v, acciones, crearAzar('s'));
    expect(a).toEqual(b);
  });
});

describe('garantías de la IA del Texas Hold’em', () => {
  const azar = aleatorio<VistaHoldem, AccionHoldem>();

  it('200 partidas entre IAs, de 2 a 6, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    for (const jugadores of [2, 3, 4, 5, 6] as const) {
      const r = duelo(
        holdem,
        { jugadores },
        iaHoldemBasica,
        IAS.holdem.facil,
        40,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    // Con 4 jugadores le correspondería una de cada cuatro.
    const r = duelo(
      holdem,
      CONFIG_HOLDEM_POR_DEFECTO,
      iaHoldemBasica,
      azar,
      400,
      unoContraTodos(4),
      'azar',
    );
    // Gana 117 de 400 (un 29 %, frente al 25 % que le tocaría con todos iguales).
    expect(r.ganadas).toBeGreaterThan(110);
  });
});
