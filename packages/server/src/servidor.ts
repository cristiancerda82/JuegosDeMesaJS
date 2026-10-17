import { randomBytes, randomInt } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  LARGO_CODIGO,
  LETRAS_CODIGO,
  leerMensajeCliente,
  MENSAJES_ERROR,
  TAMANO_MAXIMO,
  type CodigoError,
  type MensajeServidor,
} from './protocolo';
import { Sala, type IdConexion } from './sala';

/**
 * Servidor de salas (spec partidas-en-red; design, decisiones 1 y 8): la capa de WebSockets
 * sobre `Sala`, con el registro de salas, los temporizadores reales y los límites.
 */
export interface OpcionesServidor {
  /** 0: un puerto libre cualquiera. */
  readonly puerto: number;
  /** Orígenes permitidos, o `'*'` para todos (desarrollo). */
  readonly origenes: readonly string[] | '*';
  readonly maxSalas?: number;
  /** Para los tests: la hora y cada cuánto se limpian las salas. */
  readonly ahora?: () => number;
  readonly limpiezaMs?: number;
}

export interface Servidor {
  readonly puerto: number;
  readonly salas: ReadonlyMap<string, Sala>;
  cerrar(): Promise<void>;
}

export const MAX_SALAS = 500;
export const MENSAJES_POR_SEGUNDO = 30;
export const VACIA_MAXIMO_MS = 30 * 60_000;

interface Conexion {
  readonly id: IdConexion;
  readonly socket: WebSocket;
  sala: Sala | null;
  ventana: number;
  mensajes: number;
}

export function crearServidor(opciones: OpcionesServidor): Promise<Servidor> {
  const ahora = opciones.ahora ?? Date.now;
  const maxSalas = opciones.maxSalas ?? MAX_SALAS;
  const salas = new Map<string, Sala>();
  const temporizadores = new Map<string, ReturnType<typeof setTimeout>>();
  const conexiones = new Map<IdConexion, Conexion>();
  let siguienteId = 1;

  const enviar = (id: IdConexion, mensaje: MensajeServidor) => {
    const c = conexiones.get(id);
    if (c && c.socket.readyState === c.socket.OPEN) c.socket.send(JSON.stringify(mensaje));
  };
  const error = (id: IdConexion, codigo: CodigoError) =>
    enviar(id, { tipo: 'error', codigo, mensaje: MENSAJES_ERROR[codigo] });

  const deps = {
    enviar,
    testigo: () => randomBytes(16).toString('hex'),
    semilla: () => randomBytes(8).toString('hex'),
  };

  /** Programa el próximo despertar de la sala (la IA, los relevos y las pausas). */
  function reprogramar(sala: Sala) {
    clearTimeout(temporizadores.get(sala.codigo));
    temporizadores.delete(sala.codigo);
    const espera = sala.proximoDespertar(ahora());
    if (espera === null) return;
    temporizadores.set(
      sala.codigo,
      setTimeout(() => {
        if (!salas.has(sala.codigo)) return;
        sala.despertar(ahora());
        reprogramar(sala);
      }, espera),
    );
  }

  function codigoNuevo(): string {
    for (;;) {
      const codigo = Array.from(
        { length: LARGO_CODIGO },
        () => LETRAS_CODIGO[randomInt(LETRAS_CODIGO.length)],
      ).join('');
      if (!salas.has(codigo)) return codigo;
    }
  }

  function borrarSala(codigo: string) {
    clearTimeout(temporizadores.get(codigo));
    temporizadores.delete(codigo);
    salas.delete(codigo);
  }

  /** Atiende un mensaje de una conexión. */
  function atender(c: Conexion, texto: string) {
    const m = leerMensajeCliente(texto);
    if (m === null) return error(c.id, 'mensaje-invalido');
    const t = ahora();
    if (m.tipo === 'ping') return enviar(c.id, { tipo: 'pong' });

    if (m.tipo === 'crear' || m.tipo === 'unirse' || m.tipo === 'volver') {
      if (c.sala !== null) return error(c.id, 'ya-en-sala');
      if (m.tipo === 'crear') {
        if (salas.size >= maxSalas) return error(c.id, 'servidor-lleno');
        const r = Sala.crear({ ...m, codigo: codigoNuevo(), conexion: c.id }, deps);
        if (!r.ok) return error(c.id, r.codigo);
        salas.set(r.valor.codigo, r.valor);
        c.sala = r.valor;
        return;
      }
      const sala = salas.get(m.codigo);
      if (!sala) return error(c.id, 'sin-sala');
      const r =
        m.tipo === 'unirse' ? sala.unirse(m.nombre, c.id, t) : sala.volver(m.testigo, c.id, t);
      if (!r.ok) return error(c.id, r.codigo);
      c.sala = sala;
      return reprogramar(sala);
    }

    const sala = c.sala;
    const asiento = sala?.asientoDe(c.id) ?? null;
    if (sala === null || asiento === null) return error(c.id, 'no-en-sala');
    let r: { ok: boolean; codigo?: CodigoError } = { ok: true };
    switch (m.tipo) {
      case 'asiento':
        r = sala.cambiarAsiento(asiento, m.asiento, t);
        break;
      case 'empezar':
        r = sala.empezar(asiento, t);
        break;
      case 'revancha':
        r = sala.revancha(asiento, t);
        break;
      case 'jugar':
        r = sala.jugar(asiento, m.accion, m.n, t);
        break;
      case 'pausa':
        sala.pausa(asiento, m.activa, t);
        break;
      case 'salir':
        sala.desconectar(asiento, t);
        c.sala = null;
        break;
    }
    if (!r.ok && r.codigo) error(c.id, r.codigo);
    reprogramar(sala);
  }

  const wss = new WebSocketServer({
    port: opciones.puerto,
    maxPayload: TAMANO_MAXIMO,
    verifyClient: ({ origin }: { origin: string }) =>
      opciones.origenes === '*' || opciones.origenes.includes(origin),
  });

  wss.on('connection', (socket) => {
    const c: Conexion = { id: siguienteId++, socket, sala: null, ventana: ahora(), mensajes: 0 };
    conexiones.set(c.id, c);
    socket.on('message', (datos, binario) => {
      // Límite de ritmo: más de 30 mensajes en un segundo cierra la conexión.
      const t = ahora();
      if (t - c.ventana >= 1000) {
        c.ventana = t;
        c.mensajes = 0;
      }
      if (++c.mensajes > MENSAJES_POR_SEGUNDO) {
        error(c.id, 'demasiados-mensajes');
        socket.close(1008, 'demasiados mensajes');
        return;
      }
      if (binario) return error(c.id, 'mensaje-invalido');
      atender(c, datos.toString());
    });
    socket.on('close', () => {
      conexiones.delete(c.id);
      const sala = c.sala;
      const asiento = sala?.asientoDe(c.id) ?? null;
      if (sala && asiento !== null) {
        sala.desconectar(asiento, ahora());
        reprogramar(sala);
      }
    });
  });

  // Limpieza: las salas vacías durante 30 minutos se borran.
  const limpieza = setInterval(() => {
    const t = ahora();
    for (const [codigo, sala] of salas) {
      if (sala.vaciaDesde !== null && t - sala.vaciaDesde >= VACIA_MAXIMO_MS) borrarSala(codigo);
    }
  }, opciones.limpiezaMs ?? 60_000);

  return new Promise((resolver, rechazar) => {
    wss.once('error', rechazar);
    wss.once('listening', () => {
      resolver({
        puerto: (wss.address() as AddressInfo).port,
        salas,
        cerrar: () =>
          new Promise<void>((hecho) => {
            clearInterval(limpieza);
            for (const codigo of [...salas.keys()]) borrarSala(codigo);
            for (const c of conexiones.values()) c.socket.terminate();
            wss.close(() => hecho());
          }),
      });
    });
  });
}
