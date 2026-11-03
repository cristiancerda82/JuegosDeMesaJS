import { Generador } from '../baraja/azar';
import type { IdCarta } from '../baraja/cartas';
import { puntosEnvit, rangoTruc } from '../juegos/truc';
import type { AccionTruco, VistaTruco } from '../juegos/truco';
import { bandoDe } from '../motor/bazas';
import type { Agente } from './agente';

/**
 * IA básica del Truco: canta el envido por sus puntos, el truco y las respuestas por la fuerza de
 * su mano, a veces farolea (con su propio azar, así que es reproducible) y juega la carta más
 * barata que gana. Es la del Truc con los cantos del Truco.
 */
export const iaTrucoBasica: Agente<VistaTruco, AccionTruco> = {
  id: 'truco-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const g = new Generador(azar);
    const accion = elegir(vista, acciones, g);
    return { accion, azar: g.estado() };
  },
};

/** Envido con el que se canta, se quiere (y siendo de los primeros en la mano) y se sube. */
const ENVIDO_CANTAR = 30;
const ENVIDO_QUERER = 27;
const ENVIDO_QUERER_MANO = 25;
const ENVIDO_REAL = 31;
const ENVIDO_FALTA = 33;

/** Fuerza de la mano (0 a 1, aprox.) desde la que se canta truco, se sube y se quiere. */
const FUERZA_TRUCO = 0.72;
const FUERZA_SUBIR = 0.85;
const FUERZA_QUERER = 0.5;
/** Probabilidad de farolear cuando no se canta truco por fuerza. */
const PROB_FAROL = 0.1;

const tiene = (acciones: readonly AccionTruco[], tipo: AccionTruco['tipo']) =>
  acciones.some((a) => a.tipo === tipo);

/** Las cartas que el jugador tiene o ya jugó en la mano: con ellas se cuenta el envido. */
function cartasDeLaMano(vista: VistaTruco): IdCarta[] {
  const yo = vista.asiento!;
  const jugadas = [...vista.bazasJugadas.flatMap((b) => b.cartas), ...vista.mesa]
    .filter((j) => j.asiento === yo)
    .map((j) => j.carta);
  return [...(vista.miMano ?? []), ...jugadas];
}

/** Bazas ganadas por mi bando y por el rival en la mano. */
function bazasPorBando(vista: VistaTruco): [number, number] {
  const mio = bandoDe(vista.asiento!);
  let mias = 0;
  let suyas = 0;
  for (const b of vista.bazasJugadas) {
    if (b.ganador === mio) mias++;
    else if (b.ganador !== null) suyas++;
  }
  return [mias, suyas];
}

/** La carta que gana ahora la baza en curso. */
function mejorEnMesa(vista: VistaTruco) {
  let mejor: { carta: IdCarta; asiento: number } | null = null;
  for (const j of vista.mesa) {
    if (mejor === null || rangoTruc(j.carta) > rangoTruc(mejor.carta)) mejor = j;
  }
  return mejor;
}

/**
 * Fuerza de la mano: lo altas que son las dos mejores cartas que le quedan, las bazas ya
 * decididas y, si es el último de la baza en curso, si la gana seguro.
 */
export function fuerzaManoTruco(vista: VistaTruco): number {
  const mano = [...(vista.miMano ?? [])].map(rangoTruc).sort((a, b) => b - a);
  const [mias, suyas] = bazasPorBando(vista);
  const altas = mano.slice(0, 2);
  const cartas = altas.length === 0 ? 0 : altas.reduce((s, r) => s + r, 0) / (14 * altas.length);
  let fuerza = cartas + 0.3 * (mias - suyas);
  const mesa = mejorEnMesa(vista);
  const ultimo = vista.mesa.length === vista.config.jugadores - 1;
  if (ultimo && mesa && mano.length > 0 && mias + suyas >= 1) {
    if (bandoDe(mesa.asiento) === bandoDe(vista.asiento!) || mano[0]! > rangoTruc(mesa.carta)) {
      fuerza += 0.5;
    }
  }
  return Math.max(0, Math.min(1, fuerza));
}

/** Soy de los primeros en la mano: gano los empates de envido contra los que vienen detrás. */
const cercaDeLaMano = (vista: VistaTruco) =>
  (vista.asiento! - vista.mano + vista.config.jugadores) % vista.config.jugadores <
  vista.config.jugadores / 2;

function elegir(vista: VistaTruco, acciones: readonly AccionTruco[], g: Generador): AccionTruco {
  const envido = puntosEnvit(cartasDeLaMano(vista));
  const fuerza = fuerzaManoTruco(vista);

  // 1. Respuesta a un envido.
  if (vista.envido.estado === 'pendiente') {
    if (envido >= ENVIDO_FALTA && tiene(acciones, 'faltaEnvido')) return { tipo: 'faltaEnvido' };
    if (envido >= ENVIDO_REAL && tiene(acciones, 'realEnvido')) return { tipo: 'realEnvido' };
    const umbral = cercaDeLaMano(vista) ? ENVIDO_QUERER_MANO : ENVIDO_QUERER;
    // Cuanto más alto lo cantado, más puntos hacen falta.
    const cantos = vista.envido.cantos;
    const exigencia = cantos.includes('falta') ? 6 : 2 * (cantos.length - 1);
    return envido >= umbral + exigencia ? { tipo: 'quiero' } : { tipo: 'noQuiero' };
  }

  // 2. Cantar envido (también ante un truco en la primera baza: el envido está primero).
  if (envido >= ENVIDO_CANTAR && tiene(acciones, 'envido')) return { tipo: 'envido' };

  // 3. Respuesta a un truco.
  if (vista.truco.pendiente > 0) {
    if (fuerza >= FUERZA_SUBIR && tiene(acciones, 'truco')) return { tipo: 'truco' };
    const umbral = FUERZA_QUERER + 0.05 * (vista.truco.pendiente - 1);
    return fuerza >= umbral ? { tipo: 'quiero' } : { tipo: 'noQuiero' };
  }

  // 4. Cantar o subir el truco en su turno, por fuerza o de farol.
  if (tiene(acciones, 'truco')) {
    const umbral = vista.truco.nivel === 0 ? FUERZA_TRUCO : FUERZA_SUBIR;
    const [mias, suyas] = bazasPorBando(vista);
    const farol = vista.truco.nivel === 0 && suyas >= mias && g.siguiente() / 2 ** 32 < PROB_FAROL;
    if (fuerza >= umbral || farol) return { tipo: 'truco' };
  }

  // 5. Jugar carta.
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  if (cartas.length === 0) return acciones.find((a) => a.tipo !== 'meVoy') ?? acciones[0]!;
  return { tipo: 'jugar', carta: cartaParaJugar(vista, cartas) };
}

function cartaParaJugar(vista: VistaTruco, cartas: readonly IdCarta[]): IdCarta {
  const ordenadas = [...cartas].sort((a, b) => rangoTruc(a) - rangoTruc(b));
  const mesa = mejorEnMesa(vista);
  if (mesa === null) {
    // Sale: en la primera baza, con la carta del medio; después, con la mejor.
    if (vista.bazasJugadas.length === 0) return ordenadas[Math.floor(ordenadas.length / 2)]!;
    return ordenadas.at(-1)!;
  }
  if (bandoDe(mesa.asiento) === bandoDe(vista.asiento!)) return ordenadas[0]!;
  const ganadora = ordenadas.find((c) => rangoTruc(c) > rangoTruc(mesa.carta));
  return ganadora ?? ordenadas[0]!;
}
