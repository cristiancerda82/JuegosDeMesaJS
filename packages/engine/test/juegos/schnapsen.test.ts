import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import { aplicar } from '../../src/motor/aplicar';
import {
  BARAJA_SCHNAPSEN,
  CONFIG_SCHNAPSEN_POR_DEFECTO,
  damaDe,
  puntosManoSchnapsen,
  reyDe,
  schnapsen,
  type AccionSchnapsen,
  type EstadoSchnapsen,
} from '../../src/juegos/schnapsen';
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

function nueva(semilla = 'schnapsen'): EstadoSchnapsen {
  const r = schnapsen.crear(CONFIG_SCHNAPSEN_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Reparte el 1 y sale el 0. Carta vuelta, el As de diamantes: triunfo, diamantes. */
function conManos(manos: string[], parcial: Partial<EstadoSchnapsen> = {}): EstadoSchnapsen {
  return {
    ...nueva(),
    manos: manos.map(c),
    cartaVuelta: una('Ad'),
    triunfo: 'diamantes',
    mazo: c('10d Kd Qd Jp Jc At 10t Kt Qt'),
    ...parcial,
  };
}

function jugar(e: EstadoSchnapsen, accion: AccionSchnapsen): EstadoSchnapsen {
  const r = aplicar(schnapsen, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const carta = (t: string): AccionSchnapsen => ({ tipo: 'jugar', carta: una(t) });
const legales = (e: EstadoSchnapsen) => schnapsen.accionesLegales(e, e.turno);
const cartasLegales = (e: EstadoSchnapsen) =>
  legales(e).flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));

const MANOS = ['Ap 10p Kc Qc Jt', 'Kp Qp Ac 10c Jd'];

describe('baraja y reparto', () => {
  it('20 cartas, 5 a cada uno, una carta vuelta y 9 en el mazo; sale el que no reparte', () => {
    expect(BARAJA_SCHNAPSEN).toHaveLength(20);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.mazo).toHaveLength(9);
    expect(e.cartaVuelta).not.toBeNull();
    expect(e.triunfo).toBe(e.cartaVuelta!.split('-')[0]);
    expect(new Set([...e.manos.flat(), e.cartaVuelta!, ...e.mazo]).size).toBe(20);
    expect(e.repartidor).toBe(1);
    expect(e.turno).toBe(0);
  });
});

describe('bazas con el mazo abierto', () => {
  it('no hay que seguir el palo', () => {
    const e = jugar(conManos(MANOS), carta('Ap'));
    expect(cartasLegales(e)).toHaveLength(5);
  });

  it('roba primero el ganador y los dos vuelven a tener 5', () => {
    let e = jugar(conManos(MANOS), carta('Ap'));
    // El 1 falla con la J de diamantes (triunfo) y gana.
    e = jugar(e, carta('Jd'));
    expect(e.turno).toBe(1);
    expect(e.manos.map((m) => m.length)).toEqual([5, 5]);
    expect(e.manos[1]).toContain(una('10d'));
    expect(e.manos[0]).toContain(una('Kd'));
    expect(e.puntosBazas).toEqual([0, 13]);
    expect(e.mazo).toHaveLength(7);
  });
});

describe('cambiar la J del triunfo', () => {
  it('quien sale con la J del triunfo la cambia por la carta vuelta', () => {
    let e = conManos(['Ap 10p Kc Qc Jd', 'Kp Qp Ac 10c Jt']);
    expect(legales(e)).toContainEqual({ tipo: 'cambiar' });
    e = jugar(e, { tipo: 'cambiar' });
    expect(e.manos[0]).toContain(una('Ad'));
    expect(e.manos[0]).not.toContain(una('Jd'));
    expect(e.cartaVuelta).toBe(una('Jd'));
    expect(e.conocidas).toEqual([{ asiento: 0, carta: una('Ad') }]);
    expect(e.turno).toBe(0);
  });
});

describe('cantes', () => {
  it('cantar 40 con una baza ganada: suma y obliga a salir con el K o la Q', () => {
    let e = conManos(['Kd Qd Ap 10p Jt', 'Kp Qp Ac 10c Jc'], {
      bazas: [1, 0],
      puntosBazas: [10, 0],
    });
    expect(legales(e)).toContainEqual({ tipo: 'cantar', palo: 'diamantes' });
    e = jugar(e, { tipo: 'cantar', palo: 'diamantes' });
    expect(e.cantes).toEqual([{ asiento: 0, palo: 'diamantes', puntos: 40 }]);
    expect(puntosManoSchnapsen(e, 0)).toBe(50);
    expect(cartasLegales(e)).toEqual([reyDe('diamantes'), damaDe('diamantes')]);
    expect(legales(e)).toHaveLength(2);
  });

  it('sin bazas el cante queda pendiente hasta ganar la primera', () => {
    let e = conManos(['Kp Qp Ap 10c Jt', 'Ac Kc Qc Jc 10t']);
    e = jugar(e, { tipo: 'cantar', palo: 'picas' });
    expect(e.cantes[0]!.puntos).toBe(20);
    expect(puntosManoSchnapsen(e, 0)).toBe(0);
    e = jugar(e, carta('Qp'));
    e = jugar(e, carta('Jc'));
    // Gana el 0 con la Q de picas: 3 + 2 y los 20 del cante.
    expect(puntosManoSchnapsen(e, 0)).toBe(25);
  });
});

describe('cerrar el mazo y reglas estrictas', () => {
  it('con el mazo cerrado nadie roba', () => {
    let e = jugar(conManos(MANOS), { tipo: 'cerrar' });
    expect(e.cerrado).toEqual({ asiento: 0, bazasRival: 0, puntosRival: 0 });
    expect(legales(e)).not.toContainEqual({ tipo: 'cerrar' });
    e = jugar(e, carta('Ap'));
    e = jugar(e, legales(e)[0]!);
    expect(e.manos.map((m) => m.length)).toEqual([4, 4]);
    expect(e.mazo).toHaveLength(9);
  });

  it('con el mazo cerrado hay que seguir el palo y ganar si se puede', () => {
    const e = conManos(['', 'Ap Jp Kc'], {
      cerrado: { asiento: 0, bazasRival: 0, puntosRival: 0 },
      mesa: [{ asiento: 0, carta: una('Kp') }],
      turno: 1,
    });
    expect(cartasLegales(e)).toEqual([una('Ap')]);
  });

  it('con el mazo agotado, sin el palo hay que fallar', () => {
    const e = conManos(['', 'Ac Jd Kt'], {
      cartaVuelta: null,
      mazo: [],
      mesa: [{ asiento: 0, carta: una('Kp') }],
      turno: 1,
    });
    expect(cartasLegales(e)).toEqual([una('Jd')]);
    const tras = jugar(e, carta('Jd'));
    expect(tras.fallos[1]).toEqual(['picas']);
  });

  it('quien no falla debiendo no tiene triunfos', () => {
    const e = conManos(['', 'Ac Kt'], {
      cartaVuelta: null,
      mazo: [],
      mesa: [{ asiento: 0, carta: una('Kp') }],
      turno: 1,
    });
    expect(jugar(e, carta('Ac')).fallos[1]).toEqual(['picas', 'diamantes']);
  });
});

describe('fin de la mano y puntos de partida', () => {
  it('quien llega a 66 gana la mano', () => {
    let e = conManos(MANOS, { puntosBazas: [60, 10], bazas: [3, 1] });
    e = jugar(e, carta('Ap'));
    e = jugar(e, carta('Kp'));
    const r = e.resultadosManos[0]!;
    expect(r.ganador).toBe(0);
    expect(r.motivo).toBe('66');
    expect(r.puntosMano).toEqual([75, 10]);
    expect(r.puntosPartida).toBe(2);
    expect(e.puntos).toEqual([2, 0]);
    // La siguiente mano la reparte el otro.
    expect(e.repartidor).toBe(0);
    expect(e.turno).toBe(1);
  });

  it('3 puntos si el rival no hizo ninguna baza; 1 si hizo 33 o más', () => {
    let e = conManos(MANOS, { puntosBazas: [60, 0], bazas: [3, 0] });
    e = jugar(jugar(e, carta('Ap')), carta('Kp'));
    expect(e.resultadosManos[0]!.puntosPartida).toBe(3);
    let f = conManos(MANOS, { puntosBazas: [60, 40], bazas: [3, 2] });
    f = jugar(jugar(f, carta('Ap')), carta('Kp'));
    expect(f.resultadosManos[0]!.puntosPartida).toBe(1);
  });

  it('sin mazo y sin 66, gana quien hace la última baza', () => {
    let e = conManos(['Jt', 'At'], {
      cartaVuelta: null,
      mazo: [],
      puntosBazas: [40, 40],
      bazas: [2, 2],
    });
    e = jugar(jugar(e, carta('Jt')), carta('At'));
    const r = e.resultadosManos[0]!;
    expect(r.ganador).toBe(1);
    expect(r.motivo).toBe('ultima');
    expect(r.puntosPartida).toBe(1);
  });

  it('cierre fallido: el otro se apunta 2', () => {
    let e = conManos(['Jt', 'At'], { puntosBazas: [30, 20], bazas: [2, 1] });
    e = jugar(e, { tipo: 'cerrar' });
    e = jugar(jugar(e, carta('Jt')), carta('At'));
    const r = e.resultadosManos[0]!;
    expect(r.ganador).toBe(1);
    expect(r.motivo).toBe('cierre');
    expect(r.cerro).toBe(0);
    expect(r.puntosPartida).toBe(2);
  });

  it('cierre fallido sin bazas del otro al cerrar: se apunta 3', () => {
    let e = conManos(['Jt', 'At'], { puntosBazas: [30, 0], bazas: [2, 0] });
    e = jugar(e, { tipo: 'cerrar' });
    e = jugar(jugar(e, carta('Jt')), carta('At'));
    expect(e.resultadosManos[0]!.puntosPartida).toBe(3);
  });

  it('la partida termina al llegar a 7', () => {
    let e = conManos(MANOS, { puntosBazas: [60, 0], bazas: [3, 0], puntos: [5, 4] });
    e = jugar(jugar(e, carta('Ap')), carta('Kp'));
    expect(e.puntos).toEqual([8, 4]);
    expect(schnapsen.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [8, 4] });
    expect(schnapsen.accionesLegales(e, e.turno)).toEqual([]);
  });
});

describe('vista', () => {
  it('no contiene la mano del rival ni el mazo', () => {
    const e = nueva();
    const texto = JSON.stringify(schnapsen.vistaDe(e, 0));
    for (const x of [...e.manos[1]!, ...e.mazo]) expect(texto).not.toContain(`"${x}"`);
  });
});

describirContrato(schnapsen, {
  configs: [CONFIG_SCHNAPSEN_POR_DEFECTO],
  // La carta vuelta, las de la última baza, las conocidas y las parejas cantadas ya se vieron.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      ...(e.cartaVuelta ? [e.cartaVuelta] : []),
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...e.conocidas.map((k) => k.carta),
      ...e.cantes.flatMap((k) => [reyDe(k.palo), damaDe(k.palo)]),
    ]);
    return [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.mazo].filter(
      (x) => !vistas.has(x),
    );
  },
  pasosMaximos: 600,
});
