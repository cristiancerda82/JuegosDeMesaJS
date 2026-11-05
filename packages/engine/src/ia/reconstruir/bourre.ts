import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_BOURRE,
  bourre,
  paloBourre,
  type AccionBourre,
  type ConfigBourre,
  type EstadoBourre,
  type VistaBourre,
} from '../../juegos/bourre';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Huecos que se reparten además de las cinco manos. */
const MAZO = 5;
const DESCARTES = 6;

/**
 * Un estado de Bourré coherente con la vista: las manos ajenas, los descartes (con las manos de
 * quienes pasaron) y el mazo al azar entre las cartas que no se ven, sin los palos que cada uno
 * no tiene. La vuelta sigue con el que reparte si no la ha jugado (o en los descartes si pasó).
 */
export function reconstruirBourre(vista: VistaBourre, azar: EstadoAzar): EstadoBourre {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const jugadas = vista.jugadasPor.flat();
  const repartidor = vista.repartidor;
  // La vuelta se coloca aparte si no la tiene el jugador ni se ha jugado.
  const vueltaFija = !mia.includes(vista.vuelta) && !jugadas.includes(vista.vuelta);
  const vueltaEnDescartes = vista.juega[repartidor] === false;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_BOURRE, mia, jugadas, vueltaFija ? [vista.vuelta] : []),
    azar,
  );
  const enDescartes =
    BARAJA_BOURRE.length -
    vista.enMazo -
    jugadas.length -
    vista.cartasEnMano.reduce((s, n) => s + n, 0);
  const huecos = [
    ...vista.cartasEnMano.map((n, a) =>
      a === yo ? 0 : a === repartidor && vueltaFija && !vueltaEnDescartes ? n - 1 : n,
    ),
    vista.enMazo,
    vueltaFija && vueltaEnDescartes ? enDescartes - 1 : enDescartes,
  ];
  const admite = (a: Asiento, c: IdCarta) => {
    if (a >= MAZO) return true;
    if (a === yo) return false;
    return !vista.fallos[a]!.includes(paloBourre(c));
  };
  let repartidas: IdCarta[][];
  try {
    repartidas = repartirConPermitidos(cartas, huecos, admite, new Generador(azarReparto));
  } catch {
    // Sin poder cumplir lo que se sabe (no debería pasar), al azar respetando los tamaños.
    let i = 0;
    repartidas = huecos.map((n) => {
      const m = cartas.slice(i, i + n);
      i += n;
      return m;
    });
  }
  const manos = [0, 1, 2, 3, 4].map((a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    const m = repartidas[a]!;
    return a === repartidor && vueltaFija && !vueltaEnDescartes ? [...m, vista.vuelta] : m;
  });
  const descartes = repartidas[DESCARTES]!;
  return {
    config: vista.config,
    azar,
    repartidor,
    activos: [...vista.activos],
    manos,
    mazo: repartidas[MAZO]!,
    descartes: vueltaFija && vueltaEnDescartes ? [...descartes, vista.vuelta] : descartes,
    vuelta: vista.vuelta,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    juega: [...vista.juega],
    cambiadas: [...vista.cambiadas],
    cambiando: vista.cambiando,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    fallos: vista.fallos.map((f) => [...f]),
    bazas: [...vista.bazas],
    fichas: [...vista.fichas],
    bote: vista.bote,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_BOURRE: Simulable<ConfigBourre, EstadoBourre, AccionBourre, VistaBourre> = {
  juego: bourre,
  reconstruir: reconstruirBourre,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El cambio, como la normal; jugar o pasar y cada carta se simulan.
  decideLaBase: (vista) => vista.fase === 'cambio',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(bourre.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    return (r ? r.cambioFichas[asiento]! : 0) + bono;
  },
  reconstrucciones: 60,
  presupuesto: 600,
};
