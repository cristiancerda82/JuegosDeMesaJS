import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  bigTwo,
  jugadaBigTwo,
  ordenarBigTwo,
  TRES_DE_DIAMANTES,
  type AccionBigTwo,
  type ConfigBigTwo,
  type EstadoBigTwo,
  type VistaBigTwo,
} from '../../juegos/big-two';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

/** Un estado de Big Two coherente con la vista: las manos ajenas, al azar entre las no vistas. */
export function reconstruirBigTwo(vista: VistaBigTwo, azar: EstadoAzar): EstadoBigTwo {
  const ocultas = new Ocultas(
    cartasFuera(crearBaraja('francesa52'), vista.miMano ?? [], vista.jugadas),
    azar,
  );
  // En la primera jugada de la mano, el 3 de diamantes lo tiene quien sale.
  const sale = vista.turno;
  const conTres = vista.primera && sale !== null && sale !== vista.asiento;
  const fijas: IdCarta[] = conTres ? ocultas.sacar([TRES_DE_DIAMANTES]) : [];
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === vista.asiento && vista.miMano) return [...vista.miMano];
    if (conTres && a === sale) return ordenarBigTwo([...fijas, ...ocultas.tomar(n - 1)]);
    return ordenarBigTwo(ocultas.tomar(n));
  });
  return {
    config: vista.config,
    azar,
    manos,
    turno: vista.turno ?? 0,
    mesa: vista.mesa,
    pasesSeguidos: vista.pasesSeguidos,
    primera: vista.primera,
    jugadas: [...vista.jugadas],
    totales: [...vista.totales],
    resultadosManos: [...vista.resultadosManos],
    ultimaAccion: vista.ultimaAccion,
  };
}

/** Candidatas como mucho: la de la base, pasar y la más baja de cada tipo. */
const CANDIDATAS = 8;

export const SIMULABLE_BIG_TWO: Simulable<ConfigBigTwo, EstadoBigTwo, AccionBigTwo, VistaBigTwo> = {
  juego: bigTwo,
  reconstruir: reconstruirBigTwo,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  candidatas(_vista, acciones, deLaBase) {
    const elegidas: AccionBigTwo[] = [deLaBase];
    const clave = (a: AccionBigTwo) => JSON.stringify(a);
    const anadir = (a: AccionBigTwo) => {
      if (elegidas.length < CANDIDATAS && !elegidas.some((x) => clave(x) === clave(a))) {
        elegidas.push(a);
      }
    };
    const pasar = acciones.find((a) => a.tipo === 'pasar');
    if (pasar) anadir(pasar);
    // La más baja de cada tipo de jugada.
    const porTipo = new Map<string, AccionBigTwo>();
    for (const a of acciones) {
      if (a.tipo !== 'jugar') continue;
      const j = jugadaBigTwo(a.cartas)!;
      const actual = porTipo.get(j.tipo);
      if (!actual || (actual.tipo === 'jugar' && j.fuerza < jugadaBigTwo(actual.cartas)!.fuerza)) {
        porTipo.set(j.tipo, a);
      }
    }
    for (const a of porTipo.values()) anadir(a);
    return elegidas;
  },
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const propios = cerrada ? cerrada.puntos : final.manos.map((m) => m.length);
    const otros = propios.filter((_, a) => a !== asiento);
    const media = otros.reduce((s, p) => s + p, 0) / otros.length;
    return media - propios[asiento]! + bonoPartida(bigTwo.resultado(final), asiento);
  },
  reconstrucciones: 20,
  presupuesto: 100,
};
