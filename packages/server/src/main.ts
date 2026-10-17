import { crearServidor } from './servidor';

/**
 * Arranque del servidor de salas. Variables de entorno:
 * - `PUERTO` (por defecto 8787);
 * - `ORIGENES`: orígenes permitidos separados por comas, o `*` (por defecto) para todos.
 */
const puerto = Number(process.env.PUERTO ?? 8787);
const origenesTexto = process.env.ORIGENES ?? '*';
const origenes =
  origenesTexto.trim() === '*'
    ? '*'
    : origenesTexto
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

const servidor = await crearServidor({ puerto, origenes });
console.log(`Servidor de salas en ws://localhost:${servidor.puerto}`);

for (const senal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(senal, () => {
    void servidor.cerrar().then(() => process.exit(0));
  });
}
