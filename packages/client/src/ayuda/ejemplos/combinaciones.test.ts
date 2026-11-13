import {
  bajadasConquian,
  bajadasPosibles,
  bajadasRemigio,
  basePinacle,
  baseRemigio,
  combinacionRummy,
  combinacionValida,
  combinacionValidaHandAndFoot,
  esComodinCanasta,
  esCombinacionConquian,
  mejorReparto,
  mejorRepartoGin,
  puntosCarta,
  puntosCartaPinacle,
  puntosJugada,
  puntosRecuento,
  valorCanasta,
  valorCribbage,
  type CartaPinacle,
  type IdCarta,
} from '@juegos/engine';
import { expect, test } from 'vitest';
import { T } from '../../textos';
import type { EjemploAntesDespues } from '../tipos';
import { COMBINACIONES } from './combinaciones';
import { verificador } from './comprobar';

const v = verificador(COMBINACIONES);

/** Las cartas de una zona por su nombre. */
const zona = (estado: EjemploAntesDespues['antes'], nombre: string) =>
  estado.find((z) => z.nombre === nombre)!.cartas.filter((c): c is IdCarta => c !== null);

/** Las cartas con el número de copia de los juegos con varias barajas (las repetidas, #1, #2…). */
function copias(cartas: readonly IdCarta[]): CartaPinacle[] {
  const vistas = new Map<IdCarta, number>();
  return cartas.map((c) => {
    const n = vistas.get(c) ?? 0;
    vistas.set(c, n + 1);
    return `${c}#${n}` as CartaPinacle;
  });
}

const noVale = (nombre: string) => nombre.startsWith('No vale');
const mismas = (a: readonly string[], b: readonly string[]) =>
  expect([...a].sort()).toEqual([...b].sort());

test('Chinchón: las combinaciones, la mano para cerrar y los puntos', () => {
  for (const f of v.ejemplo('chinchon', 'combinaciones', 'jugadas').filas) {
    const r = mejorReparto(f.cartas, 'espanola40');
    expect(r.sueltas, f.nombre).toEqual([]);
    expect(r.combinaciones, f.nombre).toHaveLength(1);
  }
  const cerrar = v.ejemplo('chinchon', 'cerrar', 'jugadas').filas;
  const r = mejorReparto(
    cerrar.flatMap((f) => f.cartas),
    'espanola40',
  );
  expect(r.sueltas).toEqual(cerrar.at(-1)!.cartas);
  expect(r.puntos).toBeLessThanOrEqual(3);
  for (const { id, etiqueta } of v.ejemplo('chinchon', 'puntos', 'cartas').cartas) {
    expect(etiqueta, id).toBe(T.ayuda.puntos(puntosCarta(id)));
  }
});

test('Remigio: las combinaciones válidas se pueden bajar y la que no vale, no', () => {
  for (const f of v.ejemplo('remigio', 'combinaciones', 'jugadas').filas) {
    const mano = copias(f.cartas);
    const vale = bajadasRemigio(mano).some((b) => {
      const cartas = b.tipo === 'grupo' ? b.cartas : b.puestos;
      return [...cartas].map(baseRemigio).sort().join() === [...f.cartas].sort().join();
    });
    expect(vale, f.nombre).toBe(!noVale(f.nombre));
  }
});

test('Gin Rummy: las combinaciones y la mano para cerrar', () => {
  for (const f of v.ejemplo('ginRummy', 'combinaciones', 'jugadas').filas) {
    expect(mejorRepartoGin(f.cartas).sueltas.length === 0, f.nombre).toBe(!noVale(f.nombre));
  }
  const filas = v.ejemplo('ginRummy', 'cerrar', 'jugadas').filas;
  const r = mejorRepartoGin(filas.flatMap((f) => f.cartas));
  expect(filas.flatMap((f) => f.cartas)).toHaveLength(10);
  mismas(r.sueltas, filas.at(-1)!.cartas);
  expect(r.puntos).toBe(5);
});

test('Rummy 500: las escaleras con el As y el robo del descarte', () => {
  for (const f of v.ejemplo('rummy500', 'combinaciones', 'jugadas').filas) {
    expect(combinacionRummy(f.cartas) !== null, f.nombre).toBe(!noVale(f.nombre));
  }
  const e = v.ejemplo('rummy500', 'descarte', 'antesDespues');
  const bajada = zona(e.despues, 'Tu bajada');
  expect(combinacionRummy(bajada)).not.toBeNull();
  // La carta elegida es la de más abajo de las que se coge, y va a la mesa.
  const descarte = zona(e.antes, 'Descarte');
  expect(descarte.slice(descarte.indexOf(e.resaltadas[0]!))).toEqual(e.resaltadas);
  expect(bajada).toContain(e.resaltadas[0]);
});

test('Canasta: las combinaciones y el pozo', () => {
  for (const f of v.ejemplo('canasta', 'combinaciones', 'jugadas').filas) {
    const cartas = copias(f.cartas);
    const naturales = cartas.filter((c) => !esComodinCanasta(c));
    const valor = valorCanasta(naturales[0]!);
    expect(combinacionValida(valor, cartas), f.nombre).toBe(!noVale(f.nombre));
    if (f.nombre.startsWith('Canasta limpia')) expect(naturales).toHaveLength(7);
    if (f.nombre.startsWith('Canasta sucia')) {
      expect(cartas).toHaveLength(7);
      expect(naturales.length).toBeLessThan(7);
    }
  }
  const e = v.ejemplo('canasta', 'pozo', 'antesDespues');
  const comb = copias(zona(e.despues, 'Tu combinación'));
  expect(combinacionValida(valorCanasta(comb[0]!), comb)).toBe(true);
  expect(zona(e.antes, 'Pozo').at(-1)).toBe(e.resaltadas[0]);
});

test('Hand and Foot: los libros y el robo del descarte', () => {
  for (const f of v.ejemplo('handAndFoot', 'libros', 'jugadas').filas) {
    const cartas = copias(f.cartas);
    const naturales = cartas.filter((c) => !esComodinCanasta(c));
    const valor = naturales.length === 0 ? 0 : valorCanasta(naturales[0]!);
    expect(combinacionValidaHandAndFoot(valor, cartas), f.nombre).toBe(!noVale(f.nombre));
    if (!noVale(f.nombre)) expect(cartas, f.nombre).toHaveLength(7);
    if (f.nombre.startsWith('Libro limpio')) expect(naturales).toHaveLength(7);
    if (f.nombre.startsWith('Libro sucio')) expect(naturales.length).toBeLessThan(7);
    if (f.nombre.startsWith('Libro de comodines')) expect(naturales).toHaveLength(0);
  }
  const e = v.ejemplo('handAndFoot', 'descarte', 'antesDespues');
  const comb = copias(zona(e.despues, 'Tu combinación'));
  expect(combinacionValidaHandAndFoot(valorCanasta(comb[0]!), comb)).toBe(true);
  // La de arriba y las 6 siguientes.
  const descarte = zona(e.antes, 'Descarte');
  expect(e.resaltadas).toEqual([descarte.at(-1), ...descarte.slice(-7, -1)]);
});

test('Conquián: las combinaciones y la carta descubierta', () => {
  for (const f of v.ejemplo('conquian', 'combinaciones', 'jugadas').filas) {
    expect(esCombinacionConquian(f.cartas), f.nombre).toBe(!noVale(f.nombre));
  }
  const e = v.ejemplo('conquian', 'descubierta', 'antesDespues');
  const [d] = zona(e.antes, 'Descubierta');
  const deLaMano = zona(e.despues, 'Tu bajada').filter((c) => c !== d);
  expect(bajadasConquian(zona(e.antes, 'Tu mano'), d!).map((b) => b.join())).toContain(
    deLaMano.join(),
  );
});

test('Pinacle: los valores y las combinaciones', () => {
  for (const { id, etiqueta } of v.ejemplo('pinacle', 'valores', 'cartas').cartas) {
    expect(etiqueta, id).toBe(T.ayuda.puntos(puntosCartaPinacle(`${id}#0`)));
  }
  for (const f of v.ejemplo('pinacle', 'combinaciones', 'jugadas').filas) {
    const vale = bajadasPosibles(copias(f.cartas)).some((b) => {
      const cartas = (b.tipo === 'grupo' ? b.cartas : b.puestos).map(basePinacle);
      // En una escalera, cada carta en su puesto.
      return b.tipo === 'grupo'
        ? [...cartas].sort().join() === [...f.cartas].sort().join()
        : cartas.join() === f.cartas.join();
    });
    expect(vale, f.nombre).toBe(!noVale(f.nombre));
  }
});

test('Cribbage: los puntos al jugar y el recuento', () => {
  const jugar = v.ejemplo('cribbage', 'jugar', 'cartas');
  const secuencia = jugar.cartas.map((c) => c.id);
  let cuenta = 0;
  jugar.cartas.forEach(({ id, etiqueta }) => {
    cuenta += valorCribbage(id);
    expect(etiqueta).toBe(String(cuenta));
  });
  const puntos = puntosJugada(secuencia, cuenta).reduce((s, p) => s + p.puntos, 0);
  expect(jugar.resultado).toBe(`+${puntos}`);
  const recuento = v.ejemplo('cribbage', 'recuento', 'cartas');
  const cartas = recuento.cartas.map((c) => c.id);
  const d = puntosRecuento(cartas.slice(0, 4), cartas[4]!, false);
  expect(recuento.resultado).toBe(`= ${d.total}`);
  expect(d).toMatchObject({ quinces: 8, parejas: 2, escaleras: 0, color: 0, nobs: 1 });
});

test('todos los ejemplos de las combinaciones están comprobados', () => {
  expect(v.sinComprobar()).toEqual([]);
});
