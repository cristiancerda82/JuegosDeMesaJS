import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaBourreBasica } from '../../src/ia/bourre-basica';
import { IAS } from '../../src/ia/ias';
import {
  bourre,
  CONFIG_BOURRE_POR_DEFECTO,
  type AccionBourre,
  type ConfigBourre,
  type EstadoBourre,
  type VistaBourre,
} from '../../src/juegos/bourre';
import { duelo, unoContraTodos } from './duelo';

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

/** Un estado con triunfo de diamantes (la vuelta, el 2 de diamantes, del que reparte, el 4). */
function base(): EstadoBourre {
  const r = bourre.crear(CONFIG_BOURRE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return { ...r.valor, vuelta: una('2d') };
}

const decide = (e: EstadoBourre) =>
  iaBourreBasica.decidir(
    bourre.vistaDe(e, e.turno),
    bourre.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

const conMano = (e: EstadoBourre, mano: string): EstadoBourre => ({
  ...e,
  manos: e.manos.map((m, a) => (a === e.turno ? c(mano) : m)),
});

describe('IA básica del Bourré', () => {
  it('juega con dos triunfos', () => {
    expect(decide(conMano(base(), '3d 5d 7p 8t 4c'))).toEqual({ tipo: 'jugar' });
  });

  it('pasa sin triunfos, ni Ases, ni K', () => {
    expect(decide(conMano(base(), '3p 5t 7p 8t 4c'))).toEqual({ tipo: 'pasar' });
  });

  it('se descarta del 4 de tréboles y del 6 de corazones', () => {
    let e: EstadoBourre = {
      ...conMano(base(), 'Ap 3d 9d 4t 6c'),
      fase: 'cambio',
      juega: [true, true, null, null, null],
    };
    const primera = decide(e);
    expect(primera).toEqual({ tipo: 'descartar', carta: una('4t') });
    e = bourre.transicion(e, 0, primera);
    expect(decide(e)).toEqual({ tipo: 'descartar', carta: una('6c') });
    e = bourre.transicion(e, 0, decide(e));
    expect(decide(e)).toEqual({ tipo: 'robar' });
  });
});

describe('IA del Bourré en partidas', () => {
  const azar = aleatorio<VistaBourre, AccionBourre>();
  // Cinco manos y 20 fichas, para que las partidas de las pruebas no sean tan largas.
  const corta: ConfigBourre = { jugadores: 5, manos: 5, fichas: 20 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(bourre, corta, iaBourreBasica, IAS.bourre.facil, 100, unoContraTodos(5), 'sim');
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(bourre, corta, iaBourreBasica, azar, 200, unoContraTodos(5), 'azar');
    expect(r.ganadas).toBeGreaterThan(70);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      bourre,
      corta,
      IAS.bourre.dificil,
      iaBourreBasica,
      1,
      unoContraTodos(5),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
