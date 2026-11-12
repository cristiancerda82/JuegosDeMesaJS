import {
  cotaBajadaCanasta,
  esComodinCanasta,
  esDosCanasta,
  esJokerCanasta,
  esTresNegro,
  puntosCanasta,
  valorCanasta,
} from '../juegos/canasta';
import {
  bandoHandAndFoot,
  esLibro,
  MAXIMO_COMODINES_HAND_AND_FOOT,
  TAMANO_LIBRO,
  type AccionHandAndFoot,
  type CartaHandAndFoot,
  type VistaHandAndFoot,
} from '../juegos/hand-and-foot';
import { basePinacle } from '../juegos/pinacle-combinaciones';
import type { Agente } from './agente';

/**
 * IA básica del Hand and Foot (spec ia-jugadores): una acción cada vez. En la fase de robar coge
 * el descarte si puede; en la de bajar, baja lo que le conviene paso a paso y al final descarta.
 */

type Accion<T extends AccionHandAndFoot['tipo']> = Extract<AccionHandAndFoot, { tipo: T }>;

const de = <T extends AccionHandAndFoot['tipo']>(acciones: readonly AccionHandAndFoot[], tipo: T) =>
  acciones.filter((a): a is Accion<T> => a.tipo === tipo);

const naturales = (cartas: readonly CartaHandAndFoot[]) =>
  cartas.filter((c) => !esComodinCanasta(c));
const comodines = (cartas: readonly CartaHandAndFoot[]) => cartas.filter(esComodinCanasta);
const puntos = (cartas: readonly CartaHandAndFoot[]) =>
  cartas.reduce((s, c) => s + puntosCanasta(c), 0);

/** Coger el descarte, si puede. */
export const eleccionDescarteHandAndFoot = (acciones: readonly AccionHandAndFoot[]) =>
  de(acciones, 'cogerDescarte')[0] ?? null;

/** El paso siguiente de la primera bajada, si con la mano llega al mínimo. */
function pasoApertura(
  vista: VistaHandAndFoot,
  acciones: readonly AccionHandAndFoot[],
): AccionHandAndFoot | null {
  const bando = bandoHandAndFoot(vista.asiento ?? 0);
  const mano = vista.miMano ?? [];
  const propias = vista.combinaciones.filter((c) => c.bando === bando);
  const hechas = propias.reduce((s, c) => s + puntos(c.cartas), 0);
  const huecos = propias
    .filter((c) => c.valor > 0)
    .map((c) => ({
      valor: c.valor,
      hueco: Math.min(
        MAXIMO_COMODINES_HAND_AND_FOOT - comodines(c.cartas).length,
        TAMANO_LIBRO - c.cartas.length,
      ),
    }));
  // Con el pie, tiene que quedarse con 2 cartas; con la mano, puede bajarlas todas.
  const reservar = vista.enPie[vista.asiento ?? 0] ? 2 : 0;
  if (hechas + cotaBajadaCanasta(mano, huecos, reservar) < vista.minimo) return null;

  const todasDelValor = (cartas: readonly CartaHandAndFoot[]) => {
    const v = valorCanasta(naturales(cartas)[0]!);
    return (
      naturales(cartas).length ===
      mano.filter((c) => !esComodinCanasta(c) && valorCanasta(c) === v).length
    );
  };
  // 0. Los naturales que casan con lo ya bajado.
  const casan = de(acciones, 'anadir').find(
    (a) => comodines(a.cartas).length === 0 && a.cartas.length > 0 && todasDelValor(a.cartas),
  );
  if (casan) return casan;
  // 1. Los valores con tres naturales o más, sin comodines.
  const bajadas = de(acciones, 'bajar').filter((a) => naturales(a.cartas).length > 0);
  const mejor = (xs: readonly Accion<'bajar'>[]) =>
    [...xs].sort((a, b) => puntos(b.cartas) - puntos(a.cartas))[0] ?? null;
  const enteras = bajadas.filter(
    (a) => comodines(a.cartas).length === 0 && a.cartas.length >= 3 && todasDelValor(a.cartas),
  );
  const primera = mejor(enteras) ?? mejor(bajadas.filter((a) => comodines(a.cartas).length === 0));
  if (primera) return primera;
  // 2. Las parejas con un comodín (primero los jokers, que valen más).
  const parejas = bajadas.filter(
    (a) => naturales(a.cartas).length === 2 && comodines(a.cartas).length === 1,
  );
  const pareja = mejor(parejas.filter((a) => a.cartas.some(esJokerCanasta))) ?? mejor(parejas);
  if (pareja) return pareja;
  // 3. Los comodines que queden, de uno en uno.
  const sueltos = de(acciones, 'anadir').filter(
    (a) => a.cartas.length === 1 && esComodinCanasta(a.cartas[0]!),
  );
  return sueltos.find((a) => esJokerCanasta(a.cartas[0]!)) ?? sueltos[0] ?? null;
}

/** Lo que baja ya abierta la pareja: grupos de naturales, naturales que casan y comodines útiles. */
function pasoBajar(
  vista: VistaHandAndFoot,
  acciones: readonly AccionHandAndFoot[],
): AccionHandAndFoot | null {
  const yo = vista.asiento ?? 0;
  const bando = bandoHandAndFoot(yo);
  const mano = vista.miMano ?? [];
  const sinComodin = (a: { cartas: readonly CartaHandAndFoot[] }) =>
    comodines(a.cartas).length === 0;
  const todasDelValor = (cartas: readonly CartaHandAndFoot[]) => {
    const v = valorCanasta(naturales(cartas)[0]!);
    return (
      naturales(cartas).length ===
      mano.filter((c) => !esComodinCanasta(c) && valorCanasta(c) === v).length
    );
  };

  // Cerrar: si con el pie y los libros puede quedarse sin cartas de golpe, lo hace.
  if (vista.enPie[yo] && vista.puedeCerrar[bando]) {
    const cierra = acciones.find(
      (a) => (a.tipo === 'bajar' || a.tipo === 'anadir') && a.cartas.length >= mano.length,
    );
    if (cierra) return cierra;
  }
  const bajar = de(acciones, 'bajar').find(
    (a) =>
      sinComodin(a) &&
      naturales(a.cartas).length >= 3 &&
      todasDelValor(a.cartas) &&
      !a.cartas.some(esTresNegro),
  );
  if (bajar) return bajar;
  const anadir = de(acciones, 'anadir').find(
    (a) => sinComodin(a) && a.cartas.length > 0 && todasDelValor(a.cartas),
  );
  if (anadir) return anadir;

  const mios = comodines(mano);
  if (mios.length === 0) return null;
  const sueltos = de(acciones, 'anadir').filter(
    (a) => a.cartas.length === 1 && esComodinCanasta(a.cartas[0]!),
  );
  // Comodines para terminar un libro (los doses antes que los jokers).
  const completa = sueltos.find((a) => {
    const comb = vista.combinaciones.find((c) => c.id === a.combinacion)!;
    if (comb.valor === 0 || esLibro(comb)) return false;
    const hueco = MAXIMO_COMODINES_HAND_AND_FOOT - comodines(comb.cartas).length;
    return comb.cartas.length + Math.min(hueco, mios.length) >= TAMANO_LIBRO;
  });
  if (completa) {
    return (
      sueltos.find((a) => a.combinacion === completa.combinacion && esDosCanasta(a.cartas[0]!)) ??
      completa
    );
  }
  // El libro de comodines, con tres o más.
  if (mios.length >= 3) {
    const deComodines = de(acciones, 'bajar')
      .filter((a) => a.cartas.every(esComodinCanasta))
      .sort((a, b) => b.cartas.length - a.cartas.length)[0];
    if (deComodines) return deComodines;
    const seguir = de(acciones, 'anadir')
      .filter((a) => vista.combinaciones.find((c) => c.id === a.combinacion)?.valor === 0)
      .sort((a, b) => b.cartas.length - a.cartas.length)[0];
    if (seguir) return seguir;
  }
  return null;
}

/** El descarte: un 3 negro; si no, lo que menos le sirve; un comodín, lo último. */
export function descartesHandAndFoot(
  vista: VistaHandAndFoot,
  acciones: readonly AccionHandAndFoot[],
): Accion<'descartar'>[] {
  const bando = bandoHandAndFoot(vista.asiento ?? 0);
  const mano = vista.miMano ?? [];
  const abiertas = new Set(
    vista.combinaciones.filter((c) => c.bando === bando && !esLibro(c)).map((c) => c.valor),
  );
  const cuantas = (c: CartaHandAndFoot) =>
    mano.filter((x) => valorCanasta(x) === valorCanasta(c) && !esComodinCanasta(x)).length;
  const coste = (c: CartaHandAndFoot) => {
    if (esTresNegro(c)) return -1000;
    if (esComodinCanasta(c)) return 1000 + puntosCanasta(c);
    return (abiertas.has(valorCanasta(c)) ? 500 : 0) + cuantas(c) * 50 + puntosCanasta(c);
  };
  return [...de(acciones, 'descartar')].sort(
    (a, b) =>
      coste(a.carta) - coste(b.carta) || basePinacle(a.carta).localeCompare(basePinacle(b.carta)),
  );
}

export const iaHandAndFootBasica: Agente<VistaHandAndFoot, AccionHandAndFoot> = {
  id: 'hand-and-foot-basica',
  decidir(vista, acciones, azar) {
    const elegir = (): AccionHandAndFoot => {
      if (vista.fase === 'robar') {
        return (
          eleccionDescarteHandAndFoot(acciones) ??
          acciones.find((a) => a.tipo === 'robar') ??
          acciones[0]!
        );
      }
      const bando = bandoHandAndFoot(vista.asiento ?? 0);
      // Si acaba de deshacer, no lo vuelve a intentar en este turno: descarta.
      const deshizo =
        vista.ultimaAccion?.asiento === vista.asiento &&
        vista.ultimaAccion.accion.tipo === 'deshacer';
      if (!vista.abierto[bando]) {
        const paso = deshizo ? null : pasoApertura(vista, acciones);
        if (paso) return paso;
        if (vista.apertura !== null) {
          return acciones.find((a) => a.tipo === 'deshacer') ?? acciones[0]!;
        }
      } else {
        const paso = pasoBajar(vista, acciones);
        if (paso) return paso;
      }
      return descartesHandAndFoot(vista, acciones)[0] ?? acciones[0]!;
    };
    return { accion: elegir(), azar };
  },
};
