import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  atascado,
  pistaFreeCell,
  pistaGolf,
  pistaTriPeaks,
  pistaKlondike,
  pistaPiramide,
  pistaSpider,
  pistaYukon,
  pistaCanfield,
  pistaCuarentaLadrones,
  pistaScorpion,
} from '../../src/ia/pistas';
import {
  CONFIG_SCORPION_POR_DEFECTO,
  scorpion,
  type EstadoScorpion,
} from '../../src/juegos/scorpion';
import {
  CONFIG_CUARENTA_LADRONES_POR_DEFECTO,
  cuarentaLadrones,
  type CartaLadrones,
  type EstadoCuarentaLadrones,
} from '../../src/juegos/cuarenta-ladrones';
import {
  canfield,
  CONFIG_CANFIELD_POR_DEFECTO,
  type EstadoCanfield,
} from '../../src/juegos/canfield';
import { CONFIG_YUKON_POR_DEFECTO, yukon, type EstadoYukon } from '../../src/juegos/yukon';
import { CONFIG_GOLF_POR_DEFECTO, golf, type EstadoGolf } from '../../src/juegos/golf';
import {
  CONFIG_TRIPEAKS_POR_DEFECTO,
  tripeaks,
  type EstadoTriPeaks,
} from '../../src/juegos/tripeaks';
import {
  CONFIG_PIRAMIDE_POR_DEFECTO,
  piramide,
  type EstadoPiramide,
} from '../../src/juegos/piramide';
import {
  CONFIG_FREECELL_POR_DEFECTO,
  freecell,
  type EstadoFreeCell,
} from '../../src/juegos/freecell';
import {
  CONFIG_KLONDIKE_POR_DEFECTO,
  klondike,
  type EstadoKlondike,
} from '../../src/juegos/klondike';
import {
  CONFIG_SPIDER_POR_DEFECTO,
  spider,
  type CartaSpider,
  type EstadoSpider,
} from '../../src/juegos/spider';
import type { Juego } from '../../src/motor/contrato';
import { igualesJSON } from '../../src/motor/json';

// ── Estados a mano ───────────────────────────────────────────────────────────

function mesaKlondike(
  columnas: { ocultas?: IdCarta[]; visibles: IdCarta[] }[],
  resto: Partial<EstadoKlondike> = {},
): EstadoKlondike {
  const cols = Array.from({ length: 7 }, (_, i) => ({
    ocultas: columnas[i]?.ocultas ?? [],
    visibles: columnas[i]?.visibles ?? [],
  }));
  return {
    config: CONFIG_KLONDIKE_POR_DEFECTO,
    mazo: [],
    descarte: [],
    columnas: cols,
    fundaciones: [[], [], [], []],
    reciclajesUsados: 0,
    movimientos: 0,
    historial: [],
    abandonada: false,
    ...resto,
  };
}

const pistaK = (e: EstadoKlondike) =>
  pistaKlondike(klondike.vistaDe(e, 0), klondike.accionesLegales(e, 0));

function mesaFreeCell(
  columnas: IdCarta[][],
  celdas: (IdCarta | null)[] = [null, null, null, null],
  fundaciones: IdCarta[][] = [[], [], [], []],
): EstadoFreeCell {
  return {
    config: { ...CONFIG_FREECELL_POR_DEFECTO, autoFundacion: false },
    numero: 1,
    movimientos: 0,
    historial: [],
    abandonada: false,
    celdas,
    fundaciones,
    columnas: Array.from({ length: 8 }, (_, i) => columnas[i] ?? []),
  };
}

const pistaF = (e: EstadoFreeCell) =>
  pistaFreeCell(freecell.vistaDe(e, 0), freecell.accionesLegales(e, 0));

const s = (c: IdCarta, copia = 0): CartaSpider => `${c}#${copia}`;

/** Las columnas que no se indican llevan un Rey que no interviene (así no hay columnas vacías). */
function mesaSpider(
  columnas: { ocultas?: CartaSpider[]; visibles: CartaSpider[] }[],
  mazo: CartaSpider[] = [],
): EstadoSpider {
  return {
    config: { palos: 4, repartirConVacias: true },
    columnas: Array.from({ length: 10 }, (_, i) => ({
      ocultas: columnas[i]?.ocultas ?? [],
      visibles: columnas[i]?.visibles ?? [s('treboles-13', i)],
    })),
    mazo,
    completadas: [],
    movimientos: 0,
    historial: [],
    abandonada: false,
  };
}

const pistaS = (e: EstadoSpider) => pistaSpider(spider.vistaDe(e, 0), spider.accionesLegales(e, 0));

// ── Klondike ─────────────────────────────────────────────────────────────────

describe('pista del Klondike', () => {
  it('prefiere subir el As a la fundación', () => {
    const e = mesaKlondike([
      { visibles: ['corazones-1'] },
      { visibles: ['picas-6'] },
      { visibles: ['corazones-5'] },
    ]);
    expect(pistaK(e)).toMatchObject({ tipo: 'mover', desde: 'c0', hasta: 'f0' });
  });

  it('sugiere el movimiento que descubre una carta', () => {
    const e = mesaKlondike([
      { visibles: ['picas-6'] },
      { ocultas: ['treboles-9'], visibles: ['corazones-5'] },
      { visibles: ['diamantes-8'] },
    ]);
    expect(pistaK(e)).toEqual({ tipo: 'mover', desde: 'c1', hasta: 'c0', cantidad: 1 });
  });

  it('no sugiere pasar una escalera de una columna a otra sin descubrir nada', () => {
    // El 5 rojo podría ir y volver entre los dos 6 negros: no cambia nada.
    const e = mesaKlondike([
      { ocultas: ['treboles-9'], visibles: ['picas-6', 'corazones-5'] },
      { ocultas: ['diamantes-9'], visibles: ['treboles-6'] },
    ]);
    expect(pistaK(e)).toBeNull();
  });

  it('roba cuando no hay nada mejor', () => {
    const e = mesaKlondike([{ ocultas: ['treboles-9'], visibles: ['picas-6'] }], {
      mazo: ['diamantes-2'],
    });
    expect(pistaK(e)).toEqual({ tipo: 'robar' });
  });

  it('saca la carta del descarte a una columna', () => {
    const e = mesaKlondike([{ ocultas: ['treboles-9'], visibles: ['picas-6'] }], {
      descarte: ['corazones-5'],
    });
    expect(pistaK(e)).toEqual({ tipo: 'mover', desde: 'descarte', hasta: 'c0', cantidad: 1 });
  });
});

// ── FreeCell ─────────────────────────────────────────────────────────────────

describe('pista del FreeCell', () => {
  it('prefiere la fundación', () => {
    const e = mesaFreeCell([['picas-9', 'treboles-1'], ['corazones-10'], ['diamantes-3']]);
    expect(pistaF(e)).toMatchObject({ desde: 'c0', hasta: 'f0' });
  });

  it('usa una celda si deja libre una carta para la fundación', () => {
    const e = mesaFreeCell([['corazones-1', 'picas-9'], ['diamantes-12']]);
    expect(pistaF(e)).toMatchObject({ desde: 'c0', hasta: 'l0', cantidad: 1 });
  });

  it('sin ida y vuelta: no mueve cartas entre columnas sin ganar nada', () => {
    const e = mesaFreeCell([
      ['diamantes-12', 'picas-9'],
      ['corazones-12', 'treboles-10'],
      ['diamantes-13', 'corazones-10'],
    ]);
    expect(pistaF(e)).toBeNull();
  });

  it('con las celdas llenas y sin movimientos, la partida está atascada', () => {
    // Columnas desordenadas (si no, se podría autocompletar) y sin nada que encaje.
    const e = mesaFreeCell(
      [
        ['picas-2', 'picas-5'],
        ['corazones-2', 'corazones-5'],
        ['diamantes-2', 'diamantes-5'],
        ['treboles-2', 'treboles-5'],
        ['picas-3', 'picas-7'],
        ['corazones-3', 'corazones-7'],
        ['diamantes-3', 'diamantes-7'],
        ['treboles-3', 'treboles-7'],
      ],
      ['picas-13', 'corazones-13', 'diamantes-13', 'treboles-13'],
    );
    const legales = freecell.accionesLegales(e, 0);
    expect(atascado(legales)).toBe(true);
    expect(pistaF(e)).toBeNull();
  });
});

// ── Spider ───────────────────────────────────────────────────────────────────

describe('pista del Spider', () => {
  it('prefiere alargar la escalera del mismo palo', () => {
    const e = mesaSpider([
      { ocultas: [s('treboles-1')], visibles: [s('corazones-8')] },
      { ocultas: [s('treboles-2')], visibles: [s('picas-8')] },
      { ocultas: [s('treboles-3')], visibles: [s('diamantes-9'), s('picas-7')] },
    ]);
    expect(pistaS(e)).toEqual({ tipo: 'mover', desde: 2, hasta: 1, cantidad: 1 });
  });

  it('prefiere descubrir una carta', () => {
    const e = mesaSpider([
      { ocultas: [s('treboles-1')], visibles: [s('corazones-8')] },
      { ocultas: [s('treboles-2')], visibles: [s('picas-7')] },
    ]);
    expect(pistaS(e)).toEqual({ tipo: 'mover', desde: 1, hasta: 0, cantidad: 1 });
  });

  it('reparte cuando no hay nada útil', () => {
    const e = mesaSpider(
      Array.from({ length: 10 }, (_, i) => ({
        ocultas: [s('treboles-1', i)],
        visibles: [s('corazones-13', i)],
      })),
      Array.from({ length: 10 }, (_, i) => s('diamantes-5', i)),
    );
    expect(pistaS(e)).toEqual({ tipo: 'repartir' });
  });
});

describe('pista de la Pirámide', () => {
  function mesaPiramide(parcial: Partial<EstadoPiramide>): EstadoPiramide {
    const r = piramide.crear(CONFIG_PIRAMIDE_POR_DEFECTO, 'pista');
    if (!r.ok) throw new Error(r.error);
    // Relleno sin parejas: todo cuatros.
    const relleno = new Array<IdCarta | null>(28).fill('picas-4');
    return { ...r.valor, piramide: relleno, mazo: [], descarte: [], ...parcial };
  }
  const pistaP = (e: EstadoPiramide) =>
    pistaPiramide(piramide.vistaDe(e, 0), piramide.accionesLegales(e, 0));

  it('prefiere la pareja de la pirámide a la K del descarte', () => {
    const p = mesaPiramide({}).piramide.slice();
    p[21] = 'corazones-6';
    p[22] = 'treboles-7';
    const e = mesaPiramide({ piramide: p, descarte: ['picas-13'] });
    expect(pistaP(e)).toEqual({
      tipo: 'quitar',
      cartas: [{ piramide: 21 }, { piramide: 22 }],
    });
  });

  it('prefiere la pareja que libera cartas', () => {
    const p = mesaPiramide({}).piramide.slice();
    // 21 y 22 liberan la 15; 23 y 25 no liberan nada.
    p[21] = 'corazones-6';
    p[22] = 'treboles-7';
    p[23] = 'corazones-5';
    p[25] = 'treboles-8';
    p[24] = 'picas-2';
    const e = mesaPiramide({ piramide: p });
    expect(pistaP(e)).toEqual({
      tipo: 'quitar',
      cartas: [{ piramide: 21 }, { piramide: 22 }],
    });
  });

  it('roba cuando no se puede quitar nada', () => {
    expect(pistaP(mesaPiramide({ mazo: ['picas-2'] }))).toEqual({ tipo: 'robar' });
  });

  it('sin mazo ni nada que quitar, está atascada', () => {
    const e = mesaPiramide({ vueltas: 2, descarte: ['picas-2'] });
    expect(pistaP(e)).toBeNull();
    expect(atascado(piramide.accionesLegales(e, 0))).toBe(true);
  });
});

describe('pista del Golf', () => {
  function mesaGolf(columnas: IdCarta[][], arriba: IdCarta, mazo: IdCarta[] = []): EstadoGolf {
    const r = golf.crear(CONFIG_GOLF_POR_DEFECTO, 'pista');
    if (!r.ok) throw new Error(r.error);
    const todas = Array.from({ length: 7 }, (_, i) => columnas[i] ?? []);
    return { ...r.valor, columnas: todas, descarte: [arriba], mazo };
  }
  const pistaG = (e: EstadoGolf) => pistaGolf(golf.vistaDe(e, 0), golf.accionesLegales(e, 0));

  it('elige la carta tras la que se encadenan más', () => {
    // Con un 7: el 6 no deja seguir; el 8 deja el 9 y después el 10.
    const e = mesaGolf([['picas-6'], ['corazones-8'], ['treboles-9'], ['diamantes-10']], 'picas-7');
    expect(pistaG(e)).toEqual({ tipo: 'mover', columna: 1 });
  });

  it('roba cuando no se puede mover nada', () => {
    const e = mesaGolf([['picas-2']], 'picas-9', ['corazones-5']);
    expect(pistaG(e)).toEqual({ tipo: 'robar' });
  });

  it('sin mazo ni movimientos, está atascado', () => {
    const e = mesaGolf([['picas-2']], 'picas-9');
    expect(pistaG(e)).toBeNull();
    expect(atascado(golf.accionesLegales(e, 0))).toBe(true);
  });
});

describe('pista de TriPeaks', () => {
  function mesaTriPeaks(
    cartas: Record<number, IdCarta>,
    arriba: IdCarta,
    mazo: IdCarta[] = [],
  ): EstadoTriPeaks {
    const r = tripeaks.crear(CONFIG_TRIPEAKS_POR_DEFECTO, 'pista');
    if (!r.ok) throw new Error(r.error);
    const picos = Array.from({ length: 28 }, (_, i) => cartas[i] ?? null);
    return { ...r.valor, picos, descarte: [arriba], mazo };
  }
  const pistaT = (e: EstadoTriPeaks) =>
    pistaTriPeaks(tripeaks.vistaDe(e, 0), tripeaks.accionesLegales(e, 0));

  it('sugiere la carta que encadena más', () => {
    const e = mesaTriPeaks({ 18: 'picas-6', 19: 'corazones-8', 22: 'treboles-9' }, 'diamantes-7');
    expect(pistaT(e)).toEqual({ tipo: 'quitar', posicion: 19 });
  });

  it('a igualdad, la que libera una carta boca abajo', () => {
    // El 6 de la posición 26 es la última que tapa al 9 de la posición 17 (la 27 ya no está);
    // el 8 de la 18 va antes en el orden, pero no libera nada.
    const e = mesaTriPeaks({ 17: 'picas-9', 18: 'corazones-8', 26: 'picas-6' }, 'diamantes-7');
    expect(pistaT(e)).toEqual({ tipo: 'quitar', posicion: 26 });
  });

  it('roba si no puede quitar nada, y sin mazo está atascada', () => {
    expect(pistaT(mesaTriPeaks({ 27: 'picas-2' }, 'picas-9', ['corazones-5']))).toEqual({
      tipo: 'robar',
    });
    const e = mesaTriPeaks({ 27: 'picas-2' }, 'picas-9');
    expect(pistaT(e)).toBeNull();
    expect(atascado(tripeaks.accionesLegales(e, 0))).toBe(true);
  });
});

describe('pista del Yukon', () => {
  function mesaYukon(
    columnas: { ocultas?: IdCarta[]; visibles: IdCarta[] }[],
    fundaciones: IdCarta[][] = [[], [], [], []],
  ): EstadoYukon {
    return {
      config: CONFIG_YUKON_POR_DEFECTO,
      columnas: Array.from({ length: 7 }, (_, i) => ({
        ocultas: columnas[i]?.ocultas ?? [],
        visibles: columnas[i]?.visibles ?? [],
      })),
      fundaciones,
      movimientos: 0,
      historial: [],
      abandonada: false,
    };
  }
  const pistaY = (e: EstadoYukon) => pistaYukon(yukon.vistaDe(e, 0), yukon.accionesLegales(e, 0));

  it('prefiere subir a una fundación', () => {
    const e = mesaYukon([
      { visibles: ['picas-13', 'corazones-1'] },
      { visibles: ['diamantes-9'] },
      { ocultas: ['treboles-2'], visibles: ['picas-8'] },
    ]);
    expect(pistaY(e)).toEqual({ tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
  });

  it('deja arriba un as moviendo el grupo que lo tapa', () => {
    // El 9 de picas va sobre el 10 de corazones y deja arriba el as de diamantes.
    const e = mesaYukon([
      { visibles: ['treboles-12', 'diamantes-1', 'picas-9', 'corazones-3'] },
      { visibles: ['corazones-10'] },
    ]);
    expect(pistaY(e)).toEqual({ tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 2 });
  });

  it('descubre una carta boca abajo', () => {
    const e = mesaYukon([
      { ocultas: ['treboles-5'], visibles: ['picas-9', 'corazones-3'] },
      { visibles: ['corazones-10'] },
    ]);
    expect(pistaY(e)).toEqual({ tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 2 });
  });

  it('sin movimientos útiles no sugiere nada', () => {
    // El rey solo en su columna podría pasar a otra vacía, pero no sirve de nada.
    const e = mesaYukon([{ visibles: ['picas-13'] }, { visibles: ['corazones-5'] }]);
    expect(pistaY(e)).toBeNull();
    // Una columna sin ordenar, para que tampoco se pueda autocompletar.
    const atascada = mesaYukon([
      { visibles: ['picas-5', 'corazones-9'] },
      { visibles: ['treboles-12'] },
    ]);
    expect(pistaY(atascada)).toBeNull();
    expect(atascado(yukon.accionesLegales(atascada, 0))).toBe(true);
  });
});

describe('pista del Canfield', () => {
  function mesaCanfield(parcial: Partial<EstadoCanfield>): EstadoCanfield {
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
  const pistaC = (e: EstadoCanfield) =>
    pistaCanfield(canfield.vistaDe(e, 0), canfield.accionesLegales(e, 0));

  it('prefiere subir a una fundación', () => {
    const e = mesaCanfield({
      reserva: ['picas-2'],
      descarte: ['corazones-8'],
      columnas: [['picas-9'], ['treboles-10'], ['diamantes-3'], ['diamantes-4']],
    });
    expect(pistaC(e)).toEqual({ tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
  });

  it('la reserva antes que el descarte', () => {
    const e = mesaCanfield({
      reserva: ['picas-2', 'corazones-9'],
      descarte: ['diamantes-9'],
      columnas: [['treboles-10'], ['picas-10'], ['diamantes-3'], ['diamantes-4']],
    });
    expect(pistaC(e)).toMatchObject({ tipo: 'mover', desde: 'reserva' });
  });

  it('roba si no hay nada útil, y sin mazo ni descarte está atascado', () => {
    const conMazo = mesaCanfield({
      mazo: ['picas-2'],
      reserva: ['corazones-5'],
      columnas: [['treboles-10'], ['picas-10'], ['diamantes-3'], ['diamantes-4']],
    });
    expect(pistaC(conMazo)).toEqual({ tipo: 'robar' });
    const sinNada = mesaCanfield({
      reserva: ['corazones-5'],
      columnas: [['treboles-10'], ['picas-10'], ['diamantes-3'], ['diamantes-4']],
    });
    expect(pistaC(sinNada)).toBeNull();
    expect(atascado(canfield.accionesLegales(sinNada, 0))).toBe(true);
  });
});

describe('pista de Cuarenta ladrones', () => {
  const k = (ids: string) =>
    ids === '' ? [] : ids.split(' ').map((x) => `${x}#0` as CartaLadrones);
  function mesaL(
    columnas: string[],
    parcial: Partial<EstadoCuarentaLadrones> = {},
  ): EstadoCuarentaLadrones {
    return {
      config: CONFIG_CUARENTA_LADRONES_POR_DEFECTO,
      mazo: [],
      descarte: [],
      columnas: Array.from({ length: 10 }, (_, i) => k(columnas[i] ?? 'diamantes-13')),
      fundaciones: Array.from({ length: 8 }, () => []),
      movimientos: 0,
      historial: [],
      abandonada: false,
      ...parcial,
    };
  }
  const pistaL = (e: EstadoCuarentaLadrones) =>
    pistaCuarentaLadrones(cuarentaLadrones.vistaDe(e, 0), cuarentaLadrones.accionesLegales(e, 0));

  it('prefiere subir a una fundación', () => {
    const e = mesaL(['picas-1', 'treboles-9', 'treboles-8'], { descarte: k('corazones-8') });
    expect(pistaL(e)).toEqual({ tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
  });

  it('vacía una columna si no hay nada que subir ni descarte que encaje', () => {
    const e = mesaL(['picas-9 treboles-8', 'treboles-9', 'corazones-5'], { mazo: k('picas-4') });
    // El 8 de tréboles puede ir sobre el 9 de tréboles, pero no vacía nada; el 5 de corazones no
    // encaja. Ninguna columna se vacía: roba.
    expect(pistaL(e)).toEqual({ tipo: 'robar' });
    const f = mesaL(['treboles-8', 'treboles-9', 'corazones-5'], { mazo: k('picas-4') });
    expect(pistaL(f)).toEqual({ tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 1 });
  });

  it('saca la carta del descarte antes que vaciar una columna', () => {
    const e = mesaL(['treboles-8', 'treboles-9', 'corazones-5'], { descarte: k('corazones-4') });
    expect(pistaL(e)).toMatchObject({ desde: 'descarte' });
  });

  it('sin nada útil ni mazo, no sugiere nada y está atascado', () => {
    const e = mesaL(['picas-9', 'corazones-5']);
    expect(pistaL(e)).toBeNull();
    expect(atascado(cuarentaLadrones.accionesLegales(e, 0))).toBe(true);
  });
});

describe('pista del Scorpion', () => {
  const k = (ids: string) => (ids === '' ? [] : (ids.split(' ') as IdCarta[]));
  function mesaS(columnas: [string, string][], reserva = ''): EstadoScorpion {
    return {
      config: CONFIG_SCORPION_POR_DEFECTO,
      columnas: Array.from({ length: 7 }, (_, i) => {
        const [o, v] = columnas[i] ?? ['', ''];
        return { ocultas: k(o), visibles: k(v) };
      }),
      reserva: k(reserva),
      movimientos: 0,
      historial: [],
      abandonada: false,
    };
  }
  const pistaS = (e: EstadoScorpion) =>
    pistaScorpion(scorpion.vistaDe(e, 0), scorpion.accionesLegales(e, 0));

  it('prefiere descubrir una carta tapada', () => {
    const e = mesaS([
      ['corazones-2', 'picas-6'],
      ['', 'diamantes-9 picas-7'],
      ['', 'diamantes-4'],
      ['', 'diamantes-5 treboles-13'],
    ]);
    expect(pistaS(e)).toEqual({ tipo: 'mover', desde: 0, hasta: 1, cantidad: 1 });
  });

  it('no sugiere mover una carta que ya está sobre la siguiente de su palo', () => {
    const e = mesaS([
      ['', 'picas-7 picas-6'],
      ['', 'treboles-7'],
      ['', 'diamantes-2'],
    ]);
    // El 6 de picas no encaja en otro sitio; nada útil y sin reserva: nada.
    expect(pistaS(e)).toBeNull();
  });

  it('sin nada útil, reparte la reserva', () => {
    const e = mesaS(
      [
        ['', 'picas-7 picas-6'],
        ['', 'treboles-3'],
      ],
      'corazones-5 corazones-9 diamantes-8',
    );
    expect(pistaS(e)).toEqual({ tipo: 'repartir' });
  });
});

// ── Propiedades ──────────────────────────────────────────────────────────────

describe('las pistas en partidas al azar', () => {
  const casos = [
    { juego: klondike, config: CONFIG_KLONDIKE_POR_DEFECTO, pista: pistaKlondike },
    { juego: freecell, config: CONFIG_FREECELL_POR_DEFECTO, pista: pistaFreeCell },
    { juego: spider, config: CONFIG_SPIDER_POR_DEFECTO, pista: pistaSpider },
    { juego: piramide, config: CONFIG_PIRAMIDE_POR_DEFECTO, pista: pistaPiramide },
    { juego: golf, config: CONFIG_GOLF_POR_DEFECTO, pista: pistaGolf },
    { juego: tripeaks, config: CONFIG_TRIPEAKS_POR_DEFECTO, pista: pistaTriPeaks },
    { juego: yukon, config: CONFIG_YUKON_POR_DEFECTO, pista: pistaYukon },
    { juego: canfield, config: CONFIG_CANFIELD_POR_DEFECTO, pista: pistaCanfield },
    {
      juego: cuarentaLadrones,
      config: CONFIG_CUARENTA_LADRONES_POR_DEFECTO,
      pista: pistaCuarentaLadrones,
    },
    { juego: scorpion, config: CONFIG_SCORPION_POR_DEFECTO, pista: pistaScorpion },
  ] as unknown as {
    juego: Juego<unknown, unknown, { tipo: string }, unknown>;
    config: unknown;
    pista: (v: unknown, a: readonly { tipo: string }[]) => { tipo: string } | null;
  }[];

  it.each(casos)('$juego.id: siempre legales, nunca deshacer ni abandonar, y rápidas', (c) => {
    for (let p = 0; p < 15; p++) {
      const creado = c.juego.crear(c.config, `pistas-${p}`);
      if (!creado.ok) throw new Error(creado.error);
      let e = creado.valor;
      const g = new Generador(crearAzar(`pistas-${p}`));
      for (let paso = 0; paso < 150 && c.juego.resultado(e) === null; paso++) {
        const legales = c.juego.accionesLegales(e, 0);
        const inicio = Date.now();
        const pista = c.pista(c.juego.vistaDe(e, 0), legales);
        expect(Date.now() - inicio).toBeLessThan(50);
        if (pista !== null) {
          expect(legales.some((a) => igualesJSON(a, pista))).toBe(true);
          expect(['deshacer', 'abandonar', 'autocompletar']).not.toContain(pista.tipo);
        }
        // Se sigue la pista a veces, y otras se juega al azar sin abandonar.
        const jugables = legales.filter((a) => a.tipo !== 'abandonar');
        if (jugables.length === 0) break;
        const accion =
          pista !== null && g.enteroHasta(2) === 0
            ? pista
            : jugables[g.enteroHasta(jugables.length)]!;
        e = c.juego.transicion(e, 0, accion);
      }
    }
  });
});
