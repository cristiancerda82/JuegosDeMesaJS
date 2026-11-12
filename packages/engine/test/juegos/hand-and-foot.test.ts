import { describe, expect, it } from 'vitest';
import {
  cartasHandAndFoot,
  combinacionValidaHandAndFoot,
  CONFIG_HAND_AND_FOOT_POR_DEFECTO,
  handAndFoot,
  minimoHandAndFoot,
  puntosHandAndFoot,
  puntuarRondaHandAndFoot,
  tipoLibro,
  type AccionHandAndFoot,
  type CartaHandAndFoot,
  type CombinacionHandAndFoot,
  type EstadoHandAndFoot,
} from '../../src/juegos/hand-and-foot';
import { esComodinCanasta, esTresRojo } from '../../src/juegos/canasta';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/**
 * Cartas en notación corta: «7p» es un 7 de picas; c, d y t, corazones, diamantes y tréboles; «JK»
 * un comodín. Cada aparición de la misma carta en una llamada es otra copia.
 */
function c(texto: string): CartaHandAndFoot[] {
  if (texto === '') return [];
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  const usadas = new Map<string, number>();
  return texto.split(' ').map((t) => {
    const base =
      t === 'JK'
        ? 'comodin-1'
        : `${palos[t.at(-1)!]}-${valores[t.slice(0, -1)] ?? Number(t.slice(0, -1))}`;
    const copia = usadas.get(base) ?? 0;
    usadas.set(base, copia + 1);
    return `${base}#${copia}` as CartaHandAndFoot;
  });
}

function nueva(semilla = 'hf', rondas = 4): EstadoHandAndFoot {
  const r = handAndFoot.crear({ rondas }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoHandAndFoot, accion: AccionHandAndFoot): EstadoHandAndFoot {
  const r = aplicar(handAndFoot, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoHandAndFoot) => handAndFoot.accionesLegales(e, e.turno);
const comb = (
  id: number,
  bando: number,
  valor: number,
  cartas: string,
): CombinacionHandAndFoot => ({ id, bando, valor, cartas: c(cartas) });

/** Un estado en la fase de bajar del asiento 0, con su mano y la mesa dadas. */
function enBajar(mano: string, parcial: Partial<EstadoHandAndFoot> = {}): EstadoHandAndFoot {
  const e = nueva();
  return {
    ...e,
    turno: 0,
    fase: 'bajar',
    manos: e.manos.map((m, a) => (a === 0 ? c(mano) : m)),
    ...parcial,
  };
}

/** Un libro de la pareja 0 de valor `v` (del 4 al 12). */
const libro = (id: number, v: number, tipo: 'limpio' | 'sucio') =>
  comb(
    id,
    0,
    v,
    tipo === 'limpio'
      ? Array(7).fill(`${v}p`).join(' ')
      : `${Array(5).fill(`${v}p`).join(' ')} 2p JK`,
  );

describe('Hand and Foot: baraja, valores y reparto', () => {
  it('270 cartas', () => {
    expect(cartasHandAndFoot()).toHaveLength(270);
    expect(new Set(cartasHandAndFoot()).size).toBe(270);
  });

  it('11 de mano y 11 de pie, y un descarte que no es comodín ni 3 rojo', () => {
    for (const semilla of ['a', 'b', 'c', 'd']) {
      const e = nueva(semilla);
      expect(e.manos.map((m) => m.length)).toEqual([11, 11, 11, 11]);
      expect(e.pies.map((m) => m.length)).toEqual([11, 11, 11, 11]);
      const arriba = e.descarte.at(-1)!;
      expect(esComodinCanasta(arriba) || esTresRojo(arriba)).toBe(false);
      expect(e.manos.flat().some(esTresRojo)).toBe(false);
    }
    expect(nueva().turno).toBe(0);
  });

  it('valor de las cartas', () => {
    expect(c('JK 2p Ap Kp 7p 3p').reduce((s, x) => s + puntosHandAndFoot(x), 0)).toBe(110);
  });
});

describe('Hand and Foot: treses rojos y robo', () => {
  it('se roban 2 cartas', () => {
    const e = nueva();
    const tras = hacer(e, { tipo: 'robar' });
    // Los treses rojos se reponen: la mano siempre crece en 2.
    expect(tras.manos[0]).toHaveLength(13);
    expect(tras.fase).toBe('bajar');
  });

  it('un 3 rojo robado va a la mesa y se roba otra', () => {
    const e = nueva();
    const mazo = [...c('5p 6p 7p'), ...c('3c')];
    const tras = hacer({ ...e, mazo, treses: [[], []] }, { tipo: 'robar' });
    expect(tras.treses[0]).toEqual(c('3c'));
    expect(tras.manos[0]).toEqual(expect.arrayContaining([...c('7p'), ...c('6p')]));
    expect(tras.mazo).toEqual(c('5p'));
  });
});

describe('Hand and Foot: coger el descarte', () => {
  const base = (parcial: Partial<EstadoHandAndFoot>) => {
    const e = nueva();
    return {
      ...e,
      manos: e.manos.map((m, a) => (a === 0 ? c('9p 9c 5t') : m)),
      abierto: [true, false],
      descarte: c('4p 4c 4d 4t Kp Kc Qp Qc 9d'),
      ...parcial,
    };
  };

  it('con dos naturales del valor de arriba, si la pareja ha bajado', () => {
    const e = base({});
    const accion = legales(e).find((a) => a.tipo === 'cogerDescarte')!;
    expect(accion).toBeDefined();
    const tras = hacer(e, accion);
    const nueve = tras.combinaciones.find((x) => x.valor === 9)!;
    expect(nueve.cartas).toHaveLength(3);
    // Las 6 de debajo de la de arriba van a la mano; las demás se quedan.
    expect(tras.descarte).toEqual(c('4p 4c'));
    expect(tras.manos[0]).toHaveLength(1 + 6);
    expect(tras.conocidas[0]).toHaveLength(6);
  });

  it('bloqueado por un 3 negro o un comodín', () => {
    for (const arriba of ['3p', 'JK', '2c']) {
      const e = base({
        descarte: [...c('4p 4c'), ...c(arriba)],
        manos: nueva().manos.map((m, a) => (a === 0 ? c('3t 3p JK 2d 2t') : m)),
      });
      expect(legales(e).some((a) => a.tipo === 'cogerDescarte')).toBe(false);
    }
  });

  it('sin la primera bajada no se coge', () => {
    const e = base({ abierto: [false, false] });
    expect(legales(e).some((a) => a.tipo === 'cogerDescarte')).toBe(false);
  });
});

describe('Hand and Foot: combinaciones y libros', () => {
  it('libro sucio con un comodín, que ya no admite más', () => {
    const e = enBajar('JK 2t 4p 4c', {
      abierto: [true, false],
      combinaciones: [comb(0, 0, 7, '7p 7c 7d 7t 7p 2p')],
      siguienteId: 1,
    });
    const tras = hacer(e, { tipo: 'anadir', combinacion: 0, cartas: c('JK') });
    expect(tipoLibro(tras.combinaciones[0]!)).toBe('sucio');
    expect(legales(tras).some((a) => a.tipo === 'anadir' && a.combinacion === 0)).toBe(false);
  });

  it('demasiados comodines', () => {
    expect(combinacionValidaHandAndFoot(13, c('Kp Kc JK JK 2p 2c'))).toBe(false);
    expect(combinacionValidaHandAndFoot(13, c('Kp Kc JK 2p 2c'))).toBe(true);
    expect(combinacionValidaHandAndFoot(0, c('JK 2p 2c'))).toBe(true);
    expect(combinacionValidaHandAndFoot(0, c('JK 2p 5c'))).toBe(false);
    expect(combinacionValidaHandAndFoot(5, c('3p 5p 5c'))).toBe(false);
  });

  it('no hay dos combinaciones sin terminar del mismo valor', () => {
    const e = enBajar('9p 9c 9d 5t', {
      abierto: [true, false],
      combinaciones: [comb(0, 0, 9, '9p 9p 9p 9p 9p 9p 9p'), comb(1, 0, 9, '9c 9c 9c')],
      siguienteId: 2,
    });
    const bajadas = legales(e).filter((a) => a.tipo === 'bajar');
    expect(bajadas).toHaveLength(0);
    expect(legales(e).some((a) => a.tipo === 'anadir' && a.combinacion === 1)).toBe(true);
  });
});

describe('Hand and Foot: primera bajada', () => {
  it('sin llegar al mínimo no se descarta, y se puede deshacer', () => {
    const e = enBajar('5p 5c 5d 9t Kp');
    const tras = hacer(e, { tipo: 'bajar', cartas: c('5p 5c 5d') });
    expect(tras.abierto[0]).toBe(false);
    expect(legales(tras).some((a) => a.tipo === 'descartar')).toBe(false);
    const deshecho = hacer(tras, { tipo: 'deshacer' });
    expect(deshecho.combinaciones).toEqual([]);
    expect(deshecho.manos[0]).toHaveLength(5);
  });

  it('llega al mínimo', () => {
    const e = enBajar('Ap Ac Ad 9t Kp');
    const tras = hacer(e, { tipo: 'bajar', cartas: c('Ap Ac Ad') });
    expect(tras.abierto[0]).toBe(true);
    expect(tras.apertura).toBeNull();
  });

  it('mínimos de las rondas', () => {
    expect([1, 2, 3, 4].map(minimoHandAndFoot)).toEqual([50, 90, 120, 150]);
  });
});

describe('Hand and Foot: el pie y cerrar', () => {
  it('coger el pie bajando: sigue el turno', () => {
    const e = enBajar('7p 7c 7d', { abierto: [true, false] });
    const pie = e.pies[0]!;
    const tras = hacer(e, { tipo: 'bajar', cartas: c('7p 7c 7d') });
    expect(tras.enPie[0]).toBe(true);
    expect(tras.pies[0]).toEqual([]);
    expect(
      tras.manos[0]!.length + tras.treses[0]!.length - e.treses[0]!.length,
    ).toBeGreaterThanOrEqual(pie.length);
    expect(tras.turno).toBe(0);
    expect(tras.fase).toBe('bajar');
  });

  it('coger el pie al descartar: pasa el turno', () => {
    const e = enBajar('9t', { abierto: [true, false] });
    const tras = hacer(e, { tipo: 'descartar', carta: c('9t')[0]! });
    expect(tras.enPie[0]).toBe(true);
    expect(tras.manos[0]!.length).toBeGreaterThan(0);
    expect(tras.turno).toBe(1);
  });

  it('sin los libros no se queda con una sola carta', () => {
    const e = enBajar('7p 7c 7d 9t', {
      abierto: [true, false],
      enPie: [true, false, false, false],
      pies: [[], ...nueva().pies.slice(1)],
      combinaciones: [libro(0, 8, 'limpio'), libro(1, 10, 'sucio'), libro(2, 12, 'sucio')].map(
        (x, i) => ({ ...x, id: i }),
      ),
      siguienteId: 3,
    });
    expect(legales(e).some((a) => a.tipo === 'bajar' && a.cartas.length === 3)).toBe(false);
    // Con otro 9, ya puede bajarlos: le quedan dos cartas.
    const conOtro = { ...e, manos: e.manos.map((m, i) => (i === 0 ? c('7p 7c 7d 9t 9c') : m)) };
    expect(legales(conOtro).some((a) => a.tipo === 'bajar' && a.cartas.length === 3)).toBe(true);
  });

  it('cerrar con 2 limpios y 2 sucios', () => {
    const e = enBajar('9t', {
      abierto: [true, false],
      enPie: [true, false, false, false],
      pies: [[], ...nueva().pies.slice(1)],
      combinaciones: [
        libro(0, 8, 'limpio'),
        libro(1, 6, 'limpio'),
        libro(2, 10, 'sucio'),
        libro(3, 12, 'sucio'),
      ].map((x, i) => ({ ...x, id: i })),
      siguienteId: 4,
    });
    const tras = hacer({ ...e, config: { rondas: 1 } }, { tipo: 'descartar', carta: c('9t')[0]! });
    expect(tras.terminada).toBe(true);
    expect(tras.resultadosRondas[0]!.cierra).toBe(0);
    expect(tras.resultadosRondas[0]!.desglose[0]!.cierre).toBe(100);
  });
});

describe('Hand and Foot: puntuación y partida', () => {
  it('puntos de una ronda', () => {
    const d = puntuarRondaHandAndFoot(
      {
        combinaciones: [comb(0, 0, 7, '7p 7c 7d 7t 7p 7c 7d')],
        treses: [c('3c'), []],
        manos: [[], [], c('9p'), []],
        pies: [[], [], [], []],
      },
      0,
    );
    expect(d[0]!.total).toBe(725);
  });

  it('el pie sin coger resta', () => {
    const d = puntuarRondaHandAndFoot(
      {
        combinaciones: [],
        treses: [[], []],
        manos: [[], [], [], []],
        pies: [c('Kp Ap'), [], [], []],
      },
      null,
    );
    expect(d[0]!.mano).toBe(-30);
  });

  it('la partida acaba tras la cuarta ronda', () => {
    const e = enBajar('9t', { abierto: [true, false], ronda: 4, puntos: [100, 50] });
    const tras = hacer({ ...e, mazo: [] }, { tipo: 'descartar', carta: c('9t')[0]! });
    // Sin mazo, el siguiente no puede robar: acaba la ronda y la partida.
    const fin = tras.terminada ? tras : hacer(tras, { tipo: 'acabar' });
    expect(fin.terminada).toBe(true);
    expect(fin.resultadosRondas).toHaveLength(1);
    expect(handAndFoot.resultado(fin)).not.toBeNull();
  });
});

describe('Hand and Foot: vista', () => {
  it('sin cartas ajenas ni pies', () => {
    const e = nueva();
    const v = handAndFoot.vistaDe(e, 2);
    expect(v.miMano).toEqual(e.manos[2]);
    expect(v.cartasEnPie).toEqual([11, 11, 11, 11]);
    const texto = JSON.stringify(v);
    for (const x of [...e.manos[0]!, ...e.pies[2]!]) expect(texto).not.toContain(`"${x}"`);
  });
});

describirContrato(handAndFoot, {
  configs: [CONFIG_HAND_AND_FOOT_POR_DEFECTO, { rondas: 1 }],
  cartasOcultas: (e, asiento) => [
    ...e.manos.flatMap((m, a) =>
      a === asiento ? [] : m.filter((x) => !e.conocidas[a]!.includes(x)),
    ),
    ...e.pies.flat(),
    ...e.mazo,
  ],
  pasosMaximos: 4_000,
});
