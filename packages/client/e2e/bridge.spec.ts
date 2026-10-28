import { expect, test, type Page } from '@playwright/test';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-bridge').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };

const cartasMano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');
const delMuerto = (page: Page) => page.locator('.carta-abierta.jugable');

/** Puja 7 sin triunfo (nadie puede subir) y pasa si le vuelve a tocar: declara el jugador. */
async function declararSieteST(page: Page) {
  await page.getByTestId('nivel-7').click();
  await page.getByTestId('puja-7-sinTriunfo').click();
  const pasar = page.getByTestId('pasar');
  const contrato = page.getByTestId('contrato');
  await expect(pasar.or(contrato)).toBeVisible({ timeout: 15_000 });
  if (await pasar.isVisible()) await pasar.click();
  await expect(contrato).toContainText('7 ST');
}

/** Juega una carta: de su mano o, si le toca al muerto, del muerto. */
async function jugarUna(page: Page) {
  if ((await delMuerto(page).count()) > 0) {
    await delMuerto(page).first().click(ESQUINA);
    return;
  }
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Subasta ──────────────────────────────────────────────────────────────────

test('pujar en la subasta', async ({ page }) => {
  await empezar(page, 'semilla=bridge-puja');
  await expect(cartasMano(page)).toHaveCount(13);
  await expect(page.getByTestId('vulnerabilidad')).toContainText('nadie');
  // Reparte el jugador: puja el primero.
  await page.screenshot({ path: `test-results/bridge-subasta-${page.viewportSize()!.width}.png` });
  await page.getByTestId('puja-1-sinTriunfo').click();
  const subasta = page.getByTestId('subasta');
  await expect(subasta).toContainText('1 ST');
});

// ── El muerto ────────────────────────────────────────────────────────────────

test('el declarante juega por el muerto', async ({ page }) => {
  test.setTimeout(120_000);
  await empezar(page, 'semilla=bridge-muerto');
  await declararSieteST(page);
  // Sale el rival de la izquierda y el muerto (el compañero) se pone boca arriba.
  const muerto = page.getByTestId('asiento-2');
  await expect(muerto.locator('.carta-abierta')).toHaveCount(13, { timeout: 15_000 });
  await expect(delMuerto(page).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('aviso')).toContainText('muerto');
  await page.screenshot({ path: `test-results/bridge-muerto-${page.viewportSize()!.width}.png` });
  const carta = (await delMuerto(page).first().getAttribute('data-carta'))!;
  await delMuerto(page).first().click(ESQUINA);
  await expect(page.locator(`[data-testid="mesa"] [data-carta="${carta}"]`)).toBeVisible();
  await expect(muerto.locator('.carta-abierta')).toHaveCount(12);
});

// ── Resumen y partida completa ───────────────────────────────────────────────

test('resumen de la mano al acabar las 13 bazas', async ({ page }) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=bridge-resumen');
  await declararSieteST(page);
  const siguiente = page.getByTestId('siguiente-mano');
  for (let paso = 0; paso < 200; paso++) {
    await page
      .locator(
        '[data-testid="siguiente-mano"], [data-testid="mano"] .carta-mano.jugable, .carta-abierta.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await siguiente.isVisible()) break;
    await jugarUna(page).catch(() => {});
  }
  const resumen = page.getByTestId('resumen-bridge');
  await expect(resumen).toBeVisible();
  await expect(resumen.getByTestId('mano-bridge-0')).toContainText('7 ST');
  await page.screenshot({ path: `test-results/bridge-resumen-${page.viewportSize()!.width}.png` });
  await siguiente.click();
  await expect(page.getByTestId('mano-ciclo')).toContainText('Mano 2 de 4');
});

test('partida de Bridge completa contra la IA', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=bridge-completa');
  const fin = page.getByTestId('fin');
  for (let paso = 0; paso < 3_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="pasar"], [data-testid="mano"] .carta-mano.jugable, .carta-abierta.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    // En la subasta, pasa siempre: juega la IA los contratos o se reparte de nuevo.
    if (await page.getByTestId('pasar').isVisible()) {
      await page
        .getByTestId('pasar')
        .click()
        .catch(() => {});
      continue;
    }
    await jugarUna(page).catch(() => {});
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('resumen-bridge')).toBeVisible();
  await expect(fin.getByTestId('mano-bridge-3')).toBeVisible();
  await page.screenshot({ path: `test-results/bridge-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Bridge se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=bridge-retomar');
  await page.getByTestId('puja-1-treboles').click();
  await expect(page.getByTestId('subasta')).toContainText('1 ♣');
  const antes = await cartasMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(cartasMano(page)).toHaveCount(13);
  const despues = await cartasMano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  expect(despues).toEqual(antes);
  await expect(page.getByTestId('subasta')).toContainText('1 ♣');
});

test('el Bridge entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  test.setTimeout(120_000);
  await empezar(page, 'semilla=pequena');
  await expect(cartasMano(page)).toHaveCount(13);
  const sinScroll = async () => {
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const anchos = await page.evaluate(() => ({
      pagina: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }));
    expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  };
  await sinScroll();
  await page.screenshot({ path: 'test-results/bridge-360.png' });
  // También con el muerto boca arriba.
  await declararSieteST(page);
  await expect(page.getByTestId('asiento-2').locator('.carta-abierta')).toHaveCount(13, {
    timeout: 15_000,
  });
  await sinScroll();
  await page.screenshot({ path: 'test-results/bridge-360-muerto.png' });
});
