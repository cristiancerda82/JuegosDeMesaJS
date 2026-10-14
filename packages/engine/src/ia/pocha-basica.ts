import type { IdCarta, PaloEspanol } from '../baraja/cartas';
import type { AccionPocha, VistaPocha } from '../juegos/pocha';
import { cartaGanadora, fuerza, paloDe, valorDe } from '../motor/bazas';
import type { Agente } from './agente';

/**
 * IA básica de la Pocha: apuesta las bazas que espera ganar con sus triunfos altos y sus Ases;
 * mientras le faltan bazas intenta ganarlas con la carta más barata y, cumplida la apuesta,
 * intenta perder todas las demás. Es determinista: no usa el azar que recibe.
 */
export const iaPochaBasica: Agente<VistaPocha, AccionPocha> = {
  id: 'pocha-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

function elegir(vista: VistaPocha, acciones: readonly AccionPocha[]): AccionPocha {
  const apuestas = acciones.flatMap((a) => (a.tipo === 'apostar' ? [a.bazas] : []));
  if (apuestas.length > 0) {
    return { tipo: 'apostar', bazas: elegirApuesta(estimarBazas(vista), apuestas) };
  }
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  return { tipo: 'jugar', carta: elegirCarta(vista, cartas) };
}

// ── Apuesta ──────────────────────────────────────────────────────────────────

/** Probabilidad estimada de que una carta gane una baza. */
function probabilidad(carta: IdCarta, triunfo: PaloEspanol): number {
  const valor = valorDe(carta);
  if (paloDe(carta) === triunfo) {
    if (valor === 1 || valor === 3) return 0.9;
    if (valor === 12 || valor === 11) return 0.6;
    return 0.3;
  }
  if (valor === 1) return 0.7;
  if (valor === 3) return 0.4;
  return 0;
}

export function estimarBazas(vista: VistaPocha): number {
  const mano = vista.miMano ?? [];
  return Math.round(mano.reduce((s, c) => s + probabilidad(c, vista.triunfo), 0));
}

/** La apuesta legal más cercana a la estimación; ante la duda, la menor. */
function elegirApuesta(estimacion: number, legales: readonly number[]): number {
  return [...legales].sort(
    (a, b) => Math.abs(a - estimacion) - Math.abs(b - estimacion) || a - b,
  )[0]!;
}

// ── Juego de cartas ──────────────────────────────────────────────────────────

/** Coste de entregar una carta: los triunfos valen más que cualquier otra, luego la fuerza. */
const coste = (carta: IdCarta, triunfo: PaloEspanol) =>
  (paloDe(carta) === triunfo ? 100 : 0) + fuerza(carta);
const ordenarPorCoste = (cartas: readonly IdCarta[], triunfo: PaloEspanol) =>
  [...cartas].sort((a, b) => coste(a, triunfo) - coste(b, triunfo));

function elegirCarta(vista: VistaPocha, cartas: readonly IdCarta[]): IdCarta {
  const asiento = vista.asiento!;
  const triunfo = vista.triunfo;
  const apuesta = vista.apuestas[asiento] ?? 0;
  const faltan = vista.bazas[asiento]! < apuesta;
  const porCoste = ordenarPorCoste(cartas, triunfo);
  const masBaja = porCoste[0]!;

  if (vista.mesa.length === 0) {
    if (!faltan) return masBaja;
    const sinTriunfo = porCoste.filter((c) => paloDe(c) !== triunfo);
    return sinTriunfo.length > 0 ? sinTriunfo.at(-1)! : masBaja;
  }

  const gana = (c: IdCarta) =>
    cartaGanadora([...vista.mesa, { asiento, carta: c }], triunfo).asiento === asiento;
  if (faltan) return porCoste.find(gana) ?? masBaja;
  const perdedoras = porCoste.filter((c) => !gana(c));
  return perdedoras.length > 0 ? perdedoras.at(-1)! : masBaja;
}
