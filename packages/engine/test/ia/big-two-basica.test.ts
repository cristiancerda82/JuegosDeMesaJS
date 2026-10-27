import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaBigTwoBasica } from '../../src/ia/big-two-basica';
import { IAS } from '../../src/ia/ias';
import {
  bigTwo,
  CONFIG_BIG_TWO_POR_DEFECTO,
  jugadaBigTwo,
  ordenarBigTwo,
  type AccionBigTwo,
  type EstadoBigTwo,
  type VistaBigTwo,
} from '../../src/juegos/big-two';
import { duelo, unoContraTodos } from './duelo';

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

const RIVALES = ['4d 5d 6d 7d 8d', '4t 5t 6t 7t 8t', '4c 5c 6c 7c 8c'];

function conMano(mano: string, mesa: string | null): EstadoBigTwo {
  const r = bigTwo.crear(CONFIG_BIG_TWO_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const cartasMesa = mesa === null ? null : ordenarBigTwo(c(mesa));
  return {
    ...r.valor,
    manos: [mano, ...RIVALES].map((m) => ordenarBigTwo(c(m))),
    turno: 0,
    primera: false,
    mesa: cartasMesa && { asiento: 3, cartas: cartasMesa, ...jugadaBigTwo(cartasMesa)! },
  };
}

const decide = (e: EstadoBigTwo) =>
  iaBigTwoBasica.decidir(bigTwo.vistaDe(e, 0), bigTwo.accionesLegales(e, 0), crearAzar('x')).accion;
const juega = (t: string): AccionBigTwo => ({ tipo: 'jugar', cartas: ordenarBigTwo(c(t)) });

describe('IA básica del Big Two', () => {
  it('supera con lo justo', () => {
    expect(decide(conMano('8c 9t 10c 10d 2p', '7t'))).toEqual(juega('8c'));
  });

  it('guarda el 2 mientras ningún rival está cerca de ganar', () => {
    expect(decide(conMano('2p 5t 6c', 'Ac'))).toEqual({ tipo: 'pasar' });
  });

  it('sale con su carta más baja soltando todas las que puede', () => {
    expect(decide(conMano('3t 3p 9c Kd', null))).toEqual(juega('3t 3p'));
  });
});

describe('IA difícil del Big Two', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const e = conMano('3t 3p 9c Kd 5c 6t 7p', null);
    const v = bigTwo.vistaDe(e, 0);
    const acciones = bigTwo.accionesLegales(e, 0);
    expect(IAS.bigTwo.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.bigTwo.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Big Two', () => {
  const azar = aleatorio<VistaBigTwo, AccionBigTwo>();

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      bigTwo,
      CONFIG_BIG_TWO_POR_DEFECTO,
      iaBigTwoBasica,
      IAS.bigTwo.facil,
      100,
      unoContraTodos(4),
      'sim',
    );
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      bigTwo,
      CONFIG_BIG_TWO_POR_DEFECTO,
      iaBigTwoBasica,
      azar,
      200,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(80);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      bigTwo,
      CONFIG_BIG_TWO_POR_DEFECTO,
      IAS.bigTwo.dificil,
      iaBigTwoBasica,
      2,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
