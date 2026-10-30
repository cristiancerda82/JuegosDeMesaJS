import type { IdCarta } from '../baraja/cartas';
import {
  esTriunfoDoppelkopf,
  fuerzaDoppelkopf,
  ganadoraDoppelkopf,
  nivelAnuncioDoppelkopf,
  paloJuegoDoppelkopf,
  puntosCartaDoppelkopf,
  puntosCartasDoppelkopf,
  valorDoppelkopf,
  type AccionDoppelkopf,
  type ReservaDoppelkopf,
  type TipoJuegoDoppelkopf,
  type VistaDoppelkopf,
} from '../juegos/doppelkopf';
import type { Agente } from './agente';

const CORAZONES_10 = 'corazones-10' as IdCarta;
const DAMA_DIAMANTES = 'diamantes-12' as IdCarta;

/** La reserva que pide con su mano. */
function reservaDoppelkopf(
  mano: readonly IdCarta[],
  posibles: readonly ReservaDoppelkopf[],
): ReservaDoppelkopf {
  const damas = mano.filter((c) => valorDoppelkopf(c) === 12).length;
  const jotas = mano.filter((c) => valorDoppelkopf(c) === 11).length;
  const triunfos = mano.filter((c) => esTriunfoDoppelkopf(c, 'normal')).length;
  const dieces = mano.filter((c) => c === CORAZONES_10).length;
  const quiere: ReservaDoppelkopf[] = [];
  if (damas >= 5) quiere.push('damas');
  if (jotas >= 5) quiere.push('jotas');
  if (triunfos >= 10 && dieces === 2) quiere.push('triunfo');
  quiere.push('boda', 'sano');
  return quiere.find((r) => posibles.includes(r)) ?? posibles[0]!;
}

/** Anuncia Re o Contra con 7 triunfos o más, al menos 3 de ellos el 10 de corazones o Damas. */
function quiereAnunciar(vista: VistaDoppelkopf): boolean {
  const yo = vista.asiento!;
  const bando = vista.bandos[yo];
  const mano = vista.miMano ?? [];
  if (bando === null || bando === undefined || mano.length < 11) return false;
  if (nivelAnuncioDoppelkopf(vista.anuncios, bando) > 0) return false;
  const triunfos = mano.filter((c) => esTriunfoDoppelkopf(c, vista.juego));
  const altos = triunfos.filter((c) => c === CORAZONES_10 || valorDoppelkopf(c) === 12).length;
  return triunfos.length >= 7 && altos >= 3;
}

/** De menos a más valiosa: por puntos y, a igualdad, por fuerza. */
const porValor = (juego: TipoJuegoDoppelkopf) => (a: IdCarta, b: IdCarta) =>
  puntosCartaDoppelkopf(a) - puntosCartaDoppelkopf(b) ||
  fuerzaDoppelkopf(a, juego) - fuerzaDoppelkopf(b, juego);

/** La carta que juega entre las legales. */
export function cartaDoppelkopf(vista: VistaDoppelkopf, cartas: readonly IdCarta[]): IdCarta {
  const yo = vista.asiento!;
  const juego = vista.juego;
  const fuerza = (c: IdCarta) => fuerzaDoppelkopf(c, juego);
  const masBaja = [...cartas].sort(porValor(juego))[0]!;
  if (vista.mesa.length === 0) {
    const salidos = new Set(vista.bazas.map((b) => paloJuegoDoppelkopf(b.cartas[0]!.carta, juego)));
    const as = cartas.find(
      (c) =>
        valorDoppelkopf(c) === 1 &&
        !esTriunfoDoppelkopf(c, juego) &&
        !salidos.has(paloJuegoDoppelkopf(c, juego)),
    );
    if (as) return as;
    const triunfos = cartas.filter((c) => esTriunfoDoppelkopf(c, juego));
    if (triunfos.length > 0) return triunfos.sort((a, b) => fuerza(a) - fuerza(b))[0]!;
    return masBaja;
  }
  const gana = ganadoraDoppelkopf(vista.mesa, juego);
  const mio = vista.bandos[yo];
  if (mio !== null && gana.asiento !== yo && vista.bandos[gana.asiento] === mio) {
    // Su pareja va ganando: le carga la que más vale sin gastar un triunfo alto.
    const limite = juego === 'damas' || juego === 'jotas' ? 0 : fuerza(DAMA_DIAMANTES);
    const cargables = cartas.filter((c) => !esTriunfoDoppelkopf(c, juego) || fuerza(c) < limite);
    if (cargables.length > 0) {
      return cargables.sort((a, b) => porValor(juego)(b, a))[0]!;
    }
    return masBaja;
  }
  const valeLaBaza = puntosCartasDoppelkopf(vista.mesa.map((j) => j.carta));
  if (valeLaBaza >= 10 || vista.mesa.length === 3) {
    const ganadoras = cartas.filter(
      (c) => ganadoraDoppelkopf([...vista.mesa, { asiento: yo, carta: c }], juego).asiento === yo,
    );
    if (ganadoras.length > 0) return ganadoras.sort((a, b) => fuerza(a) - fuerza(b))[0]!;
  }
  return masBaja;
}

export function decisionDoppelkopf(
  vista: VistaDoppelkopf,
  acciones: readonly AccionDoppelkopf[],
): AccionDoppelkopf {
  if (vista.fase === 'reservas') {
    const posibles = acciones.flatMap((a) => (a.tipo === 'reservar' ? [a.reserva] : []));
    return { tipo: 'reservar', reserva: reservaDoppelkopf(vista.miMano ?? [], posibles) };
  }
  if (acciones.some((a) => a.tipo === 'anunciar') && quiereAnunciar(vista)) {
    return { tipo: 'anunciar' };
  }
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  return { tipo: 'jugar', carta: cartaDoppelkopf(vista, cartas) };
}

export const iaDoppelkopfBasica: Agente<VistaDoppelkopf, AccionDoppelkopf> = {
  id: 'doppelkopf-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionDoppelkopf(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
