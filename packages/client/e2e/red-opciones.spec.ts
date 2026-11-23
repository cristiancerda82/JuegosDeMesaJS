import { expect, test, type Browser, type Page } from '@playwright/test';
import { T } from '../src/textos';
import { abrirJuego } from './menu';

// Change red-desde-opciones: «Empezar en red» desde las opciones, la elección del juego de la
// sala por familias y el modo asistido en red con el permiso del anfitrión.

async function jugador(browser: Browser): Promise<Page> {
  return (await browser.newContext()).newPage();
}

async function unirse(page: Page, codigo: string, nombre: string) {
  await page.goto('./?rapido');
  await page.getByTestId('jugar-en-red').click();
  await page.getByTestId('nombre').fill(nombre);
  await page.getByTestId('codigo').fill(codigo);
  await page.getByTestId('unirse').click();
  await expect(page.getByTestId('sala-espera')).toBeVisible();
}

test('«Empezar en red» crea la sala con las opciones elegidas', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'escoba');
  await page.getByTestId('nombre-red').fill('Ana');
  await page.getByTestId('nivel-ia').getByText(T.opciones.nivel.dificil).click();
  await page.getByTestId('empezar-en-red').click();

  await expect(page.getByTestId('codigo-sala')).toHaveText(/^[A-Z]{5}$/);
  await expect(page.getByTestId('sala-espera')).toContainText('Escoba');
  await expect(page.getByTestId('sala-espera')).toContainText(
    T.red.nivel(T.opciones.nivel.dificil),
  );
  await expect(page.getByTestId('asiento-sala-0')).toContainText('Ana');
  await expect(page.getByTestId('sala-asistido')).toHaveText(T.red.sinAsistido);

  // El nombre queda guardado para la próxima vez.
  await page.goto('./?rapido');
  await abrirJuego(page, 'brisca');
  await expect(page.getByTestId('nombre-red')).toHaveValue('Ana');
});

test('«Empezar en red» sin nombre lo pide y no crea la sala', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'brisca');
  await expect(page.getByTestId('nombre-red')).toHaveValue('');
  await page.getByTestId('empezar-en-red').click();
  await expect(page.getByTestId('aviso-nombre')).toHaveText(T.red.faltaNombre);
  await expect(page.getByTestId('nivel-ia')).toBeVisible();
  await expect(page.getByTestId('sala-espera')).toHaveCount(0);
});

test('los solitarios no ofrecen «Empezar en red»', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'klondike');
  await expect(page.getByTestId('empezar')).toBeVisible();
  await expect(page.getByTestId('empezar-en-red')).toHaveCount(0);
  await expect(page.getByTestId('nombre-red')).toHaveCount(0);
});

test('el juego de la sala se elige por familias o con el buscador', async ({ page }) => {
  await page.goto('./?rapido');
  await page.getByTestId('jugar-en-red').click();
  await page.getByTestId('nombre').fill('Ana');
  await page.getByTestId('crear-sala').click();

  await expect(page.locator('[data-testid^="familia-"]')).toHaveCount(7);
  await expect(page.getByTestId('familia-solitarios')).toHaveCount(0);

  await page.getByTestId('familia-captura').click();
  await expect(page.locator('[data-testid^="red-juego-"]')).toHaveCount(7);
  await page.getByTestId('volver-familias').click();
  await expect(page.locator('[data-testid^="familia-"]')).toHaveCount(7);

  await page.getByTestId('red-buscar').fill('guinote');
  await expect(page.locator('[data-testid^="red-juego-"]')).toHaveCount(1);
  await page.getByTestId('red-juego-guinote').click();
  // Las opciones de la sala: un solo botón y el permiso del modo asistido.
  await expect(page.getByTestId('empezar')).toHaveText(T.red.crear);
  await expect(page.getByTestId('empezar-en-red')).toHaveCount(0);
  await expect(page.getByTestId('modo-asistido')).toHaveCount(0);
  await expect(page.getByTestId('permitir-asistido')).not.toBeChecked();
});

test('modo asistido en red: con permiso, cada jugador lo activa por su cuenta', async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const ana = await jugador(browser);
  const luis = await jugador(browser);

  await ana.goto('./?rapido');
  await abrirJuego(ana, 'brisca');
  await ana.getByTestId('nombre-red').fill('Ana');
  await ana.getByTestId('permitir-asistido').check();
  await ana.getByTestId('empezar-en-red').click();
  const codigo = (await ana.getByTestId('codigo-sala').textContent())!;
  await unirse(luis, codigo, 'Luis');

  for (const p of [ana, luis])
    await expect(p.getByTestId('sala-asistido')).toHaveText(T.red.conAsistido);
  await ana.getByTestId('empezar-red').click();

  // Los dos tienen el interruptor; empieza apagado porque nadie lo activó en local.
  for (const p of [ana, luis])
    await expect(p.getByTestId('alternar-asistido')).toHaveAttribute('aria-pressed', 'false');
  await ana.getByTestId('alternar-asistido').click();
  await expect(ana.getByTestId('alternar-asistido')).toHaveAttribute('aria-pressed', 'true');

  // Cuando le toca, Ana ve la sugerencia; Luis, que no lo activó, no ve nada.
  for (let i = 0; i < 4; i++) {
    if (await ana.locator('.carta-mano.jugable').first().isVisible()) break;
    const carta = luis.locator('.carta-mano.jugable').first();
    if (await carta.isVisible()) await carta.click();
    await ana.waitForTimeout(500);
  }
  await expect(ana.getByTestId('sugerencia')).toBeVisible({ timeout: 15_000 });
  await expect(luis.getByTestId('sugerencia')).toHaveCount(0);
  await expect(luis.getByTestId('lectura')).toHaveCount(0);
  await expect(ana.getByTestId('lectura')).toHaveCount(0);
});

test('modo asistido en red: sin permiso no aparece el interruptor', async ({ browser }) => {
  const ana = await jugador(browser);
  await ana.goto('./?rapido');
  await abrirJuego(ana, 'brisca');
  await ana.getByTestId('modo-asistido').check();
  await ana.getByTestId('nombre-red').fill('Ana');
  await ana.getByTestId('empezar-en-red').click();
  await expect(ana.getByTestId('sala-asistido')).toHaveText(T.red.sinAsistido);
  await ana.getByTestId('empezar-red').click();
  await expect(ana.locator('.carta-mano').first()).toBeVisible();
  await expect(ana.getByTestId('alternar-asistido')).toHaveCount(0);
  await expect(ana.getByTestId('sugerencia')).toHaveCount(0);
});
