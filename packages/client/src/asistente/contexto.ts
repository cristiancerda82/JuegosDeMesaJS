import type { ContextoAsistente, IasPorNivel } from '@juegos/engine';
import { CATALOGO } from '../menu/catalogo';
import type { DefJuego, IdJuego } from '../sesion/juegos';

/**
 * Juegos de bazas por parejas fijas cuando se juegan con 4 (0 y 2 contra 1 y 3): la baza que
 * gana el compañero también es del jugador. Los de parejas que cambian en cada mano (Cuatrola,
 * Doppelkopf, Schafkopf…) cuentan cada asiento por separado.
 */
const PAREJAS: ReadonlySet<IdJuego> = new Set<IdJuego>([
  'brisca',
  'tute',
  'guinote',
  'butifarra',
  'truc',
  'truco',
  'sueca',
  'euchre',
  'bridge',
  'belote',
  'klaverjas',
  'jass',
  'tressette',
  'whist',
  'picas',
  'fiveHundred',
]);

/** Con 4 jugadores, el de enfrente es el compañero. */
export const porParejas = (juego: IdJuego, jugadores: number) =>
  PAREJAS.has(juego) && jugadores === 4;

/** Contratos del Barbu y del Rentz en los que se quieren las bazas (o no hay bazas). */
const CONTRATOS_POSITIVOS: ReadonlySet<string> = new Set(['triunfo', 'positivo', 'domino']);

/**
 * Lo que el asistente necesita de un juego para explicar sus jugadas (design, decisión 3): la IA
 * normal y el simulable de sus IAs, si evita bazas (familia «bazas a evitar», según el contrato
 * en el Barbu y el Rentz, y salvo en la mano del general en el Polignac) y si juega por parejas. `null` en los solitarios.
 */
export function contextoAsistente<C, E, A, V>(
  def: DefJuego<C, E, A, V>,
  config: C,
): ContextoAsistente<V, A> | null {
  if (def.ia === null) return null;
  const familia = CATALOGO[def.id].familia;
  const jugadores = (config as { readonly jugadores?: number }).jugadores;
  const porContrato = def.id === 'barbu' || def.id === 'rentz';
  return {
    base: def.ia.normal,
    simulable: (def.ia as IasPorNivel<V, A>).simulable,
    evitar: porContrato
      ? (vista: V) => {
          const contrato = (vista as { readonly contrato?: string | null }).contrato;
          return typeof contrato === 'string' && !CONTRATOS_POSITIVOS.has(contrato);
        }
      : def.id === 'polignac'
        ? // Con el general en juego, todos quieren bazas: él, todas; los demás, una.
          (vista: V) => (vista as { readonly general?: number | null }).general == null
        : familia === 'bazasEvitar',
    parejas: porParejas(def.id, jugadores ?? 0),
  };
}
