import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_SCORPION_POR_DEFECTO,
  scorpion,
  type AccionScorpion,
  type EstadoScorpion,
} from '../../src/juegos/scorpion';
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

function nueva(semilla = 's'): EstadoScorpion {
  const r = scorpion.crear(CONFIG_SCORPION_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Mesa con columnas «tapadas | visibles»; las que falten, vacías. */
function mesa(columnas: string[], parcial: Partial<EstadoScorpion> = {}): EstadoScorpion {
  return {
    ...nueva(),
    columnas: Array.from({ length: 7 }, (_, i) => {
      const [ocultas, visibles] = (columnas[i] || '|').split('|').map((x) => c(x.trim()));
      return { ocultas: ocultas!, visibles: visibles! };
    }),
    reserva: [],
    historial: [],
    movimientos: 0,
    ...parcial,
  };
}

const hacer = (e: EstadoScorpion, a: AccionScorpion) => {
  const r = aplicar(scorpion, e, 0, a);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};
const esLegal = (e: EstadoScorpion, a: AccionScorpion) => aplicar(scorpion, e, 0, a).ok;

describe('Reparto del Scorpion', () => {
  it('7 columnas de 7, 3 tapadas en las 4 primeras, y 3 en la reserva', () => {
    const e = nueva();
    expect(e.columnas.map((x) => x.ocultas.length + x.visibles.length)).toEqual(
      new Array(7).fill(7),
    );
    expect(e.columnas.map((x) => x.ocultas.length)).toEqual([3, 3, 3, 3, 0, 0, 0]);
    expect(e.reserva).toHaveLength(3);
    const todas = [...e.columnas.flatMap((x) => [...x.ocultas, ...x.visibles]), ...e.reserva];
    expect(new Set(todas).size).toBe(52);
  });
});

describe('Mover en el Scorpion', () => {
  it('una carta se mueve con las que tiene encima, aunque estén desordenadas', () => {
    const e = mesa(['| 3d 6p 2c Jt', '| 7p']);
    const tras = hacer(e, { tipo: 'mover', desde: 0, hasta: 1, cantidad: 3 });
    expect(tras.columnas[1]!.visibles).toEqual(c('7p 6p 2c Jt'));
    expect(tras.columnas[0]!.visibles).toEqual(c('3d'));
    expect(tras.movimientos).toBe(1);
  });

  it('sobre otro palo se rechaza', () => {
    const e = mesa(['| 6c', '| 7p']);
    expect(esLegal(e, { tipo: 'mover', desde: 0, hasta: 1, cantidad: 1 })).toBe(false);
  });

  it('una columna vacía solo admite una K', () => {
    const e = mesa(['| 3d Kc 2t', '| 5p', '']);
    expect(esLegal(e, { tipo: 'mover', desde: 0, hasta: 2, cantidad: 2 })).toBe(true);
    expect(esLegal(e, { tipo: 'mover', desde: 1, hasta: 2, cantidad: 1 })).toBe(false);
  });
});

describe('Cartas tapadas y reserva del Scorpion', () => {
  it('la carta tapada que queda arriba se da la vuelta', () => {
    const e = mesa(['2c 9d | 6p', '| 7p']);
    const tras = hacer(e, { tipo: 'mover', desde: 0, hasta: 1, cantidad: 1 });
    expect(tras.columnas[0]).toEqual({ ocultas: c('2c'), visibles: c('9d') });
  });

  it('repartir la reserva pone una carta en cada una de las 3 primeras columnas', () => {
    const e = nueva();
    const tras = hacer(e, { tipo: 'repartir' });
    expect(tras.reserva).toEqual([]);
    for (let i = 0; i < 3; i++) {
      expect(tras.columnas[i]!.visibles.at(-1)).toBe(e.reserva[i]);
    }
    expect(scorpion.accionesLegales(tras, 0).some((a) => a.tipo === 'repartir')).toBe(false);
  });
});

describe('Deshacer, victoria y vista del Scorpion', () => {
  it('deshacer devuelve la carta descubierta a su sitio, boca abajo', () => {
    const e = mesa(['2c 9d | 6p', '| 7p']);
    let tras = hacer(e, { tipo: 'mover', desde: 0, hasta: 1, cantidad: 1 });
    tras = hacer(tras, { tipo: 'deshacer' });
    expect(tras.columnas).toEqual(e.columnas);
    expect(tras.movimientos).toBe(2);
  });

  it('gana cuando cada palo forma su escalera de la K al As', () => {
    const escalera = (p: string) =>
      ['K', 'Q', 'J', 10, 9, 8, 7, 6, 5, 4, 3, 2, 'A'].map((v) => `${v}${p}`).join(' ');
    // Falta mover el As de tréboles a su sitio.
    const e = mesa([
      `| ${escalera('p')}`,
      `| ${escalera('c')}`,
      `| ${escalera('d')}`,
      `| ${escalera('t').replace(' At', '')}`,
      '| At',
    ]);
    expect(scorpion.resultado(e)).toBeNull();
    const fin = hacer(e, { tipo: 'mover', desde: 4, hasta: 3, cantidad: 1 });
    expect(scorpion.resultado(fin)).toEqual({ ganadores: [0], empate: false });
    expect(scorpion.vistaDe(fin, 0).situacion).toBe('victoria');
  });

  it('la vista no muestra las tapadas ni la reserva', () => {
    const e = nueva();
    const v = scorpion.vistaDe(e, 0);
    expect(v.columnas.map((x) => x.ocultas)).toEqual([3, 3, 3, 3, 0, 0, 0]);
    expect(v.reserva).toBe(3);
    const texto = JSON.stringify(v);
    for (const carta of [...e.reserva, ...e.columnas.flatMap((x) => x.ocultas)]) {
      expect(texto).not.toContain(`"${carta}"`);
    }
  });

  it('abandonar termina sin victoria', () => {
    const e = hacer(nueva(), { tipo: 'abandonar' });
    expect(scorpion.resultado(e)).toEqual({ ganadores: [], empate: false });
  });
});

describirContrato(scorpion, {
  configs: [CONFIG_SCORPION_POR_DEFECTO],
  cartasOcultas: (e) => [...e.reserva, ...e.columnas.flatMap((x) => x.ocultas)],
  pasosMaximos: 200,
  ejecuciones: 40,
  evitar: (a) => a.tipo === 'abandonar',
});
