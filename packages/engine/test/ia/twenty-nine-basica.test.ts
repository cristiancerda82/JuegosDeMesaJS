import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTwentyNineBasica } from '../../src/ia/twenty-nine-basica';
import {
  CONFIG_TWENTY_NINE_POR_DEFECTO,
  twentyNine,
  type AccionTwentyNine,
  type ConfigTwentyNine,
  type EstadoTwentyNine,
  type VistaTwentyNine,
} from '../../src/juegos/twenty-nine';
import { duelo, porBandos } from './duelo';

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

function base(): EstadoTwentyNine {
  const r = twentyNine.crear(CONFIG_TWENTY_NINE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoTwentyNine) =>
  iaTwentyNineBasica.decidir(
    twentyNine.vistaDe(e, e.turno),
    twentyNine.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const conMano = (e: EstadoTwentyNine, mano: string): EstadoTwentyNine => ({
  ...e,
  manos: e.manos.map((m, a) => (a === e.turno ? c(mano) : m)),
});

describe('IA básica del Twenty-Nine', () => {
  it('puja 16 con una buena mano', () => {
    expect(decide(conMano(base(), 'Jc 9c Ac 7p'))).toEqual({ tipo: 'pujar', valor: 16 });
  });

  it('elige su palo más largo', () => {
    const e: EstadoTwentyNine = {
      ...conMano(base(), 'Jc 9c 7c 8p'),
      fase: 'triunfo',
      pujador: 0,
      puja: 18,
      pujaMayor: 18,
    };
    expect(decide(e)).toEqual({ tipo: 'elegirTriunfo', palo: 'corazones' });
  });

  it('carga puntos en la baza de su compañero', () => {
    const e: EstadoTwentyNine = {
      ...conMano(base(), '9p 8p'),
      fase: 'bazas',
      pendientes: [[], [], [], []],
      pujador: 1,
      puja: 18,
      triunfo: 'corazones',
      turno: 0,
      mesa: [
        { asiento: 2, carta: una('Jp') },
        { asiento: 3, carta: una('7p') },
      ],
    };
    expect(decide(e)).toEqual({ tipo: 'jugarCarta', carta: una('9p') });
  });
});

describe('IA del Twenty-Nine en partidas', () => {
  const azar = aleatorio<VistaTwentyNine, AccionTwentyNine>();
  // A 2 puntos de juego, para que las partidas de las pruebas no sean tan largas.
  const corta: ConfigTwentyNine = { objetivo: 2 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      twentyNine,
      corta,
      iaTwentyNineBasica,
      IAS.twentyNine.facil,
      100,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(twentyNine, corta, iaTwentyNineBasica, azar, 200, porBandos, 'azar');
    expect(r.ganadas).toBeGreaterThan(120);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      twentyNine,
      corta,
      IAS.twentyNine.dificil,
      iaTwentyNineBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
