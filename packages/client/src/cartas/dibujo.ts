import {
  cartaDeId,
  colorDe,
  esComodin,
  PALOS_FRANCESES,
  type IdCarta,
  type Palo,
  type PaloFrances,
} from '@juegos/engine';
import { T } from '../textos';

/**
 * Dibujo de los palos: un path por palo en una caja de 100 × 100, diseño propio.
 * `regla` es la fill-rule que necesita el path (los oros llevan huecos).
 */
export interface DibujoPalo {
  readonly d: string;
  readonly color: string;
  readonly regla?: 'evenodd';
}

const circulo = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

export const PALOS: Readonly<Record<Palo, DibujoPalo>> = {
  // Española: moneda con anillo.
  oros: {
    d: `${circulo(50, 50, 44)}${circulo(50, 50, 33)}${circulo(50, 50, 21)}${circulo(50, 50, 9)}`,
    color: '#c99a06',
    regla: 'evenodd',
  },
  // Española: copa con pie.
  copas: {
    d:
      'M16 10H84C84 44 70 58 57 61V75C67 77 75 82 77 92H23C25 82 33 77 43 75V61C30 58 16 44 16 10Z' +
      'M26 18C28 38 37 48 50 51C63 48 72 38 74 18Z',
    color: '#c0392b',
    regla: 'evenodd',
  },
  // Española: espada vertical con guarda y pomo.
  espadas: {
    d: 'M50 2L57 14V64H43V14Z' + 'M24 64H76V73H24Z' + 'M45 73H55V89H45Z' + circulo(50, 93, 6),
    color: '#1f5fa0',
  },
  // Española: bastón nudoso.
  bastos: {
    d:
      'M41 9C41 2 59 2 59 9L61 28C69 30 69 41 61 43L59 58C67 60 67 71 59 73L57 92' +
      'C57 99 43 99 43 92L41 73C33 71 33 60 41 58L39 43C31 41 31 30 39 28Z',
    color: '#1e7d46',
  },
  // Francesa.
  picas: {
    d:
      'M50 4C36 24 8 38 8 60C8 74 19 82 30 82C38 82 44 78 47 72C46 82 42 90 33 96H67' +
      'C58 90 54 82 53 72C56 78 62 82 70 82C81 82 92 74 92 60C92 38 64 24 50 4Z',
    color: '#1f2328',
  },
  corazones: {
    d: 'M50 90C20 66 5 49 5 30C5 15 17 5 30 5C40 5 47 11 50 20C53 11 60 5 70 5C83 5 95 15 95 30C95 49 80 66 50 90Z',
    color: '#c62828',
  },
  diamantes: {
    d: 'M50 3L87 50L50 97L13 50Z',
    color: '#c62828',
  },
  treboles: {
    d:
      circulo(50, 27, 19) +
      circulo(27, 57, 19) +
      circulo(73, 57, 19) +
      'M40 40H60V64H40Z' +
      'M46 55H54L62 96H38Z',
    color: '#1f2328',
  },
};

export const esFrancesa = (palo: Palo): palo is PaloFrances =>
  (PALOS_FRANCESES as readonly Palo[]).includes(palo);

/** Texto del índice de la esquina: números en la española, A/J/Q/K en la francesa. */
export function indice(palo: Palo, valor: number): string {
  if (!esFrancesa(palo)) return String(valor);
  return ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' } as Record<number, string>)[valor] ?? String(valor);
}

/**
 * Iconos de las figuras, en una caja de 100 × 100 y con diseño propio. Cada uno son capas:
 * la silueta en el color del palo y encima los detalles en el color del papel.
 */
export interface CapaIcono {
  readonly d: string;
  readonly relleno: 'tinta' | 'papel';
}

export type Figura = 'rey' | 'reina' | 'caballo' | 'sota';

export const FIGURAS: Readonly<Record<Figura, readonly CapaIcono[]>> = {
  // Corona de tres puntas con joyas.
  rey: [
    {
      relleno: 'tinta',
      d:
        'M14 70L10 30L32 50L50 18L68 50L90 30L86 70Z' +
        'M14 74H86V88H14Z' +
        circulo(10, 26, 6) +
        circulo(50, 13, 6) +
        circulo(90, 26, 6),
    },
    {
      relleno: 'papel',
      d: `${circulo(32, 81, 4)}${circulo(50, 81, 4)}${circulo(68, 81, 4)}M50 42L56 54L50 66L44 54Z`,
    },
  ],
  // Tiara de arcos con una perla.
  reina: [
    {
      relleno: 'tinta',
      d:
        'M12 76C12 52 26 50 32 58C36 40 44 30 50 26C56 30 64 40 68 58C74 50 88 52 88 76Z' +
        'M12 79H88V91H12Z' +
        circulo(50, 17, 7),
    },
    {
      relleno: 'papel',
      d: `${circulo(30, 85, 3.5)}${circulo(50, 85, 3.5)}${circulo(70, 85, 3.5)}${circulo(50, 56, 6)}`,
    },
  ],
  // Cabeza de caballo de perfil, mirando a la izquierda.
  caballo: [
    {
      relleno: 'tinta',
      d:
        'M64 6L60 19C46 20 32 26 24 38L9 55C5 61 8 69 16 69C22 69 28 65 34 63C38 62 41 65 40 69' +
        'L34 94H88C90 72 88 50 82 36C80 28 78 20 80 8L71 18Z',
    },
    {
      relleno: 'papel',
      d:
        circulo(50, 35, 4.5) +
        circulo(17, 58, 2.5) +
        'M12 64L26 62V65L12 66.5Z' +
        'M74 26L88 46L85 49L71 30Z' +
        'M79 52L89 66L86 69L76 55Z',
    },
  ],
  // Paje con sombrero de pluma (sota y jota).
  sota: [
    {
      relleno: 'tinta',
      d:
        circulo(50, 42, 12) +
        'M34 31C34 16 66 16 66 31Z' +
        'M27 31H73V36H27Z' +
        'M62 21C70 9 84 4 93 4C87 14 77 21 64 25Z' +
        'M24 95C24 71 35 59 50 59C65 59 76 71 76 95Z',
    },
    {
      relleno: 'papel',
      d: `M38 63L50 74L62 63L59 61L50 69L41 61Z${circulo(50, 81, 2.5)}${circulo(50, 89, 2.5)}`,
    },
  ],
};

// ── Comodín ──────────────────────────────────────────────────────────────────

export const COLOR_COMODIN = '#6a1b9a';

/** Estrella de cinco puntas para las esquinas del comodín (caja de 100 × 100). */
export const ESTRELLA = 'M50 4L61 38H97L68 59L79 94L50 72L21 94L32 59L3 38H39Z';

/** Gorro de bufón con tres puntas y cascabeles, con la banda en dorado. */
export const COMODIN: readonly {
  readonly d: string;
  readonly relleno: 'tinta' | 'oro' | 'papel';
}[] = [
  {
    relleno: 'tinta',
    d:
      'M18 74C20 58 16 50 6 44C22 36 32 44 38 54C40 36 44 22 50 10C56 22 60 36 62 54' +
      'C68 44 78 36 94 44C84 50 80 58 82 74Z',
  },
  {
    relleno: 'oro',
    d: `M8 74H92V88H8Z${circulo(6, 44, 7)}${circulo(50, 7, 7)}${circulo(94, 44, 7)}`,
  },
  {
    relleno: 'papel',
    d: `${circulo(26, 81, 3.5)}${circulo(50, 81, 3.5)}${circulo(74, 81, 3.5)}`,
  },
];

/** Figura que lleva la carta, o `null` si no es figura. */
export function figuraDe(palo: Palo, valor: number): Figura | null {
  const figuras: Record<number, Figura> = esFrancesa(palo)
    ? { 11: 'sota', 12: 'reina', 13: 'rey' }
    : { 10: 'sota', 11: 'caballo', 12: 'rey' };
  return figuras[valor] ?? null;
}

export function colorTinta(palo: Palo): string {
  if (esFrancesa(palo)) return colorDe(palo) === 'rojo' ? '#c62828' : '#1f2328';
  return PALOS[palo].color;
}

/** Nombre accesible de la carta, p. ej. "Caballo de copas" o "7 de picas". */
export function nombreCarta(id: IdCarta): string {
  const carta = cartaDeId(id);
  if (carta === null) return esComodin(id) ? T.cartas.comodin : id;
  const figuras = esFrancesa(carta.palo) ? T.cartas.figurasFrancesas : T.cartas.figurasEspanolas;
  const valor = figuras[carta.valor] ?? (carta.valor === 1 ? T.cartas.as : String(carta.valor));
  return T.cartas.nombre(valor, T.cartas.palos[carta.palo] ?? carta.palo);
}

/**
 * Posiciones de los símbolos de los numerales en una carta de 100 × 140 (centro de cada uno).
 * El as lleva un único símbolo grande, que se dibuja aparte.
 */
const PIPS: Readonly<Record<number, readonly (readonly [number, number])[]>> = {
  2: [
    [50, 36],
    [50, 104],
  ],
  3: [
    [50, 36],
    [50, 70],
    [50, 104],
  ],
  4: [
    [33, 36],
    [67, 36],
    [33, 104],
    [67, 104],
  ],
  5: [
    [33, 36],
    [67, 36],
    [50, 70],
    [33, 104],
    [67, 104],
  ],
  6: [
    [33, 36],
    [67, 36],
    [33, 70],
    [67, 70],
    [33, 104],
    [67, 104],
  ],
  7: [
    [33, 36],
    [67, 36],
    [50, 53],
    [33, 70],
    [67, 70],
    [33, 104],
    [67, 104],
  ],
  8: [
    [33, 36],
    [67, 36],
    [50, 53],
    [33, 70],
    [67, 70],
    [50, 87],
    [33, 104],
    [67, 104],
  ],
  9: [
    [33, 32],
    [67, 32],
    [33, 56],
    [67, 56],
    [50, 70],
    [33, 84],
    [67, 84],
    [33, 108],
    [67, 108],
  ],
  10: [
    [33, 32],
    [67, 32],
    [50, 44],
    [33, 56],
    [67, 56],
    [33, 84],
    [67, 84],
    [50, 96],
    [33, 108],
    [67, 108],
  ],
};

export function pips(valor: number): readonly (readonly [number, number])[] {
  return PIPS[valor] ?? [];
}

/** Transformación que coloca un path de 100 × 100 centrado en (cx, cy) con el tamaño dado. */
export function colocar(cx: number, cy: number, tamano: number): string {
  return `translate(${cx - tamano / 2} ${cy - tamano / 2}) scale(${tamano / 100})`;
}
