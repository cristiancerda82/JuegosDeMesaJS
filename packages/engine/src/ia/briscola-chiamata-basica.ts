import { PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  cartaDeNivel,
  ganadoraBriscolaChiamata,
  NIVEL_MAXIMO_BRISCOLA_CHIAMATA,
  puntosBriscolaChiamata,
  type AccionBriscolaChiamata,
  type VistaBriscolaChiamata,
} from '../juegos/briscola-chiamata';
import { fuerza, paloDe } from '../motor/bazas';
import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';

const puntosDe = (cartas: readonly IdCarta[]) =>
  cartas.reduce((s, c) => s + puntosBriscolaChiamata(c), 0);
const delPalo = (mano: readonly IdCarta[], p: PaloEspanol) => mano.filter((c) => paloDe(c) === p);

/** El palo más largo entre `palos` (si empatan, el de más puntos). */
function paloLargo(mano: readonly IdCarta[], palos: readonly PaloEspanol[]): PaloEspanol {
  return palos.reduce((mejor, p) => {
    const a = delPalo(mano, p);
    const b = delPalo(mano, mejor);
    return a.length > b.length || (a.length === b.length && puntosDe(a) > puntosDe(b)) ? p : mejor;
  });
}

/** Los puntos de sus cartas más 4 por cada carta de su palo más largo. */
export function fuerzaBriscolaChiamata(mano: readonly IdCarta[]): number {
  return puntosDe(mano) + 4 * delPalo(mano, paloLargo(mano, PALOS_ESPANOLES)).length;
}

/**
 * La puja más baja con la que se atreve: el As (nivel 0) con 35 de fuerza y una carta más baja
 * por cada 6 más, hasta el 2 (nivel 9); −1 si no se atreve con ninguna.
 */
export function nivelMaximoBriscolaChiamata(mano: readonly IdCarta[]): number {
  const f = fuerzaBriscolaChiamata(mano);
  return f < 35 ? -1 : Math.min(9, Math.floor((f - 35) / 6));
}

/** El palo que llama: el más largo entre los que no tienen la carta de su puja. */
export function paloLlamadaBriscolaChiamata(mano: readonly IdCarta[], nivel: number): PaloEspanol {
  const valor = cartaDeNivel(nivel);
  const sinElla = PALOS_ESPANOLES.filter((p) => !mano.includes(`${p}-${valor}` as IdCarta));
  return paloLargo(mano, sinElla.length > 0 ? sinElla : PALOS_ESPANOLES);
}

/** Si `a` es de su bando, con lo que este asiento sabe. */
function aliado(vista: VistaBriscolaChiamata, a: Asiento): boolean {
  const yo = vista.asiento!;
  if (a === yo) return true;
  if (yo === vista.llamador) return a === vista.companero;
  if (yo === vista.companero) return a === vista.llamador;
  // Un defensor: hasta que se descubre el compañero, solo sabe que el llamador es rival.
  return vista.descubierto && a !== vista.llamador && a !== vista.companero;
}

/** La carta que juega entre las de su mano. */
export function cartaBriscolaChiamata(
  vista: VistaBriscolaChiamata,
  cartas: readonly IdCarta[],
): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const triunfo = vista.triunfo;
  const esTriunfo = (c: IdCarta) => (paloDe(c) === triunfo ? 1 : 0);
  // De la que menos vale a la que más, guardando los triunfos.
  const baratas = [...cartas].sort(
    (a, b) =>
      esTriunfo(a) - esTriunfo(b) ||
      puntosBriscolaChiamata(a) - puntosBriscolaChiamata(b) ||
      fuerza(a) - fuerza(b),
  );
  if (vista.mesa.length === 0) return baratas[0]!;
  const ganando = ganadoraBriscolaChiamata(vista.mesa, triunfo).asiento;
  if (aliado(vista, ganando)) {
    // La baza es de su bando: carga la que más puntos vale sin echar triunfo.
    const cargas = cartas
      .filter((c) => !esTriunfo(c))
      .sort(
        (a, b) => puntosBriscolaChiamata(b) - puntosBriscolaChiamata(a) || fuerza(a) - fuerza(b),
      );
    return cargas[0] ?? baratas[0]!;
  }
  const enJuego = puntosDe(vista.mesa.map((j) => j.carta));
  if (enJuego >= 10) {
    const ganadoras = cartas
      .filter(
        (c) =>
          ganadoraBriscolaChiamata([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento ===
          yo,
      )
      .sort((a, b) => esTriunfo(a) - esTriunfo(b) || fuerza(a) - fuerza(b));
    if (ganadoras.length > 0) return ganadoras[0]!;
  }
  return baratas[0]!;
}

export function decisionBriscolaChiamata(
  vista: VistaBriscolaChiamata,
  acciones: readonly AccionBriscolaChiamata[],
): AccionBriscolaChiamata {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'subasta': {
      const siguiente = (vista.nivel ?? -1) + 1;
      if (!acciones.some((a) => a.tipo === 'pasar')) return acciones[0]!;
      return siguiente <=
        Math.min(nivelMaximoBriscolaChiamata(mano), NIVEL_MAXIMO_BRISCOLA_CHIAMATA)
        ? { tipo: 'pujar', nivel: siguiente }
        : { tipo: 'pasar' };
    }
    case 'llamada':
      return { tipo: 'llamar', palo: paloLlamadaBriscolaChiamata(mano, vista.nivel!) };
    case 'bazas': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugarCarta' ? [a.carta] : []));
      return { tipo: 'jugarCarta', carta: cartaBriscolaChiamata(vista, cartas) };
    }
  }
}

export const iaBriscolaChiamataBasica: Agente<VistaBriscolaChiamata, AccionBriscolaChiamata> = {
  id: 'briscola-chiamata-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionBriscolaChiamata(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
