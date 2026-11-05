import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_TYSIACHA,
  CONFIG_TYSIACHA_POR_DEFECTO,
  ganadoraTysiacha,
  puntosCartaTysiacha,
  puntuarManoTysiacha,
  redondear5Tysiacha,
  tysiacha,
  type AccionTysiacha,
  type EstadoTysiacha,
} from '../../src/juegos/tysiacha';
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
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(semilla = 'tysiacha'): EstadoTysiacha {
  const r = tysiacha.crear(CONFIG_TYSIACHA_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTysiacha, accion: AccionTysiacha): EstadoTysiacha {
  const r = aplicar(tysiacha, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const pujar = (e: EstadoTysiacha) => hacer(e, { tipo: 'pujar' });
const pasar = (e: EstadoTysiacha) => hacer(e, { tipo: 'pasar' });

/** Mano sin matrimonios para quien la necesite en la subasta. */
const SIN_MATRIMONIO = c('Ac 10c 9c Ad 10d 9d Jt');

describe('baraja y reparto', () => {
  it('24 cartas que suman 120; 7 a cada uno y 3 en el prikup que nadie ve', () => {
    expect(BARAJA_TYSIACHA).toHaveLength(24);
    expect(BARAJA_TYSIACHA.reduce((s, x) => s + puntosCartaTysiacha(x), 0)).toBe(120);
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([7, 7, 7]);
    expect(e.prikup).toHaveLength(3);
    expect(new Set([...e.manos.flat(), ...e.prikup]).size).toBe(24);
    expect(e.repartidor).toBe(2);
    for (const a of [0, 1, 2]) {
      const v = tysiacha.vistaDe(e, a);
      expect(v.prikup).toBeNull();
      const texto = JSON.stringify(v);
      for (const x of e.prikup) expect(texto).not.toContain(`"${x}"`);
    }
  });

  it('el orden: el 10 gana al K y a la Q', () => {
    expect(ganadoraTysiacha(enMesa([0, 'Kc'], [1, '10c'], [2, 'Qc']), null).asiento).toBe(1);
  });
});

describe('subasta', () => {
  it('abre el siguiente al que reparte con 100 y le toca al siguiente', () => {
    const e = nueva();
    expect(e.pujas).toEqual([100, null, null]);
    expect(e.puja).toBe(100);
    expect(e.turno).toBe(1);
    expect(e.fase).toBe('subasta');
  });

  it('sin matrimonio no se pasa de 120', () => {
    const e = { ...nueva(), puja: 120, manos: [c(''), SIN_MATRIMONIO, c('')] };
    expect(tysiacha.accionesLegales(e, 1)).toEqual([{ tipo: 'pasar' }]);
    const conMatrimonio = { ...e, manos: [c(''), c('Kp Qp 9c Ad 10d 9d Jt'), c('')] };
    expect(tysiacha.accionesLegales(conMatrimonio, 1)).toContainEqual({ tipo: 'pujar' });
  });

  it('quien puja y ve pasar a los otros dos gana con su puja', () => {
    let e = nueva();
    e = pujar(e); // 1: 105
    e = pujar(e); // 2: 110
    e = pasar(e); // 0
    e = pujar(e); // 1: 115
    e = pasar(e); // 2
    expect(e.fase).toBe('dar');
    expect(e.declarante).toBe(1);
    expect(e.contrato).toBe(115);
    expect(e.manos[1]).toHaveLength(10);
    for (const a of [0, 1, 2]) expect(tysiacha.vistaDe(e, a).prikup).toEqual(e.prikup);
  });

  it('si los otros dos pasan, el que abrió juega 100', () => {
    let e = pasar(nueva());
    e = pasar(e);
    expect(e.declarante).toBe(0);
    expect(e.contrato).toBe(100);
  });
});

describe('dar y contrato', () => {
  function ganada(mano?: IdCarta[]) {
    let e = pasar(nueva());
    e = pasar(e);
    if (mano) e = { ...e, manos: e.manos.map((m, a) => (a === 0 ? mano : m)) };
    return e;
  }

  it('da una carta a cada rival, y cada uno ve solo la suya', () => {
    let e = ganada();
    const [x, y] = [...e.manos[0]!].sort();
    e = hacer(e, { tipo: 'dar', carta: x! });
    e = hacer(e, { tipo: 'dar', carta: y! });
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8]);
    expect(e.manos[1]).toContain(x);
    expect(e.manos[2]).toContain(y);
    expect(e.fase).toBe('contrato');
    expect(tysiacha.vistaDe(e, 1).dadas).toEqual([null, x, null]);
    expect(tysiacha.vistaDe(e, 2).dadas).toEqual([null, null, y]);
    expect(tysiacha.vistaDe(e, 0).dadas).toEqual([null, x, y]);
  });

  it('el tope del contrato es 120 más los matrimonios; con picas, 160', () => {
    let e = ganada(c('Kp Qp 9c 9d 9t Jc Jd Jt Ac Ad'));
    e = hacer(e, { tipo: 'dar', carta: una('9c') });
    e = hacer(e, { tipo: 'dar', carta: una('9d') });
    const valores = tysiacha
      .accionesLegales(e, 0)
      .flatMap((a) => (a.tipo === 'fijar' ? [a.valor] : []));
    expect(valores[0]).toBe(100);
    expect(valores.at(-1)).toBe(160);
    e = hacer(e, { tipo: 'fijar', valor: 140 });
    expect(e.contrato).toBe(140);
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
  });
});

describe('bazas y matrimonios', () => {
  function enBazas(manos: string[], parcial: Partial<EstadoTysiacha> = {}): EstadoTysiacha {
    return {
      ...nueva(),
      manos: manos.map(c),
      fase: 'bazas',
      declarante: 0,
      contrato: 100,
      turno: 0,
      ...parcial,
    };
  }

  it('sin triunfo, el As de otro palo no gana', () => {
    let e = enBazas(['9p', 'Ac', '10p'], {});
    e = hacer(e, { tipo: 'jugar', carta: una('9p') });
    e = hacer(e, { tipo: 'jugar', carta: una('Ac') });
    e = hacer(e, { tipo: 'jugar', carta: una('10p') });
    expect(e.resultadosManos.at(-1)!.puntosCartas).toEqual([0, 0, 21]);
  });

  it('sin el palo hay que echar triunfo', () => {
    const e = enBazas(['', '9t Ad', ''], {
      triunfo: 'treboles',
      turno: 1,
      mesa: enMesa([0, '10c']),
    });
    expect(tysiacha.accionesLegales(e, 1)).toEqual([{ tipo: 'jugar', carta: una('9t') }]);
  });

  it('no hay obligación de ganar la baza', () => {
    const e = enBazas(['', 'Ac 9c', ''], { turno: 1, mesa: enMesa([0, '10c']) });
    expect(tysiacha.accionesLegales(e, 1)).toHaveLength(2);
  });

  it('con una baza ganada, salir con la Q teniendo el K canta y cambia el triunfo', () => {
    let e = enBazas(['Qd Kd', '9c 9p', '10c Jp'], { bazasGanadas: [1, 0, 0], triunfo: 'picas' });
    e = hacer(e, { tipo: 'jugar', carta: una('Qd') });
    expect(e.triunfo).toBe('diamantes');
    expect(e.puntosMatrimonios).toEqual([80, 0, 0]);
    expect(e.matrimonios).toEqual([{ asiento: 0, palo: 'diamantes' }]);
  });

  it('sin baza ganada no se canta', () => {
    let e = enBazas(['Kc Qc', '9p 9t', '10p Jt']);
    e = hacer(e, { tipo: 'jugar', carta: una('Kc') });
    expect(e.triunfo).toBeNull();
    expect(e.puntosMatrimonios).toEqual([0, 0, 0]);
  });

  it('quien no sigue ni echa el triunfo queda sin ese palo y sin el triunfo', () => {
    let e = enBazas(['', '9d', ''], { triunfo: 'treboles', turno: 1, mesa: enMesa([0, 'Ap']) });
    e = hacer(e, { tipo: 'jugar', carta: una('9d') });
    expect(e.fallos[1]).toEqual(['picas', 'treboles']);
  });
});

describe('puntuación y barril', () => {
  const sinBarril = [null, null, null];

  it('cumple: anota el contrato; los rivales redondean a 5', () => {
    const r = puntuarManoTysiacha(
      CONFIG_TYSIACHA_POR_DEFECTO,
      0,
      120,
      [135, 37, 43],
      [0, 0, 0],
      sinBarril,
    );
    expect(r.cumplido).toBe(true);
    expect(r.anotado).toEqual([120, 35, 45]);
    expect(redondear5Tysiacha(38)).toBe(40);
  });

  it('no cumple: resta el contrato', () => {
    const r = puntuarManoTysiacha(
      CONFIG_TYSIACHA_POR_DEFECTO,
      0,
      140,
      [125, 0, 0],
      [0, 0, 0],
      sinBarril,
    );
    expect(r.anotado[0]).toBe(-140);
    expect(r.marcador[0]).toBe(-140);
  });

  it('llegar a 880 sube al barril y se queda en 880', () => {
    const r = puntuarManoTysiacha(
      CONFIG_TYSIACHA_POR_DEFECTO,
      0,
      100,
      [100, 45, 0],
      [0, 850, 0],
      sinBarril,
    );
    expect(r.marcador[1]).toBe(880);
    expect(r.barril).toEqual([null, 0, null]);
  });

  it('en el barril, como rival, no anota y cuenta una mano', () => {
    const r = puntuarManoTysiacha(
      CONFIG_TYSIACHA_POR_DEFECTO,
      0,
      100,
      [100, 30, 0],
      [0, 880, 0],
      [null, 0, null],
    );
    expect(r.marcador[1]).toBe(880);
    expect(r.anotado[1]).toBe(0);
    expect(r.barril[1]).toBe(1);
  });

  it('tras 3 manos en el barril baja a 760', () => {
    const r = puntuarManoTysiacha(
      CONFIG_TYSIACHA_POR_DEFECTO,
      0,
      100,
      [100, 30, 0],
      [0, 880, 0],
      [null, 2, null],
    );
    expect(r.marcador[1]).toBe(760);
    expect(r.barril[1]).toBeNull();
  });

  it('desde el barril, cumplir 120 gana la partida', () => {
    const r = puntuarManoTysiacha(
      CONFIG_TYSIACHA_POR_DEFECTO,
      1,
      120,
      [0, 120, 0],
      [0, 880, 0],
      [null, 1, null],
    );
    expect(r.marcador[1]).toBe(1000);
    expect(r.ganador).toBe(1);
  });

  it('desde el barril, fallar resta y baja del barril', () => {
    const r = puntuarManoTysiacha(
      CONFIG_TYSIACHA_POR_DEFECTO,
      1,
      120,
      [0, 100, 20],
      [0, 880, 0],
      [null, 1, null],
    );
    expect(r.marcador[1]).toBe(760);
    expect(r.barril[1]).toBeNull();
  });
});

describe('partida', () => {
  it('termina cuando un declarante cumple y llega a la meta', () => {
    const e: EstadoTysiacha = {
      ...nueva(),
      manos: [c('Ac'), c('9p'), c('9t')],
      fase: 'bazas',
      declarante: 0,
      contrato: 100,
      turno: 0,
      puntosCartas: [100, 0, 0],
      marcador: [880, 0, 0],
      barril: [1, null, null],
    };
    let f = hacer(e, { tipo: 'jugar', carta: una('Ac') });
    f = hacer(f, { tipo: 'jugar', carta: una('9p') });
    f = hacer(f, { tipo: 'jugar', carta: una('9t') });
    // 111 con el contrato de 100: 980 desde el barril no llega, no cuenta.
    expect(f.marcador[0]).toBe(880);
    expect(tysiacha.resultado(f)).toBeNull();
    let g = hacer(
      { ...e, contrato: 120, puntosCartas: [120, 0, 0] },
      { tipo: 'jugar', carta: una('Ac') },
    );
    g = hacer(g, { tipo: 'jugar', carta: una('9p') });
    g = hacer(g, { tipo: 'jugar', carta: una('9t') });
    expect(tysiacha.resultado(g)).toEqual({ ganadores: [0], empate: false, puntos: [1000, 0, 0] });
    expect(tysiacha.accionesLegales(g, g.turno)).toEqual([]);
  });
});

describirContrato(tysiacha, {
  configs: [CONFIG_TYSIACHA_POR_DEFECTO, { jugadores: 3, meta: 300 }],
  // El prikup enseñado es público; la carta dada solo la ven el declarante y quien la recibe.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...(e.prikupVisto ? e.prikup : []),
    ]);
    for (const [a, d] of e.dadas.entries()) {
      if (d !== null && (a === asiento || asiento === e.declarante)) vistas.add(d);
    }
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 2_000,
});
