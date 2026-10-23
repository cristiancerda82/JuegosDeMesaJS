import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import { aleatorio, type Agente } from '../../src/ia/agente';
import {
  estrategiaBasica,
  iaBlackjackBasica,
  iaBlackjackExperta,
} from '../../src/ia/blackjack-basica';
import { IAS } from '../../src/ia/ias';
import { reconstruirBlackjack } from '../../src/ia/reconstruir/blackjack';
import {
  blackjack,
  CONFIG_BLACKJACK_POR_DEFECTO,
  esBlackjack,
  type AccionBlackjack,
  type VistaBlackjack,
} from '../../src/juegos/blackjack';
import { duelo, unoContraTodos } from './duelo';
import { fichasPorMano } from './fichas-blackjack';

type AgenteBlackjack = Agente<VistaBlackjack, AccionBlackjack>;

/** Una vista del asiento 0 jugando esta mano contra esta carta visible de la banca. */
function vistaCon(cartas: IdCarta[], visible: IdCarta): VistaBlackjack {
  return {
    config: { jugadores: 1, manos: 10 },
    asiento: 0,
    fichas: [100],
    activos: [true],
    fase: 'juego',
    turno: 0,
    manoActiva: 0,
    apuestas: [10],
    manos: [[{ cartas, apuesta: 10, doblada: false, separada: false, terminada: false }]],
    banca: [visible, null],
    valorBanca: null,
    miro: false,
    mazo: 47,
    resultadosManos: [],
  };
}

const TODAS: AccionBlackjack[] = [
  { tipo: 'pedir' },
  { tipo: 'plantarse' },
  { tipo: 'doblar' },
  { tipo: 'separar' },
];
const decide = (agente: AgenteBlackjack, v: VistaBlackjack, acciones = TODAS) =>
  agente.decidir(v, acciones, crearAzar('x')).accion.tipo;

describe('IA básica del Blackjack', () => {
  it('pide con 16 aunque la banca muestre un 6, y se planta con 17', () => {
    expect(decide(iaBlackjackBasica, vistaCon(['picas-10', 'corazones-6'], 'treboles-6'))).toBe(
      'pedir',
    );
    expect(decide(iaBlackjackBasica, vistaCon(['picas-10', 'corazones-7'], 'treboles-6'))).toBe(
      'plantarse',
    );
  });

  it('dobla con 11 y separa ases y ochos', () => {
    expect(decide(iaBlackjackBasica, vistaCon(['picas-5', 'corazones-6'], 'treboles-10'))).toBe(
      'doblar',
    );
    expect(decide(iaBlackjackBasica, vistaCon(['picas-1', 'corazones-1'], 'treboles-10'))).toBe(
      'separar',
    );
    expect(decide(iaBlackjackBasica, vistaCon(['picas-8', 'corazones-8'], 'treboles-10'))).toBe(
      'separar',
    );
  });

  it('apuesta 10, o la mayor que pueda', () => {
    const r = blackjack.crear(CONFIG_BLACKJACK_POR_DEFECTO, 'apuesta');
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    const d = iaBlackjackBasica.decidir(
      blackjack.vistaDe(e, 0),
      blackjack.accionesLegales(e, 0),
      crearAzar('x'),
    );
    expect(d.accion).toEqual({ tipo: 'apostar', fichas: 10 });
    const pocas: AccionBlackjack[] = [
      { tipo: 'apostar', fichas: 2 },
      { tipo: 'apostar', fichas: 4 },
    ];
    expect(
      iaBlackjackBasica.decidir(blackjack.vistaDe(e, 0), pocas, crearAzar('x')).accion,
    ).toEqual({ tipo: 'apostar', fichas: 4 });
  });
});

describe('IA experta del Blackjack', () => {
  it('estrategia básica: 12 contra un 4 se planta; 16 contra un 10 pide; 9-9 contra un 7 no separa', () => {
    expect(estrategiaBasica(12, false, 4, null)).toBe('plantarse');
    expect(estrategiaBasica(16, false, 10, null)).toBe('pedir');
    expect(estrategiaBasica(18, false, 7, 9)).toBe('plantarse');
    expect(estrategiaBasica(17, true, 3, null)).toBe('doblar');
    expect(estrategiaBasica(18, true, 9, null)).toBe('pedir');
  });

  it('sin poder doblar, pide o se planta', () => {
    const v = vistaCon(['picas-1', 'corazones-7'], 'treboles-4');
    expect(decide(iaBlackjackExperta, v, [{ tipo: 'pedir' }, { tipo: 'plantarse' }])).toBe(
      'plantarse',
    );
  });

  it('el difícil se planta con 12 contra un 4, aunque la normal pediría', () => {
    const v = vistaCon(['picas-10', 'corazones-2'], 'treboles-4');
    expect(decide(iaBlackjackBasica, v)).toBe('pedir');
    const legales = TODAS.filter((x) => x.tipo !== 'separar');
    expect(decide(IAS.blackjack.dificil, v, legales)).toBe('plantarse');
  });

  it('con las mismas cartas, la experta pierde menos fichas por mano que la normal', () => {
    const normal = fichasPorMano(iaBlackjackBasica, 1000, 'experta');
    const experta = fichasPorMano(iaBlackjackExperta, 1000, 'experta');
    expect(experta - normal).toBeGreaterThan(0.15);
  });
});

describe('garantías de la IA del Blackjack', () => {
  const azar = aleatorio<VistaBlackjack, AccionBlackjack>();

  it('500 partidas entre IAs, de 1 a 4, terminan sin acciones ilegales y rápidas', () => {
    let maximo = 0;
    for (const jugadores of [1, 2, 3, 4] as const) {
      const r = duelo(
        blackjack,
        { jugadores, manos: 10 },
        iaBlackjackBasica,
        IAS.blackjack.facil,
        125,
        unoContraTodos(jugadores),
        `sim-${jugadores}`,
      );
      expect(r.partidas).toBe(125);
      maximo = Math.max(maximo, r.maxMs);
    }
    expect(maximo).toBeLessThan(500);
  });

  it('gana claramente al azar', () => {
    const r = duelo(
      blackjack,
      CONFIG_BLACKJACK_POR_DEFECTO,
      iaBlackjackBasica,
      azar,
      500,
      unoContraTodos(2),
      'azar',
    );
    expect(r.ganadas).toBeGreaterThan(330);
  });

  it('misma vista y misma semilla, misma decisión', () => {
    const v = vistaCon(['picas-10', 'corazones-2'], 'treboles-4');
    const a = IAS.blackjack.dificil.decidir(v, TODAS, crearAzar('s'));
    const b = IAS.blackjack.dificil.decidir(v, TODAS, crearAzar('s'));
    expect(a).toEqual(b);
  });
});

describe('reconstrucción del Blackjack', () => {
  it('si la banca miró, la tapada reconstruida no le da blackjack', () => {
    for (let i = 0; i < 300; i++) {
      const r = blackjack.crear({ jugadores: 1, manos: 5 }, `rec-${i}`);
      if (!r.ok) throw new Error(r.error);
      const e = blackjack.transicion(r.valor, 0, { tipo: 'apostar', fichas: 10 });
      if (e.fase !== 'juego' || !e.miro) continue;
      const vista = blackjack.vistaDe(e, 0);
      for (let k = 0; k < 30; k++) {
        const rec = reconstruirBlackjack(vista, crearAzar(`r-${k}`));
        expect(esBlackjack(rec.banca)).toBe(false);
        expect(blackjack.vistaDe(rec, 0)).toEqual(vista);
      }
      return;
    }
    throw new Error('Ninguna semilla con la banca mirando');
  });
});
