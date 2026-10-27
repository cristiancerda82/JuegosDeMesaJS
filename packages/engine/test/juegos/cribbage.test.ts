import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_CRIBBAGE_POR_DEFECTO,
  cribbage,
  puntosJugada,
  puntosRecuento,
  type AccionCribbage,
  type EstadoCribbage,
} from '../../src/juegos/cribbage';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «9p» es el 9 de picas; c, d y t, corazones, diamantes y tréboles. */
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

function nueva(semilla = 'cribbage'): EstadoCribbage {
  const r = cribbage.crear(CONFIG_CRIBBAGE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** En pleno juego de las cartas: reparte el 1, juega el 0, starter el K de picas. */
function enJuego(manos: [string, string], parcial: Partial<EstadoCribbage> = {}): EstadoCribbage {
  return {
    ...nueva(),
    fase: 'juego',
    manos: manos.map(c),
    guardadas: manos.map(c),
    echadas: [c('2p 3p'), c('2c 3c')],
    starter: una('Kp'),
    turno: 0,
    ...parcial,
  };
}

function jugar(e: EstadoCribbage, accion: AccionCribbage): EstadoCribbage {
  const r = aplicar(cribbage, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const carta = (t: string): AccionCribbage => ({ tipo: 'jugar', carta: una(t) });
const legales = (e: EstadoCribbage) => cribbage.accionesLegales(e, e.turno);

describe('reparto, crib y corte', () => {
  it('6 cartas cada uno; echan al crib el que no reparte y luego el repartidor', () => {
    let e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([6, 6]);
    expect(e.repartidor).toBe(1);
    expect(e.turno).toBe(0);
    expect(legales(e)).toHaveLength(15);
    e = jugar(e, legales(e)[0]!);
    expect(e.turno).toBe(1);
    // El otro no ve qué cartas echó.
    expect(JSON.stringify(cribbage.vistaDe(e, 1))).not.toContain(JSON.stringify(e.echadas[0]![0]));
    e = jugar(e, legales(e)[0]!);
    expect(e.manos.map((m) => m.length)).toEqual([4, 4]);
    expect(e.echadas.flat()).toHaveLength(4);
    expect(e.starter).not.toBeNull();
    expect(e.fase).toBe('juego');
    expect(e.turno).toBe(0);
  });

  it('una J de starter suma 2 al repartidor', () => {
    let e = nueva();
    e = { ...e, mazo: [una('Jt'), ...e.mazo.filter((x) => x !== una('Jt'))] };
    e = jugar(e, legales(e)[0]!);
    e = jugar(e, legales(e)[0]!);
    expect(e.starter).toBe(una('Jt'));
    expect(e.puntos).toEqual([0, 2]);
  });
});

describe('juego de las cartas', () => {
  it('quince', () => {
    expect(puntosJugada(c('Kp 5c'), 15)).toEqual([{ motivo: 'quince', puntos: 2 }]);
  });

  it('pareja y trío', () => {
    expect(puntosJugada(c('7p 7c'), 14)).toEqual([{ motivo: 'pareja', puntos: 2 }]);
    expect(puntosJugada(c('7p 7c 7d'), 21)).toEqual([{ motivo: 'trio', puntos: 6 }]);
  });

  it('escalera en desorden', () => {
    expect(puntosJugada(c('4p 6c 5d'), 15)).toEqual([
      { motivo: 'quince', puntos: 2 },
      { motivo: 'escalera', puntos: 3, cartas: 3 },
    ]);
    // Una carta repetida en medio rompe la escalera.
    expect(puntosJugada(c('4p 5c 5d 6t'), 20)).toEqual([]);
  });

  it('solo caben cartas que no pasan de 31', () => {
    const e = enJuego(['9p 2c', 'Kd'], { cuenta: 25, secuencia: c('10t Kc 5d') });
    expect(legales(e)).toEqual([carta('2c')]);
  });

  it('go: el otro sigue y el último en jugar suma 1', () => {
    // Cuenta 28: al 0 no le cabe nada; el 1 juega un 2 (30), no le cabe más y suma el go.
    let e = enJuego(['9p 8c', '2d Qc'], {
      cuenta: 28,
      secuencia: c('10t Kc 8d'),
      ultimoEnJugar: 1,
    });
    expect(legales(e)).toEqual([{ tipo: 'go' }]);
    e = jugar(e, { tipo: 'go' });
    expect(e.turno).toBe(1);
    e = jugar(e, carta('2d'));
    expect(e.turno).toBe(1);
    expect(legales(e)).toEqual([{ tipo: 'go' }]);
    const antes = e.puntos;
    e = jugar(e, { tipo: 'go' });
    expect(e.puntos).toEqual([antes[0], antes[1] + 1]);
    expect(e.cuenta).toBe(0);
    // Sale el otro.
    expect(e.turno).toBe(0);
  });

  it('31 suma 2 y vuelve la cuenta a 0', () => {
    let e = enJuego(['Kp 4c', '9d Qc'], { cuenta: 21, secuencia: c('10t Jc') });
    e = jugar(e, carta('Kp'));
    expect(e.puntos).toEqual([2, 0]);
    expect(e.cuenta).toBe(0);
    expect(e.turno).toBe(1);
  });

  it('la última carta de la mano suma 1 y después se cuenta', () => {
    let e = enJuego(['9p', 'Qc'], { guardadas: [c('9p 2t 3t 4t'), c('Qc 2d 3d 4d')] });
    e = jugar(e, carta('9p'));
    e = jugar(e, carta('Qc'));
    const r = e.resultadosManos[0]!;
    expect(r.puntosJuego).toEqual([0, 1]);
    expect(r.recuentos.map((x) => [x.asiento, x.crib])).toEqual([
      [0, false],
      [1, false],
      [1, true],
    ]);
    // Mano nueva con el otro repartidor.
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('descarte');
    expect(e.turno).toBe(1);
  });
});

describe('recuento', () => {
  it('una mano de 29', () => {
    expect(puntosRecuento(c('5t 5c 5d Jp'), una('5p'), false).total).toBe(29);
  });

  it('escalera doble', () => {
    expect(puntosRecuento(c('3t 4c 5d 5p'), una('Kc'), false)).toEqual({
      quinces: 4,
      parejas: 2,
      escaleras: 6,
      color: 0,
      nobs: 0,
      total: 12,
    });
  });

  it('color en la mano y en el crib', () => {
    expect(puntosRecuento(c('2c 6c 8c Qc'), una('Ap'), false).color).toBe(4);
    expect(puntosRecuento(c('2c 6c 8c Qc'), una('Ac'), false).color).toBe(5);
    expect(puntosRecuento(c('2c 6c 8c Qc'), una('Ap'), true).color).toBe(0);
    expect(puntosRecuento(c('2c 6c 8c Qc'), una('Ac'), true).color).toBe(5);
  });
});

describe('partida', () => {
  it('gana contando primero, sin contar la mano del repartidor', () => {
    // Reparte el 1; el 0 cuenta antes y llega a 121.
    let e = enJuego(['9p', 'Qc'], {
      guardadas: [c('9p 2t 3t 4t'), c('Qc 5d 5c 5t')],
      puntos: [118, 118],
    });
    e = jugar(e, carta('9p'));
    e = jugar(e, carta('Qc'));
    expect(e.puntos[0]).toBeGreaterThanOrEqual(121);
    expect(e.resultadosManos.at(-1)!.recuentos).toHaveLength(1);
    expect(cribbage.resultado(e)?.ganadores).toEqual([0]);
  });
});

describe('vista', () => {
  it('no contiene la mano del otro, su crib ni el mazo', () => {
    let e = nueva();
    e = jugar(e, legales(e)[0]!);
    e = jugar(e, legales(e)[0]!);
    const texto = JSON.stringify(cribbage.vistaDe(e, 0));
    for (const x of [...e.manos[1]!, ...e.echadas[1]!, ...e.mazo]) {
      expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describirContrato(cribbage, {
  configs: [CONFIG_CRIBBAGE_POR_DEFECTO],
  // Lo descubierto en las manos anteriores y las cartas jugadas ya se vieron.
  cartasOcultas: (e, asiento) => {
    const a = e.ultimaAccion?.accion;
    const vistas = new Set([
      ...e.resultadosManos.flatMap((r) => [
        ...r.recuentos.flatMap((x) => x.cartas),
        ...(r.starter ? [r.starter] : []),
      ]),
      ...(e.starter ? [e.starter] : []),
      ...e.jugadasMano,
      ...(a?.tipo === 'jugar' ? [a.carta] : []),
    ]);
    const rival = 1 - (asiento ?? 0);
    const ocultas = [
      ...e.mazo,
      ...(asiento === null ? e.manos.flat() : e.manos[rival]!),
      ...(asiento === null ? e.echadas.flat() : e.echadas[rival]!),
    ];
    return ocultas.filter((x) => !vistas.has(x));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
