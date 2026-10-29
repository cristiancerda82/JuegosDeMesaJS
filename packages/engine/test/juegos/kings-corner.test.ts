import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  CONFIG_KINGS_CORNER_POR_DEFECTO,
  kingsCorner,
  type AccionKingsCorner,
  type EstadoKingsCorner,
} from '../../src/juegos/kings-corner';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «Ap» es el As de picas; c, d y t, corazones, diamantes y tréboles. */
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
const una = (t: string) => c(t)[0]!;

function nueva(jugadores = 2, semilla = 'kings'): EstadoKingsCorner {
  const r = kingsCorner.crear({ jugadores }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoKingsCorner, accion: AccionKingsCorner): EstadoKingsCorner {
  const r = aplicar(kingsCorner, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoKingsCorner) => kingsCorner.accionesLegales(e, e.turno);

/** Un estado preparado a dos: le toca al 0. */
function preparado(parcial: Partial<EstadoKingsCorner>): EstadoKingsCorner {
  return {
    ...nueva(),
    manos: [c('7c 7t Kd 6c'), c('2p 3p')],
    mazo: c('4d 5d'),
    pilas: [c('8p'), c('10t'), c('9c'), c('2d'), [], [], [], []],
    turno: 0,
    pasesSeguidos: 0,
    ganador: null,
    ultimaAccion: null,
    ...parcial,
  };
}

describe('reparto', () => {
  it('7 cartas, la cruz de 4, esquinas vacías, y el primero roba', () => {
    const e = nueva(3);
    expect(e.manos.map((m) => m.length)).toEqual([8, 7, 7]);
    expect(e.pilas.slice(0, 4).map((p) => p.length)).toEqual([1, 1, 1, 1]);
    expect(e.pilas.slice(4).every((p) => p.length === 0)).toBe(true);
    expect(e.mazo).toHaveLength(52 - 21 - 4 - 1);
  });

  it('de 2 a 4 jugadores', () => {
    expect(kingsCorner.crear({ jugadores: 1 }, 'x').ok).toBe(false);
    expect(kingsCorner.crear({ jugadores: 5 }, 'x').ok).toBe(false);
  });
});

describe('pilas', () => {
  it('uno menos y del color contrario', () => {
    const e = preparado({});
    const sobre8p = legales(e).filter((a) => a.tipo === 'jugar' && a.pila === 0);
    expect(sobre8p).toEqual([{ tipo: 'jugar', carta: una('7c'), pila: 0 }]);
  });

  it('el K va a una esquina vacía, y nada más empieza una esquina', () => {
    const e = preparado({});
    const esquinas = legales(e).filter((a) => a.tipo === 'jugar' && a.pila >= 4);
    expect(esquinas).toEqual([{ tipo: 'jugar', carta: una('Kd'), pila: 4 }]);
  });

  it('un hueco lateral admite cualquier carta', () => {
    const e = preparado({ pilas: [[], c('10t'), c('9c'), c('2d'), [], [], [], []] });
    const hueco = legales(e).filter((a) => a.tipo === 'jugar' && a.pila === 0);
    expect(hueco).toHaveLength(4);
  });
});

describe('el turno', () => {
  it('mover una pila entera deja un hueco', () => {
    let e = preparado({});
    expect(legales(e)).toContainEqual({ tipo: 'mover', desde: 2, a: 1 });
    e = jugar(e, { tipo: 'mover', desde: 2, a: 1 });
    expect(e.pilas[1]).toEqual(c('10t 9c'));
    expect(e.pilas[2]).toEqual([]);
  });

  it('pasar: le toca al siguiente, que roba', () => {
    const e = jugar(preparado({}), { tipo: 'pasar' });
    expect(e.turno).toBe(1);
    expect(e.manos[1]).toEqual(c('2p 3p 5d'));
    expect(e.mazo).toEqual(c('4d'));
  });
});

describe('fin', () => {
  it('gana quien se queda sin cartas', () => {
    const e = jugar(preparado({ manos: [c('7c'), c('2p 3p')] }), {
      tipo: 'jugar',
      carta: una('7c'),
      pila: 0,
    });
    expect(kingsCorner.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [0, 2] });
    expect(legales(e)).toEqual([]);
  });

  it('bloqueo con el mazo vacío: gana quien tiene menos', () => {
    let e = preparado({ mazo: [], manos: [c('3p'), c('2p 3c')] });
    e = jugar(e, { tipo: 'pasar' });
    expect(kingsCorner.resultado(e)).toBeNull();
    e = jugar(e, { tipo: 'pasar' });
    expect(kingsCorner.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [1, 2] });
  });

  it('bloqueo con empate', () => {
    let e = preparado({ mazo: [], manos: [c('3p'), c('2c')] });
    e = jugar(e, { tipo: 'pasar' });
    e = jugar(e, { tipo: 'pasar' });
    expect(kingsCorner.resultado(e)).toEqual({ ganadores: [0, 1], empate: true, puntos: [1, 1] });
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni el mazo', () => {
    const e = nueva(3);
    const texto = JSON.stringify(kingsCorner.vistaDe(e, 0));
    for (const x of [...e.manos.slice(1).flat(), ...e.mazo]) expect(texto).not.toContain(`"${x}"`);
  });
});

describirContrato(kingsCorner, {
  configs: [2, 3, 4].map((jugadores) => ({ ...CONFIG_KINGS_CORNER_POR_DEFECTO, jugadores })),
  cartasOcultas: (e, asiento) => [
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
    ...e.mazo,
  ],
  // Pasar sin parar alarga mucho las partidas al azar.
  evitar: (a) => a.tipo === 'pasar',
  pasosMaximos: 1_000,
});
