import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  BARAJA_DURAK,
  CONFIG_DURAK_POR_DEFECTO,
  durak,
  rangoDurak,
  type AccionDurak,
  type ConfigDurak,
  type EstadoDurak,
} from '../../src/juegos/durak';
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

function nueva(config: Partial<ConfigDurak> = {}, semilla = 'durak'): EstadoDurak {
  const r = durak.crear({ ...CONFIG_DURAK_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Una mesa a medida: triunfo picas, mazo vacío salvo que se diga, ataca el 0. */
function mesa(manos: string[], parcial: Partial<EstadoDurak> = {}): EstadoDurak {
  const n = manos.length as ConfigDurak['jugadores'];
  return {
    config: { jugadores: n },
    azar: crearAzar('mesa'),
    manos: manos.map(c),
    mazo: [],
    triunfo: 'picas',
    cartaTriunfo: 'picas-6',
    mesa: [],
    descarte: [],
    atacante: 0,
    defensor: 1,
    turno: 0,
    pasaron: [],
    conocidas: manos.map(() => []),
    salidos: [],
    ultimaAccion: null,
    ...parcial,
  };
}

function jugar(e: EstadoDurak, accion: AccionDurak): EstadoDurak {
  const r = aplicar(durak, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const atacar = (t: string): AccionDurak => ({ tipo: 'atacar', carta: c(t)[0]! });
const defender = (t: string): AccionDurak => ({ tipo: 'defender', carta: c(t)[0]! });
const legales = (e: EstadoDurak) => durak.accionesLegales(e, e.turno);

describe('baraja y reparto', () => {
  it('36 cartas del 6 al As', () => {
    expect(BARAJA_DURAK).toHaveLength(36);
    expect(Math.min(...BARAJA_DURAK.map(rangoDurak))).toBe(6);
    expect(Math.max(...BARAJA_DURAK.map(rangoDurak))).toBe(14);
  });

  it('2 jugadores: 6 cartas cada uno, 24 en el mazo y la última marca el triunfo', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([6, 6]);
    expect(e.mazo).toHaveLength(24);
    expect(e.mazo.at(-1)).toBe(e.cartaTriunfo);
    expect(e.cartaTriunfo.startsWith(e.triunfo)).toBe(true);
  });

  it('con 6 no queda mazo y se sabe quién tiene la carta del triunfo', () => {
    const e = nueva({ jugadores: 6 });
    expect(e.mazo).toHaveLength(0);
    const quien = e.manos.findIndex((m) => m.includes(e.cartaTriunfo));
    expect(e.conocidas[quien]).toEqual([e.cartaTriunfo]);
  });

  it('empieza quien tiene el triunfo más bajo y defiende el de su izquierda', () => {
    for (let i = 0; i < 20; i++) {
      const e = nueva({ jugadores: 4 }, `primero-${i}`);
      const triunfos = e.manos.map((m) =>
        Math.min(...m.filter((x) => x.startsWith(e.triunfo)).map(rangoDurak)),
      );
      const menor = Math.min(...triunfos);
      if (menor === Infinity) expect(e.atacante).toBe(0);
      else expect(e.atacante).toBe(triunfos.indexOf(menor));
      expect(e.defensor).toBe((e.atacante + 1) % 4);
      expect(e.turno).toBe(e.atacante);
    }
  });

  it('valida la configuración', () => {
    expect(durak.crear({ jugadores: 7 as 6 }, 's').ok).toBe(false);
    expect(durak.crear({ jugadores: 1 as 2 }, 's').ok).toBe(false);
  });
});

describe('ataque y defensa', () => {
  it('el primer ataque puede ser cualquier carta, y no se puede pasar', () => {
    const e = mesa(['9c 6p', 'Qc 6t']);
    expect(legales(e)).toEqual([atacar('9c'), atacar('6p')]);
  });

  it('se gana con una más alta del mismo palo o con un triunfo', () => {
    const e = jugar(mesa(['9c 7d', 'Qc 8c 6p 10d']), atacar('9c'));
    expect(e.turno).toBe(1);
    expect(legales(e)).toEqual([defender('Qc'), defender('6p'), { tipo: 'tomar' }]);
  });

  it('un triunfo solo se gana con un triunfo más alto', () => {
    const e = jugar(mesa(['8p 7d', 'Ac 7p 9p']), atacar('8p'));
    expect(legales(e)).toEqual([defender('9p'), { tipo: 'tomar' }]);
  });

  it('llevarse las cartas: a la mano del defensor, conocidas, y ataca el siguiente', () => {
    let e = mesa(['9c 7d 8t', 'Qc 6t', '10t Jt'], { defensor: 1 });
    e = jugar(e, atacar('9c'));
    e = jugar(e, { tipo: 'tomar' });
    expect(e.manos[1]).toEqual(c('Qc 6t 9c'));
    expect(e.conocidas[1]).toEqual(c('9c'));
    expect(e.mesa).toEqual([]);
    expect(e.atacante).toBe(2);
    expect(e.defensor).toBe(0);
  });
});

describe('echar cartas', () => {
  it('solo números que ya están en la mesa, empezando por el atacante', () => {
    let e = mesa(['8t 10d Jd 6c', 'Kt 9c 7c 7d', '10c Jc Qc Kc']);
    e = jugar(e, atacar('8t'));
    e = jugar(e, defender('Kt'));
    // El 0 no tiene ni 8 ni K: se le salta. El 2 tiene el K de corazones.
    expect(e.turno).toBe(2);
    expect(legales(e)).toEqual([atacar('Kc'), { tipo: 'pasar' }]);
  });

  it('el atacante tiene prioridad tras cada carta ganada', () => {
    let e = mesa(['8t 10d Kd', 'Jt Qc 7c 7d', '10c Jc Qd Kc']);
    e = jugar(e, atacar('8t'));
    e = jugar(e, defender('Jt'));
    expect(e.turno).toBe(2);
    e = jugar(e, atacar('Jc'));
    e = jugar(e, defender('Qc'));
    // El 0 no tiene ni 8, ni J ni Q: vuelve a echar el 2, que tiene el Q de diamantes.
    expect(e.turno).toBe(2);
    e = jugar(e, { tipo: 'pasar' });
    // Nadie más echa: la ronda termina defendida.
    expect(e.descarte).toEqual(c('8t Jt Jc Qc'));
    expect(e.atacante).toBe(1);
  });

  it('echar del mismo número', () => {
    let e = mesa(['8t Ac', '10t 9d', '10d Jd']);
    e = jugar(e, atacar('8t'));
    e = jugar(e, defender('10t'));
    expect(legales(e)).toEqual([atacar('10d'), { tipo: 'pasar' }]);
  });

  it('como mucho 6 ataques en una ronda', () => {
    const e = mesa(['6c 6d', 'Kp Ap Qp Jp 10p 9p 8p'], {
      mesa: c('6t 7t 8t 9t 10t Jt').map((ataque, i) => ({
        ataque,
        defensa: c('7c 8c 9c 10c Jc Qc')[i]!,
      })),
      turno: 0,
    });
    expect(durak.accionesLegales({ ...e, mesa: e.mesa.slice(0, 5) }, 0)).toContainEqual(
      atacar('6c'),
    );
    expect(durak.accionesLegales(e, 0)).toEqual([{ tipo: 'pasar' }]);
  });
});

describe('fin de la ronda y robar', () => {
  it('defensa con éxito: al descarte, todos roban hasta 6 y el defensor pasa a atacar', () => {
    const mazo = BARAJA_DURAK.slice(0, 12);
    let e = mesa(['9c 7d 8t 6d 6t Jd', 'Qc 6c Ad Ac Kc Kd'], {
      mazo,
      cartaTriunfo: mazo.at(-1)!,
    });
    e = jugar(e, atacar('9c'));
    e = jugar(e, defender('Qc'));
    expect(e.descarte).toEqual(c('9c Qc'));
    expect(e.manos.map((m) => m.length)).toEqual([6, 6]);
    // Roba primero el atacante.
    expect(e.manos[0]).toContain(mazo[0]);
    expect(e.manos[1]).toContain(mazo[1]);
    expect(e.mazo).toHaveLength(10);
    expect(e.atacante).toBe(1);
    expect(e.turno).toBe(1);
  });
});

describe('salir y fin de la partida', () => {
  it('el durak', () => {
    let e = mesa(['9c', 'Qc 7d 8d 9d']);
    e = jugar(e, atacar('9c'));
    expect(durak.resultado(e)).toBeNull();
    // El 1 gana el último ataque: el 0 se ha quedado sin cartas y sale.
    e = jugar(e, defender('Qc'));
    expect(e.salidos).toEqual([0]);
    expect(durak.resultado(e)).toEqual({ ganadores: [0], empate: false });
    expect(durak.vistaDe(e, 0).durak).toBe(1);
  });

  it('empate si los últimos se quedan sin cartas a la vez', () => {
    let e = mesa(['9c', 'Qc']);
    e = jugar(e, atacar('9c'));
    e = jugar(e, defender('Qc'));
    expect(durak.resultado(e)).toEqual({ ganadores: [], empate: true });
  });

  it('a quien ha salido se le salta', () => {
    let e = mesa(['9c', 'Qc 7d', '8d 10d Jd']);
    e = jugar(e, atacar('9c'));
    e = jugar(e, defender('Qc'));
    // Nadie tiene 9 ni Q: ronda defendida; sale el 0 y ataca el 1 al 2.
    expect(e.salidos).toEqual([0]);
    expect(e.atacante).toBe(1);
    expect(e.defensor).toBe(2);
  });
});

describe('vista', () => {
  it('no contiene las manos ajenas ni el mazo, salvo la carta del triunfo', () => {
    const e = nueva();
    const texto = JSON.stringify(durak.vistaDe(e, 0));
    for (const carta of [...e.manos[1]!, ...e.mazo]) {
      if (carta !== e.cartaTriunfo) expect(texto).not.toContain(`"${carta}"`);
    }
  });
});

describirContrato(durak, {
  configs: [CONFIG_DURAK_POR_DEFECTO, { jugadores: 3 }, { jugadores: 4 }, { jugadores: 6 }],
  cartasOcultas: (e, asiento) => {
    const conocidas = new Set([...e.conocidas.flat(), e.cartaTriunfo]);
    return [...e.mazo, ...e.manos.flatMap((m, a) => (a === asiento ? [] : m))].filter(
      (x) => !conocidas.has(x),
    );
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
