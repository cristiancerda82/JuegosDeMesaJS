import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio } from '../../src/ia/agente';
import { IAS } from '../../src/ia/ias';
import { iaSchafkopfBasica } from '../../src/ia/schafkopf-basica';
import {
  CONFIG_SCHAFKOPF_POR_DEFECTO,
  schafkopf,
  type AccionSchafkopf,
  type ConfigSchafkopf,
  type ContratoSchafkopf,
  type EstadoSchafkopf,
  type VistaSchafkopf,
} from '../../src/juegos/schafkopf';
import { duelo, unoContraTodos } from './duelo';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return texto.split(' ').map((t) => {
    const v = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[v] ?? Number(v)}` as IdCarta;
  });
}
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: c(t)[0]! }));

function base(): EstadoSchafkopf {
  const r = schafkopf.crear(CONFIG_SCHAFKOPF_POR_DEFECTO, 'ia');
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Una mano en las bazas con el contrato y el turno dados. */
function enBazas(
  contrato: ContratoSchafkopf,
  turno: number,
  mano: string,
  mesa: ReturnType<typeof enMesa>,
): EstadoSchafkopf {
  const manos = [c(''), c(''), c(''), c('')];
  manos[turno] = c(mano);
  return { ...base(), manos, fase: 'bazas', contrato, jugador: 1, turno, mesa };
}

const decide = (e: EstadoSchafkopf) =>
  iaSchafkopfBasica.decidir(
    schafkopf.vistaDe(e, e.turno),
    schafkopf.accionesLegales(e, e.turno),
    crearAzar('x'),
  ).accion;

describe('IA básica del Schafkopf: anuncio', () => {
  it('anuncia un Solo con 6 triunfos y 3 damas o jotas', () => {
    const e = { ...base(), manos: [c('Qt Qp Jt At 10t 9t 7d 8d'), [], [], []] };
    expect(decide(e)).toEqual({ tipo: 'anunciar', contrato: { tipo: 'solo', palo: 'treboles' } });
  });

  it('pasa con una mano floja', () => {
    const e = { ...base(), manos: [c('7t 8t 9t At 7p 8p Ap 7c'), [], [], []] };
    expect(decide(e)).toEqual({ tipo: 'pasar' });
  });

  it('anuncia un Rufspiel y llama al As del palo del que menos tiene', () => {
    const e = { ...base(), manos: [c('Qt Qc Jp Ac 7c 7t 8t 7d'), [], [], []] };
    expect(decide(e)).toEqual({
      tipo: 'anunciar',
      contrato: { tipo: 'rufspiel', palo: 'diamantes' },
    });
  });

  it('anuncia un Wenz con 3 jotas y 2 Ases', () => {
    const e = { ...base(), manos: [c('Jt Jp Jd At Ap 7c 8c 9d'), [], [], []] };
    expect(decide(e)).toEqual({ tipo: 'anunciar', contrato: { tipo: 'wenz' } });
  });
});

describe('IA básica del Schafkopf: bazas', () => {
  it('gana con lo justo', () => {
    const e = enBazas(
      { tipo: 'rufspiel', palo: 'diamantes' },
      3,
      'Jd Qt',
      enMesa([0, 'Ap'], [1, '10p'], [2, '7p']),
    );
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('Jd')[0] });
  });

  it('carga a su compañero en un Wenz', () => {
    const e = enBazas({ tipo: 'wenz' }, 3, '10p 9p', enMesa([0, 'Ap'], [1, '7p'], [2, '8p']));
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('10p')[0] });
  });

  it('el que juega solo sale con su triunfo más alto', () => {
    const e = enBazas({ tipo: 'solo', palo: 'corazones' }, 1, 'Qp Jd 7c Ap', []);
    expect(decide(e)).toEqual({ tipo: 'jugar', carta: c('Qp')[0] });
  });
});

describe('IA difícil del Schafkopf', () => {
  it('misma vista y misma semilla, misma decisión', () => {
    let e = base();
    while (e.fase === 'anuncio') {
      e = schafkopf.transicion(e, e.turno, schafkopf.accionesLegales(e, e.turno).at(-1)!);
    }
    const v = schafkopf.vistaDe(e, e.turno);
    const acciones = schafkopf.accionesLegales(e, e.turno);
    expect(IAS.schafkopf.dificil.decidir(v, acciones, crearAzar('s'))).toEqual(
      IAS.schafkopf.dificil.decidir(v, acciones, crearAzar('s')),
    );
  });
});

describe('garantías de la IA del Schafkopf', () => {
  const azar = aleatorio<VistaSchafkopf, AccionSchafkopf>();
  // Cuatro manos, para que las 100 partidas no sean tan largas.
  const corta: ConfigSchafkopf = { jugadores: 4, manos: 4 };

  it('100 partidas entre IAs terminan sin acciones ilegales y rápidas', () => {
    const r = duelo(
      schafkopf,
      corta,
      iaSchafkopfBasica,
      IAS.schafkopf.facil,
      100,
      unoContraTodos(4),
      'sim',
    );
    expect(r.partidas).toBe(100);
    expect(r.maxMs).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      schafkopf,
      CONFIG_SCHAFKOPF_POR_DEFECTO,
      iaSchafkopfBasica,
      azar,
      200,
      unoContraTodos(4),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(80);
  });

  it('la difícil decide en menos de 500 ms', () => {
    const r = duelo(
      schafkopf,
      CONFIG_SCHAFKOPF_POR_DEFECTO,
      IAS.schafkopf.dificil,
      iaSchafkopfBasica,
      1,
      unoContraTodos(4),
      'tiempo',
    );
    expect(r.maxMs).toBeLessThan(500);
  });
});
