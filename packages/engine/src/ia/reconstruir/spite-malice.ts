import { type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import type { IdCarta } from '../../baraja/cartas';
import {
  BARAJA_SPITE_MALICE,
  restarCartas,
  spiteMalice,
  type AccionSpiteMalice,
  type ConfigSpiteMalice,
  type EstadoSpiteMalice,
  type VistaSpiteMalice,
} from '../../juegos/spite-malice';
import type { Simulable } from '../niveles';
import { decisionSpite } from '../spite-malice-basica';
import { bonoPartida } from './comun';

/**
 * Un estado de Spite and Malice coherente con la vista. La mano del rival, las cartas boca abajo
 * de los dos montones y el mazo salen al azar de las cartas que no se ven, contando las copias.
 */
export function reconstruirSpiteMalice(
  vista: VistaSpiteMalice,
  azar: EstadoAzar,
): EstadoSpiteMalice {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const arriba = vista.montones.flatMap((m) => (m.arriba ? [m.arriba] : []));
  const vistas = [
    ...mia,
    ...arriba,
    ...vista.descartes.flat(2),
    ...vista.escaleras.flat(),
    ...vista.completas,
  ];
  const { cartas } = barajar(restarCartas(BARAJA_SPITE_MALICE, vistas), azar);
  let i = 0;
  const tomar = (n: number): IdCarta[] => {
    const r = cartas.slice(i, i + n);
    i += n;
    return r;
  };
  const manos = vista.cartasEnMano.map((n, a) => (a === yo ? [...mia] : tomar(n)));
  const montones = vista.montones.map((m) =>
    m.arriba === null ? [] : [...tomar(m.cartas - 1), m.arriba],
  );
  return {
    config: vista.config,
    azar,
    montones,
    manos,
    descartes: vista.descartes.map((ds) => ds.map((p) => [...p])),
    escaleras: vista.escaleras.map((x) => [...x]),
    completas: [...vista.completas],
    mazo: tomar(vista.enMazo),
    turno: vista.turno ?? 0,
    pasesSeguidos: vista.pasesSeguidos,
    ganador: vista.ganador,
    ultimaAccion: vista.ultimaAccion,
  };
}

const igual = (a: AccionSpiteMalice, b: AccionSpiteMalice) =>
  JSON.stringify(a) === JSON.stringify(b);

export const SIMULABLE_SPITE_MALICE: Simulable<
  ConfigSpiteMalice,
  EstadoSpiteMalice,
  AccionSpiteMalice,
  VistaSpiteMalice
> = {
  juego: spiteMalice,
  reconstruir: reconstruirSpiteMalice,
  // No hay manos: se simula un número fijo de jugadas.
  manoTerminada: () => false,
  horizonte: 40,
  valorar(_inicio, final, asiento) {
    const mio = final.montones[asiento]!.length;
    const suyo = final.montones[1 - asiento]!.length;
    return suyo - mio + bonoPartida(spiteMalice.resultado(final), asiento) / 100;
  },
  // Pocas candidatas: la de la normal, las del montón, las primeras de cada cadena posible y los
  // descartes de la normal en cada pila.
  candidatas(vista, acciones, deLaBase) {
    const elegidas: AccionSpiteMalice[] = [deLaBase];
    const anadir = (a: AccionSpiteMalice | null | undefined) => {
      if (a && acciones.some((x) => igual(x, a)) && !elegidas.some((x) => igual(x, a))) {
        elegidas.push(a);
      }
    };
    for (const a of acciones) {
      if (a.tipo === 'jugar' && a.desde.tipo === 'monton') anadir(a);
    }
    const base = decisionSpite(vista);
    if (base?.tipo === 'descartar') {
      for (let pila = 0; pila < 4; pila++) anadir({ ...base, pila });
    }
    // Las jugadas que no son de K desde la mano o los descartes, hasta completar 8.
    for (const a of acciones) {
      if (elegidas.length >= 8) break;
      if (a.tipo === 'jugar') anadir(a);
    }
    return elegidas;
  },
  reconstrucciones: 12,
  presupuesto: 60,
};
