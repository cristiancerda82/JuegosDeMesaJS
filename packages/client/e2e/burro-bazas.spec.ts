import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';

async function empezar(page: Page, query: string, jugadores = 4) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'burroBazas');
  if (jugadores !== 4) await page.getByTestId(`burro-bazas-jugadores-${jugadores}`).check();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

/** Toca la primera carta que se puede jugar. */
async function tocarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

const CUALQUIERA =
  '.carta-mano.jugable, [data-testid="robar"], [data-testid="pasar"], [data-testid="panel-mano"], [data-testid="fin"]';

/**
 * Juega hasta que sale el resumen de la mano (o el fin): echa cartas, roba y pasa. Si se le pasa
 * `alRobar`, la llama antes del primer robo.
 */
async function hastaElResumen(page: Page, alRobar?: () => Promise<void>) {
  for (let i = 0; i < 500; i++) {
    await page.locator(CUALQUIERA).first().waitFor({ timeout: 30_000 });
    if (await page.getByTestId('panel-mano').isVisible()) return;
    if (await page.getByTestId('fin').isVisible()) return;
    if (await page.getByTestId('robar').isVisible()) {
      if (alRobar) {
        await alRobar();
        alRobar = undefined;
      } else await page.getByTestId('robar').click();
    } else if (await page.getByTestId('pasar').isVisible()) {
      await page.getByTestId('pasar').click();
    } else await tocarPrimera(page).catch(() => {});
  }
}

// ── Bazas, robar y resumen ───────────────────────────────────────────────────

test('jugar las bazas, robar sin el palo y ver el resumen de la mano', async ({ page }) => {
  test.setTimeout(300_000);
  await empezar(page, 'rapido&semilla=burro-bazas-mano');
  await expect(mano(page)).toHaveCount(4);
  await expect(page.getByTestId('cartas-mazo')).toContainText('32');
  await page.screenshot({
    path: `test-results/burro-bazas-mesa-${page.viewportSize()!.width}.png`,
  });
  let robado = false;
  for (let k = 0; k < 20 && !robado; k++) {
    await hastaElResumen(page, async () => {
      await expect(page.getByTestId('aviso')).toContainText('No tienes el palo');
      await page.screenshot({
        path: `test-results/burro-bazas-robar-${page.viewportSize()!.width}.png`,
      });
      const antes = await page.getByTestId('cartas-mazo').innerText();
      await page.getByTestId('robar').click();
      await expect(page.getByTestId('panel-sin-palo')).toBeHidden();
      await expect(page.getByTestId('cartas-mazo')).not.toHaveText(antes);
      robado = true;
    });
    if (await page.getByTestId('fin').isVisible()) break;
    await expect(page.getByTestId('resumen-burro-bazas')).toBeVisible();
    if (k === 0) {
      await page.screenshot({
        path: `test-results/burro-bazas-resumen-${page.viewportSize()!.width}.png`,
      });
    }
    await page.getByTestId('siguiente-mano').click();
    await expect(page.getByTestId('mano-burro-bazas')).toContainText(`Mano ${k + 2}`);
  }
  expect(robado).toBe(true);
});

test('con 6 jugadores se reparten 4 cartas, quedan 24 en el mazo y se ven los cinco rivales', async ({
  page,
}) => {
  await empezar(page, 'semilla=burro-bazas-seis', 6);
  await expect(mano(page)).toHaveCount(4);
  await expect(page.getByTestId('cartas-mazo')).toContainText('24');
  for (const a of [1, 2, 3, 4, 5]) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
});

// ── Partidas completas ───────────────────────────────────────────────────────

for (const jugadores of [4, 6]) {
  test(`partida de Burro de bazas completa con ${jugadores} jugadores contra la IA`, async ({
    page,
  }) => {
    test.setTimeout(900_000);
    await empezar(page, `rapido&semilla=burro-bazas-completa-${jugadores}`, jugadores);
    let manos = 0;
    for (let i = 0; i < 200 && !(await page.getByTestId('fin').isVisible()); i++) {
      await hastaElResumen(page);
      if (await page.getByTestId('panel-mano').isVisible()) {
        manos++;
        await page.getByTestId('siguiente-mano').click();
      }
    }
    const fin = page.getByTestId('fin');
    await expect(fin).toBeVisible();
    expect(manos).toBeGreaterThan(0);
    await expect(fin.getByTestId('resumen-burro')).toBeVisible();
    await expect(fin.getByTestId('penalizaciones-burro-bazas')).toBeVisible();
    await expect(fin.locator('[data-testid^="penalizaciones-fin-"]')).toHaveCount(jugadores);
    // Quien más penalizaciones tiene ha llegado a 3, el límite por defecto.
    await expect(fin.getByTestId(`penalizaciones-fin-${jugadores - 1}`)).toHaveText('3');
    await page.screenshot({
      path: `test-results/burro-bazas-fin-${jugadores}-${page.viewportSize()!.width}.png`,
    });
  });
}

// ── Retomar, pantalla pequeña y guía ─────────────────────────────────────────

test('al recargar una partida de Burro de bazas se continúa con la misma mano', async ({
  page,
}) => {
  await empezar(page, 'semilla=burro-bazas-retomar');
  await expect(mano(page)).toHaveCount(4);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(4);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Burro de bazas con 6 entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=burro-bazas-pequena', 6);
  await expect(mano(page)).toHaveCount(4);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(mano(page).first()).toBeInViewport({ ratio: 0.9 });
  await expect(mano(page).last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/burro-bazas-360-6.png' });
});

test('la guía explica las bazas y el robo, y la del Burro remite al Burro de bazas', async ({
  page,
}) => {
  await page.goto('./?rapido');
  await abrirJuego(page, 'burroBazas');
  await page.getByTestId('ver-ayuda').click();
  const guia = page.getByTestId('como-se-juega');
  await expect(guia).toContainText('Sin el palo');
  await expect(guia).toContainText('aquí el As es la más baja');
  await expect(guia).not.toContainText('En otros sitios');
  await page.goto('./?rapido');
  await abrirJuego(page, 'burro');
  await page.getByTestId('ver-ayuda').click();
  await expect(page.getByTestId('como-se-juega')).toContainText('«Burro de bazas»');
});
