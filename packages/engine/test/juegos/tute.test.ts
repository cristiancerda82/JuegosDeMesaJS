import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_TUTE_POR_DEFECTO,
  puntosPorBando,
  tute,
  type AccionTute,
  type ConfigTute,
  type EstadoTute,
} from '../../src/juegos/tute';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigTute> = {}, semilla = 't'): EstadoTute {
  const r = tute.crear({ ...CONFIG_TUTE_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoTute>, 'config'> & { config?: Partial<ConfigTute> };

/** Estado armado a mano; triunfo en oros salvo que se indique otro. */
function mesa(parcial: Parcial = {}): EstadoTute {
  const config = { ...CONFIG_TUTE_POR_DEFECTO, ...parcial.config };
  const n = config.jugadores;
  return {
    azar: crearAzar('mesa'),
    repartidor: n - 1,
    mazo: n === 2 ? ['bastos-5', 'bastos-6'] : [],
    muestra: n === 2 ? 'oros-4' : null,
    cartaTriunfo: null,
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
    ...parcial,
    config,
  };
}

function jugar(e: EstadoTute, asiento: number, accion: AccionTute): EstadoTute {
  const r = aplicar(tute, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const carta = (c: IdCarta): AccionTute => ({ tipo: 'jugar', carta: c });
const cartasLegales = (e: EstadoTute, a: number) =>
  tute
    .accionesLegales(e, a)
    .flatMap((x) => (x.tipo === 'jugar' ? [x.carta] : []))
    .sort();
const otrasAcciones = (e: EstadoTute, a: number) =>
  tute.accionesLegales(e, a).filter((x) => x.tipo !== 'jugar');

/** Juega la mano entera eligiendo siempre la primera carta legal (sin cantar). */
function jugarMano(e: EstadoTute): EstadoTute {
  const antes = e.resultadosManos.length;
  while (tute.resultado(e) === null && e.resultadosManos.length === antes) {
    const accion = tute.accionesLegales(e, e.turno).find((a) => a.tipo === 'jugar')!;
    e = jugar(e, e.turno, accion);
  }
  return e;
}

// ── Preparación ──────────────────────────────────────────────────────────────

describe('preparación', () => {
  it('2 jugadores: 8 cartas, muestra que marca el triunfo y 23 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([8, 8]);
    expect(e.muestra).not.toBeNull();
    expect(e.triunfo).toBe(e.muestra!.split('-')[0]);
    expect(e.mazo).toHaveLength(23);
    expect(new Set([...e.manos.flat(), ...e.mazo, e.muestra]).size).toBe(40);
    expect(e.turno).toBe((e.repartidor + 1) % 2);
  });

  it('4 jugadores: 10 cartas, sin mazo y la carta de triunfo en la mano del repartidor', () => {
    const e = nueva({ jugadores: 4 });
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
    expect(e.mazo).toEqual([]);
    expect(e.muestra).toBeNull();
    expect(e.manos[e.repartidor]).toContain(e.cartaTriunfo);
    expect(e.triunfo).toBe(e.cartaTriunfo!.split('-')[0]);
    expect(e.turno).toBe((e.repartidor + 1) % 4);
    for (const a of [0, 1, 2, 3]) expect(tute.vistaDe(e, a).cartaTriunfo).toBe(e.cartaTriunfo);
  });

  it('la carta de triunfo deja de verse al jugarla, pero el triunfo sigue', () => {
    const e = mesa({
      config: { jugadores: 4 },
      cartaTriunfo: 'oros-5',
      repartidor: 3,
      turno: 3,
      manos: [['copas-1'], ['copas-2'], ['copas-3'], ['oros-5', 'copas-4']],
      mesa: [],
    });
    const d = jugar(e, 3, carta('oros-5'));
    expect(d.cartaTriunfo).toBeNull();
    expect(tute.vistaDe(d, 0).triunfo).toBe('oros');
    expect(d.mesa).toEqual([{ asiento: 3, carta: 'oros-5' }]);
  });

  it('rechaza configuraciones inválidas', () => {
    expect(tute.crear({ ...CONFIG_TUTE_POR_DEFECTO, jugadores: 3 as 2 }, 'x').ok).toBe(false);
    expect(tute.crear({ ...CONFIG_TUTE_POR_DEFECTO, manos: 4 }, 'x').ok).toBe(false);
    expect(tute.crear({ ...CONFIG_TUTE_POR_DEFECTO, cambioSiete: 'x' as 'no' }, 'x').ok).toBe(
      false,
    );
  });
});

// ── Bazas, robo y obligaciones ───────────────────────────────────────────────

describe('bazas', () => {
  it('gana el triunfo: as de oros contra 4 de copas con triunfo en copas', () => {
    const e = mesa({
      triunfo: 'copas',
      muestra: 'copas-5',
      manos: [
        ['oros-1', 'oros-2'],
        ['copas-4', 'oros-4'],
      ],
    });
    const d = jugar(jugar(e, 0, carta('oros-1')), 1, carta('copas-4'));
    expect(d.ultimaBaza?.ganador).toBe(1);
    expect(d.turno).toBe(1);
  });

  it('tras la baza con mazo, cada uno vuelve a su número de cartas y el ganador roba primero', () => {
    const e = mesa({
      manos: [
        ['copas-2', 'copas-4'],
        ['copas-1', 'copas-6'],
      ],
      mazo: ['bastos-2', 'bastos-3', 'bastos-4'],
    });
    const d = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-1'));
    expect(d.manos.map((m) => m.length)).toEqual([2, 2]);
    expect(d.manos[1]).toContain('bastos-4');
    expect(d.manos[0]).toContain('bastos-3');
  });

  it('el último robo da la muestra al que pierde la baza', () => {
    const e = mesa({
      manos: [
        ['copas-2', 'copas-4'],
        ['copas-1', 'copas-6'],
      ],
      mazo: ['bastos-2'],
      muestra: 'oros-4',
    });
    const d = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-1'));
    expect(d.manos[1]).toContain('bastos-2');
    expect(d.manos[0]).toContain('oros-4');
    expect(d.muestra).toBeNull();
  });

  it('con 2 jugadores y mazo, cualquier carta es legal', () => {
    const e = mesa({
      manos: [[], ['espadas-2', 'espadas-3', 'oros-1']],
      mesa: [{ asiento: 0, carta: 'espadas-12' }],
      turno: 1,
    });
    expect(cartasLegales(e, 1)).toEqual(['espadas-2', 'espadas-3', 'oros-1']);
  });

  it('agotado el mazo con 2 jugadores, hay que seguir el palo y montar', () => {
    const e = mesa({
      mazo: [],
      muestra: null,
      manos: [[], ['espadas-2', 'espadas-3', 'oros-1']],
      mesa: [{ asiento: 0, carta: 'espadas-12' }],
      turno: 1,
    });
    expect(cartasLegales(e, 1)).toEqual(['espadas-3']);
  });

  it('con 4 jugadores rigen desde el principio: sin el palo, fallar y superar', () => {
    const e = mesa({
      config: { jugadores: 4 },
      manos: [[], [], ['oros-2', 'oros-3', 'bastos-1'], []],
      mesa: [
        { asiento: 0, carta: 'copas-1' },
        { asiento: 1, carta: 'oros-12' },
      ],
      turno: 2,
    });
    expect(cartasLegales(e, 2)).toEqual(['oros-3']);
  });

  it('con 4, si la baza es del compañero, no hay que montar (por defecto)', () => {
    const e = mesa({
      config: { jugadores: 4 },
      manos: [[], [], ['espadas-2', 'espadas-3'], []],
      mesa: [
        { asiento: 0, carta: 'espadas-1' },
        { asiento: 1, carta: 'espadas-4' },
      ],
      turno: 2,
    });
    expect(cartasLegales(e, 2)).toEqual(['espadas-2', 'espadas-3']);
  });

  it('con montar sobre el compañero activo, hay que superarlo', () => {
    const e = mesa({
      config: { jugadores: 4, montarSobreCompanero: true },
      manos: [[], [], ['espadas-2', 'espadas-3'], []],
      mesa: [
        { asiento: 0, carta: 'espadas-12' },
        { asiento: 1, carta: 'espadas-4' },
      ],
      turno: 2,
    });
    expect(cartasLegales(e, 2)).toEqual(['espadas-3']);
  });
});

// ── Cantes y tute ────────────────────────────────────────────────────────────

describe('cantes', () => {
  const conPareja = (parcial: Parcial = {}) =>
    mesa({
      manos: [['oros-12', 'oros-11', 'copas-12', 'copas-11', 'bastos-2'], ['espadas-2']],
      puedeCantar: 0,
      ...parcial,
    });

  it('quien ganó la baza canta las 40 y sigue siendo su turno', () => {
    const e = conPareja();
    expect(otrasAcciones(e, 0)).toEqual(
      expect.arrayContaining([
        { tipo: 'cantar', palo: 'oros' },
        { tipo: 'cantar', palo: 'copas' },
      ]),
    );
    const d = jugar(e, 0, { tipo: 'cantar', palo: 'oros' });
    expect(d.cantes).toEqual([{ asiento: 0, palo: 'oros', puntos: 40 }]);
    expect(d.turno).toBe(0);
    expect(cartasLegales(d, 0)).toHaveLength(5);
  });

  it('las 20 en un palo que no es triunfo', () => {
    const d = jugar(conPareja(), 0, { tipo: 'cantar', palo: 'copas' });
    expect(d.cantes).toEqual([{ asiento: 0, palo: 'copas', puntos: 20 }]);
  });

  it('sin baza ganada no se canta', () => {
    const e = conPareja({ puedeCantar: null });
    expect(otrasAcciones(e, 0)).toEqual([]);
  });

  it('un cante por baza ganada', () => {
    const d = jugar(conPareja(), 0, { tipo: 'cantar', palo: 'oros' });
    expect(otrasAcciones(d, 0).filter((a) => a.tipo === 'cantar')).toEqual([]);
  });

  it('cada palo solo se canta una vez por mano', () => {
    const e = conPareja({ cantes: [{ asiento: 0, palo: 'oros', puntos: 40 }] });
    expect(otrasAcciones(e, 0)).toEqual([{ tipo: 'cantar', palo: 'copas' }]);
  });

  it('jugar carta hace perder el derecho a cantar de esa baza', () => {
    const d = jugar(conPareja(), 0, carta('bastos-2'));
    expect(d.puedeCantar).toBeNull();
  });

  it('ganar una baza da derecho a cantar al ganador', () => {
    const e = mesa({
      manos: [
        ['copas-2', 'oros-12', 'oros-11'],
        ['copas-1', 'copas-6', 'copas-7'],
      ],
      turno: 0,
    });
    const d = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-1'));
    expect(d.puedeCantar).toBe(1);
    // El asiento 0 tiene la pareja pero no ganó la baza.
    expect(otrasAcciones(d, 0)).toEqual([]);
  });

  it('cantar el tute gana la mano en el acto', () => {
    const e = mesa({
      manos: [['oros-12', 'copas-12', 'espadas-12', 'bastos-12', 'oros-2'], ['oros-1']],
      puedeCantar: 0,
      puntos: [0, 60],
    });
    expect(otrasAcciones(e, 0)).toContainEqual({ tipo: 'cantarTute' });
    const fin = jugar(e, 0, { tipo: 'cantarTute' });
    expect(fin.resultadosManos).toEqual([{ puntos: [0, 60], ganador: 0, tute: true }]);
    expect(tute.resultado(fin)).toMatchObject({ ganadores: [0], empate: false });
  });

  it('tute de caballos', () => {
    const e = mesa({
      manos: [['oros-11', 'copas-11', 'espadas-11', 'bastos-11'], ['oros-1']],
      puedeCantar: 0,
    });
    expect(otrasAcciones(e, 0)).toContainEqual({ tipo: 'cantarTute' });
  });
});

// ── Cambio del 7 ─────────────────────────────────────────────────────────────

describe('cambio del 7', () => {
  it('por defecto, tras ganar una baza', () => {
    const base = { muestra: 'oros-1' as IdCarta, manos: [['oros-7', 'copas-2'], ['copas-3']] };
    const puede = (e: EstadoTute) => otrasAcciones(e, 0).some((a) => a.tipo === 'cambiarSiete');
    expect(puede(mesa({ ...base, manos: base.manos as IdCarta[][] }))).toBe(false);
    const e = mesa({ ...base, manos: base.manos as IdCarta[][], bazas: [1, 0] });
    expect(puede(e)).toBe(true);
    const d = jugar(e, 0, { tipo: 'cambiarSiete' });
    expect(d.muestra).toBe('oros-7');
    expect(d.manos[0]).toEqual(['copas-2', 'oros-1']);
  });

  it('con muestra baja se cambia el 2; sin mazo no hay cambio; con 4 jugadores tampoco', () => {
    const puede = (e: EstadoTute) => otrasAcciones(e, 0).some((a) => a.tipo === 'cambiarSiete');
    const libre = { cambioSiete: 'libre' as const };
    expect(puede(mesa({ config: libre, muestra: 'oros-5', manos: [['oros-2'], []] }))).toBe(true);
    expect(puede(mesa({ config: libre, muestra: 'oros-5', manos: [['oros-7'], []] }))).toBe(false);
    expect(
      puede(mesa({ config: libre, muestra: 'oros-1', mazo: [], manos: [['oros-7'], []] })),
    ).toBe(false);
    expect(
      puede(
        mesa({
          config: { cambioSiete: 'no' },
          muestra: 'oros-1',
          manos: [['oros-7'], []],
          bazas: [1, 0],
        }),
      ),
    ).toBe(false);
    expect(
      puede(
        mesa({
          config: { jugadores: 4, cambioSiete: 'libre' },
          manos: [['oros-7'], [], [], []],
        }),
      ),
    ).toBe(false);
  });
});

// ── Fin de la mano y partida ─────────────────────────────────────────────────

describe('fin de la mano', () => {
  it('sin cantes la mano reparte 130 puntos (con los 10 de últimas)', () => {
    for (const jugadores of [2, 4] as const) {
      const fin = jugarMano(nueva({ jugadores }, `total-${jugadores}`));
      const [r] = fin.resultadosManos;
      expect(r!.puntos[0] + r!.puntos[1]).toBe(130);
    }
  });

  it('la última baza suma 10 de últimas', () => {
    const e = mesa({
      mazo: [],
      muestra: null,
      manos: [['copas-2'], ['copas-4']],
      puntos: [50, 50],
    });
    const fin = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-4'));
    expect(fin.resultadosManos[0]!.puntos).toEqual([50, 60]);
  });

  it('gana por puntos contando los cantes', () => {
    const e = mesa({
      mazo: [],
      muestra: null,
      manos: [['copas-2'], ['copas-4']],
      puntos: [70, 50],
      cantes: [{ asiento: 0, palo: 'espadas', puntos: 20 }],
    });
    // La última baza la gana el asiento 1: 50 + 10 = 60 contra 70 + 20 = 90.
    const fin = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-4'));
    expect(fin.resultadosManos).toEqual([{ puntos: [90, 60], ganador: 0, tute: false }]);
  });

  it('empate con los mismos puntos', () => {
    const e = mesa({
      mazo: [],
      muestra: null,
      manos: [['copas-2'], ['copas-4']],
      puntos: [65, 55],
    });
    const fin = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-4'));
    expect(fin.resultadosManos[0]).toMatchObject({ puntos: [65, 65], ganador: null });
    expect(tute.resultado(fin)).toMatchObject({ ganadores: [], empate: true });
  });

  it('puntos por bando con 4 jugadores', () => {
    expect(puntosPorBando([10, 20, 30, 40], [{ asiento: 3, palo: 'oros', puntos: 40 }])).toEqual([
      40, 100,
    ]);
  });
});

describe('partida a varias manos', () => {
  it('al mejor de 3 termina cuando un bando gana su segunda mano', () => {
    const e = mesa({
      config: { manos: 3 },
      mazo: [],
      muestra: null,
      manos: [['copas-1'], ['copas-2']],
      puntos: [70, 50],
      resultadosManos: [{ puntos: [80, 50], ganador: 0, tute: false }],
    });
    const fin = jugar(jugar(e, 0, carta('copas-1')), 1, carta('copas-2'));
    expect(tute.resultado(fin)).toEqual({ ganadores: [0], empate: false, puntos: [2, 0] });
  });

  it('si sigue, se reparte otra mano y cambia el repartidor', () => {
    const e = nueva({ manos: 3 }, 'varias');
    const tras = jugarMano(e);
    expect(tras.resultadosManos).toHaveLength(1);
    expect(tute.resultado(tras)).toBeNull();
    expect(tras.repartidor).toBe((e.repartidor + 1) % 2);
    expect(tras.manos.map((m) => m.length)).toEqual([8, 8]);
    expect(tras.cantes).toEqual([]);
  });
});

// ── Vista y contrato ─────────────────────────────────────────────────────────

describe('vista', () => {
  it('no muestra la mano del compañero, salvo la carta de triunfo pública', () => {
    const e = nueva({ jugadores: 4 }, 'vista');
    const v = tute.vistaDe(e, 0);
    expect(v.miMano).toEqual(e.manos[0]);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    const texto = JSON.stringify(v);
    for (const c of e.manos[2]!) {
      if (c !== e.cartaTriunfo) expect(texto).not.toContain(`"${c}"`);
    }
  });
});

describirContrato(tute, {
  configs: [
    CONFIG_TUTE_POR_DEFECTO,
    { jugadores: 2, cambioSiete: 'libre', montarSobreCompanero: false, manos: 3 },
    { jugadores: 4, cambioSiete: 'no', montarSobreCompanero: false, manos: 1 },
    { jugadores: 4, cambioSiete: 'libre', montarSobreCompanero: true, manos: 3 },
  ],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m.filter((c) => c !== e.cartaTriunfo))),
  ],
  pasosMaximos: 200,
  ejecuciones: 30,
});
