import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  apuestasLegalesBlackjack,
  blackjack,
  CONFIG_BLACKJACK_POR_DEFECTO,
  esBlackjack,
  valorBlackjack,
  type AccionBlackjack,
  type ConfigBlackjack,
  type EstadoBlackjack,
} from '../../src/juegos/blackjack';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

function nueva(config: Partial<ConfigBlackjack> = {}, semilla = 'blackjack'): EstadoBlackjack {
  const r = blackjack.crear({ ...CONFIG_BLACKJACK_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoBlackjack, accion: AccionBlackjack): EstadoBlackjack {
  const r = aplicar(blackjack, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const tipos = (e: EstadoBlackjack) => blackjack.accionesLegales(e, e.turno).map((a) => a.tipo);

/**
 * Un estado en juego armado a mano: un jugador por cada mano dada (con apuesta 10), la banca y
 * el mazo (la siguiente carta que sale es la última).
 */
function enJuego(
  manos: IdCarta[][],
  banca: IdCarta[],
  mazo: IdCarta[] = [],
  parcial: Partial<EstadoBlackjack> = {},
): EstadoBlackjack {
  const base = nueva({ jugadores: manos.length as 1 | 2 | 3 | 4 });
  return {
    ...base,
    fase: 'juego',
    turno: 0,
    manoActiva: 0,
    apuestas: manos.map(() => 10),
    manos: manos.map((cartas) => [
      { cartas, apuesta: 10, doblada: false, separada: false, terminada: false },
    ]),
    banca,
    mazo,
    ...parcial,
  };
}

describe('valores', () => {
  it('el As se ajusta: As, 6 y 9 valen 16', () => {
    expect(valorBlackjack(['picas-1', 'corazones-6', 'treboles-9'])).toEqual({
      total: 16,
      blanda: false,
    });
    expect(valorBlackjack(['picas-1', 'corazones-6'])).toEqual({ total: 17, blanda: true });
  });

  it('As y Q es blackjack, salvo en una mano separada', () => {
    expect(esBlackjack(['picas-1', 'corazones-12'])).toBe(true);
    expect(esBlackjack(['picas-1', 'corazones-12'], true)).toBe(false);
    expect(esBlackjack(['picas-1', 'corazones-5', 'treboles-5'])).toBe(false);
  });
});

describe('fichas y apuesta', () => {
  it('cada uno empieza con 100 y apuesta primero el asiento 0', () => {
    const e = nueva({ jugadores: 3 });
    expect(e.fichas).toEqual([100, 100, 100]);
    expect(e.fase).toBe('apuesta');
    expect(e.turno).toBe(0);
    expect(tipos(e).every((t) => t === 'apostar')).toBe(true);
  });

  it('apuestas pares de 2 a 20, sin pasar de las fichas', () => {
    expect(apuestasLegalesBlackjack(7)).toEqual([2, 4, 6]);
    expect(apuestasLegalesBlackjack(100)).toHaveLength(10);
    expect(apuestasLegalesBlackjack(1)).toEqual([]);
  });

  it('valida la configuración', () => {
    expect(blackjack.crear({ jugadores: 5 as 4, manos: 10 }, 'x').ok).toBe(false);
    expect(blackjack.crear({ jugadores: 2, manos: 7 as 10 }, 'x').ok).toBe(false);
  });

  it('tras las apuestas se reparten dos cartas a cada uno y a la banca, con la tapada oculta', () => {
    let e = nueva({ jugadores: 2 }, 'reparto');
    e = hacer(e, { tipo: 'apostar', fichas: 10 });
    e = hacer(e, { tipo: 'apostar', fichas: 4 });
    expect(e.manos.map((ms) => ms[0]!.cartas.length)).toEqual([2, 2]);
    expect(e.banca).toHaveLength(2);
    expect(e.mazo).toHaveLength(46);
    const v = blackjack.vistaDe(e, 1);
    if (e.resultadosManos.length === 0) {
      expect(v.banca[1]).toBeNull();
      expect(v.valorBanca).toBeNull();
    }
  });
});

describe('blackjack de la banca', () => {
  it('con un As o un 10 visible y blackjack, la mano termina sin que jueguen los jugadores', () => {
    let encontrado = false;
    for (let i = 0; i < 300 && !encontrado; i++) {
      let e = nueva({ jugadores: 1 }, `banca-${i}`);
      e = hacer(e, { tipo: 'apostar', fichas: 10 });
      const r = e.resultadosManos[0];
      if (!r || !esBlackjack(r.banca)) continue;
      encontrado = true;
      // La mano se liquida al repartir: el jugador no llegó a jugar.
      const mano = r.manos[0]![0]!;
      expect(mano.cartas).toHaveLength(2);
      expect(mano.resultado).toBe(esBlackjack(mano.cartas) ? 'empata' : 'pierde');
      expect(e.fase).toBe('apuesta');
    }
    expect(encontrado).toBe(true);
  });

  it('si miró y no tenía blackjack, se sabe y la tapada sigue oculta', () => {
    for (let i = 0; i < 300; i++) {
      let e = nueva({ jugadores: 1 }, `mira-${i}`);
      e = hacer(e, { tipo: 'apostar', fichas: 10 });
      if (e.fase !== 'juego' || !e.miro) continue;
      const v = blackjack.vistaDe(e, 0);
      expect(v.miro).toBe(true);
      expect(v.banca[1]).toBeNull();
      expect(esBlackjack(e.banca)).toBe(false);
      return;
    }
    throw new Error('Ninguna semilla con la banca mirando');
  });
});

describe('turno de los jugadores', () => {
  it('pasarse: 15 y una Q son 25, pierde y le toca al siguiente', () => {
    let e = enJuego(
      [
        ['picas-9', 'corazones-6'],
        ['picas-2', 'corazones-3'],
      ],
      ['treboles-9', 'diamantes-8'],
      ['corazones-12'],
    );
    e = hacer(e, { tipo: 'pedir' });
    expect(e.manos[0]![0]!.terminada).toBe(true);
    expect(e.turno).toBe(1);
  });

  it('doblar con 11: apuesta 20, una sola carta y termina', () => {
    let e = enJuego(
      [
        ['picas-5', 'corazones-6'],
        ['picas-2', 'corazones-3'],
      ],
      ['treboles-9', 'diamantes-8'],
      ['corazones-9'],
    );
    expect(tipos(e)).toContain('doblar');
    e = hacer(e, { tipo: 'doblar' });
    expect(e.manos[0]![0]).toMatchObject({ apuesta: 20, doblada: true, terminada: true });
    expect(e.manos[0]![0]!.cartas).toHaveLength(3);
    expect(e.turno).toBe(1);
  });

  it('doblar sin fichas no es legal', () => {
    const e = enJuego([['picas-5', 'corazones-6']], ['treboles-9', 'diamantes-8'], [], {
      fichas: [14],
    });
    expect(tipos(e)).not.toContain('doblar');
  });

  it('separar ochos: dos manos con 10 cada una, primero una y luego la otra', () => {
    let e = enJuego(
      [['picas-8', 'corazones-8']],
      ['treboles-9', 'diamantes-8'],
      ['diamantes-3', 'treboles-2'],
    );
    e = hacer(e, { tipo: 'separar' });
    expect(e.manos[0]!.map((m) => m.cartas)).toEqual([
      ['picas-8', 'treboles-2'],
      ['corazones-8', 'diamantes-3'],
    ]);
    expect(e.manos[0]!.every((m) => m.apuesta === 10 && m.separada)).toBe(true);
    expect(e.manoActiva).toBe(0);
    expect(tipos(e)).not.toContain('doblar');
    expect(tipos(e)).not.toContain('separar');
    e = hacer(e, { tipo: 'plantarse' });
    expect(e.manoActiva).toBe(1);
  });

  it('los ases separados reciben una carta y se plantan solos', () => {
    let e = enJuego(
      [['picas-1', 'corazones-1']],
      ['treboles-9', 'diamantes-8'],
      ['diamantes-3', 'treboles-13', 'picas-5'],
    );
    e = hacer(e, { tipo: 'separar' });
    // La partida pasa a la banca (17 con 9 y 8) y se liquida: As+K separados no es blackjack.
    const r = e.resultadosManos[0]!;
    // Al primer As le sale el 5 (16, pierde) y al segundo la K (21, gana).
    expect(r.manos[0]!.map((m) => m.resultado)).toEqual(['pierde', 'gana']);
    expect(r.ganancias).toEqual([0]);
  });
});

describe('banca y pago', () => {
  it('la banca con 16 pide y se pasa: gana quien se plantó con 13', () => {
    let e = enJuego([['picas-10', 'corazones-3']], ['treboles-10', 'diamantes-6'], ['picas-8']);
    e = hacer(e, { tipo: 'plantarse' });
    const r = e.resultadosManos[0]!;
    expect(r.valorBanca).toBe(24);
    expect(r.manos[0]![0]!.resultado).toBe('gana');
    expect(e.fichas).toEqual([110]);
  });

  it('blackjack paga 3 a 2', () => {
    let e = enJuego(
      [
        ['picas-1', 'corazones-13'],
        ['picas-10', 'corazones-7'],
      ],
      ['treboles-10', 'diamantes-10'],
      [],
      { turno: 1, manos: [] },
    );
    e = {
      ...e,
      manos: [
        [
          {
            cartas: ['picas-1', 'corazones-13'],
            apuesta: 10,
            doblada: false,
            separada: false,
            terminada: true,
          },
        ],
        [
          {
            cartas: ['picas-10', 'corazones-7'],
            apuesta: 10,
            doblada: false,
            separada: false,
            terminada: false,
          },
        ],
      ],
    };
    e = hacer(e, { tipo: 'plantarse' });
    expect(e.resultadosManos[0]!.ganancias).toEqual([15, -10]);
  });

  it('empate devuelve la apuesta', () => {
    let e = enJuego([['picas-10', 'corazones-9']], ['treboles-10', 'diamantes-9']);
    e = hacer(e, { tipo: 'plantarse' });
    expect(e.resultadosManos[0]!.manos[0]![0]!.resultado).toBe('empata');
    expect(e.fichas).toEqual([100]);
  });

  it('la banca se planta con 17 blando', () => {
    let e = enJuego([['picas-10', 'corazones-8']], ['treboles-1', 'diamantes-6'], ['picas-4']);
    e = hacer(e, { tipo: 'plantarse' });
    expect(e.resultadosManos[0]!.banca).toEqual(['treboles-1', 'diamantes-6']);
    expect(e.resultadosManos[0]!.valorBanca).toBe(17);
  });
});

describe('fin de partida', () => {
  it('gana quien más fichas tiene al acabar las manos', () => {
    let e = enJuego(
      [
        ['picas-10', 'corazones-9'],
        ['picas-10', 'corazones-5'],
      ],
      ['treboles-10', 'diamantes-8'],
      [],
      { config: { jugadores: 2, manos: 5 }, resultadosManos: new Array(4).fill(null) },
    );
    e = hacer(e, { tipo: 'plantarse' });
    e = hacer(e, { tipo: 'plantarse' });
    expect(blackjack.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [110, 90] });
  });

  it('jugando solo, acabar con 96 fichas es perder', () => {
    let e = enJuego([['picas-10', 'corazones-5']], ['treboles-10', 'diamantes-8'], [], {
      config: { jugadores: 1, manos: 5 },
      resultadosManos: new Array(4).fill(null),
      fichas: [106],
    });
    e = hacer(e, { tipo: 'plantarse' });
    expect(e.fichas).toEqual([96]);
    expect(blackjack.resultado(e)).toEqual({ ganadores: [], empate: false, puntos: [96] });
  });
});

describirContrato(blackjack, {
  configs: [CONFIG_BLACKJACK_POR_DEFECTO, { jugadores: 1, manos: 5 }, { jugadores: 4, manos: 5 }],
  // Cada mano se baraja la baraja entera: las cartas de las manos anteriores, que se ven en sus
  // resultados, vuelven al mazo.
  cartasOcultas: (e) => {
    const vistas = new Set<string>(
      e.resultadosManos.flatMap((r) => [...r.banca, ...r.manos.flat().flatMap((m) => m.cartas)]),
    );
    const ocultas = [...(e.descubierta ? [] : e.banca.slice(1)), ...e.mazo];
    return ocultas.filter((c) => !vistas.has(c));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
