import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'conquian');
  await page.getByTestId('empezar').click();
}

const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');

// ── Bajar, descartar y pasar ─────────────────────────────────────────────────

test('bajar un grupo con la carta descubierta y descartar', async ({ page }) => {
  // Con esta semilla se descubre el 4 de bastos y el jugador tiene el de copas y el de oros.
  await empezar(page, 'semilla=conquian-bajar-3');
  await expect(mano(page)).toHaveCount(10);
  await expect(page.getByTestId('descubierta').locator('[data-carta="bastos-4"]')).toBeVisible();
  await expect(page.getByTestId('rotulo-descubierta')).toContainText('Del mazo · para ti');
  await expect(page.getByTestId('bajar')).toBeDisabled();
  await page.screenshot({ path: `test-results/conquian-inicio-${page.viewportSize()!.width}.png` });
  await page.getByTestId('mano-copas-4').click();
  await page.getByTestId('mano-oros-4').click();
  await expect(page.getByTestId('bajar')).toBeEnabled();
  await page.getByTestId('bajar').click();
  const mias = page.getByTestId('combis-mias');
  for (const c of ['bastos-4', 'copas-4', 'oros-4']) {
    await expect(mias.locator(`[data-carta="${c}"]`)).toBeVisible();
  }
  await expect(page.getByTestId('bajadas')).toContainText('3/11');
  await expect(mano(page)).toHaveCount(8);
  // Descartar con un doble toque.
  const carta = mano(page).first();
  const id = await carta.getAttribute('data-carta');
  await carta.click();
  await carta.click();
  await expect(mano(page)).toHaveCount(7);
  await expect(page.getByTestId('descubierta').locator(`[data-carta="${id}"]`)).toBeVisible();
  await expect(page.getByTestId('rotulo-descubierta')).toContainText('Tu descarte');
});

test('pasar ofrece la carta al rival', async ({ page }) => {
  await empezar(page, 'semilla=conquian-pasar');
  await page.getByTestId('pasar').click();
  await expect(page.getByTestId('pasar')).toBeHidden();
  await expect(mano(page)).toHaveCount(10);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Conquián completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=conquian-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 5_000; pasos++) {
    await page
      .locator(
        '[data-testid="pasar"], [data-testid="descartar"], [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-conquian')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('descartar').isVisible()) {
      const carta = mano(page).first();
      await carta.click();
      await page.getByTestId('descartar').click();
    } else {
      // Usa la carta si alguna de sus combinaciones la admite sola; si no, pasa.
      const tocable = page.locator('.combi.tocable').first();
      if (await tocable.isVisible()) await tocable.click();
      else await page.getByTestId('pasar').click();
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin.getByTestId('puntos-conquian')).toBeVisible();
  await page.screenshot({ path: `test-results/conquian-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Conquián se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=conquian-retomar');
  await expect(mano(page)).toHaveCount(10);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(10);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Conquián entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=conquian-bajar-3');
  await expect(page.getByTestId('pasar')).toBeVisible();
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  for (const id of ['bajar', 'pasar', 'descubierta', 'mazo']) {
    await expect(page.getByTestId(id)).toBeInViewport();
  }
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/conquian-360.png' });
  await page.getByTestId('mano-copas-4').click();
  await page.getByTestId('mano-oros-4').click();
  await page.getByTestId('bajar').click();
  await expect(page.getByTestId('descartar')).toBeVisible();
  await sinScroll();
  await expect(page.getByTestId('descartar')).toBeInViewport();
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/conquian-360-descarte.png' });
});
