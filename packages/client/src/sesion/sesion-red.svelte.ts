import type { Asiento, Fin, NivelIA } from '@juegos/engine';
import { FACTOR_PAUSAS } from '../ajustes';
import type { DefJuego } from './juegos';
import type { ClienteRed, MensajePartida } from './red.svelte';
import type { InfoRed, SesionMesa } from './sesion-mesa';

/**
 * Sesión de una partida en red (spec partidas-en-red; design, decisión 5). El estado lo tiene
 * el servidor: esta sesión recibe la vista de su asiento después de cada jugada y la muestra con
 * las mismas pausas que la partida local (`pausaTras`). Las mesas no notan la diferencia.
 */
export class SesionRed<C, E, A, V> implements SesionMesa<C, E, A, V> {
  readonly def: DefJuego<C, E, A, V>;
  readonly config: C;
  readonly nivel: NivelIA;
  readonly cliente: ClienteRed;
  readonly novedades = null;
  readonly pistas = 0;

  vista: V = $state.raw() as V;
  fin = $state.raw<Fin | null>(null);
  bloqueada = $state(false);
  pensando = $state<Asiento | null>(null);
  /** Número de partida en la sala (cambia con la revancha). */
  partida = $state(0);

  #legales = $state.raw<readonly A[]>([]);
  readonly legales: readonly A[] = $derived(this.bloqueada ? [] : this.#legales);

  readonly asiento: Asiento = $derived.by(() => this.cliente.entrada?.asiento ?? 0);
  readonly red: InfoRed | null = $derived.by(() => {
    const s = this.cliente.sala;
    return s ? { codigo: s.codigo, asientos: s.asientos, anfitrion: s.anfitrion } : null;
  });

  /** Jugadas de la última vista mostrada: se envían con cada acción. */
  #n = 0;
  #cola: MensajePartida[] = [];
  #temporizador: ReturnType<typeof setTimeout> | null = null;
  /** Una acción enviada espera la vista siguiente. */
  #esperando = false;
  #pausas = 0;
  #desde = Date.now();
  #cerrada = false;

  constructor(def: DefJuego<C, E, A, V>, cliente: ClienteRed, primera: MensajePartida) {
    this.def = def;
    this.cliente = cliente;
    const sala = cliente.sala!;
    this.config = sala.config as C;
    this.nivel = sala.nivel;
    this.#mostrar(primera, false);
    cliente.alRecibirPartida = (m) => this.#recibir(m);
    // Errores del servidor (p. ej. una jugada sobre una vista vieja): se vuelve a poder jugar.
    $effect.root(() => {
      $effect(() => {
        if (this.cliente.error && this.#esperando) {
          this.#esperando = false;
          this.#actualizarBloqueo();
        }
      });
    });
  }

  jugar(accion: A): boolean {
    if (this.bloqueada || this.#cerrada) return false;
    this.#esperando = true;
    this.#actualizarBloqueo();
    this.cliente.enviar({ tipo: 'jugar', accion, n: this.#n });
    return true;
  }

  pedirPista(): A | null {
    return null;
  }

  tiempoMs(): number {
    return Date.now() - this.#desde;
  }

  /** Los paneles (resumen de mano, guía) piden al servidor que la IA espere. */
  pausar(): void {
    if (this.#pausas++ === 0) this.cliente.enviar({ tipo: 'pausa', activa: true });
  }

  reanudar(): void {
    if (this.#pausas === 0) return;
    if (--this.#pausas === 0) this.cliente.enviar({ tipo: 'pausa', activa: false });
  }

  guardarAhora(): void {
    // La partida la guarda el servidor.
  }

  /** Sale de la sala. */
  cerrar(): void {
    if (this.#cerrada) return;
    this.#cerrada = true;
    if (this.#temporizador !== null) clearTimeout(this.#temporizador);
    this.cliente.alRecibirPartida = null;
    this.cliente.cerrar();
  }

  #recibir(m: MensajePartida) {
    if (this.#cerrada) return;
    // Una partida nueva (revancha) empieza sin esperar a las pausas de la anterior.
    if (m.partida !== this.partida) {
      this.#cola = [];
      if (this.#temporizador !== null) clearTimeout(this.#temporizador);
      this.#temporizador = null;
      this.#desde = Date.now();
      this.#mostrar(m, false);
      return;
    }
    this.#cola.push(m);
    if (this.#temporizador === null) this.#siguiente();
  }

  /** Muestra la siguiente vista de la cola, con la pausa que pida el juego. */
  #siguiente() {
    const m = this.#cola.shift();
    if (!m) {
      this.#temporizador = null;
      this.#actualizarBloqueo();
      return;
    }
    const pausa = this.#mostrar(m, true);
    if (pausa > 0) {
      this.#temporizador = setTimeout(() => this.#siguiente(), pausa);
    } else {
      this.#siguiente();
    }
  }

  /** Pone una vista y devuelve la pausa que hay que esperar después. */
  #mostrar(m: MensajePartida, conPausa: boolean): number {
    const antes = this.vista;
    this.partida = m.partida;
    this.#n = m.n;
    this.vista = m.vista as V;
    this.#legales = m.legales as A[];
    this.fin = m.fin;
    this.pensando = m.piensa;
    this.#esperando = false;
    const pausa =
      conPausa && antes !== undefined ? this.def.pausaTras(antes, this.vista) * FACTOR_PAUSAS : 0;
    this.bloqueada = pausa > 0 || this.#cola.length > 0;
    return pausa;
  }

  #actualizarBloqueo() {
    this.bloqueada = this.#esperando || this.#temporizador !== null || this.#cola.length > 0;
  }
}
