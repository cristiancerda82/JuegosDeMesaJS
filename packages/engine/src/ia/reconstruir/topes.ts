import { PALOS_ESPANOLES, PALOS_FRANCESES, type PaloEspanol } from '../../baraja/cartas';
import {
  cartaGanadora,
  fuerza,
  paloDe,
  type CartaJugada,
  type ValoresBazas,
} from '../../motor/bazas';
import type { Asiento } from '../../motor/contrato';

const SIN_LIMITE = Number.POSITIVE_INFINITY;

/** Una baza jugada con el triunfo que regía al jugarla (`null`: sin triunfo). */
export interface BazaConTriunfo {
  readonly cartas: readonly CartaJugada[];
  readonly triunfo: PaloEspanol | null;
}

/**
 * La fuerza máxima que puede tener cada asiento en cada palo, por lo que jugó (0: no tiene ese
 * palo), en los juegos en que hay que asistir, montar, fallar y sobrefallar con el sobrefallo
 * libre. Montar y fallar solo obligan si la baza la gana un rival (`rivales`):
 * - quien no siguió el palo de salida no lo tiene;
 * - quien siguió con una carta que no superaba a la ganadora de ese palo no tenía ninguna mayor;
 * - con triunfo, quien no siguió el palo ni echó triunfo no tenía triunfos (si ganaba un triunfo,
 *   ninguno mayor que él), y quien echó un triunfo menor que el que ganaba no tenía uno mayor.
 */
export function topesPorObligaciones(
  bazas: readonly BazaConTriunfo[],
  valores: ValoresBazas,
  jugadores: number,
  rivales: (a: Asiento, b: Asiento) => boolean,
): Map<string, number>[] {
  // Con los palos de las dos barajas: el Rams se juega con la francesa.
  const palos = [...PALOS_ESPANOLES, ...PALOS_FRANCESES];
  const topes = Array.from(
    { length: jugadores },
    () => new Map<string, number>(palos.map((p) => [p, SIN_LIMITE])),
  );
  const bajar = (a: Asiento, palo: string, tope: number) =>
    topes[a]!.set(palo, Math.min(topes[a]!.get(palo)!, tope));
  for (const { cartas, triunfo } of bazas) {
    if (cartas.length === 0) continue;
    const salida = paloDe(cartas[0]!.carta);
    cartas.forEach((j, i) => {
      if (i === 0) return;
      const gana = cartaGanadora(cartas.slice(0, i), triunfo, valores);
      const palo = paloDe(j.carta);
      const fuerzaGana = fuerza(gana.carta, valores);
      if (palo !== salida) bajar(j.asiento, salida, 0);
      if (!rivales(gana.asiento, j.asiento)) return;
      const ganaTriunfo = triunfo !== null && paloDe(gana.carta) === triunfo;
      if (palo === salida) {
        if (!ganaTriunfo && fuerza(j.carta, valores) < fuerzaGana) {
          bajar(j.asiento, salida, fuerzaGana);
        }
        return;
      }
      if (triunfo === null) return;
      if (palo === triunfo) {
        if (ganaTriunfo && fuerza(j.carta, valores) < fuerzaGana) {
          bajar(j.asiento, triunfo, fuerzaGana);
        }
        return;
      }
      bajar(j.asiento, triunfo, ganaTriunfo ? fuerzaGana : 0);
    });
  }
  return topes;
}
