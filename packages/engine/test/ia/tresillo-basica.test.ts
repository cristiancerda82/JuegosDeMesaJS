import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTresilloBasica } from '../../src/ia/tresillo-basica';
import {
  CONFIG_TRESILLO_POR_DEFECTO,
  tresillo,
  type AccionTresillo,
  type ConfigTresillo,
  type EstadoTresillo,
  type VistaTresillo,
} from '../../src/juegos/tresillo';
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

function base(): EstadoTresillo {
  const r = tresillo.crear(CONFIG_TRESILLO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoTresillo) =>
  iaTresilloBasica.decidir(
    tresillo.vistaDe(e, e.turno),
    tresillo.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const conMano = (e: EstadoTresillo, mano: string): EstadoTresillo => ({
  ...e,
  manos: e.manos.map((m, a) => (a === e.turno ? c(mano) : m)),
});

describe('IA básica del Tresillo', () => {
  it('puja el solo con una gran mano', () => {
    expect(decide(conMano(base(), 'Ae 7o Ab Ao Ro Co So Rc Rb'))).toEqual({
      tipo: 'pujar',
      contrato: 'solo',
    });
  });

  it('pasa con mala mano', () => {
    expect(decide(conMano(base(), '2o 3o 4c 5c 3e 4e 2b 3b 6c'))).toEqual({ tipo: 'pasar' });
  });

  it('elige el triunfo con el que más bazas espera', () => {
    const e: EstadoTresillo = {
      ...conMano(base(), 'Ae Ab Rc Cc Sc 4c 2o 3e 4b'),
      fase: 'triunfo',
      hombre: 0,
      contrato: 'entrada',
    };
    expect(decide(e)).toEqual({ tipo: 'triunfo', palo: 'copas' });
  });

  it('en el cambio se descarta de lo que no es triunfo ni rey, de la más baja', () => {
    const e: EstadoTresillo = {
      ...conMano(base(), 'Ae 7o Ro 3o Rc 4c 2e 5b 6b'),
      fase: 'cambio',
      hombre: 0,
      contrato: 'entrada',
      triunfo: 'oros',
    };
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: una('2e') });
  });

  it('un defensor no gasta en la baza que gana el otro defensor', () => {
    const e: EstadoTresillo = {
      ...conMano(base(), 'Cc 4c Ac'),
      fase: 'bazas',
      hombre: 1,
      contrato: 'entrada',
      triunfo: 'oros',
      turno: 0,
      mesa: [
        { asiento: 1, carta: una('2c') },
        { asiento: 2, carta: una('Rc') },
      ],
    };
    expect(decide(e)).toEqual({ tipo: 'jugarCarta', carta: una('4c') });
  });
});

describe('IA del Tresillo en partidas', () => {
  const azar = aleatorio<VistaTresillo, AccionTresillo>();
  // Cuatro manos y 20 fichas, para que las partidas de las pruebas no sean tan largas.
  const corta: ConfigTresillo = { manos: 4, fichas: 20 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      tresillo,
      corta,
      iaTresilloBasica,
      IAS.tresillo.facil,
      100,
      unoContraTodos(3),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(tresillo, corta, iaTresilloBasica, azar, 300, unoContraTodos(3), 'azar');
    expect(r.ganadas).toBeGreaterThan(150);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      tresillo,
      corta,
      IAS.tresillo.dificil,
      iaTresilloBasica,
      1,
      unoContraTodos(3),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
