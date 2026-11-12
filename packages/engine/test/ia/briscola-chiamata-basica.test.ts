import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaBriscolaChiamataBasica } from '../../src/ia/briscola-chiamata-basica';
import { IAS } from '../../src/ia/ias';
import {
  briscolaChiamata,
  CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO,
  type AccionBriscolaChiamata,
  type ConfigBriscolaChiamata,
  type EstadoBriscolaChiamata,
  type VistaBriscolaChiamata,
} from '../../src/juegos/briscola-chiamata';
import type { Asiento } from '../../src/motor/contrato';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;

function base(): EstadoBriscolaChiamata {
  const r = briscolaChiamata.crear(CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoBriscolaChiamata) =>
  iaBriscolaChiamataBasica.decidir(
    briscolaChiamata.vistaDe(e, e.turno),
    briscolaChiamata.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const conMano = (e: EstadoBriscolaChiamata, mano: string): EstadoBriscolaChiamata => ({
  ...e,
  manos: e.manos.map((m, a) => (a === e.turno ? c(mano) : m)),
});

describe('IA básica de la Briscola Chiamata', () => {
  it('puja el As con una buena mano', () => {
    expect(decide(conMano(base(), 'Ao 3o Ro Co 7c 6c 5e 4e'))).toEqual({ tipo: 'pujar', nivel: 0 });
  });

  it('pasa con una mano floja', () => {
    const e: EstadoBriscolaChiamata = {
      ...conMano({ ...base(), turno: 1 }, '7o 6o 5c 4c 2e 7e 6b 5b'),
      pujas: [0, null, null, null, null],
      nivel: 0,
    };
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('llama en su palo más largo', () => {
    const e: EstadoBriscolaChiamata = {
      ...conMano(base(), 'Ao 3o Co So 7c 6c 5e 4e'),
      fase: 'llamada',
      pujas: [2, 'paso', 'paso', 'paso', 'paso'],
      nivel: 2,
      llamador: 0,
    };
    expect(decide(e)).toEqual({ tipo: 'llamar', palo: 'oros' });
  });

  it('el compañero carga puntos en la baza del llamador', () => {
    const e: EstadoBriscolaChiamata = {
      ...base(),
      manos: [c('2o'), c('7b'), c('6b'), c('3c 4e'), c('5b')],
      fase: 'bazas',
      pujas: [0, 'paso', 'paso', 'paso', 'paso'],
      nivel: 0,
      llamador: 0,
      llamada: una('Ab'),
      triunfo: 'bastos',
      companero: 3,
      turno: 3,
      mesa: [
        { asiento: 0, carta: una('Rb') },
        { asiento: 1, carta: una('7b') },
        { asiento: 2, carta: una('6b') },
      ],
    };
    expect(decide(e)).toEqual({ tipo: 'jugarCarta', carta: una('3c') });
  });

  it('un defensor gana una baza con puntos con la carta más baja', () => {
    const e: EstadoBriscolaChiamata = {
      ...base(),
      manos: [c('2o'), c('Ac Rc 5c'), c('6b'), c('4e'), c('5b')],
      fase: 'bazas',
      pujas: [0, 'paso', 'paso', 'paso', 'paso'],
      nivel: 0,
      llamador: 0,
      llamada: una('Ab'),
      triunfo: 'bastos',
      companero: 3,
      turno: 1,
      mesa: [{ asiento: 0, carta: una('Rc') }],
    };
    // El Rey (4 puntos) no llega a 10: echa la que menos vale.
    expect(decide(e)).toEqual({ tipo: 'jugarCarta', carta: una('5c') });
    // Con el 3 de copas (10 puntos), la gana con el As.
    expect(decide({ ...e, mesa: [{ asiento: 0, carta: una('3c') }] })).toEqual({
      tipo: 'jugarCarta',
      carta: una('Ac'),
    });
  });
});

describe('IA de la Briscola Chiamata en partidas', () => {
  const azar = aleatorio<VistaBriscolaChiamata, AccionBriscolaChiamata>();
  const corta: ConfigBriscolaChiamata = { manos: 2 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      briscolaChiamata,
      corta,
      iaBriscolaChiamataBasica,
      IAS.briscolaChiamata.facil,
      100,
      unoContraTodos(5),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('dos IAs ganan claramente a tres jugadores al azar', () => {
    // Dos asientos seguidos de IA, que cambian en cada partida; la parte justa es 2 de 5.
    const dos = (a: Asiento, i: number) => (a - i + 50) % 5 < 2;
    const r = duelo(
      briscolaChiamata,
      CONFIG_BRISCOLA_CHIAMATA_POR_DEFECTO,
      iaBriscolaChiamataBasica,
      azar,
      200,
      dos,
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(120);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      briscolaChiamata,
      corta,
      IAS.briscolaChiamata.dificil,
      iaBriscolaChiamataBasica,
      1,
      unoContraTodos(5),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
