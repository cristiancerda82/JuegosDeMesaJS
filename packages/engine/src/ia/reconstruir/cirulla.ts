import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  cirulla,
  puntuarManoCirulla,
  type AccionCirulla,
  type ConfigCirulla,
  type EstadoCirulla,
  type ResultadoManoCirulla,
  type VistaCirulla,
} from '../../juegos/cirulla';
import { bandoDe } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/**
 * Un estado de Cirulla coherente con la vista: las cartas acusadas, en la mano de quien las
 * enseñó; el resto de las manos ajenas, el mazo y las recogidas, al azar (de las recogidas solo
 * se sabe cuántas son).
 */
export function reconstruirCirulla(vista: VistaCirulla, azar: EstadoAzar): EstadoCirulla {
  const yo = vista.asiento;
  const acusadasAjenas = vista.acusadas.flatMap((m, a) => (a === yo ? [] : m));
  const ocultas = new Ocultas(
    cartasFuera(crearBaraja('espanola40'), vista.miMano ?? [], vista.mesa, acusadasAjenas),
    azar,
  );
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    const vistas = vista.acusadas[a] ?? [];
    return [...vistas, ...ocultas.tomar(n - vistas.length)];
  });
  const recogidas: [IdCarta[], IdCarta[]] = [
    ocultas.tomar(vista.cartasRecogidas[0]),
    ocultas.tomar(vista.cartasRecogidas[1]),
  ];
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo: ocultas.tomar(vista.mazo),
    mesa: [...vista.mesa],
    manos,
    turno: vista.turno ?? 0,
    recogidas,
    scopas: [vista.scopas[0], vista.scopas[1]],
    acusadas: vista.acusadas.map((m) => [...m]),
    acuses: [...vista.acuses],
    mesaInicial: vista.mesaInicial,
    ultimoEnRecoger: vista.ultimoEnRecoger,
    ultimaJugada: vista.ultimaJugada,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Puntos de la mano del bando `mio` menos los del otro, con el recuento para desempatar. */
function diferencia(r: Pick<ResultadoManoCirulla, 'recuento' | 'puntos'>, mio: 0 | 1): number {
  const otro = (1 - mio) as 0 | 1;
  const [a, b] = [r.recuento[mio], r.recuento[otro]];
  return (
    r.puntos[mio].total -
    r.puntos[otro].total +
    0.02 * (a.cartas - b.cartas) +
    0.05 * (a.oros - b.oros) +
    0.01 * (a.primiera - b.primiera)
  );
}

export const SIMULABLE_CIRULLA: Simulable<
  ConfigCirulla,
  EstadoCirulla,
  AccionCirulla,
  VistaCirulla
> = {
  juego: cirulla,
  reconstruir: reconstruirCirulla,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const r =
      final.resultadosManos[inicio.resultadosManos.length] ??
      puntuarManoCirulla(final.recogidas, final.scopas);
    return diferencia(r, bandoDe(asiento)) + bonoPartida(cirulla.resultado(final), asiento);
  },
  reconstrucciones: 30,
  presupuesto: 300,
  // Como en la Scopa: con 4 se simulan 24 jugadas para no pasar del tiempo.
  horizonte: 24,
};
