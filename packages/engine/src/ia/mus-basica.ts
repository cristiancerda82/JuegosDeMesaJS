import type { IdCarta } from '../baraja/cartas';
import {
  pares,
  puntosJuego,
  rango,
  type AccionMus,
  type LanceMus,
  type Reyes,
  type VistaMus,
} from '../juegos/mus';
import type { Agente } from './agente';

/**
 * IA básica del Mus: valora de 0 a 1 la fuerza de su jugada en cada lance y decide con
 * umbrales fijos. Echa órdagos solo con jugadas casi imbatibles, pero quiere los de los demás con
 * jugadas fuertes: si no, regala una piedra a cada órdago de farol. No usa señas ni lleva la cuenta de lo que hacen los demás. Es determinista:
 * no usa el azar que recibe.
 */
export const iaMusBasica: Agente<VistaMus, AccionMus> = {
  id: 'mus-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

const REY = 12;
const CABALLO = 11;
const AS = 1;
const CUATRO = 4;

/** Ventaja de ser mano: gana los empates. */
const EXTRA_MANO = 0.05;
/** Echar un órdago pide una jugada casi imbatible; quererlo, solo una jugada fuerte. */
const UMBRAL_ORDAGO = 0.95;
const UMBRAL_QUERER_ORDAGO = 0.7;
const UMBRAL_ENVITE_ALTO = 0.8;
const UMBRAL_ENVITE = 0.6;
const UMBRAL_SUBIR = 0.85;
/** Por encima de este total ya no se sube, solo se quiere o no. */
const TOPE_SUBIDA = 10;

/** Fuerza de la mano en un lance, de 0 a 1, sin contar la ventaja de ser mano. */
export function fuerzaLance(lance: LanceMus, mano: readonly IdCarta[], reyes: Reyes): number {
  const rangos = mano.map((c) => rango(c, reyes));
  const cuantos = (r: number) => rangos.filter((x) => x === r).length;
  // Solo los cuatro reyes (o los cuatro ases) son imbatibles.
  const escala = (altas: number, medias: number) =>
    altas === 4 ? 1 : Math.min(0.9, 0.28 * altas + 0.06 * medias);
  switch (lance) {
    case 'grande':
      return escala(cuantos(REY), cuantos(CABALLO));
    case 'chica':
      return escala(cuantos(AS), cuantos(CUATRO));
    case 'pares': {
      const p = pares(mano, reyes);
      if (p === null) return 0;
      const alto = p.clave[0]! / REY;
      if (p.tipo === 'pareja') return 0.3 + 0.25 * alto;
      if (p.tipo === 'medias') return 0.6 + 0.25 * alto;
      return Math.min(1, 0.85 + 0.15 * (p.clave[1]! / REY) * alto);
    }
    case 'juego': {
      const suma = puntosJuego(mano, reyes);
      if (suma === 31) return 0.92;
      if (suma === 32) return 0.8;
      if (suma === 40) return 0.6;
      return suma > 31 ? 0.45 : 0;
    }
    case 'punto':
      return (puntosJuego(mano, reyes) / 30) * 0.9;
  }
}

function elegir(vista: VistaMus, acciones: readonly AccionMus[]): AccionMus {
  const mano = vista.miMano ?? [];
  const reyes = vista.config.reyes;
  const tiene = (tipo: AccionMus['tipo']) => acciones.find((a) => a.tipo === tipo);

  if (vista.fase === 'mus') return cortaElMus(mano, reyes) ? tiene('cortar')! : tiene('mus')!;
  if (vista.fase === 'descarte') return elegirDescarte(mano, reyes, acciones);

  const lance = vista.lance!;
  const esMano = vista.asiento === vista.mano;
  const fuerza = Math.min(1, fuerzaLance(lance, mano, reyes) + (esMano ? EXTRA_MANO : 0));
  const envite = vista.envite;

  if (envite === null) {
    if (fuerza >= UMBRAL_ORDAGO) return tiene('ordago')!;
    if (fuerza >= UMBRAL_ENVITE_ALTO) return { tipo: 'envidar', piedras: 5 };
    if (fuerza >= UMBRAL_ENVITE) return { tipo: 'envidar', piedras: 2 };
    return tiene('paso')!;
  }
  if (envite.ordago) return fuerza >= UMBRAL_QUERER_ORDAGO ? tiene('quiero')! : tiene('noQuiero')!;
  if (fuerza >= UMBRAL_SUBIR && envite.total < TOPE_SUBIDA) return { tipo: 'subir', piedras: 2 };
  // Cuanto más hay en juego, más fuerza hace falta para quererlo.
  const umbralQuerer = 0.5 + 0.02 * Math.min(envite.total, 15);
  return fuerza >= umbralQuerer ? tiene('quiero')! : tiene('noQuiero')!;
}

/** Corta con una mano buena: 31 de juego, duples, medias o tres reyes. */
export function cortaElMus(mano: readonly IdCarta[], reyes: Reyes): boolean {
  const p = pares(mano, reyes);
  const reyesEnMano = mano.filter((c) => rango(c, reyes) === REY).length;
  return (
    puntosJuego(mano, reyes) === 31 ||
    p?.tipo === 'duples' ||
    p?.tipo === 'medias' ||
    reyesEnMano >= 3
  );
}

/** Se queda con los reyes y las cartas que forman pares; si todo sirve, suelta la más baja. */
function elegirDescarte(
  mano: readonly IdCarta[],
  reyes: Reyes,
  acciones: readonly AccionMus[],
): AccionMus {
  const rangos = mano.map((c) => rango(c, reyes));
  const sirve = (i: number) =>
    rangos[i] === REY || rangos.filter((r) => r === rangos[i]).length >= 2;
  let fuera = mano.filter((_, i) => !sirve(i));
  if (fuera.length === 0) {
    fuera = [[...mano].sort((a, b) => rango(a, reyes) - rango(b, reyes))[0]!];
  }
  const clave = [...fuera].sort().join();
  return (
    acciones.find((a) => a.tipo === 'descartar' && [...a.cartas].sort().join() === clave) ??
    acciones[0]!
  );
}
