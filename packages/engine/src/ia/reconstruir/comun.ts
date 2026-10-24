import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import type { Asiento, Fin } from '../../motor/contrato';

/** Las cartas que no se ven, barajadas, para ir repartiéndolas entre los sitios ocultos. */
export class Ocultas<T> {
  #cartas: T[];

  constructor(cartas: readonly T[], azar: EstadoAzar) {
    this.#cartas = barajar(cartas, azar).cartas;
  }

  /** Las siguientes `n` cartas. */
  tomar(n: number): T[] {
    if (n > this.#cartas.length) throw new Error('No quedan cartas ocultas suficientes');
    return this.#cartas.splice(0, n);
  }

  /** Saca estas cartas concretas (que tienen que estar entre las ocultas). */
  sacar(cartas: readonly T[]): T[] {
    for (const c of cartas) {
      const i = this.#cartas.indexOf(c);
      if (i < 0) throw new Error('Esa carta no está entre las ocultas');
      this.#cartas.splice(i, 1);
    }
    return [...cartas];
  }

  /** Las que quedan, sin sacarlas. */
  get todas(): readonly T[] {
    return this.#cartas;
  }

  get quedan(): number {
    return this.#cartas.length;
  }
}

/** Manos de todos: la propia tal cual, y las demás con cartas ocultas del tamaño que se ve. */
export function manosOcultas<T>(
  cartasEnMano: readonly number[],
  asiento: Asiento | null,
  miMano: readonly T[] | null,
  ocultas: Ocultas<T>,
): T[][] {
  return cartasEnMano.map((n, a) => (a === asiento && miMano ? [...miMano] : ocultas.tomar(n)));
}

/** Extra al valorar una simulación en la que termina la partida: ganarla pesa más que la mano. */
export const BONO_PARTIDA = 1_000;

export function bonoPartida(fin: Fin | null, asiento: Asiento): number {
  if (fin === null || fin.empate) return 0;
  return fin.ganadores.includes(asiento) ? BONO_PARTIDA : -BONO_PARTIDA;
}
