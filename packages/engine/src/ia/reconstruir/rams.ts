import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta, type PaloEspanol } from '../../baraja/cartas';
import {
  barajaRams,
  juegaRams,
  rams,
  VALORES_RAMS,
  type AccionRams,
  type ConfigRams,
  type EstadoRams,
  type VistaRams,
} from '../../juegos/rams';
import { fuerza, paloDe } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';
import { topesPorObligaciones } from './topes';

/**
 * Un estado de Rams coherente con la vista: el pinte, en la mano del que reparte mientras no lo
 * juegue; las demás cartas que no se ven (manos ajenas, niña, la mano dejada, el descarte y lo
 * que no se repartió), al azar, sin lo que se sabe por las obligaciones.
 */
export function reconstruirRams(vista: VistaRams, azar: EstadoAzar): EstadoRams {
  const yo = vista.asiento;
  const jugadas = [
    ...vista.mesa.map((j) => j.carta),
    ...vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
  ];
  const n = vista.config.jugadores;
  // El pinte, si el que reparte se lo quedó y no lo ha jugado, sigue en su mano.
  const pinteAjeno = vista.pinteCogido && vista.repartidor !== yo && !jugadas.includes(vista.pinte);
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      barajaRams(),
      vista.miMano ?? [],
      jugadas,
      vista.pinteCogido ? (pinteAjeno ? [vista.pinte] : []) : [vista.pinte],
    ),
    azar,
  );
  const topes = topesPorObligaciones(
    [...vista.bazasJugadas, { cartas: vista.mesa }].map((b) => ({
      cartas: b.cartas,
      triunfo: vista.triunfo as unknown as PaloEspanol,
    })),
    VALORES_RAMS,
    n,
    (a, b) => a !== b,
  );
  // Huecos: las manos ajenas (sin el pinte), y después la niña, la dejada, el descarte y el resto.
  const huecosManos = vista.cartasEnMano.map((c, a) =>
    a === yo ? 0 : pinteAjeno && a === vista.repartidor ? c - 1 : c,
  );
  const enManos = huecosManos.reduce((s, h) => s + h, 0);
  const libres = cartas.length - enManos;
  const repartidas = repartirConPermitidos(
    cartas,
    [...huecosManos, libres],
    (a, c) => a === n || fuerza(c, VALORES_RAMS) <= topes[a]!.get(paloDe(c))!,
    new Generador(azarReparto),
  );
  const manos = repartidas.slice(0, n).map((m, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    return pinteAjeno && a === vista.repartidor ? [...m, vista.pinte] : m;
  });
  const fuera = [...repartidas[n]!];
  const tomar = (k: number) => fuera.splice(0, k);
  const nina = tomar(vista.cartasNina);
  const porJugador = vista.enJuego.filter(Boolean).length === 6 ? 4 : 5;
  const dejada: IdCarta[] = vista.ninaDe === null ? [] : tomar(porJugador);
  const descarte = vista.pinteCogido ? (tomar(1)[0] ?? null) : null;
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    enJuego: [...vista.enJuego],
    manos,
    nina,
    ninaDe: vista.ninaDe,
    dejada,
    pinte: vista.pinte,
    triunfo: vista.triunfo,
    pinteCogido: vista.pinteCogido,
    descarte,
    resto: fuera,
    dichos: [...vista.dichos],
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    bazasJugadas: [...vista.bazasJugadas],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    fichas: [...vista.fichas],
    canasta: vista.canasta,
    terminoEn: [...vista.terminoEn],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_RAMS: Simulable<ConfigRams, EstadoRams, AccionRams, VistaRams> = {
  juego: rams,
  reconstruir: reconstruirRams,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const tras = cerrada ? cerrada.fichasTras : final.fichas;
    // Fichas que se quita cada uno en la mano (en negativo, las que se carga).
    const quita = inicio.fichas.map((f, a) => f - tras[a]!);
    const dichos = cerrada ?? final;
    const otros = quita.filter((_, a) => a !== asiento && juegaRams(dichos, a));
    const media = otros.length > 0 ? otros.reduce((s, q) => s + q, 0) / otros.length : 0;
    return quita[asiento]! - media + bonoPartida(rams.resultado(final), asiento);
  },
  reconstrucciones: 60,
  presupuesto: 600,
};
