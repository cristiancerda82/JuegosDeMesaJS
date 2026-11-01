import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera } from '../../baraja/cartas';
import {
  BARAJA_FIVE_HUNDRED,
  fiveHundred,
  PALOS_PUJA_FIVE_HUNDRED,
  paloEfectivo,
  parejaFiveHundred,
  triunfoDe,
  type AccionFiveHundred,
  type ConfigFiveHundred,
  type EstadoFiveHundred,
  type VistaFiveHundred,
} from '../../juegos/five-hundred';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

const VIUDA = 4;
const DESCARTES = 5;

/**
 * Un estado de Five Hundred coherente con la vista (spec niveles-ia): las manos ajenas, la viuda
 * y los descartes ajenos al azar entre las cartas que no se ven, sin los palos que cada uno no
 * siguió, y la mano del misère abierto, la que se ve.
 */
export function reconstruirFiveHundred(
  vista: VistaFiveHundred,
  azar: EstadoAzar,
): EstadoFiveHundred {
  const yo = vista.asiento;
  const juega = vista.mejor?.asiento ?? null;
  const triunfo = triunfoDe(vista.mejor?.puja ?? null);
  const abiertas = vista.abiertas ?? [];
  // Los descartes que ya ha hecho otro: los 3 en las bazas; en el descarte, los que lleva.
  const descartesAjenos =
    juega === null || juega === yo || vista.fase === 'subasta'
      ? 0
      : vista.fase === 'bazas'
        ? 3
        : 13 - vista.cartasEnMano[juega]!;
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      BARAJA_FIVE_HUNDRED,
      vista.miMano ?? [],
      vista.misDescartes,
      vista.jugadasPor.flat(),
      abiertas,
    ),
    azar,
  );
  const huecos = [
    ...vista.cartasEnMano.map((n, a) => (a === yo || (abiertas.length > 0 && a === juega) ? 0 : n)),
    vista.enViuda,
    descartesAjenos,
  ];
  const repartidas = repartirConPermitidos(
    cartas,
    huecos,
    (a, c) => {
      if (a >= VIUDA) return true;
      const palo = paloEfectivo(c, triunfo);
      return palo === null || !vista.fallos[a]!.includes(palo);
    },
    new Generador(azarReparto),
  );
  const manos = repartidas.slice(0, 4).map((m, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    if (abiertas.length > 0 && a === juega) return [...abiertas];
    return m;
  });
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    pujas: [...vista.pujas],
    mejor: vista.mejor,
    manos,
    viuda: repartidas[VIUDA]!,
    descartes: juega === yo ? [...vista.misDescartes] : repartidas[DESCARTES]!,
    mesa: [...vista.mesa],
    paloNombrado: vista.paloNombrado,
    ultimaBaza: vista.ultimaBaza,
    bazasGanadas: vista.bazasGanadas,
    jugadasPor: vista.jugadasPor.map((j) => [...j]),
    fallos: vista.fallos.map((f) => [...f]),
    puntos: vista.puntos,
    ganadora: null,
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_FIVE_HUNDRED: Simulable<
  ConfigFiveHundred,
  EstadoFiveHundred,
  AccionFiveHundred,
  VistaFiveHundred
> = {
  juego: fiveHundred,
  reconstruir: reconstruirFiveHundred,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // El descarte lo decide la base; en la subasta se comparan pocas pujas (ver `candidatas`).
  decideLaBase: (vista) => vista.fase === 'descarte',
  /**
   * En la subasta: la puja de la base, pasar y una baza más del mismo palo; si la base pasa,
   * la puja más baja que se puede hacer en cada palo.
   */
  candidatas(vista, acciones, deLaBase) {
    if (vista.fase !== 'subasta') return acciones;
    const pujas = acciones.flatMap((a) =>
      a.tipo === 'pujar' && a.puja.tipo === 'bazas' ? [{ accion: a, puja: a.puja }] : [],
    );
    const pasar = acciones.filter((a) => a.tipo === 'pasar');
    if (deLaBase.tipo === 'pujar' && deLaBase.puja.tipo === 'bazas') {
      const { bazas, palo } = deLaBase.puja;
      const mas = pujas.filter((p) => p.puja.palo === palo && p.puja.bazas === bazas + 1);
      return [deLaBase, ...pasar, ...mas.map((p) => p.accion)];
    }
    if (deLaBase.tipo !== 'pasar') return [deLaBase, ...pasar];
    // Las pujas legales van de menos a más: la primera de cada palo es la más baja.
    const minimas = PALOS_PUJA_FIVE_HUNDRED.flatMap((palo) => {
      const delPalo = pujas.find((p) => p.puja.palo === palo);
      return delPalo ? [delPalo.accion] : [];
    });
    return [deLaBase, ...minimas];
  },
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(fiveHundred.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    const mia = parejaFiveHundred(asiento);
    return (r.suma[mia] - r.suma[1 - mia]!) / 50 + bono;
  },
  reconstrucciones: 12,
  presupuesto: 80,
};
