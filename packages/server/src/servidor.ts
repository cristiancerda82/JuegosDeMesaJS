import { randomBytes, randomInt } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';
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
  /**
   * Detrás de un proxy de confianza (el del despliegue): la IP del cliente es el primer valor de
   * `X-Forwarded-For`. Sin proxy no se mira esa cabecera, que cualquiera podría falsear.
   */
  readonly confiarProxy?: boolean;
  readonly maxConexionesPorIp?: number;
  readonly maxSalasPorIp?: number;
  /** Una conexión sin ningún mensaje durante este tiempo se cierra (y se trata como desconexión). */
  readonly silencioMaximoMs?: number;
  /** Cada cuánto se buscan conexiones calladas. */
  readonly revisionLatidoMs?: number;
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
export const MAX_CONEXIONES_POR_IP = 20;
export const MAX_SALAS_POR_IP = 5;
export const SILENCIO_MAXIMO_MS = 60_000;

/** IP del cliente: la del proxy de confianza si lo hay, o la del socket. */
export function ipDe(req: IncomingMessage, confiarProxy: boolean): string {
  if (confiarProxy) {
    const cabecera = req.headers['x-forwarded-for'];
    const primera = (Array.isArray(cabecera) ? cabecera[0] : cabecera)?.split(',')[0]?.trim();
    if (primera) return primera;
  }
  return req.socket.remoteAddress ?? 'desconocida';
}

interface Conexion {
  readonly id: IdConexion;
  readonly socket: WebSocket;
  readonly ip: string;
  sala: Sala | null;
  /** Hora del último mensaje recibido (latido del servidor). */
  ultimoMensaje: number;
  ventana: number;
  mensajes: number;
}

export function crearServidor(opciones: OpcionesServidor): Promise<Servidor> {
  const ahora = opciones.ahora ?? Date.now;
  const maxSalas = opciones.maxSalas ?? MAX_SALAS;
  const confiarProxy = opciones.confiarProxy ?? false;
  const maxConexionesPorIp = opciones.maxConexionesPorIp ?? MAX_CONEXIONES_POR_IP;
  const maxSalasPorIp = opciones.maxSalasPorIp ?? MAX_SALAS_POR_IP;
  const silencioMaximo = opciones.silencioMaximoMs ?? SILENCIO_MAXIMO_MS;
  /** IP de quien creó cada sala, para el límite de salas por IP. */
  const ipDeSala = new Map<string, string>();
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
    ipDeSala.delete(codigo);
  }

  const conexionesDe = (ip: string) => [...conexiones.values()].filter((c) => c.ip === ip).length;
  const salasDe = (ip: string) => [...ipDeSala.values()].filter((i) => i === ip).length;

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
        if (salasDe(c.ip) >= maxSalasPorIp) return error(c.id, 'demasiadas-salas');
        const r = Sala.crear({ ...m, codigo: codigoNuevo(), conexion: c.id }, deps);
        if (!r.ok) return error(c.id, r.codigo);
        salas.set(r.valor.codigo, r.valor);
        ipDeSala.set(r.valor.codigo, c.ip);
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

  // HTTP y WebSocket en el mismo puerto (design, decisión 2): `/salud` para el despliegue, 404
  // para todo lo demás. La salud no dice nada de las salas ni de los jugadores.
  const http = createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/salud') {
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }).end('ok');
      return;
    }
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('No encontrado');
  });

  const wss = new WebSocketServer({
    server: http,
    maxPayload: TAMANO_MAXIMO,
    verifyClient: (
      { origin, req }: { origin: string; req: IncomingMessage },
      responder: (ok: boolean, codigo?: number, mensaje?: string) => void,
    ) => {
      if (opciones.origenes !== '*' && !opciones.origenes.includes(origin)) {
        return responder(false, 403, 'Origen no permitido');
      }
      if (conexionesDe(ipDe(req, confiarProxy)) >= maxConexionesPorIp) {
        return responder(false, 429, 'Demasiadas conexiones');
      }
      responder(true);
    },
  });

  wss.on('connection', (socket, req) => {
    const c: Conexion = {
      id: siguienteId++,
      socket,
      ip: ipDe(req, confiarProxy),
      sala: null,
      ventana: ahora(),
      mensajes: 0,
      ultimoMensaje: ahora(),
    };
    conexiones.set(c.id, c);
    socket.on('message', (datos, binario) => {
      c.ultimoMensaje = ahora();
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

  // Latido del servidor (design, decisión 4): las conexiones calladas se cierran, y el cierre pasa
  // por la desconexión normal (el asiento queda desconectado y luego lo cubre la IA).
  const latido = setInterval(() => {
    const t = ahora();
    for (const c of conexiones.values()) {
      if (t - c.ultimoMensaje > silencioMaximo) c.socket.terminate();
    }
  }, opciones.revisionLatidoMs ?? 15_000);

  return new Promise((resolver, rechazar) => {
    http.once('error', rechazar);
    http.listen(opciones.puerto, () => {
      resolver({
        puerto: (http.address() as AddressInfo).port,
        salas,
        cerrar: () =>
          new Promise<void>((hecho) => {
            clearInterval(limpieza);
            clearInterval(latido);
            for (const codigo of [...salas.keys()]) borrarSala(codigo);
            for (const c of conexiones.values()) c.socket.terminate();
            wss.close(() => http.close(() => hecho()));
          }),
      });
    });
  });
}
