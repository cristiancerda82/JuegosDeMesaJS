import { cartaDeId, esComodin, type IdCarta, type PaloEspanol } from '../baraja/cartas';

/**
 * Combinaciones del Chinchón y búsqueda de la mejor agrupación de una mano (design, decisión 2).
 * Funciones puras que comparten el motor, la IA y el cliente.
 */

export type BarajaChinchon = 'espanola40' | 'espanola48';

/** Orden de los valores para las escaleras: en la de 40, el 7 y la sota son seguidos. */
const ORDEN: Readonly<Record<BarajaChinchon, readonly number[]>> = {
  espanola40: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12],
  espanola48: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
};

const VALOR_COMODIN = 25;

/** Puntos de una carta sin ligar: as 1, del 2 al 9 su número, figuras 10 y comodín 25. */
export function puntosCarta(id: IdCarta): number {
  if (esComodin(id)) return VALOR_COMODIN;
  const valor = cartaDeId(id)!.valor;
  return valor >= 10 ? 10 : valor;
}

export interface Reparto {
  /** Combinaciones, cada una en orden (las escaleras con el comodín en su hueco). */
  readonly combinaciones: readonly (readonly IdCarta[])[];
  readonly sueltas: readonly IdCarta[];
  /** Puntos de las cartas sueltas. */
  readonly puntos: number;
}

interface Candidata {
  readonly mascara: number;
  readonly cartas: readonly IdCarta[];
}

/** Todas las combinaciones posibles con las cartas de la mano (como mucho un comodín cada una). */
function candidatas(mano: readonly IdCarta[], baraja: BarajaChinchon): Candidata[] {
  const orden = ORDEN[baraja];
  const comodines = mano.flatMap((c, i) => (esComodin(c) ? [i] : []));
  const naturales = mano.flatMap((c, i) => {
    const carta = esComodin(c) ? null : cartaDeId(c);
    return carta ? [{ i, id: c, palo: carta.palo as PaloEspanol, valor: carta.valor }] : [];
  });
  const resultado: Candidata[] = [];
  const agregar = (indices: readonly number[], cartas: readonly IdCarta[]) =>
    resultado.push({ mascara: indices.reduce((m, i) => m | (1 << i), 0), cartas });

  // Grupos: 3 o 4 del mismo valor, o 2 o 3 con un comodín.
  const porValor = new Map<number, typeof naturales>();
  for (const n of naturales) porValor.set(n.valor, [...(porValor.get(n.valor) ?? []), n]);
  for (const iguales of porValor.values()) {
    for (const sub of subconjuntos(iguales)) {
      if (sub.length >= 3 && sub.length <= 4) {
        agregar(
          sub.map((s) => s.i),
          sub.map((s) => s.id),
        );
      }
      if (sub.length >= 2 && sub.length <= 3) {
        for (const j of comodines) {
          agregar([...sub.map((s) => s.i), j], [...sub.map((s) => s.id), mano[j]!]);
        }
      }
    }
  }

  // Escaleras: cada tramo de 3 o más posiciones seguidas del mismo palo, con a lo sumo un hueco
  // (que tapa un comodín).
  const palos = new Set(naturales.map((n) => n.palo));
  for (const palo of palos) {
    const enPosicion = new Map<number, (typeof naturales)[number]>();
    for (const n of naturales) if (n.palo === palo) enPosicion.set(orden.indexOf(n.valor), n);
    for (let inicio = 0; inicio < orden.length; inicio++) {
      for (let fin = inicio + 2; fin < orden.length; fin++) {
        const tramo = Array.from({ length: fin - inicio + 1 }, (_, k) =>
          enPosicion.get(inicio + k),
        );
        const huecos = tramo.filter((t) => t === undefined).length;
        if (huecos > 1) break;
        if (huecos === 0) {
          agregar(
            tramo.map((t) => t!.i),
            tramo.map((t) => t!.id),
          );
        } else {
          for (const j of comodines) {
            agregar(
              tramo.map((t) => t?.i ?? j),
              tramo.map((t) => t?.id ?? mano[j]!),
            );
          }
        }
      }
    }
  }
  return resultado;
}

function subconjuntos<T>(lista: readonly T[]): T[][] {
  const todos: T[][] = [[]];
  for (const x of lista) for (const s of [...todos]) todos.push([...s, x]);
  return todos;
}

/**
 * La agrupación de la mano que deja menos puntos sin ligar. Búsqueda exacta con memoria sobre
 * la máscara de cartas restantes: la carta más baja queda suelta o entra en una combinación.
 */
export function mejorReparto(mano: readonly IdCarta[], baraja: BarajaChinchon): Reparto {
  const clave = `${baraja}|${mano.join(',')}`;
  const guardado = recordados.get(clave);
  if (guardado) return guardado;
  const todas = candidatas(mano, baraja);
  const memoria = new Map<number, { puntos: number; usadas: readonly Candidata[] }>();

  const buscar = (mascara: number): { puntos: number; usadas: readonly Candidata[] } => {
    if (mascara === 0) return { puntos: 0, usadas: [] };
    const guardado = memoria.get(mascara);
    if (guardado) return guardado;
    const i = Math.log2(mascara & -mascara);
    const sinElla = buscar(mascara & ~(1 << i));
    let mejor = { puntos: puntosCarta(mano[i]!) + sinElla.puntos, usadas: sinElla.usadas };
    for (const c of todas) {
      if ((c.mascara & (1 << i)) === 0 || (c.mascara & mascara) !== c.mascara) continue;
      const resto = buscar(mascara & ~c.mascara);
      if (resto.puntos < mejor.puntos)
        mejor = { puntos: resto.puntos, usadas: [c, ...resto.usadas] };
    }
    memoria.set(mascara, mejor);
    return mejor;
  };

  const { puntos, usadas } = buscar((1 << mano.length) - 1);
  const ligadas = usadas.reduce((m, c) => m | c.mascara, 0);
  const reparto: Reparto = {
    combinaciones: usadas.map((c) => c.cartas),
    sueltas: mano.filter((_, i) => (ligadas & (1 << i)) === 0),
    puntos,
  };
  recordar(clave, reparto);
  return reparto;
}

/**
 * Memoria de resultados: comprobar el cierre pide la mejor combinación de cada mano posible tras
 * descartar, y las mismas manos se repiten de un turno a otro. La función es pura, así que
 * recordar resultados no cambia nada salvo el tiempo.
 */
const recordados = new Map<string, Reparto>();
const MAXIMO_RECORDADOS = 20_000;

function recordar(clave: string, reparto: Reparto): void {
  if (recordados.size >= MAXIMO_RECORDADOS) recordados.clear();
  recordados.set(clave, reparto);
}

/** Las 7 cartas forman una escalera del mismo palo sin comodines. */
export function esChinchon(mano: readonly IdCarta[], baraja: BarajaChinchon): boolean {
  if (mano.length !== 7 || mano.some(esComodin)) return false;
  const cartas = mano.map((c) => cartaDeId(c)!);
  if (cartas.some((c) => c.palo !== cartas[0]!.palo)) return false;
  const posiciones = cartas.map((c) => ORDEN[baraja].indexOf(c.valor)).sort((a, b) => a - b);
  return posiciones.every((p, k) => p === posiciones[0]! + k);
}
