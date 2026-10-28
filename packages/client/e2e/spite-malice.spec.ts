import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_SPITE_MALICE_POR_DEFECTO,
  spiteMalice,
  valorSpite,
  type EstadoSpiteMalice,
} from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-spiteMalice').click();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoSpiteMalice {
  const r = spiteMalice.crear(CONFIG_SPITE_MALICE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** La primera semilla que cumple `vale` al empezar (juega primero el jugador). */
function semillaCon(prefijo: string, vale: (e: EstadoSpiteMalice) => boolean): string {
  for (let i = 0; i < 500; i++) if (vale(crear(`${prefijo}-${i}`))) return `${prefijo}-${i}`;
  throw new Error('Ninguna semilla de prueba sirve');
}

const empieza = (c: string) => valorSpite(c as never) === 1 || valorSpite(c as never) === 13;

// ── Jugar y descartar ────────────────────────────────────────────────────────

test('jugar una carta de la mano a una escalera', async ({ page }) => {
  const semilla = semillaCon('mano', (e) => e.manos[0]!.some(empieza));
  const i = crear(semilla).manos[0]!.findIndex(empieza);
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await page.screenshot({ path: `test-results/spite-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId(`mano-${i}`).click();
  await expect(page.getByTestId('escalera-0')).toHaveClass(/destino/);
  await page.getByTestId('escalera-0').click();
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  await expect(page.getByTestId('escalera-0')).toContainText('1');
});

test('jugar la carta de arriba del montón', async ({ page }) => {
  const semilla = semillaCon('monton', (e) => empieza(e.montones[0]!.at(-1)!));
  await empezar(page, `semilla=${semilla}`);
  await expect(page.getByTestId('monton-propio')).toContainText('20');
  await page.getByTestId('monton-propio').click();
  await page.getByTestId('escalera-0').click();
  await expect(page.getByTestId('monton-propio')).toContainText('19');
});

test('descartar termina el turno y juega el rival', async ({ page }) => {
  await empezar(page, 'semilla=spite-descartar');
  await page.getByTestId('mano-0').click();
  await page.getByTestId('descarte-propio-0').click();
  await expect(page.getByTestId('descarte-propio-0')).toContainText('1');
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  // Juega el rival y vuelve a tocarle al jugador, que roba hasta 5.
  await expect(page.getByTestId('aviso')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.carta-mano')).toHaveCount(5, { timeout: 15_000 });
  await expect(page.getByTestId('turno')).toContainText('Tu turno');
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Spite and Malice completa contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=spite-completa');
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="pasar"], [data-testid="fin"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('pasar').isVisible()) {
      await page
        .getByTestId('pasar')
        .click()
        .catch(() => {});
      continue;
    }
    // Juega su montón si puede; si no, descarta la primera carta.
    const monton = page.getByTestId('monton-propio');
    if ((await monton.getAttribute('class'))?.includes('jugable')) {
      await monton.click().catch(() => {});
      const destino = page.locator('.escalera.destino').first();
      if (await destino.isVisible()) {
        await destino.click().catch(() => {});
        continue;
      }
      await monton.click().catch(() => {});
    }
    await page
      .getByTestId('mano-0')
      .click({ timeout: 2_000 })
      .catch(() => {});
    await page
      .getByTestId('descarte-propio-0')
      .click({ timeout: 2_000 })
      .catch(() => {});
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('montones-fin')).toBeVisible();
  await page.screenshot({ path: `test-results/spite-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Spite and Malice se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=spite-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const despues = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  expect(despues).toEqual(antes);
});

test('el Spite and Malice entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('mano-4')).toBeInViewport();
  await page.screenshot({ path: 'test-results/spite-360.png' });
});
