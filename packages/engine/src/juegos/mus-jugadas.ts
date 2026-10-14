import { cartaDeId, type IdCarta } from '../baraja/cartas';
import type { Asiento } from '../motor/contrato';

/**
 * Jugadas del Mus: cómo se valora una mano en cada lance. Son funciones puras; con ocho reyes
 * (`reyes: 8`) los treses cuentan como reyes y los doses como ases.
 */

export type LanceMus = 'grande' | 'chica' | 'pares' | 'juego' | 'punto';
export type Reyes = 8 | 4;

const REY = 12;
const AS = 1;

/** Valor de la carta para comparar: de 1 (As) a 12 (Rey). Con ocho reyes, el 3 es 12 y el 2 es 1. */
export function rango(carta: IdCarta, reyes: Reyes = 8): number {
  const valor = cartaDeId(carta)!.valor;
  if (reyes === 8 && valor === 3) return REY;
  if (reyes === 8 && valor === 2) return AS;
  return valor;
}

/** Lo que vale la carta para el Juego y el Punto: las figuras 10, el resto su número. */
export const valorJuego = (carta: IdCarta, reyes: Reyes = 8) => {
  const r = rango(carta, reyes);
  return r >= 10 ? 10 : r;
};

export const puntosJuego = (mano: readonly IdCarta[], reyes: Reyes = 8) =>
  mano.reduce((s, c) => s + valorJuego(c, reyes), 0);

export const JUEGO_MINIMO = 31;
/** Escala del Juego, de mejor a peor. */
export const ESCALA_JUEGO = [31, 32, 40, 37, 36, 35, 34, 33] as const;

export const tieneJuego = (mano: readonly IdCarta[], reyes: Reyes = 8) =>
  puntosJuego(mano, reyes) >= JUEGO_MINIMO;

export interface Pares {
  readonly tipo: 'pareja' | 'medias' | 'duples';
  /** Rangos que forman la jugada, del más alto al más bajo, para desempatar. */
  readonly clave: readonly number[];
}

const ORDEN_PARES = { pareja: 1, medias: 2, duples: 3 } as const;

/** Pares de la mano: pareja, medias o duples (dos parejas o cuatro iguales); `null` si no hay. */
export function pares(mano: readonly IdCarta[], reyes: Reyes = 8): Pares | null {
  const cuenta = new Map<number, number>();
  for (const c of mano) cuenta.set(rango(c, reyes), (cuenta.get(rango(c, reyes)) ?? 0) + 1);
  const grupos = [...cuenta.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  if (grupos.length === 0) return null;
  const [r, n] = grupos[0]!;
  if (n === 4) return { tipo: 'duples', clave: [r, r] };
  if (n === 3) return { tipo: 'medias', clave: [r] };
  if (grupos.length === 2) {
    const [a, b] = [grupos[0]![0], grupos[1]![0]].sort((x, y) => y - x);
    return { tipo: 'duples', clave: [a!, b!] };
  }
  return { tipo: 'pareja', clave: [r] };
}

/** Compara listas de números de igual longitud: positivo si `a` es mayor. */
function lexicografico(a: readonly number[], b: readonly number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i]! - b[i]!;
  }
  return 0;
}

/** Compara dos manos en un lance: positivo si gana `a`, negativo si gana `b`, 0 si empatan. */
export function comparar(
  lance: LanceMus,
  a: readonly IdCarta[],
  b: readonly IdCarta[],
  reyes: Reyes = 8,
): number {
  const rangos = (m: readonly IdCarta[]) => m.map((c) => rango(c, reyes));
  switch (lance) {
    case 'grande':
      return lexicografico(
        rangos(a).sort((x, y) => y - x),
        rangos(b).sort((x, y) => y - x),
      );
    case 'chica':
      return -lexicografico(
        rangos(a).sort((x, y) => x - y),
        rangos(b).sort((x, y) => x - y),
      );
    case 'pares': {
      const pa = pares(a, reyes);
      const pb = pares(b, reyes);
      if (pa === null || pb === null) return (pa ? 1 : 0) - (pb ? 1 : 0);
      return ORDEN_PARES[pa.tipo] - ORDEN_PARES[pb.tipo] || lexicografico(pa.clave, pb.clave);
    }
    case 'juego': {
      const posicion = (m: readonly IdCarta[]) => {
        const i = (ESCALA_JUEGO as readonly number[]).indexOf(puntosJuego(m, reyes));
        return i === -1 ? ESCALA_JUEGO.length : i;
      };
      return posicion(b) - posicion(a);
    }
    case 'punto':
      return puntosJuego(a, reyes) - puntosJuego(b, reyes);
  }
}

/**
 * Asiento que gana el lance entre los `participantes`: se recorren desde la mano y solo un
 * jugador estrictamente mejor desplaza al anterior, así que los empates son del más cercano.
 */
export function ganadorLance(
  lance: LanceMus,
  manos: readonly (readonly IdCarta[])[],
  mano: Asiento,
  reyes: Reyes = 8,
  participantes: readonly Asiento[] = manos.map((_, a) => a),
): Asiento {
  const n = manos.length;
  let mejor: Asiento | null = null;
  for (let i = 0; i < n; i++) {
    const a = (mano + i) % n;
    if (!participantes.includes(a)) continue;
    if (mejor === null || comparar(lance, manos[a]!, manos[mejor]!, reyes) > 0) mejor = a;
  }
  if (mejor === null) throw new Error('El lance no tiene participantes');
  return mejor;
}

/** Piedras que vale la jugada de un jugador en Pares (1, 2 o 3) o en Juego (3 la 31, 2 el resto). */
export function piedrasJugada(lance: LanceMus, mano: readonly IdCarta[], reyes: Reyes = 8): number {
  if (lance === 'pares') {
    const p = pares(mano, reyes);
    return p === null ? 0 : ORDEN_PARES[p.tipo];
  }
  if (lance === 'juego') {
    const puntos = puntosJuego(mano, reyes);
    if (puntos < JUEGO_MINIMO) return 0;
    return puntos === JUEGO_MINIMO ? 3 : 2;
  }
  return 0;
}
