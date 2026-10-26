import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_DURAK,
  durak,
  type AccionDurak,
  type ConfigDurak,
  type EstadoDurak,
  type VistaDurak,
} from '../../juegos/durak';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/**
 * Un estado de Durak coherente con la vista. Las cartas que cada uno se llevó de la mesa (y el
 * triunfo robado) siguen en su mano; el resto de las manos ajenas y el mazo salen al azar de las
 * que no se ven, con la carta del triunfo al final del mazo mientras quede.
 */
export function reconstruirDurak(vista: VistaDurak, azar: EstadoAzar): EstadoDurak {
  const conocidas = vista.conocidas.map((c, a) => (a === vista.asiento ? [] : c));
  const ocultas = new Ocultas(
    cartasFuera(
      BARAJA_DURAK,
      vista.miMano ?? [],
      vista.mesa.flatMap((p) => (p.defensa === null ? [p.ataque] : [p.ataque, p.defensa])),
      vista.descarte,
      ...conocidas,
      [vista.cartaTriunfo],
    ),
    azar,
  );
  const manos = vista.cartasEnMano.map((n, a): IdCarta[] =>
    a === vista.asiento && vista.miMano
      ? [...vista.miMano]
      : [...conocidas[a]!, ...ocultas.tomar(n - conocidas[a]!.length)],
  );
  const mazo = vista.mazo > 0 ? [...ocultas.tomar(vista.mazo - 1), vista.cartaTriunfo] : [];
  return {
    config: vista.config,
    azar,
    manos,
    mazo,
    triunfo: vista.triunfo,
    cartaTriunfo: vista.cartaTriunfo,
    mesa: [...vista.mesa],
    descarte: [...vista.descarte],
    atacante: vista.atacante,
    defensor: vista.defensor,
    turno: vista.turno ?? vista.atacante,
    pasaron: [...vista.pasaron],
    conocidas: vista.conocidas.map((c) => [...c]),
    salidos: [...vista.salidos],
    ultimaAccion: vista.ultimaAccion,
  };
}

/** Salir antes de que acabe la partida vale mucho, aunque menos que ganarla. */
const SALIR = 500;

export const SIMULABLE_DURAK: Simulable<ConfigDurak, EstadoDurak, AccionDurak, VistaDurak> = {
  juego: durak,
  reconstruir: reconstruirDurak,
  // Una partida es una sola mano: se simula hasta el horizonte o el final.
  manoTerminada: () => false,
  valorar(_inicio, final, asiento) {
    const fin = durak.resultado(final);
    if (fin) return bonoPartida(fin, asiento);
    if (final.salidos.includes(asiento)) return SALIR;
    const otros = final.manos
      .map((m, a) => ({ m, a }))
      .filter(({ a }) => a !== asiento && !final.salidos.includes(a))
      .map(({ m }) => m.length);
    const media = otros.reduce((s, n) => s + n, 0) / Math.max(1, otros.length);
    const triunfos = final.manos[asiento]!.filter((c) => c.startsWith(final.triunfo)).length;
    return media - final.manos[asiento]!.length + 0.5 * triunfos;
  },
  reconstrucciones: 20,
  presupuesto: 100,
  horizonte: 30,
};
