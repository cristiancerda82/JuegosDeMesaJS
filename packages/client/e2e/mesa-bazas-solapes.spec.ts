import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import type { IdJuego } from '../src/sesion/juegos';

// La mesa de bazas con el máximo de jugadores de cada juego: nada se pisa (change mesa-bazas-legible).

/** Las cajas que no pueden solaparse: cada parte de cada rival, el centro y lo propio. */
async function solapes(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const cajas: { nombre: string; r: DOMRect }[] = [];
    const meter = (nombre: string, el: Element | null) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) cajas.push({ nombre, r });
    };
    for (const asiento of document.querySelectorAll('[data-testid^="asiento-"]')) {
      const id = asiento.getAttribute('data-testid')!;
      meter(`${id} nombre`, asiento.querySelector('.nombre'));
      meter(`${id} cartas`, asiento.querySelector('.mano-rival'));
    }
    meter('mesa', document.querySelector('[data-testid="mesa"]'));
    meter('mazo', document.querySelector('[data-zona="mazo"]'));
    meter('nombre propio', document.querySelector('.propio .nombre'));
    meter('mano', document.querySelector('[data-testid="mano"]'));
    document.querySelectorAll('[data-testid="mesa"] .jugada').forEach((j, i) => {
      meter(`carta de la baza ${i}`, j);
    });
    const fuera: string[] = [];
    const ancho = document.documentElement.clientWidth;
    // Los rivales van por encima del jugador: arriba y a los lados de la mesa.
    const propio = document.querySelector('.propio .nombre')?.getBoundingClientRect();
    for (const { nombre, r } of cajas) {
      if (propio && nombre.startsWith('asiento-') && r.bottom > propio.top + 1) {
        fuera.push(`${nombre} está por debajo del jugador`);
      }
    }
    // Un píxel de margen por el redondeo.
    for (const { nombre, r } of cajas) {
      if (r.left < -1 || r.right > ancho + 1) fuera.push(`${nombre} se sale de la pantalla`);
    }
    for (let i = 0; i < cajas.length; i++) {
      for (let k = i + 1; k < cajas.length; k++) {
        const a = cajas[i]!.r;
        const b = cajas[k]!.r;
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        const dentroDeLaMesa =
          cajas[k]!.nombre.startsWith('carta de la baza') && cajas[i]!.nombre === 'mesa';
        if (x > 1 && y > 1 && !dentroDeLaMesa) {
          fuera.push(`${cajas[i]!.nombre} pisa ${cajas[k]!.nombre}`);
        }
      }
    }
    return fuera;
  });
}

const CASOS: readonly { juego: IdJuego; jugadores: number }[] = [
  { juego: 'ohHell', jugadores: 7 },
  { juego: 'polignac', jugadores: 6 },
  { juego: 'burroBazas', jugadores: 6 },
  { juego: 'corazones', jugadores: 6 },
  { juego: 'julepe', jugadores: 6 },
  { juego: 'bourre', jugadores: 5 },
  { juego: 'tarot', jugadores: 5 },
  { juego: 'briscolaChiamata', jugadores: 5 },
  { juego: 'brisca', jugadores: 4 },
  { juego: 'tute', jugadores: 4 },
];

for (const { juego, jugadores } of CASOS) {
  test(`${juego} con ${jugadores}: los asientos, la mesa y la mano no se pisan`, async ({
    page,
  }) => {
    await page.goto('./?semilla=solapes');
    await abrirJuego(page, juego);
    const radio = page.getByLabel(`${jugadores} jugadores`, { exact: true });
    if (await radio.isVisible()) await radio.check();
    await page.getByTestId('empezar').click();
    await expect(page.getByTestId('mano')).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    expect(await solapes(page)).toEqual([]);
    await page.screenshot({
      path: `test-results/solapes-${juego}-${page.viewportSize()!.width}.png`,
    });
  });
}

test('Oh Hell con 7: cada carta de la baza va hacia su jugador, con su nombre, sin pisarse', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('./?rapido&semilla=solapes-baza');
  await abrirJuego(page, 'ohHell');
  await page.getByLabel('7 jugadores', { exact: true }).check();
  await page.getByTestId('empezar').click();
  // Apuesta lo primero que pueda hasta que le toca jugar con cartas en la mesa.
  for (let i = 0; i < 60; i++) {
    const apuesta = page.locator('[data-accion="apostar"]').first();
    if (await apuesta.isVisible()) await apuesta.click();
    const enMesa = await page.locator('[data-testid="mesa"] .jugada').count();
    const jugables = page.locator('.carta-mano.jugable');
    if (enMesa >= 3 && (await jugables.count()) > 0) break;
    // Si sale antes de que haya 3 cartas, juega y espera a la baza siguiente.
    if ((await jugables.count()) > 0) {
      await jugables.first().click({ position: { x: 6, y: 6 } });
      await page.getByTestId('mesa').click();
    }
    await page.waitForTimeout(250);
  }
  const jugadas = page.locator('[data-testid="mesa"] .jugada');
  expect(await jugadas.count()).toBeGreaterThanOrEqual(3);
  // Todas llevan el nombre de quien la echó.
  for (const j of await jugadas.all()) await expect(j.locator('.autor')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  expect(await solapes(page)).toEqual([]);
  await page.screenshot({ path: `test-results/solapes-baza-${page.viewportSize()!.width}.png` });

  // «Ver baza» abre la baza en curso, en orden y con quién echó cada carta.
  await page.getByTestId('ver-baza').click();
  const panel = page.getByTestId('panel-baza');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-testid^="baza-carta-"]')).toHaveCount(await jugadas.count());
  await page.screenshot({
    path: `test-results/solapes-ver-baza-${page.viewportSize()!.width}.png`,
  });
  await panel.getByTestId('cerrar-baza').click();
  await expect(panel).toBeHidden();
});

test.describe('en un móvil grande', () => {
  test.use({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });

  test('Oh Hell con 7, con las apuestas hechas: nada se pisa', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('./?rapido&semilla=solapes-movil');
    await abrirJuego(page, 'ohHell');
    await page.getByLabel('7 jugadores', { exact: true }).check();
    await page.getByTestId('empezar').click();
    for (let i = 0; i < 60; i++) {
      const apuesta = page.locator('[data-accion="apostar"]').first();
      if (await apuesta.isVisible()) await apuesta.click();
      if ((await page.locator('.carta-mano.jugable').count()) > 0) break;
      await page.waitForTimeout(250);
    }
    await page.waitForFunction(() => document.getAnimations().length === 0);
    expect(await solapes(page)).toEqual([]);
    await page.screenshot({ path: 'test-results/solapes-ohHell-412.png' });
  });
});
