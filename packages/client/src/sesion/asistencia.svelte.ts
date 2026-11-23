import {
  igualesJSON,
  type Asistencia,
  type CodigoComentario,
  type ContextoAsistente,
  type Motivo,
} from '@juegos/engine';
import { pedir } from '../asistente/motor';
import { claveConsejo, consejoDe } from '../asistente/textos';
import type { IdJuego } from './juegos';

/** Lo que tiene el jugador delante cuando le toca decidir. */
export interface Decision<A, V> {
  readonly vista: V;
  readonly legales: readonly A[];
  /** Clave de azar de la sugerencia: propia, para no cambiar nada de lo que hace la IA. */
  readonly azar: string;
}

/** La sugerencia vigente y la vista de antes de jugar, para comentar la jugada. */
export interface Previa<A, V> {
  readonly vista: V;
  readonly asistencia: Asistencia<A>;
}

export interface FuentesAsistente<A, V> {
  /** Lo que el jugador puede decidir ahora, o `null` si no le toca (o espera una pausa). */
  decision(): Decision<A, V> | null;
  /** La sesión está cerrada: las respuestas que lleguen se ignoran. */
  cerrada(): boolean;
  /** Se aconsejó una fase nueva (la sesión local la guarda con la partida). */
  alAconsejar?(): void;
}

/**
 * La parte del modo asistido que no depende de quién lleva la partida (spec modo-asistido;
 * design de red-desde-opciones, decisión 3): la sugerencia, el comentario de la jugada del
 * jugador y los consejos de fase, calculados en el worker del asistente con la vista del
 * jugador. La usan la sesión local y la de red; las lecturas de los rivales son solo locales.
 */
export class AsistenteSesion<C, A, V> {
  readonly puede: boolean;
  activo = $state(false);
  /** Sugerencia para la decisión actual; `null` mientras se calcula o si no le toca. */
  asistencia = $state.raw<Asistencia<A> | null>(null);
  pensando = $state(false);
  /** Comentario de la última jugada del jugador, si le costó algo frente a la sugerida. */
  comentario = $state.raw<Motivo<CodigoComentario> | null>(null);
  /** Clave del consejo de la fase a la que acaba de llegar por primera vez. */
  consejo = $state<string | null>(null);
  /** Fases (claves de consejo) ya aconsejadas en la partida. */
  readonly fases: string[];
  /** Jugadas del jugador: lo que llega tarde a otra jugada ya no se enseña. */
  jugadas = 0;

  readonly #juego: IdJuego;
  readonly #config: C;
  readonly #ctx: ContextoAsistente<V, A> | null;
  readonly #fuentes: FuentesAsistente<A, V>;
  /** Número de la última petición de sugerencia: las respuestas de las anteriores se ignoran. */
  #peticion = 0;

  constructor(
    juego: IdJuego,
    config: C,
    ctx: ContextoAsistente<V, A> | null,
    fuentes: FuentesAsistente<A, V>,
    activo = false,
    fases: readonly string[] = [],
  ) {
    this.#juego = juego;
    this.#config = config;
    this.#ctx = ctx;
    this.#fuentes = fuentes;
    this.puede = ctx !== null;
    this.activo = activo && this.puede;
    this.fases = [...fases];
  }

  /** Activa o desactiva la ayuda sin cambiar la partida. */
  alternar(): void {
    if (!this.puede) return;
    this.activo = !this.activo;
    this.comentario = null;
    this.consejo = null;
    this.actualizar();
  }

  cerrarConsejo(): void {
    this.consejo = null;
  }

  cerrarComentario(): void {
    this.comentario = null;
  }

  /** Lo que hace falta guardar antes de que el jugador juegue, para comentar su jugada. */
  previa(vista: V): Previa<A, V> | null {
    return this.activo && this.asistencia !== null ? { vista, asistencia: this.asistencia } : null;
  }

  /**
   * El jugador ha jugado `accion`. Si había sugerencia y no la siguió, se calcula aparte lo que
   * le ha costado; llega cuando está, si no ha vuelto a jugar.
   */
  alJugar(previa: Previa<A, V> | null, accion: A, azar: string): void {
    this.jugadas++;
    this.comentario = null;
    if (previa === null || igualesJSON(previa.asistencia.sugerida, accion)) return;
    const jugada = this.jugadas;
    pedir({
      tipo: 'comentar',
      juego: this.#juego,
      config: this.#config,
      vista: previa.vista,
      sugerida: previa.asistencia.sugerida,
      hecha: accion,
      simulacion: previa.asistencia.simulacion,
      azar,
    })
      .then((comentario) => {
        if (!this.#fuentes.cerrada() && this.activo && jugada === this.jugadas) {
          this.comentario = comentario;
        }
      })
      .catch(() => {});
  }

  /**
   * Cuando le toca decidir al jugador, calcula la sugerencia fuera del render y la descarta si
   * la partida cambia antes. La primera vez en cada fase, pone su consejo.
   */
  actualizar(): void {
    const peticion = ++this.#peticion;
    this.asistencia = null;
    const d =
      this.activo && this.#ctx !== null && !this.#fuentes.cerrada()
        ? this.#fuentes.decision()
        : null;
    if (d === null || d.legales.length === 0) {
      this.pensando = false;
      return;
    }
    const fase = (d.vista as { readonly fase?: unknown }).fase;
    const clave = claveConsejo(typeof fase === 'string' ? fase : 'juego');
    if (!this.fases.includes(clave) && consejoDe(this.#juego, clave) !== null) {
      this.fases.push(clave);
      this.consejo = clave;
      this.#fuentes.alAconsejar?.();
    }
    this.pensando = true;
    const vigente = () => peticion === this.#peticion && !this.#fuentes.cerrada() && this.activo;
    pedir({
      tipo: 'asistir',
      juego: this.#juego,
      config: this.#config,
      vista: d.vista,
      legales: d.legales,
      azar: d.azar,
    })
      .then((asistencia) => {
        if (!vigente()) return;
        this.asistencia = asistencia as Asistencia<A>;
        this.pensando = false;
      })
      .catch(() => {
        if (vigente()) this.pensando = false;
      });
  }
}
