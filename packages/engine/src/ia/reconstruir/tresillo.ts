import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_TRESILLO,
  esMatadorTresillo,
  esTriunfoTresillo,
  paloEfectivoTresillo,
  rangoTresillo,
  tresillo,
  type AccionTresillo,
  type ConfigTresillo,
  type EstadoTresillo,
  type VistaTresillo,
} from '../../juegos/tresillo';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Huecos que se reparten además de las tres manos. */
const MONTE = 3;
const DESCARTES = 4;

/**
 * Un estado de Tresillo coherente con la vista: las manos ajenas, los descartes y el monte al
 * azar entre las cartas que no se ven, sin lo que cada uno no puede tener por las cartas que no
 * siguió. La carta vuelta sigue en el monte o, si el hombre ya ha robado, en su mano.
 */
export function reconstruirTresillo(vista: VistaTresillo, azar: EstadoAzar): EstadoTresillo {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const jugadas = vista.jugadasPor.flat();
  const triunfo = vista.triunfo;
  const vuelta = vista.vuelta;
  const vueltaFija = vuelta !== null && !mia.includes(vuelta) && !jugadas.includes(vuelta);
  // Hasta que el hombre roba, la vuelta es la primera del monte.
  const vueltaEnMonte = vueltaFija && vista.cambiadas[vista.hombre!] === null;
  const hombreConVuelta = vueltaFija && !vueltaEnMonte ? vista.hombre : null;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_TRESILLO, mia, jugadas, vueltaFija ? [vuelta] : []),
    azar,
  );
  const enDescartes =
    BARAJA_TRESILLO.length -
    vista.enMonte -
    jugadas.length -
    vista.cartasEnMano.reduce((s, n) => s + n, 0);
  const huecos = [
    ...vista.cartasEnMano.map((n, a) => (a === yo ? 0 : a === hombreConVuelta ? n - 1 : n)),
    vueltaEnMonte ? vista.enMonte - 1 : vista.enMonte,
    enDescartes,
  ];
  const admite = (a: Asiento, c: IdCarta) => {
    if (a >= MONTE) return true;
    if (a === yo) return false;
    if (triunfo === null) return true;
    const f = vista.fallos[a]!;
    if (f.palos.includes(paloEfectivoTresillo(c, triunfo))) return false;
    // Al no echar triunfo, no tenía los que le obligaban.
    if (f.triunfo > 0 && esTriunfoTresillo(c, triunfo)) {
      return esMatadorTresillo(c, triunfo) && rangoTresillo(c, triunfo) > f.triunfo;
    }
    return true;
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
  const manos = [0, 1, 2].map((a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    const m = repartidas[a]!;
    return a === hombreConVuelta ? [...m, vuelta!] : m;
  });
  const monte = repartidas[MONTE]!;
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    monte: vueltaEnMonte ? [vuelta!, ...monte] : monte,
    descartes: repartidas[DESCARTES]!,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    pujas: [...vista.pujas],
    pujaMayor: vista.pujaMayor,
    hombre: vista.hombre,
    contrato: vista.contrato,
    triunfo,
    vuelta,
    cambiadas: [...vista.cambiadas],
    descartando: vista.descartando,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    fallos: vista.fallos.map((f) => ({ palos: [...f.palos], triunfo: f.triunfo })),
    bazas: [...vista.bazas],
    fichas: [...vista.fichas],
    bote: vista.bote,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_TRESILLO: Simulable<
  ConfigTresillo,
  EstadoTresillo,
  AccionTresillo,
  VistaTresillo
> = {
  juego: tresillo,
  reconstruir: reconstruirTresillo,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El cambio, como la normal; la subasta, el triunfo y cada carta se simulan.
  decideLaBase: (vista) => vista.fase === 'cambio',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(tresillo.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    return (r ? r.cambioFichas[asiento]! : 0) + bono;
  },
  reconstrucciones: 40,
  presupuesto: 400,
};
