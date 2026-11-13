import {
  cartaDeId,
  PALOS_ESPANOLES,
  PALOS_FRANCESES,
  type Asiento,
  type IdCarta,
  type Palo,
} from '@juegos/engine';
import { expect } from 'vitest';
import type { IdJuego } from '../../sesion/juegos';
import type { Ejemplo, EjemploAntesDespues, EjemploBaza, EjemplosJuego } from '../tipos';

/**
 * Ayudas de los tests que comprueban los ejemplos de las guías con el motor (design de
 * ejemplos-guias, decisión 3). Cada test de familia pide sus ejemplos con `ejemplo`, que los
 * apunta como comprobados; al final, `sinComprobar` lista los que ningún test ha mirado.
 */
export function verificador(familia: Partial<Record<IdJuego, EjemplosJuego>>) {
  const comprobados = new Set<string>();
  return {
    ejemplo<T extends Ejemplo['tipo']>(
      juego: IdJuego,
      clave: string,
      tipo: T,
    ): Extract<Ejemplo, { tipo: T }> {
      const e = familia[juego]?.[clave];
      expect(e, `${juego}.${clave}`).toBeDefined();
      expect(e!.tipo, `${juego}.${clave}`).toBe(tipo);
      comprobados.add(`${juego}.${clave}`);
      return e as Extract<Ejemplo, { tipo: T }>;
    },
    sinComprobar(): string[] {
      return Object.entries(familia)
        .flatMap(([juego, ejemplos]) => Object.keys(ejemplos ?? {}).map((c) => `${juego}.${c}`))
        .filter((k) => !comprobados.has(k))
        .sort();
    },
  };
}

/** Las cartas de una baza como las ve el motor: el asiento es el orden de juego. */
export const mesaDe = (e: EjemploBaza) =>
  e.jugadas.map((j, i) => ({ asiento: i as Asiento, carta: j.id }));

const PALOS: readonly string[] = [...PALOS_ESPANOLES, ...PALOS_FRANCESES];

/** El palo de triunfo de una baza (dado como palo o como la carta de muestra), o `null`. */
export function triunfoDe(e: EjemploBaza): Palo | null {
  if (e.triunfo === undefined) return null;
  return PALOS.includes(e.triunfo) ? (e.triunfo as Palo) : cartaDeId(e.triunfo)!.palo;
}

/**
 * El movimiento de un «antes y después»: las cartas resaltadas, la carta sobre la que quedan
 * después (o `undefined` si van a una zona vacía) y la zona de destino.
 */
export function movimiento(e: EjemploAntesDespues) {
  const primera = e.resaltadas[0]!;
  const zona = e.despues.find((z) => z.cartas.includes(primera));
  expect(zona, `${primera} está después`).toBeDefined();
  const i = zona!.cartas.indexOf(primera);
  expect(zona!.cartas.slice(i, i + e.resaltadas.length)).toEqual(e.resaltadas);
  const sobre = i > 0 ? (zona!.cartas[i - 1] ?? undefined) : undefined;
  return { cartas: e.resaltadas as readonly IdCarta[], sobre, zona: zona!.nombre };
}
