import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Las suites de propiedades y las simulaciones de 1.000 partidas se ejecutan en paralelo y,
    // con la máquina cargada, pueden pasar de los 5 s por defecto sin que nada vaya mal.
    testTimeout: 120_000,
  },
});
