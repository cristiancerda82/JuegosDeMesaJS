import { expect, test, type Page } from '@playwright/test';

async function empezarOchoLoco(page: Page, query: string, jugadores?: number) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-ochoLoco').click();
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const esOcho = (id: string | null) => id?.endsWith('-8') ?? false;

/** Toca una carta de la mano (en su esquina visible) y, si es un 8, elige corazones. */
async function jugar(page: Page, id: string) {
  await page.getByTestId(`mano-${id}`).click({ position: { x: 6, y: 6 } });
  if (esOcho(id)) await page.getByTestId('palo-corazones').click();
}

/** Juega un turno entero: una carta que case (mejor si no es un 8), o robar y luego jugar o pasar. */
async function unTurno(page: Page) {
  const accion = page.locator(
    '[data-testid="mano"] .carta-mano.jugable, [data-testid="robar"], [data-testid="pasar"]',
  );
  await accion.first().waitFor({ timeout: 30_000 });
  const ids = await jugables(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  if (ids.length > 0) {
    const id = ids.find((c) => !esOcho(c)) ?? ids[0]!;
    await jugar(page, id!);
    return;
  }
  if (await page.getByTestId('robar').isVisible()) {
    await page.getByTestId('robar').click();
    await page
      .locator('[data-testid="mano"] .carta-mano.jugable, [data-testid="pasar"]')
      .first()
      .waitFor();
    const robada = jugables(page).first();
    if (await robada.isVisible()) {
      await jugar(page, (await robada.getAttribute('data-carta'))!);
      return;
    }
  }
  await page.getByTestId('pasar').click();
}

// ── Jugar, el 8 y robar ──────────────────────────────────────────────────────

test('jugar una carta que casa con el descarte', async ({ page }) => {
  await empezarOchoLoco(page, 'rapido&semilla=jugar-2');
  await expect(cartasMano(page)).toHaveCount(5);
  await expect(page.getByTestId('turno')).toContainText('Tu turno');
  await page.screenshot({ path: 'test-results/ocho-loco-mesa.png' });
  const id = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugar(page, id);
  await expect(page.getByTestId('descarte')).toHaveAttribute('data-carta', id);
  await expect(cartasMano(page)).toHaveCount(4);
});

test('jugar un 8 eligiendo el palo', async ({ page }) => {
  await empezarOchoLoco(page, 'rapido&semilla=ocho-0');
  const ocho = (await page
    .locator('[data-testid="mano"] .carta-mano[data-carta$="-8"]')
    .first()
    .getAttribute('data-carta'))!;
  await page.getByTestId(`mano-${ocho}`).click({ position: { x: 6, y: 6 } });
  await expect(page.getByTestId('elegir-palo')).toBeVisible();
  await page.screenshot({ path: 'test-results/ocho-loco-palo.png' });
  await page.getByTestId('palo-corazones').click();
  await expect(page.getByTestId('descarte')).toHaveAttribute('data-carta', ocho);
  await expect(page.getByTestId('palo')).toHaveText('Toca: corazones');
});

test('sin cartas que casen se roba, y se puede pasar', async ({ page }) => {
  await empezarOchoLoco(page, 'rapido&semilla=robar-4');
  await expect(jugables(page)).toHaveCount(0);
  await expect(page.getByTestId('turno')).toContainText('roba');
  await page.getByTestId('robar').click();
  await expect(cartasMano(page)).toHaveCount(6);
  await expect(page.getByTestId('pasar')).toBeVisible();
  await expect(page.getByTestId('robar')).toBeHidden();
  await page.getByTestId('pasar').click();
  await expect(page.getByTestId('asiento-1')).toBeVisible();
  await expect(page.getByTestId('pasar')).toBeHidden();
});

test('partida de Ocho loco completa contra la IA', async ({ page }) => {
  test.setTimeout(300_000);
  await empezarOchoLoco(page, 'rapido&semilla=ocho-completa', 2);
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let turno = 0; turno < 1_000; turno++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="mano"] .carta-mano.jugable, [data-testid="robar"], [data-testid="pasar"]',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      if (manos === 0) await page.screenshot({ path: 'test-results/ocho-loco-resumen.png' });
      manos++;
      await expect(page.getByTestId('resumen-ocho-loco')).toBeVisible();
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    await unTurno(page);
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('total-0')).toBeVisible();
  await page.screenshot({ path: 'test-results/ocho-loco-fin.png' });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Ocho loco se continúa con la misma mano', async ({ page }) => {
  await empezarOchoLoco(page, 'rapido&semilla=jugar-2');
  const id = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugar(page, id);
  await expect(page.getByTestId('descarte')).toHaveAttribute('data-carta', /./);
  const antes = await cartasMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(antes.length);
  for (const c of antes) await expect(page.getByTestId(`mano-${c}`)).toBeVisible();
});

test('el Ocho loco de 5 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarOchoLoco(page, 'semilla=pequena', 5);
  await expect(cartasMano(page)).toHaveCount(5);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 4; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await page.screenshot({ path: 'test-results/ocho-loco5-360.png' });
});
