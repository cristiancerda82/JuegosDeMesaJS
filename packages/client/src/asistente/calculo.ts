import {
  asistir,
  comentar,
  crearAzar,
  leer,
  type Asistencia,
  type CodigoComentario,
  type ContextoAsistente,
  type Motivo,
  type Simulacion,
} from '@juegos/engine';
import { JUEGOS, type DefJuego, type IdJuego } from '../sesion/juegos';
import { contextoAsistente } from './contexto';

/**
 * Lo que se le pide al asistente (design, decisión 2). Todo son datos: viaja tal cual al worker,
 * que reconstruye el juego y su IA a partir del id. `azar` es la semilla del azar propio del
 * asistente, que no consume el de los rivales.
 */
export type Peticion =
  | {
      readonly tipo: 'asistir';
      readonly juego: IdJuego;
      readonly config: unknown;
      readonly vista: unknown;
      readonly legales: readonly unknown[];
      readonly azar: string;
    }
  | {
      readonly tipo: 'comentar';
      readonly juego: IdJuego;
      readonly config: unknown;
      readonly vista: unknown;
      readonly sugerida: unknown;
      readonly hecha: unknown;
      readonly simulacion: Simulacion<unknown>;
      readonly azar: string;
    }
  | {
      /** La jugada de un rival, con la vista de ese rival (nunca sale del cálculo). */
      readonly tipo: 'leer';
      readonly juego: IdJuego;
      readonly config: unknown;
      readonly vista: unknown;
      readonly legales: readonly unknown[];
      readonly accion: unknown;
      readonly azar: string;
    };

export type Respuesta<P extends Peticion> = P extends { tipo: 'asistir' }
  ? Asistencia<unknown>
  : P extends { tipo: 'comentar' }
    ? Motivo<CodigoComentario> | null
    : Motivo;

type Def = DefJuego<unknown, unknown, unknown, unknown>;

let ultimo: { clave: string; ctx: ContextoAsistente<unknown, unknown> } | null = null;

function contexto(juego: IdJuego, config: unknown): ContextoAsistente<unknown, unknown> {
  const clave = `${juego}/${JSON.stringify(config)}`;
  if (ultimo?.clave !== clave) {
    const ctx = contextoAsistente(JUEGOS[juego] as Def, config);
    if (ctx === null) throw new Error(`${juego} no tiene modo asistido`);
    ultimo = { clave, ctx };
  }
  return ultimo.ctx;
}

export function calcular<P extends Peticion>(p: P): Respuesta<P> {
  const ctx = contexto(p.juego, p.config);
  const azar = crearAzar(p.azar);
  switch (p.tipo) {
    case 'asistir':
      // La sugerencia es siempre la de la IA difícil, sea cual sea el nivel de los rivales.
      return asistir(
        (JUEGOS[p.juego] as Def).ia!.dificil,
        ctx,
        p.vista,
        p.legales,
        azar,
      ) as Respuesta<P>;
    case 'comentar':
      return comentar(ctx, p.vista, p.sugerida, p.hecha, azar, p.simulacion) as Respuesta<P>;
    case 'leer':
      return leer(ctx, p.vista, p.legales, p.accion, azar) as Respuesta<P>;
  }
}
