import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaOhHellBasica } from '../../src/ia/oh-hell-basica';
import {
  CONFIG_OH_HELL_POR_DEFECTO,
  ohHell,
  type AccionOhHell,
  type EstadoOhHell,
  type VistaOhHell,
} from '../../src/juegos/oh-hell';
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

function base(): EstadoOhHell {
  const r = ohHell.crear(CONFIG_OH_HELL_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoOhHell) =>
  iaOhHellBasica.decidir(
    ohHell.vistaDe(e, e.turno),
    ohHell.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Oh Hell', () => {
  it('apuesta sus Ases', () => {
    // Mano de 3 cartas (índice 9 con 4 jugadores), triunfo diamantes.
    const e: EstadoOhHell = {
      ...base(),
      indiceMano: 9,
      triunfo: 'diamantes',
      manos: [c('Ap Ac 2t'), c('3p 4p 5p'), c('3c 4c 5c'), c('3t 4t 5t')],
    };
    expect(decide(e)).toEqual({ tipo: 'apostar', bazas: 2 });
  });

  it('si su apuesta está prohibida, apuesta la más cercana', () => {
    // Le toca al repartidor (el 3) en una mano de 3 cartas; los demás suman 1 y le prohíben el 2.
    const e: EstadoOhHell = {
      ...base(),
      indiceMano: 9,
      triunfo: 'diamantes',
      manos: [c('3p 4p 5p'), c('3c 4c 5c'), c('3t 4t 5t'), c('Ap Ac 2t')],
      apuestas: [1, 0, 0, null],
      turno: 3,
    };
    const accion = decide(e);
    expect(accion.tipo).toBe('apostar');
    expect(accion.tipo === 'apostar' && accion.bazas).not.toBe(2);
  });

  it('evita ganar cuando ya tiene sus bazas', () => {
    const e: EstadoOhHell = {
      ...base(),
      fase: 'jugar',
      triunfo: 'diamantes',
      apuestas: [1, 0, 0, 0],
      bazas: [0, 0, 0, 0],
      manos: [c(''), c('Kp 3p 2c'), c(''), c('')],
      mesa: [{ asiento: 0, carta: 'picas-10' }],
      turno: 1,
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'picas-3' });
  });

  it('gana con la carta más barata cuando le faltan bazas', () => {
    const e: EstadoOhHell = {
      ...base(),
      fase: 'jugar',
      triunfo: 'diamantes',
      apuestas: [1, 1, 0, 0],
      bazas: [0, 0, 0, 0],
      manos: [c(''), c('Ap Kp 3p'), c(''), c('')],
      mesa: [{ asiento: 0, carta: 'picas-10' }],
      turno: 1,
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'picas-13' });
  });
});

describe('IA difícil del Oh Hell', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = base();
    const v = ohHell.vistaDe(e, e.turno);
    const acciones = ohHell.accionesLegales(e, e.turno);
    expect(IAS.ohHell.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.ohHell.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Oh Hell', () => {
  const azar = aleatorio<VistaOhHell, AccionOhHell>();
  const cuatro = unoContraTodos(4);

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      ohHell,
      CONFIG_OH_HELL_POR_DEFECTO,
      iaOhHellBasica,
      IAS.ohHell.facil,
      100,
      cuatro,
      'sim',
    );
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(ohHell, CONFIG_OH_HELL_POR_DEFECTO, iaOhHellBasica, azar, 200, cuatro, 'azar');
    expect(r.ganadas).toBeGreaterThan(100);
  });

  it('la difícil decide en menos de 500 ms, también con 3 jugadores y 17 cartas', () => {
    for (const config of [CONFIG_OH_HELL_POR_DEFECTO, { jugadores: 3 as const }]) {
      const r = duelo(
        ohHell,
        config,
        IAS.ohHell.dificil,
        iaOhHellBasica,
        1,
        unoContraTodos(config.jugadores),
        'tiempo',
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
