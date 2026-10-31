import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaPiquetBasica } from '../../src/ia/piquet-basica';
import {
  declararPiquet,
  piquet,
  type AccionPiquet,
  type EstadoPiquet,
  type VistaPiquet,
} from '../../src/juegos/piquet';
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

/** Partidas cortas para las pruebas. */
const CORTA = { manos: 2 };

function enBazas(parcial: Partial<EstadoPiquet>): EstadoPiquet {
  const r = piquet.crear(CORTA, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    fase: 'bazas',
    monton: [],
    cambiadas: [5, 3],
    declaraciones: declararPiquet([[], []]),
    ...parcial,
  };
}

const decide = (e: EstadoPiquet) =>
  iaPiquetBasica.decidir(
    piquet.vistaDe(e, e.turno),
    piquet.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Piquet', () => {
  it('gana con lo justo', () => {
    const e = enBazas({
      turno: 1,
      manos: [c('7d'), c('Kp Ap 7p')],
      mesa: [{ asiento: 0, carta: una('Qp') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Kp') });
  });

  it('sin poder ganar, la más baja', () => {
    const e = enBazas({
      turno: 1,
      manos: [c('7d'), c('8c Kc')],
      mesa: [{ asiento: 0, carta: una('Ac') }],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('8c') });
  });

  it('el mayor descarta al menos una carta y después roba', () => {
    const r = piquet.crear(CORTA, 'cambio');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    const primera = decide(e);
    expect(primera.tipo).toBe('descartar');
    for (let i = 0; i < 6 && e.turno === 0; i++) e = piquet.transicion(e, 0, decide(e));
    expect(e.turno).toBe(1);
    expect(e.cambiadas[0]).toBeGreaterThanOrEqual(1);
    expect(e.cambiadas[0]).toBeLessThanOrEqual(5);
  });
});

describe('IA difícil del Piquet', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = piquet.crear(CORTA, 'dificil');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    for (let i = 0; e.fase === 'cambio' && i < 20; i++)
      e = piquet.transicion(e, e.turno, decide(e));
    const v = piquet.vistaDe(e, e.turno);
    const acciones = piquet.accionesLegales(e, e.turno);
    expect(IAS.piquet.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.piquet.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Piquet', () => {
  const azar = aleatorio<VistaPiquet, AccionPiquet>();
  const dos = unoContraTodos(2);

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(piquet, CORTA, iaPiquetBasica, IAS.piquet.facil, 100, dos, 'sim');
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(piquet, CORTA, iaPiquetBasica, azar, 200, dos, 'azar');
    expect(r.ganadas).toBeGreaterThan(130);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(piquet, CORTA, IAS.piquet.dificil, iaPiquetBasica, 1, dos, 'tiempo');
    expect(r.maxMs).toBeLessThan(500);
  });
});
