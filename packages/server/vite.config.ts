import { defineConfig } from 'vitest/config';

// El servidor se empaqueta con el motor en un solo archivo para Node; `ws` queda fuera.
export default defineConfig({
  build: {
    target: 'node24',
    ssr: true,
    rollupOptions: { external: ['ws'] },
  },
  ssr: { noExternal: ['@juegos/engine'] },
  test: { testTimeout: 120_000 },
});
