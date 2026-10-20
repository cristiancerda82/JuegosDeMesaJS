import { crearBaraja, PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  esMatador,
  ganadoraCuatrola,
  paloCuatrola,
  rangoCuatrola,
  type AccionCuatrola,
  type VistaCuatrola,
} from '../juegos/cuatrola';
import { paloDe, valorDe } from '../motor/bazas';
import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';

/**
 * IA básica de la Cuatrola: puja según las bazas que espera con su mejor triunfo, llama el rey
 * del palo en que es más corta y juega las bazas sabiendo quién es su compañero cuando lo sabe.
 * Es determinista: no usa el azar.
 */
export const iaCuatrolaBasica: Agente<VistaCuatrola, AccionCuatrola> = {
  id: 'cuatrola-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

/** Bazas esperadas desde las que se juega solo, y con rey (el compañero pone el resto). */
export const BAZAS_PARA_SOLO = 6;
export const BAZAS_PARA_REY = 3.5;

const REY = 12;
const CABALLO = 11;
const SOTA = 10;

/** Probabilidad de que un triunfo que no es matador gane su baza. */
function valorTriunfo(carta: IdCarta, largo: number): number {
  const v = valorDe(carta);
  if (v === REY) return 0.7;
  if (v === CABALLO) return 0.55;
  if (v === SOTA) return 0.45;
  return largo >= 5 ? 0.4 : 0.2;
}

/** Bazas que espera hacer con su mano si el triunfo es `triunfo`. */
export function bazasEsperadasCuatrola(mano: readonly IdCarta[], triunfo: PaloEspanol): number {
  const triunfos = mano.filter((c) => paloCuatrola(c, triunfo) === triunfo);
  const largo = triunfos.length;
  let bazas = Math.max(0, largo - 3) * 0.3;
  for (const c of mano) {
    if (esMatador(c, triunfo)) {
      bazas += rangoCuatrola(c, triunfo) === 97 ? 0.85 : 0.95;
    } else if (paloDe(c) === triunfo) {
      bazas += valorTriunfo(c, largo);
    } else {
      const palo = paloDe(c);
      const enPalo = mano.filter((x) => paloCuatrola(x, triunfo) === palo).length;
      if (valorDe(c) === REY) bazas += enPalo <= 4 ? 0.6 : 0.4;
      else if (valorDe(c) === CABALLO && mano.includes(`${palo}-${REY}`)) bazas += 0.35;
    }
  }
  return bazas;
}

/** El palo de triunfo con más bazas esperadas, y esas bazas. */
export function mejorTriunfoCuatrola(mano: readonly IdCarta[]): {
  palo: PaloEspanol;
  bazas: number;
} {
  let mejor: { palo: PaloEspanol; bazas: number } = { palo: PALOS_ESPANOLES[0], bazas: -1 };
  for (const palo of PALOS_ESPANOLES) {
    const bazas = bazasEsperadasCuatrola(mano, palo);
    if (bazas > mejor.bazas) mejor = { palo, bazas };
  }
  return mejor;
}

function elegir(vista: VistaCuatrola, acciones: readonly AccionCuatrola[]): AccionCuatrola {
  const mano = vista.miMano ?? [];
  switch (vista.fase) {
    case 'subasta': {
      const { bazas } = mejorTriunfoCuatrola(mano);
      const puede = (modalidad: 'rey' | 'solo') =>
        acciones.some((a) => a.tipo === 'pujar' && a.modalidad === modalidad);
      if (bazas >= BAZAS_PARA_SOLO && puede('solo')) return { tipo: 'pujar', modalidad: 'solo' };
      if (bazas >= BAZAS_PARA_REY && puede('rey')) return { tipo: 'pujar', modalidad: 'rey' };
      return { tipo: 'pasar' };
    }
    case 'triunfo': {
      const { palo } = mejorTriunfoCuatrola(mano);
      const opciones = acciones.filter(
        (a): a is Extract<AccionCuatrola, { tipo: 'elegir' }> =>
          a.tipo === 'elegir' && a.triunfo === palo,
      );
      return [...opciones].sort(
        (x, y) => costeLlamada(x.llamada, palo, mano) - costeLlamada(y.llamada, palo, mano),
      )[0]!;
    }
    case 'bazas':
      return { tipo: 'jugar', carta: carta(vista, acciones) };
  }
}

/**
 * Lo poco que conviene llamar una carta: mejor una de un palo que no es el triunfo y en el que
 * tiene pocas cartas (el compañero le ganará esas bazas), y mejor si no tiene el caballo.
 */
function costeLlamada(llamada: IdCarta | null, triunfo: PaloEspanol, mano: readonly IdCarta[]) {
  if (llamada === null) return 0;
  const palo = paloDe(llamada);
  const enPalo = mano.filter((c) => paloCuatrola(c, triunfo) === palo).length;
  return (palo === triunfo ? 100 : 0) + enPalo * 2 + (mano.includes(`${palo}-${CABALLO}`) ? 1 : 0);
}

/** Los asientos que sabe que juegan con él en esta mano. */
export function companerosConocidos(vista: VistaCuatrola): Set<Asiento> {
  const yo = vista.asiento!;
  const jugador = vista.jugador!;
  const companero = vista.companero;
  const todos = [0, 1, 2, 3].filter((a) => a !== yo);
  if (vista.modalidad === 'solo') {
    return new Set(yo === jugador ? [] : todos.filter((a) => a !== jugador));
  }
  if (yo === jugador) return new Set(companero === null ? [] : [companero]);
  if (yo === companero) return new Set([jugador]);
  // Defensor: el otro defensor solo se sabe cuando se descubre el compañero.
  return new Set(companero === null ? [] : todos.filter((a) => a !== jugador && a !== companero));
}

/** Coste de entregar una carta: los triunfos y las cartas altas cuestan más. */
const coste = (c: IdCarta, triunfo: PaloEspanol) =>
  (paloCuatrola(c, triunfo) === triunfo ? 100 : 0) + rangoCuatrola(c, triunfo);

const masBaja = (cartas: readonly IdCarta[], triunfo: PaloEspanol) =>
  [...cartas].sort((a, b) => coste(a, triunfo) - coste(b, triunfo))[0]!;

function carta(vista: VistaCuatrola, acciones: readonly AccionCuatrola[]): IdCarta {
  const triunfo = vista.triunfo!;
  const yo = vista.asiento!;
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  if (vista.mesa.length === 0) return salida(vista, cartas);

  const companeros = companerosConocidos(vista);
  const gana = ganadoraCuatrola(vista.mesa, triunfo).asiento;
  if (companeros.has(gana)) return masBaja(cartas, triunfo);
  const ganadoras = cartas.filter(
    (c) => ganadoraCuatrola([...vista.mesa, { asiento: yo, carta: c }], triunfo).asiento === yo,
  );
  return masBaja(ganadoras.length > 0 ? ganadoras : cartas, triunfo);
}

/**
 * Al salir, el jugador arrastra con el triunfo más alto que queda si lo tiene y aún hay
 * triunfos fuera. Si no, sale con un rey de un palo que no es triunfo o con su carta más baja.
 */
function salida(vista: VistaCuatrola, cartas: readonly IdCarta[]): IdCarta {
  const triunfo = vista.triunfo!;
  const mano = vista.miMano ?? [];
  if (vista.asiento === vista.jugador) {
    const jugadas = new Set(vista.bazasMano.flatMap((b) => b.cartas.map((j) => j.carta)));
    const fuera = crearBaraja('espanola40').filter(
      (c) => paloCuatrola(c, triunfo) === triunfo && !mano.includes(c) && !jugadas.has(c),
    );
    const mios = cartas.filter((c) => paloCuatrola(c, triunfo) === triunfo);
    if (fuera.length > 0 && mios.length > 0) {
      const alto = [...mios].sort(
        (a, b) => rangoCuatrola(b, triunfo) - rangoCuatrola(a, triunfo),
      )[0]!;
      if (fuera.every((c) => rangoCuatrola(c, triunfo) < rangoCuatrola(alto, triunfo))) return alto;
    }
  }
  const reyes = cartas.filter((c) => valorDe(c) === REY && paloCuatrola(c, triunfo) !== triunfo);
  if (reyes.length > 0) return reyes[0]!;
  const sinTriunfo = cartas.filter((c) => paloCuatrola(c, triunfo) !== triunfo);
  return masBaja(sinTriunfo.length > 0 ? sinTriunfo : cartas, triunfo);
}
