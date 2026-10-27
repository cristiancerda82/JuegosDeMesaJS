import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_SKAT,
  matadoresSkat,
  paloSkat,
  skat,
  type AccionSkat,
  type ConfigSkat,
  type EstadoSkat,
  type VistaSkat,
} from '../../juegos/skat';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Skat coherente con la vista. Las manos ajenas y el Skat (si no lo conoce) salen al
 * azar de las cartas que no se ven, sin los palos efectivos que cada uno no siguió. La mano
 * ouvert del solista es la que se ve.
 */
export function reconstruirSkat(vista: VistaSkat, azar: EstadoAzar): EstadoSkat {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const jugadas = [...vista.jugadas, ...vista.mesa.map((j) => j.carta)];
  const ouvert = vista.solista !== null && vista.solista !== yo ? vista.manoOuvert : null;
  const enSkat =
    BARAJA_SKAT.length - vista.cartasEnMano.reduce((s, n) => s + n, 0) - jugadas.length;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_SKAT, mia, jugadas, vista.skat ?? [], ouvert ?? []),
    azar,
  );
  const huecos = vista.cartasEnMano.map((n, a) =>
    a === yo || (ouvert !== null && a === vista.solista) ? 0 : n,
  );
  // Un asiento más para el Skat, si no se conoce.
  const repartidas = repartirConPermitidos(
    cartas,
    [...huecos, vista.skat === null ? enSkat : 0],
    (a, c) => a === huecos.length || !vista.fallos[a]!.includes(paloSkat(c, vista.juego)),
    new Generador(azarReparto),
  );
  const manos = vista.cartasEnMano.map((_, a) => {
    if (a === yo) return [...mia];
    if (ouvert !== null && a === vista.solista) return [...ouvert];
    return repartidas[a]!;
  });
  const skatRec = vista.skat !== null ? [...vista.skat] : repartidas[huecos.length]!;
  // Los matadores salen de las cartas del solista al declarar: su mano, lo que ha jugado y el Skat.
  const juego = vista.juego;
  const solista = vista.solista;
  const matadores =
    juego === null || juego === 'nulo' || solista === null
      ? null
      : matadoresSkat(
          [
            ...manos[solista]!,
            ...vista.jugadasPor[solista]!,
            ...vista.mesa.filter((j) => j.asiento === solista).map((j) => j.carta),
            ...skatRec,
          ],
          juego,
        );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    manos,
    skat: skatRec,
    turno: vista.turno ?? 0,
    subasta: vista.subasta,
    solista,
    puja: vista.puja,
    cogioSkat: vista.cogioSkat,
    juego,
    anuncio: vista.anuncio,
    matadores,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadas: [...vista.jugadas],
    jugadasPor: vista.jugadasPor.map((js) => [...js]),
    puntosBazas: vista.puntosBazas,
    bazas: vista.bazas,
    fallos: vista.fallos.map((f) => [...f]),
    puntos: [...vista.puntos],
    resultadosManos: [...vista.resultadosManos],
    manosAnuladas: vista.manosAnuladas,
    ultimaAccion: vista.ultimaAccion as EstadoSkat['ultimaAccion'],
  };
}

export const SIMULABLE_SKAT: Simulable<ConfigSkat, EstadoSkat, AccionSkat, VistaSkat> = {
  juego: skat,
  reconstruir: reconstruirSkat,
  manoTerminada: (inicio, e) =>
    e.resultadosManos.length > inicio.resultadosManos.length ||
    e.manosAnuladas > inicio.manosAnuladas,
  // La subasta, el Skat, el descarte y el juego, como la normal: solo se simulan las bazas.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    if (!cerrada) return 0;
    const signo = cerrada.solista === asiento ? 1 : -1;
    return signo * cerrada.delta + bonoPartida(skat.resultado(final), asiento);
  },
  reconstrucciones: 20,
  presupuesto: 100,
};
