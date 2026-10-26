import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_EUCHRE,
  CONFIG_EUCHRE_POR_DEFECTO,
  euchre,
  ganadoraEuchre,
  type AccionEuchre,
  type EstadoEuchre,
} from '../../src/juegos/euchre';
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

function nueva(semilla = 'euchre'): EstadoEuchre {
  const r = euchre.crear(CONFIG_EUCHRE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Reparte el 3: sale el 0. Carta vuelta, el 10 de corazones. */
function conManos(manos: string[], parcial: Partial<EstadoEuchre> = {}): EstadoEuchre {
  return { ...nueva(), manos: manos.map(c), cartaVuelta: una('10c'), ...parcial };
}

function jugar(e: EstadoEuchre, accion: AccionEuchre): EstadoEuchre {
  const r = aplicar(euchre, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const pasar: AccionEuchre = { tipo: 'pasar' };
const carta = (t: string): AccionEuchre => ({ tipo: 'jugar', carta: una(t) });
const legales = (e: EstadoEuchre) => euchre.accionesLegales(e, e.turno);

const MANOS = ['9p 10p Qp Kp Ap', '9c Jc Qc Kc Ac', '9d 10d Jd Qd Kd', '9t 10t Jt Qt Kt'];

describe('baraja y reparto', () => {
  it('24 cartas del 9 al As, 5 a cada uno y una carta vuelta', () => {
    expect(BARAJA_EUCHRE).toHaveLength(24);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
    expect(e.ocultas).toHaveLength(3);
    expect(new Set([...e.manos.flat(), e.cartaVuelta, ...e.ocultas]).size).toBe(24);
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('primera');
  });
});

describe('elegir el triunfo', () => {
  it('pedir la carta vuelta: el repartidor la recoge y se descarta', () => {
    let e = conManos(MANOS);
    e = jugar(e, { tipo: 'pedir', solo: false });
    expect(e.triunfo).toBe('corazones');
    expect(e.elige).toBe(0);
    expect(e.fase).toBe('descarte');
    expect(e.turno).toBe(3);
    expect(e.manos[3]).toHaveLength(6);
    expect(legales(e)).toHaveLength(6);
    e = jugar(e, { tipo: 'descartar', carta: una('9t') });
    expect(e.manos[3]).toHaveLength(5);
    expect(e.manos[3]).toContain(una('10c'));
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
    // El descarte solo lo ve el repartidor.
    expect(euchre.vistaDe(e, 3).descarte).toBe(una('9t'));
    expect(euchre.vistaDe(e, 0).descarte).toBeNull();
    expect(JSON.stringify(euchre.vistaDe(e, 0))).not.toContain('"treboles-9"');
  });

  it('en la segunda vuelta se nombra otro palo, no el de la carta vuelta', () => {
    let e = conManos(MANOS);
    for (let i = 0; i < 4; i++) e = jugar(e, pasar);
    expect(e.fase).toBe('segunda');
    expect(e.turno).toBe(0);
    const palos = legales(e).flatMap((a) => (a.tipo === 'nombrar' ? [a.palo] : []));
    expect(new Set(palos)).toEqual(new Set(['picas', 'diamantes', 'treboles']));
    e = jugar(e, { tipo: 'nombrar', palo: 'picas', solo: false });
    expect(e.triunfo).toBe('picas');
    expect(e.fase).toBe('bazas');
    expect(e.manos[3]).toHaveLength(5);
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

describe('jugar solo', () => {
  it('el compañero deja la mano y las bazas son de 3', () => {
    let e = conManos(MANOS);
    e = jugar(e, { tipo: 'pedir', solo: true });
    expect(e.fuera).toBe(2);
    e = jugar(e, { tipo: 'descartar', carta: una('9t') });
    expect(e.turno).toBe(0);
    e = jugar(e, carta('9p'));
    expect(e.turno).toBe(1);
    e = jugar(e, legales(e)[0]!);
    // El 2 se salta.
    expect(e.turno).toBe(3);
    e = jugar(e, legales(e)[0]!);
    expect(e.mesa).toEqual([]);
    expect(e.ultimaBaza?.cartas).toHaveLength(3);
  });

  it('si el que deja la mano es el repartidor, no recoge la carta vuelta', () => {
    let e = conManos(MANOS);
    e = jugar(e, pasar);
    e = jugar(e, { tipo: 'pedir', solo: true });
    expect(e.fuera).toBe(3);
    expect(e.fase).toBe('bazas');
    expect(e.manos[3]).toHaveLength(5);
    expect(e.turno).toBe(0);
  });
});

describe('orden de las cartas', () => {
  it('el bower izquierdo es triunfo, gana al As y pierde con el derecho', () => {
    const mesa = (cartas: string) => c(cartas).map((carta, asiento) => ({ asiento, carta }));
    expect(ganadoraEuchre(mesa('Ac Jd'), 'corazones').asiento).toBe(1);
    expect(ganadoraEuchre(mesa('Jd Jc'), 'corazones').asiento).toBe(1);
    // Sale de diamantes otro y la J de diamantes es triunfo: gana a todo diamante.
    expect(ganadoraEuchre(mesa('Ad Jd'), 'corazones').asiento).toBe(1);
  });

  it('el bower izquierdo obliga como triunfo', () => {
    const e = conManos(['9c', 'Jd 9p 10t', '', ''], {
      fase: 'bazas',
      triunfo: 'corazones',
      elige: 0,
      mesa: [{ asiento: 0, carta: una('9c') }],
      turno: 1,
    });
    expect(legales(e)).toEqual([carta('Jd')]);
  });

  it('al salir de diamantes, la J de diamantes no obliga: es triunfo', () => {
    const e = conManos(['9d', 'Jd 9p 10t', '', ''], {
      fase: 'bazas',
      triunfo: 'corazones',
      elige: 0,
      mesa: [{ asiento: 0, carta: una('9d') }],
      turno: 1,
    });
    expect(legales(e)).toEqual([carta('Jd'), carta('9p'), carta('10t')]);
  });
});

describe('puntos y partida', () => {
  /** Juega la mano entera eligiendo la primera carta legal. */
  function terminar(e: EstadoEuchre): EstadoEuchre {
    const manos = e.resultadosManos.length;
    while (e.resultadosManos.length === manos) e = jugar(e, legales(e)[0]!);
    return e;
  }

  it('euchre: la pareja que eligió hace menos de 3 y los rivales suman 2', () => {
    // El 1 nombra picas con una mano sin picas; el 0 tiene todas las picas altas.
    let e = conManos(['Jp Jt Ap Kp Qp', '9c 10c Qc Kc Ac', '9d 10d Jd Qd Kd', '9t 10t Qt Kt At']);
    for (let i = 0; i < 4; i++) e = jugar(e, pasar);
    e = jugar(e, pasar);
    e = jugar(e, { tipo: 'nombrar', palo: 'picas', solo: false });
    e = terminar(e);
    const r = e.resultadosManos[0]!;
    expect(r.elige).toBe(1);
    expect(r.euchre).toBe(true);
    expect(r.puntosMano).toEqual([2, 0]);
  });

  it('las cinco jugando solo valen 4', () => {
    let e = conManos(['Jp Jt Ap Kp Qp', '9c 10c Qc Kc Ac', '9d 10d Jd Qd Kd', '9t 10t Qt Kt At']);
    for (let i = 0; i < 4; i++) e = jugar(e, pasar);
    e = jugar(e, { tipo: 'nombrar', palo: 'picas', solo: true });
    e = terminar(e);
    const r = e.resultadosManos[0]!;
    expect(r.bazas).toEqual([5, 0]);
    expect(r.puntosMano).toEqual([4, 0]);
    expect(e.repartidor).toBe(0);
  });

  it('la partida termina al llegar a 10', () => {
    let e = conManos(['Jp Jt Ap Kp Qp', '9c 10c Qc Kc Ac', '9d 10d Jd Qd Kd', '9t 10t Qt Kt At'], {
      puntos: [8, 3],
    });
    for (let i = 0; i < 4; i++) e = jugar(e, pasar);
    e = jugar(e, { tipo: 'nombrar', palo: 'picas', solo: false });
    e = terminar(e);
    expect(e.puntos).toEqual([10, 3]);
    expect(euchre.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [10, 3, 10, 3],
    });
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni las ocultas', () => {
    const e = nueva();
    const texto = JSON.stringify(euchre.vistaDe(e, 0));
    for (const x of [...e.manos[1]!, ...e.manos[2]!, ...e.manos[3]!, ...e.ocultas]) {
      expect(texto).not.toContain(`"${x}"`);
    }
  });
});

describirContrato(euchre, {
  configs: [CONFIG_EUCHRE_POR_DEFECTO],
  // La carta vuelta y las de la última baza ya se vieron, aunque estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([e.cartaVuelta, ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? [])]);
    return [
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
      ...e.ocultas,
      ...(e.descarte !== null && asiento !== e.repartidor ? [e.descarte] : []),
    ].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 300,
});
