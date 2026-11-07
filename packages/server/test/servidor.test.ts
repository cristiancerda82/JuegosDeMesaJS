import { crearAzar, IAS, type EstadoAzar } from '@juegos/engine';
import { afterEach, describe, expect, it } from 'vitest';
import type { MensajeServidor } from '../src/protocolo';
import { crearServidor, MENSAJES_POR_SEGUNDO, type Servidor } from '../src/servidor';

const CONFIG_BRISCA = { jugadores: 2, cambioMuestra: 'libre', arrastreFinal: false, manos: 1 };

/** Intenta abrir una conexión; `true` si el servidor la acepta. */
async function seAbre(cliente: Cliente): Promise<boolean> {
  return cliente.abierto().then(
    () => true,
    () => false,
  );
}

// ── Un cliente de prueba ─────────────────────────────────────────────────────

class Cliente {
  readonly recibidos: MensajeServidor[] = [];
  readonly #ws: WebSocket;
  #esperas: (() => void)[] = [];
  cerrado = false;

  constructor(puerto: number, origen?: string, cabeceras: Record<string, string> = {}) {
    this.#ws = new WebSocket(`ws://localhost:${puerto}`, {
      headers: { ...cabeceras, ...(origen ? { origin: origen } : {}) },
    } as never);
    this.#ws.addEventListener('message', (ev) => {
      this.recibidos.push(JSON.parse(String(ev.data)) as MensajeServidor);
      for (const f of this.#esperas.splice(0)) f();
    });
    this.#ws.addEventListener('close', () => {
      this.cerrado = true;
      for (const f of this.#esperas.splice(0)) f();
    });
  }

  abierto(): Promise<void> {
    return new Promise((ok, mal) => {
      this.#ws.addEventListener('open', () => ok());
      this.#ws.addEventListener('error', () => mal(new Error('sin conexión')));
    });
  }

  enviar(m: unknown) {
    this.#ws.send(JSON.stringify(m));
  }

  cerrar() {
    this.#ws.close();
  }

  ultimo<T extends MensajeServidor['tipo']>(tipo: T) {
    return this.recibidos.filter((m) => m.tipo === tipo).at(-1) as
      Extract<MensajeServidor, { tipo: T }> | undefined;
  }

  /** Espera a que llegue un mensaje que cumpla la condición. */
  async esperar(cumple: (c: this) => boolean, ms = 5000): Promise<void> {
    const limite = Date.now() + ms;
    while (!cumple(this)) {
      if (this.cerrado || Date.now() > limite) throw new Error('Tiempo agotado esperando');
      await new Promise<void>((ok) => {
        this.#esperas.push(ok);
        setTimeout(ok, 50);
      });
    }
  }
}

let servidor: Servidor | null = null;
afterEach(async () => {
  await servidor?.cerrar();
  servidor = null;
});

describe('servidor de salas', () => {
  it('una Brisca completa entre dos clientes', async () => {
    servidor = await crearServidor({ puerto: 0, origenes: '*' });
    const ana = new Cliente(servidor.puerto);
    const luis = new Cliente(servidor.puerto);
    await Promise.all([ana.abierto(), luis.abierto()]);

    ana.enviar({
      tipo: 'crear',
      juego: 'brisca',
      config: { jugadores: 2, cambioMuestra: 'libre', arrastreFinal: false, manos: 1 },
      nivel: 'normal',
      nombre: 'Ana',
    });
    await ana.esperar((c) => c.ultimo('entrada') !== undefined);
    const codigo = ana.ultimo('entrada')!.codigo;
    expect(codigo).toMatch(/^[A-Z]{5}$/);

    luis.enviar({ tipo: 'unirse', codigo, nombre: 'Luis' });
    await luis.esperar((c) => c.ultimo('entrada')?.asiento === 1);
    ana.enviar({ tipo: 'empezar' });

    const azares: EstadoAzar[] = [crearAzar('a'), crearAzar('l')];
    const jugadores = [ana, luis];
    for (let paso = 0; paso < 200; paso++) {
      await ana.esperar((c) => c.ultimo('partida') !== undefined);
      await luis.esperar((c) => c.ultimo('partida')?.n === ana.ultimo('partida')!.n);
      if (ana.ultimo('partida')!.fin !== null) break;
      const a = jugadores.findIndex((j) => j.ultimo('partida')!.legales.length > 0);
      const p = jugadores[a]!.ultimo('partida')!;
      const d = IAS.brisca.normal.decidir(p.vista as never, p.legales as never, azares[a]!);
      azares[a] = d.azar;
      jugadores[a]!.enviar({ tipo: 'jugar', accion: d.accion, n: p.n });
      await ana.esperar((c) => c.ultimo('partida')!.n > p.n);
    }
    expect(ana.ultimo('partida')!.fin).not.toBeNull();
    expect(luis.ultimo('partida')!.fin).toEqual(ana.ultimo('partida')!.fin);
  });

  it('errores: código que no existe y mensaje malformado', async () => {
    servidor = await crearServidor({ puerto: 0, origenes: '*' });
    const c = new Cliente(servidor.puerto);
    await c.abierto();
    c.enviar({ tipo: 'unirse', codigo: 'ZZZZZ', nombre: 'Eva' });
    await c.esperar((x) => x.ultimo('error') !== undefined);
    expect(c.ultimo('error')).toMatchObject({
      codigo: 'sin-sala',
      mensaje: 'No hay ninguna sala con ese código',
    });
    c.enviar('{roto');
    await c.esperar((x) => x.ultimo('error')?.codigo === 'mensaje-invalido');
    c.enviar({ tipo: 'empezar' });
    await c.esperar((x) => x.ultimo('error')?.codigo === 'no-en-sala');
  });

  it('cierra la conexión que envía demasiados mensajes', async () => {
    servidor = await crearServidor({ puerto: 0, origenes: '*' });
    const c = new Cliente(servidor.puerto);
    await c.abierto();
    for (let i = 0; i <= MENSAJES_POR_SEGUNDO + 5; i++) c.enviar({ tipo: 'ping' });
    await c.esperar((x) => x.cerrado);
    expect(c.ultimo('error')?.codigo).toBe('demasiados-mensajes');
  });

  it('rechaza orígenes no permitidos y respeta el máximo de salas', async () => {
    servidor = await crearServidor({ puerto: 0, origenes: ['http://bueno.test'], maxSalas: 1 });
    const malo = new Cliente(servidor.puerto, 'http://malo.test');
    await expect(malo.abierto()).rejects.toThrow();
    const a = new Cliente(servidor.puerto, 'http://bueno.test');
    const b = new Cliente(servidor.puerto, 'http://bueno.test');
    await Promise.all([a.abierto(), b.abierto()]);
    const crear = {
      tipo: 'crear',
      juego: 'mus',
      config: { reyes: 8, puntos: 40, juegos: 3 },
      nivel: 'normal',
      nombre: 'A',
    };
    a.enviar(crear);
    await a.esperar((x) => x.ultimo('entrada') !== undefined);
    b.enviar(crear);
    await b.esperar((x) => x.ultimo('error') !== undefined);
    expect(b.ultimo('error')!.codigo).toBe('servidor-lleno');
  });

  it('al volver con el testigo se recupera el asiento', async () => {
    servidor = await crearServidor({ puerto: 0, origenes: '*' });
    const ana = new Cliente(servidor.puerto);
    const luis = new Cliente(servidor.puerto);
    await Promise.all([ana.abierto(), luis.abierto()]);
    ana.enviar({
      tipo: 'crear',
      juego: 'brisca',
      config: { jugadores: 2, cambioMuestra: 'libre', arrastreFinal: false, manos: 1 },
      nivel: 'normal',
      nombre: 'Ana',
    });
    await ana.esperar((c) => c.ultimo('entrada') !== undefined);
    const { codigo } = ana.ultimo('entrada')!;
    luis.enviar({ tipo: 'unirse', codigo, nombre: 'Luis' });
    await luis.esperar((c) => c.ultimo('entrada') !== undefined);
    ana.enviar({ tipo: 'empezar' });
    await luis.esperar((c) => c.ultimo('partida') !== undefined);
    const { testigo } = luis.ultimo('entrada')!;
    luis.cerrar();
    await ana.esperar((c) => c.ultimo('sala')!.asientos[1]?.conectado === false);
    const otra = new Cliente(servidor.puerto);
    await otra.abierto();
    otra.enviar({ tipo: 'volver', codigo, testigo });
    await otra.esperar((c) => c.ultimo('partida') !== undefined);
    expect(otra.ultimo('entrada')!.asiento).toBe(1);
    await ana.esperar((c) => c.ultimo('sala')!.asientos[1]?.conectado === true);
  });

  describe('servidor público', () => {
    it('responde a /salud sin datos de las salas, y 404 al resto', async () => {
      servidor = await crearServidor({ puerto: 0, origenes: '*' });
      const salud = await fetch(`http://localhost:${servidor.puerto}/salud`);
      expect(salud.status).toBe(200);
      expect(await salud.text()).toBe('ok');
      expect((await fetch(`http://localhost:${servidor.puerto}/salas`)).status).toBe(404);
    });

    it('limita las conexiones por IP', async () => {
      servidor = await crearServidor({ puerto: 0, origenes: '*', maxConexionesPorIp: 2 });
      const puerto = servidor.puerto;
      expect(await seAbre(new Cliente(puerto))).toBe(true);
      expect(await seAbre(new Cliente(puerto))).toBe(true);
      expect(await seAbre(new Cliente(puerto))).toBe(false);
    });

    it('sin proxy de confianza ignora X-Forwarded-For; con él, cuenta la IP del cliente', async () => {
      servidor = await crearServidor({ puerto: 0, origenes: '*', maxConexionesPorIp: 1 });
      const ip = (n: number) => ({ 'x-forwarded-for': `203.0.113.${n}, 10.0.0.1` });
      expect(await seAbre(new Cliente(servidor.puerto, undefined, ip(1)))).toBe(true);
      expect(await seAbre(new Cliente(servidor.puerto, undefined, ip(2)))).toBe(false);
      await servidor.cerrar();

      servidor = await crearServidor({
        puerto: 0,
        origenes: '*',
        maxConexionesPorIp: 1,
        confiarProxy: true,
      });
      expect(await seAbre(new Cliente(servidor.puerto, undefined, ip(1)))).toBe(true);
      expect(await seAbre(new Cliente(servidor.puerto, undefined, ip(2)))).toBe(true);
      expect(await seAbre(new Cliente(servidor.puerto, undefined, ip(1)))).toBe(false);
    });

    it('limita las salas abiertas por IP', async () => {
      servidor = await crearServidor({ puerto: 0, origenes: '*', maxSalasPorIp: 1 });
      const ana = new Cliente(servidor.puerto);
      const otra = new Cliente(servidor.puerto);
      await Promise.all([ana.abierto(), otra.abierto()]);
      const crear = { tipo: 'crear', juego: 'brisca', config: CONFIG_BRISCA, nivel: 'normal' };
      ana.enviar({ ...crear, nombre: 'Ana' });
      await ana.esperar((c) => c.ultimo('sala') !== undefined);
      otra.enviar({ ...crear, nombre: 'Otra' });
      await otra.esperar((c) => c.ultimo('error') !== undefined);
      expect(otra.ultimo('error')!.codigo).toBe('demasiadas-salas');
      expect(servidor.salas.size).toBe(1);
    });

    it('cierra la conexión callada y la IA cubre su asiento', async () => {
      servidor = await crearServidor({
        puerto: 0,
        origenes: '*',
        silencioMaximoMs: 300,
        revisionLatidoMs: 50,
      });
      const ana = new Cliente(servidor.puerto);
      const luis = new Cliente(servidor.puerto);
      await Promise.all([ana.abierto(), luis.abierto()]);
      // Ana sigue dando señales de vida; Luis deja de enviar mensajes.
      const latido = setInterval(() => ana.enviar({ tipo: 'ping' }), 100);
      try {
        ana.enviar({
          tipo: 'crear',
          juego: 'brisca',
          config: CONFIG_BRISCA,
          nivel: 'normal',
          nombre: 'Ana',
        });
        await ana.esperar((c) => c.ultimo('sala') !== undefined);
        luis.enviar({ tipo: 'unirse', codigo: ana.ultimo('sala')!.codigo, nombre: 'Luis' });
        await luis.esperar((c) => c.ultimo('sala') !== undefined);
        ana.enviar({ tipo: 'empezar' });
        await ana.esperar((c) => c.ultimo('sala')?.empezada === true);

        await luis.esperar((c) => c.cerrado, 3000).catch(() => undefined);
        expect(luis.cerrado).toBe(true);
        await ana.esperar((c) => c.ultimo('sala')?.asientos[1]?.conectado === false);
        await ana.esperar((c) => c.ultimo('sala')?.asientos[1]?.relevado === true, 15_000);
      } finally {
        clearInterval(latido);
      }
    }, 20_000);
  });
});
