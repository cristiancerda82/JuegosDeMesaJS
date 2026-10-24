import { cartaDeId, type IdCarta } from '../baraja/cartas';
import type { Asiento } from '../motor/contrato';

/**
 * Combinaciones del Rummy 500 (design, decisión 1): grupos de 3 o 4 cartas del mismo número y
 * escaleras de 3 o más del mismo palo, con el As abajo (A-2-3) o arriba (Q-K-A), sin vuelta.
 * Funciones puras que comparten el motor, la IA y el cliente.
 */

export interface CartaEnMesaRummy {
  readonly carta: IdCarta;
  /** Quién la puso en la mesa. */
  readonly de: Asiento;
}

export interface CombinacionRummy500 {
  readonly id: number;
  readonly tipo: 'grupo' | 'escalera';
  /** En una escalera, de abajo arriba: un As al principio va abajo y al final, arriba. */
  readonly cartas: readonly CartaEnMesaRummy[];
}

export interface AnadidoRummy {
  readonly combinacion: number;
  readonly carta: IdCarta;
  /** Solo para un As que cabe en los dos extremos de una escalera del 2 a la K. */
  readonly arriba?: boolean;
}

const AS_ALTO = 14;
const valor = (c: IdCarta) => cartaDeId(c)!.valor;
const palo = (c: IdCarta) => cartaDeId(c)!.palo;

/** Puntos de una carta que queda en la mano: As 15, del 2 al 10 su número y figuras 10. */
export function puntosEnManoRummy(c: IdCarta): number {
  const v = valor(c);
  if (v === 1) return 15;
  return v >= 10 ? 10 : v;
}

/** Puntos de una carta en una combinación de la mesa: el As de una escalera A-2-3 vale 1. */
export function puntosEnMesaRummy(
  c: IdCarta,
  combinacion: Pick<CombinacionRummy500, 'tipo' | 'cartas'>,
): number {
  if (valor(c) === 1 && combinacion.tipo === 'escalera' && combinacion.cartas[0]?.carta === c)
    return 1;
  return puntosEnManoRummy(c);
}

/** Puntos de un conjunto de cartas como combinación nueva (escalera en orden). */
export function puntosBajadaRummy(cartas: readonly IdCarta[]): number {
  const tipo = cartas.every((c) => valor(c) === valor(cartas[0]!)) ? 'grupo' : 'escalera';
  const comb = { tipo, cartas: cartas.map((carta) => ({ carta, de: 0 })) } as const;
  return cartas.reduce((s, c) => s + puntosEnMesaRummy(c, comb), 0);
}

/** Posición de una carta en una escalera; el As, abajo (1) o arriba (14). */
const posiciones = (c: IdCarta): number[] => (valor(c) === 1 ? [1, AS_ALTO] : [valor(c)]);

function subconjuntos<T>(lista: readonly T[]): T[][] {
  const todos: T[][] = [[]];
  for (const x of lista) for (const s of [...todos]) todos.push([...s, x]);
  return todos;
}

/**
 * Todas las combinaciones que se pueden bajar con estas cartas: grupos de 3 o 4 y tramos de
 * escalera de 3 o más, con las escaleras en orden de abajo arriba.
 */
export function bajadasRummy(mano: readonly IdCarta[]): IdCarta[][] {
  const resultado: IdCarta[][] = [];
  const porValor = new Map<number, IdCarta[]>();
  for (const c of mano) porValor.set(valor(c), [...(porValor.get(valor(c)) ?? []), c]);
  for (const iguales of porValor.values()) {
    for (const sub of subconjuntos(iguales)) if (sub.length >= 3) resultado.push(sub);
  }
  const porPalo = new Map<string, Map<number, IdCarta>>();
  for (const c of mano) {
    const enPalo = porPalo.get(palo(c)) ?? new Map<number, IdCarta>();
    for (const p of posiciones(c)) enPalo.set(p, c);
    porPalo.set(palo(c), enPalo);
  }
  for (const enPalo of porPalo.values()) {
    for (let desde = 1; desde <= AS_ALTO - 2; desde++) {
      for (let hasta = desde; hasta <= AS_ALTO && enPalo.has(hasta); hasta++) {
        // Sin vuelta: el mismo As no puede estar abajo y arriba.
        if (desde === 1 && hasta === AS_ALTO) break;
        if (hasta - desde >= 2) {
          resultado.push(
            Array.from({ length: hasta - desde + 1 }, (_, k) => enPalo.get(desde + k)!),
          );
        }
      }
    }
  }
  return resultado;
}

/** Las cartas forman una combinación válida; devuelve su tipo y su orden, o `null`. */
export function combinacionRummy(
  cartas: readonly IdCarta[],
): { tipo: 'grupo' | 'escalera'; cartas: IdCarta[] } | null {
  const clave = [...cartas].sort().join(',');
  const encontrada = bajadasRummy(cartas).find(
    (b) => b.length === cartas.length && [...b].sort().join(',') === clave,
  );
  if (!encontrada) return null;
  const grupo = encontrada.every((c) => valor(c) === valor(encontrada[0]!));
  return { tipo: grupo ? 'grupo' : 'escalera', cartas: encontrada };
}

/** Tramo de posiciones de una escalera de la mesa. */
function tramo(comb: CombinacionRummy500): { desde: number; hasta: number } {
  const n = comb.cartas.length;
  const primera = comb.cartas[0]!.carta;
  const desde = valor(primera) === 1 ? 1 : valor(primera);
  return { desde, hasta: desde + n - 1 };
}

/** Las cartas de la mano que se pueden añadir a las combinaciones de la mesa. */
export function anadidosRummy(
  mano: readonly IdCarta[],
  combinaciones: readonly CombinacionRummy500[],
): AnadidoRummy[] {
  const resultado: AnadidoRummy[] = [];
  for (const comb of combinaciones) {
    if (comb.tipo === 'grupo') {
      if (comb.cartas.length !== 3) continue;
      const v = valor(comb.cartas[0]!.carta);
      for (const c of mano) if (valor(c) === v) resultado.push({ combinacion: comb.id, carta: c });
      continue;
    }
    const p = palo(comb.cartas[0]!.carta);
    const { desde, hasta } = tramo(comb);
    for (const c of mano) {
      if (palo(c) !== p) continue;
      const abajo = posiciones(c).includes(desde - 1);
      const arriba = posiciones(c).includes(hasta + 1);
      if (valor(c) === 1 && abajo && arriba) {
        resultado.push({ combinacion: comb.id, carta: c, arriba: false });
        resultado.push({ combinacion: comb.id, carta: c, arriba: true });
      } else if (abajo || arriba) {
        resultado.push({ combinacion: comb.id, carta: c });
      }
    }
  }
  return resultado;
}

/** La combinación tras añadir una carta (en su extremo, si es escalera). */
export function conAnadido(
  comb: CombinacionRummy500,
  carta: IdCarta,
  de: Asiento,
  arriba?: boolean,
): CombinacionRummy500 {
  const nueva = { carta, de };
  if (comb.tipo === 'grupo') return { ...comb, cartas: [...comb.cartas, nueva] };
  const { hasta } = tramo(comb);
  const vaArriba =
    valor(carta) === 1 ? (arriba ?? hasta + 1 === AS_ALTO) : valor(carta) === hasta + 1;
  return { ...comb, cartas: vaArriba ? [...comb.cartas, nueva] : [nueva, ...comb.cartas] };
}

export interface MejorBajadaRummy {
  readonly combinaciones: readonly (readonly IdCarta[])[];
  /** Puntos que pone en la mesa. */
  readonly puntos: number;
  readonly sueltas: readonly IdCarta[];
}

/**
 * La agrupación de la mano que más puntos baja. Búsqueda exacta con memoria: la primera carta
 * que queda se deja suelta o entra en una combinación con cartas que quedan.
 */
export function mejorBajadaRummy(mano: readonly IdCarta[]): MejorBajadaRummy {
  const orden = [...mano].sort();
  const candidatas = bajadasRummy(orden).map((cartas) => ({
    cartas,
    puntos: puntosBajadaRummy(cartas),
  }));
  const memoria = new Map<string, { puntos: number; usadas: (typeof candidatas)[number][] }>();
  const buscar = (
    quedan: readonly IdCarta[],
  ): { puntos: number; usadas: (typeof candidatas)[number][] } => {
    if (quedan.length === 0) return { puntos: 0, usadas: [] };
    const clave = quedan.join(',');
    const guardado = memoria.get(clave);
    if (guardado) return guardado;
    const [primera, ...resto] = quedan as [IdCarta, ...IdCarta[]];
    let mejor = buscar(resto);
    const presentes = new Set(quedan);
    for (const c of candidatas) {
      if (!c.cartas.includes(primera) || !c.cartas.every((x) => presentes.has(x))) continue;
      const sub = buscar(quedan.filter((x) => !c.cartas.includes(x)));
      if (sub.puntos + c.puntos > mejor.puntos) {
        mejor = { puntos: sub.puntos + c.puntos, usadas: [c, ...sub.usadas] };
      }
    }
    memoria.set(clave, mejor);
    return mejor;
  };
  const { puntos, usadas } = buscar(orden);
  const usadasSet = new Set(usadas.flatMap((u) => u.cartas));
  return {
    combinaciones: usadas.map((u) => u.cartas),
    puntos,
    sueltas: mano.filter((c) => !usadasSet.has(c)),
  };
}
