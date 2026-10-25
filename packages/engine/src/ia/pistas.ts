import { cartaDeId, type IdCarta } from '../baraja/cartas';
import type { AccionFreeCell, VistaFreeCell } from '../juegos/freecell';
import { encajaGolf, type AccionGolf, type VistaGolf } from '../juegos/golf';
import type { AccionKlondike, VistaKlondike } from '../juegos/klondike';
import { libreEnPiramide, type AccionPiramide, type VistaPiramide } from '../juegos/piramide';
import { baseSpider, type AccionSpider, type VistaSpider } from '../juegos/spider';
import {
  tapadorasTriPeaks,
  type AccionTriPeaks,
  type SitioTriPeaks,
  type VistaTriPeaks,
} from '../juegos/tripeaks';
import type { AccionYukon, VistaYukon } from '../juegos/yukon';
import type { AccionCanfield, VistaCanfield } from '../juegos/canfield';
import type { AccionCuarentaLadrones, VistaCuarentaLadrones } from '../juegos/cuarenta-ladrones';

/**
 * Pistas de los solitarios (spec pistas-solitarios): puntúan los movimientos legales con reglas
 * sencillas y sugieren el mejor. Los movimientos de ida y vuelta valen 0 y nunca se sugieren.
 * Son deterministas: en un empate gana el primero en el orden de las acciones legales.
 */

const valor = (c: IdCarta) => cartaDeId(c)!.valor;
const palo = (c: IdCarta) => cartaDeId(c)!.palo;
const indice = (pila: string) => Number(pila.slice(1));

/** El mejor movimiento con puntuación positiva, o `null`. */
function mejor<A>(acciones: readonly A[], puntuar: (a: A) => number): A | null {
  let elegido: A | null = null;
  let puntos = 0;
  for (const a of acciones) {
    const p = puntuar(a);
    if (p > puntos) {
      elegido = a;
      puntos = p;
    }
  }
  return elegido;
}

/** Atascado: no queda ninguna acción salvo deshacer o abandonar. */
export function atascado(acciones: readonly { readonly tipo: string }[]): boolean {
  return acciones.every((a) => a.tipo === 'deshacer' || a.tipo === 'abandonar');
}

/** La carta puede subir ahora a alguna fundación. */
function subeAFundacion(carta: IdCarta, fundaciones: readonly (readonly IdCarta[])[]): boolean {
  return fundaciones.some((f) => {
    const tope = f.at(-1);
    return tope === undefined
      ? valor(carta) === 1
      : palo(tope) === palo(carta) && valor(tope) === valor(carta) - 1;
  });
}

// ── Klondike ─────────────────────────────────────────────────────────────────

function puntosKlondike(v: VistaKlondike, a: AccionKlondike): number {
  if (a.tipo !== 'mover' || a.desde[0] === 'f') return 0;
  const origen = a.desde === 'descarte' ? null : v.columnas[indice(a.desde)]!;
  const quedan = origen ? origen.visibles.length - a.cantidad : 1;
  const descubre = origen !== null && quedan === 0 && origen.ocultas > 0;
  const vacia = origen !== null && quedan === 0 && origen.ocultas === 0;
  if (a.hasta[0] === 'f') return 100 + (descubre ? 50 : 0);
  if (a.desde === 'descarte') return 40;
  if (descubre) return 80;
  // Vaciar una columna sirve para dejar sitio a un Rey; pasar un Rey de una columna vacía a
  // otra no cambia nada.
  const destino = v.columnas[indice(a.hasta)]!;
  if (vacia && destino.visibles.length > 0) return 30;
  return 0;
}

/** Pista del Klondike: un movimiento útil, o robar o reciclar si no hay ninguno. */
export function pistaKlondike(
  vista: VistaKlondike,
  acciones: readonly AccionKlondike[],
): AccionKlondike | null {
  return (
    mejor(acciones, (a) => puntosKlondike(vista, a)) ??
    acciones.find((a) => a.tipo === 'robar') ??
    acciones.find((a) => a.tipo === 'reciclar') ??
    null
  );
}

// ── FreeCell ─────────────────────────────────────────────────────────────────

function puntosFreeCell(v: VistaFreeCell, a: AccionFreeCell): number {
  if (a.tipo !== 'mover' || a.desde[0] === 'f') return 0;
  if (a.hasta[0] === 'f') return 100;
  const destinoVacio =
    a.hasta[0] === 'c'
      ? v.columnas[indice(a.hasta)]!.length === 0
      : v.celdas[indice(a.hasta)] === null;
  if (a.desde[0] === 'l') {
    // De una celda a una columna: libera la celda.
    return a.hasta[0] === 'c' ? (destinoVacio ? 15 : 40) : 0;
  }
  const origen = v.columnas[indice(a.desde)]!;
  const destapada = origen[origen.length - a.cantidad - 1];
  const libera = destapada !== undefined && subeAFundacion(destapada, v.fundaciones);
  if (a.hasta[0] === 'l') return libera ? 20 : 0;
  if (destapada === undefined) return destinoVacio ? 0 : 30;
  if (libera) return destinoVacio ? 20 : 60;
  return 0;
}

/** Pista del FreeCell: un movimiento útil, o `null`. */
export function pistaFreeCell(
  vista: VistaFreeCell,
  acciones: readonly AccionFreeCell[],
): AccionFreeCell | null {
  return mejor(acciones, (a) => puntosFreeCell(vista, a));
}

// ── Spider ───────────────────────────────────────────────────────────────────

function puntosSpider(v: VistaSpider, a: AccionSpider): number {
  if (a.tipo !== 'mover') return 0;
  const origen = v.columnas[a.desde]!;
  const destino = v.columnas[a.hasta]!;
  const quedan = origen.visibles.length - a.cantidad;
  const descubre = quedan === 0 && origen.ocultas > 0;
  const vacia = quedan === 0 && origen.ocultas === 0;
  const base = baseSpider(origen.visibles[quedan]!);
  const encima = origen.visibles[quedan - 1];
  const tope = destino.visibles.at(-1);
  if (tope === undefined) return descubre ? 60 : 0;
  // Si la escalera ya estaba unida a una carta del mismo palo, moverla no gana nada.
  const yaUnida =
    encima !== undefined &&
    palo(baseSpider(encima)) === palo(base) &&
    valor(baseSpider(encima)) === valor(base) + 1;
  const alarga = !yaUnida && palo(baseSpider(tope)) === palo(base);
  return (alarga ? 50 : 0) + (descubre ? 80 : 0) + (vacia ? 40 : 0);
}

/** Pista del Spider: un movimiento útil, o repartir si no hay ninguno. */
export function pistaSpider(
  vista: VistaSpider,
  acciones: readonly AccionSpider[],
): AccionSpider | null {
  return (
    mejor(acciones, (a) => puntosSpider(vista, a)) ??
    acciones.find((a) => a.tipo === 'repartir') ??
    null
  );
}

// ── Pirámide ─────────────────────────────────────────────────────────────────

/**
 * Lo que vale quitar unas cartas: mejor dos de la pirámide que una con el descarte, y mejor
 * cuantas más cartas deja libres. Quitar solo del descarte (una K) es lo último.
 */
function puntosPiramide(v: VistaPiramide, a: AccionPiramide): number {
  if (a.tipo !== 'quitar') return 0;
  const posiciones = a.cartas.flatMap((s) => ('piramide' in s ? [s.piramide] : []));
  if (posiciones.length === 0) return 20;
  const tras = v.piramide.map((c, p) => (posiciones.includes(p) ? null : c));
  const libera = tras.filter(
    (_, p) => libreEnPiramide(tras, p) && !libreEnPiramide(v.piramide, p),
  ).length;
  const base = posiciones.length === 2 ? 100 : a.cartas.length === 1 ? 80 : 60;
  return base + 10 * libera;
}

/** Pista de la Pirámide: quitar lo mejor, o robar, o dar la vuelta al descarte. */
export function pistaPiramide(
  vista: VistaPiramide,
  acciones: readonly AccionPiramide[],
): AccionPiramide | null {
  return (
    mejor(acciones, (a) => puntosPiramide(vista, a)) ??
    acciones.find((a) => a.tipo === 'robar') ??
    acciones.find((a) => a.tipo === 'reciclar') ??
    null
  );
}

// ── Golf ─────────────────────────────────────────────────────────────────────

/** Nodos que como mucho mira la búsqueda de la cadena más larga: de sobra con 35 cartas. */
const NODOS_GOLF = 5000;

/**
 * La cadena más larga de cartas que se pueden pasar al descarte, sin robar, desde estas
 * columnas y con `arriba` en el descarte. Búsqueda en profundidad acotada.
 */
function cadenaGolf(
  columnas: readonly (readonly IdCarta[])[],
  arriba: IdCarta,
  vuelta: boolean,
): number {
  let nodos = 0;
  const largos = columnas.map((c) => c.length);
  const buscar = (tope: IdCarta): number => {
    if (++nodos > NODOS_GOLF) return 0;
    let mejorLargo = 0;
    for (let i = 0; i < columnas.length; i++) {
      if (largos[i] === 0) continue;
      const carta = columnas[i]![largos[i]! - 1]!;
      if (!encajaGolf(carta, tope, vuelta)) continue;
      largos[i]!--;
      mejorLargo = Math.max(mejorLargo, 1 + buscar(carta));
      largos[i]!++;
    }
    return mejorLargo;
  };
  return buscar(arriba);
}

/** Pista del Golf: la carta tras la que se encadenan más, o robar si no se puede mover nada. */
export function pistaGolf(vista: VistaGolf, acciones: readonly AccionGolf[]): AccionGolf | null {
  let elegida: AccionGolf | null = null;
  let mejorPuntos = -1;
  for (const a of acciones) {
    if (a.tipo !== 'mover') continue;
    const columna = vista.columnas[a.columna]!;
    const carta = columna.at(-1)!;
    const tras = vista.columnas.map((c, i) => (i === a.columna ? c.slice(0, -1) : c));
    // Primero la cadena más larga; si empatan, la columna con más cartas.
    const puntos = cadenaGolf(tras, carta, vista.config.vuelta) * 100 + columna.length;
    if (puntos > mejorPuntos) {
      elegida = a;
      mejorPuntos = puntos;
    }
  }
  return elegida ?? acciones.find((a) => a.tipo === 'robar') ?? null;
}

// ── TriPeaks ─────────────────────────────────────────────────────────────────

/** Tope de nodos de la búsqueda de cadenas, para que la pista sea instantánea. */
const NODOS_TRIPEAKS = 5000;

/**
 * La cadena más larga de cartas que se pueden quitar seguidas sobre `arriba`, con las cartas
 * boca arriba que se ven. Las que quedan libres al quitar otras no se sabe cuáles son: no se
 * siguen.
 */
function cadenaTriPeaks(picos: SitioTriPeaks[], arriba: IdCarta): number {
  let nodos = 0;
  const buscar = (tope: IdCarta): number => {
    if (++nodos > NODOS_TRIPEAKS) return 0;
    let mejorLargo = 0;
    for (let i = 0; i < picos.length; i++) {
      const carta = picos[i];
      if (carta === null || carta === 'oculta' || carta === undefined) continue;
      if (!encajaGolf(carta, tope, true)) continue;
      picos[i] = null;
      mejorLargo = Math.max(mejorLargo, 1 + buscar(carta));
      picos[i] = carta;
    }
    return mejorLargo;
  };
  return buscar(arriba);
}

/** Cartas boca abajo que quedan libres al quitar la de `posicion`. */
function liberaTriPeaks(picos: readonly SitioTriPeaks[], posicion: number): number {
  return picos.filter(
    (c, i) =>
      c === 'oculta' &&
      tapadorasTriPeaks(i).includes(posicion) &&
      tapadorasTriPeaks(i).every((t) => t === posicion || picos[t] === null),
  ).length;
}

/**
 * Pista de TriPeaks: la carta tras la que se encadenan más (y, a igualdad, la que libera más
 * cartas boca abajo), o robar si no se puede quitar nada.
 */
export function pistaTriPeaks(
  vista: VistaTriPeaks,
  acciones: readonly AccionTriPeaks[],
): AccionTriPeaks | null {
  let elegida: AccionTriPeaks | null = null;
  let mejorPuntos = -1;
  for (const a of acciones) {
    if (a.tipo !== 'quitar') continue;
    const carta = vista.picos[a.posicion] as IdCarta;
    const tras = vista.picos.map((c, i) => (i === a.posicion ? null : c));
    const puntos = cadenaTriPeaks(tras, carta) * 100 + liberaTriPeaks(vista.picos, a.posicion);
    if (puntos > mejorPuntos) {
      elegida = a;
      mejorPuntos = puntos;
    }
  }
  return elegida ?? acciones.find((a) => a.tipo === 'robar') ?? null;
}

// ── Yukon ────────────────────────────────────────────────────────────────────

function puntosYukon(v: VistaYukon, a: AccionYukon): number {
  if (a.tipo !== 'mover' || a.desde[0] === 'f') return 0;
  const origen = v.columnas[indice(a.desde)]!;
  const quedan = origen.visibles.length - a.cantidad;
  const descubre = quedan === 0 && origen.ocultas > 0;
  const vacia = quedan === 0 && origen.ocultas === 0;
  if (a.hasta[0] === 'f') return 100 + (descubre ? 50 : 0);
  if (descubre) return 80;
  // Deja arriba una carta que puede subir a las fundaciones.
  if (quedan > 0 && subeAFundacion(origen.visibles[quedan - 1]!, v.fundaciones)) return 60;
  // Vaciar una columna deja sitio a un Rey; pasar un Rey de una columna vacía a otra no cambia
  // nada.
  if (vacia && v.columnas[indice(a.hasta)]!.visibles.length > 0) return 30;
  return 0;
}

/** Pista del Yukon: un movimiento útil, o `null` (no hay mazo). */
export function pistaYukon(
  vista: VistaYukon,
  acciones: readonly AccionYukon[],
): AccionYukon | null {
  return mejor(acciones, (a) => puntosYukon(vista, a));
}

// ── Canfield ─────────────────────────────────────────────────────────────────

function puntosCanfield(v: VistaCanfield, a: AccionCanfield): number {
  if (a.tipo !== 'mover' || a.desde[0] === 'f') return 0;
  if (a.hasta[0] === 'f') return 100 + (a.desde === 'reserva' ? 20 : 0);
  if (a.desde === 'reserva') return 70;
  if (a.desde === 'descarte') return 40;
  // Vaciar una columna mientras queda reserva saca una carta de la reserva.
  const origen = v.columnas[indice(a.desde)]!;
  if (a.cantidad === origen.length && v.reserva > 0) return 30;
  return 0;
}

/** Pista del Canfield: un movimiento útil, o robar o reciclar si no hay ninguno. */
export function pistaCanfield(
  vista: VistaCanfield,
  acciones: readonly AccionCanfield[],
): AccionCanfield | null {
  return (
    mejor(acciones, (a) => puntosCanfield(vista, a)) ??
    acciones.find((a) => a.tipo === 'robar') ??
    acciones.find((a) => a.tipo === 'reciclar') ??
    null
  );
}

// ── Cuarenta ladrones ────────────────────────────────────────────────────────

function puntosLadrones(v: VistaCuarentaLadrones, a: AccionCuarentaLadrones): number {
  if (a.tipo !== 'mover') return 0;
  if (a.hasta[0] === 'f') return 100;
  const destino = v.columnas[indice(a.hasta)]!;
  if (a.desde === 'descarte') return destino.length > 0 ? 60 : 15;
  const origen = v.columnas[indice(a.desde)]!;
  // Vaciar una columna deja sitio para cualquier carta.
  if (a.cantidad === origen.length) return destino.length > 0 ? 50 : 0;
  const destapada = origen[origen.length - a.cantidad - 1]!;
  const fundaciones = v.fundaciones.map((f) => f.map(baseSpider));
  if (subeAFundacion(baseSpider(destapada), fundaciones)) return destino.length > 0 ? 40 : 20;
  return 0;
}

/** Pista de Cuarenta ladrones: un movimiento útil, o robar si no hay ninguno. */
export function pistaCuarentaLadrones(
  vista: VistaCuarentaLadrones,
  acciones: readonly AccionCuarentaLadrones[],
): AccionCuarentaLadrones | null {
  return (
    mejor(acciones, (a) => puntosLadrones(vista, a)) ??
    acciones.find((a) => a.tipo === 'robar') ??
    null
  );
}
