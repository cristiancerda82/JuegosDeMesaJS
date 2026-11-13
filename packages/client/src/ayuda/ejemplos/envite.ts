import { NOMBRES_MANO_POKER, valorCarta, type IdCarta } from '@juegos/engine';
import type { IdJuego } from '../../sesion/juegos';
import { T } from '../../textos';
import type { EjemploCartas, EjemplosJuego } from '../tipos';

/** Las cartas de mayor a menor, con su puesto debajo. */
const jerarquia = (
  descripcion: string,
  cartas: readonly IdCarta[],
  nota?: string,
): EjemploCartas => ({
  tipo: 'cartas',
  descripcion,
  cartas: cartas.map((id, i) => ({ id, etiqueta: `${i + 1}.ª` })),
  ...(nota ? { nota } : {}),
});

/** Ejemplos de las guías de los juegos de envite. */
export const ENVITE: Partial<Record<IdJuego, EjemplosJuego>> = {
  mus: {
    ochoReyes: {
      tipo: 'cartas',
      descripcion: 'Con ocho reyes, el 3 cuenta como un Rey y el 2 como un As.',
      cartas: [
        { id: 'bastos-12', etiqueta: 'Rey' },
        { id: 'oros-3', etiqueta: 'Rey' },
        { id: 'copas-1', etiqueta: 'As' },
        { id: 'espadas-2', etiqueta: 'As' },
      ],
    },
    jugadas: {
      tipo: 'jugadas',
      descripcion:
        'Una 31 (Rey, Caballo, Sota y As), unos duples (Rey y 3, que es otro rey, y dos cincos), unas medias de sietes y una pareja de caballos.',
      filas: [
        { nombre: 'Juego: la 31', cartas: ['oros-12', 'copas-11', 'espadas-10', 'bastos-1'] },
        { nombre: 'Duples', cartas: ['oros-12', 'copas-3', 'espadas-5', 'bastos-5'] },
        { nombre: 'Medias', cartas: ['oros-7', 'copas-7', 'espadas-7', 'bastos-4'] },
        { nombre: 'Pareja', cartas: ['oros-11', 'copas-11', 'espadas-6', 'bastos-4'] },
      ],
    },
  },

  truco: {
    jerarquia: jerarquia(
      'Las cartas más fuertes, de mayor a menor: el As de espadas, el As de bastos, el 7 de espadas, el 7 de oros y un 3.',
      ['espadas-1', 'bastos-1', 'espadas-7', 'oros-7', 'copas-3'],
      'Los cuatro treses empatan entre sí, y lo mismo pasa con las demás cartas del mismo número.',
    ),
    envido: {
      tipo: 'cartas',
      descripcion: 'El 7 y el 5 de copas y el Rey de oros: 20 + 7 + 5 = 32 de envido.',
      cartas: [{ id: 'copas-7' }, { id: 'copas-5' }, { id: 'oros-12' }],
      resultado: '= 32',
      nota: 'Dos del mismo palo: 20 más sus valores. El Rey es de otro palo y no cuenta.',
    },
  },

  truc: {
    jerarquia: jerarquia(
      'Las cuatro cartas más fuertes: el As de espadas, el As de bastos, el 7 de espadas y el 7 de oros.',
      ['espadas-1', 'bastos-1', 'espadas-7', 'oros-7'],
    ),
    envit: {
      tipo: 'cartas',
      descripcion: 'El 7 y el 6 de copas y el Rey de oros: 20 + 7 + 6 = 33 de envit.',
      cartas: [{ id: 'copas-7' }, { id: 'copas-6' }, { id: 'oros-12' }],
      resultado: '= 33',
      nota: 'El Rey no cuenta: es de otro palo, y las figuras valen 0.',
    },
  },

  holdem: {
    manos: {
      tipo: 'jugadas',
      descripcion: 'Las nueve manos del póker, de la mejor a la peor, con un ejemplo de cada una.',
      filas: [
        {
          nombre: NOMBRES_MANO_POKER.escaleraColor,
          cartas: ['picas-9', 'picas-10', 'picas-11', 'picas-12', 'picas-13'],
        },
        {
          nombre: NOMBRES_MANO_POKER.poker,
          cartas: ['picas-8', 'corazones-8', 'diamantes-8', 'treboles-8', 'corazones-3'],
        },
        {
          nombre: NOMBRES_MANO_POKER.full,
          cartas: ['picas-12', 'corazones-12', 'treboles-12', 'diamantes-5', 'treboles-5'],
        },
        {
          nombre: NOMBRES_MANO_POKER.color,
          cartas: ['corazones-2', 'corazones-6', 'corazones-9', 'corazones-11', 'corazones-1'],
        },
        {
          nombre: NOMBRES_MANO_POKER.escalera,
          cartas: ['diamantes-1', 'picas-2', 'treboles-3', 'corazones-4', 'diamantes-5'],
        },
        {
          nombre: NOMBRES_MANO_POKER.trio,
          cartas: ['picas-7', 'diamantes-7', 'treboles-7', 'corazones-13', 'picas-4'],
        },
        {
          nombre: NOMBRES_MANO_POKER.doblePareja,
          cartas: ['corazones-10', 'treboles-10', 'picas-6', 'diamantes-6', 'treboles-1'],
        },
        {
          nombre: NOMBRES_MANO_POKER.pareja,
          cartas: ['diamantes-1', 'treboles-1', 'picas-9', 'corazones-7', 'diamantes-3'],
        },
        {
          nombre: NOMBRES_MANO_POKER.cartaAlta,
          cartas: ['treboles-13', 'diamantes-10', 'picas-8', 'corazones-5', 'treboles-2'],
        },
      ],
      nota: 'La escalera del As al 5 es la más baja: aquí el As va bajo.',
    },
  },

  blackjack: {
    valores: {
      tipo: 'cartas',
      descripcion: 'Lo que vale cada carta: el As 11 o 1, las figuras 10 y el resto su número.',
      cartas: [
        { id: 'picas-1', etiqueta: '11 o 1' },
        { id: 'corazones-13', etiqueta: '10' },
        { id: 'diamantes-10', etiqueta: '10' },
        { id: 'treboles-7', etiqueta: '7' },
      ],
    },
    blackjack: {
      tipo: 'cartas',
      descripcion: 'Un As y una Q de entrada: 21, un blackjack.',
      cartas: [{ id: 'picas-1' }, { id: 'corazones-12' }],
      resultado: '= 21',
      nota: 'Es un blackjack: cobra 3 por cada 2 apostadas.',
    },
    blanda: {
      tipo: 'cartas',
      descripcion: 'Un As, un 6 y un 9: el As vale 1 para no pasarte, y sumas 16.',
      cartas: [{ id: 'diamantes-1' }, { id: 'picas-6' }, { id: 'corazones-9' }],
      resultado: '= 16',
      nota: 'Con el As como 11 sumarías 26 y te pasarías.',
    },
  },

  sieteYMedia: {
    valores: {
      tipo: 'cartas',
      descripcion: 'Lo que vale cada carta: del As al 7 su número, y las figuras medio punto.',
      cartas: (['espadas-1', 'espadas-4', 'espadas-7', 'espadas-10', 'espadas-12'] as const).map(
        (id) => ({ id, etiqueta: T.sieteYMedia.valor(valorCarta(id)) }),
      ),
    },
    natural: {
      tipo: 'cartas',
      descripcion: 'Un 7 y un Caballo con las dos primeras cartas: siete y media natural.',
      cartas: [{ id: 'oros-7' }, { id: 'copas-11' }],
      resultado: '= 7,5',
      nota: 'Con las dos primeras cartas, cobras el doble.',
    },
  },

  treintaYUno: {
    manos: {
      tipo: 'jugadas',
      descripcion:
        'Tres manos de mayor a menor: As, K y 10 de corazones (31), tres sietes (30,5), y As y 9 de picas con la K de diamantes (20).',
      filas: [
        { nombre: '31', cartas: ['corazones-1', 'corazones-13', 'corazones-10'] },
        { nombre: '30,5', cartas: ['picas-7', 'diamantes-7', 'treboles-7'] },
        { nombre: '20', cartas: ['picas-1', 'picas-9', 'diamantes-13'] },
      ],
      nota: 'Solo cuenta el palo que más suma: la K de diamantes no se suma a las picas.',
    },
  },
};
