import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

// Vuelta visible (spec mesa-cliente, «Información visible en la mesa»): todas las cartas de la
// vuelta en curso se ven a la vez, sin que unas tapen el índice ni el palo de otras.

/**
 * Cartas de `selector` cuya esquina del índice (arriba a la izquierda: número y palo) queda
 * tapada por otro elemento.
 */
async function indicesTapados(page: Page, selector: string): Promise<string[]> {
  await page.waitForFunction(() => document.getAnimations().length === 0);
  return page.locator(selector).evaluateAll((els) =>
    els.flatMap((el) => {
      const r = el.getBoundingClientRect();
      const tapada = [
        [0.1, 0.1],
        [0.1, 0.25],
      ].some(([fx, fy]) => {
        const hit = document.elementFromPoint(r.left + fx! * r.width, r.top + fy! * r.height);
        return hit === null || !el.contains(hit);
      });
      return tapada ? [el.getAttribute('data-carta') ?? el.getAttribute('data-previa') ?? '?'] : [];
    }),
  );
}

async function empezar(
  page: Page,
  juego: 'julepe' | 'culo' | 'bigTwo',
  query: string,
  jugadores?: number,
) {
  await page.goto(`./?rapido&${query}`);
  await abrirJuego(page, juego);
  if (jugadores) await page.getByLabel(`${jugadores} jugadores`, { exact: true }).check();
  await page.getByTestId('empezar').click();
}

/** Juega el Julepe con la velocidad Pausada hasta que una baza de al menos `minimo` cartas queda retenida. */
async function hastaBazaRetenida(page: Page, minimo: number) {
  const espera =
    '.carta-mano.jugable, [data-testid="seguir"], [data-testid="panel-mano"], [data-testid="julepe-jugar"], [data-testid="panel-descarte"], [data-testid="fin"]';
  for (let i = 0; i < 400; i++) {
    await page.locator(espera).first().waitFor();
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('seguir').isVisible()) {
      if ((await page.locator('[data-testid="mesa"] .jugada').count()) >= minimo) return;
      await page.getByTestId('seguir').click();
    } else if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('panel-descarte').isVisible()) {
      await page.getByTestId('descartar').click();
    } else if (await page.getByTestId('julepe-jugar').isVisible()) {
      await page.getByTestId('julepe-jugar').click();
    } else {
      await page
        .locator('.carta-mano.jugable')
        .first()
        .click({ position: { x: 8, y: 8 } });
      await page.getByTestId('mesa').click({ position: { x: 8, y: 8 } });
    }
  }
  throw new Error(`No se retuvo ninguna baza de ${minimo} cartas`);
}

for (const jugadores of [5, 6]) {
  test(`Julepe de ${jugadores}: se leen todas las cartas de la baza`, async ({ page }) => {
    await page.goto('./?rapido');
    await page.getByTestId('velocidad').selectOption('pausada');
    await empezar(page, 'julepe', `semilla=vuelta-${jugadores}`, jugadores);
    await hastaBazaRetenida(page, 3);
    await page.screenshot({
      path: `test-results/julepe${jugadores}-baza-${page.viewportSize()!.width}.png`,
    });
    expect(await indicesTapados(page, '[data-testid="mesa"] .jugada')).toEqual([]);
  });
}

/** Pasa siempre que puede para que los rivales alarguen la vuelta; si le toca abrir, juega una carta. */
async function hastaVueltaLarga(page: Page, pasar: string) {
  for (let i = 0; i < 300; i++) {
    await page
      .locator(`[data-testid="${pasar}"], [data-testid="jugar"]`)
      .first()
      .waitFor({ timeout: 30_000 });
    if ((await page.getByTestId('previa').count()) >= 2) return;
    if (await page.getByTestId(pasar).isVisible()) {
      await page.getByTestId(pasar).click();
    } else {
      await page.locator('.carta-mano:not(:disabled)').first().click();
      await page.getByTestId('jugar').click();
    }
  }
  throw new Error('La vuelta no llegó a tres jugadas');
}

test('Culo: la vuelta entera se ve en orden, con su autor y sin tapar índices', async ({
  page,
}) => {
  await empezar(page, 'culo', 'semilla=vuelta-culo', 6);
  await hastaVueltaLarga(page, 'pasar');
  const previas = page.getByTestId('previa');
  await expect(previas.first().locator('.autor')).not.toBeEmpty();
  expect(await indicesTapados(page, '[data-testid="vuelta"] [data-previa]')).toEqual([]);
  expect(await indicesTapados(page, '[data-testid="mesa"] [data-carta]')).toEqual([]);
  await page.screenshot({ path: `test-results/culo-vuelta-${page.viewportSize()!.width}.png` });
});

test('Big Two: la vuelta entera se ve en orden, con su autor y sin tapar índices', async ({
  page,
}) => {
  await empezar(page, 'bigTwo', 'semilla=vuelta-big-two');
  await hastaVueltaLarga(page, 'paso');
  expect(await indicesTapados(page, '[data-testid="vuelta"] [data-previa]')).toEqual([]);
  expect(await indicesTapados(page, '[data-testid="jugada-mesa"] [data-carta]')).toEqual([]);
  await page.screenshot({ path: `test-results/big-two-vuelta-${page.viewportSize()!.width}.png` });
});
