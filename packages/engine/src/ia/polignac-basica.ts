import { PALOS_FRANCESES, type IdCarta } from '../baraja/cartas';
import {
  ganadoraPolignac,
  JOTA_PICAS_POLIGNAC,
  paloPolignac,
  penalizaPolignac,
  rangoPolignac,
  type AccionPolignac,
  type VistaPolignac,
} from '../juegos/polignac';
import type { Agente } from './agente';

const AS = 14;
const esJota = (c: IdCarta) => penalizaPolignac(c) > 0;

const masBaja = (cs: readonly IdCarta[]) =>
  [...cs].sort((a, b) => rangoPolignac(a) - rangoPolignac(b) || a.localeCompare(b))[0]!;
const masAlta = (cs: readonly IdCarta[]) =>
  [...cs].sort((a, b) => rangoPolignac(b) - rangoPolignac(a) || a.localeCompare(b))[0]!;

/**
 * Si conviene anunciar el general (spec ia-jugadores): en cada palo que tiene, sus cartas son
 * las más altas seguidas desde el As. Saliendo siempre, gana así todas las bazas.
 */
export function generalSeguroPolignac(mano: readonly IdCarta[]): boolean {
  if (mano.length === 0) return false;
  return PALOS_FRANCESES.every((palo) => {
    const rangos = mano
      .filter((c) => paloPolignac(c) === palo)
      .map(rangoPolignac)
      .sort((a, b) => b - a);
    return rangos.every((r, i) => r === AS - i);
  });
}

/** La carta en una baza (spec ia-jugadores). */
export function cartaPolignac(vista: VistaPolignac, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const mesa = vista.mesa;
  const yo = vista.asiento!;
  const mano = vista.miMano ?? [];

  if (vista.general !== null) {
    if (vista.general === yo) return masAlta(cartas);
    if (mesa.length === 0) return masBaja(cartas);
    const ganadoras = cartas.filter(
      (c) => ganadoraPolignac([...mesa, { asiento: yo, carta: c }]).asiento === yo,
    );
    return masBaja(ganadoras.length > 0 ? ganadoras : cartas);
  }

  if (mesa.length === 0) {
    const sinJotas = cartas.filter((c) => !esJota(c));
    const opciones = sinJotas.length > 0 ? sinJotas : cartas;
    const largo = (c: IdCarta) => mano.filter((x) => paloPolignac(x) === paloPolignac(c)).length;
    const minimo = Math.min(...opciones.map(largo));
    return masBaja(opciones.filter((c) => largo(c) === minimo));
  }
  const salida = paloPolignac(mesa[0]!.carta);
  if (cartas.every((c) => paloPolignac(c) === salida)) {
    const gana = rangoPolignac(ganadoraPolignac(mesa).carta);
    const debajo = cartas.filter((c) => rangoPolignac(c) < gana);
    if (debajo.length > 0) return masAlta(debajo);
    const sinJotas = cartas.filter((c) => !esJota(c));
    return masAlta(sinJotas.length > 0 ? sinJotas : cartas);
  }
  // Sin el palo: la J de picas, otra J o la más alta.
  if (cartas.includes(JOTA_PICAS_POLIGNAC)) return JOTA_PICAS_POLIGNAC;
  const jotas = cartas.filter(esJota);
  return jotas.length > 0 ? masAlta(jotas) : masAlta(cartas);
}

export const iaPolignacBasica: Agente<VistaPolignac, AccionPolignac> = {
  id: 'polignac-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    if (vista.fase === 'general') {
      const anuncia = generalSeguroPolignac(vista.miMano ?? []);
      return { accion: { tipo: anuncia ? 'general' : 'pasar' }, azar };
    }
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    return { accion: { tipo: 'jugar', carta: cartaPolignac(vista, cartas) }, azar };
  },
};
