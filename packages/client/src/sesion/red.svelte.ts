import type { MensajeCliente, MensajeServidor } from '@juegos/server/protocolo';

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

/** Dirección por defecto: la variable de entorno, o el puerto 8787 del mismo equipo. */
function servidorPorDefecto(): string {
  const env = import.meta.env.VITE_SERVIDOR_RED as string | undefined;
  if (env) return env;
  const host = typeof location === 'undefined' ? 'localhost' : location.hostname || 'localhost';
  return `ws://${host}:8787`;
}

export const servidorGuardado = () => leer(CLAVE_SERVIDOR) ?? servidorPorDefecto();
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

  constructor(servidor: string) {
    this.servidor = servidor;
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
        this.#ping ??= setInterval(() => this.enviar({ tipo: 'ping' }), 20_000);
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
        break;
    }
  }

  #alCerrar() {
    if (this.#cerrado) return;
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
