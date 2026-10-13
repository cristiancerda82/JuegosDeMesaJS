import { crearAzar, Generador } from '../baraja/azar';
import { cartaDeId, colorDe, type IdCarta, type PaloFrances } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigFreeCell {
  /** Número de partida del reparto de Microsoft (1–32.000), o `null` para una al azar. */
  readonly partida: number | null;
  readonly celdas: 1 | 2 | 3 | 4;
  /** Llevar solas a las fundaciones las cartas que ya no hacen falta en la mesa. */
  readonly autoFundacion: boolean;
}

export const CONFIG_FREECELL_POR_DEFECTO: ConfigFreeCell = {
  partida: null,
  celdas: 4,
  autoFundacion: true,
};

/** Celdas `l0…l3`, fundaciones `f0…f3` y columnas `c0…c7`. */
export type PilaFreeCell = `l${number}` | `f${number}` | `c${number}`;

interface Tablero {
  readonly celdas: readonly (IdCarta | null)[];
  readonly fundaciones: readonly (readonly IdCarta[])[];
  readonly columnas: readonly (readonly IdCarta[])[];
}

export interface EstadoFreeCell extends Tablero {
  readonly config: ConfigFreeCell;
  readonly numero: number;
  readonly movimientos: number;
  /** Tablero antes de cada movimiento, para deshacer. */
  readonly historial: readonly Tablero[];
  readonly abandonada: boolean;
}

export type AccionFreeCell =
  | {
      readonly tipo: 'mover';
      readonly desde: PilaFreeCell;
      readonly hasta: PilaFreeCell;
      readonly cantidad: number;
    }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'autocompletar' }
  | { readonly tipo: 'abandonar' };

export interface VistaFreeCell extends Tablero {
  readonly config: ConfigFreeCell;
  readonly numero: number;
  readonly movimientos: number;
  /** Cartas que se pueden mover a la vez a una columna que no está vacía. */
  readonly maxMovible: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Reparto de Microsoft ─────────────────────────────────────────────────────

export const PARTIDAS_FREECELL = 32_000;
const COLUMNAS = 8;
const FUNDACIONES = 4;
/** Orden de palos del reparto de Microsoft: tréboles, diamantes, corazones, picas. */
const PALOS_MS: readonly PaloFrances[] = ['treboles', 'diamantes', 'corazones', 'picas'];

/** Reparte la partida `numero` como el FreeCell de Microsoft: 8 columnas, por filas. */
export function repartoMicrosoft(numero: number): IdCarta[][] {
  let semilla = numero;
  const rand = () => {
    semilla = (semilla * 214013 + 2531011) % 2 ** 31;
    return Math.floor(semilla / 2 ** 16);
  };
  const cartas = Array.from({ length: 52 }, (_, i) => 51 - i);
  for (let i = 0; i < 52; i++) {
    const j = 51 - (rand() % (52 - i));
    [cartas[i], cartas[j]] = [cartas[j]!, cartas[i]!];
  }
  const columnas: IdCarta[][] = Array.from({ length: COLUMNAS }, () => []);
  cartas.forEach((c, i) => {
    columnas[i % COLUMNAS]!.push(`${PALOS_MS[c % 4]!}-${Math.floor(c / 4) + 1}`);
  });
  return columnas;
}

// ── Reglas de apilado ────────────────────────────────────────────────────────

const valor = (id: IdCarta) => cartaDeId(id)!.valor;
const palo = (id: IdCarta) => cartaDeId(id)!.palo as PaloFrances;
const color = (id: IdCarta) => colorDe(palo(id));

const celda = (i: number): PilaFreeCell => `l${i}`;
const fundacion = (i: number): PilaFreeCell => `f${i}`;
const columna = (i: number): PilaFreeCell => `c${i}`;

function encaja(carta: IdCarta, tope: IdCarta | undefined): boolean {
  if (tope === undefined) return true;
  return valor(carta) === valor(tope) - 1 && color(carta) !== color(tope);
}

function puedeIrAFundacion(carta: IdCarta, destino: readonly IdCarta[]): boolean {
  const tope = destino.at(-1);
  if (tope === undefined) return valor(carta) === 1;
  return palo(carta) === palo(tope) && valor(carta) === valor(tope) + 1;
}

/** Longitud de la secuencia ordenada y alterna al final de una columna. */
function secuenciaFinal(cartas: readonly IdCarta[]): number {
  let n = cartas.length === 0 ? 0 : 1;
  while (n < cartas.length && encaja(cartas.at(-n)!, cartas.at(-n - 1))) n++;
  return n;
}

/** `(celdas libres + 1) × 2^(columnas vacías)`, sin contar el destino si está vacío. */
function maxMovible(t: Tablero, destinoVacio: boolean): number {
  const libres = t.celdas.filter((c) => c === null).length;
  const vacias = t.columnas.filter((c) => c.length === 0).length - (destinoVacio ? 1 : 0);
  return (libres + 1) * 2 ** Math.max(0, vacias);
}

/** Valor más alto en las fundaciones de un palo (0 si no ha empezado). */
function alturaFundacion(t: Tablero, p: PaloFrances): number {
  const f = t.fundaciones.find((f) => f.length > 0 && palo(f[0]!) === p);
  return f?.length ?? 0;
}

/** Una carta ya no sirve en la mesa si no puede recibir ninguna carta del color contrario. */
function esSegura(t: Tablero, carta: IdCarta): boolean {
  if (valor(carta) <= 2) return true;
  const contrarios = (['picas', 'corazones', 'diamantes', 'treboles'] as const).filter(
    (p) => colorDe(p) !== color(carta),
  );
  return valor(carta) <= Math.min(...contrarios.map((p) => alturaFundacion(t, p))) + 1;
}

const ganada = (t: Tablero) => t.fundaciones.every((f) => f.length === 13);

/** Cada columna baja (o repite) de la base al final: ninguna carta tapa a otra menor. */
const ordenadas = (t: Tablero) =>
  t.columnas.every((c) => c.every((carta, k) => k === 0 || valor(carta) <= valor(c[k - 1]!)));

// ── Mesa mutable (solo dentro de una transición) ─────────────────────────────

interface Mesa {
  celdas: (IdCarta | null)[];
  fundaciones: IdCarta[][];
  columnas: IdCarta[][];
}

const copiar = (t: Tablero): Mesa => ({
  celdas: [...t.celdas],
  fundaciones: t.fundaciones.map((f) => [...f]),
  columnas: t.columnas.map((c) => [...c]),
});

function sacar(m: Mesa, pila: PilaFreeCell, cantidad: number): IdCarta[] {
  const i = Number(pila.slice(1));
  if (pila[0] === 'l') {
    const carta = m.celdas[i]!;
    m.celdas[i] = null;
    return [carta];
  }
  const origen = pila[0] === 'c' ? m.columnas[i]! : m.fundaciones[i]!;
  return origen.splice(origen.length - cantidad);
}

function poner(m: Mesa, pila: PilaFreeCell, cartas: IdCarta[]): void {
  const i = Number(pila.slice(1));
  if (pila[0] === 'l') m.celdas[i] = cartas[0]!;
  else (pila[0] === 'c' ? m.columnas[i]! : m.fundaciones[i]!).push(...cartas);
}

/** Fundación a la que puede ir la carta, o -1. */
const fundacionPara = (t: Tablero, carta: IdCarta) =>
  t.fundaciones.findIndex((f) => puedeIrAFundacion(carta, f));

/** Cartas accesibles: las de las celdas y las del final de cada columna. */
function accesibles(t: Tablero): { pila: PilaFreeCell; carta: IdCarta }[] {
  const lista: { pila: PilaFreeCell; carta: IdCarta }[] = [];
  t.celdas.forEach((c, i) => c !== null && lista.push({ pila: celda(i), carta: c }));
  t.columnas.forEach((c, i) => c.length > 0 && lista.push({ pila: columna(i), carta: c.at(-1)! }));
  return lista;
}

function moverSeguras(m: Mesa): void {
  for (;;) {
    const segura = accesibles(m).find(
      ({ carta }) => fundacionPara(m, carta) >= 0 && esSegura(m, carta),
    );
    if (!segura) return;
    poner(m, fundacion(fundacionPara(m, segura.carta)), sacar(m, segura.pila, 1));
  }
}

/** Con las columnas ordenadas, la carta accesible menor siempre es la siguiente de su palo. */
function autocompletar(m: Mesa): void {
  for (;;) {
    const menor = accesibles(m).sort((a, b) => valor(a.carta) - valor(b.carta))[0];
    if (!menor) return;
    poner(m, fundacion(fundacionPara(m, menor.carta)), sacar(m, menor.pila, 1));
  }
}

// ── Juego ────────────────────────────────────────────────────────────────────

const tablero = (e: EstadoFreeCell): Tablero => ({
  celdas: e.celdas,
  fundaciones: e.fundaciones,
  columnas: e.columnas,
});

export const freecell: Juego<ConfigFreeCell, EstadoFreeCell, AccionFreeCell, VistaFreeCell> = {
  id: 'freecell',

  crear(config, semilla) {
    const { partida } = config;
    if (
      partida !== null &&
      (!Number.isInteger(partida) || partida < 1 || partida > PARTIDAS_FREECELL)
    ) {
      return error(`El número de partida debe ir del 1 al ${PARTIDAS_FREECELL}`);
    }
    if (![1, 2, 3, 4].includes(config.celdas)) return error('Las celdas deben ser de 1 a 4');
    if (typeof config.autoFundacion !== 'boolean') {
      return error('Opción de movimiento automático inválida');
    }
    const numero = partida ?? new Generador(crearAzar(semilla)).enteroHasta(PARTIDAS_FREECELL) + 1;
    return ok({
      config: { partida, celdas: config.celdas, autoFundacion: config.autoFundacion },
      numero,
      celdas: new Array<IdCarta | null>(config.celdas).fill(null),
      fundaciones: Array.from({ length: FUNDACIONES }, () => []),
      columnas: repartoMicrosoft(numero),
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || freecell.resultado(e) !== null) return [];
    const acciones: AccionFreeCell[] = [];
    const mover = (desde: PilaFreeCell, hasta: PilaFreeCell, cantidad: number) =>
      acciones.push({ tipo: 'mover', desde, hasta, cantidad });
    const celdaLibre = e.celdas.indexOf(null);
    const columnaVacia = e.columnas.findIndex((c) => c.length === 0);

    // Una carta a su fundación.
    for (const { pila, carta } of accesibles(e)) {
      const f = fundacionPara(e, carta);
      if (f >= 0) mover(pila, fundacion(f), 1);
    }
    // De una celda a una columna.
    e.celdas.forEach((carta, i) => {
      if (carta === null) return;
      e.columnas.forEach(
        (c, j) => c.length > 0 && encaja(carta, c.at(-1)) && mover(celda(i), columna(j), 1),
      );
      if (columnaVacia >= 0) mover(celda(i), columna(columnaVacia), 1);
    });
    // De una columna a una celda o a otra columna, con secuencias.
    e.columnas.forEach((c, i) => {
      if (c.length === 0) return;
      if (celdaLibre >= 0) mover(columna(i), celda(celdaLibre), 1);
      const secuencia = secuenciaFinal(c);
      e.columnas.forEach((d, j) => {
        if (j === i || d.length === 0) return;
        const limite = Math.min(secuencia, maxMovible(e, false));
        for (let k = 1; k <= limite; k++) {
          if (encaja(c.at(-k)!, d.at(-1))) mover(columna(i), columna(j), k);
        }
      });
      // A una columna vacía, cualquier tramo de la secuencia (si no es ya la columna entera).
      if (columnaVacia >= 0) {
        const limite = Math.min(secuencia, maxMovible(e, true));
        for (let k = 1; k <= limite; k++) {
          if (k < c.length) mover(columna(i), columna(columnaVacia), k);
        }
      }
    });

    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    if (ordenadas(e) && !ganada(e)) acciones.push({ tipo: 'autocompletar' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    switch (accion.tipo) {
      case 'mover': {
        const m = copiar(e);
        poner(m, accion.hasta, sacar(m, accion.desde, accion.cantidad));
        if (e.config.autoFundacion) moverSeguras(m);
        return {
          ...e,
          ...m,
          movimientos: e.movimientos + 1,
          historial: [...e.historial, tablero(e)],
        };
      }
      case 'deshacer':
        // Deshacer cuenta como un movimiento más: el contador nunca baja.
        return {
          ...e,
          ...e.historial.at(-1)!,
          movimientos: e.movimientos + 1,
          historial: e.historial.slice(0, -1),
        };
      case 'autocompletar': {
        const m = copiar(e);
        autocompletar(m);
        return {
          ...e,
          ...m,
          movimientos: e.movimientos + 1,
          historial: [...e.historial, tablero(e)],
        };
      }
      case 'abandonar':
        return { ...e, abandonada: true };
    }
  },

  vistaDe(e) {
    const situacion = e.abandonada ? 'abandono' : ganada(e) ? 'victoria' : 'jugando';
    return {
      config: e.config,
      numero: e.numero,
      celdas: [...e.celdas],
      fundaciones: e.fundaciones.map((f) => [...f]),
      columnas: e.columnas.map((c) => [...c]),
      movimientos: e.movimientos,
      maxMovible: maxMovible(e, false),
      situacion,
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false };
    if (ganada(e)) return { ganadores: [0], empate: false };
    return null;
  },
};
