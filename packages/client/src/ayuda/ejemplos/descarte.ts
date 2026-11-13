import type { IdJuego } from '../../sesion/juegos';
import type { EjemplosJuego } from '../tipos';
import { valores } from './bazas-puntos';

/** Ejemplos de las guías de los juegos de descarte. */
export const DESCARTE: Partial<Record<IdJuego, EjemplosJuego>> = {
  ochoLoco: {
    jugar: {
      tipo: 'cartas',
      descripcion:
        'Arriba está el 9 de corazones: valen el 2 de corazones, el 9 de picas y cualquier 8, pero no el 5 de picas.',
      cartas: [
        { id: 'corazones-9', etiqueta: 'Arriba' },
        { id: 'corazones-2', etiqueta: 'Vale' },
        { id: 'picas-9', etiqueta: 'Vale' },
        { id: 'treboles-8', etiqueta: 'Vale' },
        { id: 'picas-5', etiqueta: 'No vale' },
      ],
    },
    puntos: valores(
      'Lo que vale cada carta que se queda en la mano: el 8 50, las figuras 10, el As 1 y el resto su número.',
      [
        ['treboles-8', 50],
        ['picas-13', 10],
        ['corazones-6', 6],
        ['diamantes-1', 1],
      ],
    ),
  },

  culo: {
    orden: {
      tipo: 'cartas',
      descripcion: 'Algunas cartas de menor a mayor: el 3, el 7, la Sota, el Rey, el As y el 2.',
      cartas: [
        { id: 'oros-3' },
        { id: 'copas-7' },
        { id: 'espadas-10' },
        { id: 'bastos-12' },
        { id: 'oros-1' },
        { id: 'copas-2' },
      ],
      nota: 'De menor a mayor: el 2 es la carta más alta.',
    },
    ronda: {
      tipo: 'antesDespues',
      descripcion: 'En la mesa hay una pareja de cincos y la superas con una pareja de caballos.',
      antes: [
        { nombre: 'Mesa', cartas: ['oros-5', 'copas-5'] },
        { nombre: 'Tu mano', cartas: ['espadas-11', 'bastos-11', 'oros-3'] },
      ],
      despues: [
        { nombre: 'Mesa', cartas: ['espadas-11', 'bastos-11'] },
        { nombre: 'Tu mano', cartas: ['oros-3'] },
      ],
      resaltadas: ['espadas-11', 'bastos-11'],
      explicacion:
        'Hay que jugar el mismo número de cartas, y de un valor más alto. Un 3 solo no vale sobre una pareja.',
    },
  },

  bigTwo: {
    orden: {
      tipo: 'cartas',
      descripcion:
        'Algunas cartas de menor a mayor: el 3 de diamantes, la K de tréboles, el As de corazones, el 2 de diamantes y el 2 de picas.',
      cartas: [
        { id: 'diamantes-3' },
        { id: 'treboles-13' },
        { id: 'corazones-1' },
        { id: 'diamantes-2' },
        { id: 'picas-2' },
      ],
      nota: 'El 2 es la carta más alta y, entre dos doses, gana el de picas.',
    },
    jugadas: {
      tipo: 'jugadas',
      descripcion:
        'Las jugadas de 5 cartas, de mayor a menor: escalera de color, póker, full, color y escalera.',
      filas: [
        {
          nombre: 'Escalera de color',
          cartas: ['corazones-5', 'corazones-6', 'corazones-7', 'corazones-8', 'corazones-9'],
        },
        {
          nombre: 'Póker',
          cartas: ['picas-4', 'corazones-4', 'diamantes-4', 'treboles-4', 'picas-9'],
        },
        {
          nombre: 'Full',
          cartas: ['picas-10', 'corazones-10', 'diamantes-10', 'picas-6', 'treboles-6'],
        },
        {
          nombre: 'Color',
          cartas: ['treboles-3', 'treboles-7', 'treboles-9', 'treboles-11', 'treboles-13'],
        },
        {
          nombre: 'Escalera',
          cartas: ['diamantes-8', 'picas-9', 'diamantes-10', 'treboles-11', 'corazones-12'],
        },
      ],
    },
  },

  durak: {
    defensa: {
      tipo: 'baza',
      descripcion:
        'Con triunfo de picas, te atacan con el 10 de diamantes y lo ganas con el As de diamantes.',
      jugadas: [
        { quien: 'Ataque', id: 'diamantes-10' },
        { quien: 'Defensa', id: 'diamantes-1' },
      ],
      triunfo: 'picas',
      gana: 1,
      porque: 'Una carta más alta del mismo palo gana el ataque.',
    },
    triunfo: {
      tipo: 'baza',
      descripcion:
        'Con triunfo de picas, te atacan con el As de corazones y lo ganas con el 6 de picas.',
      jugadas: [
        { quien: 'Ataque', id: 'corazones-1' },
        { quien: 'Defensa', id: 'picas-6' },
      ],
      triunfo: 'picas',
      gana: 1,
      porque: 'Cualquier triunfo gana a una carta de otro palo, aunque sea el As.',
    },
  },

  cinquillo: {
    escalera: {
      tipo: 'antesDespues',
      descripcion: 'La escalera de copas va del 4 al 7: pones la Sota de copas por arriba.',
      antes: [
        { nombre: 'Copas', cartas: ['copas-4', 'copas-5', 'copas-6', 'copas-7'] },
        { nombre: 'Tu mano', cartas: ['copas-10', 'copas-2', 'oros-11'] },
      ],
      despues: [
        { nombre: 'Copas', cartas: ['copas-4', 'copas-5', 'copas-6', 'copas-7', 'copas-10'] },
        { nombre: 'Tu mano', cartas: ['copas-2', 'oros-11'] },
      ],
      resaltadas: ['copas-10'],
      explicacion:
        'Después del 7 va la Sota. El 2 de copas aún no entra (falta el 3), y el Caballo de oros espera al 5 de oros.',
    },
  },

  sevens: {
    escalera: {
      tipo: 'antesDespues',
      descripcion: 'La escalera de corazones va del 6 al 8: pones el 9 de corazones por arriba.',
      antes: [
        { nombre: 'Corazones', cartas: ['corazones-6', 'corazones-7', 'corazones-8'] },
        { nombre: 'Tu mano', cartas: ['corazones-9', 'corazones-4', 'picas-5'] },
      ],
      despues: [
        {
          nombre: 'Corazones',
          cartas: ['corazones-6', 'corazones-7', 'corazones-8', 'corazones-9'],
        },
        { nombre: 'Tu mano', cartas: ['corazones-4', 'picas-5'] },
      ],
      resaltadas: ['corazones-9'],
      explicacion:
        'Siempre la carta justo siguiente: el 4 de corazones espera al 5, y el 5 de picas al 7 de picas.',
    },
  },

  mentiroso: {
    bajar: {
      tipo: 'cartas',
      descripcion: 'Tocan reyes y dices que bajas tres: dos son reyes y la tercera es un 4.',
      cartas: [
        { id: 'picas-13', etiqueta: 'Rey' },
        { id: 'corazones-13', etiqueta: 'Rey' },
        { id: 'diamantes-4', etiqueta: 'Mentira' },
      ],
      nota: 'Si alguien dice «¡Mentiroso!», se descubren: el 4 no es un rey y te llevas el montón.',
    },
  },

  burro: {
    pasar: {
      tipo: 'antesDespues',
      descripcion: 'Pasas el 2 de bastos y recibes el 7 de bastos: ya tienes los cuatro sietes.',
      antes: [
        { nombre: 'Tu mano', cartas: ['oros-7', 'copas-7', 'espadas-7', 'bastos-2'] },
        { nombre: 'Te pasan', cartas: ['bastos-7'] },
      ],
      despues: [
        { nombre: 'Tu mano', cartas: ['oros-7', 'copas-7', 'espadas-7', 'bastos-7'] },
        { nombre: 'Pasas', cartas: ['bastos-2'] },
      ],
      resaltadas: ['bastos-7'],
      explicacion: 'Con 4 cartas iguales, ¡plántate!',
    },
  },

  kingsCorner: {
    pilas: {
      tipo: 'antesDespues',
      descripcion:
        'Pones el 6 de tréboles sobre el 7 de corazones y la K de picas en una esquina vacía; el 6 de diamantes no encaja.',
      antes: [
        { nombre: 'Pila', cartas: ['picas-8', 'corazones-7'], forma: 'columna' },
        { nombre: 'Esquina', cartas: [] },
        { nombre: 'Tu mano', cartas: ['treboles-6', 'diamantes-6', 'picas-13'] },
      ],
      despues: [
        { nombre: 'Pila', cartas: ['picas-8', 'corazones-7', 'treboles-6'], forma: 'columna' },
        { nombre: 'Esquina', cartas: ['picas-13'] },
        { nombre: 'Tu mano', cartas: ['diamantes-6'] },
      ],
      resaltadas: ['treboles-6', 'picas-13'],
      explicacion:
        'Sobre el 7 rojo va un 6 negro. El 6 de diamantes es rojo, como el 7. Las esquinas solo se empiezan con una K.',
    },
  },

  spiteMalice: {
    escaleras: {
      tipo: 'antesDespues',
      descripcion:
        'La escalera va del As al 3: juegas la K de picas como 4 y después el 5 de tu montón.',
      antes: [
        { nombre: 'Escalera', cartas: ['corazones-1', 'picas-2', 'diamantes-3'] },
        { nombre: 'Tu mano', cartas: ['picas-13', 'corazones-9'] },
        { nombre: 'Tu montón', cartas: ['diamantes-5'] },
      ],
      despues: [
        {
          nombre: 'Escalera',
          cartas: ['corazones-1', 'picas-2', 'diamantes-3', 'picas-13', 'diamantes-5'],
        },
        { nombre: 'Tu mano', cartas: ['corazones-9'] },
        { nombre: 'Tu montón', cartas: ['treboles-10'] },
      ],
      resaltadas: ['picas-13', 'diamantes-5'],
      explicacion:
        'La K vale la carta que haga falta. Al jugar la de tu montón, se descubre la siguiente.',
    },
  },
};
