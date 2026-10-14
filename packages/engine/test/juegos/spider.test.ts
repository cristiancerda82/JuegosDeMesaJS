import { describe, expect, it } from 'vitest';
import {
  baseSpider,
  cartasSpider,
  CONFIG_SPIDER_POR_DEFECTO,
  spider,
  type AccionSpider,
  type CartaSpider,
  type ColumnaSpider,
  type ConfigSpider,
  type EstadoSpider,
} from '../../src/juegos/spider';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigSpider> = {}, semilla = 's'): EstadoSpider {
  const r = spider.crear({ ...CONFIG_SPIDER_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Columna con las cartas visibles dadas (y ocultas opcionales). */
const col = (visibles: string[], ocultas: string[] = []): ColumnaSpider => ({
  visibles: visibles as CartaSpider[],
  ocultas: ocultas as CartaSpider[],
});

/** Mesa armada a mano: las columnas que no se dan tienen una carta de relleno. */
function mesa(columnas: ColumnaSpider[], parcial: Partial<EstadoSpider> = {}): EstadoSpider {
  const relleno = Array.from({ length: 10 - columnas.length }, (_, i) =>
    col([`diamantes-${(i % 13) + 1}#9${i}`]),
  );
  return {
    ...nueva(),
    columnas: [...columnas, ...relleno],
    mazo: [],
    completadas: [],
    historial: [],
    ...parcial,
  };
}

function jugar(e: EstadoSpider, accion: AccionSpider): EstadoSpider {
  const r = aplicar(spider, e, 0, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const mover = (desde: number, hasta: number, cantidad = 1): AccionSpider => ({
  tipo: 'mover',
  desde,
  hasta,
  cantidad,
});
const esLegal = (e: EstadoSpider, a: AccionSpider) =>
  spider.accionesLegales(e, 0).some((x) => JSON.stringify(x) === JSON.stringify(a));

/** Escalera de un palo del valor `desde` al `hasta`, de mayor a menor. */
const escalera = (p: string, desde: number, hasta: number, copia = 0) =>
  Array.from({ length: desde - hasta + 1 }, (_, i) => `${p}-${desde - i}#${copia}`);

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto', () => {
  it('10 columnas de 6 y 5 cartas, una boca arriba, y 50 en el mazo', () => {
    const e = nueva();
    expect(e.columnas.map((c) => c.ocultas.length + c.visibles.length)).toEqual([
      6, 6, 6, 6, 5, 5, 5, 5, 5, 5,
    ]);
    expect(e.columnas.every((c) => c.visibles.length === 1)).toBe(true);
    expect(e.mazo).toHaveLength(50);
    expect(spider.vistaDe(e, 0).repartosRestantes).toBe(5);
  });

  it('identificadores únicos y palos según la dificultad', () => {
    for (const palos of [1, 2, 4] as const) {
      const cartas = cartasSpider(palos);
      expect(cartas).toHaveLength(104);
      expect(new Set(cartas).size).toBe(104);
    }
    const dos = cartasSpider(2).map(baseSpider);
    expect(dos.filter((c) => c.startsWith('picas'))).toHaveLength(52);
    expect(dos.filter((c) => c === 'corazones-7')).toHaveLength(4);
    expect(cartasSpider(1).every((c) => c.startsWith('picas'))).toBe(true);
    expect(baseSpider('picas-12#3')).toBe('picas-12');
  });

  it('rechaza configuraciones inválidas', () => {
    expect(spider.crear({ palos: 3 as 4, repartirConVacias: false }, 's').ok).toBe(false);
  });
});

// ── Movimientos ──────────────────────────────────────────────────────────────

describe('movimientos', () => {
  it('una carta sobre otra de un valor más, de cualquier palo', () => {
    const e = mesa([col(['corazones-7#0']), col(['picas-8#0'])]);
    expect(esLegal(e, mover(0, 1))).toBe(true);
    const tras = jugar(e, mover(0, 1));
    expect(tras.columnas[1]!.visibles).toEqual(['picas-8#0', 'corazones-7#0']);
    expect(tras.movimientos).toBe(1);
  });

  it('no sobre una carta que no es un valor más', () => {
    const e = mesa([col(['corazones-7#0']), col(['picas-9#0'])]);
    expect(esLegal(e, mover(0, 1))).toBe(false);
  });

  it('una escalera de distinto palo no se mueve entera', () => {
    const e = mesa([col(['picas-8#0', 'corazones-7#0']), col(['picas-9#0']), col(['picas-8#1'])]);
    expect(esLegal(e, mover(0, 1, 2))).toBe(false);
    expect(esLegal(e, mover(0, 2, 1))).toBe(true);
  });

  it('una escalera del mismo palo se mueve entera', () => {
    const e = mesa([col(['picas-8#0', 'picas-7#0', 'picas-6#0']), col(['corazones-9#0'])]);
    const tras = jugar(e, mover(0, 1, 3));
    expect(tras.columnas[1]!.visibles).toHaveLength(4);
  });

  it('a una columna vacía, cualquier carta o escalera', () => {
    const e = mesa([col(['picas-8#0', 'picas-7#0'], ['picas-1#0']), col([])]);
    expect(esLegal(e, mover(0, 1, 1))).toBe(true);
    expect(esLegal(e, mover(0, 1, 2))).toBe(true);
  });

  it('se da la vuelta la carta tapada', () => {
    const e = mesa([col(['corazones-7#0'], ['picas-1#0', 'picas-2#0']), col(['picas-8#0'])]);
    const tras = jugar(e, mover(0, 1));
    expect(tras.columnas[0]).toEqual({ ocultas: ['picas-1#0'], visibles: ['picas-2#0'] });
  });
});

// ── Mazo ─────────────────────────────────────────────────────────────────────

describe('repartir', () => {
  it('pone una carta boca arriba en cada columna', () => {
    const e = nueva();
    const tras = jugar(e, { tipo: 'repartir' });
    expect(tras.mazo).toHaveLength(40);
    expect(tras.columnas.every((c) => c.visibles.length === 2)).toBe(true);
    expect(spider.vistaDe(tras, 0).repartosRestantes).toBe(4);
  });

  it('con una columna vacía no se reparte, salvo con la opción', () => {
    const mazo = cartasSpider(1).slice(0, 10);
    const e = mesa([col([])], { mazo });
    expect(spider.accionesLegales(e, 0).some((a) => a.tipo === 'repartir')).toBe(false);
    const permitido = { ...e, config: { palos: 1 as const, repartirConVacias: true } };
    expect(spider.accionesLegales(permitido, 0).some((a) => a.tipo === 'repartir')).toBe(true);
  });

  it('sin mazo no se reparte', () => {
    expect(spider.accionesLegales(mesa([]), 0).some((a) => a.tipo === 'repartir')).toBe(false);
  });
});

// ── Escaleras completas y victoria ───────────────────────────────────────────

describe('escaleras completas', () => {
  it('poner el As al final de Rey…2 retira la escalera y voltea la tapada', () => {
    const e = mesa([col(escalera('picas', 13, 2), ['corazones-5#0']), col(['picas-1#0'])]);
    const tras = jugar(e, mover(1, 0));
    expect(tras.completadas).toEqual(['picas']);
    expect(tras.columnas[0]).toEqual({ ocultas: [], visibles: ['corazones-5#0'] });
  });

  it('una escalera de palos mezclados no se retira', () => {
    const cartas = [...escalera('picas', 13, 3), 'corazones-2#0'];
    const e = mesa([col(cartas), col(['picas-1#0'])]);
    expect(jugar(e, mover(1, 0)).completadas).toEqual([]);
  });

  it('al completar la octava escalera se gana', () => {
    const siete = ['picas', 'picas', 'picas', 'picas', 'picas', 'picas', 'picas'] as const;
    const e = mesa([col(escalera('picas', 13, 2)), col(['picas-1#0'])], { completadas: siete });
    const tras = jugar(e, mover(1, 0));
    expect(spider.resultado(tras)).toEqual({ ganadores: [0], empate: false });
    expect(spider.vistaDe(tras, 0).situacion).toBe('victoria');
    expect(spider.accionesLegales(tras, 0)).toEqual([]);
  });
});

// ── Deshacer y abandonar ─────────────────────────────────────────────────────

describe('deshacer y abandonar', () => {
  it('deshacer un reparto devuelve las cartas al mazo', () => {
    const e = nueva();
    const tras = jugar(jugar(e, { tipo: 'repartir' }), { tipo: 'deshacer' });
    expect(tras.columnas).toEqual(e.columnas);
    expect(tras.mazo).toEqual(e.mazo);
    expect(tras.movimientos).toBe(2);
  });

  it('deshacer una escalera retirada la devuelve a su columna y tapa la volteada', () => {
    const e = mesa([col(escalera('picas', 13, 2), ['corazones-5#0']), col(['picas-1#0'])]);
    const tras = jugar(jugar(e, mover(1, 0)), { tipo: 'deshacer' });
    expect(tras.columnas.slice(0, 2)).toEqual(e.columnas.slice(0, 2));
    expect(tras.completadas).toEqual([]);
  });

  it('abandonar termina la partida', () => {
    const tras = jugar(nueva(), { tipo: 'abandonar' });
    expect(spider.resultado(tras)).toEqual({ ganadores: [], empate: false });
    expect(spider.vistaDe(tras, 0).situacion).toBe('abandono');
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('no muestra las cartas boca abajo ni el mazo', () => {
    const e = nueva({ palos: 4 });
    const texto = JSON.stringify(spider.vistaDe(e, 0));
    for (const c of [...e.mazo, ...e.columnas.flatMap((c) => c.ocultas)]) {
      expect(texto).not.toContain(`"${c}"`);
    }
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(spider, {
  configs: [
    CONFIG_SPIDER_POR_DEFECTO,
    { palos: 2, repartirConVacias: false },
    { palos: 4, repartirConVacias: true },
  ],
  cartasOcultas: (e) => [...e.mazo, ...e.columnas.flatMap((c) => c.ocultas)],
  evitar: (a) => a.tipo === 'abandonar',
  pasosMaximos: 200,
  ejecuciones: 30,
});
