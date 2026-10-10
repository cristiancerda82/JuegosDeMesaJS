import { error, ok, type Resultado } from '../resultado';
import type { Asiento, Juego, Registro } from './contrato';
import { igualesJSON } from './json';

/**
 * Aplica una acción si es legal para ese asiento. Única puerta de entrada de acciones:
 * la legalidad se decide comparando con `accionesLegales`, nunca dentro de cada juego.
 */
export function aplicar<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  estado: E,
  asiento: Asiento,
  accion: A,
): Resultado<E> {
  if (!Number.isInteger(asiento) || asiento < 0 || asiento >= juego.asientos(estado)) {
    return error(`Asiento inexistente: ${asiento}`);
  }
  if (juego.resultado(estado) !== null) {
    return error('La partida ya terminó');
  }
  const legales = juego.accionesLegales(estado, asiento);
  if (!legales.some((legal) => igualesJSON(legal, accion))) {
    return error(`Acción ilegal para el asiento ${asiento}: ${JSON.stringify(accion)}`);
  }
  return ok(juego.transicion(estado, asiento, accion));
}

/** Reconstruye una partida desde su configuración, semilla e historial de jugadas. */
export function repetir<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  registro: Registro<C, A>,
): Resultado<E> {
  const inicio = juego.crear(registro.config, registro.semilla);
  if (!inicio.ok) return inicio;
  let estado = inicio.valor;
  for (const [i, jugada] of registro.jugadas.entries()) {
    const r = aplicar(juego, estado, jugada.asiento, jugada.accion);
    if (!r.ok) return error(`La jugada ${i + 1} no se pudo repetir: ${r.error}`);
    estado = r.valor;
  }
  return ok(estado);
}
