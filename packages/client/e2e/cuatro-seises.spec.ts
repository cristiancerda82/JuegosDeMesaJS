import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, baraja = 40, jugadores = 4, manos = 3) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'cuatroSeises');
  await page.getByTestId(`cuatro-seises-baraja-${baraja}`).check();
  await page.getByTestId(`cuatro-seises-jugadores-${jugadores}`).check();
  await page.getByTestId(`cuatro-seises-manos-${manos}`).check();
  await page.getByTestId('empezar').click();
}

const PARADA =
  '.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"], [data-testid="fin"]';

/** Juega la primera carta jugable, o «Paso», hasta el resumen de la mano o el fin. */
async function hastaElResumen(page: Page) {
  for (let pasos = 0; pasos < 300; pasos++) {
    await page.locator(PARADA).first().waitFor();
    if (await page.getByTestId('fin').isVisible()) return;
    if (await page.getByTestId('panel-mano').isVisible()) return;
    if (await page.getByTestId('paso').isVisible()) {
      await page.getByTestId('paso').click();
    } else {
      await page.locator('.carta-mano.jugable').first().click(ESQUINA);
      await page.getByTestId('mesa').click();
    }
  }
  throw new Error('La mano de Cuatro seises no terminó');
}

test('abre el 6 de oros, pasar pone una ficha y el resumen dice quién se lleva el fondo', async ({
  page,
}) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=cuatro-seises-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await expect(page.getByTestId('fondo-cuatro-seises')).toHaveText('Fondo: 4 fichas');
  await expect(page.getByTestId('mano-cuatro-seises')).toHaveText('Mano 1 de 3');
  await expect(page.getByTestId('fila-oros').locator('[data-carta="oros-6"]')).toBeVisible();
  await page.screenshot({
    path: `test-results/cuatro-seises-mesa-${page.viewportSize()!.width}.png`,
  });

  // Se juega hasta tener que pasar: el fondo sube una ficha.
  let pasado = false;
  for (let pasos = 0; pasos < 200 && !pasado; pasos++) {
    await page.locator(PARADA).first().waitFor();
    if (await page.getByTestId('panel-mano').isVisible()) break;
    if (await page.getByTestId('paso').isVisible()) {
      const antes = Number(
        (await page.getByTestId('fondo-cuatro-seises').textContent())!.match(/\d+/)![0],
      );
      await page.getByTestId('paso').click();
      await expect(page.getByTestId('aviso')).toContainText('Pasas y pones una ficha');
      const despues = Number(
        (await page.getByTestId('fondo-cuatro-seises').textContent())!.match(/\d+/)![0],
      );
      expect(despues).toBeGreaterThan(antes);
      pasado = true;
    } else {
      await page.locator('.carta-mano.jugable').first().click(ESQUINA);
      await page.getByTestId('mesa').click();
    }
  }
  expect(pasado).toBe(true);

  await hastaElResumen(page);
  await expect(page.getByTestId('resumen-cuatro-seises')).toBeVisible();
  await expect(page.getByTestId('gana-mano')).toContainText('fondo');
  // Lo que gana uno es lo que pagan los demás.
  const mano = await Promise.all(
    [0, 1, 2, 3].map(async (i) =>
      Number((await page.getByTestId(`mano-${i}`).textContent())!.replace('−', '-')),
    ),
  );
  expect(mano.reduce((s, x) => s + x, 0)).toBe(0);
  await page.screenshot({
    path: `test-results/cuatro-seises-resumen-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('mano-cuatro-seises')).toHaveText('Mano 2 de 3');
  await expect(page.getByTestId('fondo-cuatro-seises')).toHaveText('Fondo: 4 fichas');
});

test('partida de Cuatro seises completa con 6 y la baraja de 48', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=cuatro-seises-48', 48, 6, 1);
  await expect(page.locator('.carta-mano')).toHaveCount(8);
  await expect(page.getByTestId('fila-oros').locator('.hueco')).toHaveCount(12);
  await hastaElResumen(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('resumen-cuatro-seises')).toBeVisible();
  await expect(fin.getByTestId('fichas-cuatro-seises')).toBeVisible();
  await expect(fin.getByTestId('fin-cuatro-seises')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  await page.screenshot({
    path: `test-results/cuatro-seises-fin-${page.viewportSize()!.width}.png`,
  });
});

test('en las opciones, los jugadores dependen de la baraja', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'cuatroSeises');
  await expect(page.getByTestId('cuatro-seises-jugadores-5')).toBeVisible();
  await expect(page.getByTestId('cuatro-seises-jugadores-6')).toHaveCount(0);
  await page.getByTestId('cuatro-seises-jugadores-5').check();
  await page.getByTestId('cuatro-seises-baraja-48').check();
  await expect(page.getByTestId('cuatro-seises-jugadores-5')).toHaveCount(0);
  await expect(page.getByTestId('cuatro-seises-jugadores-6')).toBeVisible();
  await expect(page.getByTestId('cuatro-seises-jugadores-4')).toBeChecked();
});

test('al recargar una partida de Cuatro seises se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=cuatro-seises-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Cuatro seises con 8 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=cuatro-seises-pequena', 48, 8);
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.locator('.carta-mano').first()).toBeInViewport({ ratio: 0.9 });
  await expect(page.locator('.carta-mano').last()).toBeInViewport({ ratio: 0.9 });
  await expect(page.getByTestId('fila-bastos').locator('.hueco').last()).toBeInViewport();
  await page.screenshot({ path: 'test-results/cuatro-seises-360.png' });
});

test('la guía explica las escaleras y el fondo', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'cuatroSeises');
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toContainText('Las escaleras');
  await expect(guia).toContainText('El fondo');
});
