import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_OH_HELL,
  ohHell,
  paloOhHell,
  type AccionOhHell,
  type ConfigOhHell,
  type EstadoOhHell,
  type VistaOhHell,
} from '../../juegos/oh-hell';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Oh Hell coherente con la vista. Las manos ajenas y el mazo salen al azar de las
 * cartas que no se ven, sin los palos de salida que cada uno no siguió en la mano.
 */
export function reconstruirOhHell(vista: VistaOhHell, azar: EstadoAzar): EstadoOhHell {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const jugadas = [...vista.jugadasPor.flat(), ...vista.mesa.map((j) => j.carta)];
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_OH_HELL, mia, jugadas, [vista.cartaTriunfo]),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n));
  const enMazo = cartas.length - huecos.reduce((s, n) => s + n, 0);
  // Un asiento más para el mazo.
  const repartidas = repartirConPermitidos(
    cartas,
    [...huecos, enMazo],
    (a, c) => a === huecos.length || !vista.fallos[a]!.includes(paloOhHell(c)),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    indiceMano: vista.indiceMano,
    repartidor: vista.repartidor,
    manos: vista.cartasEnMano.map((_, a) => (a === yo ? [...mia] : repartidas[a]!)),
    mazo: repartidas[huecos.length]!,
    cartaTriunfo: vista.cartaTriunfo,
    triunfo: vista.triunfo,
    fase: vista.fase,
    apuestas: [...vista.apuestas],
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    jugadasPor: vista.jugadasPor.map((js) => [...js]),
    fallos: vista.fallos.map((f) => [...f]),
    puntos: [...vista.puntos],
    resultadosManos: [...vista.resultadosManos],
    ultimaAccion: vista.ultimaAccion,
  };
}

export const SIMULABLE_OH_HELL: Simulable<ConfigOhHell, EstadoOhHell, AccionOhHell, VistaOhHell> = {
  juego: ohHell,
  reconstruir: reconstruirOhHell,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mios = cerrada.puntos[asiento]!;
    const otros = cerrada.puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return mios - media + bonoPartida(ohHell.resultado(final), asiento);
  },
  reconstrucciones: 20,
  presupuesto: 60,
};
