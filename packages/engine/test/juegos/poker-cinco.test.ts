import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  cambiosPosiblesPokerCinco,
  CONFIG_POKER_CINCO_POR_DEFECTO,
  pokerCinco,
  type AccionPokerCinco,
  type ConfigPokerCinco,
  type EstadoPokerCinco,
} from '../../src/juegos/poker-cinco';
import { aplicar } from '../../src/motor/aplicar';
import { describirContrato } from '../contrato/verificar-contrato';

/** Cartas en notación corta: «7p» es el 7 de picas; c, d y t, corazones, diamantes y tréboles. */
function c(texto: string): IdCarta[] {
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

function nueva(config: Partial<ConfigPokerCinco> = {}, semilla = 'poker'): EstadoPokerCinco {
  const r = pokerCinco.crear({ ...CONFIG_POKER_CINCO_POR_DEFECTO, ...config }, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

function hacer(e: EstadoPokerCinco, accion: AccionPokerCinco): EstadoPokerCinco {
  const r = aplicar(pokerCinco, e, e.turno, accion);
  if (!r.ok) throw new Error(`${JSON.stringify(accion)} de ${e.turno}: ${r.error}`);
  return r.valor;
}

const legales = (e: EstadoPokerCinco) => pokerCinco.accionesLegales(e, e.turno);
const tipos = (e: EstadoPokerCinco) => [...new Set(legales(e).map((a) => a.tipo))];
const servido: AccionPokerCinco = { tipo: 'cambiar', cartas: [] };

/** Iguala o pasa hasta que se llega al descarte. */
function hastaElDescarte(e: EstadoPokerCinco): EstadoPokerCinco {
  while (e.fase === 'antes')
    e = hacer(
      e,
      legales(e).find((a) => a.tipo !== 'retirarse' && a.tipo !== 'subir')!,
    );
  return e;
}

describe('torneo, ciegas y reparto', () => {
  it('con 4: cinco cartas a cada uno, ciegas de 1 y 2, y habla el asiento 3', () => {
    const e = nueva();
    expect(e.manos.map((m) => m.length)).toEqual([5, 5, 5, 5]);
    expect(e.apuestas).toEqual([0, 1, 2, 0]);
    expect(e.fichas).toEqual([100, 99, 98, 100]);
    expect(e.fase).toBe('antes');
    expect(e.turno).toBe(3);
  });

  it('con 2, el botón pone la ciega pequeña y habla primero', () => {
    const e = nueva({ jugadores: 2 });
    expect(e.apuestas).toEqual([1, 2]);
    expect(e.turno).toBe(0);
  });

  it('rechaza 1 o 7 jugadores', () => {
    for (const jugadores of [1, 7]) {
      expect(pokerCinco.crear({ jugadores } as never, 'x').ok).toBe(false);
    }
  });
});

describe('rondas de apuestas', () => {
  it('la ciega grande puede pasar o subir antes del descarte', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'igualar' }); // 3
    e = hacer(e, { tipo: 'igualar' }); // 0
    e = hacer(e, { tipo: 'igualar' }); // 1
    expect(e.turno).toBe(2);
    expect(tipos(e)).toEqual(['retirarse', 'pasar', 'subir']);
    e = hacer(e, { tipo: 'pasar' });
    expect(e.fase).toBe('descarte');
    // Cambia primero el siguiente al botón.
    expect(e.turno).toBe(1);
  });

  it('tras el descarte habla primero el siguiente al botón que sigue en la mano', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'igualar' }); // 3
    e = hacer(e, { tipo: 'igualar' }); // 0
    e = hacer(e, { tipo: 'retirarse' }); // 1
    e = hacer(e, { tipo: 'pasar' }); // 2
    expect(e.fase).toBe('descarte');
    expect(e.turno).toBe(2);
    for (let i = 0; i < 3; i++) e = hacer(e, servido);
    expect(e.fase).toBe('despues');
    expect(e.turno).toBe(2);
    expect(e.apuestaMaxima).toBe(0);
  });

  it('la subida mínima es la apuesta más alta más la última subida', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'subir', hasta: 6 });
    const minima = Math.min(...legales(e).flatMap((a) => (a.tipo === 'subir' ? [a.hasta] : [])));
    expect(minima).toBe(10);
  });
});

describe('descarte', () => {
  it('cambiar tres: sigue con cinco y los demás ven cuántas cambió', () => {
    let e = hastaElDescarte(nueva());
    const quien = e.turno;
    const antes = e.manos[quien]!;
    const cartas = [...antes.slice(0, 3)].sort();
    e = hacer(e, { tipo: 'cambiar', cartas });
    expect(e.manos[quien]).toHaveLength(5);
    expect(e.manos[quien]!.filter((x) => cartas.includes(x))).toEqual([]);
    expect(e.cambiadas[quien]).toBe(3);
    expect(pokerCinco.vistaDe(e, (quien + 1) % 4).cambiadas[quien]).toBe(3);
    expect(e.descartes).toEqual(cartas);
  });

  it('cuatro solo si la que queda es un As, que se enseña', () => {
    const conAs = c('Ap 2c 5d 8t Jp');
    const cuatros = cambiosPosiblesPokerCinco(conAs).filter((x) => x.length === 4);
    expect(cuatros).toEqual([c('2c 5d 8t Jp').sort()]);
    expect(cambiosPosiblesPokerCinco(c('Kp 2c 5d 8t Jp')).some((x) => x.length === 4)).toBe(false);
    expect(cambiosPosiblesPokerCinco(conAs)).toHaveLength(1 + 5 + 10 + 10 + 1);

    let e = hastaElDescarte(nueva());
    const quien = e.turno;
    e = { ...e, manos: e.manos.map((m, a) => (a === quien ? conAs : m)) };
    e = hacer(e, { tipo: 'cambiar', cartas: c('2c 5d 8t Jp').sort() });
    expect(e.cambiadas[quien]).toBe(4);
    expect(e.asEnsenado[quien]).toBe('picas-1');
    expect(e.manos[quien]).toContain('picas-1');
  });

  it('también cambia quien va all-in', () => {
    let e = nueva({ jugadores: 2 });
    e = hacer(e, { tipo: 'subir', hasta: 100 }); // 0, all-in
    e = hacer(e, { tipo: 'igualar' }); // 1, all-in
    expect(e.fase).toBe('descarte');
    // Con 2, después del botón (0) cambia el 1.
    expect(e.turno).toBe(1);
    e = hacer(e, servido);
    e = hacer(e, servido);
    // Nadie puede apostar: showdown sin segunda ronda.
    expect(e.resultadosManos).toHaveLength(1);
    expect(e.resultadosManos[0]!.ensenadas).toHaveLength(2);
  });

  it('si el mazo no alcanza, se barajan los descartes de los anteriores', () => {
    let e = hastaElDescarte(nueva({ jugadores: 6 }));
    // Se dejan solo 2 cartas en el mazo: el primero cambia 3 y tira de los descartes.
    e = { ...e, mazo: e.mazo.slice(0, 2), descartes: e.mazo.slice(2, 10) };
    const quien = e.turno;
    e = hacer(e, { tipo: 'cambiar', cartas: [...e.manos[quien]!.slice(0, 3)].sort() });
    expect(e.manos[quien]).toHaveLength(5);
    expect(new Set(e.manos.flat()).size).toBe(30);
  });
});

describe('showdown, botes y fin', () => {
  it('gana la mejor mano de las cinco cartas', () => {
    let e = hastaElDescarte(nueva({ jugadores: 2 }));
    e = {
      ...e,
      manos: [c('2p 2c 9d 9t Kp'), c('5p 5c 5d Jt 3p')],
    };
    e = hacer(e, servido);
    e = hacer(e, servido);
    e = hacer(e, { tipo: 'pasar' });
    e = hacer(e, { tipo: 'pasar' });
    const r = e.resultadosManos[0]!;
    expect(r.botes[0]!.ganadores).toEqual([1]);
    expect(r.ensenadas.find((m) => m.asiento === 1)!.categoria).toBe('trio');
  });

  it('si todos se retiran, se lo lleva sin enseñar', () => {
    let e = nueva();
    e = hacer(e, { tipo: 'retirarse' }); // 3
    e = hacer(e, { tipo: 'retirarse' }); // 0
    e = hacer(e, { tipo: 'retirarse' }); // 1
    const r = e.resultadosManos[0]!;
    expect(r.sinShowdown).toBe(2);
    expect(r.ensenadas).toEqual([]);
    expect(r.fichasTras).toEqual([100, 99, 101, 100]);
  });

  it('partidas completas de 2 a 6 jugadores terminan con un ganador', () => {
    for (const jugadores of [2, 3, 4, 5, 6] as const) {
      let e = nueva({ jugadores }, `completa-${jugadores}`);
      for (let i = 0; pokerCinco.resultado(e) === null && i < 20_000; i++) {
        const l = legales(e);
        // Sube todo lo que pueda o cambia tres: las partidas acaban pronto.
        e = hacer(e, l.at(-1)!);
      }
      const fin = pokerCinco.resultado(e)!;
      expect(fin.ganadores).toHaveLength(1);
      expect(e.fichas.reduce((s, f) => s + f, 0)).toBe(100 * jugadores);
    }
  });
});

describe('vista', () => {
  it('no enseña las cartas ajenas ni los descartes', () => {
    let e = hastaElDescarte(nueva());
    e = hacer(e, { tipo: 'cambiar', cartas: [...e.manos[e.turno]!.slice(0, 2)].sort() });
    const v = pokerCinco.vistaDe(e, 0);
    const texto = JSON.stringify(v);
    for (const x of e.descartes) expect(texto).not.toContain(x);
    for (const x of e.manos[1]!) expect(texto).not.toContain(x);
    expect(v.miMano).toEqual(e.manos[0]);
  });
});

describirContrato(pokerCinco, {
  configs: [CONFIG_POKER_CINCO_POR_DEFECTO, { jugadores: 2 }, { jugadores: 6 }],
  // Cada mano se baraja entera: lo enseñado en manos anteriores vuelve al mazo.
  cartasOcultas: (e, asiento) => {
    const vistas = new Set<string>([
      ...e.resultadosManos.flatMap((r) => r.ensenadas.flatMap((m) => m.cartas)),
      ...e.asEnsenado.filter((x): x is IdCarta => x !== null),
    ]);
    const ocultas = [
      ...e.mazo,
      ...e.descartes,
      ...e.manos.flatMap((m, a) => (a === asiento ? [] : m)),
    ];
    const mias = asiento === null ? [] : e.manos[asiento]!;
    return ocultas.filter((x) => !vistas.has(x) && !mias.includes(x));
  },
  pasosMaximos: 300,
  ejecuciones: 30,
});
