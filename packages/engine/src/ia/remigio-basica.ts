import type { AccionRemigio, VistaRemigio } from '../juegos/remigio';
import {
  anadidosRemigio,
  aplicarJugadaRemigio,
  bajadasRemigio,
  cambiosRemigio,
  cartasQueBajaRemigio,
  esComodinRemigio,
  hastaRemigio,
  numeroRemigio,
  paloRemigio,
  posicionRemigio,
  puntosCartaRemigio,
  type CartaRemigio,
  type CombinacionRemigio,
  type JugadaRemigio,
} from '../juegos/remigio-combinaciones';
import type { Agente } from './agente';

/**
 * IA básica del Remigio (spec ia-jugadores): roba del montón si le sirve, baja en cuanto puede
 * salvo que esté cerca del remigio, añade y cambia comodines, y descarta la carta que menos le
 * sirve y más puntos vale. Es determinista y solo usa su vista.
 */
export const iaRemigioBasica: Agente<VistaRemigio, AccionRemigio> = {
  id: 'remigio-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

/** Cartas que, como mucho, le pueden faltar para intentar el remigio. */
const QUEDAN_PARA_REMIGIO = 3;
/** Con un rival con tan pocas cartas, o un mazo tan corto, no se espera al remigio. */
const CARTAS_RIVAL_PELIGRO = 4;
const MAZO_PELIGRO = 30;

const esJugada = (a: AccionRemigio): a is JugadaRemigio =>
  a.tipo === 'bajar' || a.tipo === 'anadir' || a.tipo === 'cambiar';
const conComodin = (j: JugadaRemigio) => cartasQueBajaRemigio(j).some(esComodinRemigio);

/** La carta encaja en una combinación de la mesa (sin comodín). */
function encaja(carta: CartaRemigio, c: CombinacionRemigio): boolean {
  if (esComodinRemigio(carta)) return false;
  if (c.tipo === 'grupo') return numeroRemigio(carta) === c.numero && c.cartas.length < 4;
  const p = posicionRemigio(carta);
  return paloRemigio(carta) === c.palo && (p === c.desde - 1 || p === hastaRemigio(c) + 1);
}

/** Cuánto le sirve una carta: comodines, cartas que encajan en la mesa, parejas y escaleras. */
export function utilidadRemigio(
  carta: CartaRemigio,
  mano: readonly CartaRemigio[],
  mesa: readonly CombinacionRemigio[],
): number {
  if (esComodinRemigio(carta)) {
    // Sirve si hay dos naturales con los que combinarlo o un sitio en la mesa donde ponerlo.
    const naturales = mano.filter((c) => !esComodinRemigio(c)).length;
    const sitio = mesa.some((c) => (c.tipo === 'grupo' ? c.cartas.length < 4 : true));
    return naturales >= 2 || sitio ? 100 : 0;
  }
  if (mesa.some((c) => encaja(carta, c))) return 60;
  const n = numeroRemigio(carta);
  const palo = paloRemigio(carta);
  const p = posicionRemigio(carta);
  let u = 0;
  for (const otra of mano) {
    if (otra === carta || esComodinRemigio(otra)) continue;
    if (numeroRemigio(otra) === n && paloRemigio(otra) !== palo) u += 10;
    else if (paloRemigio(otra) === palo) {
      const d = Math.abs(posicionRemigio(otra) - p);
      if (d === 1) u += 8;
      else if (d === 2) u += 4;
    }
  }
  return u;
}

/** Cartas que le quedarían en la mano bajando todo lo que puede ahora, jugada a jugada. */
function quedanTrasBajar(vista: VistaRemigio, mano0: readonly CartaRemigio[]): number {
  let mano = [...mano0];
  let mesa = [...vista.combinaciones];
  let bajado = vista.bajado[vista.asiento!]!;
  let id = vista.siguienteId;
  for (let paso = 0; paso < mano0.length; paso++) {
    const jugadas: JugadaRemigio[] = [
      ...bajadasRemigio(mano).map((combinacion) => ({ tipo: 'bajar' as const, combinacion })),
      ...(bajado ? [...anadidosRemigio(mano, mesa), ...cambiosRemigio(mano, mesa)] : []),
    ].filter((j) => j.tipo !== 'cambiar');
    const jugada = jugadas.find((j) => !conComodin(j)) ?? jugadas[0];
    if (!jugada) break;
    const tras = aplicarJugadaRemigio(mano, mesa, jugada, { id: id++, duenio: vista.asiento! });
    mano = tras.mano;
    mesa = tras.combinaciones;
    bajado = true;
  }
  return mano.length;
}

function hayPrisa(vista: VistaRemigio): boolean {
  const rivales = vista.cartasEnMano.filter(
    (n, a) => a !== vista.asiento && !vista.eliminados[a] && n > 0,
  );
  return Math.min(...rivales) <= CARTAS_RIVAL_PELIGRO || vista.mazo <= MAZO_PELIGRO;
}

/**
 * Sin haber bajado, si está cerca de cerrarlo todo de golpe, espera al remigio, salvo que haya
 * prisa: un rival con pocas cartas o el mazo corto.
 */
function esperaRemigio(vista: VistaRemigio, mano: readonly CartaRemigio[]): boolean {
  if (vista.bajado[vista.asiento!]) return false;
  const quedan = quedanTrasBajar(vista, mano);
  return quedan > 1 && quedan <= QUEDAN_PARA_REMIGIO && !hayPrisa(vista);
}

function elegir(vista: VistaRemigio, acciones: readonly AccionRemigio[]): AccionRemigio {
  const mano = vista.miMano ?? [];
  const asiento = vista.asiento!;
  const bajado = vista.bajado[asiento]!;

  if (vista.fase === 'robar') {
    const monton = acciones.find((a) => a.tipo === 'robarMonton');
    const mazo = acciones.find((a) => a.tipo === 'robarMazo');
    const arriba = vista.monton.at(-1);
    if (!monton || !arriba) return mazo ?? acciones[0]!;
    if (!mazo) return monton;
    const forma = bajadasRemigio([...mano, arriba], arriba).some((b) =>
      (b.tipo === 'grupo' ? b.cartas : b.puestos).includes(arriba),
    );
    const amplia = bajado && anadidosRemigio([arriba], vista.combinaciones).length > 0;
    // Mientras espera al remigio roba del mazo: así la espera se acaba cuando el mazo mengua.
    if (forma && !bajado && esperaRemigio(vista, [...mano, arriba])) return mazo;
    return forma || amplia ? monton : mazo;
  }

  const jugadas = acciones.filter(esJugada);
  if (!esperaRemigio(vista, mano) && jugadas.length > 0) {
    const sinComodin = jugadas.filter((j) => !conComodin(j));
    const cambio = jugadas.find((j) => j.tipo === 'cambiar');
    if (cambio) return cambio;
    const anadido = sinComodin.find((j) => j.tipo === 'anadir');
    if (anadido) return anadido;
    const nueva = sinComodin.find((j) => j.tipo === 'bajar');
    if (nueva) return nueva;
    // Un comodín en la mano vale 25 al final: mejor en la mesa.
    return jugadas.find((j) => j.tipo === 'anadir') ?? jugadas[0]!;
  }

  return descartesRemigio(vista, acciones)[0] ?? acciones[0]!;
}

type Descarte = Extract<AccionRemigio, { tipo: 'descartar' }>;

/**
 * Los descartes legales, del mejor al peor para la IA básica: primero los que menos le sirven y
 * más puntos valen; los comodines, al final. En un empate, el orden de las acciones.
 */
export function descartesRemigio(
  vista: VistaRemigio,
  acciones: readonly AccionRemigio[],
): Descarte[] {
  const mano = vista.miMano ?? [];
  const coste = (c: CartaRemigio) =>
    utilidadRemigio(c, mano, vista.combinaciones) - puntosCartaRemigio(c) / 3;
  return acciones
    .filter((a): a is Descarte => a.tipo === 'descartar')
    .map((a, i) => ({ a, i, coste: coste(a.carta) }))
    .sort((x, y) => x.coste - y.coste || x.i - y.i)
    .map((x) => x.a);
}
