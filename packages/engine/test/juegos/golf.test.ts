import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_GOLF_POR_DEFECTO,
  encajaGolf,
  golf,
  type AccionGolf,
  type EstadoGolf,
} from '../../src/juegos/golf';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

function nueva(vuelta = false, semilla = 'golf'): EstadoGolf {
  const r = golf.crear({ vuelta }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoGolf, accion: AccionGolf): EstadoGolf {
  const r = aplicar(golf, e, 0, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoGolf) => golf.accionesLegales(e, 0);
const movibles = (e: EstadoGolf) =>
  legales(e).flatMap((a) => (a.tipo === 'mover' ? [a.columna] : []));

/** Columnas de una carta cada una (el resto vacías) con `arriba` en el descarte. */
function con(cartas: IdCarta[], arriba: IdCarta, parcial: Partial<EstadoGolf> = {}): EstadoGolf {
  const columnas = Array.from({ length: 7 }, (_, i) => (cartas[i] ? [cartas[i]] : []));
  return { ...nueva(), columnas, descarte: [arriba], mazo: [], ...parcial };
}

describe('reparto del Golf', () => {
  it('7 columnas de 5, una carta en el descarte y 16 en el mazo', () => {
    const e = nueva();
    expect(e.columnas.map((c) => c.length)).toEqual([5, 5, 5, 5, 5, 5, 5]);
    expect(e.descarte).toHaveLength(1);
    expect(e.mazo).toHaveLength(16);
    expect(new Set([...e.columnas.flat(), ...e.descarte, ...e.mazo]).size).toBe(52);
  });

  it('valida la configuración', () => {
    expect(golf.crear({ vuelta: 'si' as unknown as boolean }, 'x').ok).toBe(false);
    expect(CONFIG_GOLF_POR_DEFECTO.vuelta).toBe(false);
  });
});

describe('mover al descarte', () => {
  it('una más o una menos, sea cual sea el palo', () => {
    const e = con(['picas-6', 'corazones-8', 'treboles-9'], 'diamantes-7');
    expect(movibles(e)).toEqual([0, 1]);
    const f = hacer(e, { tipo: 'mover', columna: 1 });
    expect(f.columnas[1]).toEqual([]);
    expect(f.descarte.at(-1)).toBe('corazones-8');
    expect(f.movimientos).toBe(1);
  });

  it('sin vuelta, la K cierra y el As solo admite un 2', () => {
    expect(movibles(con(['picas-12', 'picas-1'], 'corazones-13'))).toEqual([0]);
    expect(movibles(con(['picas-13', 'picas-2'], 'corazones-1'))).toEqual([1]);
    expect(encajaGolf('picas-1', 'corazones-13', false)).toBe(false);
  });

  it('con vuelta, la K y el As se tocan', () => {
    const e = con(['picas-1'], 'corazones-13', { config: { vuelta: true } });
    expect(movibles(e)).toEqual([0]);
  });
});

describe('mazo del Golf', () => {
  it('robar pasa la carta de arriba al descarte', () => {
    const e = nueva();
    const arriba = e.mazo.at(-1)!;
    const f = hacer(e, { tipo: 'robar' });
    expect(f.mazo).toHaveLength(15);
    expect(f.descarte.at(-1)).toBe(arriba);
  });

  it('con el mazo vacío no se roba', () => {
    let e = nueva();
    for (let i = 0; i < 16; i++) e = hacer(e, { tipo: 'robar' });
    expect(legales(e)).not.toContainEqual({ tipo: 'robar' });
  });
});

describe('fin del Golf', () => {
  it('vaciar las columnas es victoria aunque quede mazo', () => {
    const e = con(['picas-8'], 'corazones-7', { mazo: ['treboles-2'] });
    const f = hacer(e, { tipo: 'mover', columna: 0 });
    expect(golf.resultado(f)).toEqual({ ganadores: [0], empate: false });
    expect(golf.vistaDe(f, 0).situacion).toBe('victoria');
    expect(legales(f)).toEqual([]);
  });

  it('deshacer devuelve la carta y suma un movimiento', () => {
    const e = con(['picas-6', 'corazones-8'], 'diamantes-7');
    const f = hacer(hacer(e, { tipo: 'mover', columna: 0 }), { tipo: 'deshacer' });
    expect(f.columnas).toEqual(e.columnas);
    expect(f.descarte).toEqual(e.descarte);
    expect(f.movimientos).toBe(2);
  });

  it('abandonar termina sin victoria', () => {
    const f = hacer(nueva(), { tipo: 'abandonar' });
    expect(golf.resultado(f)).toEqual({ ganadores: [], empate: false });
    expect(golf.vistaDe(f, 0).situacion).toBe('abandono');
  });

  it('la vista dice cuántas cartas tiene el mazo, no cuáles', () => {
    const e = nueva();
    const v = golf.vistaDe(e, 0);
    expect(v.mazo).toBe(16);
    expect(JSON.stringify(v)).not.toContain(`"${e.mazo[0]}"`);
  });
});

describirContrato(golf, {
  configs: [CONFIG_GOLF_POR_DEFECTO, { vuelta: true }],
  cartasOcultas: (e) => [...e.mazo],
  evitar: (a) => a.tipo === 'abandonar',
  pasosMaximos: 200,
  ejecuciones: 30,
});
