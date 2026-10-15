import { expect, test, type Page } from '@playwright/test';

/** Juega la Brisca tocando una carta jugable y luego la mesa, hasta el fin de la partida. */
async function jugarBrisca(page: Page) {
  const fin = page.getByTestId('fin');
  for (let jugadas = 0; jugadas < 200; jugadas++) {
    await page.locator('.carta-mano.jugable, [data-testid="fin"]').first().waitFor();
    if (await fin.isVisible()) return;
    await page.locator('.carta-mano.jugable').first().click();
    await page.getByTestId('mesa').click();
  }
  throw new Error('La partida de Brisca no terminó');
}

const partidaGuardada = (page: Page) =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem('juegos-de-mesa/partida') ?? 'null') as { nivel?: string },
  );

test('Brisca en Difícil: partida completa, y el nivel se recuerda', async ({ page }) => {
  await page.goto('./?rapido&semilla=nivel-dificil');
  await page.getByTestId('juego-brisca').click();
  const nivel = page.getByTestId('nivel-ia');
  await expect(nivel.getByLabel('Normal')).toBeChecked();
  await nivel.getByLabel('Difícil').check();
  await page.getByTestId('empezar').click();
  expect((await partidaGuardada(page)).nivel).toBe('dificil');
  await jugarBrisca(page);
  await expect(page.getByTestId('fin')).toContainText(/¡Has ganado!|Has perdido|Empate/);

  await page.getByRole('button', { name: 'Volver al menú' }).click();
  await page.getByTestId('juego-brisca').click();
  await expect(page.getByTestId('nivel-ia').getByLabel('Difícil')).toBeChecked();
});

test('los solitarios no tienen nivel de la IA', async ({ page }) => {
  await page.goto('./?rapido');
  await page.getByTestId('juego-klondike').click();
  await expect(page.getByTestId('empezar')).toBeVisible();
  await expect(page.getByTestId('nivel-ia')).toHaveCount(0);
});

test('al retomar una partida en Difícil, la IA sigue en Difícil', async ({ page }) => {
  await page.goto('./?rapido&semilla=nivel-retomar');
  await page.getByTestId('juego-brisca').click();
  await page.getByTestId('nivel-ia').getByLabel('Difícil').check();
  await page.getByTestId('empezar').click();
  await page.locator('.carta-mano.jugable').first().click();
  await page.getByTestId('mesa').click();
  await expect(page.locator('.carta-mano')).toHaveCount(3);

  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.locator('.carta-mano.jugable').first().click();
  await page.getByTestId('mesa').click();
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  expect((await partidaGuardada(page)).nivel).toBe('dificil');
});
