import type { IdCarta } from '../baraja/cartas';
import {
  ganadoraCorazones,
  paloCorazones,
  rangoCorazones,
  type AccionCorazones,
  type VistaCorazones,
} from '../juegos/corazones';
import type { Agente } from './agente';

/**
 * IA básica de los Corazones: pasa sus cartas más peligrosas y juega para no llevarse puntos,
 * deshaciéndose de la Q de picas y de los corazones altos en cuanto puede. Es determinista: no
 * usa el azar que recibe.
 */
export const iaCorazonesBasica: Agente<VistaCorazones, AccionCorazones> = {
  id: 'corazones-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    return { accion: elegir(vista, acciones), azar };
  },
};

const REINA_DE_PICAS: IdCarta = 'picas-12';

/** Lo arriesgado que es quedarse con una carta. */
export function peligro(carta: IdCarta): number {
  if (carta === REINA_DE_PICAS) return 100;
  const palo = paloCorazones(carta);
  const rango = rangoCorazones(carta);
  if (palo === 'picas' && rango >= 13) return rango === 14 ? 60 : 50;
  if (palo === 'corazones') return 20 + rango;
  return rango;
}

const porRango = (cartas: readonly IdCarta[]) =>
  [...cartas].sort((a, b) => rangoCorazones(a) - rangoCorazones(b));
const masPeligrosa = (cartas: readonly IdCarta[]) =>
  [...cartas].sort((a, b) => peligro(b) - peligro(a))[0]!;

function elegir(vista: VistaCorazones, acciones: readonly AccionCorazones[]): AccionCorazones {
  if (acciones[0]!.tipo === 'pasar') {
    const mano = vista.miMano ?? [];
    const elegidas = new Set([...mano].sort((a, b) => peligro(b) - peligro(a)).slice(0, 3));
    return (
      acciones.find((a) => a.tipo === 'pasar' && a.cartas.every((c) => elegidas.has(c))) ??
      acciones[0]!
    );
  }
  const cartas = acciones.flatMap((a) => (a.tipo === 'jugar' ? [a.carta] : []));
  return { tipo: 'jugar', carta: elegirCarta(vista, cartas) };
}

function elegirCarta(vista: VistaCorazones, cartas: readonly IdCarta[]): IdCarta {
  const ordenadas = porRango(cartas);
  if (vista.mesa.length === 0) {
    // Salir con la más baja, a ser posible sin corazones.
    return ordenadas.find((c) => paloCorazones(c) !== 'corazones') ?? ordenadas[0]!;
  }
  const salida = paloCorazones(vista.mesa[0]!.carta);
  const sigue = cartas.every((c) => paloCorazones(c) === salida);
  if (!sigue) {
    // Sin el palo: fuera la Q de picas, luego el corazón más alto, luego lo más peligroso.
    if (cartas.includes(REINA_DE_PICAS)) return REINA_DE_PICAS;
    const corazones = ordenadas.filter((c) => paloCorazones(c) === 'corazones');
    return corazones.at(-1) ?? masPeligrosa(cartas);
  }
  const ganando = rangoCorazones(ganadoraCorazones(vista.mesa).carta);
  const pierden = ordenadas.filter((c) => rangoCorazones(c) < ganando);
  if (pierden.length > 0) return pierden.at(-1)!;
  // Todas ganan: siendo el último la baza ya es suya, así que suelta la más alta.
  const ultimo = vista.mesa.length === vista.cartasEnMano.length - 1;
  if (ultimo) {
    const sinLaReina = ordenadas.filter((c) => c !== REINA_DE_PICAS);
    return sinLaReina.at(-1) ?? ordenadas.at(-1)!;
  }
  return ordenadas[0]!;
}
