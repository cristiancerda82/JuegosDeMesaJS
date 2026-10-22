import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_TRIPEAKS_POR_DEFECTO,
  libreEnTriPeaks,
  tapadorasTriPeaks,
  tripeaks,
  type AccionTriPeaks,
  type EstadoTriPeaks,
} from '../../src/juegos/tripeaks';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

function nueva(semilla = 'tripeaks'): EstadoTriPeaks {
  const r = tripeaks.crear(CONFIG_TRIPEAKS_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTriPeaks, accion: AccionTriPeaks): EstadoTriPeaks {
  const r = aplicar(tripeaks, e, 0, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)}: ${r.error}`);
  return r.valor;
}

const quitables = (e: EstadoTriPeaks) =>
  tripeaks.accionesLegales(e, 0).flatMap((a) => (a.tipo === 'quitar' ? [a.posicion] : []));

/** Picos vacíos salvo las cartas dadas en sus posiciones. */
function picosCon(cartas: Record<number, IdCarta>): (IdCarta | null)[] {
  return Array.from({ length: 28 }, (_, i) => cartas[i] ?? null);
}

function con(
  cartas: Record<number, IdCarta>,
  arriba: IdCarta,
  parcial: Partial<EstadoTriPeaks> = {},
) {
  return { ...nueva(), picos: picosCon(cartas), descarte: [arriba], ...parcial };
}

describe('reparto de TriPeaks', () => {
  it('28 cartas en los picos (10 boca arriba), una en el descarte y 23 en el mazo', () => {
    const e = nueva();
    expect(e.picos).toHaveLength(28);
    expect(e.descarte).toHaveLength(1);
    expect(e.mazo).toHaveLength(23);
    expect(new Set([...e.picos, ...e.descarte, ...e.mazo]).size).toBe(52);
    const v = tripeaks.vistaDe(e, 0);
    expect(v.picos.filter((c) => c !== 'oculta')).toHaveLength(10);
    expect(v.picos.slice(18)).toEqual(e.picos.slice(18));
  });

  it('cada carta la tapan las dos de la fila de debajo', () => {
    expect(tapadorasTriPeaks(0)).toEqual([3, 4]);
    expect(tapadorasTriPeaks(2)).toEqual([7, 8]);
    expect(tapadorasTriPeaks(3)).toEqual([9, 10]);
    expect(tapadorasTriPeaks(5)).toEqual([12, 13]);
    expect(tapadorasTriPeaks(8)).toEqual([16, 17]);
    expect(tapadorasTriPeaks(9)).toEqual([18, 19]);
    expect(tapadorasTriPeaks(17)).toEqual([26, 27]);
    expect(tapadorasTriPeaks(27)).toEqual([]);
  });
});

describe('quitar cartas', () => {
  it('una más o una menos que el descarte, sin nada encima', () => {
    const e = con({ 18: 'picas-6', 19: 'corazones-8', 20: 'treboles-9' }, 'diamantes-7');
    expect(quitables(e)).toEqual([18, 19]);
  });

  it('con vuelta: un As sobre una K', () => {
    expect(quitables(con({ 27: 'picas-1' }, 'corazones-13'))).toEqual([27]);
  });

  it('una carta tapada no se quita y se descubre al quitar las dos que la tapan', () => {
    let e = con({ 9: 'picas-9', 18: 'corazones-8', 19: 'treboles-7' }, 'diamantes-9');
    expect(libreEnTriPeaks(e.picos, 9)).toBe(false);
    expect(tripeaks.vistaDe(e, 0).picos[9]).toBe('oculta');
    e = hacer(e, { tipo: 'quitar', posicion: 18 });
    e = hacer(e, { tipo: 'quitar', posicion: 19 });
    expect(tripeaks.vistaDe(e, 0).picos[9]).toBe('picas-9');
    expect(aplicar(tripeaks, e, 0, { tipo: 'quitar', posicion: 9 }).ok).toBe(false);
    e = hacer(e, { tipo: 'robar' });
    // Con un 8 o un 10 arriba, el 9 descubierto ya se puede quitar.
    expect(libreEnTriPeaks(e.picos, 9)).toBe(true);
  });
});

describe('mazo y puntos', () => {
  it('robar pasa la carta al descarte; con el mazo vacío no se roba', () => {
    const e = hacer(nueva(), { tipo: 'robar' });
    expect(e.mazo).toHaveLength(22);
    expect(e.descarte).toHaveLength(2);
    const vacio = { ...nueva(), mazo: [] };
    expect(tripeaks.accionesLegales(vacio, 0)).not.toContainEqual({ tipo: 'robar' });
  });

  it('una racha de tres suma 1 + 2 + 3; robar la corta', () => {
    let e = con(
      { 18: 'picas-6', 19: 'corazones-5', 20: 'treboles-4', 21: 'treboles-3' },
      'diamantes-7',
      { mazo: ['picas-13', 'corazones-4'] },
    );
    for (const posicion of [18, 19, 20]) e = hacer(e, { tipo: 'quitar', posicion });
    expect(e.puntos).toBe(6);
    expect(e.racha).toBe(3);
    e = hacer(e, { tipo: 'robar' });
    expect(e.racha).toBe(0);
    e = hacer(e, { tipo: 'quitar', posicion: 21 });
    expect(e.puntos).toBe(7);
  });

  it('despejar un pico suma 15; los tres, 30 más', () => {
    let e = con({ 0: 'picas-5', 1: 'picas-4', 2: 'picas-3' }, 'corazones-6', { racha: 3 });
    e = hacer(e, { tipo: 'quitar', posicion: 0 });
    expect(e.puntos).toBe(4 + 15);
    e = hacer(e, { tipo: 'quitar', posicion: 1 });
    e = hacer(e, { tipo: 'quitar', posicion: 2 });
    expect(e.puntos).toBe(19 + 5 + 15 + 6 + 15 + 30);
    expect(tripeaks.vistaDe(e, 0).situacion).toBe('victoria');
    expect(tripeaks.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [90] });
    expect(tripeaks.accionesLegales(e, 0)).toEqual([]);
  });
});

describe('deshacer y abandonar', () => {
  it('deshacer devuelve la carta, los puntos y la racha, y suma un movimiento', () => {
    const antes = con({ 18: 'picas-6', 27: 'picas-12' }, 'diamantes-7', { puntos: 10, racha: 2 });
    const quitada = hacer(antes, { tipo: 'quitar', posicion: 18 });
    expect(quitada.puntos).toBe(13);
    const deshecha = hacer(quitada, { tipo: 'deshacer' });
    expect(deshecha.picos).toEqual(antes.picos);
    expect(deshecha.puntos).toBe(10);
    expect(deshecha.racha).toBe(2);
    expect(deshecha.movimientos).toBe(2);
  });

  it('abandonar termina sin victoria y con los puntos', () => {
    const e = hacer({ ...nueva(), puntos: 12 }, { tipo: 'abandonar' });
    expect(tripeaks.resultado(e)).toEqual({ ganadores: [], empate: false, puntos: [12] });
    expect(tripeaks.vistaDe(e, 0).situacion).toBe('abandono');
  });
});

describirContrato(tripeaks, {
  configs: [CONFIG_TRIPEAKS_POR_DEFECTO],
  cartasOcultas: (e) => [
    ...e.picos.flatMap((c, i) => (c !== null && !libreEnTriPeaks(e.picos, i) ? [c] : [])),
    ...e.mazo,
  ],
  pasosMaximos: 200,
  ejecuciones: 30,
});
