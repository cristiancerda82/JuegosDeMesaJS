import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_ECARTE,
  ecarte,
  esReyEcarte,
  paloEcarte,
  type AccionEcarte,
  type ConfigEcarte,
  type EstadoEcarte,
  type VistaEcarte,
} from '../../juegos/ecarte';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Huecos que se reparten además de las dos manos. */
const MONTON = 2;
const DESCARTES = 3;

/**
 * Un estado de Écarté coherente con la vista: la mano del rival, el montón y los descartes del
 * rival, al azar entre las cartas que no se ven, sin los palos (ni triunfos) que el rival no
 * siguió. Si el rival anunció el rey de triunfo y aún no lo ha jugado, está en su mano.
 */
export function reconstruirEcarte(vista: VistaEcarte, azar: EstadoAzar): EstadoEcarte {
  const yo = vista.asiento ?? 0;
  const rival: Asiento = yo === 0 ? 1 : 0;
  const triunfo = paloEcarte(vista.vuelta);
  const jugadas = [...vista.jugadas, ...vista.mesa].map((j) => j.carta);
  const rey = BARAJA_ECARTE.find((c) => esReyEcarte(c) && paloEcarte(c) === triunfo)!;
  const reyDelRival = vista.rey === rival && !jugadas.includes(rey);
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      BARAJA_ECARTE,
      vista.miMano ?? [],
      vista.misDescartes,
      [vista.vuelta],
      jugadas,
      reyDelRival ? [rey] : [],
    ),
    azar,
  );
  const huecos = [0, 0, vista.enMonton, vista.enDescarte[rival]!];
  huecos[rival] = vista.cartasEnMano[rival]! - (reyDelRival ? 1 : 0);
  const fallos = vista.fallos[rival]!;
  const admite = (a: Asiento, c: IdCarta) => {
    if (a !== rival) return true;
    if (fallos.includes(paloEcarte(c))) return false;
    return !(fallos.includes('triunfo') && paloEcarte(c) === triunfo);
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
  const manos: IdCarta[][] = [[], []];
  manos[yo] = [...(vista.miMano ?? [])];
  manos[rival] = [...repartidas[rival]!, ...(reyDelRival ? [rey] : [])];
  const descartes: IdCarta[][] = [[], []];
  descartes[yo] = [...vista.misDescartes];
  descartes[rival] = repartidas[DESCARTES]!;
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    vuelta: vista.vuelta,
    manos,
    monton: repartidas[MONTON]!,
    descartes,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    cambiando: vista.cambiando,
    propuestas: vista.propuestas,
    autoridad: vista.autoridad,
    reyVuelto: vista.reyVuelto,
    rey: vista.rey,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadas: [...vista.jugadas],
    bazas: vista.bazas,
    fallos: vista.fallos.map((f) => [...f]),
    puntosMano: vista.puntosMano,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_ECARTE: Simulable<ConfigEcarte, EstadoEcarte, AccionEcarte, VistaEcarte> = {
  juego: ecarte,
  reconstruir: reconstruirEcarte,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(ecarte.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    const p = r ? r.puntosMano : final.puntosMano;
    const mio = asiento as 0 | 1;
    return p[mio] - p[1 - mio]! + bono;
  },
  reconstrucciones: 60,
  presupuesto: 400,
};
