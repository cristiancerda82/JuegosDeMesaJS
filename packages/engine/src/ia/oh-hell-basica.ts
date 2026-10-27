import type { IdCarta } from '../baraja/cartas';
import {
  ganadoraOhHell,
  paloOhHell,
  rangoOhHell,
  type AccionOhHell,
  type VistaOhHell,
} from '../juegos/oh-hell';
import type { Agente } from './agente';

const AS = 14;
const REY = 13;
const DAMA = 12;
/** Con tantos triunfos, los bajos también cuentan algo. */
const TRIUNFOS_LARGOS = 4;
/** Con más jugadores, un K acompañado ya no cuenta. */
const JUGADORES_PARA_REYES = 4;

/** Las bazas que espera hacer con su mano. */
export function bazasEsperadasOhHell(vista: VistaOhHell): number {
  const mano = vista.miMano ?? [];
  const triunfo = vista.triunfo;
  const triunfos = mano.filter((c) => paloOhHell(c) === triunfo);
  let esperadas = 0;
  for (const c of mano) {
    const r = rangoOhHell(c);
    if (paloOhHell(c) === triunfo) {
      if (r >= DAMA) esperadas += 1;
      else if (triunfos.length >= TRIUNFOS_LARGOS) esperadas += 0.5;
    } else if (r === AS) {
      esperadas += 1;
    } else if (
      r === REY &&
      vista.config.jugadores <= JUGADORES_PARA_REYES &&
      mano.some((x) => x !== c && paloOhHell(x) === paloOhHell(c))
    ) {
      esperadas += 0.5;
    }
  }
  return esperadas;
}

/** La apuesta: las bazas esperadas redondeadas, o la más cercana permitida. */
export function apuestaOhHell(vista: VistaOhHell, permitidas: readonly number[]): number {
  const esperadas = Math.min(bazasEsperadasOhHell(vista), vista.cartasMano);
  const redondeo = Math.round(esperadas);
  if (permitidas.includes(redondeo)) return redondeo;
  // Hacia el lado al que quedaba más cerca.
  const lado = esperadas >= redondeo ? 1 : -1;
  return [redondeo + lado, redondeo - lado].find((b) => permitidas.includes(b)) ?? permitidas[0]!;
}

/** Coste de soltar una carta: su rango, y los triunfos por encima de los demás. */
const costeEn = (triunfo: string) => (c: IdCarta) =>
  rangoOhHell(c) + (paloOhHell(c) === triunfo ? 100 : 0);

/** La carta de una baza, entre las legales. */
export function cartaOhHell(vista: VistaOhHell, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const coste = costeEn(vista.triunfo);
  const porCoste = [...cartas].sort((a, b) => coste(a) - coste(b));
  const faltan = (vista.apuestas[yo] ?? 0) - (vista.bazas[yo] ?? 0);
  const mesa = vista.mesa;

  if (mesa.length === 0) return faltan > 0 ? porCoste.at(-1)! : porCoste[0]!;

  const ganan = porCoste.filter(
    (c) => ganadoraOhHell([...mesa, { asiento: yo, carta: c }], vista.triunfo).asiento === yo,
  );
  if (faltan > 0) return ganan[0] ?? porCoste[0]!;
  const noGanan = porCoste.filter((c) => !ganan.includes(c));
  return noGanan.at(-1) ?? porCoste[0]!;
}

/**
 * IA básica del Oh Hell (spec ia-jugadores): apuesta las bazas que espera con sus cartas altas y
 * juega para hacer las que le faltan o para no hacer más. Es determinista: no usa el azar que
 * recibe.
 */
export const iaOhHellBasica: Agente<VistaOhHell, AccionOhHell> = {
  id: 'oh-hell-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'apostar') {
      const permitidas = acciones.flatMap((a) => (a.tipo === 'apostar' ? [a.bazas] : []));
      return { accion: { tipo: 'apostar', bazas: apuestaOhHell(vista, permitidas) }, azar };
    }
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    return { accion: { tipo: 'jugar', carta: cartaOhHell(vista, cartas) }, azar };
  },
};
