import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_DOPPELKOPF,
  CONFIG_DOPPELKOPF_POR_DEFECTO,
  doppelkopf,
  ganadoraDoppelkopf,
  puntuarManoDoppelkopf,
  type AccionDoppelkopf,
  type BazaDoppelkopf,
  type EstadoDoppelkopf,
} from '../../src/juegos/doppelkopf';
import { aplicar } from '../../src/motor/aplicar';
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

function nueva(semilla = 'doppelkopf'): EstadoDoppelkopf {
  const r = doppelkopf.crear(CONFIG_DOPPELKOPF_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function jugar(e: EstadoDoppelkopf, accion: AccionDoppelkopf): EstadoDoppelkopf {
  const r = aplicar(doppelkopf, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoDoppelkopf) => doppelkopf.accionesLegales(e, e.turno);
const jugarCarta = (carta: string): AccionDoppelkopf => ({ tipo: 'jugar', carta: una(carta) });
const cartasLegales = (e: EstadoDoppelkopf) =>
  legales(e).flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));

/** Un juego normal en bazas, le toca al 0; Re son el 0 y el 2. */
function preparado(parcial: Partial<EstadoDoppelkopf>): EstadoDoppelkopf {
  return {
    ...nueva(),
    fase: 'bazas',
    turno: 0,
    reservas: ['sano', 'sano', 'sano', 'sano'],
    juego: 'normal',
    re: [0, 2],
    manos: [c('Qt 9p'), c('Ap 9d'), c('Qt Kp'), c('10p Ac')],
    ...parcial,
  };
}

/** Las 12 bazas de una mano con los puntos de cartas indicados para cada ganador. */
function bazasCon(ganadores: readonly number[], cartas: (i: number) => string): BazaDoppelkopf[] {
  return ganadores.map((ganador, i) => ({
    ganador,
    cartas: c(cartas(i)).map((carta, k) => ({ asiento: (ganador + k) % 4, carta })),
  }));
}

describe('baraja y reparto', () => {
  it('48 cartas, dos copias de cada una, que suman 240', () => {
    expect(BARAJA_DOPPELKOPF).toHaveLength(48);
    expect(BARAJA_DOPPELKOPF.filter((x) => x === una('Qt'))).toHaveLength(2);
    const puntos = BARAJA_DOPPELKOPF.reduce(
      (s, x) =>
        s +
        ({ 1: 11, 10: 10, 13: 4, 12: 3, 11: 2, 9: 0 } as Record<number, number>)[
          Number(x.split('-')[1])
        ]!,
      0,
    );
    expect(puntos).toBe(240);
  });

  it('12 cartas a cada uno y sin mazo; reparte el 3 y sale el 0', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([12, 12, 12, 12]);
    expect(e.repartidor).toBe(3);
    expect(e.salida).toBe(0);
    expect(e.turno).toBe(0);
    expect(e.fase).toBe('reservas');
  });
});

describe('triunfos y bazas', () => {
  it('el 10 de corazones gana a la Q de tréboles', () => {
    const mesa = [
      { asiento: 0, carta: una('Qt') },
      { asiento: 1, carta: una('10c') },
    ];
    expect(ganadoraDoppelkopf(mesa, 'normal').asiento).toBe(1);
  });

  it('los diamantes son triunfo: el 9 de diamantes falla a las picas', () => {
    const mesa = [
      { asiento: 0, carta: una('Ap') },
      { asiento: 1, carta: una('9d') },
      { asiento: 2, carta: una('10p') },
    ];
    expect(ganadoraDoppelkopf(mesa, 'normal').asiento).toBe(1);
  });

  it('en el solo de Damas el 10 de corazones es de corazones, por debajo del As', () => {
    const mesa = [
      { asiento: 0, carta: una('10c') },
      { asiento: 1, carta: una('Ac') },
    ];
    expect(ganadoraDoppelkopf(mesa, 'damas').asiento).toBe(1);
    expect(ganadoraDoppelkopf(mesa, 'normal').asiento).toBe(0);
  });

  it('en el solo de Jotas solo las Jotas son triunfo', () => {
    const mesa = [
      { asiento: 0, carta: una('Ad') },
      { asiento: 1, carta: una('Jc') },
      { asiento: 2, carta: una('Qt') },
    ];
    expect(ganadoraDoppelkopf(mesa, 'jotas').asiento).toBe(1);
  });

  it('hay que seguir el triunfo', () => {
    const e = preparado({
      turno: 1,
      mesa: [{ asiento: 0, carta: una('Jp') }],
      manos: [c('9p'), c('9d Ap Kt'), c('Qt Kp'), c('10p Ac')],
    });
    expect(cartasLegales(e)).toEqual([una('9d')]);
  });

  it('sin el palo de salida se puede jugar cualquier carta', () => {
    const e = preparado({
      turno: 1,
      mesa: [{ asiento: 0, carta: una('Ac') }],
      manos: [c('9p'), c('9d Ap Kt'), c('Qt Kp'), c('10p Ac')],
    });
    expect(cartasLegales(e)).toHaveLength(3);
  });

  it('con dos cartas iguales gana la primera', () => {
    const mesa = [
      { asiento: 0, carta: una('9d') },
      { asiento: 1, carta: una('Qt') },
      { asiento: 2, carta: una('Qt') },
      { asiento: 3, carta: una('Jp') },
    ];
    expect(ganadoraDoppelkopf(mesa, 'normal').asiento).toBe(1);
  });

  it('el ganador sale en la siguiente baza', () => {
    let e = preparado({
      manos: [c('9p 9t'), c('Ap 9t'), c('Kp 9t'), c('10p 9t')],
    });
    for (const x of ['9p', 'Ap', 'Kp', '10p']) e = jugar(e, jugarCarta(x));
    expect(e.bazas).toHaveLength(1);
    expect(e.turno).toBe(1);
  });
});

describe('parejas y bandos', () => {
  it('cada uno sabe su bando, pero no quién es su pareja', () => {
    const e = preparado({});
    const v = doppelkopf.vistaDe(e, 0);
    expect(v.bandos[0]).toBe('re');
    expect(v.bandos[1]).toBeNull();
    expect(v.bandos[2]).toBeNull();
  });

  it('al jugar una Q de tréboles se descubre el bando Re', () => {
    let e = preparado({ turno: 2, mesa: [] });
    e = jugar(e, jugarCarta('Qt'));
    const v = doppelkopf.vistaDe(e, 1);
    expect(v.bandos[2]).toBe('re');
    // Desde el 0 (Re), ya sabe que los otros dos son de Contra.
    expect(doppelkopf.vistaDe(e, 0).bandos).toEqual(['re', 'contra', 're', 'contra']);
  });

  it('el bando Re son los que tienen las Q de tréboles al acabar las reservas', () => {
    let e = nueva('parejas');
    const conDama = e.manos.flatMap((m, a) => (m.includes(una('Qt')) ? [a] : []));
    if (conDama.length !== 2) return; // con las dos en una mano sería boda
    for (let i = 0; i < 4; i++) e = jugar(e, { tipo: 'reservar', reserva: 'sano' });
    expect(e.fase).toBe('bazas');
    expect(e.juego).toBe('normal');
    expect(e.re).toEqual(conDama);
  });
});

describe('reservas', () => {
  /** Una mano en reservas donde el 1 tiene las dos Q de tréboles. */
  function conBoda(): EstadoDoppelkopf {
    const e = nueva('reservas');
    const manos = [
      c('Kt Kt 9t 9t Ap Ap 9p 9p Ac Ac 9c 9c'),
      c('Qt Qt Qp Qp Qc Qc Qd Qd Jt Jt Jp Jp'),
      c('Jc Jc Jd Jd Ad Ad 10d 10d Kd Kd 9d 9d'),
      c('10c 10c At At 10t 10t 10p 10p Kp Kp Kc Kc'),
    ];
    return { ...e, manos };
  }

  it('quien tiene las dos Q de tréboles no puede decir «sano»', () => {
    const e = jugar(conBoda(), { tipo: 'reservar', reserva: 'sano' });
    const acciones = legales(e).map((a) => (a.tipo === 'reservar' ? a.reserva : ''));
    expect(acciones).toEqual(['boda', 'damas', 'jotas', 'triunfo']);
  });

  it('boda: la pareja es el primero que gana una de las tres primeras bazas', () => {
    let e = conBoda();
    for (const r of ['sano', 'boda', 'sano', 'sano'] as const) {
      e = jugar(e, { tipo: 'reservar', reserva: r });
    }
    expect(e.juego).toBe('boda');
    expect(e.solista).toBe(1);
    e = { ...e, manos: [c('Ac 9p'), c('Qt Jp'), c('Kc Jc'), c('9c 10c')] };
    // Primera baza: la gana el de la boda con su Q de tréboles.
    for (const x of ['Ac', 'Qt', 'Kc', '9c']) e = jugar(e, jugarCarta(x));
    expect(e.bazas[0]!.ganador).toBe(1);
    expect(e.pareja).toBeNull();
    // Segunda: la gana el 3 con el 10 de corazones.
    for (const x of ['Jp', 'Jc', '10c', '9p']) e = jugar(e, jugarCarta(x));
    expect(e.pareja).toBe(3);
    expect(e.re).toEqual([1, 3]);
    expect(e.bazaPareja).toBe(2);
  });

  it('boda: pareja descubierta cuando gana otro', () => {
    let e = conBoda();
    for (const r of ['sano', 'boda', 'sano', 'sano'] as const) {
      e = jugar(e, { tipo: 'reservar', reserva: r });
    }
    // Sale el 0 con el 9 de corazones; el 1 juega una Q (triunfo) y... para que gane el 3
    // jugamos el 1 una carta que no gane: el 1 no tiene corazones y tiene que jugar triunfo.
    // Mejor: el 0 sale con 9 de picas, el 1 juega Q de diamantes, el 2 la J de corazones, el 3
    // el 10 de picas: gana el 1. Para que gane otro, sale el 0 con As de corazones y el 1 juega
    // la J de picas; el 2 la Q... no tiene. Usamos un estado directo.
    e = {
      ...e,
      manos: [c('Ac 9p'), c('Jp Qt'), c('Jc Ad'), c('10c Kp')],
    };
    for (const x of ['Ac', 'Jp', 'Jc', '10c']) e = jugar(e, jugarCarta(x));
    expect(e.bazas[0]!.ganador).toBe(3);
    expect(e.pareja).toBe(3);
    expect(e.re).toEqual([1, 3]);
    expect(e.bazaPareja).toBe(1);
    expect(doppelkopf.vistaDe(e, 0).bandos).toEqual(['contra', 're', 'contra', 're']);
  });

  it('boda sin pareja: si gana las tres primeras bazas juega solo', () => {
    let e = conBoda();
    for (const r of ['sano', 'boda', 'sano', 'sano'] as const) {
      e = jugar(e, { tipo: 'reservar', reserva: r });
    }
    e = { ...e, manos: [c('9p 9p 9p 9t'), c('Qt Qt Qp Qp'), c('Jd Jd Jd Jd'), c('Kp Kp Kp Kt')] };
    for (const x of ['9p', 'Qt', 'Jd', 'Kp']) e = jugar(e, jugarCarta(x));
    for (const x of ['Qt', 'Jd', 'Kp', '9p']) e = jugar(e, jugarCarta(x));
    expect(e.turno).toBe(1);
    for (const x of ['Qp', 'Jd', 'Kp', '9p']) e = jugar(e, jugarCarta(x));
    expect(e.pareja).toBeNull();
    expect(e.bazaPareja).toBe(3);
    expect(e.re).toEqual([1]);
    expect(doppelkopf.vistaDe(e, 0).bandos).toEqual(['contra', 're', 'contra', 'contra']);
  });

  it('solo de Jotas: juega solo y solo las Jotas son triunfo', () => {
    let e = conBoda();
    for (const r of ['sano', 'boda', 'jotas', 'sano'] as const) {
      e = jugar(e, { tipo: 'reservar', reserva: r });
    }
    expect(e.juego).toBe('jotas');
    expect(e.solista).toBe(2);
    expect(e.re).toEqual([2]);
    expect(e.turno).toBe(0);
  });

  it('entre varios solos gana el primero que lo pidió', () => {
    let e = conBoda();
    for (const r of ['damas', 'triunfo', 'jotas', 'sano'] as const) {
      e = jugar(e, { tipo: 'reservar', reserva: r });
    }
    expect(e.juego).toBe('damas');
    expect(e.solista).toBe(0);
  });
});

describe('anuncios', () => {
  const doce = (s: string) => c(Array(12).fill(s).join(' '));

  it('anunciar Re en el primer turno descubre el bando', () => {
    let e = preparado({ manos: [doce('9p'), doce('9t'), doce('9c'), doce('9d')], re: [0, 2] });
    expect(legales(e)[0]).toEqual({ tipo: 'anunciar' });
    e = jugar(e, { tipo: 'anunciar' });
    expect(e.anuncios).toEqual([{ asiento: 0, bando: 're', nivel: 1 }]);
    expect(doppelkopf.vistaDe(e, 3).bandos[0]).toBe('re');
    expect(e.turno).toBe(0);
  });

  it('con 10 cartas ya no se puede anunciar Re ni Contra', () => {
    const e = preparado({
      manos: [doce('9p').slice(0, 10), doce('9t'), doce('9c'), doce('9d')],
    });
    expect(legales(e).some((a) => a.tipo === 'anunciar')).toBe(false);
  });

  it('las bajadas van después del anuncio del bando', () => {
    let e = preparado({ manos: [doce('9p').slice(0, 10), doce('9t'), doce('9c'), doce('9d')] });
    // El 0 tiene 10 cartas: con «Re» hecho, aún podría «no 90».
    e = { ...e, anuncios: [{ asiento: 2, bando: 're', nivel: 1 }] };
    expect(legales(e)[0]).toEqual({ tipo: 'anunciar' });
    e = jugar(e, { tipo: 'anunciar' });
    expect(e.anuncios.at(-1)).toEqual({ asiento: 0, bando: 're', nivel: 2 });
    // Contra no ha anunciado: el 1 no puede anunciar «no 90» (con 10 cartas, ni «Contra»).
    const e1 = {
      ...e,
      turno: 1,
      manos: [e.manos[0]!, doce('9t').slice(0, 10), e.manos[2]!, e.manos[3]!],
    };
    expect(legales(e1).some((a) => a.tipo === 'anunciar')).toBe(false);
  });

  it('en la boda no se anuncia hasta saber la pareja', () => {
    const e = preparado({
      juego: 'boda',
      solista: 0,
      re: [0],
      manos: [doce('Qt'), doce('9t'), doce('9c'), doce('9d')],
    });
    expect(legales({ ...e, turno: 1 }).some((a) => a.tipo === 'anunciar')).toBe(false);
    // Sabida la pareja en la segunda baza, los plazos bajan en 2 cartas.
    const sabida = { ...e, pareja: 1, bazaPareja: 2, re: [0, 1], turno: 1 };
    const con9 = { ...sabida, manos: [doce('Qt'), doce('9t').slice(0, 9), doce('9c'), doce('9d')] };
    expect(legales(con9).some((a) => a.tipo === 'anunciar')).toBe(true);
    const con8 = { ...sabida, manos: [doce('Qt'), doce('9t').slice(0, 8), doce('9c'), doce('9d')] };
    expect(legales(con8).some((a) => a.tipo === 'anunciar')).toBe(false);
  });
});

describe('puntos de la mano', () => {
  /** Manos con bazas que dan `re` puntos de cartas a Re (0 y 2) y el resto a Contra. */
  function mano(parcial: Partial<EstadoDoppelkopf>, bazas: BazaDoppelkopf[]): EstadoDoppelkopf {
    return preparado({ manos: [[], [], [], []], bazas, ...parcial });
  }
  /** Cuatro cartas de picas que suman cada valor (sin llegar a 40, que sería doppelkopf). */
  const COMBOS = (() => {
    const cartas: [string, number][] = [
      ['Ap', 11],
      ['10p', 10],
      ['Kp', 4],
      ['Qp', 3],
      ['Jp', 2],
      ['9p', 0],
    ];
    const r = new Map<number, string>();
    for (const a of cartas)
      for (const b of cartas)
        for (const x of cartas)
          for (const d of cartas) {
            const v = a[1] + b[1] + x[1] + d[1];
            if (v < 40 && !r.has(v)) r.set(v, [a[0], b[0], x[0], d[0]].join(' '));
          }
    return r;
  })();
  /** Bazas de un ganador que suman `puntos`. */
  const bazasDe = (ganador: number, puntos: number): BazaDoppelkopf[] => {
    const r: BazaDoppelkopf[] = [];
    let resto = puntos;
    while (resto > 0) {
      let v = Math.min(resto, 39);
      while (!COMBOS.has(v) || resto - v === 1) v--;
      r.push(...bazasCon([ganador], () => COMBOS.get(v)!));
      resto -= v;
    }
    return r;
  };
  /** Bazas en las que Re (0 y 2) gana `re` puntos de cartas y Contra el resto. */
  const reparto = (re: number): BazaDoppelkopf[] => [...bazasDe(0, re), ...bazasDe(1, 240 - re)];

  it('Re gana con 121; sin anuncios, una mano sencilla vale 1', () => {
    const r = puntuarManoDoppelkopf(mano({}, reparto(150)));
    expect(r.cartasRe).toBe(150);
    expect(r.ganador).toBe('re');
    expect(r.valor).toBe(1);
    expect(r.cambio).toEqual([1, -1, 1, -1]);
  });

  it('con 120 a 120 gana Contra, que suma además contra los viejos', () => {
    const r = puntuarManoDoppelkopf(mano({}, reparto(120)));
    expect(r.ganador).toBe('contra');
    expect(r.valor).toBe(-2);
    expect(r.cambio).toEqual([-2, 2, -2, 2]);
  });

  it('con «Re» anunciado, 175 a 65: vale 4', () => {
    const r = puntuarManoDoppelkopf(
      mano({ anuncios: [{ asiento: 0, bando: 're', nivel: 1 }] }, reparto(175)),
    );
    expect(r.ganador).toBe('re');
    expect(r.valor).toBe(4);
  });

  it('una bajada fallida da la mano a Contra', () => {
    const r = puntuarManoDoppelkopf(
      mano(
        {
          anuncios: [
            { asiento: 0, bando: 're', nivel: 1 },
            { asiento: 0, bando: 're', nivel: 2 },
          ],
        },
        reparto(145),
      ),
    );
    expect(r.ganador).toBe('contra');
    // Ganar 1, Re 2, no 90 anunciado 1, 90 contra no 60? no: 120 contra no 90 no (95), contra los viejos 1.
    expect(r.conceptos.map((x) => x.tipo).sort()).toEqual(
      ['anunciadoNo90', 'contraLosViejos', 'ganado', 're'].sort(),
    );
  });

  it('solo Contra anunció: Re gana con 120', () => {
    const r = puntuarManoDoppelkopf(
      mano({ anuncios: [{ asiento: 1, bando: 'contra', nivel: 1 }] }, reparto(120)),
    );
    expect(r.ganador).toBe('re');
    expect(r.valor).toBe(3);
  });

  it('zorro: Contra gana una baza con el As de diamantes de Re', () => {
    const bazas = reparto(150);
    bazas[1] = {
      ganador: 1,
      cartas: [
        { asiento: 1, carta: una('Qt') },
        { asiento: 2, carta: una('Ad') },
        { asiento: 3, carta: una('9d') },
        { asiento: 0, carta: una('9d') },
      ],
    };
    const r = puntuarManoDoppelkopf(mano({}, bazas));
    expect(r.conceptos).toContainEqual({ bando: 'contra', tipo: 'zorro', puntos: 1 });
  });

  it('doppelkopf: una baza de 40 puntos o más', () => {
    const bazas = reparto(150);
    bazas[0] = {
      ganador: 0,
      cartas: c('Ap Ap 10p 10p').map((carta, k) => ({ asiento: k, carta })),
    };
    const r = puntuarManoDoppelkopf(mano({}, bazas));
    expect(r.conceptos).toContainEqual({ bando: 're', tipo: 'doppelkopf', puntos: 1 });
  });

  it('Carlitos: la última baza ganada con la J de tréboles', () => {
    const bazas = reparto(150);
    bazas.push({
      ganador: 2,
      cartas: [
        { asiento: 1, carta: una('9d') },
        { asiento: 2, carta: una('Jt') },
        { asiento: 3, carta: una('9p') },
        { asiento: 0, carta: una('9p') },
      ],
    });
    const r = puntuarManoDoppelkopf(mano({}, bazas));
    expect(r.conceptos).toContainEqual({ bando: 're', tipo: 'carlitos', puntos: 1 });
  });

  it('solo: el solista gana 130 sin anuncios y suma 3', () => {
    const bazas = reparto(130).map((b) => ({ ...b, ganador: b.ganador === 0 ? 2 : 1 }));
    const r = puntuarManoDoppelkopf(
      mano(
        { juego: 'triunfo', solista: 2, re: [2], reservas: ['sano', 'sano', 'triunfo', 'sano'] },
        bazas,
      ),
    );
    expect(r.ganador).toBe('re');
    expect(r.cambio).toEqual([-1, -1, 3, -1]);
  });
});

describe('ronda y vista', () => {
  it('la partida termina tras 8 manos y gana el de más puntos', () => {
    const e = preparado({
      resultadosManos: Array(8).fill(null) as never,
      puntos: [3, -1, 3, -5],
    });
    expect(doppelkopf.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: true,
      puntos: [3, -1, 3, -5],
    });
    expect(doppelkopf.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('al acabar una mano se reparte otra con el siguiente repartidor', () => {
    let e = nueva('manos');
    for (let paso = 0; paso < 200 && e.resultadosManos.length === 0; paso++) {
      const a = legales(e).find((x) => x.tipo !== 'anunciar')!;
      e = jugar(e, a);
    }
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.repartidor).toBe(0);
    expect(e.salida).toBe(1);
    expect(e.manos.every((m) => m.length === 12)).toBe(true);
    expect(e.puntos.reduce((s, p) => s + p, 0)).toBe(0);
  });

  it('cada uno ve su mano y cuántas tienen los demás', () => {
    const v = doppelkopf.vistaDe(nueva(), 0);
    expect(v.miMano).toHaveLength(12);
    expect(v.cartasEnMano).toEqual([12, 12, 12, 12]);
    expect(JSON.stringify(v)).not.toContain('"manos":[');
  });
});

describirContrato(doppelkopf, {
  configs: [{ manos: 1 }, { manos: 2 }],
  // Con dos copias, una carta oculta puede tener su copia a la vista: solo cuentan las que no.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<IdCarta>([
      ...(asiento === null ? [] : e.manos[asiento]!),
      ...e.bazas.flatMap((b) => b.cartas.map((j) => j.carta)),
      ...e.mesa.map((j) => j.carta),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 400,
});
