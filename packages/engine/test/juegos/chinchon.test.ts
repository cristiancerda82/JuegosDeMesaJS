import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  chinchon,
  CONFIG_CHINCHON_POR_DEFECTO,
  esChinchon,
  mejorReparto,
  puedeCerrarCon,
  puntosCarta,
  type AccionChinchon,
  type ConfigChinchon,
  type EstadoChinchon,
} from '../../src/juegos/chinchon';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigChinchon> = {}, semilla = 'c'): EstadoChinchon {
  const r = chinchon.crear({ ...CONFIG_CHINCHON_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoChinchon>, 'config'> & { config?: Partial<ConfigChinchon> };

function mesa(parcial: Parcial = {}): EstadoChinchon {
  const config = { ...CONFIG_CHINCHON_POR_DEFECTO, ...parcial.config };
  const n = config.jugadores;
  return {
    azar: crearAzar('mesa'),
    repartidor: n - 1,
    mazo: ['bastos-5', 'bastos-6', 'bastos-7'],
    descarte: ['espadas-1'],
    manos: Array.from({ length: n }, () => []),
    turno: 0,
    fase: 'robar',
    robadaDelDescarte: null,
    puntos: new Array<number>(n).fill(0),
    eliminados: new Array<boolean>(n).fill(false),
    ultimaAccion: null,
    resultadosManos: [],
    ...parcial,
    config,
  };
}

function jugar(e: EstadoChinchon, asiento: number, accion: AccionChinchon): EstadoChinchon {
  const r = aplicar(chinchon, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const legales = (e: EstadoChinchon) => chinchon.accionesLegales(e, e.turno);
const ordenar = (cartas: readonly IdCarta[]) => [...cartas].sort();

// ── Valores y combinaciones ──────────────────────────────────────────────────

describe('valores', () => {
  it('as 1, del 2 al 9 su número, figuras 10 y comodín 25', () => {
    expect(
      ['oros-1', 'oros-7', 'oros-9', 'oros-10', 'oros-12'].map((c) => puntosCarta(c as IdCarta)),
    ).toEqual([1, 7, 9, 10, 10]);
    expect(puntosCarta('oros-1') + puntosCarta('copas-11') + puntosCarta('comodin-1')).toBe(36);
  });
});

describe('mejor combinación', () => {
  it('agrupa la escalera de figuras y el trío de cuatros, con el 2 suelto', () => {
    const r = mejorReparto(
      ['oros-10', 'oros-11', 'oros-12', 'copas-4', 'espadas-4', 'bastos-4', 'oros-2'],
      'espanola40',
    );
    expect(r.puntos).toBe(2);
    expect(r.sueltas).toEqual(['oros-2']);
    expect(r.combinaciones.map(ordenar)).toEqual(
      expect.arrayContaining([
        ordenar(['oros-10', 'oros-11', 'oros-12']),
        ordenar(['copas-4', 'espadas-4', 'bastos-4']),
      ]),
    );
  });

  it('en la de 40, el 7 y la sota son seguidos; en la de 48, no', () => {
    const mano: IdCarta[] = ['copas-6', 'copas-7', 'copas-10'];
    expect(mejorReparto(mano, 'espanola40').puntos).toBe(0);
    expect(mejorReparto(mano, 'espanola48').puntos).toBe(23);
  });

  it('el as no va detrás del rey', () => {
    expect(mejorReparto(['oros-11', 'oros-12', 'oros-1'], 'espanola40').puntos).toBe(21);
  });

  it('un comodín completa un trío o tapa un hueco de una escalera', () => {
    expect(mejorReparto(['oros-4', 'bastos-4', 'comodin-1'], 'espanola40').puntos).toBe(0);
    expect(mejorReparto(['copas-2', 'copas-4', 'comodin-2'], 'espanola40').puntos).toBe(0);
    expect(mejorReparto(['copas-2', 'copas-3', 'comodin-2'], 'espanola40').puntos).toBe(0);
  });

  it('dos comodines no ligan juntos', () => {
    const r = mejorReparto(['oros-4', 'comodin-1', 'comodin-2'], 'espanola40');
    expect(r.sueltas).toHaveLength(3);
    expect(r.puntos).toBe(54);
  });

  it('elige la agrupación óptima cuando una carta sirve para dos combinaciones', () => {
    // El 5 de oros puede ir en el trío de cincos o en la escalera 3-4-5 de oros.
    const r = mejorReparto(
      ['oros-3', 'oros-4', 'oros-5', 'copas-5', 'espadas-5', 'bastos-5'],
      'espanola40',
    );
    expect(r.puntos).toBe(0);
  });

  it('chinchón: escalera de 7 del mismo palo sin comodines', () => {
    const escalera: IdCarta[] = [
      'bastos-1',
      'bastos-2',
      'bastos-3',
      'bastos-4',
      'bastos-5',
      'bastos-6',
      'bastos-7',
    ];
    expect(esChinchon(escalera, 'espanola40')).toBe(true);
    expect(esChinchon([...escalera.slice(0, 6), 'comodin-1'], 'espanola40')).toBe(false);
    expect(esChinchon([...escalera.slice(1), 'bastos-10'], 'espanola40')).toBe(true);
  });
});

// ── Preparación y turno ──────────────────────────────────────────────────────

describe('preparación', () => {
  it('3 jugadores con 40 y comodines: 7 cartas, 1 en el descarte y 20 en el mazo', () => {
    const e = nueva({ jugadores: 3 });
    expect(e.manos.map((m) => m.length)).toEqual([7, 7, 7]);
    expect(e.descarte).toHaveLength(1);
    expect(e.mazo).toHaveLength(20);
    expect(new Set([...e.manos.flat(), ...e.descarte, ...e.mazo]).size).toBe(42);
    expect(e.turno).toBe((e.repartidor + 1) % 3);
    expect(e.fase).toBe('robar');
  });

  it('rechaza configuraciones inválidas', () => {
    expect(chinchon.crear({ ...CONFIG_CHINCHON_POR_DEFECTO, jugadores: 5 as 4 }, 'x').ok).toBe(
      false,
    );
    expect(chinchon.crear({ ...CONFIG_CHINCHON_POR_DEFECTO, limite: 70 as 50 }, 'x').ok).toBe(
      false,
    );
  });
});

describe('turno', () => {
  it('robar y luego descartar; el turno pasa al siguiente', () => {
    const e = mesa({
      manos: [['oros-1', 'oros-2', 'oros-3', 'oros-4', 'oros-5', 'oros-6', 'copas-12'], []],
    });
    expect(legales(e)).toEqual([
      { tipo: 'robar', desde: 'mazo' },
      { tipo: 'robar', desde: 'descarte' },
    ]);
    const robado = jugar(e, 0, { tipo: 'robar', desde: 'descarte' });
    expect(robado.manos[0]).toHaveLength(8);
    expect(robado.fase).toBe('descartar');
    expect(legales(robado).every((a) => a.tipo !== 'robar')).toBe(true);
    const d = jugar(robado, 0, { tipo: 'descartar', carta: 'copas-12' });
    expect(d.manos[0]).toHaveLength(7);
    expect(d.descarte.at(-1)).toBe('copas-12');
    expect(d.turno).toBe(1);
    expect(d.fase).toBe('robar');
  });

  it('no se puede devolver la carta robada del descarte', () => {
    const e = mesa({ descarte: ['copas-5'], manos: [['oros-1'], []] });
    const d = jugar(e, 0, { tipo: 'robar', desde: 'descarte' });
    expect(legales(d)).not.toContainEqual({ tipo: 'descartar', carta: 'copas-5' });
    expect(legales(d)).toContainEqual({ tipo: 'descartar', carta: 'oros-1' });
  });

  it('robar del mazo no revela la carta', () => {
    const e = mesa({ manos: [['oros-1'], []] });
    const d = jugar(e, 0, { tipo: 'robar', desde: 'mazo' });
    expect(d.manos[0]).toContain('bastos-7');
    expect(d.ultimaAccion).toEqual({ asiento: 0, tipo: 'robar', desde: 'mazo', carta: null });
    expect(JSON.stringify(chinchon.vistaDe(d, 1))).not.toContain('bastos-7');
  });

  it('con el mazo agotado, el descarte salvo la de arriba se baraja como mazo', () => {
    const e = mesa({
      mazo: [],
      descarte: ['copas-1', 'copas-2', 'copas-3', 'copas-4'],
      manos: [['oros-1'], []],
    });
    const d = jugar(e, 0, { tipo: 'robar', desde: 'mazo' });
    expect(d.descarte).toEqual(['copas-4']);
    expect(d.mazo).toHaveLength(2);
    expect(new Set([...d.mazo, d.manos[0]!.at(-1)])).toEqual(
      new Set(['copas-1', 'copas-2', 'copas-3']),
    );
  });

  it('el turno se salta a los eliminados', () => {
    const e = mesa({
      config: { jugadores: 3 },
      fase: 'descartar',
      manos: [['oros-1', 'oros-2'], [], ['copas-1']],
      eliminados: [false, true, false],
    });
    expect(jugar(e, 0, { tipo: 'descartar', carta: 'oros-2' }).turno).toBe(2);
    expect(chinchon.accionesLegales(e, 1)).toEqual([]);
  });
});

// ── Cerrar y puntuación ──────────────────────────────────────────────────────

describe('cerrar', () => {
  const ligada: IdCarta[] = ['oros-1', 'oros-2', 'oros-3', 'copas-5', 'espadas-5', 'bastos-5'];

  it('se puede cerrar con una carta suelta pequeña', () => {
    expect(puedeCerrarCon([...ligada, 'copas-2'], CONFIG_CHINCHON_POR_DEFECTO)).toBe(true);
    const e = mesa({ fase: 'descartar', manos: [[...ligada, 'copas-2', 'espadas-12'], []] });
    expect(legales(e)).toContainEqual({ tipo: 'cerrar', carta: 'espadas-12' });
  });

  it('no se cierra con una suelta de 5, salvo con el máximo en 5', () => {
    expect(puedeCerrarCon([...ligada, 'copas-6'], CONFIG_CHINCHON_POR_DEFECTO)).toBe(false);
    const cincos: IdCarta[] = ['oros-1', 'oros-2', 'oros-3', 'oros-10', 'oros-11', 'oros-12'];
    expect(puedeCerrarCon([...cincos, 'copas-5'], CONFIG_CHINCHON_POR_DEFECTO)).toBe(false);
    expect(
      puedeCerrarCon([...cincos, 'copas-5'], { ...CONFIG_CHINCHON_POR_DEFECTO, cierreMaximo: 5 }),
    ).toBe(true);
  });

  it('con todo ligado suma −10, y los demás sus cartas sin ligar', () => {
    const e = mesa({
      fase: 'descartar',
      manos: [
        [...ligada, 'oros-4', 'espadas-12'],
        ['bastos-12', 'copas-3', 'oros-10', 'oros-11', 'oros-12', 'bastos-1', 'copas-1'],
      ],
      config: { limite: 100 },
    });
    const fin = jugar(e, 0, { tipo: 'cerrar', carta: 'espadas-12' });
    const [r] = fin.resultadosManos;
    expect(r!.cierra).toBe(0);
    expect(r!.manos.find((m) => m.asiento === 0)!.puntos).toBe(-10);
    // Rival: escalera de figuras de oros; sin ligar el rey de bastos, el 3 de copas y los dos ases.
    expect(r!.manos.find((m) => m.asiento === 1)!.puntos).toBe(10 + 3 + 1 + 1);
    expect(r!.puntosTras).toEqual([-10, 15]);
  });

  it('el chinchón gana la partida', () => {
    const escalera: IdCarta[] = [
      'bastos-1',
      'bastos-2',
      'bastos-3',
      'bastos-4',
      'bastos-5',
      'bastos-6',
      'bastos-7',
    ];
    const e = mesa({
      config: { jugadores: 3 },
      fase: 'descartar',
      manos: [[...escalera, 'oros-12'], ['copas-1'], ['copas-2']],
    });
    const fin = jugar(e, 0, { tipo: 'cerrar', carta: 'oros-12' });
    expect(fin.resultadosManos[0]!.chinchon).toBe(true);
    expect(chinchon.resultado(fin)).toMatchObject({ ganadores: [0], empate: false });
  });
});

describe('eliminación y fin de la partida', () => {
  const ligada: IdCarta[] = [
    'oros-1',
    'oros-2',
    'oros-3',
    'copas-5',
    'espadas-5',
    'bastos-5',
    'oros-4',
  ];

  it('quien pasa del límite queda eliminado y la siguiente mano se reparte sin él', () => {
    const e = mesa({
      config: { jugadores: 3 },
      fase: 'descartar',
      manos: [
        [...ligada, 'espadas-12'],
        ['bastos-12', 'copas-12', 'oros-10', 'copas-7', 'espadas-1', 'bastos-1', 'copas-1'],
        ['copas-3', 'copas-4', 'copas-6', 'espadas-7', 'bastos-7', 'oros-7', 'espadas-2'],
      ],
      puntos: [10, 70, 20],
    });
    const d = jugar(e, 0, { tipo: 'cerrar', carta: 'espadas-12' });
    const r = d.resultadosManos[0]!;
    // Rival 1: tres unos ligados; sueltas rey, rey, sota y 7 = 37 → 107.
    expect(r.puntosTras[1]).toBe(107);
    expect(r.eliminadosTras).toEqual([false, true, false]);
    expect(chinchon.resultado(d)).toBeNull();
    expect(d.manos.map((m) => m.length)).toEqual([7, 0, 7]);
  });

  it('en 2 jugadores, al eliminarse uno gana el otro', () => {
    const e = mesa({
      fase: 'descartar',
      manos: [
        [...ligada, 'espadas-12'],
        ['bastos-12', 'copas-12', 'oros-10', 'copas-7', 'espadas-1', 'bastos-6', 'copas-2'],
      ],
      puntos: [0, 80],
    });
    const fin = jugar(e, 0, { tipo: 'cerrar', carta: 'espadas-12' });
    expect(chinchon.resultado(fin)).toMatchObject({ ganadores: [0], empate: false });
  });

  it('una partida completa termina', () => {
    let e = nueva({ limite: 50 }, 'completa');
    for (let pasos = 0; chinchon.resultado(e) === null; pasos++) {
      if (pasos > 20_000) throw new Error('No termina');
      const acciones = legales(e);
      // Cierra si puede; si no, roba del mazo y descarta la carta que menos sirve.
      const descartes = acciones.filter((a) => a.tipo === 'descartar');
      const mano = e.manos[e.turno]!;
      const accion =
        acciones.find((a) => a.tipo === 'cerrar') ??
        acciones.find((a) => a.tipo === 'robar' && a.desde === 'mazo') ??
        [...descartes].sort(
          (a, b) =>
            mejorReparto(
              mano.filter((c) => c !== a.carta),
              'espanola40',
            ).puntos -
            mejorReparto(
              mano.filter((c) => c !== b.carta),
              'espanola40',
            ).puntos,
        )[0]!;
      e = jugar(e, e.turno, accion);
    }
    expect(chinchon.resultado(e)!.ganadores.length).toBeGreaterThan(0);
  });
});

// ── Vista y contrato ─────────────────────────────────────────────────────────

describe('vista', () => {
  it('oculta las manos ajenas y el descarte salvo la carta de arriba', () => {
    const e = mesa({
      descarte: ['espadas-1', 'espadas-2'],
      manos: [['oros-1'], ['copas-12']],
    });
    const v = chinchon.vistaDe(e, 0);
    expect(v.descarteArriba).toBe('espadas-2');
    expect(v.cartasDescarte).toBe(2);
    const texto = JSON.stringify(v);
    expect(texto).not.toContain('copas-12');
    expect(texto).not.toContain('espadas-1"');
    expect(texto).not.toContain('bastos-5');
  });
});

describirContrato(chinchon, {
  configs: [
    CONFIG_CHINCHON_POR_DEFECTO,
    { jugadores: 3, baraja: 'espanola48', comodines: false, limite: 50, cierreMaximo: 5 },
    { jugadores: 4, baraja: 'espanola40', comodines: true, limite: 50, cierreMaximo: 0 },
  ],
  // Las manos destapadas de manos anteriores repiten identificadores de las cartas actuales,
  // así que solo se comprueba la primera mano, antes de que haya resultados.
  // La carta robada del descarte y la última jugada son públicas aunque estén en una mano.
  cartasOcultas: (e, asiento) =>
    e.resultadosManos.length > 0
      ? []
      : [
          ...e.mazo,
          ...e.descarte.slice(0, -1),
          ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
        ].filter((c) => c !== e.robadaDelDescarte && c !== e.ultimaAccion?.carta),
  pasosMaximos: 200,
  ejecuciones: 30,
});
