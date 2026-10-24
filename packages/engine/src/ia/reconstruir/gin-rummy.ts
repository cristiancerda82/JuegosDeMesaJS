import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja } from '../../baraja/cartas';
import {
  ginRummy,
  mejorRepartoGin,
  type AccionGinRummy,
  type ConfigGinRummy,
  type EstadoGinRummy,
  type VistaGinRummy,
} from '../../juegos/gin-rummy';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { descartesGinRummy } from '../gin-rummy-basica';
import { bonoPartida, Ocultas } from './comun';

/** Descartes que simula la difícil: los primeros en el orden de la básica. */
const DESCARTES_SIMULADOS = 4;

/**
 * Un estado de Gin Rummy coherente con la vista: la mano del rival lleva las cartas que cogió del
 * descarte, y el resto de su mano y el mazo salen al azar de las cartas que no se ven.
 */
export function reconstruirGinRummy(vista: VistaGinRummy, azar: EstadoAzar): EstadoGinRummy {
  const yo = vista.asiento ?? 0;
  const rival = 1 - yo;
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      vista.descarte,
      vista.cogidas.flat(),
    ),
    azar,
  );
  const manos: (readonly string[])[] = [[], []];
  manos[yo] = vista.miMano ? [...vista.miMano] : ocultas.tomar(vista.cartasEnMano[yo]!);
  const cogidas = vista.cogidas[rival]!;
  manos[rival] = [...ocultas.tomar(vista.cartasEnMano[rival]! - cogidas.length), ...cogidas];
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo: ocultas.tomar(vista.mazo),
    descarte: [...vista.descarte],
    manos: manos as EstadoGinRummy['manos'],
    turno: vista.turno ?? 0,
    fase: vista.fase,
    pasesPrimera: vista.pasesPrimera,
    robadaDelDescarte: vista.robadaDelDescarte,
    cogidas: vista.cogidas.map((c) => [...c]),
    puntos: [...vista.puntos],
    manosGanadas: [...vista.manosGanadas],
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Lo que gana `asiento` en la mano: los puntos del cierre, o la diferencia de puntos sueltos. */
function valorMano(inicio: EstadoGinRummy, final: EstadoGinRummy, asiento: Asiento): number {
  const cerrada = final.resultadosManos[inicio.resultadosManos.length];
  if (cerrada) {
    if (cerrada.gana === null) return 0;
    return cerrada.gana === asiento ? cerrada.puntosMano : -cerrada.puntosMano;
  }
  const sueltos = final.manos.map((m) => mejorRepartoGin(m).puntos);
  return sueltos[1 - asiento]! - sueltos[asiento]!;
}

export const SIMULABLE_GIN_RUMMY: Simulable<
  ConfigGinRummy,
  EstadoGinRummy,
  AccionGinRummy,
  VistaGinRummy
> = {
  juego: ginRummy,
  reconstruir: reconstruirGinRummy,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar: (inicio, final, asiento) =>
    valorMano(inicio, final, asiento) + bonoPartida(ginRummy.resultado(final), asiento),
  // Si la básica cierra, cierra como ella.
  candidatas(vista, acciones, deLaBase) {
    if (deLaBase.tipo === 'cerrar') return [deLaBase];
    if (vista.fase !== 'descartar') return acciones;
    return descartesGinRummy(vista, acciones).slice(0, DESCARTES_SIMULADOS);
  },
  reconstrucciones: 12,
  presupuesto: 48,
  // Las manos son largas: se simulan unos turnos y se valora lo que queda en mano.
  horizonte: 16,
};
