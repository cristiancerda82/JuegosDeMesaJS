import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_FREECELL_POR_DEFECTO,
  freecell,
  repartoMicrosoft,
  type AccionFreeCell,
  type ConfigFreeCell,
  type EstadoFreeCell,
} from '../../src/juegos/freecell';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigFreeCell> = {}, semilla = 'f'): EstadoFreeCell {
  const r = freecell.crear({ ...CONFIG_FREECELL_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoFreeCell>, 'config'> & { config?: Partial<ConfigFreeCell> };

/** Tablero armado a mano, sin movimiento automático salvo que se pida. */
function mesa(parcial: Parcial = {}): EstadoFreeCell {
  const config = { ...CONFIG_FREECELL_POR_DEFECTO, autoFundacion: false, ...parcial.config };
  return {
    numero: 1,
    celdas: new Array<IdCarta | null>(config.celdas).fill(null),
    fundaciones: [[], [], [], []],
    columnas: Array.from({ length: 8 }, () => []),
    movimientos: 0,
    historial: [],
    abandonada: false,
    ...parcial,
    config,
  };
}

function jugar(e: EstadoFreeCell, accion: AccionFreeCell): EstadoFreeCell {
  const r = aplicar(freecell, e, 0, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const legal = (e: EstadoFreeCell, accion: AccionFreeCell) =>
  freecell.accionesLegales(e, 0).some((a) => JSON.stringify(a) === JSON.stringify(accion));

const mover = (desde: string, hasta: string, cantidad = 1) =>
  ({ tipo: 'mover', desde, hasta, cantidad }) as AccionFreeCell;

/** Columnas con las cartas dadas y el resto vacías. */
const columnas = (...cs: IdCarta[][]) => [
  ...cs,
  ...Array.from({ length: 8 - cs.length }, () => []),
];

/** Las 13 cartas de un palo, del As al Rey. */
const palo = (p: string) => Array.from({ length: 13 }, (_, i) => `${p}-${i + 1}` as IdCarta);

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto de Microsoft', () => {
  it('partida 1: la primera fila es J♦ 2♦ 9♥ J♣ 5♦ 7♥ 7♣ 5♥', () => {
    const cols = repartoMicrosoft(1);
    expect(cols.map((c) => c[0])).toEqual([
      'diamantes-11',
      'diamantes-2',
      'corazones-9',
      'treboles-11',
      'diamantes-5',
      'corazones-7',
      'treboles-7',
      'corazones-5',
    ]);
  });

  it('partida 617: la primera fila es 7♦ A♦ 5♣ 3♠ 5♠ 8♣ 2♦ A♥', () => {
    expect(repartoMicrosoft(617).map((c) => c[0])).toEqual([
      'diamantes-7',
      'diamantes-1',
      'treboles-5',
      'picas-3',
      'picas-5',
      'treboles-8',
      'diamantes-2',
      'corazones-1',
    ]);
  });

  it('8 columnas de 7, 7, 7, 7, 6, 6, 6 y 6 cartas con las 52 distintas', () => {
    const e = nueva({ partida: 123 });
    expect(e.columnas.map((c) => c.length)).toEqual([7, 7, 7, 7, 6, 6, 6, 6]);
    expect(new Set(e.columnas.flat()).size).toBe(52);
    expect(e.celdas).toEqual([null, null, null, null]);
    expect(e.fundaciones.every((f) => f.length === 0)).toBe(true);
  });

  it('sin número, la partida sale de la semilla', () => {
    const a = nueva({}, 'x');
    expect(a.numero).toBeGreaterThanOrEqual(1);
    expect(a.numero).toBeLessThanOrEqual(32_000);
    expect(nueva({}, 'x').numero).toBe(a.numero);
    expect(a.columnas).toEqual(repartoMicrosoft(a.numero));
  });

  it('rechaza configuraciones inválidas', () => {
    const base = CONFIG_FREECELL_POR_DEFECTO;
    expect(freecell.crear({ ...base, partida: 0 }, 's').ok).toBe(false);
    expect(freecell.crear({ ...base, partida: 32_001 }, 's').ok).toBe(false);
    expect(freecell.crear({ ...base, celdas: 5 as 4 }, 's').ok).toBe(false);
  });
});

// ── Movimientos ──────────────────────────────────────────────────────────────

describe('movimientos', () => {
  it('celdas: una carta a una celda libre, no a una ocupada', () => {
    let e = mesa({ columnas: columnas(['picas-5', 'picas-9']) });
    e = jugar(e, mover('c0', 'l0'));
    expect(e.celdas[0]).toBe('picas-9');
    expect(legal(e, mover('c0', 'l0'))).toBe(false);
    expect(legal(e, mover('c0', 'l1'))).toBe(true);
  });

  it('con 1 celda configurada solo hay una celda', () => {
    expect(nueva({ celdas: 1 }).celdas).toEqual([null]);
  });

  it('fundaciones: el As y después el 2 del mismo palo, no de otro', () => {
    let e = mesa({ columnas: columnas(['corazones-2', 'corazones-1'], ['picas-2']) });
    e = jugar(e, mover('c0', 'f0'));
    expect(legal(e, mover('c1', 'f0'))).toBe(false);
    e = jugar(e, mover('c0', 'f0'));
    expect(e.fundaciones[0]).toEqual(['corazones-1', 'corazones-2']);
  });

  it('columnas: 9♠ sobre 10♥ sí, sobre 10♣ no; a una columna vacía, cualquiera', () => {
    const e = mesa({
      columnas: columnas(
        ['corazones-10'],
        ['treboles-10'],
        ['diamantes-3', 'picas-9'],
        ['picas-12', 'diamantes-1'],
      ),
    });
    expect(legal(e, mover('c2', 'c0'))).toBe(true);
    expect(legal(e, mover('c2', 'c1'))).toBe(false);
    expect(legal(e, mover('c3', 'c4'))).toBe(true);
  });

  it('supermovimiento: 2 celdas libres y 1 columna vacía mueven 6 cartas, no 7', () => {
    const secuencia: IdCarta[] = [
      'corazones-9',
      'picas-8',
      'corazones-7',
      'picas-6',
      'corazones-5',
      'picas-4',
      'corazones-3',
    ];
    const base = columnas(
      ['diamantes-13', ...secuencia],
      ['picas-10'],
      ['treboles-1'],
      ['treboles-2'],
      ['treboles-3'],
      ['treboles-4'],
      ['treboles-5'],
    );
    const e = mesa({ celdas: ['diamantes-12', 'diamantes-11', null, null], columnas: base });
    expect(freecell.vistaDe(e, 0).maxMovible).toBe(6);
    // La secuencia de 7 entera (9♥…3♥) cabría sobre el 10♠, pero son 7 cartas.
    expect(legal(e, mover('c0', 'c1', 7))).toBe(false);
    // Moviendo 6 (8♠…3♥) no hay destino; quitando el 3♥ primero, el 9♥ y 5 más sí.
    const sin3 = mesa({
      celdas: ['diamantes-12', 'diamantes-11', null, null],
      columnas: columnas(
        ['diamantes-13', ...secuencia.slice(0, 6)],
        ['picas-10'],
        ['treboles-1'],
        ['treboles-2'],
        ['treboles-3'],
        ['treboles-4'],
        ['treboles-5'],
      ),
    });
    expect(legal(sin3, mover('c0', 'c1', 6))).toBe(true);
  });

  it('a una columna vacía no cuenta como vacía: con 2 celdas y 1 vacía, 3 cartas', () => {
    const e = mesa({
      celdas: ['diamantes-12', 'diamantes-11', null, null],
      columnas: columnas(
        ['diamantes-13', 'corazones-9', 'picas-8', 'corazones-7', 'picas-6'],
        ['treboles-1'],
        ['treboles-2'],
        ['treboles-3'],
        ['treboles-4'],
        ['treboles-5'],
        ['treboles-6'],
      ),
    });
    expect(legal(e, mover('c0', 'c7', 3))).toBe(true);
    expect(legal(e, mover('c0', 'c7', 4))).toBe(false);
  });
});

// ── Movimiento automático ────────────────────────────────────────────────────

describe('movimiento automático', () => {
  it('el As que queda al descubierto va solo a su fundación', () => {
    let e = mesa({
      config: { autoFundacion: true },
      columnas: columnas(['picas-1', 'corazones-9'], ['picas-10']),
    });
    e = jugar(e, mover('c0', 'c1'));
    expect(e.fundaciones[0]).toEqual(['picas-1']);
    expect(e.columnas[0]).toEqual([]);
    expect(e.movimientos).toBe(1);
  });

  it('el 5♥ no se mueve solo si las negras van por el 2', () => {
    const fundaciones: IdCarta[][] = [
      palo('corazones').slice(0, 4),
      palo('diamantes').slice(0, 4),
      palo('picas').slice(0, 2),
      palo('treboles').slice(0, 2),
    ];
    let e = mesa({
      config: { autoFundacion: true },
      fundaciones,
      columnas: columnas(['corazones-5', 'picas-9'], ['corazones-10']),
    });
    e = jugar(e, mover('c0', 'c1'));
    expect(e.columnas[0]).toEqual(['corazones-5']);
  });

  it('deshacer devuelve también lo movido automáticamente', () => {
    let e = mesa({
      config: { autoFundacion: true },
      columnas: columnas(['picas-1', 'corazones-9'], ['picas-10']),
    });
    const antes = e;
    e = jugar(e, mover('c0', 'c1'));
    e = jugar(e, { tipo: 'deshacer' });
    expect(e.columnas).toEqual(antes.columnas);
    expect(e.fundaciones).toEqual(antes.fundaciones);
    expect(e.movimientos).toBe(2);
    expect(legal(e, { tipo: 'deshacer' })).toBe(false);
  });
});

// ── Autocompletar, victoria y abandono ───────────────────────────────────────

describe('autocompletar y victoria', () => {
  it('con las columnas ordenadas se autocompleta y se gana', () => {
    const reves = (p: string) => [...palo(p)].reverse();
    let e = mesa({
      columnas: columnas(reves('picas'), reves('corazones'), reves('diamantes'), reves('treboles')),
    });
    expect(legal(e, { tipo: 'autocompletar' })).toBe(true);
    e = jugar(e, { tipo: 'autocompletar' });
    expect(e.fundaciones.every((f) => f.length === 13)).toBe(true);
    expect(freecell.resultado(e)).toEqual({ ganadores: [0], empate: false });
    expect(freecell.vistaDe(e, 0).situacion).toBe('victoria');
  });

  it('sin columnas ordenadas no hay autocompletar', () => {
    const e = nueva({ partida: 1 });
    expect(legal(e, { tipo: 'autocompletar' })).toBe(false);
  });

  it('abandonar termina la partida sin victoria', () => {
    const e = jugar(nueva(), { tipo: 'abandonar' });
    expect(freecell.resultado(e)).toEqual({ ganadores: [], empate: false });
    expect(freecell.accionesLegales(e, 0)).toEqual([]);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(freecell, {
  configs: [
    CONFIG_FREECELL_POR_DEFECTO,
    { partida: 1, celdas: 4, autoFundacion: false },
    { partida: 617, celdas: 2, autoFundacion: true },
  ],
  // Todo está a la vista: no hay cartas ocultas.
  cartasOcultas: () => [],
  pasosMaximos: 150,
  ejecuciones: 30,
});
