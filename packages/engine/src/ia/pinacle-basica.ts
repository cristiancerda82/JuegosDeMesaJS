import {
  aplicarBajada,
  bandoPinacle,
  cartasQueBaja,
  esComodinPinacle,
  hastaDe,
  jugadasDeBajada,
  MINIMO_BARBELE,
  paloPinacle,
  puntosCartaPinacle,
  rangoPinacle,
  type AccionBajada,
  type AccionPinacle,
  type CartaPinacle,
  type Combinacion,
  type VistaPinacle,
} from '../juegos/pinacle';
import type { Agente } from './agente';

/**
 * IA básica del Pinacle (spec ia-jugadores; design, decisión 8). Es determinista y solo usa su
 * vista: su mano, las combinaciones de la mesa, el montón y las cartas conocidas.
 */
/** Cartas del rival, cartas del mazo y cartas propias a partir de las que hay prisa por bajar. */
const CARTAS_RIVAL_PELIGRO = 4;
const MAZO_PELIGRO = 8;
const MANO_GRANDE = 16;
/** En barbelé, margen sobre los 70 para llevarse el montón (el plan real puede bajar menos). */
const MARGEN_MONTON = 20;

export const iaPinacleBasica: Agente<VistaPinacle, AccionPinacle> = {
  id: 'pinacle-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

const esBajada = (a: AccionPinacle): a is AccionBajada =>
  a.tipo === 'bajar' || a.tipo === 'anadir' || a.tipo === 'cambiar';

const conComodin = (a: AccionBajada) => cartasQueBaja(a).some(esComodinPinacle);

/** Una carta encaja en una combinación (natural del número, o pegada a la escalera). */
function encaja(carta: CartaPinacle, c: Combinacion): boolean {
  if (esComodinPinacle(carta)) return false;
  if (c.tipo === 'grupo') return rangoPinacle(carta) === c.numero;
  const r = rangoPinacle(carta);
  return paloPinacle(carta) === c.palo && (r === c.desde - 1 || r === hastaDe(c) + 1);
}

/** Cuánto le sirve una carta de la mano: parejas, escaleras a medio hacer, comodines. */
function utilidad(
  carta: CartaPinacle,
  mano: readonly CartaPinacle[],
  propias: readonly Combinacion[],
) {
  if (esComodinPinacle(carta)) return 100;
  if (propias.some((c) => encaja(carta, c))) return 60;
  const r = rangoPinacle(carta);
  const p = paloPinacle(carta);
  let u = 0;
  for (const otra of mano) {
    if (otra === carta || esComodinPinacle(otra)) continue;
    if (rangoPinacle(otra) === r) u += 10;
    else if (paloPinacle(otra) === p) {
      const d = Math.abs(rangoPinacle(otra) - r);
      if (d === 1) u += 8;
      else if (d === 2) u += 4;
    }
  }
  return u;
}

/**
 * Lo que bajaría ahora aplicando jugadas una a una (primero sin comodines): el valor de las
 * cartas bajadas y cuántas le quedarían en la mano.
 */
function bajadaPosible(
  vista: VistaPinacle,
  mano0: readonly CartaPinacle[] = vista.miMano ?? [],
  conComodines = false,
): { puntos: number; quedan: number } {
  let mano = [...mano0];
  const bando = bandoPinacle(vista.asiento!);
  let combinaciones = vista.combinaciones.filter((c) => c.bando === bando);
  let puntos = 0;
  let id = vista.siguienteId;
  for (let paso = 0; paso < mano0.length; paso++) {
    const jugadas = jugadasDeBajada(mano, combinaciones);
    const jugada = jugadas.find((j) => !conComodin(j)) ?? (conComodines ? jugadas[0] : undefined);
    if (!jugada) break;
    puntos += cartasQueBaja(jugada).reduce((s, c) => s + puntosCartaPinacle(c), 0);
    const tras = aplicarBajada(mano, combinaciones, jugada, { id: id++, bando, turno: 0 });
    mano = tras.mano;
    combinaciones = tras.combinaciones;
  }
  return { puntos, quedan: mano.length };
}

/** Peligro de que el rival cierre pronto: entonces conviene bajar lo que se pueda. */
function hayPrisa(vista: VistaPinacle, mano: readonly CartaPinacle[]): boolean {
  const n = vista.cartasEnMano.length;
  const rivales = vista.cartasEnMano.filter((_, a) => a % 2 !== vista.asiento! % 2 && a < n);
  return (
    Math.min(...rivales) <= CARTAS_RIVAL_PELIGRO ||
    vista.cartasEnMazo <= MAZO_PELIGRO ||
    mano.length >= MANO_GRANDE
  );
}

function elegir(vista: VistaPinacle, acciones: readonly AccionPinacle[]): AccionPinacle {
  const mano = vista.miMano ?? [];
  const bando = bandoPinacle(vista.asiento!);
  const propias = vista.combinaciones.filter((c) => c.bando === bando);
  const barbelePendiente = vista.barbele[bando]! && !vista.abierto[bando]!;

  if (vista.fase === 'robar') {
    const monton = acciones.find((a) => a.tipo === 'robar' && a.desde === 'monton');
    const mazo = acciones.find((a) => a.tipo === 'robar' && a.desde === 'mazo')!;
    if (!monton) return mazo;
    const utiles = vista.monton.filter((c) => utilidad(c, mano, propias) > 0).length;
    const malas = vista.monton.length - utiles;
    // Las cartas bajadas suman y las de la mano restan: un montón casi siempre compensa.
    if (vista.monton.length > 3 && malas > utiles * 3) return mazo;
    if (barbelePendiente) {
      if (
        bajadaPosible(vista, [...mano, ...vista.monton], true).puntos <
        MINIMO_BARBELE + MARGEN_MONTON
      ) {
        return mazo;
      }
    }
    return monton;
  }

  const bajadas = acciones.filter(esBajada);
  // Tras llevarse el montón, las únicas bajadas legales son las que bajan su carta de arriba.
  if (vista.debeBajar !== null) {
    return [...bajadas].sort((a, b) => Number(conComodin(a)) - Number(conComodin(b)))[0]!;
  }

  const sinComodin = bajadas.filter((a) => !conComodin(a));
  // Sin haber bajado en la mano, espera a poder cerrar de golpe (dobla o cuadruplica), salvo
  // que haya prisa.
  const yaBajo = vista.turnoActual.bajoAntes || vista.turnoActual.puntosBajados > 0;
  const empezar =
    (!barbelePendiente ||
      vista.turnoActual.puntosBajados + bajadaPosible(vista, mano, true).puntos >=
        MINIMO_BARBELE) &&
    (yaBajo || hayPrisa(vista, mano) || bajadaPosible(vista, mano, true).quedan <= 1);
  if (empezar) {
    const cambio = sinComodin.find((a) => a.tipo === 'cambiar');
    if (cambio) return cambio;
    const anadido = sinComodin.find((a) => a.tipo === 'anadir');
    if (anadido) return anadido;
    // La combinación nueva que deja más cartas de la mano encajando después.
    const nuevas = sinComodin.filter((a) => a.tipo === 'bajar');
    if (nuevas.length > 0) {
      const puntuar = (a: AccionBajada) =>
        mano.filter((c) => utilidad(c, cartasQueBaja(a), []) > 0).length;
      return nuevas.reduce((mejor, a) => (puntuar(a) > puntuar(mejor) ? a : mejor));
    }
    // Un comodín en la mano resta al final de la mano y en la mesa suma: también se bajan.
    const conWild = bajadas.find((a) => a.tipo === 'anadir') ?? bajadas[0];
    if (conWild) return conWild;
  }

  return descartesOrdenados(vista, acciones)[0] ?? acciones[0]!;
}

type Descarte = Extract<AccionPinacle, { tipo: 'descartar' }>;

/**
 * Los descartes legales, del mejor al peor para la IA básica: primero los que menos le sirven,
 * no le dan cartas al rival y más restarían en la mano. En un empate, el orden de las acciones.
 */
export function descartesOrdenados(
  vista: VistaPinacle,
  acciones: readonly AccionPinacle[],
): Descarte[] {
  const mano = vista.miMano ?? [];
  const bando = bandoPinacle(vista.asiento!);
  const propias = vista.combinaciones.filter((c) => c.bando === bando);
  const rivales = vista.combinaciones.filter((c) => c.bando !== bando);
  const peligro = (c: CartaPinacle) => (rivales.some((r) => encaja(c, r)) ? 50 : 0);
  const coste = (c: CartaPinacle) =>
    utilidad(c, mano, propias) + peligro(c) - puntosCartaPinacle(c) / 5;
  return acciones
    .filter((a): a is Descarte => a.tipo === 'descartar')
    .map((a, i) => ({ a, i, coste: coste(a.carta) }))
    .sort((x, y) => x.coste - y.coste || x.i - y.i)
    .map((x) => x.a);
}
