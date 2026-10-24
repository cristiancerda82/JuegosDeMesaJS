import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  clasificacionCulo,
  compararCulo,
  CONFIG_CULO_POR_DEFECTO,
  culo,
  rangoCulo,
  type AccionCulo,
  type ConfigCulo,
  type EstadoCulo,
  type ResultadoManoCulo,
} from '../../src/juegos/culo';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7o» es el 7 de oros; c, e y b, copas, espadas y bastos; S, C, R y A. */
function c(texto: string): IdCarta[] {
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  const valores: Record<string, number> = { A: 1, S: 10, C: 11, R: 12 };
  return texto.split(' ').map((t) => {
    const valor = t.slice(0, -1);
    return `${palos[t.at(-1)!]}-${valores[valor] ?? Number(valor)}` as IdCarta;
  });
}

function nueva(config: Partial<ConfigCulo> = {}, semilla = 'culo'): EstadoCulo {
  const r = culo.crear({ ...CONFIG_CULO_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoCulo, accion: AccionCulo): EstadoCulo {
  const r = aplicar(culo, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const jugar = (e: EstadoCulo, texto: string) =>
  hacer(e, { tipo: 'jugar', cartas: [...c(texto)].sort(compararCulo) });
const pasar = (e: EstadoCulo) => hacer(e, { tipo: 'pasar' });
const esLegal = (e: EstadoCulo, a: AccionCulo) => aplicar(culo, e, e.turno, a).ok;

/** Una mano en juego armada a mano. */
function enJuego(manos: string[], parcial: Partial<EstadoCulo> = {}): EstadoCulo {
  const base = nueva({ jugadores: manos.length as 3 | 4 | 5 | 6 });
  return {
    ...base,
    manos: manos.map((m) => (m === '' ? [] : [...c(m)].sort(compararCulo))),
    fase: 'juego',
    turno: 0,
    ...parcial,
  };
}

/** Juega con la primera acción legal hasta que termine la mano en curso. */
function terminarMano(e: EstadoCulo): EstadoCulo {
  const manos = e.resultadosManos.length;
  let x = e;
  while (x.resultadosManos.length === manos) {
    const acciones = culo.accionesLegales(x, x.turno);
    // Abre con una sola carta y supera si puede: así la mano avanza.
    x = hacer(x, acciones[0]!);
  }
  return x;
}

const manoAnterior = (orden: number[], n = orden.length): ResultadoManoCulo => ({
  orden,
  cargos: [],
  puntosMano: new Array<number>(n).fill(0),
  totalesTras: new Array<number>(n).fill(0),
});

describe('Reparto del Culo', () => {
  it('con 6 jugadores, los asientos 0 a 3 tienen 7 cartas y el 4 y el 5 tienen 6', () => {
    const e = nueva({ jugadores: 6 });
    expect(e.manos.map((m) => m.length)).toEqual([7, 7, 7, 7, 6, 6]);
  });

  it('se reparten las 40 cartas, ordenadas de menor a mayor', () => {
    const e = nueva({ jugadores: 3 });
    expect(new Set(e.manos.flat()).size).toBe(40);
    for (const m of e.manos) expect([...m].sort(compararCulo)).toEqual(m);
  });

  it('el 2 es más alto que el As, y el 3 la más baja', () => {
    expect(rangoCulo('oros-2')).toBeGreaterThan(rangoCulo('copas-1'));
    expect(rangoCulo('copas-1')).toBeGreaterThan(rangoCulo('bastos-12'));
    expect(rangoCulo('espadas-3')).toBe(0);
  });

  it('no se juega con 2 o 7 jugadores', () => {
    expect(culo.crear({ jugadores: 2 as 3 }, 'x').ok).toBe(false);
    expect(culo.crear({ jugadores: 7 as 3 }, 'x').ok).toBe(false);
  });
});

describe('Rondas del Culo', () => {
  it('ante dos cincos se superan con dos sietes, no con uno ni con tres', () => {
    const e = enJuego(['7o 7c 7e 3b', '4o', '4c', '4e'], {
      mesa: { asiento: 3, cartas: c('5o 5c') },
    });
    expect(esLegal(e, { tipo: 'jugar', cartas: c('7o 7c') })).toBe(true);
    expect(esLegal(e, { tipo: 'jugar', cartas: c('7o') })).toBe(false);
    expect(esLegal(e, { tipo: 'jugar', cartas: c('7o 7c 7e') })).toBe(false);
    expect(esLegal(e, { tipo: 'pasar' })).toBe(true);
  });

  it('un caballo no supera a otro caballo', () => {
    const e = enJuego(['Co Rc', '4o', '4c', '4e'], { mesa: { asiento: 3, cartas: c('Cc') } });
    expect(esLegal(e, { tipo: 'jugar', cartas: c('Co') })).toBe(false);
    expect(esLegal(e, { tipo: 'jugar', cartas: c('Rc') })).toBe(true);
  });

  it('quien abre juega de 1 a 4 cartas iguales y no puede pasar', () => {
    const e = enJuego(['5o 5c 5e 5b 6o', '4o', '4c', '4e']);
    expect(esLegal(e, { tipo: 'pasar' })).toBe(false);
    expect(esLegal(e, { tipo: 'jugar', cartas: c('5o 5c 5e 5b') })).toBe(true);
    expect(esLegal(e, { tipo: 'jugar', cartas: c('5o 6o') })).toBe(false);
  });

  it('si todos los demás pasan, la ronda se limpia y abre quien jugó', () => {
    let e = enJuego(['4o 6o', 'Ro 5o', '4c 6c', '4e 6e'], { turno: 1 });
    e = jugar(e, 'Ro');
    e = pasar(pasar(e));
    expect(e.mesa).not.toBeNull();
    e = pasar(e);
    expect(e.mesa).toBeNull();
    expect(e.turno).toBe(1);
  });

  it('quien pasa puede volver a jugar si otro jugó antes de que todos pasaran', () => {
    let e = enJuego(['4o 6o', '5o 6e', '7o 3c', '6c 3e'], { turno: 1 });
    e = jugar(e, '5o');
    e = pasar(e); // el 2 pasa ante el 5
    e = jugar(e, '6c'); // el 3 juega un 6
    e = pasar(pasar(e)); // el 0 y el 1 pasan
    expect(e.turno).toBe(2);
    expect(esLegal(e, { tipo: 'jugar', cartas: c('7o') })).toBe(true);
  });

  it('en la primera mano abre quien tiene el 3 de oros', () => {
    for (let i = 0; i < 10; i++) {
      const e = nueva({}, `oros-${i}`);
      expect(e.manos[e.turno]).toContain('oros-3');
      expect(e.fase).toBe('juego');
      expect(e.intercambios).toEqual([]);
    }
  });
});

describe('Cortar con doses', () => {
  it('jugar doses limpia la ronda y vuelve a abrir quien los jugó', () => {
    let e = enJuego(['2o 2c 4o', '5o', '5c', 'Ao Ac 6e'], {
      mesa: { asiento: 3, cartas: c('Ao Ac') },
    });
    e = jugar(e, '2o 2c');
    expect(e.mesa).toBeNull();
    expect(e.turno).toBe(0);
    expect(e.ultimaAccion?.limpia).toBe(true);
  });

  it('si corta con sus últimas cartas, abre el siguiente que sigue en la mano', () => {
    let e = enJuego(['2o', '5o', '5c', '6e'], { mesa: { asiento: 3, cartas: c('Ao') } });
    e = jugar(e, '2o');
    expect(e.salidos).toEqual([0]);
    expect(e.turno).toBe(1);
    expect(e.mesa).toBeNull();
  });
});

describe('Salida y puestos del Culo', () => {
  it('fin de una mano de 4: presidente 3, vicepresidente 2, viceculo 1 y culo 0', () => {
    let e = enJuego(['', '4o 5o', '', '6o'], { salidos: [2, 0], turno: 3 });
    e = jugar(e, '6o');
    const r = e.resultadosManos[0]!;
    expect(r.orden).toEqual([2, 0, 3, 1]);
    expect(r.cargos).toEqual(['vicepresidente', 'culo', 'presidente', 'viceculo']);
    expect(r.puntosMano).toEqual([2, 0, 3, 1]);
    expect(e.puntos).toEqual([2, 0, 3, 1]);
    // Empieza la segunda mano con el intercambio.
    expect(e.numeroMano).toBe(2);
    expect(e.fase).toBe('intercambio');
    expect(e.turno).toBe(2);
  });

  it('con 3 jugadores no hay vicepresidente ni viceculo; con 5, el del medio es neutral', () => {
    let e = enJuego(['', '4o', '6o'], { salidos: [0], turno: 2 });
    e = jugar(e, '6o');
    expect(e.resultadosManos[0]!.cargos).toEqual(['presidente', 'culo', 'neutral']);
    let f = enJuego(['', '', '', '4o', '6o'], { salidos: [0, 1, 2], turno: 4 });
    f = jugar(f, '6o');
    expect(f.resultadosManos[0]!.cargos).toEqual([
      'presidente',
      'vicepresidente',
      'neutral',
      'culo',
      'viceculo',
    ]);
  });

  it('si sale quien jugó el último y los demás pasan, abre el siguiente que sigue en la mano', () => {
    let e = enJuego(['4o 5o', 'Ro', '4c 5c', '4e 5e'], { turno: 1 });
    e = jugar(e, 'Ro');
    expect(e.salidos).toEqual([1]);
    expect(e.turno).toBe(2);
    e = pasar(pasar(pasar(e)));
    expect(e.mesa).toBeNull();
    expect(e.turno).toBe(2);
  });
});

describe('Intercambio del Culo', () => {
  /** El estado al empezar la segunda mano de una partida de 4. */
  function segundaMano(semilla = 'intercambio'): EstadoCulo {
    return terminarMano(nueva({ jugadores: 4 }, semilla));
  }

  it('el culo da solo sus 2 mejores cartas al presidente, y el presidente devuelve 2', () => {
    let e = segundaMano();
    const { orden } = e.resultadosManos[0]!;
    const presidente = orden[0]!;
    const culoAsiento = orden[3]!;
    const inter = e.intercambios[0]!;
    expect(inter).toMatchObject({ da: culoAsiento, recibe: presidente, devueltas: null });
    // Lo que le queda al culo no es más alto que lo que dio.
    const minimoDado = Math.min(...inter.dadas.map(rangoCulo));
    for (const carta of e.manos[culoAsiento]!)
      expect(rangoCulo(carta)).toBeLessThanOrEqual(minimoDado);
    expect(e.manos[presidente]).toEqual(expect.arrayContaining([...inter.dadas]));
    expect(e.turno).toBe(presidente);

    const antes = e.manos.map((m) => m.length);
    const devueltas = e.manos[presidente]!.slice(0, 2);
    e = hacer(e, { tipo: 'devolver', cartas: devueltas });
    expect(e.manos[culoAsiento]).toEqual(expect.arrayContaining(devueltas));
    expect(e.manos[presidente]).not.toEqual(expect.arrayContaining(devueltas));
    expect(e.manos[presidente]!.length).toBe(antes[presidente]! - 2);

    // Ahora devuelve el vicepresidente, y después abre el culo.
    expect(e.turno).toBe(orden[1]);
    expect(e.intercambios[1]).toMatchObject({ da: orden[2], recibe: orden[1] });
    const legales = culo.accionesLegales(e, e.turno);
    expect(legales.every((a) => a.tipo === 'devolver' && a.cartas.length === 1)).toBe(true);
    e = hacer(e, legales[0]!);
    expect(e.fase).toBe('juego');
    expect(e.turno).toBe(culoAsiento);
    expect(e.manos.map((m) => m.length)).toEqual([10, 10, 10, 10]);
  });

  it('con 3 jugadores solo se cambian el culo y el presidente', () => {
    const e = terminarMano(nueva({ jugadores: 3 }, 'tres'));
    expect(e.intercambios).toHaveLength(1);
  });

  it('en la segunda mano reparte empezando por el culo', () => {
    const e = terminarMano(nueva({ jugadores: 3 }, 'reparto'));
    const culoAsiento = e.resultadosManos[0]!.orden[2]!;
    // 40 entre 3: el que recibe primero tiene 14 (sin contar el intercambio, que no cambia el número).
    expect(e.manos[culoAsiento]!.length).toBe(12);
    expect(e.manos[e.resultadosManos[0]!.orden[0]!]!.length).toBe(15);
  });

  it('el vicepresidente no ve las cartas que se cambian el presidente y el culo', () => {
    const e = segundaMano('ajeno');
    const vice = e.resultadosManos[0]!.orden[1]!;
    const v = culo.vistaDe(e, vice);
    expect(v.misIntercambios).toHaveLength(1);
    expect(v.misIntercambios[0]!.recibe).toBe(vice);
    expect(v.intercambios[0]).toEqual({
      da: e.intercambios[0]!.da,
      recibe: e.intercambios[0]!.recibe,
      cuantas: 2,
      hecho: false,
    });
    const texto = JSON.stringify(v);
    for (const carta of e.intercambios[0]!.dadas) {
      if (!e.manos[vice]!.includes(carta)) expect(texto).not.toContain(carta);
    }
  });
});

describe('Fin de la partida del Culo', () => {
  it('termina tras la quinta mano y gana quien más suma', () => {
    const anteriores = [0, 1, 2, 3].map(() => manoAnterior([3, 2, 1, 0]));
    let e = enJuego(['', '4o 5o', '6o', ''], {
      salidos: [3, 0],
      turno: 1,
      numeroMano: 5,
      resultadosManos: anteriores,
      puntos: [5, 3, 2, 9],
    });
    e = jugar(e, '5o');
    e = pasar(e); // el 2 pasa: la ronda se limpia y el 1 sale con el 4
    e = jugar(e, '4o');
    expect(e.resultadosManos).toHaveLength(5);
    const fin = culo.resultado(e);
    expect(fin).not.toBeNull();
    expect(fin!.ganadores).toEqual([3]);
    expect(fin!.puntos).toEqual([7, 4, 2, 12]);
    expect(culo.accionesLegales(e, e.turno)).toEqual([]);
  });

  it('el empate a puntos lo gana quien quedó mejor en la última mano', () => {
    expect(clasificacionCulo([10, 10, 4, 6], [1, 0, 3, 2])).toEqual([1, 0, 3, 2]);
  });

  it('una partida entera termina tras 5 manos', () => {
    let e = nueva({ jugadores: 5 }, 'entera');
    for (let i = 0; i < MANOS; i++) e = terminarMano(e);
    expect(culo.resultado(e)).not.toBeNull();
    expect(e.resultadosManos.at(-1)!.totalesTras).toEqual(e.puntos);
  });
});

const MANOS = 5;

describe('Vista del jugador en el Culo', () => {
  it('ve su mano y cuántas tienen los demás, no sus cartas', () => {
    const e = nueva();
    const v = culo.vistaDe(e, 0);
    expect(v.miMano).toEqual(e.manos[0]);
    expect(v.cartasEnMano).toEqual([10, 10, 10, 10]);
    const texto = JSON.stringify(v);
    for (const carta of e.manos[1]!) expect(texto).not.toContain(`"${carta}"`);
  });
});

describirContrato(culo, {
  configs: [CONFIG_CULO_POR_DEFECTO, { jugadores: 3 }, { jugadores: 5 }, { jugadores: 6 }],
  cartasOcultas: (e, asiento) => {
    // Lo que el asiento dio en el intercambio lo sabe aunque esté en otra mano.
    const sabidas = new Set<string>(
      e.intercambios.flatMap((x) => [
        ...(x.da === asiento ? x.dadas : []),
        ...(x.recibe === asiento ? (x.devueltas ?? []) : []),
      ]),
    );
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !sabidas.has(x));
  },
  pasosMaximos: 600,
  ejecuciones: 30,
});
