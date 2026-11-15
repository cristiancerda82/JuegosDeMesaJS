import type { IdCarta } from '../baraja/cartas';
import {
  numeroCasita,
  type AccionCasitaRobada,
  type VistaCasitaRobada,
} from '../juegos/casita-robada';
import type { Agente } from './agente';

/** De cada número hay 4 cartas en la baraja española de 40. */
const COPIAS = 4;

/** Cuántas cartas de ese número quedan sin ver: ni en su mano, ni en la mesa, ni en una casita. */
export function sinVerCasita(vista: VistaCasitaRobada, numero: number): number {
  const vistas = [...(vista.miMano ?? []), ...vista.mesa, ...vista.casitas.flat()];
  return COPIAS - vistas.filter((c) => numeroCasita(c) === numero).length;
}

/** La jugada de la IA básica (spec ia-jugadores). */
export function elegirCasitaRobada(
  vista: VistaCasitaRobada,
  acciones: readonly AccionCasitaRobada[],
): AccionCasitaRobada {
  const sinVer = (c: IdCarta) => sinVerCasita(vista, numeroCasita(c));
  const deLaMesa = (c: IdCarta) =>
    vista.mesa.filter((x) => numeroCasita(x) === numeroCasita(c)).length;
  const robado = (a: AccionCasitaRobada) =>
    a.robar === null ? 0 : (vista.casitas[a.robar]?.length ?? 0);
  // A igualdad, la de cuyo número quedan menos sin ver, y luego la más baja.
  const desempate = (a: AccionCasitaRobada, b: AccionCasitaRobada) =>
    sinVer(a.carta) - sinVer(b.carta) ||
    numeroCasita(a.carta) - numeroCasita(b.carta) ||
    a.carta.localeCompare(b.carta);

  const robos = acciones.filter((a) => a.robar !== null);
  if (robos.length > 0) {
    return [...robos].sort((a, b) => robado(b) - robado(a) || desempate(a, b))[0]!;
  }
  const capturas = acciones.filter((a) => deLaMesa(a.carta) > 0);
  if (capturas.length > 0) {
    return [...capturas].sort(
      (a, b) => deLaMesa(b.carta) - deLaMesa(a.carta) || desempate(a, b),
    )[0]!;
  }
  return [...acciones].sort(desempate)[0]!;
}

export const iaCasitaRobadaBasica: Agente<VistaCasitaRobada, AccionCasitaRobada> = {
  id: 'casita-robada-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegirCasitaRobada(vista, acciones), azar };
  },
};
