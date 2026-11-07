import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CADA_PING_MS, ClienteRed, ESPERA_PONG_MS } from './red.svelte';

// ── Un WebSocket simulado ────────────────────────────────────────────────────

class SocketFalso extends EventTarget {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static creados: SocketFalso[] = [];

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readyState = SocketFalso.CONNECTING;
  readonly enviados: { tipo: string; [k: string]: unknown }[] = [];

  readonly url: string;

  constructor(url: string) {
    super();
    this.url = url;
    SocketFalso.creados.push(this);
  }

  send(texto: string) {
    this.enviados.push(JSON.parse(texto));
  }

  close() {
    if (this.readyState === SocketFalso.CLOSED) return;
    this.readyState = SocketFalso.CLOSED;
    this.dispatchEvent(new Event('close'));
  }

  // Lo que hace el «servidor»:
  abrir() {
    this.readyState = SocketFalso.OPEN;
    this.dispatchEvent(new Event('open'));
  }

  recibir(m: unknown) {
    const ev = new Event('message') as Event & { data: string };
    ev.data = JSON.stringify(m);
    this.dispatchEvent(ev);
  }

  /** El sistema mata la conexión (se cierra sin que el cliente lo pida). */
  caer() {
    this.close();
  }

  tipos() {
    return this.enviados.map((m) => m.tipo);
  }
}

const documento = Object.assign(new EventTarget(), { visibilityState: 'visible' });

function volverVisible() {
  documento.visibilityState = 'visible';
  documento.dispatchEvent(new Event('visibilitychange'));
}

const ultimo = () => SocketFalso.creados.at(-1)!;

/** Crea un cliente y abre su primera conexión. */
async function conectado(): Promise<ClienteRed> {
  const cliente = new ClienteRed('wss://salas.test');
  const promesa = cliente.conectar();
  ultimo().abrir();
  await promesa;
  return cliente;
}

beforeEach(() => {
  vi.useFakeTimers();
  SocketFalso.creados = [];
  vi.stubGlobal('WebSocket', SocketFalso);
  vi.stubGlobal('document', documento);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ClienteRed: latido', () => {
  it('si el pong no llega en 10 s, da la conexión por perdida y reconecta', async () => {
    const cliente = await conectado();
    vi.advanceTimersByTime(CADA_PING_MS);
    expect(ultimo().tipos()).toContain('ping');

    vi.advanceTimersByTime(ESPERA_PONG_MS);
    expect(cliente.estado).toBe('reconectando');
    expect(SocketFalso.creados[0]!.readyState).toBe(SocketFalso.CLOSED);

    vi.advanceTimersByTime(1000);
    expect(SocketFalso.creados).toHaveLength(2);
    cliente.cerrar();
  });

  it('con el pong a tiempo, la conexión sigue', async () => {
    const cliente = await conectado();
    vi.advanceTimersByTime(CADA_PING_MS);
    ultimo().recibir({ tipo: 'pong' });
    vi.advanceTimersByTime(ESPERA_PONG_MS + 5000);
    expect(SocketFalso.creados).toHaveLength(1);
    expect(cliente.estado).toBe('conectado');
    cliente.cerrar();
  });

  it('detecta la red caída en menos de 30 s', async () => {
    const cliente = await conectado();
    let t = 0;
    while (cliente.estado === 'conectado' && t < 30_000) {
      vi.advanceTimersByTime(500);
      t += 500;
    }
    expect(cliente.estado).toBe('reconectando');
    expect(t).toBeLessThan(30_000);
    cliente.cerrar();
  });
});

describe('ClienteRed: volver del segundo plano', () => {
  it('con el socket cerrado, reconecta al momento sin esperar', async () => {
    const cliente = await conectado();
    documento.visibilityState = 'hidden';
    ultimo().caer();
    expect(cliente.estado).toBe('reconectando');
    expect(SocketFalso.creados).toHaveLength(1);

    volverVisible();
    expect(SocketFalso.creados).toHaveLength(2);
    cliente.cerrar();
  });

  it('con un socket zombi (parece abierto), manda un ping y lo abandona si no responde', async () => {
    const cliente = await conectado();
    const zombi = ultimo();
    volverVisible();
    expect(zombi.tipos()).toEqual(['ping']);

    vi.advanceTimersByTime(ESPERA_PONG_MS);
    expect(cliente.estado).toBe('reconectando');
    vi.advanceTimersByTime(1000);
    expect(SocketFalso.creados).toHaveLength(2);
    cliente.cerrar();
  });

  it('al reconectar, vuelve a su asiento con el testigo', async () => {
    const cliente = await conectado();
    ultimo().recibir({ tipo: 'entrada', codigo: 'ABCDE', asiento: 1, testigo: 'secreto' });
    ultimo().caer();
    volverVisible();
    ultimo().abrir();
    expect(ultimo().enviados[0]).toEqual({ tipo: 'volver', codigo: 'ABCDE', testigo: 'secreto' });
    cliente.cerrar();
  });

  it('cerrado a propósito, no reconecta al volver', async () => {
    const cliente = await conectado();
    cliente.cerrar();
    volverVisible();
    vi.advanceTimersByTime(20_000);
    expect(SocketFalso.creados).toHaveLength(1);
  });
});
