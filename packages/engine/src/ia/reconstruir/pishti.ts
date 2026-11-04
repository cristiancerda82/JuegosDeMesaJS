import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_PISHTI,
  pishti,
  puntosCartaPishti,
  type AccionPishti,
  type ConfigPishti,
  type EstadoPishti,
  type VistaPishti,
} from '../../juegos/pishti';
import { bandoDe } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { bonoPartida, manosOcultas, Ocultas } from './comun';

/**
 * Un estado de Pishti coherente con la vista: manos ajenas, mazo, tapadas y cartas recogidas, al
 * azar. Las recogidas quedan boca abajo (spec juego-pishti): de ellas solo se sabe cuántas son, y
 * que entre ellas están las cartas vistas en la mano que ya no siguen en el montón.
 */
export function reconstruirPishti(vista: VistaPishti, azar: EstadoAzar): EstadoPishti {
  const fuera = vista.vistasMano.filter((c) => !vista.monton.includes(c));
  const { cartas, azar: azarRecogidas } = barajar(
    cartasFuera(BARAJA_PISHTI, vista.miMano ?? [], vista.monton, vista.vistasMano),
    azar,
  );
  const ocultas = new Ocultas(cartas, azarRecogidas);
  const manos = manosOcultas(vista.cartasEnMano, vista.asiento, vista.miMano, ocultas);
  const mazo = ocultas.tomar(vista.mazo);
  const tapadas = ocultas.tomar(vista.tapadas);
  // Lo que queda, con las cartas vistas que ya no están en el montón, son las recogidas.
  const { cartas: monton } = barajar([...fuera, ...ocultas.todas], azarRecogidas);
  const recogidas: [IdCarta[], IdCarta[]] = [
    monton.slice(0, vista.cartasRecogidas[0]),
    monton.slice(vista.cartasRecogidas[0]),
  ];
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo,
    tapadas,
    monton: [...vista.monton],
    manos,
    turno: vista.turno ?? 0,
    recogidas,
    pishtis: vista.pishtis,
    vistasMano: [...vista.vistasMano],
    ultimoEnRecoger: vista.ultimoEnRecoger,
    ultimaJugada: vista.ultimaJugada,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Lo que vale una carta recogida de más cuando la mano no ha acabado (los 3 de las cartas). */
const CARTA_A_MEDIAS = 0.3;

export const SIMULABLE_PISHTI: Simulable<ConfigPishti, EstadoPishti, AccionPishti, VistaPishti> = {
  juego: pishti,
  reconstruir: reconstruirPishti,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const mio = bandoDe(asiento);
    const otro = (1 - mio) as 0 | 1;
    const bono = bonoPartida(pishti.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (r) {
      return (
        r.puntos[mio].total -
        r.puntos[otro].total +
        0.02 * (r.recuento[mio].cartas - r.recuento[otro].cartas) +
        bono
      );
    }
    // A medias (por el horizonte): los pishtis, los puntos de carta y las cartas recogidas.
    const valor = (b: 0 | 1) =>
      final.pishtis[b].puntos +
      final.recogidas[b].reduce((s, c) => s + puntosCartaPishti(c), 0) +
      CARTA_A_MEDIAS * final.recogidas[b].length;
    return valor(mio) - valor(otro) + bono;
  },
  reconstrucciones: 50,
  presupuesto: 500,
  // La mano entera son 48 jugadas: se simulan 32 para no pasar del tiempo.
  horizonte: 32,
};
