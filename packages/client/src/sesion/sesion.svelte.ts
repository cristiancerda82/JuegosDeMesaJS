import {
  aplicar,
  crearAzar,
  error,
  Generador,
  igualesJSON,
  ok,
  repetir,
  type Asiento,
  type EstadoAzar,
  type Fin,
  type Jugada,
  type NivelIA,
  type Resultado,
} from '@juegos/engine';
import { FACTOR_PAUSAS } from '../ajustes';
import { registrarPartida, resultadoDe, type Novedades } from '../estadisticas/estadisticas';
import { borrarGuardado, guardar, type Guardado } from './guardado';
import type { DefJuego } from './juegos';

/** En modo local el humano ocupa siempre el asiento 0. */
export const HUMANO: Asiento = 0;

/** Pausa antes de cada jugada de la IA, para que el jugador pueda seguirla. */
const PAUSA_IA_MS = 750 * FACTOR_PAUSAS;

/**
 * Sesión de juego local. Es la única que conoce el estado completo: los componentes de la
 * mesa solo leen `vista` y `legales` del humano (design, decisión 9). En el modo en red se
 * cambiará por una sesión que hable con el servidor, con la misma interfaz.
 */
export class Sesion<C, E, A, V> {
  readonly def: DefJuego<C, E, A, V>;
  readonly config: C;
  readonly semilla: string;
  /** Nivel de los asientos de la IA. */
  readonly nivel: NivelIA;

  #estado: E = $state.raw() as E;
  /** La IA está pensando o hay una pausa para seguir la jugada: el humano no puede jugar. */
  bloqueada = $state(false);
  /** Asiento de la IA que está por jugar, si hay alguno. */
  pensando = $state<Asiento | null>(null);
  /** Lo que la partida cambió en las estadísticas, cuando termina. */
  novedades = $state<Novedades | null>(null);

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

  private constructor(
    def: DefJuego<C, E, A, V>,
    config: C,
    semilla: string,
    estado: E,
    jugadas: Jugada<A>[],
    tiempoMs: number,
    nivel: NivelIA,
  ) {
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
  ): Resultado<Sesion<C, E, A, V>> {
    const r = def.juego.crear(config, semilla);
    if (!r.ok) return r;
    return ok(new Sesion(def, config, semilla, r.valor, [], 0, nivel));
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
    return this.#aplicar(HUMANO, accion);
  }

  /** Guarda el tiempo y detiene la IA. La sesión deja de responder. */
  cerrar(): void {
    if (this.#cerrada) return;
    this.#guardar();
    this.#cerrada = true;
    if (this.#temporizador !== null) clearTimeout(this.#temporizador);
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
    const pausa = this.def.pausaTras(antes, this.vista) * FACTOR_PAUSAS;
    if (pausa > 0) {
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
      return;
    }
    this.pensando = turnoIA;
    this.bloqueada = true;
    this.#programar(PAUSA_IA_MS, () => this.#jugarIA(turnoIA));
  }

  /**
   * Juegos simultáneos: el humano nunca espera a la IA. Cada IA con acciones tiene un
   * temporizador con la acción que tiene prevista; si la acción no cambia se mantiene (para que
   * las jugadas ajenas no reinicien su reloj) y si cambia se programa de nuevo.
   */
  #continuarSimultaneo(): void {
    this.pensando = null;
    this.bloqueada = false;
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
    const vista = this.vista as { movimientos?: unknown };
    const movimientos =
      this.def.ia === null && typeof vista.movimientos === 'number' ? vista.movimientos : null;
    this.novedades = registrarPartida(this.def.id, {
      resultado: resultadoDe(fin, HUMANO),
      tiempoMs: this.tiempoMs(),
      movimientos,
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
    });
  }
}
