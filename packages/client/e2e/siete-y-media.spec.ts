import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string, jugadores = 2) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-sieteYMedia').click();
  await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByLabel('5 manos').check();
  await page.getByTestId('empezar').click();
}

/** Valor de la jugada propia que muestra la mesa («5,5» → 5,5). */
async function miValor(page: Page): Promise<number> {
  const texto = await page.getByTestId('mi-valor').innerText();
  return Number(texto.replace(',', '.'));
}

/** Juega la partida: apuesta lo que propone la mesa, pide con menos de 5 y se planta con 5. */
async function jugar(page: Page) {
  for (let pasos = 0; pasos < 500; pasos++) {
    await page
      .locator(
        '[data-testid="apostar"], [data-testid="plantarse"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor();
    if (await page.getByTestId('fin').isVisible()) return;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resultado-0')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('apostar').isVisible()) {
      await page.getByTestId('apostar').click();
    } else {
      const pedir = page.getByTestId('pedir');
      if ((await miValor(page)) < 5 && (await pedir.isEnabled())) await pedir.click();
      else await page.getByTestId('plantarse').click();
    }
  }
  throw new Error('La partida de Siete y media no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Siete y media completa contra la IA con 2 jugadores', async ({ page }) => {
  await empezar(page, 'rapido&semilla=syd-e2e');
  await expect(page.getByTestId('banca')).toHaveText('Tú');
  await jugar(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin).toContainText('Fichas finales');
});

test('partida de Siete y media completa con 4 jugadores', async ({ page }) => {
  await empezar(page, 'rapido&semilla=syd4-e2e', 4);
  await jugar(page);
  await expect(page.getByTestId('fin')).toContainText('Fichas finales');
});

// ── Apostar, pedir y plantarse ───────────────────────────────────────────────

test('apostar, pedir y plantarse desde la mesa', async ({ page }) => {
  await empezar(page, 'rapido&semilla=turno');
  // En la primera mano el humano es la banca: espera a la segunda, en la que apuesta.
  await jugarHastaApostar(page);
  await expect(page.getByTestId('apuesta')).toHaveText('5');
  await page.getByTestId('apuesta-mas').click();
  await page.getByTestId('apuesta-mas').click();
  await page.getByTestId('apuesta-menos').click();
  await expect(page.getByTestId('apuesta')).toHaveText('6');
  await page.getByTestId('apostar').click();
  await expect(page.getByTestId('mis-fichas')).toContainText('apuesta 6');

  await expect(page.getByTestId('plantarse')).toBeVisible();
  const cartas = page.locator('[data-testid^="mia-"]');
  await expect(cartas).toHaveCount(1);
  if (await page.getByTestId('pedir').isEnabled()) {
    await page.getByTestId('pedir').click();
    await expect(cartas).toHaveCount(2);
  }
  if (await page.getByTestId('plantarse').isVisible()) await page.getByTestId('plantarse').click();
  await expect(page.getByTestId('panel-mano')).toBeVisible();
  await expect(page.getByTestId('variacion-0')).toHaveText(/^[+-]?\d+$/);
});

async function jugarHastaApostar(page: Page) {
  for (let pasos = 0; pasos < 50; pasos++) {
    await page
      .locator('[data-testid="apostar"], [data-testid="plantarse"], [data-testid="panel-mano"]')
      .first()
      .waitFor();
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('apostar').isVisible()) {
      return;
    } else {
      await page.getByTestId('plantarse').click();
    }
  }
  throw new Error('No llegó el turno de apostar');
}

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa de la Siete y media entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const jugadores of [2, 4]) {
    await empezar(page, 'rapido&semilla=pequena', jugadores);
    await jugarHastaApostar(page);
    await page.getByTestId('apostar').click();
    await expect(page.getByTestId('mi-valor')).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    await page.screenshot({ path: `test-results/siete-y-media${jugadores}-360.png` });
  }
});
