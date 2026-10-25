import type { IdCarta, PaloFrances } from '../baraja/cartas';
import {
  ganadoraWhist,
  paloWhist,
  rangoWhist,
  type AccionWhist,
  type VistaWhist,
} from '../juegos/whist';
import type { Agente } from './agente';

/**
 * IA básica del Whist (spec ia-jugadores): sale de su palo más largo, gana la baza con la carta
 * justa si su compañero no la lleva ya y falla con el triunfo más bajo. Es determinista: no usa
 * el azar que recibe.
 */
export const iaWhistBasica: Agente<VistaWhist, AccionWhist> = {
  id: 'whist-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const cartas = acciones.map((a) => a.carta);
    return { accion: { tipo: 'jugar', carta: cartaWhist(vista, cartas) }, azar };
  },
};

/** Coste de soltar una carta: los triunfos valen más que el resto, y dentro, el rango. */
function pesoEn(triunfo: PaloFrances) {
  return (c: IdCarta) => (paloWhist(c) === triunfo ? 100 : 0) + rangoWhist(c);
}

export function cartaWhist(vista: VistaWhist, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const peso = pesoEn(vista.triunfo);
  const masBaja = (cs: readonly IdCarta[]) => [...cs].sort((a, b) => peso(a) - peso(b))[0]!;
  const yo = vista.asiento!;
  const companero = (yo + 2) % 4;
  const mesa = vista.mesa;

  if (mesa.length === 0) return salidaWhist(vista, cartas);

  const gana = (c: IdCarta) =>
    ganadoraWhist([...mesa, { asiento: yo, carta: c }], vista.triunfo).asiento === yo;
  const ganadoras = cartas.filter(gana);
  const ganaAhora = ganadoraWhist(mesa, vista.triunfo).asiento;
  const salida = paloWhist(mesa[0]!.carta);
  const sigue = cartas.some((c) => paloWhist(c) === salida);

  if (ganaAhora === companero) {
    // Sin el palo, descarta la más baja que no sea triunfo.
    const sinTriunfo = cartas.filter((c) => paloWhist(c) !== vista.triunfo);
    return masBaja(!sigue && sinTriunfo.length > 0 ? sinTriunfo : cartas);
  }
  if (ganadoras.length > 0) return masBaja(ganadoras);
  const sinTriunfo = cartas.filter((c) => paloWhist(c) !== vista.triunfo);
  return masBaja(sinTriunfo.length > 0 ? sinTriunfo : cartas);
}

/** Al salir: un As que no sea triunfo; si no, del palo más largo, alta con la siguiente. */
function salidaWhist(vista: VistaWhist, cartas: readonly IdCarta[]): IdCarta {
  const peso = pesoEn(vista.triunfo);
  const noTriunfo = cartas.filter((c) => paloWhist(c) !== vista.triunfo);
  const ases = noTriunfo.filter((c) => rangoWhist(c) === 14);
  if (ases.length > 0) return ases[0]!;
  const candidatas = noTriunfo.length > 0 ? noTriunfo : cartas;
  const delPalo = (p: PaloFrances) => candidatas.filter((x) => paloWhist(x) === p);
  const largo = (c: IdCarta) => delPalo(paloWhist(c)).length;
  const palo = paloWhist(
    [...candidatas].sort((a, b) => largo(b) - largo(a) || peso(b) - peso(a))[0]!,
  );
  const ordenadas = delPalo(palo).sort((a, b) => rangoWhist(b) - rangoWhist(a));
  const alta = ordenadas[0]!;
  const conSiguiente =
    ordenadas[1] !== undefined && rangoWhist(ordenadas[1]) === rangoWhist(alta) - 1;
  return conSiguiente ? alta : ordenadas.at(-1)!;
}
