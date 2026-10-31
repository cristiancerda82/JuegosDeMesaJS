import type { IdCarta } from '../baraja/cartas';
import {
  BARAJA_JASS,
  esPaloJass,
  esTriunfoJass,
  ganadoraJass,
  MODOS_JASS,
  paloJass,
  puntosCartaJass,
  rangoJass,
  type AccionJass,
  type ModoJass,
  type VistaJass,
} from '../juegos/jass';
import type { Agente } from './agente';

const valorDe = (c: IdCarta) => Number(c.split('-')[1]);

const TRIUNFO: Readonly<Record<number, number>> = { 11: 6, 9: 5, 1: 4, 13: 3, 12: 3 };
const OBENABE: Readonly<Record<number, number>> = { 1: 5, 13: 3, 12: 1 };
const UNDENUFE: Readonly<Record<number, number>> = { 6: 5, 7: 3, 8: 1 };

/** Lo que vale una mano para jugar un modo (spec ia-jugadores). */
export function valorModoJass(mano: readonly IdCarta[], modo: ModoJass): number {
  if (modo === 'obenabe') return mano.reduce((s, c) => s + (OBENABE[valorDe(c)] ?? 0), 0);
  if (modo === 'undenufe') return mano.reduce((s, c) => s + (UNDENUFE[valorDe(c)] ?? 0), 0);
  return mano.reduce(
    (s, c) => s + (paloJass(c) === modo ? (TRIUNFO[valorDe(c)] ?? 2) : valorDe(c) === 1 ? 2 : 0),
    0,
  );
}

/** Con menos, pasa la elección a su compañero si puede. */
export const UMBRAL_MODO_JASS = 18;

function eleccionJass(vista: VistaJass, acciones: readonly AccionJass[]): AccionJass {
  const mano = vista.miMano ?? [];
  const mejor = [...MODOS_JASS].sort((a, b) => valorModoJass(mano, b) - valorModoJass(mano, a))[0]!;
  const puedePasar = acciones.some((a) => a.tipo === 'pasar');
  return valorModoJass(mano, mejor) >= UMBRAL_MODO_JASS || !puedePasar
    ? { tipo: 'elegir', modo: mejor }
    : { tipo: 'pasar' };
}

/** La carta que juega la IA básica entre las legales (spec ia-jugadores). */
export function cartaJass(vista: VistaJass, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const modo = vista.modo!;
  // De menos a más valiosa: los triunfos al final; dentro, por puntos y por rango.
  const peso = (c: IdCarta) =>
    (esTriunfoJass(c, modo) ? 1000 : 0) + 10 * puntosCartaJass(c, modo) + rangoJass(c, modo);
  const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;
  const noTriunfo = cartas.filter((c) => !esTriunfoJass(c, modo));
  const yo = vista.asiento!;
  const mesa = vista.mesa;

  if (mesa.length === 0) {
    // La carta más alta que queda de cada palo, si es suya.
    const fuera = new Set(vista.jugadasPor.flat());
    const quedan = BARAJA_JASS.filter((c) => !fuera.has(c));
    const altas = cartas.filter((c) =>
      quedan.every((x) => paloJass(x) !== paloJass(c) || rangoJass(x, modo) <= rangoJass(c, modo)),
    );
    const altasNoTriunfo = altas.filter((c) => !esTriunfoJass(c, modo));
    const porPuntos = (cs: readonly IdCarta[]) =>
      [...cs].sort(
        (a, b) => puntosCartaJass(b, modo) - puntosCartaJass(a, modo) || a.localeCompare(b),
      )[0]!;
    if (altasNoTriunfo.length > 0) return porPuntos(altasNoTriunfo);
    if (altas.length > 0) return porPuntos(altas);
    if (noTriunfo.length === 0) return masBaja(cartas);
    const largo = (c: IdCarta) => noTriunfo.filter((x) => paloJass(x) === paloJass(c)).length;
    const maximo = Math.max(...noTriunfo.map(largo));
    return masBaja(noTriunfo.filter((c) => largo(c) === maximo));
  }

  const ganaAhora = ganadoraJass(mesa, modo).asiento;
  if (ganaAhora === (yo + 2) % 4) {
    // Va ganando el compañero: le carga la que más puntos vale, sin gastar un triunfo.
    if (noTriunfo.length > 0) {
      return [...noTriunfo].sort(
        (a, b) =>
          puntosCartaJass(b, modo) - puntosCartaJass(a, modo) ||
          rangoJass(a, modo) - rangoJass(b, modo),
      )[0]!;
    }
    return masBaja(cartas);
  }
  const vale = mesa.reduce((s, j) => s + puntosCartaJass(j.carta, modo), 0);
  const ultimo = mesa.length === 3;
  const ganadoras = cartas.filter(
    (c) => ganadoraJass([...mesa, { asiento: yo, carta: c }], modo).asiento === yo,
  );
  if ((vale >= 10 || ultimo) && ganadoras.length > 0) return masBaja(ganadoras);
  return masBaja(noTriunfo.length > 0 && esPaloJass(modo) ? noTriunfo : cartas);
}

export const iaJassBasica: Agente<VistaJass, AccionJass> = {
  id: 'jass-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'eleccion') return { accion: eleccionJass(vista, acciones), azar };
    const carta = cartaJass(
      vista,
      acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : [])),
    );
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
