import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaManillaBasica } from '../../src/ia/manilla-basica';
import {
  CONFIG_MANILLA_POR_DEFECTO,
  manilla,
  type AccionManilla,
  type EstadoManilla,
  type VistaManilla,
} from '../../src/juegos/manilla';
import { duelo, porBandos } from './duelo';

/** Cartas en notación corta: «9o» es el 9 de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;

function base(): EstadoManilla {
  const r = manilla.crear(CONFIG_MANILLA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoManilla) =>
  iaManillaBasica.decidir(
    manilla.vistaDe(e, e.turno),
    manilla.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica de la Manilla', () => {
  it('sale con la manilla de un palo que no es triunfo: gana seguro', () => {
    const e = {
      ...base(),
      pinte: una('2o'),
      turno: 0,
      manos: [c('9c 3c 4e 5b'), c('1c'), c('6e'), c('7b 2o')],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('9c') });
  });

  it('si la baza ya es de su compañero y es el último, le carga los puntos', () => {
    // El 1 es compañero del 3: el 1 gana con la manilla de copas y el 3 juega el último.
    const e = {
      ...base(),
      pinte: una('2o'),
      turno: 3,
      mesa: [
        { asiento: 0, carta: una('3c') },
        { asiento: 1, carta: una('9c') },
        { asiento: 2, carta: una('4c') },
      ],
      manos: [c('5e'), c('6e'), c('7e'), c('1c 2c 2o')],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('1c') });
  });

  it('con una sola carta legal, la juega', () => {
    const e = {
      ...base(),
      pinte: una('2o'),
      turno: 1,
      mesa: [{ asiento: 0, carta: una('3c') }],
      manos: [c('5e'), c('12c 2b'), c('7e'), c('8e')],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('12c') });
  });
});

describe('IA de la Manilla en partidas', () => {
  const azar = aleatorio<VistaManilla, AccionManilla>();

  it('partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      manilla,
      CONFIG_MANILLA_POR_DEFECTO,
      iaManillaBasica,
      IAS.manilla.facil,
      40,
      porBandos,
      'sim',
    );
    expect(r.partidas).toBe(40);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      manilla,
      CONFIG_MANILLA_POR_DEFECTO,
      iaManillaBasica,
      azar,
      200,
      porBandos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(150);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      manilla,
      CONFIG_MANILLA_POR_DEFECTO,
      IAS.manilla.dificil,
      iaManillaBasica,
      1,
      porBandos,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
