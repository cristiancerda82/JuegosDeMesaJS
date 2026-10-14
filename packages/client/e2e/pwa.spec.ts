import { expect, test, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// El test de actualización cambia `dist/sw.js`: los de este archivo van uno detrás de otro.
test.describe.configure({ mode: 'serial' });

/** Espera a que el service worker esté activo y controle la página (recargando una vez). */
async function controlada(page: Page) {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => navigator.serviceWorker.controller !== null))) {
    await page.reload();
  }
  await expect
    .poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null))
    .toBe(true);
}

/** Juega una Brisca entera tocando la primera carta jugable y la mesa. */
async function jugarBrisca(page: Page) {
  await page.getByTestId('juego-brisca').click();
  await page.getByTestId('empezar').click();
  for (let jugadas = 0; jugadas < 200; jugadas++) {
    await page.locator('.carta-mano.jugable, [data-testid="fin"]').first().waitFor();
    if (await page.getByTestId('fin').isVisible()) return;
    await page.locator('.carta-mano.jugable').first().click();
    await page.getByTestId('mesa').click();
  }
  throw new Error('La partida de Brisca no terminó');
}

test('el manifiesto es válido y sus iconos existen', async ({ page }) => {
  await page.goto('./');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBe('./manifest.webmanifest');
  const manifiesto = (await (await page.request.get(href!)).json()) as {
    name: string;
    display: string;
    start_url: string;
    icons: { src: string; sizes: string; type: string; purpose: string }[];
  };
  expect(manifiesto.name).toBe('Juegos de mesa');
  expect(manifiesto.display).toBe('standalone');
  expect(manifiesto.start_url).toBe('./');
  const tamaños = manifiesto.icons.map((i) => i.sizes);
  expect(tamaños).toContain('192x192');
  expect(tamaños).toContain('512x512');
  expect(manifiesto.icons.some((i) => i.purpose === 'maskable')).toBe(true);
  for (const icono of manifiesto.icons) {
    const r = await page.request.get(icono.src);
    expect(r.ok()).toBe(true);
    expect(r.headers()['content-type']).toContain('image/png');
  }
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect((await page.request.get(apple!)).ok()).toBe(true);
});

test('sin conexión, tras la primera visita, se abre y se juega una partida', async ({
  page,
  context,
}) => {
  await controlada(page);
  await context.setOffline(true);
  await page.goto('./?rapido');
  await expect(page.getByTestId('juego-brisca')).toBeVisible();
  await jugarBrisca(page);
  await expect(page.getByTestId('fin')).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await context.setOffline(false);
});

test('una versión nueva muestra el aviso y se activa al pulsar «Actualizar»', async ({ page }) => {
  const archivo = fileURLToPath(new URL('../dist/sw.js', import.meta.url));
  const original = await readFile(archivo, 'utf8');
  await controlada(page);
  await expect(page.getByTestId('actualizacion')).toBeHidden();
  try {
    // Se publica un sw.js distinto: otra versión y, por tanto, otra caché.
    await writeFile(
      archivo,
      original.replace(/const VERSION = "[^"]+"/, 'const VERSION = "e2e-nueva"'),
    );
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r?.update()));
    await expect(page.getByTestId('actualizacion')).toBeVisible();
    await expect(page.getByTestId('actualizacion')).toContainText('Hay una versión nueva');

    const recarga = page.waitForEvent('load');
    await page.getByTestId('actualizar').click();
    await recarga;
    await expect.poll(() => page.evaluate(() => caches.keys())).toEqual(['juegos-e2e-nueva']);
    await expect(page.getByTestId('actualizacion')).toBeHidden();
  } finally {
    await writeFile(archivo, original);
  }
});
