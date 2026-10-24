import { cartaDeId, type IdCarta } from '../baraja/cartas';
import {
  mejorRepartoGin,
  puntosCartaGin,
  type AccionGinRummy,
  type VistaGinRummy,
} from '../juegos/gin-rummy';
import type { Agente } from './agente';

/**
 * IA básica del Gin Rummy (design, decisión 5): coge el descarte si le sirve, suelta la carta
 * suelta que menos le sirve y cierra en cuanto puede. Es determinista y solo usa su vista.
 */
export const iaGinRummyBasica: Agente<VistaGinRummy, AccionGinRummy> = {
  id: 'gin-rummy-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirGinRummy(vista, acciones), azar };
  },
};

type Descarte = Extract<AccionGinRummy, { tipo: 'descartar' }>;
type Cierre = Extract<AccionGinRummy, { tipo: 'cerrar' }>;

const sin = (mano: readonly IdCarta[], carta: IdCarta) => mano.filter((c) => c !== carta);

/** La carta tiene en la mano otra del mismo número o una seguida del mismo palo. */
function leSirve(carta: IdCarta, mano: readonly IdCarta[]): boolean {
  const { palo, valor } = cartaDeId(carta)!;
  return mano.some((otra) => {
    if (otra === carta) return false;
    const o = cartaDeId(otra)!;
    return o.valor === valor || (o.palo === palo && Math.abs(o.valor - valor) === 1);
  });
}

/** Puntos sueltos de la mejor mano posible tras soltar una carta que no sea la prohibida. */
function mejorTrasDescartar(mano: readonly IdCarta[], prohibida: IdCarta): number {
  let mejor = Infinity;
  for (const carta of mano) {
    if (carta !== prohibida) mejor = Math.min(mejor, mejorRepartoGin(sin(mano, carta)).puntos);
  }
  return mejor;
}

/** Coger la carta del descarte: si baja los puntos sueltos o liga con una suelta. */
export function cogeDescarteGin(mano: readonly IdCarta[], arriba: IdCarta): boolean {
  const ahora = mejorRepartoGin(mano);
  if (mejorTrasDescartar([...mano, arriba], arriba) < ahora.puntos) return true;
  return leSirve(arriba, ahora.sueltas);
}

/**
 * Los descartes en el orden en que los elegiría la básica: primero las sueltas que no le sirven,
 * después las demás sueltas y al final las cartas de combinaciones; cada grupo, de más puntos a
 * menos (y por la carta, para que el orden sea siempre el mismo).
 */
export function descartesGinRummy(
  vista: VistaGinRummy,
  acciones: readonly AccionGinRummy[],
): Descarte[] {
  const mano = vista.miMano ?? [];
  const { sueltas } = mejorRepartoGin(mano);
  const rango = (carta: IdCarta) => {
    if (!sueltas.includes(carta)) return 2;
    return leSirve(carta, sueltas) || leSirve(carta, mano) ? 1 : 0;
  };
  const descartes = acciones.filter((a): a is Descarte => a.tipo === 'descartar');
  // Entre cartas de combinaciones, la que deja menos puntos al soltarla.
  const tras = (a: Descarte) =>
    rango(a.carta) === 2 ? mejorRepartoGin(sin(mano, a.carta)).puntos : 0;
  return [...descartes].sort(
    (a, b) =>
      rango(a.carta) - rango(b.carta) ||
      tras(a) - tras(b) ||
      puntosCartaGin(b.carta) - puntosCartaGin(a.carta) ||
      a.carta.localeCompare(b.carta),
  );
}

export function elegirGinRummy(
  vista: VistaGinRummy,
  acciones: readonly AccionGinRummy[],
): AccionGinRummy {
  const mano = vista.miMano ?? [];

  if (vista.fase === 'primera' || vista.fase === 'robar') {
    const delDescarte = acciones.find((a) => a.tipo === 'robar' && a.desde === 'descarte');
    const otra = acciones.find(
      (a) => a.tipo === 'pasar' || (a.tipo === 'robar' && a.desde === 'mazo'),
    );
    const arriba = vista.descarte.at(-1);
    if (delDescarte && arriba !== undefined && cogeDescarteGin(mano, arriba)) return delDescarte;
    return otra ?? delDescarte!;
  }

  // Cierra en cuanto puede, con la carta que deja menos puntos sueltos.
  const cierres = acciones.filter((a): a is Cierre => a.tipo === 'cerrar');
  if (cierres.length > 0) {
    const puntos = (a: Cierre) => mejorRepartoGin(sin(mano, a.carta)).puntos;
    return [...cierres].sort((a, b) => puntos(a) - puntos(b) || a.carta.localeCompare(b.carta))[0]!;
  }
  return descartesGinRummy(vista, acciones)[0]!;
}
