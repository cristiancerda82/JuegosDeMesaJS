import {
  cartaDeId,
  esComodin,
  esExcusa,
  esTriunfoTarot,
  PALOS_ESPANOLES,
  type IdCarta,
} from '@juegos/engine';
import { describe, expect, test } from 'vitest';
import { CATALOGO } from '../../menu/catalogo';
import { ID_JUEGOS, type IdJuego } from '../../sesion/juegos';
import { T } from '../../textos';
import type { Ejemplo } from '../tipos';
import { EJEMPLOS } from '.';

/** Juegos con más de una baraja, o con cartas repetidas, donde una carta puede salir dos veces. */
const VARIAS_BARAJAS: readonly IdJuego[] = [
  'spider',
  'cuarentaLadrones',
  'canasta',
  'handAndFoot',
  'remigio',
  'pinacle',
  'bezique',
  'doppelkopf',
];

interface Seccion {
  readonly ejemplo?: string;
  readonly ejemplos?: readonly string[];
}
const clavesDe = (juego: IdJuego) =>
  (T.ayuda[juego] as readonly Seccion[]).flatMap(
    (s) => s.ejemplos ?? (s.ejemplo ? [s.ejemplo] : []),
  );

/** Todas las cartas que enseña un ejemplo. */
function cartasDe(e: Ejemplo): IdCarta[] {
  switch (e.tipo) {
    case 'cartas':
      return e.cartas.map((c) => c.id);
    case 'jugadas':
      return e.filas.flatMap((f) => f.cartas);
    case 'baza':
      return [
        ...e.jugadas.map((j) => j.id),
        ...(e.triunfo && cartaDeId(e.triunfo) ? [e.triunfo as IdCarta] : []),
      ];
    case 'antesDespues':
      return [...e.antes, ...e.despues].flatMap((z) => z.cartas.filter((c) => c !== null));
    case 'tabla':
      return [];
  }
}

const esEspanola = (id: IdCarta) =>
  esComodin(id) || (PALOS_ESPANOLES as readonly string[]).includes(cartaDeId(id)?.palo ?? '');
const esFrancesa = (id: IdCarta) =>
  esComodin(id) ||
  esTriunfoTarot(id) ||
  esExcusa(id) ||
  (cartaDeId(id) !== null && !esEspanola(id));

describe.each(ID_JUEGOS)('ejemplos de la guía de %s', (juego) => {
  const ejemplos = EJEMPLOS[juego] ?? {};

  test('tiene al menos un ejemplo, y las claves de la guía y los ejemplos coinciden', () => {
    const claves = clavesDe(juego);
    expect(claves.length).toBeGreaterThan(0);
    expect([...new Set(claves)].sort()).toEqual(Object.keys(ejemplos).sort());
  });

  test.each(Object.entries(ejemplos))(
    '%s: cartas de la baraja del juego y forma válida',
    (_, e) => {
      expect(e.descripcion.length).toBeGreaterThan(10);
      const cartas = cartasDe(e);
      const barajas = CATALOGO[juego].barajas;
      for (const id of cartas) {
        expect(
          cartaDeId(id) !== null || esComodin(id) || esTriunfoTarot(id) || esExcusa(id),
          id,
        ).toBe(true);
        expect(
          barajas.includes('espanola') ? esEspanola(id) : esFrancesa(id),
          `${id} en ${barajas}`,
        ).toBe(true);
      }
      // En un ejemplo con una sola baraja no se repite ninguna carta (en un antes y después,
      // dentro de cada estado).
      if (!VARIAS_BARAJAS.includes(juego)) {
        const grupos =
          e.tipo === 'antesDespues'
            ? [e.antes, e.despues].map((zs) =>
                zs.flatMap((z) => z.cartas.filter((c) => c !== null)),
              )
            : e.tipo === 'jugadas'
              ? e.filas.map((f) => f.cartas)
              : [cartas];
        for (const g of grupos) expect(new Set(g).size, g.join(' ')).toBe(g.length);
      }
      if (e.tipo === 'baza') {
        expect(e.jugadas.length).toBeGreaterThanOrEqual(2);
        expect(e.gana).toBeGreaterThanOrEqual(0);
        expect(e.gana).toBeLessThan(e.jugadas.length);
      }
      if (e.tipo === 'antesDespues') {
        expect(e.resaltadas.length).toBeGreaterThan(0);
        const despues = e.despues.flatMap((z) => z.cartas);
        for (const id of e.resaltadas) expect(despues, id).toContain(id);
      }
    },
  );
});
