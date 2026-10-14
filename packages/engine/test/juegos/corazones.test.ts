import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_CORAZONES_POR_DEFECTO,
  corazones,
  ganadoraCorazones,
  type AccionCorazones,
  type ConfigCorazones,
  type EstadoCorazones,
} from '../../src/juegos/corazones';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigCorazones> = {}, semilla = 'c'): EstadoCorazones {
  const r = corazones.crear({ ...CONFIG_CORAZONES_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoCorazones>, 'config'> & { config?: Partial<ConfigCorazones> };

/** Estado en la fase de juego armado a mano, ya pasada la primera baza. */
function mesa(parcial: Parcial = {}): EstadoCorazones {
  const config = { ...CONFIG_CORAZONES_POR_DEFECTO, ...parcial.config };
  return {
    azar: crearAzar('mesa'),
    numeroMano: 0,
    manos: [[], [], [], []],
    fase: 'juego',
    pases: [null, null, null, null],
    recibidas: [[], [], [], []],
    turno: 0,
    mesa: [],
    ultimaBaza: null,
    bazasJugadas: 1,
    rotos: false,
    puntosMano: [0, 0, 0, 0],
    resultadosManos: [],
    totales: [0, 0, 0, 0],
    ...parcial,
    config,
  };
}

function jugar(e: EstadoCorazones, asiento: number, accion: AccionCorazones): EstadoCorazones {
  const r = aplicar(corazones, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const carta = (c: IdCarta): AccionCorazones => ({ tipo: 'jugar', carta: c });
const legales = (e: EstadoCorazones, a: number) =>
  corazones
    .accionesLegales(e, a)
    .flatMap((x) => (x.tipo === 'jugar' ? [x.carta] : []))
    .sort();

/** Pasa en cada turno las tres primeras cartas de la mano. */
function pasarTodos(e: EstadoCorazones): EstadoCorazones {
  while (e.fase === 'pase') {
    e = jugar(e, e.turno, { tipo: 'pasar', cartas: e.manos[e.turno]!.slice(0, 3) });
  }
  return e;
}

/** Juega con la primera acción legal hasta la condición o el fin. */
function avanzar(e: EstadoCorazones, hasta: (e: EstadoCorazones) => boolean = () => false) {
  while (corazones.resultado(e) === null && !hasta(e)) {
    e = jugar(e, e.turno, corazones.accionesLegales(e, e.turno)[0]!);
  }
  return e;
}

// ── Reparto y pase ───────────────────────────────────────────────────────────

describe('reparto y pase', () => {
  it('13 cartas a cada uno y empieza el pase por el asiento 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
    expect(e.fase).toBe('pase');
    expect(e.turno).toBe(0);
    expect(corazones.accionesLegales(e, 0)).toHaveLength(286);
  });

  it('en la primera mano se pasa al siguiente, todo a la vez', () => {
    let e = nueva();
    const pase = e.manos[0]!.slice(0, 3);
    e = jugar(e, 0, { tipo: 'pasar', cartas: pase });
    // Aún no se ha entregado nada, y los demás no ven el pase del 0.
    expect(e.manos[0]).toHaveLength(13);
    const vista1 = JSON.stringify(corazones.vistaDe(e, 1));
    for (const c of pase) expect(vista1).not.toContain(`"${c}"`);
    expect(corazones.vistaDe(e, 0).miPase).toEqual(pase);
    e = pasarTodos(e);
    expect(e.fase).toBe('juego');
    for (const c of pase) {
      expect(e.manos[1]).toContain(c);
      expect(e.manos[0]).not.toContain(c);
    }
    expect(corazones.vistaDe(e, 1).recibidas).toEqual(pase);
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
  });

  it('direcciones: siguiente, anterior, enfrente y sin pase', () => {
    let e = nueva();
    const vistas: number[] = [];
    for (let mano = 0; mano < 4; mano++) {
      vistas.push(corazones.vistaDe(e, 0).direccionPase);
      e = avanzar(pasarTodos(e), (x) => x.numeroMano === mano + 1);
    }
    expect(vistas).toEqual([1, 3, 2, 0]);
  });

  it('en la cuarta mano no hay pase', () => {
    const e = avanzar(nueva(), (x) => x.numeroMano === 3);
    expect(e.fase).toBe('juego');
  });

  it('sin la opción de pase, se juega directamente', () => {
    expect(nueva({ pase: false }).fase).toBe('juego');
  });
});

// ── Bazas ────────────────────────────────────────────────────────────────────

describe('salida y bazas', () => {
  it('sale quien tiene el 2 de tréboles y solo puede jugarlo', () => {
    const e = nueva({ pase: false });
    const quien = e.manos.findIndex((m) => m.includes('treboles-2'));
    expect(e.turno).toBe(quien);
    expect(legales(e, quien)).toEqual(['treboles-2']);
  });

  it('hay que seguir el palo', () => {
    const e = mesa({
      turno: 1,
      mesa: [{ asiento: 0, carta: 'diamantes-5' }],
      manos: [[], ['diamantes-2', 'diamantes-13', 'picas-3'], [], []],
    });
    expect(legales(e, 1)).toEqual(['diamantes-13', 'diamantes-2']);
  });

  it('en la primera baza no se echan puntos si hay otra carta', () => {
    const e = mesa({
      bazasJugadas: 0,
      turno: 1,
      mesa: [{ asiento: 0, carta: 'treboles-2' }],
      manos: [[], ['corazones-5', 'picas-12', 'diamantes-4', 'diamantes-9'], [], []],
    });
    expect(legales(e, 1)).toEqual(['diamantes-4', 'diamantes-9']);
  });

  it('en la primera baza, si solo hay puntos, se pueden echar', () => {
    const e = mesa({
      bazasJugadas: 0,
      turno: 1,
      mesa: [{ asiento: 0, carta: 'treboles-2' }],
      manos: [[], ['corazones-5', 'picas-12'], [], []],
    });
    expect(legales(e, 1)).toEqual(['corazones-5', 'picas-12']);
  });

  it('no se sale con corazones sin romper, salvo que solo queden corazones', () => {
    const e = mesa({ manos: [['corazones-5', 'picas-3'], [], [], []] });
    expect(legales(e, 0)).toEqual(['picas-3']);
    expect(legales({ ...e, rotos: true }, 0)).toEqual(['corazones-5', 'picas-3']);
    expect(legales(mesa({ manos: [['corazones-5', 'corazones-9'], [], [], []] }), 0)).toEqual([
      'corazones-5',
      'corazones-9',
    ]);
  });

  it('gana la más alta del palo de salida (el As es la más alta)', () => {
    expect(
      ganadoraCorazones([
        { asiento: 0, carta: 'picas-13' },
        { asiento: 1, carta: 'picas-1' },
        { asiento: 2, carta: 'corazones-1' },
        { asiento: 3, carta: 'picas-2' },
      ]).asiento,
    ).toBe(1);
  });

  it('echar un corazón los rompe y el ganador sale y se lleva los puntos', () => {
    let e = mesa({
      manos: [
        ['picas-5', 'picas-6'],
        ['corazones-3', 'picas-7'],
        ['picas-13', 'picas-8'],
        ['picas-12', 'picas-9'],
      ],
    });
    e = jugar(e, 0, carta('picas-5'));
    e = jugar(e, 1, carta('picas-7'));
    e = jugar(e, 2, carta('picas-13'));
    e = jugar(e, 3, carta('picas-12'));
    expect(e.turno).toBe(2);
    expect(e.puntosMano).toEqual([0, 0, 13, 0]);
    expect(e.rotos).toBe(false);
  });
});

// ── Puntuación ───────────────────────────────────────────────────────────────

/** Última baza de una mano: el asiento 0 gana con el As de diamantes. */
function ultimaBaza(puntosMano: number[], totales = [0, 0, 0, 0], extra: IdCarta[] = []) {
  const base: IdCarta[] = ['diamantes-1', 'diamantes-2', 'diamantes-3', 'diamantes-4'];
  const cartas = extra.length > 0 ? extra : base;
  let e = mesa({
    bazasJugadas: 12,
    rotos: true,
    puntosMano,
    totales,
    manos: cartas.map((c) => [c]),
  });
  for (let a = 0; a < 4; a++) e = jugar(e, a, carta(cartas[a]!));
  return e;
}

describe('puntuación', () => {
  it('5 corazones y la Q de picas son 18 puntos', () => {
    // Ya llevaba 3 corazones y la Q de picas (16) y gana una baza con 2 corazones más.
    const e = ultimaBaza(
      [16, 0, 0, 0],
      [0, 0, 0, 0],
      ['diamantes-1', 'corazones-2', 'corazones-3', 'diamantes-4'],
    );
    expect(e.resultadosManos[0]!.puntos).toEqual([18, 0, 0, 0]);
  });

  it('tirar la luna: 0 para quien la tira y 26 para los demás', () => {
    const r = ultimaBaza([26, 0, 0, 0]).resultadosManos[0]!;
    expect(r.puntos).toEqual([0, 26, 26, 26]);
    expect(r.luna).toBe(0);
  });

  it('al llegar a 100 termina la partida y gana el que tiene menos', () => {
    const e = ultimaBaza([10, 0, 13, 3], [92, 64, 27, 76]);
    expect(e.totales).toEqual([102, 64, 40, 79]);
    expect(corazones.resultado(e)).toEqual({
      ganadores: [2],
      empate: false,
      puntos: [102, 64, 40, 79],
    });
  });

  it('si nadie llega, se reparte otra mano conservando la última baza', () => {
    const e = ultimaBaza([10, 0, 13, 3], [10, 10, 10, 10]);
    expect(corazones.resultado(e)).toBeNull();
    expect(e.numeroMano).toBe(1);
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
    expect(e.ultimaBaza!.ganador).toBe(0);
    expect(e.fase).toBe('pase');
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista', () => {
  it('no muestra manos ajenas', () => {
    const e = pasarTodos(nueva());
    const texto = JSON.stringify(corazones.vistaDe(e, 0));
    for (const c of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!]) {
      expect(texto).not.toContain(`"${c}"`);
    }
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(corazones, {
  configs: [CONFIG_CORAZONES_POR_DEFECTO, { pase: false, fin: 50 }],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta));
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => !vistas.has(c));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
