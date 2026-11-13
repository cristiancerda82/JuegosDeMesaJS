import type { IdJuego } from '../../sesion/juegos';
import type { EjemplosJuego } from '../tipos';
import { valores } from './bazas-puntos';

/** Ejemplos de las guías de los juegos de combinaciones. */
export const COMBINACIONES: Partial<Record<IdJuego, EjemplosJuego>> = {
  chinchon: {
    combinaciones: {
      tipo: 'jugadas',
      descripcion:
        'Tres combinaciones: una escalera de copas del 6 al Caballo, un trío de cuatros con comodín y un cuarteto de reyes.',
      filas: [
        { nombre: 'Escalera', cartas: ['copas-6', 'copas-7', 'copas-10', 'copas-11'] },
        { nombre: 'Trío con comodín', cartas: ['oros-4', 'bastos-4', 'comodin-1'] },
        { nombre: 'Cuarteto', cartas: ['oros-12', 'copas-12', 'espadas-12', 'bastos-12'] },
      ],
      nota: 'En la escalera, después del 7 va la Sota.',
    },
    cerrar: {
      tipo: 'jugadas',
      descripcion:
        'Una mano que puede cerrar: una escalera de oros del 3 al 5, un trío de sietes y el 2 de bastos suelto.',
      filas: [
        { nombre: 'Escalera', cartas: ['oros-3', 'oros-4', 'oros-5'] },
        { nombre: 'Trío', cartas: ['copas-7', 'espadas-7', 'bastos-7'] },
        { nombre: 'Suelta', cartas: ['bastos-2'] },
      ],
      nota: 'Solo queda suelto el 2, que vale menos de 3: puedes cerrar.',
    },
    puntos: valores(
      'Lo que suma cada carta sin ligar: el As 1, los números su valor, las figuras 10 y el comodín 25.',
      [
        ['oros-1', 1],
        ['oros-6', 6],
        ['oros-11', 10],
        ['comodin-1', 25],
      ],
    ),
  },

  remigio: {
    combinaciones: {
      tipo: 'jugadas',
      descripcion:
        'Una escalera de copas del 7 al Caballo, un grupo de cincos con comodín, y tres cuatros que no valen porque dos son de oros.',
      filas: [
        { nombre: 'Escalera', cartas: ['copas-7', 'copas-10', 'copas-11'] },
        { nombre: 'Grupo con comodín', cartas: ['oros-5', 'espadas-5', 'comodin-1'] },
        { nombre: 'No vale: dos de oros', cartas: ['oros-4', 'oros-4', 'copas-4'] },
      ],
      nota: 'Con dos barajas puede haber dos cartas iguales, pero un grupo no puede repetir palo.',
    },
  },

  ginRummy: {
    combinaciones: {
      tipo: 'jugadas',
      descripcion:
        'Un grupo de sietes y una escalera de corazones del As al 3; la Q, la K y el As de picas no forman escalera.',
      filas: [
        { nombre: 'Grupo', cartas: ['picas-7', 'corazones-7', 'treboles-7'] },
        { nombre: 'Escalera', cartas: ['corazones-1', 'corazones-2', 'corazones-3'] },
        { nombre: 'No vale: Q-K-A', cartas: ['picas-12', 'picas-13', 'picas-1'] },
      ],
    },
    cerrar: {
      tipo: 'jugadas',
      descripcion:
        'Una mano de 10 cartas con una escalera de diamantes del 4 al 8, un trío de nueves, y el 2 de picas y el 3 de tréboles sueltos: 5 puntos.',
      filas: [
        {
          nombre: 'Escalera',
          cartas: ['diamantes-4', 'diamantes-5', 'diamantes-6', 'diamantes-7', 'diamantes-8'],
        },
        { nombre: 'Grupo', cartas: ['picas-9', 'corazones-9', 'treboles-9'] },
        { nombre: 'Sueltas', cartas: ['picas-2', 'treboles-3'] },
      ],
      nota: 'Te quedan 5 puntos sueltos, 10 o menos: puedes cerrar.',
    },
  },

  rummy500: {
    combinaciones: {
      tipo: 'jugadas',
      descripcion:
        'El As puede ir arriba (Q-K-A de corazones) o abajo (A-2-3 de picas), pero K-A-2 de diamantes no vale.',
      filas: [
        { nombre: 'Escalera alta', cartas: ['corazones-12', 'corazones-13', 'corazones-1'] },
        { nombre: 'Escalera baja', cartas: ['picas-1', 'picas-2', 'picas-3'] },
        { nombre: 'No vale: K-A-2', cartas: ['diamantes-13', 'diamantes-1', 'diamantes-2'] },
      ],
    },
    descarte: {
      tipo: 'antesDespues',
      descripcion:
        'Coges el 5 de tréboles del descarte con las dos cartas que tiene encima, y bajas enseguida la escalera de tréboles del 5 al 7.',
      antes: [
        { nombre: 'Descarte', cartas: ['treboles-5', 'corazones-9', 'picas-2'] },
        { nombre: 'Tu mano', cartas: ['treboles-6', 'treboles-7', 'diamantes-12'] },
      ],
      despues: [
        { nombre: 'Descarte', cartas: [] },
        { nombre: 'Tu bajada', cartas: ['treboles-5', 'treboles-6', 'treboles-7'] },
        { nombre: 'Tu mano', cartas: ['diamantes-12', 'corazones-9', 'picas-2'] },
      ],
      resaltadas: ['treboles-5', 'corazones-9', 'picas-2'],
      explicacion:
        'Te llevas la carta que eliges y todas las de encima, y la de más abajo tienes que bajarla en ese turno.',
    },
  },

  canasta: {
    combinaciones: {
      tipo: 'jugadas',
      descripcion:
        'Una canasta limpia de sietes, una canasta sucia de reyes con un joker y un 2, una combinación de nueves con un 2, y tres cincos que no valen.',
      filas: [
        {
          nombre: 'Canasta limpia (500)',
          cartas: [
            'diamantes-7',
            'corazones-7',
            'picas-7',
            'treboles-7',
            'diamantes-7',
            'corazones-7',
            'picas-7',
          ],
        },
        {
          nombre: 'Canasta sucia (300)',
          cartas: [
            'picas-13',
            'corazones-13',
            'diamantes-13',
            'treboles-13',
            'picas-13',
            'comodin-1',
            'corazones-2',
          ],
        },
        { nombre: 'Combinación', cartas: ['picas-9', 'corazones-9', 'treboles-2'] },
        { nombre: 'No vale: un solo natural', cartas: ['treboles-5', 'comodin-2', 'picas-2'] },
      ],
    },
    pozo: {
      tipo: 'antesDespues',
      descripcion:
        'Arriba del pozo está el 8 de tréboles y tienes dos ochos: bajas los tres y te llevas el resto del pozo.',
      antes: [
        { nombre: 'Pozo', cartas: ['picas-4', 'diamantes-9', 'corazones-6', 'treboles-8'] },
        { nombre: 'Tu mano', cartas: ['picas-8', 'diamantes-8', 'corazones-5'] },
      ],
      despues: [
        { nombre: 'Pozo', cartas: [] },
        { nombre: 'Tu combinación', cartas: ['treboles-8', 'picas-8', 'diamantes-8'] },
        { nombre: 'Tu mano', cartas: ['corazones-5', 'picas-4', 'diamantes-9', 'corazones-6'] },
      ],
      resaltadas: ['treboles-8', 'picas-4', 'diamantes-9', 'corazones-6'],
      explicacion:
        'Para llevarte el pozo, la carta de arriba tiene que ir a la mesa en ese momento con cartas de tu mano.',
    },
  },

  handAndFoot: {
    libros: {
      tipo: 'jugadas',
      descripcion:
        'Un libro limpio de nueves, un libro sucio de damas con dos comodines, un libro de comodines, y siete jotas con cuatro comodines, que no valen.',
      filas: [
        {
          nombre: 'Libro limpio (500)',
          cartas: [
            'picas-9',
            'corazones-9',
            'diamantes-9',
            'treboles-9',
            'picas-9',
            'corazones-9',
            'diamantes-9',
          ],
        },
        {
          nombre: 'Libro sucio (300)',
          cartas: [
            'picas-12',
            'corazones-12',
            'diamantes-12',
            'treboles-12',
            'picas-12',
            'picas-2',
            'comodin-1',
          ],
        },
        {
          nombre: 'Libro de comodines (1500)',
          cartas: [
            'comodin-1',
            'comodin-2',
            'picas-2',
            'corazones-2',
            'diamantes-2',
            'treboles-2',
            'comodin-2',
          ],
        },
        {
          nombre: 'No vale: 4 comodines',
          cartas: [
            'picas-11',
            'corazones-11',
            'diamantes-11',
            'comodin-1',
            'comodin-2',
            'picas-2',
            'corazones-2',
          ],
        },
      ],
    },
    descarte: {
      tipo: 'antesDespues',
      descripcion:
        'Arriba del descarte está el 10 de corazones y tienes dos dieces: bajas los tres y te llevas las 6 cartas siguientes.',
      antes: [
        {
          nombre: 'Descarte',
          cartas: [
            'treboles-4',
            'picas-6',
            'diamantes-13',
            'corazones-5',
            'treboles-1',
            'picas-8',
            'diamantes-4',
            'corazones-10',
          ],
        },
        { nombre: 'Tu mano', cartas: ['picas-10', 'diamantes-10', 'treboles-7'] },
      ],
      despues: [
        { nombre: 'Descarte', cartas: ['treboles-4'] },
        { nombre: 'Tu combinación', cartas: ['corazones-10', 'picas-10', 'diamantes-10'] },
        {
          nombre: 'Tu mano',
          cartas: [
            'treboles-7',
            'picas-6',
            'diamantes-13',
            'corazones-5',
            'treboles-1',
            'picas-8',
            'diamantes-4',
          ],
        },
      ],
      resaltadas: [
        'corazones-10',
        'picas-6',
        'diamantes-13',
        'corazones-5',
        'treboles-1',
        'picas-8',
        'diamantes-4',
      ],
      explicacion: 'Solo puedes coger el descarte si tu pareja ya ha bajado.',
    },
  },

  conquian: {
    combinaciones: {
      tipo: 'jugadas',
      descripcion:
        'Una escalera de oros del 6 a la Sota, un grupo de reyes, y el Caballo, el Rey y el As de bastos, que no forman escalera.',
      filas: [
        { nombre: 'Escalera', cartas: ['oros-6', 'oros-7', 'oros-10'] },
        { nombre: 'Grupo', cartas: ['copas-12', 'espadas-12', 'bastos-12'] },
        { nombre: 'No vale: del Rey al As', cartas: ['bastos-11', 'bastos-12', 'bastos-1'] },
      ],
    },
    descubierta: {
      tipo: 'antesDespues',
      descripcion:
        'Se descubre el 5 de copas y tienes el 3 y el 4 de copas: la bajas con ellos en una escalera.',
      antes: [
        { nombre: 'Descubierta', cartas: ['copas-5'] },
        { nombre: 'Tu mano', cartas: ['copas-3', 'copas-4', 'oros-11'] },
      ],
      despues: [
        { nombre: 'Descubierta', cartas: [] },
        { nombre: 'Tu bajada', cartas: ['copas-3', 'copas-4', 'copas-5'] },
        { nombre: 'Tu mano', cartas: ['oros-11'] },
      ],
      resaltadas: ['copas-5'],
      explicacion: 'Después de usarla, descartas una carta, y tu rival puede usar tu descarte.',
    },
  },

  pinacle: {
    valores: valores(
      'Lo que vale cada carta: el comodín 30, el 2 20, el As 15, del 8 al K 10 y del 3 al 7 5.',
      [
        ['comodin-1', 30],
        ['picas-2', 20],
        ['picas-1', 15],
        ['picas-13', 10],
        ['picas-8', 10],
        ['picas-5', 5],
      ],
    ),
    combinaciones: {
      tipo: 'jugadas',
      descripcion:
        'Un grupo de nueves, una escalera de diamantes del 5 al 7 con un 2 en el sitio del 6, y un 10 con dos comodines, que no vale.',
      filas: [
        { nombre: 'Grupo', cartas: ['corazones-9', 'picas-9', 'treboles-9'] },
        { nombre: 'Escalera con comodín', cartas: ['diamantes-5', 'picas-2', 'diamantes-7'] },
        { nombre: 'No vale: dos comodines', cartas: ['picas-10', 'comodin-1', 'corazones-2'] },
      ],
      nota: 'Cada combinación lleva al menos 2 cartas normales.',
    },
  },

  cribbage: {
    jugar: {
      tipo: 'cartas',
      descripcion:
        'Se juegan el 4 de corazones, el 6 de picas y el 5 de diamantes: la cuenta llega a 15 y las tres cartas forman escalera.',
      cartas: [
        { id: 'corazones-4', etiqueta: '4' },
        { id: 'picas-6', etiqueta: '10' },
        { id: 'diamantes-5', etiqueta: '15' },
      ],
      resultado: '+5',
      nota: 'Quien echa el 5 suma 2 por llegar a 15 y 3 por la escalera del 4 al 6, aunque esté desordenada.',
    },
    recuento: {
      tipo: 'cartas',
      descripcion:
        'Una mano con el 5 de picas, el 5 de corazones, el 10 de diamantes y la J de tréboles, con el 4 de tréboles de starter: 11 puntos.',
      cartas: [
        { id: 'picas-5' },
        { id: 'corazones-5' },
        { id: 'diamantes-10' },
        { id: 'treboles-11' },
        { id: 'treboles-4', etiqueta: 'Starter' },
      ],
      resultado: '= 11',
      nota: 'Cuatro sumas de 15 (8), la pareja de cincos (2) y la J del palo del starter (1).',
    },
  },
};
