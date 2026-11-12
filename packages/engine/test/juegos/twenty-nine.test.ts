import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_TWENTY_NINE,
  CONFIG_TWENTY_NINE_POR_DEFECTO,
  ganadoraTwentyNine,
  puntosTwentyNine,
  twentyNine,
  type AccionTwentyNine,
  type EstadoTwentyNine,
} from '../../src/juegos/twenty-nine';
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
const una = (t: string) => c(t)[0]!;
const enMesa = (...cartas: [number, string][]) =>
  cartas.map(([asiento, t]) => ({ asiento, carta: una(t) }));

function nueva(semilla = 'twenty', objetivo = 6): EstadoTwentyNine {
  const r = twentyNine.crear({ objetivo }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoTwentyNine, accion: AccionTwentyNine): EstadoTwentyNine {
  const r = aplicar(twentyNine, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const pasar = (e: EstadoTwentyNine) => hacer(e, { tipo: 'pasar' });
const pujar = (e: EstadoTwentyNine, valor: number) => hacer(e, { tipo: 'pujar', valor });

/** Un estado en bazas: el 0 pujó 20 con triunfo de corazones oculto. */
function enBazas(manos: string[], parcial: Partial<EstadoTwentyNine> = {}): EstadoTwentyNine {
  return {
    ...nueva(),
    fase: 'bazas',
    pujas: [20, 'paso', 'paso', 'paso'],
    pujaMayor: 20,
    pujador: 0,
    puja: 20,
    triunfo: 'corazones',
    pendientes: [[], [], [], []],
    manos: manos.map(c),
    turno: 0,
    ...parcial,
  };
}

describe('baraja, orden y puntos', () => {
  it('32 cartas que suman 28 puntos', () => {
    expect(BARAJA_TWENTY_NINE).toHaveLength(32);
    expect(BARAJA_TWENTY_NINE.reduce((s, x) => s + puntosTwentyNine(x), 0)).toBe(28);
  });

  it('la jota gana al As', () => {
    expect(ganadoraTwentyNine(enMesa([0, 'Ap'], [1, 'Jp']), null).asiento).toBe(1);
  });

  it('puntos de una baza', () => {
    expect(c('Jc 9c 10c 7c').reduce((s, x) => s + puntosTwentyNine(x), 0)).toBe(6);
  });
});

describe('reparto y subasta', () => {
  it('4 cartas a cada uno y 4 pendientes', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([4, 4, 4, 4]);
    expect(e.pendientes.map((m) => m.length)).toEqual([4, 4, 4, 4]);
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
  });

  it('gana la subasta el último que queda', () => {
    let e = pujar(nueva(), 16);
    e = pujar(e, 18);
    e = pasar(pasar(pasar(e)));
    expect(e.pujador).toBe(1);
    expect(e.puja).toBe(18);
    expect(e.fase).toBe('triunfo');
    expect(e.turno).toBe(1);
  });

  it('si pasan los cuatro, se reparte otra mano sin puntos', () => {
    const e = pasar(pasar(pasar(pasar(nueva()))));
    expect(e.resultadosManos[0]!.pasada).toBe(true);
    expect(e.marcador).toEqual([0, 0]);
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('subasta');
  });
});

describe('triunfo, doblar y redoblar', () => {
  const ganada = () => pasar(pasar(pasar(pujar(nueva(), 20))));

  it('el triunfo es secreto para los demás', () => {
    const e = hacer(ganada(), { tipo: 'elegirTriunfo', palo: 'corazones' });
    expect(twentyNine.vistaDe(e, 0).triunfo).toBe('corazones');
    expect(twentyNine.vistaDe(e, 1).triunfo).toBeNull();
    expect(twentyNine.vistaDe(e, 1).triunfoOculto).toBe(true);
  });

  it('sin triunfo se anuncia', () => {
    const e = hacer(ganada(), { tipo: 'elegirTriunfo', palo: null });
    expect(twentyNine.vistaDe(e, 1).sinTriunfo).toBe(true);
    expect(twentyNine.vistaDe(e, 1).triunfoOculto).toBe(false);
  });

  it('doblar sin redoblar: la mano vale 2 y se reparten 4 más', () => {
    let e = hacer(ganada(), { tipo: 'elegirTriunfo', palo: 'corazones' });
    expect(e.turno).toBe(1);
    e = hacer(e, { tipo: 'doblar' });
    expect(e.turno).toBe(0);
    e = hacer(e, { tipo: 'noRedoblar' });
    expect(e.multiplicador).toBe(2);
    expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
    expect(e.fase).toBe('bazas');
    expect(e.turno).toBe(0);
  });

  it('si no dobla ninguno, la mano vale 1', () => {
    let e = hacer(ganada(), { tipo: 'elegirTriunfo', palo: 'corazones' });
    e = hacer(hacer(e, { tipo: 'noDoblar' }), { tipo: 'noDoblar' });
    expect(e.multiplicador).toBe(1);
    expect(e.fase).toBe('bazas');
  });
});

describe('bazas y pedir el triunfo', () => {
  it('pedir el triunfo lo descubre y obliga a echar triunfo', () => {
    let e = enBazas(['Ap', '7d 8c Kc', '', ''], {
      triunfo: 'diamantes',
      turno: 1,
      mesa: enMesa([0, 'Ap']),
    });
    expect(twentyNine.accionesLegales(e, 1)).toContainEqual({ tipo: 'pedirTriunfo' });
    e = hacer(e, { tipo: 'pedirTriunfo' });
    expect(twentyNine.vistaDe(e, 2).triunfo).toBe('diamantes');
    expect(twentyNine.accionesLegales(e, 1)).toEqual([{ tipo: 'jugarCarta', carta: una('7d') }]);
  });

  it('un triunfo oculto no gana la baza', () => {
    let e = enBazas(['Ap', '7c', '8p', 'Kp'], { turno: 0 });
    for (const t of ['Ap', '7c', '8p', 'Kp']) e = hacer(e, { tipo: 'jugarCarta', carta: una(t) });
    expect(e.resultadosManos.at(-1)!.puntos).toEqual([1, 0]);
  });

  it('con el triunfo descubierto, el triunfo gana', () => {
    let e = enBazas(['Ap', '7c', '8p', 'Kp'], { turno: 0, descubierto: true });
    for (const t of ['Ap', '7c', '8p', 'Kp']) e = hacer(e, { tipo: 'jugarCarta', carta: una(t) });
    expect(e.resultadosManos.at(-1)!.puntos).toEqual([0, 1]);
  });
});

describe('la pareja', () => {
  it('del lado que pujó, la puja baja 4', () => {
    const e = enBazas(['', '', 'Kc Qc', ''], { descubierto: true, turno: 2, puja: 22 });
    expect(hacer(e, { tipo: 'cantarPareja' }).puja).toBe(18);
  });

  it('del otro lado, sube 4 sin pasar de 28', () => {
    const e = enBazas(['', 'Kc Qc', '', ''], { descubierto: true, turno: 1, puja: 26 });
    expect(hacer(e, { tipo: 'cantarPareja' }).puja).toBe(28);
  });

  it('sin el triunfo descubierto no se puede cantar', () => {
    const e = enBazas(['', 'Kc Qc', '', ''], { turno: 1 });
    expect(twentyNine.accionesLegales(e, 1)).not.toContainEqual({ tipo: 'cantarPareja' });
  });
});

describe('puntuación y partida', () => {
  /** Juega la última baza (la gana el 0, con 6 puntos) con esos puntos ya hechos. */
  function ultima(parcial: Partial<EstadoTwentyNine>) {
    let e = enBazas(['Jp', '7c', '9p', '8d'], parcial);
    for (const t of ['Jp', '7c', '9p', '8d']) e = hacer(e, { tipo: 'jugarCarta', carta: una(t) });
    return e;
  }

  it('puja cumplida: gana 1', () => {
    const e = ultima({ puja: 20, puntosMano: [16, 7] });
    const r = e.resultadosManos.at(-1)!;
    expect(r.cumplida).toBe(true);
    expect(r.cambio).toEqual([1, 0]);
  });

  it('puja fallada redoblada: pierde 4', () => {
    const e = ultima({ puja: 18, multiplicador: 4, puntosMano: [9, 13] });
    const r = e.resultadosManos.at(-1)!;
    expect(r.puntos[0]).toBe(14);
    expect(r.cambio).toEqual([-4, 0]);
  });

  it('gana la pareja que llega a 6', () => {
    const e = ultima({ puja: 20, puntosMano: [16, 7], marcador: [5, 0] });
    expect(twentyNine.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [6, 0, 6, 0],
    });
  });

  it('si una pareja llega a −6, gana la otra', () => {
    const e = ultima({ puja: 28, puntosMano: [0, 7], marcador: [-5, 0] });
    expect(twentyNine.resultado(e)!.ganadores).toEqual([1, 3]);
  });
});

describirContrato(twentyNine, {
  configs: [CONFIG_TWENTY_NINE_POR_DEFECTO, { objetivo: 1 }],
  // Las manos ajenas y todas las pendientes (también las propias) están ocultas.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    const ajenas = e.manos.flatMap((m, a) => (a === asiento ? [] : m));
    return [...ajenas, ...e.pendientes.flat()].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 2_000,
});
