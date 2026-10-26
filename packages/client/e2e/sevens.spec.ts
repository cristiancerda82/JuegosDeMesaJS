import { expect, test, type Page } from '@playwright/test';
import { sevens } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string, jugadores = 4) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-sevens').click();
  await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

/** Una semilla de 4 en la que el asiento 0 tiene el 7 de diamantes y abre. */
function semillaQueAbre(): string {
  for (let i = 0; i < 100; i++) {
    const r = sevens.crear({ jugadores: 4 }, `abre-${i}`);
    if (r.ok && r.valor.turno === 0) return `abre-${i}`;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

async function jugarCarta(page: Page) {
  await page.locator('.carta-mano.jugable').first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Abrir, alargar y pasar ───────────────────────────────────────────────────

test('abrir con el 7 de diamantes', async ({ page }) => {
  await empezar(page, `rapido&semilla=${semillaQueAbre()}`);
  await expect(page.locator('.carta-mano')).toHaveCount(13);
  await expect(page.getByTestId('turno')).toHaveText('Sale el 7 de diamantes');
  // Solo el 7 de diamantes se puede jugar.
  await expect(page.locator('.carta-mano.jugable')).toHaveCount(1);
  await expect(page.locator('.carta-mano.jugable')).toHaveAttribute('data-carta', 'diamantes-7');
  await page.screenshot({ path: `test-results/sevens-mesa-${page.viewportSize()!.width}.png` });
  await jugarCarta(page);
  await expect(
    page.getByTestId('fila-diamantes').locator('[data-carta="diamantes-7"]'),
  ).toBeVisible();
  await expect(page.locator('.carta-mano')).toHaveCount(12);
});

test('alargar una escalera y pasar cuando no hay jugada', async ({ page }) => {
  test.setTimeout(120_000);
  await empezar(page, 'rapido&semilla=sevens-paso');
  let alargada = false;
  let pasado = false;
  for (let i = 0; i < 80 && !(alargada && pasado); i++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) break;
    if (await page.getByTestId('paso').isVisible()) {
      await page.getByTestId('paso').click();
      // En modo rápido el aviso de un rival puede pisar enseguida el «Pasas».
      await expect(page.getByTestId('aviso')).toHaveText(/^(Pasas|Rival \d+ .+)/);
      pasado = true;
      continue;
    }
    const carta = (await page.locator('.carta-mano.jugable').first().getAttribute('data-carta'))!;
    await jugarCarta(page);
    const [palo] = carta.split('-');
    await expect(page.getByTestId(`fila-${palo}`).locator(`[data-carta="${carta}"]`)).toBeVisible();
    if (!carta.endsWith('-7')) alargada = true;
  }
  expect(alargada && pasado).toBe(true);
});

test('partida de Sevens completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=sevens-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator(
        '.carta-mano.jugable, [data-testid="paso"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('gana-mano')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/sevens-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('paso').isVisible()) {
      await page.getByTestId('paso').click();
    } else {
      await jugarCarta(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos (menos es mejor)');
  await expect(fin.getByTestId('resumen-sevens')).toBeVisible();
  await page.screenshot({ path: `test-results/sevens-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Sevens se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=sevens-retomar');
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Sevens de 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'rapido&semilla=pequena', 6);
  await page
    .locator('.carta-mano.jugable, [data-testid="paso"]')
    .first()
    .waitFor({ timeout: 30_000 });
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 5; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/sevens6-360.png' });
});
