import { PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import type { AccionTuteSubastado, VistaTuteSubastado } from '../juegos/tute-subastado';
import { cartaGanadora, fuerza, paloDe, puntosDe, valorDe } from '../motor/bazas';
import type { Agente } from './agente';
import { cartaParaResponder, cartaParaSalir, coste } from './bazas-heuristica';

/**
 * IA básica del Tute subastado: puja lo que estima que hará con su mejor palo de triunfo, elige
 * ese palo, canta siempre y juega las bazas con la heurística común, sabiendo que los
 * defensores son compañeros. Es determinista: no usa el azar.
 */
export const iaTuteSubastadoBasica: Agente<VistaTuteSubastado, AccionTuteSubastado> = {
  id: 'tute-subastado-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

const AS = 1;
const TRES = 3;
const REY = 12;
const CABALLO = 11;

/** Puntos que, de media, traen las cartas de los rivales en una baza ganada. */
const PUNTOS_AJENOS_POR_BAZA = 8;
/** Parte de las 10 de últimas que se espera llevarse. */
const ULTIMAS_ESPERADAS = 5;

/** Probabilidad de que una carta gane su baza, con `palo` de triunfo. */
function probabilidadGanar(carta: IdCarta, mano: readonly IdCarta[], triunfo: PaloEspanol) {
  const palo = paloDe(carta);
  const v = valorDe(carta);
  const tiene = (valor: number) => mano.includes(`${palo}-${valor}`);
  if (palo === triunfo) {
    const largo = mano.filter((c) => paloDe(c) === triunfo).length;
    if (v === AS) return 1;
    if (v === TRES) return tiene(AS) ? 1 : 0.85;
    if (v === REY) return tiene(AS) && tiene(TRES) ? 0.9 : 0.6;
    if (v === CABALLO) return 0.5;
    return largo >= 5 ? 0.55 : 0.35;
  }
  if (v === AS) return 0.8;
  if (v === TRES) return tiene(AS) ? 0.7 : 0.3;
  if (v === REY) return tiene(AS) && tiene(TRES) ? 0.4 : 0;
  return 0;
}

/**
 * Puntos que espera hacer con su mano si el triunfo es `triunfo`: cada carta que puede ganar su
 * baza aporta sus puntos y los que traen los rivales, más los cantes y parte de las últimas.
 */
export function estimarPuntos(mano: readonly IdCarta[], triunfo: PaloEspanol): number {
  let puntos = ULTIMAS_ESPERADAS;
  for (const c of mano) {
    puntos += probabilidadGanar(c, mano, triunfo) * (puntosDe(c) + PUNTOS_AJENOS_POR_BAZA);
  }
  for (const palo of PALOS_ESPANOLES) {
    if (mano.includes(`${palo}-${REY}`) && mano.includes(`${palo}-${CABALLO}`)) {
      puntos += palo === triunfo ? 40 : 20;
    }
  }
  return puntos;
}

/** El palo de triunfo con el que más puntos espera hacer, y esos puntos. */
export function mejorTriunfo(mano: readonly IdCarta[]): { palo: PaloEspanol; puntos: number } {
  let mejor: { palo: PaloEspanol; puntos: number } = { palo: PALOS_ESPANOLES[0], puntos: -1 };
  for (const palo of PALOS_ESPANOLES) {
    const puntos = estimarPuntos(mano, palo);
    if (puntos > mejor.puntos) mejor = { palo, puntos };
  }
  return mejor;
}

function elegir(
  vista: VistaTuteSubastado,
  acciones: readonly AccionTuteSubastado[],
): AccionTuteSubastado {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'subasta': {
      // La puja más baja posible, si no pasa de lo que espera hacer.
      const { puntos } = mejorTriunfo(mano);
      const minima = acciones.find((a) => a.tipo === 'pujar');
      return minima && minima.puntos <= puntos ? minima : { tipo: 'pasar' };
    }
    case 'triunfo':
      return { tipo: 'triunfo', palo: mejorTriunfo(mano).palo };
    case 'bazas':
      return enBazas(vista, acciones);
  }
}

function enBazas(
  vista: VistaTuteSubastado,
  acciones: readonly AccionTuteSubastado[],
): AccionTuteSubastado {
  // El tute decide la mano en el acto; después, las 40 antes que las 20.
  const tute = acciones.find((a) => a.tipo === 'cantarTute');
  if (tute) return tute;
  const cantes = acciones.filter(
    (a): a is Extract<AccionTuteSubastado, { tipo: 'cantar' }> => a.tipo === 'cantar',
  );
  const cante = cantes.find((a) => a.palo === vista.triunfo) ?? cantes[0];
  if (cante) return cante;

  const asiento = vista.asiento!;
  const triunfo = vista.triunfo!;
  const pujador = vista.pujador!;
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  const guardadas = cartasDeParejas(vista);
  const libres = cartas.filter((c) => !guardadas.has(c));
  const candidatas = libres.length > 0 ? libres : cartas;

  if (vista.mesa.length === 0) {
    return { tipo: 'jugar', carta: salida(vista, candidatas) };
  }

  // Si el pujador ya jugó y la baza es de otro defensor, se le cargan puntos.
  const gana = cartaGanadora(vista.mesa, triunfo).asiento;
  const yaJugo = vista.mesa.some((j) => j.asiento === pujador);
  if (asiento !== pujador && gana !== pujador && yaJugo) {
    const sinTriunfo = candidatas.filter((c) => paloDe(c) !== triunfo);
    const cargas = sinTriunfo.length > 0 ? sinTriunfo : candidatas;
    const carga = [...cargas].sort(
      (x, y) => puntosDe(y) - puntosDe(x) || coste(triunfo, x) - coste(triunfo, y),
    )[0]!;
    return { tipo: 'jugar', carta: carga };
  }

  const carta = cartaParaResponder(
    {
      asiento,
      jugadores: 4,
      triunfo,
      mesa: vista.mesa,
      companero: (otro) => asiento !== pujador && otro !== pujador,
    },
    candidatas,
  );
  return { tipo: 'jugar', carta };
}

/**
 * Al salir, el pujador arrastra con el triunfo más alto que queda si lo tiene y aún hay
 * triunfos fuera; si no, la salida común de la heurística.
 */
function salida(vista: VistaTuteSubastado, cartas: readonly IdCarta[]): IdCarta {
  const triunfo = vista.triunfo!;
  if (vista.asiento === vista.pujador) {
    const jugadas = new Set(vista.bazasMano.flatMap((b) => b.cartas.map((j) => j.carta)));
    const mano = vista.miMano ?? [];
    const fuera = triunfosFuera(triunfo, mano, jugadas);
    const mios = cartas.filter((c) => paloDe(c) === triunfo);
    if (fuera.length > 0 && mios.length > 0) {
      const alto = [...mios].sort((a, b) => fuerza(b) - fuerza(a))[0]!;
      if (fuera.every((c) => fuerza(c) < fuerza(alto))) return alto;
    }
  }
  return cartaParaSalir(triunfo, cartas);
}

/** Triunfos que no tiene ni se han jugado: los que pueden tener los rivales. */
function triunfosFuera(
  triunfo: PaloEspanol,
  mano: readonly IdCarta[],
  jugadas: ReadonlySet<IdCarta>,
): IdCarta[] {
  const fuera: IdCarta[] = [];
  for (const v of [1, 2, 3, 4, 5, 6, 7, 10, 11, 12]) {
    const c: IdCarta = `${triunfo}-${v}`;
    if (!mano.includes(c) && !jugadas.has(c)) fuera.push(c);
  }
  return fuera;
}

/** Reyes y caballos de los palos en los que la mano propia aún puede cantar. */
function cartasDeParejas(vista: VistaTuteSubastado): Set<IdCarta> {
  const mano = vista.miMano ?? [];
  const guardadas = new Set<IdCarta>();
  for (const palo of PALOS_ESPANOLES) {
    const rey: IdCarta = `${palo}-${REY}`;
    const caballo: IdCarta = `${palo}-${CABALLO}`;
    const cantado = vista.cantes.some((c) => c.palo === palo);
    if (!cantado && mano.includes(rey) && mano.includes(caballo)) {
      guardadas.add(rey);
      guardadas.add(caballo);
    }
  }
  return guardadas;
}
