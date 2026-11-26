import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaBurroBazasBasica } from '../../src/ia/burro-bazas-basica';
import { IAS } from '../../src/ia/ias';
import {
  burroBazas,
  CONFIG_BURRO_BAZAS_POR_DEFECTO,
  type AccionBurroBazas,
  type ConfigBurroBazas,
  type EstadoBurroBazas,
  type VistaBurroBazas,
} from '../../src/juegos/burro-bazas';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «12o» es el Rey de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;

function base(): EstadoBurroBazas {
  const r = burroBazas.crear(CONFIG_BURRO_BAZAS_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoBurroBazas) =>
  iaBurroBazasBasica.decidir(
    burroBazas.vistaDe(e, e.turno),
    burroBazas.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

/** El asiento 1 decide con esta mano; los demás tienen 4 cartas que no ve y el mazo, 20. */
const conMano = (mano: string, parcial: Partial<EstadoBurroBazas> = {}): EstadoBurroBazas => {
  const e = base();
  const resto = e.mazo.filter((x) => !c(mano).includes(x));
  return {
    ...e,
    turno: 1,
    salida: 1,
    manos: [resto.slice(0, 4), c(mano), resto.slice(4, 8), resto.slice(8, 12)],
    mazo: resto.slice(12, 32),
    ...parcial,
  };
};

describe('IA básica del Burro de bazas', () => {
  it('al salir, elige el palo que un rival no tiene, para que robe', () => {
    const e = conMano('3c 7c 4e 6e', { sinPalo: [[], [], ['espadas'], []] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('6e') });
  });

  it('al salir, juega la punta de su palo', () => {
    expect(decide(conMano('12c 3c 4e 6e'))).toEqual({ tipo: 'jugar', carta: una('12c') });
  });

  it('al salir, no se queda sin un palo del que quedan cartas', () => {
    expect(decide(conMano('5o 3c 7c'))).toEqual({ tipo: 'jugar', carta: una('7c') });
  });

  it('al seguir, gana la baza con la punta', () => {
    const e = conMano('12o 3o 6c', { salida: 0, mesa: [{ asiento: 0, carta: una('5o') }] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('12o') });
  });

  it('si no puede ganar, echa la más baja', () => {
    const e = conMano('9o 3o 6c', { salida: 0, mesa: [{ asiento: 0, carta: una('12o') }] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('3o') });
  });

  it('el último en jugar gana con la más baja que gana; si no es el último, echa la más baja', () => {
    const ultimo = conMano('9o 11o 1o', {
      salida: 2,
      mesa: [
        { asiento: 2, carta: una('5o') },
        { asiento: 3, carta: una('7o') },
        { asiento: 0, carta: una('8o') },
      ],
    });
    expect(decide(ultimo)).toEqual({ tipo: 'jugar', carta: una('9o') });
    const primero = conMano('9o 11o 1o', { salida: 0, mesa: [{ asiento: 0, carta: una('8o') }] });
    expect(decide(primero)).toEqual({ tipo: 'jugar', carta: una('1o') });
  });

  it('sin el palo, roba; y sin mazo, pasa', () => {
    const e = conMano('3c 7c', { salida: 0, mesa: [{ asiento: 0, carta: una('5o') }] });
    expect(decide(e)).toEqual({ tipo: 'robar' });
    expect(decide({ ...e, mazo: [] })).toEqual({ tipo: 'pasar' });
  });
});

describe('IA del Burro de bazas en partidas', () => {
  const azar = aleatorio<VistaBurroBazas, AccionBurroBazas>();

  it('100 partidas entre IAs, de 3 a 6 jugadores, terminan sin acciones ilegales y rápidas', () => {
    for (const jugadores of [3, 4, 5, 6] as const) {
      const config: ConfigBurroBazas = { ...CONFIG_BURRO_BAZAS_POR_DEFECTO, jugadores };
      const r = duelo(
        burroBazas,
        config,
        iaBurroBazasBasica,
        IAS.burroBazas.facil,
        25,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(25);
      expect(r.maxMs).toBeLessThan(500);
    }
  });

  it('gana claramente al azar', () => {
    // Al azar contra el azar, el asiento elegido está entre los ganadores en unas 87 de 200.
    const r = duelo(
      burroBazas,
      CONFIG_BURRO_BAZAS_POR_DEFECTO,
      iaBurroBazasBasica,
      azar,
      200,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(125);
  });

  it('la difícil decide en menos de 500 ms, también con 6', () => {
    for (const jugadores of [4, 6] as const) {
      const r = duelo(
        burroBazas,
        { ...CONFIG_BURRO_BAZAS_POR_DEFECTO, jugadores },
        IAS.burroBazas.dificil,
        iaBurroBazasBasica,
        1,
        unoContraTodos(jugadores),
        'tiempo',
      );
      expect(r.maxMs).toBeLessThan(500);
    }
  });
});
