import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  bandoCasino,
  cartasDeElemento,
  casino,
  puntuarManoCasino,
  valorCasino,
  type AccionCasino,
  type ConfigCasino,
  type EstadoCasino,
  type ResultadoManoCasino,
  type VistaCasino,
} from '../../juegos/casino';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/**
 * Un estado de Casino coherente con la vista: las manos ajenas y el mazo, al azar entre las
 * cartas que no se ven. El dueño de cada construcción ajena tiene una carta de su valor
 * (spec niveles-ia): sin ella no habría podido construir.
 */
export function reconstruirCasino(vista: VistaCasino, azar: EstadoAzar): EstadoCasino {
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      vista.mesa.flatMap(cartasDeElemento),
      ...vista.recogidas,
    ),
    azar,
  );
  const fijas: IdCarta[][] = vista.cartasEnMano.map(() => []);
  for (const el of vista.mesa) {
    if (el.tipo !== 'construccion' || el.duenio === vista.asiento) continue;
    const mano = fijas[el.duenio]!;
    if (mano.some((c) => valorCasino(c) === el.valor)) continue;
    if (mano.length >= vista.cartasEnMano[el.duenio]!) continue;
    const carta = ocultas.todas.find((c) => valorCasino(c) === el.valor);
    if (carta) mano.push(...ocultas.sacar([carta]));
  }
  const manos = vista.cartasEnMano.map((n, a) =>
    a === vista.asiento && vista.miMano
      ? [...vista.miMano]
      : [...fijas[a]!, ...ocultas.tomar(n - fijas[a]!.length)],
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo: ocultas.tomar(vista.mazo),
    mesa: [...vista.mesa],
    manos,
    turno: vista.turno ?? 0,
    // Un id libre: mayor que los de las construcciones de la mesa.
    siguienteId:
      Math.max(0, ...vista.mesa.map((el) => (el.tipo === 'construccion' ? el.id : 0))) + 1,
    recogidas: vista.recogidas.map((r) => [...r]),
    barridas: [...vista.barridas],
    ultimoEnRecoger: vista.ultimoEnRecoger,
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
  };
}

/**
 * Puntos de la mano del bando `mio` menos la media de los demás. Los 3 puntos de las cartas van
 * a saltos: el recuento de cartas y picas desempata.
 */
function diferencia(r: ResultadoManoCasino, mio: number): number {
  const valor = (b: number) =>
    r.puntos[b]!.total + 0.05 * r.recuento[b]!.cartas + 0.05 * r.recuento[b]!.picas;
  const otros = r.puntos.map((_, b) => b).filter((b) => b !== mio);
  return valor(mio) - otros.reduce((s, b) => s + valor(b), 0) / otros.length;
}

export const SIMULABLE_CASINO: Simulable<ConfigCasino, EstadoCasino, AccionCasino, VistaCasino> = {
  juego: casino,
  reconstruir: reconstruirCasino,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const r =
      final.resultadosManos[inicio.resultadosManos.length] ??
      puntuarManoCasino(
        final.recogidas,
        final.barridas,
        final.barridas.map(() => 0),
      );
    return (
      diferencia(r, bandoCasino(final.config, asiento)) +
      bonoPartida(casino.resultado(final), asiento)
    );
  },
  reconstrucciones: 20,
  presupuesto: 100,
};
