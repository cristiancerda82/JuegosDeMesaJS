import { expect, test } from '@playwright/test';

test('una pista resalta un movimiento sin hacerlo, y se cuenta en el fin', async ({ page }) => {
  page.on('dialog', (d) => d.accept());
  await page.goto('./?rapido&semilla=e2e-1');
  await page.getByTestId('juego-klondike').click();
  await page.getByTestId('empezar').click();
  await expect(page.getByTestId('movimientos')).toHaveText('0');

  await page.getByTestId('pista').click();
  // Se resaltan las cartas que se moverían (o el mazo) y el destino.
  await expect(page.locator('.pista-resaltada').first()).toBeVisible();
  await page.screenshot({ path: `test-results/pista-${page.viewportSize()!.width}.png` });
  await expect(page.getByTestId('movimientos')).toHaveText('0');
  // El resaltado se va solo.
  await expect(page.locator('.pista-resaltada')).toHaveCount(0, { timeout: 5000 });

  // Las pistas se guardan con la partida.
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Abandonar' }).click();
  await expect(page.getByTestId('pistas-usadas')).toHaveText('Pistas usadas: 1');
});

test('sin movimientos, el aviso de atasco deja deshacer', async ({ page }) => {
  // Semilla buscada con el motor: robando de 3 en 3 sin vueltas, al vaciar el mazo no queda
  // ninguna jugada.
  await page.goto('./?rapido&semilla=atasco-18');
  await page.getByTestId('juego-klondike').click();
  await page.getByLabel('De 3 en 3').check();
  await page.getByLabel('Ninguna').check();
  await page.getByTestId('empezar').click();
  const atasco = page.getByTestId('atasco');
  for (let i = 1; i <= 8; i++) {
    await expect(atasco).toBeHidden();
    await page.getByTestId('mazo').click();
    await expect(page.getByTestId('movimientos')).toHaveText(String(i));
  }
  await expect(atasco).toBeVisible();
  await expect(atasco).toContainText('No quedan movimientos');

  await atasco.getByRole('button', { name: 'Deshacer' }).click();
  await expect(atasco).toBeHidden();
  await expect(page.getByTestId('movimientos')).toHaveText('9');
});
