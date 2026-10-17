import type { Generador } from '../baraja/azar';
import type { AccionBurro, VistaBurro } from '../juegos/burro';
import type { NivelIA } from './niveles';

/** Retraso al azar entre `desde` y `hasta` milisegundos. */
const entre = (g: Generador, desde: number, hasta: number) =>
  desde + g.enteroHasta(hasta - desde + 1);

/** Retrasos para plantarse en el Burro (ms): el primero, con 4 iguales, y como reacción. */
export const REACCION_BURRO: Readonly<
  Record<NivelIA, readonly [readonly [number, number], readonly [number, number]]>
> = {
  facil: [
    [2500, 5000],
    [2000, 5000],
  ],
  normal: [
    [1500, 4000],
    [1000, 3500],
  ],
  dificil: [
    [900, 2500],
    [600, 2000],
  ],
};

/**
 * Cuánto tarda la IA del Burro en actuar (spec mesa-cliente y partidas-en-red): pasar es
 * rápido; plantarse lleva el tiempo de darse cuenta, como una persona, y depende del nivel.
 * Lo usan la partida local y el servidor.
 */
export function retrasoBurro(
  vista: VistaBurro,
  accion: AccionBurro,
  g: Generador,
  nivel: NivelIA,
): number {
  if (accion.tipo === 'pasar') return entre(g, 400, 1200);
  const [desde, hasta] = REACCION_BURRO[nivel][vista.plantados.length === 0 ? 0 : 1];
  return entre(g, desde, hasta);
}
