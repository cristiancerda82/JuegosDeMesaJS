import { Generador } from '../baraja/azar';
import type { IdCarta } from '../baraja/cartas';
import { numeroBurro, type AccionBurro, type VistaBurro } from '../juegos/burro';
import type { Agente } from './agente';

/**
 * IA básica del Burro: se planta siempre que puede y, si no, guarda el número del que más
 * cartas tiene y pasa una del que menos, eligiendo al azar entre los empatados.
 */
export const iaBurroBasica: Agente<VistaBurro, AccionBurro> = {
  id: 'burro-basica',
  decidir(vista, acciones, azar) {
    if (acciones.length === 0) throw new Error('El agente no tiene acciones legales');
    const plantarse = acciones.find((a) => a.tipo === 'plantarse');
    if (plantarse) return { accion: plantarse, azar };
    const cartas = acciones.flatMap((a) => (a.tipo === 'pasar' ? [a.carta] : []));
    const g = new Generador(azar);
    const carta = cartaParaPasar(cartas, g);
    return { accion: { tipo: 'pasar', carta }, azar: g.estado() };
  },
};

/** Una carta del número del que menos cartas hay; entre números empatados, al azar. */
export function cartaParaPasar(mano: readonly IdCarta[], g: Generador): IdCarta {
  const veces = new Map<number, number>();
  for (const c of mano) veces.set(numeroBurro(c), (veces.get(numeroBurro(c)) ?? 0) + 1);
  const minimo = Math.min(...veces.values());
  const numeros = [...veces.keys()].filter((n) => veces.get(n) === minimo);
  const numero = numeros[g.enteroHasta(numeros.length)]!;
  return mano.find((c) => numeroBurro(c) === numero)!;
}
