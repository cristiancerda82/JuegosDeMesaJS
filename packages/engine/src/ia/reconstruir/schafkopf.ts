import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  asLlamado,
  BARAJA_SCHAFKOPF,
  paloEfectivoSchafkopf,
  schafkopf,
  type AccionSchafkopf,
  type ConfigSchafkopf,
  type EstadoSchafkopf,
  type VistaSchafkopf,
} from '../../juegos/schafkopf';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Schafkopf coherente con la vista: las manos ajenas al azar entre las cartas que
 * no se ven, sin los palos que cada uno no siguió, y en el Rufspiel con el As llamado (si no ha
 * salido) en la mano de uno de los que pueden tenerlo.
 */
export function reconstruirSchafkopf(vista: VistaSchafkopf, azar: EstadoAzar): EstadoSchafkopf {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_SCHAFKOPF, mia, ...vista.jugadasPor),
    azar,
  );
  const contrato = vista.contrato;
  const as = contrato?.tipo === 'rufspiel' ? asLlamado(contrato.palo) : null;
  // Quien juega no tiene el As que llamó; ni lo tiene quien ya echó otra carta de su palo en
  // la baza en curso (tendría que haber echado el As).
  const sinAs = new Set<Asiento>(vista.jugador === null ? [] : [vista.jugador]);
  if (as !== null && contrato?.tipo === 'rufspiel' && vista.mesa.length > 0) {
    if (paloEfectivoSchafkopf(vista.mesa[0]!.carta, contrato) === contrato.palo) {
      for (const j of vista.mesa) sinAs.add(j.asiento);
    }
  }
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n));
  const admite = (a: Asiento, c: IdCarta) =>
    a !== yo &&
    (contrato === null || !vista.fallos[a]!.includes(paloEfectivoSchafkopf(c, contrato))) &&
    (c !== as || !sinAs.has(a));
  const g = new Generador(azarReparto);
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
  const manos = repartidas.map((m, a) => (a === yo ? [...mia] : m));
  let companero: Asiento | null = null;
  if (vista.fase === 'bazas' && as !== null) {
    const enMano = manos.findIndex((m) => m.includes(as));
    companero = enMano >= 0 ? enMano : vista.jugadasPor.findIndex((cs) => cs.includes(as));
  }
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    anuncios: [...vista.anuncios],
    contrato: vista.contrato,
    jugador: vista.jugador,
    companero,
    companeroVisto: vista.companeroVisto,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    puntosMano: [...vista.puntosMano],
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    fallos: vista.fallos.map((f) => [...f]),
    fichas: [...vista.fichas],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_SCHAFKOPF: Simulable<
  ConfigSchafkopf,
  EstadoSchafkopf,
  AccionSchafkopf,
  VistaSchafkopf
> = {
  juego: schafkopf,
  reconstruir: reconstruirSchafkopf,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El contrato lo anuncia como la normal.
  decideLaBase: (vista) => vista.fase === 'anuncio',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(schafkopf.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r || r.jugador === null) return bono;
    // Además de las fichas, por cuántos puntos de cartas: distingue manos iguales.
    const lado = [r.jugador, ...(r.companero === null ? [] : [r.companero])];
    const mios = lado.includes(asiento) ? r.puntosJugador : 120 - r.puntosJugador;
    return r.fichasMano[asiento]! / 10 + (mios - 60) / 120 + bono;
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
