import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_BELOTE,
  belote,
  esReyODamaDelTriunfo,
  paloBelote,
  parejaBelote,
  tieneBelote,
  type AccionBelote,
  type ConfigBelote,
  type EstadoBelote,
  type VistaBelote,
} from '../../juegos/belote';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Belote coherente con la vista. Las manos ajenas salen al azar de las cartas que no
 * se ven, sin los palos que cada uno ya no tiene. La carta vuelta sigue en la mano de quien eligió
 * mientras no la juegue, y quien anunció «Belote» guarda la otra carta hasta el «Rebelote».
 */
export function reconstruirBelote(vista: VistaBelote, azar: EstadoAzar): EstadoBelote {
  const yo = vista.asiento;
  const triunfo = vista.triunfo;
  const jugadas = [...vista.jugadas, ...vista.mesa.map((j) => j.carta)];
  const fijas: IdCarta[][] = vista.cartasEnMano.map(() => []);
  if (
    vista.elige !== null &&
    vista.elige !== yo &&
    vista.fase === 'bazas' &&
    !jugadas.includes(vista.cartaVuelta)
  ) {
    fijas[vista.elige]!.push(vista.cartaVuelta);
  }
  const anuncio = vista.anuncios.find((a) => a.tipo === 'belote');
  if (anuncio && anuncio.asiento !== yo && vista.anuncios.length === 1) {
    const otra = BARAJA_BELOTE.find(
      (c) => esReyODamaDelTriunfo(c, triunfo) && !jugadas.includes(c),
    )!;
    if (!fijas[anuncio.asiento]!.includes(otra)) fijas[anuncio.asiento]!.push(otra);
  }
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      BARAJA_BELOTE,
      vista.miMano ?? [],
      jugadas,
      vista.fase === 'bazas' ? [] : [vista.cartaVuelta],
      fijas.flat(),
    ),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n - fijas[a]!.length));
  // Un asiento más para el mazo, mientras se elige el triunfo.
  const repartidas = repartirConPermitidos(
    cartas,
    [...huecos, vista.enMazo],
    (a, c) => a === huecos.length || !vista.fallos[a]!.includes(paloBelote(c)),
    new Generador(azarReparto),
  );
  const manos = vista.cartasEnMano.map((_, a) =>
    a === yo && vista.miMano ? [...vista.miMano] : [...repartidas[a]!, ...fijas[a]!],
  );
  // Quien tiene el belote: quien lo anunció o, si nadie ha jugado el rey ni la dama, quien
  // tenga los dos.
  const reyODamaJugados = jugadas.some((c) => esReyODamaDelTriunfo(c, triunfo));
  const tiene =
    triunfo === null
      ? null
      : (vista.anuncios[0]?.asiento ?? (reyODamaJugados ? null : tieneBelote(manos, triunfo)));
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    manos,
    cartaVuelta: vista.cartaVuelta,
    mazo: repartidas[huecos.length]!,
    turno: vista.turno ?? 0,
    pasaron: vista.pasaron,
    triunfo,
    elige: vista.elige,
    belote: tiene,
    anuncios: [...vista.anuncios],
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazas: vista.bazas,
    puntosBazas: vista.puntosBazas,
    fallos: vista.fallos.map((f) => [...f]),
    jugadas: [...vista.jugadas],
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
    manosAnuladas: vista.manosAnuladas,
    ultimaAccion: vista.ultimaAccion,
  };
}

export const SIMULABLE_BELOTE: Simulable<ConfigBelote, EstadoBelote, AccionBelote, VistaBelote> = {
  juego: belote,
  reconstruir: reconstruirBelote,
  manoTerminada: (inicio, e) =>
    e.resultadosManos.length > inicio.resultadosManos.length ||
    e.manosAnuladas > inicio.manosAnuladas,
  // Elegir el triunfo, como la normal: solo se simulan las bazas.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const mia = parejaBelote(asiento);
    return (
      (cerrada.puntosMano[mia] - cerrada.puntosMano[1 - mia]!) / 10 +
      bonoPartida(belote.resultado(final), asiento)
    );
  },
  reconstrucciones: 20,
  presupuesto: 100,
};
