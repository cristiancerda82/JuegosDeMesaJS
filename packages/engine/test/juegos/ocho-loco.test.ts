import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  CONFIG_OCHO_LOCO_POR_DEFECTO,
  esOcho,
  ochoLoco,
  puntosManoOchoLoco,
  type AccionOchoLoco,
  type EstadoOchoLoco,
} from '../../src/juegos/ocho-loco';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

function nueva(jugadores: 2 | 3 | 4 | 5 = 4, semilla = 'ocho-loco'): EstadoOchoLoco {
  const r = ochoLoco.crear({ jugadores }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoOchoLoco, accion: AccionOchoLoco): EstadoOchoLoco {
  const r = aplicar(ochoLoco, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoOchoLoco) => ochoLoco.accionesLegales(e, e.turno);

/** Un estado armado a mano: estas manos, este descarte, turno del asiento 0. */
function con(
  manos: IdCarta[][],
  descarte: IdCarta[],
  parcial: Partial<EstadoOchoLoco> = {},
): EstadoOchoLoco {
  const usadas = new Set([...manos.flat(), ...descarte]);
  const base = nueva(manos.length as 2 | 3 | 4 | 5);
  const todas = [...base.mazo, ...base.descarte, ...base.manos.flat()];
  return {
    ...base,
    azar: crearAzar('mesa'),
    manos,
    descarte,
    mazo: todas.filter((c) => !usadas.has(c)),
    palo: descarte.at(-1)!.split('-')[0] as EstadoOchoLoco['palo'],
    turno: 0,
    ultimas: manos.map(() => null),
    ...parcial,
  };
}

describe('reparto del Ocho loco', () => {
  it('con 2 jugadores, 7 cartas cada uno y 37 en el mazo', () => {
    const e = nueva(2);
    expect(e.manos.map((m) => m.length)).toEqual([7, 7]);
    expect(e.descarte).toHaveLength(1);
    expect(e.mazo).toHaveLength(37);
  });

  it('con 4 jugadores, 5 cartas cada uno, 31 en el mazo y el descarte no empieza con un 8', () => {
    for (let i = 0; i < 40; i++) {
      const e = nueva(4, `reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
      expect(e.mazo).toHaveLength(31);
      expect(esOcho(e.descarte[0]!)).toBe(false);
      expect(e.palo).toBe(e.descarte[0]!.split('-')[0]);
      expect(new Set([...e.mazo, ...e.descarte, ...e.manos.flat()]).size).toBe(52);
    }
  });

  it('empieza el de la izquierda del que reparte, y el reparto rota', () => {
    const e = nueva(4);
    expect(e.repartidor).toBe(3);
    expect(e.turno).toBe(0);
  });

  it('valida la configuración', () => {
    expect(ochoLoco.crear({ jugadores: 6 as 5 }, 'x').ok).toBe(false);
    expect(ochoLoco.crear({ jugadores: 1 as 2 }, 'x').ok).toBe(false);
    expect(CONFIG_OCHO_LOCO_POR_DEFECTO.jugadores).toBe(4);
  });
});

describe('jugar una carta', () => {
  const manos: IdCarta[][] = [
    ['corazones-3', 'picas-9', 'picas-5', 'treboles-8', 'diamantes-2'],
    ['diamantes-4', 'diamantes-5', 'treboles-1'],
  ];

  it('por palo o por número; el 8 siempre, con un palo a elegir', () => {
    const e = con(manos, ['corazones-9']);
    expect(legales(e)).toEqual([
      { tipo: 'jugar', carta: 'corazones-3' },
      { tipo: 'jugar', carta: 'picas-9' },
      { tipo: 'jugar', carta: 'treboles-8', palo: 'picas' },
      { tipo: 'jugar', carta: 'treboles-8', palo: 'corazones' },
      { tipo: 'jugar', carta: 'treboles-8', palo: 'diamantes' },
      { tipo: 'jugar', carta: 'treboles-8', palo: 'treboles' },
    ]);
    expect(aplicar(ochoLoco, e, 0, { tipo: 'jugar', carta: 'picas-5' }).ok).toBe(false);
  });

  it('por palo: la carta queda arriba y juega el siguiente', () => {
    const f = hacer(con(manos, ['corazones-9']), { tipo: 'jugar', carta: 'corazones-3' });
    expect(f.descarte.at(-1)).toBe('corazones-3');
    expect(f.palo).toBe('corazones');
    expect(f.turno).toBe(1);
  });

  it('por número: cambia al palo de la carta', () => {
    const f = hacer(con(manos, ['corazones-9']), { tipo: 'jugar', carta: 'picas-9' });
    expect(f.palo).toBe('picas');
  });

  it('el 8 elige palo y el siguiente tiene que seguirlo', () => {
    const f = hacer(con(manos, ['corazones-9']), {
      tipo: 'jugar',
      carta: 'treboles-8',
      palo: 'diamantes',
    });
    expect(f.palo).toBe('diamantes');
    expect(f.ultimas[0]).toEqual({
      tipo: 'jugar',
      carta: 'treboles-8',
      palo: 'diamantes',
      robo: false,
    });
    expect(legales(f)).toEqual([
      { tipo: 'jugar', carta: 'diamantes-4' },
      { tipo: 'jugar', carta: 'diamantes-5' },
    ]);
  });
});

describe('robar y pasar', () => {
  it('sin jugables se roba; con jugables no', () => {
    const sin = con([['picas-2', 'picas-3'], ['diamantes-4']], ['corazones-9']);
    expect(legales(sin)).toEqual([{ tipo: 'robar' }]);
    const conJugable = con([['corazones-2'], ['diamantes-4']], ['corazones-9']);
    expect(legales(conJugable).map((a) => a.tipo)).not.toContain('robar');
  });

  it('la robada que casa se puede jugar o pasar; ninguna otra', () => {
    let e = con([['picas-2', 'picas-3'], ['diamantes-4']], ['corazones-9']);
    e = { ...e, mazo: [...e.mazo.filter((c) => c !== 'corazones-6'), 'corazones-6'] };
    const f = hacer(e, { tipo: 'robar' });
    expect(f.robada).toBe('corazones-6');
    expect(f.turno).toBe(0);
    expect(legales(f)).toEqual([{ tipo: 'jugar', carta: 'corazones-6' }, { tipo: 'pasar' }]);
    const g = hacer(f, { tipo: 'jugar', carta: 'corazones-6' });
    expect(g.ultimas[0]).toEqual({ tipo: 'jugar', carta: 'corazones-6', palo: null, robo: true });
  });

  it('la robada que no casa: solo pasar, y se queda en la mano', () => {
    let e = con([['picas-2', 'picas-3'], ['diamantes-4']], ['corazones-9']);
    e = { ...e, mazo: [...e.mazo.filter((c) => c !== 'treboles-6'), 'treboles-6'] };
    const f = hacer(e, { tipo: 'robar' });
    expect(legales(f)).toEqual([{ tipo: 'pasar' }]);
    const g = hacer(f, { tipo: 'pasar' });
    expect(g.manos[0]).toEqual(['picas-2', 'picas-3', 'treboles-6']);
    expect(g.turno).toBe(1);
    expect(g.pasesSeguidos).toBe(0);
    expect(ochoLoco.vistaDe(f, 1).robada).toBeNull();
    expect(ochoLoco.vistaDe(f, 1).robe).toBe(true);
    expect(ochoLoco.vistaDe(f, 0).robada).toBe('treboles-6');
  });

  it('con el mazo vacío se rehace con el descarte menos la de arriba', () => {
    const descarte: IdCarta[] = [
      'corazones-1',
      'corazones-2',
      'corazones-3',
      'corazones-4',
      'corazones-5',
      'corazones-6',
      'corazones-7',
      'corazones-10',
      'corazones-11',
      'corazones-9',
    ];
    const e = con([['picas-2'], ['diamantes-4']], descarte, { mazo: [] });
    const f = hacer(e, { tipo: 'robar' });
    expect(f.descarte).toEqual(['corazones-9']);
    expect(f.mazo).toHaveLength(8);
    expect(f.manos[0]).toHaveLength(2);
    expect(new Set([...f.mazo, f.robada!])).toEqual(new Set(descarte.slice(0, -1)));
  });

  it('sin nada que robar se pasa, y si pasan todos seguidos la mano se bloquea', () => {
    // 12, 30 y 7 puntos: gana el de 7 y se apunta 42.
    const manos: IdCarta[][] = [
      ['picas-2', 'picas-10'],
      ['picas-12', 'picas-13', 'picas-11'],
      ['picas-7'],
    ];
    let e = con(manos, ['corazones-9'], { mazo: [] });
    expect(legales(e)).toEqual([{ tipo: 'pasar' }]);
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pasar' });
    expect(e.pasesSeguidos).toBe(2);
    e = hacer(e, { tipo: 'pasar' });
    const mano = e.resultadosManos[0]!;
    expect(mano.bloqueada).toBe(true);
    expect(mano.ganador).toBe(2);
    expect(mano.puntosEnMano).toEqual([12, 30, 7]);
    expect(mano.ganados).toEqual([0, 0, 42]);
    expect(e.totales).toEqual([0, 0, 42]);
  });

  it('bloqueada con empate: nadie se apunta nada', () => {
    let e = con([['picas-2'], ['treboles-2']], ['corazones-9'], { mazo: [] });
    e = hacer(hacer(e, { tipo: 'pasar' }), { tipo: 'pasar' });
    expect(e.resultadosManos[0]!.ganador).toBeNull();
    expect(e.totales).toEqual([0, 0]);
  });
});

describe('fin de la mano y partida', () => {
  it('quien se queda sin cartas se apunta lo que les queda a los demás', () => {
    const manos: IdCarta[][] = [['picas-8'], ['corazones-13'], ['corazones-4'], ['corazones-5']];
    let e = con(manos, ['corazones-9'], { turno: 2 });
    // El asiento 2 juega su última carta; a los demás les quedan un 8, un rey y un 5.
    e = hacer(e, { tipo: 'jugar', carta: 'corazones-4' });
    const mano = e.resultadosManos[0]!;
    expect(mano.ganador).toBe(2);
    expect(mano.ganados).toEqual([0, 0, 65, 0]);
    expect(puntosManoOchoLoco(['picas-8', 'corazones-13', 'diamantes-4'])).toBe(64);
    // Se reparte la siguiente mano con el repartidor siguiente.
    expect(e.repartidor).toBe(0);
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
    expect(e.turno).toBe(1);
    expect(ochoLoco.resultado(e)).toBeNull();
  });

  it('llegar a 100 termina la partida', () => {
    let e = con([['corazones-4'], ['corazones-13', 'picas-12', 'picas-5']], ['corazones-9'], {
      totales: [80, 0],
    });
    e = hacer(e, { tipo: 'jugar', carta: 'corazones-4' });
    expect(e.totales).toEqual([105, 0]);
    expect(ochoLoco.resultado(e)).toEqual({ ganadores: [0], empate: false, puntos: [105, 0] });
    expect(ochoLoco.accionesLegales(e, 1)).toEqual([]);
    expect(ochoLoco.vistaDe(e, 1).turno).toBeNull();
  });
});

describe('vista del Ocho loco', () => {
  it('ve su mano, el descarte y las cuentas; la carta robada por otro, no', () => {
    const e = nueva();
    const v = ochoLoco.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([5, 5, 5, 5]);
    expect(v.mazo).toBe(31);
    expect(v.descarte).toEqual(e.descarte);
    expect(v.turno).toBe(0);
  });
});

describirContrato(ochoLoco, {
  configs: [CONFIG_OCHO_LOCO_POR_DEFECTO, { jugadores: 2 }, { jugadores: 5 }],
  // Ocultas: las manos ajenas y el mazo. Las cartas jugadas que se ven en la última acción de
  // cada uno pueden haber vuelto a una mano al rehacer el mazo: ya las vio todo el mundo.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>(
      e.ultimas.flatMap((u) => (u?.tipo === 'jugar' ? [u.carta] : [])),
    );
    const ocultas = [...e.manos.flatMap((m, a) => (a === asiento ? [] : m)), ...e.mazo];
    return ocultas.filter((c) => !vistas.has(c));
  },
  pasosMaximos: 400,
  ejecuciones: 30,
});
