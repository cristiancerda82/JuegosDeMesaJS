import { cartaDeId, type IdCarta } from '../baraja/cartas';
import type { AccionFreeCell, VistaFreeCell } from '../juegos/freecell';
import type { AccionKlondike, VistaKlondike } from '../juegos/klondike';
import { libreEnPiramide, type AccionPiramide, type VistaPiramide } from '../juegos/piramide';
import { baseSpider, type AccionSpider, type VistaSpider } from '../juegos/spider';

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
