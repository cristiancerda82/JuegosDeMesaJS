import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_KLAVERJAS,
  klaverjas,
  paloKlaverjas,
  parejaKlaverjas,
  type AccionKlaverjas,
  type ConfigKlaverjas,
  type EstadoKlaverjas,
  type VistaKlaverjas,
} from '../../juegos/klaverjas';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/**
 * Un estado de Klaverjas coherente con la vista (spec niveles-ia): las manos ajenas al azar
 * entre las cartas que no se ven, sin los palos que se sabe que no tienen.
 */
export function reconstruirKlaverjas(vista: VistaKlaverjas, azar: EstadoAzar): EstadoKlaverjas {
  const yo = vista.asiento;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_KLAVERJAS, vista.miMano ?? [], vista.jugadasPor.flat()),
    azar,
  );
  const repartidas = repartirConPermitidos(
    cartas,
    vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)),
    (a, c) => !vista.fallos[a]!.includes(paloKlaverjas(c)),
    new Generador(azarReparto),
  );
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    propuesto: vista.propuesto,
    pasados: [...vista.pasados],
    triunfo: vista.triunfo,
    juega: vista.juega,
    manos: repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m)),
    turno: vista.turno ?? 0,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    bazasGanadas: vista.bazasGanadas,
    jugadasPor: vista.jugadasPor.map((j) => [...j]),
    fallos: vista.fallos.map((f) => [...f]),
    cartasMano: vista.cartasMano,
    roemMano: vista.roemMano,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_KLAVERJAS: Simulable<
  ConfigKlaverjas,
  EstadoKlaverjas,
  AccionKlaverjas,
  VistaKlaverjas
> = {
  juego: klaverjas,
  reconstruir: reconstruirKlaverjas,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El triunfo lo decide la base; se simulan las bazas.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(klaverjas.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const mia = parejaKlaverjas(asiento);
    return (r.anotado[mia] - r.anotado[1 - mia]!) / 50 + bono;
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
