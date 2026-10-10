import { describe, expect, it } from 'vitest';
import { crearAzar } from '../../src/baraja/azar';
import { barajar } from '../../src/baraja/barajar';
import { crearBaraja } from '../../src/baraja/cartas';

describe('barajar', () => {
  const baraja = crearBaraja('francesa52');

  it('misma semilla, mismo orden', () => {
    const a = barajar(baraja, crearAzar('mesa-7'));
    const b = barajar(baraja, crearAzar('mesa-7'));
    expect(a.cartas).toEqual(b.cartas);
    expect(a.azar).toEqual(b.azar);
  });

  it('semillas distintas, órdenes distintos', () => {
    const a = barajar(baraja, crearAzar('mesa-7'));
    const b = barajar(baraja, crearAzar('mesa-8'));
    expect(a.cartas).not.toEqual(b.cartas);
  });

  it('conserva exactamente las mismas cartas y no modifica la entrada', () => {
    const copia = [...baraja];
    const { cartas } = barajar(baraja, crearAzar('conservar'));
    expect(baraja).toEqual(copia);
    expect(cartas).toHaveLength(baraja.length);
    expect([...cartas].sort()).toEqual([...baraja].sort());
  });

  it('el orden es estable entre versiones y plataformas', () => {
    // Si este test cambia, todas las partidas guardadas dejan de poder repetirse.
    const { cartas } = barajar(crearBaraja('espanola40'), crearAzar('JuegosDeMesaJS'));
    expect(cartas.slice(0, 8)).toMatchInlineSnapshot(`
      [
        "espadas-3",
        "copas-5",
        "espadas-4",
        "copas-3",
        "bastos-10",
        "oros-12",
        "bastos-11",
        "copas-10",
      ]
    `);
  });

  it('sin sesgo: cada carta aparece con la misma frecuencia en cada posición', () => {
    const n = 10;
    const repeticiones = 50_000;
    const esperado = repeticiones / n;
    const elementos = Array.from({ length: n }, (_, i) => i);
    const cuenta = elementos.map(() => new Array<number>(n).fill(0));
    for (let r = 0; r < repeticiones; r++) {
      const { cartas } = barajar(elementos, crearAzar(`sesgo-${r}`));
      cartas.forEach((elemento, posicion) => cuenta[elemento]![posicion]!++);
    }
    // Desvío estándar ≈ √(esperado·(1−1/n)) ≈ 67; se tolera un 6 % (≈ 4,5 σ).
    for (const fila of cuenta) {
      for (const valor of fila) {
        expect(Math.abs(valor - esperado)).toBeLessThan(esperado * 0.06);
      }
    }
  });
});
