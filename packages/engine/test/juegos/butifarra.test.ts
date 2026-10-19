import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { crearBaraja, type IdCarta } from '../../src/baraja/cartas';
import {
  butifarra,
  CONFIG_BUTIFARRA_POR_DEFECTO,
  type AccionButifarra,
  type EstadoButifarra,
} from '../../src/juegos/butifarra';
import { aplicar } from '../../src/motor/aplicar';
import type { Asiento } from '../../src/motor/contrato';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(semilla = 'b', objetivo: 51 | 101 | 151 = 101): EstadoButifarra {
  const r = butifarra.crear({ objetivo }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoButifarra, asiento: Asiento, accion: AccionButifarra): EstadoButifarra {
  const r = aplicar(butifarra, e, asiento, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${asiento}: ${r.error}`);
  return r.valor;
}

/** Estado armado a mano en la fase de juego, triunfo en oros elegido por el asiento 3. */
function mesa(parcial: Partial<EstadoButifarra> = {}): EstadoButifarra {
  return {
    config: CONFIG_BUTIFARRA_POR_DEFECTO,
    azar: crearAzar('mesa'),
    repartidor: 3,
    manos: [[], [], [], []],
    fase: 'jugar',
    turno: 0,
    eleccion: { triunfo: 'oros', quien: 3, delegada: false },
    contros: 0,
    pasados: 0,
    mesa: [],
    bazasJugadas: [],
    ultimaBaza: null,
    bazas: [0, 0, 0, 0],
    puntos: [0, 0],
    resultadosManos: [],
    totales: [0, 0],
    ...parcial,
  };
}

const cartasJugables = (e: EstadoButifarra, asiento: Asiento) =>
  butifarra
    .accionesLegales(e, asiento)
    .flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []))
    .sort();

/** Juega toda la mano con la primera acción legal, salvo en la elección y los contros. */
function jugarHastaFinDeMano(e: EstadoButifarra): EstadoButifarra {
  const manos = e.resultadosManos.length;
  while (e.resultadosManos.length === manos) {
    const a = e.turno;
    e = hacer(e, a, butifarra.accionesLegales(e, a)[0]!);
  }
  return e;
}

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('reparto', () => {
  it('12 cartas distintas a cada uno, toda la baraja, y reparte el asiento 3', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([12, 12, 12, 12]);
    expect(new Set(e.manos.flat()).size).toBe(48);
    expect([...e.manos.flat()].sort()).toEqual([...crearBaraja('espanola48')].sort());
    expect(e.repartidor).toBe(3);
    expect(e.fase).toBe('elegir');
    expect(e.turno).toBe(3);
  });

  it('el repartidor rota cada mano', () => {
    const e = jugarHastaFinDeMano(nueva());
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(0);
    expect(e.manos.every((m) => m.length === 12)).toBe(true);
  });

  it('valida el objetivo', () => {
    expect(butifarra.crear({ objetivo: 100 as 101 }, 'x').ok).toBe(false);
    expect(butifarra.crear({ objetivo: 51 }, 'x').ok).toBe(true);
  });
});

// ── Elección y contros ───────────────────────────────────────────────────────

describe('elección del triunfo', () => {
  it('el repartidor puede elegir palo, butifarra o delegar', () => {
    const tipos = butifarra.accionesLegales(nueva(), 3);
    expect(tipos).toHaveLength(6);
    expect(tipos).toContainEqual({ tipo: 'delegar' });
    expect(tipos).toContainEqual({ tipo: 'elegir', triunfo: null });
  });

  it('delegar: elige el compañero, que no puede delegar', () => {
    const e = hacer(nueva(), 3, { tipo: 'delegar' });
    expect(e.turno).toBe(1);
    const acciones = butifarra.accionesLegales(e, 1);
    expect(acciones).toHaveLength(5);
    expect(acciones).not.toContainEqual({ tipo: 'delegar' });
    const elegido = hacer(e, 1, { tipo: 'elegir', triunfo: 'copas' });
    expect(elegido.eleccion).toEqual({ triunfo: 'copas', quien: 1, delegada: true });
  });

  it('butifarra: sin triunfo y multiplicador 2', () => {
    const e = hacer(nueva(), 3, { tipo: 'elegir', triunfo: null });
    const v = butifarra.vistaDe(e, 0);
    expect(v.eleccion?.triunfo).toBeNull();
    expect(v.multiplicador).toBe(2);
  });
});

describe('contros', () => {
  const elegido = () => hacer(nueva(), 3, { tipo: 'elegir', triunfo: 'oros' });

  it('deciden los rivales en orden desde el siguiente al repartidor', () => {
    const e = elegido();
    expect(e.fase).toBe('contros');
    expect(e.turno).toBe(0);
    expect(butifarra.accionesLegales(e, 0)).toEqual([{ tipo: 'contro' }, { tipo: 'pasar' }]);
    expect(hacer(e, 0, { tipo: 'pasar' }).turno).toBe(2);
  });

  it('sin contro: empieza el juego con multiplicador 1', () => {
    let e = hacer(elegido(), 0, { tipo: 'pasar' });
    e = hacer(e, 2, { tipo: 'pasar' });
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(0);
    expect(butifarra.vistaDe(e, 0).multiplicador).toBe(1);
  });

  it('contro y recontro: los rivales aún pueden decir Sant Vicenç', () => {
    let e = hacer(elegido(), 0, { tipo: 'contro' });
    expect(e.turno).toBe(1);
    e = hacer(e, 1, { tipo: 'pasar' });
    expect(e.turno).toBe(3);
    e = hacer(e, 3, { tipo: 'contro' });
    expect(e.contros).toBe(2);
    expect(e.turno).toBe(0);
    e = hacer(e, 0, { tipo: 'pasar' });
    e = hacer(e, 2, { tipo: 'pasar' });
    expect(e.fase).toBe('jugar');
    expect(butifarra.vistaDe(e, 0).multiplicador).toBe(4);
  });

  it('Sant Vicenç: ×8 y empieza el juego', () => {
    let e = hacer(elegido(), 0, { tipo: 'contro' });
    e = hacer(e, 1, { tipo: 'contro' });
    e = hacer(e, 0, { tipo: 'contro' });
    expect(e.contros).toBe(3);
    expect(e.fase).toBe('jugar');
    expect(butifarra.vistaDe(e, 0).multiplicador).toBe(8);
  });

  it('butifarra con contro: ×4', () => {
    let e = hacer(nueva(), 3, { tipo: 'elegir', triunfo: null });
    e = hacer(e, 0, { tipo: 'contro' });
    e = hacer(e, 1, { tipo: 'pasar' });
    e = hacer(e, 3, { tipo: 'pasar' });
    expect(e.fase).toBe('jugar');
    expect(butifarra.vistaDe(e, 0).multiplicador).toBe(4);
  });

  it('nadie fuera de turno puede decidir', () => {
    expect(butifarra.accionesLegales(elegido(), 1)).toEqual([]);
  });
});

// ── Bazas ────────────────────────────────────────────────────────────────────

describe('bazas y obligaciones', () => {
  it('superar con el palo', () => {
    const e = mesa({
      turno: 1,
      mesa: [{ asiento: 0, carta: 'copas-12' }],
      manos: [[], ['copas-10', 'copas-9', 'oros-2'], [], []],
    });
    expect(cartasJugables(e, 1)).toEqual(['copas-9']);
  });

  it('fallar y superar el triunfo más alto', () => {
    const e = mesa({
      turno: 2,
      mesa: [
        { asiento: 0, carta: 'espadas-2' },
        { asiento: 1, carta: 'oros-5' },
      ],
      manos: [[], [], ['oros-4', 'oros-7', 'copas-1'], []],
    });
    expect(cartasJugables(e, 2)).toEqual(['oros-7']);
  });

  it('baza del compañero: sin el palo, cualquier carta', () => {
    const e = mesa({
      turno: 2,
      mesa: [
        { asiento: 0, carta: 'espadas-9' },
        { asiento: 1, carta: 'espadas-2' },
      ],
      manos: [[], [], ['oros-4', 'copas-1'], []],
    });
    expect(cartasJugables(e, 2)).toEqual(['copas-1', 'oros-4']);
  });

  it('sin triunfo, un 9 de otro palo no gana', () => {
    let e = mesa({
      eleccion: { triunfo: null, quien: 3, delegada: false },
      manos: [
        ['copas-12', 'copas-2'],
        ['oros-9', 'oros-2'],
        ['copas-1', 'copas-3'],
        ['espadas-9', 'espadas-2'],
      ],
    });
    e = hacer(e, 0, { tipo: 'jugar', carta: 'copas-12' });
    e = hacer(e, 1, { tipo: 'jugar', carta: 'oros-9' });
    e = hacer(e, 2, { tipo: 'jugar', carta: 'copas-1' });
    e = hacer(e, 3, { tipo: 'jugar', carta: 'espadas-9' });
    expect(e.bazasJugadas[0]!.ganador).toBe(2);
    // 3 + 5 + 4 + 5 de cartas, y 1 por la baza.
    expect(e.puntos).toEqual([18, 0]);
    expect(e.turno).toBe(2);
  });
});

// ── Puntuación ───────────────────────────────────────────────────────────────

/** Una última baza de cartas sin puntos que gana el asiento 0, con los puntos previos dados. */
function ultimaBaza(puntos: [number, number], parcial: Partial<EstadoButifarra> = {}) {
  let e = mesa({
    puntos,
    manos: [['oros-8'], ['oros-2'], ['oros-3'], ['oros-4']],
    ...parcial,
  });
  for (const a of [0, 1, 2, 3]) e = hacer(e, a, butifarra.accionesLegales(e, a)[0]!);
  return e;
}

describe('puntuación de la mano', () => {
  it('mano sencilla: 46 puntos se anotan 10', () => {
    const e = ultimaBaza([45, 26]);
    expect(e.resultadosManos[0]!.puntos).toEqual([46, 26]);
    expect(e.resultadosManos[0]!.anotados).toEqual([10, 0]);
    expect(e.totales).toEqual([10, 0]);
  });

  it('butifarra con contro: 42 puntos se anotan 6 × 4', () => {
    const e = ultimaBaza([41, 30], {
      eleccion: { triunfo: null, quien: 1, delegada: false },
      contros: 1,
    });
    expect(e.resultadosManos[0]!.multiplicador).toBe(4);
    expect(e.resultadosManos[0]!.anotados).toEqual([24, 0]);
  });

  it('empate a 36: nadie se anota', () => {
    const e = ultimaBaza([35, 36]);
    expect(e.resultadosManos[0]!.anotados).toEqual([0, 0]);
  });

  it('cada mano reparte 72 puntos', () => {
    const e = jugarHastaFinDeMano(nueva('setenta y dos'));
    const r = e.resultadosManos[0]!;
    expect(r.puntos[0] + r.puntos[1]).toBe(72);
    expect(r.bazas[0] + r.bazas[1]).toBe(12);
  });
});

describe('fin de la partida', () => {
  it('llegar a 101 termina la partida', () => {
    const e = ultimaBaza([45, 26], { totales: [95, 40] });
    expect(e.totales).toEqual([105, 40]);
    const fin = butifarra.resultado(e);
    expect(fin).toEqual({ ganadores: [0, 2], empate: false, puntos: [105, 40, 105, 40] });
    expect(butifarra.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('por debajo del objetivo se reparte otra mano', () => {
    const e = ultimaBaza([45, 26], { totales: [80, 40] });
    expect(butifarra.resultado(e)).toBeNull();
    expect(e.fase).toBe('elegir');
  });
});

describe('vista', () => {
  it('no muestra las manos ajenas y sí las bazas jugadas', () => {
    let e = hacer(nueva(), 3, { tipo: 'elegir', triunfo: 'bastos' });
    e = hacer(hacer(e, 0, { tipo: 'pasar' }), 2, { tipo: 'pasar' });
    for (let i = 0; i < 4; i++) e = hacer(e, e.turno, butifarra.accionesLegales(e, e.turno)[0]!);
    const v = butifarra.vistaDe(e, 0);
    const ajenas = new Set<IdCarta>(e.manos.slice(1).flat());
    expect(JSON.stringify(v.miMano)).toBe(JSON.stringify(e.manos[0]));
    for (const c of ajenas) expect(JSON.stringify(v)).not.toContain(`"${c}"`);
    expect(v.bazasJugadas).toHaveLength(1);
    expect(v.ultimaBaza).toEqual(v.bazasJugadas[0]);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(butifarra, {
  configs: [CONFIG_BUTIFARRA_POR_DEFECTO, { objetivo: 51 }, { objetivo: 151 }],
  // Las cartas de la última baza ya se vieron, aunque tras repartir estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => !vistas.has(c));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
