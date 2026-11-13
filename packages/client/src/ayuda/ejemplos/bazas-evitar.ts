import type { IdJuego } from '../../sesion/juegos';
import { T } from '../../textos';
import type { EjemplosJuego } from '../tipos';
import { baza, CUATRO } from './bazas-puntos';

/** Ejemplos de las guías de los juegos de bazas para evitar. */
export const BAZAS_EVITAR: Partial<Record<IdJuego, EjemplosJuego>> = {
  corazones: {
    puntosCorazones: {
      tipo: 'cartas',
      descripcion: 'Las cartas que puntúan: cada corazón 1 punto y la Q de picas 13.',
      cartas: [
        { id: 'corazones-1', etiqueta: T.ayuda.puntos(1) },
        { id: 'corazones-7', etiqueta: T.ayuda.puntos(1) },
        { id: 'picas-12', etiqueta: T.ayuda.puntos(13) },
      ],
    },
    baza: baza(
      'Sale el 10 de tréboles, sigue el K de tréboles, el tercero, sin tréboles, suelta la Q de picas y el último echa el 4 de tréboles: el K se lleva la Q.',
      CUATRO,
      ['treboles-10', 'treboles-13', 'picas-12', 'treboles-4'],
      undefined,
      1,
      'Gana la carta más alta del palo de salida, y quien gana se lleva lo que haya en la baza: 13 puntos que no quería.',
    ),
  },

  barbu: {
    baza: baza(
      'En «Sin damas» sale la Q de diamantes, sigue el As de diamantes, el tercero suelta la Q de corazones y el último echa el 5 de diamantes: el As se lleva dos damas.',
      CUATRO,
      ['diamantes-12', 'diamantes-1', 'corazones-12', 'diamantes-5'],
      undefined,
      1,
      'Gana el As, la más alta del palo de salida, y se lleva las dos damas: −12 puntos.',
    ),
    domino: {
      tipo: 'antesDespues',
      descripcion:
        'En el dominó, la fila de picas va del 10 a la Q: encaja el 9 de picas por abajo.',
      antes: [
        { nombre: 'Fila de picas', cartas: ['picas-10', 'picas-11', 'picas-12'] },
        { nombre: 'Tu mano', cartas: ['picas-9', 'corazones-4'] },
      ],
      despues: [
        { nombre: 'Fila de picas', cartas: ['picas-9', 'picas-10', 'picas-11', 'picas-12'] },
        { nombre: 'Tu mano', cartas: ['corazones-4'] },
      ],
      resaltadas: ['picas-9'],
      explicacion:
        'Cada fila crece de uno en uno por arriba y por abajo: aquí encajarían el 9 o el K de picas. El 4 de corazones no encaja hasta que se abra su fila con la J.',
    },
  },

  rentz: {
    baza: baza(
      'En «Sin el K de corazones» sale el 8 de corazones, sigue el As de corazones, el tercero echa el K de corazones y el último el 7 de picas: el As se lleva el K.',
      CUATRO,
      ['corazones-8', 'corazones-1', 'corazones-13', 'picas-7'],
      undefined,
      1,
      'No hay triunfo: gana la más alta del palo de salida, el As, y quien la gana se lleva el K de corazones: −40.',
    ),
    domino: {
      tipo: 'antesDespues',
      descripcion:
        'En el dominó, la fila de diamantes va de la J a la Q: encaja el K de diamantes por arriba.',
      antes: [
        { nombre: 'Fila de diamantes', cartas: ['diamantes-11', 'diamantes-12'] },
        { nombre: 'Tu mano', cartas: ['diamantes-13', 'treboles-8'] },
      ],
      despues: [
        { nombre: 'Fila de diamantes', cartas: ['diamantes-11', 'diamantes-12', 'diamantes-13'] },
        { nombre: 'Tu mano', cartas: ['treboles-8'] },
      ],
      resaltadas: ['diamantes-13'],
      explicacion: 'Cada palo empieza por su J y crece de uno en uno hacia arriba y hacia abajo.',
    },
  },
};
