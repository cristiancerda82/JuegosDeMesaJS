import { expect, test, type Page } from '@playwright/test';
import { CONFIG_SCOPA_POR_DEFECTO, scopa, type AccionScopa } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarScopa(page: Page, query: string, opciones: { cuatro?: boolean } = {}) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-scopa').click();
  if (opciones.cuatro) await page.getByTestId('scopa-cuatro').check();
  await page.getByTestId('empezar').click();
}

/** Toca el fondo de la mesa (el centro del borde superior, libre de cartas). */
async function tocarMesa(page: Page) {
  const mesa = page.getByTestId('mesa');
  const caja = (await mesa.boundingBox())!;
  await mesa.click({ position: { x: caja.width / 2, y: 4 } });
}

/** Primera jugada del humano en una partida de 2 con esta semilla. */
function jugadasIniciales(semilla: string): readonly AccionScopa[] {
  const r = scopa.crear(CONFIG_SCOPA_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return scopa.accionesLegales(r.valor, 0);
}

/** Busca una semilla en la que alguna carta inicial del humano cumpla la condición. */
function buscar(condicion: (jugadas: readonly AccionScopa[]) => boolean) {
  for (let i = 0; i < 2_000; i++) {
    const semilla = `scopa-${i}`;
    const jugadas = jugadasIniciales(semilla);
    for (const carta of [...new Set(jugadas.map((j) => j.carta))]) {
      const deCarta = jugadas.filter((j) => j.carta === carta);
      if (condicion(deCarta)) return { semilla, carta, jugadas: deCarta };
    }
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

/** Juega la partida entera: carta jugable → mesa, primera opción del selector, y cierra cada mano. */
async function jugarScopa(page: Page) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  const selector = page.getByTestId('opciones-captura');
  let manos = 0;
  for (let jugadas = 0; jugadas < 800; jugadas++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) return manos;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-scopa')).toBeVisible();
      if (manos++ === 0)
        await page.screenshot({
          path: `test-results/scopa-panel-${page.viewportSize()!.width}.png`,
        });
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    await page
      .locator('.carta-mano.jugable')
      .first()
      .click(ESQUINA)
      .catch(() => {});
    await tocarMesa(page).catch(() => {});
    if (await selector.isVisible()) await page.getByTestId('opcion-0').click();
  }
  throw new Error('La partida de Scopa no terminó');
}

// ── Captura ──────────────────────────────────────────────────────────────────

test('con varias capturas posibles se elige qué cartas se lleva', async ({ page }) => {
  const caso = buscar((jugadas) => jugadas.length >= 2);
  await empezarScopa(page, `semilla=${caso.semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await page.locator(`[data-testid="mano"] [data-carta="${caso.carta}"]`).click(ESQUINA);
  await tocarMesa(page);
  await expect(page.getByTestId('opciones-captura')).toBeVisible();
  await page.screenshot({ path: `test-results/scopa-opciones-${page.viewportSize()!.width}.png` });
  await page.getByTestId('opcion-0').click();
  await expect(page.locator('.carta-mano')).toHaveCount(2);
  for (const c of caso.jugadas[0]!.captura)
    await expect(page.getByTestId(`mesa-${c}`)).toHaveCount(0);
});

test('una carta sin captura se queda en la mesa', async ({ page }) => {
  const caso = buscar((jugadas) => jugadas.length === 1 && jugadas[0]!.captura.length === 0);
  await empezarScopa(page, `semilla=${caso.semilla}`);
  await page.locator(`[data-testid="mano"] [data-carta="${caso.carta}"]`).click(ESQUINA);
  await tocarMesa(page);
  await expect(page.getByTestId(`mesa-${caso.carta}`)).toBeVisible();
});

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Scopa completa contra la IA con 2 jugadores', async ({ page }) => {
  test.setTimeout(600_000);
  await empezarScopa(page, 'rapido&semilla=scopa-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  const manos = await jugarScopa(page);
  expect(manos).toBeGreaterThan(0);
  const fin = page.getByTestId('fin');
  await expect(fin.getByTestId('resumen-scopa')).toBeVisible();
  const total = Math.max(
    Number(await fin.getByTestId('total-0').textContent()),
    Number(await fin.getByTestId('total-1').textContent()),
  );
  expect(total).toBeGreaterThanOrEqual(11);
  await page.screenshot({ path: `test-results/scopa-fin-${page.viewportSize()!.width}.png` });
});

test('partida de Scopone completa contra la IA con 4 jugadores', async ({ page }) => {
  test.setTimeout(900_000);
  await empezarScopa(page, 'rapido&semilla=scopone-e2e', { cuatro: true });
  await expect(page.locator('.carta-mano')).toHaveCount(10);
  await expect(page.getByTestId('mesa').locator('[data-carta]')).toHaveCount(0);
  await page.screenshot({ path: `test-results/scopone-mesa-${page.viewportSize()!.width}.png` });
  await jugarScopa(page);
  await expect(page.getByTestId('fin')).toBeVisible();
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Scopa se continúa con la misma mano', async ({ page }) => {
  await empezarScopa(page, 'semilla=scopa-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  const antes = await page
    .locator('[data-testid="mano"] .carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

for (const cuatro of [false, true]) {
  test(`la Scopa entra en 360 × 640 sin scroll horizontal${cuatro ? ' (Scopone)' : ''}`, async ({
    page,
  }) => {
    test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
    await empezarScopa(page, 'semilla=pequena', { cuatro });
    await expect(page.locator('.carta-mano').first()).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    await expect(page.locator('.carta-mano').first()).toBeInViewport({ ratio: 0.9 });
    await expect(page.locator('.carta-mano').last()).toBeInViewport({ ratio: 0.9 });
    await page.screenshot({ path: `test-results/scopa-360${cuatro ? '-4' : ''}.png` });
  });
}
