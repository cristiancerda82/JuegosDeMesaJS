import { FACTOR_PAUSAS } from '../ajustes';

/**
 * Velocidad de las jugadas (spec mesa-cliente, «Velocidad de las jugadas»; design, decisión 7):
 * un único factor que multiplica las pausas de la IA y las de fin de baza o de jugada.
 */
export type Velocidad = 'rapida' | 'normal' | 'pausada';

export const VELOCIDADES: readonly Velocidad[] = ['rapida', 'normal', 'pausada'];

export const VELOCIDAD_POR_DEFECTO: Velocidad = 'normal';

export const CLAVE_VELOCIDAD = 'juegos-de-mesa/velocidad';

/** Rápida es el ritmo de antes; Normal, el doble; Pausada, el triple. */
const FACTOR: Readonly<Record<Velocidad, number>> = { rapida: 1, normal: 2, pausada: 3 };

/** La velocidad guardada, o Normal si no hay o no es válida. */
export function leerVelocidad(texto: string | null): Velocidad {
  return (VELOCIDADES as readonly (string | null)[]).includes(texto)
    ? (texto as Velocidad)
    : VELOCIDAD_POR_DEFECTO;
}

/** Factor efectivo de las pausas: el de la velocidad por el de `?rapido` (pruebas). */
export function factorPausas(velocidad: Velocidad, base: number = FACTOR_PAUSAS): number {
  return FACTOR[velocidad] * base;
}
