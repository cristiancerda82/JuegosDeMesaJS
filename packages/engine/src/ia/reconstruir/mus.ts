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

/** Las manos ajenas cuadran con lo que cada uno declaró de pares y de juego. */
function cuadran(vista: VistaMus, manos: readonly (readonly IdCarta[])[]): boolean {
  const { pares: conPares, juego: conJuego } = vista.declaraciones;
  return manos.every((mano, a) => {
    if (a === vista.asiento) return true;
    if (conPares && (pares(mano, vista.config.reyes) !== null) !== conPares[a]) return false;
    if (conJuego && tieneJuego(mano, vista.config.reyes) !== conJuego[a]) return false;
    return true;
  });
}

/**
 * Un estado de Mus coherente con la vista: manos ajenas, mazo y descartes, al azar. Las manos
 * ajenas se repiten hasta que cuadran con lo declarado de pares y juego (si no se consigue en
 * unos intentos, vale la última).
 */
export function reconstruirMus(vista: VistaMus, azar: EstadoAzar): EstadoMus {
  const desconocidas = cartasFuera(crearBaraja('espanola40'), vista.miMano ?? []);
  const g = new Generador(azar);
  let manos: IdCarta[][] = [];
  let ocultas = new Ocultas(desconocidas, azar);
  for (let intento = 0; intento < INTENTOS; intento++) {
    ocultas = new Ocultas(desconocidas, [g.siguiente(), g.siguiente(), g.siguiente(), 1]);
    manos = vista.cartasEnMano.map((n, a) =>
      a === vista.asiento && vista.miMano ? [...vista.miMano] : ocultas.tomar(n),
    );
    if (cuadran(vista, manos)) break;
  }
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
};
