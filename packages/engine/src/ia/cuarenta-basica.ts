import type { IdCarta } from '../baraja/cartas';
import {
  capturasCuarenta,
  escaleraCuarenta,
  rangoCuarenta,
  valorCuarenta,
  type AccionCuarenta,
  type VistaCuarenta,
} from '../juegos/cuarenta';
import type { Agente } from './agente';

/**
 * IA básica del Cuarenta: puntúa cada jugada legal y elige la mejor (la primera, si empatan).
 * Es determinista y solo usa su vista: la mesa, su mano y las cartas jugadas en el reparto.
 */
export const iaCuarentaBasica: Agente<VistaCuarenta, AccionCuarenta> = {
  id: 'cuarenta-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    let mejor = acciones[0]!;
    let mejorValor = -Infinity;
    for (const accion of acciones) {
      const valor = valorarCuarenta(vista, accion);
      if (valor > mejorValor) {
        mejor = accion;
        mejorValor = valor;
      }
    }
    return { accion: mejor, azar };
  },
};

const CAIDA = 100;
const LIMPIA = 80;
const CARTA = 5;
/** Penalización por dejar una carta que el siguiente podría llevarse con caída. */
const RIESGO_CAIDA = 40;
/** Penalización por dejar la mesa a tiro de limpia. */
const RIESGO_LIMPIA = 30;
/** El valor más alto que suma una carta: con la mesa en 7 o menos, una sola podría limpiarla. */
const MAXIMO = 7;

/** Lo que vale llevarse `captura` (sin la escalera) con `carta`. */
function valorCaptura(vista: VistaCuarenta, carta: IdCarta, captura: readonly IdCarta[]): number {
  const resto = vista.mesa.filter((c) => !captura.includes(c));
  const escalera = escaleraCuarenta(resto, carta);
  let valor = CARTA * (1 + captura.length + escalera.length);
  if (captura.length === 1 && captura[0] === vista.caible) valor += CAIDA;
  if (resto.length === escalera.length) valor += LIMPIA;
  return valor;
}

/** La valoración de una jugada (spec ia-jugadores). */
export function valorarCuarenta(vista: VistaCuarenta, accion: AccionCuarenta): number {
  if (accion.captura.length > 0) return valorCaptura(vista, accion.carta, accion.captura);
  // Dejarla en la mesa: lo que se pierde de capturar con ella y lo que se arriesga.
  let valor = -Math.max(
    0,
    ...capturasCuarenta(vista.mesa, accion.carta).map((s) => valorCaptura(vista, accion.carta, s)),
  );
  const rango = rangoCuarenta(accion.carta);
  // Las jugadas del reparto que siguen en la mesa se cuentan una vez.
  const vistas = new Set([...(vista.miMano ?? []), ...vista.mesa, ...vista.jugadasReparto.flat()]);
  if ([...vistas].filter((c) => rangoCuarenta(c) === rango).length < 4) valor -= RIESGO_CAIDA;
  const mesa = [...vista.mesa, accion.carta];
  const valores = mesa.map(valorCuarenta);
  const suma = valores.reduce<number>((s, v) => s + (v ?? Infinity), 0);
  if (mesa.length === 1 || suma <= MAXIMO) valor -= RIESGO_LIMPIA;
  return valor;
}
