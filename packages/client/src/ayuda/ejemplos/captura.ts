import type { IdJuego } from '../../sesion/juegos';
import type { EjemplosJuego } from '../tipos';

/** Ejemplos de las guías de los juegos de captura. */
export const CAPTURA: Partial<Record<IdJuego, EjemplosJuego>> = {
  escoba: {
    sumas: {
      tipo: 'cartas',
      descripcion:
        'Lo que vale cada carta para sumar: el As 1, los números su valor, la Sota 8, el Caballo 9 y el Rey 10.',
      cartas: [
        { id: 'bastos-1', etiqueta: '1' },
        { id: 'bastos-5', etiqueta: '5' },
        { id: 'bastos-7', etiqueta: '7' },
        { id: 'bastos-10', etiqueta: '8' },
        { id: 'bastos-11', etiqueta: '9' },
        { id: 'bastos-12', etiqueta: '10' },
      ],
    },
    captura: {
      tipo: 'antesDespues',
      descripcion: 'Juegas el Caballo de oros (9) y recoges el 6 de copas: 9 + 6 = 15.',
      antes: [
        { nombre: 'Tu carta', cartas: ['oros-11'] },
        { nombre: 'Mesa', cartas: ['copas-6', 'espadas-3', 'bastos-2'] },
      ],
      despues: [
        { nombre: 'Mesa', cartas: ['espadas-3', 'bastos-2'] },
        { nombre: 'Tus cartas', cartas: ['oros-11', 'copas-6'] },
      ],
      resaltadas: ['oros-11', 'copas-6'],
      explicacion: 'El Caballo vale 9 y el 6 completa 15. El 3 y el 2 se quedan en la mesa.',
    },
    escoba: {
      tipo: 'antesDespues',
      descripcion:
        'Juegas el 7 de copas y recoges el 5 de oros y el 3 de bastos: 7 + 5 + 3 = 15 y la mesa queda vacía.',
      antes: [
        { nombre: 'Tu carta', cartas: ['copas-7'] },
        { nombre: 'Mesa', cartas: ['oros-5', 'bastos-3'] },
      ],
      despues: [
        { nombre: 'Mesa', cartas: [] },
        { nombre: 'Tus cartas', cartas: ['copas-7', 'oros-5', 'bastos-3'] },
      ],
      resaltadas: ['copas-7', 'oros-5', 'bastos-3'],
      explicacion: 'Suman 15 y no queda nada en la mesa: es escoba, 1 punto.',
    },
  },

  scopa: {
    captura: {
      tipo: 'antesDespues',
      descripcion:
        'Juegas el 7 de oros: en la mesa hay un 7 de copas, así que tienes que llevarte ese 7 y no el 3 y el 4.',
      antes: [
        { nombre: 'Tu carta', cartas: ['oros-7'] },
        { nombre: 'Mesa', cartas: ['copas-7', 'espadas-3', 'bastos-4'] },
      ],
      despues: [
        { nombre: 'Mesa', cartas: ['espadas-3', 'bastos-4'] },
        { nombre: 'Tus cartas', cartas: ['oros-7', 'copas-7'] },
      ],
      resaltadas: ['oros-7', 'copas-7'],
      explicacion:
        'Si hay una carta igual, hay que llevarse esa antes que una suma. Además, te llevas el settebello, el 7 de oros.',
    },
  },

  casino: {
    captura: {
      tipo: 'antesDespues',
      descripcion:
        'Juegas el 8 de tréboles y recoges el 5 de corazones y el 3 de picas, que suman 8.',
      antes: [
        { nombre: 'Tu carta', cartas: ['treboles-8'] },
        { nombre: 'Mesa', cartas: ['corazones-5', 'picas-3', 'diamantes-12'] },
      ],
      despues: [
        { nombre: 'Mesa', cartas: ['diamantes-12'] },
        { nombre: 'Tus cartas', cartas: ['treboles-8', 'corazones-5', 'picas-3'] },
      ],
      resaltadas: ['treboles-8', 'corazones-5', 'picas-3'],
      explicacion: 'Un 8 recoge cartas que sumen 8. La Q solo la recoge otra Q.',
    },
  },

  cuarenta: {
    captura: {
      tipo: 'antesDespues',
      descripcion:
        'Juegas el 5 de picas: te llevas el 5 de corazones y, en escalera, el 6, el 7 y la J. La mesa queda vacía: es limpia.',
      antes: [
        { nombre: 'Tu carta', cartas: ['picas-5'] },
        { nombre: 'Mesa', cartas: ['corazones-5', 'diamantes-6', 'treboles-7', 'picas-11'] },
      ],
      despues: [
        { nombre: 'Mesa', cartas: [] },
        {
          nombre: 'Tus cartas',
          cartas: ['picas-5', 'corazones-5', 'diamantes-6', 'treboles-7', 'picas-11'],
        },
      ],
      resaltadas: ['corazones-5', 'diamantes-6', 'treboles-7', 'picas-11'],
      explicacion: 'Después del 7 va la J. Dejar la mesa vacía es limpia: 2 puntos.',
    },
  },

  pishti: {
    pishti: {
      tipo: 'antesDespues',
      descripcion:
        'En el montón solo hay el 7 de corazones y echas el 7 de picas: te lo llevas y es pishti.',
      antes: [
        { nombre: 'Tu carta', cartas: ['picas-7'] },
        { nombre: 'Montón', cartas: ['corazones-7'] },
      ],
      despues: [
        { nombre: 'Montón', cartas: [] },
        { nombre: 'Tus cartas', cartas: ['picas-7', 'corazones-7'] },
      ],
      resaltadas: ['picas-7', 'corazones-7'],
      explicacion: 'Llevarte una carta sola con otra del mismo número es pishti: 10 puntos.',
    },
  },

  pesca: {
    pedir: {
      tipo: 'antesDespues',
      descripcion:
        'Pides los ochos al rival, te da los dos que tiene y bajas el cuarteto de ochos.',
      antes: [
        { nombre: 'Tu mano', cartas: ['corazones-8', 'picas-8', 'treboles-3'] },
        { nombre: 'Mano del rival', cartas: ['diamantes-8', 'treboles-8', 'corazones-2'] },
      ],
      despues: [
        { nombre: 'Tu mano', cartas: ['treboles-3'] },
        { nombre: 'Mano del rival', cartas: ['corazones-2'] },
        {
          nombre: 'Tu cuarteto',
          cartas: ['corazones-8', 'picas-8', 'diamantes-8', 'treboles-8'],
        },
      ],
      resaltadas: ['diamantes-8', 'treboles-8'],
      explicacion:
        'Como te los ha dado, vuelves a pedir. Las cartas del rival se ven aquí solo para el ejemplo.',
    },
  },
};
