import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { crearBaraja, type IdCarta } from '../../src/baraja/cartas';
import {
  combinaciones,
  CONFIG_ESCOBA_POR_DEFECTO,
  escoba,
  puntuarMano,
  valorEscoba,
  type AccionEscoba,
  type ConfigEscoba,
  type EstadoEscoba,
} from '../../src/juegos/escoba';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigEscoba> = {}, semilla = 'e'): EstadoEscoba {
  const r = escoba.crear({ ...CONFIG_ESCOBA_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoEscoba>, 'config'> & { config?: Partial<ConfigEscoba> };

function mesa(parcial: Parcial = {}): EstadoEscoba {
  const config = { ...CONFIG_ESCOBA_POR_DEFECTO, ...parcial.config };
  const n = config.jugadores;
  return {
    azar: crearAzar('mesa'),
    repartidor: n - 1,
    mazo: [],
    mesa: [],
    manos: Array.from({ length: n }, () => []),
    turno: 0,
    recogidas: [[], []],
    escobas: [0, 0],
    ultimoEnRecoger: null,
    ultimaJugada: null,
    resultadosManos: [],
    ...parcial,
    config,
  };
}

function jugar(e: EstadoEscoba, asiento: number, accion: AccionEscoba): EstadoEscoba {
  const r = aplicar(escoba, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const jugada = (carta: IdCarta, captura: IdCarta[] = []): AccionEscoba => ({
  tipo: 'jugar',
  carta,
  captura,
});

const legalesDe = (e: EstadoEscoba, carta: IdCarta) =>
  escoba.accionesLegales(e, e.turno).filter((a) => a.carta === carta);

// ── Valores y capturas ───────────────────────────────────────────────────────

describe('valores', () => {
  it('as 1, del 2 al 7 su número, sota 8, caballo 9 y rey 10', () => {
    expect(
      ['oros-1', 'oros-5', 'oros-7', 'oros-10', 'oros-11', 'oros-12'].map((c) =>
        valorEscoba(c as IdCarta),
      ),
    ).toEqual([1, 5, 7, 8, 9, 10]);
    expect(crearBaraja('espanola40').reduce((s, c) => s + valorEscoba(c), 0)).toBe(220);
  });
});

describe('combinaciones', () => {
  it('encuentra todas las que suman, en el orden de la mesa', () => {
    const m: IdCarta[] = ['oros-4', 'copas-4', 'espadas-3', 'bastos-1'];
    expect(combinaciones(m, 7)).toEqual([
      ['oros-4', 'espadas-3'],
      ['copas-4', 'espadas-3'],
    ]);
    expect(combinaciones(m, 12)).toEqual([['oros-4', 'copas-4', 'espadas-3', 'bastos-1']]);
    expect(combinaciones(m, 13)).toEqual([]);
  });
});

// ── Preparación ──────────────────────────────────────────────────────────────

describe('preparación', () => {
  it('2 jugadores: 3 cartas cada uno, 4 en la mesa y 30 en el mazo', () => {
    // Una semilla en la que la mesa inicial no suma 15.
    let e = nueva({ escobaInicial: false });
    expect(e.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(e.mesa).toHaveLength(4);
    expect(e.mazo).toHaveLength(30);
    expect(e.turno).toBe((e.repartidor + 1) % 2);
    e = nueva({ jugadores: 4, escobaInicial: false });
    expect(e.manos.map((m) => m.length)).toEqual([3, 3, 3, 3]);
    expect(e.mazo).toHaveLength(24);
    expect(new Set([...e.manos.flat(), ...e.mesa, ...e.mazo]).size).toBe(40);
  });

  it('la mesa inicial que suma 15 es escoba del repartidor', () => {
    for (let i = 0; i < 400; i++) {
      const e = nueva({}, `inicial-${i}`);
      const sinRegla = nueva({ escobaInicial: false }, `inicial-${i}`);
      const suma = sinRegla.mesa.reduce((s, c) => s + valorEscoba(c), 0);
      if (suma !== 15 && suma !== 30) {
        expect(e.mesa).toEqual(sinRegla.mesa);
        continue;
      }
      const bando = e.repartidor % 2;
      expect(e.mesa).toEqual([]);
      expect(e.recogidas[bando]).toEqual(sinRegla.mesa);
      expect(e.escobas[bando]).toBe(suma / 15);
      return;
    }
    throw new Error('Ninguna semilla de prueba tiene una mesa inicial de 15');
  });

  it('rechaza configuraciones inválidas', () => {
    expect(escoba.crear({ ...CONFIG_ESCOBA_POR_DEFECTO, jugadores: 3 as 2 }, 'x').ok).toBe(false);
    expect(escoba.crear({ ...CONFIG_ESCOBA_POR_DEFECTO, puntosPartida: 20 as 21 }, 'x').ok).toBe(
      false,
    );
  });
});

// ── Jugar una carta ──────────────────────────────────────────────────────────

describe('jugar una carta', () => {
  it('captura simple: caballo con el 6 de copas', () => {
    const e = mesa({
      mesa: ['copas-6', 'copas-2'],
      manos: [['oros-11'], ['bastos-1']],
    });
    expect(legalesDe(e, 'oros-11')).toContainEqual(jugada('oros-11', ['copas-6']));
    const d = jugar(e, 0, jugada('oros-11', ['copas-6']));
    expect(d.mesa).toEqual(['copas-2']);
    expect(d.recogidas[0]).toEqual(['oros-11', 'copas-6']);
    expect(d.ultimoEnRecoger).toBe(0);
    expect(d.turno).toBe(1);
  });

  it('varias capturas posibles son jugadas distintas', () => {
    const e = mesa({
      mesa: ['oros-4', 'copas-4', 'espadas-3'],
      manos: [['bastos-10'], ['bastos-1']],
    });
    expect(legalesDe(e, 'bastos-10')).toEqual([
      jugada('bastos-10', ['oros-4', 'espadas-3']),
      jugada('bastos-10', ['copas-4', 'espadas-3']),
      jugada('bastos-10'),
    ]);
  });

  it('no recoger es legal por defecto y deja la carta en la mesa', () => {
    const e = mesa({ mesa: ['copas-6'], manos: [['oros-11'], ['bastos-1']] });
    const d = jugar(e, 0, jugada('oros-11'));
    expect(d.mesa).toEqual(['copas-6', 'oros-11']);
    expect(d.recogidas).toEqual([[], []]);
  });

  it('con la captura obligatoria, no recoger no es legal si se puede', () => {
    const e = mesa({
      config: { capturaObligatoria: true },
      mesa: ['copas-6'],
      manos: [['oros-11', 'oros-2'], ['bastos-1']],
    });
    expect(legalesDe(e, 'oros-11')).toEqual([jugada('oros-11', ['copas-6'])]);
    expect(legalesDe(e, 'oros-2')).toEqual([jugada('oros-2')]);
  });

  it('una captura que no suma 15 no es legal', () => {
    const e = mesa({ mesa: ['copas-6', 'copas-2'], manos: [['oros-11'], ['bastos-1']] });
    expect(aplicar(escoba, e, 0, jugada('oros-11', ['copas-2'])).ok).toBe(false);
  });

  it('escoba al dejar la mesa vacía', () => {
    const e = mesa({ mesa: ['oros-3', 'bastos-12'], manos: [['copas-2'], ['bastos-1']] });
    const d = jugar(e, 0, jugada('copas-2', ['oros-3', 'bastos-12']));
    expect(d.mesa).toEqual([]);
    expect(d.escobas).toEqual([1, 0]);
    expect(d.ultimaJugada).toEqual({
      asiento: 0,
      carta: 'copas-2',
      captura: ['oros-3', 'bastos-12'],
      escoba: true,
    });
  });
});

// ── Repartos y fin de mano ───────────────────────────────────────────────────

describe('repartos y fin de mano', () => {
  it('si todos se quedan sin cartas y queda mazo, se reparten 3 más sin tocar la mesa', () => {
    const e = mesa({
      mesa: ['copas-6'],
      manos: [[], ['bastos-1']],
      turno: 1,
      mazo: ['oros-1', 'oros-2', 'oros-3', 'oros-4', 'oros-5', 'oros-6', 'oros-7'],
    });
    const d = jugar(e, 1, jugada('bastos-1'));
    expect(d.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(d.mesa).toEqual(['copas-6', 'bastos-1']);
    expect(d.mazo).toEqual(['oros-7']);
    expect(d.turno).toBe(0);
  });

  it('las cartas de la mesa van al último que recogió, sin escoba', () => {
    const e = mesa({
      mesa: ['copas-6', 'espadas-5'],
      manos: [[], ['bastos-1']],
      turno: 1,
      ultimoEnRecoger: 0,
      recogidas: [['oros-1'], []],
    });
    const d = jugar(e, 1, jugada('bastos-1'));
    const [r] = d.resultadosManos;
    expect(r!.recuento[0].cartas).toBe(4);
    expect(r!.recuento[0].escobas).toBe(0);
  });
});

// ── Puntuación y partida ─────────────────────────────────────────────────────

describe('puntuación', () => {
  it('desglose: 2 escobas, más cartas, más oros, 7 de oros y más sietes', () => {
    const oros: IdCarta[] = ['oros-1', 'oros-2', 'oros-3', 'oros-4', 'oros-5', 'oros-7'];
    const sietes: IdCarta[] = ['copas-7', 'espadas-7'];
    const relleno = crearBaraja('espanola40')
      .filter((c) => !c.startsWith('oros') && !c.endsWith('-7'))
      .slice(0, 14);
    const a = [...oros, ...sietes, ...relleno];
    const r = puntuarMano([a, ['oros-6', 'bastos-7']], [2, 0]);
    expect(r.recuento[0]).toEqual({ cartas: 22, oros: 6, sietes: 3, sieteOros: true, escobas: 2 });
    expect(r.puntos[0]).toEqual({
      escobas: 2,
      cartas: 1,
      oros: 1,
      sieteOros: 1,
      sietes: 1,
      total: 6,
    });
    expect(r.puntos[1].total).toBe(0);
  });

  it('empate en oros: ese punto no es para nadie', () => {
    const r = puntuarMano(
      [
        ['oros-1', 'copas-1'],
        ['oros-2', 'copas-2', 'copas-3'],
      ],
      [0, 0],
    );
    expect(r.puntos[0].oros).toBe(0);
    expect(r.puntos[1].oros).toBe(0);
    expect(r.puntos[1].cartas).toBe(1);
  });
});

describe('partida', () => {
  const resultado = (a: number, b: number) => puntuarMano([[], []], [a, b]);

  it('termina al llegar a la meta y gana quien más tiene', () => {
    const e = mesa({
      manos: [[], ['bastos-1']],
      turno: 1,
      resultadosManos: [resultado(20, 3)],
      ultimoEnRecoger: 0,
      recogidas: [['oros-7'], []],
    });
    const fin = jugar(e, 1, jugada('bastos-1'));
    const r = escoba.resultado(fin);
    expect(r).not.toBeNull();
    expect(r!.ganadores).toEqual([0]);
    expect(r!.puntos![0]).toBeGreaterThanOrEqual(21);
  });

  it('con empate en la meta se reparte otra mano', () => {
    const e = mesa({
      manos: [[], ['bastos-1']],
      turno: 1,
      // 21 a 21 con la mano en curso sin puntos para nadie.
      resultadosManos: [resultado(21, 21)],
    });
    const d = jugar(e, 1, jugada('bastos-1'));
    expect(escoba.resultado(d)).toBeNull();
    expect(d.resultadosManos).toHaveLength(2);
    expect(d.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(d.repartidor).toBe(0);
  });

  it('una partida completa termina', () => {
    let e = nueva({ puntosPartida: 15 }, 'completa');
    for (let pasos = 0; escoba.resultado(e) === null; pasos++) {
      if (pasos > 5_000) throw new Error('No termina');
      e = jugar(e, e.turno, escoba.accionesLegales(e, e.turno)[0]!);
    }
    expect(Math.max(...escoba.vistaDe(e, 0).puntosPartida)).toBeGreaterThanOrEqual(15);
  });
});

// ── Vista y contrato ─────────────────────────────────────────────────────────

describe('vista', () => {
  it('muestra cuántas cartas recogió cada bando, pero no cuáles', () => {
    const e = mesa({
      mesa: ['copas-2'],
      manos: [['oros-1'], ['bastos-1']],
      recogidas: [['espadas-12', 'espadas-3'], ['copas-11']],
      escobas: [1, 0],
    });
    const v = escoba.vistaDe(e, 1);
    expect(v.cartasRecogidas).toEqual([2, 1]);
    expect(v.escobas).toEqual([1, 0]);
    const texto = JSON.stringify(v);
    expect(texto).not.toContain('espadas-12');
    expect(texto).not.toContain('oros-1"');
    expect(v.miMano).toEqual(['bastos-1']);
  });
});

describirContrato(escoba, {
  configs: [
    CONFIG_ESCOBA_POR_DEFECTO,
    { jugadores: 4, puntosPartida: 15, capturaObligatoria: true, escobaInicial: false },
    { jugadores: 2, puntosPartida: 15, capturaObligatoria: true, escobaInicial: true },
  ],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
  pasosMaximos: 150,
  ejecuciones: 30,
});
