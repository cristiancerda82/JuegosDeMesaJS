import { crearAzar } from '../../src/baraja/azar';
import { barajar } from '../../src/baraja/barajar';
import { cartaDeId, crearBaraja, type IdCarta } from '../../src/baraja/cartas';
import { repartir } from '../../src/baraja/repartir';
import type { Asiento, Juego } from '../../src/motor/contrato';
import { error, ok } from '../../src/resultado';

/**
 * "Carta alta": juego mínimo para probar la suite del contrato.
 * 2 jugadores, 5 cartas cada uno; por turnos cada uno juega una carta y la más alta
 * se lleva un punto (en empate, la de salida). Ganador de la baza sale. 5 bazas.
 */
export interface ConfigJuguete {
  cartas: number;
}
export interface EstadoJuguete {
  manos: IdCarta[][];
  mazo: IdCarta[];
  mesa: IdCarta[];
  turno: Asiento;
  salida: Asiento;
  puntos: number[];
}
export type AccionJuguete = { tipo: 'jugar'; carta: IdCarta };
export interface VistaJuguete {
  asiento: Asiento | null;
  miMano: IdCarta[] | null;
  cartasEnMano: number[];
  mazo: number;
  mesa: IdCarta[];
  turno: Asiento;
  puntos: number[];
  mostrar?: IdCarta[][];
}

const valor = (id: IdCarta) => cartaDeId(id)!.valor;

export const juguete: Juego<ConfigJuguete, EstadoJuguete, AccionJuguete, VistaJuguete> = {
  id: 'juguete',
  crear(config, semilla) {
    if (config.cartas < 1 || config.cartas > 20) return error('Número de cartas inválido');
    const { cartas } = barajar(crearBaraja('espanola40'), crearAzar(semilla));
    const r = repartir(cartas, [config.cartas, config.cartas]);
    if (!r.ok) return r;
    return ok({
      manos: r.valor.manos,
      mazo: r.valor.mazo,
      mesa: [],
      turno: 0,
      salida: 0,
      puntos: [0, 0],
    });
  },
  asientos: () => 2,
  accionesLegales(estado, asiento) {
    if (juguete.resultado(estado) !== null || asiento !== estado.turno) return [];
    return estado.manos[asiento]!.map((carta) => ({ tipo: 'jugar', carta }));
  },
  transicion(estado, asiento, accion) {
    const manos = estado.manos.map((m, i) =>
      i === asiento ? m.filter((c) => c !== accion.carta) : m,
    );
    const mesa = [...estado.mesa, accion.carta];
    if (mesa.length < 2) return { ...estado, manos, mesa, turno: 1 - asiento };
    const [deSalida, respuesta] = mesa as [IdCarta, IdCarta];
    const ganador = valor(respuesta) > valor(deSalida) ? 1 - estado.salida : estado.salida;
    const puntos = estado.puntos.map((p, i) => (i === ganador ? p + 1 : p));
    return { ...estado, manos, mesa: [], turno: ganador, salida: ganador, puntos };
  },
  vistaDe(estado, asiento) {
    return {
      asiento,
      miMano: asiento === null ? null : [...estado.manos[asiento]!],
      cartasEnMano: estado.manos.map((m) => m.length),
      mazo: estado.mazo.length,
      mesa: [...estado.mesa],
      turno: estado.turno,
      puntos: [...estado.puntos],
    };
  },
  resultado(estado) {
    if (estado.manos.some((m) => m.length > 0) || estado.mesa.length > 0) return null;
    const [a, b] = estado.puntos as [number, number];
    if (a === b) return { ganadores: [], empate: true, puntos: estado.puntos };
    return { ganadores: [a > b ? 0 : 1], empate: false, puntos: estado.puntos };
  },
};

/** Oráculo: el mazo y las manos ajenas están ocultos. */
export function ocultasJuguete(estado: EstadoJuguete, asiento: Asiento | null): IdCarta[] {
  return [...estado.mazo, ...estado.manos.flatMap((m, i) => (i === asiento ? [] : m))];
}

// Versiones defectuosas: la suite del contrato debe detectarlas.

export const jugueteQueFiltra: typeof juguete = {
  ...juguete,
  vistaDe: (estado, asiento) => ({ ...juguete.vistaDe(estado, asiento), mostrar: estado.manos }),
};

export const jugueteQueMuta: typeof juguete = {
  ...juguete,
  transicion(estado, asiento, accion) {
    estado.puntos[asiento]! += 0.5;
    return juguete.transicion(estado, asiento, accion);
  },
};

let contador = 0;
export const jugueteNoDeterminista: typeof juguete = {
  ...juguete,
  crear: (config, semilla) => juguete.crear(config, `${semilla}-${contador++}`),
};
