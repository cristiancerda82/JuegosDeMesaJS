import { Generador, type EstadoAzar } from '../baraja/azar';

/** Acción elegida por un agente y el estado de su generador después de decidir. */
export interface Decision<Accion> {
  readonly accion: Accion;
  readonly azar: EstadoAzar;
}

/**
 * Jugador automático. Decide solo con la vista de su asiento y la lista de acciones legales,
 * nunca con el estado completo. Si usa azar, lo toma de su propio generador, así que la misma
 * vista con el mismo `azar` da siempre la misma decisión.
 */
export interface Agente<Vista, Accion> {
  readonly id: string;
  /** `acciones` no puede estar vacía: solo se le pide decidir a quien tiene el turno. */
  decidir(vista: Vista, acciones: readonly Accion[], azar: EstadoAzar): Decision<Accion>;
}

/** Elige una acción legal al azar. Sirve para tests y como rival de referencia. */
export const agenteAleatorio: Agente<unknown, never> = {
  id: 'aleatorio',
  decidir(_vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const g = new Generador(azar);
    const accion = acciones[g.enteroHasta(acciones.length)]!;
    return { accion, azar: g.estado() };
  },
};

/** El agente aleatorio con los tipos de un juego concreto. */
export function aleatorio<Vista, Accion>(): Agente<Vista, Accion> {
  return agenteAleatorio as unknown as Agente<Vista, Accion>;
}
