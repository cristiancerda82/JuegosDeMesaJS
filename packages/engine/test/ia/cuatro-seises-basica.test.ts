import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { iaCuatroSeisesBasica } from '../../src/ia/cuatro-seises-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_CUATRO_SEISES_POR_DEFECTO,
  cuatroSeises,
  type AccionCuatroSeises,
  type EstadoCuatroSeises,
  type VistaCuatroSeises,
} from '../../src/juegos/cuatro-seises';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «12o» es el Rey de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}

function base(): EstadoCuatroSeises {
  const r = cuatroSeises.crear(CONFIG_CUATRO_SEISES_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoCuatroSeises) =>
  iaCuatroSeisesBasica.decidir(
    cuatroSeises.vistaDe(e, e.turno),
    cuatroSeises.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Cuatro seises', () => {
  it('guarda el 6 que bloquea y juega la carta que acerca las suyas', () => {
    const e: EstadoCuatroSeises = {
      ...base(),
      turno: 0,
      // En la mesa, el 6 de oros: el 5 de oros acerca el 4, y el 6 de copas no acerca nada.
      mesa: { oros: { bajo: 5, alto: 5 }, copas: null, espadas: null, bastos: null },
      manos: [c('6c 5o 4o 1b'), c('2b'), c('3b'), c('4b')],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'oros-5' });
  });

  it('suelta el 6 cuando le abre camino a sus cartas', () => {
    const e: EstadoCuatroSeises = {
      ...base(),
      turno: 0,
      mesa: { oros: { bajo: 5, alto: 5 }, copas: null, espadas: null, bastos: null },
      manos: [c('6c 5c 4c 7o'), c('2b'), c('3b'), c('4b')],
    };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: 'copas-6' });
  });

  it('sin jugada, pasa', () => {
    const e: EstadoCuatroSeises = {
      ...base(),
      turno: 0,
      mesa: { oros: { bajo: 5, alto: 5 }, copas: null, espadas: null, bastos: null },
      manos: [c('1c 3b'), c('2b'), c('5b'), c('4b')],
    };
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });
});

describe('IA del Cuatro seises en partidas', () => {
  const azar = aleatorio<VistaCuatroSeises, AccionCuatroSeises>();

  it('partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      cuatroSeises,
      { baraja: 48, jugadores: 6, manos: 1 },
      iaCuatroSeisesBasica,
      IAS.cuatroSeises.facil,
      20,
      unoContraTodos(6),
      'sim',
    );
    expect(r.partidas).toBe(20);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana más fichas que el azar', () => {
    let mias = 0;
    for (let i = 0; i < 80; i++) {
      const r = cuatroSeises.crear({ baraja: 40, jugadores: 4, manos: 3 }, `azar-${i}`);
      if (!r.ok) throw new Error(r.error);
      let e = r.valor;
      let az = crearAzar(`a${i}`);
      while (cuatroSeises.resultado(e) === null) {
        const s = e.turno;
        const d = (s === i % 4 ? iaCuatroSeisesBasica : azar).decidir(
          cuatroSeises.vistaDe(e, s),
          cuatroSeises.accionesLegales(e, s),
          az,
        );
        az = d.azar;
        e = cuatroSeises.transicion(e, s, d.accion);
      }
      mias += e.saldos[i % 4]!;
    }
    // Los saldos suman 0: con fichas de sobra, la IA gana lo que pierden los demás.
    expect(mias).toBeGreaterThan(80);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      cuatroSeises,
      { baraja: 40, jugadores: 4, manos: 1 },
      IAS.cuatroSeises.dificil,
      iaCuatroSeisesBasica,
      1,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
