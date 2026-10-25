import { describe, expect, it } from 'vitest';
import {
  canasta,
  compararCanasta,
  CONFIG_CANASTA_POR_DEFECTO,
  esCanastaLimpia,
  esComodinCanasta,
  esTresRojo,
  puntuarManoCanasta,
  type AccionCanasta,
  type CartaCanasta,
  type CombinacionCanasta,
  type EstadoCanasta,
} from '../../src/juegos/canasta';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/**
 * Cartas en notación corta: «7p» es el 7 de picas (c, d y t: corazones, diamantes y tréboles),
 * «J» un joker; con «'» detrás, la segunda copia.
 */
let copias = new Map<string, number>();
function c(texto: string): CartaCanasta[] {
  const palos: Record<string, string> = {
    p: 'picas',
    c: 'corazones',
    d: 'diamantes',
    t: 'treboles',
  };
  const valores: Record<string, number> = { A: 1, J: 11, Q: 12, K: 13 };
  return texto.split(' ').map((t) => {
    const base =
      t === 'J'
        ? 'comodin-1'
        : `${palos[t.at(-1)!]}-${valores[t.slice(0, -1)] ?? Number(t.slice(0, -1))}`;
    // Cada vez que se repite una carta se usa la copia siguiente (y después el otro joker).
    const n = copias.get(base) ?? 0;
    copias.set(base, n + 1);
    if (base === 'comodin-1') {
      return (['comodin-1#0', 'comodin-2#0', 'comodin-1#1', 'comodin-2#1'] as const)[n]!;
    }
    return `${base}#${n}` as CartaCanasta;
  });
}

function nueva(semilla = 'canasta'): EstadoCanasta {
  const r = canasta.crear(CONFIG_CANASTA_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoCanasta, accion: AccionCanasta): EstadoCanasta {
  const r = aplicar(canasta, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoCanasta) => canasta.accionesLegales(e, e.turno);
const esLegal = (e: EstadoCanasta, a: AccionCanasta) => aplicar(canasta, e, e.turno, a).ok;
const tipos = (e: EstadoCanasta) => legales(e).map((a) => a.tipo);

/** Una mesa armada a mano: le toca al asiento 0, en la fase de bajar salvo que se diga. */
function mesa(manos: string[], parcial: Partial<EstadoCanasta> = {}): EstadoCanasta {
  copias = new Map();
  const base = nueva();
  const ordenadas = manos.map((m) => (m === '' ? [] : c(m).sort(compararCanasta)));
  const usadas = new Set<string>(ordenadas.flat());
  return {
    ...base,
    manos: ordenadas,
    conocidas: [[], [], [], []],
    mazo: base.mazo.filter((x) => !usadas.has(x)).slice(0, 40),
    pozo: [],
    congelado: false,
    combinaciones: [],
    treses: [[], []],
    turno: 0,
    fase: 'bajar',
    ...parcial,
  };
}

const comb = (id: number, bando: number, valor: number, cartas: string): CombinacionCanasta => ({
  id,
  bando,
  valor,
  cartas: c(cartas),
});

describe('Reparto de la Canasta', () => {
  it('11 cartas a cada uno, el pozo empezado y las 108 cartas en juego', () => {
    for (let i = 0; i < 10; i++) {
      const e = nueva(`reparto-${i}`);
      expect(e.manos.map((m) => m.length)).toEqual([11, 11, 11, 11]);
      expect(e.manos.flat().some(esTresRojo)).toBe(false);
      expect(e.pozo.length).toBeGreaterThanOrEqual(1);
      const todas = [...e.manos.flat(), ...e.mazo, ...e.pozo, ...e.treses.flat()];
      expect(new Set(todas).size).toBe(108);
      expect(e.turno).toBe(0);
    }
  });

  it('si el pozo empieza con un comodín o un 3 rojo, se tapa y queda congelado', () => {
    let visto = false;
    for (let i = 0; i < 200 && !visto; i++) {
      const e = nueva(`pozo-${i}`);
      if (e.pozo.length < 2) {
        expect(e.congelado).toBe(false);
        continue;
      }
      visto = true;
      expect(esComodinCanasta(e.pozo[0]!) || esTresRojo(e.pozo[0]!)).toBe(true);
      expect(esComodinCanasta(e.pozo.at(-1)!) || esTresRojo(e.pozo.at(-1)!)).toBe(false);
      expect(e.congelado).toBe(true);
    }
    expect(visto).toBe(true);
  });
});

describe('Comodines y treses de la Canasta', () => {
  it('al robar un 3 rojo se baja y se roba otra', () => {
    const e = mesa(['5p 6p', '4c', '4d', '4t'], { fase: 'robar' });
    copias = new Map([['corazones-3', 0]]);
    const [tres] = c('3c');
    const [otra] = c('9t');
    const tras = hacer(
      { ...e, mazo: [...e.mazo.filter((x) => x !== otra), otra!, tres!] },
      { tipo: 'robar' },
    );
    expect(tras.treses[0]).toEqual([tres]);
    expect(tras.manos[0]).toContain(otra);
    expect(tras.manos[0]).toHaveLength(3);
  });

  it('los treses rojos restan a la pareja que no ha bajado', () => {
    copias = new Map();
    const d = puntuarManoCanasta(
      {
        combinaciones: [],
        treses: [c('3c 3d'), []],
        abierto: [false, false],
        manos: [[], [], [], []],
      },
      null,
    );
    expect(d[0]!.treses).toBe(-200);
  });
});

describe('Turno y combinaciones de la Canasta', () => {
  it('robar y descartar', () => {
    let e = mesa(['5p 6p 7p 8p 9p 10p Jp Qp Kp Ap 4c', '4d', '4t', '5c'], { fase: 'robar' });
    e = hacer(e, { tipo: 'robar' });
    expect(e.manos[0]).toHaveLength(12);
    const nueve = e.manos[0]!.find((x) => x.startsWith('picas-9'))!;
    e = hacer(e, { tipo: 'descartar', carta: nueve });
    expect(e.manos[0]).toHaveLength(11);
    expect(e.pozo.at(-1)).toBe(nueve);
    expect(e.turno).toBe(1);
  });

  it('dos reyes y un joker forman una combinación', () => {
    const e = mesa(['Kp Kc J 5p 6p', '4d', '4t', '5c'], { abierto: [true, false] });
    const cartas = e.manos[0]!.filter((x) => x.includes('-13#') || x.startsWith('comodin'));
    const tras = hacer(e, { tipo: 'bajar', cartas });
    expect(tras.combinaciones).toHaveLength(1);
    expect(tras.combinaciones[0]!.valor).toBe(13);
    expect(tras.combinaciones[0]!.cartas).toHaveLength(3);
  });

  it('no valen cuatro comodines, ni un solo natural', () => {
    const e = mesa(['7p 7c J J J J 5p 6p', '4d', '4t', '5c'], { abierto: [true, false] });
    const bajadas = legales(e).filter((a) => a.tipo === 'bajar');
    expect(
      bajadas.some((a) => a.tipo === 'bajar' && a.cartas.filter(esComodinCanasta).length > 3),
    ).toBe(false);
    copias = new Map([['picas-7', 0]]);
    expect(esLegal(e, { tipo: 'bajar', cartas: c('7p J J') })).toBe(false);
  });

  it('con 7 naturales es una canasta limpia; con un comodín, sucia', () => {
    const e = mesa(['10p 5p 6p 2t', '4d', '4t', '5c'], {
      abierto: [true, false],
      combinaciones: [comb(0, 0, 10, '10c 10d 10t 10c 10d 10t')],
      siguienteId: 1,
    });
    copias = new Map();
    const diez = e.manos[0]!.find((x) => x.startsWith('picas-10'))!;
    const tras = hacer(e, { tipo: 'anadir', combinacion: 0, cartas: [diez] });
    expect(esCanastaLimpia(tras.combinaciones[0]!)).toBe(true);
    const dos = tras.manos[0]!.find((x) => x.startsWith('treboles-2'))!;
    const sucia = hacer(tras, { tipo: 'anadir', combinacion: 0, cartas: [dos] });
    expect(esCanastaLimpia(sucia.combinaciones[0]!)).toBe(false);
  });
});

describe('Primera bajada de la Canasta', () => {
  it('sin llegar al mínimo no se descarta, y se puede deshacer', () => {
    const e = mesa(['5p 5c 5d 9p 10p', '4d', '4t', '6c']);
    const cincos = e.manos[0]!.filter((x) => x.includes('-5#'));
    let tras = hacer(e, { tipo: 'bajar', cartas: cincos });
    expect(tipos(tras)).not.toContain('descartar');
    expect(tipos(tras)).toContain('deshacer');
    tras = hacer(tras, { tipo: 'deshacer' });
    expect(tras.manos[0]).toEqual(e.manos[0]);
    expect(tras.combinaciones).toEqual([]);
    expect(tras.apertura).toBeNull();
    expect(tipos(tras)).toContain('descartar');
  });

  it('con 1.600 puntos, tres ases y tres reyes llegan a 90', () => {
    const e = mesa(['Ap Ac Ad Kp Kc Kd 9p 4p', '4d', '4t', '6c'], {
      puntos: [1600, 0],
      puntosInicioMano: [1600, 0],
    });
    const ases = e.manos[0]!.filter((x) => x.includes('-1#'));
    const reyes = e.manos[0]!.filter((x) => x.includes('-13#'));
    let tras = hacer(e, { tipo: 'bajar', cartas: ases });
    expect(tras.abierto[0]).toBe(false);
    expect(tipos(tras)).not.toContain('descartar');
    tras = hacer(tras, { tipo: 'bajar', cartas: reyes });
    expect(tras.abierto[0]).toBe(true);
    expect(tras.apertura).toBeNull();
    expect(tipos(tras)).toContain('descartar');
  });

  it('para la primera bajada con el pozo solo cuentan la de arriba y la mano', () => {
    copias = new Map();
    const pozo = c('Kt Kt Kt 8t');
    const e = mesa(['8p 8c 5p 9p', '4d', '4t', '6c'], { fase: 'robar', pozo });
    // 8 + 8 + 8 = 30 < 50, y con la mano no llega: no se lo puede llevar aunque haya reyes.
    expect(tipos(e)).not.toContain('tomarPozo');
    const conAses = mesa(['8p 8c Ap Ac Ad 9p', '4d', '4t', '6c'], { fase: 'robar', pozo });
    expect(tipos(conAses)).toContain('tomarPozo');
  });
});

describe('El pozo de la Canasta', () => {
  it('congelado, no se lleva con un natural y un joker', () => {
    copias = new Map();
    const e = mesa(['8p J 5p 9p', '4d', '4t', '6c'], {
      fase: 'robar',
      pozo: c('2t 8c'),
      congelado: true,
      abierto: [true, true],
    });
    expect(tipos(e)).not.toContain('tomarPozo');
  });

  it('con dos ochos se lleva el pozo: tres ochos bajados y el resto a la mano', () => {
    copias = new Map();
    const pozo = c('5c 9c 8c');
    const e = mesa(['8p 8d 5p 9p', '4d', '4t', '6c'], {
      fase: 'robar',
      pozo,
      abierto: [true, false],
    });
    const accion = legales(e).find((a) => a.tipo === 'tomarPozo' && a.cartas.length === 2)!;
    const tras = hacer(e, accion);
    expect(tras.combinaciones[0]!.cartas).toHaveLength(3);
    expect(tras.manos[0]).toEqual(expect.arrayContaining(pozo.slice(0, 2)));
    expect(tras.conocidas[0]).toEqual(pozo.slice(0, 2));
    expect(tras.pozo).toEqual([]);
  });

  it('sin congelar, la reina de arriba se añade a la combinación de reinas', () => {
    copias = new Map();
    const e = mesa(['5p 9p 4p', '4d', '4t', '6c'], {
      fase: 'robar',
      abierto: [true, false],
      combinaciones: [comb(0, 0, 12, 'Qp Qc Qd')],
      siguienteId: 1,
      pozo: c('7t Qt'),
    });
    const tras = hacer(e, { tipo: 'tomarPozo', cartas: [], combinacion: 0 });
    expect(tras.combinaciones[0]!.cartas).toHaveLength(4);
  });

  it('con un 3 negro arriba no se puede llevar', () => {
    copias = new Map();
    const e = mesa(['3c 5p 9p', '4d', '4t', '6c'], {
      fase: 'robar',
      abierto: [true, true],
      pozo: c('3p'),
    });
    expect(tipos(e)).toEqual(['robar']);
  });
});

describe('Cerrar y fin de la mano de la Canasta', () => {
  const conCanasta = (mano: string, parcial: Partial<EstadoCanasta> = {}) =>
    mesa([mano, '4d 5d', '9t 9d', '6c 7c'], {
      abierto: [true, false],
      combinaciones: [comb(0, 0, 13, 'Kp Kc Kd Kt Kp Kc Kd')],
      siguienteId: 1,
      ...parcial,
    });

  it('con canasta, baja y cierra descartando', () => {
    let e = conCanasta('4p 4c 4t 9p');
    e = hacer(e, { tipo: 'bajar', cartas: e.manos[0]!.filter((x) => x.includes('-4#')) });
    e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    const r = e.resultadosManos[0]!;
    expect(r.cierra).toBe(0);
    expect(r.desglose[0]!.cierre).toBe(100);
    expect(e.numeroMano).toBe(2);
  });

  it('sin canasta no se puede quedar con menos de 2 cartas', () => {
    const e = mesa(['7p 7c 7d', '4d', '4t', '6c'], { abierto: [true, false] });
    expect(tipos(e)).not.toContain('bajar');
  });

  it('con el mazo vacío, si el siguiente no puede llevarse el pozo, la mano termina sin cierre', () => {
    const e = conCanasta('4p 9p 9c', { mazo: [] });
    const tras = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    expect(tras.resultadosManos).toHaveLength(1);
    expect(tras.resultadosManos[0]!.cierra).toBeNull();
  });
});

describe('Puntuación y fin de la partida de la Canasta', () => {
  it('cartas, canasta sucia, 3 rojo y cierre, menos lo que queda en la mano', () => {
    copias = new Map();
    const d = puntuarManoCanasta(
      {
        combinaciones: [
          comb(0, 0, 13, 'Kp Kc Kd Kt Kp J J'),
          comb(1, 0, 6, '6p 6c 6d'),
          comb(2, 0, 5, '5p 5c 5d'),
        ],
        treses: [c('3c'), []],
        abierto: [true, false],
        manos: [[], [], c('Kd 5t 8p'), []],
      },
      0,
    );
    expect(d[0]).toMatchObject({
      cartas: 180,
      canastas: 300,
      treses: 100,
      cierre: 100,
      mano: -25,
      total: 655,
    });
  });

  it('la partida termina cuando una pareja llega a 5.000', () => {
    let e = mesa(['4p 4c 4t 9p', '4d 5d', '9t 9d', '6c 7c'], {
      abierto: [true, false],
      combinaciones: [comb(0, 0, 13, 'Kp Kc Kd Kt Kp Kc Kd')],
      siguienteId: 1,
      puntos: [4900, 4300],
      puntosInicioMano: [4900, 4300],
    });
    e = hacer(e, { tipo: 'bajar', cartas: e.manos[0]!.filter((x) => x.includes('-4#')) });
    e = hacer(e, { tipo: 'descartar', carta: e.manos[0]![0]! });
    expect(e.terminada).toBe(true);
    const fin = canasta.resultado(e)!;
    expect(fin.ganadores).toEqual([0, 2]);
    expect(legales(e)).toEqual([]);
  });
});

describe('Vista del jugador en la Canasta', () => {
  it('ve su mano y el pozo, no las manos ajenas ni el mazo', () => {
    const e = nueva('vista');
    const v = canasta.vistaDe(e, 0);
    expect(v.miMano).toEqual(e.manos[0]);
    expect(v.pozo).toEqual(e.pozo);
    expect(v.cartasEnMazo).toBe(e.mazo.length);
    const texto = JSON.stringify(v);
    for (const carta of [...e.manos[1]!, ...e.mazo.slice(0, 10)])
      expect(texto).not.toContain(`"${carta}"`);
    expect(v.minimos).toEqual([50, 50]);
  });
});

describirContrato(canasta, {
  configs: [CONFIG_CANASTA_POR_DEFECTO],
  cartasOcultas: (e, asiento) => [
    ...e.mazo,
    ...e.manos.flatMap((m, a) =>
      a === asiento ? [] : m.filter((x) => !e.conocidas[a]!.includes(x)),
    ),
  ],
  pasosMaximos: 300,
  ejecuciones: 20,
});
