import { describe, expect, it } from 'vitest';
import {
  CONFIG_CUARENTA_LADRONES_POR_DEFECTO,
  cuarentaLadrones,
  type AccionCuarentaLadrones,
  type CartaLadrones,
  type EstadoCuarentaLadrones,
} from '../../src/juegos/cuarenta-ladrones';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(semilla = 'l'): EstadoCuarentaLadrones {
  const r = cuarentaLadrones.crear(CONFIG_CUARENTA_LADRONES_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Cartas en notación corta: «7p» es el 7 de picas (copia 0); «7p'» la copia 1. */
function c(texto: string): CartaLadrones[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return texto.split(' ').map((t) => {
    const copia = t.endsWith("'") ? 1 : 0;
    const s = copia ? t.slice(0, -1) : t;
    const v = s.slice(0, -1);
    return `${palos[s.at(-1)!]}-${valores[v] ?? Number(v)}#${copia}` as CartaLadrones;
  });
}

/** Mesa con las columnas indicadas (las que falten, vacías); el resto, vacío salvo que se diga. */
function mesa(
  columnas: string[],
  parcial: Partial<EstadoCuarentaLadrones> = {},
): EstadoCuarentaLadrones {
  const cols = Array.from({ length: 10 }, (_, i) => c(columnas[i] ?? ''));
  return {
    ...nueva(),
    mazo: [],
    descarte: [],
    columnas: cols,
    fundaciones: Array.from({ length: 8 }, () => []),
    historial: [],
    movimientos: 0,
    ...parcial,
  };
}

const hacer = (e: EstadoCuarentaLadrones, a: AccionCuarentaLadrones) => {
  const r = aplicar(cuarentaLadrones, e, 0, a);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};
const esLegal = (e: EstadoCuarentaLadrones, a: AccionCuarentaLadrones) =>
  aplicar(cuarentaLadrones, e, 0, a).ok;
const tipos = (e: EstadoCuarentaLadrones) =>
  cuarentaLadrones.accionesLegales(e, 0).map((a) => a.tipo);

describe('Reparto de Cuarenta ladrones', () => {
  it('10 columnas de 4, 64 en el mazo y todo lo demás vacío', () => {
    const e = nueva();
    expect(e.columnas.map((x) => x.length)).toEqual(new Array(10).fill(4));
    expect(e.mazo).toHaveLength(64);
    expect(e.descarte).toEqual([]);
    expect(e.fundaciones).toEqual(new Array(8).fill([]));
    expect(new Set([...e.columnas.flat(), ...e.mazo]).size).toBe(104);
  });
});

describe('Fundaciones de Cuarenta ladrones', () => {
  it('empieza con un As y no con un 2', () => {
    const e = mesa(['Ap', '2p']);
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'f0', cantidad: 1 })).toBe(false);
  });

  it('el otro As del mismo palo empieza una segunda fundación', () => {
    let e = mesa(['Ac', "Ac'"]);
    e = hacer(e, { tipo: 'mover', desde: 'c0', hasta: 'f0', cantidad: 1 });
    e = hacer(e, { tipo: 'mover', desde: 'c1', hasta: 'f1', cantidad: 1 });
    expect(e.fundaciones[0]).toHaveLength(1);
    expect(e.fundaciones[1]).toHaveLength(1);
  });

  it('lo que sube no vuelve a bajar', () => {
    const e = mesa(['2p'], { fundaciones: [c('Ap'), [], [], [], [], [], [], []] });
    const acciones = cuarentaLadrones.accionesLegales(e, 0);
    expect(acciones.some((a) => a.tipo === 'mover' && a.desde.startsWith('f'))).toBe(false);
  });
});

describe('Columnas de Cuarenta ladrones', () => {
  it('se construye por palo', () => {
    const e = mesa(['7p', '8p', '8t']);
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c1', cantidad: 1 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c0', hasta: 'c2', cantidad: 1 })).toBe(false);
  });

  it('con un hueco cabe un tramo de 2, no de 3', () => {
    // Las columnas 3 a 8 tienen algo; la 9 está vacía.
    const llenas = ['Kd', 'Kd', 'Kd', 'Kd', 'Kd', 'Kd'];
    const e = mesa(['7c', '6c 5c', '7c 6c 5c 4c', ...llenas, ''], {});
    expect(esLegal(e, { tipo: 'mover', desde: 'c1', hasta: 'c0', cantidad: 2 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 'c2', hasta: 'c0', cantidad: 3 })).toBe(false);
  });

  it('a una columna vacía, con dos huecos, un tramo de 2 y no de 3', () => {
    const llenas = ['Kd', 'Kd', 'Kd', 'Kd', 'Kd', 'Kd', 'Kd'];
    const e = mesa(['9t 8c 7c', '9t 6c 5c 4c', ...llenas, '']);
    const conHuecos = { ...e, columnas: [...e.columnas.slice(0, 8), [], []] };
    expect(esLegal(conHuecos, { tipo: 'mover', desde: 'c0', hasta: 'c8', cantidad: 2 })).toBe(true);
    expect(esLegal(conHuecos, { tipo: 'mover', desde: 'c1', hasta: 'c8', cantidad: 3 })).toBe(
      false,
    );
  });

  it('una columna vacía admite cualquier carta', () => {
    const e = mesa(['9t 5c'], { descarte: c('Qd') });
    expect(esLegal(e, { tipo: 'mover', desde: 'descarte', hasta: 'c1', cantidad: 1 })).toBe(true);
  });
});

describe('Mazo y descarte de Cuarenta ladrones', () => {
  it('robar pasa una carta del mazo al descarte', () => {
    const e = hacer(nueva(), { tipo: 'robar' });
    expect(e.mazo).toHaveLength(63);
    expect(e.descarte).toHaveLength(1);
  });

  it('con el mazo vacío no se roba ni se recicla', () => {
    const e = mesa(['9t'], { descarte: c('3d') });
    expect(tipos(e)).not.toContain('robar');
    expect(tipos(e)).not.toContain('reciclar');
  });
});

describe('Deshacer y autocompletar en Cuarenta ladrones', () => {
  it('deshacer un robo devuelve la carta al mazo', () => {
    const antes = nueva();
    let e = hacer(antes, { tipo: 'robar' });
    e = hacer(e, { tipo: 'deshacer' });
    expect(e.mazo).toEqual(antes.mazo);
    expect(e.descarte).toEqual([]);
    expect(e.movimientos).toBe(2);
  });

  it('autocompletar sube las 104 cartas cuando se puede', () => {
    // Cada fundación tiene del As a la Q; las 8 K están en las columnas.
    const palos = ['p', 'c', 'd', 't'];
    const fundaciones = [0, 1].flatMap((copia) =>
      palos.map((p) =>
        c(
          ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q']
            .map((v) => `${v}${p}${copia ? "'" : ''}`)
            .join(' '),
        ),
      ),
    );
    const e = mesa(['Kp Kc', 'Kd Kt', "Kp' Kc'", "Kd' Kt'"], { fundaciones });
    expect(tipos(e)).toContain('autocompletar');
    const fin = hacer(e, { tipo: 'autocompletar' });
    expect(fin.fundaciones.flat()).toHaveLength(104);
    expect(cuarentaLadrones.resultado(fin)).toEqual({ ganadores: [0], empate: false });
  });

  it('sin autocompletar mientras queda mazo', () => {
    expect(tipos(nueva())).not.toContain('autocompletar');
  });
});

describe('Vista de Cuarenta ladrones', () => {
  it('muestra cuántas quedan en el mazo, no cuáles', () => {
    const e = nueva();
    const v = cuarentaLadrones.vistaDe(e, 0);
    expect(v.mazo).toBe(64);
    const texto = JSON.stringify(v);
    for (const carta of e.mazo.slice(0, 20)) expect(texto).not.toContain(`"${carta}"`);
    expect(v.situacion).toBe('jugando');
  });

  it('abandonar termina la partida sin victoria', () => {
    const e = hacer(nueva(), { tipo: 'abandonar' });
    expect(cuarentaLadrones.resultado(e)).toEqual({ ganadores: [], empate: false });
    expect(cuarentaLadrones.vistaDe(e, 0).situacion).toBe('abandono');
  });
});

describirContrato(cuarentaLadrones, {
  configs: [CONFIG_CUARENTA_LADRONES_POR_DEFECTO],
  cartasOcultas: (e) => [...e.mazo],
  pasosMaximos: 200,
  ejecuciones: 40,
  evitar: (a) => a.tipo === 'abandonar',
});
