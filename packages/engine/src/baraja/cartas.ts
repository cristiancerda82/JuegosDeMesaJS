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

/** Identificador serializable y estable de una carta, p. ej. "oros-1", "picas-13" o "comodin-1". */
export type IdCarta = `${Palo}-${number}` | IdComodin;

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

/** Reconstruye la carta de un identificador; `null` si el identificador no es válido. */
export function cartaDeId(id: string): Carta | null {
  const separador = id.lastIndexOf('-');
  const palo = id.slice(0, separador) as Palo;
  const textoValor = id.slice(separador + 1);
  if (separador < 0 || !TODOS_LOS_PALOS.includes(palo) || !/^\d+$/.test(textoValor)) return null;
  const valor = Number(textoValor);
  const maximo = (PALOS_FRANCESES as readonly Palo[]).includes(palo) ? 13 : 12;
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

export function colorDe(palo: PaloFrances): 'rojo' | 'negro' {
  return palo === 'corazones' || palo === 'diamantes' ? 'rojo' : 'negro';
}
