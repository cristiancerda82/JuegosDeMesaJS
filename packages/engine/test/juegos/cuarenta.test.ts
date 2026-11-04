import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_CUARENTA,
  capturasCuarenta,
  cartonesCuarenta,
  CONFIG_CUARENTA_POR_DEFECTO,
  cuarenta,
  escaleraCuarenta,
  rangoCuarenta,
  type AccionCuarenta,
  type EstadoCuarenta,
} from '../../src/juegos/cuarenta';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «5p» es el 5 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(jugadores: 2 | 4 = 2, semilla = 'cuarenta'): EstadoCuarenta {
  const r = cuarenta.crear({ jugadores, meta: 40 }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoCuarenta, carta: string, captura = ''): EstadoCuarenta {
  const a: AccionCuarenta = { tipo: 'jugar', carta: c(carta)[0]!, captura: c(captura) };
  const r = aplicar(cuarenta, e, e.turno, a);
  if (!r.ok) throw new Error(`${carta} ${captura} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada con 2: le toca al 0, con el mazo vacío salvo que se diga otra cosa. */
function mesa(
  manos: string[],
  enMesa: string,
  parcial: Partial<EstadoCuarenta> = {},
): EstadoCuarenta {
  return {
    ...nueva(),
    manos: manos.map(c),
    mesa: c(enMesa),
    mazo: [],
    turno: 0,
    caible: null,
    rondas: [],
    jugadasReparto: manos.map(() => []),
    ...parcial,
  };
}

describe('Baraja y repartos del Cuarenta', () => {
  it('la baraja tiene 40 cartas sin 8, 9 ni 10', () => {
    expect(BARAJA_CUARENTA).toHaveLength(40);
    expect(BARAJA_CUARENTA.some((x) => /-(8|9|10)$/.test(x))).toBe(false);
  });

  it('con 2: 5 cartas a cada uno, la mesa vacía y 30 en el mazo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.mesa).toEqual([]);
    expect(e.mazo).toHaveLength(30);
    expect(e.turno).toBe(0);
  });

  it('con 4: 5 cartas a cada uno y 20 en el mazo', () => {
    const e = nueva(4);
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
    expect(e.mesa).toEqual([]);
    expect(e.mazo).toHaveLength(20);
  });

  it('cuando los dos juegan su quinta carta, otras 5 a cada uno', () => {
    let e = nueva();
    for (let i = 0; i < 10; i++) {
      const acciones = cuarenta.accionesLegales(e, e.turno);
      e = cuarenta.transicion(e, e.turno, acciones.at(-1)!);
    }
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.mazo).toHaveLength(20);
    expect(e.jugadasReparto).toEqual([[], []]);
  });

  it('el rango de la escalera: la J sigue al 7 y la K es la última', () => {
    expect(c('Ap 7p Jp Qp Kp').map(rangoCuarenta)).toEqual([1, 7, 8, 9, 10]);
  });
});

describe('Ronda del Cuarenta', () => {
  it('quien recibe tres o cuatro iguales anota 4 y todos lo ven', () => {
    let e: EstadoCuarenta | null = null;
    for (let i = 0; i < 300 && !e; i++) {
      const n = nueva(2, `ronda-${i}`);
      if (n.rondas.length > 0) e = n;
    }
    expect(e).not.toBeNull();
    const ronda = e!.rondas[0]!;
    const iguales = e!.manos[ronda.asiento]!.filter((x) => rangoCuarenta(x) === ronda.rango);
    expect(iguales.length).toBe(ronda.cartas);
    expect(e!.puntos[ronda.asiento % 2]).toBe(
      4 * e!.rondas.filter((r) => r.asiento % 2 === ronda.asiento % 2).length,
    );
    const otro = (ronda.asiento + 1) % 2;
    expect(cuarenta.vistaDe(e!, otro).rondas).toContainEqual(ronda);
  });
});

describe('Capturas del Cuarenta', () => {
  it('por rango, o dejar la carta', () => {
    const e = mesa(['Qp 2c', 'Ad'], 'Qc 3d');
    const legales = cuarenta.accionesLegales(e, 0).filter((a) => a.carta === c('Qp')[0]);
    expect(legales.map((a) => a.captura)).toEqual([c('Qc'), []]);
  });

  it('por suma, con dos o más cartas del As al 7', () => {
    expect(capturasCuarenta(c('Ap 2c 4d'), c('7t')[0]!)).toContainEqual(c('Ap 2c 4d'));
  });

  it('las figuras no suman', () => {
    expect(capturasCuarenta(c('3p 5c'), c('Jt')[0]!)).toEqual([]);
    expect(capturasCuarenta(c('Jp 3c'), c('Kt')[0]!)).toEqual([]);
  });

  it('escalera: se lleva el 3 y el 4, pero no el 6', () => {
    const e = hacer(mesa(['2p', 'Ad'], '2c 3d 4t 6p'), '2p', '2c');
    expect(e.recogidas[0]).toEqual(c('2p 2c 3d 4t'));
    expect(e.mesa).toEqual(c('6p'));
  });

  it('la J sigue al 7, y la K no entra sin la Q', () => {
    expect(escaleraCuarenta(c('7c Jd Kt'), c('6p')[0]!)).toEqual(c('7c Jd'));
  });
});

describe('Caída y limpia del Cuarenta', () => {
  it('caída: 2 puntos', () => {
    const e = { ...mesa(['5p 2c', 'Ad 3d'], 'Qd 5d'), caible: c('5d')[0]! };
    const tras = hacer(e, '5p', '5d');
    expect(tras.ultimaJugada?.caida).toBe(true);
    expect(tras.puntos).toEqual([2, 0]);
  });

  it('sin caída al llevársela por suma', () => {
    const e = { ...mesa(['7p 3c', 'Ad 3d'], '5d 2c Qd'), caible: c('5d')[0]! };
    const tras = hacer(e, '7p', '5d 2c');
    expect(tras.ultimaJugada?.caida).toBe(false);
    expect(tras.puntos).toEqual([0, 0]);
  });

  it('caída y limpia: 4 puntos', () => {
    const e = { ...mesa(['5p 3c', 'Ad 3d'], '5d'), caible: c('5d')[0]! };
    const tras = hacer(e, '5p', '5d');
    expect(tras.ultimaJugada).toMatchObject({ caida: true, limpia: true });
    expect(tras.puntos).toEqual([4, 0]);
    expect(tras.tantos[0]).toEqual({ rondas: 0, caidas: 1, limpias: 1 });
  });

  it('dejar una carta la deja caíble para el siguiente', () => {
    const tras = hacer(mesa(['5p 3c', 'Ad 5d'], 'Qd'), '5p');
    expect(tras.caible).toBe(c('5p')[0]);
    expect(cuarenta.vistaDe(tras, 1).caible).toBe(c('5p')[0]);
  });

  it('sin caída tras un reparto', () => {
    // El 1 deja el 5 con su última carta; se reparte y el 0 se lo lleva.
    const base = mesa(['', '5d'], 'Qd', { turno: 1, mazo: BARAJA_CUARENTA.slice(0, 10) });
    const e = hacer(base, '5d');
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.mesa).toEqual(c('Qd 5d'));
    expect(e.caible).toBeNull();
  });
});

describe('Fin de la mano y cartones del Cuarenta', () => {
  it('cartones: 20 cartas 6, 21 o 22 8, 23 o 24 10; menos de 20 nada; 20 y 20 nadie', () => {
    expect(cartonesCuarenta(20, 19)).toBe(6);
    expect(cartonesCuarenta(21, 19)).toBe(8);
    expect(cartonesCuarenta(22, 18)).toBe(8);
    expect(cartonesCuarenta(23, 17)).toBe(10);
    expect(cartonesCuarenta(19, 21)).toBe(0);
    expect(cartonesCuarenta(20, 20)).toBe(0);
  });

  it('las cartas de la mesa van al último que capturó y se cuentan los cartones', () => {
    const recogidas: [IdCarta[], IdCarta[]] = [
      BARAJA_CUARENTA.slice(0, 15),
      BARAJA_CUARENTA.slice(15, 35),
    ];
    const e = mesa(['', ''], '', {
      manos: [[BARAJA_CUARENTA[37]!], []],
      mesa: [BARAJA_CUARENTA[35]!, BARAJA_CUARENTA[36]!],
      recogidas,
      ultimoEnRecoger: 1,
      puntos: [0, 0],
    });
    const tras = cuarenta.transicion(e, 0, {
      tipo: 'jugar',
      carta: BARAJA_CUARENTA[37]!,
      captura: [],
    });
    const r = tras.resultadosManos.at(-1)!;
    // 15 + 0 para el 0; 20 + las 3 de la mesa para el 1: 23 cartas, 10 puntos.
    expect(r.cartas).toEqual([15, 23]);
    expect(r.puntos[1].cartones).toBe(10);
    expect(r.completa).toBe(true);
    expect(r.puntosTras).toEqual([0, 10]);
  });
});

describe('Partida del Cuarenta', () => {
  it('termina en cuanto un bando llega a 40, a mitad de la mano', () => {
    const e = {
      ...mesa(['5p 3c', 'Ad 3d'], '5d Kd'),
      caible: c('5d')[0]!,
      puntos: [38, 10] as [number, number],
    };
    const tras = hacer(e, '5p', '5d');
    expect(tras.puntos).toEqual([40, 10]);
    expect(cuarenta.resultado(tras)).toEqual({ ganadores: [0], empate: false, puntos: [40, 10] });
    expect(cuarenta.accionesLegales(tras, 1)).toEqual([]);
    expect(tras.resultadosManos.at(-1)?.completa).toBe(false);
  });

  it('sin ganador, otra mano con el siguiente repartidor', () => {
    const e = mesa(['3c', ''], 'Qd', { manos: [c('3c'), []], ultimoEnRecoger: 0 });
    const tras = hacer(e, '3c');
    expect(tras.resultadosManos).toHaveLength(1);
    expect(tras.repartidor).toBe(0);
    expect(tras.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(tras.turno).toBe(1);
  });
});

describe('Vista del Cuarenta', () => {
  it('ve cuántas cartas tienen los demás, pero no cuáles', () => {
    const e = nueva(4);
    const v = cuarenta.vistaDe(e, 0);
    expect(v.miMano).toEqual(e.manos[0]);
    expect(v.cartasEnMano).toEqual([5, 5, 5, 5]);
    expect(v.mazo).toBe(20);
    expect(JSON.stringify(v)).not.toContain(e.manos[1]![0]!);
  });
});

describirContrato(cuarenta, {
  configs: [CONFIG_CUARENTA_POR_DEFECTO, { jugadores: 4, meta: 40 }],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
  ],
  pasosMaximos: 600,
  ejecuciones: 30,
});
