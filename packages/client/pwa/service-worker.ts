/// <reference types="node" />
// Este archivo corre en Node, durante el build; el resto del cliente solo ve los tipos del DOM.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Código del service worker. Precarga todo el build en una caché por versión, responde primero
 * desde la caché (las navegaciones, con `index.html`) y solo se activa cuando la página se lo
 * pide, para no cambiar de versión en mitad de una partida.
 */
export function codigoServiceWorker(version: string, archivos: readonly string[]): string {
  return `// Generado en el build por pwa/service-worker.ts. No editar.
const VERSION = ${JSON.stringify(version)};
const CACHE = 'juegos-' + VERSION;
const ARCHIVOS = ${JSON.stringify(['./', ...archivos.map((a) => `./${a}`)])};

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS)));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((c) => c.startsWith('juegos-') && c !== CACHE).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const peticion = evento.request;
  if (peticion.method !== 'GET' || new URL(peticion.url).origin !== self.location.origin) return;
  evento.respondWith(
    caches.open(CACHE).then(async (cache) => {
      if (peticion.mode === 'navigate') {
        return (await cache.match('./index.html')) ?? (await cache.match('./')) ?? fetch(peticion);
      }
      // \`ignoreVary\`: los scripts de módulo piden con cabecera Origin y el servidor responde
      // con «Vary: Origin»; lo guardado al instalar no la lleva y no coincidiría.
      return (await cache.match(peticion, { ignoreSearch: true, ignoreVary: true })) ?? fetch(peticion);
    }),
  );
});

self.addEventListener('message', (evento) => {
  if (evento.data === 'activar') self.skipWaiting();
});
`;
}

function listar(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? listar(ruta) : [ruta];
  });
}

/**
 * Emite `sw.js` con la lista de archivos del build (el bundle y `public/`) y una versión que es
 * el hash de su contenido: cualquier cambio publicado produce un service worker distinto.
 */
export function serviceWorker(): Plugin {
  let publico = '';
  return {
    name: 'juegos:service-worker',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      publico = config.publicDir;
    },
    generateBundle(_opciones, bundle) {
      const hash = createHash('sha256');
      const archivos: string[] = [];
      for (const [nombre, salida] of Object.entries(bundle)) {
        archivos.push(nombre);
        hash.update(nombre);
        hash.update(salida.type === 'chunk' ? salida.code : salida.source);
      }
      if (publico) {
        for (const ruta of listar(publico)) {
          const nombre = relative(publico, ruta).split('\\').join('/');
          archivos.push(nombre);
          hash.update(nombre);
          hash.update(readFileSync(ruta));
        }
      }
      archivos.sort();
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: codigoServiceWorker(hash.digest('hex').slice(0, 12), archivos),
      });
    },
  };
}
