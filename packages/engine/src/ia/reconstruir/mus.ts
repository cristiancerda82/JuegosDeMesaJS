import { Generador, type EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  mus,
  pares,
  parejaDe,
  tieneJuego,
  type AccionMus,
  type ConfigMus,
  type EstadoMus,
  type VistaMus,
} from '../../juegos/mus';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/** Intentos para encontrar manos ajenas que cuadren con lo declarado de pares y juego. */
const INTENTOS = 200;
/** Ganar el juego en la mano vale más que sus piedras. */
const PREMIO_JUEGO = 20;

/** La mano de `asiento` cuadra con lo que declaró de pares y de juego. */
function cuadra(vista: VistaMus, asiento: number, mano: readonly IdCarta[]): boolean {
  const { pares: conPares, juego: conJuego } = vista.declaraciones;
  if (conPares && (pares(mano, vista.config.reyes) !== null) !== conPares[asiento]) return false;
  if (conJuego && tieneJuego(mano, vista.config.reyes) !== conJuego[asiento]) return false;
  return true;
}

/**
 * Un estado de Mus coherente con la vista: manos ajenas, mazo y descartes, al azar. Cada mano
 * ajena se saca de las cartas que quedan hasta que cuadra con lo que su jugador declaró de pares
 * y juego, porque de eso dependen los lances que se juegan.
 */
export function reconstruirMus(vista: VistaMus, azar: EstadoAzar): EstadoMus {
  const g = new Generador(azar);
  let quedan = cartasFuera(crearBaraja('espanola40'), vista.miMano ?? []);
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === vista.asiento && vista.miMano) return [...vista.miMano];
    let mano: IdCarta[] = [];
    for (let intento = 0; intento < INTENTOS; intento++) {
      mano = new Ocultas(quedan, [g.siguiente(), g.siguiente(), g.siguiente(), 1]).tomar(n);
      if (cuadra(vista, a, mano)) break;
    }
    quedan = cartasFuera(quedan, mano);
    return mano;
  });
  const ocultas = new Ocultas(quedan, [g.siguiente(), g.siguiente(), g.siguiente(), 1]);
  const descartes = ocultas.tomar(vista.cartasDescartadas);
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    mazo: ocultas.tomar(ocultas.quedan),
    descartes,
    fase: vista.fase,
    musPedido: [...vista.musPedido],
    descartados: [...vista.descartados],
    turno: vista.turno ?? vista.mano,
    lance: vista.lance,
    hablados: [...vista.hablados],
    envite: vista.envite,
    lances: [...vista.lances],
    declaraciones: vista.declaraciones,
    piedras: vista.piedras,
    juegos: vista.juegos,
    resultadosManos: [...vista.resultadosManos],
    ultimaAccion: ultimaAccion(vista, descartes),
  };
}

/** La última acción; si fue un descarte, sus cartas son las últimas del montón. */
function ultimaAccion(vista: VistaMus, descartes: readonly IdCarta[]): EstadoMus['ultimaAccion'] {
  const ultima = vista.ultimaAccion;
  if (ultima === null) return null;
  if (ultima.accion.tipo !== 'descartar') return { asiento: ultima.asiento, accion: ultima.accion };
  const cartas = descartes.slice(descartes.length - ultima.accion.cantidad);
  return { asiento: ultima.asiento, accion: { tipo: 'descartar', cartas } };
}

/** Preparado para una IA difícil del Mus; hoy no se usa (ver `IAS.mus`). */
export const SIMULABLE_MUS: Simulable<ConfigMus, EstadoMus, AccionMus, VistaMus> = {
  juego: mus,
  reconstruir: reconstruirMus,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const mia = parejaDe(asiento);
    const otra = 1 - mia;
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const tras = cerrada ? cerrada.piedrasTras : final.piedras;
    const piedras = tras[mia] - inicio.piedras[mia] - (tras[otra]! - inicio.piedras[otra]!);
    const juego =
      cerrada?.juegoGanado == null ? 0 : cerrada.juegoGanado === mia ? PREMIO_JUEGO : -PREMIO_JUEGO;
    return piedras + juego + bonoPartida(mus.resultado(final), asiento);
  },
  reconstrucciones: 12,
  presupuesto: 150,
  // Simula el mus y los descartes; los envites de los lances, como la normal.
  decideLaBase: (vista) => vista.fase === 'lance',
};
