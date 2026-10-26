import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  casino,
  CONFIG_CASINO_POR_DEFECTO,
  puntuarManoCasino,
  recogidaCasino,
  type AccionCasino,
  type ConfigCasino,
  type ConstruccionCasino,
  type ElementoMesaCasino,
  type EstadoCasino,
} from '../../src/juegos/casino';
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

const sueltas = (texto: string): ElementoMesaCasino[] =>
  c(texto).map((carta) => ({ tipo: 'carta', carta }));

function construccion(
  id: number,
  valor: number,
  cartas: string,
  duenio: number,
  multiple = false,
): ConstruccionCasino {
  return { tipo: 'construccion', id, valor, cartas: c(cartas), duenio, multiple };
}

function nueva(config: Partial<ConfigCasino> = {}, semilla = 'casino'): EstadoCasino {
  const r = casino.crear({ ...CONFIG_CASINO_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

type Parcial = Omit<Partial<EstadoCasino>, 'config'> & { config?: Partial<ConfigCasino> };

function mesa(parcial: Parcial = {}): EstadoCasino {
  const config = { ...CONFIG_CASINO_POR_DEFECTO, ...parcial.config };
  const n = config.jugadores;
  const bandos = config.parejas ? 2 : n;
  return {
    azar: crearAzar('mesa'),
    repartidor: n - 1,
    // Mazo con cartas: la jugada no es la última de la mano.
    mazo: c('Kt Kc Kd Kp Qt Qc Qd Qp'),
    mesa: [],
    manos: Array.from({ length: n }, () => c('Jt')),
    turno: 0,
    siguienteId: 10,
    recogidas: Array.from({ length: bandos }, () => []),
    barridas: new Array<number>(bandos).fill(0),
    ultimoEnRecoger: null,
    ultimaAccion: null,
    resultadosManos: [],
    ...parcial,
    config,
  };
}

function jugar(e: EstadoCasino, accion: AccionCasino): EstadoCasino {
  const r = aplicar(casino, e, e.turno, accion);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const legales = (e: EstadoCasino) => casino.accionesLegales(e, e.turno);
const recoger = (texto: string): AccionCasino => ({ tipo: 'recoger', carta: c(texto)[0]! });

describe('reparto', () => {
  it('2 jugadores: 4 cartas cada uno, 4 en la mesa y 40 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([4, 4]);
    expect(e.mesa).toHaveLength(4);
    expect(e.mazo).toHaveLength(40);
    expect(e.turno).toBe(0);
  });

  it('nuevo reparto de 4 sin poner cartas en la mesa', () => {
    let e = mesa({
      mazo: nueva().mazo,
      manos: [c('Jt'), c('Jc')],
      mesa: sueltas('2t'),
    });
    e = jugar(e, { tipo: 'dejar', carta: c('Jt')[0]! });
    e = jugar(e, { tipo: 'dejar', carta: c('Jc')[0]! });
    expect(e.manos.map((m) => m.length)).toEqual([4, 4]);
    expect(e.mesa).toHaveLength(3);
    expect(e.mazo).toHaveLength(32);
  });

  it('valida la configuración', () => {
    expect(casino.crear({ jugadores: 5 as 4, parejas: false }, 's').ok).toBe(false);
    expect(casino.crear({ jugadores: 3, parejas: true }, 's').ok).toBe(false);
    expect(casino.crear({ jugadores: 4, parejas: true }, 's').ok).toBe(true);
    expect(nueva({ jugadores: 3 }).mazo).toHaveLength(36);
  });
});

describe('recoger', () => {
  it('una figura solo recoge por pareja', () => {
    const e = mesa({
      manos: [c('Qt 10t'), c('2c')],
      mesa: [...sueltas('Qc'), construccion(1, 10, '6p 4p', 1)],
    });
    expect(recogidaCasino(e.mesa, c('Qt')[0]!)).toEqual({ sueltas: c('Qc'), construcciones: [] });
    const tras = jugar(e, recoger('Qt'));
    expect(tras.mesa).toEqual([construccion(1, 10, '6p 4p', 1)]);
  });

  it('por número y por suma, con el máximo de cartas', () => {
    const e = mesa({ manos: [c('8t'), c('2c')], mesa: sueltas('8c 5d 3p 2t') });
    const tras = jugar(e, recoger('8t'));
    expect(tras.mesa).toEqual(sueltas('2t'));
    expect(tras.recogidas[0]).toEqual(c('8t 8c 5d 3p'));
    expect(tras.ultimoEnRecoger).toBe(0);
    expect(tras.ultimaAccion?.barrida).toBe(false);
  });

  it('elige las combinaciones disjuntas que se llevan más cartas', () => {
    // 6 = 4+2 = 3+2+1: con 4 2 3 1 se lleva 4+2 o 3+2+1, pero no las dos (comparten el 2).
    expect(recogidaCasino(sueltas('4t 2t 3t At'), c('6c')[0]!)!.sueltas).toEqual(c('2t 3t At'));
    // 5 = 4+1 = 3+2: dos combinaciones disjuntas.
    expect(recogidaCasino(sueltas('4t At 3t 2t'), c('5c')[0]!)!.sueltas).toEqual(c('4t At 3t 2t'));
  });

  it('se lleva las construcciones de su valor', () => {
    const e = mesa({
      manos: [c('8t'), c('2c')],
      mesa: [construccion(1, 8, '5d 3p', 0), ...sueltas('8c 9t')],
    });
    const tras = jugar(e, recoger('8t'));
    expect(tras.mesa).toEqual(sueltas('9t'));
    expect(tras.recogidas[0]).toEqual(c('8t 5d 3p 8c'));
  });

  it('barrida si deja la mesa vacía', () => {
    const e = mesa({ manos: [c('9t Jt'), c('2c')], mesa: sueltas('4c 5c') });
    const tras = jugar(e, recoger('9t'));
    expect(tras.mesa).toEqual([]);
    expect(tras.barridas).toEqual([1, 0]);
    expect(tras.ultimaAccion?.barrida).toBe(true);
  });

  it('sin barrida en la última jugada de la mano', () => {
    const e = mesa({ mazo: [], manos: [c('9t'), []], mesa: sueltas('4c 5c'), turno: 0 });
    const tras = jugar(e, recoger('9t'));
    const r = tras.resultadosManos[0]!;
    expect(r.recuento[0]!.barridas).toBe(0);
    expect(r.recuento[0]!.cartas).toBe(3);
  });

  it('no hay acción de recoger si la carta no recoge nada', () => {
    const e = mesa({ manos: [c('9t Jt'), c('2c')], mesa: sueltas('4c Qc') });
    expect(legales(e).filter((a) => a.tipo === 'recoger')).toEqual([]);
  });
});

describe('construir', () => {
  const construcciones = (e: EstadoCasino) => legales(e).filter((a) => a.tipo === 'construir');

  it('construir un 8 con un 3 sobre un 5 teniendo un 8', () => {
    const e = mesa({ manos: [c('3t 8t'), c('2c')], mesa: sueltas('5c') });
    const accion: AccionCasino = {
      tipo: 'construir',
      carta: c('3t')[0]!,
      cartas: c('5c'),
      construccion: null,
      valor: 8,
    };
    expect(construcciones(e)).toContainEqual(accion);
    const tras = jugar(e, accion);
    expect(tras.mesa).toEqual([construccion(10, 8, '5c 3t', 0)]);
    expect(tras.siguienteId).toBe(11);
  });

  it('sin la carta del valor no se construye', () => {
    const e = mesa({ manos: [c('3t 7t'), c('2c')], mesa: sueltas('5c') });
    expect(construcciones(e)).toEqual([]);
  });

  it('subir una construcción del rival', () => {
    const e = mesa({ manos: [c('2t 8t'), c('2c')], mesa: [construccion(1, 6, '4c 2d', 1)] });
    const accion: AccionCasino = {
      tipo: 'construir',
      carta: c('2t')[0]!,
      cartas: [],
      construccion: 1,
      valor: 8,
    };
    expect(construcciones(e)).toContainEqual(accion);
    expect(jugar(e, accion).mesa).toEqual([construccion(1, 8, '4c 2d 2t', 0)]);
  });

  it('hacer múltiple una construcción, que ya no se puede subir', () => {
    const e = mesa({
      manos: [c('8t 8c At'), c('2c')],
      mesa: [construccion(1, 8, '5d 3p', 0)],
    });
    const multiple: AccionCasino = {
      tipo: 'construir',
      carta: c('8t')[0]!,
      cartas: [],
      construccion: 1,
      valor: 8,
    };
    expect(construcciones(e)).toContainEqual(multiple);
    const tras = jugar(e, multiple);
    expect(tras.mesa).toEqual([construccion(1, 8, '5d 3p 8t', 0, true)]);
    const rival = { ...tras, turno: 0, manos: [c('At 9t'), c('2c')] };
    expect(construcciones(rival)).toEqual([]);
  });

  it('hacer múltiple con cartas sueltas que suman su valor', () => {
    const e = mesa({
      manos: [c('5t 8t'), c('2c')],
      mesa: [construccion(1, 8, '6d 2p', 0), ...sueltas('3c')],
    });
    const accion: AccionCasino = {
      tipo: 'construir',
      carta: c('5t')[0]!,
      cartas: c('3c'),
      construccion: 1,
      valor: 8,
    };
    expect(construcciones(e)).toContainEqual(accion);
    expect(jugar(e, accion).mesa).toEqual([construccion(1, 8, '6d 2p 3c 5t', 0, true)]);
  });

  it('las figuras no construyen', () => {
    const e = mesa({ manos: [c('Qt 10t'), c('2c')], mesa: sueltas('3c') });
    expect(construcciones(e).filter((a) => a.carta === c('Qt')[0])).toEqual([]);
  });
});

describe('dejar', () => {
  it('con una construcción propia no se deja carta', () => {
    const e = mesa({ manos: [c('8t 2t'), c('2c')], mesa: [construccion(1, 8, '5d 3p', 0)] });
    expect(legales(e).filter((a) => a.tipo === 'dejar')).toEqual([]);
  });

  it('se deja si no queda otra jugada', () => {
    const e = mesa({ manos: [c('Jt'), c('2c')], mesa: [construccion(1, 8, '5d 3p', 0)] });
    expect(legales(e)).toEqual([{ tipo: 'dejar', carta: c('Jt')[0]! }]);
  });
});

describe('puntos y partida', () => {
  it('desglose de una mano', () => {
    const resto = c('2c 3c 4c 5c 6c 7c 8c 9c 10c Jc Qc Kc 2t 3t 4t 5t 6t 7t 8t 9t 10t Jt Qt Kt');
    const a = [...c('3p 4p 5p 6p 7p 8p 9p 10p 10d Ac At'), ...resto.slice(0, 19)];
    const b = [...c('2p Jp Qp Kp Ap Ad 2d 3d 4d 5d 6d 7d 8d 9d Jd Qd Kd'), ...resto.slice(19)];
    expect(a).toHaveLength(30);
    expect(b).toHaveLength(22);
    const r = puntuarManoCasino([a, b], [1, 0], [0, 0]);
    expect(r.puntos.map((p) => p.total)).toEqual([9, 3]);
    expect(r.puntos[0]).toMatchObject({ cartas: 3, picas: 1, bigCasino: 2, ases: 2, barridas: 1 });
    expect(r.puntos[1]).toMatchObject({ cartas: 0, picas: 0, littleCasino: 1, ases: 2 });
  });

  it('la mesa va al último que recogió y la partida termina al llegar a 21', () => {
    const anterior = puntuarManoCasino([[], []], [0, 0], [20, 15]);
    const e = mesa({
      mazo: [],
      manos: [c('2t'), []],
      mesa: sueltas('10d 9c'),
      ultimoEnRecoger: 1,
      resultadosManos: [{ ...anterior, totales: [15, 20] }],
    });
    const tras = jugar(e, { tipo: 'dejar', carta: c('2t')[0]! });
    const r = tras.resultadosManos[1]!;
    expect(r.recuento[1]!.cartas).toBe(3);
    expect(r.totales).toEqual([15, 25]);
    expect(casino.resultado(tras)).toEqual({ ganadores: [1], empate: false, puntos: [15, 25] });
  });

  it('con empate arriba se juega otra mano', () => {
    const anterior = puntuarManoCasino([[], []], [0, 0], [0, 0]);
    const e = mesa({
      mazo: [],
      manos: [c('Jt'), []],
      ultimoEnRecoger: null,
      resultadosManos: [{ ...anterior, totales: [21, 21] }],
    });
    const tras = jugar(e, { tipo: 'dejar', carta: c('Jt')[0]! });
    expect(casino.resultado(tras)).toBeNull();
    expect(tras.manos.map((m) => m.length)).toEqual([4, 4]);
  });

  it('en parejas, las recogidas y los puntos son de la pareja', () => {
    const e = nueva({ jugadores: 4, parejas: true });
    expect(e.recogidas).toHaveLength(2);
    expect(casino.vistaDe(e, 2).puntos).toEqual([0, 0]);
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni el mazo', () => {
    const e = nueva();
    const texto = JSON.stringify(casino.vistaDe(e, 0));
    for (const carta of [...e.manos[1]!, ...e.mazo]) expect(texto).not.toContain(`"${carta}"`);
  });
});

describirContrato(casino, {
  configs: [
    CONFIG_CASINO_POR_DEFECTO,
    { jugadores: 3, parejas: false },
    { jugadores: 4, parejas: true },
    { jugadores: 4, parejas: false },
  ],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
  pasosMaximos: 200,
  ejecuciones: 30,
});
