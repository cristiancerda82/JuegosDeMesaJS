import {
  cartaDeId,
  cartaGanadora,
  fuerza,
  fuerzaDoppelkopf,
  fuerzaSchafkopf,
  fuerzaSheepshead,
  ganadoraBelote,
  ganadoraDoppelkopf,
  ganadoraJass,
  ganadoraKlaverjas,
  ganadoraSchafkopf,
  ganadoraSchnapsen,
  ganadoraSheepshead,
  ganadoraSkat,
  ganadoraSueca,
  ganadoraTressette,
  ganadoraTysiacha,
  ganaSegundaBezique,
  ganaSegundaEcarte,
  ganaSegundaPiquet,
  conjuntosPiquet,
  esTriunfoSheepshead,
  MATRIMONIO_TYSIACHA,
  matrimoniosEnManoTysiacha,
  puntosCanteBezique,
  puntosCartaJass,
  puntosCartaSueca,
  puntosCartaTysiacha,
  puntosConjuntoPiquet,
  puntosDe,
  puntosSecuenciaPiquet,
  rangoBelote,
  rangoEcarte,
  rangoJass,
  rangoSchnapsen,
  rangoSueca,
  rangoTressette,
  rangoTysiacha,
  roemBaza,
  secuenciasPiquet,
  terciosCartaTressette,
  valorBelote,
  valorSchnapsen,
  VALORES_BRISCA,
  VALORES_BUTIFARRA,
  VALORES_GUINOTE,
  weisJass,
  type IdCarta,
  type PaloFrances,
  type TipoCanteBezique,
  type ValoresBazas,
} from '@juegos/engine';
import { describe, expect, test } from 'vitest';
import type { IdJuego } from '../../sesion/juegos';
import { T } from '../../textos';
import type { EjemploBaza, EjemploCartas } from '../tipos';
import { BAZAS_PUNTOS } from './bazas-puntos';
import { mesaDe, triunfoDe, verificador } from './comprobar';

const v = verificador(BAZAS_PUNTOS);

/** Las cartas van de mayor a menor según `rango`. */
function descendente(cartas: readonly IdCarta[], rango: (c: IdCarta) => number) {
  for (let i = 1; i < cartas.length; i++) {
    expect(rango(cartas[i - 1]!), `${cartas[i - 1]} > ${cartas[i]}`).toBeGreaterThan(
      rango(cartas[i]!),
    );
  }
}

/** Cada carta lleva como etiqueta sus puntos y van de mayor a menor. */
function valores(e: EjemploCartas, puntos: (c: IdCarta) => number, rango: (c: IdCarta) => number) {
  for (const { id, etiqueta } of e.cartas) expect(etiqueta, id).toBe(T.ayuda.puntos(puntos(id)));
  descendente(
    e.cartas.map((c) => c.id),
    rango,
  );
}

/** La carta que el ejemplo resalta es la que gana según el motor. */
function gana(e: EjemploBaza, ganadora: (e: EjemploBaza) => number) {
  expect(ganadora(e), e.descripcion).toBe(e.gana);
}

/** Un cante de Rey y Caballo (o Sota, o Dama) del mismo palo. */
function cante(e: EjemploCartas, valores: readonly [number, number]) {
  const [a, b] = e.cartas.map((c) => cartaDeId(c.id)!);
  expect(a!.palo).toBe(b!.palo);
  expect([a!.valor, b!.valor]).toEqual(valores);
}

const numeroFinal = (texto: string) => Number(/(\d+)\D*$/.exec(texto)![1]);

describe.each([
  ['brisca', VALORES_BRISCA, 'valores'],
  ['tute', VALORES_BRISCA, 'valores'],
  ['guinote', VALORES_GUINOTE, 'valoresGuinote'],
  ['butifarra', VALORES_BUTIFARRA, 'valoresButifarra'],
] as [IdJuego, ValoresBazas, string][])('%s', (juego, tabla, clave) => {
  test('valores y baza', () => {
    valores(
      v.ejemplo(juego, clave, 'cartas'),
      (c) => puntosDe(c, tabla),
      (c) => fuerza(c, tabla),
    );
    gana(v.ejemplo(juego, 'baza', 'baza'), (e) => {
      const triunfo = triunfoDe(e) as Parameters<typeof cartaGanadora>[1];
      return cartaGanadora(mesaDe(e), triunfo, tabla).asiento;
    });
  });
});

test('cantes de Rey y Caballo, Rey y Sota, K y Q', () => {
  cante(v.ejemplo('tute', 'cante', 'cartas'), [12, 11]);
  cante(v.ejemplo('guinote', 'canteGuinote', 'cartas'), [12, 10]);
  cante(v.ejemplo('schnapsen', 'cante', 'cartas'), [13, 12]);
  const belote = v.ejemplo('belote', 'belote', 'cartas');
  cante(belote, [13, 12]);
  expect(cartaDeId(belote.cartas[0]!.id)!.palo).toBe(
    triunfoDe(v.ejemplo('belote', 'baza', 'baza')),
  );
});

test('Tressette: orden, tercios y baza', () => {
  const e = v.ejemplo('tressette', 'orden', 'cartas');
  descendente(
    e.cartas.map((c) => c.id),
    rangoTressette,
  );
  const etiqueta = { 3: '1', 1: '⅓', 0: '0' } as Record<number, string>;
  for (const { id, etiqueta: et } of e.cartas)
    expect(et, id).toBe(etiqueta[terciosCartaTressette(id)]);
  gana(v.ejemplo('tressette', 'baza', 'baza'), (b) => ganadoraTressette(mesaDe(b)).asiento);
});

test.each(['schnapsen', 'sixtySix'] as const)('%s: valores y baza', (juego) => {
  valores(v.ejemplo(juego, 'valores', 'cartas'), valorSchnapsen, rangoSchnapsen);
  gana(
    v.ejemplo(juego, 'baza', 'baza'),
    (e) => ganadoraSchnapsen(mesaDe(e), triunfoDe(e) as PaloFrances).asiento,
  );
});

test('Belote: el triunfo y la baza', () => {
  valores(
    v.ejemplo('belote', 'triunfo', 'cartas'),
    (c) => valorBelote(c, 'corazones'),
    (c) => rangoBelote(c, 'corazones'),
  );
  gana(
    v.ejemplo('belote', 'baza', 'baza'),
    (e) => ganadoraBelote(mesaDe(e), triunfoDe(e) as PaloFrances).asiento,
  );
});

test('Klaverjas: la baza y el roem', () => {
  gana(
    v.ejemplo('klaverjas', 'baza', 'baza'),
    (e) => ganadoraKlaverjas(mesaDe(e), triunfoDe(e) as PaloFrances).asiento,
  );
  for (const fila of v.ejemplo('klaverjas', 'roem', 'jugadas').filas) {
    expect(roemBaza(fila.cartas, 'corazones'), fila.nombre).toBe(numeroFinal(fila.nombre));
  }
});

test('Jass: el triunfo, la baza en Obenabe y los weis', () => {
  valores(
    v.ejemplo('jass', 'triunfo', 'cartas'),
    (c) => puntosCartaJass(c, 'corazones'),
    (c) => rangoJass(c, 'corazones'),
  );
  const baza = v.ejemplo('jass', 'baza', 'baza');
  expect(baza.triunfo).toBeUndefined();
  gana(baza, (e) => ganadoraJass(mesaDe(e), 'obenabe').asiento);
  for (const fila of v.ejemplo('jass', 'weis', 'jugadas').filas) {
    expect(
      weisJass(fila.cartas).map((w) => w.puntos),
      fila.nombre,
    ).toEqual([numeroFinal(fila.nombre)]);
  }
});

test('Sueca: valores y baza', () => {
  valores(v.ejemplo('sueca', 'valores', 'cartas'), puntosCartaSueca, rangoSueca);
  gana(
    v.ejemplo('sueca', 'baza', 'baza'),
    (e) => ganadoraSueca(mesaDe(e), triunfoDe(e) as PaloFrances).asiento,
  );
});

test('Bezique: los cantes y la baza de cartas iguales', () => {
  const tipos: Record<string, TipoCanteBezique> = {
    Matrimonio: 'matrimonio',
    Bézique: 'bezique',
    'Cuatro Ases': 'cuatroA',
    'Escalera de triunfo': 'escalera',
  };
  for (const fila of v.ejemplo('bezique', 'cantes', 'jugadas').filas) {
    const tipo = tipos[fila.nombre.split(':')[0]!]!;
    expect(puntosCanteBezique(tipo, fila.cartas, 'picas'), fila.nombre).toBe(
      numeroFinal(fila.nombre),
    );
  }
  gana(v.ejemplo('bezique', 'baza', 'baza'), (e) =>
    ganaSegundaBezique(e.jugadas[0]!.id, e.jugadas[1]!.id, triunfoDe(e) as PaloFrances) ? 1 : 0,
  );
});

test('Skat: las J y la baza', () => {
  const jotas = v.ejemplo('skat', 'jotas', 'cartas').cartas.map((c) => c.id);
  for (let i = 1; i < jotas.length; i++) {
    const mesa = [
      { asiento: 0, carta: jotas[i]! },
      { asiento: 1, carta: jotas[i - 1]! },
    ];
    expect(ganadoraSkat(mesa, 'corazones').asiento).toBe(1);
  }
  gana(
    v.ejemplo('skat', 'baza', 'baza'),
    (e) => ganadoraSkat(mesaDe(e), triunfoDe(e) as PaloFrances).asiento,
  );
});

test('Doppelkopf, Schafkopf y Sheepshead: los triunfos y la baza', () => {
  const triunfos = (juego: IdJuego) =>
    v.ejemplo(juego, 'triunfos', 'jugadas').filas.flatMap((f) => f.cartas);
  descendente(triunfos('doppelkopf'), (c) => fuerzaDoppelkopf(c, 'normal'));
  gana(
    v.ejemplo('doppelkopf', 'baza', 'baza'),
    (e) => ganadoraDoppelkopf(mesaDe(e), 'normal').asiento,
  );

  const rufspiel = { tipo: 'rufspiel', palo: 'treboles' } as const;
  descendente(triunfos('schafkopf'), (c) => fuerzaSchafkopf(c, rufspiel));
  gana(
    v.ejemplo('schafkopf', 'baza', 'baza'),
    (e) => ganadoraSchafkopf(mesaDe(e), rufspiel).asiento,
  );

  expect(triunfos('sheepshead').every(esTriunfoSheepshead)).toBe(true);
  expect(triunfos('sheepshead')).toHaveLength(14);
  descendente(triunfos('sheepshead'), fuerzaSheepshead);
  gana(v.ejemplo('sheepshead', 'baza', 'baza'), (e) => ganadoraSheepshead(mesaDe(e)).asiento);
});

test('Tysiacha: valores, matrimonios y baza sin triunfo', () => {
  valores(v.ejemplo('tysiacha', 'valores', 'cartas'), puntosCartaTysiacha, rangoTysiacha);
  for (const fila of v.ejemplo('tysiacha', 'matrimonios', 'jugadas').filas) {
    const [palo] = matrimoniosEnManoTysiacha(fila.cartas);
    expect(MATRIMONIO_TYSIACHA[palo!], fila.nombre).toBe(numeroFinal(fila.nombre));
  }
  gana(v.ejemplo('tysiacha', 'baza', 'baza'), (e) => ganadoraTysiacha(mesaDe(e), null).asiento);
});

test('Piquet: las declaraciones y la baza', () => {
  const [punto, secuencia, cuatro, tres] = v.ejemplo('piquet', 'declaraciones', 'jugadas').filas;
  expect(new Set(punto!.cartas.map((c) => cartaDeId(c)!.palo)).size).toBe(1);
  expect(numeroFinal(punto!.nombre)).toBe(punto!.cartas.length);
  expect(secuenciasPiquet(secuencia!.cartas).map((s) => s.length)).toEqual([5]);
  expect(puntosSecuenciaPiquet(5)).toBe(numeroFinal(secuencia!.nombre));
  for (const fila of [cuatro!, tres!]) {
    const [conjunto] = conjuntosPiquet(fila.cartas);
    expect(puntosConjuntoPiquet(conjunto!.length), fila.nombre).toBe(numeroFinal(fila.nombre));
  }
  gana(v.ejemplo('piquet', 'baza', 'baza'), (e) =>
    ganaSegundaPiquet(e.jugadas[0]!.id, e.jugadas[1]!.id) ? 1 : 0,
  );
});

test('Écarté: el orden y la baza', () => {
  descendente(
    v.ejemplo('ecarte', 'orden', 'cartas').cartas.map((c) => c.id),
    rangoEcarte,
  );
  gana(v.ejemplo('ecarte', 'baza', 'baza'), (e) =>
    ganaSegundaEcarte(e.jugadas[0]!.id, e.jugadas[1]!.id, triunfoDe(e) as PaloFrances) ? 1 : 0,
  );
});

test('todos los ejemplos de las bazas por puntos están comprobados', () => {
  expect(v.sinComprobar()).toEqual([]);
});
