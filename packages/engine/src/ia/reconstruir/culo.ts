import type { EstadoAzar } from '../../baraja/azar';
import { cartasFuera, crearBaraja, type IdCarta } from '../../baraja/cartas';
import {
  compararCulo,
  culo,
  rangoCulo,
  type AccionCulo,
  type ConfigCulo,
  type EstadoCulo,
  type IntercambioCulo,
  type VistaCulo,
} from '../../juegos/culo';
import type { Asiento } from '../../motor/contrato';
import type { Simulable } from '../niveles';
import { bonoPartida, Ocultas } from './comun';

const ordenar = (cartas: readonly IdCarta[]) => [...cartas].sort(compararCulo);

/**
 * Un estado de Culo coherente con la vista: las cartas jugadas son públicas y las manos ajenas
 * salen al azar de las que no se ven. Lo que el asiento dio en el intercambio y aún no se ha
 * jugado sigue en la mano de quien lo recibió.
 */
export function reconstruirCulo(vista: VistaCulo, azar: EstadoAzar): EstadoCulo {
  const yo = vista.asiento ?? 0;
  const jugadas = new Set(vista.jugadas.flatMap((j) => j.cartas));
  // Las cartas que el asiento sabe en otra mano.
  const sabidas = new Map<Asiento, IdCarta[]>();
  for (const x of vista.misIntercambios) {
    const [cartas, en] = x.da === yo ? [x.dadas, x.recibe] : [x.devueltas ?? [], x.da];
    // El presidente puede devolver las mismas cartas que recibió: esas vuelven a la mano propia.
    const siguen = cartas.filter((c) => !jugadas.has(c) && !(vista.miMano ?? []).includes(c));
    sabidas.set(en, [...(sabidas.get(en) ?? []), ...siguen]);
  }
  const ocultas = new Ocultas(
    cartasFuera(
      crearBaraja('espanola40'),
      vista.miMano ?? [],
      [...jugadas],
      [...sabidas.values()].flat(),
    ),
    azar,
  );
  const manos = vista.cartasEnMano.map((n, a) => {
    if (a === yo && vista.miMano) return [...vista.miMano];
    const conocidas = sabidas.get(a) ?? [];
    return ordenar([...conocidas, ...ocultas.tomar(n - conocidas.length)]);
  });
  // De los intercambios ajenos solo se sabe cuántas cartas fueron: se toman de las manos.
  const intercambios: IntercambioCulo[] = vista.intercambios.map((x) => {
    const mio = vista.misIntercambios.find((m) => m.da === x.da && m.recibe === x.recibe);
    if (mio) return mio;
    // Pueden haberse jugado ya: se buscan también entre lo que jugó cada uno.
    const deAsiento = (a: Asiento) =>
      ordenar([
        ...manos[a]!,
        ...vista.jugadas.filter((j) => j.asiento === a).flatMap((j) => j.cartas),
      ]);
    return {
      da: x.da,
      recibe: x.recibe,
      dadas: deAsiento(x.recibe).slice(-x.cuantas),
      devueltas: x.hecho ? deAsiento(x.da).slice(0, x.cuantas) : null,
    };
  });
  return {
    config: vista.config,
    azar,
    numeroMano: vista.numeroMano,
    manos,
    fase: vista.fase,
    turno: vista.turno ?? 0,
    mesa: vista.mesa,
    pasados: [...vista.pasados],
    salidos: [...vista.salidos],
    jugadas: [...vista.jugadas],
    cargos: vista.cargos,
    intercambios,
    puntos: [...vista.puntos],
    ultimaAccion: vista.ultimaAccion,
    resultadosManos: [...vista.resultadosManos],
  };
}

/** Una jugada por cada valor y número de cartas: los palos no cuentan. */
const claveJugada = (a: AccionCulo) =>
  a.tipo === 'jugar' ? `${rangoCulo(a.cartas[0]!)}x${a.cartas.length}` : a.tipo;

export const SIMULABLE_CULO: Simulable<ConfigCulo, EstadoCulo, AccionCulo, VistaCulo> = {
  juego: culo,
  reconstruir: reconstruirCulo,
  manoTerminada: (inicio, e) => e.resultadosManos.length > inicio.resultadosManos.length,
  valorar(inicio, final, asiento) {
    const cerrada = final.resultadosManos[inicio.resultadosManos.length];
    const puesto = cerrada ? cerrada.puntosMano[asiento]! : 0;
    return puesto + bonoPartida(culo.resultado(final), asiento);
  },
  // Lo que devuelve en el intercambio lo decide la básica.
  decideLaBase: (vista) => vista.fase === 'intercambio',
  candidatas(_vista, acciones, deLaBase) {
    const vistas = new Map<string, AccionCulo>();
    for (const a of acciones) if (!vistas.has(claveJugada(a))) vistas.set(claveJugada(a), a);
    vistas.set(claveJugada(deLaBase), deLaBase);
    return [...vistas.values()];
  },
  reconstrucciones: 16,
  presupuesto: 96,
};
