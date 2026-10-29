import type { IdCarta } from '../baraja/cartas';
import {
  encajaKings,
  esEsquinaKings,
  esReyKings,
  valorKings,
  type AccionKingsCorner,
  type VistaKingsCorner,
} from '../juegos/kings-corner';
import type { Agente } from './agente';

/** Cuántas cartas de `mano` se pueden encadenar debajo de `carta` (sin contarla). */
export function cadenaKings(carta: IdCarta, mano: readonly IdCarta[]): number {
  const resto = [...mano];
  resto.splice(resto.indexOf(carta), 1);
  let arriba = carta;
  let n = 0;
  for (;;) {
    const i = resto.findIndex((c) => encajaKings(c, arriba));
    if (i < 0) return n;
    arriba = resto.splice(i, 1)[0]!;
    n++;
  }
}

/** Lo que haría la IA básica entre las acciones legales. */
export function decisionKings(
  vista: VistaKingsCorner,
  acciones: readonly AccionKingsCorner[],
): AccionKingsCorner {
  const mover = acciones.find((a) => a.tipo === 'mover');
  if (mover) return mover;
  const jugadas = acciones.filter(
    (a): a is Extract<AccionKingsCorner, { tipo: 'jugar' }> => a.tipo === 'jugar',
  );
  const rey = jugadas.find((a) => esEsquinaKings(a.pila) && esReyKings(a.carta));
  if (rey) return rey;
  const sobrePila = jugadas
    .filter((a) => vista.pilas[a.pila]!.length > 0)
    .sort((a, b) => valorKings(b.carta) - valorKings(a.carta));
  if (sobrePila.length > 0) return sobrePila[0]!;
  const mano = vista.miMano ?? [];
  const aHueco = jugadas
    .filter((a) => !esEsquinaKings(a.pila))
    .sort(
      (a, b) =>
        cadenaKings(b.carta, mano) - cadenaKings(a.carta, mano) ||
        valorKings(b.carta) - valorKings(a.carta),
    );
  if (aHueco.length > 0) return aHueco[0]!;
  return { tipo: 'pasar' };
}

/**
 * IA básica de Kings in the Corner (spec ia-jugadores): mueve pilas para abrir huecos, pone los
 * K en las esquinas, juega sus cartas de la más alta a la más baja y llena los huecos con la carta
 * que más encadena. Es determinista: no usa el azar que recibe.
 */
export const iaKingsCornerBasica: Agente<VistaKingsCorner, AccionKingsCorner> = {
  id: 'kings-corner-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionKings(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
