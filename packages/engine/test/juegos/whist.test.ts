import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_WHIST_POR_DEFECTO,
  whist,
  type AccionWhist,
  type EstadoWhist,
} from '../../src/juegos/whist';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

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

function nueva(semilla = 'whist'): EstadoWhist {
  const r = whist.crear(CONFIG_WHIST_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoWhist, texto: string): EstadoWhist {
  const accion: AccionWhist = { tipo: 'jugar', carta: c(texto)[0]! };
  const r = aplicar(whist, e, e.turno, accion);
  if (!r.ok) throw new Error(`${texto} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada a mano: le toca al asiento 0, el repartidor es el 3 y el triunfo, picas. */
function mesa(manos: string[], parcial: Partial<EstadoWhist> = {}): EstadoWhist {
  return {
    ...nueva(),
    manos: manos.map(c),
    triunfo: 'picas',
    cartaTriunfo: null,
    repartidor: 3,
    turno: 0,
    mesa: [],
    bazas: [0, 0, 0, 0],
    fallos: [[], [], [], []],
    ...parcial,
  };
}

describe('Reparto y triunfo del Whist', () => {
  it('13 cartas a cada uno, y la carta del triunfo es la última del repartidor', () => {
    for (let i = 0; i < 8; i++) {
      const e = nueva(`reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([13, 13, 13, 13]);
      expect(new Set(e.manos.flat()).size).toBe(52);
      expect(e.manos[e.repartidor]).toContain(e.cartaTriunfo);
      expect(e.cartaTriunfo!.startsWith(e.triunfo)).toBe(true);
      expect(e.turno).toBe((e.repartidor + 1) % 4);
      expect(whist.vistaDe(e, 1).cartaTriunfo).toBe(e.cartaTriunfo);
    }
  });

  it('al jugar la carta del triunfo, el palo sigue siendo triunfo', () => {
    let e = mesa(['5c 8d', '6c 9d', '7c 10d', '2p Jd'], { cartaTriunfo: c('2p')[0]!, turno: 0 });
    e = hacer(e, '5c');
    e = hacer(e, '6c');
    e = hacer(e, '7c');
    // El repartidor (3) no tiene corazones: falla con la carta del triunfo y gana.
    e = hacer(e, '2p');
    expect(e.cartaTriunfo).toBeNull();
    expect(e.triunfo).toBe('picas');
    expect(e.ultimaBaza?.ganador).toBe(3);
  });

  it('el repartidor rota cada mano', () => {
    let e = mesa(['5c', '6c', '7c', '8c']);
    for (const t of ['5c', '6c', '7c', '8c']) e = hacer(e, t);
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
  });
});

describe('Bazas del Whist', () => {
  it('hay que seguir el palo de salida', () => {
    const e = mesa(['5c', '6c 9p', '', ''], {
      turno: 1,
      mesa: [{ asiento: 0, carta: c('5c')[0]! }],
      manos: [[], c('6c 9p'), c('2d'), c('3d')],
    });
    const legales = whist.accionesLegales(e, 1).map((a) => a.carta);
    expect(legales).toEqual(c('6c'));
  });

  it('fallar con un triunfo gana la baza, salvo un triunfo más alto', () => {
    let e = mesa(['Ac', '2p', '9p', 'Kc']);
    e = hacer(e, 'Ac');
    e = hacer(e, '2p');
    e = hacer(e, '9p');
    e = hacer(e, 'Kc');
    expect(e.ultimaBaza?.ganador).toBe(2);
  });

  it('sin triunfos gana la más alta del palo de salida, y el As es la más alta', () => {
    let e = mesa(['Kc', 'Ac', 'Ad', '2c']);
    for (const t of ['Kc', 'Ac', 'Ad', '2c']) e = hacer(e, t);
    expect(e.ultimaBaza?.ganador).toBe(1);
  });

  it('quien gana la baza sale en la siguiente', () => {
    let e = mesa(['Kc 3t', 'Ac 4t', '2c 5t', '3c 6t']);
    for (const t of ['Kc', 'Ac', '2c', '3c']) e = hacer(e, t);
    expect(e.turno).toBe(1);
  });
});

describe('Puntos, juegos y partida del Whist', () => {
  /** Cierra la mano con estas bazas por jugador (la última baza la juega el asiento 0). */
  function cerrar(bazas: number[], parcial: Partial<EstadoWhist> = {}): EstadoWhist {
    let e = mesa(['Ap', '2c', '3c', '4c'], { bazas, ...parcial });
    for (const t of ['Ap', '2c', '3c', '4c']) e = hacer(e, t);
    return e;
  }

  it('8 bazas contra 5 suman 2 puntos', () => {
    // El asiento 0 gana la última baza: la pareja 0 pasa de 7 a 8.
    const e = cerrar([4, 2, 3, 3]);
    const r = e.resultadosManos.at(-1)!;
    expect(r.bazas).toEqual([8, 5]);
    expect(r.puntosMano).toEqual([2, 0]);
    expect(e.puntos).toEqual([2, 0]);
  });

  it('con 4 puntos y 9 bazas se gana el juego y el siguiente empieza de 0', () => {
    const e = cerrar([5, 2, 3, 2], { puntos: [4, 3] });
    const r = e.resultadosManos.at(-1)!;
    expect(r.puntosTras).toEqual([7, 3]);
    expect(r.ganaJuego).toBe(0);
    expect(e.juegos).toEqual([1, 0]);
    expect(e.puntos).toEqual([0, 0]);
    expect(whist.resultado(e)).toBeNull();
  });

  it('el segundo juego gana la partida', () => {
    const e = cerrar([5, 2, 3, 2], { puntos: [4, 3], juegos: [1, 1] });
    expect(e.juegos).toEqual([2, 1]);
    expect(whist.resultado(e)).toEqual({ ganadores: [0, 2], empate: false, puntos: [2, 1, 2, 1] });
    expect(whist.accionesLegales(e, e.turno)).toEqual([]);
  });
});

describe('Vista del jugador en el Whist', () => {
  it('ve la carta del triunfo, pero no las demás cartas ajenas', () => {
    const e = nueva('vista');
    const yo = (e.repartidor + 1) % 4;
    const v = whist.vistaDe(e, yo);
    expect(v.cartaTriunfo).toBe(e.cartaTriunfo);
    const texto = JSON.stringify(v);
    for (let a = 0; a < 4; a++) {
      if (a === yo) continue;
      for (const carta of e.manos[a]!) {
        if (carta !== e.cartaTriunfo) expect(texto).not.toContain(`"${carta}"`);
      }
    }
  });
});

describirContrato(whist, {
  configs: [CONFIG_WHIST_POR_DEFECTO],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []), e.cartaTriunfo]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 300,
});
