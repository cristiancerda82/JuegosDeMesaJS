import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { descarteConquian, iaConquianBasica } from '../../src/ia/conquian-basica';
import { IAS } from '../../src/ia/ias';
import {
  CONFIG_CONQUIAN_POR_DEFECTO,
  conquian,
  type AccionConquian,
  type ConfigConquian,
  type EstadoConquian,
  type VistaConquian,
} from '../../src/juegos/conquian';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos. */
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

function base(): EstadoConquian {
  const r = conquian.crear(CONFIG_CONQUIAN_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const decide = (e: EstadoConquian) =>
  iaConquianBasica.decidir(
    conquian.vistaDe(e, e.turno),
    conquian.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Conquián', () => {
  it('usa la carta para bajar el grupo', () => {
    const e: EstadoConquian = {
      ...base(),
      manos: [c('5o 5c 2e Rc 7o Sb 4o 6c Ce 3b'), base().manos[1]!],
      descubierta: una('5b'),
      origen: 'mazo',
      deQuien: 0,
      ofrecidaA: 0,
      turno: 0,
      fase: 'decidir',
    };
    expect(decide(e)).toEqual({ tipo: 'bajar', cartas: c('5c 5o') });
  });

  it('descarta la carta suelta', () => {
    expect(descarteConquian(c('3c 4c 6o 6b Ro'), [])).toBe(una('Ro'));
  });

  it('no da cartas al rival', () => {
    expect(descarteConquian(c('6e 2o'), [c('3e 4e 5e')])).toBe(una('2o'));
    // Sin la escalera del rival, descartaría la más alta.
    expect(descarteConquian(c('6e 2o'), [])).toBe(una('6e'));
  });
});

describe('IA del Conquián en partidas', () => {
  const azar = aleatorio<VistaConquian, AccionConquian>();
  // Al mejor de 3, para que las partidas de las pruebas no sean tan largas.
  const corta: ConfigConquian = { manosParaGanar: 2 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      conquian,
      corta,
      iaConquianBasica,
      IAS.conquian.facil,
      100,
      unoContraTodos(2),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(conquian, corta, iaConquianBasica, azar, 200, unoContraTodos(2), 'azar');
    expect(r.ganadas).toBeGreaterThan(120);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      conquian,
      corta,
      IAS.conquian.dificil,
      iaConquianBasica,
      1,
      unoContraTodos(2),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
