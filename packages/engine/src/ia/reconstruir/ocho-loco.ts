import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  esOcho,
  numeroOchoLoco,
  ochoLoco,
  paloOchoLoco,
  puntosManoOchoLoco,
  type FaltaOchoLoco,
  type AccionOchoLoco,
  type ConfigOchoLoco,
  type EstadoOchoLoco,
  type VistaOchoLoco,
} from '../../juegos/ocho-loco';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/** La carta pudo estar en la mano de quien robó con esta falta: ni del palo, ni del número, ni un 8. */
const admite = (f: FaltaOchoLoco, c: IdCarta) =>
  !esOcho(c) && paloOchoLoco(c) !== f.palo && numeroOchoLoco(c) !== f.numero;

/**
 * Las manos ajenas y el mazo, al azar entre las cartas que no se ven. Quien robó en esta mano no
 * tenía entonces ni el palo, ni el número, ni ochos: todas sus cartas menos la robada después
 * (la última vez que robó) se eligen entre las que lo cumplen. Si no alcanzan, se reparte sin
 * esa restricción.
 */
function repartirOcultas(vista: VistaOchoLoco, cartas: readonly IdCarta[]) {
  const pendientes = [...cartas];
  const manos: (IdCarta[] | null)[] = vista.cartasEnMano.map((_, a) =>
    a === vista.asiento && vista.miMano ? [...vista.miMano] : null,
  );
  // Primero, las cartas que tenía cada uno al robar.
  const fijas: IdCarta[][] = vista.cartasEnMano.map(() => []);
  for (let a = 0; a < vista.cartasEnMano.length; a++) {
    const falta = vista.faltas[a];
    if (manos[a] !== null || !falta) continue;
    const cuantas = vista.cartasEnMano[a]! - 1;
    for (let i = 0; i < pendientes.length && fijas[a]!.length < cuantas; i++) {
      if (admite(falta, pendientes[i]!)) fijas[a]!.push(...pendientes.splice(i--, 1));
    }
    if (fijas[a]!.length < cuantas) return null;
  }
  const resto = (a: number) => vista.cartasEnMano[a]! - fijas[a]!.length;
  const manosFinal = manos.map((m, a) => m ?? [...fijas[a]!, ...pendientes.splice(0, resto(a))]);
  return { manos: manosFinal, mazo: pendientes };
}

/** Un estado de Ocho loco coherente con la vista: las manos ajenas y el mazo, al azar. */
export function reconstruirOchoLoco(vista: VistaOchoLoco, azar: EstadoAzar): EstadoOchoLoco {
  const { cartas } = barajar(
    cartasFuera(crearBaraja('francesa52'), vista.miMano ?? [], vista.descarte),
    azar,
  );
  const sinFaltas = { ...vista, faltas: vista.faltas.map(() => null) };
  const { manos, mazo } = repartirOcultas(vista, cartas) ?? repartirOcultas(sinFaltas, cartas)!;
  const turno = vista.turno ?? 0;
  // La carta que robó otro jugador en este turno es una de su mano: la última, que es libre.
  const robada = !vista.robe
    ? null
    : turno === vista.asiento
      ? vista.robada
      : manos[turno]!.at(-1)!;
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    mazo,
    descarte: [...vista.descarte],
    palo: vista.palo,
    turno,
    robada,
    pasesSeguidos: vista.pasesSeguidos,
    ultimas: [...vista.ultimas],
    faltas: [...vista.faltas],
    resultadosManos: [...vista.resultadosManos],
    totales: [...vista.totales],
  };
}

export const SIMULABLE_OCHO_LOCO: Simulable<
  ConfigOchoLoco,
  EstadoOchoLoco,
  AccionOchoLoco,
  VistaOchoLoco
> = {
  juego: ochoLoco,
  reconstruir: reconstruirOchoLoco,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    // Lo que gana cada uno menos lo que le quedó en la mano (sin cerrar, solo lo que le queda).
    const puntos = cerrada
      ? cerrada.ganados.map((g, a) => g - cerrada.puntosEnMano[a]!)
      : final.manos.map((m) => -puntosManoOchoLoco(m));
    const otros = puntos.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return puntos[asiento]! - media + bonoPartida(ochoLoco.resultado(final), asiento);
  },
  reconstrucciones: 60,
  presupuesto: 400,
};
