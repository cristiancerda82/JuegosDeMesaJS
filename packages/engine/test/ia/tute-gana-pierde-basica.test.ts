import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaTuteGanaPierdeBasica, objetivoGanaPierde } from '../../src/ia/tute-gana-pierde-basica';
import {
  CONFIG_TUTE_GANA_PIERDE_POR_DEFECTO,
  tuteGanaPierde,
  type AccionTuteGanaPierde,
  type EstadoTuteGanaPierde,
  type VistaTuteGanaPierde,
} from '../../src/juegos/tute-gana-pierde';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «12o» es el Rey de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}
const una = (t: string) => c(t)[0]!;

function base(): EstadoTuteGanaPierde {
  const r = tuteGanaPierde.crear(CONFIG_TUTE_GANA_PIERDE_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoTuteGanaPierde) =>
  iaTuteGanaPierdeBasica.decidir(
    tuteGanaPierde.vistaDe(e, e.turno),
    tuteGanaPierde.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Tute gana-pierde', () => {
  it('a por el mínimo, carga el Tres sin ganar la baza', () => {
    const e: EstadoTuteGanaPierde = {
      ...base(),
      turno: 2,
      mesa: [
        { asiento: 0, carta: una('12c') },
        { asiento: 1, carta: una('1c') },
      ],
      manos: [c('4b'), c('5b'), c('3c 4c 6b')],
    };
    expect(objetivoGanaPierde(tuteGanaPierde.vistaDe(e, 2))).toBe('minimo');
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('3c') });
  });

  it('a por el mínimo, no sale con un Rey', () => {
    const e: EstadoTuteGanaPierde = { ...base(), turno: 0, manos: [c('12o 5b'), c('4b'), c('6b')] };
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('5b') });
  });

  it('obligado a ganar la baza siendo el último, no completa el Rey y el Caballo', () => {
    const e: EstadoTuteGanaPierde = {
      ...base(),
      turno: 2,
      mesa: [
        { asiento: 0, carta: una('12e') },
        { asiento: 1, carta: una('4e') },
      ],
      manos: [c('4b'), c('5b'), c('11e 3e')],
    };
    // Con el Caballo serían 40 de las cuarenta; con el Tres, solo sus 10.
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('3e') });
  });

  it('con muchos más tantos que los demás va a por el máximo y gana la baza', () => {
    const e: EstadoTuteGanaPierde = {
      ...base(),
      turno: 2,
      tantos: [5, 0, 70],
      mesa: [
        { asiento: 0, carta: una('12c') },
        { asiento: 1, carta: una('4c') },
      ],
      manos: [c('4b'), c('5b'), c('1c 5c')],
    };
    expect(objetivoGanaPierde(tuteGanaPierde.vistaDe(e, 2))).toBe('maximo');
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: una('1c') });
  });
});

describe('IA del Tute gana-pierde en partidas', () => {
  const azar = aleatorio<VistaTuteGanaPierde, AccionTuteGanaPierde>();

  it('partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      tuteGanaPierde,
      CONFIG_TUTE_GANA_PIERDE_POR_DEFECTO,
      iaTuteGanaPierdeBasica,
      IAS.tuteGanaPierde.facil,
      30,
      unoContraTodos(3),
      'sim',
    );
    expect(r.partidas).toBe(30);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('se queda en medio menos que el azar', () => {
    let mias = 0;
    let suyas = 0;
    for (let i = 0; i < 60; i++) {
      const r = tuteGanaPierde.crear({ limite: 3 }, `azar-${i}`);
      if (!r.ok) throw new Error(r.error);
      let e = r.valor;
      let az = crearAzar(`a${i}`);
      while (tuteGanaPierde.resultado(e) === null) {
        const s = e.turno;
        const acciones = tuteGanaPierde.accionesLegales(e, s);
        const d = (s === i % 3 ? iaTuteGanaPierdeBasica : azar).decidir(
          tuteGanaPierde.vistaDe(e, s),
          acciones,
          az,
        );
        az = d.azar;
        e = tuteGanaPierde.transicion(e, s, d.accion);
      }
      mias += e.penalizaciones[i % 3]!;
      suyas += e.penalizaciones.reduce((x, p) => x + p, 0) - e.penalizaciones[i % 3]!;
    }
    // Por cada rival al azar, la IA se lleva claramente menos penalizaciones.
    expect(mias).toBeLessThan((suyas / 2) * 0.8);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      tuteGanaPierde,
      { limite: 3 },
      IAS.tuteGanaPierde.dificil,
      iaTuteGanaPierdeBasica,
      1,
      unoContraTodos(3),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
