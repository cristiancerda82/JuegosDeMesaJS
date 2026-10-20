import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type PaloEspanol } from '../../baraja/cartas';
import {
  tuteSubastado,
  type AccionTuteSubastado,
  type ConfigTuteSubastado,
  type EstadoTuteSubastado,
  type VistaTuteSubastado,
} from '../../juegos/tute-subastado';
import type { Simulable } from '../niveles';
import { repartirConFallos } from './butifarra';
import { bonoPartida } from './comun';
import { fallosJulepe } from './julepe';

/**
 * Un estado de Tute subastado coherente con la vista: las manos ajenas al azar, sin los palos
 * que se sabe que no tienen. Las obligaciones son las del Julepe (se supera y se falla siempre),
 * así que los fallos conocidos también.
 */
export function reconstruirTuteSubastado(
  vista: VistaTuteSubastado,
  azar: EstadoAzar,
): EstadoTuteSubastado {
  const yo = vista.asiento;
  const jugadas = vista.bazasMano.flatMap((b) => b.cartas.map((j) => j.carta));
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('espanola40'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      jugadas,
    ),
    azar,
  );
  const fallos =
    vista.triunfo === null
      ? Array.from({ length: 4 }, () => new Set<PaloEspanol>())
      : fallosJulepe([...vista.bazasMano.map((b) => b.cartas), vista.mesa], vista.triunfo, 4);
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n));
  const repartidas = repartirConFallos(cartas, huecos, fallos, new Generador(azarReparto));
  const manos = repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m));
  return {
    config: vista.config,
    azar,
    numeroMano: vista.numeroMano,
    repartidor: vista.repartidor,
    manos,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    dichos: [...vista.dichos],
    puja: vista.puja,
    pujador: vista.pujador,
    todosPasaron: vista.todosPasaron,
    triunfo: vista.triunfo,
    mesa: [...vista.mesa],
    bazasMano: [...vista.bazasMano],
    puntos: [...vista.puntos],
    bazas: [...vista.bazas],
    cantes: [...vista.cantes],
    puedeCantar: vista.puedeCantar,
    fichas: [...vista.fichas],
    resultadosManos: [...vista.resultadosManos],
    ultimaBaza: vista.ultimaBaza,
  };
}

/** Puntos de margen sobre la puja que valen como una ficha en la valoración. */
const MARGEN_POR_FICHA = 20;

export const SIMULABLE_TUTE_SUBASTADO: Simulable<
  ConfigTuteSubastado,
  EstadoTuteSubastado,
  AccionTuteSubastado,
  VistaTuteSubastado
> = {
  juego: tuteSubastado,
  reconstruir: reconstruirTuteSubastado,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(tuteSubastado.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    // Además de las fichas, por cuánto se cumple o se falla: distingue manos con el mismo cobro.
    const margen = (r.puntosPujador - r.puja) / MARGEN_POR_FICHA;
    return r.cambio[asiento]! + (asiento === r.pujador ? margen : -margen / 3) + bono;
  },
  // Las pujas las decide la base: la simulación no ve que el rival puja alto justo cuando lleva
  // buena mano (spec niveles-ia).
  decideLaBase: (vista) => vista.fase === 'subasta',
  reconstrucciones: 24,
  presupuesto: 160,
};
