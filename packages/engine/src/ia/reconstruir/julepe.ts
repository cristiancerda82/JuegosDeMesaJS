import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta, type PaloEspanol } from '../../baraja/cartas';
import {
  julepe,
  type AccionJulepe,
  type ConfigJulepe,
  type EstadoJulepe,
  type VistaJulepe,
} from '../../juegos/julepe';
import { paloDe, type CartaJugada } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { repartirConFallos } from './butifarra';
import { bonoPartida } from './comun';

/**
 * Palos que cada asiento seguro que no tiene: quien no siguió el palo de salida no lo tiene y,
 * si además no jugó triunfo, tampoco tiene triunfos (las obligaciones le habrían hecho fallar).
 */
export function fallosJulepe(
  bazas: readonly (readonly CartaJugada[])[],
  triunfo: PaloEspanol,
  jugadores: number,
): Set<PaloEspanol>[] {
  const fallos = Array.from({ length: jugadores }, () => new Set<PaloEspanol>());
  for (const cartas of bazas) {
    if (cartas.length === 0) continue;
    const salida = paloDe(cartas[0]!.carta);
    for (const j of cartas.slice(1)) {
      if (paloDe(j.carta) === salida) continue;
      fallos[j.asiento]!.add(salida);
      if (paloDe(j.carta) !== triunfo) fallos[j.asiento]!.add(triunfo);
    }
  }
  return fallos;
}

/**
 * Un estado de Julepe coherente con la vista: las manos ajenas, el mazo y los descartes al azar,
 * con la carta de triunfo a la vista en la mano del repartidor y respetando los fallos vistos.
 */
export function reconstruirJulepe(vista: VistaJulepe, azar: EstadoAzar): EstadoJulepe {
  const n = vista.config.jugadores;
  const yo = vista.asiento;
  const jugadas = vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta));
  const triunfoAjeno =
    vista.cartaTriunfo !== null && vista.repartidor !== yo ? vista.cartaTriunfo : null;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('espanola40'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      jugadas,
      triunfoAjeno === null ? [] : [triunfoAjeno],
    ),
    azar,
  );
  const descartadas = vista.cambios.reduce<number>((s, c) => s + (c ?? 0), 0);
  // Sitios ocultos: las manos ajenas, el mazo (n) y los descartes (n + 1), sin restricciones.
  const huecos = [
    ...vista.cartasEnMano.map((c, a) =>
      a === yo ? 0 : a === vista.repartidor && triunfoAjeno !== null ? c - 1 : c,
    ),
    vista.mazo,
    descartadas,
  ];
  const fallos = [
    ...fallosJulepe([...vista.bazasJugadas.map((b) => b.cartas), vista.mesa], vista.triunfo, n),
    new Set<PaloEspanol>(),
    new Set<PaloEspanol>(),
  ];
  const repartidas = repartirConFallos(cartas, huecos, fallos, new Generador(azarReparto));
  const manos = Array.from({ length: n }, (_, a): IdCarta[] => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    if (a === vista.repartidor && triunfoAjeno !== null) return [...repartidas[a]!, triunfoAjeno];
    return repartidas[a]!;
  });
  return {
    config: vista.config,
    azar,
    numeroMano: vista.numeroMano,
    repartidor: vista.repartidor,
    manos,
    mazo: repartidas[n]!,
    descartadas: repartidas[n + 1]!,
    cartaTriunfo: vista.cartaTriunfo,
    triunfo: vista.triunfo,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    juega: [...vista.juega],
    cambios: [...vista.cambios],
    mesa: [...vista.mesa],
    bazasJugadas: [...vista.bazasJugadas],
    bazas: [...vista.bazas],
    bote: vista.bote,
    boteMano: vista.boteMano,
    fichas: [...vista.fichas],
    eliminados: [...vista.eliminados],
    resultadosManos: [...vista.resultadosManos],
    ultimaBaza: vista.ultimaBaza,
  };
}

export const SIMULABLE_JULEPE: Simulable<ConfigJulepe, EstadoJulepe, AccionJulepe, VistaJulepe> = {
  juego: julepe,
  reconstruir: reconstruirJulepe,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(julepe.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    return r.cobrado[asiento]! - r.julepe[asiento]! + bono;
  },
  // Los descartes los decide la base: hasta 32 formas de descartar no caben en el presupuesto.
  decideLaBase: (vista) => vista.fase === 'descartar',
  reconstrucciones: 24,
  presupuesto: 160,
};
