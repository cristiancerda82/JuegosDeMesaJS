import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  anotarManilla,
  cartasLegalesManilla,
  CONFIG_MANILLA_POR_DEFECTO,
  manilla,
  type ConfigManilla,
  type EstadoManilla,
} from '../../src/juegos/manilla';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «9o» es el 9 de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(config: Partial<ConfigManilla> = {}, semilla = 'manilla'): EstadoManilla {
  const r = manilla.crear({ ...CONFIG_MANILLA_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const jugar = (e: EstadoManilla, ...cartas: string[]) =>
  cartas.reduce((x, t) => {
    const r = aplicar(manilla, x, x.turno, { tipo: 'jugar', carta: una(t) });
    if (!r.ok) throw new Error(`${t} de ${x.turno}: ${r.error}`);
    return r.valor;
  }, e);

/** Legales para el asiento 1 con esta mano, esta mesa y triunfo de oros. */
const legales = (mano: string, ...mesa: [number, string][]) =>
  [...cartasLegalesManilla(c(mano), enMesa(...mesa), 'oros', 1)].sort();
const ordenadas = (t: string) => [...c(t)].sort();

describe('reparto y pinte', () => {
  it('12 cartas a cada uno; la última del que reparte se vuelve y marca el triunfo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([12, 12, 12, 12]);
    expect(new Set(e.manos.flat()).size).toBe(48);
    expect(e.repartidor).toBe(3);
    expect(e.manos[3]).toContain(e.pinte);
    expect(e.turno).toBe(0);
    const v = manilla.vistaDe(e, 0);
    expect(v.pinte).toBe(e.pinte);
    expect(v.triunfo).toBe(e.pinte.split('-')[0]);
    expect(v.pinteEnMano).toBe(true);
  });

  it('rechaza objetivos que no son 20 o 40', () => {
    expect(manilla.crear({ objetivo: 30 } as never, 'x').ok).toBe(false);
  });
});

describe('obligaciones', () => {
  it('contra un rival, hay que seguir el palo y montar si se puede', () => {
    expect(legales('12c 3c 9b', [0, '11c'])).toEqual(ordenadas('12c'));
  });

  it('si la baza es del compañero, basta con seguir el palo', () => {
    // El 3 (compañero del 1) gana la baza con el Rey de copas.
    expect(legales('9c 3c 9b', [3, '12c'])).toEqual(ordenadas('9c 3c'));
  });

  it('sin el palo y contra un rival, hay que fallar', () => {
    expect(legales('2o 9b', [0, '11c'])).toEqual(ordenadas('2o'));
  });

  it('hay que sobrefallar si se puede, y si no, se puede echar cualquiera', () => {
    expect(legales('2o 1o 9b', [0, '11c'], [3, '12c'], [2, '12o'])).toEqual(ordenadas('1o'));
    expect(legales('2o 1o 9b', [0, '11c'], [3, '12c'], [2, '9o'])).toEqual(ordenadas('2o 1o 9b'));
    expect(legales('2o 9o 9b', [3, '11c'], [0, '12o'])).toEqual(ordenadas('9o'));
  });

  it('sin el palo y con la baza del compañero, cualquier carta', () => {
    expect(legales('2o 9b', [3, '11c'])).toEqual(ordenadas('2o 9b'));
  });
});

describe('bazas y puntos', () => {
  it('el 9 gana al As y el triunfo a todo; la baza vale 1 más sus cartas', () => {
    const e = {
      ...nueva(),
      pinte: una('2o'),
      manos: [c('1c 3e'), c('9c 4e'), c('2o 5e'), c('12c 6e')],
    };
    const tras = jugar(e, '1c', '9c', '2o', '12c');
    expect(tras.ultimaBaza?.ganador).toBe(2);
    // As 4 + 9 5 + Rey 3 + la baza 1, para la pareja del 2 (bando 0).
    expect(tras.puntos).toEqual([13, 0]);
    expect(tras.turno).toBe(2);
  });

  it('cada pareja anota lo que pasa de 36 y la del que reparte, el pinte', () => {
    // El ejemplo del libro: la pareja que reparte vuelve el 9 de oros y hace 40: anota 9.
    expect(anotarManilla([40, 32], [0, 0], 0, una('9o'), 40)).toEqual({
      anotados: [9, 0],
      pinteAnotado: true,
    });
    // Si los 40 los hace la otra pareja, la del que reparte anota igual el pinte.
    expect(anotarManilla([40, 32], [0, 0], 1, una('9o'), 40)).toEqual({
      anotados: [4, 5],
      pinteAnotado: true,
    });
  });

  it('con 36 a 36 nadie anota, salvo el pinte', () => {
    expect(anotarManilla([36, 36], [0, 0], 0, una('1b'), 40).anotados).toEqual([4, 0]);
    expect(anotarManilla([36, 36], [0, 0], 0, una('7b'), 40).anotados).toEqual([0, 0]);
  });

  it('el pinte que daría la partida solo se anota si la pareja hace al menos 36', () => {
    expect(anotarManilla([30, 42], [37, 10], 0, una('9o'), 40)).toEqual({
      anotados: [0, 6],
      pinteAnotado: false,
    });
    expect(anotarManilla([36, 36], [37, 10], 0, una('9o'), 40)).toEqual({
      anotados: [5, 0],
      pinteAnotado: true,
    });
  });
});

describe('fin de la partida', () => {
  it('termina cuando una pareja llega al objetivo, y gana esa pareja', () => {
    // Última baza: la pareja 0 va con 39 puntos en la mano y 38 en la partida.
    const e: EstadoManilla = {
      ...nueva(),
      pinte: una('2o'),
      manos: [c('8c'), c('3c'), c('4c'), c('5c')],
      puntos: [39, 28],
      totales: [38, 10],
    };
    const fin = jugar(e, '8c', '3c', '4c', '5c');
    expect(fin.totales).toEqual([42, 10]);
    expect(manilla.resultado(fin)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [42, 10, 42, 10],
    });
    expect(manilla.accionesLegales(fin, fin.turno)).toEqual([]);
  });

  it('partidas completas a 20 y a 40', () => {
    for (const objetivo of [20, 40] as const) {
      let e = nueva({ objetivo }, `completa-${objetivo}`);
      while (manilla.resultado(e) === null) {
        const r = aplicar(manilla, e, e.turno, manilla.accionesLegales(e, e.turno).at(-1)!);
        if (!r.ok) throw new Error(r.error);
        e = r.valor;
      }
      expect(Math.max(...e.totales)).toBeGreaterThanOrEqual(objetivo);
      for (const r of e.resultadosManos) expect(r.puntos[0] + r.puntos[1]).toBe(72);
      const fin = manilla.resultado(e)!;
      expect(fin.ganadores).toHaveLength(2);
      expect(manilla.vistaDe(e, 0).turno).toBeNull();
    }
  });
});

describe('vista', () => {
  it('el pinte deja de estar en la mano al jugarlo, y las manos ajenas no se ven', () => {
    const e = { ...nueva(), pinte: una('2o'), manos: [c('1c'), c('9c'), c('3c'), c('2o 4c')] };
    expect(manilla.vistaDe(jugar(e, '1c', '9c', '3c'), 0).pinteEnMano).toBe(true);
    const v = manilla.vistaDe(nueva(), 1);
    expect(JSON.stringify(v)).not.toContain(nueva().manos[0]![0]);
  });
});

describirContrato(manilla, {
  configs: [CONFIG_MANILLA_POR_DEFECTO, { objetivo: 20 }],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...e.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      e.pinte,
      ...e.resultadosManos.map((r) => r.pinte),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 2_000,
});
