import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_BRISCOLA_CHIAMATA,
  briscolaChiamata,
  type AccionBriscolaChiamata,
  type ConfigBriscolaChiamata,
  type EstadoBriscolaChiamata,
  type VistaBriscolaChiamata,
} from '../../juegos/briscola-chiamata';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Un estado de Briscola Chiamata coherente con la vista: las manos ajenas al azar entre las
 * cartas que no se ven. Mientras no se juega, la carta llamada es una más de ellas, y el
 * compañero es quien la reciba (el llamador, que entonces juega solo, si la tiene él).
 */
export function reconstruirBriscolaChiamata(
  vista: VistaBriscolaChiamata,
  azar: EstadoAzar,
): EstadoBriscolaChiamata {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const { cartas, azar: sig } = barajar(
    cartasFuera(BARAJA_BRISCOLA_CHIAMATA, mia, vista.jugadasPor.flat()),
    azar,
  );
  const g = new Generador(sig);
  let i = 0;
  const manos: IdCarta[][] = vista.cartasEnMano.map((n, a) => {
    if (a === yo) return [...mia];
    const m = cartas.slice(i, i + n);
    i += n;
    return m;
  });
  let companero = vista.companero;
  if (companero === null && vista.llamada !== null) {
    companero = manos.findIndex((m) => m.includes(vista.llamada!));
  }
  return {
    config: vista.config,
    azar: g.estado(),
    repartidor: vista.repartidor,
    manos,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    pujas: [...vista.pujas],
    nivel: vista.nivel,
    llamador: vista.llamador,
    llamada: vista.llamada,
    triunfo: vista.triunfo,
    companero,
    solo: companero !== null && companero === vista.llamador,
    descubierto: vista.descubierto,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    puntosMano: [...vista.puntosMano],
    marcador: [...vista.marcador],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_BRISCOLA_CHIAMATA: Simulable<
  ConfigBriscolaChiamata,
  EstadoBriscolaChiamata,
  AccionBriscolaChiamata,
  VistaBriscolaChiamata
> = {
  juego: briscolaChiamata,
  reconstruir: reconstruirBriscolaChiamata,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // La subasta y la llamada, como la normal; cada carta se simula.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(briscolaChiamata.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    return (r ? r.cambio[asiento]! : 0) + bono;
  },
  reconstrucciones: 30,
  presupuesto: 300,
};
