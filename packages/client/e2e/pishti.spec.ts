import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import { CONFIG_PISHTI_POR_DEFECTO, efectoPishti, pishti, type IdCarta } from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezarPishti(page: Page, query: string, opciones: { cuatro?: boolean } = {}) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'pishti');
  if (opciones.cuatro) await page.getByTestId('pishti-cuatro').check();
  await page.getByTestId('empezar').click();
}

/** Toca el fondo de la mesa (el centro del borde superior, libre de cartas). */
async function tocarMesa(page: Page) {
  const mesa = page.getByTestId('mesa');
  const caja = (await mesa.boundingBox())!;
  await mesa.click({ position: { x: caja.width / 2, y: 4 } });
}

/** Busca una semilla en la que alguna carta inicial del jugador cumpla la condición. */
function buscar(condicion: (lleva: boolean, carta: IdCarta) => boolean) {
  for (let i = 0; i < 2_000; i++) {
    const semilla = `pishti-${i}`;
    const r = pishti.crear(CONFIG_PISHTI_POR_DEFECTO, semilla);
    if (!r.ok) throw new Error(r.error);
    const e = r.valor;
    for (const carta of e.manos[0]!) {
      const { lleva } = efectoPishti(e.monton, e.tapadas.length, carta);
      if (condicion(lleva, carta)) return { semilla, carta, arriba: e.monton.at(-1)! };
    }
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

/** Juega la partida entera: la primera carta jugable al montón, y cierra cada mano. */
async function jugarPishti(page: Page) {
  const fin = page.getByTestId('fin');
  const panel = page.getByTestId('panel-mano');
  let manos = 0;
  for (let jugadas = 0; jugadas < 2_000; jugadas++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) return manos;
    if (await panel.isVisible()) {
      await expect(panel.getByTestId('resumen-pishti')).toBeVisible();
      if (manos++ === 0)
        await page.screenshot({
          path: `test-results/pishti-panel-${page.viewportSize()!.width}.png`,
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
  }
  throw new Error('La partida de Pishti no terminó');
}

// ── Jugar ────────────────────────────────────────────────────────────────────

test('una carta del número de la de arriba se lleva el montón con las tapadas', async ({
  page,
}) => {
  const caso = buscar((lleva, carta) => lleva && !carta.endsWith('-11'));
  await empezarPishti(page, `semilla=${caso.semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  await expect(page.getByTestId('tapadas')).toBeVisible();
  await page.screenshot({ path: `test-results/pishti-mesa-${page.viewportSize()!.width}.png` });
  await page.locator(`[data-testid="mano"] [data-carta="${caso.carta}"]`).click(ESQUINA);
  await tocarMesa(page);
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await expect(page.getByTestId(`monton-${caso.arriba}`)).toHaveCount(0);
  await expect(page.getByTestId('tapadas')).toHaveCount(0);
  await expect(page.getByTestId('recogidas-0')).toContainText('5 cartas');
});

test('una carta que no se lleva nada queda arriba del montón', async ({ page }) => {
  const caso = buscar((lleva) => !lleva);
  await empezarPishti(page, `semilla=${caso.semilla}`);
  await page.locator(`[data-testid="mano"] [data-carta="${caso.carta}"]`).click(ESQUINA);
  await tocarMesa(page);
  await expect(page.getByTestId(`monton-${caso.carta}`)).toBeVisible();
  await expect(page.getByTestId(`monton-${caso.arriba}`)).toBeVisible();
});

// ── Partidas completas ───────────────────────────────────────────────────────

test('partida de Pishti completa contra la IA con 2 jugadores', async ({ page }) => {
  test.setTimeout(900_000);
  await empezarPishti(page, 'rapido&semilla=pishti-e2e');
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  const manos = await jugarPishti(page);
  expect(manos).toBeGreaterThan(0);
  const fin = page.getByTestId('fin');
  await expect(fin.getByTestId('resumen-pishti')).toBeVisible();
  const total = Math.max(
    Number(await fin.getByTestId('total-0').textContent()),
    Number(await fin.getByTestId('total-1').textContent()),
  );
  expect(total).toBeGreaterThanOrEqual(151);
  await page.screenshot({ path: `test-results/pishti-fin-${page.viewportSize()!.width}.png` });
});

test('partida de Pishti completa contra la IA con 4 jugadores', async ({ page }) => {
  test.setTimeout(900_000);
  await empezarPishti(page, 'rapido&semilla=pishti4-e2e', { cuatro: true });
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  await page.screenshot({ path: `test-results/pishti-mesa4-${page.viewportSize()!.width}.png` });
  await jugarPishti(page);
  await expect(page.getByTestId('fin')).toBeVisible();
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Pishti se continúa con la misma mano', async ({ page }) => {
  await empezarPishti(page, 'semilla=pishti-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  const antes = await page
    .locator('[data-testid="mano"] .carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')!));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes)
    await expect(page.locator(`[data-testid="mano"] [data-carta="${c}"]`)).toBeVisible();
});

for (const cuatro of [false, true]) {
  test(`el Pishti entra en 360 × 640 sin scroll horizontal${cuatro ? ' (con 4)' : ''}`, async ({
    page,
  }) => {
    test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
    await empezarPishti(page, 'semilla=pequena', { cuatro });
    await expect(page.locator('.carta-mano').first()).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
    if (cuatro)
      for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
    await expect(page.getByTestId('mesa')).toBeInViewport({ ratio: 0.9 });
    await expect(page.locator('.carta-mano').first()).toBeInViewport({ ratio: 0.9 });
    await expect(page.locator('.carta-mano').last()).toBeInViewport({ ratio: 0.9 });
    await page.screenshot({ path: `test-results/pishti-360${cuatro ? '-4' : ''}.png` });
  });
}
