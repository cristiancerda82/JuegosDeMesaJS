import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, type IdCarta } from '../../baraja/cartas';
import {
  BARAJA_SHEEPSHEAD,
  J_DIAMANTES,
  paloEfectivoSheepshead,
  sheepshead,
  type AccionSheepshead,
  type ConfigSheepshead,
  type EstadoSheepshead,
  type VistaSheepshead,
} from '../../juegos/sheepshead';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';
import { repartirConPermitidos } from './cuatrola';

/** Huecos que se reparten además de las cinco manos. */
const BLIND = 5;
const ENTERRADAS = 6;

/**
 * Un estado de Sheepshead coherente con la vista: las manos ajenas, el blind sin coger y las
 * enterradas ajenas al azar entre las cartas que no se ven, sin los palos que cada uno no
 * siguió. Con el blind ya enterrado, la J de diamantes que no se ve está en la mano de otro (la del
 * compañero si se sabe quién es), nunca enterrada.
 */
export function reconstruirSheepshead(vista: VistaSheepshead, azar: EstadoAzar): EstadoSheepshead {
  const yo = vista.asiento;
  const mia = vista.miMano ?? [];
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(BARAJA_SHEEPSHEAD, mia, vista.misEnterradas, ...vista.jugadasPor),
    azar,
  );
  const soyPicker = yo !== null && yo === vista.picker;
  const huecos = [
    ...vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n)),
    vista.enBlind,
    soyPicker ? 0 : vista.enterradas,
  ];
  const enterrado = vista.picker !== null && vista.enterradas === 2;
  const admite = (a: Asiento, c: IdCarta) => {
    if (c === J_DIAMANTES && enterrado) {
      if (vista.companero !== null) return a === vista.companero;
      return a < BLIND && a !== yo;
    }
    if (a >= BLIND) return true;
    if (a === yo) return false;
    return !vista.fallos[a]!.includes(paloEfectivoSheepshead(c));
  };
  let repartidas: IdCarta[][];
  try {
    repartidas = repartirConPermitidos(cartas, huecos, admite, new Generador(azarReparto));
  } catch {
    // Sin poder cumplir lo que se sabe (no debería pasar), al azar respetando los tamaños.
    let i = 0;
    repartidas = huecos.map((n) => {
      const m = cartas.slice(i, i + n);
      i += n;
      return m;
    });
  }
  const manos = [0, 1, 2, 3, 4].map((a) =>
    a === yo && vista.miMano ? [...vista.miMano] : repartidas[a]!,
  );
  // El compañero sale de quién tiene (o jugó) la J de diamantes.
  let companero: Asiento | null = vista.companero;
  if (vista.fase === 'bazas' && !vista.leaster && companero === null) {
    const dueno = manos.findIndex((m) => m.includes(J_DIAMANTES));
    companero = dueno >= 0 ? dueno : null;
  }
  return {
    config: vista.config,
    azar,
    repartidor: vista.repartidor,
    manos,
    blind: repartidas[BLIND]!,
    enterradas: soyPicker ? [...vista.misEnterradas] : repartidas[ENTERRADAS]!,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    pasados: [...vista.pasados],
    picker: vista.picker,
    leaster: vista.leaster,
    companero,
    companeroVisto: vista.companeroVisto,
    mesa: [...vista.mesa],
    ultimaBaza: vista.ultimaBaza,
    jugadasPor: vista.jugadasPor.map((cs) => [...cs]),
    fallos: vista.fallos.map((f) => [...f]),
    bazas: [...vista.bazas],
    puntosMano: [...vista.puntosMano],
    marcador: [...vista.marcador],
    resultadosManos: [...vista.resultadosManos],
  };
}

export const SIMULABLE_SHEEPSHEAD: Simulable<
  ConfigSheepshead,
  EstadoSheepshead,
  AccionSheepshead,
  VistaSheepshead
> = {
  juego: sheepshead,
  reconstruir: reconstruirSheepshead,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  // Coger o pasar y enterrar, como la normal: solo se simulan las bazas.
  decideLaBase: (vista) => vista.fase !== 'bazas',
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(sheepshead.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    return (r ? r.anotado[asiento]! : 0) + bono;
  },
  reconstrucciones: 30,
  presupuesto: 300,
};
