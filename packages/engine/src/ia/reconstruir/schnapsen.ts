import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_SCHNAPSEN,
  damaDe,
  paloSchnapsen,
  reyDe,
  schnapsen,
  type AccionSchnapsen,
  type ConfigSchnapsen,
  type EstadoSchnapsen,
  type VistaSchnapsen,
} from '../../juegos/schnapsen';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Schnapsen coherente con la vista. La mano del rival y el mazo salen al azar de las
 * cartas que no se ven, sin los palos que el rival ya no tiene. La carta vuelta que se llevó y las
 * cartas de sus cantes que aún no ha jugado quedan en su mano.
 */
export function reconstruirSchnapsen(vista: VistaSchnapsen, azar: EstadoAzar): EstadoSchnapsen {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const jugadas = [...vista.jugadas, ...vista.mesa.map((j) => j.carta)];
  const fijas: IdCarta[][] = [[], []];
  for (const k of vista.conocidas) if (k.asiento !== yo) fijas[k.asiento]!.push(k.carta);
  for (const cante of vista.cantes) {
    if (cante.asiento === yo) continue;
    for (const c of [reyDe(cante.palo), damaDe(cante.palo)]) {
      if (!jugadas.includes(c) && !mia.includes(c) && !fijas[cante.asiento]!.includes(c)) {
        fijas[cante.asiento]!.push(c);
      }
    }
  }
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      BARAJA_SCHNAPSEN,
      mia,
      jugadas,
      vista.cartaVuelta ? [vista.cartaVuelta] : [],
      fijas.flat(),
    ),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n - fijas[a]!.length));
  // Un asiento más para el mazo.
  const repartidas = repartirConPermitidos(
    cartas,
    [...huecos, vista.enMazo],
    (a, c) => a === huecos.length || !vista.fallos[a]!.includes(paloSchnapsen(c)),
    new Generador(azarReparto),
  );
  const manos = vista.cartasEnMano.map((_, a) =>
    a === yo ? [...mia] : [...repartidas[a]!, ...fijas[a]!],
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    mazo: repartidas[huecos.length]!,
    cartaVuelta: vista.cartaVuelta,
    triunfo: vista.triunfo,
    turno: vista.turno ?? 0,
    cerrado: vista.cerrado,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadas: [...vista.jugadas],
    puntosBazas: vista.puntosBazas,
    bazas: vista.bazas,
    cantes: [...vista.cantes],
    cantado: vista.cantado,
    fallos: vista.fallos.map((f) => [...f]),
    conocidas: [...vista.conocidas],
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
    ultimaAccion: vista.ultimaAccion,
  };
}

export const SIMULABLE_SCHNAPSEN: Simulable<
  ConfigSchnapsen,
  EstadoSchnapsen,
  AccionSchnapsen,
  VistaSchnapsen
> = {
  juego: schnapsen,
  reconstruir: reconstruirSchnapsen,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const signo = cerrada.ganador === asiento ? 1 : -1;
    const diferencia = cerrada.puntosMano[asiento]! - cerrada.puntosMano[1 - asiento]!;
    return (
      signo * cerrada.puntosPartida +
      diferencia / 100 +
      bonoPartida(schnapsen.resultado(final), asiento)
    );
  },
  reconstrucciones: 20,
  presupuesto: 100,
};
