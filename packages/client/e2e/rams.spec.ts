import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, jugadores = 4) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'rams');
  await page.getByTestId(`rams-jugadores-${jugadores}`).check();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const PARADA =
  '.carta-mano.jugable, [data-testid="hablar-rams"], [data-testid="panel-mano"], [data-testid="fin"]';

/**
 * Juega siempre (o coge la primera carta jugable) hasta el resumen de la mano o el fin.
 * Devuelve si le tocó descartar.
 */
async function hastaElResumen(page: Page): Promise<boolean> {
  let descarto = false;
  for (let pasos = 0; pasos < 200; pasos++) {
    await page.locator(PARADA).first().waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) return descarto;
    if (await page.getByTestId('fin').isVisible()) return descarto;
    if (await page.getByTestId('hablar-rams').isVisible()) {
      await page.getByTestId('hablar-rams').click();
      continue;
    }
    const aviso = page.getByTestId('aviso');
    const texto = await aviso.textContent({ timeout: 500 }).catch(() => null);
    if (texto?.includes('deja una carta')) {
      descarto = true;
    }
    await page
      .locator('.carta-mano.jugable')
      .first()
      .click(ESQUINA)
      .then(() => page.getByTestId('mesa').click())
      .catch(() => {});
  }
  return descarto;
}

test('hablar, jugar la mano y el resumen con las bazas y las fichas', async ({ page }) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=rams-mano');
  await expect(mano(page)).toHaveCount(5);
  await expect(page.getByTestId('fichas-propias')).toHaveText('Tienes 5 fichas');
  await expect(page.getByTestId('muestra')).toBeVisible();
  await expect(page.getByTestId('hablar-rams')).toBeVisible();
  await expect(page.getByTestId('hablar-paso')).toBeVisible();
  await expect(page.getByTestId('hablar-nina')).toBeVisible();
  await page.screenshot({ path: `test-results/rams-mesa-${page.viewportSize()!.width}.png` });
  await page.getByTestId('hablar-rams').click();
  await expect(page.getByTestId('hablar-rams')).toBeHidden();
  await hastaElResumen(page);
  const resumen = page.getByTestId('resumen-rams');
  await expect(resumen).toBeVisible();
  await expect(page.getByTestId('bazas-0')).not.toHaveText('–');
  await page.screenshot({ path: `test-results/rams-resumen-${page.viewportSize()!.width}.png` });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('mano-rams')).toHaveText('Mano 2');
});

test('coger la niña cambia la mano', async ({ page }) => {
  await empezar(page, 'semilla=rams-nina');
  await expect(mano(page)).toHaveCount(5);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.getByTestId('hablar-nina').click();
  await expect(page.getByTestId('hablar-nina')).toBeHidden();
  await expect(mano(page)).toHaveCount(5);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  expect(despues.some((c) => antes.includes(c))).toBe(false);
  await expect(page.getByTestId('detalle-propio')).toContainText('Niña');
});

test('partida de Rams completa con 3: se reparte, se descarta y se acaba', async ({ page }) => {
  test.setTimeout(1_200_000);
  await empezar(page, 'rapido&semilla=rams-completa', 3);
  let descarto = false;
  for (let i = 0; i < 80 && !(await page.getByTestId('fin').isVisible()); i++) {
    descarto = (await hastaElResumen(page)) || descarto;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    }
  }
  expect(descarto).toBe(true);
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('clasificacion-rams')).toBeVisible();
  await expect(fin.getByTestId('termino-2')).toHaveText('Pierde');
  await page.waitForFunction(() => document.getAnimations().length === 0);
  await page.screenshot({ path: `test-results/rams-fin-${page.viewportSize()!.width}.png` });
});

test('al recargar una partida de Rams se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=rams-retomar');
  await expect(mano(page)).toHaveCount(5);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Rams con 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=rams-pequena', 6);
  await expect(mano(page)).toHaveCount(4);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await expect(page.getByTestId('hablar-nina')).toBeInViewport();
  await page.screenshot({ path: 'test-results/rams-360.png' });
});

test('la guía explica el hablar, las bazas y las fichas', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'rams');
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toContainText('Jugar o pasar');
  await expect(guia).toContainText('Las fichas');
});
