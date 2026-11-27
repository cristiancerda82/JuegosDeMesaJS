import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { encajaEnMesa, ORDEN_CINQUILLO } from '../../src/juegos/cinquillo';
import {
  CONFIG_CUATRO_SEISES_POR_DEFECTO,
  cuatroSeises,
  encajaCuatroSeises,
  ordenCuatroSeises,
  type ConfigCuatroSeises,
  type EstadoCuatroSeises,
} from '../../src/juegos/cuatro-seises';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «12o» es el Rey de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;

function nueva(
  config: Partial<ConfigCuatroSeises> = {},
  semilla = 'cuatro-seises',
): EstadoCuatroSeises {
  const r = cuatroSeises.crear({ ...CONFIG_CUATRO_SEISES_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Un estado de 4 con estas manos, la mesa vacía, saliendo el asiento 0. */
const conManos = (
  manos: [string, string, string, string],
  extra: Partial<EstadoCuatroSeises> = {},
): EstadoCuatroSeises => ({ ...nueva(), manos: manos.map(c), turno: 0, ...extra });

const accion = (e: EstadoCuatroSeises, t: string | null) => {
  const r = aplicar(
    cuatroSeises,
    e,
    e.turno,
    t === null ? { tipo: 'pasar' } : { tipo: 'jugar', carta: una(t) },
  );
  if (!r.ok) throw new Error(`${t} de ${e.turno}: ${r.error}`);
  return r.valor;
};
/** Juega en orden: una carta, o `null` para pasar. */
const jugar = (e: EstadoCuatroSeises, ...pasos: (string | null)[]) => pasos.reduce(accion, e);

const legales = (e: EstadoCuatroSeises) =>
  cuatroSeises
    .accionesLegales(e, e.turno)
    .map((a) => (a.tipo === 'jugar' ? a.carta : 'pasar'))
    .sort();

describe('barajas, jugadores y reparto', () => {
  it('con 4 y la baraja de 40, 10 cartas cada uno; empieza quien tiene el 6 de oros', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
    expect(new Set(e.manos.flat()).size).toBe(40);
    expect(e.manos[e.turno]).toContain('oros-6');
    expect(e.fondo).toBe(4);
  });

  it('con 6 y la baraja de 48, 8 cartas cada uno, con los ochos y los nueves', () => {
    const e = nueva({ baraja: 48, jugadores: 6 });
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8, 8, 8]);
    expect(e.manos.flat()).toContain('copas-8');
    expect(e.manos.flat()).toContain('copas-9');
    expect(e.fondo).toBe(6);
  });

  it('con 8 y la de 40, 5 cartas cada uno', () => {
    expect(nueva({ jugadores: 8 }).manos.map((m) => m.length)).toEqual(new Array(8).fill(5));
  });

  it('rechaza jugadores que no dividen la baraja', () => {
    expect(cuatroSeises.crear({ baraja: 40, jugadores: 6, manos: 3 }, 'x').ok).toBe(false);
    expect(cuatroSeises.crear({ baraja: 48, jugadores: 5, manos: 3 }, 'x').ok).toBe(false);
    expect(cuatroSeises.crear({ baraja: 40, jugadores: 4, manos: 2 } as never, 'x').ok).toBe(false);
  });
});

describe('jugadas y escaleras', () => {
  it('abre el 6 de oros: es la única jugada', () => {
    const e = conManos(['6o 5o 6c', '7o', '4b', '5b']);
    expect(legales(e)).toEqual(['oros-6']);
  });

  it('se alarga una escalera o se abre otro palo con su 6', () => {
    const e = jugar(conManos(['6o 1b', '5o 7o 6c 3b', '4b', '5b']), '6o');
    expect(legales(e)).toEqual(['copas-6', 'oros-5', 'oros-7'].sort());
  });

  it('sin jugada, solo se pasa', () => {
    const e = jugar(conManos(['6o 1b', '1c 3b', '4b', '5b']), '6o');
    expect(legales(e)).toEqual(['pasar']);
  });

  it('con la de 48, tras el 7 va el 8; con la de 40, la Sota', () => {
    const mesa = { oros: { bajo: 5, alto: 6 }, copas: null, espadas: null, bastos: null };
    expect(encajaCuatroSeises(mesa, 'oros-8', 48)).toBe(true);
    expect(encajaCuatroSeises(mesa, 'oros-10', 48)).toBe(false);
    expect(encajaCuatroSeises(mesa, 'oros-10', 40)).toBe(true);
    expect(ordenCuatroSeises(48)).toHaveLength(12);
  });

  it('el Cinquillo sigue naciendo del 5', () => {
    const vacia = { oros: null, copas: null, espadas: null, bastos: null };
    expect(encajaEnMesa(vacia, 'oros-5')).toBe(true);
    expect(encajaEnMesa(vacia, 'oros-6')).toBe(false);
    expect(ORDEN_CINQUILLO).toEqual(ordenCuatroSeises(40));
  });
});

describe('el fondo', () => {
  it('cada pase pone una ficha', () => {
    const e = jugar(conManos(['6o 1b', '1c 3b', '4b', '5b']), '6o', null);
    expect(e.fondo).toBe(5);
    expect(e.pases).toEqual([0, 1, 0, 0]);
    expect(e.ultimaAccion).toEqual({ asiento: 1, tipo: 'pasar' });
  });

  it('el ganador se lleva el fondo: la cuenta del libro con 2, 0 y 3 pases', () => {
    const e = jugar(
      conManos(['6o', '1c', '4b', '5b'], { pases: [0, 2, 0, 3], fondo: 9, saldos: [1, 0, 0, -1] }),
      '6o',
    );
    const r = e.resultadosManos[0]!;
    expect(r.ganador).toBe(0);
    expect(r.fondo).toBe(9);
    expect(r.fichas).toEqual([8, -3, -1, -4]);
    expect(r.saldosTras).toEqual([9, -3, -1, -5]);
    expect(r.fichas.reduce((s, f) => s + f, 0)).toBe(0);
  });

  it('la mano siguiente vuelve a poner una ficha cada uno', () => {
    const e = jugar(conManos(['6o', '1c', '4b', '5b']), '6o');
    expect(e.fondo).toBe(4);
    expect(e.pases).toEqual([0, 0, 0, 0]);
    expect(e.repartidor).toBe(0);
    expect(e.manos[e.turno]).toContain('oros-6');
  });
});

describe('fin de la partida', () => {
  it('tras la última mano ganan los de más fichas', () => {
    const e = jugar(
      conManos(['6o', '1c', '4b', '5b'], {
        config: { ...CONFIG_CUATRO_SEISES_POR_DEFECTO, manos: 1 },
      }),
      '6o',
    );
    expect(cuatroSeises.resultado(e)).toEqual({
      ganadores: [0],
      empate: false,
      puntos: [3, -1, -1, -1],
    });
    expect(cuatroSeises.accionesLegales(e, e.turno)).toEqual([]);
    expect(cuatroSeises.vistaDe(e, 0).turno).toBeNull();
  });

  it('una partida de 3 juega 3 manos y los saldos suman 0', () => {
    let e = nueva({ jugadores: 5 });
    while (cuatroSeises.resultado(e) === null) {
      e = cuatroSeises.transicion(e, e.turno, cuatroSeises.accionesLegales(e, e.turno)[0]!);
    }
    expect(e.resultadosManos).toHaveLength(3);
    expect(e.saldos.reduce((s, x) => s + x, 0)).toBe(0);
  });
});

describe('vista', () => {
  it('ve su mano, la mesa y el fondo, y solo cuántas cartas tienen los demás', () => {
    const e = nueva();
    const v = cuatroSeises.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    expect(v.fondo).toBe(4);
    expect(JSON.stringify(v)).not.toContain(`"${e.manos[0]![0]!}"`);
    expect(v.manoNumero).toBe(1);
  });
});

describirContrato(cuatroSeises, {
  configs: [
    CONFIG_CUATRO_SEISES_POR_DEFECTO,
    { baraja: 48, jugadores: 6, manos: 1 },
    { baraja: 40, jugadores: 8, manos: 1 },
    { baraja: 48, jugadores: 4, manos: 1 },
  ],
  cartasOcultas: (e, asiento) => {
    // La última carta jugada y las que alguien no tiene se nombran sin decir dónde están.
    const nombradas = new Set<string>([
      ...(e.ultimaAccion?.tipo === 'jugar' ? [e.ultimaAccion.carta] : []),
      ...e.noTiene.flat(),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !nombradas.has(x));
  },
  pasosMaximos: 3_000,
});

describe('lo que se sabe al pasar', () => {
  it('quien pasa no tiene ninguna de las cartas que encajaban', () => {
    const e = jugar(conManos(['6o 1b', '1c 3b', '4b', '5b']), '6o', null);
    expect([...e.noTiene[1]!].sort()).toEqual(
      ['oros-5', 'oros-7', 'copas-6', 'espadas-6', 'bastos-6'].sort(),
    );
    expect(e.noTiene[0]).toEqual([]);
  });
});
