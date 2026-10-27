import { cartasFuera, crearBaraja, type IdCarta } from '../baraja/cartas';
import {
  puntosJugada,
  puntosRecuento,
  rangoCribbage,
  valorCribbage,
  type AccionCribbage,
  type VistaCribbage,
} from '../juegos/cribbage';
import type { Agente } from './agente';

/** Valor rápido de las 2 cartas que se echan al crib: quince, pareja y cincos. */
export function valorEchadas(cartas: readonly IdCarta[]): number {
  const [a, b] = cartas as [IdCarta, IdCarta];
  let valor = 0;
  if (valorCribbage(a) + valorCribbage(b) === 15) valor += 2;
  if (rangoCribbage(a) === rangoCribbage(b)) valor += 2;
  for (const c of cartas) if (rangoCribbage(c) === 5) valor += 1;
  return valor;
}

/** Puntos esperados de la mano que queda: la media sobre todos los starters posibles. */
export function esperadoMano(guardadas: readonly IdCarta[], mano: readonly IdCarta[]): number {
  const starters = cartasFuera(crearBaraja('francesa52'), mano);
  let total = 0;
  for (const s of starters) total += puntosRecuento(guardadas, s, false).total;
  return total / starters.length;
}

/** Penalización por dejar la cuenta en 5 o 21: un 10 del otro hace 15 o 31. */
const CUENTA_PELIGROSA = 3;

/**
 * IA básica del Cribbage (spec ia-jugadores): echa al crib lo que deja la mano con más puntos
 * esperados (sumando o restando lo que echa según de quién sea el crib) y juega la carta que más
 * puntos le da enseguida. Es determinista: no usa el azar que recibe.
 */
export const iaCribbageBasica: Agente<VistaCribbage, AccionCribbage> = {
  id: 'cribbage-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    let mejor = acciones[0]!;
    let mejorValor = -Infinity;
    for (const accion of acciones) {
      const valor = valorarCribbage(vista, accion);
      if (valor > mejorValor) {
        mejor = accion;
        mejorValor = valor;
      }
    }
    return { accion: mejor, azar };
  },
};

export function valorarCribbage(vista: VistaCribbage, accion: AccionCribbage): number {
  const mano = vista.miMano ?? [];
  if (accion.tipo === 'echar') {
    const guardadas = mano.filter((c) => !accion.cartas.includes(c));
    const crib = valorEchadas(accion.cartas);
    const esMio = vista.repartidor === vista.asiento;
    return esperadoMano(guardadas, mano) + (esMio ? crib : -crib);
  }
  if (accion.tipo === 'go') return 0;
  const cuenta = vista.cuenta + valorCribbage(accion.carta);
  const puntos = puntosJugada([...vista.secuencia, accion.carta], cuenta).reduce(
    (s, p) => s + p.puntos,
    0,
  );
  const peligro = cuenta === 5 || cuenta === 21 ? CUENTA_PELIGROSA : 0;
  return puntos * 10 - peligro + valorCribbage(accion.carta) / 10;
}
