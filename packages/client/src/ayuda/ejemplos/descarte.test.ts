import {
  casaOchoLoco,
  encajaEnMesa,
  encajaKings,
  encajaSevens,
  esBlackjack,
  esReyKings,
  esSieteYMediaNatural,
  ganaDurak,
  jugadaBigTwo,
  mejorManoPoker,
  NOMBRES_MANO_POKER,
  pares,
  posicionCinquillo,
  puedeIr,
  puntosCartaBlackjack,
  puntosEnvit,
  puntosJuego,
  puntosOchoLoco,
  rango,
  rangoCulo,
  rangoTruc,
  sonCuatroIguales,
  superaCulo,
  valorBigTwo,
  valorBlackjack,
  valorCarta,
  valorManoTreinta,
  valorMentiroso,
  valorSevens,
  type IdCarta,
  type MesaCinquillo,
  type MesaSevens,
  type PaloEspanol,
  type PaloFrances,
} from '@juegos/engine';
import { expect, test } from 'vitest';
import { T } from '../../textos';
import type { EjemploAntesDespues } from '../tipos';
import { triunfoDe, verificador } from './comprobar';
import { DESCARTE } from './descarte';
import { ENVITE } from './envite';

const descarte = verificador(DESCARTE);
const envite = verificador(ENVITE);

/** Las cartas de una zona por su nombre. */
const zona = (estado: EjemploAntesDespues['antes'], nombre: string) =>
  estado.find((z) => z.nombre === nombre)!.cartas.filter((c): c is IdCarta => c !== null);

const creciente = (xs: readonly number[]) => xs.every((x, i) => i === 0 || x > xs[i - 1]!);
const palo = (c: IdCarta) => c.split('-')[0]!;

// ── Descarte ─────────────────────────────────────────────────────────────────

test('Ocho loco: qué casa con la carta de arriba y lo que vale cada carta', () => {
  const [arriba, ...resto] = descarte.ejemplo('ochoLoco', 'jugar', 'cartas').cartas;
  for (const { id, etiqueta } of resto) {
    const casa = casaOchoLoco(id, palo(arriba!.id) as PaloFrances, arriba!.id);
    expect(etiqueta, id).toBe(casa ? 'Vale' : 'No vale');
  }
  for (const { id, etiqueta } of descarte.ejemplo('ochoLoco', 'puntos', 'cartas').cartas) {
    expect(etiqueta, id).toBe(T.ayuda.puntos(puntosOchoLoco(id)));
  }
});

test('Culo: el orden de las cartas y una jugada que supera la mesa', () => {
  const orden = descarte.ejemplo('culo', 'orden', 'cartas').cartas.map((c) => rangoCulo(c.id));
  expect(creciente(orden)).toBe(true);
  const e = descarte.ejemplo('culo', 'ronda', 'antesDespues');
  expect(superaCulo(e.resaltadas, zona(e.antes, 'Mesa'))).toBe(true);
  for (const c of zona(e.despues, 'Tu mano'))
    expect(superaCulo([c], zona(e.antes, 'Mesa'))).toBe(false);
});

test('Big Two: el orden de las cartas y las jugadas de 5', () => {
  const orden = descarte.ejemplo('bigTwo', 'orden', 'cartas').cartas.map((c) => valorBigTwo(c.id));
  expect(creciente(orden)).toBe(true);
  const tipos: Record<string, string> = {
    'Escalera de color': 'escaleraColor',
    Póker: 'poker',
    Full: 'full',
    Color: 'color',
    Escalera: 'escalera',
  };
  const filas = descarte.ejemplo('bigTwo', 'jugadas', 'jugadas').filas;
  const jugadas = filas.map((f) => jugadaBigTwo(f.cartas)!);
  filas.forEach((f, i) => expect(jugadas[i]?.tipo, f.nombre).toBe(tipos[f.nombre]));
  expect(creciente(jugadas.map((j) => j.fuerza).reverse())).toBe(true);
});

test('Durak: las defensas ganan el ataque', () => {
  for (const clave of ['defensa', 'triunfo']) {
    const b = descarte.ejemplo('durak', clave, 'baza');
    const [ataque, defensa] = b.jugadas.map((j) => j.id);
    expect(b.gana).toBe(1);
    expect(ganaDurak(defensa!, ataque!, triunfoDe(b) as PaloFrances), clave).toBe(true);
  }
});

test('Cinquillo y Sevens: la carta encaja en la escalera y las demás no', () => {
  const cinquillo = descarte.ejemplo('cinquillo', 'escalera', 'antesDespues');
  const copas = zona(cinquillo.antes, 'Copas').map(posicionCinquillo);
  const mesaC: MesaCinquillo = {
    oros: null,
    copas: { bajo: Math.min(...copas), alto: Math.max(...copas) },
    espadas: null,
    bastos: null,
  };
  expect(encajaEnMesa(mesaC, cinquillo.resaltadas[0]!)).toBe(true);
  for (const c of zona(cinquillo.despues, 'Tu mano')) expect(encajaEnMesa(mesaC, c), c).toBe(false);
  expect(palo(cinquillo.resaltadas[0]!) as PaloEspanol).toBe('copas');

  const sevens = descarte.ejemplo('sevens', 'escalera', 'antesDespues');
  const corazones = zona(sevens.antes, 'Corazones').map(valorSevens);
  const mesaS: MesaSevens = {
    picas: null,
    corazones: { bajo: Math.min(...corazones), alto: Math.max(...corazones) },
    diamantes: null,
    treboles: null,
  };
  expect(encajaSevens(mesaS, sevens.resaltadas[0]!)).toBe(true);
  for (const c of zona(sevens.despues, 'Tu mano')) expect(encajaSevens(mesaS, c), c).toBe(false);
});

test('Mentiroso: las cartas que no son del valor dicho son mentira', () => {
  for (const { id, etiqueta } of descarte.ejemplo('mentiroso', 'bajar', 'cartas').cartas) {
    expect(etiqueta, id).toBe(valorMentiroso(id) === 13 ? 'Rey' : 'Mentira');
  }
});

test('Burro: después de pasar, cuatro cartas iguales', () => {
  const e = descarte.ejemplo('burro', 'pasar', 'antesDespues');
  expect(sonCuatroIguales(zona(e.antes, 'Tu mano'))).toBe(false);
  expect(sonCuatroIguales(zona(e.despues, 'Tu mano'))).toBe(true);
});

test('Kings Corner: la carta encaja en la pila y la K abre la esquina', () => {
  const e = descarte.ejemplo('kingsCorner', 'pilas', 'antesDespues');
  const arriba = zona(e.antes, 'Pila').at(-1)!;
  const [carta, rey] = e.resaltadas;
  expect(encajaKings(carta!, arriba)).toBe(true);
  expect(esReyKings(rey!)).toBe(true);
  for (const c of zona(e.despues, 'Tu mano')) expect(encajaKings(c, arriba), c).toBe(false);
});

test('Spite & Malice: la K y la carta del montón siguen la escalera', () => {
  const e = descarte.ejemplo('spiteMalice', 'escaleras', 'antesDespues');
  const escalera = [...zona(e.antes, 'Escalera')];
  for (const c of e.resaltadas) {
    expect(puedeIr(c, escalera), c).toBe(true);
    escalera.push(c);
  }
  expect(escalera).toEqual(zona(e.despues, 'Escalera'));
});

test('todos los ejemplos de descarte están comprobados', () => {
  expect(descarte.sinComprobar()).toEqual([]);
});

// ── Envite ───────────────────────────────────────────────────────────────────

test('Mus: los ocho reyes y las jugadas', () => {
  const reyes = envite.ejemplo('mus', 'ochoReyes', 'cartas').cartas;
  for (const { id, etiqueta } of reyes)
    expect(rango(id), id).toBe(rango(etiqueta === 'Rey' ? 'oros-12' : 'oros-1'));
  const [juego, ...resto] = envite.ejemplo('mus', 'jugadas', 'jugadas').filas;
  expect(puntosJuego(juego!.cartas)).toBe(31);
  const tipos = ['duples', 'medias', 'pareja'];
  resto.forEach((f, i) => {
    expect(pares(f.cartas)?.tipo, f.nombre).toBe(tipos[i]);
    expect(f.nombre.toLowerCase()).toBe(tipos[i]);
  });
});

test('Truco y Truc: la jerarquía y los puntos de envido', () => {
  for (const juego of ['truco', 'truc'] as const) {
    const cartas = envite.ejemplo(juego, 'jerarquia', 'cartas').cartas;
    expect(creciente(cartas.map((c) => rangoTruc(c.id)).reverse()), juego).toBe(true);
    cartas.forEach((c, i) => expect(c.etiqueta).toBe(`${i + 1}.ª`));
  }
  for (const [juego, clave] of [
    ['truco', 'envido'],
    ['truc', 'envit'],
  ] as const) {
    const e = envite.ejemplo(juego, clave, 'cartas');
    expect(e.resultado).toBe(`= ${puntosEnvit(e.cartas.map((c) => c.id))}`);
  }
});

test("Texas Hold'em: las nueve manos, cada una la que dice y de mayor a menor", () => {
  const filas = envite.ejemplo('holdem', 'manos', 'jugadas').filas;
  const manos = filas.map((f) => mejorManoPoker(f.cartas));
  filas.forEach((f, i) => expect(NOMBRES_MANO_POKER[manos[i]!.categoria]).toBe(f.nombre));
  expect(creciente(manos.map((m) => m.valor).reverse())).toBe(true);
  expect(filas).toHaveLength(9);
});

test('Blackjack: los valores, el blackjack y el As que vale 1', () => {
  for (const { id, etiqueta } of envite.ejemplo('blackjack', 'valores', 'cartas').cartas) {
    if (id.endsWith('-1')) expect(etiqueta).toBe('11 o 1');
    else expect(etiqueta, id).toBe(String(puntosCartaBlackjack(id)));
  }
  const bj = envite.ejemplo('blackjack', 'blackjack', 'cartas').cartas.map((c) => c.id);
  expect(esBlackjack(bj)).toBe(true);
  const blanda = envite.ejemplo('blackjack', 'blanda', 'cartas');
  expect(blanda.resultado).toBe(`= ${valorBlackjack(blanda.cartas.map((c) => c.id)).total}`);
});

test('Siete y media: los valores y la siete y media natural', () => {
  for (const { id, etiqueta } of envite.ejemplo('sieteYMedia', 'valores', 'cartas').cartas) {
    expect(etiqueta, id).toBe(T.sieteYMedia.valor(valorCarta(id)));
  }
  const natural = envite.ejemplo('sieteYMedia', 'natural', 'cartas').cartas.map((c) => c.id);
  expect(esSieteYMediaNatural(natural)).toBe(true);
});

test('Treinta y uno: el valor de cada mano', () => {
  for (const f of envite.ejemplo('treintaYUno', 'manos', 'jugadas').filas) {
    expect(String(valorManoTreinta(f.cartas)).replace('.', ','), f.nombre).toBe(f.nombre);
  }
});

test('todos los ejemplos de envite están comprobados', () => {
  expect(envite.sinComprobar()).toEqual([]);
});
