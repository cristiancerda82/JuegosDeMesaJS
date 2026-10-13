import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_GUINOTE_POR_DEFECTO,
  guinote,
  type AccionGuinote,
  type ConfigGuinote,
  type EstadoGuinote,
} from '../../src/juegos/guinote';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigGuinote> = {}, semilla = 'g'): EstadoGuinote {
  const r = guinote.crear({ ...CONFIG_GUINOTE_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoGuinote>, 'config'> & { config?: Partial<ConfigGuinote> };

/** Estado armado a mano, con mazo; triunfo en oros salvo que se indique otro. */
function mesa(parcial: Parcial = {}): EstadoGuinote {
  const config = { ...CONFIG_GUINOTE_POR_DEFECTO, ...parcial.config };
  const n = config.jugadores;
  return {
    azar: crearAzar('mesa'),
    repartidor: n - 1,
    mazo: ['bastos-5', 'bastos-6'],
    muestra: 'oros-4',
    triunfo: 'oros',
    manos: Array.from({ length: n }, () => []),
    mesa: [],
    turno: 0,
    puntos: new Array<number>(n).fill(0),
    bazas: new Array<number>(n).fill(0),
    ultimaBaza: null,
    cantes: [],
    puedeCantar: null,
    resultadosManos: [],
    totales: [0, 0],
    ...parcial,
    config,
  };
}

function jugar(e: EstadoGuinote, asiento: number, accion: AccionGuinote): EstadoGuinote {
  const r = aplicar(guinote, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const carta = (c: IdCarta): AccionGuinote => ({ tipo: 'jugar', carta: c });
const cartasLegales = (e: EstadoGuinote, a: number) =>
  guinote
    .accionesLegales(e, a)
    .flatMap((x) => (x.tipo === 'jugar' ? [x.carta] : []))
    .sort();
const otrasAcciones = (e: EstadoGuinote, a: number) =>
  guinote.accionesLegales(e, a).filter((x) => x.tipo !== 'jugar');

/** Juega la mano entera eligiendo siempre la primera carta legal (sin cantar ni cambiar). */
function jugarMano(e: EstadoGuinote): EstadoGuinote {
  const antes = e.resultadosManos.length;
  while (guinote.resultado(e) === null && e.resultadosManos.length === antes) {
    const accion = guinote.accionesLegales(e, e.turno).find((a) => a.tipo === 'jugar')!;
    e = jugar(e, e.turno, accion);
  }
  return e;
}

// ── Preparación ──────────────────────────────────────────────────────────────

describe('preparación', () => {
  it('2 jugadores: 6 cartas, muestra que marca el triunfo y 27 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([6, 6]);
    expect(e.mazo).toHaveLength(27);
    expect(e.triunfo).toBe(e.muestra!.split('-')[0]);
    expect(e.turno).toBe(0);
  });

  it('4 jugadores: 6 cartas, muestra y 15 en el mazo', () => {
    const e = nueva({ jugadores: 4 });
    expect(e.manos.map((m) => m.length)).toEqual([6, 6, 6, 6]);
    expect(e.mazo).toHaveLength(15);
    expect(e.muestra).not.toBeNull();
  });

  it('rechaza configuraciones inválidas', () => {
    expect(guinote.crear({ ...CONFIG_GUINOTE_POR_DEFECTO, jugadores: 3 as 2 }, 's').ok).toBe(false);
    expect(guinote.crear({ ...CONFIG_GUINOTE_POR_DEFECTO, meta: 0 }, 's').ok).toBe(false);
    expect(guinote.crear({ ...CONFIG_GUINOTE_POR_DEFECTO, cambioSiete: 'x' as 'no' }, 's').ok).toBe(
      false,
    );
  });
});

// ── Bazas y robo ─────────────────────────────────────────────────────────────

describe('bazas', () => {
  it('la sota gana al caballo', () => {
    let e = mesa({
      manos: [
        ['espadas-11', 'copas-2'],
        ['espadas-10', 'copas-4'],
      ],
    });
    e = jugar(e, 0, carta('espadas-11'));
    e = jugar(e, 1, carta('espadas-10'));
    expect(e.ultimaBaza!.ganador).toBe(1);
    expect(e.puntos).toEqual([0, 5]);
  });

  it('gana el triunfo', () => {
    let e = mesa({
      manos: [
        ['espadas-1', 'copas-2'],
        ['oros-4', 'copas-4'],
      ],
    });
    e = jugar(e, 0, carta('espadas-1'));
    e = jugar(e, 1, carta('oros-4'));
    expect(e.ultimaBaza!.ganador).toBe(1);
    expect(e.turno).toBe(1);
  });

  it('el ganador roba primero y todos vuelven a tener las mismas cartas', () => {
    let e = mesa({
      mazo: ['bastos-5', 'bastos-6', 'bastos-7'],
      manos: [
        ['espadas-2', 'copas-2'],
        ['espadas-1', 'copas-4'],
      ],
    });
    e = jugar(e, 0, carta('espadas-2'));
    e = jugar(e, 1, carta('espadas-1'));
    expect(e.manos[1]).toContain('bastos-7');
    expect(e.manos[0]).toContain('bastos-6');
    expect(e.manos.map((m) => m.length)).toEqual([2, 2]);
  });

  it('libre con mazo: cualquier carta es legal', () => {
    const e = mesa({
      turno: 1,
      mesa: [{ asiento: 0, carta: 'espadas-11' }],
      manos: [[], ['espadas-2', 'espadas-10', 'copas-1', 'oros-5']],
    });
    expect(cartasLegales(e, 1)).toEqual(['copas-1', 'espadas-10', 'espadas-2', 'oros-5']);
  });
});

describe('arrastre', () => {
  const arrastre = (p: Parcial) => mesa({ mazo: [], muestra: null, ...p });

  it('asistir y montar: solo la sota sobre el caballo', () => {
    const e = arrastre({
      turno: 1,
      mesa: [{ asiento: 0, carta: 'espadas-11' }],
      manos: [[], ['espadas-2', 'espadas-10', 'oros-5']],
    });
    expect(cartasLegales(e, 1)).toEqual(['espadas-10']);
  });

  it('sin el palo de salida, fallar y superar el triunfo más alto', () => {
    const e = arrastre({
      config: { jugadores: 4 },
      turno: 2,
      mesa: [
        { asiento: 0, carta: 'espadas-1' },
        { asiento: 1, carta: 'oros-5' },
      ],
      manos: [[], [], ['oros-2', 'oros-7', 'copas-1'], []],
    });
    expect(cartasLegales(e, 2)).toEqual(['oros-7']);
  });

  it('baza del compañero: cualquier carta del palo de salida', () => {
    const e = arrastre({
      config: { jugadores: 4 },
      turno: 2,
      mesa: [
        { asiento: 0, carta: 'espadas-1' },
        { asiento: 1, carta: 'espadas-2' },
      ],
      manos: [[], [], ['espadas-4', 'espadas-3', 'oros-1'], []],
    });
    expect(cartasLegales(e, 2)).toEqual(['espadas-3', 'espadas-4']);
  });

  it('la vista indica el arrastre', () => {
    expect(guinote.vistaDe(arrastre({}), 0).arrastre).toBe(true);
    expect(guinote.vistaDe(mesa(), 0).arrastre).toBe(false);
  });
});

// ── Cantes y cambio ──────────────────────────────────────────────────────────

describe('cantes', () => {
  const conPareja = (p: Parcial = {}) =>
    mesa({
      puedeCantar: 0,
      bazas: [1, 0],
      manos: [['oros-12', 'oros-10', 'copas-12', 'copas-10', 'bastos-2'], ['espadas-2']],
      ...p,
    });

  it('cantar las 40 y seguir con el turno', () => {
    let e = conPareja();
    expect(otrasAcciones(e, 0)).toContainEqual({ tipo: 'cantar', palo: 'oros' });
    e = jugar(e, 0, { tipo: 'cantar', palo: 'oros' });
    expect(e.cantes).toEqual([{ asiento: 0, palo: 'oros', puntos: 40 }]);
    expect(e.turno).toBe(0);
  });

  it('un cante por baza', () => {
    const e = jugar(conPareja(), 0, { tipo: 'cantar', palo: 'copas' });
    expect(otrasAcciones(e, 0).filter((a) => a.tipo === 'cantar')).toEqual([]);
  });

  it('rey y caballo no son pareja', () => {
    const e = conPareja({ manos: [['oros-12', 'oros-11'], ['espadas-2']] });
    expect(otrasAcciones(e, 0)).toEqual([]);
  });

  it('sin baza ganada no se canta', () => {
    expect(otrasAcciones(conPareja({ puedeCantar: null }), 0)).toEqual([]);
  });

  it('en el arrastre no se canta', () => {
    const e = conPareja({ mazo: [], muestra: null });
    expect(otrasAcciones(e, 0).filter((a) => a.tipo === 'cantar')).toEqual([]);
  });

  it('un palo cantado no se vuelve a cantar', () => {
    const e = conPareja({ cantes: [{ asiento: 1, palo: 'copas', puntos: 20 }] });
    expect(otrasAcciones(e, 0)).toEqual([{ tipo: 'cantar', palo: 'oros' }]);
  });
});

describe('cambio del 7', () => {
  const con7 = (p: Parcial = {}) =>
    mesa({ muestra: 'oros-1', manos: [['oros-7', 'copas-2'], ['espadas-2']], ...p });

  it('tras ganar una baza el bando, se cambia el 7 por la muestra', () => {
    let e = con7({ bazas: [1, 0] });
    expect(otrasAcciones(e, 0)).toEqual([{ tipo: 'cambiarSiete' }]);
    e = jugar(e, 0, { tipo: 'cambiarSiete' });
    expect(e.muestra).toBe('oros-7');
    expect(e.manos[0]).toContain('oros-1');
  });

  it('sin bazas del bando no se cambia', () => {
    expect(otrasAcciones(con7(), 0)).toEqual([]);
  });

  it('en parejas basta con la baza del compañero', () => {
    const e = con7({
      config: { jugadores: 4 },
      bazas: [0, 0, 1, 0],
      manos: [['oros-7'], [], [], []],
    });
    expect(otrasAcciones(e, 0)).toEqual([{ tipo: 'cambiarSiete' }]);
  });

  it('libre: sin bazas; no: nunca', () => {
    expect(otrasAcciones(con7({ config: { cambioSiete: 'libre' } }), 0)).toHaveLength(1);
    expect(otrasAcciones(con7({ config: { cambioSiete: 'no' }, bazas: [3, 0] }), 0)).toHaveLength(
      0,
    );
  });

  it('con la muestra baja se cambia el 2', () => {
    const e = mesa({ muestra: 'oros-6', bazas: [1, 0], manos: [['oros-2'], ['espadas-2']] });
    expect(otrasAcciones(e, 0)).toEqual([{ tipo: 'cambiarSiete' }]);
  });

  it('sin mazo además de la muestra no se cambia', () => {
    expect(otrasAcciones(con7({ bazas: [1, 0], mazo: [] }), 0)).toEqual([]);
  });
});

// ── Mano y partida ───────────────────────────────────────────────────────────

describe('mano y partida', () => {
  it('sin cantes, la mano reparte 130 puntos', () => {
    for (const jugadores of [2, 4] as const) {
      const e = jugarMano(nueva({ jugadores }, `130-${jugadores}`));
      const r = e.resultadosManos[0]!;
      expect(r.puntos[0] + r.puntos[1]).toBe(130);
      expect(r.bazas[0] + r.bazas[1]).toBe(120);
    }
  });

  it('desglose con cantes y 10 de últimas', () => {
    let e = mesa({
      mazo: [],
      muestra: null,
      puntos: [70, 48],
      cantes: [{ asiento: 0, palo: 'copas', puntos: 20 }],
      manos: [['espadas-1'], ['espadas-2']],
    });
    e = jugar(e, 0, carta('espadas-1'));
    e = jugar(e, 1, carta('espadas-2'));
    expect(e.resultadosManos[0]).toEqual({
      bazas: [81, 48],
      cantes: [20, 0],
      ultimas: 0,
      puntos: [111, 48],
      totalesTras: [111, 48],
    });
    expect(guinote.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [111, 48] });
  });

  it('de vueltas: sin llegar a la meta se reparte otra mano y se acumulan los puntos', () => {
    let e = mesa({
      mazo: [],
      muestra: null,
      puntos: [60, 59],
      manos: [['espadas-1'], ['espadas-2']],
    });
    e = jugar(e, 0, carta('espadas-1'));
    e = jugar(e, 1, carta('espadas-2'));
    expect(guinote.resultado(e)).toBeNull();
    expect(e.totales).toEqual([81, 59]);
    expect(e.manos.map((m) => m.length)).toEqual([6, 6]);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.cantes).toEqual([]);
  });

  it('si los dos pasan de la meta, gana el que tiene más', () => {
    let e = mesa({
      mazo: [],
      muestra: null,
      totales: [90, 70],
      puntos: [40, 50],
      manos: [['espadas-1'], ['espadas-2']],
    });
    e = jugar(e, 0, carta('espadas-1'));
    e = jugar(e, 1, carta('espadas-2'));
    expect(e.totales).toEqual([151, 120]);
    expect(guinote.resultado(e)?.ganadores).toEqual([0]);
  });

  it('empate en la meta: se juega otra mano', () => {
    let e = mesa({
      mazo: [],
      muestra: null,
      totales: [90, 101],
      puntos: [0, 0],
      manos: [['espadas-1'], ['espadas-2']],
    });
    e = jugar(e, 0, carta('espadas-1'));
    e = jugar(e, 1, carta('espadas-2'));
    expect(e.totales).toEqual([111, 101]);
    expect(guinote.resultado(e)).not.toBeNull();
    let f = mesa({
      mazo: [],
      muestra: null,
      totales: [90, 111],
      puntos: [0, 0],
      manos: [['espadas-1'], ['espadas-2']],
    });
    f = jugar(f, 0, carta('espadas-1'));
    f = jugar(f, 1, carta('espadas-2'));
    expect(f.totales).toEqual([111, 111]);
    expect(guinote.resultado(f)).toBeNull();
  });

  it('en parejas, los puntos son del bando', () => {
    const e = jugarMano(nueva({ jugadores: 4 }, 'parejas'));
    const r = e.resultadosManos[0]!;
    expect(r.totalesTras).toEqual(e.totales);
    const fin = guinote.resultado(e);
    if (fin) expect(fin.puntos![0]).toBe(fin.puntos![2]);
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('no muestra manos ajenas, la del compañero ni el mazo', () => {
    const e = nueva({ jugadores: 4 });
    const v = guinote.vistaDe(e, 0);
    const texto = JSON.stringify(v);
    for (const c of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!, ...e.mazo]) {
      expect(texto).not.toContain(`"${c}"`);
    }
    expect(v.cartasEnMano).toEqual([6, 6, 6, 6]);
    expect(v.mazo).toBe(15);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(guinote, {
  configs: [
    CONFIG_GUINOTE_POR_DEFECTO,
    { jugadores: 2, cambioSiete: 'libre', montarSobreCompanero: false, meta: 51 },
    { jugadores: 4, cambioSiete: 'no', montarSobreCompanero: false, meta: 101 },
    { jugadores: 4, cambioSiete: 'trasGanarBaza', montarSobreCompanero: true, meta: 151 },
  ],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
  pasosMaximos: 200,
  ejecuciones: 30,
});
