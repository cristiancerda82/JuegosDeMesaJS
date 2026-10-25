import { Generador, type EstadoAzar } from '../../baraja/azar';
import {
  bandoCanasta,
  canasta,
  comodinesDe,
  compararCanasta,
  cotaBajadaCanasta,
  esCanasta,
  esCanastaLimpia,
  MAXIMO_COMODINES_CANASTA,
  PREMIO_CANASTA_LIMPIA,
  PREMIO_CANASTA_SUCIA,
  puntosCanasta,
  type AccionCanasta,
  type ConfigCanasta,
  type EstadoCanasta,
  type VistaCanasta,
} from '../../juegos/canasta';
import { cartasPinacle } from '../../juegos/pinacle-combinaciones';
import type { Asiento } from '../../motor/contrato';
import { descartesCanasta, eleccionPozoCanasta } from '../canasta-basica';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/** Pozo y mano a partir de los que no se simula: cada jugada simulada cuesta demasiado. */
const POZO_GRANDE = 10;
const MANO_GRANDE = 16;
/** Descartes que se simulan: los mejores para la normal. */
const DESCARTES_SIMULADOS = 4;
/** Intentos para que el rival a mitad de su primera bajada pueda llegar al mínimo. */
const INTENTOS = 100;

/**
 * Un estado de Canasta coherente con la vista: el pozo, las combinaciones y los treses rojos son
 * públicos; las manos ajenas (con las cartas que cada uno se llevó del pozo) y el mazo salen al
 * azar de las cartas que no se ven.
 */
export function reconstruirCanasta(vista: VistaCanasta, azar: EstadoAzar): EstadoCanasta {
  const g = new Generador(azar);
  let estado = repartirOcultas(vista, azar);
  // Un rival a mitad de su primera bajada tiene en la mano con qué llegar al mínimo.
  const otro = vista.turno !== null && vista.turno !== vista.asiento && vista.apertura !== null;
  for (let intento = 1; otro && intento < INTENTOS && !puedeLlegar(estado); intento++) {
    estado = repartirOcultas(vista, [g.siguiente(), g.siguiente(), g.siguiente(), 1]);
  }
  return estado;
}

function puedeLlegar(e: EstadoCanasta): boolean {
  const bando = bandoCanasta(e.turno);
  const bloqueadas = e.apertura?.bloqueadas ?? [];
  const libres = e.manos[e.turno]!.filter((c) => !bloqueadas.includes(c));
  const propias = e.combinaciones.filter((c) => c.bando === bando);
  const hechas = propias.reduce(
    (s, c) => s + c.cartas.reduce((t, x) => t + puntosCanasta(x), 0),
    0,
  );
  const huecos = propias.map((c) => ({
    valor: c.valor,
    hueco: MAXIMO_COMODINES_CANASTA - comodinesDe(c.cartas),
  }));
  const cota = cotaBajadaCanasta(libres, huecos, Math.max(0, 2 - bloqueadas.length));
  return hechas + cota >= canasta.vistaDe(e, null).minimos[bando]!;
}

function repartirOcultas(vista: VistaCanasta, azar: EstadoAzar): EstadoCanasta {
  const vistas = new Set([
    ...(vista.miMano ?? []),
    ...vista.pozo,
    ...vista.combinaciones.flatMap((c) => c.cartas),
    ...vista.treses.flat(),
    ...vista.conocidas.flat(),
  ]);
  const ocultas = new Ocultas(
    cartasPinacle().filter((c) => !vistas.has(c)),
    azar,
  );
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === vista.asiento && vista.miMano) return [...vista.miMano];
    const conocidas = vista.conocidas[a]!;
    return [...ocultas.tomar(n - conocidas.length), ...conocidas].sort(compararCanasta);
  });
  return {
    config: vista.config,
    azar,
    numeroMano: vista.numeroMano,
    repartidor: vista.repartidor,
    turno: vista.turno ?? 0,
    fase: vista.fase,
    manos,
    conocidas: vista.conocidas.map((c) => [...c]),
    mazo: ocultas.tomar(vista.cartasEnMazo),
    pozo: [...vista.pozo],
    congelado: vista.congelado,
    combinaciones: [...vista.combinaciones],
    siguienteId: vista.siguienteId,
    treses: vista.treses.map((t) => [...t]),
    abierto: [...vista.abierto],
    apertura: vista.apertura,
    puntos: [...vista.puntos],
    puntosInicioMano: [...vista.puntosInicioMano],
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
    terminada: vista.turno === null,
  };
}

/** Lo que llevaría un bando si la mano terminara ahora, con media canasta por cada una a medias. */
function provisional(e: EstadoCanasta, bando: number): number {
  let total = 0;
  for (const c of e.combinaciones) {
    if (c.bando !== bando) continue;
    total += c.cartas.reduce((s, x) => s + puntosCanasta(x), 0);
    if (esCanastaLimpia(c)) total += PREMIO_CANASTA_LIMPIA;
    else if (esCanasta(c)) total += PREMIO_CANASTA_SUCIA;
    else if (c.cartas.length >= 5) total += PREMIO_CANASTA_SUCIA / 2;
  }
  const enMano = e.manos
    .filter((_, a) => bandoCanasta(a) === bando)
    .flat()
    .reduce((s, c) => s + puntosCanasta(c), 0);
  return total - enMano + e.treses[bando]!.length * 100 * (e.abierto[bando] ? 1 : -1);
}

function sumaDeLaMano(inicio: EstadoCanasta, final: EstadoCanasta, bando: number): number {
  const cerrada = final.resultadosManos[inicio.resultadosManos.length];
  if (cerrada) return cerrada.desglose[bando]!.total;
  return provisional(final, bando);
}

export const SIMULABLE_CANASTA: Simulable<
  ConfigCanasta,
  EstadoCanasta,
  AccionCanasta,
  VistaCanasta
> = {
  juego: canasta,
  reconstruir: reconstruirCanasta,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento: Asiento) {
    const mio = bandoCanasta(asiento);
    return (
      sumaDeLaMano(inicio, final, mio) -
      sumaDeLaMano(inicio, final, 1 - mio) +
      bonoPartida(canasta.resultado(final), asiento)
    );
  },
  // Con un pozo o unas manos grandes, cada jugada simulada cuesta demasiado: decide la normal.
  decideLaBase: (vista) =>
    vista.pozo.length >= POZO_GRANDE || vista.cartasEnMano.some((n) => n > MANO_GRANDE),
  // Solo se simula robar o llevarse el pozo, y qué descartar; lo que se baja lo decide la normal.
  candidatas(vista, acciones, deLaBase) {
    if (vista.fase === 'robar') {
      const pozo = eleccionPozoCanasta(acciones);
      const otras = acciones.filter((a) => a.tipo === 'robar' || a.tipo === 'acabar');
      return pozo ? [pozo, ...otras] : otras;
    }
    if (deLaBase.tipo === 'descartar') {
      return descartesCanasta(vista, acciones).slice(0, DESCARTES_SIMULADOS);
    }
    return [deLaBase];
  },
  reconstrucciones: 8,
  presupuesto: 32,
  // Las manos son largas: se simulan unos turnos y se valora lo que hay en ese punto.
  horizonte: 12,
};
