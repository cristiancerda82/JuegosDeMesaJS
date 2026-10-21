import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_MENTIROSO_POR_DEFECTO,
  mentiroso,
  type AccionMentiroso,
  type EstadoMentiroso,
} from '../../src/juegos/mentiroso';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

function nueva(jugadores: 3 | 4 | 5 | 6 = 4, semilla = 'mentiroso'): EstadoMentiroso {
  const r = mentiroso.crear({ jugadores }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoMentiroso, accion: AccionMentiroso): EstadoMentiroso {
  const r = aplicar(mentiroso, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Marca y baja esas cartas. */
function bajar(e: EstadoMentiroso, cartas: IdCarta[]): EstadoMentiroso {
  for (const carta of cartas) e = hacer(e, { tipo: 'marcar', carta });
  return hacer(e, { tipo: 'bajar' });
}

const tipos = (e: EstadoMentiroso) => mentiroso.accionesLegales(e, e.turno).map((a) => a.tipo);

/** Un estado armado a mano con estas manos, el turno del asiento 0 y el valor dado. */
function con(manos: IdCarta[][], parcial: Partial<EstadoMentiroso> = {}): EstadoMentiroso {
  return {
    ...nueva(manos.length as 3 | 4 | 5 | 6),
    azar: crearAzar('mesa'),
    manos,
    ...parcial,
  };
}

describe('reparto del Mentiroso', () => {
  it('se reparten las 52 cartas: con 5, dos jugadores tienen 11', () => {
    const e = nueva(5);
    expect(e.manos.map((m) => m.length)).toEqual([11, 11, 10, 10, 10]);
    expect(new Set(e.manos.flat()).size).toBe(52);
    expect(e.monton).toEqual([]);
    expect(e.valor).toBe(1);
    expect(e.turno).toBe(0);
  });

  it('valida la configuración', () => {
    expect(mentiroso.crear({ jugadores: 7 as 6 }, 'x').ok).toBe(false);
    expect(CONFIG_MENTIROSO_POR_DEFECTO.jugadores).toBe(4);
  });
});

describe('bajar', () => {
  it('bajar dos cartas: el montón crece, el valor avanza y pasa el turno', () => {
    const e = nueva();
    const [a, b] = e.manos[0]!;
    const f = bajar(e, [a!, b!]);
    expect(f.manos[0]).toHaveLength(11);
    expect(mentiroso.vistaDe(f, 2).monton).toBe(2);
    expect(mentiroso.vistaDe(f, 2).bajadas).toEqual([{ asiento: 0, cuantas: 2, valor: 1 }]);
    expect(f.valor).toBe(2);
    expect(f.turno).toBe(1);
  });

  it('de 1 a 4 cartas: sin marcar no se baja y la quinta no se marca', () => {
    let e = nueva();
    expect(tipos(e)).not.toContain('bajar');
    for (const carta of e.manos[0]!.slice(0, 4)) e = hacer(e, { tipo: 'marcar', carta });
    expect(tipos(e)).not.toContain('marcar');
    expect(tipos(e)).toContain('desmarcar');
  });

  it('las marcas solo las ve el jugador en turno', () => {
    const e = hacer(nueva(), { tipo: 'marcar', carta: nueva().manos[0]![0]! });
    expect(mentiroso.vistaDe(e, 0).marcadas).toHaveLength(1);
    expect(mentiroso.vistaDe(e, 1).marcadas).toEqual([]);
  });

  it('tras la K vuelve el As', () => {
    const e = { ...nueva(), valor: 13 };
    expect(bajar(e, [e.manos[0]![0]!]).valor).toBe(1);
  });
});

describe('desconfiar', () => {
  const manos: IdCarta[][] = [
    ['picas-5'],
    ['picas-2', 'corazones-9', 'treboles-2', 'diamantes-4'],
    ['corazones-3', 'treboles-8'],
    ['picas-12'],
  ];

  it('pillar una mentira: el que mintió se lleva el montón y baja el que desconfió', () => {
    let e = con(manos, { turno: 1, valor: 2 });
    e = bajar(e, ['picas-2', 'corazones-9', 'treboles-2']);
    e = hacer(e, { tipo: 'desconfiar' });
    expect(e.manos[1]).toHaveLength(4);
    expect(e.monton).toEqual([]);
    expect(e.turno).toBe(2);
    expect(e.valor).toBe(3);
    const r = e.revelaciones.at(-1)!;
    expect(r).toMatchObject({ bajo: 1, desconfio: 2, mentia: true, seLleva: 1, cuantas: 3 });
    expect(mentiroso.vistaDe(e, 0).revelaciones.at(-1)!.cartas).toContain('corazones-9');
  });

  it('desconfiar de la verdad: se lleva el montón quien desconfió', () => {
    let e = con(manos, { turno: 1, valor: 2 });
    e = bajar(e, ['picas-2', 'treboles-2']);
    e = hacer(e, { tipo: 'desconfiar' });
    expect(e.manos[2]).toHaveLength(4);
    expect(e.revelaciones.at(-1)!.seLleva).toBe(2);
    expect(e.turno).toBe(2);
  });

  it('sin bajada, o tras marcar, no se desconfía', () => {
    expect(tipos(nueva())).not.toContain('desconfiar');
    let e = con(manos, { turno: 1, valor: 2 });
    e = bajar(e, ['picas-2']);
    expect(tipos(e)).toContain('desconfiar');
    e = hacer(e, { tipo: 'marcar', carta: 'corazones-3' });
    expect(tipos(e)).not.toContain('desconfiar');
  });
});

describe('victoria', () => {
  it('quedarse sin cartas diciendo la verdad y que te crean', () => {
    let e = con([['picas-1'], ['picas-2'], ['picas-3'], ['corazones-2', 'treboles-2']], {
      turno: 3,
      valor: 2,
    });
    e = bajar(e, ['corazones-2', 'treboles-2']);
    expect(tipos(e)).toEqual(['creer', 'desconfiar']);
    e = hacer(e, { tipo: 'creer' });
    expect(mentiroso.resultado(e)).toMatchObject({ ganadores: [3], empate: false });
    expect(mentiroso.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('desconfiar de una última bajada verdadera: gana igual', () => {
    let e = con([['picas-1'], ['picas-2'], ['picas-3'], ['corazones-2']], { turno: 3, valor: 2 });
    e = bajar(e, ['corazones-2']);
    e = hacer(e, { tipo: 'desconfiar' });
    expect(e.ganador).toBe(3);
    expect(e.manos[0]).toHaveLength(2);
  });

  it('pillado con la última bajada: se lleva el montón y la partida sigue', () => {
    let e = con([['picas-1'], ['picas-2'], ['picas-3'], ['corazones-9']], { turno: 3, valor: 2 });
    e = bajar(e, ['corazones-9']);
    e = hacer(e, { tipo: 'desconfiar' });
    expect(e.ganador).toBeNull();
    expect(e.manos[3]).toEqual(['corazones-9']);
    expect(mentiroso.resultado(e)).toBeNull();
  });
});

describe('vista del Mentiroso', () => {
  it('el montón: el total y las cartas propias, no las ajenas', () => {
    let e = nueva();
    const mia = e.manos[0]![0]!;
    e = bajar(e, [mia]);
    const ajena = e.manos[1]![0]!;
    e = bajar(e, [ajena]);
    const v = mentiroso.vistaDe(e, 0);
    expect(v.monton).toBe(2);
    expect(v.misCartasEnMonton).toEqual([mia]);
    expect(JSON.stringify(v)).not.toContain(`"${ajena}"`);
  });
});

describirContrato(mentiroso, {
  configs: [CONFIG_MENTIROSO_POR_DEFECTO, { jugadores: 3 }, { jugadores: 6 }],
  // Ocultas: las manos ajenas y las cartas del montón que no bajó ese asiento. Las descubiertas
  // en un «¡Mentiroso!» ya las vio todo el mundo.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.revelaciones.flatMap((r) => r.cartas));
    const ocultas = [
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
      ...e.monton.flatMap((b) => (b.asiento === asiento ? [] : b.cartas)),
    ];
    return ocultas.filter((c) => !vistas.has(c));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
