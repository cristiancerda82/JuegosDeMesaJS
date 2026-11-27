import { expect, test, type Page } from '@playwright/test';
import {
  cirulla,
  CONFIG_CIRULLA_POR_DEFECTO,
  valorScopa,
  type AccionCirulla,
} from '@juegos/engine';
import { abrirJuego } from './menu';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 8, y: 8 } };

async function empezar(page: Page, query: string, cuatro = false) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'cirulla');
  if (cuatro) await page.getByTestId('cirulla-cuatro').check();
  await page.getByTestId('empezar').click();
}

/** Busca una semilla en la que una carta inicial del humano capture a 15 y de otra forma. */
function buscarQuince() {
  for (let i = 0; i < 3_000; i++) {
    const semilla = `cirulla-${i}`;
    const r = cirulla.crear(CONFIG_CIRULLA_POR_DEFECTO, semilla);
    if (!r.ok) continue;
    const jugadas = cirulla.accionesLegales(r.valor, 0);
    for (const carta of [...new Set(jugadas.map((j) => j.carta))]) {
      const deCarta = jugadas.filter((j) => j.carta === carta);
      const quince = deCarta.find(
        (j: AccionCirulla) =>
          j.captura.reduce((s, c) => s + valorScopa(c), 0) + valorScopa(carta) === 15,
      );
      if (quince && deCarta.length > 1) return { semilla, carta, jugadas: deCarta, quince };
    }
  }
  throw new Error('Ninguna semilla de prueba cumple la condición');
}

/** Juega carta jugable → mesa, primera opción del selector, hasta el resumen o el fin. */
async function hastaElResumen(page: Page) {
  for (let pasos = 0; pasos < 400; pasos++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="fin"], [data-testid="panel-mano"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) return;
    if (await page.getByTestId('panel-mano').isVisible()) return;
    await page.locator('.carta-mano.jugable').first().click(ESQUINA);
    const mesa = page.getByTestId('mesa');
    const caja = (await mesa.boundingBox())!;
    await mesa.click({ position: { x: caja.width / 2, y: 4 } });
    const selector = page.getByTestId('opciones-captura');
    if (await selector.isVisible()) await selector.getByTestId('opcion-0').click();
  }
  throw new Error('La mano de Cirulla no terminó');
}

test('una carta que captura a 15 y de otra forma deja elegir, y el 15 se lleva sus cartas', async ({
  page,
}) => {
  const { semilla, carta, jugadas, quince } = buscarQuince();
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await page.locator(`.carta-mano[data-carta="${carta}"]`).click(ESQUINA);
  await expect(page.getByTestId('suma')).toContainText(
    `/ ${valorScopa(carta)} o ${15 - valorScopa(carta)}`,
  );
  const mesa = page.getByTestId('mesa');
  const caja = (await mesa.boundingBox())!;
  await mesa.click({ position: { x: caja.width / 2, y: 4 } });
  const selector = page.getByTestId('opciones-captura');
  await expect(selector).toBeVisible();
  await expect(selector.locator('ul button')).toHaveCount(jugadas.length);
  await page.screenshot({
    path: `test-results/cirulla-opciones-${page.viewportSize()!.width}.png`,
  });
  await selector.getByTestId(`opcion-${jugadas.indexOf(quince)}`).click();
  for (const c of quince.captura) await expect(page.getByTestId(`mesa-${c}`)).toHaveCount(0);
});

test('el resumen de la mano trae la cirulla grande y la pequeña', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=cirulla-resumen');
  await expect(page.getByTestId('puntos-partida')).toContainText('a 51');
  await page.screenshot({ path: `test-results/cirulla-mesa-${page.viewportSize()!.width}.png` });
  await hastaElResumen(page);
  const resumen = page.getByTestId('resumen-cirulla');
  await expect(resumen).toBeVisible();
  await expect(resumen).toContainText('Cirulla grande');
  await expect(resumen).toContainText('Cirulla pequeña');
  await expect(resumen).toContainText('Escobas');
  await page.screenshot({ path: `test-results/cirulla-resumen-${page.viewportSize()!.width}.png` });
  await page.getByTestId('siguiente-mano').click();
  await expect(page.getByTestId('panel-mano')).toBeHidden();
});

test('partida de Cirulla completa a 51 con 4 en parejas', async ({ page }) => {
  test.setTimeout(1_200_000);
  await empezar(page, 'rapido&semilla=cirulla-completa', true);
  for (let i = 0; i < 40 && !(await page.getByTestId('fin').isVisible()); i++) {
    await hastaElResumen(page);
    if (await page.getByTestId('panel-mano').isVisible()) {
      await page.getByTestId('siguiente-mano').click();
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('resumen-cirulla')).toBeVisible();
  await page.waitForFunction(() => document.getAnimations().length === 0);
  await page.screenshot({ path: `test-results/cirulla-fin-${page.viewportSize()!.width}.png` });
});

test('al recargar una partida de Cirulla se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=cirulla-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('la Cirulla con 4 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=cirulla-pequena', true);
  await expect(page.locator('.carta-mano')).toHaveCount(3);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.locator('.carta-mano').last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/cirulla-360.png' });
});

test('la guía explica el 15, el As y los acuses', async ({ page }) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'cirulla');
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toContainText('Cómo se captura');
  await expect(guia).toContainText('El As');
  await expect(guia).toContainText('Los acuses');
});
