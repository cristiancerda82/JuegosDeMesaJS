import { expect, test, type Page } from '@playwright/test';
import {
  bigTwo,
  CONFIG_BIG_TWO_POR_DEFECTO,
  crearAzar,
  iaBigTwoBasica,
  type EstadoBigTwo,
} from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-bigTwo').click();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoBigTwo {
  const r = bigTwo.crear(CONFIG_BIG_TWO_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/** Juegan las IAs (la normal es la básica y determinista) hasta que le toca al asiento 0. */
function avanzar(e: EstadoBigTwo): EstadoBigTwo {
  while (e.turno !== 0 && bigTwo.resultado(e) === null) {
    const { accion } = iaBigTwoBasica.decidir(
      bigTwo.vistaDe(e, e.turno),
      bigTwo.accionesLegales(e, e.turno),
      crearAzar('x'),
    );
    e = bigTwo.transicion(e, e.turno, accion);
  }
  return e;
}

function semillaCon(prefijo: string, vale: (e: EstadoBigTwo) => boolean): string {
  for (let i = 0; i < 500; i++) {
    if (vale(avanzar(crear(`${prefijo}-${i}`)))) return `${prefijo}-${i}`;
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

const primeraJugable = (page: Page) => page.locator('.carta-mano.jugable').first();

// ── Salir, superar y pasar ───────────────────────────────────────────────────

test('salir con el 3 de diamantes', async ({ page }) => {
  const semilla = semillaCon('salida', (e) => e.primera && e.turno === 0);
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(13);
  await expect(page.getByTestId('turno')).toHaveText('Sales tú: tu jugada tiene que llevar el 3♦');
  await page.screenshot({ path: `test-results/big-two-mesa-${page.viewportSize()!.width}.png` });
  // Una carta que no forma jugada con el 3♦ no se puede jugar sola.
  await page.getByTestId('mano-diamantes-3').click();
  await expect(page.getByTestId('jugar')).toBeEnabled();
  await page.getByTestId('jugar').click();
  await expect(page.getByTestId('jugada-mesa').locator('[data-carta="diamantes-3"]')).toBeVisible();
  await expect(page.locator('.carta-mano')).toHaveCount(12);
});

test('marcar cartas que no forman jugada deja «Jugar» desactivado', async ({ page }) => {
  const semilla = semillaCon('salida', (e) => e.primera && e.turno === 0);
  await empezar(page, `semilla=${semilla}`);
  const mano = crear(semilla).manos[0]!;
  // El 3♦ con la carta más alta de otro número no forma jugada.
  const otra = mano.at(-1)!;
  await page.getByTestId('mano-diamantes-3').click();
  await page.getByTestId(`mano-${otra}`).click();
  await expect(page.getByTestId('jugar')).toBeDisabled();
});

test('superar una suelta y pasar después', async ({ page }) => {
  const semilla = semillaCon(
    'superar',
    (e) =>
      e.mesa?.tipo === 'suelta' && bigTwo.accionesLegales(e, 0).some((a) => a.tipo === 'jugar'),
  );
  await empezar(page, `semilla=${semilla}`);
  await expect(page.getByTestId('turno')).toHaveText('Supera la jugada de la mesa o pasa', {
    timeout: 15_000,
  });
  await expect(page.getByTestId('tipo-mesa')).toContainText('Suelta');
  const carta = (await primeraJugable(page).getAttribute('data-carta'))!;
  await primeraJugable(page).click();
  await page.getByTestId('jugar').click();
  await expect(page.getByTestId('jugada-mesa').locator(`[data-carta="${carta}"]`)).toBeVisible();
  await expect(page.locator('.carta-mano')).toHaveCount(12);

  // La próxima vez que pueda pasar, pasa; si antes le toca salir, sale con su carta más baja.
  for (let i = 0; i < 20; i++) {
    await page.getByTestId('jugar').waitFor({ timeout: 15_000 });
    if (await page.getByTestId('paso').isVisible()) break;
    await primeraJugable(page).click();
    await page.getByTestId('jugar').click();
  }
  await page.getByTestId('paso').click();
  await expect(page.getByTestId('paso')).toBeHidden();
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Big Two completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=big-two-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator('[data-testid="jugar"], [data-testid="panel-mano"], [data-testid="fin"]')
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-big-two')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/big-two-resumen-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('paso').isVisible()) {
      await page
        .getByTestId('paso')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else {
      // Al salir, la carta jugable más baja sola siempre es una jugada legal.
      await primeraJugable(page)
        .click({ timeout: 2_000 })
        .catch(() => {});
      await page
        .getByTestId('jugar')
        .click({ timeout: 2_000 })
        .catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos (menos es mejor)');
  await expect(fin.getByTestId('resumen-big-two')).toBeVisible();
  await page.screenshot({ path: `test-results/big-two-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Big Two se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=big-two-retomar');
  await expect(page.locator('.carta-mano')).not.toHaveCount(0);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Big Two entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  const semilla = semillaCon('salida', (e) => e.primera && e.turno === 0);
  await empezar(page, `semilla=${semilla}`);
  await expect(page.locator('.carta-mano')).toHaveCount(13);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  for (let a = 1; a <= 3; a++) await expect(page.getByTestId(`asiento-${a}`)).toBeVisible();
  await expect(page.getByTestId('jugar')).toBeInViewport();
  await page.screenshot({ path: 'test-results/big-two-360.png' });
});
