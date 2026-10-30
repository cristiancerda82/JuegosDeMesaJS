export const PALOS_ESPANOLES = ['oros', 'copas', 'espadas', 'bastos'] as const;
export const PALOS_FRANCESES = ['picas', 'corazones', 'diamantes', 'treboles'] as const;

export type PaloEspanol = (typeof PALOS_ESPANOLES)[number];
export type PaloFrances = (typeof PALOS_FRANCESES)[number];
export type Palo = PaloEspanol | PaloFrances;

/**
 * Valor numérico de la carta.
 * Española: 1–12 (10 sota, 11 caballo, 12 rey). Francesa: 1–13 (1 as, 11 J, 12 Q, 13 K).
 */
export interface Carta {
  readonly palo: Palo;
  readonly valor: number;
}

/** Los dos comodines: no tienen palo ni valor. */
export const COMODINES = ['comodin-1', 'comodin-2'] as const;
export type IdComodin = (typeof COMODINES)[number];

/** Los 21 triunfos y la Excusa de la baraja de Tarot: no tienen palo francés. */
export type IdTriunfoTarot = `triunfo-${number}`;
export const EXCUSA = 'excusa';

/**
 * Identificador serializable y estable de una carta, p. ej. "oros-1", "picas-13", "comodin-1",
 * "triunfo-21" o "excusa".
 */
export type IdCarta = `${Palo}-${number}` | IdComodin | IdTriunfoTarot | typeof EXCUSA;

export function esComodin(id: string): id is IdComodin {
  return (COMODINES as readonly string[]).includes(id);
}

export type TipoBaraja = 'espanola40' | 'espanola48' | 'francesa52';

const VALORES: Record<TipoBaraja, readonly number[]> = {
  espanola40: [1, 2, 3, 4, 5, 6, 7, 10, 11, 12],
  espanola48: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  francesa52: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
};

const PALOS: Record<TipoBaraja, readonly Palo[]> = {
  espanola40: PALOS_ESPANOLES,
  espanola48: PALOS_ESPANOLES,
  francesa52: PALOS_FRANCESES,
};

const TODOS_LOS_PALOS: readonly Palo[] = [...PALOS_ESPANOLES, ...PALOS_FRANCESES];

export function idCarta(carta: Carta): IdCarta {
  return `${carta.palo}-${carta.valor}`;
}

/**
 * Cartas ya leídas por identificador. Solo guarda las válidas, que son un conjunto finito, y la
 * IA las lee a millares en cada simulación.
 */
const LEIDAS = new Map<string, Carta>();

/** Reconstruye la carta de un identificador; `null` si el identificador no es válido. */
export function cartaDeId(id: string): Carta | null {
  const leida = LEIDAS.get(id);
  if (leida) return leida;
  const carta = leerCarta(id);
  if (carta) LEIDAS.set(id, Object.freeze(carta));
  return carta;
}

function leerCarta(id: string): Carta | null {
  const separador = id.lastIndexOf('-');
  const palo = id.slice(0, separador) as Palo;
  const textoValor = id.slice(separador + 1);
  if (separador < 0 || !TODOS_LOS_PALOS.includes(palo) || !/^\d+$/.test(textoValor)) return null;
  const valor = Number(textoValor);
  // En los palos franceses, el 14 es el Caballo de la baraja de Tarot.
  const maximo = (PALOS_FRANCESES as readonly Palo[]).includes(palo) ? 14 : 12;
  if (valor < 1 || valor > maximo) return null;
  return { palo, valor };
}

/**
 * Crea una baraja completa en orden canónico (palo por palo, valores ascendentes).
 * Las españolas pueden llevar los 2 comodines al final.
 */
export function crearBaraja(
  tipo: TipoBaraja,
  opciones: { readonly comodines?: boolean } = {},
): IdCarta[] {
  const cartas: IdCarta[] = PALOS[tipo].flatMap((palo) =>
    VALORES[tipo].map((valor) => idCarta({ palo, valor })),
  );
  if (opciones.comodines) {
    if (tipo === 'francesa52') throw new Error('Los comodines solo se usan con la baraja española');
    cartas.push(...COMODINES);
  }
  return cartas;
}

/** Las cartas de `baraja` que no están en ninguno de los grupos, en el orden de la baraja. */
export function cartasFuera(
  baraja: readonly IdCarta[],
  ...grupos: readonly (readonly IdCarta[])[]
): IdCarta[] {
  const dentro = new Set(grupos.flat());
  return baraja.filter((c) => !dentro.has(c));
}

// ── Baraja de Tarot ──────────────────────────────────────────────────────────

export const esExcusa = (id: string): id is typeof EXCUSA => id === EXCUSA;

/** Es uno de los 21 triunfos del Tarot (la Excusa no cuenta). */
export function esTriunfoTarot(id: string): id is IdTriunfoTarot {
  const m = /^triunfo-(\d+)$/.exec(id);
  return m !== null && Number(m[1]) >= 1 && Number(m[1]) <= 21;
}

/** El número de un triunfo del Tarot. */
export const numeroTriunfo = (id: IdTriunfoTarot) => Number(id.slice('triunfo-'.length));

/**
 * La baraja de Tarot de 78 cartas: los cuatro palos franceses del 1 al 10 con Sota (11),
 * Dama (12), Rey (13) y Caballo (14); los triunfos del 1 al 21, y la Excusa.
 */
export const BARAJA_TAROT: readonly IdCarta[] = [
  ...PALOS_FRANCESES.flatMap((palo) =>
    Array.from({ length: 14 }, (_, i) => idCarta({ palo, valor: i + 1 })),
  ),
  ...Array.from({ length: 21 }, (_, i): IdTriunfoTarot => `triunfo-${i + 1}`),
  EXCUSA,
];

export function colorDe(palo: PaloFrances): 'rojo' | 'negro' {
  return palo === 'corazones' || palo === 'diamantes' ? 'rojo' : 'negro';
}
