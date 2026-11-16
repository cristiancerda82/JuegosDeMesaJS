import { expect, test } from '@playwright/test';

test('el menú enlaza la política de privacidad, que explica lo que se envía en red', async ({
  page,
}) => {
  await page.goto('./?rapido');
  await page.getByTestId('privacidad').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Política de privacidad de Juegos de mesa',
  );
  await expect(page.getByText('el servidor recibe el nombre que escribes')).toBeVisible();
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(ancho).toBeLessThanOrEqual(0);

  await page.getByRole('link', { name: '← Volver a los juegos' }).click();
  await expect(page.getByTestId('buscar')).toBeVisible();
});
