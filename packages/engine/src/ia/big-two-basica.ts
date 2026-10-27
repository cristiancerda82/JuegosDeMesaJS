import type { IdCarta } from '../baraja/cartas';
import {
  jugadaBigTwo,
  jugadasPosiblesBigTwo,
  numeroBigTwo,
  valorBigTwo,
  type AccionBigTwo,
  type VistaBigTwo,
} from '../juegos/big-two';
import type { Agente } from './agente';

/** El número del 2, la carta más alta. */
const DOS = 12;
/** Con tantas cartas o menos un rival está cerca de ganar: ya se juegan los 2. */
const RIVAL_CERCA = 4;
/** Coste de romper una pareja o un trío, o de sacar una carta de una jugada de 5. */
const ROMPER = 100;
const SACAR_DE_CINCO = 50;

type Jugar = Extract<AccionBigTwo, { tipo: 'jugar' }>;

/** Las cartas de la mano que forman parte de alguna jugada de 5. */
export const cartasDeCinco = (mano: readonly IdCarta[]) =>
  new Set(
    jugadasPosiblesBigTwo(mano)
      .filter((j) => j.length === 5)
      .flat(),
  );

/** Lo que cuesta soltar una jugada al superar: su fuerza y lo que rompe de la mano. */
export function costeBigTwo(
  mano: readonly IdCarta[],
  cartas: readonly IdCarta[],
  deCinco: ReadonlySet<IdCarta> = cartasDeCinco(mano),
): number {
  const jugada = jugadaBigTwo(cartas)!;
  let coste = jugada.fuerza % 1000;
  // Romper parejas o tríos: usar parte de las cartas de un número.
  for (const n of new Set(cartas.map(numeroBigTwo))) {
    const tengo = mano.filter((c) => numeroBigTwo(c) === n).length;
    const uso = cartas.filter((c) => numeroBigTwo(c) === n).length;
    if (uso < tengo && tengo >= 2) coste += ROMPER;
  }
  // Sacar cartas de una jugada de 5 para soltar menos.
  if (cartas.length < 5 && cartas.some((c) => deCinco.has(c))) coste += SACAR_DE_CINCO;
  return coste;
}

/**
 * IA básica del Big Two (spec ia-jugadores): sale con su carta más baja soltando todas las que
 * pueda, supera con lo justo sin romper lo que tiene y guarda los 2 hasta que un rival está
 * cerca de ganar. Es determinista: no usa el azar que recibe.
 */
export const iaBigTwoBasica: Agente<VistaBigTwo, AccionBigTwo> = {
  id: 'big-two-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: decidirBigTwo(vista, acciones), azar };
  },
};

export function decidirBigTwo(vista: VistaBigTwo, acciones: readonly AccionBigTwo[]): AccionBigTwo {
  const jugadas = acciones.filter((a): a is Jugar => a.tipo === 'jugar');
  const mano = vista.miMano ?? [];
  if (jugadas.length === 0) return { tipo: 'pasar' };

  if (vista.mesa === null) {
    // Salir: con la carta más baja, en la jugada que suelta más cartas (y la más baja de ellas).
    const baja = [...mano].sort((a, b) => valorBigTwo(a) - valorBigTwo(b))[0]!;
    const conBaja = jugadas.filter((a) => a.cartas.includes(baja));
    const candidatas = conBaja.length > 0 ? conBaja : jugadas;
    return [...candidatas].sort(
      (a, b) =>
        b.cartas.length - a.cartas.length ||
        jugadaBigTwo(a.cartas)!.fuerza - jugadaBigTwo(b.cartas)!.fuerza,
    )[0]!;
  }

  // Superar: la jugada más barata; los 2, solo si algún rival está cerca de ganar.
  const yo = vista.asiento;
  const rivalCerca = vista.cartasEnMano.some((n, a) => a !== yo && n <= RIVAL_CERCA);
  const permitidas = jugadas.filter(
    (a) => rivalCerca || !a.cartas.some((c) => numeroBigTwo(c) === DOS),
  );
  if (permitidas.length === 0) return { tipo: 'pasar' };
  if (permitidas.length === 1) return permitidas[0]!;
  const deCinco = cartasDeCinco(mano);
  let mejor = permitidas[0]!;
  let menor = Infinity;
  for (const a of permitidas) {
    const coste = costeBigTwo(mano, a.cartas, deCinco);
    if (coste < menor) {
      mejor = a;
      menor = coste;
    }
  }
  return mejor;
}
