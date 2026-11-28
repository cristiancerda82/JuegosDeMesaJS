import {
  burroBazas,
  cartasLegalesRams,
  ganadoraRams,
  rams,
  cuatroSeises,
  encajaCuatroSeises,
  posicionCuatroSeises,
  casaOchoLoco,
  CONFIG_BURRO_BAZAS_POR_DEFECTO,
  ganadoraBurroBazas,
  descartePokerCinco,
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
  treintaYUno,
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

test('Cuatro seises: la escalera con la baraja de 48 y la cuenta del fondo', () => {
  const e = descarte.ejemplo('cuatroSeises', 'escalera', 'antesDespues');
  const oros = zona(e.antes, 'Oros').map((c) => posicionCuatroSeises(c, 48));
  const mesa: MesaCinquillo = {
    oros: { bajo: Math.min(...oros), alto: Math.max(...oros) },
    copas: null,
    espadas: null,
    bastos: null,
  };
  expect(encajaCuatroSeises(mesa, e.resaltadas[0]!, 48)).toBe(true);
  for (const c of zona(e.despues, 'Tu mano'))
    expect(encajaCuatroSeises(mesa, c, 48), c).toBe(false);

  // El motor cierra una mano de 4 en la que el asiento 0 pone su última carta con esos pases.
  const t = descarte.ejemplo('cuatroSeises', 'fondo', 'tabla');
  const pases = t.filas.map(([quien]) => Number(/(\d+) pases/.exec(quien)?.[1] ?? 0));
  const r = cuatroSeises.crear({ baraja: 40, jugadores: 4, manos: 3 }, 'guia');
  if (!r.ok) throw new Error(r.error);
  const fondo = 4 + pases.reduce((s, p) => s + p, 0);
  const final = cuatroSeises.transicion(
    {
      ...r.valor,
      manos: [['oros-6'], ['copas-1'], ['copas-2'], ['copas-3']],
      turno: 0,
      pases,
      fondo,
    },
    0,
    { tipo: 'jugar', carta: 'oros-6' },
  );
  const signo = (n: number) => (n > 0 ? `+${n}` : `−${-n}`);
  expect(t.filas.map(([, f]) => f)).toEqual(final.resultadosManos[0]!.fichas.map(signo));
  expect(t.descripcion).toContain(`${fondo} fichas`);
});

test('Rams: echar triunfo sin poder superar el fallo, y la cuenta de las fichas', () => {
  const b = envite.ejemplo('rams', 'baza', 'baza');
  const mesa = b.jugadas.map((j, i) => ({ asiento: i, carta: j.id }));
  expect(ganadoraRams(mesa, 'picas').asiento).toBe(b.gana);
  // Enfrente (asiento 2) tenía el 8 de picas y diamantes: solo podía echar el 8.
  expect(
    cartasLegalesRams(['picas-8', 'diamantes-7', 'diamantes-13'], mesa.slice(0, 2), 'picas', 2),
  ).toEqual(['picas-8']);

  const t = envite.ejemplo('rams', 'fichas', 'tabla');
  const r = rams.crear({ jugadores: 4 }, 'guia');
  if (!r.ok) throw new Error(r.error);
  const bazas = t.filas.map(([quien]) => Number(/(\d+) baza/.exec(quien)?.[1] ?? 0));
  // La última baza de la mano: la gana el asiento 0 con el As de triunfo.
  let e: Parameters<typeof rams.transicion>[0] = {
    ...r.valor,
    repartidor: 0,
    fase: 'jugar',
    triunfo: 'picas',
    pinte: 'picas-9',
    pinteCogido: true,
    manos: [['picas-1'], ['corazones-7'], ['corazones-8'], []],
    dichos: t.filas.map(([quien]) => (quien.includes('pasa') ? 'paso' : 'rams')),
    bazas: bazas.map((x, a) => (a === 0 ? x - 1 : x)),
    fichas: [3, 3, 3, 3],
    mesa: [],
    turno: 0,
  };
  for (const carta of ['picas-1', 'corazones-7', 'corazones-8'] as const) {
    e = rams.transicion(e, e.turno, { tipo: 'jugar', carta });
  }
  const fichas = t.filas.map(([, f]) => Number(/^(\d+)/.exec(f)![1]));
  expect(e.resultadosManos[0]!.fichasTras).toEqual(fichas);
  expect(e.resultadosManos[0]!.ramses).toEqual([2]);
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

test('Burro de bazas: la baza sin triunfo y robar hasta tener el palo, como lo hace el motor', () => {
  const b = descarte.ejemplo('burroBazas', 'baza', 'baza');
  const mesa = b.jugadas.map((j, asiento) => ({ asiento, carta: j.id }));
  expect(ganadoraBurroBazas(mesa).asiento).toBe(b.gana);
  const e = descarte.ejemplo('burroBazas', 'robar', 'antesDespues');
  const inicio = burroBazas.crear(CONFIG_BURRO_BAZAS_POR_DEFECTO, 'ejemplo');
  if (!inicio.ok) throw new Error(inicio.error);
  const [salida] = zona(e.antes, 'Mesa');
  const estado = {
    ...inicio.valor,
    manos: [
      ['oros-1' as IdCarta],
      zona(e.antes, 'Tu mano'),
      ['oros-2' as IdCarta],
      ['oros-3' as IdCarta],
    ],
    mazo: zona(e.antes, 'Mazo'),
    mesa: [{ asiento: 0, carta: salida! }],
    salida: 0,
    turno: 1,
  };
  expect(burroBazas.accionesLegales(estado, 1)).toEqual([{ tipo: 'robar' }]);
  const tras = burroBazas.transicion(estado, 1, { tipo: 'robar' });
  expect(tras.mesa.map((j) => j.carta)).toEqual(zona(e.despues, 'Mesa'));
  expect(tras.manos[1]).toEqual(zona(e.despues, 'Tu mano'));
  expect(tras.mazo).toEqual(zona(e.despues, 'Mazo'));
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

test('Póker de cinco cartas: las manos del póker y un descarte que la IA haría', () => {
  expect(envite.ejemplo('pokerCinco', 'manos', 'jugadas')).toBe(
    envite.ejemplo('holdem', 'manos', 'jugadas'),
  );
  const e = envite.ejemplo('pokerCinco', 'descarte', 'antesDespues');
  const antes = e.antes[0]!.cartas.filter((c): c is IdCarta => c !== null);
  const despues = e.despues[0]!.cartas.filter((c): c is IdCarta => c !== null);
  const cambiadas = antes.filter((c) => !despues.includes(c));
  expect(cambiadas.sort()).toEqual(descartePokerCinco(antes));
  expect(e.resaltadas).toEqual(despues.filter((c) => !antes.includes(c)));
  expect(mejorManoPoker(antes).categoria).toBe('pareja');
  expect(mejorManoPoker(despues).categoria).toBe('trio');
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

test('Treinta y uno con viuda: el cambio del ejemplo, como lo hace el motor', () => {
  const e = envite.ejemplo('treintaYUno', 'viuda', 'antesDespues');
  const zona = (estado: EjemploAntesDespues['antes'], nombre: string) =>
    estado.find((z) => z.nombre === nombre)!.cartas.filter((c): c is IdCarta => c !== null);
  const mano = zona(e.antes, 'Tu mano');
  const viuda = zona(e.antes, 'Viuda');
  const r = treintaYUno.crear({ jugadores: 2, vidas: 3, viuda: true }, 'ejemplo');
  if (!r.ok) throw new Error(r.error);
  const [coge, deja] = e.resaltadas as [IdCarta, IdCarta];
  const estado = { ...r.valor, manos: [mano, r.valor.manos[1]!], viuda, turno: 0 };
  expect(treintaYUno.accionesLegales(estado, 0)).toContainEqual({
    tipo: 'cambiar',
    mia: deja,
    mesa: coge,
  });
  const tras = treintaYUno.transicion(estado, 0, { tipo: 'cambiar', mia: deja, mesa: coge });
  expect(tras.manos[0]).toEqual(zona(e.despues, 'Tu mano'));
  expect(tras.viuda).toEqual(zona(e.despues, 'Viuda'));
  expect(valorManoTreinta(mano)).toBe(19);
  expect(valorManoTreinta(tras.manos[0]!)).toBe(30);
});

test('todos los ejemplos de envite están comprobados', () => {
  expect(envite.sinComprobar()).toEqual([]);
});
