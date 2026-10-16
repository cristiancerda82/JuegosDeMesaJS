import { crearAzar, Generador, type EstadoAzar } from '../../src/baraja/azar';
import type { Agente } from '../../src/ia/agente';
import type { Asiento, Juego } from '../../src/motor/contrato';
import { igualesJSON } from '../../src/motor/json';

export interface ResultadoDuelo {
  /** Partidas que ganó el lado A. */
  readonly ganadas: number;
  readonly partidas: number;
  /** Decisión más lenta de los agentes del lado A, en ms. */
  readonly maxMs: number;
}

/** Una decisión más lenta que esto se vuelve a medir hasta `REPETICIONES` veces. */
const LENTA_MS = 100;
const REPETICIONES = 3;

/**
 * Enfrenta dos agentes: en la partida `i`, los asientos para los que `esA(asiento, i)` es
 * cierto juegan con `a` y el resto con `b`. Si varios asientos pueden actuar a la vez, el que
 * actúa se elige al azar. Gana el lado A si alguno de sus asientos está entre los ganadores.
 */
export function duelo<C, E, A, V>(
  juego: Juego<C, E, A, V>,
  config: C,
  a: Agente<V, A>,
  b: Agente<V, A>,
  partidas: number,
  esA: (asiento: Asiento, i: number) => boolean,
  prefijo = 'duelo',
): ResultadoDuelo {
  let ganadas = 0;
  let maxMs = 0;
  for (let i = 0; i < partidas; i++) {
    const semilla = `${prefijo}-${i}`;
    const creado = juego.crear(config, semilla);
    if (!creado.ok) throw new Error(creado.error);
    let e = creado.valor;
    const n = juego.asientos(e);
    const azares: EstadoAzar[] = Array.from({ length: n }, (_, s) => crearAzar(`${semilla}/${s}`));
    const orden = new Generador(crearAzar(`${semilla}/orden`));
    for (let paso = 0; juego.resultado(e) === null; paso++) {
      if (paso > 100_000) throw new Error('La partida no termina');
      const pueden = Array.from({ length: n }, (_, s) => s).filter(
        (s) => juego.accionesLegales(e, s).length > 0,
      );
      const s = pueden[orden.enteroHasta(pueden.length)]!;
      const acciones = juego.accionesLegales(e, s);
      const deA = esA(s, i);
      const decidir = () => (deA ? a : b).decidir(juego.vistaDe(e, s), acciones, azares[s]!);
      let inicio = Date.now();
      const d = decidir();
      if (deA) {
        // Con los demás ficheros de test en paralelo, una decisión puede salir lenta por la
        // carga del equipo. Es determinista: si sale lenta se repite y cuenta la más rápida.
        let ms = Date.now() - inicio;
        for (let repeticion = 0; repeticion < REPETICIONES && ms > LENTA_MS; repeticion++) {
          inicio = Date.now();
          decidir();
          ms = Math.min(ms, Date.now() - inicio);
        }
        maxMs = Math.max(maxMs, ms);
      }
      if (!acciones.some((x) => igualesJSON(x, d.accion))) {
        throw new Error(`Acción ilegal de ${(deA ? a : b).id}`);
      }
      azares[s] = d.azar;
      e = juego.transicion(e, s, d.accion);
    }
    const fin = juego.resultado(e)!;
    if (fin.ganadores.some((s) => esA(s, i))) ganadas++;
  }
  return { ganadas, partidas, maxMs };
}

/** Lados para juegos por parejas: A son los asientos del bando `i % 2`. */
export const porBandos = (asiento: Asiento, i: number) => asiento % 2 === i % 2;

/** Lados para juegos individuales con `n` asientos: A es el asiento `i % n`. */
export const unoContraTodos = (n: number) => (asiento: Asiento, i: number) => asiento === i % n;
