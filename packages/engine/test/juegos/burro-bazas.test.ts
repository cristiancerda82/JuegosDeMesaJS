import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  barajaBurroBazas,
  burroBazas,
  CONFIG_BURRO_BAZAS_POR_DEFECTO,
  ganadoraBurroBazas,
  type AccionBurroBazas,
  type ConfigBurroBazas,
  type EstadoBurroBazas,
} from '../../src/juegos/burro-bazas';
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

function nueva(config: Partial<ConfigBurroBazas> = {}, semilla = 'burro'): EstadoBurroBazas {
  const r = burroBazas.crear({ ...CONFIG_BURRO_BAZAS_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoBurroBazas, accion: AccionBurroBazas): EstadoBurroBazas {
  const r = aplicar(burroBazas, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Juega cartas en orden; «robar» y «pasar» son esas acciones. */
const jugar = (e: EstadoBurroBazas, ...jugadas: string[]) =>
  jugadas.reduce(
    (x, t) =>
      hacer(x, t === 'robar' || t === 'pasar' ? { tipo: t } : { tipo: 'jugar', carta: una(t) }),
    e,
  );

/** Una mano a mitad con estas manos (en orden de asiento) y este mazo; sale el asiento 0. */
function enJuego(
  manos: string[],
  mazo = '',
  parcial: Partial<EstadoBurroBazas> = {},
): EstadoBurroBazas {
  return {
    ...nueva({ jugadores: manos.length as ConfigBurroBazas['jugadores'] }),
    turno: 0,
    salida: 0,
    manos: manos.map(c),
    mazo: c(mazo),
    ...parcial,
  };
}

const legales = (e: EstadoBurroBazas) => burroBazas.accionesLegales(e, e.turno);

describe('baraja y reparto', () => {
  it('48 cartas españolas; 4 a cada uno y el resto en el mazo; sale el siguiente al que reparte', () => {
    expect(barajaBurroBazas()).toHaveLength(48);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([4, 4, 4, 4]);
    expect(e.mazo).toHaveLength(32);
    expect(new Set([...e.manos.flat(), ...e.mazo]).size).toBe(48);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
    expect(e.salida).toBe(1);
  });

  it('con 6 jugadores quedan 24 cartas en el mazo', () => {
    const e = nueva({ jugadores: 6 });
    expect(e.manos.map((m) => m.length)).toEqual([4, 4, 4, 4, 4, 4]);
    expect(e.mazo).toHaveLength(24);
  });

  it('rechaza 2 o 7 jugadores y límites que no son 3 o 5', () => {
    for (const jugadores of [2, 7]) {
      const r = burroBazas.crear({ ...CONFIG_BURRO_BAZAS_POR_DEFECTO, jugadores } as never, 'x');
      expect(r.ok).toBe(false);
    }
    const r = burroBazas.crear({ jugadores: 4, limite: 4 } as never, 'x');
    expect(r.ok).toBe(false);
  });
});

describe('bazas', () => {
  it('sin triunfo, gana la más alta del palo de salida; el As es la más baja', () => {
    expect(ganadoraBurroBazas(enMesa([0, '1o'], [1, '2o'], [2, '12o'], [3, '9o'])).asiento).toBe(2);
    expect(ganadoraBurroBazas(enMesa([0, '3c'], [1, '1c'])).asiento).toBe(0);
  });

  it('quien sale echa cualquier carta, y quien tiene el palo tiene que seguirlo', () => {
    const e = enJuego(['3o 5c', '7o 12o 2e', '4b', '1e']);
    expect(legales(e)).toHaveLength(2);
    const tras = jugar(e, '3o');
    expect(legales(tras)).toEqual([
      { tipo: 'jugar', carta: 'oros-12' },
      { tipo: 'jugar', carta: 'oros-7' },
    ]);
  });

  it('no hay que montar: se puede echar una carta más baja del palo', () => {
    const e = jugar(enJuego(['9o 5c', '7o 12o', '4b 1b', '1e 2e'], '3o 8c'), '9o', '7o');
    expect(e.mesa).toEqual(enMesa([0, '9o'], [1, '7o']));
  });

  it('sin el palo, roba hasta sacar una carta de ese palo y la juega', () => {
    const e = jugar(enJuego(['9o 5c', '7o 12o', '4b 1b', '1e 2e'], '3c 8e 2o 6b'), '9o', '7o');
    expect(legales(e)).toEqual([{ tipo: 'robar' }]);
    const tras = hacer(e, { tipo: 'robar' });
    expect(tras.manos[2]).toEqual(c('4b 1b 3c 8e'));
    expect(tras.mazo).toEqual(c('6b'));
    expect(tras.mesa).toEqual(enMesa([0, '9o'], [1, '7o'], [2, '2o']));
    expect(tras.robadas).toEqual([0, 0, 3, 0]);
    expect(tras.turno).toBe(3);
  });

  it('si el mazo se acaba sin sacar el palo, se queda las robadas y pasa', () => {
    const e = jugar(enJuego(['9o 5c', '7o 12o', '4b 1b', '1e 2e'], '3c 8e'), '9o', '7o', 'robar');
    expect(e.manos[2]).toEqual(c('4b 1b 3c 8e'));
    expect(e.mazo).toEqual([]);
    expect(e.pasaron).toEqual([2]);
    expect(legales(e)).toEqual([{ tipo: 'pasar' }]);
  });

  it('sin el palo y sin mazo, pasa sin echar carta', () => {
    const e = jugar(enJuego(['9o 5c', '7o 12o', '4b 1b', '1e 2e']), '9o', '7o');
    expect(legales(e)).toEqual([{ tipo: 'pasar' }]);
    const tras = jugar(e, 'pasar', 'pasar');
    // Gana el 9 de oros y vuelve a salir el asiento 0.
    expect(tras.ultimaBaza).toEqual({
      cartas: enMesa([0, '9o'], [1, '7o']),
      ganador: 0,
      pasaron: [2, 3],
      robadas: [0, 0, 0, 0],
    });
    expect(tras.turno).toBe(0);
    expect(tras.manos.map((m) => m.length)).toEqual([1, 1, 2, 2]);
  });

  it('quien gana la baza sale en la siguiente', () => {
    const e = jugar(enJuego(['9o 5c', '12o 3e', '4o 1b', '1o 2e'], '6c'), '9o', '12o', '4o', '1o');
    expect(e.ultimaBaza?.ganador).toBe(1);
    expect(e.turno).toBe(1);
    expect(e.salida).toBe(1);
    expect(e.bazas).toEqual([0, 1, 0, 0]);
  });

  it('si quien gana se queda sin cartas, sale el siguiente que tiene', () => {
    const e = jugar(enJuego(['9o 5c', '12o', '4o 1b', '1o 2e'], '6c'), '9o', '12o', '4o', '1o');
    expect(e.salieron).toEqual([1]);
    expect(e.turno).toBe(2);
  });

  it('quien se queda sin cartas ya no juega', () => {
    const e = jugar(enJuego(['9o 5c', '12o', '4o 1b', '1o 2e'], '6c'), '9o', '12o', '4o', '1o');
    const tras = jugar(e, '1b');
    // El 1 no juega: después del 2 va el 3, que no tiene bastos y roba.
    expect(tras.turno).toBe(3);
  });
});

describe('lo que se sabe de los palos', () => {
  it('quien roba solo la carta del palo sigue sin tener los palos que ya se sabían', () => {
    const e = jugar(
      enJuego(['9o 5c', '7o 12o', '4b 1b', '1e 2e'], '2o 8e', {
        sinPalo: [[], [], ['copas'], []],
      }),
      '9o',
      '7o',
      'robar',
    );
    expect(e.sinPalo[2]).toEqual(['copas', 'oros']);
  });

  it('quien roba otras cartas antes ya no se sabe qué palos tiene, salvo el de salida', () => {
    const e = jugar(
      enJuego(['9o 5c', '7o 12o', '4b 1b', '1e 2e'], '3c 2o 8e', {
        sinPalo: [[], [], ['copas'], []],
      }),
      '9o',
      '7o',
      'robar',
    );
    expect(e.sinPalo[2]).toEqual(['oros']);
  });

  it('quien pasa sin mazo no tiene el palo de salida', () => {
    const e = jugar(enJuego(['9o 5c', '7o 12o', '4b 1b', '1e 2e']), '9o', '7o', 'pasar');
    expect(e.sinPalo[2]).toEqual(['oros']);
  });
});

describe('fin de la mano', () => {
  it('el último que se queda con cartas es el burro y suma una penalización', () => {
    // El 0 sale con su última carta; el 1 tampoco tiene más y el 2 se queda con dos.
    const e = jugar(enJuego(['9o', '7o', '4b 1b']), '9o', '7o', 'pasar');
    expect(e.resultadosManos).toEqual([
      { burro: 2, orden: [0, 1], cartasBurro: 2, penalizacionesTras: [0, 0, 1] },
    ]);
    expect(e.penalizaciones).toEqual([0, 0, 1]);
    // Empieza otra mano: reparte el 1 y sale el 2.
    expect(e.repartidor).toBe(1);
    expect(e.turno).toBe(2);
    expect(e.manos.map((m) => m.length)).toEqual([4, 4, 4]);
  });

  it('si los últimos se quedan sin cartas en la misma baza, no hay burro', () => {
    const e = jugar(enJuego(['9o', '7o', '4o']), '9o', '7o', '4o');
    expect(e.resultadosManos.at(-1)).toEqual({
      burro: null,
      orden: [0, 1, 2],
      cartasBurro: 0,
      penalizacionesTras: [0, 0, 0],
    });
  });

  it('la mano sigue aunque alguien se quede sin cartas', () => {
    const e = jugar(enJuego(['9o', '7o 5c', '4o 3c', '1e']), '9o', '7o', '4o', 'pasar');
    expect(e.resultadosManos).toEqual([]);
    expect(e.salieron).toEqual([0]);
    expect(e.turno).toBe(1);
  });
});

describe('fin de la partida', () => {
  it('termina cuando alguien llega al límite y ganan los que tienen menos penalizaciones', () => {
    const e = jugar(
      enJuego(['9o', '7o', '4b 1b'], '', { penalizaciones: [1, 0, 2] }),
      '9o',
      '7o',
      'pasar',
    );
    expect(e.penalizaciones).toEqual([1, 0, 3]);
    expect(burroBazas.resultado(e)).toEqual({ ganadores: [1], empate: false, puntos: [-1, 0, -3] });
    expect(burroBazas.accionesLegales(e, e.turno)).toEqual([]);
    expect(burroBazas.vistaDe(e, 0).turno).toBeNull();
  });

  it('con el límite en 5, sigue hasta las 5 penalizaciones', () => {
    const e = jugar(
      enJuego(['9o', '7o', '4b 1b'], '', { penalizaciones: [1, 0, 2] }),
      '9o',
      '7o',
      'pasar',
    );
    const cinco = jugar(
      {
        ...enJuego(['9o', '7o', '4b 1b'], '', { penalizaciones: [1, 0, 2] }),
        config: { jugadores: 3, limite: 5 },
      },
      '9o',
      '7o',
      'pasar',
    );
    expect(burroBazas.resultado(e)).not.toBeNull();
    expect(burroBazas.resultado(cinco)).toBeNull();
  });

  it('partidas completas de 3 a 6 jugadores', () => {
    for (const jugadores of [3, 4, 5, 6] as const) {
      for (const limite of [3, 5] as const) {
        let e = nueva({ jugadores, limite }, `completa-${jugadores}-${limite}`);
        while (burroBazas.resultado(e) === null) {
          e = hacer(e, legales(e).at(-1)!);
        }
        expect(Math.max(...e.penalizaciones)).toBe(limite);
        const burros = e.resultadosManos.filter((r) => r.burro !== null).length;
        expect(e.penalizaciones.reduce((s, p) => s + p, 0)).toBe(burros);
      }
    }
  });
});

describe('vista', () => {
  it('enseña la mano propia, cuántas tienen los demás y cuántas quedan en el mazo, no cuáles', () => {
    const e = nueva();
    const v = burroBazas.vistaDe(e, 2);
    expect(v.miMano).toEqual(e.manos[2]);
    expect(v.cartasEnMano).toEqual([4, 4, 4, 4]);
    expect(v.mazo).toBe(32);
    expect(JSON.stringify(v)).not.toContain(e.manos[0]![0]);
    expect(JSON.stringify(v)).not.toContain(e.mazo[0]);
    expect(burroBazas.vistaDe(e, null).miMano).toBeNull();
  });
});

describirContrato(burroBazas, {
  configs: [
    CONFIG_BURRO_BAZAS_POR_DEFECTO,
    { jugadores: 3, limite: 5 },
    { jugadores: 6, limite: 3 },
  ],
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.mazo].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 2_000,
});
