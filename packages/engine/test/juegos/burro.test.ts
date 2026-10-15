import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  burro,
  CONFIG_BURRO_POR_DEFECTO,
  MAX_INTERCAMBIOS,
  numeroBurro,
  type AccionBurro,
  type ConfigBurro,
  type EstadoBurro,
} from '../../src/juegos/burro';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(jugadores: ConfigBurro['jugadores'] = 4, semilla = 'b'): EstadoBurro {
  const r = burro.crear({ jugadores }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Estado de 4 jugadores en el pase, con las manos dadas. */
function mesa(manos: IdCarta[][], parcial: Partial<EstadoBurro> = {}): EstadoBurro {
  const n = manos.length;
  return {
    config: { jugadores: n as ConfigBurro['jugadores'] },
    azar: crearAzar('mesa'),
    numeroMano: 0,
    manos,
    fase: 'pase',
    pases: new Array<null>(n).fill(null),
    pasadas: new Array<null>(n).fill(null),
    recibidas: new Array<null>(n).fill(null),
    intercambios: 0,
    plantados: [],
    cuatro: [],
    letras: new Array<number>(n).fill(0),
    ultimaMano: null,
    ...parcial,
  };
}

function jugar(e: EstadoBurro, asiento: number, accion: AccionBurro): EstadoBurro {
  const r = aplicar(burro, e, asiento, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const pasar = (carta: IdCarta): AccionBurro => ({ tipo: 'pasar', carta });
const PLANTARSE: AccionBurro = { tipo: 'plantarse' };
const puedePlantarse = (e: EstadoBurro, a: number) =>
  burro.accionesLegales(e, a).some((x) => x.tipo === 'plantarse');

const MANOS: IdCarta[][] = [
  ['oros-7', 'copas-7', 'espadas-7', 'bastos-1'],
  ['oros-1', 'copas-1', 'espadas-1', 'bastos-7'],
  ['oros-12', 'copas-12', 'espadas-12', 'bastos-12'],
  ['oros-3', 'copas-3', 'espadas-3', 'bastos-3'],
];

// ── Reparto ──────────────────────────────────────────────────────────────────

describe('jugadores y reparto', () => {
  it.each([3, 4, 5] as const)(
    'con %i jugadores, 4 números completos y 4 cartas a cada uno',
    (n) => {
      const e = nueva(n);
      expect(e.manos).toHaveLength(n);
      for (const m of e.manos) expect(m).toHaveLength(4);
      const todas = e.manos.flat();
      expect(new Set(todas).size).toBe(4 * n);
      const numeros = new Map<number, number>();
      for (const c of todas) numeros.set(numeroBurro(c), (numeros.get(numeroBurro(c)) ?? 0) + 1);
      expect(numeros.size).toBe(n);
      for (const veces of numeros.values()) expect(veces).toBe(4);
    },
  );

  it('rechaza 2 o 6 jugadores', () => {
    for (const jugadores of [2, 6]) {
      const r = burro.crear({ jugadores } as unknown as ConfigBurro, 'x');
      expect(r.ok).toBe(false);
    }
  });

  it('la misma semilla da el mismo reparto, y otra semilla otro', () => {
    expect(nueva(4, 'a').manos).toEqual(nueva(4, 'a').manos);
    expect(nueva(4, 'a').manos).not.toEqual(nueva(4, 'z').manos);
  });
});

// ── Pase ─────────────────────────────────────────────────────────────────────

describe('pase simultáneo', () => {
  it('todos pueden elegir a la vez, y quien eligió espera', () => {
    let e = mesa([
      ['oros-7', 'copas-7', 'espadas-7', 'bastos-1'],
      ['oros-1', 'copas-1', 'espadas-1', 'bastos-7'],
      ['oros-12', 'copas-12', 'espadas-12', 'bastos-3'],
      ['oros-3', 'copas-3', 'espadas-3', 'bastos-12'],
    ]);
    for (let a = 0; a < 4; a++) expect(burro.accionesLegales(e, a)).toHaveLength(4);
    e = jugar(e, 2, pasar('bastos-3'));
    expect(burro.accionesLegales(e, 2)).toEqual([]);
    expect(burro.accionesLegales(e, 0)).toHaveLength(4);
  });

  it('cuando todos eligen, cada uno da al siguiente y recibe del anterior', () => {
    let e = mesa([
      ['oros-7', 'copas-7', 'espadas-7', 'bastos-1'],
      ['oros-1', 'copas-1', 'espadas-1', 'bastos-7'],
      ['oros-12', 'copas-12', 'espadas-12', 'bastos-3'],
      ['oros-3', 'copas-3', 'espadas-3', 'bastos-12'],
    ]);
    e = jugar(e, 3, pasar('bastos-12'));
    e = jugar(e, 0, pasar('bastos-1'));
    e = jugar(e, 2, pasar('bastos-3'));
    e = jugar(e, 1, pasar('bastos-7'));
    expect(e.intercambios).toBe(1);
    expect(e.manos[0]).toEqual(['oros-7', 'copas-7', 'espadas-7', 'bastos-12']);
    expect(e.manos[1]).toEqual(['oros-1', 'copas-1', 'espadas-1', 'bastos-1']);
    expect(e.manos[2]).toContain('bastos-7');
    expect(e.manos[3]).toContain('bastos-3');
    expect(e.recibidas).toEqual(['bastos-12', 'bastos-1', 'bastos-7', 'bastos-3']);
    expect(e.pasadas).toEqual(['bastos-1', 'bastos-7', 'bastos-3', 'bastos-12']);
    expect(e.pases).toEqual([null, null, null, null]);
    for (const m of e.manos) expect(m).toHaveLength(4);
  });

  it('no se puede elegir dos veces ni pasar una carta ajena', () => {
    let e = mesa(MANOS);
    expect(aplicar(burro, e, 0, pasar('oros-1')).ok).toBe(false);
    e = jugar(e, 0, pasar('bastos-1'));
    expect(aplicar(burro, e, 0, pasar('oros-7')).ok).toBe(false);
  });
});

// ── Plantarse ────────────────────────────────────────────────────────────────

describe('plantarse', () => {
  it('solo se planta primero quien tiene 4 iguales', () => {
    const e = mesa(MANOS);
    expect(puedePlantarse(e, 0)).toBe(false);
    expect(puedePlantarse(e, 1)).toBe(false);
    expect(puedePlantarse(e, 2)).toBe(true);
    expect(puedePlantarse(e, 3)).toBe(true);
  });

  it('tras la primera plantada los demás solo pueden plantarse y se anulan los pases', () => {
    let e = jugar(mesa(MANOS), 0, pasar('bastos-1'));
    e = jugar(e, 2, PLANTARSE);
    expect(e.fase).toBe('plantando');
    expect(e.pases).toEqual([null, null, null, null]);
    expect(e.cuatro).toEqual(MANOS[2]);
    expect(burro.accionesLegales(e, 0)).toEqual([PLANTARSE]);
    expect(burro.accionesLegales(e, 1)).toEqual([PLANTARSE]);
    expect(burro.accionesLegales(e, 2)).toEqual([]);
  });

  it('el último en plantarse suma una letra y se reparte otra mano', () => {
    let e = mesa(MANOS);
    e = jugar(e, 3, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    e = jugar(e, 2, PLANTARSE);
    expect(e.letras).toEqual([0, 1, 0, 0]);
    expect(e.ultimaMano).toEqual({
      nula: false,
      primero: 3,
      cuatro: MANOS[3],
      orden: [3, 0, 2],
      burro: 1,
    });
    expect(e.numeroMano).toBe(1);
    expect(e.fase).toBe('pase');
    expect(e.plantados).toEqual([]);
    expect(burro.resultado(e)).toBeNull();
  });

  it('con 3 jugadores la mano termina con 2 plantados', () => {
    let e = mesa(MANOS.slice(1));
    e = jugar(e, 1, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    expect(e.letras).toEqual([0, 0, 1]);
  });
});

// ── Mano nula, letras y fin ─────────────────────────────────────────────────

describe('mano nula, letras y fin', () => {
  it('a los 50 intercambios sin plantarse la mano se anula', () => {
    let e = mesa(
      MANOS.map((m) => [...m]),
      { intercambios: MAX_INTERCAMBIOS - 1, letras: [1, 0, 2, 0] },
    );
    for (let a = 0; a < 4; a++) e = jugar(e, a, pasar(e.manos[a]![0]!));
    expect(e.ultimaMano).toEqual({ nula: true });
    expect(e.numeroMano).toBe(1);
    expect(e.intercambios).toBe(0);
    expect(e.letras).toEqual([1, 0, 2, 0]);
  });

  it('la quinta letra termina la partida: el burro pierde y los demás ganan', () => {
    let e = mesa(MANOS, { letras: [0, 4, 3, 2] });
    e = jugar(e, 3, PLANTARSE);
    e = jugar(e, 0, PLANTARSE);
    e = jugar(e, 2, PLANTARSE);
    expect(e.letras).toEqual([0, 5, 3, 2]);
    expect(burro.resultado(e)).toEqual({ ganadores: [0, 2, 3], empate: false });
    for (let a = 0; a < 4; a++) expect(burro.accionesLegales(e, a)).toEqual([]);
  });

  it('una partida pasando la carta del número que menos se tiene termina', () => {
    let e = nueva(5, 'larga');
    for (let pasos = 0; burro.resultado(e) === null; pasos++) {
      if (pasos > 50_000) throw new Error('No termina');
      const a = e.manos.findIndex((_, i) => burro.accionesLegales(e, i).length > 0);
      const acciones = burro.accionesLegales(e, a);
      const mano = e.manos[a]!;
      const veces = (c: IdCarta) => mano.filter((x) => numeroBurro(x) === numeroBurro(c)).length;
      const suelta = [...mano].sort((x, y) => veces(x) - veces(y))[0]!;
      e = jugar(e, a, acciones.find((x) => x.tipo === 'plantarse') ?? pasar(suelta));
    }
    expect(e.letras.filter((l) => l === 5)).toHaveLength(1);
  });
});

// ── Vista ────────────────────────────────────────────────────────────────────

describe('vista del Burro', () => {
  it('ve su mano, su elección y quién eligió, pero no las cartas ajenas ni sus pases', () => {
    let e = mesa(MANOS);
    e = jugar(e, 1, pasar('bastos-7'));
    e = jugar(e, 0, pasar('bastos-1'));
    const v = burro.vistaDe(e, 0);
    expect(v.miMano).toEqual(MANOS[0]);
    expect(v.miPase).toBe('bastos-1');
    expect(v.eligieron).toEqual([true, true, false, false]);
    const texto = JSON.stringify(v);
    for (const c of [...MANOS[1]!, ...MANOS[2]!, ...MANOS[3]!]) expect(texto).not.toContain(c);
  });

  it('el espectador no ve ninguna mano', () => {
    const v = burro.vistaDe(mesa(MANOS), null);
    expect(v.miMano).toBeNull();
    for (const c of MANOS.flat()) expect(JSON.stringify(v)).not.toContain(c);
  });
});

describirContrato(burro, {
  configs: [CONFIG_BURRO_POR_DEFECTO, { jugadores: 3 }, { jugadores: 5 }],
  // Lo que el asiento pasó sabe dónde está, y las 4 iguales del final de mano se enseñaron.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaMano && !e.ultimaMano.nula ? e.ultimaMano.cuatro : []);
    const pasada = asiento === null ? null : e.pasadas[asiento];
    if (pasada) vistas.add(pasada);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => !vistas.has(c));
  },
  pasosMaximos: 400,
  ejecuciones: 30,
});
