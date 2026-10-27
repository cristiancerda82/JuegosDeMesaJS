import { expect, test, type Page } from '@playwright/test';
import {
  CONFIG_CRIBBAGE_POR_DEFECTO,
  crearAzar,
  cribbage,
  iaCribbageBasica,
  type AccionCribbage,
  type EstadoCribbage,
} from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-cribbage').click();
  await page.getByTestId('empezar').click();
}

function crear(semilla: string): EstadoCribbage {
  const r = cribbage.crear(CONFIG_CRIBBAGE_POR_DEFECTO, semilla);
  if (!r.ok) throw new Error(r.error);
  return r.valor;
}

/**
 * Juega la primera mano con el jugador haciendo siempre su primera acción legal y el rival con la
 * IA normal (la básica, determinista), y devuelve las acciones del jugador hasta que `para`.
 */
function guion(
  semilla: string,
  para: (e: EstadoCribbage, mia: AccionCribbage) => boolean,
): AccionCribbage[] | null {
  let e = crear(semilla);
  const mias: AccionCribbage[] = [];
  while (e.resultadosManos.length === 0 && cribbage.resultado(e) === null) {
    if (e.turno === 0) {
      const accion = cribbage.accionesLegales(e, 0)[0]!;
      mias.push(accion);
      if (para(e, accion)) return mias;
      e = cribbage.transicion(e, 0, accion);
    } else {
      const { accion } = iaCribbageBasica.decidir(
        cribbage.vistaDe(e, 1),
        cribbage.accionesLegales(e, 1),
        crearAzar('x'),
      );
      e = cribbage.transicion(e, 1, accion);
    }
  }
  return null;
}

function semillaCon(prefijo: string, para: (e: EstadoCribbage, mia: AccionCribbage) => boolean) {
  for (let i = 0; i < 300; i++) {
    const mias = guion(`${prefijo}-${i}`, para);
    if (mias) return { semilla: `${prefijo}-${i}`, mias };
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

/** Hace en la mesa las acciones del jugador, esperando a que le toque cada vez. */
async function hacer(page: Page, acciones: readonly AccionCribbage[]) {
  for (const a of acciones) {
    if (a.tipo === 'echar') {
      await page.getByTestId('al-crib').waitFor({ timeout: 15_000 });
      for (const c of a.cartas) await page.getByTestId(`mano-${c}`).click();
      await page.getByTestId('al-crib').click();
    } else if (a.tipo === 'go') {
      await page.getByTestId('go').click({ timeout: 15_000 });
    } else {
      await expect(page.getByTestId(`mano-${a.carta}`)).toHaveClass(/jugable/, { timeout: 15_000 });
      await page.getByTestId(`mano-${a.carta}`).click();
      await page.getByTestId('mesa').click();
    }
  }
}

// ── Echar, jugar con puntos y go ─────────────────────────────────────────────

test('echar dos cartas al crib', async ({ page }) => {
  await empezar(page, 'semilla=cribbage-crib');
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  await expect(page.getByTestId('turno')).toHaveText('Echa 2 cartas al crib');
  await page.screenshot({ path: `test-results/cribbage-mesa-${page.viewportSize()!.width}.png` });
  const cartas = page.locator('.carta-mano');
  await cartas.nth(0).click();
  await expect(page.getByTestId('al-crib')).toBeDisabled();
  await cartas.nth(1).click();
  await page.getByTestId('al-crib').click();
  await expect(page.locator('.carta-mano')).toHaveCount(4);
  // Cuando el rival echa las suyas, el crib tiene 4 y se descubre el starter.
  await expect(page.getByTestId('crib')).toContainText('4', { timeout: 15_000 });
  await expect(page.getByTestId('starter')).toBeVisible();
});

test('jugar una carta que suma puntos', async ({ page }) => {
  const { semilla, mias } = semillaCon('puntos', (e, a) => {
    if (a.tipo !== 'jugar' || e.secuencia.length === 0) return false;
    const antes = e.puntos[0];
    return cribbage.transicion(e, 0, a).puntos[0] > antes;
  });
  await empezar(page, `semilla=${semilla}`);
  await hacer(page, mias);
  await expect(page.getByTestId('aviso')).toContainText('Sumas');
  await page.screenshot({ path: `test-results/cribbage-puntos-${page.viewportSize()!.width}.png` });
});

test('decir go cuando no cabe ninguna carta', async ({ page }) => {
  const { semilla, mias } = semillaCon('go', (_e, a) => a.tipo === 'go');
  await empezar(page, `semilla=${semilla}`);
  await hacer(page, mias.slice(0, -1));
  await expect(page.getByTestId('go')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('turno')).toHaveText('No te cabe ninguna: di «Go»');
  await expect(page.locator('.carta-mano.jugable')).toHaveCount(0);
  await page.getByTestId('go').click();
  await expect(page.getByTestId('go')).toBeHidden();
});

// ── Partida completa ─────────────────────────────────────────────────────────

test('partida de Cribbage completa contra la IA, con el recuento de cada mano', async ({
  page,
}) => {
  test.setTimeout(600_000);
  await empezar(page, 'rapido&semilla=cribbage-completa');
  let manos = 0;
  for (let pasos = 0; pasos < 3_000; pasos++) {
    await page
      .locator(
        '[data-testid="al-crib"], [data-testid="go"], .carta-mano.jugable, [data-testid="panel-mano"], [data-testid="fin"]',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await page.getByTestId('fin').isVisible()) break;
    if (await page.getByTestId('panel-mano').isVisible()) {
      await expect(page.getByTestId('resumen-cribbage')).toBeVisible();
      if (manos === 0)
        await page.screenshot({
          path: `test-results/cribbage-recuento-${page.viewportSize()!.width}.png`,
        });
      manos++;
      await page.getByTestId('siguiente-mano').click();
    } else if (await page.getByTestId('al-crib').isVisible()) {
      const cartas = page.locator('.carta-mano');
      await cartas
        .nth(0)
        .click({ timeout: 2_000 })
        .catch(() => {});
      await cartas
        .nth(1)
        .click({ timeout: 2_000 })
        .catch(() => {});
      await page
        .getByTestId('al-crib')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else if (await page.getByTestId('go').isVisible()) {
      await page
        .getByTestId('go')
        .click({ timeout: 2_000 })
        .catch(() => {});
    } else {
      await page
        .locator('.carta-mano.jugable')
        .first()
        .click({ timeout: 2_000 })
        .catch(() => {});
      await page
        .getByTestId('mesa')
        .click({ timeout: 2_000 })
        .catch(() => {});
    }
  }
  const fin = page.getByTestId('fin');
  await expect(fin).toBeVisible();
  expect(manos).toBeGreaterThan(0);
  await expect(fin).toContainText('Puntos (a 121)');
  await page.screenshot({ path: `test-results/cribbage-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Cribbage se continúa con la misma mano', async ({ page }) => {
  await empezar(page, 'semilla=cribbage-retomar');
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  const antes = await page
    .locator('.carta-mano')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (const c of antes) await expect(page.locator(`.carta-mano[data-carta="${c}"]`)).toBeVisible();
});

test('el Cribbage entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await expect(page.locator('.carta-mano')).toHaveCount(6);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await expect(page.getByTestId('al-crib')).toBeInViewport();
  await page.screenshot({ path: 'test-results/cribbage-360.png' });
});
