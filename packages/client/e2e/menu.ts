import type { Page } from '@playwright/test';
import { CATALOGO } from '../src/menu/catalogo';
import type { IdJuego } from '../src/sesion/juegos';

/**
 * Abre las opciones de un juego desde el menú, pasando por su familia (design, decisión 8).
 * Si el menú está en otra familia o con una búsqueda, vuelve antes a las familias.
 */
export async function abrirJuego(page: Page, juego: IdJuego): Promise<void> {
  const buscar = page.getByTestId('buscar');
  if (await buscar.inputValue()) await buscar.fill('');
  const volver = page.getByTestId('volver-familias');
  if (await volver.isVisible()) await volver.click();
  await page.getByTestId(`familia-${CATALOGO[juego].familia}`).click();
  await page.getByTestId(`juego-${juego}`).click();
}
