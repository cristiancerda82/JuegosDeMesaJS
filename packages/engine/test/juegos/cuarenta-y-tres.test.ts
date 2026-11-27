import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  cartasLegalesCuarentaYTres,
  CONFIG_CUARENTA_Y_TRES_POR_DEFECTO,
  cuarentaYTres,
  liquidacion,
  type ConfigCuarentaYTres,
  type EstadoCuarentaYTres,
} from '../../src/juegos/cuarenta-y-tres';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «12o» es el Rey de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(
  config: Partial<ConfigCuarentaYTres> = {},
  semilla = 'cuarenta-y-tres',
): EstadoCuarentaYTres {
  const r = cuarentaYTres.crear({ ...CONFIG_CUARENTA_Y_TRES_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Un estado con estas manos y esta muestra (triunfo, su palo), saliendo el asiento 0. */
const conManos = (
  manos: [string, string, string],
  muestra = '4e',
  extra: Partial<EstadoCuarentaYTres> = {},
): EstadoCuarentaYTres => {
  const m = una(muestra);
  return {
    ...nueva(),
    manos: manos.map(c),
    muestra: m,
    triunfo: m.split('-')[0] as EstadoCuarentaYTres['triunfo'],
    turno: 0,
    ...extra,
  };
};

const jugar = (e: EstadoCuarentaYTres, ...cartas: string[]) =>
  cartas.reduce((x, t) => {
    const r = aplicar(cuarentaYTres, x, x.turno, { tipo: 'jugar', carta: una(t) });
    if (!r.ok) throw new Error(`${t} de ${x.turno}: ${r.error}`);
    return r.valor;
  }, e);

const cambiar = (e: EstadoCuarentaYTres) => {
  const r = aplicar(cuarentaYTres, e, e.turno, { tipo: 'cambiarSiete' });
  if (!r.ok) throw new Error(r.error);
  return r.valor;
};

const puedeCambiar = (e: EstadoCuarentaYTres, asiento = e.turno) =>
  cuarentaYTres.accionesLegales(e, asiento).some((a) => a.tipo === 'cambiarSiete');

const ordenadas = (t: string) => [...c(t)].sort();

describe('baraja, reparto y muestra', () => {
  it('13 cartas a cada uno y la muestra en la mesa marca el triunfo; sale el siguiente al que reparte', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13]);
    const todas = [...e.manos.flat(), e.muestra];
    expect(new Set(todas).size).toBe(40);
    expect(e.triunfo).toBe(e.muestra.split('-')[0]);
    expect(e.cambio).toBeNull();
    expect(e.repartidor).toBe(2);
    expect(e.turno).toBe(0);
  });

  it('rechaza partidas que no son de 3 o 6 manos', () => {
    expect(cuarentaYTres.crear({ manos: 4 } as never, 'x').ok).toBe(false);
  });

  it('al acabar la mano reparte el siguiente, con una muestra nueva', () => {
    let e = nueva();
    while (e.resultadosManos.length === 0) {
      e = cuarentaYTres.transicion(e, e.turno, cuarentaYTres.accionesLegales(e, e.turno).at(-1)!);
    }
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13]);
    expect(e.cambio).toBeNull();
    expect(e.bazasJugadas).toEqual([]);
  });
});

describe('cambio de la muestra', () => {
  it('una muestra alta se cambia por el 7, sin haber ganado ninguna baza', () => {
    const e = conManos(['7o 4b', '5o 5b', '6o 6b'], '1o');
    expect(puedeCambiar(e)).toBe(true);
    const d = cambiar(e);
    expect(d.manos[0]).toEqual(c('4b 1o'));
    expect(d.muestra).toBe('oros-7');
    expect(d.cambio).toEqual({ asiento: 0, carta: 'oros-1', cartasJugadas: 0 });
    expect(d.turno).toBe(0);
    expect(puedeCambiar(d)).toBe(false);
  });

  it('una muestra baja se cambia por el 2', () => {
    const e = conManos(['7c 4b', '2c 5b', '6o 6b'], '5c');
    expect(puedeCambiar(e)).toBe(false);
    expect(puedeCambiar({ ...e, turno: 1 }, 1)).toBe(true);
    expect(cambiar({ ...e, turno: 1 }).muestra).toBe('copas-2');
  });

  it('el 7 de muestra se cambia por el 2', () => {
    const e = conManos(['2b 4c', '5o 5c', '6o 6c'], '7b');
    expect(cambiar(e).manos[0]).toEqual(c('4c 7b'));
  });

  it('con el 2 de muestra nadie puede cambiarla', () => {
    const e = conManos(['7b 4c', '5o 5c', '6o 6c'], '2b');
    expect([0, 1, 2].some((a) => puedeCambiar({ ...e, turno: a }, a))).toBe(false);
  });

  it('una sola vez por mano', () => {
    // Tras cambiar el As por el 7, el 2 no puede llevarse el 7.
    const d = cambiar(conManos(['7o 4b', '2o 5b', '6o 6b'], '1o'));
    expect(puedeCambiar({ ...d, turno: 1 }, 1)).toBe(false);
  });

  it('también a mitad de baza, antes de jugar su carta', () => {
    const e = jugar(conManos(['4b 5c', '7o 5b', '6o 6b'], '3o'), '4b');
    expect(puedeCambiar(e)).toBe(true);
    expect(cambiar(e).manos[1]).toEqual(c('5b 3o'));
    expect(cambiar(e).cambio!.cartasJugadas).toBe(1);
  });

  it('la muestra sin cambiar no la gana nadie', () => {
    const e = jugar(conManos(['5o', '4o', '6o'], '1b'), '5o', '4o', '6o');
    expect(e.resultadosManos[0]!.tantos).toEqual([0, 0, 9]);
    expect(e.resultadosManos[0]!.muestra).toBe('bastos-1');
    expect(e.resultadosManos[0]!.cambio).toBeNull();
  });
});

describe('valor de las cartas', () => {
  it('el Tres gana al Rey y la baza suma sus tantos', () => {
    const e = jugar(conManos(['12o 4b', '3o 5b', '4o 6b']), '12o', '3o', '4o');
    expect(e.turno).toBe(1);
    expect(e.tantos).toEqual([0, 14, 0]);
  });

  it('la última baza suma 9 de últimas', () => {
    const e = jugar(conManos(['1o', '4o', '5o']), '1o', '4o', '5o');
    const r = e.resultadosManos[0]!;
    expect(r.tantos).toEqual([20, 0, 0]);
    expect(r.ultimas).toBe(0);
  });

  it('el triunfo gana la baza', () => {
    const e = jugar(conManos(['1o 4b', '4e 5b', '5o 6b']), '1o', '4e', '5o');
    expect(e.ultimaBaza!.ganador).toBe(1);
  });
});

describe('obligaciones', () => {
  it('asistir y montar', () => {
    expect(
      [...cartasLegalesCuarentaYTres(c('1c 4c 5o'), enMesa([0, '11c']), 'espadas', 1)].sort(),
    ).toEqual(ordenadas('1c'));
  });

  it('sin el palo hay que fallar', () => {
    expect(
      [...cartasLegalesCuarentaYTres(c('4o 1b'), enMesa([0, '11c']), 'oros', 1)].sort(),
    ).toEqual(ordenadas('4o'));
  });

  it('sin poder superar el fallo, cualquiera', () => {
    expect(
      [...cartasLegalesCuarentaYTres(c('4o 1b'), enMesa([0, '11c'], [2, '3o']), 'oros', 1)].sort(),
    ).toEqual(ordenadas('4o 1b'));
  });

  it('sin compañeros: el asiento 0 también obliga a montar al 2', () => {
    expect(
      [...cartasLegalesCuarentaYTres(c('1c 4c'), enMesa([0, '11c']), 'oros', 2)].sort(),
    ).toEqual(ordenadas('1c'));
  });
});

describe('liquidación', () => {
  it('los ejemplos del libro', () => {
    expect([50, 55, 24].map(liquidacion)).toEqual([7, 12, -19]);
    expect([100, 10, 19].map(liquidacion)).toEqual([57, -33, -24]);
  });

  it('la mano anota lo que cobra o paga cada uno', () => {
    const e = jugar(
      conManos(['1o', '4o', '3b'], '4e', { tantos: [20, 55, 24], saldos: [5, 0, -5] }),
      '1o',
      '4o',
      '3b',
    );
    const r = e.resultadosManos[0]!;
    // As, 4 y Tres (21) y las 9 de últimas: el primer ejemplo del libro.
    expect(r.tantos).toEqual([50, 55, 24]);
    expect(r.saldosTras).toEqual([5 + 7, 12, -5 - 19]);
    expect(e.saldos).toEqual(r.saldosTras);
  });
});

describe('fin de la partida', () => {
  it('termina tras la última mano y ganan los de más saldo', () => {
    const ultima = conManos(['1o', '4o', '3b'], '4e', {
      config: { manos: 3 },
      tantos: [70, 10, 19],
      resultadosManos: [{}, {}] as never,
    });
    const e = jugar(ultima, '1o', '4o', '3b');
    expect(e.saldos).toEqual([57, -33, -24]);
    expect(cuarentaYTres.resultado(e)).toEqual({
      ganadores: [0],
      empate: false,
      puntos: [57, -33, -24],
    });
    expect(cuarentaYTres.accionesLegales(e, e.turno)).toEqual([]);
    expect(cuarentaYTres.vistaDe(e, 0).turno).toBeNull();
  });

  it('una partida de 6 juega 6 manos', () => {
    let e = nueva();
    while (cuarentaYTres.resultado(e) === null) {
      e = cuarentaYTres.transicion(e, e.turno, cuarentaYTres.accionesLegales(e, e.turno)[0]!);
    }
    expect(e.resultadosManos).toHaveLength(6);
    expect(e.resultadosManos.map((r) => r.repartidor)).toEqual([2, 0, 1, 2, 0, 1]);
  });
});

describe('vista', () => {
  it('ve su mano, la muestra y solo cuántas cartas tienen los demás', () => {
    const e = nueva();
    const v = cuarentaYTres.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([13, 13, 13]);
    expect(v.muestra).toBe(e.muestra);
    expect(JSON.stringify(v)).not.toContain(`"${e.manos[0]![0]!}"`);
    expect(v.manoNumero).toBe(1);
  });
});

describirContrato(cuarentaYTres, {
  configs: [CONFIG_CUARENTA_Y_TRES_POR_DEFECTO, { manos: 3 }],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...e.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      // Las muestras de las manos anteriores se nombran en sus resultados.
      ...e.resultadosManos.map((r) => r.muestra),
      ...(e.cambio ? [e.cambio.carta] : []),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 3_000,
});
