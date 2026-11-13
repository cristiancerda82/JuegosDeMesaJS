import { expect, test, type Browser, type Page } from '@playwright/test';
import { T } from '../src/textos';
import { abrirJuego } from './menu';

// Spec menu-juegos: familias, filtro, buscador, favoritos, últimos jugados y paneles flotantes.

const tituloOpciones = (page: Page, juego: string) =>
  page.getByRole('heading', { name: T.opciones.titulo(juego) });

/** Empieza una partida del juego y vuelve al menú. */
async function jugarYVolver(page: Page, juego: Parameters<typeof abrirJuego>[1]) {
  await abrirJuego(page, juego);
  await page.getByTestId('empezar').click();
  await page.getByTestId('volver-menu').click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('./?rapido');
});

test.describe('familias', () => {
  test('elegir un solitario', async ({ page }) => {
    await page.getByTestId('familia-solitarios').click();
    await expect(page.locator('[data-testid^="juego-"]')).toHaveCount(11);
    await page.getByTestId('juego-spider').click();
    await expect(tituloOpciones(page, 'Spider')).toBeVisible();
  });

  test('al volver desde las opciones se vuelve a la familia', async ({ page }) => {
    await page.getByTestId('familia-captura').click();
    await page.getByTestId('juego-escoba').click();
    await page.getByRole('button', { name: T.opciones.volver }).click();
    await expect(page.getByTestId('volver-familias')).toBeVisible();
    await expect(page.getByTestId('juego-escoba')).toBeVisible();
    await page.getByTestId('volver-familias').click();
    await expect(page.getByTestId('familia-captura')).toBeVisible();
  });

  test('el número de juegos de cada familia aparece en su tarjeta', async ({ page }) => {
    await expect(page.getByTestId('familia-solitarios')).toContainText(T.menu.juegosN(11));
    await expect(page.getByTestId('familia-bazasEvitar')).toContainText(T.menu.juegosN(4));
  });
});

test.describe('filtro por baraja', () => {
  test('solo baraja española, y se recuerda al recargar', async ({ page }) => {
    await page.getByTestId('filtro-espanola').click();
    await expect(page.getByTestId('familia-solitarios')).toHaveCount(0);
    await page.getByTestId('familia-bazasPuntos').click();
    for (const id of ['brisca', 'tute', 'guinote'])
      await expect(page.getByTestId(`juego-${id}`)).toBeVisible();
    await expect(page.getByTestId('juego-skat')).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId('filtro-espanola')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('familia-solitarios')).toHaveCount(0);
  });
});

test.describe('buscador', () => {
  test('busca sin tildes', async ({ page }) => {
    await page.getByTestId('buscar').fill('guinote');
    await page.getByTestId('juego-guinote').click();
    await expect(tituloOpciones(page, 'Guiñote')).toBeVisible();
  });

  test('sin resultados', async ({ page }) => {
    await page.getByTestId('buscar').fill('zzzz');
    await expect(page.getByTestId('sin-resultados')).toBeVisible();
    await page.getByTestId('buscar').fill('');
    await expect(page.getByTestId('familia-solitarios')).toBeVisible();
  });
});

test.describe('favoritos', () => {
  test('marcar en el menú y abrir desde el panel', async ({ page }) => {
    await page.getByTestId('familia-bazasPuntos').click();
    await page.getByTestId('favorito-brisca').click();
    await expect(page.getByTestId('favorito-brisca')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('abrir-favoritos').click();
    await page.getByTestId('panel-favoritos').getByTestId('acceso-brisca').click();
    await expect(tituloOpciones(page, 'Brisca')).toBeVisible();
  });

  test('quitar desde las opciones, y el orden se conserva al recargar', async ({ page }) => {
    await page.getByTestId('buscar').fill('brisca');
    await page.getByTestId('favorito-brisca').click();
    await page.getByTestId('buscar').fill('mus');
    await page.getByTestId('favorito-mus').click();
    await page.getByTestId('buscar').fill('tute');
    await page.getByTestId('favorito-tute').click();

    await page.reload();
    await page.getByTestId('abrir-favoritos').click();
    const filas = page.getByTestId('panel-favoritos').locator('[data-testid^="acceso-"] .nombre');
    await expect(filas).toHaveText(['Tute', 'Mus', 'Brisca']);

    await page.getByTestId('acceso-mus').click();
    await page.getByTestId('favorito-mus').click();
    await expect(page.getByTestId('favorito-mus')).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: T.opciones.volver }).click();
    await page.getByTestId('abrir-favoritos').click();
    await expect(filas).toHaveText(['Tute', 'Brisca']);
  });

  test('sin favoritos, el panel explica cómo añadirlos', async ({ page }) => {
    await page.getByTestId('abrir-favoritos').click();
    await expect(page.getByTestId('panel-favoritos')).toContainText(T.menu.favoritosVacio);
  });
});

test.describe('últimos jugados', () => {
  test('el último jugado va primero y no se repite', async ({ page }) => {
    await jugarYVolver(page, 'klondike');
    await jugarYVolver(page, 'mus');
    await jugarYVolver(page, 'klondike');
    await page.getByTestId('abrir-recientes').click();
    const filas = page.getByTestId('panel-recientes').locator('[data-testid^="acceso-"] .nombre');
    await expect(filas).toHaveText(['Klondike', 'Mus']);
  });

  test('entrar en una sala en red cuenta como jugado', async ({ browser }) => {
    test.setTimeout(120_000);
    const nueva = async (b: Browser) => (await b.newContext()).newPage();
    const ana = await nueva(browser);
    const luis = await nueva(browser);

    await ana.goto('./?rapido');
    await ana.getByTestId('jugar-en-red').click();
    await ana.getByTestId('nombre').fill('Ana');
    await ana.getByTestId('crear-sala').click();
    await ana.getByTestId('red-juego-tute').click();
    await ana.getByTestId('empezar').click();
    const codigo = ana.getByTestId('codigo-sala');
    await expect(codigo).toHaveText(/^[A-Z]{5}$/);

    await luis.goto('./?rapido');
    await luis.getByTestId('jugar-en-red').click();
    await luis.getByTestId('nombre').fill('Luis');
    await luis.getByTestId('codigo').fill((await codigo.textContent())!);
    await luis.getByTestId('unirse').click();
    await expect(luis.getByTestId('sala-espera')).toBeVisible();

    for (const p of [ana, luis]) {
      await p.getByTestId('salir-sala').click();
      await p.getByTestId('abrir-recientes').click();
      await expect(
        p.getByTestId('panel-recientes').locator('[data-testid^="acceso-"] .nombre').first(),
      ).toHaveText('Tute');
    }
  });
});

test.describe('paneles flotantes', () => {
  test('Escape cierra el panel y devuelve el foco al botón', async ({ page }) => {
    await page.getByTestId('abrir-recientes').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('panel-recientes')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('panel-recientes')).toHaveCount(0);
    await expect(page.getByTestId('abrir-recientes')).toBeFocused();
  });

  test('pulsar fuera cierra el panel, y solo hay uno abierto a la vez', async ({ page }, info) => {
    await page.getByTestId('abrir-favoritos').click();
    if (info.project.name === 'movil') {
      // En móvil el panel es una hoja inferior que tapa los botones: se cierra antes de abrir el otro.
      await page.locator('header h1').click();
      await expect(page.getByTestId('panel-favoritos')).toHaveCount(0);
    }
    await page.getByTestId('abrir-recientes').click();
    await expect(page.getByTestId('panel-favoritos')).toHaveCount(0);
    await expect(page.getByTestId('panel-recientes')).toBeVisible();
    await page.locator('header h1').click();
    await expect(page.getByTestId('panel-recientes')).toHaveCount(0);
  });

  test('no hay botones flotantes durante una partida', async ({ page }) => {
    await abrirJuego(page, 'klondike');
    await page.getByTestId('empezar').click();
    await expect(page.getByTestId('volver-menu')).toBeVisible();
    await expect(page.getByTestId('abrir-favoritos')).toHaveCount(0);
    await expect(page.getByTestId('abrir-recientes')).toHaveCount(0);
  });

  test('con el almacenamiento bloqueado, los favoritos funcionan durante la sesión', async ({
    page,
  }) => {
    const errores: Error[] = [];
    page.on('pageerror', (e) => errores.push(e));
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new Error('bloqueado');
      };
    });
    await page.reload();
    await page.getByTestId('buscar').fill('mus');
    await page.getByTestId('favorito-mus').click();
    await page.getByTestId('abrir-favoritos').click();
    await expect(page.getByTestId('panel-favoritos').getByTestId('acceso-mus')).toBeVisible();
    // Ningún error llega a la página ni se ve un aviso.
    expect(errores).toEqual([]);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});

test.describe('pantalla de móvil', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('los botones flotantes no tapan la última tarjeta y no hay scroll horizontal', async ({
    page,
  }) => {
    await page.getByTestId('familia-solitarios').click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const ultima = page.locator('[data-testid^="juego-"]').last();
    const tarjeta = (await ultima.boundingBox())!;
    const botones = (await page.getByTestId('abrir-favoritos').boundingBox())!;
    expect(tarjeta.y + tarjeta.height).toBeLessThanOrEqual(botones.y);
    const ancho = await page.evaluate(() => [
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
    ]);
    expect(ancho[0]).toBeLessThanOrEqual(ancho[1]!);
  });
});
