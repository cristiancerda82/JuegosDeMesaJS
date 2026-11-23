import { expect, test, type Page } from '@playwright/test';
import { abrirJuego, elegirJuegoDeSala } from './menu';

// El botón atrás de Android, simulado en el navegador con `?atras` (spec app-android).
const atras = (page: Page) => page.evaluate(() => window.dispatchEvent(new Event('atras')));
const appCerrada = (page: Page) => page.locator('html[data-app-cerrada]');

test('en el menú, atrás cierra el panel, la búsqueda y la familia antes de salir de la app', async ({
  page,
}) => {
  await page.goto('./?rapido&atras');

  await page.getByTestId('abrir-recientes').click();
  await expect(page.getByTestId('panel-recientes')).toBeVisible();
  await atras(page);
  await expect(page.getByTestId('panel-recientes')).toBeHidden();

  await page.getByTestId('buscar').fill('tute');
  await atras(page);
  await expect(page.getByTestId('buscar')).toHaveValue('');

  await page.getByTestId('familia-solitarios').click();
  await expect(page.getByTestId('volver-familias')).toBeVisible();
  await atras(page);
  await expect(page.getByTestId('volver-familias')).toBeHidden();
  await expect(appCerrada(page)).toHaveCount(0);

  await atras(page);
  await expect(appCerrada(page)).toHaveCount(1);
});

test('atrás cierra la guía y después vuelve de las opciones al menú', async ({ page }) => {
  await page.goto('./?rapido&atras');
  await abrirJuego(page, 'brisca');
  await page.getByTestId('ver-ayuda').click();
  await expect(page.getByTestId('como-se-juega')).toBeVisible();

  await atras(page);
  await expect(page.getByTestId('como-se-juega')).toBeHidden();
  await expect(page.getByTestId('empezar')).toBeVisible();

  await atras(page);
  await expect(page.getByTestId('buscar')).toBeVisible();
  await expect(appCerrada(page)).toHaveCount(0);
});

test('atrás en una partida local vuelve al menú y la partida se puede retomar', async ({
  page,
}) => {
  await page.goto('./?rapido&atras&semilla=atras');
  await abrirJuego(page, 'klondike');
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('volver-menu')).toBeVisible();

  await atras(page);
  await expect(page.getByTestId('retomar')).toBeVisible();
  await expect(page.getByTestId('retomar')).toContainText('Klondike');
});

test('atrás en la sala de espera pide confirmación antes de salir', async ({ page }) => {
  await page.goto('./?rapido&atras');
  await page.getByTestId('jugar-en-red').click();
  await page.getByTestId('nombre').fill('Ana');
  await page.getByTestId('crear-sala').click();

  // Eligiendo el juego, atrás vuelve de la familia a las familias y de ahí a la pantalla de red.
  await page.getByTestId('familia-bazasPuntos').click();
  await expect(page.getByTestId('red-juego-brisca')).toBeVisible();
  await atras(page);
  await expect(page.getByTestId('red-juego-brisca')).toBeHidden();
  await expect(page.getByTestId('familia-bazasPuntos')).toBeVisible();
  await atras(page);
  await expect(page.getByTestId('familia-bazasPuntos')).toBeHidden();
  await expect(page.getByTestId('crear-sala')).toBeVisible();

  await page.getByTestId('crear-sala').click();
  await elegirJuegoDeSala(page, 'brisca');
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('codigo-sala')).toHaveText(/^[A-Z]{5}$/);

  // Si cancela, sigue en la sala.
  page.once('dialog', (d) => void d.dismiss());
  await atras(page);
  await expect(page.getByTestId('codigo-sala')).toBeVisible();

  // Si acepta, sale al menú.
  page.once('dialog', (d) => {
    expect(d.message()).toBe('¿Seguro que quieres salir de la sala?');
    void d.accept();
  });
  await atras(page);
  await expect(page.getByTestId('buscar')).toBeVisible();
});
