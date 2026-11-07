import type { Palo } from '@juegos/engine';
import type { IdPropio } from './propios/catalogo';

/**
 * Modelo de tema de naipes (spec temas-naipes; design, decisión 1). Un tema dice cómo se ve cada
 * pieza de una carta de 100 × 140; `Carta.svelte` las coloca. Los índices de las esquinas y el
 * nombre accesible son iguales en todos los temas.
 */

export type Baraja = 'espanola' | 'francesa';

export type IdTema = 'minimal' | 'castizo' | 'napolitano' | 'victoriano' | IdPropio;

/** Una pieza de dibujo, en coordenadas de la carta (100 × 140). */
export type Pieza =
  | {
      readonly tipo: 'path';
      readonly d: string;
      readonly fill: string;
      readonly regla?: 'evenodd';
      readonly transform?: string;
    }
  | {
      readonly tipo: 'rect';
      readonly x: number;
      readonly y: number;
      readonly ancho: number;
      readonly alto: number;
      readonly rx: number;
      readonly fill: string;
      readonly opacidadRelleno?: number;
      readonly stroke?: string;
      readonly grosor?: number;
    }
  | {
      /** Un símbolo del sprite del tema (`<use href="#id">`), en la caja indicada. */
      readonly tipo: 'uso';
      readonly ref: string;
      readonly x: number;
      readonly y: number;
      readonly ancho: number;
      readonly alto: number;
      readonly transform?: string;
      /** Variables CSS para la paleta del símbolo (p. ej. `--ropa: #c0392b`). */
      readonly estilo?: string;
    };

export interface TemaNaipes {
  readonly id: IdTema;
  /** Color del papel y del canto. */
  readonly papel: string;
  readonly borde: string;
  readonly indice: {
    /** Familia tipográfica; sin ella, la de la carta (`system-ui`). */
    readonly fuente?: string;
    readonly peso: number;
    color(palo: Palo): string;
  };
  /** Símbolo del palo de la esquina, centrado en (cx, cy) con el tamaño dado. */
  paloEsquina(palo: Palo, cx: number, cy: number, tamano: number): Pieza;
  /** Marco de la carta (p. ej. las pintas del Castizo), o nada. */
  marco?(palo: Palo): readonly Pieza[];
  /** Todo lo que va dentro: numerales, as o figura. */
  cuerpo(palo: Palo, valor: number): readonly Pieza[];
  /**
   * Diseños que dibujan la carta entera (los propios del usuario): el símbolo de la carta, o
   * `null` si el diseño no la tiene y se dibuja con las piezas de arriba.
   */
  completa?(palo: Palo, valor: number): string | null;
  /** Símbolos (`<symbol>`) del tema, que se insertan una vez en el documento. */
  readonly sprite?: string;
}
