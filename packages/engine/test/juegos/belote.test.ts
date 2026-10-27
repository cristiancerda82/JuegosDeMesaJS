import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_BELOTE,
  belote,
  CONFIG_BELOTE_POR_DEFECTO,
  ganadoraBelote,
  puntuarManoBelote,
  valorBelote,
  type AccionBelote,
  type EstadoBelote,
} from '../../src/juegos/belote';
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

function nueva(semilla = 'belote'): EstadoBelote {
  const r = belote.crear(CONFIG_BELOTE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

const MANOS = ['7p 8p 9p 10p Jp', '7c 8c 9c Jc Qc', '7d 8d 9d 10d Jd', '7t 8t 9t 10t Jt'];
const MAZO = 'Qp Kp Ap Kc Ac Qd Kd Ad Qt Kt At';

/** Reparte el 3: habla primero el 0. Carta vuelta, el 10 de corazones. */
function conManos(manos: string[], parcial: Partial<EstadoBelote> = {}): EstadoBelote {
  return {
    ...nueva(),
    manos: manos.map(c),
    cartaVuelta: una('10c'),
    mazo: c(MAZO),
    ...parcial,
  };
}

/** Una baza a medias con el triunfo ya elegido. */
function enBaza(
  manos: string[],
  mesa: string,
  triunfo: EstadoBelote['triunfo'],
  turno: number,
): EstadoBelote {
  const cartas = c(mesa);
  return conManos(manos, {
    fase: 'bazas',
    triunfo,
    elige: 0,
    mazo: [],
    mesa: cartas.map((carta, i) => ({ asiento: (turno - cartas.length + i + 4) % 4, carta })),
    turno,
  });
}

function jugar(e: EstadoBelote, accion: AccionBelote): EstadoBelote {
  const r = aplicar(belote, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const pasar: AccionBelote = { tipo: 'pasar' };
const carta = (t: string): AccionBelote => ({ tipo: 'jugar', carta: una(t) });
const legales = (e: EstadoBelote) => belote.accionesLegales(e, e.turno);

/** Juega la mano entera eligiendo la primera carta legal. */
function terminar(e: EstadoBelote): EstadoBelote {
  const manos = e.resultadosManos.length;
  while (e.resultadosManos.length === manos) e = jugar(e, legales(e)[0]!);
  return e;
}

describe('baraja y reparto', () => {
  it('32 cartas del 7 al As, 5 a cada uno, una carta vuelta y 11 en el mazo', () => {
    expect(BARAJA_BELOTE).toHaveLength(32);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
    expect(e.mazo).toHaveLength(11);
    expect(new Set([...e.manos.flat(), e.cartaVuelta, ...e.mazo]).size).toBe(32);
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('primera');
  });
});

describe('elegir el triunfo', () => {
  it('tomar la carta vuelta: se la lleva quien toma y todos acaban con 8', () => {
    let e = conManos(MANOS);
    e = jugar(e, { tipo: 'tomar' });
    expect(e.triunfo).toBe('corazones');
    expect(e.elige).toBe(0);
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
    expect(e.manos[0]).toEqual(c('7p 8p 9p 10p Jp 10c Qp Kp'));
    expect(e.manos[1]).toEqual(c('7c 8c 9c Jc Qc Ap Kc Ac'));
    expect(e.mazo).toEqual([]);
  });

  it('en la segunda vuelta se nombra otro palo, no el de la carta vuelta', () => {
    let e = conManos(MANOS);
    for (let i = 0; i < 4; i++) e = jugar(e, pasar);
    expect(e.fase).toBe('segunda');
    expect(e.turno).toBe(0);
    const palos = legales(e).flatMap((a) => (a.tipo === 'nombrar' ? [a.palo] : []));
    expect(new Set(palos)).toEqual(new Set(['picas', 'diamantes', 'treboles']));
    e = jugar(e, pasar);
    e = jugar(e, { tipo: 'nombrar', palo: 'picas' });
    expect(e.triunfo).toBe('picas');
    expect(e.elige).toBe(1);
    expect(e.manos[1]).toContain(una('10c'));
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
  });

  it('si todos pasan dos veces, mano nueva con el siguiente repartidor', () => {
    let e = conManos(MANOS);
    for (let i = 0; i < 8; i++) e = jugar(e, pasar);
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('primera');
    expect(e.turno).toBe(1);
    expect(e.manosAnuladas).toBe(1);
    expect(e.resultadosManos).toEqual([]);
  });
});

describe('orden y valor de las cartas', () => {
  const mesa = (cartas: string) => c(cartas).map((carta, asiento) => ({ asiento, carta }));

  it('en el triunfo el 9 gana al As y pierde con la J', () => {
    expect(ganadoraBelote(mesa('Ap 9p'), 'picas').asiento).toBe(1);
    expect(ganadoraBelote(mesa('9p Jp'), 'picas').asiento).toBe(1);
    // Fuera del triunfo, el 10 gana al K y el As a todos.
    expect(ganadoraBelote(mesa('Kc 10c Ac'), 'picas').asiento).toBe(2);
  });

  it('valores: las cartas de una mano suman 152', () => {
    expect(valorBelote(una('Jp'), 'picas')).toBe(20);
    expect(valorBelote(una('9p'), 'picas')).toBe(14);
    expect(valorBelote(una('Jc'), 'picas')).toBe(2);
    expect(valorBelote(una('9c'), 'picas')).toBe(0);
    expect(BARAJA_BELOTE.reduce((s, x) => s + valorBelote(x, 'picas'), 0)).toBe(152);
  });
});

describe('bazas', () => {
  it('hay que seguir el palo de salida', () => {
    const e = enBaza(['', '7p Ac Kt', '', ''], 'Kp', 'corazones', 1);
    expect(legales(e)).toEqual([carta('7p')]);
  });

  it('si se sale de triunfo, hay que montar si se puede', () => {
    const e = enBaza(['', 'Jc 8c 7t', '', ''], 'Ac', 'corazones', 1);
    expect(legales(e)).toEqual([carta('Jc')]);
  });

  it('si no se puede montar, cualquier triunfo', () => {
    const e = enBaza(['', '8c 7c 7t', '', ''], 'Ac', 'corazones', 1);
    expect(legales(e)).toEqual([carta('8c'), carta('7c')]);
  });

  it('sin el palo de salida y ganando un rival, hay que fallar', () => {
    const e = enBaza(['', '7c At Kt', '', ''], 'Kp', 'corazones', 1);
    expect(legales(e)).toEqual([carta('7c')]);
  });

  it('si el compañero va ganando, se puede jugar cualquier carta', () => {
    const e = enBaza(['', '', '7c At Kt', ''], 'Ap 7p', 'corazones', 2);
    expect(legales(e)).toEqual([carta('7c'), carta('At'), carta('Kt')]);
  });

  it('al fallar sobre un triunfo rival, hay que montar si se puede', () => {
    const e = enBaza(['', '', '', 'Jc 7c At'], 'Ap Kp 9c', 'corazones', 3);
    expect(legales(e)).toEqual([carta('Jc')]);
  });

  it('quien no falla debiendo no tiene triunfos', () => {
    let e = enBaza(['', '', 'At Kt', ''], 'Ap 7p', 'treboles', 2);
    // Sin picas ni corazones (el triunfo): juega lo que puede y queda anotado.
    e = {
      ...e,
      triunfo: 'corazones',
      mesa: [
        { asiento: 0, carta: una('7p') },
        { asiento: 1, carta: una('Ap') },
      ],
    };
    e = jugar(e, carta('At'));
    expect(e.fallos[2]).toEqual(['picas', 'corazones']);
  });
});

describe('belote-rebelote', () => {
  it('quien tiene el rey y la dama del triunfo los anuncia y suma 20', () => {
    let e = conManos(MANOS);
    e = jugar(e, { tipo: 'tomar' });
    // El 1 tiene la Q y el K de corazones.
    expect(e.belote).toBe(1);
    expect(JSON.stringify(belote.vistaDe(e, 0))).not.toContain('"belote":1');
    while (e.anuncios.length === 0) e = jugar(e, legales(e)[0]!);
    expect(e.anuncios).toEqual([{ asiento: 1, tipo: 'belote' }]);
    while (!e.anuncios.some((a) => a.tipo === 'rebelote')) e = jugar(e, legales(e)[0]!);
    expect(e.anuncios[1]).toEqual({ asiento: 1, tipo: 'rebelote' });
    e = terminar(e);
    const r = e.resultadosManos[0]!;
    expect(r.belote).toBe(1);
    expect(r.hechos[1]).toBe(r.cartas[1] + 20 + (r.ultimas === 1 ? 10 : 0));
  });
});

describe('puntos y partida', () => {
  it('la pareja que toma cumple: cada pareja se apunta lo suyo', () => {
    expect(puntuarManoBelote([92, 70], [5, 3], 0, null)).toEqual({
      puntosMano: [92, 70],
      dentro: false,
      capot: null,
    });
  });

  it('dentro: la otra pareja se apunta 162, y el belote se queda con quien lo tuvo', () => {
    expect(puntuarManoBelote([70, 92], [3, 5], 0, null).puntosMano).toEqual([0, 162]);
    expect(puntuarManoBelote([90, 92], [3, 5], 0, 0)).toEqual({
      puntosMano: [20, 162],
      dentro: true,
      capot: null,
    });
  });

  it('capot: 252 para la pareja que hace las 8 bazas', () => {
    expect(puntuarManoBelote([162, 0], [8, 0], 0, null)).toEqual({
      puntosMano: [252, 0],
      dentro: false,
      capot: 0,
    });
    expect(puntuarManoBelote([0, 162], [0, 8], 0, null).puntosMano).toEqual([0, 252]);
  });

  it('una mano completa reparte 162 puntos más el belote', () => {
    let e = conManos(MANOS);
    e = jugar(e, { tipo: 'tomar' });
    e = terminar(e);
    const r = e.resultadosManos[0]!;
    expect(r.cartas[0] + r.cartas[1]).toBe(152);
    expect(r.hechos[0] + r.hechos[1]).toBe(182);
    expect(e.repartidor).toBe(0);
    expect(e.puntos).toEqual(r.totales);
  });

  it('la partida termina al acabar una mano con alguna pareja en 501', () => {
    let e = conManos(MANOS, { puntos: [500, 500] });
    e = jugar(e, { tipo: 'tomar' });
    e = terminar(e);
    expect(Math.max(...e.puntos)).toBeGreaterThanOrEqual(501);
    const fin = belote.resultado(e)!;
    const gana = e.puntos[0] > e.puntos[1] ? 0 : 1;
    expect(fin.ganadores).toEqual([gana, gana + 2]);
    expect(belote.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('con empate por encima de 501 se juega otra mano', () => {
    const e = conManos(MANOS, { puntos: [510, 510] });
    expect(belote.resultado(e)).toBeNull();
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni el mazo', () => {
    const e = nueva();
    const texto = JSON.stringify(belote.vistaDe(e, 0));
    for (const x of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!, ...e.mazo]) {
      expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describirContrato(belote, {
  configs: [CONFIG_BELOTE_POR_DEFECTO],
  // La carta vuelta y las de la última baza ya se vieron, aunque estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([e.cartaVuelta, ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? [])]);
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.mazo].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 600,
});
