import type { IdCarta, PaloFrances } from '../baraja/cartas';
import {
  ganadoraBourre,
  paloBourre,
  rangoBourre,
  type AccionBourre,
  type VistaBourre,
} from '../juegos/bourre';
import type { Agente } from './agente';

const JOTA = 11;
const REY = 13;
const AS = 14;

/**
 * Bazas que espera hacer (spec ia-jugadores): 1 por cada triunfo de la J al As y por cada As de
 * otro palo; 0,5 por cada otro triunfo y por cada K de otro palo.
 */
export function bazasEsperadasBourre(mano: readonly IdCarta[], triunfo: PaloFrances): number {
  let total = 0;
  for (const c of mano) {
    const r = rangoBourre(c);
    if (paloBourre(c) === triunfo) total += r >= JOTA ? 1 : 0.5;
    else if (r === AS) total += 1;
    else if (r === REY) total += 0.5;
  }
  return total;
}

/** Si juega la mano: espera 1,5 bazas o tiene 2 triunfos. */
export function juegaBourre(mano: readonly IdCarta[], triunfo: PaloFrances): boolean {
  const triunfos = mano.filter((c) => paloBourre(c) === triunfo).length;
  return bazasEsperadasBourre(mano, triunfo) >= 1.5 || triunfos >= 2;
}

/** Las cartas de las que se descarta: las que no son triunfo, ni As, ni K (ni la vuelta). */
export function descartesBourre(
  mano: readonly IdCarta[],
  triunfo: PaloFrances,
  vuelta: IdCarta | null,
): IdCarta[] {
  return mano
    .filter((c) => c !== vuelta && paloBourre(c) !== triunfo && rangoBourre(c) < REY)
    .sort((a, b) => rangoBourre(a) - rangoBourre(b));
}

/** La carta que juega entre las legales. */
export function cartaBourre(vista: VistaBourre, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const triunfo = paloBourre(vista.vuelta);
  const fuerza = (c: IdCarta) => (paloBourre(c) === triunfo ? 100 : 0) + rangoBourre(c);
  const masBaja = [...cartas].sort((a, b) => fuerza(a) - fuerza(b))[0]!;
  if (vista.mesa.length === 0) {
    const ases = cartas.filter((c) => paloBourre(c) !== triunfo && rangoBourre(c) === AS);
    if (ases.length > 0) return ases[0]!;
    const triunfos = cartas
      .filter((c) => paloBourre(c) === triunfo)
      .sort((a, b) => fuerza(b) - fuerza(a));
    return triunfos[0] ?? masBaja;
  }
  const ganadoras = cartas
    .filter(
      (c) => ganadoraBourre([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
    )
    .sort((a, b) => fuerza(a) - fuerza(b));
  return ganadoras[0] ?? masBaja;
}

export function decisionBourre(
  vista: VistaBourre,
  acciones: readonly AccionBourre[],
): AccionBourre {
  const mano = vista.miMano ?? [];
  const triunfo = paloBourre(vista.vuelta);
  switch (vista.fase) {
    case 'decidir':
      return juegaBourre(mano, triunfo) ? { tipo: 'jugar' } : { tipo: 'pasar' };
    case 'cambio': {
      const vuelta = vista.asiento === vista.repartidor ? vista.vuelta : null;
      const descarte = descartesBourre(mano, triunfo, vuelta)[0];
      const puede = acciones.some((a) => a.tipo === 'descartar' && a.carta === descarte);
      return descarte !== undefined && puede
        ? { tipo: 'descartar', carta: descarte }
        : { tipo: 'robar' };
    }
    case 'bazas': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugarCarta' ? [a.carta] : []));
      return { tipo: 'jugarCarta', carta: cartaBourre(vista, cartas) };
    }
  }
}

export const iaBourreBasica: Agente<VistaBourre, AccionBourre> = {
  id: 'bourre-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionBourre(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
