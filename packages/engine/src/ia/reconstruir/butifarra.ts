import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import {
  cartasFuera,
  crearBaraja,
  PALOS_ESPANOLES,
  type IdCarta,
  type PaloEspanol,
} from '../../baraja/cartas';
import {
  butifarra,
  type AccionButifarra,
  type ConfigButifarra,
  type EstadoButifarra,
  type VistaButifarra,
} from '../../juegos/butifarra';
import {
  bandoDe,
  cartaGanadora,
  paloDe,
  VALORES_BUTIFARRA,
  type CartaJugada,
} from '../../motor/bazas';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Palos que cada asiento seguro que no tiene, por lo que jugó: quien no siguió el palo de
 * salida no lo tiene, y quien además no falló cuando la baza no era de su compañero no tiene
 * triunfos (las obligaciones le habrían hecho fallar).
 */
export function fallosConocidos(
  bazas: readonly (readonly CartaJugada[])[],
  triunfo: PaloEspanol | null,
): Set<PaloEspanol>[] {
  const fallos = Array.from({ length: 4 }, () => new Set<PaloEspanol>());
  for (const cartas of bazas) {
    if (cartas.length === 0) continue;
    const salida = paloDe(cartas[0]!.carta);
    cartas.forEach((j, i) => {
      if (i === 0 || paloDe(j.carta) === salida) return;
      fallos[j.asiento]!.add(salida);
      if (triunfo === null || paloDe(j.carta) === triunfo) return;
      const gana = cartaGanadora(cartas.slice(0, i), triunfo, VALORES_BUTIFARRA).asiento;
      if (bandoDe(gana) !== bandoDe(j.asiento)) fallos[j.asiento]!.add(triunfo);
    });
  }
  return fallos;
}

/**
 * Reparte `cartas` entre los asientos con hueco (`huecos[a]` cartas cada uno) sin dar a nadie
 * un palo que no tiene. Carta a carta, en orden barajado, elige al azar (según el hueco) entre
 * los asientos que dejan un reparto posible para el resto. Con 4 palos basta comprobar la
 * condición de Hall en sus 16 subconjuntos, y como el estado real cumple las restricciones,
 * siempre hay solución.
 */
function repartirConFallos(
  cartas: readonly IdCarta[],
  huecos: readonly number[],
  fallos: readonly Set<PaloEspanol>[],
  g: Generador,
): IdCarta[][] {
  const libre = [...huecos];
  const manos: IdCarta[][] = huecos.map(() => []);
  const quedan = new Map<PaloEspanol, number>(PALOS_ESPANOLES.map((p) => [p, 0]));
  for (const c of cartas) quedan.set(paloDe(c), quedan.get(paloDe(c))! + 1);
  const admite = (a: number, palo: PaloEspanol) => !fallos[a]!.has(palo);

  const posible = () => {
    for (let mascara = 1; mascara < 16; mascara++) {
      const palos = PALOS_ESPANOLES.filter((_, i) => mascara & (1 << i));
      const necesitan = palos.reduce((s, p) => s + quedan.get(p)!, 0);
      const caben = libre.reduce((s, h, a) => (palos.some((p) => admite(a, p)) ? s + h : s), 0);
      if (necesitan > caben) return false;
    }
    return true;
  };

  for (const carta of cartas) {
    const palo = paloDe(carta);
    quedan.set(palo, quedan.get(palo)! - 1);
    const candidatos: number[] = [];
    for (let a = 0; a < libre.length; a++) {
      if (libre[a] === 0 || !admite(a, palo)) continue;
      libre[a]!--;
      if (posible()) candidatos.push(a);
      libre[a]!++;
    }
    if (candidatos.length === 0) throw new Error('Reparto imposible con los fallos conocidos');
    // Al azar, con más probabilidad cuanto más hueco tiene el asiento.
    let tirada = g.enteroHasta(candidatos.reduce((s, a) => s + libre[a]!, 0));
    let elegido = candidatos[0]!;
    for (const a of candidatos) {
      if (tirada < libre[a]!) {
        elegido = a;
        break;
      }
      tirada -= libre[a]!;
    }
    libre[elegido]!--;
    manos[elegido]!.push(carta);
  }
  return manos;
}

/** Un estado de Butifarra coherente con la vista: las manos ajenas al azar, sin sus fallos. */
export function reconstruirButifarra(vista: VistaButifarra, azar: EstadoAzar): EstadoButifarra {
  const yo = vista.asiento;
  const jugadas = vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta));
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('espanola48'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      jugadas,
    ),
    azar,
  );
  const triunfo = vista.eleccion?.triunfo ?? null;
  const fallos =
    vista.fase === 'jugar'
      ? fallosConocidos([...vista.bazasJugadas.map((b) => b.cartas), vista.mesa], triunfo)
      : fallosConocidos([], null);
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n));
  const repartidas = repartirConFallos(cartas, huecos, fallos, new Generador(azarReparto));
  const manos = repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m));
  return {
    config: { objetivo: vista.config.objetivo },
    azar,
    repartidor: vista.repartidor,
    manos,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    eleccion: vista.eleccion,
    contros: vista.contros,
    pasados: vista.pasados,
    mesa: [...vista.mesa],
    bazasJugadas: [...vista.bazasJugadas],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
    totales: vista.totales,
  };
}

/**
 * Lo que va ganando el bando de `asiento` en la mano: la diferencia de puntos entre bandos por
 * el multiplicador (la mitad, porque cada punto que gana uno lo pierde el otro). Es más fino que
 * lo anotado, que no distingue entre quedarse en 30 o en 35.
 */
function margen(puntos: readonly [number, number], multiplicador: number, asiento: Asiento) {
  const mio = bandoDe(asiento);
  return ((puntos[mio] - puntos[1 - mio]!) / 2) * multiplicador;
}

export const SIMULABLE_BUTIFARRA: Simulable<
  ConfigButifarra,
  EstadoButifarra,
  AccionButifarra,
  VistaButifarra
> = {
  juego: butifarra,
  reconstruir: reconstruirButifarra,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(butifarra.resultado(final), asiento);
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (cerrada) return margen(cerrada.puntos, cerrada.multiplicador, asiento) + bono;
    return margen(final.puntos, butifarra.vistaDe(final, null).multiplicador, asiento) + bono;
  },
  // Los contros los decide la base: la simulación no ve que el rival dice contro justo cuando
  // lleva buena mano (spec niveles-ia).
  decideLaBase: (vista) => vista.fase === 'contros',
  reconstrucciones: 24,
  presupuesto: 160,
};
