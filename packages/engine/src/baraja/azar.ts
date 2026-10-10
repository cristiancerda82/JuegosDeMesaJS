/**
 * Generador pseudoaleatorio determinista: sfc32 sembrado con un hash cyrb128 de la semilla.
 * Solo usa aritmética entera de 32 bits, así que da la misma secuencia en cualquier motor de JS.
 * El estado son 4 enteros sin signo y se guarda dentro del estado de cada partida.
 */
export type EstadoAzar = readonly [number, number, number, number];

/** Valores descartados al crear el generador para mezclar bien semillas parecidas. */
const CALENTAMIENTO = 15;

function cyrb128(texto: string): EstadoAzar {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0; i < texto.length; i++) {
    const k = texto.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/**
 * Generador mutable para uso local dentro de una función (p. ej. un barajado).
 * Hacia afuera siempre se expone el estado inmutable con `estado()`.
 */
export class Generador {
  private a: number;
  private b: number;
  private c: number;
  private d: number;

  constructor(estado: EstadoAzar) {
    [this.a, this.b, this.c, this.d] = estado;
  }

  /** Entero sin signo de 32 bits. */
  siguiente(): number {
    const t = (((this.a + this.b) | 0) + this.d) | 0;
    this.d = (this.d + 1) | 0;
    this.a = this.b ^ (this.b >>> 9);
    this.b = (this.c + (this.c << 3)) | 0;
    this.c = (this.c << 21) | (this.c >>> 11);
    this.c = (this.c + t) | 0;
    return t >>> 0;
  }

  /** Entero uniforme en [0, n), sin sesgo de módulo (muestreo por rechazo). */
  enteroHasta(n: number): number {
    if (!Number.isInteger(n) || n <= 0 || n > 2 ** 32) {
      throw new RangeError(`enteroHasta: n inválido (${n})`);
    }
    const limite = 2 ** 32 - (2 ** 32 % n);
    let v = this.siguiente();
    while (v >= limite) v = this.siguiente();
    return v % n;
  }

  estado(): EstadoAzar {
    return [this.a >>> 0, this.b >>> 0, this.c >>> 0, this.d >>> 0];
  }
}

/** Crea el estado inicial del generador a partir de una semilla de texto. */
export function crearAzar(semilla: string): EstadoAzar {
  const g = new Generador(cyrb128(semilla));
  for (let i = 0; i < CALENTAMIENTO; i++) g.siguiente();
  return g.estado();
}

/** Versión pura: devuelve un entero de 32 bits y el estado siguiente. */
export function siguienteAzar(estado: EstadoAzar): { valor: number; azar: EstadoAzar } {
  const g = new Generador(estado);
  const valor = g.siguiente();
  return { valor, azar: g.estado() };
}
