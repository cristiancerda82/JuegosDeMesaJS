import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezarTressette(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'tressette');
  await page.getByTestId('empezar').click();
}

/** Las cartas de la mano se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const ids = (loc: ReturnType<typeof cartasMano>) =>
  loc.evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));
const palo = (id: string) => id.split('-')[0]!;

/** Puntos con tercios («5⅓») pasados a tercios (16). */
function tercios(texto: string): number {
  const fraccion = texto.endsWith('⅓') ? 1 : texto.endsWith('⅔') ? 2 : 0;
  const enteros = fraccion === 0 ? texto : texto.slice(0, -1);
  return 3 * Number(enteros || '0') + fraccion;
}

async function jugarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Jugar y seguir el palo ───────────────────────────────────────────────────

test('salir con una carta, sin triunfo', async ({ page }) => {
  await empezarTressette(page, 'rapido&semilla=tressette-e2e');
  await expect(cartasMano(page)).toHaveCount(10);
  await expect(page.getByTestId('muestra')).toHaveCount(0);
  await expect(page.getByTestId('puntos-0')).toContainText('0');
  // Al salir, todas las cartas se pueden jugar.
  await expect(jugables(page)).toHaveCount(10);
  await page.screenshot({ path: `test-results/tressette-mesa-${page.viewportSize()!.width}.png` });
  const carta = (await jugables(page).first().getAttribute('data-carta'))!;
  await jugarPrimera(page);
  await expect(cartasMano(page)).toHaveCount(9);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
});

test('hay que seguir el palo: las demás cartas se ven apagadas', async ({ page }) => {
  test.setTimeout(120_000);
  await empezarTressette(page, 'rapido&semilla=tressette-palo');
  let comprobado = false;
  for (let i = 0; i < 10 && !comprobado; i++) {
    await jugables(page).first().waitFor({ timeout: 30_000 });
    const todas = await ids(cartasMano(page));
    const legales = await ids(jugables(page));
    if (legales.length < todas.length) {
      // Solo se pueden jugar las del palo de salida, y son todas las que tiene de ese palo.
      const p = palo(legales[0]!);
      expect(legales.every((c) => palo(c) === p)).toBe(true);
      expect(todas.filter((c) => palo(c) === p).sort()).toEqual([...legales].sort());
      comprobado = true;
    }
    await jugarPrimera(page);
  }
  expect(comprobado).toBe(true);
});

test('partida de Tressette completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezarTressette(page, 'rapido&semilla=tressette-completa');
  const fin = page.getByTestId('fin');
  let manos = 0;
  for (let paso = 0; paso < 3_000; paso++) {
    const algo = page.locator(
      '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="mano"] .carta-mano.jugable',
    );
    await algo.first().waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      const resumen = page.getByTestId('resumen-tressette');
      await expect(resumen).toBeVisible();
      await expect(resumen.getByTestId('cartas-0')).toBeVisible();
      // Con la última baza, las cartas suman 35 tercios, y lo anotado, siempre 11.
      const cartas = await Promise.all(
        [0, 1].map((i) => resumen.getByTestId(`cartas-${i}`).innerText()),
      );
      expect(cartas.map(tercios).reduce((a, b) => a + b)).toBe(35);
      const anota = await Promise.all(
        [0, 1].map((i) => resumen.getByTestId(`anota-${i}`).innerText()),
      );
      expect(anota.map(Number).reduce((a, b) => a + b)).toBe(11);
      await expect(page.getByTestId('ultima-baza')).toContainText('Última baza');
      if (manos === 0)
        await page.screenshot({
          path: `test-results/tressette-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    await jugables(page)
      .first()
      .click({ ...ESQUINA, timeout: 5_000 })
      .then(() => page.getByTestId('mesa').click({ timeout: 5_000 }))
      .catch(() => {});
  }
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  const total = Math.max(
    Number(await fin.getByTestId('total-0').innerText()),
    Number(await fin.getByTestId('total-1').innerText()),
  );
  expect(total).toBeGreaterThanOrEqual(21);
  await page.screenshot({ path: `test-results/tressette-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Tressette se continúa con la misma mano', async ({ page }) => {
  await empezarTressette(page, 'semilla=tressette-retomar');
  await expect(jugables(page).first()).toBeVisible();
  const antes = await ids(cartasMano(page));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(10);
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

test('el Tressette entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezarTressette(page, 'semilla=pequena');
  await expect(jugables(page).first()).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(cartasMano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(cartasMano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/tressette-360.png' });
});
