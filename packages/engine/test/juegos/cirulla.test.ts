import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  acuseCirulla,
  capturasCirulla,
  CONFIG_CIRULLA_POR_DEFECTO,
  cirulla,
  grandeCirulla,
  pequenaCirulla,
  puntuarManoCirulla,
  sumaMesaInicial,
  type ConfigCirulla,
  type EstadoCirulla,
} from '../../src/juegos/cirulla';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «12o» es el Rey de oros; c, e y b, copas, espadas y bastos. */
function c(texto: string): IdCarta[] {
  if (texto === '') return [];
  const palos: Record<string, string> = { o: 'oros', c: 'copas', e: 'espadas', b: 'bastos' };
  return texto.split(' ').map((t) => `${palos[t.at(-1)!]}-${Number(t.slice(0, -1))}` as IdCarta);
}

function nueva(config: Partial<ConfigCirulla> = {}, semilla = 'cirulla'): EstadoCirulla {
  const r = cirulla.crear({ ...CONFIG_CIRULLA_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Un estado de 2 con esta mesa y estas manos, el mazo vacío, saliendo el asiento 0. */
const con = (mesa: string, manos: [string, string], extra: Partial<EstadoCirulla> = {}) => ({
  ...nueva(),
  mesa: c(mesa),
  manos: manos.map(c),
  mazo: [],
  turno: 0,
  recogidas: [[], []] as const,
  scopas: [0, 0] as const,
  acusadas: [[], []],
  acuses: [],
  ...extra,
});

const ordenar = (capturas: IdCarta[][]) => capturas.map((x) => [...x].sort()).sort();

describe('baraja, reparto y mesa inicial', () => {
  it('4 en la mesa, 3 a cada uno, 30 en el mazo y menos de dos Ases en la mesa', () => {
    for (let i = 0; i < 40; i++) {
      const e = nueva({}, `reparto-${i}`);
      const enMesa = e.mesaInicial === null ? e.mesa : e.mesaInicial.cartas;
      expect(enMesa).toHaveLength(4);
      expect(enMesa.filter((x) => x.endsWith('-1')).length).toBeLessThan(2);
      expect(e.manos.map((m) => m.length)).toEqual([3, 3]);
      expect(e.mazo).toHaveLength(30);
    }
  });

  it('con 4 en parejas, 3 a cada uno y 24 en el mazo', () => {
    const e = nueva({ jugadores: 4 });
    expect(e.manos.map((m) => m.length)).toEqual([3, 3, 3, 3]);
    expect(e.mazo).toHaveLength(24);
  });

  it('la mesa que suma 30 o 15, también con el 7 de copas', () => {
    expect(sumaMesaInicial(c('12e 12b 6o 4c'))).toBe(30);
    expect(sumaMesaInicial(c('7c 12o 11b 2e'))).toBe(30);
    expect(sumaMesaInicial(c('1e 2b 5o 7o'))).toBe(15);
    expect(sumaMesaInicial(c('7c 1e 2b 3o'))).toBe(15);
    expect(sumaMesaInicial(c('1e 2b 4o 3c'))).toBeNull();
  });

  it('si la mesa suma 30, el que reparte se la lleva con 2 escobas', () => {
    let hallada = false;
    for (let i = 0; i < 300 && !hallada; i++) {
      const e = nueva({}, `mesa-${i}`);
      if (e.mesaInicial === null) continue;
      hallada = true;
      expect(e.mesa).toEqual([]);
      expect(e.recogidas[1]).toEqual(e.mesaInicial.cartas);
      expect(e.mesaInicial.escobas).toBe(e.mesaInicial.suma === 30 ? 2 : 1);
      expect(e.scopas[1]).toBeGreaterThanOrEqual(e.mesaInicial.escobas);
      expect(e.ultimoEnRecoger).toBe(1);
    }
    expect(hallada).toBe(true);
  });
});

describe('acuses', () => {
  it('tres iguales: 10 escobas', () => {
    expect(acuseCirulla(c('5o 5c 5b'))).toMatchObject({ tipo: 'iguales', escobas: 10 });
  });

  it('suma menor que 10: 3 escobas', () => {
    expect(acuseCirulla(c('1b 2c 4o'))).toMatchObject({ tipo: 'menosDeDiez', escobas: 3 });
    expect(acuseCirulla(c('1b 2c 7o'))).toBeNull();
  });

  it('el 7 de copas vale lo que haga falta', () => {
    expect(acuseCirulla(c('7c 10o 10b'))).toMatchObject({ tipo: 'iguales', escobas: 10 });
    expect(acuseCirulla(c('7c 2o 6b'))).toMatchObject({ tipo: 'menosDeDiez' });
    expect(acuseCirulla(c('7c 2o 7b'))).toBeNull();
  });

  it('al repartir una ronda, el acuse se anota y las cartas quedan a la vista', () => {
    const e = con('4b', ['3o', '6e'], { mazo: c('5o 5c 5b 12o 11o 1c') });
    const r = aplicar(cirulla, e, 0, { tipo: 'jugar', carta: 'oros-3', captura: [] });
    if (!r.ok) throw new Error(r.error);
    const d = cirulla.transicion(r.valor, 1, { tipo: 'jugar', carta: 'espadas-6', captura: [] });
    // Otras 3 a cada uno desde el asiento 0: los tres cincos son suyos.
    expect(d.manos[0]).toEqual(c('5o 5c 5b'));
    expect(d.acuses).toEqual([{ asiento: 0, tipo: 'iguales', cartas: c('5o 5c 5b'), escobas: 10 }]);
    expect(d.acusadas[0]).toEqual(c('5o 5c 5b'));
    expect(d.scopas[0]).toBe(10);
    const v = cirulla.vistaDe(d, 1);
    expect(v.acusadas[0]).toEqual(c('5o 5c 5b'));
    const tras = cirulla.transicion(d, 0, { tipo: 'jugar', carta: 'oros-5', captura: [] });
    expect(tras.acusadas[0]).toEqual(c('5c 5b'));
  });
});

describe('capturas y escobas', () => {
  it('del mismo valor o a 15', () => {
    expect(ordenar(capturasCirulla(c('6c 11b'), 'espadas-11'))).toEqual(
      ordenar([c('11b'), c('6c')]),
    );
  });

  it('el As barre una mesa sin Ases', () => {
    expect(capturasCirulla(c('4c 12b'), 'espadas-1')).toEqual([c('4c 12b')]);
  });

  it('con un As en la mesa, el As captura como las demás', () => {
    expect(ordenar(capturasCirulla(c('1c 12b'), 'espadas-1'))).toEqual(ordenar([c('1c')]));
  });

  it('el As con la mesa vacía se queda en ella', () => {
    expect(capturasCirulla([], 'espadas-1')).toEqual([]);
  });

  it('el As que barre hace escoba', () => {
    const e = con('4c 12b', ['1e 3o', '6e 2c']);
    const d = cirulla.transicion(e, 0, { tipo: 'jugar', carta: 'espadas-1', captura: c('4c 12b') });
    expect(d.scopas[0]).toBe(1);
    expect(d.mesa).toEqual([]);
  });

  it('si puede capturar, no puede dejar la carta', () => {
    const e = con('6c', ['11e', '5b']);
    expect(cirulla.accionesLegales(e, 0)).toEqual([
      { tipo: 'jugar', carta: 'espadas-11', captura: c('6c') },
    ]);
  });
});

describe('recuento', () => {
  it('cirulla grande y pequeña', () => {
    expect(grandeCirulla(c('10o 11o 12o'))).toBe(5);
    expect(grandeCirulla(c('10o 11o'))).toBe(0);
    expect(pequenaCirulla(c('1o 2o 3o 4o 5o'))).toBe(5);
    expect(pequenaCirulla(c('1o 2o 3o 4o 5o 6o 7o'))).toBe(6);
    expect(pequenaCirulla(c('1o 3o 4o 5o'))).toBe(0);
  });

  it('el recuento suma la grande y la pequeña al de la Scopa', () => {
    const r = puntuarManoCirulla([c('10o 11o 12o 1o 2o 3o'), c('4b')], [2, 0]);
    expect(r.puntos[0].grande).toBe(5);
    expect(r.puntos[0].pequena).toBe(3);
    expect(r.puntos[0].total).toBe(1 + 1 + 0 + 1 + 2 + 5 + 3);
    expect(r.todosLosOros).toBeNull();
  });
});

describe('fin de la partida', () => {
  it('a 51 gana quien tiene más', () => {
    const e = con('', ['4b', ''], { puntos: [53, 40] });
    const d = cirulla.transicion(e, 0, { tipo: 'jugar', carta: 'bastos-4', captura: [] });
    expect(d.resultadosManos).toHaveLength(1);
    expect(cirulla.resultado(d)).toMatchObject({ ganadores: [0], empate: false });
  });

  it('los diez oros dan la partida', () => {
    const oros = c('1o 2o 3o 4o 5o 6o 7o 10o 11o 12o');
    const e = con('', ['4b', ''], { recogidas: [oros, []], puntos: [0, 45] });
    const d = cirulla.transicion(e, 0, { tipo: 'jugar', carta: 'bastos-4', captura: [] });
    expect(d.resultadosManos[0]!.todosLosOros).toBe(0);
    expect(cirulla.resultado(d)?.ganadores).toEqual([0]);
  });

  it('una partida a 51 entre jugadas legales termina', () => {
    let e = nueva({ jugadores: 4 });
    for (let i = 0; i < 5000 && cirulla.resultado(e) === null; i++) {
      e = cirulla.transicion(e, e.turno, cirulla.accionesLegales(e, e.turno).at(-1)!);
    }
    expect(cirulla.resultado(e)).not.toBeNull();
  });
});

describe('vista', () => {
  it('ve su mano, la mesa y las acusadas, y solo cuántas cartas tienen los demás', () => {
    const e = nueva();
    const v = cirulla.vistaDe(e, 1);
    expect(v.miMano).toEqual(e.manos[1]);
    expect(v.cartasEnMano).toEqual([3, 3]);
    expect(v.acusadas).toEqual(e.acusadas);
  });
});

describirContrato(cirulla, {
  configs: [
    { jugadores: 2, meta: 15 },
    { jugadores: 4, meta: 15 },
  ],
  cartasOcultas: (e, asiento) => {
    // Se ven las acusadas, la última jugada y las de los acuses y la mesa inicial.
    const vistas = new Set<string>([
      ...e.acusadas.flat(),
      ...(e.ultimaJugada ? [e.ultimaJugada.carta, ...e.ultimaJugada.captura] : []),
      ...e.acuses.flatMap((a) => a.cartas),
      ...(e.mesaInicial?.cartas ?? []),
    ]);
    return e.manos.flatMap((m, a) => (a === asiento ? [] : m)).filter((x) => !vistas.has(x));
  },
  pasosMaximos: 6_000,
});
