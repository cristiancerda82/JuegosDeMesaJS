import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { crearBaraja, type IdCarta } from '../../src/baraja/cartas';
import {
  brisca,
  cartaGanadora,
  CONFIG_BRISCA_POR_DEFECTO,
  fuerza,
  puntosDe,
  type AccionBrisca,
  type ConfigBrisca,
  type EstadoBrisca,
} from '../../src/juegos/brisca';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigBrisca> = {}, semilla = 'b'): EstadoBrisca {
  const r = brisca.crear({ ...CONFIG_BRISCA_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Estado de 2 jugadores armado a mano; triunfo en oros salvo que se indique otra muestra. */
type Parcial = Omit<Partial<EstadoBrisca>, 'config'> & { config?: Partial<ConfigBrisca> };

function mesa(parcial: Parcial = {}): EstadoBrisca {
  const config = { ...CONFIG_BRISCA_POR_DEFECTO, ...parcial.config };
  const muestra = parcial.muestra === undefined ? 'oros-4' : parcial.muestra;
  const n = config.jugadores;
  return {
    azar: crearAzar('mesa'),
    repartidor: n - 1,
    mazo: ['bastos-5', 'bastos-6'],
    triunfo: muestra === null ? 'oros' : (muestra.split('-')[0] as 'oros'),
    manos: Array.from({ length: n }, () => []),
    mesa: [],
    turno: 0,
    puntos: new Array<number>(n).fill(0),
    bazas: new Array<number>(n).fill(0),
    ultimaBaza: null,
    resultadosManos: [],
    ...parcial,
    muestra,
    config,
  };
}

function jugar(e: EstadoBrisca, asiento: number, accion: AccionBrisca): EstadoBrisca {
  const r = aplicar(brisca, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const carta = (c: IdCarta): AccionBrisca => ({ tipo: 'jugar', carta: c });
const cartasLegales = (e: EstadoBrisca, a: number) =>
  brisca
    .accionesLegales(e, a)
    .flatMap((x) => (x.tipo === 'jugar' ? [x.carta] : []))
    .sort();
const puedeCambiar = (e: EstadoBrisca, a: number) =>
  brisca.accionesLegales(e, a).some((x) => x.tipo === 'cambiarMuestra');

/** Juega la mano entera eligiendo siempre la primera acción de jugar carta. */
function jugarMano(e: EstadoBrisca): EstadoBrisca {
  const manosAntes = e.resultadosManos.length;
  while (brisca.resultado(e) === null && e.resultadosManos.length === manosAntes) {
    const accion = brisca.accionesLegales(e, e.turno).find((a) => a.tipo === 'jugar')!;
    e = jugar(e, e.turno, accion);
  }
  return e;
}

// ── Valores ──────────────────────────────────────────────────────────────────

describe('orden y valor de las cartas', () => {
  it('la baraja suma 120 puntos', () => {
    expect(crearBaraja('espanola40').reduce((s, c) => s + puntosDe(c), 0)).toBe(120);
  });

  it('orden: as, tres, rey, caballo, sota, 7, 6, 5, 4, 2', () => {
    const orden: IdCarta[] = [1, 3, 12, 11, 10, 7, 6, 5, 4, 2].map((v) => `copas-${v}` as IdCarta);
    const porFuerza = [...orden].sort((a, b) => fuerza(b) - fuerza(a));
    expect(porFuerza).toEqual(orden);
  });

  it('el tres le gana al rey', () => {
    const g = cartaGanadora(
      [
        { asiento: 0, carta: 'copas-12' },
        { asiento: 1, carta: 'copas-3' },
      ],
      'oros',
    );
    expect(g.carta).toBe('copas-3');
  });
});

// ── Preparación y bazas ──────────────────────────────────────────────────────

describe('preparación', () => {
  it('2 jugadores: 3 cartas cada uno, muestra que marca el triunfo y 33 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(e.muestra).not.toBeNull();
    expect(e.triunfo).toBe(e.muestra!.split('-')[0]);
    expect(e.mazo).toHaveLength(33);
    expect(new Set([...e.manos.flat(), ...e.mazo, e.muestra]).size).toBe(40);
  });

  it('sale el jugador que no reparte', () => {
    const e = nueva();
    expect(e.turno).not.toBe(e.repartidor);
    expect(e.turno).toBe((e.repartidor + 1) % 2);
  });

  it('rechaza configuraciones inválidas', () => {
    expect(brisca.crear({ ...CONFIG_BRISCA_POR_DEFECTO, jugadores: 3 as 2 }, 'x')).toMatchObject({
      ok: false,
      error: expect.stringMatching(/jugadores/),
    });
    expect(brisca.crear({ ...CONFIG_BRISCA_POR_DEFECTO, manos: 2 }, 'x').ok).toBe(false);
    expect(brisca.crear({ ...CONFIG_BRISCA_POR_DEFECTO, cambioMuestra: 'x' as 'no' }, 'x').ok).toBe(
      false,
    );
  });
});

describe('jugar una baza', () => {
  it('en la variante base cualquier carta de la mano es legal', () => {
    const e = mesa({
      manos: [['copas-1', 'espadas-2', 'oros-7'], ['bastos-1']],
      mesa: [{ asiento: 1, carta: 'copas-3' }],
      turno: 0,
    });
    expect(cartasLegales(e, 0)).toEqual(['copas-1', 'espadas-2', 'oros-7']);
    expect(cartasLegales(e, 1)).toEqual([]);
  });

  it('gana el triunfo: as de copas contra 2 de oros con triunfo en oros', () => {
    const e = mesa({ manos: [['copas-1'], ['oros-2']], mazo: [], muestra: null });
    const fin = jugar(jugar(e, 0, carta('copas-1')), 1, carta('oros-2'));
    expect(fin.ultimaBaza?.ganador).toBe(1);
  });

  it('gana el palo de salida: 4 de espadas contra as de bastos', () => {
    const e = mesa({ manos: [['espadas-4'], ['bastos-1']], mazo: [], muestra: null });
    const fin = jugar(jugar(e, 0, carta('espadas-4')), 1, carta('bastos-1'));
    expect(fin.ultimaBaza?.ganador).toBe(0);
  });
});

describe('robo y siguiente salida', () => {
  it('tras la baza cada uno vuelve a 3 cartas, el ganador roba primero y sale', () => {
    const e = mesa({
      manos: [
        ['copas-2', 'copas-4', 'copas-5'],
        ['copas-1', 'copas-6', 'copas-7'],
      ],
      mazo: ['bastos-2', 'bastos-3', 'bastos-4'],
    });
    const d = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-1'));
    expect(d.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(d.manos[1]).toContain('bastos-4'); // la de arriba del mazo, para el ganador
    expect(d.manos[0]).toContain('bastos-3');
    expect(d.turno).toBe(1);
    expect(d.puntos).toEqual([0, 11]);
  });

  it('con una carta oculta y la muestra, el ganador roba la oculta y el otro la muestra', () => {
    const e = mesa({
      manos: [
        ['copas-2', 'copas-4', 'copas-5'],
        ['copas-1', 'copas-6', 'copas-7'],
      ],
      mazo: ['bastos-2'],
      muestra: 'oros-4',
    });
    const d = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-1'));
    expect(d.manos[1]).toContain('bastos-2');
    expect(d.manos[0]).toContain('oros-4');
    expect(d.muestra).toBeNull();
    expect(d.mazo).toEqual([]);
  });

  it('con el mazo agotado se juega sin robar', () => {
    const e = mesa({
      manos: [
        ['copas-2', 'copas-4'],
        ['copas-1', 'copas-6'],
      ],
      mazo: [],
      muestra: null,
    });
    const d = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-1'));
    expect(d.manos.map((m) => m.length)).toEqual([1, 1]);
  });
});

// ── Cambio de muestra ────────────────────────────────────────────────────────

describe('cambio de la muestra', () => {
  it('con el 7 de triunfo se cambia por una muestra alta', () => {
    const e = mesa({ muestra: 'oros-1', manos: [['oros-7', 'copas-2'], ['copas-3']] });
    expect(puedeCambiar(e, 0)).toBe(true);
    const d = jugar(e, 0, { tipo: 'cambiarMuestra' });
    expect(d.muestra).toBe('oros-7');
    expect(d.manos[0]).toEqual(['copas-2', 'oros-1']);
    expect(d.turno).toBe(0); // sigue siendo su turno: todavía tiene que jugar
  });

  it('con una muestra baja solo cambia el 2 de triunfo', () => {
    const conSiete = mesa({ muestra: 'oros-5', manos: [['oros-7'], ['copas-3']] });
    expect(puedeCambiar(conSiete, 0)).toBe(false);
    const conDos = mesa({ muestra: 'oros-5', manos: [['oros-2'], ['copas-3']] });
    expect(puedeCambiar(conDos, 0)).toBe(true);
    expect(jugar(conDos, 0, { tipo: 'cambiarMuestra' }).muestra).toBe('oros-2');
    // Si la muestra es el propio 7, también se cambia con el 2.
    expect(puedeCambiar(mesa({ muestra: 'oros-7', manos: [['oros-2'], []] }), 0)).toBe(true);
  });

  it('no se cambia si en el mazo solo queda la muestra', () => {
    const e = mesa({ muestra: 'oros-1', mazo: [], manos: [['oros-7'], ['copas-3']] });
    expect(puedeCambiar(e, 0)).toBe(false);
  });

  it('solo en su turno', () => {
    const e = mesa({ muestra: 'oros-1', turno: 1, manos: [['oros-7'], ['copas-3']] });
    expect(puedeCambiar(e, 0)).toBe(false);
  });

  it('variante sin cambio y variante tras ganar una baza', () => {
    const base = { muestra: 'oros-1' as IdCarta, manos: [['oros-7'], ['copas-3']] as IdCarta[][] };
    expect(puedeCambiar(mesa({ ...base, config: { cambioMuestra: 'no' } }), 0)).toBe(false);
    const tras = { ...base, config: { cambioMuestra: 'trasGanarBaza' as const } };
    expect(puedeCambiar(mesa(tras), 0)).toBe(false);
    expect(puedeCambiar(mesa({ ...tras, bazas: [1, 0] }), 0)).toBe(true);
  });
});

// ── Fin de mano y partida ────────────────────────────────────────────────────

describe('fin de la mano', () => {
  function ultimaBaza(puntos: [number, number], c0: IdCarta, c1: IdCarta): EstadoBrisca {
    return mesa({ manos: [[c0], [c1]], mazo: [], muestra: null, puntos });
  }

  it('gana quien suma más de 60', () => {
    // 61 + as (11) = 72 para el asiento 0.
    const fin = jugar(
      jugar(ultimaBaza([61, 48], 'copas-1', 'copas-2'), 0, carta('copas-1')),
      1,
      carta('copas-2'),
    );
    expect(fin.resultadosManos).toEqual([{ puntos: [72, 48], ganador: 0 }]);
    expect(brisca.resultado(fin)).toEqual({ ganadores: [0], empate: false, puntos: [72, 48] });
    expect(brisca.accionesLegales(fin, 0)).toEqual([]);
  });

  it('60 a 60 es empate', () => {
    const fin = jugar(
      jugar(ultimaBaza([60, 60], 'copas-2', 'copas-4'), 0, carta('copas-2')),
      1,
      carta('copas-4'),
    );
    expect(fin.resultadosManos).toEqual([{ puntos: [60, 60], ganador: null }]);
    expect(brisca.resultado(fin)).toEqual({ ganadores: [], empate: true, puntos: [60, 60] });
  });

  it('una mano completa reparte los 120 puntos', () => {
    const fin = jugarMano(nueva({}, 'completa'));
    const [r] = fin.resultadosManos;
    expect(r!.puntos[0] + r!.puntos[1]).toBe(120);
    expect(brisca.resultado(fin)).not.toBeNull();
  });
});

describe('partida a varias manos', () => {
  it('al mejor de 3 termina cuando alguien gana su segunda mano', () => {
    const e = mesa({
      config: { manos: 3 },
      manos: [['copas-1'], ['copas-2']],
      mazo: [],
      muestra: null,
      puntos: [55, 54],
      resultadosManos: [{ puntos: [70, 50], ganador: 0 }],
    });
    const fin = jugar(jugar(e, 0, carta('copas-1')), 1, carta('copas-2'));
    expect(brisca.resultado(fin)).toEqual({ ganadores: [0], empate: false, puntos: [2, 0] });
  });

  it('si la partida sigue, se reparte otra mano y cambia el repartidor', () => {
    const e = nueva({ manos: 3 }, 'varias');
    const tras = jugarMano(e);
    expect(tras.resultadosManos).toHaveLength(1);
    expect(brisca.resultado(tras)).toBeNull();
    expect(tras.repartidor).toBe((e.repartidor + 1) % 2);
    expect(tras.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(tras.mazo).toHaveLength(33);
  });

  it('si se juegan las N manos sin mayoría, gana quien ganó más, o es empate', () => {
    const e = mesa({
      config: { manos: 3 },
      manos: [['copas-2'], ['copas-4']],
      mazo: [],
      muestra: null,
      puntos: [60, 60],
      resultadosManos: [
        { puntos: [70, 50], ganador: 0 },
        { puntos: [50, 70], ganador: 1 },
      ],
    });
    const fin = jugar(jugar(e, 0, carta('copas-2')), 1, carta('copas-4'));
    expect(brisca.resultado(fin)).toMatchObject({ ganadores: [], empate: true });
  });
});

// ── Cuatro jugadores ─────────────────────────────────────────────────────────

describe('cuatro jugadores en parejas', () => {
  it('3 cartas cada uno y 27 en el mazo además de la muestra', () => {
    const e = nueva({ jugadores: 4 });
    expect(e.manos.map((m) => m.length)).toEqual([3, 3, 3, 3]);
    expect(e.mazo).toHaveLength(27);
    expect(e.muestra).not.toBeNull();
  });

  it('el turno avanza por orden de asiento y los puntos se suman por pareja', () => {
    const e = mesa({
      config: { jugadores: 4 },
      manos: [['copas-1'], ['copas-2'], ['copas-3'], ['copas-4']],
      mazo: [],
      muestra: null,
      puntos: [30, 20, 25, 20],
    });
    let d = e;
    for (const [a, c] of [
      [0, 'copas-1'],
      [1, 'copas-2'],
      [2, 'copas-3'],
      [3, 'copas-4'],
    ] as const) {
      expect(d.turno).toBe(a);
      d = jugar(d, a, carta(c));
    }
    // Gana el as (asiento 0): 11 + 10 = 21 para la pareja 0-2 → 30+25+21 = 76 contra 40.
    expect(d.resultadosManos).toEqual([{ puntos: [76, 40], ganador: 0 }]);
    expect(brisca.resultado(d)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [76, 40, 76, 40],
    });
  });

  it('la vista no muestra la mano del compañero', () => {
    const e = nueva({ jugadores: 4 });
    const v = brisca.vistaDe(e, 0);
    expect(v.miMano).toEqual(e.manos[0]);
    expect(JSON.stringify(v)).not.toContain(`"${e.manos[2]![0]}"`);
    expect(v.cartasEnMano).toEqual([3, 3, 3, 3]);
  });
});

// ── Arrastre ─────────────────────────────────────────────────────────────────

describe('arrastre al final', () => {
  const conArrastre = (parcial: Parcial) =>
    mesa({
      mazo: [],
      muestra: null,
      turno: 1,
      ...parcial,
      config: { arrastreFinal: true, ...parcial.config },
    });

  it('desactivado por defecto', () => {
    expect(CONFIG_BRISCA_POR_DEFECTO.arrastreFinal).toBe(false);
  });

  it('obliga a seguir el palo y a ganar si puede', () => {
    const e = conArrastre({
      manos: [[], ['copas-2', 'copas-3', 'oros-1']],
      mesa: [{ asiento: 0, carta: 'copas-12' }],
    });
    expect(cartasLegales(e, 1)).toEqual(['copas-3']);
  });

  it('si no puede ganar con el palo, juega cualquiera del palo', () => {
    const e = conArrastre({
      manos: [[], ['copas-2', 'copas-4', 'oros-1']],
      mesa: [{ asiento: 0, carta: 'copas-1' }],
    });
    expect(cartasLegales(e, 1)).toEqual(['copas-2', 'copas-4']);
  });

  it('sin el palo, obliga a fallar con triunfo y a superar si puede', () => {
    const e = conArrastre({
      config: { arrastreFinal: true, jugadores: 4 },
      manos: [[], [], ['oros-2', 'oros-3', 'bastos-1'], []],
      mesa: [
        { asiento: 0, carta: 'copas-1' },
        { asiento: 1, carta: 'oros-12' },
      ],
      turno: 2,
      puntos: [0, 0, 0, 0],
      bazas: [0, 0, 0, 0],
    });
    expect(cartasLegales(e, 2)).toEqual(['oros-3']);
  });

  it('sin el palo ni triunfo, cualquier carta', () => {
    const e = conArrastre({
      manos: [[], ['bastos-2', 'espadas-1']],
      mesa: [{ asiento: 0, carta: 'copas-1' }],
    });
    expect(cartasLegales(e, 1)).toEqual(['bastos-2', 'espadas-1']);
  });

  it('no aplica mientras quede mazo', () => {
    const e = mesa({
      config: { arrastreFinal: true },
      manos: [[], ['copas-2', 'oros-1']],
      mesa: [{ asiento: 0, carta: 'copas-12' }],
      turno: 1,
    });
    expect(cartasLegales(e, 1)).toEqual(['copas-2', 'oros-1']);
  });
});

// ── Vista y contrato ─────────────────────────────────────────────────────────

describe('vista', () => {
  it('muestra la mano propia y solo cuántas tiene el rival', () => {
    const e = nueva();
    const v = brisca.vistaDe(e, 0);
    expect(v.miMano).toEqual(e.manos[0]);
    expect(v.cartasEnMano).toEqual([3, 3]);
    expect(v.mazo).toBe(33);
    expect(v.muestra).toBe(e.muestra);
    expect(brisca.vistaDe(e, null).miMano).toBeNull();
  });
});

describirContrato(brisca, {
  configs: [
    CONFIG_BRISCA_POR_DEFECTO,
    { jugadores: 4, cambioMuestra: 'trasGanarBaza', arrastreFinal: true, manos: 1 },
    { jugadores: 2, cambioMuestra: 'libre', arrastreFinal: true, manos: 3 },
  ],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
  pasosMaximos: 120,
  ejecuciones: 40,
});
