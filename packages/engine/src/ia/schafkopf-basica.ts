import type { IdCarta, PaloFrances } from '../baraja/cartas';
import {
  esTriunfoSchafkopf,
  fuerzaSchafkopf,
  ganadoraSchafkopf,
  paloEfectivoSchafkopf,
  puntosCartaSchafkopf,
  valorSchafkopf,
  type AccionSchafkopf,
  type ContratoSchafkopf,
  type VistaSchafkopf,
} from '../juegos/schafkopf';
import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';

const PALOS: readonly PaloFrances[] = ['treboles', 'picas', 'corazones', 'diamantes'];
const esAlta = (c: IdCarta) => valorSchafkopf(c) === 12 || valorSchafkopf(c) === 11;

/** El contrato que quiere anunciar con su mano, o `null` si pasa (spec ia-jugadores). */
export function contratoDeseadoSchafkopf(
  mano: readonly IdCarta[],
  posibles: readonly ContratoSchafkopf[],
): ContratoSchafkopf | null {
  const quiere: ContratoSchafkopf[] = [];
  const triunfosCon = (contrato: ContratoSchafkopf) =>
    mano.filter((c) => esTriunfoSchafkopf(c, contrato));

  // Solo: el palo con el que más triunfos tiene.
  const solos = PALOS.map((palo) => ({ tipo: 'solo', palo }) as const)
    .map((contrato) => ({ contrato, triunfos: triunfosCon(contrato) }))
    .filter((s) => s.triunfos.length >= 6 && s.triunfos.filter(esAlta).length >= 3)
    .sort((a, b) => b.triunfos.length - a.triunfos.length);
  if (solos.length > 0) quiere.push(solos[0]!.contrato);

  const jotas = mano.filter((c) => valorSchafkopf(c) === 11).length;
  const ases = mano.filter((c) => valorSchafkopf(c) === 1).length;
  if (jotas >= 3 && ases >= 2) quiere.push({ tipo: 'wenz' });

  // Los triunfos del Rufspiel no dependen del As que se llama.
  const rufspiel: ContratoSchafkopf = { tipo: 'rufspiel', palo: 'picas' };
  const ruf = triunfosCon(rufspiel);
  if (ruf.length >= 4 && ruf.filter(esAlta).length >= 2) {
    // Llama al As del palo del que menos cartas tiene.
    const llamables = posibles.flatMap((p) => (p.tipo === 'rufspiel' ? [p] : []));
    const cuantas = (palo: PaloFrances) =>
      mano.filter((c) => paloEfectivoSchafkopf(c, rufspiel) === palo).length;
    const mejor = [...llamables].sort((a, b) => cuantas(a.palo) - cuantas(b.palo))[0];
    if (mejor) quiere.push(mejor);
  }
  const igual = (a: ContratoSchafkopf, b: ContratoSchafkopf) =>
    JSON.stringify(a) === JSON.stringify(b);
  return quiere.find((q) => posibles.some((p) => igual(p, q))) ?? null;
}

/** Los compañeros que el asiento conoce en la mano. */
export function companerosConocidosSchafkopf(vista: VistaSchafkopf): Asiento[] {
  const yo = vista.asiento!;
  const jugador = vista.jugador;
  if (vista.fase !== 'bazas' || jugador === null || vista.contrato === null) return [];
  const todos = [0, 1, 2, 3];
  if (vista.contrato.tipo !== 'rufspiel') {
    return yo === jugador ? [] : todos.filter((a) => a !== yo && a !== jugador);
  }
  const companero = vista.companero;
  if (yo === jugador) return companero === null ? [] : [companero];
  if (companero === yo) return [jugador];
  if (companero === null) return [];
  return todos.filter((a) => a !== yo && a !== jugador && a !== companero);
}

/** La carta que juega entre las legales. */
export function cartaSchafkopf(vista: VistaSchafkopf, cartas: readonly IdCarta[]): IdCarta {
  if (cartas.length === 1) return cartas[0]!;
  const yo = vista.asiento!;
  const contrato = vista.contrato!;
  const triunfo = (c: IdCarta) => esTriunfoSchafkopf(c, contrato);
  const fuerza = (c: IdCarta) => fuerzaSchafkopf(c, contrato);
  const porValor = (a: IdCarta, b: IdCarta) =>
    puntosCartaSchafkopf(a) - puntosCartaSchafkopf(b) || fuerza(a) - fuerza(b);
  const noTriunfos = cartas.filter((c) => !triunfo(c));
  const masBaja = [...(noTriunfos.length > 0 ? noTriunfos : cartas)].sort(porValor)[0]!;
  const companeros = companerosConocidosSchafkopf(vista);

  if (vista.mesa.length === 0) {
    const delJugador = yo === vista.jugador || vista.companero === yo;
    const triunfos = cartas.filter(triunfo).sort((a, b) => fuerza(b) - fuerza(a));
    if (delJugador && triunfos.some(esAlta)) return triunfos[0]!;
    const as = noTriunfos.find((c) => valorSchafkopf(c) === 1);
    return as ?? masBaja;
  }

  const gana = ganadoraSchafkopf(vista.mesa, contrato);
  if (companeros.includes(gana.asiento)) {
    // La baza es de un compañero: le carga la que más vale, sin gastar un triunfo si puede.
    const cargables = noTriunfos.length > 0 ? noTriunfos : cartas;
    return [...cargables].sort((a, b) => porValor(b, a))[0]!;
  }
  const vale = vista.mesa.reduce((s, j) => s + puntosCartaSchafkopf(j.carta), 0);
  if (vale >= 10 || vista.mesa.length === 3) {
    const ganadoras = cartas.filter(
      (c) => ganadoraSchafkopf([...vista.mesa, { asiento: yo, carta: c }], contrato).asiento === yo,
    );
    if (ganadoras.length > 0) return ganadoras.sort((a, b) => fuerza(a) - fuerza(b))[0]!;
  }
  return masBaja;
}

export function decisionSchafkopf(
  vista: VistaSchafkopf,
  acciones: readonly AccionSchafkopf[],
): AccionSchafkopf {
  if (vista.fase === 'anuncio') {
    const posibles = acciones.flatMap((a) => (a.tipo === 'anunciar' ? [a.contrato] : []));
    const contrato = contratoDeseadoSchafkopf(vista.miMano ?? [], posibles);
    return contrato ? { tipo: 'anunciar', contrato } : { tipo: 'pasar' };
  }
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  return { tipo: 'jugar', carta: cartaSchafkopf(vista, cartas) };
}

export const iaSchafkopfBasica: Agente<VistaSchafkopf, AccionSchafkopf> = {
  id: 'schafkopf-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionSchafkopf(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
