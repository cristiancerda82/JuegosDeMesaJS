import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_PIRAMIDE_POR_DEFECTO,
  CARTAS_PIRAMIDE,
  libreEnPiramide,
  piramide,
  tapadorasPiramide,
  type AccionPiramide,
  type EstadoPiramide,
} from '../../src/juegos/piramide';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(pasadas: 1 | 3 | null = 3, semilla = 'pi'): EstadoPiramide {
  const r = piramide.crear({ pasadas }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoPiramide, accion: AccionPiramide): EstadoPiramide {
  const r = aplicar(piramide, e, 0, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoPiramide) => piramide.accionesLegales(e, 0);
const quitar = (...cartas: (number | 'descarte')[]) =>
  ({
    tipo: 'quitar',
    cartas: cartas.map((c) => (c === 'descarte' ? { descarte: true } : { piramide: c })),
  }) as AccionPiramide;

/** Una pirámide de relleno sin parejas: todo cuatros, que con otro cuatro suman 8. */
function relleno(): (IdCarta | null)[] {
  return new Array<IdCarta | null>(CARTAS_PIRAMIDE).fill('picas-4');
}

/** Un estado armado a mano con la pirámide, el mazo y el descarte dados. */
function con(parcial: Partial<EstadoPiramide>): EstadoPiramide {
  return { ...nueva(), mazo: [], descarte: [], ...parcial };
}

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto de la Pirámide', () => {
  it('28 cartas en la pirámide, 24 en el mazo y descarte vacío', () => {
    const e = nueva();
    expect(e.piramide).toHaveLength(28);
    expect(e.piramide.every((c) => c !== null)).toBe(true);
    expect(e.mazo).toHaveLength(24);
    expect(e.descarte).toEqual([]);
    expect(new Set([...e.piramide, ...e.mazo]).size).toBe(52);
  });

  it('valida la configuración', () => {
    expect(piramide.crear({ pasadas: 2 as 1 }, 'x').ok).toBe(false);
    expect(piramide.crear({ pasadas: null }, 'x').ok).toBe(true);
    expect(CONFIG_PIRAMIDE_POR_DEFECTO.pasadas).toBe(3);
  });

  it('cada carta la tapan las dos de debajo', () => {
    expect(tapadorasPiramide(0)).toEqual([1, 2]);
    expect(tapadorasPiramide(2)).toEqual([4, 5]);
    expect(tapadorasPiramide(21)).toEqual([]);
  });
});

// ── Cartas libres ────────────────────────────────────────────────────────────

describe('cartas libres', () => {
  it('la última fila está libre y el resto no', () => {
    const p = nueva().piramide;
    for (let i = 0; i < 28; i++) expect(libreEnPiramide(p, i)).toBe(i >= 21);
  });

  it('una carta queda libre al quitar sus dos tapadoras, no con una sola', () => {
    const p = [...nueva().piramide];
    p[21] = null;
    expect(libreEnPiramide(p, 15)).toBe(false);
    p[22] = null;
    expect(libreEnPiramide(p, 15)).toBe(true);
  });
});

// ── Quitar ───────────────────────────────────────────────────────────────────

describe('quitar parejas y reyes', () => {
  it('pareja de la última fila', () => {
    const p = relleno();
    p[21] = 'corazones-6';
    p[22] = 'treboles-7';
    const e = con({ piramide: p });
    expect(legales(e)).toContainEqual(quitar(21, 22));
    const f = hacer(e, quitar(21, 22));
    expect(f.piramide[21]).toBeNull();
    expect(f.piramide[22]).toBeNull();
    expect(f.movimientos).toBe(1);
  });

  it('pareja con el descarte', () => {
    const p = relleno();
    p[27] = 'picas-1';
    const e = con({ piramide: p, descarte: ['diamantes-5', 'corazones-12'] });
    expect(legales(e)).toContainEqual(quitar(27, 'descarte'));
    const f = hacer(e, quitar(27, 'descarte'));
    expect(f.descarte).toEqual(['diamantes-5']);
  });

  it('una K libre se quita sola', () => {
    const p = relleno();
    p[24] = 'treboles-13';
    expect(legales(con({ piramide: p }))).toContainEqual(quitar(24));
  });

  it('una carta tapada no cuenta', () => {
    const p = relleno();
    p[15] = 'picas-8';
    p[21] = 'corazones-5';
    const acciones = legales(con({ piramide: p }));
    expect(acciones.some((a) => a.tipo === 'quitar')).toBe(false);
  });
});

// ── Mazo ─────────────────────────────────────────────────────────────────────

describe('mazo y pasadas', () => {
  it('robar pasa la carta de arriba al descarte', () => {
    const e = nueva();
    const arriba = e.mazo.at(-1)!;
    const f = hacer(e, { tipo: 'robar' });
    expect(f.mazo).toHaveLength(23);
    expect(f.descarte.at(-1)).toBe(arriba);
  });

  it('al reciclar se roba en el mismo orden', () => {
    let e = nueva();
    const orden: IdCarta[] = [];
    for (let i = 0; i < 24; i++) {
      orden.push(e.mazo.at(-1)!);
      e = hacer(e, { tipo: 'robar' });
    }
    expect(legales(e)).toContainEqual({ tipo: 'reciclar' });
    e = hacer(e, { tipo: 'reciclar' });
    expect(e.descarte).toEqual([]);
    e = hacer(e, { tipo: 'robar' });
    expect(e.descarte).toEqual([orden[0]]);
  });

  it('con 3 pasadas se recicla dos veces; con 1, ninguna', () => {
    const vaciar = (e: EstadoPiramide) => {
      while (e.mazo.length > 0) e = hacer(e, { tipo: 'robar' });
      return e;
    };
    let e = vaciar(nueva(3));
    e = vaciar(hacer(e, { tipo: 'reciclar' }));
    e = vaciar(hacer(e, { tipo: 'reciclar' }));
    expect(legales(e)).not.toContainEqual({ tipo: 'reciclar' });
    expect(piramide.vistaDe(e, 0).vueltasRestantes).toBe(0);
    expect(legales(vaciar(nueva(1)))).not.toContainEqual({ tipo: 'reciclar' });
    expect(piramide.vistaDe(nueva(null), 0).vueltasRestantes).toBeNull();
  });
});

// ── Victoria, deshacer y abandonar ───────────────────────────────────────────

describe('fin de la Pirámide', () => {
  it('vaciar la pirámide es victoria aunque quede mazo', () => {
    const p = new Array<IdCarta | null>(CARTAS_PIRAMIDE).fill(null);
    p[0] = 'picas-13';
    const e = con({ piramide: p, mazo: ['corazones-2'] });
    const f = hacer(e, quitar(0));
    expect(piramide.resultado(f)).toEqual({ ganadores: [0], empate: false });
    expect(piramide.vistaDe(f, 0).situacion).toBe('victoria');
    expect(legales(f)).toEqual([]);
  });

  it('deshacer devuelve las cartas y suma un movimiento', () => {
    const p = relleno();
    p[21] = 'corazones-6';
    p[22] = 'treboles-7';
    const e = con({ piramide: p });
    const f = hacer(hacer(e, quitar(21, 22)), { tipo: 'deshacer' });
    expect(f.piramide).toEqual(e.piramide);
    expect(f.movimientos).toBe(2);
  });

  it('abandonar termina sin victoria', () => {
    const f = hacer(nueva(), { tipo: 'abandonar' });
    expect(piramide.resultado(f)).toEqual({ ganadores: [], empate: false });
    expect(piramide.vistaDe(f, 0).situacion).toBe('abandono');
  });

  it('la vista dice cuántas cartas tiene el mazo, no cuáles', () => {
    const e = nueva();
    const v = piramide.vistaDe(e, 0);
    expect(v.mazo).toBe(24);
    expect(JSON.stringify(v)).not.toContain(`"${e.mazo[0]}"`);
  });
});

describirContrato(piramide, {
  configs: [CONFIG_PIRAMIDE_POR_DEFECTO, { pasadas: 1 }, { pasadas: null }],
  cartasOcultas: (e) => [...e.mazo],
  evitar: (a) => a.tipo === 'abandonar',
  pasosMaximos: 200,
  ejecuciones: 30,
});
