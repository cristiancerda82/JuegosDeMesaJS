import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_SCHNAPSEN_POR_DEFECTO,
  schnapsen,
  type AccionSchnapsen,
  type EstadoSchnapsen,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-schnapsen').click();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoSchnapsen {
  const r = schnapsen.crear(CONFIG_SCHNAPSEN_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** La primera semilla en la que, al empezar (sale el jugador), puede hacer lo que pide `vale`. */
function semillaCon(prefijo: string, vale: (a: AccionSchnapsen) => boolean): string {
  for (let i = 0; i < 500; i++) {
    const e = crear(`${prefijo}-${i}`);
    if (schnapsen.accionesLegales(e, 0).some(vale)) return `${prefijo}-${i}`;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

async function jugarCarta(page: Page) {
  await page.locator('.carta-mano.jugable').first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

// ── Bazas, cantes, cambio y cierre ───────────────────────────────────────────

test('jugar una baza y robar del mazo', async ({ page }) => {
  await empezar(page, 'semilla=schnapsen-baza');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await expect(page.getByTestId('triunfo')).toContainText('Triunfo');
  await page.screenshot({ path: `test-results/schnapsen-mesa-${page.viewportSize()!.width}.png` });
  // Sale el jugador (no reparte) y con el mazo abierto puede jugar cualquier carta.
  await expect(page.locator('.carta-mano.jugable')).toHaveCount(5);
  await jugarCarta(page);
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  // Tras la baza los dos roban.
  await expect(page.locator('.carta-mano')).toHaveCount(5, { timeout: 15_000 });
});

test('cantar una pareja', async ({ page }) => {
  const semilla = semillaCon('cantar', (a) => a.tipo === 'cantar');
  const accion = schnapsen
    .accionesLegales(crear(semilla), 0)
    .find((a): a is Extract<AccionSchnapsen, { tipo: 'cantar' }> => a.tipo === 'cantar')!;
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId(`cantar-${accion.palo}`).click();
  await expect(page.getByTestId('aviso')).toContainText('Cantas');
  // Solo puede salir con el K o la Q del palo cantado.
  const jugables = page.locator('.carta-mano.jugable');
  await expect(jugables).toHaveCount(2);
  for (const c of await jugables.evaluateAll((els) => els.map((e) => e.getAttribute('data-carta'))))
    expect(c!.startsWith(accion.palo)).toBe(true);
  await page.screenshot({ path: `test-results/schnapsen-cante-${page.viewportSize()!.width}.png` });
});

test('cambiar la J del triunfo por la carta vuelta', async ({ page }) => {
  const semilla = semillaCon('cambiar', (a) => a.tipo === 'cambiar');
  const vuelta = crear(semilla).cartaVuelta!;
  await empezar(page, `semilla=${semilla}`);
  await page.getByTestId('cambiar').click();
  await expect(page.locator(`.carta-mano[data-carta="${vuelta}"]`)).toBeVisible();
  await expect(page.getByTestId('cambiar')).toHaveCount(0);
});

test('cerrar el mazo', async ({ page }) => {
  await empezar(page, 'semilla=schnapsen-cerrar');
  await page.getByTestId('cerrar').click();
  await expect(page.getByTestId('cerrado')).toHaveText('Has cerrado el mazo');
  await jugarCarta(page);
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  // Con el mazo cerrado nadie roba: sigue con 4 cuando le vuelve a tocar.
  await expect(page.locator('.carta-mano.jugable').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.carta-mano')).toHaveCount(4);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Schnapsen completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=schnapsen-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-schnapsen')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/schnapsen-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.locator('[data-testid^="cantar-"]').first().isVisible()) {
      await page
        .locator('[data-testid^="cantar-"]')
        .first()
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else {
      await jugarCarta(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos de partida (a 7)');
  await expect(fin.getByTestId('resumen-schnapsen')).toBeVisible();
  await page.screenshot({ path: `test-results/schnapsen-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Schnapsen se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=schnapsen-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Schnapsen entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  const semilla = semillaCon('pequena', (a) => a.tipo === 'cambiar' || a.tipo === 'cantar');
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('cerrar')).toBeInViewport();
  await page.screenshot({ path: 'test-results/schnapsen-360.png' });
});
