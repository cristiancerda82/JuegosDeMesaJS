import { describe, expect, it } from 'vitest';
import { crearAzar, Generador } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_JULEPE_POR_DEFECTO,
  julepe,
  type AccionJulepe,
  type ConfigJulepe,
  type EstadoJulepe,
} from '../../src/juegos/julepe';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigJulepe> = {}, semilla = 'j'): EstadoJulepe {
  const r = julepe.crear({ ...CONFIG_JULEPE_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoJulepe, accion: AccionJulepe): EstadoJulepe {
  const r = aplicar(julepe, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const tipos = (e: EstadoJulepe) => julepe.accionesLegales(e, e.turno).map((a) => a.tipo);

/** Las decisiones de los asientos en orden desde la mano (asiento 0 con 4 jugadores). */
function decidir(e: EstadoJulepe, ...decisiones: boolean[]): EstadoJulepe {
  for (const juega of decisiones) e = hacer(e, { tipo: juega ? 'jugar' : 'pasar' });
  return e;
}

/** Fase de juego armada a mano: juegan los asientos con mano, triunfo oros. */
function enJuego(manos: IdCarta[][], parcial: Partial<EstadoJulepe> = {}): EstadoJulepe {
  const base = nueva({ jugadores: manos.length as 3 | 4 | 5 | 6 });
  return {
    ...base,
    azar: crearAzar('mesa'),
    manos,
    mazo: [],
    cartaTriunfo: null,
    triunfo: 'oros',
    fase: 'jugar',
    turno: 0,
    juega: manos.map((m) => m.length > 0),
    cambios: manos.map((m) => (m.length > 0 ? 0 : null)),
    ...parcial,
  };
}

const total = (e: EstadoJulepe) => e.fichas.reduce((s, f) => s + f, 0) + e.bote;

// ── Reparto y bote ───────────────────────────────────────────────────────────

describe('reparto y bote', () => {
  it('5 cartas a cada uno, 20 en el mazo y triunfo a la vista en la mano del repartidor', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
    expect(e.mazo).toHaveLength(20);
    expect(e.repartidor).toBe(3);
    expect(e.manos[3]).toContain(e.cartaTriunfo);
    expect(e.triunfo).toBe(e.cartaTriunfo!.split('-')[0]);
    expect(julepe.vistaDe(e, 0).cartaTriunfo).toBe(e.cartaTriunfo);
  });

  it('el repartidor pone 10 en el bote', () => {
    const e = nueva();
    expect(e.bote).toBe(10);
    expect(e.fichas).toEqual([50, 50, 50, 40]);
    expect(e.turno).toBe(0);
  });

  it('valida la configuración', () => {
    expect(julepe.crear({ jugadores: 7 as 6, manos: 12 }, 'x').ok).toBe(false);
    expect(julepe.crear({ jugadores: 6, manos: 13 as 12 }, 'x').ok).toBe(false);
    expect(nueva({ jugadores: 6 }).mazo).toHaveLength(10);
  });
});

// ── Jugar o pasar ────────────────────────────────────────────────────────────

describe('jugar o pasar', () => {
  it('el repartidor está obligado si solo juega uno antes que él', () => {
    const e = decidir(nueva(), false, true, false);
    expect(e.turno).toBe(3);
    expect(tipos(e)).toEqual(['jugar']);
  });

  it('con dos que juegan, el repartidor puede pasar', () => {
    const e = decidir(nueva(), true, true, false);
    expect(tipos(e)).toEqual(['jugar', 'pasar']);
  });

  it('si nadie juega, el repartidor se lleva el bote', () => {
    let e = decidir(nueva(), false, false, false);
    e = hacer(e, { tipo: 'jugar' });
    const r = e.resultadosManos[0]!;
    expect(r.nadieJugo).toBe(true);
    expect(r.cobrado).toEqual([0, 0, 0, 10]);
    expect(e.fichas).toEqual([40, 50, 50, 50]);
    expect(e.repartidor).toBe(0);
    expect(e.bote).toBe(10);
  });
});

// ── Descarte ─────────────────────────────────────────────────────────────────

describe('descarte', () => {
  it('descartan en orden los que juegan y roban del mazo', () => {
    let e = decidir(nueva(), true, false, true, false);
    expect(e.fase).toBe('descartar');
    expect(e.turno).toBe(0);
    expect(julepe.accionesLegales(e, 0)).toHaveLength(32);
    const tiradas = e.manos[0]!.slice(0, 2);
    const robadas = e.mazo.slice(0, 2);
    e = hacer(e, { tipo: 'descartar', cartas: tiradas });
    expect(e.manos[0]).toEqual([...e.manos[0]!.slice(0, 3), ...robadas]);
    expect(e.manos[0]).not.toContain(tiradas[0]);
    expect(e.cambios[0]).toBe(2);
    expect(e.turno).toBe(2);
    e = hacer(e, { tipo: 'descartar', cartas: [] });
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(0);
  });

  it('no se descartan más cartas de las que quedan en el mazo', () => {
    let e = decidir(nueva(), true, false, true, false);
    e = { ...e, mazo: e.mazo.slice(0, 2) };
    const acciones = julepe.accionesLegales(e, 0);
    expect(Math.max(...acciones.map((a) => (a.tipo === 'descartar' ? a.cartas.length : 0)))).toBe(
      2,
    );
    // Vacío + 5 de una carta + 10 de dos.
    expect(acciones).toHaveLength(16);
  });

  it('descartar la carta de triunfo la quita de la vista', () => {
    let e = decidir(nueva(), false, true, false, true);
    e = hacer(e, { tipo: 'descartar', cartas: [] });
    e = hacer(e, { tipo: 'descartar', cartas: [e.cartaTriunfo!] });
    expect(e.cartaTriunfo).toBeNull();
    expect(julepe.vistaDe(e, 0).cartaTriunfo).toBeNull();
  });
});

// ── Bazas, cobro y julepe ────────────────────────────────────────────────────

describe('bazas', () => {
  it('superar con el palo', () => {
    const e = enJuego([['copas-11'], ['copas-2', 'copas-12', 'oros-4'], [], []], {
      mesa: [{ asiento: 0, carta: 'copas-11' }],
      manos: [[], ['copas-2', 'copas-12', 'oros-4'], [], []],
      turno: 1,
    });
    expect(julepe.accionesLegales(e, 1)).toEqual([{ tipo: 'carta', carta: 'copas-12' }]);
  });

  it('las bazas se juegan solo entre los que juegan', () => {
    let e = enJuego([['copas-1'], [], ['copas-2'], ['oros-2']], {
      juega: [true, false, true, true],
    });
    e = { ...e, bazasJugadas: [] };
    e = hacer(e, { tipo: 'carta', carta: 'copas-1' });
    expect(e.turno).toBe(2);
  });
});

describe('cobro y julepe', () => {
  it('con un bote de 10, 3, 2 y 0 bazas cobran 6, 4 y 0, y el tercero paga 10', () => {
    // Falta la última baza: el 0 lleva 3 y el 1 lleva 1; la gana el 1 con el As de copas.
    const previa = { cartas: [], ganador: 0 };
    let e = enJuego([['copas-4'], ['copas-1'], ['copas-2'], []], {
      bote: 10,
      boteMano: 10,
      fichas: [50, 50, 50, 40],
      bazas: [3, 1, 0, 0],
      bazasJugadas: [previa, previa, previa, previa],
    });
    expect(total(e)).toBe(200);
    for (const carta of ['copas-4', 'copas-1', 'copas-2'] as IdCarta[]) {
      e = hacer(e, { tipo: 'carta', carta });
    }
    const r = e.resultadosManos[0]!;
    expect(r.bazas.slice(0, 3)).toEqual([3, 2, 0]);
    expect(r.cobrado).toEqual([6, 4, 0, 0]);
    expect(r.julepe).toEqual([0, 0, 10, 0]);
    expect(r.fichasTras).toEqual([56, 54, 40, 40]);
    // El bote siguiente: los 10 de julepe más la puesta del nuevo repartidor.
    expect(e.bote).toBe(20);
    expect(total(e)).toBe(200);
  });

  it('se conservan las fichas mano a mano y quien se queda sin fichas queda eliminado', () => {
    const g = new Generador(crearAzar('conserva'));
    for (const jugadores of [3, 4, 5, 6] as const) {
      let e = nueva({ jugadores, manos: 20 }, `conserva-${jugadores}`);
      e = { ...e, fichas: e.fichas.map((f, a) => (a === 1 ? 3 : f)) };
      const inicial = total(e);
      while (julepe.resultado(e) === null) {
        const acciones = julepe.accionesLegales(e, e.turno);
        e = hacer(e, acciones[g.enteroHasta(acciones.length)]!);
        expect(total(e)).toBe(inicial);
        expect(e.fichas.every((f) => f >= 0)).toBe(true);
        e.eliminados.forEach((x, a) => {
          if (x) expect(e.manos[a]).toEqual([]);
        });
      }
    }
  });
});

describe('fin de la partida', () => {
  it('termina tras las manos configuradas y gana quien más fichas tiene', () => {
    let e = nueva({ manos: 6 });
    const g = new Generador(crearAzar('fin'));
    let pasos = 0;
    while (julepe.resultado(e) === null) {
      const acciones = julepe.accionesLegales(e, e.turno);
      e = hacer(e, acciones[g.enteroHasta(acciones.length)]!);
      pasos++;
    }
    expect(pasos).toBeGreaterThan(0);
    expect(e.numeroMano === 6 || e.eliminados.filter((x) => !x).length <= 1).toBe(true);
    const fin = julepe.resultado(e)!;
    const max = Math.max(...e.fichas);
    expect(fin.ganadores.every((a) => e.fichas[a] === max)).toBe(true);
  });
});

describe('vista', () => {
  it('no muestra manos ajenas, mazo ni descartes', () => {
    let e = decidir(nueva(), true, true, false, true);
    e = hacer(e, { tipo: 'descartar', cartas: e.manos[0]!.slice(0, 2) });
    const v = julepe.vistaDe(e, 1);
    const ocultas = [
      ...e.manos[0]!,
      ...e.manos[2]!,
      ...e.manos[3]!.filter((c) => c !== e.cartaTriunfo),
      ...e.mazo,
      ...e.descartadas,
    ];
    for (const c of ocultas) expect(JSON.stringify(v)).not.toContain(`"${c}"`);
    expect(v.cambios).toEqual([2, null, null, null]);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(julepe, {
  configs: [
    CONFIG_JULEPE_POR_DEFECTO,
    { jugadores: 3, manos: 6 },
    { jugadores: 5, manos: 6 },
    { jugadores: 6, manos: 6 },
  ],
  // La carta de triunfo está a la vista y las de la última baza ya se vieron.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...(e.cartaTriunfo === null ? [] : [e.cartaTriunfo]),
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
    ]);
    return [
      ...e.mazo,
      ...e.descartadas,
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
    ].filter((c) => !vistas.has(c));
  },
  pasosMaximos: 400,
  ejecuciones: 30,
});
