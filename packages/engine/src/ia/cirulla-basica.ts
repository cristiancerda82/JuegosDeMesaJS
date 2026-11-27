import type { IdCarta } from '../baraja/cartas';
import { crearBaraja } from '../baraja/cartas';
import { capturasCirulla, type AccionCirulla, type VistaCirulla } from '../juegos/cirulla';
import { SETTEBELLO, valorScopa } from '../juegos/scopa';
import type { Agente } from './agente';

/**
 * IA básica de la Cirulla: la valoración de la Scopa, con las cartas de la cirulla grande y la
 * pequeña y el riesgo de dejar la mesa a tiro de un 15 o de un As. Elige la mejor jugada (la
 * primera, si empatan). Es determinista y solo usa su vista.
 */
export const iaCirullaBasica: Agente<VistaCirulla, AccionCirulla> = {
  id: 'cirulla-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    let mejor = acciones[0]!;
    let mejorValor = -Infinity;
    for (const accion of acciones) {
      const valor = valorarCirulla(vista, accion);
      if (valor > mejorValor) {
        mejor = accion;
        mejorValor = valor;
      }
    }
    return { accion: mejor, azar };
  },
};

const ESCOBA = 1000;
const SIETE_DE_OROS = 100;
const SIETE = 30;
const ORO = 10;
/** Las cartas de la grande (Sota, Caballo y Rey de oros) y de la pequeña (del As al 6). */
const GRANDE = 25;
const PEQUENA = 20;
const CARTA = 3;
/** Penalización por dejar la mesa a tiro de escoba del rival. */
const RIESGO = 80;
/** Penalización por dejar una mesa sin Ases cuando aún quedan Ases por salir. */
const RIESGO_AS = 40;

/** Lo que vale tener una carta al final de la mano (para capturarla o no soltarla). */
function valorCarta(carta: IdCarta): number {
  if (carta === SETTEBELLO) return SIETE_DE_OROS + PEQUENA;
  let valor = (carta.endsWith('-7') ? SIETE : 0) + (carta.startsWith('oros-') ? ORO : 0);
  if (carta.startsWith('oros-')) {
    const v = valorScopa(carta);
    if (v >= 8) valor += GRANDE;
    else if (v <= 6) valor += PEQUENA;
  }
  return valor;
}

/** Si alguna carta de valor 2 a 10 se llevaría toda la mesa (su valor o sumando 15). */
function barrible(mesa: readonly IdCarta[]): boolean {
  for (let v = 2; v <= 10; v++) {
    const carta = `bastos-${v === 8 ? 10 : v === 9 ? 11 : v === 10 ? 12 : v}` as IdCarta;
    if (capturasCirulla(mesa, carta).some((c) => c.length === mesa.length)) return true;
  }
  return false;
}

/** La valoración de una jugada (spec ia-jugadores). */
export function valorarCirulla(vista: VistaCirulla, accion: AccionCirulla): number {
  const recoge = accion.captura.length > 0;
  const mesa = recoge
    ? vista.mesa.filter((c) => !accion.captura.includes(c))
    : [...vista.mesa, accion.carta];

  let valor = 0;
  if (recoge) {
    if (mesa.length === 0) valor += ESCOBA;
    for (const c of [accion.carta, ...accion.captura]) valor += valorCarta(c) + CARTA;
  } else {
    valor -= valorCarta(accion.carta);
  }
  if (mesa.length > 0) {
    if (barrible(mesa)) valor -= RIESGO;
    if (!mesa.some((c) => valorScopa(c) === 1) && quedanAses(vista, accion.carta)) {
      valor -= RIESGO_AS;
    }
  }
  return valor;
}

/** Si quedan Ases que el jugador no ha visto: en manos ajenas o en el mazo. */
function quedanAses(vista: VistaCirulla, jugada: IdCarta): boolean {
  const vistas = new Set([...(vista.miMano ?? []), ...vista.mesa, jugada]);
  // Los Ases ya jugados no se ven en la vista: solo se descartan los de la mano y la mesa.
  return crearBaraja('espanola40').some((c) => valorScopa(c) === 1 && !vistas.has(c));
}
