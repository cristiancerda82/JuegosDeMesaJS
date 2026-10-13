import { expect, test, type Page } from '@playwright/test';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, jugadores = 4, manos = 1) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-cinquillo').click();
  await page.getByLabel(`${jugadores} jugadores`).check();
  await page.getByLabel(manos === 1 ? '1 mano' : `${manos} manos`).check();
  await page.getByTestId('empezar').click();
}

/** Juega la partida: la primera carta jugable, o «Paso»; cierra el panel de cada mano. */
async function jugar(page: Page) {
  for (let pasos = 0; pasos < 600; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor();
    if (await page.getByTestId('fin').isVisible()) return;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('gana-mano')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('paso').isVisible()) {
      await page.getByTestId('paso').click();
    } else {
      await page.locator('.carta-mano.jugable').first().click(ESQUINA);
      await page.getByTestId('mesa').click();
    }
  }
  throw new Error('La partida de Cinquillo no terminó');
}

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Cinquillo completa contra la IA con 2 jugadores', async ({ page }) => {
  await empezar(page, 'rapido&semilla=cinq2-e2e', 2, 3);
  await expect(page.locator('.carta-mano')).toHaveCount(20);
  await jugar(page);
  const fin = page.getByTestId('fin');
  await expect(fin).toContainText(/¡Has ganado!|Has perdido|Empate/);
  await expect(fin).toContainText('Puntos (menos es mejor)');
});

test('partida de Cinquillo completa con 4 jugadores', async ({ page }) => {
  await empezar(page, 'rapido&semilla=cinq4-e2e', 4, 1);
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await jugar(page);
  await expect(page.getByTestId('fin')).toContainText('Puntos (menos es mejor)');
});

// ── Jugar y pasar ────────────────────────────────────────────────────────────

test('jugar una carta tocando la pone en su fila, y «Paso» pasa el turno', async ({ page }) => {
  await empezar(page, 'rapido&semilla=paso', 4, 1);
  let jugada = false;
  let pasado = false;
  for (let pasos = 0; pasos < 200 && !(jugada && pasado); pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor();
    if (await page.getByTestId('panel-mano').isVisible()) break;
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('paso').isVisible()) {
      await page.getByTestId('paso').click();
      // El turno pasa al siguiente (en modo rápido, la IA puede haber jugado ya).
      await expect(page.getByTestId('paso')).toBeHidden();
      pasado = true;
      continue;
    }
    const carta = page.locator('.carta-mano.jugable').first();
    const id = (await carta.getAttribute('data-carta'))!;
    await carta.click(ESQUINA);
    await page.getByTestId('mesa').click();
    await expect(
      page.getByTestId(`fila-${id.split('-')[0]}`).locator(`[data-carta="${id}"]`),
    ).toBeVisible();
    jugada = true;
  }
  expect(jugada).toBe(true);
  expect(pasado).toBe(true);
});

// ── Pantalla pequeña ─────────────────────────────────────────────────────────

test('la mesa del Cinquillo entra en 360 × 640 con 20 cartas en la mano', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  for (const jugadores of [2, 4]) {
    await empezar(page, 'semilla=pequena', jugadores, 1);
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    const cajas = await page
      .locator('.carta-mano')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON() as DOMRect));
    expect(cajas).toHaveLength(jugadores === 2 ? 20 : 10);
    for (const [i, caja] of cajas.entries()) {
      expect(caja.right).toBeLessThanOrEqual(anchos.ventana);
      const siguiente = cajas[i + 1];
      if (siguiente) expect(siguiente.left - caja.left).toBeGreaterThanOrEqual(caja.width * 0.25);
    }
    await page.screenshot({ path: `test-results/cinquillo${jugadores}-360.png` });
  }
});
