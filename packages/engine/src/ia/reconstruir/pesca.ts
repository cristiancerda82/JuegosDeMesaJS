import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  pesca,
  valorPesca,
  type AccionPesca,
  type ConfigPesca,
  type EstadoPesca,
  type VistaPesca,
} from '../../juegos/pesca';
import type { Simulable } from '../niveles';
import { conocimientoPesca } from '../pesca-basica';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Pesca coherente con la vista y con lo que se sabe por el registro: las cartas
 * que se dieron o se enseñaron siguen en su mano, cada uno tiene al menos una carta de los
 * valores que tiene seguro y ninguna de los que no tiene; el resto, al azar con el mar.
 */
export function reconstruirPesca(vista: VistaPesca, azar: EstadoAzar): EstadoPesca {
  const yo = vista.asiento;
  const n = vista.config.jugadores;
  const sabido = conocimientoPesca(vista);
  const bajadas = new Set(vista.cuartetos.flat());
  const conocidas = sabido.flatMap((s, a) => (a === yo ? [] : s.cartas));
  const g = new Generador(azar);
  const { cartas } = barajar(
    cartasFuera(crearBaraja('francesa52'), vista.miMano ?? [], conocidas).filter(
      (c) => !bajadas.has(valorPesca(c)),
    ),
    g.estado(),
  );
  g.enteroHasta(1000);
  const libres = [...cartas];
  const manos: IdCarta[][] = sabido.map((s, a) =>
    a === yo ? [...(vista.miMano ?? [])] : [...s.cartas],
  );
  // Una carta de cada valor que tiene seguro y no cubren las que ya se saben.
  sabido.forEach((s, a) => {
    if (a === yo) return;
    for (const valor of s.tiene) {
      if (manos[a]!.some((c) => valorPesca(c) === valor)) continue;
      if (manos[a]!.length >= vista.cartasEnMano[a]!) break;
      const i = libres.findIndex((c) => valorPesca(c) === valor);
      if (i >= 0) manos[a]!.push(...libres.splice(i, 1));
    }
  });
  // El resto, con el mar como un asiento más al final.
  const huecos = [
    ...vista.cartasEnMano.map((k, a) => (a === yo ? 0 : k - manos[a]!.length)),
    vista.enMar,
  ];
  const reparto = (conRestricciones: boolean) =>
    repartirConPermitidos(
      libres,
      huecos,
      (a, c) => !conRestricciones || a === n || !sabido[a]!.noTiene.has(valorPesca(c)),
      new Generador(g.estado()),
    );
  let repartidas: IdCarta[][];
  try {
    repartidas = reparto(true);
  } catch {
    repartidas = reparto(false);
  }
  const final = manos.map((m, a) => (a === yo ? m : [...m, ...repartidas[a]!]));
  separarCuartetos(final, repartidas, yo, sabido, n);
  return {
    config: vista.config,
    azar,
    manos: final,
    mar: repartidas[n]!,
    cuartetos: vista.cuartetos.map((c) => [...c]),
    turno: vista.turno ?? 0,
    registro: [...vista.registro],
  };
}

/**
 * En una partida real nadie guarda las cuatro cartas de un valor: se bajan enseguida. Si el
 * reparto al azar deja un cuarteto en una mano, se cambia una de sus cartas (de las repartidas
 * al azar) por otra del mar o de otra mano, respetando lo que se sabe.
 */
function separarCuartetos(
  manos: IdCarta[][],
  repartidas: IdCarta[][],
  yo: number | null,
  sabido: ReturnType<typeof conocimientoPesca>,
  n: number,
) {
  const cuenta = (cs: readonly IdCarta[], v: number) =>
    cs.filter((c) => valorPesca(c) === v).length;
  const admite = (s: number, c: IdCarta) => s === n || !sabido[s]!.noTiene.has(valorPesca(c));
  // Las cartas de cada sitio que se pueden mover: las repartidas al azar.
  const sitio = (s: number) => (s === n ? repartidas[n]! : manos[s]!);
  for (let q = 0; q < n; q++) {
    if (q === yo) continue;
    for (let v = 1; v <= 13; v++) {
      if (cuenta(manos[q]!, v) < 4) continue;
      const mia = repartidas[q]!.find((c) => valorPesca(c) === v);
      if (!mia) continue;
      const otros = [n, ...Array.from({ length: n }, (_, s) => s)].filter(
        (s) => s !== q && s !== yo,
      );
      for (const s of otros) {
        const movibles = s === n ? repartidas[n]! : repartidas[s]!;
        const otra = movibles.find(
          (c) =>
            valorPesca(c) !== v &&
            admite(q, c) &&
            admite(s, mia) &&
            cuenta(manos[q]!, valorPesca(c)) < 3 &&
            (s === n || cuenta(sitio(s), v) < 3),
        );
        if (!otra) continue;
        const cambiar = (cs: IdCarta[], fuera: IdCarta, dentro: IdCarta) => {
          cs[cs.indexOf(fuera)] = dentro;
        };
        cambiar(manos[q]!, mia, otra);
        cambiar(repartidas[q]!, mia, otra);
        if (s !== n) cambiar(manos[s]!, otra, mia);
        cambiar(movibles, otra, mia);
        break;
      }
    }
  }
}

export const SIMULABLE_PESCA: Simulable<ConfigPesca, EstadoPesca, AccionPesca, VistaPesca> = {
  juego: pesca,
  reconstruir: reconstruirPesca,
  // No hay manos: se simula un número fijo de jugadas.
  manoTerminada: () => false,
  horizonte: 24,
  // Si se sabe que un rival tiene uno de sus valores, pedírselo es lo mejor: decide la normal.
  decideLaBase(vista) {
    const yo = vista.asiento!;
    const mios = new Set((vista.miMano ?? []).map(valorPesca));
    return conocimientoPesca(vista).some(
      (s, a) => a !== yo && vista.cartasEnMano[a]! > 0 && [...s.tiene].some((v) => mios.has(v)),
    );
  },
  valorar(_inicio, final, asiento) {
    const mios = final.cuartetos[asiento]!.length;
    const rival = Math.max(...final.cuartetos.map((c, a) => (a === asiento ? 0 : c.length)));
    return (
      mios -
      rival +
      final.manos[asiento]!.length / 20 +
      bonoPartida(pesca.resultado(final), asiento) / 100
    );
  },
  reconstrucciones: 10,
  presupuesto: 80,
};
