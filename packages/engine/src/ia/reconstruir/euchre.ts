import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_EUCHRE,
  euchre,
  paloEuchre,
  parejaEuchre,
  type AccionEuchre,
  type ConfigEuchre,
  type EstadoEuchre,
  type VistaEuchre,
} from '../../juegos/euchre';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Euchre coherente con la vista. Las manos ajenas salen al azar de las cartas que no
 * se ven, sin los palos de salida que cada uno no siguió; si el repartidor recogió la carta
 * vuelta y no la ha jugado, sigue en su mano. Lo que sobra son las 3 ocultas y el descarte.
 */
export function reconstruirEuchre(vista: VistaEuchre, azar: EstadoAzar): EstadoEuchre {
  const yo = vista.asiento;
  const jugadas = [...vista.jugadas, ...vista.mesa.map((j) => j.carta)];
  // Si se descartó de ella no se sabe; se supone que la guarda mientras le queden cartas.
  const vueltaAjena =
    vista.recogioVuelta &&
    vista.repartidor !== yo &&
    vista.cartasEnMano[vista.repartidor]! > 0 &&
    !jugadas.includes(vista.cartaVuelta);
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      BARAJA_EUCHRE,
      vista.miMano ?? [],
      jugadas,
      [vista.cartaVuelta],
      vista.descarte ? [vista.descarte] : [],
    ),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) =>
    a === yo ? 0 : a === vista.repartidor && vueltaAjena ? n - 1 : n,
  );
  const sobran = cartas.length - huecos.reduce((s, n) => s + n, 0);
  // Un asiento más para lo que sobra: las ocultas y el descarte ajeno.
  const repartidas = repartirConPermitidos(
    cartas,
    [...huecos, sobran],
    (a, c) => a === huecos.length || !vista.fallos[a]!.includes(paloEuchre(c, vista.triunfo)),
    new Generador(azarReparto),
  );
  const manos = vista.cartasEnMano.map((_, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    if (a === vista.repartidor && vueltaAjena) return [...repartidas[a]!, vista.cartaVuelta];
    return repartidas[a]!;
  });
  const resto = repartidas[huecos.length]!;
  // El repartidor ajeno ya se descartó: una de las que sobran es su descarte.
  const hayDescarte = vista.recogioVuelta && vista.fase !== 'descarte' && vista.descarte === null;
  // Si no puede tenerla en la mano ni la ha jugado, se descartó de la carta vuelta.
  const vueltaDescartada =
    hayDescarte && !vueltaAjena && vista.repartidor !== yo && !jugadas.includes(vista.cartaVuelta);
  const descarte =
    vista.descarte ?? (hayDescarte ? (vueltaDescartada ? vista.cartaVuelta : resto[0]!) : null);
  const ocultas: IdCarta[] = hayDescarte && !vueltaDescartada ? resto.slice(1) : resto;
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    manos,
    cartaVuelta: vista.cartaVuelta,
    ocultas,
    turno: vista.turno ?? 0,
    pasaron: vista.pasaron,
    triunfo: vista.triunfo,
    elige: vista.elige,
    solo: vista.solo,
    fuera: vista.fuera,
    recogioVuelta: vista.recogioVuelta,
    descarte,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: [...vista.bazas],
    fallos: vista.fallos.map((f) => [...f]),
    jugadas: [...vista.jugadas],
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
    manosAnuladas: vista.manosAnuladas,
    ultimaAccion: vista.ultimaAccion as EstadoEuchre['ultimaAccion'],
  };
}

export const SIMULABLE_EUCHRE: Simulable<ConfigEuchre, EstadoEuchre, AccionEuchre, VistaEuchre> = {
  juego: euchre,
  reconstruir: reconstruirEuchre,
  manoTerminada: (inicio, e) =>
    e.resultadosManos.length > inicio.resultadosManos.length ||
    e.manosAnuladas > inicio.manosAnuladas,
  // Elegir el triunfo, jugar solo y el descarte, como la normal: solo se simulan las bazas.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mia = parejaEuchre(asiento);
    return (
      3 * (cerrada.puntosMano[mia] - cerrada.puntosMano[1 - mia]!) +
      0.5 * (cerrada.bazas[mia] - cerrada.bazas[1 - mia]!) +
      bonoPartida(euchre.resultado(final), asiento)
    );
  },
  reconstrucciones: 20,
  presupuesto: 100,
};
