import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_PREFERENCE,
  paloPreference,
  preference,
  triunfoPreference,
  type AccionPreference,
  type ConfigPreference,
  type EstadoPreference,
  type VistaPreference,
} from '../../juegos/preference';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Huecos que se reparten además de las tres manos. */
const VIUDA = 3;
const DESCARTES = 4;

/**
 * Un estado de Préférence coherente con la vista: las manos ajenas, la viuda sin enseñar y los
 * descartes ajenos al azar entre las cartas que no se ven, sin los palos (ni triunfos) que cada
 * uno no siguió. Las cartas de la viuda enseñada que no han salido están en la mano del que
 * juega o en sus descartes.
 */
export function reconstruirPreference(vista: VistaPreference, azar: EstadoAzar): EstadoPreference {
  const yo = vista.asiento;
  const juega = vista.juega;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_PREFERENCE, vista.miMano ?? [], vista.misDescartes, ...vista.jugadasPor),
    azar,
  );
  const viudaVista = vista.viuda;
  const descartesAjenos = juega !== null && juega !== yo ? vista.enDescarte : 0;
  const huecos = [
    ...vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)),
    viudaVista === null ? 2 : 0,
    descartesAjenos,
  ];
  const triunfo = triunfoPreference(vista.contrato);
  const admite = (a: Asiento, c: IdCarta) => {
    if (viudaVista?.includes(c)) return a === juega || a === DESCARTES;
    if (a >= VIUDA) return true;
    if (a === yo) return false;
    const f = vista.fallos[a]!;
    if (f.includes(paloPreference(c))) return false;
    return !(f.includes('triunfo') && triunfo !== null && paloPreference(c) === triunfo);
  };
  let repartidas: IdCarta[][];
  try {
    repartidas = repartirConPermitidos(cartas, huecos, admite, new Generador(azarReparto));
  } catch {
    // Sin poder cumplir lo que se sabe (no debería pasar), al azar respetando los tamaños.
    let i = 0;
    repartidas = huecos.map((n) => {
      const m = cartas.slice(i, i + n);
      i += n;
      return m;
    });
  }
  const manos = [0, 1, 2].map((a) =>
    a === yo && vista.miMano ? [...vista.miMano] : repartidas[a]!,
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    pujas: [...vista.pujas],
    pujoAntes: [...vista.pujoAntes],
    mejor: vista.mejor,
    manos,
    viuda: viudaVista === null ? repartidas[VIUDA]! : [...viudaVista],
    viudaVista: viudaVista !== null,
    descartes: juega === yo ? [...vista.misDescartes] : repartidas[DESCARTES]!,
    juega,
    contrato: vista.contrato,
    whist: [...vista.whist],
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    fallos: vista.fallos.map((f) => [...f]),
    pulka: [...vista.pulka],
    montana: [...vista.montana],
    whists: vista.whists.map((f) => [...f]),
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_PREFERENCE: Simulable<
  ConfigPreference,
  EstadoPreference,
  AccionPreference,
  VistaPreference
> = {
  juego: preference,
  reconstruir: reconstruirPreference,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // Pujar, descartar, declarar y el whist, como la normal: solo se simulan las bazas.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(preference.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    return r.saldo[asiento]! / 10 + bono;
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
