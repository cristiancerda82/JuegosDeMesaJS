import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  actorTruco,
  cantosPosiblesTruco,
  CONFIG_TRUCO_POR_DEFECTO,
  truco,
  valorCantosTruco,
  valorNoQueridoTruco,
  type AccionTruco,
  type ConfigTruco,
  type EstadoTruco,
} from '../../src/juegos/truco';
import { aplicar } from '../../src/motor/aplicar';
import type { Asiento } from '../../src/motor/contrato';
import { describirContrato } from '../contrato/verificar-contrato';

// ── Utilidades ───────────────────────────────────────────────────────────────

function nueva(config: Partial<ConfigTruco> = {}, semilla = 't'): EstadoTruco {
  const r = truco.crear({ ...CONFIG_TRUCO_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTruco, accion: AccionTruco, asiento: Asiento = actorTruco(e)): EstadoTruco {
  const r = aplicar(truco, e, asiento, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${asiento}: ${r.error}`);
  return r.valor;
}
const tipo = (t: AccionTruco['tipo']) => ({ tipo: t }) as AccionTruco;

/** Estado de 2 jugadores armado a mano: reparte el 1, es mano el 0. */
function mesa(manos: IdCarta[][], parcial: Partial<EstadoTruco> = {}): EstadoTruco {
  const base = nueva({ jugadores: manos.length as 2 | 4 });
  return { ...base, azar: crearAzar('mesa'), manos, ...parcial };
}

const jugar = (e: EstadoTruco, carta: IdCarta) => hacer(e, { tipo: 'jugar', carta });
const tipos = (e: EstadoTruco) => truco.accionesLegales(e, actorTruco(e)).map((a) => a.tipo);

/** Mano en la que el 0 tiene 33 de envido y gana dos bazas; el 1, 5 de envido. */
const FUERTE: IdCarta[][] = [
  ['espadas-1', 'oros-7', 'oros-6'],
  ['copas-4', 'bastos-5', 'espadas-12'],
];

// ── Reparto y bazas ──────────────────────────────────────────────────────────

describe('reparto y bazas', () => {
  it('3 cartas a cada uno; reparte el último y es mano el 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([3, 3]);
    expect(e.repartidor).toBe(1);
    expect(actorTruco(e)).toBe(0);
    const c = nueva({ jugadores: 4 });
    expect(c.repartidor).toBe(3);
    expect(new Set(c.manos.flat()).size).toBe(12);
  });

  it('el As de espadas gana al As de bastos', () => {
    let e = mesa([
      ['bastos-1', 'copas-4', 'copas-5'],
      ['espadas-1', 'oros-4', 'oros-5'],
    ]);
    e = jugar(e, 'bastos-1');
    e = jugar(e, 'espadas-1');
    expect(e.bazasJugadas[0]!.ganador).toBe(1);
  });

  it('parda en la primera y el rival gana la segunda: gana la mano el rival', () => {
    let e = mesa([
      ['copas-3', 'copas-4', 'oros-5'],
      ['oros-3', 'espadas-1', 'bastos-5'],
    ]);
    e = jugar(e, 'copas-3');
    e = jugar(e, 'oros-3');
    expect(e.bazasJugadas[0]!.ganador).toBeNull();
    e = jugar(e, 'copas-4');
    e = jugar(e, 'espadas-1');
    expect(e.resultadosManos.at(-1)!.ganadorMano).toBe(1);
    expect(e.puntos).toEqual([0, 1]);
  });
});

// ── Envido ───────────────────────────────────────────────────────────────────

describe('envido', () => {
  it('valores querido y no querido de cada cadena', () => {
    const p: [number, number] = [0, 0];
    expect(valorCantosTruco(['envido'], p, 30)).toBe(2);
    expect(valorCantosTruco(['real'], p, 30)).toBe(3);
    expect(valorCantosTruco(['envido', 'envido', 'real'], p, 30)).toBe(7);
    expect(valorCantosTruco(['envido', 'falta'], [22, 10], 30)).toBe(8);
    expect(valorNoQueridoTruco(['envido'], p, 30)).toBe(1);
    expect(valorNoQueridoTruco(['real'], p, 30)).toBe(1);
    expect(valorNoQueridoTruco(['envido', 'envido'], p, 30)).toBe(2);
    expect(valorNoQueridoTruco(['envido', 'envido', 'real'], p, 30)).toBe(4);
    expect(valorNoQueridoTruco(['envido', 'envido', 'real', 'falta'], p, 30)).toBe(7);
  });

  it('orden de las subidas: dos envidos, el real y la falta', () => {
    expect(cantosPosiblesTruco([])).toEqual(['envido', 'real', 'falta']);
    expect(cantosPosiblesTruco(['envido'])).toEqual(['envido', 'real', 'falta']);
    expect(cantosPosiblesTruco(['envido', 'envido'])).toEqual(['real', 'falta']);
    expect(cantosPosiblesTruco(['real'])).toEqual(['falta']);
    expect(cantosPosiblesTruco(['falta'])).toEqual([]);
  });

  it('envido querido: el ganador cobra 2 al terminar la mano y se muestran los puntos', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('envido'));
    expect(actorTruco(e)).toBe(1);
    e = hacer(e, tipo('quiero'));
    expect(e.envido.ganador).toBe(0);
    expect(e.envido.mostrado).toEqual([33, 5]);
    expect(actorTruco(e)).toBe(0);
    e = jugar(e, 'espadas-1');
    e = jugar(e, 'copas-4');
    e = jugar(e, 'oros-7');
    e = jugar(e, 'bastos-5');
    expect(e.resultadosManos.at(-1)!.puntosEnvido).toEqual([2, 0]);
    expect(e.puntos).toEqual([3, 0]);
  });

  it('envido, envido y real envido no querido: 4 para el que cantó el real', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('envido'));
    e = hacer(e, tipo('envido'));
    expect(actorTruco(e)).toBe(0);
    e = hacer(e, tipo('realEnvido'));
    e = hacer(e, tipo('noQuiero'));
    expect(e.envido.ganador).toBe(0);
    expect(e.envido.valor).toBe(4);
  });

  it('real envido sin nada antes, no querido: 1', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('realEnvido'));
    e = hacer(e, tipo('noQuiero'));
    expect(e.envido.valor).toBe(1);
  });

  it('falta envido con 22 a 10: 8 puntos', () => {
    let e = mesa(FUERTE, { puntos: [10, 22] });
    e = hacer(e, tipo('faltaEnvido'));
    e = hacer(e, tipo('quiero'));
    expect(e.envido.valor).toBe(8);
    expect(e.envido.ganador).toBe(0);
  });

  it('no se canta envido tras aceptar el truco ni después de la primera baza', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('truco'));
    e = hacer(e, tipo('quiero'));
    expect(tipos(e)).not.toContain('envido');
    let f = mesa(FUERTE);
    f = jugar(f, 'oros-6');
    f = jugar(f, 'copas-4');
    expect(tipos(f)).not.toContain('envido');
  });

  it('el envido está primero: ante un truco se puede cantar envido y después se responde', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('truco'));
    expect(tipos(e)).toEqual(
      expect.arrayContaining(['quiero', 'noQuiero', 'truco', 'envido', 'realEnvido']),
    );
    e = hacer(e, tipo('envido'));
    expect(actorTruco(e)).toBe(0);
    e = hacer(e, tipo('quiero'));
    // Ahora responde el 1 al truco.
    expect(actorTruco(e)).toBe(1);
    expect(tipos(e)).toEqual(['quiero', 'noQuiero', 'truco', 'meVoy']);
  });
});

// ── Truco ────────────────────────────────────────────────────────────────────

describe('truco', () => {
  it('truco querido: el bando que gana la mano cobra 2', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('truco'));
    e = hacer(e, tipo('quiero'));
    e = jugar(e, 'espadas-1');
    e = jugar(e, 'copas-4');
    e = jugar(e, 'oros-7');
    e = jugar(e, 'bastos-5');
    expect(e.resultadosManos.at(-1)!.puntosTruco).toEqual([2, 0]);
  });

  it('retruco no querido: el que retrucó cobra 2', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('truco'));
    e = hacer(e, tipo('truco'));
    expect(e.truco).toMatchObject({ nivel: 1, pendiente: 2 });
    e = hacer(e, tipo('noQuiero'));
    expect(e.resultadosManos.at(-1)).toMatchObject({ ganadorMano: 1, puntosTruco: [0, 2] });
  });

  it('solo sube quien aceptó, y el vale cuatro es lo más alto', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('truco'));
    e = hacer(e, tipo('quiero'));
    // Le toca jugar al 0, que cantó: no puede subir.
    expect(tipos(e)).not.toContain('truco');
    e = jugar(e, 'oros-6');
    // El 1 aceptó: puede retrucar.
    expect(tipos(e)).toContain('truco');
    e = hacer(e, tipo('truco'));
    e = hacer(e, tipo('truco'));
    expect(e.truco).toMatchObject({ nivel: 2, pendiente: 3 });
    expect(tipos(e)).toEqual(['quiero', 'noQuiero', 'meVoy']);
  });
});

// ── Mazo y partida ───────────────────────────────────────────────────────────

describe('irse al mazo y partida', () => {
  it('irse al mazo sin apuestas: el rival cobra 1', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('meVoy'));
    expect(e.puntos).toEqual([0, 1]);
    expect(e.resultadosManos.at(-1)!.seFue).toBe(0);
  });

  it('irse con un envido pendiente cuenta como no querido', () => {
    let e = mesa(FUERTE);
    e = hacer(e, tipo('envido'));
    e = hacer(e, tipo('meVoy'));
    expect(e.resultadosManos.at(-1)).toMatchObject({ puntosEnvido: [1, 0], puntosTruco: [1, 0] });
  });

  it('con 28 gana el envido de 2 y llega a 30: el truco no se suma', () => {
    let e = mesa(FUERTE, { puntos: [28, 20] });
    e = hacer(e, tipo('envido'));
    e = hacer(e, tipo('quiero'));
    e = hacer(e, tipo('truco'));
    e = hacer(e, tipo('quiero'));
    e = hacer(e, tipo('meVoy'));
    expect(e.puntos).toEqual([30, 20]);
    expect(e.resultadosManos.at(-1)!.puntosTruco).toEqual([0, 0]);
    expect(truco.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [30, 20] });
    expect(truco.accionesLegales(e, 0)).toEqual([]);
  });

  it('con 29 gana una mano sin truco y llega a 30', () => {
    let e = mesa(FUERTE, { puntos: [29, 0] });
    e = jugar(e, 'espadas-1');
    e = jugar(e, 'copas-4');
    e = jugar(e, 'oros-7');
    e = jugar(e, 'bastos-5');
    expect(e.puntos).toEqual([30, 0]);
    expect(truco.resultado(e)!.ganadores).toEqual([0]);
  });
});

describe('vista', () => {
  it('no contiene las cartas de los demás', () => {
    const e = nueva({ jugadores: 4 });
    const v = truco.vistaDe(e, 0);
    for (const c of e.manos.slice(1).flat()) expect(JSON.stringify(v)).not.toContain(`"${c}"`);
  });
});

describirContrato(truco, {
  configs: [CONFIG_TRUCO_POR_DEFECTO, { jugadores: 4, meta: 30 }],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  // Irse al mazo acaba enseguida: el juego al azar lo evita si tiene otra cosa.
  evitar: (a) => a.tipo === 'meVoy',
  pasosMaximos: 3_000,
});
