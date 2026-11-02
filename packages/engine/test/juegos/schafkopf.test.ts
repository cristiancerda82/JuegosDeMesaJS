import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_SCHAFKOPF,
  CONFIG_SCHAFKOPF_POR_DEFECTO,
  ganadoraSchafkopf,
  laufendeSchafkopf,
  puntosCartaSchafkopf,
  puntuarManoSchafkopf,
  schafkopf,
  type AccionSchafkopf,
  type ContratoSchafkopf,
  type EstadoSchafkopf,
} from '../../src/juegos/schafkopf';
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

const RUF_PICAS: ContratoSchafkopf = { tipo: 'rufspiel', palo: 'picas' };
const WENZ: ContratoSchafkopf = { tipo: 'wenz' };

function nueva(semilla = 'schafkopf'): EstadoSchafkopf {
  const r = schafkopf.crear(CONFIG_SCHAFKOPF_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoSchafkopf, accion: AccionSchafkopf): EstadoSchafkopf {
  const r = aplicar(schafkopf, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}
const jugar = (e: EstadoSchafkopf, t: string) => hacer(e, { tipo: 'jugar', carta: una(t) });
const legales = (e: EstadoSchafkopf) =>
  schafkopf
    .accionesLegales(e, e.turno)
    .flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []))
    .sort();

/** Una mano en las bazas: le toca al 0, juega el 1 un Rufspiel con el As de picas. */
function bazas(
  manos: string[],
  parcial: Partial<EstadoSchafkopf> = {},
  contrato: ContratoSchafkopf = RUF_PICAS,
): EstadoSchafkopf {
  return {
    ...nueva(),
    manos: manos.map(c),
    fase: 'bazas',
    contrato,
    jugador: 1,
    companero: null,
    turno: 0,
    mesa: [],
    ...parcial,
  };
}

describe('baraja y reparto', () => {
  it('32 cartas que suman 120', () => {
    expect(BARAJA_SCHAFKOPF).toHaveLength(32);
    expect(BARAJA_SCHAFKOPF.reduce((s, x) => s + puntosCartaSchafkopf(x), 0)).toBe(120);
  });

  it('8 cartas a cada uno; anuncia primero el siguiente al repartidor', () => {
    for (let i = 0; i < 6; i++) {
      const e = nueva(`reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([8, 8, 8, 8]);
      expect(new Set(e.manos.flat()).size).toBe(32);
      expect(e.fase).toBe('anuncio');
      expect(e.repartidor).toBe(3);
      expect(e.turno).toBe(0);
    }
  });
});

describe('elección del contrato', () => {
  function anuncio(manos: string[]): EstadoSchafkopf {
    return { ...nueva(), manos: manos.map(c) };
  }
  const SIN_NADA = '7t 8t 9t 7p 8p 9p 7d 8d';

  it('tras un Solo solo se puede pasar, y juega el del Solo', () => {
    let e = anuncio([SIN_NADA, SIN_NADA, SIN_NADA, SIN_NADA]);
    e = hacer(e, { tipo: 'anunciar', contrato: RUF_PICAS });
    e = hacer(e, { tipo: 'anunciar', contrato: { tipo: 'solo', palo: 'treboles' } });
    expect(schafkopf.accionesLegales(e, 2)).toEqual([{ tipo: 'pasar' }]);
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pasar' });
    expect(e.fase).toBe('bazas');
    expect(e.jugador).toBe(1);
    expect(e.contrato).toEqual({ tipo: 'solo', palo: 'treboles' });
    expect(e.turno).toBe(0);
  });

  it('no se llama un As propio ni el de un palo del que no se tienen cartas', () => {
    const e = anuncio(['Ap 7t Qp Jp 7c 8c 9c 7d', '', '', '']);
    const rufs = schafkopf
      .accionesLegales(e, 0)
      .flatMap((a) =>
        a.tipo === 'anunciar' && a.contrato.tipo === 'rufspiel' ? [a.contrato.palo] : [],
      );
    // El As de picas es suyo y de picas solo tiene la dama y la jota, que son triunfo.
    expect(rufs).toEqual(['treboles', 'diamantes']);
  });

  it('si los cuatro pasan, la mano termina sin fichas', () => {
    let e = nueva();
    for (let i = 0; i < 4; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.resultadosManos[0]!.contrato).toBeNull();
    expect(e.fichas).toEqual([0, 0, 0, 0]);
    expect(e.repartidor).toBe(0);
    expect(e.fase).toBe('anuncio');
    expect(e.turno).toBe(1);
  });

  it('en el Rufspiel el compañero es el dueño del As llamado', () => {
    let e = anuncio([SIN_NADA, SIN_NADA, 'Ap 7c', SIN_NADA]);
    e = hacer(e, { tipo: 'anunciar', contrato: RUF_PICAS });
    for (let i = 0; i < 3; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.companero).toBe(2);
  });
});

describe('triunfos y bazas', () => {
  it('la dama de diamantes gana al As de corazones en el Rufspiel', () => {
    expect(ganadoraSchafkopf(enMesa([0, 'Ac'], [1, 'Qd']), RUF_PICAS).asiento).toBe(1);
  });

  it('el orden de los triunfos: damas, jotas y corazones', () => {
    const g = (a: string, b: string) =>
      ganadoraSchafkopf(enMesa([0, a], [1, b]), RUF_PICAS).asiento;
    expect(g('Qp', 'Qt')).toBe(1);
    expect(g('Jt', 'Qd')).toBe(1);
    expect(g('Ac', 'Jd')).toBe(1);
    expect(g('Kc', '10c')).toBe(1);
  });

  it('en el Wenz la dama no es triunfo: el rey de picas le gana', () => {
    expect(ganadoraSchafkopf(enMesa([0, 'Kp'], [1, 'Qp']), WENZ).asiento).toBe(0);
    expect(ganadoraSchafkopf(enMesa([0, 'Qp'], [1, '9p']), WENZ).asiento).toBe(0);
    expect(ganadoraSchafkopf(enMesa([0, 'Ap'], [1, 'Jd']), WENZ).asiento).toBe(1);
  });

  it('en el Solo el palo elegido es triunfo', () => {
    const solo: ContratoSchafkopf = { tipo: 'solo', palo: 'diamantes' };
    expect(ganadoraSchafkopf(enMesa([0, 'Ac'], [1, '7d']), solo).asiento).toBe(1);
  });

  it('si sale triunfo hay que echar triunfo', () => {
    const e = bazas(['', '', '7c At', ''], { turno: 2, mesa: enMesa([0, 'Jp'], [1, '8t']) });
    expect(legales(e)).toEqual(c('7c'));
  });

  it('la dama no sigue su palo: sin otro trébol se puede echar cualquiera', () => {
    const e = bazas(['', '', 'Qt 7d', ''], { turno: 2, mesa: enMesa([0, 'At'], [1, '8t']) });
    expect(legales(e)).toEqual(c('Qt 7d').sort());
  });

  it('el As llamado sale cuando sale su palo', () => {
    const e = bazas(['', '', 'Ap 7p 8d', ''], { turno: 2, mesa: enMesa([0, '9p'], [1, 'Kp']) });
    expect(legales(e)).toEqual(c('Ap'));
  });

  it('el As llamado no se descarta en otro palo, salvo en la última', () => {
    const e = bazas(['', '', 'Ap 7t', ''], { turno: 2, mesa: enMesa([0, '9d'], [1, 'Kd']) });
    expect(legales(e)).toEqual(c('7t'));
    const ultima = bazas(['', '', 'Ap', ''], { turno: 2, mesa: enMesa([0, '9d'], [1, 'Kd']) });
    expect(legales(ultima)).toEqual(c('Ap'));
  });

  it('quien tiene el As llamado, si sale con su palo, sale con el As', () => {
    const e = bazas(['Ap 7p 8d', '', '', '']);
    expect(legales(e)).toEqual(c('Ap 8d').sort());
  });

  it('al echar el As llamado todos ven al compañero', () => {
    let e = bazas(['Ap 7d', '7t', '8t', '9t'], { companero: 0 });
    expect(schafkopf.vistaDe(e, 1).companero).toBeNull();
    expect(schafkopf.vistaDe(e, 0).companero).toBe(0);
    e = jugar(e, 'Ap');
    expect(schafkopf.vistaDe(e, 1).companero).toBe(0);
  });
});

describe('puntos y fichas', () => {
  const ninguna = [0, 0, 0, 0];

  it('Rufspiel ganado con 65: el lado cobra 10 cada uno', () => {
    const r = puntuarManoSchafkopf(RUF_PICAS, 1, 2, [20, 40, 25, 35], [1, 3, 2, 2], 0, ninguna);
    expect(r.puntosJugador).toBe(65);
    expect(r.ganaJugador).toBe(true);
    expect(r.fichasMano).toEqual([-10, 10, 10, -10]);
  });

  it('con 60 pierde el lado del que juega', () => {
    const r = puntuarManoSchafkopf(RUF_PICAS, 1, 2, [30, 30, 30, 30], [2, 2, 2, 2], 0, ninguna);
    expect(r.ganaJugador).toBe(false);
    expect(r.fichasMano).toEqual([10, -10, -10, 10]);
  });

  it('Solo con 95: Schneider, tarifa 60 y cobra 180', () => {
    const solo: ContratoSchafkopf = { tipo: 'solo', palo: 'treboles' };
    const r = puntuarManoSchafkopf(solo, 0, null, [95, 10, 15, 0], [6, 1, 1, 0], 0, ninguna);
    expect(r.schneider).toBe(true);
    expect(r.schwarz).toBe(false);
    expect(r.tarifa).toBe(60);
    expect(r.fichasMano).toEqual([180, -60, -60, -60]);
    expect(r.fichasMano.reduce((a, b) => a + b)).toBe(0);
  });

  it('Schwarz si el que pierde no gana ninguna baza', () => {
    const r = puntuarManoSchafkopf(WENZ, 3, null, [0, 0, 0, 120], [0, 0, 0, 8], 0, ninguna);
    expect(r.tarifa).toBe(70);
    expect(r.fichasMano).toEqual([-70, -70, -70, 210]);
  });

  it('Laufende: tres damas seguidas del lado del que juega', () => {
    const duenos: Record<string, number> = {
      'treboles-12': 1,
      'picas-12': 2,
      'corazones-12': 1,
      'diamantes-12': 0,
    };
    const dueno = (x: IdCarta) => duenos[x] ?? 3;
    expect(laufendeSchafkopf(RUF_PICAS, dueno, [1, 2])).toBe(3);
    const r = puntuarManoSchafkopf(RUF_PICAS, 1, 2, [20, 40, 25, 35], [1, 3, 2, 2], 3, ninguna);
    expect(r.tarifa).toBe(40);
  });

  it('Laufende de los rivales también cuentan; en el Wenz, desde 2', () => {
    const jotas = (x: IdCarta) => (x === 'treboles-11' || x === 'picas-11' ? 0 : 3);
    expect(laufendeSchafkopf(WENZ, jotas, [3])).toBe(2);
    const damas = (x: IdCarta) => (['treboles-12', 'picas-12', 'corazones-12'].includes(x) ? 0 : 3);
    expect(laufendeSchafkopf(RUF_PICAS, damas, [3])).toBe(3);
    const dos = (x: IdCarta) => (['treboles-12', 'picas-12'].includes(x) ? 0 : 3);
    expect(laufendeSchafkopf(RUF_PICAS, dos, [3])).toBe(0);
  });

  it('una mano jugada entera reparte fichas que suman 0', () => {
    let e = nueva('entera');
    let pasos = 0;
    while (e.resultadosManos.length === 0 && pasos++ < 200) {
      const acciones = schafkopf.accionesLegales(e, e.turno);
      const anuncia = acciones.find((a) => a.tipo === 'anunciar');
      e = hacer(e, e.fase === 'anuncio' && e.turno === 0 && anuncia ? anuncia : acciones[0]!);
    }
    const r = e.resultadosManos[0]!;
    expect(r.contrato).not.toBeNull();
    expect(r.fichasMano.reduce((a, b) => a + b)).toBe(0);
    expect(e.fichas).toEqual(r.fichasTras);
  });
});

describe('partida', () => {
  it('termina tras las manos de la config, contando las que nadie juega', () => {
    const r = schafkopf.crear({ jugadores: 4, manos: 2 }, 'corta');
    if (!r.ok) throw new Error(r.error);
    let e = r.valor;
    for (let i = 0; i < 8; i++) e = hacer(e, { tipo: 'pasar' });
    expect(e.resultadosManos).toHaveLength(2);
    expect(schafkopf.resultado(e)).toEqual({ ganadores: [], empate: true, puntos: [0, 0, 0, 0] });
    expect(schafkopf.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('gana quien más fichas tiene', () => {
    const e: EstadoSchafkopf = {
      ...nueva(),
      config: { jugadores: 4, manos: 1 },
      fichas: [30, -10, -10, -10],
      resultadosManos: [
        {
          contrato: null,
          jugador: null,
          companero: null,
          puntosJugador: 0,
          ganaJugador: false,
          schneider: false,
          schwarz: false,
          laufende: 0,
          tarifa: 0,
          fichasMano: [0, 0, 0, 0],
          fichasTras: [30, -10, -10, -10],
        },
      ],
    };
    expect(schafkopf.resultado(e)).toEqual({
      ganadores: [0],
      empate: false,
      puntos: [30, -10, -10, -10],
    });
  });
});

describe('vista', () => {
  it('cada uno ve su mano y cuántas tienen los demás', () => {
    const e = nueva();
    const v = schafkopf.vistaDe(e, 0);
    expect(v.miMano).toHaveLength(8);
    expect(v.cartasEnMano).toEqual([8, 8, 8, 8]);
    expect(JSON.stringify(v)).not.toContain('"manos":[');
    for (const x of e.manos[1]!) expect(JSON.stringify(v)).not.toContain(`"${x}"`);
  });

  it('el compañero no se ve hasta que se echa el As, salvo el propio', () => {
    const e = bazas(['7d', '7t', 'Ap', '9t'], { companero: 2 });
    expect(schafkopf.vistaDe(e, 0).companero).toBeNull();
    expect(schafkopf.vistaDe(e, 1).companero).toBeNull();
    expect(schafkopf.vistaDe(e, 2).companero).toBe(2);
  });
});

describirContrato(schafkopf, {
  configs: [CONFIG_SCHAFKOPF_POR_DEFECTO],
  // Las cartas de la última baza ya se vieron, aunque tras barajar estén en otra mano.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set(e.ultimaBaza?.cartas.map((j) => j.carta) ?? []);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 800,
});
