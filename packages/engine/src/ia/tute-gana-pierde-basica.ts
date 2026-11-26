import type { IdCarta } from '../baraja/cartas';
import {
  parejaEnBaza,
  type AccionTuteGanaPierde,
  type VistaTuteGanaPierde,
} from '../juegos/tute-gana-pierde';
import { cartaGanadora, fuerza, paloDe, puntosDe, valorDe } from '../motor/bazas';
import type { Agente } from './agente';

const REY = 12;
/** Tantos de las cartas de la mano a partir de los que, al empezar, va a por el máximo. */
const MANO_FUERTE = 55;

export type ObjetivoGanaPierde = 'minimo' | 'maximo';

/**
 * A por el mínimo o a por el máximo: al empezar la mano, según los tantos que promete la mano;
 * después, hacia el extremo que tiene más cerca (en empate, el mínimo).
 */
export function objetivoGanaPierde(vista: VistaTuteGanaPierde): ObjetivoGanaPierde {
  const yo = vista.asiento!;
  const mios = vista.tantos[yo]!;
  const otros = vista.tantos.filter((_, a) => a !== yo);
  if (vista.tantos.every((t) => t === 0)) {
    const enMano = (vista.miMano ?? []).reduce((s, c) => s + puntosDe(c), 0);
    return enMano >= MANO_FUERTE ? 'maximo' : 'minimo';
  }
  const hastaMinimo = mios - Math.min(...otros);
  const hastaMaximo = Math.max(...otros) - mios;
  if (hastaMinimo <= 0) return 'minimo';
  if (hastaMaximo < 0) return 'maximo';
  return hastaMaximo < hastaMinimo ? 'maximo' : 'minimo';
}

/** Elige el mejor según una lista de criterios: el menor del primero, luego del segundo… */
function mejor(cartas: readonly IdCarta[], ...criterios: ((c: IdCarta) => number)[]): IdCarta {
  return [...cartas].sort((a, b) => {
    for (const f of criterios) {
      const d = f(a) - f(b);
      if (d !== 0) return d;
    }
    return a < b ? -1 : 1;
  })[0]!;
}

/** Carta con la que sale: al mínimo, la más baja de su palo más corto, sin Reyes; al máximo, la más alta del más largo. */
function salida(mano: readonly IdCarta[], objetivo: ObjetivoGanaPierde): IdCarta {
  const largo = (c: IdCarta) => mano.filter((x) => paloDe(x) === paloDe(c)).length;
  if (objetivo === 'maximo')
    return mejor(
      mano,
      (c) => -largo(c),
      (c) => -fuerza(c),
    );
  const sinReyes = mano.filter((c) => valorDe(c) !== REY);
  return mejor(
    sinReyes.length > 0 ? sinReyes : mano,
    (c) => largo(c),
    (c) => fuerza(c),
    (c) => puntosDe(c),
  );
}

/**
 * IA básica del Tute gana-pierde: elige su objetivo antes de cada jugada y, a por el mínimo,
 * carga los puntos sin ganar la baza; a por el máximo, gana las bazas con puntos.
 * Es determinista: no usa el azar que recibe.
 */
export const iaTuteGanaPierdeBasica: Agente<VistaTuteGanaPierde, AccionTuteGanaPierde> = {
  id: 'tute-gana-pierde-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const cartas = acciones.map((a) => a.carta);
    const jugar = (carta: IdCarta) => ({ accion: { tipo: 'jugar' as const, carta }, azar });
    if (cartas.length === 1) return jugar(cartas[0]!);
    const yo = vista.asiento!;
    const objetivo = objetivoGanaPierde(vista);
    if (vista.mesa.length === 0) return jugar(salida(cartas, objetivo));

    const ultimo = vista.mesa.length === vista.config.jugadores - 1;
    const gana = (c: IdCarta) =>
      cartaGanadora([...vista.mesa, { asiento: yo, carta: c }], vista.triunfo).asiento === yo;
    // Lo que añade la carta a la baza: sus tantos y, si completa el Rey y el Caballo, el cante.
    const cante = vista.triunfo === null ? 40 : 20;
    const completa = (c: IdCarta) =>
      parejaEnBaza(vista.mesa) === null &&
      parejaEnBaza([...vista.mesa, { asiento: yo, carta: c }]) !== null;
    const aporta = (c: IdCarta) => puntosDe(c) + (completa(c) ? cante : 0);
    const ganadoras = cartas.filter(gana);
    const perdedoras = cartas.filter((c) => !gana(c));

    if (objetivo === 'minimo') {
      // Sin ganarla, carga lo que más vale; obligado a ganarla, con lo que menos aporta.
      if (perdedoras.length > 0) {
        return jugar(
          mejor(
            perdedoras,
            (c) => -puntosDe(c),
            (c) => -fuerza(c),
          ),
        );
      }
      return jugar(
        mejor(
          ganadoras,
          (c) => aporta(c),
          (c) => fuerza(c),
        ),
      );
    }
    if (ganadoras.length > 0) {
      return jugar(
        ultimo
          ? mejor(
              ganadoras,
              (c) => -aporta(c),
              (c) => fuerza(c),
            )
          : mejor(
              ganadoras,
              (c) => -fuerza(c),
              (c) => -puntosDe(c),
            ),
      );
    }
    return jugar(
      mejor(
        perdedoras,
        (c) => puntosDe(c),
        (c) => fuerza(c),
      ),
    );
  },
};
