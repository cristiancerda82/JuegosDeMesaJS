import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  canfield,
  CONFIG_CANFIELD_POR_DEFECTO,
  type AccionCanfield,
  type ConfigCanfield,
  type EstadoCanfield,
} from '../../src/juegos/canfield';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(
  config: ConfigCanfield = CONFIG_CANFIELD_POR_DEFECTO,
  semilla = 'c',
): EstadoCanfield {
  const r = canfield.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

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

/** Mesa con las pilas indicadas; el resto, vacío. Base 9 salvo que se diga otra. */
function mesa(parcial: Partial<EstadoCanfield> = {}): EstadoCanfield {
  return {
    config: CONFIG_CANFIELD_POR_DEFECTO,
    base: 9,
    reserva: [],
    mazo: [],
    descarte: [],
    columnas: [[], [], [], []],
    fundaciones: [[], [], [], []],
    movimientos: 0,
    historial: [],
    abandonada: false,
    ...parcial,
  };
}

function jugar(e: EstadoCanfield, accion: AccionCanfield): EstadoCanfield {
  const r = aplicar(canfield, e, 0, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const esLegal = (e: EstadoCanfield, accion: AccionCanfield) => aplicar(canfield, e, 0, accion).ok;

/** Una fundación completa de ese palo empezando por la base. */
function fundacionCompleta(palo: string, base: number): IdCarta[] {
  return Array.from({ length: 13 }, (_, i) => `${palo}-${((base - 1 + i) % 13) + 1}` as IdCarta);
}

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto del Canfield', () => {
  it('reserva de 13, base en la primera fundación, 4 columnas de 1 y mazo de 34', () => {
    const e = nueva();
    expect(e.reserva).toHaveLength(13);
    expect(e.fundaciones.map((f) => f.length)).toEqual([1, 0, 0, 0]);
    expect(Number(e.fundaciones[0]![0]!.split('-')[1])).toBe(e.base);
    expect(e.columnas.map((col) => col.length)).toEqual([1, 1, 1, 1]);
    expect(e.mazo).toHaveLength(34);
    expect(e.descarte).toEqual([]);
  });

  it('la vista solo muestra la carta de arriba de la reserva', () => {
    const e = nueva();
    const v = canfield.vistaDe(e, 0);
    expect(v.reservaArriba).toBe(e.reserva.at(-1));
    expect(v.reserva).toBe(13);
    const texto = JSON.stringify(v);
    for (const oculta of e.reserva.slice(0, -1)) expect(texto).not.toContain(`"${oculta}"`);
  });

  it('rechaza un robo distinto de 1 o 3', () => {
    expect(canfield.crear({ robo: 2 } as never, 'x').ok).toBe(false);
  });
});

// ── Fundaciones ──────────────────────────────────────────────────────────────

describe('fundaciones con base y vuelta', () => {
  it('una fundación vacía empieza por la base', () => {
    const e = mesa({ columnas: [c('9c'), c('Ac'), [], []] });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'f0', cantidad: 1 })).toBe(false);
  });

  it('después de la K va el As', () => {
    const e = mesa({
      fundaciones: [c('9t 10t Jt Qt Kt'), [], [], []],
      columnas: [c('At'), c('2t'), [], []],
    });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'f0', cantidad: 1 })).toBe(false);
  });
});

// ── Columnas ─────────────────────────────────────────────────────────────────

describe('columnas', () => {
  it('una K va sobre un As de otro color', () => {
    const e = mesa({ reserva: c('5t'), columnas: [c('Ac'), c('Kp'), [], []] });
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'c0', cantidad: 1 })).toBe(true);
  });

  it('rechaza el mismo color', () => {
    const e = mesa({ reserva: c('5c'), columnas: [c('10t'), c('9p'), [], []] });
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'c0', cantidad: 1 })).toBe(false);
  });

  it('mueve un tramo ordenado desde el medio de una columna', () => {
    const e = mesa({ reserva: c('5c'), columnas: [c('2d 10c 9p 8c'), c('Jt'), c('3d'), c('4d')] });
    const tras = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 3 });
    expect(tras.columnas[1]).toEqual(c('Jt 10c 9p 8c'));
    expect(tras.columnas[0]).toEqual(c('2d'));
  });
});

// ── Huecos y reserva ─────────────────────────────────────────────────────────

describe('huecos y reserva', () => {
  it('un hueco se llena solo con la carta de arriba de la reserva', () => {
    const e = mesa({ reserva: c('3d 7t'), columnas: [c('9c'), c('Kp'), c('2d'), c('4d')] });
    const tras = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
    expect(tras.columnas[0]).toEqual(c('7t'));
    expect(tras.reserva).toEqual(c('3d'));
    expect(canfield.vistaDe(tras, 0).reservaArriba).toBe('diamantes-3');
  });

  it('sin reserva, el hueco admite la carta del descarte', () => {
    const e = mesa({ descarte: c('5c'), columnas: [[], c('Kp'), c('2d'), c('4d')] });
    expect(esLegal(e, { tipo: 'mover', desde: 'descarte', hasta: 'c0', cantidad: 1 })).toBe(true);
  });

  it('la carta de arriba de la reserva se juega a una columna', () => {
    const e = mesa({ reserva: c('2c 8c'), columnas: [c('9p'), c('Kp'), c('2d'), c('4d')] });
    const tras = jugar(e, { tipo: 'mover', desde: 'reserva', hasta: 'c0', cantidad: 1 });
    expect(tras.columnas[0]).toEqual(c('9p 8c'));
    expect(tras.reserva).toEqual(c('2c'));
  });

  it('deshacer devuelve la carta del hueco a la reserva', () => {
    const e = mesa({ reserva: c('3d 7t'), columnas: [c('9c'), c('Kp'), c('2d'), c('4d')] });
    const tras = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
    const vuelta = jugar(tras, { tipo: 'deshacer' });
    expect(vuelta.columnas).toEqual(e.columnas);
    expect(vuelta.reserva).toEqual(e.reserva);
    expect(vuelta.fundaciones).toEqual(e.fundaciones);
    expect(vuelta.movimientos).toBe(2);
  });
});

// ── Mazo ─────────────────────────────────────────────────────────────────────

describe('mazo y descarte', () => {
  it('roba de 3, o las que queden', () => {
    const e = mesa({ mazo: c('2c 3c 4c 5c'), columnas: [c('Kp'), [], [], []] });
    const tras = jugar(e, { tipo: 'robar' });
    expect(tras.descarte).toEqual(c('5c 4c 3c'));
    const otra = jugar(tras, { tipo: 'robar' });
    expect(otra.descarte).toHaveLength(4);
    expect(canfield.accionesLegales(otra, 0)).toContainEqual({ tipo: 'reciclar' });
  });

  it('roba de 1 con la opción', () => {
    const e = mesa({ config: { robo: 1 }, mazo: c('2c 3c 4c'), columnas: [c('Kp'), [], [], []] });
    expect(jugar(e, { tipo: 'robar' }).descarte).toEqual(c('4c'));
  });

  it('reciclar sin límite devuelve el mazo en el mismo orden', () => {
    const e = mesa({ mazo: c('2c 3c 4c'), columnas: [c('Kp'), [], [], []] });
    let tras = jugar(e, { tipo: 'robar' });
    tras = jugar(tras, { tipo: 'reciclar' });
    expect(tras.mazo).toEqual(e.mazo);
    tras = jugar(jugar(tras, { tipo: 'robar' }), { tipo: 'reciclar' });
    expect(tras.mazo).toEqual(e.mazo);
  });
});

// ── Autocompletar y victoria ─────────────────────────────────────────────────

describe('autocompletar y victoria', () => {
  it('autocompleta cuando todo puede subir', () => {
    const e = mesa({
      fundaciones: [
        fundacionCompleta('picas', 9),
        fundacionCompleta('corazones', 9),
        fundacionCompleta('diamantes', 9),
        fundacionCompleta('treboles', 9).slice(0, 10),
      ],
      // De abajo arriba: el 6 queda arriba y sube primero.
      columnas: [c('8t 7t 6t'), [], [], []],
    });
    expect(canfield.accionesLegales(e, 0)).toContainEqual({ tipo: 'autocompletar' });
    const fin = jugar(e, { tipo: 'autocompletar' });
    expect(canfield.resultado(fin)).toEqual({ ganadores: [0], empate: false });
    expect(canfield.vistaDe(fin, 0).situacion).toBe('victoria');
  });

  it('sin autocompletar si una carta que falta queda tapada por la última de su fundación', () => {
    // Base 9: el 9 de picas está tapado por el 8 de corazones, que espera al 7 de corazones, que
    // está debajo del 9.
    const e = mesa({
      fundaciones: [
        [],
        fundacionCompleta('corazones', 9).slice(0, 11),
        fundacionCompleta('diamantes', 9),
        fundacionCompleta('treboles', 9),
      ],
      columnas: [c('7c 9p 8c'), fundacionCompleta('picas', 9).slice(1).reverse(), [], []],
    });
    expect(canfield.accionesLegales(e, 0)).not.toContainEqual({ tipo: 'autocompletar' });
  });

  it('abandonar termina la partida sin ganador', () => {
    const fin = jugar(nueva(), { tipo: 'abandonar' });
    expect(canfield.resultado(fin)).toEqual({ ganadores: [], empate: false });
  });
});

describirContrato(canfield, {
  configs: [CONFIG_CANFIELD_POR_DEFECTO, { robo: 1 }],
  cartasOcultas: (e) => [...e.mazo, ...e.reserva.slice(0, -1)],
  pasosMaximos: 200,
  ejecuciones: 40,
  evitar: (a) => a.tipo === 'abandonar',
});
