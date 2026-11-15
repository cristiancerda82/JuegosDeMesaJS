import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  casitaRobada,
  CONFIG_CASITA_ROBADA_POR_DEFECTO,
  type AccionCasitaRobada,
  type ConfigCasitaRobada,
  type EstadoCasitaRobada,
} from '../../src/juegos/casita-robada';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «5o» es el 5 de oros; c, e y b, copas, espadas y bastos; S, C y R, sota, caballo y rey. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const una = (t: string) => c(t)[0]!;

function nueva(config: Partial<ConfigCasitaRobada> = {}, semilla = 'casita'): EstadoCasitaRobada {
  const r = casitaRobada.crear({ ...CONFIG_CASITA_ROBADA_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoCasitaRobada, accion: AccionCasitaRobada): EstadoCasitaRobada {
  const r = aplicar(casitaRobada, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const jugar = (carta: string, robar: number | null = null): AccionCasitaRobada => ({
  tipo: 'jugar',
  carta: una(carta),
  robar,
});

/** Un estado a mano: mesa, manos y casitas en notación corta. */
function con(
  mesa: string,
  manos: string[],
  casitas: string[] = manos.map(() => ''),
  parcial: Partial<EstadoCasitaRobada> = {},
): EstadoCasitaRobada {
  return {
    ...nueva({ jugadores: manos.length as 2 | 3 | 4 }),
    mesa: c(mesa),
    manos: manos.map(c),
    casitas: casitas.map(c),
    turno: 0,
    ...parcial,
  };
}

describe('baraja y reparto', () => {
  it('con 3: 4 en la mesa, 3 a cada uno y 27 en el mazo; empieza el 0', () => {
    const e = nueva({ jugadores: 3 });
    expect(e.mesa).toHaveLength(4);
    expect(e.manos.map((m) => m.length)).toEqual([3, 3, 3]);
    expect(e.mazo).toHaveLength(27);
    expect(e.turno).toBe(0);
    expect(new Set([...e.mesa, ...e.manos.flat(), ...e.mazo]).size).toBe(40);
  });

  it('rechaza 1 o 5 jugadores', () => {
    for (const jugadores of [1, 5]) {
      expect(casitaRobada.crear({ jugadores } as never, 'x').ok).toBe(false);
    }
  });

  it('cuando todos se quedan sin cartas, se reparten otras 3', () => {
    const e = hacer(con('7o', ['', '2c'], ['', ''], { turno: 1, mazo: nueva().mazo }), jugar('2c'));
    expect(e.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(e.turno).toBe(0);
  });
});

describe('jugar, capturar y robar', () => {
  it('se lleva todas las de la mesa de su número, con la suya arriba', () => {
    const e = hacer(con('5o 5c 7b', ['5e 2o', '3c']), jugar('5e'));
    expect(e.casitas[0]).toEqual(c('5o 5c 5e'));
    expect(e.mesa).toEqual(c('7b'));
    expect(e.ultimaJugada).toMatchObject({ asiento: 0, deLaMesa: c('5o 5c'), robo: null });
  });

  it('roba la casita de un rival con su número arriba', () => {
    const e0 = con('2b', ['Ro 3c', '4e'], ['', 'Ab 2o 3e 4o 6c Rc']);
    expect(casitaRobada.accionesLegales(e0, 0)).toContainEqual(jugar('Ro', 1));
    const e = hacer(e0, jugar('Ro', 1));
    expect(e.casitas[0]).toEqual(c('Ab 2o 3e 4o 6c Rc Ro'));
    expect(e.casitas[1]).toEqual([]);
    expect(e.ultimaJugada!.robo).toEqual({ a: 1, cartas: 6 });
  });

  it('robar es opcional', () => {
    const e = hacer(con('2b', ['Ro 3c', '4e'], ['', 'Rc']), jugar('Ro'));
    expect(e.casitas[1]).toEqual(c('Rc'));
    expect(e.mesa).toEqual(c('2b Ro'));
  });

  it('sin nada que llevarse, la carta se queda en la mesa', () => {
    const e = hacer(con('2b', ['7o 3c', '4e'], ['Sb', 'Rc']), jugar('7o'));
    expect(e.mesa).toEqual(c('2b 7o'));
    expect(e.casitas).toEqual([c('Sb'), c('Rc')]);
  });

  it('no se puede robar la propia casita', () => {
    const e = con('2b', ['Ro 3c', '4e'], ['Rc', '']);
    expect(casitaRobada.accionesLegales(e, 0).every((a) => a.robar === null)).toBe(true);
  });
});

describe('fin', () => {
  it('las de la mesa, para el último que se llevó cartas, y gana quien más tiene', () => {
    const e = hacer(
      con('7b 2o', ['', '4e'], ['5o 5c 5e', 'Ab'], { turno: 1, mazo: [], ultimoEnLlevarse: 1 }),
      jugar('4e'),
    );
    expect(e.final).toEqual({ para: 1, cartas: 3 });
    expect(e.mesa).toEqual([]);
    expect(e.casitas[1]).toHaveLength(4);
    expect(casitaRobada.resultado(e)).toEqual({ ganadores: [1], empate: false, puntos: [3, 4] });
  });

  it('partidas completas de 2 a 4 jugadores reparten las 40 cartas', () => {
    for (const jugadores of [2, 3, 4] as const) {
      let e = nueva({ jugadores }, `completa-${jugadores}`);
      while (casitaRobada.resultado(e) === null) {
        e = hacer(e, casitaRobada.accionesLegales(e, e.turno).at(-1)!);
      }
      expect(e.casitas.flat().length + e.mesa.length).toBe(40);
      expect(casitaRobada.accionesLegales(e, e.turno)).toEqual([]);
    }
  });
});

describirContrato(casitaRobada, {
  configs: [CONFIG_CASITA_ROBADA_POR_DEFECTO, { jugadores: 3 }, { jugadores: 4 }],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
});
