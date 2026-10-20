import type { IdCarta, PaloEspanol } from '../baraja/cartas';
import type { AccionJulepe, VistaJulepe } from '../juegos/julepe';
import { cartaGanadora, fuerza, paloDe, valorDe } from '../motor/bazas';
import type { Agente } from './agente';
import { masBarata } from './bazas-heuristica';

/**
 * IA básica del Julepe: juega la mano si espera hacer al menos dos bazas, descarta lo que no
 * gana y gana cada baza que puede con la carta más barata. Es determinista: no usa el azar.
 */
export const iaJulepeBasica: Agente<VistaJulepe, AccionJulepe> = {
  id: 'julepe-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

/**
 * Bazas esperadas (antes de descartar) desde las que se juega la mano: el descarte cambia las
 * cartas malas, así que con una baza casi segura ya se espera llegar a dos.
 */
export const BAZAS_PARA_JUGAR = 1;

const AS = 1;
const TRES = 3;

/** Las cartas que se guardan al descartar: triunfos, Ases y Treses. */
const buena = (carta: IdCarta, triunfo: PaloEspanol) =>
  paloDe(carta) === triunfo || valorDe(carta) === AS || valorDe(carta) === TRES;

/**
 * Bazas que espera hacer con su mano: cada triunfo y cada As o Tres cuenta según lo probable que
 * sea que gane, y con más de 2 rivales en la mesa todo vale un 10 % menos por rival de más.
 */
export function bazasEsperadas(
  mano: readonly IdCarta[],
  triunfo: PaloEspanol,
  rivales: number,
): number {
  let bazas = 0;
  for (const c of mano) {
    const v = valorDe(c);
    if (paloDe(c) === triunfo) {
      bazas += v === AS || v === TRES ? 0.95 : v === 12 ? 0.75 : v === 11 || v === 10 ? 0.55 : 0.35;
    } else if (v === AS) {
      bazas += 0.6;
    } else if (v === TRES) {
      bazas += 0.35;
    }
  }
  return bazas * Math.max(0.5, 1 - 0.1 * Math.max(0, rivales - 2));
}

function elegir(vista: VistaJulepe, acciones: readonly AccionJulepe[]): AccionJulepe {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'decidir': {
      if (!acciones.some((a) => a.tipo === 'pasar')) return { tipo: 'jugar' };
      const rivales = vista.eliminados.filter((x) => !x).length - 1;
      return bazasEsperadas(mano, vista.triunfo, rivales) >= BAZAS_PARA_JUGAR
        ? { tipo: 'jugar' }
        : { tipo: 'pasar' };
    }
    case 'descartar': {
      // Las malas, de la más baja a la más alta, tantas como deje el mazo.
      const malas = mano
        .filter((c) => !buena(c, vista.triunfo))
        .sort((a, b) => fuerza(a) - fuerza(b))
        .slice(0, vista.mazo);
      const clave = [...malas].sort().join();
      return (
        acciones.find((a) => a.tipo === 'descartar' && [...a.cartas].sort().join() === clave) ??
        acciones[0]!
      );
    }
    case 'jugar': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'carta' ? [a.carta] : []));
      return { tipo: 'carta', carta: cartaParaJugar(vista, cartas) };
    }
  }
}

function cartaParaJugar(vista: VistaJulepe, cartas: readonly IdCarta[]): IdCarta {
  const triunfo = vista.triunfo;
  if (vista.mesa.length === 0) {
    const triunfos = cartas.filter((c) => paloDe(c) === triunfo);
    // Con muchos triunfos, se arrastra con el más alto; si no, se sale con un As o Tres.
    if (triunfos.length >= 3) return [...triunfos].sort((a, b) => fuerza(b) - fuerza(a))[0]!;
    const altas = cartas.filter(
      (c) => paloDe(c) !== triunfo && (valorDe(c) === AS || valorDe(c) === TRES),
    );
    if (altas.length > 0) return [...altas].sort((a, b) => fuerza(b) - fuerza(a))[0]!;
    return masBarata(triunfo, cartas);
  }
  // Cada baza cobra: se gana con la carta más barata que gane, y si no, se entrega la peor.
  const asiento = vista.asiento!;
  const gana = (c: IdCarta) =>
    cartaGanadora([...vista.mesa, { asiento, carta: c }], triunfo).asiento === asiento;
  const ganadoras = cartas.filter(gana);
  return masBarata(triunfo, ganadoras.length > 0 ? ganadoras : cartas);
}
