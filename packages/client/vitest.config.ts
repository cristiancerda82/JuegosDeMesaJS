import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // El plugin compila las runas de los módulos `.svelte.ts` (p. ej. `ClienteRed`).
  plugins: [svelte()],
  test: {
    // Solo los tests unitarios: los de `e2e/` son de Playwright.
    include: ['src/**/*.test.ts'],
  },
});
