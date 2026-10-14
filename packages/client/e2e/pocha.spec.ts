import { expect, test, type Page } from '@playwright/test';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, jugadores: 3 | 4 = 4) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-pocha').click();
  await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByTestId('empezar').click();
}

const SIGUIENTE =
  '.carta-mano.jugable, [data-testid^="apostar-"], [data-testid="panel-mano"], [data-testid="fin"]';

/**
 * Juega la partida: apuesta lo primero que se ofrece, juega la primera carta jugable y cierra
 * el panel de cada mano. Devuelve cuántos paneles de resultado ha visto.
 */
async function jugar(page: Page): Promise<number> {
  let paneles = 0;
  for (let pasos = 0; pasos < 400; pasos++) {
    await page.locator(SIGUIENTE).first().waitFor();
    if (await page.getByTestId('fin').isVisible()) return paneles;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('fila-0')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      paneles++;
    } else if ((await page.locator('[data-testid^="apostar-"]').count()) > 0) {
      await page.locator('[data-testid^="apostar-"]').first().click();
    } else {
      await page.locator('.carta-mano.jugable').first().click(ESQUINA);
      await page.getByTestId('mesa').click();
    }
  }
  throw new Error('La partida de Pocha no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

for (const jugadores of [3, 4] as const) {
  test(`partida corta de Pocha completa contra la IA con ${jugadores} jugadores`, async ({
    page,
  }) => {
    await empezar(page, `rapido&semilla=pocha${jugadores}-e2e`, jugadores);
    await expect(page.getByTestId('mano-pocha')).toContainText('Mano 1 de 9 · 1 carta');
    await expect(page.locator('.carta-mano')).toHaveCount(1);
    const paneles = await jugar(page);
    // La última mano no abre panel: la partida termina y sale la clasificación.
    expect(paneles).toBe(8);
    const fin = page.getByTestId('fin');
    await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
    await expect(fin).toContainText('Puntos');
    for (let a = 0; a < jugadores; a++) await expect(fin.getByTestId(`total-${a}`)).toBeVisible();
  });
}

// ── Apuestas ─────────────────────────────────────────────────────────────────

test('al apostar se ven las apuestas de todos y el repartidor no puede cuadrar', async ({
  page,
}) => {
  await empezar(page, 'rapido&semilla=prohibida', 4);
  // Mano 1: apuesta el primero (tú) y no repartes.
  await expect(page.getByTestId('apostar-0')).toBeVisible();
  await expect(page.getByTestId('apostar-1')).toBeVisible();
  await expect(page.getByTestId('apuesta-prohibida')).toBeHidden();
  await page.getByTestId('apostar-1').click();
  await expect(page.getByTestId('detalle-propio')).toContainText('apuesta 1');

  // Se juega la mano hasta la segunda, en la que repartes tú y apuestas el último.
  for (let pasos = 0; pasos < 50; pasos++) {
    await page.locator(SIGUIENTE).first().waitFor();
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
      break;
    }
    await page.locator('.carta-mano.jugable').first().click(ESQUINA);
    await page.getByTestId('mesa').click();
  }
  await expect(page.getByTestId('mano-pocha')).toContainText('Mano 2 de 9 · 2 cartas');
  await expect(page.getByTestId('apostar-0').or(page.getByTestId('apostar-1'))).toBeVisible();

  let suma = 0;
  for (const a of [1, 2, 3]) {
    const texto = await page.getByTestId(`asiento-${a}`).textContent();
    suma += Number(/apuesta (\d+)/.exec(texto ?? '')![1]);
  }
  const prohibida = 2 - suma;
  if (prohibida >= 0) {
    await expect(page.getByTestId(`apostar-${prohibida}`)).toBeHidden();
    await expect(page.getByTestId('apuesta-prohibida')).toContainText(
      `no puedes apostar ${prohibida}`,
    );
    await expect(page.locator('[data-testid^="apostar-"]')).toHaveCount(2);
  } else {
    await expect(page.locator('[data-testid^="apostar-"]')).toHaveCount(3);
  }
});

test('el resultado de la mano marca quién acierta y espera a «Siguiente mano»', async ({
  page,
}) => {
  await empezar(page, 'rapido&semilla=panel', 3);
  await page.getByTestId('apostar-0').click();
  await page.locator('.carta-mano.jugable').first().click(ESQUINA);
  await page.getByTestId('mesa').click();
  const panel = page.getByTestId('panel-mano');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText('Fin de la mano 1 de 9');
  const acierta = await panel.getByTestId('fila-0').getAttribute('data-acierta');
  await expect(panel.getByTestId('puntos-mano-0')).toHaveText(acierta === 'true' ? '+10' : '-5');
  // Mientras el panel está abierto la partida no avanza.
  await page.waitForTimeout(500);
  await expect(page.getByTestId('mano-pocha')).toContainText('Mano 2 de 9');
  await expect(page.locator('[data-testid="detalle-propio"]')).not.toContainText('apuesta');
  await page.getByTestId('siguiente-mano').click();
  await expect(panel).toBeHidden();
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa de la Pocha entra en 360 × 640 con 3 y con 4 jugadores', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const jugadores of [3, 4] as const) {
    await empezar(page, 'semilla=pequena', jugadores);
    await expect(page.getByTestId('apostar-0')).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    for (let a = 1; a < jugadores; a++)
      await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
    await page.screenshot({ path: `test-results/pocha${jugadores}-360.png` });
  }
});
