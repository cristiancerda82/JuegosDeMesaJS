import { Generador } from '../baraja/azar';
import type { IdCarta } from '../baraja/cartas';
import { puntosEnvit, rangoTruc, type AccionTruc, type VistaTruc } from '../juegos/truc';
import { bandoDe } from '../motor/bazas';
import type { Agente } from './agente';

/**
 * IA básica del Truc: envida por sus puntos, truca y responde por la fuerza de su mano, a veces
 * farolea (con su propio azar, así que es reproducible) y juega la carta más barata que gana.
 */
export const iaTrucBasica: Agente<VistaTruc, AccionTruc> = {
  id: 'truc-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const g = new Generador(azar);
    const accion = elegir(vista, acciones, g);
    return { accion, azar: g.estado() };
  },
};

/** Envit con el que se envida, se quiere (y siendo de los primeros en la mano) y se sube. */
export const ENVIT_ENVIDAR = 30;
export const ENVIT_QUERER = 27;
export const ENVIT_QUERER_MANO = 25;
export const ENVIT_TORNE = 31;
export const ENVIT_FALTA = 33;

/** Fuerza de la mano (0 a 1, aprox.) desde la que se truca, se sube y se quiere. */
export const FUERZA_TRUCAR = 0.72;
export const FUERZA_SUBIR = 0.85;
export const FUERZA_QUERER = 0.5;
/** Probabilidad de farolear cuando no se truca por fuerza. */
export const PROB_FAROL = 0.1;

const tiene = (acciones: readonly AccionTruc[], tipo: AccionTruc['tipo']) =>
  acciones.find((a) => a.tipo === tipo);

/** Las cartas que el jugador tiene o ya jugó en la mano: con ellas se cuenta el envit. */
function cartasDeLaMano(vista: VistaTruc): IdCarta[] {
  const yo = vista.asiento!;
  const jugadas = [...vista.bazasJugadas.flatMap((b) => b.cartas), ...vista.mesa]
    .filter((j) => j.asiento === yo)
    .map((j) => j.carta);
  return [...(vista.miMano ?? []), ...jugadas];
}

/** Bazas ganadas por mi bando y por el rival en la mano. */
function bazasPorBando(vista: VistaTruc): [number, number] {
  const mio = bandoDe(vista.asiento!);
  let mias = 0;
  let suyas = 0;
  for (const b of vista.bazasJugadas) {
    if (b.ganador === mio) mias++;
    else if (b.ganador !== null) suyas++;
  }
  return [mias, suyas];
}

/** La carta que gana ahora la baza en curso y si es de mi bando. */
function mejorEnMesa(vista: VistaTruc) {
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
export function fuerzaMano(vista: VistaTruc): number {
  const mano = [...(vista.miMano ?? [])].map(rangoTruc).sort((a, b) => b - a);
  const [mias, suyas] = bazasPorBando(vista);
  const altas = mano.slice(0, 2);
  const cartas = altas.length === 0 ? 0 : altas.reduce((s, r) => s + r, 0) / (14 * altas.length);
  let fuerza = cartas + 0.3 * (mias - suyas);
  // El último en jugar una baza decisiva sabe si la gana.
  const mesa = mejorEnMesa(vista);
  const ultimo = vista.mesa.length === vista.config.jugadores - 1;
  if (ultimo && mesa && mano.length > 0 && mias + suyas >= 1) {
    if (bandoDe(mesa.asiento) === bandoDe(vista.asiento!) || mano[0]! > rangoTruc(mesa.carta)) {
      fuerza += 0.5;
    }
  }
  return Math.max(0, Math.min(1, fuerza));
}

/** Soy de los primeros en la mano: gano los empates de envit contra los que vienen detrás. */
const cercaDeLaMano = (vista: VistaTruc) =>
  (vista.asiento! - vista.mano + vista.config.jugadores) % vista.config.jugadores <
  vista.config.jugadores / 2;

function elegir(vista: VistaTruc, acciones: readonly AccionTruc[], g: Generador): AccionTruc {
  const envit = puntosEnvit(cartasDeLaMano(vista));
  const fuerza = fuerzaMano(vista);

  // 1. Respuesta a un envit.
  if (vista.envit.estado === 'pendiente') {
    if (envit >= ENVIT_FALTA && tiene(acciones, 'falta')) return { tipo: 'falta' };
    if (envit >= ENVIT_TORNE && tiene(acciones, 'torne')) return { tipo: 'torne' };
    const umbral = cercaDeLaMano(vista) ? ENVIT_QUERER_MANO : ENVIT_QUERER;
    // Cuanto más alta la apuesta, más puntos hacen falta.
    return envit >= umbral + 2 * (vista.envit.nivel - 1) ? { tipo: 'vull' } : { tipo: 'noVull' };
  }

  // 2. Envidar (también como respuesta a un truc en la primera baza: el envit va primero).
  if (envit >= ENVIT_ENVIDAR && tiene(acciones, 'envidar')) return { tipo: 'envidar' };

  // 3. Respuesta a un truc.
  if (vista.truc.pendiente > 0) {
    if (fuerza >= FUERZA_SUBIR && tiene(acciones, 'trucar')) return { tipo: 'trucar' };
    // Cuanto más alta la apuesta, más fuerza hace falta.
    const umbral = FUERZA_QUERER + 0.05 * (vista.truc.pendiente - 1);
    return fuerza >= umbral ? { tipo: 'vull' } : { tipo: 'noVull' };
  }

  // 4. Trucar o subir en su turno, por fuerza o de farol.
  if (tiene(acciones, 'trucar')) {
    const umbral = vista.truc.nivel === 0 ? FUERZA_TRUCAR : FUERZA_SUBIR;
    const [mias, suyas] = bazasPorBando(vista);
    const farol = vista.truc.nivel === 0 && suyas >= mias && g.siguiente() / 2 ** 32 < PROB_FAROL;
    if (fuerza >= umbral || farol) return { tipo: 'trucar' };
  }

  // 5. Jugar carta.
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  if (cartas.length === 0) return acciones.find((a) => a.tipo !== 'meVoy') ?? acciones[0]!;
  return { tipo: 'jugar', carta: cartaParaJugar(vista, cartas) };
}

function cartaParaJugar(vista: VistaTruc, cartas: readonly IdCarta[]): IdCarta {
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
