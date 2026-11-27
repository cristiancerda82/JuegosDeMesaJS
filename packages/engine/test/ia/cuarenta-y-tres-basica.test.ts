import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCuarentaYTresBasica } from '../../src/ia/cuarenta-y-tres-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_CUARENTA_Y_TRES_POR_DEFECTO,
  cuarentaYTres,
  type AccionCuarentaYTres,
  type EstadoCuarentaYTres,
  type VistaCuarentaYTres,
} from '../../src/juegos/cuarenta-y-tres';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «12o» es el Rey de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;

/** Un estado con estas manos y esta muestra, que marca el triunfo. */
function con(manos: [string, string, string], muestra: string, turno = 0): EstadoCuarentaYTres {
  const r = cuarentaYTres.crear(CONFIG_CUARENTA_Y_TRES_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  const m = una(muestra);
  return {
    ...r.valor,
    manos: manos.map(c),
    muestra: m,
    triunfo: m.split('-')[0] as EstadoCuarentaYTres['triunfo'],
    turno,
  };
}

const decide = (e: EstadoCuarentaYTres) =>
  iaCuarentaYTresBasica.decidir(
    cuarentaYTres.vistaDe(e, e.turno),
    cuarentaYTres.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Cuarenta y tres', () => {
  it('cambia la muestra', () => {
    expect(decide(con(['7o 4b', '5b', '6b'], '1o'))).toEqual({ tipo: 'cambiarSiete' });
  });

  it('con 5 triunfos y el As, arrastra con el As', () => {
    expect(decide(con(['1o 5o 6o 7o 12o 4b', '5b', '6b'], '4o'))).toEqual({
      tipo: 'jugar',
      carta: una('1o'),
    });
  });

  it('con 5 triunfos sin el más alto que queda, arrastra con el más bajo', () => {
    expect(decide(con(['12o 5o 6o 7o 11o 4b', '5b', '6b'], '4o'))).toEqual({
      tipo: 'jugar',
      carta: una('5o'),
    });
  });

  it('con pocos triunfos sale con el As de otro palo para arañar tantos', () => {
    expect(decide(con(['1o 5o 1b 4b', '5b', '6b'], '4o'))).toEqual({
      tipo: 'jugar',
      carta: una('1b'),
    });
  });

  it('sin cartas que nadie pueda superar, sale con una carta baja que no es triunfo', () => {
    expect(decide(con(['12b 5o 4c', '5b', '6b'], '4o'))).toEqual({
      tipo: 'jugar',
      carta: una('4c'),
    });
  });

  it('jugando en medio, gana con el Tres, que ya nadie supera, antes que con el Caballo', () => {
    const e: EstadoCuarentaYTres = {
      ...con(['4b', '11c 3c 6b', '6c'], '4o', 1),
      bazasJugadas: [
        {
          cartas: [
            { asiento: 2, carta: una('1c') },
            { asiento: 0, carta: una('7c') },
            { asiento: 1, carta: una('2c') },
          ],
          ganador: 2,
        },
      ],
      mesa: [{ asiento: 0, carta: una('10c') }],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('3c') });
  });

  it('siendo el último, gana con la carta de más puntos', () => {
    const e: EstadoCuarentaYTres = {
      ...con(['4b', '5b', '1c 3c 4c'], '4o', 2),
      mesa: [
        { asiento: 0, carta: una('12c') },
        { asiento: 1, carta: una('11c') },
      ],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('1c') });
  });
});

describe('IA del Cuarenta y tres en partidas', () => {
  const azar = aleatorio<VistaCuarentaYTres, AccionCuarentaYTres>();

  it('partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      cuarentaYTres,
      { manos: 3 },
      iaCuarentaYTresBasica,
      IAS.cuarentaYTres.facil,
      30,
      unoContraTodos(3),
      'sim',
    );
    expect(r.partidas).toBe(30);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('hace más tantos que el azar', () => {
    let mios = 0;
    let suyos = 0;
    for (let i = 0; i < 40; i++) {
      const r = cuarentaYTres.crear({ manos: 3 }, `azar-${i}`);
      if (!r.ok) throw new Error(r.error);
      let e = r.valor;
      let az = crearAzar(`a${i}`);
      while (cuarentaYTres.resultado(e) === null) {
        const s = e.turno;
        const d = (s === i % 3 ? iaCuarentaYTresBasica : azar).decidir(
          cuarentaYTres.vistaDe(e, s),
          cuarentaYTres.accionesLegales(e, s),
          az,
        );
        az = d.azar;
        e = cuarentaYTres.transicion(e, s, d.accion);
      }
      const tantos = e.resultadosManos.map((m) => m.tantos);
      mios += tantos.reduce((x, t) => x + t[i % 3]!, 0);
      suyos += tantos.reduce((x, t) => x + t.reduce((a, b) => a + b, 0) - t[i % 3]!, 0);
    }
    // Por cada rival al azar, la IA hace claramente más tantos.
    expect(mios).toBeGreaterThan((suyos / 2) * 1.15);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      cuarentaYTres,
      { manos: 3 },
      IAS.cuarentaYTres.dificil,
      iaCuarentaYTresBasica,
      1,
      unoContraTodos(3),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
