// Construye el cliente para la app (con el servidor de red público) y lo copia al proyecto
// Android con `cap sync`. La dirección se puede cambiar con la variable VITE_SERVIDOR_RED.
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SERVIDOR = process.env.VITE_SERVIDOR_RED ?? 'wss://juegosdemesajs-production.up.railway.app';
if (!SERVIDOR.startsWith('wss://')) {
  throw new Error(`La app solo puede usar un servidor wss:// (VITE_SERVIDOR_RED=${SERVIDOR})`);
}

const ejecutar = (orden, env = {}) =>
  execSync(orden, { cwd: raiz, stdio: 'inherit', env: { ...process.env, ...env } });

ejecutar('corepack pnpm --filter @juegos/client build', { VITE_SERVIDOR_RED: SERVIDOR });
ejecutar('npx cap sync android');
