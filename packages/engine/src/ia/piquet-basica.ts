import type { IdCarta } from '../baraja/cartas';
import {
  ganaSegundaPiquet,
  paloPiquet,
  rangoPiquet,
  type AccionPiquet,
  type VistaPiquet,
} from '../juegos/piquet';
import type { Agente } from './agente';

/** Lo que vale conservar una carta para el punto, las secuencias y los conjuntos. */
export function valorConservarPiquet(mano: readonly IdCarta[], c: IdCarta): number {
  const palo = paloPiquet(c);
  const largo = (p: string) => mano.filter((x) => paloPiquet(x) === p).length;
  const maximo = Math.max(...mano.map((x) => largo(paloPiquet(x))));
  const r = rangoPiquet(c);
  let v = r - 6;
  if (largo(palo) === maximo) v += 4;
  if (mano.some((x) => paloPiquet(x) === palo && Math.abs(rangoPiquet(x) - r) === 1)) v += 3;
  if (r >= 10 && mano.some((x) => x !== c && rangoPiquet(x) === r)) v += 3;
  return v;
}

/** Umbral: se descartan las cartas que valen menos. */
const UMBRAL = 6;

function cambioPiquet(vista: VistaPiquet, acciones: readonly AccionPiquet[]): AccionPiquet {
  const mano = vista.miMano ?? [];
  const descartables = acciones.flatMap((a) => (a.tipo === 'descartar' ? [a.carta] : []));
  const puedeRobar = acciones.some((a) => a.tipo === 'robar');
  if (descartables.length === 0) return { tipo: 'robar' };
  const peor = [...descartables].sort(
    (a, b) => valorConservarPiquet(mano, a) - valorConservarPiquet(mano, b) || a.localeCompare(b),
  )[0]!;
  if (valorConservarPiquet(mano, peor) < UMBRAL || !puedeRobar)
    return { tipo: 'descartar', carta: peor };
  return { tipo: 'robar' };
}

/** La carta que juega entre las legales. */
export function cartaPiquet(vista: VistaPiquet, cartas: readonly IdCarta[]): IdCarta {
  const mano = vista.miMano ?? [];
  if (vista.mesa.length === 0) {
    const largo = (c: IdCarta) => mano.filter((x) => paloPiquet(x) === paloPiquet(c)).length;
    return [...cartas].sort(
      (a, b) => largo(b) - largo(a) || rangoPiquet(b) - rangoPiquet(a) || a.localeCompare(b),
    )[0]!;
  }
  const salida = vista.mesa[0]!.carta;
  const ganadoras = cartas.filter((c) => ganaSegundaPiquet(salida, c));
  const porRango = (cs: readonly IdCarta[]) =>
    [...cs].sort((a, b) => rangoPiquet(a) - rangoPiquet(b) || a.localeCompare(b))[0]!;
  return ganadoras.length > 0 ? porRango(ganadoras) : porRango(cartas);
}

export function decisionPiquet(
  vista: VistaPiquet,
  acciones: readonly AccionPiquet[],
): AccionPiquet {
  if (vista.fase === 'cambio') return cambioPiquet(vista, acciones);
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  return { tipo: 'jugar', carta: cartaPiquet(vista, cartas) };
}

export const iaPiquetBasica: Agente<VistaPiquet, AccionPiquet> = {
  id: 'piquet-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const accion = decisionPiquet(vista, acciones);
    const legal = acciones.find((a) => JSON.stringify(a) === JSON.stringify(accion));
    return { accion: legal ?? acciones[0]!, azar };
  },
};
