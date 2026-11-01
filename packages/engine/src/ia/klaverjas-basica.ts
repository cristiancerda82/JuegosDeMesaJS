import { PALOS_FRANCESES, type IdCarta, type PaloFrances } from '../baraja/cartas';
import {
  BARAJA_KLAVERJAS,
  ganadoraKlaverjas,
  paloKlaverjas,
  puntosCartaKlaverjas,
  rangoKlaverjas,
  type AccionKlaverjas,
  type VistaKlaverjas,
} from '../juegos/klaverjas';
import type { Agente } from './agente';

const valorDe = (c: IdCarta) => Number(c.split('-')[1]);

const TRIUNFO: Readonly<Record<number, number>> = { 11: 6, 9: 5, 1: 4, 10: 3, 13: 2, 12: 2 };

/** Lo que vale una mano para jugar con un palo de triunfo (spec ia-jugadores). */
export function valorTriunfoKlaverjas(mano: readonly IdCarta[], palo: PaloFrances): number {
  return mano.reduce(
    (s, c) =>
      s + (paloKlaverjas(c) === palo ? (TRIUNFO[valorDe(c)] ?? 1) : valorDe(c) === 1 ? 2 : 0),
    0,
  );
}

/** Con menos, pasa el palo propuesto. */
export const UMBRAL_TRIUNFO_KLAVERJAS = 16;

/** La carta que juega la IA básica entre las legales (spec ia-jugadores). */
export function cartaKlaverjas(vista: VistaKlaverjas, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const triunfo = vista.triunfo!;
  const esTriunfo = (c: IdCarta) => paloKlaverjas(c) === triunfo;
  // De menos a más valiosa: los triunfos al final; dentro, por puntos y por rango.
  const peso = (c: IdCarta) =>
    (esTriunfo(c) ? 1000 : 0) + 10 * puntosCartaKlaverjas(c, triunfo) + rangoKlaverjas(c, triunfo);
  const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;
  const noTriunfo = cartas.filter((c) => !esTriunfo(c));
  const yo = vista.asiento!;
  const mesa = vista.mesa;

  if (mesa.length === 0) {
    // La carta más alta que queda de cada palo, si es suya.
    const fuera = new Set(vista.jugadasPor.flat());
    const quedan = BARAJA_KLAVERJAS.filter((c) => !fuera.has(c));
    const altas = cartas.filter((c) =>
      quedan.every(
        (x) =>
          paloKlaverjas(x) !== paloKlaverjas(c) ||
          rangoKlaverjas(x, triunfo) <= rangoKlaverjas(c, triunfo),
      ),
    );
    const porPuntos = (cs: readonly IdCarta[]) =>
      [...cs].sort(
        (a, b) =>
          puntosCartaKlaverjas(b, triunfo) - puntosCartaKlaverjas(a, triunfo) || a.localeCompare(b),
      )[0]!;
    const altasNoTriunfo = altas.filter((c) => !esTriunfo(c));
    if (altasNoTriunfo.length > 0) return porPuntos(altasNoTriunfo);
    if (altas.length > 0) return porPuntos(altas);
    if (noTriunfo.length === 0) return masBaja(cartas);
    const largo = (c: IdCarta) =>
      noTriunfo.filter((x) => paloKlaverjas(x) === paloKlaverjas(c)).length;
    const maximo = Math.max(...noTriunfo.map(largo));
    return masBaja(noTriunfo.filter((c) => largo(c) === maximo));
  }

  if (ganadoraKlaverjas(mesa, triunfo).asiento === (yo + 2) % 4) {
    // Va ganando el compañero: le carga la que más puntos vale.
    return [...cartas].sort(
      (a, b) =>
        (esTriunfo(a) ? 1 : 0) - (esTriunfo(b) ? 1 : 0) ||
        puntosCartaKlaverjas(b, triunfo) - puntosCartaKlaverjas(a, triunfo) ||
        rangoKlaverjas(a, triunfo) - rangoKlaverjas(b, triunfo),
    )[0]!;
  }
  const vale = mesa.reduce((s, j) => s + puntosCartaKlaverjas(j.carta, triunfo), 0);
  const ultimo = mesa.length === 3;
  const ganadoras = cartas.filter(
    (c) => ganadoraKlaverjas([...mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  if ((vale >= 10 || ultimo) && ganadoras.length > 0) return masBaja(ganadoras);
  return masBaja(cartas);
}

function decidirTriunfo(vista: VistaKlaverjas): AccionKlaverjas {
  const mano = vista.miMano ?? [];
  if (vista.fase === 'propuesta') {
    return valorTriunfoKlaverjas(mano, vista.propuesto) >= UMBRAL_TRIUNFO_KLAVERJAS
      ? { tipo: 'jugar' }
      : { tipo: 'pasar' };
  }
  const palo = [...PALOS_FRANCESES].sort(
    (a, b) => valorTriunfoKlaverjas(mano, b) - valorTriunfoKlaverjas(mano, a),
  )[0]!;
  return { tipo: 'elegir', palo };
}

export const iaKlaverjasBasica: Agente<VistaKlaverjas, AccionKlaverjas> = {
  id: 'klaverjas-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase !== 'bazas') return { accion: decidirTriunfo(vista), azar };
    const carta = cartaKlaverjas(
      vista,
      acciones.flatMap((a) => (a.tipo === 'carta' ? [a.carta] : [])),
    );
    return { accion: { tipo: 'carta', carta }, azar };
  },
};
