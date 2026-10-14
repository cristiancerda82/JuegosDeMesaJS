import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { serviceWorker } from './pwa/service-worker';

export default defineConfig({
  plugins: [svelte(), serviceWorker()],
  // Rutas relativas: el build se sirve tal cual desde Capacitor, Tauri o cualquier carpeta.
  base: './',
});
