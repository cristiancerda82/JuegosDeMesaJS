import { cartaDeId, type IdCarta } from '../baraja/cartas';
import {
  anadidosRummy,
  mejorBajadaRummy,
  puntosBajadaRummy,
  puntosEnManoRummy,
  type AccionRummy500,
  type CombinacionRummy500,
  type VistaRummy500,
} from '../juegos/rummy-500';
import type { Agente } from './agente';

/**
 * IA básica del Rummy 500 (design, decisión 4): coge del descarte si le compensa, baja y añade
 * todo lo que puede y suelta la carta que menos le sirve. Es determinista y solo usa su vista.
 */
export const iaRummy500Basica: Agente<VistaRummy500, AccionRummy500> = {
  id: 'rummy-500-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirRummy500(vista, acciones), azar };
  },
};

type Robo = Extract<AccionRummy500, { tipo: 'robarDescarte' }>;
type Descarte = Extract<AccionRummy500, { tipo: 'descartar' }>;

const mismas = (a: readonly IdCarta[], b: readonly IdCarta[]) =>
  a.length === b.length && [...a].sort().join(',') === [...b].sort().join(',');

/** Puntos que podría poner en la mesa con esta mano, y las cartas que no usaría. */
function valorMano(
  mano: readonly IdCarta[],
  combinaciones: readonly CombinacionRummy500[],
): { puntos: number; sinUsar: IdCarta[] } {
  const mejor = mejorBajadaRummy(mano);
  const anadibles = new Set(anadidosRummy(mejor.sueltas, combinaciones).map((a) => a.carta));
  const sinUsar = mejor.sueltas.filter((c) => !anadibles.has(c));
  const anadido = [...anadibles].reduce((s, c) => s + puntosEnManoRummy(c), 0);
  return { puntos: mejor.puntos + anadido, sinUsar };
}

/**
 * Lo que compensa coger del descarte desde cada carta: los puntos que gana para poner en la mesa,
 * menos la mitad de los de las cartas que se lleva y no usaría.
 */
export function valorRoboRummy(vista: VistaRummy500, robo: Robo): number {
  const mano = vista.miMano ?? [];
  const antes = valorMano(mano, vista.combinaciones).puntos;
  const cogidas = vista.descarte.slice(robo.desde);
  const despues = valorMano([...mano, ...cogidas], vista.combinaciones);
  const lastre = cogidas
    .filter((c) => despues.sinUsar.includes(c))
    .reduce((s, c) => s + puntosEnManoRummy(c), 0);
  return despues.puntos - antes - lastre / 2;
}

/** La carta tiene en la mano otra del mismo número o una seguida del mismo palo. */
function leSirve(carta: IdCarta, mano: readonly IdCarta[]): boolean {
  const { palo, valor } = cartaDeId(carta)!;
  return mano.some((otra) => {
    if (otra === carta) return false;
    const o = cartaDeId(otra)!;
    const seguidas = Math.abs(o.valor - valor) === 1 || Math.abs(o.valor - valor) === 12;
    return o.valor === valor || (o.palo === palo && seguidas);
  });
}

/** Los descartes en el orden de la básica: primero las que no le sirven, de más puntos a menos. */
export function descartesRummy500(
  vista: VistaRummy500,
  acciones: readonly AccionRummy500[],
): Descarte[] {
  const mano = vista.miMano ?? [];
  const { combinaciones } = mejorBajadaRummy(mano);
  const ligadas = new Set(combinaciones.flat());
  const rango = (c: IdCarta) => (ligadas.has(c) ? 2 : leSirve(c, mano) ? 1 : 0);
  return acciones
    .filter((a): a is Descarte => a.tipo === 'descartar')
    .sort(
      (a, b) =>
        rango(a.carta) - rango(b.carta) ||
        puntosEnManoRummy(b.carta) - puntosEnManoRummy(a.carta) ||
        a.carta.localeCompare(b.carta),
    );
}

/** Los robos del descarte que compensan, de más a menos. */
export function robosRummy500(vista: VistaRummy500, acciones: readonly AccionRummy500[]): Robo[] {
  return acciones
    .filter((a): a is Robo => a.tipo === 'robarDescarte')
    .map((a) => ({ a, valor: valorRoboRummy(vista, a) }))
    .filter((x) => x.valor > 0)
    .sort((x, y) => y.valor - x.valor || y.a.desde - x.a.desde)
    .map((x) => x.a);
}

export function elegirRummy500(
  vista: VistaRummy500,
  acciones: readonly AccionRummy500[],
): AccionRummy500 {
  const mano = vista.miMano ?? [];

  if (vista.fase === 'robar') {
    const mejor = robosRummy500(vista, acciones)[0];
    if (mejor) return mejor;
    return acciones.find((a) => a.tipo === 'robarMazo') ?? acciones.at(-1)!;
  }

  const puntosDe = (a: AccionRummy500) =>
    a.tipo === 'bajar'
      ? puntosBajadaRummy(a.cartas)
      : a.tipo === 'anadir'
        ? puntosEnManoRummy(a.carta)
        : 0;

  // Con la obligada pendiente, todo lo legal la usa: la que más puntos pone.
  if (vista.obligada !== null) {
    return [...acciones].sort((a, b) => puntosDe(b) - puntosDe(a))[0]!;
  }

  // Baja las combinaciones de su mejor agrupación, después añade lo que pueda.
  const plan = mejorBajadaRummy(mano);
  for (const comb of plan.combinaciones) {
    const bajada = acciones.find((a) => a.tipo === 'bajar' && mismas(a.cartas, comb));
    if (bajada) return bajada;
  }
  const anadidos = acciones.filter((a) => a.tipo === 'anadir');
  if (anadidos.length > 0) return [...anadidos].sort((a, b) => puntosDe(b) - puntosDe(a))[0]!;
  return descartesRummy500(vista, acciones)[0] ?? acciones[0]!;
}
