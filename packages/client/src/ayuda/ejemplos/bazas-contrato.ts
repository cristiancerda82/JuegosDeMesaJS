import type { IdJuego } from '../../sesion/juegos';
import { T } from '../../textos';
import type { EjemplosJuego } from '../tipos';
import { baza, CUATRO, PAREJAS, TRES, valores } from './bazas-puntos';

const CINCO = ['Tú', 'Jugador 2', 'Jugador 3', 'Jugador 4', 'Jugador 5'] as const;

/** Ejemplos de las guías de los juegos de bazas con contrato o subasta. */
export const BAZAS_CONTRATO: Partial<Record<IdJuego, EjemplosJuego>> = {
  bridge: {
    baza: baza(
      'En sin triunfo sale el K de corazones, sigue el As de corazones, tu compañero echa el 2 de picas y el último el 3 de corazones: gana el As.',
      PAREJAS,
      ['corazones-13', 'corazones-1', 'picas-2', 'corazones-3'],
      undefined,
      1,
      'En sin triunfo siempre gana la más alta del palo de salida. El 2 de picas no es de corazones y no gana.',
    ),
    puntos: {
      tipo: 'tabla',
      descripcion: 'Lo que suman algunos contratos cumplidos y uno fallado.',
      titulo: 'Contrato y resultado → puntos',
      filas: [
        ['4♥ justo, no vulnerable (manga)', '4 × 30 + 300 = 420'],
        ['3 ST justo, vulnerable (manga)', '40 + 30 + 30 + 500 = 600'],
        ['2♣ con una baza de más (parcial)', '2 × 20 + 20 + 50 = 110'],
        ['4♠ con 2 bazas de menos, no vulnerable', '100 para el rival'],
      ],
    },
  },

  whist: {
    baza: baza(
      'Con triunfo de diamantes salen la Q y el As de tréboles; tu compañero, sin tréboles, echa el 2 de diamantes, y el último el 5 de tréboles: gana tu compañero.',
      PAREJAS,
      ['treboles-12', 'treboles-1', 'diamantes-2', 'treboles-5'],
      'diamantes',
      2,
      'Quien no tiene el palo de salida puede echar triunfo, y el más bajo gana al As de otro palo.',
    ),
  },

  picas: {
    baza: baza(
      'Salen el As y el K de corazones; tu compañero, sin corazones, echa el 2 de picas, y el último el 10 de corazones: gana el 2 de picas.',
      PAREJAS,
      ['corazones-1', 'corazones-13', 'picas-2', 'corazones-10'],
      'picas',
      2,
      'Las picas son siempre triunfo: la más baja gana a cualquier carta de otro palo.',
    ),
    puntos: {
      tipo: 'tabla',
      descripcion: 'Lo que suma una pareja con un contrato de 5 bazas, según las que hace.',
      titulo: 'Contrato 5 → bazas hechas → puntos',
      filas: [
        ['Hace 5', '+50'],
        ['Hace 7 (2 sacos)', '+52'],
        ['Hace 4', '−50'],
      ],
    },
  },

  ohHell: {
    baza: baza(
      'Con triunfo de tréboles sale el 10 de corazones, siguen la J de corazones y el 3 de tréboles: gana el 3.',
      TRES,
      ['corazones-10', 'corazones-11', 'treboles-3'],
      'treboles',
      2,
      'Quien no tiene el palo de salida puede echar un triunfo, y cualquier triunfo gana a las cartas de otro palo.',
    ),
  },

  pocha: {
    baza: baza(
      'Con triunfo de copas sale el 3 de oros, el siguiente echa el As de oros, el tercero falla con el 2 de copas y el último echa el Rey de oros: gana el 2 de copas.',
      CUATRO,
      ['oros-3', 'oros-1', 'copas-2', 'oros-12'],
      'copas',
      2,
      'Sin oros hay que echar triunfo: el 2 de copas gana al As de oros.',
    ),
    puntosPocha: {
      tipo: 'tabla',
      descripcion: 'Ejemplos de puntuación: aciertos y fallos según la apuesta y las bazas hechas.',
      titulo: T.pocha.ejemplo,
      filas: [
        ['2 / 2', T.pocha.puntos(20)],
        ['0 / 0', T.pocha.puntos(10)],
        ['1 / 3', T.pocha.puntos(-10)],
      ],
    },
  },

  fiveHundred: {
    triunfos: {
      tipo: 'cartas',
      descripcion:
        'Con triunfo de corazones, los triunfos más altos: el comodín, la J de corazones, la J de diamantes (del mismo color) y después el As, el K y la Q de corazones.',
      cartas: [
        { id: 'comodin-1', etiqueta: '1.º' },
        { id: 'corazones-11', etiqueta: '2.º' },
        { id: 'diamantes-11', etiqueta: '3.º' },
        { id: 'corazones-1', etiqueta: '4.º' },
        { id: 'corazones-13', etiqueta: '5.º' },
        { id: 'corazones-12', etiqueta: '6.º' },
      ],
      nota: 'La J de diamantes cuenta como un corazón, no como un diamante.',
    },
    pujas: {
      tipo: 'tabla',
      descripcion: 'Lo que valen algunas pujas.',
      titulo: 'Puja → valor',
      filas: [
        ['6 picas', '40'],
        ['7 corazones', '200'],
        ['8 sin triunfo', '320'],
        ['Misère', '250'],
        ['10 sin triunfo', '520'],
      ],
    },
  },

  tresillo: {
    matadores: {
      tipo: 'cartas',
      descripcion:
        'Con triunfo de oros, los tres matadores y el punto: la espadilla, la malilla (el 7 de oros), el basto y el As de oros.',
      cartas: [
        { id: 'espadas-1', etiqueta: T.ayuda.matadores[0] },
        { id: 'oros-7', etiqueta: T.ayuda.matadores[1] },
        { id: 'bastos-1', etiqueta: T.ayuda.matadores[2] },
        { id: 'oros-1', etiqueta: T.ayuda.matadores[3] },
      ],
      nota: 'Con triunfo de oros. Con espadas o bastos, la malilla es el 2.',
    },
    baza: baza(
      'Con triunfo de copas sale el Rey de oros, sigue el Caballo de oros y el último echa el basto: gana el basto.',
      TRES,
      ['oros-12', 'oros-11', 'bastos-1'],
      'copas',
      2,
      'El basto (el As de bastos) es siempre triunfo, sea cual sea el palo: gana al Rey de oros.',
    ),
  },

  twentyNine: {
    orden: valores('El orden de cada palo y lo que vale cada carta: J, 9, As, 10, K, Q, 8 y 7.', [
      ['picas-11', 3],
      ['picas-9', 2],
      ['picas-1', 1],
      ['picas-10', 1],
      ['picas-13', 0],
      ['picas-12', 0],
    ]),
    baza: baza(
      'Con el triunfo de picas ya descubierto salen el As y la J de diamantes, tu compañero echa el 9 de diamantes y el último el 7 de picas: gana el 7.',
      PAREJAS,
      ['diamantes-1', 'diamantes-11', 'diamantes-9', 'picas-7'],
      'picas',
      3,
      'Con el triunfo descubierto, el 7 de picas gana a la J de diamantes. Mientras el triunfo estaba oculto no habría ganado.',
    ),
  },

  briscolaChiamata: {
    valores: valores('Las cinco cartas que dan puntos, de la más fuerte a la más débil.', [
      ['copas-1', 11],
      ['copas-3', 10],
      ['copas-12', 4],
      ['copas-11', 3],
      ['copas-10', 2],
    ]),
    baza: baza(
      'Con triunfo de oros salen el 3 y el As de copas, el tercero echa el 2 de oros, el cuarto el Rey de copas y el quinto el 7 de oros: gana el 7 de oros.',
      CINCO,
      ['copas-3', 'copas-1', 'oros-2', 'copas-12', 'oros-7'],
      'oros',
      4,
      'No hay que seguir el palo. Los dos oros son triunfo, y el 7 es más fuerte que el 2.',
    ),
  },

  preference: {
    baza: baza(
      'Con triunfo de picas, sales con el As de corazones, sigue el 7 de corazones y el último, sin corazones, echa el 7 de picas: gana el 7 de picas.',
      TRES,
      ['corazones-1', 'corazones-7', 'picas-7'],
      'picas',
      2,
      'Sin el palo de salida hay que echar triunfo, y el triunfo más bajo gana al As.',
    ),
    contratos: {
      tipo: 'tabla',
      descripcion: 'Lo que vale cada contrato.',
      titulo: 'Contrato → valor',
      filas: [
        ['6 bazas', '2'],
        ['7 bazas', '4'],
        ['8 bazas', '6'],
        ['9 bazas', '8'],
        ['10 bazas', '10'],
        ['Miseria', '10'],
      ],
    },
  },

  tuteSubastado: {
    valores: valores(
      'Las cinco cartas que dan puntos, de la más fuerte a la más débil, como en el Tute.',
      [
        ['oros-1', 11],
        ['oros-3', 10],
        ['oros-12', 4],
        ['oros-11', 3],
        ['oros-10', 2],
      ],
    ),
    cante: {
      tipo: 'cartas',
      descripcion:
        'El Rey y el Caballo de copas: un cante de 20, o de 40 si las copas son el triunfo.',
      cartas: [{ id: 'copas-12' }, { id: 'copas-11' }],
      resultado: '= 20 / 40',
    },
    baza: baza(
      'Con triunfo de oros sale el Rey de copas, siguen el As, el 3 y el Caballo de copas: gana el As.',
      CUATRO,
      ['copas-12', 'copas-1', 'copas-3', 'copas-11'],
      'oros',
      1,
      'Hay que superar la carta que va ganando si se puede, aunque sea de un compañero; el As es la más fuerte.',
    ),
  },

  cuatrola: {
    matadores: {
      tipo: 'cartas',
      descripcion:
        'Con triunfo de oros, los cuatro matadores de mayor a menor: la espadilla, la malilla (el 7 de oros), el basto y el punto (el As de oros).',
      cartas: [
        { id: 'espadas-1', etiqueta: T.ayuda.matadores[0] },
        { id: 'oros-7', etiqueta: T.ayuda.matadores[1] },
        { id: 'bastos-1', etiqueta: T.ayuda.matadores[2] },
        { id: 'oros-1', etiqueta: T.ayuda.matadores[3] },
      ],
      nota: 'Con triunfo de oros. Son triunfo aunque sean de otro palo.',
    },
    baza: baza(
      'Con triunfo de oros salen el Rey y el 2 de copas, el tercero echa el basto y el último el As de copas: gana el basto.',
      CUATRO,
      ['copas-12', 'copas-2', 'bastos-1', 'copas-1'],
      'oros',
      2,
      'El basto es un matador: es triunfo, sea del palo que sea, y gana a todas las copas.',
    ),
  },

  julepe: {
    baza: baza(
      'Con triunfo de espadas salen el Rey y el As de oros, el tercero falla con el 2 de espadas y el último echa el 3 de oros: gana el 2 de espadas.',
      CUATRO,
      ['oros-12', 'oros-1', 'espadas-2', 'oros-3'],
      'espadas',
      2,
      'Sin oros hay que echar triunfo: el 2 de espadas, aunque es la carta más baja, gana a los oros.',
    ),
  },

  euchre: {
    jotas: {
      tipo: 'cartas',
      descripcion:
        'Con triunfo de corazones, los triunfos de mayor a menor: la J de corazones, la J de diamantes, el As, el K, la Q, el 10 y el 9 de corazones.',
      cartas: [
        { id: 'corazones-11', etiqueta: '1.º' },
        { id: 'diamantes-11', etiqueta: '2.º' },
        { id: 'corazones-1', etiqueta: '3.º' },
        { id: 'corazones-13', etiqueta: '4.º' },
        { id: 'corazones-12', etiqueta: '5.º' },
        { id: 'corazones-10', etiqueta: '6.º' },
        { id: 'corazones-9', etiqueta: '7.º' },
      ],
    },
    baza: baza(
      'Con triunfo de corazones salen el As y el K de diamantes, tu compañero echa la J de diamantes y el último el 9 de diamantes: gana la J.',
      PAREJAS,
      ['diamantes-1', 'diamantes-13', 'diamantes-11', 'diamantes-9'],
      'corazones',
      2,
      'Con corazones de triunfo, la J de diamantes es un corazón: gana como triunfo, por encima del As de diamantes.',
    ),
  },

  bourre: {
    baza: baza(
      'Con triunfo de picas salen el K y el As de tréboles, el tercero echa el 2 de picas, el cuarto el 5 de tréboles y el quinto el 10 de picas: gana el 10 de picas.',
      CINCO,
      ['treboles-13', 'treboles-1', 'picas-2', 'treboles-5', 'picas-10'],
      'picas',
      4,
      'Sin el palo hay que echar triunfo y superar el triunfo más alto si se puede: el 10 de picas gana al 2.',
    ),
  },

  tarot: {
    puntos: {
      tipo: 'cartas',
      descripcion:
        'Lo que vale cada carta: los oudlers y los Reyes 4,5; las Damas 3,5; los Caballos 2,5…',
      cartas: [
        { id: 'triunfo-21', etiqueta: '4,5' },
        { id: 'triunfo-1', etiqueta: '4,5' },
        { id: 'excusa', etiqueta: '4,5' },
        { id: 'corazones-13', etiqueta: '4,5' },
        { id: 'corazones-12', etiqueta: '3,5' },
        { id: 'corazones-14', etiqueta: '2,5' },
        { id: 'corazones-11', etiqueta: '1,5' },
        { id: 'corazones-7', etiqueta: '0,5' },
      ],
    },
    baza: {
      ...baza(
        'Sale el 5 de corazones, sigue el Rey de corazones, el tercero echa el triunfo 2 y el último el triunfo 15: gana el 15.',
        CUATRO,
        ['corazones-5', 'corazones-13', 'triunfo-2', 'triunfo-15'],
        undefined,
        3,
        'Sin corazones hay que jugar triunfo, y más alto que los que haya si se puede. El triunfo más alto gana la baza.',
      ),
      textoTriunfo: 'Triunfos: los 21 triunfos, del 1 al 21',
    },
  },
};
