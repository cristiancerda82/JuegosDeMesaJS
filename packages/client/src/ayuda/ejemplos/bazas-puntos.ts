import type { IdCarta } from '@juegos/engine';
import type { IdJuego } from '../../sesion/juegos';
import { T } from '../../textos';
import type { EjemploBaza, EjemploCartas, EjemplosJuego } from '../tipos';

/** Una fila de cartas con lo que vale cada una. */
export const valores = (
  descripcion: string,
  cartas: readonly (readonly [IdCarta, number])[],
  nota?: string,
): EjemploCartas => ({
  tipo: 'cartas',
  descripcion,
  cartas: cartas.map(([id, n]) => ({ id, etiqueta: T.ayuda.puntos(n) })),
  ...(nota ? { nota } : {}),
});

/** Los asientos, por orden de juego desde el tuyo. */
export const DOS = ['Tú', 'Rival'] as const;
export const TRES = ['Tú', 'Derecha', 'Izquierda'] as const;
export const PAREJAS = ['Tú', 'Derecha', 'Compañero', 'Izquierda'] as const;
export const CUATRO = ['Tú', 'Derecha', 'Enfrente', 'Izquierda'] as const;

/** Una baza: quién juega cada carta, por orden, y qué carta la gana. */
export const baza = (
  descripcion: string,
  quienes: readonly string[],
  cartas: readonly IdCarta[],
  triunfo: EjemploBaza['triunfo'],
  gana: number,
  porque: string,
  textoTriunfo?: string,
): EjemploBaza => ({
  tipo: 'baza',
  descripcion,
  jugadas: cartas.map((id, i) => ({ quien: quienes[i]!, id })),
  ...(triunfo ? { triunfo } : {}),
  ...(textoTriunfo ? { textoTriunfo } : {}),
  gana,
  porque,
});

/** Ejemplos de las guías de los juegos de bazas por puntos. */
export const BAZAS_PUNTOS: Partial<Record<IdJuego, EjemplosJuego>> = {
  brisca: {
    valores: valores('Las cinco cartas que dan puntos, de la más fuerte a la más débil.', [
      ['oros-1', 11],
      ['oros-3', 10],
      ['oros-12', 4],
      ['oros-11', 3],
      ['oros-10', 2],
    ]),
    baza: baza(
      'Con triunfo de copas, juegas el As de oros y el rival echa el 2 de copas: gana el rival.',
      DOS,
      ['oros-1', 'copas-2'],
      'copas-4',
      1,
      'El 2 de copas es triunfo: gana aunque sea la carta más baja, y se lleva los 11 puntos del As.',
    ),
  },

  tute: {
    valores: valores(
      'Las cinco cartas que dan puntos, de la más fuerte a la más débil, como en la Brisca.',
      [
        ['oros-1', 11],
        ['oros-3', 10],
        ['oros-12', 4],
        ['oros-11', 3],
        ['oros-10', 2],
      ],
    ),
    baza: baza(
      'Con triunfo de bastos sale el 3 de espadas, siguen el Rey y el As de espadas, y el último echa el 7 de oros: gana el As de tu compañero.',
      PAREJAS,
      ['espadas-3', 'espadas-12', 'espadas-1', 'oros-7'],
      'bastos',
      2,
      'Nadie ha echado triunfo: gana la carta más fuerte del palo que salió, el As de espadas. El 7 de oros no es de ese palo y no cuenta.',
    ),
    cante: {
      tipo: 'cartas',
      descripcion:
        'El Rey y el Caballo de copas: un cante de 20, o de 40 si las copas son el triunfo.',
      cartas: [{ id: 'copas-12' }, { id: 'copas-11' }],
      resultado: '= 20 / 40',
    },
  },

  guinote: {
    valoresGuinote: valores(
      'Las cinco cartas que dan puntos en el Guiñote: As, Tres, Rey, Sota y Caballo.',
      [
        ['oros-1', 11],
        ['oros-3', 10],
        ['oros-12', 4],
        ['oros-10', 3],
        ['oros-11', 2],
      ],
    ),
    baza: baza(
      'Juegas la Sota de oros y el rival el Caballo de oros: gana tu Sota.',
      DOS,
      ['oros-10', 'oros-11'],
      'bastos-5',
      0,
      'En el Guiñote la Sota es más fuerte que el Caballo, al revés que en el Tute.',
    ),
    canteGuinote: {
      tipo: 'cartas',
      descripcion:
        'El Rey y la Sota de copas: un cante de 20, o de 40 si las copas son el triunfo.',
      cartas: [{ id: 'copas-12' }, { id: 'copas-10' }],
      resultado: '= 20 / 40',
    },
  },

  tressette: {
    orden: {
      tipo: 'cartas',
      descripcion:
        'El orden de las cartas, de mayor a menor: 3, 2, As, Rey, Caballo, Sota, 7… El As vale 1 punto, y el 3, el 2 y las figuras un tercio.',
      cartas: [
        { id: 'oros-3', etiqueta: '⅓' },
        { id: 'oros-2', etiqueta: '⅓' },
        { id: 'oros-1', etiqueta: '1' },
        { id: 'oros-12', etiqueta: '⅓' },
        { id: 'oros-11', etiqueta: '⅓' },
        { id: 'oros-10', etiqueta: '⅓' },
        { id: 'oros-7', etiqueta: '0' },
      ],
      nota: 'Debajo de cada carta, lo que vale: los tercios se juntan de tres en tres para hacer un punto.',
    },
    baza: baza(
      'Sale el As de copas, siguen el 3 y el Rey de copas, y el último echa el 3 de oros: gana el 3 de copas.',
      PAREJAS,
      ['copas-1', 'copas-3', 'copas-12', 'oros-3'],
      undefined,
      1,
      'No hay triunfo: gana la más alta del palo de salida, y el 3 está por encima del As. El 3 de oros no es de copas y no gana.',
    ),
  },

  schnapsen: {
    valores: valores('Las cartas del Schnapsen, de mayor a menor, con sus puntos.', [
      ['corazones-1', 11],
      ['corazones-10', 10],
      ['corazones-13', 4],
      ['corazones-12', 3],
      ['corazones-11', 2],
    ]),
    baza: baza(
      'Con triunfo de picas, juegas el 10 de corazones y el rival el As de corazones: gana el rival.',
      DOS,
      ['corazones-10', 'corazones-1'],
      'picas',
      1,
      'Los dos son del palo de salida y el As es más alto que el 10. El rival se lleva 21 puntos.',
    ),
    cante: {
      tipo: 'cartas',
      descripcion:
        'El K y la Q de diamantes: un cante de 20, o de 40 si los diamantes son el triunfo.',
      cartas: [{ id: 'diamantes-13' }, { id: 'diamantes-12' }],
      resultado: '= 20 / 40',
    },
  },

  sixtySix: {
    valores: valores('Las cartas del Sixty-six, de mayor a menor, con sus puntos.', [
      ['corazones-1', 11],
      ['corazones-10', 10],
      ['corazones-13', 4],
      ['corazones-12', 3],
      ['corazones-11', 2],
      ['corazones-9', 0],
    ]),
    baza: baza(
      'Con triunfo de tréboles, el rival sale con el K de diamantes y tú echas el 9 de tréboles: ganas tú.',
      ['Rival', 'Tú'],
      ['diamantes-13', 'treboles-9'],
      'treboles',
      1,
      'Mientras queda mazo puedes jugar cualquier carta, y un triunfo, aunque sea el 9, gana a cualquier carta de otro palo.',
    ),
  },

  belote: {
    triunfo: valores(
      'En el palo de triunfo mandan la J y el 9; después, el As, el 10, el K, la Q, el 8 y el 7.',
      [
        ['corazones-11', 20],
        ['corazones-9', 14],
        ['corazones-1', 11],
        ['corazones-10', 10],
        ['corazones-13', 4],
        ['corazones-12', 3],
        ['corazones-8', 0],
      ],
      'Con triunfo de corazones. En los otros palos la J vale 2 y el 9 nada.',
    ),
    baza: baza(
      'Con triunfo de corazones salen el As, el 10 y el K de picas, y el último falla con el 7 de corazones: gana él.',
      PAREJAS,
      ['picas-1', 'picas-10', 'picas-13', 'corazones-7'],
      'corazones',
      3,
      'Quien no tiene el palo de salida tiene que fallar con triunfo, y el triunfo más bajo gana a cualquier carta de otro palo.',
    ),
    belote: {
      tipo: 'cartas',
      descripcion:
        'El K y la Q del triunfo en la misma mano: «Belote» y «Rebelote», 20 puntos para tu pareja.',
      cartas: [{ id: 'corazones-13' }, { id: 'corazones-12' }],
      resultado: '= 20',
    },
  },

  klaverjas: {
    baza: baza(
      'Con triunfo de picas salen el As y el 10 de tréboles; tu compañero falla con el 9 de picas y el último sube con la Jota de picas: gana él.',
      PAREJAS,
      ['treboles-1', 'treboles-10', 'picas-9', 'picas-11'],
      'picas',
      3,
      'En el triunfo la Jota es la más alta y el 9 la segunda. Si ya hay un triunfo en la baza, hay que echar uno más alto si se puede.',
    ),
    roem: {
      tipo: 'jugadas',
      descripcion:
        'El roem que se anota al ganar una baza con estas cartas, con triunfo de corazones.',
      filas: [
        { nombre: 'Escalera de 3: 20', cartas: ['picas-7', 'picas-8', 'picas-9'] },
        {
          nombre: 'Escalera de 4: 50',
          cartas: ['diamantes-10', 'diamantes-11', 'diamantes-12', 'diamantes-13'],
        },
        { nombre: 'Stuk (K y Q de triunfo): 20', cartas: ['corazones-13', 'corazones-12'] },
        {
          nombre: 'Cuatro Reyes: 100',
          cartas: ['picas-13', 'corazones-13', 'diamantes-13', 'treboles-13'],
        },
      ],
      nota: 'Con triunfo de corazones.',
    },
  },

  jass: {
    triunfo: valores(
      'En el palo de triunfo, la Jota (Buur) y el 9 (Nell) son las más altas.',
      [
        ['corazones-11', 20],
        ['corazones-9', 14],
        ['corazones-1', 11],
        ['corazones-13', 4],
        ['corazones-12', 3],
        ['corazones-10', 10],
      ],
      'Con triunfo de corazones, de mayor a menor. En los otros palos la Jota vale 2 y el 9 nada.',
    ),
    baza: baza(
      'En Obenabe sale el K de diamantes, siguen el As y el 6 de diamantes y el último echa el As de picas: gana el As de diamantes.',
      PAREJAS,
      ['diamantes-13', 'diamantes-1', 'diamantes-6', 'picas-1'],
      undefined,
      1,
      'En Obenabe no hay triunfo y el As es la más alta. El As de picas no es del palo de salida y no gana.',
    ),
    weis: {
      tipo: 'jugadas',
      descripcion: 'Declaraciones (Weis) que se anotan al acabar la primera baza.',
      filas: [
        { nombre: 'Tres seguidas: 20', cartas: ['treboles-6', 'treboles-7', 'treboles-8'] },
        {
          nombre: 'Cuatro seguidas: 50',
          cartas: ['picas-10', 'picas-11', 'picas-12', 'picas-13'],
        },
        {
          nombre: 'Cuatro nueves: 150',
          cartas: ['picas-9', 'corazones-9', 'diamantes-9', 'treboles-9'],
        },
        {
          nombre: 'Cuatro Jotas: 200',
          cartas: ['picas-11', 'corazones-11', 'diamantes-11', 'treboles-11'],
        },
      ],
    },
  },

  sueca: {
    valores: valores('Las cartas que dan puntos, de mayor a menor: el 7 gana al Rey.', [
      ['corazones-1', 11],
      ['corazones-7', 10],
      ['corazones-13', 4],
      ['corazones-11', 3],
      ['corazones-12', 2],
    ]),
    baza: baza(
      'Con triunfo de diamantes salen el K y el 7 de picas, y siguen la Q y el 2 de picas: gana el 7.',
      PAREJAS,
      ['picas-13', 'picas-7', 'picas-12', 'picas-2'],
      'diamantes',
      1,
      'En la Sueca el 7 es la segunda carta más alta, solo por debajo del As: gana al Rey.',
    ),
  },

  bezique: {
    cantes: {
      tipo: 'jugadas',
      descripcion: 'Algunos cantes del Bezique, con triunfo de picas.',
      filas: [
        { nombre: 'Matrimonio: 20', cartas: ['corazones-13', 'corazones-12'] },
        { nombre: 'Bézique: 40', cartas: ['picas-12', 'diamantes-11'] },
        {
          nombre: 'Cuatro Ases: 100',
          cartas: ['picas-1', 'corazones-1', 'diamantes-1', 'treboles-1'],
        },
        {
          nombre: 'Escalera de triunfo: 250',
          cartas: ['picas-1', 'picas-10', 'picas-13', 'picas-12', 'picas-11'],
        },
      ],
      nota: 'Con triunfo de picas. El matrimonio de triunfo vale 40.',
    },
    baza: baza(
      'El rival sale con el 10 de tréboles y tú echas el otro 10 de tréboles: gana el rival.',
      ['Rival', 'Tú'],
      ['treboles-10', 'treboles-10'],
      'diamantes',
      0,
      'Hay dos barajas: si las dos cartas son iguales, gana la primera que se jugó.',
    ),
  },

  skat: {
    jotas: {
      tipo: 'cartas',
      descripcion:
        'Con triunfo de corazones, los triunfos de mayor a menor: las cuatro J (tréboles, picas, corazones, diamantes) y después el As y el 10 de corazones.',
      cartas: [
        { id: 'treboles-11', etiqueta: '1.º' },
        { id: 'picas-11', etiqueta: '2.º' },
        { id: 'corazones-11', etiqueta: '3.º' },
        { id: 'diamantes-11', etiqueta: '4.º' },
        { id: 'corazones-1', etiqueta: '5.º' },
        { id: 'corazones-10', etiqueta: '6.º' },
      ],
    },
    baza: baza(
      'Con triunfo de tréboles juegas el As de corazones, sigue el 10 de corazones y el último echa la J de diamantes: gana la J.',
      TRES,
      ['corazones-1', 'corazones-10', 'diamantes-11'],
      'treboles',
      2,
      'Las J son siempre triunfo: la de diamantes, la más baja de las cuatro, gana al As de corazones.',
      'Triunfos: las cuatro J y los tréboles',
    ),
  },

  doppelkopf: {
    triunfos: {
      tipo: 'jugadas',
      descripcion: 'Los triunfos del juego normal, de mayor a menor.',
      filas: [
        { nombre: 'El 10 de corazones', cartas: ['corazones-10'] },
        {
          nombre: 'Las Damas',
          cartas: ['treboles-12', 'picas-12', 'corazones-12', 'diamantes-12'],
        },
        {
          nombre: 'Las Jotas',
          cartas: ['treboles-11', 'picas-11', 'corazones-11', 'diamantes-11'],
        },
        {
          nombre: 'Los diamantes',
          cartas: ['diamantes-1', 'diamantes-10', 'diamantes-13', 'diamantes-9'],
        },
      ],
    },
    baza: baza(
      'Sale la J de diamantes, sigue la Q de tréboles, después el 9 de diamantes y la otra Q de tréboles: gana la primera Q.',
      CUATRO,
      ['diamantes-11', 'treboles-12', 'diamantes-9', 'treboles-12'],
      undefined,
      1,
      'Las dos Damas de tréboles son iguales: gana la primera que se jugó. Quien la echó es del bando Re.',
      'Triunfos: el 10 de corazones, las Damas, las Jotas y los diamantes',
    ),
  },

  schafkopf: {
    triunfos: {
      tipo: 'jugadas',
      descripcion:
        'Los triunfos del Rufspiel, de mayor a menor: las damas, las jotas y los corazones.',
      filas: [
        {
          nombre: 'Las damas (Ober)',
          cartas: ['treboles-12', 'picas-12', 'corazones-12', 'diamantes-12'],
        },
        {
          nombre: 'Las jotas (Unter)',
          cartas: ['treboles-11', 'picas-11', 'corazones-11', 'diamantes-11'],
        },
        {
          nombre: 'Los corazones',
          cartas: [
            'corazones-1',
            'corazones-10',
            'corazones-13',
            'corazones-9',
            'corazones-8',
            'corazones-7',
          ],
        },
      ],
    },
    baza: baza(
      'En un Rufspiel salen el As y el rey de picas, el tercero echa el 7 de corazones y el último el 10 de picas: gana el 7.',
      CUATRO,
      ['picas-1', 'picas-13', 'corazones-7', 'picas-10'],
      'corazones',
      2,
      'En el Rufspiel los corazones son triunfo: hasta el 7 gana al As de picas.',
      'Triunfos: las damas, las jotas y los corazones',
    ),
  },

  sheepshead: {
    triunfos: {
      tipo: 'jugadas',
      descripcion: 'Los 14 triunfos, de mayor a menor: las Q, las J y los diamantes.',
      filas: [
        { nombre: 'Las Q', cartas: ['treboles-12', 'picas-12', 'corazones-12', 'diamantes-12'] },
        { nombre: 'Las J', cartas: ['treboles-11', 'picas-11', 'corazones-11', 'diamantes-11'] },
        {
          nombre: 'Los diamantes',
          cartas: [
            'diamantes-1',
            'diamantes-10',
            'diamantes-13',
            'diamantes-9',
            'diamantes-8',
            'diamantes-7',
          ],
        },
      ],
    },
    baza: baza(
      'Salen el As y el 10 de tréboles, el tercero echa el 7 de diamantes, el cuarto el K de tréboles y el quinto la J de picas: gana la J.',
      ['Tú', 'Jugador 2', 'Jugador 3', 'Jugador 4', 'Jugador 5'],
      ['treboles-1', 'treboles-10', 'diamantes-7', 'treboles-13', 'picas-11'],
      'diamantes',
      4,
      'El 7 de diamantes y la J de picas son triunfos, y la J es más alta. Los tréboles no ganan a un triunfo.',
      'Triunfos: las Q, las J y los diamantes',
    ),
  },

  tysiacha: {
    valores: valores('Las cartas, de mayor a menor, con sus puntos.', [
      ['picas-1', 11],
      ['picas-10', 10],
      ['picas-13', 4],
      ['picas-12', 3],
      ['picas-11', 2],
      ['picas-9', 0],
    ]),
    matrimonios: {
      tipo: 'jugadas',
      descripcion: 'Lo que vale cantar cada matrimonio (el K y la Q de un palo).',
      filas: [
        { nombre: 'Corazones: 100', cartas: ['corazones-13', 'corazones-12'] },
        { nombre: 'Diamantes: 80', cartas: ['diamantes-13', 'diamantes-12'] },
        { nombre: 'Tréboles: 60', cartas: ['treboles-13', 'treboles-12'] },
        { nombre: 'Picas: 40', cartas: ['picas-13', 'picas-12'] },
      ],
      nota: 'Al cantarlo, su palo pasa a ser el triunfo.',
    },
    baza: baza(
      'Todavía sin triunfo, sales con el 10 de picas, sigue el As de picas y el último echa el As de corazones: gana el As de picas.',
      TRES,
      ['picas-10', 'picas-1', 'corazones-1'],
      undefined,
      1,
      'Sin triunfo gana la más alta del palo de salida. El As de corazones no es de picas y no gana.',
    ),
  },

  piquet: {
    declaraciones: {
      tipo: 'jugadas',
      descripcion: 'Las tres declaraciones del Piquet, con lo que valen.',
      filas: [
        {
          nombre: 'Punto de 5: 5',
          cartas: ['corazones-1', 'corazones-13', 'corazones-11', 'corazones-9', 'corazones-7'],
        },
        {
          nombre: 'Secuencia de 5: 15',
          cartas: ['picas-9', 'picas-10', 'picas-11', 'picas-12', 'picas-13'],
        },
        {
          nombre: 'Conjunto de 4: 14',
          cartas: ['picas-12', 'corazones-12', 'diamantes-12', 'treboles-12'],
        },
        { nombre: 'Conjunto de 3: 3', cartas: ['picas-1', 'corazones-1', 'diamantes-1'] },
      ],
    },
    baza: baza(
      'Sales con el K de diamantes y el rival echa el As de diamantes: gana el rival.',
      DOS,
      ['diamantes-13', 'diamantes-1'],
      undefined,
      1,
      'No hay triunfo, y el As es la carta más alta de cada palo.',
    ),
  },

  ecarte: {
    orden: {
      tipo: 'cartas',
      descripcion: 'El orden de cada palo, de mayor a menor: K, Q, J, As, 10, 9, 8 y 7.',
      cartas: [
        { id: 'picas-13', etiqueta: '1.ª' },
        { id: 'picas-12', etiqueta: '2.ª' },
        { id: 'picas-11', etiqueta: '3.ª' },
        { id: 'picas-1', etiqueta: '4.ª' },
        { id: 'picas-10', etiqueta: '5.ª' },
        { id: 'picas-9', etiqueta: '6.ª' },
      ],
    },
    baza: baza(
      'Con triunfo de tréboles, sales con el As de corazones y el rival echa la J de corazones: gana el rival.',
      DOS,
      ['corazones-1', 'corazones-11'],
      'treboles',
      1,
      'En el Écarté el As va entre la J y el 10: la J le gana.',
    ),
  },

  butifarra: {
    valoresButifarra: valores(
      'Las cartas que dan puntos, de la más fuerte a la más débil: la manilla (el 9), el As, el Rey, el Caballo y la Sota.',
      [
        ['oros-9', 5],
        ['oros-1', 4],
        ['oros-12', 3],
        ['oros-11', 2],
        ['oros-10', 1],
      ],
    ),
    baza: baza(
      'Con triunfo de espadas, sales con el As de bastos y el siguiente echa el 9 de bastos: gana el 9.',
      PAREJAS,
      ['bastos-1', 'bastos-9', 'bastos-12', 'bastos-2'],
      'espadas',
      1,
      'La manilla, el 9, es la carta más fuerte de cada palo: gana al As.',
    ),
  },
};
