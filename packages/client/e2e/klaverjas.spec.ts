import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezarKlaverjas(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'klaverjas');
  await page.getByTestId('empezar').click();
}

/** Las cartas de la mano se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const ids = (loc: ReturnType<typeof cartasMano>) =>
  loc.evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));

async function jugarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Triunfo y bazas ──────────────────────────────────────────────────────────

test('jugar con el palo propuesto y salir con una carta', async ({ page }) => {
  await empezarKlaverjas(page, 'rapido&semilla=klaverjas-e2e');
  await expect(cartasMano(page)).toHaveCount(8);
  await expect(page.getByTestId('propuesto')).toContainText('Propuesto:');
  await expect(page.getByTestId('mano-ronda')).toHaveText('Mano 1 de 8');
  await page.screenshot({
    path: `test-results/klaverjas-propuesta-${page.viewportSize()!.width}.png`,
  });
  await page.getByTestId('jugar').click();
  await expect(page.getByTestId('triunfo-klaverjas')).toContainText('juega tu pareja');
  // Sale el siguiente al repartidor: el jugador.
  await expect(jugables(page)).toHaveCount(8);
  await page.screenshot({ path: `test-results/klaverjas-mesa-${page.viewportSize()!.width}.png` });
  const carta = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugarPrimera(page);
  await expect(cartasMano(page)).toHaveCount(7);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('pasar el palo propuesto', async ({ page }) => {
  await empezarKlaverjas(page, 'rapido&semilla=klaverjas-pasar');
  await page.getByTestId('pasar').click();
  // Los demás deciden; si pasan todos, le toca elegir al jugador.
  const elegir = page.getByTestId('palo-picas');
  const triunfo = page.getByTestId('triunfo-klaverjas');
  await expect(elegir.or(triunfo)).toBeVisible({ timeout: 30_000 });
  if (await elegir.isVisible()) await elegir.click();
  await expect(triunfo).toBeVisible();
  await expect(jugables(page)).toHaveCount(8);
});

test('partida de Klaverjas completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(900_000);
  await empezarKlaverjas(page, 'rapido&semilla=klaverjas-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 4_000; paso++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="jugar"], [data-testid="palo-picas"], [data-testid="mano"] .carta-mano.jugable',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-klaverjas')).toBeVisible();
      // Lo anotado es siempre 162 más todo el roem.
      const resumen = page.getByTestId('resumen-klaverjas');
      const valor = async (id: string) => Number(await resumen.getByTestId(id).innerText());
      const anotado = (await valor('anota-0')) + (await valor('anota-1'));
      const roem = (await valor('roem-0')) + (await valor('roem-1'));
      expect(anotado).toBe(162 + roem);
      if (manos === 0)
        await page.screenshot({
          path: `test-results/klaverjas-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    for (const id of ['jugar', 'palo-picas']) {
      if (await page.getByTestId(id).isVisible()) {
        await page
          .getByTestId(id)
          .click()
          .catch(() => {});
      }
    }
    await jugables(page)
      .first()
      .click({ ...ESQUINA, timeout: 5_000 })
      .then(() => page.getByTestId('mesa').click({ timeout: 5_000 }))
      .catch(() => {});
  }
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-klaverjas')).toBeVisible();
  await page.screenshot({ path: `test-results/klaverjas-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Klaverjas se continúa con la misma mano', async ({ page }) => {
  await empezarKlaverjas(page, 'semilla=klaverjas-retomar');
  await expect(page.getByTestId('jugar')).toBeVisible();
  const antes = await ids(cartasMano(page));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(8);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Klaverjas entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarKlaverjas(page, 'semilla=pequena');
  await expect(page.getByTestId('jugar')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(cartasMano(page).first()).toBeInViewport();
  await expect(cartasMano(page).last()).toBeInViewport();
  await page.screenshot({ path: 'test-results/klaverjas-360.png' });
});
