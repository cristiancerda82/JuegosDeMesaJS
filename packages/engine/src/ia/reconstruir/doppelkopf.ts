import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import type { IdCarta } from '../../baraja/cartas';
import {
  BARAJA_DOPPELKOPF,
  DAMA_TREBOLES,
  doppelkopf,
  paloJuegoDoppelkopf,
  type AccionDoppelkopf,
  type ConfigDoppelkopf,
  type EstadoDoppelkopf,
  type VistaDoppelkopf,
} from '../../juegos/doppelkopf';
import { quitarUna, restarCartas } from '../../juegos/spite-malice';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Los palos (o `'triunfo'`) que cada asiento no tiene, por no haber seguido la salida. */
function fallos(vista: VistaDoppelkopf): Set<string>[] {
  const r = Array.from({ length: 4 }, () => new Set<string>());
  if (vista.fase !== 'bazas') return r;
  for (const cartas of [...vista.bazas.map((b) => b.cartas), vista.mesa]) {
    if (cartas.length === 0) continue;
    const palo = paloJuegoDoppelkopf(cartas[0]!.carta, vista.juego);
    for (const j of cartas.slice(1)) {
      if (paloJuegoDoppelkopf(j.carta, vista.juego) !== palo) r[j.asiento]!.add(palo);
    }
  }
  return r;
}

/**
 * Cuántas Q de tréboles tiene que tener ahora cada asiento, si se sabe (`null` si no). En el
 * juego normal, además, cada asiento sin saber tiene como mucho una.
 */
function damasObligadas(vista: VistaDoppelkopf, jugadas: readonly number[]): (number | null)[] {
  return vista.cartasEnMano.map((_, a) => {
    if (vista.reservas[a] === 'boda') return 2 - jugadas[a]!;
    if (vista.fase !== 'bazas' || vista.juego !== 'normal') return null;
    const bando = vista.bandos[a];
    if (bando === 're') return 1 - jugadas[a]!;
    if (bando === 'contra') return 0;
    return null;
  });
}

/**
 * Un estado de Doppelkopf coherente con la vista: las manos ajenas al azar entre las cartas que
 * no se ven, sin los palos que alguien ya no tiene y con las Q de tréboles donde se sabe que
 * están. En el juego normal, las dos Q de tréboles quedan en manos distintas.
 */
export function reconstruirDoppelkopf(vista: VistaDoppelkopf, azar: EstadoAzar): EstadoDoppelkopf {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const todasJugadas = [...vista.bazas.flatMap((b) => b.cartas), ...vista.mesa];
  const { cartas: ocultas, azar: azarReparto } = barajar(
    restarCartas(BARAJA_DOPPELKOPF, [...mia, ...todasJugadas.map((j) => j.carta)]),
    azar,
  );
  const g = new Generador(azarReparto);
  const jugadas = vista.cartasEnMano.map(
    (_, a) => todasJugadas.filter((j) => j.asiento === a && j.carta === DAMA_TREBOLES).length,
  );
  const sinPalo = fallos(vista);
  const paloDama = paloJuegoDoppelkopf(DAMA_TREBOLES, vista.juego);
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n));
  const manos: IdCarta[][] = huecos.map(() => []);
  let resto = [...ocultas];

  const obligadas = damasObligadas(vista, jugadas);
  const ocultasDama = resto.filter((c) => c === DAMA_TREBOLES).length;
  const normal = vista.fase === 'bazas' && vista.juego === 'normal';
  let repartoDamas: number[] | null = huecos.map((_, a) =>
    a === yo ? 0 : Math.max(0, obligadas[a] ?? 0),
  );
  let libres = ocultasDama - repartoDamas.reduce((s, n) => s + n, 0);
  if (normal && libres > 0) {
    // Las que quedan, cada una a un asiento distinto de los que no se saben.
    const candidatos = huecos.flatMap((n, a) =>
      a !== yo && obligadas[a] === null && n > 0 && !sinPalo[a]!.has(paloDama) ? [a] : [],
    );
    while (libres > 0 && candidatos.length > 0) {
      const a = candidatos.splice(g.enteroHasta(candidatos.length), 1)[0]!;
      repartoDamas[a]!++;
      libres--;
    }
  }
  if (libres < 0 || (normal && libres > 0) || repartoDamas.some((n, a) => n > huecos[a]!)) {
    repartoDamas = null;
  }

  let repartidas: IdCarta[][] | null = null;
  if (repartoDamas !== null) {
    const fijas = repartoDamas;
    for (let a = 0; a < fijas.length; a++) {
      for (let k = 0; k < fijas[a]!; k++) {
        manos[a]!.push(DAMA_TREBOLES);
        resto = quitarUna(resto, DAMA_TREBOLES);
      }
    }
    const libresDama = (a: Asiento) => !normal && obligadas[a] === null;
    const admite = (a: Asiento, c: IdCarta) =>
      a !== yo &&
      !sinPalo[a]!.has(paloJuegoDoppelkopf(c, vista.juego)) &&
      (c !== DAMA_TREBOLES || libresDama(a));
    try {
      const restoHuecos = huecos.map((n, a) => n - fijas[a]!);
      repartidas = repartirConPermitidos(resto, restoHuecos, admite, g).map((m, a) => [
        ...manos[a]!,
        ...m,
      ]);
    } catch {
      repartidas = null;
    }
  }
  if (repartidas === null) {
    // Sin poder cumplir lo que se sabe (no debería pasar), al azar respetando los tamaños.
    let i = 0;
    repartidas = huecos.map((n) => {
      const m = ocultas.slice(i, i + n);
      i += n;
      return m;
    });
  }
  const finales = repartidas.map((m, a) => (a === yo ? [...mia] : m));

  let re: Asiento[] = [];
  if (vista.fase === 'bazas') {
    if (vista.juego === 'normal') {
      re = finales.flatMap((m, a) => (m.includes(DAMA_TREBOLES) || jugadas[a]! > 0 ? [a] : []));
    } else if (vista.juego === 'boda' && vista.pareja !== null) {
      re = [vista.solista!, vista.pareja].sort();
    } else {
      re = [vista.solista!];
    }
  }

  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    salida: vista.salida,
    manos: finales,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    reservas: [...vista.reservas],
    juego: vista.juego,
    solista: vista.solista,
    pareja: vista.pareja,
    bazaPareja: vista.bazaPareja,
    re,
    mesa: [...vista.mesa],
    bazas: [...vista.bazas],
    anuncios: [...vista.anuncios],
    puntos: [...vista.puntos],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_DOPPELKOPF: Simulable<
  ConfigDoppelkopf,
  EstadoDoppelkopf,
  AccionDoppelkopf,
  VistaDoppelkopf
> = {
  juego: doppelkopf,
  reconstruir: reconstruirDoppelkopf,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // Las reservas las decide la base; los anuncios también (ver `candidatas`).
  decideLaBase: (vista) => vista.fase === 'reservas',
  candidatas: (_vista, acciones, deLaBase) =>
    deLaBase.tipo === 'anunciar' ? [deLaBase] : acciones.filter((a) => a.tipo !== 'anunciar'),
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(doppelkopf.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    // Además de lo que gana, por cuántos puntos de cartas: distingue manos iguales.
    const mias = r.re.includes(asiento) ? r.cartasRe : r.cartasContra;
    return r.cambio[asiento]! + (mias - 120) / 100 + bono;
  },
  reconstrucciones: 10,
  presupuesto: 60,
};
