import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

// Historia, consejos, variantes regionales y ejemplos de los libros (change guias-libros).

async function abrirGuia(page: Page, juego: Parameters<typeof abrirJuego>[1]) {
  await page.goto('./?rapido');
  await abrirJuego(page, juego);
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toBeVisible();
  return guia;
}

test('Tute: la historia empieza plegada y se abre, y el consejo de no arrastrar contra el As', async ({
  page,
}) => {
  const guia = await abrirGuia(page, 'tute');
  await expect(guia).toContainText('Contra el As de triunfo no arrastres');
  const historia = guia.getByTestId('historia');
  await expect(historia).not.toHaveAttribute('open');
  await expect(historia.getByText('tutti')).toBeHidden();
  await historia.locator('summary').click();
  await expect(historia).toHaveAttribute('open', '');
  await expect(historia.getByText('tutti')).toBeVisible();
  await historia.locator('summary').click();
  await expect(historia).not.toHaveAttribute('open');
});

test('Escoba: la partida a 31 en otros sitios y el ejemplo de los premios', async ({ page }) => {
  const guia = await abrirGuia(page, 'escoba');
  await expect(guia).toContainText('En otros sitios la partida se juega a 31 puntos');
  const ejemplo = guia.getByTestId('ejemplo-premios');
  await ejemplo.scrollIntoViewIfNeeded();
  await expect(ejemplo).toBeVisible();
  await expect(ejemplo).toContainText('Sietes, con premios');
});

test('Chinchón: el ejemplo de colocar una suelta en la combinación a la vista', async ({
  page,
}) => {
  const guia = await abrirGuia(page, 'chinchon');
  const ejemplo = guia.getByTestId('ejemplo-colocar');
  await ejemplo.scrollIntoViewIfNeeded();
  await expect(ejemplo).toBeVisible();
  await expect(ejemplo).toHaveAttribute('aria-label', /colocas en ella tu 7 de copas/);
});
