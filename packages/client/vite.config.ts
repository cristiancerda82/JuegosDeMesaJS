import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [svelte()],
  // Rutas relativas: el build se sirve tal cual desde Capacitor, Tauri o cualquier carpeta.
  base: './',
});
