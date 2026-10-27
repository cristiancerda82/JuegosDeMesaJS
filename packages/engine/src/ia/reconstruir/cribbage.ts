import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  cribbage,
  type AccionCribbage,
  type ConfigCribbage,
  type EstadoCribbage,
  type VistaCribbage,
} from '../../juegos/cribbage';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/**
 * Un estado de Cribbage coherente con la vista. La mano del otro, sus cartas del crib y el mazo
 * salen al azar de las cartas que no se ven; las que echó el jugador siguen en el crib, y las
 * guardadas de cada uno son su mano más las que ya jugó.
 */
export function reconstruirCribbage(vista: VistaCribbage, azar: EstadoAzar): EstadoCribbage {
  const yo = vista.asiento ?? 0;
  const rival = 1 - yo;
  const mias = vista.misEchadas ?? [];
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      mias,
      vista.jugadasMano,
      vista.starter ? [vista.starter] : [],
    ),
    azar,
  );
  const manos: IdCarta[][] = [[], []];
  const echadas: IdCarta[][] = [[], []];
  manos[yo] = [...(vista.miMano ?? [])];
  manos[rival] = ocultas.tomar(vista.cartasEnMano[rival]!);
  echadas[yo] = [...mias];
  echadas[rival] = ocultas.tomar(vista.cartasEnCrib - mias.length);
  // Quien ya echó al crib guarda su mano (más lo que ha jugado); quien no, aún no guarda nada.
  const guardadas = [0, 1].map((a) =>
    echadas[a]!.length > 0 ? [...manos[a]!, ...vista.jugadasPor[a]!] : [],
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    manos,
    guardadas,
    echadas,
    mazo: ocultas.tomar(ocultas.quedan),
    starter: vista.starter,
    turno: vista.turno ?? 0,
    cuenta: vista.cuenta,
    secuencia: [...vista.secuencia],
    jugadasMano: [...vista.jugadasMano],
    pasaron: [...vista.pasaron],
    ultimoEnJugar: vista.ultimoEnJugar,
    puntos: vista.puntos,
    puntosJuego: vista.puntosJuego,
    resultadosManos: [...vista.resultadosManos],
    ultimaAccion: vista.ultimaAccion as EstadoCribbage['ultimaAccion'],
  };
}

export const SIMULABLE_CRIBBAGE: Simulable<
  ConfigCribbage,
  EstadoCribbage,
  AccionCribbage,
  VistaCribbage
> = {
  juego: cribbage,
  reconstruir: reconstruirCribbage,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // Echar al crib, como la normal: solo se simula el juego de las cartas.
  decideLaBase: (vista) => vista.fase === 'descarte',
  valorar(inicio, final, asiento) {
    const ganados = [0, 1].map((a) => final.puntos[a]! - inicio.puntos[a]!);
    return (
      ganados[asiento]! - ganados[1 - asiento]! + bonoPartida(cribbage.resultado(final), asiento)
    );
  },
  reconstrucciones: 40,
  presupuesto: 300,
};
