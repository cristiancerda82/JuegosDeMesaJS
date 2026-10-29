import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaBeziqueBasica } from '../../src/ia/bezique-basica';
import { IAS } from '../../src/ia/ias';
import {
  bezique,
  type AccionBezique,
  type EstadoBezique,
  type UsadasBezique,
  type VistaBezique,
} from '../../src/juegos/bezique';
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
const una = (t: string) => c(t)[0]!;
const sinUsadas = (): UsadasBezique => ({
  matrimonio: [],
  bezique: [],
  dobleBezique: [],
  cuatroJ: [],
  cuatroQ: [],
  cuatroK: [],
  cuatroA: [],
  escalera: [],
  siete: [],
});

/** Partidas cortas para las pruebas. */
const CORTA = { objetivo: 300 };

function preparado(parcial: Partial<EstadoBezique>): EstadoBezique {
  const r = bezique.crear(CORTA, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    triunfo: 'corazones',
    vuelta: una('9c'),
    cantadas: [[], []],
    fase: 'bazas',
    turno: 0,
    mesa: [],
    usadas: [sinUsadas(), sinUsadas()],
    cantes: [],
    ...parcial,
  };
}

const decide = (e: EstadoBezique) =>
  iaBeziqueBasica.decidir(
    bezique.vistaDe(e, e.turno),
    bezique.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Bezique', () => {
  it('canta lo que más vale', () => {
    const e = preparado({
      fase: 'declarar',
      manos: [c('Kp Kc Kd Kt Qp 8t'), c('Ap')],
    });
    expect(decide(e)).toEqual({
      tipo: 'cantar',
      cante: 'cuatroK',
      cartas: c('Kp Kc Kd Kt').sort(),
    });
  });

  it('gana un As con la carta justa', () => {
    const e = preparado({
      manos: [c('Kp 8d 7c Ac'), c('At 9p')],
      turno: 1,
      mesa: [],
    });
    // Sale el 1 con el As de tréboles; responde el 0.
    const salida = { ...e, turno: 0, mesa: [{ asiento: 1, carta: una('At') }] };
    expect(decide(salida)).toEqual({ tipo: 'jugar', carta: una('7c') });
  });

  it('al salir con mazo, la más baja que no sea triunfo, brisque ni de una combinación', () => {
    const e = preparado({ manos: [c('Kp Qp 8d 9t Ac'), c('At')] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('8d') });
  });

  it('en las últimas bazas, gana con lo mínimo', () => {
    const e = preparado({
      fase: 'final',
      mazo: [],
      vuelta: null,
      manos: [c('8d Ad 10d'), c('9d')],
      mesa: [{ asiento: 1, carta: una('9d') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('10d') });
  });
});

describe('IA difícil del Bezique', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = bezique.crear(CORTA, 'dificil');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const v = bezique.vistaDe(e, 0);
    const acciones = bezique.accionesLegales(e, 0);
    expect(IAS.bezique.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.bezique.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Bezique', () => {
  const azar = aleatorio<VistaBezique, AccionBezique>();
  const dos = unoContraTodos(2);

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(bezique, CORTA, iaBeziqueBasica, IAS.bezique.facil, 100, dos, 'sim');
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(bezique, CORTA, iaBeziqueBasica, azar, 200, dos, 'azar');
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(bezique, CORTA, IAS.bezique.dificil, iaBeziqueBasica, 1, dos, 'tiempo');
    expect(r.maxMs).toBeLessThan(500);
  });
});
