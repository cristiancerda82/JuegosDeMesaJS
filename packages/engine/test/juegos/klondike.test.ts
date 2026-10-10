import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  klondike,
  type AccionKlondike,
  type ConfigKlondike,
  type EstadoKlondike,
} from '../../src/juegos/klondike';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(
  config: ConfigKlondike = { robo: 1, reciclajes: null },
  semilla = 'k',
): EstadoKlondike {
  const r = klondike.crear(config, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Mesa vacía con las pilas indicadas; el resto, vacío. */
function mesa(parcial: Partial<EstadoKlondike> = {}): EstadoKlondike {
  return {
    config: { robo: 1, reciclajes: null },
    mazo: [],
    descarte: [],
    columnas: Array.from({ length: 7 }, () => ({ ocultas: [], visibles: [] })),
    fundaciones: [[], [], [], []],
    reciclajesUsados: 0,
    movimientos: 0,
    historial: [],
    abandonada: false,
    ...parcial,
  };
}

function columnas(...cols: [IdCarta[], IdCarta[]?][]): EstadoKlondike['columnas'] {
  return Array.from({ length: 7 }, (_, i) => ({
    ocultas: cols[i]?.[1] ?? [],
    visibles: cols[i]?.[0] ?? [],
  }));
}

function jugar(e: EstadoKlondike, accion: AccionKlondike): EstadoKlondike {
  const r = aplicar(klondike, e, 0, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const esLegal = (e: EstadoKlondike, accion: AccionKlondike) => aplicar(klondike, e, 0, accion).ok;

function palo(nombre: string, desde: number, hasta: number): IdCarta[] {
  return Array.from({ length: hasta - desde + 1 }, (_, i) => `${nombre}-${desde + i}` as IdCarta);
}

// ── Preparación ──────────────────────────────────────────────────────────────

describe('preparación de la mesa', () => {
  it('7 columnas de 1 a 7 cartas, solo la última boca arriba; mazo de 24', () => {
    const e = nueva();
    expect(e.columnas.map((c) => c.ocultas.length + c.visibles.length)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(e.columnas.every((c) => c.visibles.length === 1)).toBe(true);
    expect(e.mazo).toHaveLength(24);
    expect(e.descarte).toEqual([]);
    expect(e.fundaciones).toEqual([[], [], [], []]);
    const todas = [...e.mazo, ...e.columnas.flatMap((c) => [...c.ocultas, ...c.visibles])];
    expect(new Set(todas).size).toBe(52);
  });

  it('rechaza configuraciones inválidas', () => {
    expect(klondike.crear({ robo: 2 as 1, reciclajes: null }, 'x').ok).toBe(false);
    expect(klondike.crear({ robo: 1, reciclajes: -1 }, 'x').ok).toBe(false);
    expect(klondike.crear({ robo: 1, reciclajes: 1.5 }, 'x').ok).toBe(false);
  });
});

// ── Robo y reciclado ─────────────────────────────────────────────────────────

describe('opciones de robo', () => {
  it('robar de 3 con 10 cartas en el mazo pasa 3 al descarte', () => {
    const e = jugar(mesa({ config: { robo: 3, reciclajes: null }, mazo: palo('picas', 1, 10) }), {
      tipo: 'robar',
    });
    expect(e.descarte).toEqual(['picas-10', 'picas-9', 'picas-8']);
    expect(e.mazo).toHaveLength(7);
  });

  it('robar de 3 con 2 cartas en el mazo pasa las 2', () => {
    const e = jugar(mesa({ config: { robo: 3, reciclajes: null }, mazo: ['picas-1', 'picas-2'] }), {
      tipo: 'robar',
    });
    expect(e.descarte).toEqual(['picas-2', 'picas-1']);
    expect(e.mazo).toEqual([]);
  });

  it('solo la carta superior del descarte es jugable', () => {
    const e = mesa({ descarte: ['corazones-1', 'picas-5'] });
    expect(esLegal(e, { tipo: 'mover', desde: 'descarte', hasta: 'f0', cantidad: 1 })).toBe(false);
    const desdeDescarte = klondike
      .accionesLegales(e, 0)
      .filter((a) => a.tipo === 'mover' && a.desde === 'descarte');
    expect(desdeDescarte).toEqual([]);
  });
});

describe('reciclar el mazo', () => {
  function robarTodo(e: EstadoKlondike): { e: EstadoKlondike; vistas: IdCarta[] } {
    const vistas: IdCarta[] = [];
    while (e.mazo.length > 0) {
      e = jugar(e, { tipo: 'robar' });
      vistas.push(e.descarte.at(-1)!);
    }
    return { e, vistas };
  }

  for (const robo of [1, 3] as const) {
    it(`conserva el orden de robo (robo ${robo})`, () => {
      const primera = robarTodo(nueva({ robo, reciclajes: null }));
      const reciclado = jugar(primera.e, { tipo: 'reciclar' });
      expect(reciclado.descarte).toEqual([]);
      expect(robarTodo(reciclado).vistas).toEqual(primera.vistas);
    });
  }

  it('no se puede reciclar con cartas en el mazo', () => {
    expect(esLegal(nueva(), { tipo: 'reciclar' })).toBe(false);
  });

  it('respeta el límite de vueltas', () => {
    const e = mesa({ config: { robo: 1, reciclajes: 1 }, descarte: ['picas-1'] });
    const una = jugar(jugar(e, { tipo: 'reciclar' }), { tipo: 'robar' });
    expect(esLegal(una, { tipo: 'reciclar' })).toBe(false);
    expect(klondike.vistaDe(una, 0).reciclajesRestantes).toBe(0);
  });
});

// ── Columnas ─────────────────────────────────────────────────────────────────

describe('movimientos en las columnas', () => {
  it('9 de picas sobre 10 de corazones se acepta', () => {
    const e = mesa({ columnas: columnas([['picas-9']], [['corazones-10']]) });
    const d = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 1 });
    expect(d.columnas[1]!.visibles).toEqual(['corazones-10', 'picas-9']);
  });

  it('9 de picas sobre 10 de tréboles se rechaza (mismo color)', () => {
    const e = mesa({ columnas: columnas([['picas-9']], [['treboles-10']]) });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 1 })).toBe(false);
  });

  it('solo un rey ocupa una columna vacía', () => {
    const e = mesa({ columnas: columnas([['picas-12']], [[]]) });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 1 })).toBe(false);
    const conRey = mesa({ columnas: columnas([['picas-13']], [['corazones-2']], [[]]) });
    expect(esLegal(conRey, { tipo: 'mover', desde: 'c0', hasta: 'c2', cantidad: 1 })).toBe(true);
  });

  it('mueve secuencias ordenadas que alternan color', () => {
    const e = mesa({
      columnas: columnas([['corazones-10', 'picas-9', 'diamantes-8']], [['treboles-11']]),
    });
    const d = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 3 });
    expect(d.columnas[1]!.visibles).toEqual([
      'treboles-11',
      'corazones-10',
      'picas-9',
      'diamantes-8',
    ]);
    // Mover solo una parte exige que su carta de abajo encaje en el destino (el 9 no va sobre la J).
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 2 })).toBe(false);
  });
});

// ── Fundaciones ──────────────────────────────────────────────────────────────

describe('fundaciones', () => {
  it('una fundación vacía solo acepta un as', () => {
    const e = mesa({ columnas: columnas([['corazones-1']], [['corazones-2']]) });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'f0', cantidad: 1 })).toBe(false);
  });

  it('se continúa por palo y en orden ascendente', () => {
    const e = mesa({
      fundaciones: [['corazones-1'], [], [], []],
      columnas: columnas([['corazones-2']], [['picas-2']]),
    });
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'f0', cantidad: 1 })).toBe(false);
  });

  it('acepta la carta superior del descarte', () => {
    const e = mesa({ descarte: ['diamantes-1'] });
    expect(
      jugar(e, { tipo: 'mover', desde: 'descarte', hasta: 'f2', cantidad: 1 }).fundaciones[2],
    ).toEqual(['diamantes-1']);
  });

  it('se puede devolver la carta superior de una fundación a una columna', () => {
    const e = mesa({
      fundaciones: [['picas-1', 'picas-2', 'picas-3'], [], [], []],
      columnas: columnas([['corazones-4']]),
    });
    const d = jugar(e, { tipo: 'mover', desde: 'f0', hasta: 'c0', cantidad: 1 });
    expect(d.columnas[0]!.visibles).toEqual(['corazones-4', 'picas-3']);
    expect(d.fundaciones[0]).toEqual(['picas-1', 'picas-2']);
  });
});

// ── Volteo y deshacer ────────────────────────────────────────────────────────

describe('descubrir cartas', () => {
  it('al vaciar las visibles de una columna se voltea la siguiente', () => {
    const e = mesa({ columnas: columnas([['corazones-1'], ['picas-7', 'treboles-3']]) });
    const d = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
    expect(d.columnas[0]).toEqual({ ocultas: ['picas-7'], visibles: ['treboles-3'] });
  });
});

describe('deshacer', () => {
  const sinContador = ({ movimientos: _m, ...resto }: EstadoKlondike) => resto;

  it('no está disponible al inicio', () => {
    expect(esLegal(nueva(), { tipo: 'deshacer' })).toBe(false);
  });

  it('revierte un movimiento con volteo', () => {
    const e = mesa({ columnas: columnas([['corazones-1'], ['picas-7', 'treboles-3']]) });
    const movido = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
    const deshecho = jugar(movido, { tipo: 'deshacer' });
    expect(sinContador(deshecho)).toEqual(sinContador(e));
  });

  it('revierte robos y reciclados, uno por uno, hasta el inicio', () => {
    const inicio = nueva({ robo: 3, reciclajes: 2 });
    let e = inicio;
    while (e.mazo.length > 0) e = jugar(e, { tipo: 'robar' });
    e = jugar(e, { tipo: 'reciclar' });
    e = jugar(e, { tipo: 'robar' });
    const pasos = e.historial.length;
    for (let i = 0; i < pasos; i++) e = jugar(e, { tipo: 'deshacer' });
    expect(sinContador(e)).toEqual(sinContador(inicio));
    expect(esLegal(e, { tipo: 'deshacer' })).toBe(false);
  });

  it('deshacer cuenta como un movimiento', () => {
    const e = jugar(jugar(nueva(), { tipo: 'robar' }), { tipo: 'deshacer' });
    expect(e.movimientos).toBe(2);
  });
});

// ── Autocompletar, victoria y abandono ───────────────────────────────────────

describe('autocompletar', () => {
  /** Cuatro columnas K→A alternando colores: todo boca arriba, sin mazo ni descarte. */
  function todoBocaArriba(): EstadoKlondike {
    const alternar = (a: string, b: string) =>
      Array.from({ length: 13 }, (_, i) => `${i % 2 === 0 ? a : b}-${13 - i}` as IdCarta);
    return mesa({
      columnas: columnas(
        [alternar('picas', 'corazones')],
        [alternar('corazones', 'picas')],
        [alternar('treboles', 'diamantes')],
        [alternar('diamantes', 'treboles')],
      ),
    });
  }

  it('no está disponible con cartas boca abajo o en el mazo', () => {
    expect(esLegal(nueva(), { tipo: 'autocompletar' })).toBe(false);
  });

  it('lleva las 52 cartas a las fundaciones y gana', () => {
    const e = todoBocaArriba();
    expect(esLegal(e, { tipo: 'autocompletar' })).toBe(true);
    const fin = jugar(e, { tipo: 'autocompletar' });
    expect(fin.fundaciones.flat()).toHaveLength(52);
    expect(fin.movimientos).toBe(52);
    expect(klondike.resultado(fin)).toEqual({ ganadores: [0], empate: false });
    expect(klondike.vistaDe(fin, 0).situacion).toBe('victoria');
    expect(klondike.accionesLegales(fin, 0)).toEqual([]);
  });
});

describe('victoria, contador y abandono', () => {
  it('colocar la última carta gana la partida', () => {
    const e = mesa({
      fundaciones: [
        palo('picas', 1, 13),
        palo('corazones', 1, 13),
        palo('diamantes', 1, 13),
        palo('treboles', 1, 12),
      ],
      columnas: columnas([['treboles-13']]),
      movimientos: 99,
    });
    const fin = jugar(e, { tipo: 'mover', desde: 'c0', hasta: 'f3', cantidad: 1 });
    expect(klondike.resultado(fin)).toEqual({ ganadores: [0], empate: false });
    expect(klondike.vistaDe(fin, 0).movimientos).toBe(100);
  });

  it('se puede abandonar en cualquier momento', () => {
    const fin = jugar(nueva(), { tipo: 'abandonar' });
    expect(klondike.resultado(fin)).toEqual({ ganadores: [], empate: false });
    expect(klondike.vistaDe(fin, 0).situacion).toBe('abandono');
  });
});

describe('vista', () => {
  it('muestra el mazo y las cartas boca abajo solo como números', () => {
    const v = klondike.vistaDe(nueva(), 0);
    expect(v.mazo).toBe(24);
    expect(v.columnas.map((c) => c.ocultas)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(klondike, {
  configs: [
    { robo: 1, reciclajes: null },
    { robo: 3, reciclajes: 1 },
  ],
  cartasOcultas: (e) => [...e.mazo, ...e.columnas.flatMap((c) => c.ocultas)],
  pasosMaximos: 150,
  ejecuciones: 40,
  evitar: (a) => a.tipo === 'abandonar',
});
