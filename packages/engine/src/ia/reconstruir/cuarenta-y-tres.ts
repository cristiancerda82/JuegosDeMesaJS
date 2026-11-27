import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  cuarentaYTres,
  liquidacion,
  type AccionCuarentaYTres,
  type ConfigCuarentaYTres,
  type EstadoCuarentaYTres,
  type VistaCuarentaYTres,
} from '../../juegos/cuarenta-y-tres';
import { fuerza, paloDe, VALORES_BRISCA } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { repartirConPermitidos } from './cuatrola';
import { topesPorObligaciones } from './topes';

/**
 * Un estado de Cuarenta y tres coherente con la vista (spec niveles-ia): la muestra cambiada,
 * en la mano de quien la cogió mientras no la juegue, y las demás cartas que no se ven al azar,
 * sin lo que se sabe por las obligaciones. Todos son rivales de todos.
 */
export function reconstruirCuarentaYTres(
  vista: VistaCuarentaYTres,
  azar: EstadoAzar,
): EstadoCuarentaYTres {
  const yo = vista.asiento;
  const jugadas = [
    ...vista.mesa.map((j) => j.carta),
    ...vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
  ];
  const cambio = vista.cambio;
  const cambiadaAjena =
    cambio !== null && cambio.asiento !== yo && !jugadas.includes(cambio.carta) ? cambio : null;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('espanola40'),
      vista.miMano ?? [],
      jugadas,
      [vista.muestra],
      cambiadaAjena === null ? [] : [cambiadaAjena.carta],
    ),
    azar,
  );
  const topes = topesPorObligaciones(
    [...vista.bazasJugadas, { cartas: vista.mesa }].map((b) => ({
      cartas: b.cartas,
      triunfo: vista.triunfo,
    })),
    VALORES_BRISCA,
    vista.config.jugadores,
    (a, b) => a !== b,
  );
  const huecos = vista.cartasEnMano.map((n, a) =>
    a === yo ? 0 : a === cambiadaAjena?.asiento ? n - 1 : n,
  );
  const repartidas = repartirConPermitidos(
    cartas,
    huecos,
    (a, c) => fuerza(c) <= topes[a]!.get(paloDe(c))!,
    new Generador(azarReparto),
  );
  const manos = repartidas.map((m, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    return a === cambiadaAjena?.asiento ? [...m, cambiadaAjena.carta] : m;
  });
  return {
    config: { manos: vista.config.manos },
    azar,
    repartidor: vista.repartidor,
    manos,
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    muestra: vista.muestra,
    triunfo: vista.triunfo,
    cambio: vista.cambio,
    bazasJugadas: [...vista.bazasJugadas],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    tantos: [...vista.tantos],
    saldos: [...vista.saldos],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_CUARENTA_Y_TRES: Simulable<
  ConfigCuarentaYTres,
  EstadoCuarentaYTres,
  AccionCuarentaYTres,
  VistaCuarentaYTres
> = {
  juego: cuarentaYTres,
  reconstruir: reconstruirCuarentaYTres,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El saldo propio menos el del mejor rival: continuo, sin el salto del bono de la partida,
  // y en la última mano decide igual quién la gana.
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const tantos = cerrada ? cerrada.tantos : final.tantos;
    const saldos = inicio.saldos.map((s, a) => s + liquidacion(tantos[a]!));
    return saldos[asiento]! - Math.max(...saldos.filter((_, a) => a !== asiento));
  },
  reconstrucciones: 24,
  presupuesto: 160,
};
