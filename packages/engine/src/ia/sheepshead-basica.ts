import type { IdCarta } from '../baraja/cartas';
import {
  esTriunfoSheepshead,
  fuerzaSheepshead,
  ganadoraSheepshead,
  J_DIAMANTES,
  paloSheepshead,
  puntosCartaSheepshead,
  valorSheepshead,
  type AccionSheepshead,
  type VistaSheepshead,
} from '../juegos/sheepshead';
import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';

const AS = 1;
const DAMA = 12;
const JOTA = 11;
const esAlto = (c: IdCarta) => valorSheepshead(c) === DAMA || valorSheepshead(c) === JOTA;

/** Coge con 3 triunfos que sean Q o J, o con 4 triunfos de los que uno sea Q. */
export function cogeSheepshead(mano: readonly IdCarta[]): boolean {
  const triunfos = mano.filter(esTriunfoSheepshead);
  const altos = triunfos.filter(esAlto).length;
  const damas = triunfos.filter((c) => valorSheepshead(c) === DAMA).length;
  return altos >= 3 || (triunfos.length >= 4 && damas >= 1);
}

/** La carta que entierra: una suelta de otro palo (la que más vale) o la de menos rango. */
export function enterrarSheepshead(mano: readonly IdCarta[]): IdCarta {
  const posibles = mano.filter((c) => c !== J_DIAMANTES);
  const sueltas = posibles.filter(
    (c) =>
      !esTriunfoSheepshead(c) &&
      posibles.filter((x) => !esTriunfoSheepshead(x) && paloSheepshead(x) === paloSheepshead(c))
        .length === 1,
  );
  if (sueltas.length > 0) {
    return [...sueltas].sort(
      (a, b) =>
        puntosCartaSheepshead(b) - puntosCartaSheepshead(a) ||
        fuerzaSheepshead(a) - fuerzaSheepshead(b),
    )[0]!;
  }
  const otras = posibles.filter((c) => !esTriunfoSheepshead(c));
  return [...(otras.length > 0 ? otras : posibles)].sort(
    (a, b) => fuerzaSheepshead(a) - fuerzaSheepshead(b),
  )[0]!;
}

/** Los asientos que el jugador sabe de su bando (sin contarse a sí mismo). */
export function bandoConocidoSheepshead(vista: VistaSheepshead): Asiento[] {
  const yo = vista.asiento!;
  const picker = vista.picker;
  if (vista.leaster || picker === null) return [];
  const tengoJ = (vista.miMano ?? []).includes(J_DIAMANTES);
  const companero = vista.companero;
  const todos = [0, 1, 2, 3, 4].filter((a) => a !== yo);
  if (yo === picker) return companero !== null && companero !== yo ? [companero] : [];
  if (tengoJ || companero === yo) return [picker];
  // Rival del picker: conoce a sus compañeros si ya se sabe quién es el compañero.
  if (companero === null) return [];
  return todos.filter((a) => a !== picker && a !== companero);
}

const masFuerte = (a: IdCarta, b: IdCarta) => fuerzaSheepshead(b) - fuerzaSheepshead(a);
const masDebil = (a: IdCarta, b: IdCarta) => fuerzaSheepshead(a) - fuerzaSheepshead(b);

/** La carta que juega entre las legales. */
export function cartaSheepshead(vista: VistaSheepshead, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const gana = (c: IdCarta) =>
    ganadoraSheepshead([...vista.mesa, { asiento: yo, carta: c }]).asiento === yo;

  if (vista.leaster) {
    if (vista.mesa.length === 0) return [...cartas].sort(masDebil)[0]!;
    const pierden = cartas.filter((c) => !gana(c)).sort(masFuerte);
    return pierden[0] ?? [...cartas].sort(masFuerte)[0]!;
  }

  const delPicker =
    yo === vista.picker || (vista.miMano ?? []).includes(J_DIAMANTES) || vista.companero === yo;
  if (vista.mesa.length === 0) {
    const triunfos = cartas.filter(esTriunfoSheepshead).sort(masFuerte);
    if (delPicker && triunfos.length > 0) return triunfos[0]!;
    const otras = cartas.filter((c) => !esTriunfoSheepshead(c));
    const ases = otras.filter((c) => valorSheepshead(c) === AS);
    if (ases.length > 0) return ases[0]!;
    return [...(otras.length > 0 ? otras : cartas)].sort(masDebil)[0]!;
  }
  const ganando = ganadoraSheepshead(vista.mesa).asiento;
  if (bandoConocidoSheepshead(vista).includes(ganando)) {
    const pierden = cartas
      .filter((c) => !gana(c))
      .sort((a, b) => puntosCartaSheepshead(b) - puntosCartaSheepshead(a) || masDebil(a, b));
    if (pierden.length > 0) return pierden[0]!;
  }
  const ganadoras = cartas.filter(gana).sort(masDebil);
  if (ganadoras.length > 0) return ganadoras[0]!;
  return [...cartas].sort(
    (a, b) => puntosCartaSheepshead(a) - puntosCartaSheepshead(b) || masDebil(a, b),
  )[0]!;
}

export function decisionSheepshead(
  vista: VistaSheepshead,
  acciones: readonly AccionSheepshead[],
): AccionSheepshead {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'coger':
      return cogeSheepshead(mano) ? { tipo: 'coger' } : { tipo: 'pasar' };
    case 'enterrar':
      return { tipo: 'enterrar', carta: enterrarSheepshead(mano) };
    case 'bazas': {
      const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
      return { tipo: 'jugar', carta: cartaSheepshead(vista, cartas) };
    }
  }
}

export const iaSheepsheadBasica: Agente<VistaSheepshead, AccionSheepshead> = {
  id: 'sheepshead-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionSheepshead(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
