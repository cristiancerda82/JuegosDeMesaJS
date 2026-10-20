import type { EstadoAzar } from '../../baraja/azar';
import {
  remigio,
  type AccionRemigio,
  type ConfigRemigio,
  type EstadoRemigio,
  type VistaRemigio,
} from '../../juegos/remigio';
import {
  cartasDeCombinacion,
  cartasRemigio,
  puntosCartaRemigio,
  type CartaRemigio,
} from '../../juegos/remigio-combinaciones';
import type { Asiento } from '../../motor/contrato';
import { descartesRemigio, utilidadRemigio } from '../remigio-basica';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/** Descartes de la base que se simulan (los mejores según ella). */
const DESCARTES_SIMULADOS = 3;

/**
 * Un estado de Remigio coherente con la vista: el montón y las combinaciones son públicos; las
 * manos ajenas y el mazo se reparten al azar con las cartas que no se ven.
 */
export function reconstruirRemigio(vista: VistaRemigio, azar: EstadoAzar): EstadoRemigio {
  const vistas = new Set<CartaRemigio>([
    ...(vista.miMano ?? []),
    ...vista.monton,
    ...vista.combinaciones.flatMap(cartasDeCombinacion),
  ]);
  const ocultas = new Ocultas(
    cartasRemigio().filter((c) => !vistas.has(c)),
    azar,
  );
  const manos = manosOcultas(vista.cartasEnMano, vista.asiento, vista.miMano, ocultas);
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    numeroMano: vista.numeroMano,
    manos,
    mazo: ocultas.tomar(ocultas.quedan),
    monton: [...vista.monton],
    combinaciones: [...vista.combinaciones],
    siguienteId: vista.siguienteId,
    turno: vista.turno ?? 0,
    fase: vista.fase,
    bajado: [...vista.bajado],
    bajadoAntesDelTurno: vista.bajadoAntesDelTurno,
    rehechos: vista.rehechos,
    puntos: [...vista.puntos],
    eliminados: [...vista.eliminados],
    resultadosManos: [...vista.resultadosManos],
    ultimaAccion: vista.ultimaAccion,
  };
}

/** Lo que pesa cada carta que queda en la mano, además de sus puntos: acerca o aleja el cierre. */
const COSTE_POR_CARTA = 3;

/**
 * Puntos de cada jugador en la mano: los del resultado si se cerró; si no, los de las cartas que
 * no le sirven (una carta útil, como un comodín que puede colocar, apenas cuenta) más un coste
 * por carta.
 */
function puntosDeLaMano(inicio: EstadoRemigio, final: EstadoRemigio): readonly number[] {
  const cerrada = final.resultadosManos[inicio.resultadosManos.length];
  if (cerrada) return cerrada.puntosMano;
  return final.manos.map((m) =>
    m.reduce(
      (s, c) =>
        s +
        COSTE_POR_CARTA +
        (puntosCartaRemigio(c) *
          (100 - Math.min(100, 2 * utilidadRemigio(c, m, final.combinaciones)))) /
          100,
      0,
    ),
  );
}

export const SIMULABLE_REMIGIO: Simulable<
  ConfigRemigio,
  EstadoRemigio,
  AccionRemigio,
  VistaRemigio
> = {
  juego: remigio,
  reconstruir: reconstruirRemigio,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento: Asiento) {
    const puntos = puntosDeLaMano(inicio, final);
    const rivales = puntos.filter((_, a) => a !== asiento && !inicio.eliminados[a]);
    const media = rivales.reduce((s, p) => s + p, 0) / Math.max(1, rivales.length);
    return media - puntos[asiento]! + bonoPartida(remigio.resultado(final), asiento);
  },
  // Solo se simula robar (mazo o montón) y qué descartar; lo que se baja lo decide la normal.
  candidatas(vista, acciones, deLaBase) {
    if (vista.fase === 'robar') return acciones;
    if (deLaBase.tipo === 'descartar') {
      return descartesRemigio(vista, acciones).slice(0, DESCARTES_SIMULADOS);
    }
    return [deLaBase];
  },
  reconstrucciones: 8,
  presupuesto: 24,
  // Las manos son largas: se simulan unos turnos y se valora lo que hay en ese punto.
  horizonte: 12,
};
