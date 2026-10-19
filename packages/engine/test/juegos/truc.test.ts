import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  actorTruc,
  CONFIG_TRUC_POR_DEFECTO,
  ganadorDeLaMano,
  puntosEnvit,
  rangoTruc,
  truc,
  type AccionTruc,
  type ConfigTruc,
  type EstadoTruc,
} from '../../src/juegos/truc';
import { aplicar } from '../../src/motor/aplicar';
import type { Asiento } from '../../src/motor/contrato';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigTruc> = {}, semilla = 't'): EstadoTruc {
  const r = truc.crear({ ...CONFIG_TRUC_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTruc, accion: AccionTruc, asiento: Asiento = actorTruc(e)): EstadoTruc {
  const r = aplicar(truc, e, asiento, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${asiento}: ${r.error}`);
  return r.valor;
}

/** Estado de 2 jugadores armado a mano: reparte el 1, es mano el 0. */
function mesa(manos: IdCarta[][], parcial: Partial<EstadoTruc> = {}): EstadoTruc {
  const base = nueva({ jugadores: manos.length as 2 | 4 });
  return { ...base, azar: crearAzar('mesa'), manos, ...parcial };
}

const jugar = (e: EstadoTruc, carta: IdCarta) => hacer(e, { tipo: 'jugar', carta });
const tipos = (e: EstadoTruc) => truc.accionesLegales(e, actorTruc(e)).map((a) => a.tipo);

// ── Cartas ───────────────────────────────────────────────────────────────────

describe('jerarquía y envit', () => {
  it('ordena las cartas de la más alta a la más baja', () => {
    const orden: IdCarta[] = [
      'espadas-1',
      'bastos-1',
      'espadas-7',
      'oros-7',
      'copas-3',
      'copas-2',
      'oros-1',
      'oros-12',
      'oros-11',
      'oros-10',
      'copas-7',
      'copas-6',
      'copas-5',
      'copas-4',
    ];
    for (let i = 1; i < orden.length; i++) {
      expect(rangoTruc(orden[i - 1]!)).toBeGreaterThan(rangoTruc(orden[i]!));
    }
    expect(rangoTruc('copas-3')).toBe(rangoTruc('oros-3'));
    expect(rangoTruc('copas-1')).toBe(rangoTruc('oros-1'));
    expect(rangoTruc('bastos-7')).toBe(rangoTruc('copas-7'));
  });

  it('puntos de envit', () => {
    expect(puntosEnvit(['oros-7', 'oros-5', 'copas-12'])).toBe(32);
    expect(puntosEnvit(['oros-6', 'copas-4', 'bastos-10'])).toBe(6);
    expect(puntosEnvit(['oros-12', 'oros-10', 'copas-4'])).toBe(20);
    expect(puntosEnvit(['oros-7', 'oros-6', 'oros-5'])).toBe(33);
  });
});

// ── Reparto y bazas ──────────────────────────────────────────────────────────

describe('reparto', () => {
  it('3 cartas a cada uno, reparte el último asiento y es mano el 0', () => {
    const e = nueva({ jugadores: 4 });
    expect(e.manos.map((m) => m.length)).toEqual([3, 3, 3, 3]);
    expect(new Set(e.manos.flat()).size).toBe(12);
    expect(e.repartidor).toBe(3);
    expect(actorTruc(e)).toBe(0);
  });

  it('se puede jugar cualquier carta', () => {
    const e = mesa([
      ['oros-4', 'copas-5', 'espadas-1'],
      ['copas-6', 'bastos-2', 'oros-3'],
    ]);
    const e1 = jugar(e, 'espadas-1');
    expect(truc.accionesLegales(e1, 1).filter((a) => a.tipo === 'jugar')).toHaveLength(3);
  });
});

describe('ganador de la mano con pardas', () => {
  const casos: [(0 | 1 | null)[], 0 | 1 | null][] = [
    [[0], null],
    [[0, 0], 0],
    [[0, 1], null],
    [[0, 1, 1], 1],
    [[0, 1, 0], 0],
    [[0, null], 0],
    [[null, 1], 1],
    [[null, null], null],
    [[null, null, 0], 0],
    [[null, null, null], 1],
    [[0, 1, null], 0],
    [[1, 0, null], 1],
  ];
  it.each(casos)('%j → %s (mano del bando 1)', (bazas, gana) => {
    expect(ganadorDeLaMano(bazas, 1)).toBe(gana);
  });

  it('dos bazas seguidas cierran la mano sin jugar la tercera', () => {
    let e = mesa([
      ['espadas-1', 'bastos-1', 'oros-4'],
      ['copas-4', 'copas-5', 'copas-6'],
    ]);
    e = jugar(jugar(e, 'espadas-1'), 'copas-4');
    e = jugar(jugar(e, 'bastos-1'), 'copas-5');
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.resultadosManos[0]!.ganadorMano).toBe(0);
    expect(e.piedras).toEqual([1, 0]);
  });

  it('una baza parda en 2 jugadores la sale el mismo', () => {
    let e = mesa([
      ['copas-3', 'oros-4', 'oros-5'],
      ['oros-3', 'bastos-4', 'bastos-5'],
    ]);
    e = jugar(jugar(e, 'copas-3'), 'oros-3');
    expect(e.bazasJugadas[0]!.ganador).toBeNull();
    expect(e.turno).toBe(0);
  });
});

// ── Envit ────────────────────────────────────────────────────────────────────

describe('envit', () => {
  const manos = (): IdCarta[][] => [
    ['oros-7', 'oros-5', 'copas-12'],
    ['espadas-6', 'espadas-4', 'bastos-1'],
  ];

  it('no vull: el que envidó cobra 1 al terminar la mano', () => {
    let e = hacer(mesa(manos()), { tipo: 'envidar' });
    expect(actorTruc(e)).toBe(1);
    expect(tipos(e)).toEqual(['vull', 'noVull', 'torne', 'falta', 'meVoy']);
    e = hacer(e, { tipo: 'noVull' });
    expect(actorTruc(e)).toBe(0);
    e = hacer(e, { tipo: 'meVoy' }, 0);
    // El 0 se fue (1 para el rival), pero cobra el envit no querido.
    expect(e.resultadosManos[0]!.piedrasEnvit).toEqual([1, 0]);
    expect(e.resultadosManos[0]!.piedrasTruc).toEqual([0, 1]);
  });

  it('vull: se muestran los puntos y gana el más alto', () => {
    let e = hacer(mesa(manos()), { tipo: 'envidar' });
    e = hacer(e, { tipo: 'vull' });
    expect(e.envit.estado).toBe('querido');
    expect(e.envit.mostrado).toEqual([32, 30]);
    expect(e.envit.ganador).toBe(0);
    expect(e.envit.valor).toBe(2);
  });

  it('torne y falta', () => {
    let e = hacer(mesa(manos()), { tipo: 'envidar' });
    e = hacer(e, { tipo: 'torne' });
    expect(actorTruc(e)).toBe(0);
    expect(tipos(e)).toEqual(['vull', 'noVull', 'falta', 'meVoy']);
    e = hacer(e, { tipo: 'falta' });
    expect(tipos(e)).toEqual(['vull', 'noVull', 'meVoy']);
    const noQuiere = hacer(e, { tipo: 'noVull' });
    expect(noQuiere.envit.valor).toBe(4);
    const quiere = hacer({ ...e, piedras: [5, 8] }, { tipo: 'vull' });
    expect(quiere.envit.valor).toBe(4);
  });

  it('empate: gana el más cercano a la mano', () => {
    let e = mesa([
      ['oros-7', 'oros-4', 'copas-4'],
      ['espadas-7', 'espadas-4', 'bastos-4'],
    ]);
    e = { ...e, repartidor: 0, turno: 1 };
    e = hacer(e, { tipo: 'envidar' });
    e = hacer(e, { tipo: 'vull' });
    expect(e.envit.mostrado).toEqual([31, 31]);
    expect(e.envit.ganador).toBe(1);
  });

  it('solo en la primera baza y antes de jugar la propia carta', () => {
    let e = mesa(manos());
    e = jugar(e, 'oros-5');
    expect(tipos(e)).toContain('envidar');
    e = jugar(e, 'espadas-4');
    expect(tipos(e)).not.toContain('envidar');
  });

  it('las cartas jugadas cuentan para el envit', () => {
    let e = mesa(manos());
    e = jugar(e, 'oros-5');
    e = hacer(e, { tipo: 'envidar' });
    e = hacer(e, { tipo: 'vull' });
    expect(e.envit.mostrado[0]).toBe(32);
  });
});

// ── Truc ─────────────────────────────────────────────────────────────────────

describe('truc', () => {
  const manos = (): IdCarta[][] => [
    ['espadas-1', 'bastos-1', 'oros-4'],
    ['copas-4', 'copas-5', 'copas-6'],
  ];

  it('truc querido: el que gana la mano cobra 2', () => {
    let e = hacer(mesa(manos()), { tipo: 'trucar' });
    expect(tipos(e)).toEqual(['vull', 'noVull', 'trucar', 'envidar', 'meVoy']);
    e = hacer(e, { tipo: 'vull' });
    e = jugar(jugar(e, 'espadas-1'), 'copas-4');
    e = jugar(jugar(e, 'bastos-1'), 'copas-5');
    expect(e.resultadosManos[0]!.piedrasTruc).toEqual([2, 0]);
  });

  it('retruc no querido: el que retrucó gana la mano y cobra 2', () => {
    let e = hacer(mesa(manos()), { tipo: 'trucar' });
    e = hacer(e, { tipo: 'trucar' });
    expect(e.truc).toMatchObject({ nivel: 1, pendiente: 2, quien: 1 });
    e = hacer(e, { tipo: 'noVull' });
    expect(e.resultadosManos[0]!.ganadorMano).toBe(1);
    expect(e.resultadosManos[0]!.piedrasTruc).toEqual([0, 2]);
  });

  it('solo sube el bando que aceptó', () => {
    let e = hacer(mesa(manos()), { tipo: 'trucar' });
    e = hacer(e, { tipo: 'vull' });
    expect(tipos(e)).not.toContain('trucar');
    e = jugar(e, 'oros-4');
    expect(tipos(e)).toContain('trucar');
  });

  it('el envit va primero', () => {
    let e = hacer(mesa(manos()), { tipo: 'trucar' });
    e = hacer(e, { tipo: 'envidar' });
    expect(actorTruc(e)).toBe(0);
    expect(tipos(e)).toEqual(['vull', 'noVull', 'torne', 'falta', 'meVoy']);
    e = hacer(e, { tipo: 'vull' });
    // Resuelto el envit, el 1 responde al truc.
    expect(actorTruc(e)).toBe(1);
    expect(tipos(e)).toEqual(['vull', 'noVull', 'trucar', 'meVoy']);
  });

  it('joc fora querido: quien gana la mano gana la came', () => {
    let e = mesa(manos());
    e = hacer(e, { tipo: 'trucar' });
    e = hacer(e, { tipo: 'trucar' });
    e = hacer(e, { tipo: 'trucar' });
    e = hacer(e, { tipo: 'trucar' });
    expect(e.truc.pendiente).toBe(4);
    expect(tipos(e)).toEqual(['vull', 'noVull', 'envidar', 'meVoy']);
    e = hacer(e, { tipo: 'vull' });
    e = jugar(jugar(e, 'espadas-1'), 'copas-4');
    e = jugar(jugar(e, 'bastos-1'), 'copas-5');
    expect(e.resultadosManos[0]!.came).toBe(0);
    expect(e.cames).toEqual([1, 0]);
    expect(e.piedras).toEqual([0, 0]);
  });
});

// ── Retirarse y cames ────────────────────────────────────────────────────────

describe("me'n vaig y cames", () => {
  it('irse sin apuestas da 1 al rival', () => {
    const e = hacer(nueva(), { tipo: 'meVoy' }, 0);
    expect(e.resultadosManos[0]!.seFue).toBe(0);
    expect(e.piedras).toEqual([0, 1]);
    expect(e.repartidor).toBe(0);
  });

  it('el envit cierra la came antes que el truc', () => {
    let e = mesa(
      [
        ['oros-7', 'oros-6', 'copas-4'],
        ['espadas-1', 'bastos-1', 'copas-5'],
      ],
      { piedras: [11, 5] },
    );
    e = hacer(e, { tipo: 'envidar' });
    e = hacer(e, { tipo: 'vull' });
    e = hacer(e, { tipo: 'trucar' }, 0);
    e = hacer(e, { tipo: 'vull' });
    e = jugar(jugar(e, 'copas-4'), 'espadas-1');
    e = jugar(jugar(e, 'bastos-1'), 'oros-6');
    const r = e.resultadosManos[0]!;
    expect(r.ganadorMano).toBe(1);
    expect(r.came).toBe(0);
    expect(r.piedrasTruc).toEqual([0, 0]);
    expect(e.cames).toEqual([1, 0]);
  });

  it('la partida a dos cames termina con la segunda', () => {
    let e = mesa(
      [
        ['oros-4', 'oros-5', 'oros-6'],
        ['copas-4', 'copas-5', 'copas-6'],
      ],
      {
        piedras: [0, 11],
        cames: [0, 1],
      },
    );
    e = hacer(e, { tipo: 'meVoy' }, 0);
    expect(truc.resultado(e)).toEqual({ ganadores: [1], empate: false, puntos: [0, 2] });
  });

  it('a una came, la primera la termina', () => {
    let e = mesa(
      [
        ['oros-4', 'oros-5', 'oros-6'],
        ['copas-4', 'copas-5', 'copas-6'],
      ],
      {
        config: { jugadores: 2, cames: 1 },
        piedras: [11, 0],
      },
    );
    e = hacer(e, { tipo: 'meVoy' }, 0);
    expect(truc.resultado(e)).toBeNull();
    // En la mano siguiente es mano el 1: si se va, el 0 llega a 12 y gana.
    expect(actorTruc(e)).toBe(1);
    e = hacer(e, { tipo: 'meVoy' }, 1);
    expect(truc.resultado(e)?.ganadores).toEqual([0]);
  });
});

describe('4 por parejas', () => {
  it('el compañero que gana la baza cuenta para el bando', () => {
    let e = mesa([
      ['oros-4', 'oros-5', 'oros-6'],
      ['copas-4', 'copas-5', 'copas-6'],
      ['espadas-1', 'bastos-1', 'espadas-7'],
      ['bastos-4', 'bastos-5', 'bastos-6'],
    ]);
    for (const c of ['oros-4', 'copas-4', 'espadas-1', 'bastos-4'] as IdCarta[]) e = jugar(e, c);
    expect(e.bazasJugadas[0]!.ganador).toBe(0);
    expect(e.turno).toBe(2);
    expect(truc.vistaDe(e, 0).bazas).toEqual([0, 0, 1, 0]);
  });

  it('el envit lo responde el siguiente rival y se compara el mejor de cada bando', () => {
    let e = mesa([
      ['oros-4', 'oros-5', 'copas-6'],
      ['copas-4', 'copas-5', 'espadas-6'],
      ['espadas-1', 'espadas-7', 'espadas-6'],
      ['bastos-4', 'bastos-5', 'bastos-6'],
    ]);
    e = hacer(e, { tipo: 'envidar' });
    expect(actorTruc(e)).toBe(1);
    e = hacer(e, { tipo: 'vull' });
    expect(e.envit.mostrado).toEqual([null, null, 33, 31]);
    expect(e.envit.ganador).toBe(0);
  });
});

describe('vista', () => {
  it('no muestra las manos ajenas', () => {
    const e = nueva({ jugadores: 4 });
    const v = truc.vistaDe(e, 0);
    for (const c of e.manos.slice(1).flat()) expect(JSON.stringify(v)).not.toContain(`"${c}"`);
  });
});

// ── Contrato ─────────────────────────────────────────────────────────────────

describirContrato(truc, {
  configs: [CONFIG_TRUC_POR_DEFECTO, { jugadores: 4, cames: 1 }, { jugadores: 2, cames: 1 }],
  // Las cartas de la última baza ya se vieron, aunque tras repartir estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((c) => !vistas.has(c));
  },
  // Irse de la mano acaba enseguida: el juego al azar lo evita si tiene otra cosa.
  evitar: (a) => a.tipo === 'meVoy',
  pasosMaximos: 400,
  ejecuciones: 30,
});
