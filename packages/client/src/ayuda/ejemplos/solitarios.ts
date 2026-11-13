import type { IdJuego } from '../../sesion/juegos';
import type { EjemplosJuego } from '../tipos';

/** Ejemplos de las guías de los solitarios. */
export const SOLITARIOS: Partial<Record<IdJuego, EjemplosJuego>> = {
  klondike: {
    escalera: {
      tipo: 'antesDespues',
      descripcion:
        'El 10 de tréboles pasa sobre la J de diamantes: un valor menos y de color contrario. La carta tapada de debajo se da la vuelta.',
      antes: [
        {
          nombre: 'Columna 1',
          cartas: ['corazones-13', 'picas-12', 'diamantes-11'],
          forma: 'columna',
        },
        { nombre: 'Columna 2', cartas: [null, 'treboles-10'], forma: 'columna' },
      ],
      despues: [
        {
          nombre: 'Columna 1',
          cartas: ['corazones-13', 'picas-12', 'diamantes-11', 'treboles-10'],
          forma: 'columna',
        },
        { nombre: 'Columna 2', cartas: ['corazones-4'], forma: 'columna' },
      ],
      resaltadas: ['treboles-10'],
      explicacion:
        'El 10 negro va sobre la J roja. La carta tapada que queda al final de la columna se da la vuelta sola.',
    },
  },

  freecell: {
    escalera: {
      tipo: 'antesDespues',
      descripcion:
        'El 9 de picas pasa sobre el 10 de corazones: un valor menos y de color contrario.',
      antes: [
        { nombre: 'Columna 1', cartas: ['treboles-4', 'corazones-10'], forma: 'columna' },
        { nombre: 'Columna 2', cartas: ['diamantes-12', 'picas-9'], forma: 'columna' },
      ],
      despues: [
        {
          nombre: 'Columna 1',
          cartas: ['treboles-4', 'corazones-10', 'picas-9'],
          forma: 'columna',
        },
        { nombre: 'Columna 2', cartas: ['diamantes-12'], forma: 'columna' },
      ],
      resaltadas: ['picas-9'],
      explicacion: 'Solo se mueve la última carta de cada columna: el 9 negro va sobre el 10 rojo.',
    },
  },

  spider: {
    escaleraSpider: {
      tipo: 'antesDespues',
      descripcion:
        'La escalera 8, 7 y 6 de picas se mueve entera sobre el 9 de corazones, porque es del mismo palo.',
      antes: [
        { nombre: 'Columna 1', cartas: [null, 'corazones-9'], forma: 'columna' },
        { nombre: 'Columna 2', cartas: [null, 'picas-8', 'picas-7', 'picas-6'], forma: 'columna' },
      ],
      despues: [
        {
          nombre: 'Columna 1',
          cartas: [null, 'corazones-9', 'picas-8', 'picas-7', 'picas-6'],
          forma: 'columna',
        },
        { nombre: 'Columna 2', cartas: ['diamantes-3'], forma: 'columna' },
      ],
      resaltadas: ['picas-8', 'picas-7', 'picas-6'],
      explicacion:
        'El 8 va sobre cualquier 9, sea del palo que sea; y el 8, el 7 y el 6 de picas se mueven juntos porque son del mismo palo.',
    },
  },

  belleLucie: {
    mover: {
      tipo: 'antesDespues',
      descripcion: 'El 6 de picas, arriba de un abanico, pasa sobre el 7 de picas de otro abanico.',
      antes: [
        { nombre: 'Abanico 1', cartas: ['diamantes-2', 'treboles-13', 'picas-7'] },
        { nombre: 'Abanico 2', cartas: ['corazones-12', 'treboles-4', 'picas-6'] },
      ],
      despues: [
        { nombre: 'Abanico 1', cartas: ['diamantes-2', 'treboles-13', 'picas-7', 'picas-6'] },
        { nombre: 'Abanico 2', cartas: ['corazones-12', 'treboles-4'] },
      ],
      resaltadas: ['picas-6'],
      explicacion:
        'Sobre una carta va la siguiente más baja de su mismo palo. Ahora el 4 de tréboles queda arriba.',
    },
  },

  scorpion: {
    mover: {
      tipo: 'antesDespues',
      descripcion:
        'El 6 de picas pasa sobre el 7 de picas llevándose las dos cartas que tiene encima, aunque estén desordenadas.',
      antes: [
        { nombre: 'Columna 1', cartas: ['diamantes-9', 'picas-7'], forma: 'columna' },
        {
          nombre: 'Columna 2',
          cartas: ['corazones-3', 'picas-6', 'corazones-11', 'treboles-2'],
          forma: 'columna',
        },
      ],
      despues: [
        {
          nombre: 'Columna 1',
          cartas: ['diamantes-9', 'picas-7', 'picas-6', 'corazones-11', 'treboles-2'],
          forma: 'columna',
        },
        { nombre: 'Columna 2', cartas: ['corazones-3'], forma: 'columna' },
      ],
      resaltadas: ['picas-6', 'corazones-11', 'treboles-2'],
      explicacion:
        'Lo que importa es la carta que mueves: el 6 de picas va sobre el 7 de picas, y lo que tiene encima viaja con ella.',
    },
  },

  cuarentaLadrones: {
    mover: {
      tipo: 'antesDespues',
      descripcion: 'El 7 de picas pasa sobre el 8 de picas: un número menos y del mismo palo.',
      antes: [
        { nombre: 'Columna 1', cartas: ['corazones-12', 'picas-8'], forma: 'columna' },
        { nombre: 'Columna 2', cartas: ['diamantes-5', 'picas-7'], forma: 'columna' },
      ],
      despues: [
        { nombre: 'Columna 1', cartas: ['corazones-12', 'picas-8', 'picas-7'], forma: 'columna' },
        { nombre: 'Columna 2', cartas: ['diamantes-5'], forma: 'columna' },
      ],
      resaltadas: ['picas-7'],
      explicacion: 'Aquí no vale el color contrario: tiene que ser del mismo palo.',
    },
  },

  canfield: {
    fundacion: {
      tipo: 'cartas',
      descripcion:
        'Si la base es el 7, la fundación de diamantes sigue después del Rey con el As y el 2.',
      cartas: [
        { id: 'diamantes-7', etiqueta: 'Base' },
        { id: 'diamantes-8' },
        { id: 'diamantes-12' },
        { id: 'diamantes-13' },
        { id: 'diamantes-1' },
        { id: 'diamantes-2' },
      ],
      nota: 'Con base 7: 7, 8, 9… Q, K, As, 2… hasta el 6. Las otras fundaciones también empiezan por un 7.',
    },
    vuelta: {
      tipo: 'antesDespues',
      descripcion: 'La K de picas del descarte pasa sobre el As de corazones de una columna.',
      antes: [
        { nombre: 'Columna', cartas: ['treboles-2', 'corazones-1'], forma: 'columna' },
        { nombre: 'Descarte', cartas: ['picas-13'] },
      ],
      despues: [
        { nombre: 'Columna', cartas: ['treboles-2', 'corazones-1', 'picas-13'], forma: 'columna' },
        { nombre: 'Descarte', cartas: [] },
      ],
      resaltadas: ['picas-13'],
      explicacion:
        'En las columnas se baja alternando colores, con vuelta: la K negra va sobre el As rojo.',
    },
  },

  yukon: {
    mover: {
      tipo: 'antesDespues',
      descripcion:
        'El 9 de tréboles pasa sobre el 10 de corazones con todas las cartas que tiene encima, aunque no estén ordenadas.',
      antes: [
        { nombre: 'Columna 1', cartas: [null, 'corazones-10'], forma: 'columna' },
        {
          nombre: 'Columna 2',
          cartas: [null, 'treboles-9', 'diamantes-4', 'picas-12'],
          forma: 'columna',
        },
      ],
      despues: [
        {
          nombre: 'Columna 1',
          cartas: [null, 'corazones-10', 'treboles-9', 'diamantes-4', 'picas-12'],
          forma: 'columna',
        },
        { nombre: 'Columna 2', cartas: ['corazones-6'], forma: 'columna' },
      ],
      resaltadas: ['treboles-9', 'diamantes-4', 'picas-12'],
      explicacion:
        'Solo la carta que mueves tiene que encajar: el 9 negro sobre el 10 rojo. Las de encima van con ella, y la tapada se da la vuelta.',
    },
  },

  tripeaks: {
    racha: {
      tipo: 'cartas',
      descripcion:
        'Sobre el 8 de picas del descarte se quitan seguidas el 9 de diamantes, el 10 de tréboles y el 9 de corazones: una racha de 3 que suma 1 + 2 + 3 puntos.',
      cartas: [
        { id: 'picas-8', etiqueta: 'Descarte' },
        { id: 'diamantes-9', etiqueta: '+1' },
        { id: 'treboles-10', etiqueta: '+2' },
        { id: 'corazones-9', etiqueta: '+3' },
      ],
      resultado: '= 6',
      nota: 'Cada carta vale uno más o uno menos que la anterior, sin importar el palo: 8, 9, 10 y vuelta al 9.',
    },
  },

  golf: {
    mover: {
      tipo: 'antesDespues',
      descripcion:
        'El 6 de corazones, al final de una columna, pasa al descarte sobre el 7 de tréboles.',
      antes: [
        { nombre: 'Columna', cartas: ['picas-12', 'diamantes-2', 'corazones-6'], forma: 'columna' },
        { nombre: 'Descarte', cartas: ['treboles-7'] },
      ],
      despues: [
        { nombre: 'Columna', cartas: ['picas-12', 'diamantes-2'], forma: 'columna' },
        { nombre: 'Descarte', cartas: ['treboles-7', 'corazones-6'] },
      ],
      resaltadas: ['corazones-6'],
      explicacion:
        'Sobre un 7 va un 6 o un 8, del palo que sea. Ahora la siguiente sería un 5 o un 7.',
    },
  },

  piramide: {
    parejas: {
      tipo: 'jugadas',
      descripcion: 'Parejas que suman 13: un 8 y un 5, una Q y un As. La K se quita sola.',
      filas: [
        { nombre: '8 + 5 = 13', cartas: ['treboles-8', 'diamantes-5'] },
        { nombre: 'Q (12) + As (1) = 13', cartas: ['corazones-12', 'picas-1'] },
        { nombre: 'K (13), sola', cartas: ['treboles-13'] },
      ],
    },
  },
};
