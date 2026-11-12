import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta, type PaloFrances } from '../../baraja/cartas';
import {
  BARAJA_TWENTY_NINE,
  paloTwentyNine,
  twentyNine,
  type AccionTwentyNine,
  type ConfigTwentyNine,
  type EstadoTwentyNine,
  type VistaTwentyNine,
} from '../../juegos/twenty-nine';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

const PALOS: readonly PaloFrances[] = ['picas', 'corazones', 'treboles', 'diamantes'];

/**
 * Un estado de Twenty-Nine coherente con la vista: las manos ajenas y las cartas por repartir al
 * azar entre las que no se ven, sin los palos que cada uno no siguió; y, si el triunfo está
 * oculto para el jugador, un palo al azar entre los que el que pujó no ha fallado.
 */
export function reconstruirTwentyNine(vista: VistaTwentyNine, azar: EstadoAzar): EstadoTwentyNine {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const jugadas = vista.jugadasPor.flat();
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_TWENTY_NINE, mia, jugadas),
    azar,
  );
  const g = new Generador(azarReparto);
  // Huecos: las cuatro manos (sin la propia) y las cuatro tandas pendientes.
  const huecos = [...vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)), ...vista.pendientes];
  const admite = (h: number, c: IdCarta) => {
    if (h >= 4) return true;
    if (h === yo) return false;
    return !vista.fallos[h]!.includes(paloTwentyNine(c));
  };
  let repartidas: IdCarta[][];
  try {
    repartidas = repartirConPermitidos(cartas, huecos, admite, g);
  } catch {
    // Sin poder cumplir lo que se sabe (no debería pasar), al azar respetando los tamaños.
    let i = 0;
    repartidas = huecos.map((n) => {
      const m = cartas.slice(i, i + n);
      i += n;
      return m;
    });
  }
  let triunfo = vista.triunfo;
  if (vista.triunfoOculto) {
    const fallados = vista.pujador === null ? [] : vista.fallos[vista.pujador]!;
    const posibles = PALOS.filter((p) => !fallados.includes(p));
    const lista = posibles.length > 0 ? posibles : PALOS;
    triunfo = lista[g.enteroHasta(lista.length)]!;
  }
  return {
    config: vista.config,
    azar: g.estado(),
    repartidor: vista.repartidor,
    manos: [0, 1, 2, 3].map((a: Asiento) =>
      a === yo && vista.miMano ? [...vista.miMano] : repartidas[a]!,
    ),
    pendientes: [0, 1, 2, 3].map((a) => repartidas[4 + a]!),
    fase: vista.fase,
    turno: vista.turno ?? 0,
    pujas: [...vista.pujas],
    pujaMayor: vista.pujaMayor,
    pujador: vista.pujador,
    puja: vista.puja,
    triunfo,
    sinTriunfo: vista.sinTriunfo,
    descubierto: vista.descubierto,
    multiplicador: vista.multiplicador,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    fallos: vista.fallos.map((f) => [...f]),
    puntosMano: vista.puntosMano,
    debeTriunfo: vista.debeTriunfo,
    pareja: vista.pareja,
    marcador: vista.marcador,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_TWENTY_NINE: Simulable<
  ConfigTwentyNine,
  EstadoTwentyNine,
  AccionTwentyNine,
  VistaTwentyNine
> = {
  juego: twentyNine,
  reconstruir: reconstruirTwentyNine,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // La subasta, el triunfo y doblar, como la normal; cada carta, pedir el triunfo y la pareja se simulan.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(twentyNine.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    return (r ? r.cambio[asiento % 2]! : 0) + bono;
  },
  reconstrucciones: 30,
  presupuesto: 300,
};
