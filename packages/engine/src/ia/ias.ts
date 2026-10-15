import type { Asiento } from '../motor/contrato';
import type { Agente } from './agente';
import { iaBriscaBasica } from './brisca-basica';
import { iaBurroBasica } from './burro-basica';
import { iaChinchonBasica } from './chinchon-basica';
import { iaCinquilloBasica } from './cinquillo-basica';
import { iaCorazonesBasica } from './corazones-basica';
import { iaEscobaBasica } from './escoba-basica';
import { iaGuinoteBasica } from './guinote-basica';
import { iaMusBasica } from './mus-basica';
import { conErrores, porSimulacion, type NivelIA, type Simulable } from './niveles';
import { iaPochaBasica } from './pocha-basica';
import { SIMULABLE_BRISCA } from './reconstruir/brisca';
import { SIMULABLE_CHINCHON } from './reconstruir/chinchon';
import { SIMULABLE_CINQUILLO } from './reconstruir/cinquillo';
import { SIMULABLE_CORAZONES } from './reconstruir/corazones';
import { SIMULABLE_ESCOBA } from './reconstruir/escoba';
import { SIMULABLE_GUINOTE } from './reconstruir/guinote';
import { SIMULABLE_MUS } from './reconstruir/mus';
import { SIMULABLE_POCHA } from './reconstruir/pocha';
import { SIMULABLE_SIETE_Y_MEDIA } from './reconstruir/siete-y-media';
import { SIMULABLE_TUTE } from './reconstruir/tute';
import { iaSieteYMediaBasica } from './siete-y-media-basica';
import { iaTuteBasica } from './tute-basica';

export type IasPorNivel<V, A> = Readonly<Record<NivelIA, Agente<V, A>>>;

/** Parte de las decisiones en las que la IA fácil elige al azar. */
export const ERRORES_FACIL = 0.3;

/** Los tres niveles de un juego con simulación: fácil con errores, la básica y la simulación. */
function niveles<C, E, A, V extends { readonly asiento: Asiento | null }>(
  normal: Agente<V, A>,
  simulable: Simulable<C, E, A, V>,
): IasPorNivel<V, A> {
  return {
    facil: conErrores(normal, ERRORES_FACIL),
    normal,
    dificil: porSimulacion(normal, simulable),
  };
}

/** Las IAs de cada juego por nivel (spec niveles-ia). */
export const IAS = {
  brisca: niveles(iaBriscaBasica, SIMULABLE_BRISCA),
  tute: niveles(iaTuteBasica, SIMULABLE_TUTE),
  guinote: niveles(iaGuinoteBasica, SIMULABLE_GUINOTE),
  escoba: niveles(iaEscobaBasica, SIMULABLE_ESCOBA),
  chinchon: niveles(iaChinchonBasica, SIMULABLE_CHINCHON),
  sieteYMedia: niveles(iaSieteYMediaBasica, SIMULABLE_SIETE_Y_MEDIA),
  cinquillo: niveles(iaCinquilloBasica, SIMULABLE_CINQUILLO),
  pocha: niveles(iaPochaBasica, SIMULABLE_POCHA),
  mus: niveles(iaMusBasica, SIMULABLE_MUS),
  corazones: niveles(iaCorazonesBasica, SIMULABLE_CORAZONES),
  // En el Burro decide la reacción, que pone el cliente: el difícil pasa como el normal, y el
  // fácil se equivoca solo al pasar, en la mitad de los pases.
  burro: {
    facil: conErrores(iaBurroBasica, 0.5, (a) => a.tipo === 'pasar'),
    normal: iaBurroBasica,
    dificil: iaBurroBasica,
  },
} as const;
