import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  barajaRams,
  cartasLegalesRams,
  CONFIG_RAMS_POR_DEFECTO,
  rams,
  type ConfigRams,
  type EstadoRams,
} from '../../src/juegos/rams';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «13c» es el Rey de corazones; p, c, d y t, picas, corazones… */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));
const ordenadas = (t: string) => [...c(t)].sort();

function nueva(config: Partial<ConfigRams> = {}, semilla = 'rams'): EstadoRams {
  const r = rams.crear({ ...CONFIG_RAMS_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const hacer = (e: EstadoRams, ...acciones: Parameters<typeof rams.transicion>[2][]) =>
  acciones.reduce((x, a) => {
    const r = aplicar(rams, x, x.turno, a);
    if (!r.ok) throw new Error(`${JSON.stringify(a)} de ${x.turno}: ${r.error}`);
    return r.valor;
  }, e);

/** Un estado de 3 en juego, con estas manos y picas de triunfo, con el 0 saliendo. */
function enJuego(manos: [string, string, string], extra: Partial<EstadoRams> = {}): EstadoRams {
  return {
    ...nueva({ jugadores: 3 }),
    fase: 'jugar',
    manos: manos.map(c),
    triunfo: 'picas',
    pinte: 'picas-9',
    pinteCogido: true,
    dichos: ['rams', 'rams', 'rams'],
    turno: 0,
    ...extra,
  };
}

describe('baraja, reparto, niña y pinte', () => {
  it('32 cartas del As al 7', () => {
    const b = barajaRams();
    expect(b).toHaveLength(32);
    expect(b.some((x) => x.endsWith('-2'))).toBe(false);
  });

  it('con 4, 5 cartas cada uno, 5 fichas, niña de 5 y pinte', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
    expect(e.fichas).toEqual([5, 5, 5, 5]);
    expect(e.nina).toHaveLength(5);
    expect(e.triunfo).toBe(e.pinte.split('-')[0]);
    expect(new Set([...e.manos.flat(), ...e.nina, e.pinte]).size).toBe(26);
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('hablar');
  });

  it('con 6, 4 cartas cada uno', () => {
    expect(nueva({ jugadores: 6 }).manos.map((m) => m.length)).toEqual([4, 4, 4, 4, 4, 4]);
  });

  it('sin fichas no se reciben cartas', () => {
    const e = nueva({ jugadores: 4 });
    // El 0 se queda sin fichas al cerrarse una mano en la que todos pasan y reparte él.
    const d = hacer(
      { ...e, repartidor: 3, fichas: [5, 5, 5, 5] },
      { tipo: 'paso' },
      { tipo: 'paso' },
      { tipo: 'paso' },
    );
    expect(d.fichas[3]).toBe(0);
    expect(d.manos[3]).toEqual([]);
    expect(d.enJuego).toEqual([true, true, true, false]);
  });

  it('rechaza menos de 3 o más de 6', () => {
    expect(rams.crear({ jugadores: 7 } as never, 'x').ok).toBe(false);
    expect(rams.crear({ jugadores: 2 } as never, 'x').ok).toBe(false);
  });
});

describe('hablar', () => {
  it('coger la niña cambia la mano y obliga a jugar; después ya no se puede', () => {
    const e = nueva();
    const nina = e.nina;
    const d = hacer(e, { tipo: 'nina' });
    expect(d.manos[0]).toEqual(nina);
    expect(d.dichos[0]).toBe('nina');
    expect(d.ninaDe).toBe(0);
    expect(rams.accionesLegales(d, 1).some((a) => a.tipo === 'nina')).toBe(false);
  });

  it('el que reparte no habla: tras el último, descarta y se queda el pinte', () => {
    let e = hacer(nueva(), { tipo: 'rams' }, { tipo: 'paso' }, { tipo: 'paso' });
    expect(e.fase).toBe('descartar');
    expect(e.turno).toBe(3);
    const carta = e.manos[3]![0]!;
    e = hacer(e, { tipo: 'descartar', carta });
    expect(e.manos[3]).toContain(e.pinte);
    expect(e.manos[3]).not.toContain(carta);
    expect(e.fase).toBe('jugar');
    expect(e.turno).toBe(0);
    expect(rams.vistaDe(e, 1).muestra).toBeNull();
  });

  it('si todos pasan, el que reparte se quita las fichas de toda la mano', () => {
    const d = hacer(nueva(), { tipo: 'paso' }, { tipo: 'paso' }, { tipo: 'paso' });
    const r = d.resultadosManos[0]!;
    expect(r.sinJugar).toBe(true);
    expect(r.fichasTras).toEqual([5, 5, 5, 0]);
  });
});

describe('bazas y obligaciones', () => {
  it('seguir el palo subiendo', () => {
    expect([...cartasLegalesRams(c('13c 8c 7p'), enMesa([0, '11c']), 'picas', 1)].sort()).toEqual(
      ordenadas('13c'),
    );
  });

  it('sin el palo, fallar', () => {
    expect([...cartasLegalesRams(c('8p 13d'), enMesa([0, '11c']), 'picas', 1)].sort()).toEqual(
      ordenadas('8p'),
    );
  });

  it('sin poder superar el fallo, triunfo igualmente', () => {
    expect(
      [...cartasLegalesRams(c('8p 13d'), enMesa([0, '11c'], [2, '13p']), 'picas', 1)].sort(),
    ).toEqual(ordenadas('8p'));
  });

  it('el As es la más alta y el triunfo gana', () => {
    const e = hacer(enJuego(['1c 7d', '13c 8d', '7p 9d']), { tipo: 'jugar', carta: 'corazones-1' });
    const d = hacer(
      e,
      { tipo: 'jugar', carta: 'corazones-13' },
      { tipo: 'jugar', carta: 'picas-7' },
    );
    expect(d.ultimaBaza!.ganador).toBe(2);
    expect(d.turno).toBe(2);
  });
});

describe('fichas', () => {
  it('una ficha por baza y ramsé sin bazas', () => {
    const e = enJuego(['1c', '13c', '7c'], { fichas: [3, 2, 5] });
    const d = hacer(
      e,
      { tipo: 'jugar', carta: 'corazones-1' },
      { tipo: 'jugar', carta: 'corazones-13' },
      { tipo: 'jugar', carta: 'corazones-7' },
    );
    const r = d.resultadosManos[0]!;
    expect(r.bazas).toEqual([1, 0, 0]);
    expect(r.ramses).toEqual([1, 2]);
    expect(r.fichasTras).toEqual([2, 7, 10]);
  });

  it('el ramsé toma de la canasta mientras queden fichas', () => {
    const e = enJuego(['1c', '13c', '7c'], { fichas: [3, 2, 5], canasta: 7 });
    const d = hacer(
      e,
      { tipo: 'jugar', carta: 'corazones-1' },
      { tipo: 'jugar', carta: 'corazones-13' },
      { tipo: 'jugar', carta: 'corazones-7' },
    );
    // El 1 toma 5 y el 2, las 2 que quedan.
    expect(d.resultadosManos[0]!.fichasTras).toEqual([2, 7, 7]);
    expect(d.canasta).toBe(0);
  });

  it('con la canasta vacía, el ramsé no toma nada', () => {
    const e = enJuego(['1c', '13c', '7c'], { fichas: [3, 2, 5], canasta: 0 });
    const d = hacer(
      e,
      { tipo: 'jugar', carta: 'corazones-1' },
      { tipo: 'jugar', carta: 'corazones-13' },
      { tipo: 'jugar', carta: 'corazones-7' },
    );
    expect(d.resultadosManos[0]!.fichasTras).toEqual([2, 2, 5]);
  });

  it('los que pasan se quedan con sus fichas', () => {
    const e = enJuego(['1c', '13c', '7c'], { dichos: ['rams', 'paso', 'rams'], fichas: [3, 2, 5] });
    const d = hacer(
      e,
      { tipo: 'jugar', carta: 'corazones-1' },
      { tipo: 'jugar', carta: 'corazones-7' },
    );
    expect(d.resultadosManos[0]!.fichasTras).toEqual([2, 2, 10]);
  });
});

describe('fin de la partida', () => {
  it('cuando solo uno conserva fichas, pierde; gana quien acabó antes', () => {
    const e = enJuego(['1c', '13c', '7c'], {
      fichas: [1, 0, 4],
      terminoEn: [null, 2, null],
      dichos: ['rams', null, 'rams'],
      resultadosManos: [{}, {}, {}] as never,
    });
    const d = hacer(
      e,
      { tipo: 'jugar', carta: 'corazones-1' },
      { tipo: 'jugar', carta: 'corazones-7' },
    );
    expect(d.fichas).toEqual([0, 0, 9]);
    expect(rams.resultado(d)).toEqual({ ganadores: [1], empate: false, puntos: [-4, -2, -13] });
    expect(rams.accionesLegales(d, d.turno)).toEqual([]);
  });

  it('una partida entre jugadas legales termina', () => {
    for (const jugadores of [3, 6] as const) {
      let e = nueva({ jugadores }, `fin-${jugadores}`);
      for (let i = 0; i < 20_000 && rams.resultado(e) === null; i++) {
        e = rams.transicion(e, e.turno, rams.accionesLegales(e, e.turno)[0]!);
      }
      expect(rams.resultado(e)).not.toBeNull();
    }
  });
});

describe('vista', () => {
  it('ve su mano y el pinte, y solo cuántas cartas tienen los demás y la niña', () => {
    const e = nueva();
    const v = rams.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([5, 5, 5, 5]);
    expect(v.cartasNina).toBe(5);
    expect(v.muestra).toBe(e.pinte);
    expect(JSON.stringify(v)).not.toContain(`"${e.nina[0]!}"`);
  });
});

describirContrato(rams, {
  configs: [{ jugadores: 3 }, { jugadores: 4 }, { jugadores: 6 }],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      e.pinte,
      ...e.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
    ]);
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.nina, ...e.dejada].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 20_000,
});
