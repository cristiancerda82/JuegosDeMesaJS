import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  belleLucie,
  CONFIG_BELLE_LUCIE_POR_DEFECTO,
  type AccionBelleLucie,
  type EstadoBelleLucie,
} from '../../src/juegos/belle-lucie';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

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

function nueva(semilla = 'lucie'): EstadoBelleLucie {
  const r = belleLucie.crear(CONFIG_BELLE_LUCIE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Mesa con estos abanicos (cartas de abajo arriba). */
function mesa(abanicos: string[], parcial: Partial<EstadoBelleLucie> = {}): EstadoBelleLucie {
  return {
    ...nueva(),
    abanicos: abanicos.map(c),
    fundaciones: { picas: 0, corazones: 0, diamantes: 0, treboles: 0 },
    historial: [],
    movimientos: 0,
    ...parcial,
  };
}

const hacer = (e: EstadoBelleLucie, a: AccionBelleLucie) => {
  const r = aplicar(belleLucie, e, 0, a);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};
const esLegal = (e: EstadoBelleLucie, a: AccionBelleLucie) => aplicar(belleLucie, e, 0, a).ok;

describe('Reparto de La Belle Lucie', () => {
  it('17 abanicos de 3 y uno de 1, con las fundaciones vacías', () => {
    const e = nueva();
    expect(e.abanicos.map((a) => a.length)).toEqual([...new Array(17).fill(3), 1]);
    expect(new Set(e.abanicos.flat()).size).toBe(52);
    expect(Object.values(e.fundaciones)).toEqual([0, 0, 0, 0]);
    expect(e.rebarajes).toBe(2);
  });
});

describe('Mover en La Belle Lucie', () => {
  it('el As sube a su fundación y después el 2', () => {
    let e = mesa(['5p 2c Ac', '9t']);
    e = hacer(e, { tipo: 'fundacion', abanico: 0 });
    expect(e.fundaciones.corazones).toBe(1);
    e = hacer(e, { tipo: 'fundacion', abanico: 0 });
    expect(e.fundaciones.corazones).toBe(2);
    expect(e.abanicos[0]).toEqual(c('5p'));
  });

  it('solo sobre la siguiente más alta del mismo palo', () => {
    const e = mesa(['3c 6p', '7p', '7t', '8p']);
    expect(esLegal(e, { tipo: 'mover', desde: 0, hasta: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 0, hasta: 2 })).toBe(false);
    expect(esLegal(e, { tipo: 'mover', desde: 0, hasta: 3 })).toBe(false);
    expect(hacer(e, { tipo: 'mover', desde: 0, hasta: 1 }).abanicos[1]).toEqual(c('7p 6p'));
  });

  it('un abanico vacío no admite cartas', () => {
    const e = mesa(['', '6p']);
    expect(belleLucie.accionesLegales(e, 0).filter((a) => a.tipo === 'mover')).toEqual([]);
  });
});

describe('Rebarajes de La Belle Lucie', () => {
  it('recoge, baraja y reparte de 3 en 3', () => {
    const e = nueva();
    const cuarenta = { ...e, abanicos: [...e.abanicos.slice(0, 13), [e.abanicos[13]![0]!]] };
    const r = hacer(cuarenta, { tipo: 'rebarajar' });
    expect(r.abanicos.map((a) => a.length)).toEqual([...new Array(13).fill(3), 1]);
    expect([...r.abanicos.flat()].sort()).toEqual([...cuarenta.abanicos.flat()].sort());
    expect(r.rebarajes).toBe(1);
    expect(r.merci).toBe('pendiente');
  });

  it('dos veces; tras el último, la merci', () => {
    let e = hacer(nueva(), { tipo: 'rebarajar' });
    e = hacer(e, { tipo: 'rebarajar' });
    expect(e.rebarajes).toBe(0);
    expect(e.merci).toBe('disponible');
    expect(esLegal(e, { tipo: 'rebarajar' })).toBe(false);
  });
});

describe('Merci de La Belle Lucie', () => {
  it('pone arriba una carta de debajo, una sola vez', () => {
    let e = mesa(['5p 2c 9t', '4d'], { rebarajes: 0, merci: 'disponible' });
    e = hacer(e, { tipo: 'merci', abanico: 0, indice: 1 });
    expect(e.abanicos[0]).toEqual(c('5p 9t 2c'));
    expect(e.merci).toBe('usada');
    expect(belleLucie.accionesLegales(e, 0).some((a) => a.tipo === 'merci')).toBe(false);
  });

  it('no antes del último rebaraje', () => {
    const e = mesa(['5p 2c 9t'], { rebarajes: 1, merci: 'pendiente' });
    expect(esLegal(e, { tipo: 'merci', abanico: 0, indice: 1 })).toBe(false);
  });
});

describe('Deshacer, victoria y abandono', () => {
  it('deshacer un rebaraje', () => {
    const e = nueva();
    const r = hacer(hacer(e, { tipo: 'rebarajar' }), { tipo: 'deshacer' });
    expect(r.abanicos).toEqual(e.abanicos);
    expect(r.rebarajes).toBe(2);
  });

  it('victoria al subir el último K', () => {
    const e = mesa(['Kp'], {
      fundaciones: { picas: 12, corazones: 13, diamantes: 13, treboles: 13 },
    });
    const r = hacer(e, { tipo: 'fundacion', abanico: 0 });
    expect(belleLucie.resultado(r)).toEqual({ ganadores: [0], empate: false });
    expect(belleLucie.vistaDe(r, 0).situacion).toBe('victoria');
  });

  it('abandonar', () => {
    const r = hacer(nueva(), { tipo: 'abandonar' });
    expect(belleLucie.resultado(r)).toEqual({ ganadores: [], empate: false });
  });
});

describirContrato(belleLucie, {
  configs: [CONFIG_BELLE_LUCIE_POR_DEFECTO],
  cartasOcultas: () => [],
  pasosMaximos: 200,
  ejecuciones: 40,
  evitar: (a) => a.tipo === 'abandonar',
});
