import { expect, test, type Page } from '@playwright/test';
import { T } from '../src/textos';
import { abrirJuego } from './menu';

// Spec temas-naipes. Las capturas de «Minimal» se tomaron antes de introducir los temas: si
// coinciden, el diseño por defecto no ha cambiado («Por defecto, sin cambios»).

async function abrirMuestrario(page: Page) {
  await page.goto('./?rapido');
  await page.getByRole('button', { name: T.menu.verCartas }).click();
  await expect(page.getByRole('heading', { name: T.cartas.muestrario })).toBeVisible();
}

async function empezarSpider(page: Page) {
  await page.goto('./?rapido&semilla=temas');
  await abrirJuego(page, 'spider');
  await page.getByLabel('4 palos').check();
  await page.getByTestId('empezar').click();
  await page.waitForFunction(() => document.getAnimations().length === 0);
}

test.describe('Minimal, sin cambios', () => {
  // Las capturas se comparan solo en escritorio: un tamaño de pantalla basta para el aspecto.
  test.skip(({ isMobile }) => isMobile, 'solo escritorio');

  test('muestrario: cada baraja y los dorsos', async ({ page }) => {
    await abrirMuestrario(page);
    const secciones = page.locator('main section');
    await expect(secciones).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(secciones.nth(i)).toHaveScreenshot(`minimal-muestrario-${i}.png`);
    }
  });

  test('mesa de Spider de 4 palos', async ({ page }) => {
    await empezarSpider(page);
    await expect(page).toHaveScreenshot('minimal-spider.png');
  });
});

// ── Elegir el tema ───────────────────────────────────────────────────────────

/** Cartas dibujadas con símbolos de un tema (`<use href="#castizo-…">`). */
const conTema = (page: Page, tema: string) => page.locator(`svg.carta use[href^="#${tema}-"]`);

async function elegirTema(page: Page, baraja: 'espanola' | 'francesa', tema: string) {
  await page.getByTestId('diseno-cartas').locator('summary').click();
  await page.getByTestId(`tema-${baraja}-${tema}`).check({ force: true });
}

async function empezarBrisca(page: Page) {
  await abrirJuego(page, 'brisca');
  await page.getByTestId('empezar').click();
  await expect(page.locator('.carta-mano').first()).toBeVisible();
}

test('elegir Castizo para la española: se recuerda y no cambia la francesa', async ({ page }) => {
  await page.goto('./?rapido&semilla=temas');
  await elegirTema(page, 'espanola', 'castizo');
  await page.reload();
  await expect(page.getByTestId('tema-espanola-castizo')).toBeChecked();

  await empezarBrisca(page);
  await expect(conTema(page, 'castizo').first()).toBeVisible();

  await page.getByTestId('volver-menu').click();
  await abrirJuego(page, 'klondike');
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('volver-menu')).toBeVisible();
  await expect(page.locator('svg.carta').first()).toBeVisible();
  await expect(conTema(page, 'castizo')).toHaveCount(0);
});

test('el nombre accesible de las cartas es el mismo con cualquier tema', async ({ page }) => {
  const nombres = async () => {
    await page.goto('./?rapido&semilla=nombres');
    await empezarBrisca(page);
    return page
      .locator('.carta-mano svg.carta')
      .evaluateAll((cs) => cs.map((c) => c.getAttribute('aria-label')));
  };
  const minimal = await nombres();
  await page.getByTestId('volver-menu').click();
  await elegirTema(page, 'espanola', 'castizo');
  const castizo = await nombres();
  expect(castizo).toEqual(minimal);
  expect(minimal.every((n) => n && n.length > 0)).toBe(true);
});

test('si el tema no se puede cargar, las cartas siguen en Minimal y se puede jugar', async ({
  page,
}) => {
  const errores: Error[] = [];
  page.on('pageerror', (e) => errores.push(e));
  await page.route(/assets\/tema-[^/]*\.js$/, (r) => r.abort());
  await page.addInitScript(() => localStorage.setItem('juegos-de-mesa/tema-espanola', 'castizo'));
  await page.goto('./?rapido&semilla=fallo');
  await empezarBrisca(page);
  await expect(conTema(page, 'castizo')).toHaveCount(0);
  await page.locator('.carta-mano.jugable').first().click();
  expect(errores).toEqual([]);
});
