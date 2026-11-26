import { PALOS_ESPANOLES, type IdCarta, type PaloEspanol } from '../baraja/cartas';
import {
  barajaBurroBazas,
  ganadoraBurroBazas,
  paloBurroBazas,
  rangoBurroBazas,
  type AccionBurroBazas,
  type VistaBurroBazas,
} from '../juegos/burro-bazas';
import type { Agente } from './agente';

const porRango = (cs: readonly IdCarta[]) =>
  [...cs].sort((a, b) => rangoBurroBazas(a) - rangoBurroBazas(b) || a.localeCompare(b));
const masBaja = (cs: readonly IdCarta[]) => porRango(cs)[0]!;
const masAlta = (cs: readonly IdCarta[]) => porRango(cs).at(-1)!;

/** Las cartas que no ve: en las manos de los demás o en el mazo. */
export function sinVerBurroBazas(vista: VistaBurroBazas): IdCarta[] {
  const vistas = new Set<IdCarta>([
    ...(vista.miMano ?? []),
    ...vista.jugadasPor.flat(),
    ...vista.mesa.map((j) => j.carta),
  ]);
  return barajaBurroBazas().filter((c) => !vistas.has(c));
}

/** Una carta es punta si ninguna de las que no ve de su palo es más alta. */
export const esPuntaBurroBazas = (carta: IdCarta, sinVer: readonly IdCarta[]) =>
  sinVer.every(
    (c) =>
      paloBurroBazas(c) !== paloBurroBazas(carta) || rangoBurroBazas(c) < rangoBurroBazas(carta),
  );

/**
 * La carta con la que sale (spec ia-jugadores): el palo en el que los rivales tienen menos
 * cartas, para que roben o pasen, sin quedarse sin un palo del que aún quedan cartas por ahí.
 * Dentro del palo, la punta si la tiene; si no, la más alta.
 */
function salida(vista: VistaBurroBazas, cartas: readonly IdCarta[]): IdCarta {
  const mano = vista.miMano ?? [];
  const sinVer = sinVerBurroBazas(vista);
  const yo = vista.asiento!;
  const rivales = vista.cartasEnMano.flatMap((n, a) => (a !== yo && n > 0 ? [a] : []));
  const valor = (palo: PaloEspanol) => {
    const quedan = sinVer.filter((c) => paloBurroBazas(c) === palo).length;
    const mias = mano.filter((c) => paloBurroBazas(c) === palo).length;
    // Rivales que se sabe que no lo tienen: robarán o pasarán seguro.
    const sinEl = rivales.filter((a) => vista.sinPalo[a]!.includes(palo)).length;
    // Quedarse sin un palo del que quedan cartas deja expuesto a tener que robar.
    const expuesto = mias === 1 && quedan > 0 ? 1 : 0;
    return sinEl * 4 - quedan - expuesto * 3;
  };
  const palos = PALOS_ESPANOLES.filter((p) => cartas.some((c) => paloBurroBazas(c) === p));
  const mejor = palos.reduce((m, p) => (valor(p) > valor(m) ? p : m));
  const delPalo = cartas.filter((c) => paloBurroBazas(c) === mejor);
  const punta = delPalo.find((c) => esPuntaBurroBazas(c, sinVer));
  return punta ?? masAlta(delPalo);
}

/**
 * La carta al seguir el palo (spec ia-jugadores): gana la baza para salir en la siguiente si su
 * carta es punta o si es el último en jugar (con la más baja que gana); si no, echa la más baja.
 */
function seguir(vista: VistaBurroBazas, cartas: readonly IdCarta[]): IdCarta {
  const gana = rangoBurroBazas(ganadoraBurroBazas(vista.mesa).carta);
  const ganadoras = cartas.filter((c) => rangoBurroBazas(c) > gana);
  if (ganadoras.length === 0) return masBaja(cartas);
  const sinVer = sinVerBurroBazas(vista);
  const punta = ganadoras.find((c) => esPuntaBurroBazas(c, sinVer));
  if (punta) return punta;
  const yo = vista.asiento!;
  const n = vista.config.jugadores;
  // Es el último si nadie con cartas queda por jugar antes de volver a quien salió.
  let ultimo = true;
  for (let k = 1; k < n; k++) {
    const a = (yo + k) % n;
    if (a === vista.salida) break;
    if (vista.cartasEnMano[a]! > 0) ultimo = false;
  }
  return ultimo ? masBaja(ganadoras) : masBaja(cartas);
}

export const iaBurroBazasBasica: Agente<VistaBurroBazas, AccionBurroBazas> = {
  id: 'burro-bazas-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
    if (cartas.length === 0) return { accion: acciones[0]!, azar };
    if (cartas.length === 1) return { accion: { tipo: 'jugar', carta: cartas[0]! }, azar };
    const carta = vista.mesa.length === 0 ? salida(vista, cartas) : seguir(vista, cartas);
    return { accion: { tipo: 'jugar', carta }, azar };
  },
};
