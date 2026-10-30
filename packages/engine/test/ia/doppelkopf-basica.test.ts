import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaDoppelkopfBasica } from '../../src/ia/doppelkopf-basica';
import { IAS } from '../../src/ia/ias';
import {
  doppelkopf,
  type AccionDoppelkopf,
  type EstadoDoppelkopf,
  type VistaDoppelkopf,
} from '../../src/juegos/doppelkopf';
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

/** Un juego normal en bazas; Re son el 0 y el 2. */
function preparado(parcial: Partial<EstadoDoppelkopf>): EstadoDoppelkopf {
  const r = doppelkopf.crear(CORTA, 'ia');
  if (!r.ok) throw new Error(r.error);
  return {
    ...r.valor,
    fase: 'bazas',
    reservas: ['sano', 'sano', 'sano', 'sano'],
    juego: 'normal',
    re: [0, 2],
    ...parcial,
  };
}

const decide = (e: EstadoDoppelkopf) =>
  iaDoppelkopfBasica.decidir(
    doppelkopf.vistaDe(e, e.turno),
    doppelkopf.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Doppelkopf', () => {
  it('carga a su pareja cuando sabe que va ganando', () => {
    // El 2 jugó la Q de tréboles (se sabe Re) y va ganando; el 0 (Re) no tiene triunfos.
    const e = preparado({
      turno: 0,
      manos: [c('Ap 9p'), c('9t'), c('9t'), c('9t')],
      mesa: [
        { asiento: 2, carta: una('Qt') },
        { asiento: 3, carta: una('Jd') },
      ],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ap') });
  });

  it('gana con lo justo una baza con puntos', () => {
    const e = preparado({
      turno: 1,
      manos: [c('9t'), c('Jc Qt 9p'), c('9t'), c('9t')],
      mesa: [
        { asiento: 3, carta: una('Ad') },
        { asiento: 0, carta: una('Jd') },
      ],
      re: [0, 2],
    });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Jc') });
  });

  it('sale con un As de un palo que aún no ha salido', () => {
    const e = preparado({ turno: 0, manos: [c('9p Ac Jd'), c('9t'), c('9t'), c('9t')] });
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('Ac') });
  });

  it('pide solo de Damas con cinco Damas', () => {
    const e = {
      ...preparado({}),
      fase: 'reservas' as const,
      turno: 0,
      manos: [c('Qt Qp Qc Qd Qd 9p 9p 9c 9c Kt Kt 9t'), c('9t'), c('9t'), c('9t')],
    };
    expect(decide(e)).toEqual({ tipo: 'reservar', reserva: 'damas' });
  });

  it('anuncia Re con muchos triunfos altos', () => {
    const e = preparado({
      turno: 0,
      manos: [c('10c Qt Qp Jc Jd Ad 9d 9p 9p 9c Kt Kt'), c('9t'), c('9t'), c('9t')],
    });
    expect(decide(e)).toEqual({ tipo: 'anunciar' });
  });
});

describe('IA difícil del Doppelkopf', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    const r = doppelkopf.crear(CORTA, 'dificil');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    for (let i = 0; i < 4; i++) {
      e = doppelkopf.transicion(e, e.turno, doppelkopf.accionesLegales(e, e.turno).at(-1)!);
    }
    const v = doppelkopf.vistaDe(e, e.turno);
    const acciones = doppelkopf.accionesLegales(e, e.turno);
    expect(IAS.doppelkopf.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.doppelkopf.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Doppelkopf', () => {
  const azar = aleatorio<VistaDoppelkopf, AccionDoppelkopf>();
  const uno = unoContraTodos(4);

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(doppelkopf, CORTA, iaDoppelkopfBasica, IAS.doppelkopf.facil, 100, uno, 'sim');
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(doppelkopf, CORTA, iaDoppelkopfBasica, azar, 200, uno, 'azar');
    expect(r.ganadas).toBeGreaterThan(120);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      doppelkopf,
      { manos: 1 },
      IAS.doppelkopf.dificil,
      iaDoppelkopfBasica,
      1,
      uno,
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
