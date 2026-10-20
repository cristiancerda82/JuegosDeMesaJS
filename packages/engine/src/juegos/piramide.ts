import { crearAzar } from '../baraja/azar';
import { barajar } from '../baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../baraja/cartas';
import type { Juego } from '../motor/contrato';
import { error, ok } from '../resultado';

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface ConfigPiramide {
  /** Veces que se recorre el mazo en total; `null` es sin límite. */
  readonly pasadas: 1 | 3 | null;
}

export const CONFIG_PIRAMIDE_POR_DEFECTO: ConfigPiramide = { pasadas: 3 };

/** Una carta que se puede quitar: de una posición de la pirámide o la de arriba del descarte. */
export type SitioPiramide = { readonly piramide: number } | { readonly descarte: true };

interface Tablero {
  /** Las 28 posiciones, fila a fila; `null` es un hueco. */
  readonly piramide: readonly (IdCarta | null)[];
  /** Boca abajo; se roba del final. */
  readonly mazo: readonly IdCarta[];
  /** Boca arriba; la de arriba es la última. */
  readonly descarte: readonly IdCarta[];
  /** Veces que ya se ha dado la vuelta al descarte. */
  readonly vueltas: number;
}

export interface EstadoPiramide extends Tablero {
  readonly config: ConfigPiramide;
  readonly movimientos: number;
  /** Tablero antes de cada acción, para deshacer. */
  readonly historial: readonly Tablero[];
  readonly abandonada: boolean;
}

export type AccionPiramide =
  | { readonly tipo: 'quitar'; readonly cartas: readonly SitioPiramide[] }
  | { readonly tipo: 'robar' }
  | { readonly tipo: 'reciclar' }
  | { readonly tipo: 'deshacer' }
  | { readonly tipo: 'abandonar' };

export interface VistaPiramide {
  readonly config: ConfigPiramide;
  readonly piramide: readonly (IdCarta | null)[];
  readonly mazo: number;
  readonly descarte: readonly IdCarta[];
  /** Veces que aún se puede dar la vuelta al descarte; `null` es sin límite. */
  readonly vueltasRestantes: number | null;
  readonly movimientos: number;
  readonly situacion: 'jugando' | 'victoria' | 'abandono';
}

// ── Posiciones ───────────────────────────────────────────────────────────────

export const FILAS_PIRAMIDE = 7;
export const CARTAS_PIRAMIDE = (FILAS_PIRAMIDE * (FILAS_PIRAMIDE + 1)) / 2;
const SUMA = 13;

/** Primera posición de la fila `f` (0 es la cúspide). */
export const inicioFilaPiramide = (f: number) => (f * (f + 1)) / 2;

/** Fila y columna de una posición. */
export function filaPiramide(p: number): { fila: number; columna: number } {
  let fila = 0;
  while (inicioFilaPiramide(fila + 1) <= p) fila++;
  return { fila, columna: p - inicioFilaPiramide(fila) };
}

/** Las dos posiciones de la fila siguiente que tapan `p`, o ninguna en la última fila. */
export function tapadorasPiramide(p: number): number[] {
  const { fila, columna } = filaPiramide(p);
  if (fila === FILAS_PIRAMIDE - 1) return [];
  const debajo = inicioFilaPiramide(fila + 1) + columna;
  return [debajo, debajo + 1];
}

/** La carta de la posición `p` está y no la tapa ninguna. */
export function libreEnPiramide(piramide: readonly (IdCarta | null)[], p: number): boolean {
  return piramide[p] !== null && tapadorasPiramide(p).every((t) => piramide[t] === null);
}

/** As 1, los números lo que marcan, J 11, Q 12 y K 13. */
export const valorPiramide = (carta: IdCarta) => cartaDeId(carta)!.valor;

const vacia = (t: Tablero) => t.piramide.every((c) => c === null);

const vueltasPermitidas = (config: ConfigPiramide) =>
  config.pasadas === null ? Infinity : config.pasadas - 1;

/** La carta de un sitio, si está libre. */
function cartaDe(t: Tablero, sitio: SitioPiramide): IdCarta | null {
  if ('descarte' in sitio) return t.descarte.at(-1) ?? null;
  return libreEnPiramide(t.piramide, sitio.piramide) ? t.piramide[sitio.piramide]! : null;
}

/** Los sitios con una carta libre: las posiciones libres de la pirámide y el descarte. */
export function sitiosLibres(t: Pick<Tablero, 'piramide' | 'descarte'>): SitioPiramide[] {
  const sitios: SitioPiramide[] = [];
  t.piramide.forEach((_, p) => {
    if (libreEnPiramide(t.piramide, p)) sitios.push({ piramide: p });
  });
  if (t.descarte.length > 0) sitios.push({ descarte: true });
  return sitios;
}

const tablero = (e: EstadoPiramide): Tablero => ({
  piramide: e.piramide,
  mazo: e.mazo,
  descarte: e.descarte,
  vueltas: e.vueltas,
});

// ── Juego ────────────────────────────────────────────────────────────────────

export const piramide: Juego<ConfigPiramide, EstadoPiramide, AccionPiramide, VistaPiramide> = {
  id: 'piramide',

  crear(config, semilla) {
    if (config.pasadas !== null && config.pasadas !== 1 && config.pasadas !== 3) {
      return error('La Pirámide se juega con 1 o 3 pasadas, o sin límite');
    }
    const { cartas } = barajar(crearBaraja('francesa52'), crearAzar(semilla));
    return ok({
      config: { pasadas: config.pasadas },
      piramide: cartas.slice(0, CARTAS_PIRAMIDE),
      mazo: cartas.slice(CARTAS_PIRAMIDE),
      descarte: [],
      vueltas: 0,
      movimientos: 0,
      historial: [],
      abandonada: false,
    });
  },

  asientos: () => 1,

  accionesLegales(e, asiento) {
    if (asiento !== 0 || piramide.resultado(e) !== null) return [];
    const acciones: AccionPiramide[] = [];
    const libres = sitiosLibres(e).map((sitio) => ({ sitio, carta: cartaDe(e, sitio)! }));
    libres.forEach((a, i) => {
      if (valorPiramide(a.carta) === SUMA) acciones.push({ tipo: 'quitar', cartas: [a.sitio] });
      for (const b of libres.slice(i + 1)) {
        if (valorPiramide(a.carta) + valorPiramide(b.carta) === SUMA) {
          acciones.push({ tipo: 'quitar', cartas: [a.sitio, b.sitio] });
        }
      }
    });
    if (e.mazo.length > 0) acciones.push({ tipo: 'robar' });
    else if (e.descarte.length > 0 && e.vueltas < vueltasPermitidas(e.config)) {
      acciones.push({ tipo: 'reciclar' });
    }
    if (e.historial.length > 0) acciones.push({ tipo: 'deshacer' });
    acciones.push({ tipo: 'abandonar' });
    return acciones;
  },

  transicion(e, _asiento, accion) {
    const tras = (t: Partial<Tablero>): EstadoPiramide => ({
      ...e,
      ...t,
      movimientos: e.movimientos + 1,
      historial: [...e.historial, tablero(e)],
    });
    switch (accion.tipo) {
      case 'quitar': {
        const piramideNueva = [...e.piramide];
        let descarte = e.descarte;
        for (const sitio of accion.cartas) {
          if ('descarte' in sitio) descarte = descarte.slice(0, -1);
          else piramideNueva[sitio.piramide] = null;
        }
        return tras({ piramide: piramideNueva, descarte });
      }
      case 'robar':
        return tras({ mazo: e.mazo.slice(0, -1), descarte: [...e.descarte, e.mazo.at(-1)!] });
      case 'reciclar':
        // El descarte se da la vuelta: la primera carta robada vuelve a ser la primera en salir.
        return tras({ mazo: [...e.descarte].reverse(), descarte: [], vueltas: e.vueltas + 1 });
      case 'deshacer':
        // Deshacer cuenta como un movimiento más: el contador nunca baja.
        return {
          ...e,
          ...e.historial.at(-1)!,
          movimientos: e.movimientos + 1,
          historial: e.historial.slice(0, -1),
        };
      case 'abandonar':
        return { ...e, abandonada: true };
    }
  },

  vistaDe(e) {
    const permitidas = vueltasPermitidas(e.config);
    return {
      config: e.config,
      piramide: [...e.piramide],
      mazo: e.mazo.length,
      descarte: [...e.descarte],
      vueltasRestantes: permitidas === Infinity ? null : permitidas - e.vueltas,
      movimientos: e.movimientos,
      situacion: e.abandonada ? 'abandono' : vacia(e) ? 'victoria' : 'jugando',
    };
  },

  resultado(e) {
    if (e.abandonada) return { ganadores: [], empate: false };
    if (vacia(e)) return { ganadores: [0], empate: false };
    return null;
  },
};
