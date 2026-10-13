import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import {
  cinquillo,
  CONFIG_CINQUILLO_POR_DEFECTO,
  type AccionCinquillo,
  type ConfigCinquillo,
  type EstadoCinquillo,
  type MesaCinquillo,
} from '../../src/juegos/cinquillo';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigCinquillo> = {}, semilla = 'c'): EstadoCinquillo {
  const r = cinquillo.crear({ ...CONFIG_CINQUILLO_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const SIN_MESA: MesaCinquillo = { oros: null, copas: null, espadas: null, bastos: null };

/** Mano armada a mano con oros ya abierto (solo el 5) y turno del asiento 0. */
function mesa(parcial: Partial<EstadoCinquillo> & Pick<EstadoCinquillo, 'manos'>): EstadoCinquillo {
  const n = parcial.manos.length;
  return {
    config: { jugadores: n as 2 | 3 | 4, manos: 1 },
    azar: crearAzar('mesa'),
    repartidor: n - 1,
    mesa: { ...SIN_MESA, oros: { bajo: 4, alto: 4 } },
    turno: 0,
    ultimaAccion: null,
    resultadosManos: [],
    totales: new Array<number>(n).fill(0),
    ...parcial,
  };
}

function jugar(e: EstadoCinquillo, asiento: number, accion: AccionCinquillo) {
  const r = aplicar(cinquillo, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const legales = (e: EstadoCinquillo, a: number) =>
  cinquillo
    .accionesLegales(e, a)
    .map((x) => (x.tipo === 'jugar' ? x.carta : 'pasar'))
    .sort();

// ── Reparto y salida ─────────────────────────────────────────────────────────

describe('reparto y salida', () => {
  it('3 jugadores: 14, 13 y 13 cartas sin repetir', () => {
    const e = nueva({ jugadores: 3 });
    expect(e.manos.map((m) => m.length).sort()).toEqual([13, 13, 14]);
    expect(new Set(e.manos.flat()).size).toBe(40);
  });

  it('2 jugadores: 20 cada uno; 4 jugadores: 10', () => {
    expect(nueva({ jugadores: 2 }).manos.map((m) => m.length)).toEqual([20, 20]);
    expect(nueva({ jugadores: 4 }).manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
  });

  it('sale quien tiene el 5 de oros y solo puede jugar esa carta', () => {
    const e = nueva();
    expect(e.manos[e.turno]).toContain('oros-5');
    expect(cinquillo.accionesLegales(e, e.turno)).toEqual([{ tipo: 'jugar', carta: 'oros-5' }]);
  });

  it('rechaza configuraciones inválidas', () => {
    expect(cinquillo.crear({ jugadores: 5 as 2, manos: 1 }, 's').ok).toBe(false);
    expect(cinquillo.crear({ jugadores: 2, manos: 2 as 1 }, 's').ok).toBe(false);
  });
});

// ── Escaleras ────────────────────────────────────────────────────────────────

describe('escaleras', () => {
  it('tras el 7 va la Sota; por abajo, el siguiente menor', () => {
    const e = mesa({
      mesa: { ...SIN_MESA, oros: { bajo: 4, alto: 4 }, copas: { bajo: 3, alto: 6 } },
      manos: [['copas-10', 'copas-3', 'copas-11', 'copas-2'], ['bastos-1']],
    });
    expect(legales(e, 0)).toEqual(['copas-10', 'copas-3']);
  });

  it('un palo sin abrir solo admite su 5', () => {
    const e = mesa({ manos: [['espadas-6', 'espadas-5'], ['bastos-1']] });
    expect(legales(e, 0)).toEqual(['espadas-5']);
  });

  it('jugar alarga la escalera y pasa el turno', () => {
    let e = mesa({ manos: [['oros-6', 'bastos-1'], ['bastos-2']] });
    e = jugar(e, 0, { tipo: 'jugar', carta: 'oros-6' });
    expect(e.mesa.oros).toEqual({ bajo: 4, alto: 5 });
    expect(e.turno).toBe(1);
    expect(e.ultimaAccion).toEqual({ asiento: 0, tipo: 'jugar', carta: 'oros-6' });
  });
});

// ── Obligación y paso ────────────────────────────────────────────────────────

describe('jugar es obligatorio', () => {
  it('con jugada no se puede pasar', () => {
    const e = mesa({ manos: [['oros-4', 'bastos-1'], ['bastos-2']] });
    expect(legales(e, 0)).toEqual(['oros-4']);
  });

  it('sin jugada solo se pasa y el turno sigue', () => {
    let e = mesa({ manos: [['bastos-1', 'copas-12'], ['bastos-2']] });
    expect(legales(e, 0)).toEqual(['pasar']);
    e = jugar(e, 0, { tipo: 'pasar' });
    expect(e.turno).toBe(1);
    expect(e.ultimaAccion).toEqual({ asiento: 0, tipo: 'pasar' });
  });
});

// ── Mano y partida ───────────────────────────────────────────────────────────

describe('fin de la mano y partida', () => {
  it('quien se queda sin cartas gana la mano y los demás suman sus cartas', () => {
    let e = mesa({
      manos: [
        ['oros-6'],
        ['bastos-1', 'bastos-2', 'bastos-3'],
        ['copas-1', 'copas-2', 'copas-3', 'copas-4', 'copas-6'],
      ],
    });
    e = jugar(e, 0, { tipo: 'jugar', carta: 'oros-6' });
    expect(e.resultadosManos[0]).toEqual({
      ganador: 0,
      cartasRestantes: [0, 3, 5],
      puntos: [0, 3, 5],
      totalesTras: [0, 3, 5],
    });
    expect(cinquillo.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [0, 3, 5] });
  });

  it('con más manos se reparte otra con el siguiente repartidor', () => {
    let e = mesa({
      config: { jugadores: 2, manos: 3 },
      manos: [['oros-6'], ['bastos-1', 'bastos-2']],
    });
    e = jugar(e, 0, { tipo: 'jugar', carta: 'oros-6' });
    expect(cinquillo.resultado(e)).toBeNull();
    expect(e.totales).toEqual([0, 2]);
    expect(e.repartidor).toBe(0);
    expect(e.manos.map((m) => m.length)).toEqual([20, 20]);
    expect(e.manos[e.turno]).toContain('oros-5');
  });

  it('gana la partida quien acaba con menos puntos', () => {
    let e = mesa({
      totales: [4, 4, 6],
      manos: [
        ['oros-6'],
        ['bastos-1', 'bastos-2', 'bastos-3', 'bastos-4', 'bastos-6'],
        ['copas-1', 'copas-2', 'copas-3', 'copas-4', 'copas-6', 'copas-7'],
      ],
    });
    e = jugar(e, 0, { tipo: 'jugar', carta: 'oros-6' });
    expect(e.totales).toEqual([4, 9, 12]);
    expect(cinquillo.resultado(e)?.ganadores).toEqual([0]);
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('no muestra las manos ajenas', () => {
    const e = nueva({ jugadores: 3 });
    const v = cinquillo.vistaDe(e, 0);
    const texto = JSON.stringify(v);
    for (const c of [...e.manos[1]!, ...e.manos[2]!]) expect(texto).not.toContain(`"${c}"`);
    expect(v.cartasEnMano).toEqual(e.manos.map((m) => m.length));
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(cinquillo, {
  configs: [CONFIG_CINQUILLO_POR_DEFECTO, { jugadores: 2, manos: 1 }, { jugadores: 3, manos: 5 }],
  // Las cartas de la mesa y la última jugada son públicas; las de otras manos, no.
  cartasOcultas: (e, asiento) => {
    const ultima = e.ultimaAccion?.tipo === 'jugar' ? e.ultimaAccion.carta : null;
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => c !== ultima);
  },
  pasosMaximos: 400,
  ejecuciones: 30,
});
