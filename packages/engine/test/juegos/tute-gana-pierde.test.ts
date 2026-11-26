import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  cartasLegalesGanaPierde,
  CONFIG_TUTE_GANA_PIERDE_POR_DEFECTO,
  parejaEnBaza,
  penalizadosGanaPierde,
  tuteGanaPierde,
  type ConfigTuteGanaPierde,
  type EstadoTuteGanaPierde,
} from '../../src/juegos/tute-gana-pierde';
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
  config: Partial<ConfigTuteGanaPierde> = {},
  semilla = 'gana-pierde',
): EstadoTuteGanaPierde {
  const r = tuteGanaPierde.crear({ ...CONFIG_TUTE_GANA_PIERDE_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Un estado con estas manos, saliendo el asiento 0. */
const conManos = (
  manos: [string, string, string],
  extra: Partial<EstadoTuteGanaPierde> = {},
): EstadoTuteGanaPierde => ({ ...nueva(), manos: manos.map(c), turno: 0, ...extra });

const jugar = (e: EstadoTuteGanaPierde, ...cartas: string[]) =>
  cartas.reduce((x, t) => {
    const r = aplicar(tuteGanaPierde, x, x.turno, { tipo: 'jugar', carta: una(t) });
    if (!r.ok) throw new Error(`${t} de ${x.turno}: ${r.error}`);
    return r.valor;
  }, e);

const ordenadas = (t: string) => [...c(t)].sort();

describe('baraja y reparto', () => {
  it('36 cartas sin doses, 12 a cada uno, sin triunfo; sale el siguiente al que reparte', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([12, 12, 12]);
    const todas = e.manos.flat();
    expect(new Set(todas).size).toBe(36);
    expect(todas.some((x) => x.endsWith('-2'))).toBe(false);
    expect(e.triunfo).toBeNull();
    expect(e.repartidor).toBe(2);
    expect(e.turno).toBe(0);
  });

  it('rechaza límites que no son 3 o 6', () => {
    expect(tuteGanaPierde.crear({ limite: 5 } as never, 'x').ok).toBe(false);
  });

  it('al acabar la mano reparte el siguiente', () => {
    let e = nueva();
    while (e.resultadosManos.length === 0) {
      e = tuteGanaPierde.transicion(e, e.turno, tuteGanaPierde.accionesLegales(e, e.turno)[0]!);
    }
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.manos.map((m) => m.length)).toEqual([12, 12, 12]);
    expect(e.triunfo).toBeNull();
  });
});

describe('valor de las cartas', () => {
  it('el Tres gana al Rey y la baza suma sus tantos', () => {
    const e = jugar(conManos(['12o 4b', '3o 5b', '4o 6b']), '12o', '3o', '4o');
    expect(e.turno).toBe(1);
    expect(e.tantos).toEqual([0, 14, 0]);
  });

  it('la última baza suma 10 de últimas', () => {
    const e = jugar(conManos(['1o', '4o', '5o']), '1o', '4o', '5o');
    const r = e.resultadosManos[0]!;
    expect(r.tantos).toEqual([21, 0, 0]);
    expect(r.ultimas).toBe(0);
  });
});

describe('obligaciones', () => {
  it('asistir y montar', () => {
    expect([...cartasLegalesGanaPierde(c('1c 4c 5o'), enMesa([0, '11c']), null, 1)].sort()).toEqual(
      ordenadas('1c'),
    );
  });

  it('sin triunfo, sin el palo se echa cualquiera', () => {
    expect([...cartasLegalesGanaPierde(c('1o 4b'), enMesa([0, '11c']), null, 1)].sort()).toEqual(
      ordenadas('1o 4b'),
    );
  });

  it('con triunfo, sin el palo hay que fallar', () => {
    expect([...cartasLegalesGanaPierde(c('4o 1b'), enMesa([0, '11c']), 'oros', 1)].sort()).toEqual(
      ordenadas('4o'),
    );
  });

  it('sin poder superar el fallo, cualquiera', () => {
    expect(
      [...cartasLegalesGanaPierde(c('4o 1b'), enMesa([0, '11c'], [2, '3o']), 'oros', 1)].sort(),
    ).toEqual(ordenadas('4o 1b'));
  });

  it('sin compañeros: el asiento 0 también obliga a montar al 2', () => {
    expect([...cartasLegalesGanaPierde(c('1c 4c'), enMesa([0, '11c']), null, 2)].sort()).toEqual(
      ordenadas('1c'),
    );
  });
});

describe('triunfo y cantes', () => {
  it('el Rey y el Caballo de un palo en una baza: las cuarenta y nace el triunfo', () => {
    const e = jugar(conManos(['12e 4b', '11e 5b', '1e 6b']), '12e', '11e', '1e');
    expect(e.triunfo).toBe('espadas');
    expect(e.cantes).toEqual([{ asiento: 2, palo: 'espadas', puntos: 40 }]);
    expect(e.tantos).toEqual([0, 0, 4 + 3 + 11 + 40]);
    expect(e.ultimaBaza!.triunfo).toBeNull();
    expect(e.ultimaBaza!.cante).toEqual({ asiento: 2, palo: 'espadas', puntos: 40 });
  });

  it('con triunfo, otra pareja da las veinte', () => {
    const e = jugar(
      conManos(['12b 4c', '11b 5c', '4b 6c'], { triunfo: 'espadas' }),
      '12b',
      '11b',
      '4b',
    );
    expect(e.triunfo).toBe('espadas');
    expect(e.cantes).toEqual([{ asiento: 0, palo: 'bastos', puntos: 20 }]);
    expect(e.tantos[0]).toBe(4 + 3 + 20);
  });

  it('la baza en que nace el triunfo se juega sin él', () => {
    // El asiento 2 no tiene copas y echa un oro, pero aún no hay triunfo.
    const e = jugar(conManos(['12c 4b', '11c 5b', '12o 6b']), '12c', '11c', '12o');
    expect(e.ultimaBaza!.ganador).toBe(0);
    expect(e.triunfo).toBe('copas');
  });

  it('sin Rey y Caballo del mismo palo no hay cante', () => {
    expect(parejaEnBaza(enMesa([0, '12c'], [1, '11o'], [2, '1c']))).toBeNull();
    expect(parejaEnBaza(enMesa([0, '11o'], [1, '4o'], [2, '12o']))).toBe('oros');
  });
});

describe('penalización', () => {
  it('pierde el del medio', () => {
    expect(penalizadosGanaPierde([120, 0, 10])).toEqual([2]);
  });

  it('dos empatados abajo: pierde el de arriba', () => {
    expect(penalizadosGanaPierde([100, 15, 15])).toEqual([0]);
    expect(penalizadosGanaPierde([130, 0, 0])).toEqual([0]);
  });

  it('dos empatados arriba: pierden los dos', () => {
    expect(penalizadosGanaPierde([10, 60, 60])).toEqual([1, 2]);
  });

  it('los tres empatados: nadie', () => {
    expect(penalizadosGanaPierde([40, 40, 40])).toEqual([]);
  });

  it('la mano anota la penalización', () => {
    const e = jugar(conManos(['1o', '4o', '3b'], { tantos: [0, 0, 5] }), '1o', '4o', '3b');
    const r = e.resultadosManos[0]!;
    expect(r.tantos).toEqual([31, 0, 5]);
    expect(r.penalizados).toEqual([2]);
    expect(r.penalizacionesTras).toEqual([0, 0, 1]);
  });
});

describe('fin de la partida', () => {
  it('termina al llegar al límite y ganan los de menos penalizaciones', () => {
    const e = jugar(
      conManos(['1o', '4o', '3b'], { penalizaciones: [1, 0, 5], tantos: [0, 0, 5] }),
      '1o',
      '4o',
      '3b',
    );
    expect(e.penalizaciones).toEqual([1, 0, 6]);
    expect(tuteGanaPierde.resultado(e)).toEqual({
      ganadores: [1],
      empate: false,
      puntos: [-1, 0, -6],
    });
    expect(tuteGanaPierde.accionesLegales(e, e.turno)).toEqual([]);
    expect(tuteGanaPierde.vistaDe(e, 0).turno).toBeNull();
  });

  it('con límite 3, a las 3', () => {
    const e = jugar(
      conManos(['1o', '4o', '3b'], {
        config: { limite: 3 },
        penalizaciones: [0, 0, 2],
        tantos: [0, 0, 5],
      }),
      '1o',
      '4o',
      '3b',
    );
    expect(tuteGanaPierde.resultado(e)?.ganadores).toEqual([0, 1]);
  });
});

describe('vista', () => {
  it('ve su mano y solo cuántas cartas tienen los demás', () => {
    const e = nueva();
    const v = tuteGanaPierde.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([12, 12, 12]);
    expect(JSON.stringify(v)).not.toContain(e.manos[0]![0]!);
    expect(v.triunfo).toBeNull();
    expect(v.manoNumero).toBe(1);
  });
});

describirContrato(tuteGanaPierde, {
  configs: [CONFIG_TUTE_GANA_PIERDE_POR_DEFECTO, { limite: 3 }],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...e.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 3_000,
});
