import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_PICAS_POR_DEFECTO,
  picas,
  puntuarManoPicas,
  type AccionPicas,
  type EstadoPicas,
} from '../../src/juegos/picas';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

function nueva(semilla = 'picas'): EstadoPicas {
  const r = picas.crear(CONFIG_PICAS_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoPicas, accion: AccionPicas): EstadoPicas {
  const r = aplicar(picas, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const cartasLegales = (e: EstadoPicas) =>
  picas.accionesLegales(e, e.turno).flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));

/** Un estado en fase de bazas armado a mano, con turno del asiento 0. */
function enBazas(manos: IdCarta[][], parcial: Partial<EstadoPicas> = {}): EstadoPicas {
  return {
    ...nueva(),
    manos,
    fase: 'bazas',
    turno: 0,
    apuestas: [3, 3, 3, 3],
    ...parcial,
  };
}

describe('reparto y apuesta', () => {
  it('13 cartas a cada uno y apuesta primero el asiento 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
    expect(new Set(e.manos.flat()).size).toBe(52);
    expect(e.repartidor).toBe(3);
    expect(e.fase).toBe('apuesta');
    expect(e.turno).toBe(0);
    expect(picas.accionesLegales(e, 0)).toHaveLength(14);
  });

  it('contratos: la suma de la pareja sin los Nil; después salen bazas', () => {
    let e = nueva();
    for (const bazas of [4, 0, 3, 5]) e = hacer(e, { tipo: 'apostar', bazas });
    const v = picas.vistaDe(e, 2);
    expect(v.apuestas).toEqual([4, 0, 3, 5]);
    expect(v.contratos).toEqual([7, 5]);
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
  });
});

describe('bazas', () => {
  const manos: IdCarta[][] = [
    ['corazones-5', 'picas-3', 'treboles-9'],
    ['corazones-1', 'corazones-4', 'diamantes-2'],
    ['diamantes-7', 'picas-2', 'treboles-3'],
    ['corazones-13', 'picas-12', 'diamantes-1'],
  ];

  it('hay que seguir el palo de salida', () => {
    const e = hacer(enBazas(manos), { tipo: 'jugar', carta: 'corazones-5' });
    expect(cartasLegales(e)).toEqual(['corazones-1', 'corazones-4']);
  });

  it('una pica gana al As del palo de salida y rompe las picas', () => {
    let e = enBazas(manos, { turno: 1 });
    e = hacer(e, { tipo: 'jugar', carta: 'corazones-1' });
    e = hacer(e, { tipo: 'jugar', carta: 'picas-2' });
    expect(e.rotas).toBe(true);
    expect(e.fallos[2]).toEqual(['corazones']);
    e = hacer(e, { tipo: 'jugar', carta: 'corazones-13' });
    e = hacer(e, { tipo: 'jugar', carta: 'corazones-5' });
    expect(e.ultimaBaza!.ganador).toBe(2);
    expect(e.bazas).toEqual([0, 0, 1, 0]);
    expect(e.turno).toBe(2);
  });

  it('sin picas rotas no se sale de picas, salvo con solo picas', () => {
    expect(cartasLegales(enBazas(manos))).toEqual(['corazones-5', 'treboles-9']);
    const soloPicas = enBazas([['picas-3', 'picas-4'], ...manos.slice(1)]);
    expect(cartasLegales(soloPicas)).toEqual(['picas-3', 'picas-4']);
    expect(cartasLegales(enBazas(manos, { rotas: true }))).toContain('picas-3');
  });
});

describe('puntos de la mano', () => {
  it('cumplir con sacos: contrato 7 y 9 bazas son 72 y 2 sacos', () => {
    const r = puntuarManoPicas([4, 3, 3, 2], [5, 2, 4, 2], [0, 0]);
    expect(r.contratos).toEqual([7, 5]);
    expect(r.puntosMano[0]).toBe(72);
    expect(r.sacosMano[0]).toBe(2);
  });

  it('no cumplir: contrato 5 y 4 bazas son −50', () => {
    const r = puntuarManoPicas([4, 3, 3, 2], [5, 2, 4, 2], [0, 0]);
    expect(r.puntosMano[1]).toBe(-50);
    expect(r.sacosMano[1]).toBe(0);
  });

  it('Nil cumplido y Nil fallado; la baza del Nil es un saco', () => {
    // Asiento 0: Nil con 1 baza; asiento 2: 4 y hace 4. Asiento 1: Nil limpio; asiento 3: 5 y 8.
    const r = puntuarManoPicas([0, 0, 4, 5], [1, 0, 4, 8], [0, 0]);
    expect(r.puntosMano).toEqual([40 - 100, 50 + 3 + 100]);
    expect(r.sacosMano).toEqual([1, 3]);
  });

  it('diez sacos: −100 y se descuentan 10', () => {
    // La pareja 0–2: contrato 6 y 9 bazas, 3 sacos que con los 8 de antes pasan de 10.
    const r = puntuarManoPicas([3, 3, 3, 3], [5, 1, 4, 3], [8, 0]);
    expect(r.puntosMano[0]).toBe(63 - 100);
    expect(r.penalizacion).toEqual([true, false]);
    expect(r.sacosTras).toEqual([1, 0]);
  });
});

describe('partida', () => {
  /** La última baza de una mano: cada uno juega su única carta. */
  function ultimaBaza(puntos: [number, number], bazas = [0, 1, 1, 0]): EstadoPicas {
    let e = enBazas([['corazones-1'], ['corazones-2'], ['corazones-3'], ['corazones-4']], {
      apuestas: [1, 1, 1, 1],
      bazas,
      puntos,
    });
    for (let i = 0; i < 4; i++) e = hacer(e, { tipo: 'jugar', carta: e.manos[e.turno]![0]! });
    return e;
  }

  it('al acabar la mano se reparte otra con el repartidor siguiente', () => {
    const e = ultimaBaza([0, 0]);
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.puntos).toEqual([20, -20]);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.fase).toBe('apuesta');
    expect(picas.resultado(e)).toBeNull();
  });

  it('llegar a 500 termina la partida', () => {
    const e = ultimaBaza([495, 470]);
    expect(picas.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [515, 450, 515, 450],
    });
  });

  it('si las dos pasan de 500 gana la que más tiene', () => {
    // Las dos parejas cumplen: +20 cada una.
    const e = ultimaBaza([485, 495], [0, 1, 1, 1]);
    expect(e.puntos).toEqual([505, 515]);
    expect(picas.resultado(e)!.ganadores).toEqual([1, 3]);
  });

  it('con empate por encima de 500 se juega otra mano', () => {
    const e = ultimaBaza([490, 490], [0, 1, 1, 1]);
    expect(e.puntos).toEqual([510, 510]);
    expect(picas.resultado(e)).toBeNull();
  });
});

describe('vista de Picas', () => {
  it('ve su mano y las jugadas, no las manos ajenas', () => {
    let e = nueva();
    for (const bazas of [3, 3, 3, 3]) e = hacer(e, { tipo: 'apostar', bazas });
    const carta = picas.accionesLegales(e, 0)[0]! as Extract<AccionPicas, { tipo: 'jugar' }>;
    e = hacer(e, carta);
    const v = picas.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([12, 13, 13, 13]);
    expect(v.mesa).toEqual([{ asiento: 0, carta: carta.carta }]);
    expect(v.jugadas).toEqual([]);
  });
});

describirContrato(picas, {
  configs: [CONFIG_PICAS_POR_DEFECTO],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta));
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => !vistas.has(c));
  },
  pasosMaximos: 300,
  ejecuciones: 20,
});
