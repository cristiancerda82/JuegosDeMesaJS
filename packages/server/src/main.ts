import { crearServidor } from './servidor';

/**
 * Arranque del servidor de salas. Variables de entorno:
 * - `PORT` (la pone el servicio de despliegue, p. ej. Railway) o, si no, `PUERTO` (por defecto 8787);
 * - `ORIGENES`: orígenes permitidos separados por comas, o `*` (por defecto) para todos;
 * - `CONFIAR_PROXY=1`: detrás del proxy del despliegue, la IP del cliente sale de `X-Forwarded-For`;
 * - `MAX_CONEXIONES_POR_IP` y `MAX_SALAS_POR_IP`: cambian los límites por IP (20 y 5 por defecto).
 *   Los e2e los suben, porque todos sus jugadores llegan desde la misma IP.
 */
const puerto = Number(process.env.PORT ?? process.env.PUERTO ?? 8787);
const confiarProxy = process.env.CONFIAR_PROXY === '1';
const numero = (texto: string | undefined) => (texto ? Number(texto) : undefined);
const maxConexionesPorIp = numero(process.env.MAX_CONEXIONES_POR_IP);
const maxSalasPorIp = numero(process.env.MAX_SALAS_POR_IP);
const origenesTexto = process.env.ORIGENES ?? '*';
const origenes =
  origenesTexto.trim() === '*'
    ? '*'
    : origenesTexto
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

const servidor = await crearServidor({
  puerto,
  origenes,
  confiarProxy,
  ...(maxConexionesPorIp ? { maxConexionesPorIp } : {}),
  ...(maxSalasPorIp ? { maxSalasPorIp } : {}),
});
console.log(`Servidor de salas en ws://localhost:${servidor.puerto}`);

for (const senal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(senal, () => {
    void servidor.cerrar().then(() => process.exit(0));
  });
}
