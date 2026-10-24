import { cartaDeId, type IdCarta } from '../baraja/cartas';

/**
 * Valor de las manos de póker (design, decisión 1). Funciones puras que comparten el motor, la
 * IA y el cliente.
 */

/** Categorías de menor a mayor. */
export const CATEGORIAS_POKER = [
  'cartaAlta',
  'pareja',
  'doblePareja',
  'trio',
  'escalera',
  'color',
  'full',
  'poker',
  'escaleraColor',
] as const;

export type CategoriaPoker = (typeof CATEGORIAS_POKER)[number];

export const NOMBRES_MANO_POKER: Readonly<Record<CategoriaPoker, string>> = {
  cartaAlta: 'Carta alta',
  pareja: 'Pareja',
  doblePareja: 'Doble pareja',
  trio: 'Trío',
  escalera: 'Escalera',
  color: 'Color',
  full: 'Full',
  poker: 'Póker',
  escaleraColor: 'Escalera de color',
};

export interface ManoPoker {
  /** Comparable: más alto, mejor. */
  readonly valor: number;
  readonly categoria: CategoriaPoker;
  /** Las cinco cartas de la jugada. */
  readonly cartas: readonly IdCarta[];
}

/** Valor de la carta con el As alto. */
export const rangoPoker = (c: IdCarta) => {
  const v = cartaDeId(c)!.valor;
  return v === 1 ? 14 : v;
};

const BASE = 15;

/** Valor comparable de una mano de exactamente cinco cartas. */
export function valorMano5(cartas: readonly IdCarta[]): {
  valor: number;
  categoria: CategoriaPoker;
} {
  const rangos = cartas.map(rangoPoker).sort((a, b) => b - a);
  const palos = cartas.map((c) => cartaDeId(c)!.palo);
  const color = palos.every((p) => p === palos[0]);
  const distintos = [...new Set(rangos)];
  let alta: number | null = null;
  if (distintos.length === 5) {
    if (rangos[0]! - rangos[4]! === 4) alta = rangos[0]!;
    // A-2-3-4-5: el As cuenta bajo y la carta alta es el 5.
    else if (rangos[0] === 14 && rangos[1] === 5 && rangos[4] === 2) alta = 5;
  }
  // Rangos agrupados por veces que aparecen y luego por valor.
  const cuenta = new Map<number, number>();
  for (const r of rangos) cuenta.set(r, (cuenta.get(r) ?? 0) + 1);
  const grupos = [...cuenta.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const forma = grupos.map((g) => g[1]).join('');
  let categoria: CategoriaPoker;
  let desempate: number[];
  if (alta !== null && color) {
    categoria = 'escaleraColor';
    desempate = [alta];
  } else if (forma === '41') {
    categoria = 'poker';
    desempate = grupos.map((g) => g[0]);
  } else if (forma === '32') {
    categoria = 'full';
    desempate = grupos.map((g) => g[0]);
  } else if (color) {
    categoria = 'color';
    desempate = rangos;
  } else if (alta !== null) {
    categoria = 'escalera';
    desempate = [alta];
  } else if (forma === '311') {
    categoria = 'trio';
    desempate = grupos.map((g) => g[0]);
  } else if (forma === '221') {
    categoria = 'doblePareja';
    desempate = grupos.map((g) => g[0]);
  } else if (forma === '2111') {
    categoria = 'pareja';
    desempate = grupos.map((g) => g[0]);
  } else {
    categoria = 'cartaAlta';
    desempate = rangos;
  }
  let valor = CATEGORIAS_POKER.indexOf(categoria);
  for (let i = 0; i < 5; i++) valor = valor * BASE + (desempate[i] ?? 0);
  return { valor, categoria };
}

/** La mejor mano de cinco cartas entre las dadas (de cinco a siete). */
export function mejorManoPoker(cartas: readonly IdCarta[]): ManoPoker {
  let mejor: ManoPoker | null = null;
  const probar = (cinco: readonly IdCarta[]) => {
    const { valor, categoria } = valorMano5(cinco);
    if (mejor === null || valor > mejor.valor) mejor = { valor, categoria, cartas: cinco };
  };
  const n = cartas.length;
  if (n === 5) probar(cartas);
  // Se quita una carta (con seis) o dos (con siete).
  else if (n === 6) for (let a = 0; a < n; a++) probar(cartas.filter((_, i) => i !== a));
  else {
    for (let a = 0; a < n; a++)
      for (let b = a + 1; b < n; b++) probar(cartas.filter((_, i) => i !== a && i !== b));
  }
  return mejor!;
}

/** Solo el valor de la mejor mano de siete (rápido, para la equity de la IA). */
export function valorMejorMano(cartas: readonly IdCarta[]): number {
  return mejorManoPoker(cartas).valor;
}
