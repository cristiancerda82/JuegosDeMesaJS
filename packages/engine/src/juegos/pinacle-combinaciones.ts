import {
  cartaDeId,
  esComodin,
  PALOS_FRANCESES,
  type IdCarta,
  type PaloFrances,
} from '../baraja/cartas';

/**
 * Combinaciones del Pinacle (spec juego-pinacle): las cartas, los grupos y escaleras, y las
 * jugadas pequeñas con las que se bajan (una combinación de 3, añadir una carta, cambiar un
 * comodín). Lo comparten el motor, la ayuda para bajar y la IA.
 */

// ── Cartas ───────────────────────────────────────────────────────────────────

/** Carta del Pinacle: la carta de la baraja y su copia (0 o 1), p. ej. "picas-12#1". */
export type CartaPinacle = `${IdCarta}#${number}`;

/** La carta de la baraja que representa una carta del Pinacle (sin la copia). */
export const basePinacle = (carta: CartaPinacle): IdCarta =>
  carta.slice(0, carta.lastIndexOf('#')) as IdCarta;

/** Las 108 cartas: dos barajas francesas y 4 comodines, en orden canónico. */
export function cartasPinacle(): CartaPinacle[] {
  const cartas: CartaPinacle[] = [];
  for (let copia = 0; copia < 2; copia++) {
    for (const palo of PALOS_FRANCESES) {
      for (let v = 1; v <= 13; v++) cartas.push(`${palo}-${v}#${copia}`);
    }
    cartas.push(`comodin-1#${copia}`, `comodin-2#${copia}`);
  }
  return cartas;
}

export const esJoker = (c: CartaPinacle) => esComodin(basePinacle(c));

/** Número de la carta con el As como 14 (por encima del K); 0 para un comodín. */
export function rangoPinacle(c: CartaPinacle): number {
  if (esJoker(c)) return 0;
  const v = cartaDeId(basePinacle(c))!.valor;
  return v === 1 ? 14 : v;
}

export const esDos = (c: CartaPinacle) => rangoPinacle(c) === 2;

/** Los comodines y los doses: sustituyen a cualquier carta. */
export const esComodinPinacle = (c: CartaPinacle) => esJoker(c) || esDos(c);

/** Palo de una carta; `null` para un comodín. */
export const paloPinacle = (c: CartaPinacle): PaloFrances | null =>
  esJoker(c) ? null : (cartaDeId(basePinacle(c))!.palo as PaloFrances);

/** Valor de la carta: comodín 30, dos 20, As 15, del 8 al K 10 y del 3 al 7 5. */
export function puntosCartaPinacle(c: CartaPinacle): number {
  const r = rangoPinacle(c);
  if (r === 0) return 30;
  if (r === 2) return 20;
  if (r === 14) return 15;
  return r >= 8 ? 10 : 5;
}

/** Carta natural de un número y un palo, sin copia (el As es el 14). */
const baseDe = (palo: PaloFrances, r: number): IdCarta => `${palo}-${r === 14 ? 1 : r}`;

/** Las cartas iguales a efectos de juego: los cuatro comodines son una sola clase. */
export const clave = (c: CartaPinacle): string => (esJoker(c) ? 'comodin' : basePinacle(c));

export const NUMERO_MINIMO = 3;
export const AS = 14;
export const MAXIMO_GRUPO = 11;

// ── Combinaciones ────────────────────────────────────────────────────────────

interface ComunCombinacion {
  /** Identificador estable en la mano. */
  readonly id: number;
  readonly bando: number;
  /** Comodines de la combinación que ya se cambiaron (no se cambian otra vez). */
  readonly cambiados: readonly CartaPinacle[];
  /** Turno en que se bajó; si recibió cartas en otro turno, `variosTurnos`. */
  readonly primerTurno: number;
  readonly variosTurnos: boolean;
}

export interface GrupoPinacle extends ComunCombinacion {
  readonly tipo: 'grupo';
  /** Número del grupo, del 3 al 14 (As). */
  readonly numero: number;
  readonly cartas: readonly CartaPinacle[];
}

export interface EscaleraPinacle extends ComunCombinacion {
  readonly tipo: 'escalera';
  readonly palo: PaloFrances;
  /** Número del primer puesto; `puestos[i]` ocupa el número `desde + i`. */
  readonly desde: number;
  readonly puestos: readonly CartaPinacle[];
}

export type Combinacion = GrupoPinacle | EscaleraPinacle;

export const cartasDe = (c: Combinacion): readonly CartaPinacle[] =>
  c.tipo === 'grupo' ? c.cartas : c.puestos;

export const hastaDe = (e: EscaleraPinacle) => e.desde + e.puestos.length - 1;

/** Una combinación nueva de 3 cartas, tal como se baja. */
export type NuevaCombinacion =
  | { readonly tipo: 'grupo'; readonly cartas: readonly CartaPinacle[] }
  | {
      readonly tipo: 'escalera';
      readonly palo: PaloFrances;
      readonly desde: number;
      readonly puestos: readonly CartaPinacle[];
    };

export type AccionBajada =
  | { readonly tipo: 'bajar'; readonly combinacion: NuevaCombinacion }
  | {
      readonly tipo: 'anadir';
      readonly combinacion: number;
      readonly carta: CartaPinacle;
      /** En una escalera, el número que ocupa la carta. */
      readonly puesto?: number;
    }
  | {
      readonly tipo: 'cambiar';
      readonly combinacion: number;
      readonly carta: CartaPinacle;
      /** En una escalera, el extremo al que pasa el comodín. */
      readonly extremo?: 'abajo' | 'arriba';
    };

// ── Generación de jugadas ────────────────────────────────────────────────────

/**
 * Las cartas de la mano por clase, en el orden de la mano, con `preferida` la primera de su
 * clase. Las copias son intercambiables: las jugadas usan siempre las primeras de cada clase.
 */
function porClase(
  mano: readonly CartaPinacle[],
  preferida: CartaPinacle | null,
): Map<string, CartaPinacle[]> {
  const clases = new Map<string, CartaPinacle[]>();
  for (const c of mano) {
    const lista = clases.get(clave(c)) ?? [];
    if (c === preferida) lista.unshift(c);
    else lista.push(c);
    clases.set(clave(c), lista);
  }
  return clases;
}

/** Una carta de cada clase: la que usan las jugadas. */
function representantes(mano: readonly CartaPinacle[], preferida: CartaPinacle | null) {
  return [...porClase(mano, preferida).values()].map((l) => l[0]!);
}

/** Las clases de comodín de la mano, con su carta representante. */
function comodinesDe(clases: Map<string, CartaPinacle[]>): CartaPinacle[] {
  return [...clases.values()].map((l) => l[0]!).filter(esComodinPinacle);
}

/** Todas las combinaciones de 3 cartas que se pueden bajar con la mano. */
export function bajadasPosibles(
  mano: readonly CartaPinacle[],
  preferida: CartaPinacle | null = null,
): NuevaCombinacion[] {
  const clases = porClase(mano, preferida);
  const comodines = comodinesDe(clases);
  const naturales = (palo: PaloFrances, r: number) => clases.get(baseDe(palo, r)) ?? [];
  const bajadas: NuevaCombinacion[] = [];

  // Grupos: 3 naturales, o 2 naturales y un comodín.
  for (let r = NUMERO_MINIMO; r <= AS; r++) {
    const disponibles = PALOS_FRANCESES.flatMap((p) => naturales(p, r));
    if (disponibles.length < 2) continue;
    // Elecciones por palo sin repetir (las copias de un palo van seguidas en `disponibles`).
    const elegir = (k: number, desde: number, elegidas: CartaPinacle[]) => {
      if (elegidas.length === k) {
        if (k === 3) bajadas.push({ tipo: 'grupo', cartas: [...elegidas] });
        else for (const w of comodines) bajadas.push({ tipo: 'grupo', cartas: [...elegidas, w] });
        return;
      }
      let anterior: string | null = null;
      for (let i = desde; i < disponibles.length; i++) {
        const c = disponibles[i]!;
        // Dos copias de la misma carta en la misma posición darían la misma jugada.
        if (clave(c) === anterior) continue;
        anterior = clave(c);
        elegir(k, i + 1, [...elegidas, c]);
      }
    };
    elegir(3, 0, []);
    elegir(2, 0, []);
  }

  // Escaleras: 3 puestos seguidos, con a lo sumo un comodín.
  for (const palo of PALOS_FRANCESES) {
    for (let desde = NUMERO_MINIMO; desde + 2 <= AS; desde++) {
      const puestos = [desde, desde + 1, desde + 2].map((r) => naturales(palo, r)[0] ?? null);
      if (puestos.every((c) => c !== null)) {
        bajadas.push({ tipo: 'escalera', palo, desde, puestos: puestos as CartaPinacle[] });
      }
      for (let hueco = 0; hueco < 3; hueco++) {
        if (puestos.some((c, i) => i !== hueco && c === null)) continue;
        for (const w of comodines) {
          const conComodin = puestos.map((c, i) => (i === hueco ? w : c!));
          bajadas.push({ tipo: 'escalera', palo, desde, puestos: conComodin });
        }
      }
    }
  }
  return bajadas;
}

/** Las cartas que se pueden añadir a las combinaciones dadas (las del bando). */
export function anadidosPosibles(
  mano: readonly CartaPinacle[],
  combinaciones: readonly Combinacion[],
  preferida: CartaPinacle | null = null,
): AccionBajada[] {
  const cartas = representantes(mano, preferida);
  const acciones: AccionBajada[] = [];
  for (const c of combinaciones) {
    for (const carta of cartas) {
      if (c.tipo === 'grupo') {
        if (c.cartas.length >= MAXIMO_GRUPO) continue;
        if (esComodinPinacle(carta) || rangoPinacle(carta) === c.numero) {
          acciones.push({ tipo: 'anadir', combinacion: c.id, carta });
        }
        continue;
      }
      const abajo = c.desde - 1;
      const arriba = hastaDe(c) + 1;
      const puestos = esComodinPinacle(carta)
        ? [abajo, arriba]
        : paloPinacle(carta) === c.palo
          ? [rangoPinacle(carta)].filter((r) => r === abajo || r === arriba)
          : [];
      for (const puesto of puestos) {
        if (puesto >= NUMERO_MINIMO && puesto <= AS) {
          acciones.push({ tipo: 'anadir', combinacion: c.id, carta, puesto });
        }
      }
    }
  }
  return acciones;
}

/** Los cambios de comodín posibles en las combinaciones dadas (las del bando). */
export function cambiosPosibles(
  mano: readonly CartaPinacle[],
  combinaciones: readonly Combinacion[],
  preferida: CartaPinacle | null = null,
): AccionBajada[] {
  const cartas = representantes(mano, preferida).filter((c) => !esComodinPinacle(c));
  const acciones: AccionBajada[] = [];
  for (const c of combinaciones) {
    for (const carta of cartas) {
      if (c.tipo === 'grupo') {
        const libre = c.cartas.some((w) => esComodinPinacle(w) && !c.cambiados.includes(w));
        if (libre && rangoPinacle(carta) === c.numero && c.cartas.length < MAXIMO_GRUPO) {
          acciones.push({ tipo: 'cambiar', combinacion: c.id, carta });
        }
        continue;
      }
      if (paloPinacle(carta) !== c.palo) continue;
      const w = c.puestos[rangoPinacle(carta) - c.desde];
      if (w === undefined || !esComodinPinacle(w) || c.cambiados.includes(w)) continue;
      if (c.desde > NUMERO_MINIMO) {
        acciones.push({ tipo: 'cambiar', combinacion: c.id, carta, extremo: 'abajo' });
      }
      if (hastaDe(c) < AS) {
        acciones.push({ tipo: 'cambiar', combinacion: c.id, carta, extremo: 'arriba' });
      }
    }
  }
  return acciones;
}

/** Todas las jugadas de bajada posibles: combinaciones nuevas, añadidos y cambios. */
export function jugadasDeBajada(
  mano: readonly CartaPinacle[],
  combinaciones: readonly Combinacion[],
  preferida: CartaPinacle | null = null,
): AccionBajada[] {
  return [
    ...bajadasPosibles(mano, preferida).map((combinacion) => ({
      tipo: 'bajar' as const,
      combinacion,
    })),
    ...anadidosPosibles(mano, combinaciones, preferida),
    ...cambiosPosibles(mano, combinaciones, preferida),
  ];
}

// ── Aplicar jugadas ──────────────────────────────────────────────────────────

/** Cartas de la mano que una jugada pone en la mesa. */
export const cartasQueBaja = (a: AccionBajada): readonly CartaPinacle[] =>
  a.tipo === 'bajar' ? cartasNuevas(a.combinacion) : [a.carta];

const cartasNuevas = (n: NuevaCombinacion) => (n.tipo === 'grupo' ? n.cartas : n.puestos);

export interface TrasBajada {
  readonly mano: CartaPinacle[];
  readonly combinaciones: Combinacion[];
  /** Premio por cambiar un comodín, o 0. */
  readonly premioCambio: number;
}

/**
 * Aplica una jugada ya legal: saca las cartas de la mano y las pone en la mesa. `id` es el de
 * la combinación nueva si se baja una; `turno`, el número de turno de la mano.
 */
export function aplicarBajada(
  mano: readonly CartaPinacle[],
  combinaciones: readonly Combinacion[],
  accion: AccionBajada,
  contexto: { readonly id: number; readonly bando: number; readonly turno: number },
): TrasBajada {
  const salen = cartasQueBaja(accion);
  const restante = mano.filter((c) => !salen.includes(c));
  if (accion.tipo === 'bajar') {
    const comun = {
      id: contexto.id,
      bando: contexto.bando,
      cambiados: [],
      primerTurno: contexto.turno,
      variosTurnos: false,
    };
    const n = accion.combinacion;
    const nueva: Combinacion =
      n.tipo === 'grupo'
        ? {
            ...comun,
            tipo: 'grupo',
            numero: rangoPinacle(n.cartas.find((c) => !esComodinPinacle(c))!),
            cartas: [...n.cartas],
          }
        : { ...comun, tipo: 'escalera', palo: n.palo, desde: n.desde, puestos: [...n.puestos] };
    return { mano: restante, combinaciones: [...combinaciones, nueva], premioCambio: 0 };
  }

  let premioCambio = 0;
  const cambiadas = combinaciones.map((c): Combinacion => {
    if (c.id !== accion.combinacion) return c;
    const variosTurnos = c.variosTurnos || c.primerTurno !== contexto.turno;
    if (accion.tipo === 'anadir') {
      if (c.tipo === 'grupo') return { ...c, variosTurnos, cartas: [...c.cartas, accion.carta] };
      return accion.puesto === c.desde - 1
        ? { ...c, variosTurnos, desde: c.desde - 1, puestos: [accion.carta, ...c.puestos] }
        : { ...c, variosTurnos, puestos: [...c.puestos, accion.carta] };
    }
    if (c.tipo === 'grupo') {
      const w = c.cartas.find((x) => esComodinPinacle(x) && !c.cambiados.includes(x))!;
      premioCambio = 30;
      return {
        ...c,
        variosTurnos,
        cartas: [...c.cartas, accion.carta],
        cambiados: [...c.cambiados, w],
      };
    }
    const i = rangoPinacle(accion.carta) - c.desde;
    const w = c.puestos[i]!;
    premioCambio = esJoker(w) ? 30 : 15;
    const puestos = c.puestos.map((x, k) => (k === i ? accion.carta : x));
    return accion.extremo === 'abajo'
      ? {
          ...c,
          variosTurnos,
          desde: c.desde - 1,
          puestos: [w, ...puestos],
          cambiados: [...c.cambiados, w],
        }
      : { ...c, variosTurnos, puestos: [...puestos, w], cambiados: [...c.cambiados, w] };
  });
  return { mano: restante, combinaciones: cambiadas, premioCambio };
}
