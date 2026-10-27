import type { IdCarta } from '../baraja/cartas';
import {
  damaDe,
  ganadoraSchnapsen,
  paloSchnapsen,
  PUNTOS_MANO_SCHNAPSEN,
  puntosManoSchnapsen,
  rangoSchnapsen,
  reglasEstrictas,
  reyDe,
  valorSchnapsen,
  type AccionSchnapsen,
  type VistaSchnapsen,
} from '../juegos/schnapsen';
import type { Agente } from './agente';

/** Lo que se sabe seguro que sumará: sus puntos, sus cantes y los Ases y dieces del triunfo. */
function puntosSeguros(vista: VistaSchnapsen): number {
  const yo = vista.asiento!;
  const cantes = vista.cantes.filter((c) => c.asiento === yo).reduce((s, c) => s + c.puntos, 0);
  const altos = (vista.miMano ?? [])
    .filter((c) => paloSchnapsen(c) === vista.triunfo && rangoSchnapsen(c) >= 4)
    .reduce((s, c) => s + valorSchnapsen(c), 0);
  return vista.puntosBazas[yo]! + cantes + altos;
}

/** La carta forma pareja de K y Q que aún se puede cantar. */
function dePareja(vista: VistaSchnapsen, c: IdCarta): boolean {
  const palo = paloSchnapsen(c);
  const mano = vista.miMano ?? [];
  return (
    (c === reyDe(palo) || c === damaDe(palo)) &&
    mano.includes(reyDe(palo)) &&
    mano.includes(damaDe(palo)) &&
    !vista.cantes.some((k) => k.palo === palo)
  );
}

/** La que menos vale, y entre las que valen igual, la más baja. */
const masBarata = (cartas: readonly IdCarta[]) =>
  [...cartas].sort(
    (a, b) => valorSchnapsen(a) - valorSchnapsen(b) || rangoSchnapsen(a) - rangoSchnapsen(b),
  )[0]!;

/** La carta que juega, entre las legales. */
export function cartaSchnapsen(vista: VistaSchnapsen, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const triunfo = vista.triunfo;
  const estrictas = reglasEstrictas(vista);
  const noTriunfo = cartas.filter((c) => paloSchnapsen(c) !== triunfo);
  const sueltas = noTriunfo.filter((c) => !dePareja(vista, c));

  if (vista.mesa.length === 0) {
    // Tras cantar sale con la Q y guarda el K.
    if (vista.cantado !== null)
      return cartas.includes(damaDe(vista.cantado)) ? damaDe(vista.cantado) : cartas[0]!;
    if (estrictas) {
      return [...cartas].sort(
        (a, b) =>
          rangoSchnapsen(b) - rangoSchnapsen(a) ||
          Number(paloSchnapsen(a) === triunfo) - Number(paloSchnapsen(b) === triunfo),
      )[0]!;
    }
    return masBarata(sueltas.length > 0 ? sueltas : noTriunfo.length > 0 ? noTriunfo : cartas);
  }

  const salida = vista.mesa[0]!.carta;
  const ganan = cartas.filter(
    (c) => ganadoraSchnapsen([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  if (estrictas) return masBarata(ganan.length > 0 ? ganan : cartas);
  const mismoPalo = ganan.filter((c) => paloSchnapsen(c) === paloSchnapsen(salida));
  if (mismoPalo.length > 0) return masBarata(mismoPalo);
  if (valorSchnapsen(salida) >= 10) {
    const triunfos = ganan.filter((c) => paloSchnapsen(c) === triunfo && !dePareja(vista, c));
    if (triunfos.length > 0) return masBarata(triunfos);
  }
  return masBarata(sueltas.length > 0 ? sueltas : noTriunfo.length > 0 ? noTriunfo : cartas);
}

/**
 * IA básica del Schnapsen (spec ia-jugadores): cambia la J y canta siempre que puede, cierra con
 * los 66 casi asegurados y juega las bazas con reglas sencillas. Es determinista: no usa el azar
 * que recibe.
 */
export const iaSchnapsenBasica: Agente<VistaSchnapsen, AccionSchnapsen> = {
  id: 'schnapsen-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const elegir = (accion: AccionSchnapsen) => ({ accion, azar });
    const cambiar = acciones.find((a) => a.tipo === 'cambiar');
    if (cambiar) return elegir(cambiar);
    const cantes = acciones.flatMap((a) => (a.tipo === 'cantar' ? [a] : []));
    if (cantes.length > 0) {
      return elegir(cantes.find((a) => a.palo === vista.triunfo) ?? cantes[0]!);
    }
    const yo = vista.asiento!;
    if (
      acciones.some((a) => a.tipo === 'cerrar') &&
      vista.bazas[yo]! > 0 &&
      puntosSeguros(vista) >= PUNTOS_MANO_SCHNAPSEN &&
      puntosManoSchnapsen(vista, yo) < PUNTOS_MANO_SCHNAPSEN
    ) {
      return elegir({ tipo: 'cerrar' });
    }
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    return elegir({ tipo: 'jugar', carta: cartaSchnapsen(vista, cartas) });
  },
};
