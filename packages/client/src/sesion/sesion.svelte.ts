import {
  aplicar,
  asistir,
  comentar,
  crearAzar,
  error,
  Generador,
  igualesJSON,
  ok,
  repetir,
  type Asiento,
  type Asistencia,
  type CodigoComentario,
  type ContextoAsistente,
  type EstadoAzar,
  type Motivo,
  type Fin,
  type Jugada,
  type NivelIA,
  type Resultado,
} from '@juegos/engine';
import { FACTOR_PAUSAS } from '../ajustes';
import { contextoAsistente } from '../asistente/contexto';
import { claveConsejo, consejoDe } from '../asistente/textos';
import { ritmo } from '../ritmo/ritmo.svelte';
import { registrarPartida, resultadoDe, type Novedades } from '../estadisticas/estadisticas';
import { borrarGuardado, guardar, type Guardado } from './guardado';
import type { DefJuego } from './juegos';
import { bazaCerrada, type InfoRed, type SesionMesa } from './sesion-mesa';

/** En modo local el humano ocupa siempre el asiento 0. */
export const HUMANO: Asiento = 0;

/**
 * Pausa antes de cada jugada de la IA, para que el jugador pueda seguirla, con la velocidad
 * Rápida; las demás la multiplican (`ritmo.factor`).
 */
const PAUSA_IA_MS = 750;

/**
 * Sesión de juego local. Es la única que conoce el estado completo: los componentes de la
 * mesa solo leen `vista` y `legales` del humano (design, decisión 9). En el modo en red se
 * cambiará por una sesión que hable con el servidor, con la misma interfaz.
 */
export class Sesion<C, E, A, V> implements SesionMesa<C, E, A, V> {
  readonly def: DefJuego<C, E, A, V>;
  readonly config: C;
  readonly semilla: string;
  /** Nivel de los asientos de la IA. */
  readonly nivel: NivelIA;
  /** En local, el jugador está siempre en el asiento 0. */
  readonly asiento: Asiento = HUMANO;
  readonly red: InfoRed | null = null;

  #estado: E = $state.raw() as E;
  /** La IA está pensando o hay una pausa para seguir la jugada: el humano no puede jugar. */
  bloqueada = $state(false);
  /** Asiento de la IA que está por jugar, si hay alguno. */
  pensando = $state<Asiento | null>(null);
  /** Lo que la partida cambió en las estadísticas, cuando termina. */
  novedades = $state<Novedades | null>(null);
  /** Pistas pedidas en la partida (solitarios). */
  pistas = $state(0);
  /** Velocidad Pausada: la baza terminada espera a `seguir()`. */
  retenida = $state(false);

  // ── Modo asistido (spec modo-asistido) ──
  /** El juego tiene modo asistido: es contra la IA (los solitarios no lo tienen). */
  readonly puedeAsistir: boolean;
  asistido = $state(false);
  /** Sugerencia para la decisión actual del jugador; `null` mientras se calcula o si no le toca. */
  asistencia = $state.raw<Asistencia<A> | null>(null);
  pensandoSugerencia = $state(false);
  /** Comentario de la última jugada del jugador, si le costó algo frente a la sugerida. */
  comentario = $state.raw<Motivo<CodigoComentario> | null>(null);
  /** Consejo (clave de fase) de la fase a la que acaba de llegar el jugador por primera vez. */
  consejo = $state<string | null>(null);

  readonly vista: V = $derived.by(() => this.def.juego.vistaDe(this.#estado, HUMANO));
  readonly fin: Fin | null = $derived.by(() => this.def.juego.resultado(this.#estado));
  readonly legales: readonly A[] = $derived.by(() =>
    this.bloqueada || this.fin !== null ? [] : this.def.juego.accionesLegales(this.#estado, HUMANO),
  );

  #jugadas: Jugada<A>[];
  #azares = new Map<Asiento, EstadoAzar>();
  #tiempoPrevio: number;
  #desde = Date.now();
  #temporizador: ReturnType<typeof setTimeout> | null = null;
  /** En los juegos simultáneos, la acción que tiene prevista cada IA y su temporizador. */
  #esperas = new Map<
    Asiento,
    { readonly accion: A; readonly temporizador: ReturnType<typeof setTimeout> }
  >();
  /** Azar de los retrasos de la IA en los juegos simultáneos. */
  #azarEsperas: Generador;
  #cerrada = false;
  #pausada = false;
  /** Al pausar quedó una pausa o un turno de la IA por ejecutar. */
  #pendiente = false;
  #ctxAsistente: ContextoAsistente<V, A> | null;
  /** Fases (claves de consejo) ya aconsejadas en la partida. */
  #fasesAconsejadas: string[];
  #temporizadorAsistente: ReturnType<typeof setTimeout> | null = null;

  private constructor(
    def: DefJuego<C, E, A, V>,
    config: C,
    semilla: string,
    estado: E,
    jugadas: Jugada<A>[],
    tiempoMs: number,
    nivel: NivelIA,
    pistas = 0,
    asistido = false,
    fasesAconsejadas: readonly string[] = [],
  ) {
    this.pistas = pistas;
    this.#ctxAsistente = contextoAsistente(def, config);
    this.puedeAsistir = this.#ctxAsistente !== null;
    this.asistido = asistido && this.puedeAsistir;
    this.#fasesAconsejadas = [...fasesAconsejadas];
    this.def = def;
    this.config = config;
    this.semilla = semilla;
    this.nivel = nivel;
    this.#estado = estado;
    this.#jugadas = jugadas;
    this.#tiempoPrevio = tiempoMs;
    this.#azarEsperas = new Generador(crearAzar(`${semilla}/esperas/${jugadas.length}`));
    this.#guardar();
    this.#continuar();
  }

  static nueva<C, E, A, V>(
    def: DefJuego<C, E, A, V>,
    config: C,
    semilla: string,
    nivel: NivelIA = 'normal',
    asistido = false,
  ): Resultado<Sesion<C, E, A, V>> {
    const r = def.juego.crear(config, semilla);
    if (!r.ok) return r;
    return ok(new Sesion(def, config, semilla, r.valor, [], 0, nivel, 0, asistido));
  }

  static desdeGuardado<C, E, A, V>(
    def: DefJuego<C, E, A, V>,
    g: Guardado,
  ): Resultado<Sesion<C, E, A, V>> {
    const registro = {
      config: g.config as C,
      semilla: g.semilla,
      jugadas: g.jugadas as Jugada<A>[],
    };
    const r = repetir(def.juego, registro);
    if (!r.ok) return r;
    if (def.juego.resultado(r.valor) !== null) return error('La partida guardada ya terminó');
    return ok(
      new Sesion(
        def,
        registro.config,
        g.semilla,
        r.valor,
        [...registro.jugadas],
        g.tiempoMs,
        // Las partidas guardadas antes de los niveles se retoman en Normal.
        g.nivel ?? 'normal',
        g.pistas ?? 0,
        // Las partidas guardadas antes del modo asistido se retoman sin él.
        g.asistido ?? false,
        g.fasesAconsejadas ?? [],
      ),
    );
  }

  /** Tiempo jugado; se detiene al terminar la partida. */
  tiempoMs(): number {
    return this.#tiempoPrevio + (this.fin === null ? Date.now() - this.#desde : 0);
  }

  /** Intenta una acción del humano. Devuelve `false` si no es legal o no es su momento. */
  jugar(accion: A): boolean {
    if (this.bloqueada || this.#cerrada) return false;
    const comentario = this.#comentar(accion);
    if (!this.#aplicar(HUMANO, accion)) return false;
    this.comentario = comentario;
    return true;
  }

  /** Activa o desactiva el modo asistido sin cambiar la partida. */
  alternarAsistido(): void {
    if (!this.puedeAsistir) return;
    this.asistido = !this.asistido;
    this.comentario = null;
    this.consejo = null;
    this.#guardar();
    this.#actualizarAsistente();
  }

  cerrarConsejo(): void {
    this.consejo = null;
  }

  cerrarComentario(): void {
    this.comentario = null;
  }

  /** Lo que ha costado `accion` frente a la sugerencia, con la vista de antes de jugar. */
  #comentar(accion: A): Motivo<CodigoComentario> | null {
    const a = this.asistencia;
    if (!this.asistido || this.#ctxAsistente === null || a === null) return null;
    const azar = crearAzar(`${this.semilla}/asistente/${this.#jugadas.length}/comentario`);
    return comentar(this.#ctxAsistente, this.vista, a.sugerida, accion, azar, a.simulacion);
  }

  /**
   * Cuando le toca decidir al jugador con el modo asistido, calcula la sugerencia fuera del
   * render y la descarta si la partida cambia antes (design, decisión 2). Su azar es propio: no
   * cambia nada de lo que hace la IA rival. La primera vez en cada fase, pone su consejo.
   */
  #actualizarAsistente(): void {
    if (this.#temporizadorAsistente !== null) clearTimeout(this.#temporizadorAsistente);
    this.#temporizadorAsistente = null;
    this.asistencia = null;
    const ctx = this.#ctxAsistente;
    const juego = this.def.juego;
    const legales =
      this.asistido && ctx !== null && !this.#cerrada && this.fin === null
        ? juego.accionesLegales(this.#estado, HUMANO)
        : [];
    if (ctx === null || legales.length === 0 || (this.bloqueada && !this.def.simultaneo)) {
      this.pensandoSugerencia = false;
      return;
    }
    const vista = this.vista;
    const fase = (vista as { readonly fase?: unknown }).fase;
    const clave = claveConsejo(typeof fase === 'string' ? fase : 'juego');
    if (!this.#fasesAconsejadas.includes(clave) && consejoDe(this.def.id, clave) !== null) {
      this.#fasesAconsejadas.push(clave);
      this.consejo = clave;
      this.#guardar();
    }
    this.pensandoSugerencia = true;
    const n = this.#jugadas.length;
    this.#temporizadorAsistente = setTimeout(() => {
      this.#temporizadorAsistente = null;
      if (this.#cerrada || n !== this.#jugadas.length || !this.asistido) return;
      const azar = crearAzar(`${this.semilla}/asistente/${n}`);
      // La sugerencia es siempre la de la IA difícil, sea cual sea el nivel de los rivales.
      this.asistencia = asistir(this.def.ia!.dificil, ctx, vista, legales, azar);
      this.pensandoSugerencia = false;
    }, 0);
  }

  /**
   * Pista para el jugador (solitarios): un movimiento útil, o `null` si no ve ninguno. Cada
   * pista dada cuenta como usada. No mueve nada.
   */
  pedirPista(): A | null {
    if (!this.def.pista || this.#cerrada || this.fin !== null) return null;
    const pista = this.def.pista(this.vista, this.legales);
    if (pista !== null) {
      this.pistas++;
      this.#guardar();
    }
    return pista;
  }

  seguir(): void {
    if (!this.retenida || this.#cerrada) return;
    this.retenida = false;
    this.#continuar();
  }

  /** Guarda el tiempo y detiene la IA. La sesión deja de responder. */
  cerrar(): void {
    if (this.#cerrada) return;
    this.#guardar();
    this.#cerrada = true;
    if (this.#temporizador !== null) clearTimeout(this.#temporizador);
    if (this.#temporizadorAsistente !== null) clearTimeout(this.#temporizadorAsistente);
    this.#cancelarEsperas();
  }

  /** Guarda el progreso (p. ej. al ocultar la página). */
  guardarAhora(): void {
    if (!this.#cerrada) this.#guardar();
  }

  /** Detiene los turnos de la IA (p. ej. mientras se consulta la guía). No cambia el juego. */
  pausar(): void {
    if (this.#pausada || this.#cerrada) return;
    this.#pausada = true;
    if (this.#temporizador !== null) {
      clearTimeout(this.#temporizador);
      this.#temporizador = null;
      this.#pendiente = true;
    }
    if (this.#esperas.size > 0) {
      this.#cancelarEsperas();
      this.#pendiente = true;
    }
  }

  /** Reanuda lo que hubiera quedado pendiente al pausar. */
  reanudar(): void {
    if (!this.#pausada) return;
    this.#pausada = false;
    if (this.#pendiente) {
      this.#pendiente = false;
      this.#continuar();
    }
  }

  #aplicar(asiento: Asiento, accion: A): boolean {
    const antes = this.vista;
    const r = aplicar(this.def.juego, this.#estado, asiento, accion);
    if (!r.ok) return false;
    this.#estado = r.valor;
    this.#jugadas.push({ asiento, accion });
    if (this.fin !== null) {
      this.#tiempoPrevio += Date.now() - this.#desde;
      borrarGuardado();
      this.#registrarFin(this.fin);
    } else {
      this.#guardar();
    }
    const pausa = this.def.pausaTras(antes, this.vista) * ritmo.factor;
    const retener =
      ritmo.retieneBazas &&
      this.fin === null &&
      (this.def.bazaTerminada?.(antes, this.vista) ?? bazaCerrada(antes, this.vista));
    if (retener || pausa > 0) {
      this.bloqueada = true;
      this.#actualizarAsistente();
    }
    if (retener) {
      this.retenida = true;
      this.#cancelarEsperas();
    } else if (pausa > 0) {
      this.bloqueada = true;
      // La pausa detiene a todos, también a las IAs que esperaban para actuar.
      this.#cancelarEsperas();
      this.#programar(pausa, () => this.#continuar());
    } else {
      this.#continuar();
    }
    return true;
  }

  /** Si le toca a un asiento de la IA, programa su jugada; si no, desbloquea al humano. */
  #continuar(): void {
    if (this.#cerrada) return;
    if (this.def.simultaneo && this.def.ia !== null) {
      this.#continuarSimultaneo();
      return;
    }
    const juego = this.def.juego;
    const asientos = Array.from({ length: juego.asientos(this.#estado) }, (_, a) => a);
    const turnoIA =
      this.fin === null && this.def.ia !== null
        ? asientos.find((a) => a !== HUMANO && juego.accionesLegales(this.#estado, a).length > 0)
        : undefined;
    if (turnoIA === undefined) {
      this.pensando = null;
      this.bloqueada = false;
      this.#actualizarAsistente();
      return;
    }
    this.pensando = turnoIA;
    this.bloqueada = true;
    this.#actualizarAsistente();
    this.#programar(PAUSA_IA_MS * ritmo.factor, () => this.#jugarIA(turnoIA));
  }

  /**
   * Juegos simultáneos: el humano nunca espera a la IA. Cada IA con acciones tiene un
   * temporizador con la acción que tiene prevista; si la acción no cambia se mantiene (para que
   * las jugadas ajenas no reinicien su reloj) y si cambia se programa de nuevo.
   */
  #continuarSimultaneo(): void {
    this.pensando = null;
    this.bloqueada = false;
    this.#actualizarAsistente();
    if (this.fin !== null) {
      this.#cancelarEsperas();
      return;
    }
    if (this.#pausada) {
      this.#pendiente = true;
      return;
    }
    const juego = this.def.juego;
    for (let asiento = 0; asiento < juego.asientos(this.#estado); asiento++) {
      if (asiento === HUMANO) continue;
      const legales = juego.accionesLegales(this.#estado, asiento);
      const prevista = this.#esperas.get(asiento);
      if (legales.length === 0) {
        if (prevista) this.#cancelarEspera(asiento);
        continue;
      }
      const vista = juego.vistaDe(this.#estado, asiento);
      const decision = this.def.ia![this.nivel].decidir(vista, legales, this.#azarDe(asiento));
      if (prevista && igualesJSON(prevista.accion, decision.accion)) continue;
      if (prevista) this.#cancelarEspera(asiento);
      const ms = this.def.simultaneo!.esperaIA(
        vista,
        decision.accion,
        this.#azarEsperas,
        this.nivel,
      );
      const temporizador = setTimeout(() => {
        this.#esperas.delete(asiento);
        if (this.#cerrada) return;
        this.#azares.set(asiento, decision.azar);
        // Si ya no es legal (la partida cambió justo antes), se vuelve a decidir.
        if (!this.#aplicar(asiento, decision.accion)) this.#continuar();
      }, ms * FACTOR_PAUSAS);
      this.#esperas.set(asiento, { accion: decision.accion, temporizador });
    }
  }

  #cancelarEspera(asiento: Asiento): void {
    const prevista = this.#esperas.get(asiento);
    if (prevista) clearTimeout(prevista.temporizador);
    this.#esperas.delete(asiento);
  }

  #cancelarEsperas(): void {
    for (const asiento of [...this.#esperas.keys()]) this.#cancelarEspera(asiento);
  }

  #azarDe(asiento: Asiento): EstadoAzar {
    return (
      this.#azares.get(asiento) ?? crearAzar(`${this.semilla}/ia${asiento}/${this.#jugadas.length}`)
    );
  }

  #jugarIA(asiento: Asiento): void {
    const juego = this.def.juego;
    const azar = this.#azarDe(asiento);
    const decision = this.def.ia![this.nivel].decidir(
      juego.vistaDe(this.#estado, asiento),
      juego.accionesLegales(this.#estado, asiento),
      azar,
    );
    this.#azares.set(asiento, decision.azar);
    this.pensando = null;
    if (!this.#aplicar(asiento, decision.accion)) {
      // No debería pasar (la IA solo elige acciones legales); se evita bloquear la mesa.
      this.bloqueada = false;
    }
  }

  #programar(ms: number, accion: () => void): void {
    if (this.#temporizador !== null) clearTimeout(this.#temporizador);
    if (this.#pausada) {
      this.#pendiente = true;
      return;
    }
    this.#temporizador = setTimeout(() => {
      this.#temporizador = null;
      if (!this.#cerrada) accion();
    }, ms);
  }

  /** Suma la partida a las estadísticas: solo ocurre una vez, al pasar a terminada. */
  #registrarFin(fin: Fin): void {
    // Los solitarios (sin IA) también guardan el tiempo y los movimientos como récords.
    const vista = this.vista as { movimientos?: unknown; puntos?: unknown };
    const solitario = this.def.ia === null;
    const movimientos =
      solitario && typeof vista.movimientos === 'number' ? vista.movimientos : null;
    // TriPeaks lleva además una puntuación, que es récord aunque no se gane.
    const puntos = solitario && typeof vista.puntos === 'number' ? vista.puntos : null;
    this.novedades = registrarPartida(this.def.id, {
      resultado: resultadoDe(fin, HUMANO),
      tiempoMs: this.tiempoMs(),
      movimientos,
      puntos,
    });
  }

  #guardar(): void {
    if (this.fin !== null) return;
    guardar({
      juego: this.def.id,
      config: this.config,
      semilla: this.semilla,
      jugadas: this.#jugadas,
      tiempoMs: this.tiempoMs(),
      nivel: this.nivel,
      pistas: this.pistas,
      asistido: this.asistido,
      fasesAconsejadas: this.#fasesAconsejadas,
    });
  }
}
