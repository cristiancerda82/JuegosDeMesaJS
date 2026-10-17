import { defineConfig, devices } from '@playwright/test';

const PUERTO = 4173;

export default defineConfig({
  testDir: './e2e',
  timeout: 240_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PUERTO}/`,
    trace: 'retain-on-failure',
    // Permite usar un Chromium ya instalado si no coincide con la versión de Playwright.
    ...(process.env.CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    // Los tests de los juegos van sin service worker, para que cada carga venga del servidor.
    {
      name: 'escritorio',
      testIgnore: /pwa\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], serviceWorkers: 'block' },
    },
    {
      name: 'movil',
      testIgnore: /pwa\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 640 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 2,
        serviceWorkers: 'block',
      },
    },
    // La aplicación instalable: service worker, sin conexión y actualizaciones.
    {
      name: 'pwa',
      testMatch: /pwa\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], serviceWorkers: 'allow' },
    },
  ],
  webServer: [
    // Se prueba el build estático, que es lo que se empaqueta.
    {
      command: `npx vite build && npx vite preview --port ${PUERTO} --strictPort`,
      port: PUERTO,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    // El servidor de salas, para las partidas en red.
    {
      command: 'corepack pnpm --filter @juegos/server build && node ../server/dist/main.js',
      port: 8787,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
