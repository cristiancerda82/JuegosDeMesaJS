import {
  encajaBelleLucie,
  encajaCanfield,
  encajaFreeCell,
  encajaGolf,
  encajaLadrones,
  encajaScorpion,
  encajaSpider,
  encajaYukon,
  escaleraFinal,
  puedeIrAColumnaKlondike,
  siguienteValorCanfield,
  valorGolf,
  valorPiramide,
  type CartaSpider,
  type IdCarta,
} from '@juegos/engine';
import { expect, test } from 'vitest';
import { movimiento, verificador } from './comprobar';
import { SOLITARIOS } from './solitarios';

const v = verificador(SOLITARIOS);
/** Las cartas del Spider y los Cuarenta ladrones llevan el número de baraja. */
const copia = (id: IdCarta) => `${id}#0` as CartaSpider;

test('Klondike: el movimiento es legal', () => {
  const m = movimiento(v.ejemplo('klondike', 'escalera', 'antesDespues'));
  expect(puedeIrAColumnaKlondike(m.cartas[0]!, { ocultas: [], visibles: [m.sobre!] })).toBe(true);
});

test('FreeCell: el movimiento es legal', () => {
  const m = movimiento(v.ejemplo('freecell', 'escalera', 'antesDespues'));
  expect(encajaFreeCell(m.cartas[0]!, m.sobre)).toBe(true);
});

test('Spider: la escalera es del mismo palo y encaja', () => {
  const m = movimiento(v.ejemplo('spider', 'escaleraSpider', 'antesDespues'));
  expect(encajaSpider(copia(m.cartas[0]!), copia(m.sobre!))).toBe(true);
  expect(escaleraFinal(m.cartas.map(copia))).toBe(m.cartas.length);
});

test('Belle Lucie: el movimiento es legal', () => {
  const m = movimiento(v.ejemplo('belleLucie', 'mover', 'antesDespues'));
  expect(encajaBelleLucie(m.cartas[0]!, m.sobre!)).toBe(true);
});

test('Scorpion: la carta que se mueve encaja', () => {
  const m = movimiento(v.ejemplo('scorpion', 'mover', 'antesDespues'));
  expect(encajaScorpion(m.cartas[0]!, m.sobre)).toBe(true);
});

test('Cuarenta ladrones: el movimiento es legal', () => {
  const m = movimiento(v.ejemplo('cuarentaLadrones', 'mover', 'antesDespues'));
  expect(encajaLadrones(copia(m.cartas[0]!), copia(m.sobre!))).toBe(true);
});

test('Canfield: la fundación sigue con vuelta y la K va sobre el As', () => {
  const f = v.ejemplo('canfield', 'fundacion', 'cartas').cartas.map((c) => c.id);
  const valores = f.map((id) => Number(id.split('-')[1]));
  for (let i = 1; i < valores.length; i++) {
    if (valores[i - 1]! + 1 === valores[i] || valores[i - 1] === 13) {
      expect(siguienteValorCanfield(valores[i - 1]!)).toBe(valores[i]);
    }
  }
  expect(siguienteValorCanfield(13)).toBe(1);
  const m = movimiento(v.ejemplo('canfield', 'vuelta', 'antesDespues'));
  expect(encajaCanfield(m.cartas[0]!, m.sobre!)).toBe(true);
});

test('Yukon: la carta que se mueve encaja', () => {
  const m = movimiento(v.ejemplo('yukon', 'mover', 'antesDespues'));
  expect(encajaYukon(m.cartas[0]!, m.sobre!, 'colores')).toBe(true);
});

test('TriPeaks: cada carta de la racha encaja sobre la anterior y suma su puesto', () => {
  const e = v.ejemplo('tripeaks', 'racha', 'cartas');
  const ids = e.cartas.map((c) => c.id);
  for (let i = 1; i < ids.length; i++) {
    expect(encajaGolf(ids[i]!, ids[i - 1]!, true)).toBe(true);
    expect(e.cartas[i]!.etiqueta).toBe(`+${i}`);
  }
  expect(e.resultado).toBe(`= ${((ids.length - 1) * ids.length) / 2}`);
});

test('Golf: el movimiento es legal', () => {
  const e = v.ejemplo('golf', 'mover', 'antesDespues');
  const m = movimiento(e);
  expect(encajaGolf(m.cartas[0]!, m.sobre!, false)).toBe(true);
  expect(valorGolf(m.sobre!)).toBe(7);
});

test('Pirámide: las parejas suman 13 y la K va sola', () => {
  for (const fila of v.ejemplo('piramide', 'parejas', 'jugadas').filas) {
    expect(fila.cartas.reduce((s, c) => s + valorPiramide(c), 0)).toBe(13);
  }
});

test('todos los ejemplos de los solitarios están comprobados', () => {
  expect(v.sinComprobar()).toEqual([]);
});
