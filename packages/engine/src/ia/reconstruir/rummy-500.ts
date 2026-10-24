import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  anadidosRummy,
  bajadasRummy,
  mejorBajadaRummy,
  puntosEnManoRummy,
  puntosEnMesaRummy,
  rummy500,
  type AccionRummy500,
  type ConfigRummy500,
  type EstadoRummy500,
  type VistaRummy500,
} from '../../juegos/rummy-500';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { descartesRummy500, robosRummy500 } from '../rummy-500-basica';
import { bonoPartida, Ocultas } from './comun';

/** Robos del descarte que simula la difícil, además del mazo. */
const ROBOS_SIMULADOS = 3;
/** Descartes que simula la difícil. */
const DESCARTES_SIMULADOS = 4;

/**
 * Un estado de Rummy 500 coherente con la vista: el descarte y la mesa son públicos; las manos
 * ajenas y el mazo salen al azar de las cartas que no se ven. La obligada y la carta que no se
 * puede soltar del jugador en turno siguen en su mano.
 */
export function reconstruirRummy500(vista: VistaRummy500, azar: EstadoAzar): EstadoRummy500 {
  const yo = vista.asiento ?? 0;
  const ajeno = vista.turno !== null && vista.turno !== yo;
  // Con la obligada pendiente, el jugador en turno aún no ha bajado nada: tiene todas las que
  // cogió del descarte.
  const cogidas =
    vista.obligada !== null && vista.ultimaAccion?.tipo === 'robarDescarte'
      ? vista.ultimaAccion.cartas
      : [];
  const conocidas = ajeno
    ? [...new Set([...cogidas, ...[vista.obligada, vista.noDescartar].filter((c) => c !== null)])]
    : [];
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('francesa52'),
      vista.miMano ?? [],
      vista.descarte,
      vista.combinaciones.flatMap((c) => c.cartas.map((x) => x.carta)),
      conocidas,
    ),
    azar,
  );
  // Primero la mano del jugador en turno, que tiene que poder usar la obligada; después el resto.
  let enTurno: IdCarta[] | null = null;
  if (vista.turno !== null && conocidas.length > 0) {
    const n = vista.cartasEnMano[vista.turno]!;
    const sacadas = ocultas.sacar(paraLaObligada(vista, conocidas, ocultas.todas, n));
    enTurno = [...sacadas, ...ocultas.tomar(n - conocidas.length - sacadas.length), ...conocidas];
  }
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    if (a === vista.turno && enTurno !== null) return enTurno;
    return ocultas.tomar(n);
  });
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    numeroMano: vista.numeroMano,
    manos,
    mazo: ocultas.tomar(vista.mazo),
    descarte: [...vista.descarte],
    combinaciones: vista.combinaciones,
    siguienteId: vista.siguienteId,
    turno: vista.turno ?? 0,
    fase: vista.fase,
    obligada: vista.obligada,
    noDescartar: vista.noDescartar,
    puntos: [...vista.puntos],
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
  };
}

/**
 * Cartas ocultas que tiene que tener quien cogió la obligada para poder usarla: las que forman
 * con ella una combinación (si no se puede añadir a la mesa). Las ocultas ya están barajadas, así
 * que se elige la combinación cuyas cartas aparecen antes.
 */
function paraLaObligada(
  vista: VistaRummy500,
  conocidas: readonly IdCarta[],
  ocultas: readonly IdCarta[],
  enMano: number,
): IdCarta[] {
  const obligada = vista.obligada;
  if (obligada === null || anadidosRummy([obligada], vista.combinaciones).length > 0) return [];
  const sitio = enMano - conocidas.length;
  const posicion = new Map(ocultas.map((c, i) => [c, i]));
  let mejor: IdCarta[] | null = null;
  let orden = Infinity;
  for (const b of bajadasRummy([...conocidas, ...ocultas])) {
    if (!b.includes(obligada)) continue;
    const faltan = b.filter((c) => posicion.has(c));
    // Tiene que quedarle al menos una carta para descartar tras bajarla.
    if (faltan.length > sitio || enMano - b.length < 1) continue;
    const peso = Math.max(-1, ...faltan.map((c) => posicion.get(c)!));
    if (peso < orden) {
      mejor = faltan;
      orden = peso;
    }
  }
  return mejor ?? [];
}

/** Puntos de la mano de cada uno: los del resultado, o lo puesto en la mesa menos lo que queda. */
function puntosMano(inicio: EstadoRummy500, final: EstadoRummy500): number[] {
  const cerrada = final.resultadosManos[inicio.resultadosManos.length];
  if (cerrada) return [...cerrada.puntosMano];
  const puntos = final.manos.map(
    (m) => -m.reduce((s, c) => s + puntosEnManoRummy(c), 0) + mejorBajadaRummy(m).puntos / 2,
  );
  for (const comb of final.combinaciones) {
    for (const { carta, de } of comb.cartas) puntos[de]! += puntosEnMesaRummy(carta, comb);
  }
  return puntos;
}

export const SIMULABLE_RUMMY_500: Simulable<
  ConfigRummy500,
  EstadoRummy500,
  AccionRummy500,
  VistaRummy500
> = {
  juego: rummy500,
  reconstruir: reconstruirRummy500,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento: Asiento) {
    const puntos = puntosMano(inicio, final);
    const otros = puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return puntos[asiento]! - media + bonoPartida(rummy500.resultado(final), asiento);
  },
  // Solo el robo y el descarte; lo que baja y añade lo decide la básica.
  candidatas(vista, acciones, deLaBase) {
    if (vista.fase === 'robar') {
      const mazo = acciones.filter((a) => a.tipo === 'robarMazo');
      const robos = robosRummy500(vista, acciones).slice(0, ROBOS_SIMULADOS);
      const todas = [...mazo, ...robos];
      return todas.some((a) => JSON.stringify(a) === JSON.stringify(deLaBase))
        ? todas
        : [deLaBase, ...todas];
    }
    if (deLaBase.tipo !== 'descartar') return [deLaBase];
    return descartesRummy500(vista, acciones).slice(0, DESCARTES_SIMULADOS);
  },
  reconstrucciones: 8,
  presupuesto: 32,
  // Las manos son largas: se simulan unos turnos y se valora lo que hay en ese punto.
  horizonte: 12,
};
