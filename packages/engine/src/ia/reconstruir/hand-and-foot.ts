import { Generador, type EstadoAzar } from '../../baraja/azar';
import { compararCanasta, esTresRojo, puntosCanasta } from '../../juegos/canasta';
import {
  bandoHandAndFoot,
  cartasHandAndFoot,
  handAndFoot,
  librosDe,
  PREMIO_LIBRO_COMODINES,
  PREMIO_LIBRO_LIMPIO,
  PREMIO_LIBRO_SUCIO,
  PREMIO_TRES_ROJO,
  TAMANO_LIBRO,
  type AccionHandAndFoot,
  type ConfigHandAndFoot,
  type EstadoHandAndFoot,
  type VistaHandAndFoot,
} from '../../juegos/hand-and-foot';
import type { Asiento } from '../../motor/contrato';
import { descartesHandAndFoot } from '../hand-and-foot-basica';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/** Descarte y mano a partir de los que no se simula: cada jugada simulada cuesta demasiado. */
const DESCARTE_GRANDE = 12;
const MANO_GRANDE = 18;
/** Descartes que se simulan: los mejores para la normal. */
const DESCARTES_SIMULADOS = 4;

/**
 * Un estado de Hand and Foot coherente con la vista: el descarte, las combinaciones y los treses
 * rojos son públicos; las manos ajenas (con las cartas que cada uno cogió del descarte), los pies
 * sin coger y el mazo salen al azar de las cartas que no se ven. Los treses rojos nunca están en
 * una mano: van a los pies y al mazo.
 */
export function reconstruirHandAndFoot(
  vista: VistaHandAndFoot,
  azar: EstadoAzar,
): EstadoHandAndFoot {
  const g = new Generador(azar);
  const vistas = new Set([
    ...(vista.miMano ?? []),
    ...vista.descarte,
    ...vista.combinaciones.flatMap((c) => c.cartas),
    ...vista.treses.flat(),
    ...vista.conocidas.flat(),
  ]);
  const ocultas = cartasHandAndFoot().filter((c) => !vistas.has(c));
  const paraManos = new Ocultas(
    ocultas.filter((c) => !esTresRojo(c)),
    [g.siguiente(), g.siguiente(), g.siguiente(), 1],
  );
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === vista.asiento && vista.miMano) return [...vista.miMano];
    const conocidas = vista.conocidas[a]!;
    return [...paraManos.tomar(n - conocidas.length), ...conocidas].sort(compararCanasta);
  });
  const enManos = new Set(manos.flat());
  const resto = new Ocultas(
    ocultas.filter((c) => !enManos.has(c)),
    [g.siguiente(), g.siguiente(), g.siguiente(), 1],
  );
  const pies = vista.cartasEnPie.map((n) => resto.tomar(n));
  return {
    config: vista.config,
    azar,
    ronda: vista.ronda,
    repartidor: vista.repartidor,
    turno: vista.turno ?? 0,
    fase: vista.fase,
    manos,
    pies,
    enPie: [...vista.enPie],
    conocidas: vista.conocidas.map((c) => [...c]),
    mazo: resto.tomar(vista.cartasEnMazo),
    descarte: [...vista.descarte],
    combinaciones: [...vista.combinaciones],
    siguienteId: vista.siguienteId,
    treses: vista.treses.map((t) => [...t]),
    abierto: [...vista.abierto],
    apertura: vista.apertura,
    puntos: [...vista.puntos],
    ultimaAccion: vista.ultimaAccion,
    resultadosRondas: [...vista.resultadosRondas],
    terminada: vista.turno === null,
  };
}

/**
 * Lo que lleva una pareja a mitad de ronda: lo bajado, con medio libro por cada uno a medias. Las
 * cartas de la mano no restan: a mitad de ronda son más bien con qué bajar (coger el descarte no
 * puede parecer malo), y el pie sin coger resta solo la mitad.
 */
function provisional(e: EstadoHandAndFoot, bando: number): number {
  let total = 0;
  for (const c of e.combinaciones) {
    if (c.bando !== bando) continue;
    total += c.cartas.reduce((s, x) => s + puntosCanasta(x), 0);
    if (c.cartas.length < TAMANO_LIBRO && c.cartas.length >= 5) total += PREMIO_LIBRO_SUCIO / 2;
  }
  const l = librosDe(e.combinaciones, bando);
  total +=
    l.limpios * PREMIO_LIBRO_LIMPIO +
    l.sucios * PREMIO_LIBRO_SUCIO +
    l.deComodines * PREMIO_LIBRO_COMODINES;
  const enPie = [0, 1, 2, 3]
    .filter((a) => bandoHandAndFoot(a) === bando)
    .flatMap((a) => e.pies[a]!)
    .reduce((s, c) => s + puntosCanasta(c), 0);
  return total - enPie / 2 + e.treses[bando]!.length * PREMIO_TRES_ROJO;
}

function sumaDeLaRonda(inicio: EstadoHandAndFoot, final: EstadoHandAndFoot, bando: number) {
  const cerrada = final.resultadosRondas[inicio.resultadosRondas.length];
  if (cerrada) return cerrada.desglose[bando]!.total;
  return provisional(final, bando);
}

export const SIMULABLE_HAND_AND_FOOT: Simulable<
  ConfigHandAndFoot,
  EstadoHandAndFoot,
  AccionHandAndFoot,
  VistaHandAndFoot
> = {
  juego: handAndFoot,
  reconstruir: reconstruirHandAndFoot,
  manoTerminada: (inicio, e) => e.resultadosRondas.length > inicio.resultadosRondas.length,
  valorar(inicio, final, asiento: Asiento) {
    const mio = bandoHandAndFoot(asiento);
    return (
      sumaDeLaRonda(inicio, final, mio) -
      sumaDeLaRonda(inicio, final, 1 - mio) +
      bonoPartida(handAndFoot.resultado(final), asiento)
    );
  },
  // Con un descarte o unas manos grandes, cada jugada simulada cuesta demasiado: decide la normal.
  decideLaBase: (vista) =>
    vista.descarte.length >= DESCARTE_GRANDE || vista.cartasEnMano.some((n) => n > MANO_GRANDE),
  // Solo se simula qué descartar; robar o coger el descarte y lo que se baja lo decide la normal.
  candidatas(vista, acciones, deLaBase) {
    if (deLaBase.tipo === 'descartar') {
      return descartesHandAndFoot(vista, acciones).slice(0, DESCARTES_SIMULADOS);
    }
    return [deLaBase];
  },
  reconstrucciones: 8,
  presupuesto: 32,
  // Las rondas son largas: se simulan unos turnos y se valora lo que hay en ese punto.
  horizonte: 24,
};
