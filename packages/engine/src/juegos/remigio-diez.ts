import { cartaDeId, colorDe, type PaloFrances } from '../baraja/cartas';
import {
  baseRemigio,
  esComodinRemigio,
  numeroRemigio,
  puntosCartaRemigio,
  type CartaRemigio,
} from './remigio-combinaciones';

/**
 * El Remigio de diez cartas (spec juego-remigio): qué cartas de una mano quedan sin ligar y con
 * qué premio se cierra. El palo no cuenta ni en los grupos ni en las escaleras, así que una mano
 * se reduce a cuántas cartas tiene de cada número y cuántos comodines.
 */

/** Cartas que se reparten a cada uno con la opción «Diez cartas». */
export const CARTAS_MANO_REMIGIO_DIEZ = 10;

/** El As alto ocupa el puesto 14, detrás de la K. */
const AS_ALTO = 14;
const PUNTOS_COMODIN = 25;

/** Puntos de un número de la francesa (el 14 es el As alto). */
const puntosNumero = (n: number) => (n === AS_ALTO ? 1 : n >= 11 ? n - 1 : n);

/** Una combinación: los números naturales que gasta y los comodines. */
type AlCombinar = (naturales: readonly number[], comodines: number) => boolean;

/**
 * Recorre las combinaciones que llevan una carta del número `r`, el más bajo que queda, con
 * estas cuentas por número (índices 1–14) y estos comodines. Para cuando `cb` devuelve `true`.
 */
function combinaciones(cuentas: number[], r: number, comodines: number, cb: AlCombinar): void {
  // Grupos: 2 o más naturales y, si faltan, comodines hasta 3.
  for (let k = 2; k <= cuentas[r]!; k++) {
    const faltan = Math.max(0, 3 - k);
    if (faltan <= comodines && cb(new Array<number>(k).fill(r), faltan)) return;
  }
  // Escaleras que empiezan en `r`: en cada puesto, una natural o un comodín. Terminan en una
  // natural; con solo 2 cartas, un comodín las alarga a 3 por arriba o por abajo.
  const naturales = [r];
  const recorrer = (p: number, largo: number, gastados: number, finNatural: boolean): boolean => {
    if (finNatural && naturales.length >= 2) {
      const relleno = Math.max(0, 3 - largo);
      const cabe = p - 1 + relleno <= AS_ALTO || r - relleno >= 1;
      if (gastados + relleno <= comodines && cabe && cb(naturales, gastados + relleno)) return true;
    }
    if (p > AS_ALTO) return false;
    if (cuentas[p]! > 0) {
      naturales.push(p);
      const fin = recorrer(p + 1, largo + 1, gastados, true);
      naturales.pop();
      if (fin) return true;
    }
    return gastados < comodines && recorrer(p + 1, largo + 1, gastados + 1, false);
  };
  recorrer(r + 1, 1, 0, true);
}

const menorNumero = (cuentas: readonly number[]) => {
  let r = 1;
  while (r <= AS_ALTO && cuentas[r] === 0) r++;
  return r;
};

/** Clave numérica del estado: hasta 8 cartas por número, 4 comodines y si ya hay combinación. */
function clave(cuentas: readonly number[], comodines: number, hay: boolean): number {
  let k = 0;
  for (let i = 1; i <= AS_ALTO; i++) k = k * 9 + cuentas[i]!;
  return (k * 5 + comodines) * 2 + (hay ? 1 : 0);
}

/** Lo que dejan los comodines al acabar: si ya hay una combinación, se añaden a ella. */
const comodinesSueltos = (comodines: number, hay: boolean) => (hay ? 0 : comodines);

/**
 * Los menos puntos sin ligar posibles con estas cuentas y comodines. `hay` dice si ya se ha
 * formado alguna combinación.
 */
function coste(
  cuentas: number[],
  comodines: number,
  hay: boolean,
  memo: Map<number, number>,
): number {
  const r = menorNumero(cuentas);
  if (r > AS_ALTO) return comodinesSueltos(comodines, hay) * PUNTOS_COMODIN;
  const k = clave(cuentas, comodines, hay);
  const guardado = memo.get(k);
  if (guardado !== undefined) return guardado;

  // Una carta de este número se queda sin ligar, o entra en una combinación.
  cuentas[r]!--;
  let mejor = puntosNumero(r) + coste(cuentas, comodines, hay, memo);
  cuentas[r]!++;
  if (mejor > 0) {
    combinaciones(cuentas, r, comodines, (naturales, gastados) => {
      for (const n of naturales) cuentas[n]!--;
      const c = coste(cuentas, comodines - gastados, true, memo);
      for (const n of naturales) cuentas[n]!++;
      mejor = Math.min(mejor, c);
      return mejor === 0;
    });
  }
  memo.set(k, mejor);
  return mejor;
}

/** Sigue la mejor forma de ligar y apunta los números sueltos; devuelve los comodines sueltos. */
function reconstruir(
  cuentas: number[],
  comodines: number,
  hay: boolean,
  memo: Map<number, number>,
  sueltos: number[],
): number {
  const r = menorNumero(cuentas);
  if (r > AS_ALTO) return comodinesSueltos(comodines, hay);
  const objetivo = coste(cuentas, comodines, hay, memo);
  cuentas[r]!--;
  if (puntosNumero(r) + coste(cuentas, comodines, hay, memo) === objetivo) {
    sueltos.push(r);
    const res = reconstruir(cuentas, comodines, hay, memo, sueltos);
    cuentas[r]!++;
    return res;
  }
  cuentas[r]!++;
  const elegidas: { naturales: number[]; gastados: number }[] = [];
  combinaciones(cuentas, r, comodines, (naturales, gastados) => {
    for (const n of naturales) cuentas[n]!--;
    const c = coste(cuentas, comodines - gastados, true, memo);
    for (const n of naturales) cuentas[n]!++;
    if (c === objetivo) elegidas.push({ naturales: [...naturales], gastados });
    return c === objetivo;
  });
  const { naturales, gastados } = elegidas[0]!;
  for (const n of naturales) cuentas[n]!--;
  const res = reconstruir(cuentas, comodines - gastados, true, memo, sueltos);
  for (const n of naturales) cuentas[n]!++;
  return res;
}

/** Cuántas cartas tiene la mano de cada número (índices 1–14) y cuántos comodines. */
function contar(mano: readonly CartaRemigio[]): { cuentas: number[]; comodines: number } {
  const cuentas = new Array<number>(AS_ALTO + 1).fill(0);
  let comodines = 0;
  for (const c of mano) {
    if (esComodinRemigio(c)) comodines++;
    else cuentas[numeroRemigio(c)]!++;
  }
  return { cuentas, comodines };
}

/**
 * Prueba cuántos Ases van arriba (cada uno puede ir abajo o arriba) y deja las cuentas con el
 * reparto que deja menos puntos. Devuelve esos puntos.
 */
function mejoresAses(cuentas: number[], comodines: number, memo: Map<number, number>): number {
  const ases = cuentas[1]!;
  let mejor = Infinity;
  let mejorArriba = 0;
  for (let arriba = 0; arriba <= ases && mejor > 0; arriba++) {
    cuentas[1] = ases - arriba;
    cuentas[AS_ALTO] = arriba;
    const c = coste(cuentas, comodines, false, memo);
    if (c < mejor) [mejor, mejorArriba] = [c, arriba];
  }
  cuentas[1] = ases - mejorArriba;
  cuentas[AS_ALTO] = mejorArriba;
  return mejor;
}

/** Los menos puntos sin ligar de una mano francesa. */
export function puntosSueltosRemigioDiez(mano: readonly CartaRemigio[]): number {
  const { cuentas, comodines } = contar(mano);
  return mejoresAses(cuentas, comodines, new Map());
}

export interface SueltasRemigio {
  /** Las cartas que no se pueden ligar con la mejor forma de ligar la mano. */
  readonly cartas: readonly CartaRemigio[];
  readonly puntos: number;
}

/** Las cartas de una mano francesa que quedan sin ligar, con la forma que deja menos puntos. */
export function sueltasRemigioDiez(mano: readonly CartaRemigio[]): SueltasRemigio {
  const { cuentas, comodines } = contar(mano);
  const memo = new Map<number, number>();
  mejoresAses(cuentas, comodines, memo);
  const numeros: number[] = [];
  const sueltos = reconstruir(cuentas, comodines, false, memo, numeros);

  // De los números sueltos a las cartas de la mano (el palo no importa).
  const quedan = [...mano];
  const cartas: CartaRemigio[] = [];
  const tomar = (vale: (c: CartaRemigio) => boolean) => {
    const i = quedan.findIndex(vale);
    cartas.push(quedan[i]!);
    quedan.splice(i, 1);
  };
  for (const n of numeros) {
    const numero = n === AS_ALTO ? 1 : n;
    tomar((c) => !esComodinRemigio(c) && numeroRemigio(c) === numero);
  }
  for (let i = 0; i < sueltos; i++) tomar(esComodinRemigio);
  return { cartas, puntos: cartas.reduce((s, c) => s + puntosCartaRemigio(c), 0) };
}

// ── Cierre ───────────────────────────────────────────────────────────────────

export type JugadaCierreRemigio = 'normal' | 'color' | 'escalera' | 'escaleraColor';

export interface CierreRemigio {
  readonly jugada: JugadaCierreRemigio;
  readonly conComodines: boolean;
  /** Por cuánto se multiplican los puntos de los demás. */
  readonly multiplicador: number;
}

/** Multiplicador de cada jugada: [con comodines, sin comodines]. */
export const MULTIPLICADORES_REMIGIO: Readonly<
  Record<JugadaCierreRemigio, readonly [number, number]>
> = {
  normal: [1, 2],
  color: [3, 4],
  escalera: [5, 6],
  escaleraColor: [8, 10],
};

const paloFrances = (c: CartaRemigio) => cartaDeId(baseRemigio(c))!.palo as PaloFrances;

/** Todas las naturales del mismo palo o del mismo color. */
function esColor(naturales: readonly CartaRemigio[]): boolean {
  const palos = new Set(naturales.map(paloFrances));
  return palos.size <= 1 || new Set([...palos].map(colorDe)).size <= 1;
}

/** Las diez cartas forman una sola escalera (el As abajo o arriba), con comodines en los huecos. */
function esEscaleraDeDiez(naturales: readonly CartaRemigio[]): boolean {
  const numeros = naturales.map(numeroRemigio);
  if (new Set(numeros).size !== numeros.length) return false;
  const cabe = (ns: readonly number[]) =>
    ns.length === 0 || Math.max(...ns) - Math.min(...ns) + 1 <= CARTAS_MANO_REMIGIO_DIEZ;
  return cabe(numeros) || cabe(numeros.map((n) => (n === 1 ? AS_ALTO : n)));
}

/**
 * Con qué jugada cierran estas diez cartas, la de mayor premio; `null` si no están ligadas ni
 * son color.
 */
export function cierreRemigioDiez(
  mano: readonly CartaRemigio[],
  puedeLigar = true,
): CierreRemigio | null {
  if (mano.length !== CARTAS_MANO_REMIGIO_DIEZ) return null;
  const naturales = mano.filter((c) => !esComodinRemigio(c));
  const conComodines = naturales.length < mano.length;
  const color = esColor(naturales);
  const escalera = esEscaleraDeDiez(naturales);
  const jugada: JugadaCierreRemigio | null =
    escalera && color
      ? 'escaleraColor'
      : escalera
        ? 'escalera'
        : color
          ? 'color'
          : puedeLigar && puntosSueltosRemigioDiez(mano) === 0
            ? 'normal'
            : null;
  if (jugada === null) return null;
  return {
    jugada,
    conComodines,
    multiplicador: MULTIPLICADORES_REMIGIO[jugada][conComodines ? 0 : 1],
  };
}

/**
 * De las cartas dadas de una mano de 11, con las que se puede cerrar soltándolas. Si las otras
 * diez quedaran ligadas, la mano entera dejaría como mucho la carta soltada sin ligar: cuando la
 * mano deja más puntos sueltos que esa carta, solo queda mirar el color y la escalera.
 */
export function cartasDeCierreRemigioDiez(
  mano: readonly CartaRemigio[],
  cartas: readonly CartaRemigio[],
): CartaRemigio[] {
  const minimo = puntosSueltosRemigioDiez(mano);
  return cartas.filter(
    (carta) =>
      cierreRemigioDiez(
        mano.filter((c) => c !== carta),
        minimo <= puntosCartaRemigio(carta),
      ) !== null,
  );
}
