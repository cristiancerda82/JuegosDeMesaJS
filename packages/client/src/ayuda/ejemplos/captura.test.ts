import {
  capturasCuarenta,
  capturasScopa,
  encajaBarbu,
  encajaRentz,
  escaleraCuarenta,
  FILAS_VACIAS,
  FILAS_VACIAS_RENTZ,
  ganadoraBarbu,
  ganadoraCorazones,
  ganadoraRentz,
  puntosCorazones,
  rangoBarbu,
  rangoRentz,
  valorCasino,
  valorEscoba,
  valorPesca,
  type IdCarta,
  type PaloFrances,
} from '@juegos/engine';
import { expect, test } from 'vitest';
import { T } from '../../textos';
import type { EjemploAntesDespues } from '../tipos';
import { BAZAS_EVITAR } from './bazas-evitar';
import { CAPTURA } from './captura';
import { mesaDe, verificador } from './comprobar';

const evitar = verificador(BAZAS_EVITAR);
const captura = verificador(CAPTURA);

/** Las cartas de una zona por su nombre. */
const zona = (estado: EjemploAntesDespues['antes'], nombre: string) =>
  estado.find((z) => z.nombre === nombre)!.cartas.filter((c): c is IdCarta => c !== null);

test('Corazones: lo que vale cada carta y la baza', () => {
  for (const { id, etiqueta } of evitar.ejemplo('corazones', 'puntosCorazones', 'cartas').cartas) {
    expect(etiqueta, id).toBe(T.ayuda.puntos(puntosCorazones(id)));
  }
  const b = evitar.ejemplo('corazones', 'baza', 'baza');
  expect(ganadoraCorazones(mesaDe(b)).asiento).toBe(b.gana);
  expect(b.jugadas.reduce((s, j) => s + puntosCorazones(j.id), 0)).toBe(13);
});

test('Barbu y Rentz: las bazas sin triunfo', () => {
  const barbu = evitar.ejemplo('barbu', 'baza', 'baza');
  expect(ganadoraBarbu(mesaDe(barbu), null).asiento).toBe(barbu.gana);
  expect(barbu.jugadas.filter((j) => j.id.endsWith('-12'))).toHaveLength(2);
  const rentz = evitar.ejemplo('rentz', 'baza', 'baza');
  expect(ganadoraRentz(mesaDe(rentz)).asiento).toBe(rentz.gana);
  expect(rentz.jugadas.map((j) => j.id)).toContain('corazones-13');
});

test.each([
  ['barbu', encajaBarbu, rangoBarbu, FILAS_VACIAS],
  ['rentz', encajaRentz, rangoRentz, FILAS_VACIAS_RENTZ],
] as const)('%s: la carta del dominó encaja en su fila', (juego, encaja, rango, vacias) => {
  const e = evitar.ejemplo(juego, 'domino', 'antesDespues');
  const fila = e.antes[0]!.cartas.filter((c): c is IdCarta => c !== null);
  const palo = fila[0]!.split('-')[0] as PaloFrances;
  const rangos = fila.map(rango);
  const filas = { ...vacias, [palo]: { bajo: Math.min(...rangos), alto: Math.max(...rangos) } };
  expect(encaja(filas, e.resaltadas[0]!)).toBe(true);
  // Las demás cartas de la mano no encajan.
  for (const c of zona(e.despues, 'Tu mano')) expect(encaja(filas, c), c).toBe(false);
});

test('Escoba: los valores y las capturas que suman 15', () => {
  for (const { id, etiqueta } of captura.ejemplo('escoba', 'sumas', 'cartas').cartas) {
    expect(etiqueta, id).toBe(String(valorEscoba(id)));
  }
  for (const clave of ['captura', 'escoba']) {
    const e = captura.ejemplo('escoba', clave, 'antesDespues');
    expect(e.resaltadas.reduce((s, c) => s + valorEscoba(c), 0)).toBe(15);
    expect(zona(e.despues, 'Tus cartas')).toEqual(e.resaltadas);
  }
  expect(zona(captura.ejemplo('escoba', 'escoba', 'antesDespues').despues, 'Mesa')).toEqual([]);
});

test('Scopa: con una carta igual en la mesa, solo vale llevarse esa', () => {
  const e = captura.ejemplo('scopa', 'captura', 'antesDespues');
  const [carta] = zona(e.antes, 'Tu carta');
  expect(capturasScopa(zona(e.antes, 'Mesa'), carta!)).toEqual([e.resaltadas.slice(1)]);
});

test('Casino: la captura suma el valor de la carta jugada', () => {
  const e = captura.ejemplo('casino', 'captura', 'antesDespues');
  const [carta, ...recogidas] = e.resaltadas;
  expect(recogidas.reduce((s, c) => s + valorCasino(c)!, 0)).toBe(valorCasino(carta!));
});

test('Cuarenta: la captura por número y la escalera', () => {
  const e = captura.ejemplo('cuarenta', 'captura', 'antesDespues');
  const mesa = zona(e.antes, 'Mesa');
  const [carta] = zona(e.antes, 'Tu carta');
  const [igual, ...escalera] = e.resaltadas;
  expect(capturasCuarenta(mesa, carta!)).toContainEqual([igual]);
  expect(
    escaleraCuarenta(
      mesa.filter((c) => c !== igual),
      carta!,
    ),
  ).toEqual(escalera);
});

test('Pishti: una carta sola llevada con otra del mismo número', () => {
  const e = captura.ejemplo('pishti', 'pishti', 'antesDespues');
  expect(zona(e.antes, 'Montón')).toHaveLength(1);
  const [a, b] = e.resaltadas;
  expect(a!.split('-')[1]).toBe(b!.split('-')[1]);
});

test('Pesca: el cuarteto es de cuatro cartas del mismo valor', () => {
  const cuarteto = zona(captura.ejemplo('pesca', 'pedir', 'antesDespues').despues, 'Tu cuarteto');
  expect(cuarteto).toHaveLength(4);
  expect(new Set(cuarteto.map(valorPesca)).size).toBe(1);
});

test('todos los ejemplos de las bazas para evitar y de captura están comprobados', () => {
  expect(evitar.sinComprobar()).toEqual([]);
  expect(captura.sinComprobar()).toEqual([]);
});
