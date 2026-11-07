import { expect, test, type Page } from '@playwright/test';
import { abrirJuego } from './menu';
import {
  CONFIG_SIXTY_SIX,
  schnapsen,
  type AccionSchnapsen,
  type EstadoSchnapsen,
} from '@juegos/engine';

/** Toca la esquina superior izquierda, que queda a la vista aunque las cartas se solapen. */
const ESQUINA = { position: { x: 6, y: 8 } };

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await abrirJuego(page, 'sixtySix');
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoSchnapsen {
  const r = schnapsen.crear(CONFIG_SIXTY_SIX, semilla);
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

// ── Reparto y cambio del 9 ───────────────────────────────────────────────────

test('empezar con 6 cartas y jugar una baza', async ({ page }) => {
  await empezar(page, 'semilla=sixty-six-baza');
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  // La mesa cuenta también la carta vuelta: 11 boca abajo y 1 vuelta.
  await expect(page.getByTestId('cartas-mazo')).toContainText('12');
  await page.screenshot({ path: `test-results/sixty-six-mesa-${page.viewportSize()!.width}.png` });
  await jugarCarta(page);
  await expect(page.locator('.carta-mano')).toHaveCount(5);
  // Tras la baza los dos roban.
  await expect(page.locator('.carta-mano')).toHaveCount(6, { timeout: 15_000 });
});

test('cambiar el 9 del triunfo por la carta vuelta', async ({ page }) => {
  const semilla = semillaCon('sixty-cambiar', (a) => a.tipo === 'cambiar');
  const vuelta = crear(semilla).cartaVuelta!;
  await empezar(page, `semilla=${semilla}`);
  await expect(page.getByTestId('cambiar')).toHaveText('Cambiar el 9');
  await page.getByTestId('cambiar').click();
  await expect(page.locator(`.carta-mano[data-carta="${vuelta}"]`)).toBeVisible();
  await expect(page.getByTestId('aviso')).toContainText('Cambias el 9');
  await expect(page.getByTestId('cambiar')).toHaveCount(0);
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Sixty-six completa contra la IA, con el resumen de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=sixty-six-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator('.carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-schnapsen')).toBeVisible();
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else {
      await jugarCarta(page).catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos de partida (a 7)');
  await page.screenshot({ path: `test-results/sixty-six-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Sixty-six se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=sixty-six-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Sixty-six entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  const semilla = semillaCon('sixty-pequena', (a) => a.tipo === 'cambiar');
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('cambiar')).toBeInViewport();
  await expect(page.getByTestId('cerrar')).toBeInViewport();
  await expect(page.locator('.carta-mano').first()).toBeInViewport({ ratio: 0.9 });
  await expect(page.locator('.carta-mano').last()).toBeInViewport({ ratio: 0.9 });
  await page.screenshot({ path: 'test-results/sixty-six-360.png' });
});
