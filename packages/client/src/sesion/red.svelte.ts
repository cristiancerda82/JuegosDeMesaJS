import type { MensajeCliente, MensajeServidor } from '@juegos/server/protocolo';
import { esNativa } from '../plataforma';

/**
 * Conexión con el servidor de salas (spec partidas-en-red; design, decisión 5): el socket, la
 * sala en la que se está y la reconexión con espera creciente. La usan las pantallas de red y
 * la `SesionRed`.
 */

export type MensajeSala = Extract<MensajeServidor, { tipo: 'sala' }>;
export type MensajePartida = Extract<MensajeServidor, { tipo: 'partida' }>;
export type MensajeEntrada = Extract<MensajeServidor, { tipo: 'entrada' }>;

// ── Lo que se recuerda entre visitas ─────────────────────────────────────────

const CLAVE_SERVIDOR = 'juegos-de-mesa/red/servidor';
const CLAVE_NOMBRE = 'juegos-de-mesa/red/nombre';
const CLAVE_SALA = 'juegos-de-mesa/red/sala';

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string | null): void {
  try {
    if (valor === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, valor);
  } catch {
    // Sin almacenamiento: vale solo para esta visita.
  }
}

/**
 * Dirección por defecto: la del servidor público con la que se publica la app
 * (`VITE_SERVIDOR_RED`), o en desarrollo el puerto 8787 del mismo equipo.
 */
export function servidorPorDefecto(): string {
  const env = import.meta.env.VITE_SERVIDOR_RED as string | undefined;
  if (env) return env;
  const host = typeof location === 'undefined' ? 'localhost' : location.hostname || 'localhost';
  return `ws://${host}:8787`;
}

/** En la app nativa solo valen servidores seguros: Android bloquea `ws://` (spec partidas-en-red). */
export const servidorAdmitido = (url: string) => !esNativa() || !url.trim().startsWith('ws://');

export function servidorGuardado(): string {
  const guardado = leer(CLAVE_SERVIDOR);
  return guardado !== null && servidorAdmitido(guardado) ? guardado : servidorPorDefecto();
}
export const guardarServidor = (url: string) => escribir(CLAVE_SERVIDOR, url.trim());
export const nombreGuardado = () => leer(CLAVE_NOMBRE) ?? '';
export const guardarNombre = (nombre: string) => escribir(CLAVE_NOMBRE, nombre.trim());

/** La sala en la que se estaba, para volver al recargar. */
export interface SalaGuardada {
  readonly servidor: string;
  readonly codigo: string;
  readonly testigo: string;
}

export function salaGuardada(): SalaGuardada | null {
  try {
    const s = JSON.parse(leer(CLAVE_SALA) ?? 'null') as Partial<SalaGuardada> | null;
    if (
      s &&
      typeof s.servidor === 'string' &&
      typeof s.codigo === 'string' &&
      typeof s.testigo === 'string'
    ) {
      return { servidor: s.servidor, codigo: s.codigo, testigo: s.testigo };
    }
  } catch {
    // Guardado roto: como si no hubiera.
  }
  return null;
}

export const olvidarSala = () => escribir(CLAVE_SALA, null);

// ── Conexión ─────────────────────────────────────────────────────────────────

/** Esperas entre intentos de reconexión, en ms. */
const ESPERAS = [1000, 2000, 4000, 8000, 10_000];
/** Latido (design, decisión 4): un ping cada 10 s y, si el pong tarda más de 10 s, se da por perdida. */
export const CADA_PING_MS = 10_000;
export const ESPERA_PONG_MS = 10_000;

export class ClienteRed {
  readonly servidor: string;
  /** `conectando` la primera vez; `reconectando` tras perder una conexión que funcionaba. */
  estado = $state<'conectando' | 'conectado' | 'reconectando' | 'cerrado'>('conectando');
  sala = $state.raw<MensajeSala | null>(null);
  entrada = $state.raw<MensajeEntrada | null>(null);
  /** Último error del servidor (texto para el jugador), o `null`. */
  error = $state<{ codigo: string; mensaje: string } | null>(null);
  /** Lo llama la `SesionRed` para recibir cada vista de la partida. */
  alRecibirPartida: ((m: MensajePartida) => void) | null = null;
  /** Último mensaje de partida (para la sesión que se cree después de recibirlo). */
  ultimaPartida = $state.raw<MensajePartida | null>(null);

  #socket: WebSocket | null = null;
  #intentos = 0;
  #cerrado = false;
  #reintento: ReturnType<typeof setTimeout> | null = null;
  #ping: ReturnType<typeof setInterval> | null = null;
  #esperaPong: ReturnType<typeof setTimeout> | null = null;
  #alVolverVisible = () => {
    if (document.visibilityState === 'visible') this.comprobar();
  };

  constructor(servidor: string) {
    this.servidor = servidor;
    globalThis.document?.addEventListener('visibilitychange', this.#alVolverVisible);
  }

  /**
   * Comprueba la conexión ya, sin esperar al siguiente latido (al volver del segundo plano): si
   * el socket no está abierto se reconecta al momento; si parece abierto, se manda un ping, que
   * destapa el socket «zombi» que Android deja aparentemente abierto.
   */
  comprobar(): void {
    if (this.#cerrado) return;
    const estado = this.#socket?.readyState;
    if (estado === WebSocket.OPEN) {
      this.#latir();
      return;
    }
    if (estado === WebSocket.CONNECTING) return;
    if (this.#reintento !== null) clearTimeout(this.#reintento);
    this.#reintento = null;
    this.#intentos = 0;
    this.estado = 'reconectando';
    this.conectar().catch(() => {
      // Se reintenta en el siguiente cierre.
    });
  }

  /** Manda un ping y, si el pong no llega a tiempo, da la conexión por perdida. */
  #latir(): void {
    this.enviar({ tipo: 'ping' });
    if (this.#esperaPong !== null) return;
    this.#esperaPong = setTimeout(() => {
      this.#esperaPong = null;
      this.#abandonar();
    }, ESPERA_PONG_MS);
  }

  /** Suelta un socket que no responde y pasa a reconectar sin esperar a que se cierre. */
  #abandonar(): void {
    const socket = this.#socket;
    this.#socket = null;
    socket?.close();
    this.#alCerrar();
  }

  /** Abre la conexión; falla si el servidor no responde la primera vez. */
  conectar(): Promise<void> {
    return new Promise((resolver, rechazar) => {
      let abierta = false;
      let socket: WebSocket;
      try {
        socket = new WebSocket(this.servidor);
      } catch {
        rechazar(new Error('sin conexión'));
        return;
      }
      this.#socket = socket;
      socket.addEventListener('open', () => {
        abierta = true;
        this.#intentos = 0;
        this.estado = 'conectado';
        // Al volver tras un corte, se recupera el asiento con el testigo.
        if (this.entrada) {
          this.enviar({
            tipo: 'volver',
            codigo: this.entrada.codigo,
            testigo: this.entrada.testigo,
          });
        }
        this.#ping ??= setInterval(() => this.#latir(), CADA_PING_MS);
        resolver();
      });
      socket.addEventListener('message', (ev) => this.#recibir(String(ev.data)));
      socket.addEventListener('close', () => {
        if (!abierta) rechazar(new Error('sin conexión'));
        if (this.#socket === socket) this.#alCerrar();
      });
    });
  }

  enviar(m: MensajeCliente): void {
    if (this.#socket?.readyState === WebSocket.OPEN) this.#socket.send(JSON.stringify(m));
  }

  /** Sale de la sala y cierra la conexión, sin reconectar. */
  cerrar(): void {
    this.#cerrado = true;
    globalThis.document?.removeEventListener('visibilitychange', this.#alVolverVisible);
    if (this.#esperaPong !== null) clearTimeout(this.#esperaPong);
    this.enviar({ tipo: 'salir' });
    olvidarSala();
    if (this.#reintento !== null) clearTimeout(this.#reintento);
    if (this.#ping !== null) clearInterval(this.#ping);
    this.#socket?.close();
    this.estado = 'cerrado';
  }

  #recibir(texto: string) {
    let m: MensajeServidor;
    try {
      m = JSON.parse(texto) as MensajeServidor;
    } catch {
      return;
    }
    switch (m.tipo) {
      case 'entrada':
        this.entrada = m;
        this.error = null;
        escribir(
          CLAVE_SALA,
          JSON.stringify({ servidor: this.servidor, codigo: m.codigo, testigo: m.testigo }),
        );
        break;
      case 'sala':
        this.sala = m;
        break;
      case 'partida':
        this.ultimaPartida = m;
        this.alRecibirPartida?.(m);
        break;
      case 'error':
        this.error = { codigo: m.codigo, mensaje: m.mensaje };
        // Un testigo que ya no vale: la sala no existe o el asiento se liberó.
        if (m.codigo === 'testigo' || (m.codigo === 'sin-sala' && this.entrada)) {
          olvidarSala();
          this.entrada = null;
        }
        break;
      case 'pong':
        if (this.#esperaPong !== null) clearTimeout(this.#esperaPong);
        this.#esperaPong = null;
        break;
    }
  }

  #alCerrar() {
    if (this.#cerrado) return;
    if (this.#esperaPong !== null) clearTimeout(this.#esperaPong);
    this.#esperaPong = null;
    if (this.#reintento !== null) clearTimeout(this.#reintento);
    this.estado = 'reconectando';
    const espera = ESPERAS[Math.min(this.#intentos, ESPERAS.length - 1)]!;
    this.#intentos++;
    this.#reintento = setTimeout(() => {
      this.conectar().catch(() => {
        // Se reintenta en el siguiente cierre.
      });
    }, espera);
  }
}
