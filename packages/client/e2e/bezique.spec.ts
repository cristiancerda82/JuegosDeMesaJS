import { expect, test, type Page } from '@playwright/test';
import {
  aplicar,
  bezique,
  CONFIG_BEZIQUE_POR_DEFECTO,
  crearAzar,
  iaBeziqueBasica,
  type AccionBezique,
  type EstadoBezique,
  type IdCarta,
} from '@juegos/engine';

async function empezar(page: Page, query: string) {
  await page.goto(`./?${query}`);
  await page.getByTestId('juego-bezique').click();
  await page.getByTestId('empezar').click();
}

/** Las cartas se solapan: se tocan por la esquina visible. */
const ESQUINA = { position: { x: 6, y: 6 } };
const mano = (page: Page) => page.locator('[data-testid="mano"] .carta-mano');
const jugables = (page: Page) => page.locator('[data-testid="mano"] .carta-mano.jugable');

async function jugarCarta(page: Page, carta: IdCarta) {
  await page.getByTestId(`mano-${carta}`).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

async function jugarPrimera(page: Page) {
  await jugables(page).first().click(ESQUINA);
  await page.getByTestId('mesa').click();
}

/**
 * Una semilla en la que el jugador gana la primera baza (contra la IA normal) con alguna carta y
 * después puede cantar algo. Devuelve la carta con que sale.
 */
function semillaParaCantar(): { semilla: string; carta: IdCarta } {
  for (let i = 0; i < 500; i++) {
    const semilla = `cantar-${i}`;
    const r = bezique.crear(CONFIG_BEZIQUE_POR_DEFECTO, semilla);
    if (!r.ok) continue;
    for (const salida of new Set(r.valor.manos[0]!)) {
      const tras = aplicar(bezique, r.valor, 0, { tipo: 'jugar', carta: salida });
      if (!tras.ok) continue;
      const e: EstadoBezique = tras.valor;
      const respuesta = iaBeziqueBasica.decidir(
        bezique.vistaDe(e, 1),
        bezique.accionesLegales(e, 1),
        crearAzar('x'),
      ).accion;
      const fin = aplicar(bezique, e, 1, respuesta);
      if (!fin.ok || fin.valor.turno !== 0 || fin.valor.fase !== 'declarar') continue;
      const acciones: readonly AccionBezique[] = bezique.accionesLegales(fin.valor, 0);
      if (acciones.some((a) => a.tipo === 'cantar' && a.cante !== 'siete')) {
        return { semilla, carta: salida };
      }
    }
  }
  throw new Error('Ninguna semilla de prueba sirve');
}

// ── Bazas y cantes ───────────────────────────────────────────────────────────

test('jugar una baza y robar', async ({ page }) => {
  test.setTimeout(120_000);
  await empezar(page, 'semilla=bezique-baza');
  await expect(mano(page)).toHaveCount(8);
  await expect(page.getByTestId('muestra')).toBeVisible();
  await page.screenshot({ path: `test-results/bezique-mesa-${page.viewportSize()!.width}.png` });
  await jugarPrimera(page);
  // Si gana el jugador, decide si canta; después roban los dos y vuelve a tener 8.
  const pasar = page.getByTestId('pasar');
  await expect(pasar.or(jugables(page).first())).toBeVisible({ timeout: 30_000 });
  if (await pasar.isVisible()) await pasar.click();
  await expect(mano(page)).toHaveCount(8, { timeout: 30_000 });
});

test('cantar una combinación', async ({ page }) => {
  test.setTimeout(120_000);
  const { semilla, carta } = semillaParaCantar();
  await empezar(page, `semilla=${semilla}`);
  await jugarCarta(page, carta);
  const cantar = page.locator('[data-testid^="cantar-"]:not([data-testid="cantar-siete"])').first();
  await expect(cantar).toBeVisible({ timeout: 30_000 });
  await page.screenshot({ path: `test-results/bezique-cantar-${page.viewportSize()!.width}.png` });
  await cantar.click();
  await expect(page.locator('[data-testid="mano"] .carta-mano.marcada').first()).toBeVisible();
  await expect(page.getByTestId('detalle-propio')).not.toContainText(/^0 puntos/);
});

// ── Resumen y partida completa ───────────────────────────────────────────────

test('partida de Bezique completa contra la IA, con el resumen de cada mano', async ({ page }) => {
  test.setTimeout(900_000);
  await empezar(page, 'rapido&semilla=bezique-completa');
  const fin = page.getByTestId('fin');
  let resumenes = 0;
  for (let paso = 0; paso < 6_000; paso++) {
    await page
      .locator(
        '[data-testid="fin"], [data-testid="siguiente-mano"], [data-testid="pasar"], [data-testid="mano"] .carta-mano.jugable',
      )
      .first()
      .waitFor({ timeout: 30_000 });
    if (await fin.isVisible()) break;
    if (await page.getByTestId('siguiente-mano').isVisible()) {
      await expect(page.getByTestId('resumen-bezique')).toBeVisible();
      if (resumenes++ === 0) {
        await page.screenshot({
          path: `test-results/bezique-resumen-${page.viewportSize()!.width}.png`,
        });
      }
      await page.getByTestId('siguiente-mano').click();
      continue;
    }
    // Canta lo primero que pueda; si no, pasa; si no, juega.
    const cantar = page.locator('[data-testid^="cantar-"], [data-testid="cambiar"]').first();
    if ((await cantar.count()) > 0 && (await cantar.isVisible())) {
      await cantar.click().catch(() => {});
      continue;
    }
    if (await page.getByTestId('pasar').isVisible()) {
      await page
        .getByTestId('pasar')
        .click()
        .catch(() => {});
      continue;
    }
    await jugarPrimera(page).catch(() => {});
  }
  await expect(fin).toBeVisible();
  await expect(fin.getByTestId('puntos-bezique')).toBeVisible();
  expect(resumenes).toBeGreaterThan(0);
  await page.screenshot({ path: `test-results/bezique-fin-${page.viewportSize()!.width}.png` });
});

// ── Retomar y pantalla pequeña ───────────────────────────────────────────────

test('al recargar una partida de Bezique se continúa igual', async ({ page }) => {
  await empezar(page, 'semilla=bezique-retomar');
  await expect(mano(page)).toHaveCount(8);
  const antes = await mano(page).evaluateAll((els) => els.map((e) => e.getAttribute('data-carta')));
  await page.reload();
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(mano(page)).toHaveCount(8);
  const despues = await mano(page).evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-carta')),
  );
  expect(despues).toEqual(antes);
});

test('el Bezique entra en 360 × 640 sin scroll horizontal', async ({ page }) => {
  test.skip(page.viewportSize()?.width !== 360, 'solo en el perfil móvil');
  await empezar(page, 'semilla=pequena');
  await expect(mano(page)).toHaveCount(8);
  await page.waitForFunction(() => document.getAnimations().length === 0);
  const anchos = await page.evaluate(() => ({
    pagina: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }));
  expect(anchos.pagina).toBeLessThanOrEqual(anchos.ventana);
  await page.screenshot({ path: 'test-results/bezique-360.png' });
  await expect(mano(page).last()).toBeInViewport();
});
