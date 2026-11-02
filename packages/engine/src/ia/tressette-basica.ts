import type { IdCarta } from '../baraja/cartas';
import {
  BARAJA_TRESSETTE,
  ganadoraTressette,
  paloTressette,
  rangoTressette,
  terciosCartaTressette,
  type AccionTressette,
  type VistaTressette,
} from '../juegos/tressette';
import type { Agente } from './agente';

/** De menos a más valiosa: por tercios y, a igualdad, por rango. */
const peso = (c: IdCarta) => 20 * terciosCartaTressette(c) + rangoTressette(c);
const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;

/**
 * Si `c` es la más alta que queda de su palo: ninguna carta más alta de ese palo sigue sin
 * jugar fuera de la mano de la IA (spec ia-jugadores).
 */
function masAltaQueQueda(c: IdCarta, vista: VistaTressette): boolean {
  const fuera = new Set([...vista.jugadas, ...vista.mesa.map((j) => j.carta), ...vista.miMano!]);
  return !BARAJA_TRESSETTE.some(
    (x) =>
      paloTressette(x) === paloTressette(c) &&
      rangoTressette(x) > rangoTressette(c) &&
      !fuera.has(x),
  );
}

/** La carta que juega la IA básica entre las legales (spec ia-jugadores). */
export function cartaTressette(vista: VistaTressette, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const mesa = vista.mesa;

  if (mesa.length === 0) {
    const seguras = cartas.filter((c) => masAltaQueQueda(c, vista));
    if (seguras.length > 0) {
      return [...seguras].sort(
        (a, b) => terciosCartaTressette(b) - terciosCartaTressette(a) || peso(b) - peso(a),
      )[0]!;
    }
    const largo = (c: IdCarta) =>
      cartas.filter((x) => paloTressette(x) === paloTressette(c)).length;
    const maximo = Math.max(...cartas.map(largo));
    return [...cartas.filter((c) => largo(c) === maximo)].sort(
      (a, b) => rangoTressette(a) - rangoTressette(b),
    )[0]!;
  }

  const ultimo = mesa.length === 3;
  const ganando = ganadoraTressette(mesa);
  if (ganando.asiento === (yo + 2) % 4 && (ultimo || masAltaQueQueda(ganando.carta, vista))) {
    // La baza es segura para el compañero: le carga la que más puntos vale.
    return [...cartas].sort(
      (a, b) => terciosCartaTressette(b) - terciosCartaTressette(a) || peso(a) - peso(b),
    )[0]!;
  }
  const vale = mesa.reduce((s, j) => s + terciosCartaTressette(j.carta), 0);
  const ganadoras = cartas.filter(
    (c) => ganadoraTressette([...mesa, { asiento: yo, carta: c }]).asiento === yo,
  );
  if (ganando.asiento !== (yo + 2) % 4 && (vale > 0 || ultimo) && ganadoras.length > 0) {
    return [...ganadoras].sort((a, b) => rangoTressette(a) - rangoTressette(b))[0]!;
  }
  return masBaja(cartas);
}

export const iaTressetteBasica: Agente<VistaTressette, AccionTressette> = {
  id: 'tressette-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const carta = cartaTressette(
      vista,
      acciones.map((a) => a.carta),
    );
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
