import { describe, expect, it } from 'vitest';
import type { IdCarta } from '../../src/baraja/cartas';
import {
  comparar,
  ganadorLance,
  pares,
  piedrasJugada,
  puntosJuego,
  rango,
} from '../../src/juegos/mus-jugadas';

const m = (...cartas: IdCarta[]) => cartas;

describe('ocho y cuatro reyes', () => {
  it('con ocho reyes el 3 es rey y el 2 es as', () => {
    expect(rango('oros-3')).toBe(12);
    expect(rango('oros-2')).toBe(1);
    expect(rango('oros-3', 4)).toBe(3);
    expect(rango('oros-2', 4)).toBe(2);
  });

  it('el 3 de oros y el Rey de copas son pareja de reyes', () => {
    expect(pares(m('oros-3', 'copas-12', 'espadas-5', 'bastos-7'))).toEqual({
      tipo: 'pareja',
      clave: [12],
    });
    expect(pares(m('oros-3', 'copas-12', 'espadas-5', 'bastos-7'), 4)).toBeNull();
  });
});

describe('Grande y Chica', () => {
  it('Grande: Rey, Rey, 7, 4 gana a Rey, Caballo, Caballo, Sota', () => {
    const a = m('oros-12', 'copas-12', 'oros-7', 'oros-4');
    const b = m('espadas-12', 'oros-11', 'copas-11', 'oros-10');
    expect(comparar('grande', a, b)).toBeGreaterThan(0);
  });

  it('Chica: As, As, 4, Rey gana a As, 4, 5, 6', () => {
    const a = m('oros-1', 'copas-1', 'oros-4', 'oros-12');
    const b = m('espadas-1', 'copas-4', 'copas-5', 'copas-6');
    expect(comparar('chica', a, b)).toBeGreaterThan(0);
  });
});

describe('Pares', () => {
  it('tipos de jugada', () => {
    expect(pares(m('oros-4', 'copas-4', 'oros-5', 'copas-5'))?.tipo).toBe('duples');
    expect(pares(m('oros-12', 'copas-12', 'espadas-12', 'bastos-12'))?.tipo).toBe('duples');
    expect(pares(m('oros-12', 'copas-12', 'espadas-12', 'oros-7'))?.tipo).toBe('medias');
    expect(pares(m('oros-12', 'copas-12', 'espadas-6', 'oros-7'))?.tipo).toBe('pareja');
    expect(pares(m('oros-12', 'copas-11', 'espadas-6', 'oros-7'))).toBeNull();
  });

  it('duples ganan a medias, y entre parejas gana la más alta', () => {
    const duples = m('oros-4', 'copas-4', 'oros-5', 'copas-5');
    const medias = m('oros-12', 'copas-12', 'espadas-12', 'oros-7');
    expect(comparar('pares', duples, medias)).toBeGreaterThan(0);
    const reyes = m('oros-12', 'copas-12', 'espadas-6', 'oros-7');
    const sotas = m('oros-10', 'copas-10', 'espadas-6', 'bastos-7');
    expect(comparar('pares', reyes, sotas)).toBeGreaterThan(0);
  });

  it('piedras: 1 la pareja, 2 las medias y 3 los duples', () => {
    expect(piedrasJugada('pares', m('oros-12', 'copas-12', 'espadas-6', 'oros-7'))).toBe(1);
    expect(piedrasJugada('pares', m('oros-12', 'copas-12', 'espadas-12', 'oros-7'))).toBe(2);
    expect(piedrasJugada('pares', m('oros-4', 'copas-4', 'oros-5', 'copas-5'))).toBe(3);
    expect(piedrasJugada('pares', m('oros-12', 'copas-11', 'espadas-6', 'oros-7'))).toBe(0);
  });
});

describe('Juego y Punto', () => {
  const treintaYUna = m('oros-12', 'copas-11', 'espadas-10', 'oros-1');
  const cuarenta = m('oros-12', 'copas-11', 'espadas-10', 'bastos-12');

  it('suma: figuras y treses 10, ases y doses 1', () => {
    expect(puntosJuego(treintaYUna)).toBe(31);
    expect(puntosJuego(cuarenta)).toBe(40);
    expect(puntosJuego(m('oros-3', 'copas-2', 'oros-7', 'oros-6'))).toBe(24);
    expect(puntosJuego(m('oros-3', 'copas-2', 'oros-7', 'oros-6'), 4)).toBe(18);
  });

  it('la 31 gana a la 40, la 32 a la 40 y la 40 a la 33', () => {
    expect(comparar('juego', treintaYUna, cuarenta)).toBeGreaterThan(0);
    const de32 = m('oros-12', 'copas-11', 'espadas-6', 'oros-6');
    const de33 = m('oros-12', 'copas-11', 'espadas-7', 'oros-6');
    expect(puntosJuego(de32)).toBe(32);
    expect(comparar('juego', de32, cuarenta)).toBeGreaterThan(0);
    expect(comparar('juego', cuarenta, de33)).toBeGreaterThan(0);
  });

  it('piedras: 3 la 31 y 2 cualquier otro juego', () => {
    expect(piedrasJugada('juego', treintaYUna)).toBe(3);
    expect(piedrasJugada('juego', cuarenta)).toBe(2);
    expect(piedrasJugada('juego', m('oros-4', 'oros-5', 'oros-6', 'oros-7'))).toBe(0);
  });

  it('al Punto gana la suma más alta', () => {
    const treinta = m('oros-12', 'copas-11', 'espadas-7', 'oros-1');
    const veinte = m('oros-12', 'copas-5', 'espadas-4', 'oros-1');
    expect(puntosJuego(treinta)).toBe(28);
    expect(comparar('punto', treinta, veinte)).toBeGreaterThan(0);
  });
});

describe('ganador del lance', () => {
  const igual = (palo: 'oros' | 'copas' | 'espadas' | 'bastos') =>
    m(`${palo}-12`, `${palo}-7`, `${palo}-5`, `${palo}-4`);

  it('el empate es del más cercano a la mano', () => {
    const manos = [igual('oros'), igual('copas'), igual('espadas'), igual('bastos')];
    expect(ganadorLance('grande', manos, 0)).toBe(0);
    expect(ganadorLance('grande', manos, 2)).toBe(2);
    expect(ganadorLance('grande', manos, 3)).toBe(3);
  });

  it('solo entre los participantes', () => {
    const manos = [
      m('oros-12', 'copas-12', 'oros-7', 'oros-4'),
      m('espadas-11', 'copas-11', 'oros-6', 'oros-5'),
      m('espadas-1', 'copas-6', 'bastos-7', 'espadas-4'),
      m('bastos-10', 'copas-10', 'bastos-6', 'bastos-5'),
    ];
    expect(ganadorLance('pares', manos, 0)).toBe(0);
    expect(ganadorLance('pares', manos, 0, 8, [1, 3])).toBe(1);
  });
});
