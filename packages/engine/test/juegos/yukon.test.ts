import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_YUKON_POR_DEFECTO,
  yukon,
  type AccionYukon,
  type ConfigYukon,
  type EstadoYukon,
} from '../../src/juegos/yukon';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: ConfigYukon = CONFIG_YUKON_POR_DEFECTO, semilla = 'y'): EstadoYukon {
  const r = yukon.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Mesa con las pilas indicadas; el resto, vacío. */
function mesa(parcial: Partial<EstadoYukon> = {}): EstadoYukon {
  return {
    config: CONFIG_YUKON_POR_DEFECTO,
    columnas: Array.from({ length: 7 }, () => ({ ocultas: [], visibles: [] })),
    fundaciones: [[], [], [], []],
    movimientos: 0,
    historial: [],
    abandonada: false,
    ...parcial,
  };
}

function columnas(...cols: [IdCarta[], IdCarta[]?][]): EstadoYukon['columnas'] {
  return Array.from({ length: 7 }, (_, i) => ({
    ocultas: cols[i]?.[1] ?? [],
    visibles: cols[i]?.[0] ?? [],
  }));
}

function jugar(e: EstadoYukon, accion: AccionYukon): EstadoYukon {
  const r = aplicar(yukon, e, 0, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const esLegal = (e: EstadoYukon, accion: AccionYukon) => aplicar(yukon, e, 0, accion).ok;

function palo(nombre: string, desde: number, hasta: number): IdCarta[] {
  return Array.from({ length: hasta - desde + 1 }, (_, i) => `${nombre}-${desde + i}` as IdCarta);
}

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto del Yukon', () => {
  it('7 columnas de 1, 6, 7, 8, 9, 10 y 11 cartas, con 0 a 6 boca abajo', () => {
    const e = nueva();
    expect(e.columnas.map((c) => c.ocultas.length + c.visibles.length)).toEqual([
      1, 6, 7, 8, 9, 10, 11,
    ]);
    expect(e.columnas.map((c) => c.ocultas.length)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    const todas = e.columnas.flatMap((c) => [...c.ocultas, ...c.visibles]);
    expect(new Set(todas).size).toBe(52);
    expect(e.fundaciones.every((f) => f.length === 0)).toBe(true);
  });

  it('la vista muestra las 31 cartas boca arriba y solo cuántas hay boca abajo', () => {
    const v = yukon.vistaDe(nueva(), 0);
    expect(v.columnas.flatMap((c) => c.visibles)).toHaveLength(31);
    expect(v.columnas.map((c) => c.ocultas)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('rechaza una construcción desconocida', () => {
    expect(yukon.crear({ construccion: 'otra' } as never, 'x').ok).toBe(false);
  });
});

// ── Construir ────────────────────────────────────────────────────────────────

describe('construir en las columnas', () => {
  it('mueve un grupo desordenado si la base encaja', () => {
    const e = mesa({
      columnas: columnas(
        [['picas-9', 'corazones-4', 'treboles-13'], ['diamantes-2']],
        [['corazones-10']],
      ),
    });
    const tras = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 3 });
    expect(tras.columnas[1]!.visibles).toEqual([
      'corazones-10',
      'picas-9',
      'corazones-4',
      'treboles-13',
    ]);
    // Al quedarse sin cartas boca arriba se voltea la de debajo.
    expect(tras.columnas[0]).toEqual({ ocultas: [], visibles: ['diamantes-2'] });
  });

  it('rechaza el mismo color en el Yukon clásico', () => {
    const e = mesa({ columnas: columnas([['picas-9']], [['treboles-10']]) });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 1 })).toBe(false);
  });

  it('en el Solitario ruso se construye por palo', () => {
    const e = mesa({
      config: { construccion: 'palo' },
      columnas: columnas([['picas-9']], [['picas-10']], [['corazones-10']]),
    });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c2', cantidad: 1 })).toBe(false);
  });

  it('solo un rey ocupa una columna vacía', () => {
    const e = mesa({
      columnas: columnas([['picas-5', 'picas-12', 'corazones-3']], [['diamantes-13', 'picas-2']]),
    });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c2', cantidad: 2 })).toBe(false);
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'c2', cantidad: 2 })).toBe(true);
  });

  it('las acciones legales incluyen los grupos que empiezan en cualquier carta visible', () => {
    const e = mesa({
      columnas: columnas([['corazones-7', 'picas-9', 'diamantes-1']], [['corazones-10']]),
    });
    const acciones = yukon.accionesLegales(e, 0);
    expect(acciones).toContainEqual({ tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 2 });
    expect(acciones).toContainEqual({ tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
  });
});

// ── Fundaciones ──────────────────────────────────────────────────────────────

describe('fundaciones', () => {
  it('solo sube la última carta de una columna', () => {
    const e = mesa({ columnas: columnas([['diamantes-1', 'picas-7']], [['corazones-1']]) });
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'f0', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 2 })).toBe(false);
    expect(
      yukon
        .accionesLegales(e, 0)
        .some((a) => a.tipo === 'mover' && a.desde === 'c0' && a.hasta[0] === 'f'),
    ).toBe(false);
  });

  it('por palo y en orden', () => {
    const e = mesa({
      fundaciones: [['corazones-1'], [], [], []],
      columnas: columnas([['corazones-2']], [['picas-2']]),
    });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'f0', cantidad: 1 })).toBe(false);
  });

  it('se puede bajar de una fundación a una columna', () => {
    const e = mesa({
      fundaciones: [palo('corazones', 1, 6), [], [], []],
      columnas: columnas([['picas-7']]),
    });
    expect(esLegal(e, { tipo: 'mover', desde: 'f0', hasta: 'c0', cantidad: 1 })).toBe(true);
  });
});

// ── Deshacer, autocompletar y victoria ───────────────────────────────────────

describe('deshacer, autocompletar y victoria', () => {
  it('deshacer devuelve las cartas y vuelve a tapar la volteada', () => {
    const e = mesa({
      columnas: columnas([['picas-9', 'corazones-4'], ['diamantes-2']], [['corazones-10']]),
    });
    const movido = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 2 });
    const vuelta = jugar(movido, { tipo: 'deshacer' });
    expect(vuelta.columnas).toEqual(e.columnas);
    expect(vuelta.movimientos).toBe(2);
    expect(vuelta.historial).toEqual([]);
  });

  it('no se puede deshacer al empezar', () => {
    expect(yukon.accionesLegales(nueva(), 0)).not.toContainEqual({ tipo: 'deshacer' });
  });

  it('autocompletar con todo boca arriba y las columnas ordenadas', () => {
    const ordenadas = mesa({
      columnas: columnas(
        [
          [
            'picas-13',
            'corazones-12',
            'picas-11',
            'corazones-10',
            'picas-9',
            'corazones-8',
            'picas-7',
            'corazones-6',
            'picas-5',
            'corazones-4',
            'picas-3',
            'corazones-2',
            'picas-1',
          ],
        ],
        [
          [
            'corazones-13',
            'picas-12',
            'corazones-11',
            'picas-10',
            'corazones-9',
            'picas-8',
            'corazones-7',
            'picas-6',
            'corazones-5',
            'picas-4',
            'corazones-3',
            'picas-2',
            'corazones-1',
          ],
        ],
        [
          [
            'diamantes-13',
            'treboles-12',
            'diamantes-11',
            'treboles-10',
            'diamantes-9',
            'treboles-8',
            'diamantes-7',
            'treboles-6',
            'diamantes-5',
            'treboles-4',
            'diamantes-3',
            'treboles-2',
            'diamantes-1',
          ],
        ],
        [
          [
            'treboles-13',
            'diamantes-12',
            'treboles-11',
            'diamantes-10',
            'treboles-9',
            'diamantes-8',
            'treboles-7',
            'diamantes-6',
            'treboles-5',
            'diamantes-4',
            'treboles-3',
            'diamantes-2',
            'treboles-1',
          ],
        ],
      ),
    });
    expect(yukon.accionesLegales(ordenadas, 0)).toContainEqual({ tipo: 'autocompletar' });
    const fin = jugar(ordenadas, { tipo: 'autocompletar' });
    expect(fin.fundaciones.every((f) => f.length === 13)).toBe(true);
    expect(yukon.resultado(fin)).toEqual({ ganadores: [0], empate: false });
    expect(yukon.vistaDe(fin, 0).situacion).toBe('victoria');
  });

  it('sin autocompletar si alguna columna no está ordenada', () => {
    const e = mesa({ columnas: columnas([['picas-13', 'corazones-3']], [['corazones-12']]) });
    expect(yukon.accionesLegales(e, 0)).not.toContainEqual({ tipo: 'autocompletar' });
  });

  it('gana al subir la última carta', () => {
    const e = mesa({
      fundaciones: [
        palo('corazones', 1, 13),
        palo('picas', 1, 13),
        palo('diamantes', 1, 13),
        palo('treboles', 1, 12),
      ],
      columnas: columnas([['treboles-13']]),
    });
    const fin = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'f3', cantidad: 1 });
    expect(yukon.resultado(fin)).toEqual({ ganadores: [0], empate: false });
    expect(yukon.accionesLegales(fin, 0)).toEqual([]);
  });

  it('abandonar termina la partida sin ganador', () => {
    const fin = jugar(nueva(), { tipo: 'abandonar' });
    expect(yukon.resultado(fin)).toEqual({ ganadores: [], empate: false });
    expect(yukon.vistaDe(fin, 0).situacion).toBe('abandono');
  });
});

describirContrato(yukon, {
  configs: [CONFIG_YUKON_POR_DEFECTO, { construccion: 'palo' }],
  cartasOcultas: (e) => e.columnas.flatMap((c) => c.ocultas),
  pasosMaximos: 150,
  ejecuciones: 40,
  evitar: (a) => a.tipo === 'abandonar',
});
