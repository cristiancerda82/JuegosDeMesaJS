import { type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  kingsCorner,
  type AccionKingsCorner,
  type ConfigKingsCorner,
  type EstadoKingsCorner,
  type VistaKingsCorner,
} from '../../juegos/kings-corner';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/** Un estado de Kings in the Corner coherente con la vista: las manos ajenas y el mazo, al azar. */
export function reconstruirKingsCorner(
  vista: VistaKingsCorner,
  azar: EstadoAzar,
): EstadoKingsCorner {
  const yo = vista.asiento;
  const { cartas } = barajar(
    cartasFuera(crearBaraja('francesa52'), vista.miMano ?? [], vista.pilas.flat()),
    azar,
  );
  let i = 0;
  const tomar = (n: number): IdCarta[] => {
    const r = cartas.slice(i, i + n);
    i += n;
    return r;
  };
  const manos = vista.cartasEnMano.map((n, a) => (a === yo ? [...(vista.miMano ?? [])] : tomar(n)));
  return {
    config: vista.config,
    azar,
    manos,
    mazo: tomar(vista.enMazo),
    pilas: vista.pilas.map((p) => [...p]),
    turno: vista.turno ?? 0,
    pasesSeguidos: vista.pasesSeguidos,
    ganador: vista.ganador,
    ultimaAccion: vista.ultimaAccion,
  };
}

export const SIMULABLE_KINGS_CORNER: Simulable<
  ConfigKingsCorner,
  EstadoKingsCorner,
  AccionKingsCorner,
  VistaKingsCorner
> = {
  juego: kingsCorner,
  reconstruir: reconstruirKingsCorner,
  // No hay manos: se simula un número fijo de jugadas.
  manoTerminada: () => false,
  horizonte: 30,
  valorar(_inicio, final, asiento) {
    const mias = final.manos[asiento]!.length;
    const rival = Math.min(...final.manos.map((m, a) => (a === asiento ? Infinity : m.length)));
    return rival - mias + bonoPartida(kingsCorner.resultado(final), asiento) / 100;
  },
  reconstrucciones: 10,
  presupuesto: 80,
};
