import { describe, expect, it } from 'vitest';
import { crearAzar, Generador, siguienteAzar } from '../../src/baraja/azar';

function secuencia(semilla: string, n: number): number[] {
  const g = new Generador(crearAzar(semilla));
  return Array.from({ length: n }, () => g.siguiente());
}

describe('azar', () => {
  it('la misma semilla da la misma secuencia', () => {
    expect(secuencia('partida-1', 20)).toEqual(secuencia('partida-1', 20));
  });

  it('semillas distintas dan secuencias distintas', () => {
    expect(secuencia('partida-1', 5)).not.toEqual(secuencia('partida-2', 5));
  });

  it('la secuencia es estable entre versiones y plataformas', () => {
    // Si este test cambia, todas las partidas guardadas dejan de poder repetirse.
    expect(secuencia('JuegosDeMesaJS', 5)).toMatchInlineSnapshot(`
      [
        2872745333,
        3464113902,
        2184216421,
        3169950882,
        878561413,
      ]
    `);
  });

  it('produce enteros sin signo de 32 bits', () => {
    for (const v of secuencia('rango', 1000)) {
      expect(Number.isInteger(v) && v >= 0 && v < 2 ** 32).toBe(true);
    }
  });

  it('el estado es serializable y retoma la secuencia', () => {
    const g = new Generador(crearAzar('serializar'));
    g.siguiente();
    const copia = new Generador(JSON.parse(JSON.stringify(g.estado())));
    expect(copia.siguiente()).toBe(g.siguiente());
  });

  it('siguienteAzar no modifica el estado recibido', () => {
    const inicial = crearAzar('puro');
    const antes = [...inicial];
    const { azar } = siguienteAzar(inicial);
    expect(inicial).toEqual(antes);
    expect(azar).not.toEqual(inicial);
  });

  it('enteroHasta respeta el rango y rechaza n inválido', () => {
    const g = new Generador(crearAzar('entero'));
    for (let i = 0; i < 1000; i++) {
      const v = g.enteroHasta(7);
      expect(v >= 0 && v < 7).toBe(true);
    }
    expect(() => g.enteroHasta(0)).toThrow(RangeError);
    expect(() => g.enteroHasta(2.5)).toThrow(RangeError);
  });
});
