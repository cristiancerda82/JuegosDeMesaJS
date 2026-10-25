import { basePinacle } from '../juegos/pinacle-combinaciones';
import {
  bandoCanasta,
  comodinesDe,
  cotaBajadaCanasta,
  esCanasta,
  esComodinCanasta,
  esDosCanasta,
  esJokerCanasta,
  esTresNegro,
  MAXIMO_COMODINES_CANASTA,
  puntosCanasta,
  TAMANO_CANASTA,
  valorCanasta,
  type AccionCanasta,
  type CartaCanasta,
  type VistaCanasta,
} from '../juegos/canasta';
import type { Agente } from './agente';

/**
 * IA básica de la Canasta (spec ia-jugadores): una acción cada vez. En la fase de robar se lleva
 * el pozo si puede; en la de bajar, baja lo que le conviene paso a paso y al final descarta.
 */

type Accion<T extends AccionCanasta['tipo']> = Extract<AccionCanasta, { tipo: T }>;

const de = <T extends AccionCanasta['tipo']>(acciones: readonly AccionCanasta[], tipo: T) =>
  acciones.filter((a): a is Accion<T> => a.tipo === tipo);

const naturales = (cartas: readonly CartaCanasta[]) => cartas.filter((c) => !esComodinCanasta(c));
const comodines = (cartas: readonly CartaCanasta[]) => cartas.filter(esComodinCanasta);

/** Llevarse el pozo: con la combinación de la pareja, o con las menos cartas y sin comodines. */
export function eleccionPozoCanasta(acciones: readonly AccionCanasta[]): AccionCanasta | null {
  const pozo = de(acciones, 'tomarPozo');
  if (pozo.length === 0) return null;
  return [...pozo].sort(
    (a, b) =>
      comodines(a.cartas).length - comodines(b.cartas).length || a.cartas.length - b.cartas.length,
  )[0]!;
}

/** El paso siguiente de la primera bajada, si con la mano llega al mínimo. */
function pasoApertura(
  vista: VistaCanasta,
  acciones: readonly AccionCanasta[],
): AccionCanasta | null {
  const bando = bandoCanasta(vista.asiento ?? 0);
  const mano = vista.miMano ?? [];
  const bloqueadas = vista.apertura?.bloqueadas ?? [];
  const libres = mano.filter((c) => !bloqueadas.includes(c));
  const propias = vista.combinaciones.filter((c) => c.bando === bando);
  const hechas = propias.reduce(
    (s, c) => s + c.cartas.reduce((t, x) => t + puntosCanasta(x), 0),
    0,
  );
  const huecos = propias.map((c) => ({
    valor: c.valor,
    hueco: MAXIMO_COMODINES_CANASTA - comodinesDe(c.cartas),
  }));
  const reservar = Math.max(0, 2 - bloqueadas.length);
  if (hechas + cotaBajadaCanasta(libres, huecos, reservar) < vista.minimos[bando]!) return null;

  // 0. Los naturales que casan con las combinaciones de la pareja (la del pozo).
  const casan = de(acciones, 'anadir').find(
    (a) =>
      comodines(a.cartas).length === 0 &&
      a.cartas.length > 0 &&
      a.cartas.length ===
        libres.filter((c) => !esComodinCanasta(c) && valorCanasta(c) === valorCanasta(a.cartas[0]!))
          .length,
  );
  if (casan) return casan;
  // 1. Los valores con tres naturales o más, todos y sin comodines.
  const bajadas = de(acciones, 'bajar').filter((a) => !a.cartas.some(esTresNegro));
  const enteras = bajadas.filter((a) => {
    const v = valorCanasta(naturales(a.cartas)[0]!);
    const todas = libres.filter((c) => !esComodinCanasta(c) && valorCanasta(c) === v).length;
    return comodines(a.cartas).length === 0 && a.cartas.length === todas && todas >= 3;
  });
  const mejor = (xs: readonly Accion<'bajar'>[]) =>
    [...xs].sort((a, b) => puntos(b.cartas) - puntos(a.cartas))[0] ?? null;
  const primera = mejor(enteras);
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

const puntos = (cartas: readonly CartaCanasta[]) =>
  cartas.reduce((s, c) => s + puntosCanasta(c), 0);

/** Lo que baja ya abierta la pareja: grupos de naturales, naturales que casan y comodines útiles. */
function pasoBajar(vista: VistaCanasta, acciones: readonly AccionCanasta[]): AccionCanasta | null {
  const bando = bandoCanasta(vista.asiento ?? 0);
  const mano = vista.miMano ?? [];
  const conCanasta = vista.combinaciones.some((c) => c.bando === bando && esCanasta(c));
  const sinComodin = (a: { cartas: readonly CartaCanasta[] }) => comodines(a.cartas).length === 0;
  const todasDelValor = (cartas: readonly CartaCanasta[]) => {
    const v = valorCanasta(naturales(cartas)[0]!);
    return (
      naturales(cartas).length ===
      mano.filter((c) => !esComodinCanasta(c) && valorCanasta(c) === v).length
    );
  };

  // Cerrar: si con canasta puede quedarse sin cartas de golpe, lo hace.
  if (conCanasta) {
    const cierra = acciones.find(
      (a) => (a.tipo === 'bajar' || a.tipo === 'anadir') && a.cartas.length >= mano.length,
    );
    if (cierra) return cierra;
  }
  const bajar = de(acciones, 'bajar').find(
    (a) =>
      sinComodin(a) &&
      a.cartas.length >= 3 &&
      todasDelValor(a.cartas) &&
      !a.cartas.some(esTresNegro),
  );
  if (bajar) return bajar;
  const anadir = de(acciones, 'anadir').find(
    (a) => sinComodin(a) && a.cartas.length > 0 && todasDelValor(a.cartas),
  );
  if (anadir) return anadir;

  // Comodines: para completar una canasta, o para cerrar si ya no le queda otra cosa.
  const mios = comodines(mano);
  if (mios.length > 0) {
    const sueltos = de(acciones, 'anadir').filter(
      (a) => a.cartas.length === 1 && esComodinCanasta(a.cartas[0]!),
    );
    const completa = sueltos.find((a) => {
      const comb = vista.combinaciones.find((c) => c.id === a.combinacion)!;
      const hueco = MAXIMO_COMODINES_CANASTA - comodinesDe(comb.cartas);
      return (
        !esCanasta(comb) && comb.cartas.length + Math.min(hueco, mios.length) >= TAMANO_CANASTA
      );
    });
    // Los doses antes que los jokers.
    if (completa)
      return (
        sueltos.find((a) => a.combinacion === completa.combinacion && esDosCanasta(a.cartas[0]!)) ??
        completa
      );
    if (conCanasta && mano.length - mios.length <= 1 && sueltos[0]) return sueltos[0];
  }
  // Los treses negros, solo cuando sirven para cerrar.
  const treses = de(acciones, 'bajar').find((a) => a.cartas.some(esTresNegro));
  return treses ?? null;
}

/** El descarte: un 3 negro; si no, lo que menos sirve a los rivales; un comodín, lo último. */
export function descartesCanasta(
  vista: VistaCanasta,
  acciones: readonly AccionCanasta[],
): Accion<'descartar'>[] {
  const bando = bandoCanasta(vista.asiento ?? 0);
  const mano = vista.miMano ?? [];
  const rivales = new Set(vista.combinaciones.filter((c) => c.bando !== bando).map((c) => c.valor));
  const cuantas = (c: CartaCanasta) =>
    mano.filter((x) => valorCanasta(x) === valorCanasta(c) && !esComodinCanasta(x)).length;
  const coste = (c: CartaCanasta) => {
    if (esTresNegro(c)) return -1000;
    if (esComodinCanasta(c)) return 1000 + puntosCanasta(c);
    return (rivales.has(valorCanasta(c)) ? 500 : 0) + cuantas(c) * 50 + puntosCanasta(c);
  };
  return [...de(acciones, 'descartar')].sort(
    (a, b) =>
      coste(a.carta) - coste(b.carta) || basePinacle(a.carta).localeCompare(basePinacle(b.carta)),
  );
}

export const iaCanastaBasica: Agente<VistaCanasta, AccionCanasta> = {
  id: 'canasta-basica',
  decidir(vista, acciones, azar) {
    const elegir = (): AccionCanasta => {
      if (vista.fase === 'robar') {
        return (
          eleccionPozoCanasta(acciones) ?? acciones.find((a) => a.tipo === 'robar') ?? acciones[0]!
        );
      }
      const bando = bandoCanasta(vista.asiento ?? 0);
      if (!vista.abierto[bando]) {
        const paso = pasoApertura(vista, acciones);
        if (paso) return paso;
        if (vista.apertura !== null) {
          return acciones.find((a) => a.tipo === 'deshacer') ?? acciones[0]!;
        }
      } else {
        const paso = pasoBajar(vista, acciones);
        if (paso) return paso;
      }
      return descartesCanasta(vista, acciones)[0] ?? acciones[0]!;
    };
    return { accion: elegir(), azar };
  },
};
