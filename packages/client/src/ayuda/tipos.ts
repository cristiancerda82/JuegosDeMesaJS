import type { IdCarta, Palo } from '@juegos/engine';

/**
 * Ejemplos visuales de la guía «¿Cómo se juega?» (spec mesa-cliente, «Guía de cada juego»;
 * design de ejemplos-guias, decisión 1). Son datos: cada tipo tiene su componente.
 * `descripcion` es el texto que leen los lectores de pantalla.
 */
export type Ejemplo =
  EjemploCartas | EjemploJugadas | EjemploBaza | EjemploAntesDespues | EjemploTabla;

/** Una fila de cartas con una etiqueta por carta y, si procede, un resultado. */
export interface EjemploCartas {
  readonly tipo: 'cartas';
  readonly descripcion: string;
  readonly cartas: readonly { readonly id: IdCarta; readonly etiqueta?: string }[];
  readonly resultado?: string;
  /** Pie del ejemplo, debajo de las cartas. */
  readonly nota?: string;
}

/** Filas con nombre, ordenadas: las manos del póker, las combinaciones que se bajan… */
export interface EjemploJugadas {
  readonly tipo: 'jugadas';
  readonly descripcion: string;
  readonly filas: readonly { readonly nombre: string; readonly cartas: readonly IdCarta[] }[];
  readonly nota?: string;
}

/** Una baza: la carta de cada asiento, por orden de juego; `gana` es el índice de la ganadora. */
export interface EjemploBaza {
  readonly tipo: 'baza';
  readonly descripcion: string;
  readonly jugadas: readonly { readonly quien: string; readonly id: IdCarta }[];
  /** El palo de triunfo, o la carta que lo marca (la muestra); sin él, se juega sin triunfo. */
  readonly triunfo?: Palo | IdCarta;
  /** Sustituye a «Triunfo: …» cuando los triunfos no son un palo (Tarot, Doppelkopf…). */
  readonly textoTriunfo?: string;
  readonly gana: number;
  readonly porque: string;
}

/** Una zona pequeña de la mesa: una columna, la mano, el descarte… */
export interface Zona {
  readonly nombre: string;
  readonly cartas: readonly (IdCarta | null)[];
  /** `columna` solapa las cartas hacia abajo, como en un solitario; por defecto, en fila. */
  readonly forma?: 'fila' | 'columna';
}

/** Dos estados de la mesa con lo que cambia resaltado. */
export interface EjemploAntesDespues {
  readonly tipo: 'antesDespues';
  readonly descripcion: string;
  readonly antes: readonly Zona[];
  readonly despues: readonly Zona[];
  readonly resaltadas: readonly IdCarta[];
  readonly explicacion: string;
}

/** Una tabla de puntuación: cada fila es una situación y su resultado. */
export interface EjemploTabla {
  readonly tipo: 'tabla';
  readonly descripcion: string;
  readonly titulo: string;
  readonly filas: readonly (readonly [string, string])[];
}

/** Los ejemplos de un juego, por clave; las secciones de la guía los nombran por esa clave. */
export type EjemplosJuego = Readonly<Record<string, Ejemplo>>;
