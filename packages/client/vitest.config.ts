import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Solo los tests unitarios: los de `e2e/` son de Playwright.
    include: ['src/**/*.test.ts'],
  },
});
