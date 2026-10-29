import type { IdCarta } from '../baraja/cartas';
import { valoresDe, valorPesca, type AccionPesca, type VistaPesca } from '../juegos/pesca';
import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';

/** Lo que se sabe de la mano de un jugador por el registro público. */
export interface SabidoPesca {
  /** Valores que tiene seguro. */
  readonly tiene: ReadonlySet<number>;
  /** Valores que seguro que no tiene. */
  readonly noTiene: ReadonlySet<number>;
  /** Cartas concretas que recibió o enseñó y aún tiene. */
  readonly cartas: readonly IdCarta[];
}

/**
 * Lo que se sabe de cada mano por el registro: lo que pidió o recibió cada uno y aún no ha dado
 * ni bajado, y lo que le pidieron y no tenía mientras no haya vuelto a robar.
 */
export function conocimientoPesca(
  vista: Pick<VistaPesca, 'registro' | 'cartasEnMano'>,
): SabidoPesca[] {
  const n = vista.cartasEnMano.length;
  const tiene = Array.from({ length: n }, () => new Set<number>());
  const noTiene = Array.from({ length: n }, () => new Set<number>());
  const cartas: IdCarta[][] = Array.from({ length: n }, () => []);
  const pierde = (a: Asiento, valor: number) => {
    tiene[a]!.delete(valor);
    noTiene[a]!.add(valor);
    cartas[a] = cartas[a]!.filter((c) => valorPesca(c) !== valor);
  };
  for (const r of vista.registro) {
    if (r.tipo === 'robar') {
      noTiene[r.asiento]!.clear();
      continue;
    }
    const { asiento: p, a, valor } = r;
    tiene[p]!.add(valor);
    noTiene[p]!.delete(valor);
    if (r.dadas.length > 0) {
      pierde(a, valor);
      cartas[p]!.push(...r.dadas);
    } else {
      pierde(a, valor);
      if (r.pesco !== 'nada' && r.pesco !== null) {
        // Robó: puede tener cualquier valor nuevo.
        noTiene[p]!.clear();
        if (r.pesco !== 'otra') cartas[p]!.push(r.pesco);
      }
    }
    if (r.cuarteto !== null) {
      for (let j = 0; j < n; j++) pierde(j, r.cuarteto);
    }
  }
  return tiene.map((t, j) => ({ tiene: t, noTiene: noTiene[j]!, cartas: cartas[j]! }));
}

/** La petición que haría la IA básica. */
export function peticionPesca(vista: VistaPesca): AccionPesca | null {
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];
  const sabido = conocimientoPesca(vista);
  const rivales = vista.cartasEnMano
    .map((n, a) => ({ a, n }))
    .filter(({ a, n }) => a !== yo && n > 0)
    .sort((x, y) => y.n - x.n || x.a - y.a);
  if (rivales.length === 0 || mano.length === 0) return null;
  const cuantas = (v: number) => mano.filter((c) => valorPesca(c) === v).length;
  // Mis valores, de los que más tengo a los que menos y, a igualdad, del más alto.
  const valores = valoresDe(mano).sort((a, b) => cuantas(b) - cuantas(a) || b - a);

  for (const valor of valores) {
    const quien = rivales.find(({ a }) => sabido[a]!.tiene.has(valor));
    if (quien) return { tipo: 'pedir', a: quien.a, valor };
  }
  // Si no, el primer valor que algún rival puede tener, al que más cartas tiene de ellos.
  for (const valor of valores) {
    const quien = rivales.find(({ a }) => !sabido[a]!.noTiene.has(valor));
    if (quien) return { tipo: 'pedir', a: quien.a, valor };
  }
  return { tipo: 'pedir', a: rivales[0]!.a, valor: valores[0]! };
}

/**
 * IA básica de la Pesca (spec ia-jugadores): recuerda el registro, pide a quien sabe que tiene
 * el valor y, si no, el valor del que más tiene al rival con más cartas. Es determinista: no usa
 * el azar que recibe.
 */
export const iaPescaBasica: Agente<VistaPesca, AccionPesca> = {
  id: 'pesca-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = peticionPesca(vista);
    const legal = accion && acciones.find((x) => x.a === accion.a && x.valor === accion.valor);
    return { accion: legal ?? acciones[0]!, azar };
  },
};
