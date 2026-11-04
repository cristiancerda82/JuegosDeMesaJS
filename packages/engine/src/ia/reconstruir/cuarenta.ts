import type { EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_CUARENTA,
  cuarenta,
  puntosManoCuarenta,
  rangoCuarenta,
  type AccionCuarenta,
  type ConfigCuarenta,
  type EstadoCuarenta,
  type VistaCuarenta,
} from '../../juegos/cuarenta';
import { bandoDe } from '../../motor/bazas';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/**
 * Un estado de Cuarenta coherente con la vista: manos ajenas, mazo y cartas recogidas, al azar.
 * Las recogidas quedan boca abajo (spec juego-cuarenta): de ellas solo se sabe cuántas son, y que
 * entre ellas están las cartas jugadas en el reparto que ya no siguen en la mesa. Quien anunció
 * ronda tiene las cartas de ese rango que no ha jugado, y, si era de tres, no tiene la cuarta.
 */
export function reconstruirCuarenta(vista: VistaCuarenta, azar: EstadoAzar): EstadoCuarenta {
  const yo = vista.asiento;
  const jugadas = vista.jugadasReparto.flat();
  const capturadas = jugadas.filter((c) => !vista.mesa.includes(c));
  const { cartas, azar: azarRecogidas } = barajar(
    cartasFuera(BARAJA_CUARENTA, vista.miMano ?? [], vista.mesa, jugadas),
    azar,
  );
  const ocultas = new Ocultas(cartas, azarRecogidas);

  /** Saca `n` cartas ocultas que cumplan `admite`, en el orden barajado. */
  const elegir = (n: number, admite: (c: IdCarta) => boolean) => {
    const elegidas = ocultas.todas.filter(admite).slice(0, n);
    if (elegidas.length < n) throw new Error('No quedan cartas ocultas que cumplan la ronda');
    return ocultas.sacar(elegidas);
  };

  // Primero, las cartas de las rondas ajenas que no se han jugado.
  const manos: IdCarta[][] = vista.cartasEnMano.map(() => []);
  const prohibido: ((c: IdCarta) => boolean)[] = vista.cartasEnMano.map(() => () => false);
  for (const ronda of vista.rondas) {
    if (ronda.asiento === yo) continue;
    const delRango = (c: IdCarta) => rangoCuarenta(c) === ronda.rango;
    const jugadasDelRango = vista.jugadasReparto[ronda.asiento]!.filter(delRango).length;
    manos[ronda.asiento] = elegir(ronda.cartas - jugadasDelRango, delRango);
    if (ronda.cartas === 3) prohibido[ronda.asiento] = delRango;
  }
  for (let a = 0; a < manos.length; a++) {
    if (a === yo && vista.miMano) {
      manos[a] = [...vista.miMano];
      continue;
    }
    const faltan = vista.cartasEnMano[a]! - manos[a]!.length;
    manos[a]!.push(...elegir(faltan, (c) => !prohibido[a]!(c)));
  }
  const mazo = ocultas.tomar(vista.mazo);
  // Lo que queda, con las capturadas del reparto, son las recogidas de los dos bandos.
  const { cartas: monton } = barajar([...capturadas, ...ocultas.todas], azarRecogidas);
  const recogidas: [IdCarta[], IdCarta[]] = [
    monton.slice(0, vista.cartasRecogidas[0]),
    monton.slice(vista.cartasRecogidas[0]),
  ];
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    mazo,
    mesa: [...vista.mesa],
    manos,
    turno: vista.turno ?? 0,
    recogidas,
    ultimoEnRecoger: vista.ultimoEnRecoger,
    ultimaJugada: vista.ultimaJugada,
    caible: vista.caible,
    rondas: [...vista.rondas],
    jugadasReparto: vista.jugadasReparto.map((js) => [...js]),
    tantos: vista.tantos,
    puntos: vista.puntos,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Lo que vale una carta recogida de más cuando la mano no ha acabado: los cartones. */
const CARTA_A_MEDIAS = 0.5;

export const SIMULABLE_CUARENTA: Simulable<
  ConfigCuarenta,
  EstadoCuarenta,
  AccionCuarenta,
  VistaCuarenta
> = {
  juego: cuarenta,
  reconstruir: reconstruirCuarenta,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const mio = bandoDe(asiento);
    const otro = (1 - mio) as 0 | 1;
    const bono = bonoPartida(cuarenta.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (r) {
      return (
        r.puntos[mio].total -
        r.puntos[otro].total +
        (r.completa ? 0.02 : CARTA_A_MEDIAS) * (r.cartas[mio] - r.cartas[otro]) +
        bono
      );
    }
    // A medias (por el horizonte): los tantos de la mano y las cartas recogidas.
    const p = puntosManoCuarenta(final.tantos, null);
    return (
      p[mio].total -
      p[otro].total +
      CARTA_A_MEDIAS * (final.recogidas[mio].length - final.recogidas[otro].length) +
      bono
    );
  },
  reconstrucciones: 50,
  presupuesto: 500,
  // La mano entera son 40 jugadas: se simulan 32 para no pasar del tiempo.
  horizonte: 32,
};
