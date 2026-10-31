import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_JASS,
  CONFIG_JASS_POR_DEFECTO,
  ganadoraJass,
  jass,
  mejorWeisJass,
  MODOS_JASS,
  puntosCartaJass,
  weisJass,
  type AccionJass,
  type EstadoJass,
} from '../../src/juegos/jass';
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

function nueva(semilla = 'jass', meta = 1000): EstadoJass {
  const r = jass.crear({ jugadores: 4, meta }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoJass, accion: AccionJass | string): EstadoJass {
  const a: AccionJass = typeof accion === 'string' ? { tipo: 'jugar', carta: una(accion) } : accion;
  const r = aplicar(jass, e, e.turno, a);
  if (!r.ok) throw new Error(`${JSON.stringify(a)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

/** Una mano armada en bazas: le toca al 0, reparte el 3 y el modo es tréboles. */
function mesa(manos: string[], parcial: Partial<EstadoJass> = {}): EstadoJass {
  const m = manos.map(c);
  return {
    ...nueva(),
    fase: 'bazas',
    modo: 'treboles',
    manos: m,
    manosIniciales: m,
    turno: 0,
    elige: 0,
    ...parcial,
  };
}

const legales = (e: EstadoJass) =>
  jass
    .accionesLegales(e, e.turno)
    .map((a) => (a.tipo === 'jugar' ? a.carta : a.tipo === 'elegir' ? a.modo : a.tipo));

describe('baraja y reparto', () => {
  it('36 cartas del 6 al As; en cada modo suman 152', () => {
    expect(BARAJA_JASS).toHaveLength(36);
    for (const modo of MODOS_JASS) {
      expect(BARAJA_JASS.reduce((s, x) => s + puntosCartaJass(x, modo), 0)).toBe(152);
    }
  });

  it('9 cartas a cada uno; elige el siguiente al repartidor', () => {
    for (let i = 0; i < 6; i++) {
      const e = nueva(`reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([9, 9, 9, 9]);
      expect(new Set(e.manos.flat()).size).toBe(36);
      expect(e.fase).toBe('eleccion');
      expect(e.repartidor).toBe(3);
      expect(e.turno).toBe(0);
    }
  });
});

describe('elección del modo', () => {
  it('se puede elegir cualquier modo o pasar; quien eligió sale', () => {
    const e = nueva();
    expect(legales(e)).toEqual([...MODOS_JASS, 'pasar']);
    const r = hacer(e, { tipo: 'elegir', modo: 'corazones' });
    expect(r.modo).toBe('corazones');
    expect(r.fase).toBe('bazas');
    expect(r.turno).toBe(0);
  });

  it('schieben: elige el compañero, sin poder pasar, y sale quien pasó', () => {
    let e = hacer(nueva(), { tipo: 'pasar' });
    expect(e.turno).toBe(2);
    expect(legales(e)).toEqual([...MODOS_JASS]);
    e = hacer(e, { tipo: 'elegir', modo: 'obenabe' });
    expect(e.turno).toBe(0);
    expect(e.modo).toBe('obenabe');
  });
});

describe('órdenes y puntos', () => {
  it('el Buur gana al As del triunfo y el Nell también', () => {
    expect(ganadoraJass(enMesa([0, 'Ap'], [1, 'Jp']), 'picas').asiento).toBe(1);
    expect(ganadoraJass(enMesa([0, 'Ap'], [1, '9p']), 'picas').asiento).toBe(1);
    expect(ganadoraJass(enMesa([0, '9p'], [1, 'Jp']), 'picas').asiento).toBe(1);
  });

  it('en Undenufe gana el 6; en Obenabe, el As', () => {
    expect(ganadoraJass(enMesa([0, 'Ad'], [1, '6d']), 'undenufe').asiento).toBe(1);
    expect(ganadoraJass(enMesa([0, 'Ad'], [1, '6d']), 'obenabe').asiento).toBe(0);
  });

  it('el triunfo gana a la más alta del palo; otro palo no cuenta', () => {
    expect(ganadoraJass(enMesa([0, 'Ac'], [1, '6t'], [2, 'Kc']), 'treboles').asiento).toBe(1);
    expect(ganadoraJass(enMesa([0, '6c'], [1, 'Ad']), 'obenabe').asiento).toBe(0);
  });

  it('puntos por modo', () => {
    expect(puntosCartaJass(una('Jt'), 'treboles')).toBe(20);
    expect(puntosCartaJass(una('9t'), 'treboles')).toBe(14);
    expect(puntosCartaJass(una('Jp'), 'treboles')).toBe(2);
    expect(puntosCartaJass(una('8p'), 'obenabe')).toBe(8);
    expect(puntosCartaJass(una('6p'), 'undenufe')).toBe(11);
    expect(puntosCartaJass(una('Ap'), 'undenufe')).toBe(0);
  });
});

describe('bazas', () => {
  it('se puede fallar teniendo del palo, pero no echar otro palo', () => {
    const e = mesa(['Ac', '7c Kt 8p', '6d', '6p'], { turno: 1, mesa: enMesa([0, 'Ac']) });
    expect(legales(e).sort()).toEqual(c('7c Kt').sort());
  });

  it('el Buur no es obligatorio', () => {
    const e = mesa(['At', 'Jt 7c 8p', '6d', '6p'], { turno: 1, mesa: enMesa([0, 'At']) });
    expect(legales(e)).toHaveLength(3);
  });

  it('sale triunfo: hay que echar triunfo si se tiene otro que el Buur', () => {
    const e = mesa(['At', 'Jt 6t 7c', '6d', '6p'], { turno: 1, mesa: enMesa([0, 'At']) });
    expect(legales(e).sort()).toEqual(c('Jt 6t').sort());
  });

  it('no se puede subfallar, salvo con solo triunfos', () => {
    const e = mesa(['Kc', '6t 7p', '6d', '6p'], {
      turno: 1,
      mesa: enMesa([3, '7c'], [0, 'At']),
    });
    expect(legales(e)).toEqual(c('7p'));
    const solo = mesa(['Kc', '6t 7t', '6d', '6p'], {
      turno: 1,
      mesa: enMesa([3, '7c'], [0, 'At']),
    });
    expect(legales(solo)).toHaveLength(2);
  });

  it('sin triunfo se sigue el palo; sin él, cualquier carta', () => {
    const e = mesa(['Ad', '6d 7t', 'Kp 8c', '6p'], {
      modo: 'obenabe',
      turno: 1,
      mesa: enMesa([0, 'Ad']),
    });
    expect(legales(e)).toEqual(c('6d'));
    expect(legales({ ...e, turno: 2 })).toHaveLength(2);
  });

  it('los puntos de la baza van a la pareja que la gana, multiplicados', () => {
    let e = mesa(['Ac 6d', 'Kc 6d', '10c 7d', '6c 8d'], { modo: 'corazones', weis: null });
    // Primera baza: nadie declara.
    for (const x of ['Ac', 'Kc', '10c', '6c']) e = hacer(e, x);
    // Corazones es triunfo: As 11, Rey 4, 10 10.
    expect(e.puntosMano).toEqual([50, 0]);
    expect(e.porConcepto.bazas).toEqual([50, 0]);
    expect(e.turno).toBe(0);
  });
});

describe('declaraciones', () => {
  it('escaleras y cuatro iguales con sus puntos', () => {
    expect(weisJass(c('6p 7p 8p')).map((w) => w.puntos)).toEqual([20]);
    expect(weisJass(c('6p 7p 8p 9p')).map((w) => w.puntos)).toEqual([50]);
    expect(weisJass(c('9c 10c Jc Qc Kc')).map((w) => w.puntos)).toEqual([100]);
    expect(weisJass(c('6d 7d 8d 9d 10d Jd Qd Kd Ad')).map((w) => w.puntos)).toEqual([300]);
    expect(weisJass(c('Jp Jc Jd Jt')).map((w) => w.puntos)).toEqual([200]);
    expect(weisJass(c('9p 9c 9d 9t')).map((w) => w.puntos)).toEqual([150]);
    expect(weisJass(c('Ap Ac Ad At')).map((w) => w.puntos)).toEqual([100]);
    expect(weisJass(c('6p 6c 6d 6t'))).toEqual([]);
    expect(weisJass(c('Qp Kp Ap 6d 7d'))).toHaveLength(1);
  });

  it('gana la mejor declaración y su pareja anota todas las suyas', () => {
    const manos = [c('6p 7p 8p 9p'), c('6c 7c 8c'), c('Qd Kd Ad'), c('')];
    const w = mejorWeisJass(manos, 0, 'treboles')!;
    expect(w.pareja).toBe(0);
    expect(w.puntos).toBe(70);
  });

  it('a igualdad, la carta más alta; luego, la del triunfo; luego, el más cercano a quien sale', () => {
    expect(
      mejorWeisJass([c('6p 7p 8p'), c('7c 8c 9c'), c(''), c('')], 0, 'diamantes')!.pareja,
    ).toBe(1);
    expect(
      mejorWeisJass([c('6p 7p 8p'), c('6c 7c 8c'), c(''), c('')], 0, 'corazones')!.pareja,
    ).toBe(1);
    expect(mejorWeisJass([c('6p 7p 8p'), c('6c 7c 8c'), c(''), c('')], 1, 'obenabe')!.pareja).toBe(
      1,
    );
    expect(mejorWeisJass([c('6p 7p 8p'), c('6c 7c 8c'), c(''), c('')], 0, 'obenabe')!.pareja).toBe(
      0,
    );
  });

  it('se anotan al acabar la primera baza, multiplicadas, y se enseñan', () => {
    let e = mesa(['6p 7p 8p 9p', 'Jp Jc Jd Jt', '6d', '6c'], { modo: 'picas' });
    for (const x of ['6p', 'Jp', '6d', '6c']) e = hacer(e, x);
    // Cuatro Jotas (200) del 1 ganan a la escalera de 4 (50): picas ×2.
    expect(e.weis?.pareja).toBe(1);
    expect(e.porConcepto.weis).toEqual([0, 400]);
    expect(jass.vistaDe(e, 0).weis?.declaraciones[0]!.weis.cartas).toHaveLength(4);
  });

  it('cuatro Jotas anotan 200', () => {
    const w = mejorWeisJass([c('Jp Jc Jd Jt'), c(''), c(''), c('')], 0, 'diamantes')!;
    expect(w).toMatchObject({ pareja: 0, puntos: 200 });
  });
});

describe('Stöck', () => {
  it('el Rey y la Dama del triunfo suman 20 al jugar la segunda, multiplicados', () => {
    let e = mesa(['Kc Qc', '6c 7d', '8c 8d', '9d 6d'], { modo: 'corazones' });
    for (const x of ['Kc', '6c', '8c', '9d']) e = hacer(e, x);
    expect(e.stock).toBeNull();
    e = hacer(e, 'Qc');
    expect(e.stock).toBe(0);
    expect(e.porConcepto.stock).toEqual([40, 0]);
  });

  it('cuenta aunque la otra pareja gane las declaraciones', () => {
    let e = mesa(['Kd Qd', '6p 7p 8p', '6c 7c', '9c 8c'], { modo: 'diamantes' });
    for (const x of ['Kd', '6p', '6c', '9c']) e = hacer(e, x);
    expect(e.weis?.pareja).toBe(1);
    e = hacer(e, 'Qd');
    expect(e.stock).toBe(0);
    expect(e.porConcepto.stock).toEqual([20, 0]);
  });
});

describe('puntos de la mano y partida', () => {
  /** Juega la mano hasta el final con la primera carta legal. */
  function acabarMano(e: EstadoJass): EstadoJass {
    const inicio = e.resultadosManos.length;
    while (e.resultadosManos.length === inicio) {
      e = hacer(e, jass.accionesLegales(e, e.turno)[0]!);
    }
    return e;
  }

  it('cada mano reparte 157 por el multiplicador, más declaraciones y Stöck', () => {
    for (const modo of MODOS_JASS) {
      for (let i = 0; i < 4; i++) {
        let e = hacer(nueva(`mano-${modo}-${i}`), { tipo: 'elegir', modo });
        e = acabarMano(e);
        const r = e.resultadosManos.at(-1)!;
        const bazas = r.bazas[0] + r.bazas[1];
        const esperado =
          (r.match !== null ? 257 : 157) *
          (modo === 'obenabe' || modo === 'undenufe'
            ? 3
            : modo === 'corazones' || modo === 'picas'
              ? 2
              : 1);
        expect(bazas).toBe(esperado);
        expect(r.total[0] + r.total[1]).toBe(
          bazas + r.weis[0] + r.weis[1] + r.stock[0] + r.stock[1],
        );
        expect(r.completa).toBe(true);
        expect(e.repartidor).toBe(0);
        expect(e.fase).toBe('eleccion');
      }
    }
  });

  it('Match: las 9 bazas valen 257', () => {
    // El 0 tiene los nueve triunfos y sale con todos.
    const triunfos = 'Jp 9p Ap Kp Qp 10p 8p 7p 6p';
    // Con la meta alta: las escaleras de 9 de la mano llegarían a 1.000.
    let e = mesa(
      [
        triunfos,
        '6c 7c 8c 9c 10c Jc Qc Kc Ac',
        '6d 7d 8d 9d 10d Jd Qd Kd Ad',
        '6t 7t 8t 9t 10t Jt Qt Kt At',
      ],
      {
        modo: 'picas',
        config: { jugadores: 4, meta: 5000 },
      },
    );
    e = acabarMano(e);
    const r = e.resultadosManos.at(-1)!;
    expect(r.match).toBe(0);
    expect(r.bazas).toEqual([514, 0]);
  });

  it('la partida termina en cuanto una pareja llega, en mitad de la mano', () => {
    let e = mesa(['Ac 6d', 'Kc 7d', '10c 8d', '6c 9d'], { modo: 'diamantes', puntos: [980, 500] });
    for (const x of ['Ac', 'Kc', '10c', '6c']) e = hacer(e, x);
    expect(e.puntos).toEqual([1005, 500]);
    expect(jass.resultado(e)).toEqual({
      ganadores: [0, 2],
      empate: false,
      puntos: [1005, 500, 1005, 500],
    });
    expect(e.resultadosManos.at(-1)).toMatchObject({ completa: false });
    expect(jass.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('las declaraciones se anotan antes que la baza', () => {
    // La pareja 1 llega con las declaraciones aunque la 0 gane la primera baza.
    let e = mesa(['Ac 6d', 'Jp Jc Jd Jt', '10c 8d', '6c 9d'], {
      modo: 'obenabe',
      puntos: [990, 500],
    });
    e = hacer(e, 'Ac');
    e = hacer(e, jass.accionesLegales(e, e.turno)[0]!);
    e = hacer(e, '10c');
    e = hacer(e, '6c');
    expect(jass.resultado(e)?.ganadores).toEqual([1, 3]);
  });
});

describe('vista', () => {
  it('cada uno ve su mano y sus declaraciones, y cuántas tienen los demás', () => {
    const e = nueva();
    const v = jass.vistaDe(e, 0);
    expect(v.miMano).toHaveLength(9);
    expect(v.cartasEnMano).toEqual([9, 9, 9, 9]);
    expect(v.misWeis).toEqual(weisJass(e.manos[0]!));
    expect(JSON.stringify(v)).not.toContain('"manos');
  });
});

describirContrato(jass, {
  configs: [CONFIG_JASS_POR_DEFECTO, { jugadores: 4, meta: 300 }],
  // Las cartas de la última baza ya se vieron, y las declaraciones ganadoras se enseñan.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set([
      ...(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []),
      ...(e.weis?.declaraciones.flatMap((d) => d.weis.cartas) ?? []),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 1500,
});
