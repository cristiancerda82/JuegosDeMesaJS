import {
  cartaDeId,
  esComodin,
  PALOS_ESPANOLES,
  type IdCarta,
  type PaloEspanol,
} from '../baraja/cartas';

/**
 * Combinaciones del Remigio (spec juego-remigio): las cartas de dos barajas, los grupos y
 * escaleras con comodines, y las jugadas pequeñas con las que se bajan (una combinación de 3,
 * añadir una carta, cambiar un comodín). Lo comparten el motor, la ayuda para bajar y la IA.
 */

// ── Cartas ───────────────────────────────────────────────────────────────────

/** Carta del Remigio: la carta de la baraja y su copia (0 o 1), p. ej. "oros-12#1". */
export type CartaRemigio = `${IdCarta}#${number}`;

/** La carta de la baraja que representa una carta del Remigio (sin la copia). */
export const baseRemigio = (carta: CartaRemigio): IdCarta =>
  carta.slice(0, carta.lastIndexOf('#')) as IdCarta;

/** Valores de la baraja de 40 en el orden de las escaleras: el 7 y la Sota son seguidos. */
export const VALORES_ESCALERA = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
export const POSICION_MAXIMA = VALORES_ESCALERA.length;

/** Las 84 cartas: dos barajas españolas de 40 y 4 comodines, en orden canónico. */
export function cartasRemigio(): CartaRemigio[] {
  const cartas: CartaRemigio[] = [];
  for (let copia = 0; copia < 2; copia++) {
    for (const palo of PALOS_ESPANOLES) {
      for (const v of VALORES_ESCALERA) cartas.push(`${palo}-${v}#${copia}`);
    }
    cartas.push(`comodin-1#${copia}`, `comodin-2#${copia}`);
  }
  return cartas;
}

export const esComodinRemigio = (c: CartaRemigio) => esComodin(baseRemigio(c));

/** Número de la carta (1–7, 10–12); 0 para un comodín. */
export const numeroRemigio = (c: CartaRemigio): number =>
  esComodinRemigio(c) ? 0 : cartaDeId(baseRemigio(c))!.valor;

/** Puesto de la carta en una escalera, del 1 (As) al 10 (Rey); 0 para un comodín. */
export const posicionRemigio = (c: CartaRemigio): number =>
  esComodinRemigio(c) ? 0 : (VALORES_ESCALERA as readonly number[]).indexOf(numeroRemigio(c)) + 1;

/** Palo de una carta; `null` para un comodín. */
export const paloRemigio = (c: CartaRemigio): PaloEspanol | null =>
  esComodinRemigio(c) ? null : (cartaDeId(baseRemigio(c))!.palo as PaloEspanol);

/** Puntos de una carta en la mano al cerrar: su número, las figuras 10 y el comodín 25. */
export function puntosCartaRemigio(c: CartaRemigio): number {
  const n = numeroRemigio(c);
  if (n === 0) return 25;
  return n >= 10 ? 10 : n;
}

/** La carta natural de un palo en un puesto de escalera, sin copia. */
const baseEn = (palo: PaloEspanol, posicion: number): IdCarta =>
  `${palo}-${VALORES_ESCALERA[posicion - 1]!}`;

/** Las cartas iguales a efectos de juego: los cuatro comodines son una sola clase. */
export const claveRemigio = (c: CartaRemigio): string =>
  esComodinRemigio(c) ? 'comodin' : baseRemigio(c);

export const MAXIMO_GRUPO_REMIGIO = 4;

// ── Combinaciones ────────────────────────────────────────────────────────────

export interface GrupoRemigio {
  readonly tipo: 'grupo';
  readonly id: number;
  /** Asiento que la bajó. */
  readonly duenio: number;
  readonly numero: number;
  readonly cartas: readonly CartaRemigio[];
}

export interface EscaleraRemigio {
  readonly tipo: 'escalera';
  readonly id: number;
  readonly duenio: number;
  readonly palo: PaloEspanol;
  /** Puesto del primer hueco; `puestos[i]` ocupa el puesto `desde + i`. */
  readonly desde: number;
  readonly puestos: readonly CartaRemigio[];
}

export type CombinacionRemigio = GrupoRemigio | EscaleraRemigio;

export const cartasDeCombinacion = (c: CombinacionRemigio): readonly CartaRemigio[] =>
  c.tipo === 'grupo' ? c.cartas : c.puestos;

export const hastaRemigio = (e: EscaleraRemigio) => e.desde + e.puestos.length - 1;

/** Palos de las cartas naturales de un grupo. */
const palosDelGrupo = (g: GrupoRemigio) =>
  new Set(g.cartas.flatMap((c) => (esComodinRemigio(c) ? [] : [paloRemigio(c)!])));

/** Una combinación nueva de 3 cartas, tal como se baja. */
export type NuevaCombinacionRemigio =
  | { readonly tipo: 'grupo'; readonly cartas: readonly CartaRemigio[] }
  | {
      readonly tipo: 'escalera';
      readonly palo: PaloEspanol;
      readonly desde: number;
      readonly puestos: readonly CartaRemigio[];
    };

export type JugadaRemigio =
  | { readonly tipo: 'bajar'; readonly combinacion: NuevaCombinacionRemigio }
  | {
      readonly tipo: 'anadir';
      readonly combinacion: number;
      readonly carta: CartaRemigio;
      /** En una escalera, el puesto que ocupa la carta. */
      readonly puesto?: number;
    }
  | { readonly tipo: 'cambiar'; readonly combinacion: number; readonly carta: CartaRemigio };

// ── Generación de jugadas ────────────────────────────────────────────────────

/**
 * Las cartas de la mano por clase, en el orden de la mano, con `preferida` la primera de su
 * clase. Las copias son intercambiables: las jugadas usan siempre la primera de cada clase.
 */
function porClase(
  mano: readonly CartaRemigio[],
  preferida: CartaRemigio | null,
): Map<string, CartaRemigio[]> {
  const clases = new Map<string, CartaRemigio[]>();
  for (const c of mano) {
    const lista = clases.get(claveRemigio(c)) ?? [];
    if (c === preferida) lista.unshift(c);
    else lista.push(c);
    clases.set(claveRemigio(c), lista);
  }
  return clases;
}

const representantes = (mano: readonly CartaRemigio[], preferida: CartaRemigio | null) =>
  [...porClase(mano, preferida).values()].map((l) => l[0]!);

/** Todas las combinaciones de 3 cartas que se pueden bajar con la mano. */
export function bajadasRemigio(
  mano: readonly CartaRemigio[],
  preferida: CartaRemigio | null = null,
): NuevaCombinacionRemigio[] {
  const clases = porClase(mano, preferida);
  const comodin = clases.get('comodin')?.[0] ?? null;
  const natural = (palo: PaloEspanol, posicion: number) =>
    clases.get(baseEn(palo, posicion))?.[0] ?? null;
  const bajadas: NuevaCombinacionRemigio[] = [];

  // Grupos: 3 de palos distintos, o 2 y un comodín.
  for (let p = 1; p <= POSICION_MAXIMA; p++) {
    const disponibles = PALOS_ESPANOLES.flatMap((palo) => {
      const c = natural(palo, p);
      return c ? [c] : [];
    });
    for (let i = 0; i < disponibles.length; i++) {
      for (let j = i + 1; j < disponibles.length; j++) {
        for (let k = j + 1; k < disponibles.length; k++) {
          bajadas.push({
            tipo: 'grupo',
            cartas: [disponibles[i]!, disponibles[j]!, disponibles[k]!],
          });
        }
        if (comodin)
          bajadas.push({ tipo: 'grupo', cartas: [disponibles[i]!, disponibles[j]!, comodin] });
      }
    }
  }

  // Escaleras: 3 puestos seguidos, con un comodín como mucho.
  for (const palo of PALOS_ESPANOLES) {
    for (let desde = 1; desde + 2 <= POSICION_MAXIMA; desde++) {
      const puestos = [desde, desde + 1, desde + 2].map((p) => natural(palo, p));
      if (puestos.every((c) => c !== null)) {
        bajadas.push({ tipo: 'escalera', palo, desde, puestos: puestos as CartaRemigio[] });
      }
      if (comodin === null) continue;
      for (let hueco = 0; hueco < 3; hueco++) {
        if (puestos.some((c, i) => i !== hueco && c === null)) continue;
        bajadas.push({
          tipo: 'escalera',
          palo,
          desde,
          puestos: puestos.map((c, i) => (i === hueco ? comodin : c!)),
        });
      }
    }
  }
  return bajadas;
}

/** Las cartas de la mano que se pueden añadir a las combinaciones dadas. */
export function anadidosRemigio(
  mano: readonly CartaRemigio[],
  combinaciones: readonly CombinacionRemigio[],
  preferida: CartaRemigio | null = null,
): JugadaRemigio[] {
  const cartas = representantes(mano, preferida);
  const jugadas: JugadaRemigio[] = [];
  for (const c of combinaciones) {
    for (const carta of cartas) {
      if (c.tipo === 'grupo') {
        if (c.cartas.length >= MAXIMO_GRUPO_REMIGIO) continue;
        const vale = esComodinRemigio(carta)
          ? true
          : numeroRemigio(carta) === c.numero && !palosDelGrupo(c).has(paloRemigio(carta)!);
        if (vale) jugadas.push({ tipo: 'anadir', combinacion: c.id, carta });
        continue;
      }
      const abajo = c.desde - 1;
      const arriba = hastaRemigio(c) + 1;
      const puestos = esComodinRemigio(carta)
        ? [abajo, arriba]
        : paloRemigio(carta) === c.palo
          ? [posicionRemigio(carta)].filter((p) => p === abajo || p === arriba)
          : [];
      for (const puesto of puestos) {
        if (puesto >= 1 && puesto <= POSICION_MAXIMA) {
          jugadas.push({ tipo: 'anadir', combinacion: c.id, carta, puesto });
        }
      }
    }
  }
  return jugadas;
}

/** Los cambios de comodín posibles: una carta natural de la mano ocupa el puesto de uno. */
export function cambiosRemigio(
  mano: readonly CartaRemigio[],
  combinaciones: readonly CombinacionRemigio[],
  preferida: CartaRemigio | null = null,
): JugadaRemigio[] {
  const cartas = representantes(mano, preferida).filter((c) => !esComodinRemigio(c));
  const jugadas: JugadaRemigio[] = [];
  for (const c of combinaciones) {
    for (const carta of cartas) {
      if (c.tipo === 'grupo') {
        const conComodin = c.cartas.some(esComodinRemigio);
        if (
          conComodin &&
          numeroRemigio(carta) === c.numero &&
          !palosDelGrupo(c).has(paloRemigio(carta)!)
        ) {
          jugadas.push({ tipo: 'cambiar', combinacion: c.id, carta });
        }
        continue;
      }
      if (paloRemigio(carta) !== c.palo) continue;
      const w = c.puestos[posicionRemigio(carta) - c.desde];
      if (w !== undefined && esComodinRemigio(w)) {
        jugadas.push({ tipo: 'cambiar', combinacion: c.id, carta });
      }
    }
  }
  return jugadas;
}

// ── Aplicar jugadas ──────────────────────────────────────────────────────────

/** Cartas de la mano que una jugada pone en la mesa. */
export const cartasQueBajaRemigio = (j: JugadaRemigio): readonly CartaRemigio[] =>
  j.tipo === 'bajar'
    ? j.combinacion.tipo === 'grupo'
      ? j.combinacion.cartas
      : j.combinacion.puestos
    : [j.carta];

export interface TrasJugadaRemigio {
  readonly mano: CartaRemigio[];
  readonly combinaciones: CombinacionRemigio[];
}

/**
 * Aplica una jugada ya legal: saca las cartas de la mano y las pone en la mesa; al cambiar un
 * comodín, el comodín vuelve a la mano. `id` y `duenio` son los de la combinación nueva.
 */
export function aplicarJugadaRemigio(
  mano: readonly CartaRemigio[],
  combinaciones: readonly CombinacionRemigio[],
  jugada: JugadaRemigio,
  nueva: { readonly id: number; readonly duenio: number },
): TrasJugadaRemigio {
  const salen = cartasQueBajaRemigio(jugada);
  const restante = mano.filter((c) => !salen.includes(c));
  if (jugada.tipo === 'bajar') {
    const n = jugada.combinacion;
    const combinacion: CombinacionRemigio =
      n.tipo === 'grupo'
        ? {
            tipo: 'grupo',
            ...nueva,
            numero: numeroRemigio(n.cartas.find((c) => !esComodinRemigio(c))!),
            cartas: [...n.cartas],
          }
        : { tipo: 'escalera', ...nueva, palo: n.palo, desde: n.desde, puestos: [...n.puestos] };
    return { mano: restante, combinaciones: [...combinaciones, combinacion] };
  }
  let recuperado: CartaRemigio | null = null;
  const cambiadas = combinaciones.map((c): CombinacionRemigio => {
    if (c.id !== jugada.combinacion) return c;
    if (jugada.tipo === 'anadir') {
      if (c.tipo === 'grupo') return { ...c, cartas: [...c.cartas, jugada.carta] };
      return jugada.puesto === c.desde - 1
        ? { ...c, desde: c.desde - 1, puestos: [jugada.carta, ...c.puestos] }
        : { ...c, puestos: [...c.puestos, jugada.carta] };
    }
    if (c.tipo === 'grupo') {
      const w = c.cartas.find(esComodinRemigio)!;
      recuperado = w;
      return { ...c, cartas: [...c.cartas.filter((x) => x !== w), jugada.carta] };
    }
    const i = posicionRemigio(jugada.carta) - c.desde;
    recuperado = c.puestos[i]!;
    return { ...c, puestos: c.puestos.map((x, k) => (k === i ? jugada.carta : x)) };
  });
  return {
    mano: recuperado === null ? restante : [...restante, recuperado],
    combinaciones: cambiadas,
  };
}
