import {
  cartaGanadora,
  fuerza,
  ganadoraBourre,
  ganadoraBridge,
  ganadoraBriscolaChiamata,
  ganadoraCuatrola,
  ganadoraEuchre,
  ganadoraOhHell,
  ganadoraPicas,
  ganadoraPreference,
  ganadoraTarot,
  ganadoraTresillo,
  ganadoraTwentyNine,
  ganadoraWhist,
  mediosTarot,
  puntosDe,
  puntosPocha,
  puntosTwentyNine,
  puntuarManoBridge,
  puntuarManoPicas,
  rangoCuatrola,
  rangoEuchre,
  rangoFiveHundred,
  rangoTresillo,
  rangoTwentyNine,
  valorContratoPreference,
  valorPujaFiveHundred,
  type IdCarta,
  type PaloEspanol,
  type PaloFrances,
  type PujaFiveHundred,
  type PujaPreference,
} from '@juegos/engine';
import { expect, test } from 'vitest';
import type { IdJuego } from '../../sesion/juegos';
import { T } from '../../textos';
import type { EjemploBaza, EjemploCartas } from '../tipos';
import { BAZAS_CONTRATO } from './bazas-contrato';
import { mesaDe, triunfoDe, verificador } from './comprobar';

const v = verificador(BAZAS_CONTRATO);

function descendente(cartas: readonly IdCarta[], rango: (c: IdCarta) => number) {
  for (let i = 1; i < cartas.length; i++) {
    expect(rango(cartas[i - 1]!), `${cartas[i - 1]} > ${cartas[i]}`).toBeGreaterThan(
      rango(cartas[i]!),
    );
  }
}

function gana(juego: IdJuego, ganadora: (e: EjemploBaza) => number) {
  const e = v.ejemplo(juego, 'baza', 'baza');
  expect(ganadora(e), e.descripcion).toBe(e.gana);
}

const ids = (e: EjemploCartas) => e.cartas.map((c) => c.id);
const palo = (e: EjemploBaza) => triunfoDe(e) as PaloFrances;

test('las bazas las gana la carta que dice el ejemplo', () => {
  gana('bridge', (e) => ganadoraBridge(mesaDe(e), null).asiento);
  gana('whist', (e) => ganadoraWhist(mesaDe(e), palo(e)).asiento);
  gana('picas', (e) => ganadoraPicas(mesaDe(e)).asiento);
  gana('ohHell', (e) => ganadoraOhHell(mesaDe(e), palo(e)).asiento);
  gana('pocha', (e) => cartaGanadora(mesaDe(e), triunfoDe(e) as PaloEspanol).asiento);
  gana('tresillo', (e) => ganadoraTresillo(mesaDe(e), triunfoDe(e) as PaloEspanol).asiento);
  gana('twentyNine', (e) => ganadoraTwentyNine(mesaDe(e), palo(e)).asiento);
  gana(
    'briscolaChiamata',
    (e) => ganadoraBriscolaChiamata(mesaDe(e), triunfoDe(e) as PaloEspanol).asiento,
  );
  gana('preference', (e) => ganadoraPreference(mesaDe(e), palo(e)).asiento);
  gana('tuteSubastado', (e) => cartaGanadora(mesaDe(e), triunfoDe(e) as PaloEspanol).asiento);
  gana('cuatrola', (e) => ganadoraCuatrola(mesaDe(e), triunfoDe(e) as PaloEspanol).asiento);
  gana('julepe', (e) => cartaGanadora(mesaDe(e), triunfoDe(e) as PaloEspanol).asiento);
  gana('euchre', (e) => ganadoraEuchre(mesaDe(e), palo(e)).asiento);
  gana('bourre', (e) => ganadoraBourre(mesaDe(e), palo(e)).asiento);
  gana('tarot', (e) => ganadoraTarot(mesaDe(e)).asiento);
});

test('Bridge: los puntos de la tabla', () => {
  const casos = [
    [{ nivel: 4, denominacion: 'corazones', doblado: 0 }, 10, false, 'declarante'],
    [{ nivel: 3, denominacion: 'sinTriunfo', doblado: 0 }, 9, true, 'declarante'],
    [{ nivel: 2, denominacion: 'treboles', doblado: 0 }, 9, false, 'declarante'],
    [{ nivel: 4, denominacion: 'picas', doblado: 0 }, 8, false, 'defensa'],
  ] as const;
  const filas = v.ejemplo('bridge', 'puntos', 'tabla').filas;
  casos.forEach(([contrato, bazas, vulnerable, quien], i) => {
    const puntos = puntuarManoBridge(contrato, bazas, vulnerable)[quien];
    expect(filas[i]![1], filas[i]![0]).toMatch(new RegExp(`(^|= )${puntos}\\b`));
  });
});

test('Picas: los puntos de un contrato de 5', () => {
  // Tu pareja (asientos 0 y 2) apuesta 3 + 2; la otra, 4 + 4.
  const casos = [
    [3, 4, 2, 4],
    [4, 3, 3, 3],
    [2, 5, 2, 4],
  ];
  const filas = v.ejemplo('picas', 'puntos', 'tabla').filas;
  casos.forEach((bazas, i) => {
    const { puntosMano } = puntuarManoPicas([3, 4, 2, 4], bazas, [0, 0]);
    expect(filas[i]![1].replace('−', '-')).toBe(`${puntosMano[0] > 0 ? '+' : ''}${puntosMano[0]}`);
  });
});

test('Pocha: la tabla de puntos', () => {
  for (const [situacion, puntos] of v.ejemplo('pocha', 'puntosPocha', 'tabla').filas) {
    const [apuesta, bazas] = situacion.split(' / ').map(Number);
    expect(puntos, situacion).toBe(T.pocha.puntos(puntosPocha(apuesta!, bazas!)));
  }
});

test('500: los triunfos y el valor de las pujas', () => {
  descendente(ids(v.ejemplo('fiveHundred', 'triunfos', 'cartas')), (c) =>
    rangoFiveHundred(c, 'corazones'),
  );
  const pujas: PujaFiveHundred[] = [
    { tipo: 'bazas', bazas: 6, palo: 'picas' },
    { tipo: 'bazas', bazas: 7, palo: 'corazones' },
    { tipo: 'bazas', bazas: 8, palo: 'sin' },
    { tipo: 'misere' },
    { tipo: 'bazas', bazas: 10, palo: 'sin' },
  ];
  const filas = v.ejemplo('fiveHundred', 'pujas', 'tabla').filas;
  pujas.forEach((p, i) => expect(filas[i]![1], filas[i]![0]).toBe(String(valorPujaFiveHundred(p))));
});

test('Tresillo y Cuatrola: los matadores van de mayor a menor', () => {
  const tresillo = ids(v.ejemplo('tresillo', 'matadores', 'cartas'));
  descendente(tresillo.slice(0, 3), (c) => rangoTresillo(c, 'oros'));
  descendente(ids(v.ejemplo('cuatrola', 'matadores', 'cartas')), (c) => rangoCuatrola(c, 'oros'));
  expect(rangoCuatrola('oros-1', 'oros')).toBeGreaterThan(rangoCuatrola('oros-12', 'oros'));
});

test('Twenty-Nine: el orden y los puntos', () => {
  const e = v.ejemplo('twentyNine', 'orden', 'cartas');
  for (const { id, etiqueta } of e.cartas)
    expect(etiqueta, id).toBe(T.ayuda.puntos(puntosTwentyNine(id)));
  descendente(ids(e), rangoTwentyNine);
});

test.each([
  ['briscolaChiamata', 'valores'],
  ['tuteSubastado', 'valores'],
] as [IdJuego, string][])('%s: los valores son los de la Brisca', (juego, clave) => {
  const e = v.ejemplo(juego, clave, 'cartas');
  for (const { id, etiqueta } of e.cartas) expect(etiqueta, id).toBe(T.ayuda.puntos(puntosDe(id)));
  descendente(ids(e), (c) => fuerza(c));
});

test('Tute subastado: el cante es de Rey y Caballo del mismo palo', () => {
  const [a, b] = ids(v.ejemplo('tuteSubastado', 'cante', 'cartas'));
  expect(a!.split('-')[0]).toBe(b!.split('-')[0]);
  expect([a!.split('-')[1], b!.split('-')[1]]).toEqual(['12', '11']);
});

test('Preference: el valor de los contratos', () => {
  const contratos: PujaPreference[] = [6, 7, 8, 9, 10].map((bazas) => ({
    tipo: 'bazas',
    bazas,
    palo: 'picas',
  }));
  contratos.push({ tipo: 'miseria' });
  const filas = v.ejemplo('preference', 'contratos', 'tabla').filas;
  contratos.forEach((c, i) =>
    expect(filas[i]![1], filas[i]![0]).toBe(String(valorContratoPreference(c))),
  );
});

test('Euchre: las jotas', () => {
  descendente(ids(v.ejemplo('euchre', 'jotas', 'cartas')), (c) => rangoEuchre(c, 'corazones'));
});

test('Tarot: los puntos de las cartas', () => {
  for (const { id, etiqueta } of v.ejemplo('tarot', 'puntos', 'cartas').cartas) {
    expect(etiqueta, id).toBe(String(mediosTarot(id) / 2).replace('.', ','));
  }
});

test('todos los ejemplos de las bazas con contrato están comprobados', () => {
  expect(v.sinComprobar()).toEqual([]);
});
