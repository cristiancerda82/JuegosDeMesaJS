import { Generador, type EstadoAzar } from '../../baraja/azar';
import { barajar } from '../../baraja/barajar';
import { cartasFuera, crearBaraja, type IdCarta, type PaloEspanol } from '../../baraja/cartas';
import {
  cuatrola,
  esMatador,
  paloCuatrola,
  rangoCuatrola,
  type AccionCuatrola,
  type ConfigCuatrola,
  type EstadoCuatrola,
  type VistaCuatrola,
} from '../../juegos/cuatrola';
import type { CartaJugada } from '../../motor/bazas';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida } from './comun';

/**
 * Cartas que cada asiento seguro que no tiene, por lo que jugó: quien no siguió un palo que no
 * es triunfo no tiene ninguna carta de ese palo. Si la salida era triunfo, no tiene triunfos,
 * salvo los matadores más altos que la salida, que el privilegio le dejaba guardar.
 */
export function prohibidasCuatrola(
  bazas: readonly (readonly CartaJugada[])[],
  triunfo: PaloEspanol,
): Set<IdCarta>[] {
  const baraja = crearBaraja('espanola40');
  const prohibidas = Array.from({ length: 4 }, () => new Set<IdCarta>());
  for (const cartas of bazas) {
    if (cartas.length === 0) continue;
    const salida = cartas[0]!.carta;
    const palo = paloCuatrola(salida, triunfo);
    for (const j of cartas.slice(1)) {
      if (paloCuatrola(j.carta, triunfo) === palo) continue;
      for (const c of baraja) {
        if (paloCuatrola(c, triunfo) !== palo) continue;
        const privilegiado =
          palo === triunfo &&
          esMatador(c, triunfo) &&
          rangoCuatrola(c, triunfo) > rangoCuatrola(salida, triunfo);
        if (!privilegiado) prohibidas[j.asiento]!.add(c);
      }
    }
  }
  return prohibidas;
}

/**
 * Reparte `cartas` entre los asientos con hueco (`huecos[a]` cartas cada uno), cada carta solo
 * a los asientos que `admite` permite. Las cartas se agrupan por el conjunto de asientos que
 * las admiten (como mucho 16 grupos con 4 asientos); carta a carta, en orden barajado, se elige
 * al azar (según el hueco) entre los asientos que dejan un reparto posible para el resto, con la
 * condición de Hall sobre los grupos. Como el estado real cumple las restricciones, siempre hay
 * solución.
 */
export function repartirConPermitidos(
  cartas: readonly IdCarta[],
  huecos: readonly number[],
  admite: (asiento: Asiento, carta: IdCarta) => boolean,
  g: Generador,
): IdCarta[][] {
  const n = huecos.length;
  const libre = [...huecos];
  const manos: IdCarta[][] = huecos.map(() => []);
  const mascara = (c: IdCarta) => {
    let m = 0;
    for (let a = 0; a < n; a++) if (admite(a, c)) m |= 1 << a;
    return m;
  };
  const mascaras = cartas.map(mascara);
  const grupos = [...new Set(mascaras)];
  const quedan = new Map<number, number>(grupos.map((m) => [m, 0]));
  for (const m of mascaras) quedan.set(m, quedan.get(m)! + 1);

  const posible = () => {
    for (let sub = 1; sub < 1 << grupos.length; sub++) {
      let necesitan = 0;
      let asientos = 0;
      grupos.forEach((m, i) => {
        if (sub & (1 << i)) {
          necesitan += quedan.get(m)!;
          asientos |= m;
        }
      });
      let caben = 0;
      for (let a = 0; a < n; a++) if (asientos & (1 << a)) caben += libre[a]!;
      if (necesitan > caben) return false;
    }
    return true;
  };

  cartas.forEach((carta, i) => {
    const m = mascaras[i]!;
    quedan.set(m, quedan.get(m)! - 1);
    const candidatos: number[] = [];
    for (let a = 0; a < n; a++) {
      if (libre[a] === 0 || !(m & (1 << a))) continue;
      libre[a]!--;
      if (posible()) candidatos.push(a);
      libre[a]!++;
    }
    if (candidatos.length === 0) throw new Error('Reparto imposible con lo que se sabe');
    let tirada = g.enteroHasta(candidatos.reduce((s, a) => s + libre[a]!, 0));
    let elegido = candidatos[0]!;
    for (const a of candidatos) {
      if (tirada < libre[a]!) {
        elegido = a;
        break;
      }
      tirada -= libre[a]!;
    }
    libre[elegido]!--;
    manos[elegido]!.push(carta);
  });
  return manos;
}

/**
 * Un estado de Cuatrola coherente con la vista: las manos ajenas al azar, sin las cartas que se
 * sabe que no tienen, y con la carta llamada (si no se ha jugado ni es propia) en la mano de uno
 * de los otros, nunca en la del jugador.
 */
export function reconstruirCuatrola(vista: VistaCuatrola, azar: EstadoAzar): EstadoCuatrola {
  const yo = vista.asiento;
  const jugadas = vista.bazasMano.flatMap((b) => b.cartas.map((j) => j.carta));
  const { cartas, azar: azarReparto } = barajar(
    cartasFuera(
      crearBaraja('espanola40'),
      vista.miMano ?? [],
      vista.mesa.map((j) => j.carta),
      jugadas,
    ),
    azar,
  );
  const prohibidas =
    vista.triunfo === null
      ? Array.from({ length: 4 }, () => new Set<IdCarta>())
      : prohibidasCuatrola([...vista.bazasMano.map((b) => b.cartas), vista.mesa], vista.triunfo);
  const llamada = vista.llamada;
  const admite = (a: Asiento, c: IdCarta) =>
    !prohibidas[a]!.has(c) && !(c === llamada && a === vista.jugador);
  const huecos = vista.cartasEnMano.map((n, a) => (a === yo ? 0 : n));
  const repartidas = repartirConPermitidos(cartas, huecos, admite, new Generador(azarReparto));
  const manos = repartidas.map((m, a) => (a === yo && vista.miMano ? [...vista.miMano] : m));
  const tiene = llamada === null ? -1 : manos.findIndex((m) => m.includes(llamada));
  const companero =
    vista.companero ??
    (llamada === null ? null : tiene >= 0 ? tiene : companeroDeJugadas(vista, llamada));
  return {
    config: vista.config,
    azar,
    numeroMano: vista.numeroMano,
    repartidor: vista.repartidor,
    manos,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    dichos: [...vista.dichos],
    modalidad: vista.modalidad,
    jugador: vista.jugador,
    todosPasaron: vista.todosPasaron,
    triunfo: vista.triunfo,
    llamada,
    companero,
    mesa: [...vista.mesa],
    bazasMano: [...vista.bazasMano],
    bazas: [...vista.bazas],
    fichas: [...vista.fichas],
    resultadosManos: [...vista.resultadosManos],
    ultimaBaza: vista.ultimaBaza,
  };
}

/** Quien jugó la carta llamada (cuando la vista ya lo dice, no hace falta). */
function companeroDeJugadas(vista: VistaCuatrola, llamada: IdCarta): Asiento | null {
  for (const j of [...vista.bazasMano.flatMap((b) => b.cartas), ...vista.mesa]) {
    if (j.carta === llamada) return j.asiento;
  }
  return null;
}

/** Bazas de margen sobre las 5,5 del empate que valen como una ficha en la valoración. */
const BAZAS_POR_FICHA = 4;

export const SIMULABLE_CUATROLA: Simulable<
  ConfigCuatrola,
  EstadoCuatrola,
  AccionCuatrola,
  VistaCuatrola
> = {
  juego: cuatrola,
  reconstruir: reconstruirCuatrola,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const bono = bonoPartida(cuatrola.resultado(final), asiento);
    const r = final.resultadosManos[inicio.resultadosManos.length];
    if (!r) return bono;
    // Además de las fichas, por cuántas bazas se gana o se pierde: distingue manos iguales.
    const delJugador = asiento === r.jugador || asiento === r.companero;
    const margen = (r.bazasJugador - 5.5) / BAZAS_POR_FICHA;
    return r.cambio[asiento]! + (delJugador ? margen : -margen) + bono;
  },
  // Las pujas las decide la base: la simulación no ve que el rival puja justo cuando lleva
  // buena mano (spec niveles-ia).
  decideLaBase: (vista) => vista.fase === 'subasta',
  reconstrucciones: 24,
  presupuesto: 160,
};
