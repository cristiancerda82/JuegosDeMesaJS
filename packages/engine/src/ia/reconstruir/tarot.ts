import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { BARAJA_TAROT, esExcusa, esTriunfoTarot, type IdCarta } from '../../baraja/cartas';
import {
  esOudler,
  esRey,
  paloTarot,
  tarot,
  type AccionTarot,
  type ConfigTarot,
  type EstadoTarot,
  type VistaTarot,
} from '../../juegos/tarot';
import { restarCartas } from '../../juegos/spite-malice';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Los palos (o `'triunfo'`) que cada asiento ya no tiene, por lo que ha jugado. */
function fallosTarot(vista: VistaTarot): Set<string>[] {
  const r = Array.from({ length: vista.config.jugadores }, () => new Set<string>());
  for (const cartas of [...vista.bazas.map((b) => b.cartas), vista.mesa]) {
    let palo: string | null = null;
    for (const j of cartas) {
      const p = paloTarot(j.carta);
      if (p === 'excusa') continue;
      if (palo === null) {
        palo = p;
        continue;
      }
      if (p === palo) continue;
      // No siguió: no tiene ese palo; y si tampoco jugó triunfo, no tiene triunfos.
      r[j.asiento]!.add(palo);
      if (p !== 'triunfo') r[j.asiento]!.add('triunfo');
    }
  }
  return r;
}

/**
 * Un estado de Tarot coherente con la vista. Las cartas que no se ven se reparten al azar
 * entre las manos ajenas, el descarte (si no es del jugador) y el perro (si no se ha
 * enseñado), respetando lo que se sabe:
 * - los palos que alguien ya no tiene;
 * - los triunfos de las poignées que no se han jugado, en la mano de quien las enseñó;
 * - el perro enseñado, en la mano del preneur o en su descarte;
 * - en el descarte, ni triunfos (se enseñan) ni Reyes ni oudlers;
 * - la carta llamada, nunca en la mano del preneur.
 */
export function reconstruirTarot(vista: VistaTarot, azar: EstadoAzar): EstadoTarot {
  const n = vista.config.jugadores;
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const jugadas = [...vista.bazas.flatMap((b) => b.cartas), ...vista.mesa];
  const jugadasIds = jugadas.map((j) => j.carta);
  const fijas: IdCarta[][] = Array.from({ length: n }, () => []);
  for (const p of vista.poignees) {
    if (p.asiento === yo) continue;
    const jugoEl = jugadas.filter((j) => j.asiento === p.asiento).map((j) => j.carta);
    fijas[p.asiento]!.push(...p.cartas.filter((c) => !jugoEl.includes(c)));
  }
  const descarteFijo = [...vista.descarte];
  const { cartas: ocultas, azar: azarReparto } = barajar(
    restarCartas(BARAJA_TAROT, [...mia, ...jugadasIds, ...fijas.flat(), ...descarteFijo]),
    azar,
  );
  const g = new Generador(azarReparto);
  const sinPalo = fallosTarot(vista);
  const D = n;
  const P = n + 1;
  const huecos = [
    ...vista.cartasEnMano.map((m, a) => (a === yo ? 0 : m - fijas[a]!.length)),
    vista.enDescarte - descarteFijo.length,
    vista.perro === null ? vista.enPerro : 0,
  ];
  const perroVisto = new Set(vista.perro ?? []);
  const admite = (s: number, c: IdCarta) => {
    if (s === P) return true;
    if (s === D) return !esTriunfoTarot(c) && !esOudler(c) && !esRey(c);
    if (s === yo) return false;
    if (perroVisto.has(c) && s !== vista.preneur) return false;
    if (c === vista.llamada && s === vista.preneur) return false;
    if (esExcusa(c)) return true;
    return !sinPalo[s]!.has(paloTarot(c));
  };
  let repartidas: IdCarta[][];
  try {
    repartidas = repartirConPermitidos(ocultas, huecos, admite, g);
  } catch {
    // Sin poder cumplir lo que se sabe (no debería pasar), al azar respetando los tamaños.
    let i = 0;
    repartidas = huecos.map((k) => {
      const m = ocultas.slice(i, i + k);
      i += k;
      return m;
    });
  }
  const manos = vista.cartasEnMano.map((_, a) =>
    a === yo ? [...mia] : [...fijas[a]!, ...repartidas[a]!],
  );
  const llamada = vista.llamada;
  let pareja: Asiento | null = null;
  if (llamada !== null) {
    const jugo = jugadas.find((j) => j.carta === llamada);
    if (jugo) pareja = jugo.asiento;
    else {
      const tiene = manos.findIndex((m, a) => a !== vista.preneur && m.includes(llamada));
      pareja = tiene >= 0 ? tiene : null;
    }
  }
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    perro: vista.perro ? [...vista.perro] : repartidas[P]!,
    descarte: [...descarteFijo, ...repartidas[D]!],
    fase: vista.fase,
    turno: vista.turno ?? 0,
    dichos: [...vista.dichos],
    contrato: vista.contrato,
    preneur: vista.preneur,
    llamada,
    pareja,
    parejaDescubierta: llamada !== null && jugadasIds.includes(llamada),
    poignees: [...vista.poignees],
    mesa: [...vista.mesa],
    bazas: [...vista.bazas],
    puntos: [...vista.puntos],
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Puntos de partida que valen como una unidad de valoración. */
const ESCALA = 25;

export const SIMULABLE_TAROT: Simulable<ConfigTarot, EstadoTarot, AccionTarot, VistaTarot> = {
  juego: tarot,
  reconstruir: reconstruirTarot,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // La subasta, la llamada y el descarte los decide la base; la poignée también (`candidatas`).
  decideLaBase: (vista) => vista.fase !== 'bazas',
  candidatas: (_vista, acciones, deLaBase) =>
    deLaBase.tipo === 'poignee' ? [deLaBase] : acciones.filter((a) => a.tipo !== 'poignee'),
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(tarot.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    return r.cambio[asiento]! / ESCALA + bono;
  },
  reconstrucciones: 10,
  presupuesto: 60,
};
