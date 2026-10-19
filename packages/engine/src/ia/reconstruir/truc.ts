import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  puntosEnvit,
  truc,
  type AccionTruc,
  type ConfigTruc,
  type EstadoTruc,
  type VistaTruc,
} from '../../juegos/truc';
import { bandoDe } from '../../motor/bazas';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/** Repartos al azar que se prueban antes de buscar uno que cuadre con el envit mostrado. */
const INTENTOS = 200;

/** Cartas que cada asiento ya jugó en la mano. */
function jugadasDe(vista: VistaTruc, asiento: Asiento): IdCarta[] {
  return [...vista.bazasJugadas.flatMap((b) => b.cartas), ...vista.mesa]
    .filter((j) => j.asiento === asiento)
    .map((j) => j.carta);
}

/** Todas las combinaciones de `k` cartas de `cartas`. */
function* combinaciones(cartas: readonly IdCarta[], k: number, desde = 0): Generator<IdCarta[]> {
  if (k === 0) {
    yield [];
    return;
  }
  for (let i = desde; i <= cartas.length - k; i++) {
    for (const resto of combinaciones(cartas, k - 1, i + 1)) yield [cartas[i]!, ...resto];
  }
}

/**
 * Reparte las cartas ocultas entre los asientos con restricción de envit (en `orden`) por
 * búsqueda exhaustiva; el estado real cumple las restricciones, así que siempre hay solución.
 */
function buscar(
  ocultas: readonly IdCarta[],
  orden: readonly Asiento[],
  tamanos: readonly number[],
  cuadra: (asiento: Asiento, mano: readonly IdCarta[]) => boolean,
): Map<Asiento, IdCarta[]> | null {
  if (orden.length === 0) return new Map();
  const [a, ...resto] = orden as [Asiento, ...Asiento[]];
  for (const mano of combinaciones(ocultas, tamanos[a]!)) {
    if (!cuadra(a, mano)) continue;
    const quedan = ocultas.filter((c) => !mano.includes(c));
    const siguiente = buscar(quedan, resto, tamanos, cuadra);
    if (siguiente) return siguiente.set(a, mano);
  }
  return null;
}

/**
 * Un estado de Truc coherente con la vista: las manos ajenas al azar, de forma que quien mostró
 * su envit tenga esos puntos con sus cartas en mano y las que ya jugó.
 */
export function reconstruirTruc(vista: VistaTruc, azar: EstadoAzar): EstadoTruc {
  const n = vista.config.jugadores;
  const yo = vista.asiento;
  const vistas = [
    ...(vista.miMano ?? []),
    ...vista.bazasJugadas.flatMap((b) => b.cartas.map((j) => j.carta)),
    ...vista.mesa.map((j) => j.carta),
  ];
  const ocultas = cartasFuera(crearBaraja('espanola40'), vistas);
  const ajenos = Array.from({ length: n }, (_, a) => a).filter((a) => a !== yo);
  const cuadra = (a: Asiento, mano: readonly IdCarta[]) => {
    const mostrado = vista.envit.mostrado[a];
    return mostrado === null || mostrado === undefined
      ? true
      : puntosEnvit([...mano, ...jugadasDe(vista, a)]) === mostrado;
  };

  let manos: Map<Asiento, IdCarta[]> | null = null;
  let barajado = { cartas: ocultas, azar };
  for (let intento = 0; intento < INTENTOS && manos === null; intento++) {
    barajado = barajar(ocultas, barajado.azar);
    const reparto = new Map<Asiento, IdCarta[]>();
    let i = 0;
    for (const a of ajenos) {
      reparto.set(a, barajado.cartas.slice(i, i + vista.cartasEnMano[a]!));
      i += vista.cartasEnMano[a]!;
    }
    if (ajenos.every((a) => cuadra(a, reparto.get(a)!))) manos = reparto;
  }
  if (manos === null) {
    const conEnvit = ajenos.filter((a) => vista.envit.mostrado[a] !== null);
    const libres = ajenos.filter((a) => vista.envit.mostrado[a] === null);
    const fijadas = buscar(barajado.cartas, conEnvit, vista.cartasEnMano, cuadra);
    if (fijadas === null) throw new Error('Ningún reparto cuadra con el envit mostrado');
    let quedan = barajado.cartas.filter((c) => ![...fijadas.values()].flat().includes(c));
    for (const a of libres) {
      fijadas.set(a, quedan.slice(0, vista.cartasEnMano[a]!));
      quedan = quedan.slice(vista.cartasEnMano[a]!);
    }
    manos = fijadas;
  }

  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos: Array.from({ length: n }, (_, a) =>
      a === yo && vista.miMano ? [...vista.miMano] : manos.get(a)!,
    ),
    turno: vista.turnoCarta,
    mesa: [...vista.mesa],
    bazasJugadas: [...vista.bazasJugadas],
    ultimaBaza: vista.ultimaBaza,
    envit: vista.envit,
    truc: vista.truc,
    piedras: vista.piedras,
    cames: vista.cames,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Lo que pesa cerrar (o dejar cerrar) una came, en piedras. */
const BONO_CAME = 6;

export const SIMULABLE_TRUC: Simulable<ConfigTruc, EstadoTruc, AccionTruc, VistaTruc> = {
  juego: truc,
  reconstruir: reconstruirTruc,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(truc.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const mio = bandoDe(asiento);
    const piedras = (b: number) => r.piedrasEnvit[b]! + r.piedrasTruc[b]!;
    const came = r.came === null ? 0 : r.came === mio ? BONO_CAME : -BONO_CAME;
    return piedras(mio) - piedras(1 - mio) + came + bono;
  },
  // Las apuestas las decide la base: la simulación no ve el farol ni que el rival apuesta justo
  // cuando lleva buena mano (spec niveles-ia). Solo se simula qué carta jugar.
  decideLaBase: (vista) => vista.envit.estado === 'pendiente' || vista.truc.pendiente > 0,
  candidatas: (_vista, acciones, deLaBase) =>
    deLaBase.tipo === 'jugar' ? acciones.filter((a) => a.tipo === 'jugar') : [deLaBase],
  reconstrucciones: 40,
  presupuesto: 120,
};
