import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  bourre,
  CONFIG_BOURRE_POR_DEFECTO,
  type AccionBourre,
  type EstadoBourre,
} from '../../src/juegos/bourre';
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

function nueva(semilla = 'bourre', manos = 15, fichas = 100): EstadoBourre {
  const r = bourre.crear({ jugadores: 5, manos, fichas }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoBourre, accion: AccionBourre): EstadoBourre {
  const r = aplicar(bourre, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const jugar = (e: EstadoBourre) => hacer(e, { tipo: 'jugar' });
const pasar = (e: EstadoBourre) => hacer(e, { tipo: 'pasar' });
const robar = (e: EstadoBourre) => hacer(e, { tipo: 'robar' });

/** Un estado en bazas, con triunfo de corazones (la vuelta es del 4, que no juega). */
function enBazas(manos: string[], parcial: Partial<EstadoBourre> = {}): EstadoBourre {
  return {
    ...nueva(),
    fase: 'bazas',
    vuelta: una('2c'),
    juega: [true, true, true, false, false],
    manos: manos.map(c),
    turno: 0,
    ...parcial,
  };
}

describe('entrada, reparto y vuelta', () => {
  it('cada uno pone 1, recibe 5 y todos ven la vuelta del que reparte', () => {
    const e = nueva();
    expect(e.fichas).toEqual([99, 99, 99, 99, 99]);
    expect(e.bote).toBe(5);
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5, 5]);
    expect(e.mazo).toHaveLength(27);
    expect(e.repartidor).toBe(4);
    expect(e.manos[4]).toContain(e.vuelta);
    expect(bourre.vistaDe(e, 0).vuelta).toBe(e.vuelta);
    expect(e.turno).toBe(0);
  });
});

describe('jugar o pasar', () => {
  it('si juega uno solo se lleva el bote', () => {
    let e = jugar(nueva());
    for (let i = 0; i < 4; i++) e = pasar(e);
    const r = e.resultadosManos.at(-1)!;
    expect(r.ganador).toBe(0);
    expect(r.cambioFichas[0]).toBe(5);
    // Nueva mano: el 0 tenía 104 y pone 1.
    expect(e.fichas[0]).toBe(103);
  });

  it('si no juega nadie el bote se queda', () => {
    let e = nueva();
    for (let i = 0; i < 5; i++) e = pasar(e);
    expect(e.resultadosManos.at(-1)!.ganador).toBeNull();
    expect(e.bote).toBe(10);
  });

  it('con dos o más empieza el cambio; el que reparte no puede descartar la vuelta', () => {
    let e = nueva();
    e = pasar(jugar(jugar(jugar(e))));
    e = jugar(e);
    expect(e.fase).toBe('cambio');
    expect(e.turno).toBe(0);
    e = robar(e);
    e = robar(e);
    e = robar(e);
    expect(e.turno).toBe(4);
    const descartables = bourre
      .accionesLegales(e, 4)
      .flatMap((a) => (a.tipo === 'descartar' ? [a.carta] : []));
    expect(descartables).toHaveLength(4);
    expect(descartables).not.toContain(e.vuelta);
  });

  it('cambiar dos cartas', () => {
    let e = nueva();
    e = jugar(jugar(e));
    for (let i = 0; i < 3; i++) e = pasar(e);
    const [x, y] = [...e.manos[0]!];
    e = hacer(e, { tipo: 'descartar', carta: x! });
    e = hacer(e, { tipo: 'descartar', carta: y! });
    e = robar(e);
    expect(e.manos[0]).toHaveLength(5);
    expect(e.mazo).toHaveLength(25);
    expect(e.cambiadas[0]).toBe(2);
    expect(bourre.vistaDe(e, 1).cambiadas[0]).toBe(2);
  });
});

describe('bazas', () => {
  it('quien sale con el As de triunfo tiene que salir con él', () => {
    const e = enBazas(['Ac 7p 8t', '', '']);
    expect(bourre.accionesLegales(e, 0)).toEqual([{ tipo: 'jugarCarta', carta: una('Ac') }]);
  });

  it('con el palo hay que ganar si se puede', () => {
    const e = enBazas(['', '7p Qp', ''], { turno: 1, mesa: enMesa([0, '9p']) });
    expect(bourre.accionesLegales(e, 1)).toEqual([{ tipo: 'jugarCarta', carta: una('Qp') }]);
  });

  it('sin el palo hay que superar el triunfo', () => {
    const e = enBazas(['', '5c Kc 8t', ''], {
      vuelta: una('2c'),
      turno: 1,
      mesa: enMesa([0, '9p']),
    });
    expect(bourre.accionesLegales(e, 1)).toEqual([
      { tipo: 'jugarCarta', carta: una('Kc') },
      { tipo: 'jugarCarta', carta: una('5c') },
    ]);
    const f = { ...e, turno: 2, mesa: enMesa([0, '9p'], [1, '10c']), manos: [[], [], c('5c Kc')] };
    expect(bourre.accionesLegales(f, 2)).toEqual([{ tipo: 'jugarCarta', carta: una('Kc') }]);
  });

  it('el que más bazas hace se lleva el bote; quien no hace ninguna paga el bote', () => {
    let e = enBazas(['Ap', '7p', '8p'], {
      bote: 5,
      bazas: [3, 1, 0, 0, 0],
      fichas: [99, 99, 99, 99, 99],
    });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('Ap') });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('7p') });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('8p') });
    const r = e.resultadosManos.at(-1)!;
    expect(r.ganador).toBe(0);
    expect(r.bourre).toEqual([2]);
    expect(r.cambioFichas).toEqual([5, 0, -5, 0, 0]);
    expect(r.boteTras).toBe(5);
  });

  it('con empate en bazas el bote se queda', () => {
    let e = enBazas(['Ap', '7p', '8p'], { bote: 5, bazas: [1, 2, 1, 0, 0] });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('Ap') });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('7p') });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('8p') });
    const r = e.resultadosManos.at(-1)!;
    expect(r.ganador).toBeNull();
    expect(r.boteTras).toBe(5);
  });

  it('quien no sigue ni echa triunfo queda sin ese palo y sin triunfos', () => {
    let e = enBazas(['', '8t 9t', ''], { turno: 1, mesa: enMesa([0, '9p']) });
    e = hacer(e, { tipo: 'jugarCarta', carta: una('8t') });
    expect(e.fallos[1]).toEqual(['picas', 'corazones']);
  });
});

describe('partida', () => {
  it('termina tras las manos de la config y gana quien tiene más fichas', () => {
    let e = nueva('corta', 2);
    while (bourre.resultado(e) === null) e = hacer(e, bourre.accionesLegales(e, e.turno)[0]!);
    expect(e.resultadosManos).toHaveLength(2);
    expect(bourre.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('termina si solo queda uno con fichas, y los demás no reciben cartas', () => {
    const e = nueva('pocas', 15, 1);
    // Todos tienen 0 tras la entrada; el 0 juega solo y se lleva el bote.
    let f = jugar(e);
    for (let i = 0; i < 4; i++) f = pasar(f);
    expect(f.fichas).toEqual([5, 0, 0, 0, 0]);
    expect(bourre.resultado(f)).toEqual({ ganadores: [0], empate: false, puntos: [5, 0, 0, 0, 0] });
  });
});

describirContrato(bourre, {
  configs: [CONFIG_BOURRE_POR_DEFECTO, { jugadores: 5, manos: 2, fichas: 3 }],
  // La vuelta es pública; los descartes y el mazo, no.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []), e.vuelta]);
    const ajenas = e.manos.flatMap((m, a) => (a === asiento ? [] : m));
    return [...ajenas, ...e.mazo, ...e.descartes].filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1_000,
});
