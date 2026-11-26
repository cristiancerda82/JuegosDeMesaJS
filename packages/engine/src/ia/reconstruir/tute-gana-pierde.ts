import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  barajaTuteGanaPierde,
  penalizadosGanaPierde,
  tuteGanaPierde,
  type AccionTuteGanaPierde,
  type ConfigTuteGanaPierde,
  type EstadoTuteGanaPierde,
  type VistaTuteGanaPierde,
} from '../../juegos/tute-gana-pierde';
import { fuerza, paloDe, VALORES_BRISCA } from '../../motor/bazas';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';
import { topesPorObligaciones } from './topes';

/**
 * Un estado de Tute gana-pierde coherente con la vista (spec niveles-ia): las manos ajenas al azar
 * entre las cartas que no se ven, sin lo que se sabe por las obligaciones con el triunfo que regía
 * en cada baza. Todos son rivales de todos.
 */
export function reconstruirTuteGanaPierde(
  vista: VistaTuteGanaPierde,
  azar: EstadoAzar,
): EstadoTuteGanaPierde {
  const yo = vista.asiento;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      barajaTuteGanaPierde(),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
    ),
    azar,
  );
  const topes = topesPorObligaciones(
    [...vista.bazasJugadas, { cartas: vista.mesa, triunfo: vista.triunfo }],
    VALORES_BRISCA,
    vista.config.jugadores,
    (a, b) => a !== b,
  );
  const repartidas = repartirConPermitidos(
    cartas,
    vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)),
    (a, c) => fuerza(c) <= topes[a]!.get(paloDe(c))!,
    new Generador(azarReparto),
  );
  return {
    config: { limite: vista.config.limite },
    azar,
    repartidor: vista.repartidor,
    manos: repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m)),
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    triunfo: vista.triunfo,
    cantes: [...vista.cantes],
    bazasJugadas: [...vista.bazasJugadas],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    tantos: [...vista.tantos],
    penalizaciones: [...vista.penalizaciones],
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Lo que vale llevarse la penalización en la simulación. */
const PENA_MEDIO = 10;
const TANTOS_MANO = 130;

/** Sin penalización, cuanto más lejos de los demás, más seguro; con ella, lo peor. */
function valorMano(tantos: readonly number[], asiento: Asiento): number {
  if (penalizadosGanaPierde(tantos).includes(asiento)) return -PENA_MEDIO;
  const mios = tantos[asiento]!;
  const separacion = Math.min(
    ...tantos.flatMap((t, a) => (a === asiento ? [] : [Math.abs(mios - t)])),
  );
  return separacion / TANTOS_MANO;
}

export const SIMULABLE_TUTE_GANA_PIERDE: Simulable<
  ConfigTuteGanaPierde,
  EstadoTuteGanaPierde,
  AccionTuteGanaPierde,
  VistaTuteGanaPierde
> = {
  juego: tuteGanaPierde,
  reconstruir: reconstruirTuteGanaPierde,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(tuteGanaPierde.resultado(final), asiento);
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    return valorMano(cerrada ? cerrada.tantos : final.tantos, asiento) + bono;
  },
  reconstrucciones: 24,
  presupuesto: 160,
};
